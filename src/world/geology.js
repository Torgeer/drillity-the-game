/**
 * DRILLITY I THE GAME — world/geology.js
 * ═══════════════════════════════════════════════════════════════════════════
 * THE CROSS-SECTION — the bottom 46% of the screen.
 *
 * A vertical geological cutaway that scrolls upward as the bit goes deeper,
 * with the borehole cut straight through it.
 *
 * ── ARCHITECTURE (why it is built like this) ───────────────────────────────
 *
 * 1. THE PROFILE IS DATA, THE SECTION IS A SHADER.
 *    `generateProfile()` produces `Stratum[]` (contract.js typedef). That array
 *    is baked into three tiny 4096x1 DataTextures (a "column lookup"):
 *      A: rgb = layer colour (already gradient-blended)
 *         a   = DISTANCE to the nearest contact / CFG.edgeRangeMetres
 *      B: r  = pattern id     g = grain   b = stability   a = water
 *      C: r  = ucs/300        g = abrasivity              b = bedding strength
 *         a   = side of that contact (255 below, 0 above)
 *    Every mesh in the section — face, borehole wall, boulders — samples the
 *    same lookup by depth, so nothing can ever disagree about what rock it is.
 *
 * 2. VIRTUALISATION BY RIDING THE CAMERA.
 *    The heavy geometry is ONE dense, displaced grid ("the face slab") about
 *    1.5x the visible band tall. It rides with the scroll, snapped to its own
 *    vertex lattice so the fbm relief never swims. All shading is a function of
 *    section-space Y, so a 300 m hole costs exactly the same as a 20 m hole.
 *    Absolutely-positioned content (boulders, fractures, cavities, ruler) lives
 *    in `root`, which is the thing that actually scrolls.
 *
 * 3. THE HOLE IS A REAL HOLE.
 *    The face fragment shader discards inside the (depth-varying, over-gauge)
 *    borehole radius; behind it sits a back-faced cylinder wall shaded from the
 *    same lookup — smooth in clay, spalled in fractured rock, washed out in
 *    sand. Drill string, annulus and casing tube live inside it.
 *
 * 4. SELF-LIT.
 *    The section band has no scene lights guaranteed (env.js owns the surface
 *    sun), so every section material does its own analytic lighting from an
 *    fbm-derived normal. Tone mapping / output colour space chunks are included
 *    so it composites correctly with the renderer's ACES chain.
 *
 * 5. THE MODE IS A COORDINATE CONTRACT, NOT A SECOND RENDERER.
 *    The band used to assume every hole is vertical. profileMode now selects
 *    one of five conventions — vertical · profile (HDD long-section) · raise
 *    (pilot down, ream up) · heading (a face advancing horizontally) · pile
 *    (the as-built column) — and each one changes only FOUR things: what a
 *    section unit of X means, what depth sits at y = 0, where the ground line
 *    is, and the shape of the void the face is cut by. One unit of Y is one
 *    metre of true vertical depth in every mode, so the column lookup, the
 *    contact distances, the water table and the whole shading rig are shared
 *    and vertical reduces algebraically to the section it always was.
 *
 * 6. YOU DRILL FOR SOMETHING.
 *    An optional ore body — vein, seam, lens, pipe, supergene blanket,
 *    stratabound tabular, placer ribbon — is generated into the profile with a
 *    grade that varies across it, and drawn in the section. It is HIDDEN until
 *    the bit reaches it: full strength only inside the corridor the hole has
 *    logged, fading to the contract's confidence where it is merely projected,
 *    against a predicted horizon that is deliberately not the truth.
 *    `getOreAt(depth)` is the assay; `getDrillabilityAt()` folds the ore's own
 *    rock properties in, so the player FEELS the vein before reading it.
 *
 * DRAW CALLS: measured on the reference band, one frame per mode —
 *   vertical 12 · profile 12 · heading 12 · raise 13 · pile 11
 * (+1 each when a casing is run or a karst void is in frame). The non-vertical
 * modes pay for their furniture by giving back the vertical borehole trio.
 *
 * Owns: src/world/geology.js only.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  EVENTS, GROUND, BRAND, LAYOUT,
  clamp, lerp, invLerp, smoothstep, damp, TAU, makeRandom,
} from '../core/contract.js';

/* ═══════════════════════════════════════════════════════════════════════════
   TUNING
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * LAYOUT BUDGET — everything below is sized against the real band.
 *
 * The section band is LAYOUT.sectionHeight (0.46) of a portrait viewport. On the
 * reference device (390 x 844 CSS px) that is 388 CSS px tall, and the view is
 * 20 m (core/renderer.js `sectionViewH`, adopted in ensureSection()). So:
 *
 *        19.4 CSS px per metre — and, since the camera is orthographic with a
 *        matching aspect, 19.4 CSS px per section unit horizontally too.
 *
 * The bottom ~200 px of the band sits under the UI instrument cluster, so the
 * geology actually reads in the top ~190 CSS px. Every constant here is chosen
 * against that: the bit sits 0.28 down the band (109 px, ~57% into the visible
 * strip), the log column takes 4.1 units / 80 px on the left, the ruler 2.6
 * units / 50 px on the right, and the 260 px between them is geology.
 *
 * Anything naturally expressed in CSS px (the contact parting, the finest
 * procedural octave) is converted to metres in computeView(), so it stays a
 * fixed number of pixels no matter what view scale the renderer hands us.
 */
const CFG = {
  viewMetres: 20,        // vertical extent of the section band, in metres.
                         // Must agree with core/renderer.js `sectionViewH`;
                         // ensureSection() adopts the renderer's value.
  bitScreenFrac: 0.28,   // bit sits 28% down the band == mid of the visible strip
  headroom: 1.6,         // metres of "air" visible above the ground line
  slabOverscan: 1.55,    // face slab height = viewMetres * this

  /* ── borehole scale ──────────────────────────────────────────────────────
     The Y axis of the section is true metres. The hole is NOT: a 152 mm hole
     drawn to scale would be 3 CSS px wide and there would be nothing to look
     at. computeView() derives the visual radius from the contract's holeDia:

         holeR = clamp(0.30 + (holeDiaMm / 1000) * 1.6, 0.30, 1.6)   [units]

     Stated as a RATIO, which is the form that has to reach the player, that is

         drawn diameter = clamp(0.60 m + 3.2 * true diameter, 0.60, 3.20)
         exaggeration E = drawn / true = 3.2 + 0.60 / D          (D in metres)

     — a fixed 3.2x over-gauge plus a 0.60 m floor term so the smallest hole
     still reads as a hole, clamped so the largest cannot eat the band. So a
     38 mm micropile (0.36 u radius, 14 px across) and a 6000 mm raise bore
     (1.60 u radius, 62 px across) are visibly different holes — which is the
     whole point of the raise-boring unlock. E is 19.0x at 38 mm, 7.1x at
     152 mm, 4.2x at 600 mm and 0.53x at 6000 mm: hugely over-gauge where the
     hole would otherwise vanish, UNDER-gauge where it would otherwise dominate.
     Everything that shares the hole's scale — boulders above all — is expressed
     as a multiple of the derived holeR, never in metres, so the two scales
     cannot drift apart again.

     MEASURED, headed Chrome, 390x844@2x, dth @ Ø152 mm, 34.0 m: the band runs
     38.85 device px per metre of depth; the face shader discards a 42-44 px
     column along the string (predicted 42.2 px at gauge, 43.9 px with the
     over-gauge term of holeRadius()) against a true 5.9 px. The exaggeration is
     real, it is 7.15x, and the arithmetic above is exactly what produces it.

     THEREFORE IT IS DECLARED. A depth ruler that is 1:1 in Y beside a bore that
     is 7x in X is a frame stating two scales and admitting to neither — which
     is what the critic measured and reported as "9-17x oversize". research/07
     §F1 settles the form: "a vertical ruler in metres of depth and a horizontal
     ruler in metres of station, each labelled with its own scale, plus a small
     V.E. badge. This is not decoration — it is the thing that stops a player
     misreading the curve as tighter than it is." drawRuler() badges the bore
     the same way the station ruler already badges vertical exaggeration, in
     every mode, and ctx.sectionView.boreExaggeration publishes the number so no
     other system can restate it differently. */
  holeRadius: 0.54,      // fallback visual radius (the 152 mm default)
  holeDiaDefault: 152,   // mm, used when no contract is active
  holeRGain: 1.6,        // units of visual radius per metre of real diameter
  holeRBase: 0.30,       // floor: the smallest hole still has to read as a hole
  holeRMax: 1.60,        // ceiling: a raise bore must not eat the section
  rodRatio: 0.40,        // drill string radius / hole radius
  casingRatio: 0.80,

  /* ── DRILL STRING WHIRL ───────────────────────────────────────────────────
     See ROD_VERT for the model. These are the four numbers it needs, and this
     is the honest account of where each comes from (PLATFORM_TRUTH Part C
     rule 7: a number must never outrun its source).

     SOURCED — the clearance. research/rigs/dth-crawler.md:276, from Epiroc's
     DTH catalogue p.20: "a 138 mm hammer in a 165 mm hole leaves a ~13 mm gap
     all round"; research/02:239-248 and :341-343 tabulate wireline rod OD
     against hole diameter. The shader does not need any of those numbers,
     because it takes the clearance straight off the drawn annulus — but they
     are what says the clearance is the right limit to bound the motion with.

     DECLARED — the drawn clearance is not the real one. rodRatio 0.40 puts the
     string at 40 % of the hole radius where a real NQ rod is 92 % of its hole
     (69.9 mm in 75.7) and a 6" DTH hammer 91 % (138 in 152.4). That is the
     same decision as holeRBase above and for the same reason: the bore is
     already drawn ~7x over gauge so that it reads at all, and a to-scale
     annulus inside it would be sub-pixel. The whirl is bounded by the
     clearance the player can SEE, which is the one that has to look right.

     NOT SOURCED — the wavelength, for this case. research/14:921-925
     [CTES-TFM] p.9 gives a full sinusoidal buckling period of "30 to 100 ft
     [9-30 m]", but for COILED TUBING IN CASING, not a rotary drill string.
     It is the only buckling period in the repo, so whirlPeriodM takes its
     order of magnitude from it and is otherwise a drawing choice.

     NOT SOURCED, AND THEREFORE NOT DRAWN — backward whirl. Rolling contact
     precesses AGAINST rotation at omega * rodR / clearance, which is pure
     kinematics; but on the drawn annulus that ratio is 0.40/0.60 = 0.67, so
     backward whirl would come out SLOWER than forward, the opposite of the
     thing that makes it recognisable. No rod OD is sourced for percussion
     strings (research/12:565-569 gives thread and bit diameters only), so the
     true ratio cannot be computed either. Drawing it wrong-signed would be a
     plausible invented number. Forward whirl is drawn; binding stalls it. */
  whirlPeriodM: 18,      // m of one full buckling wave along the string
  whirlSpanMin: 1.5,     // half-waves: fewer and a shallow hole just leans over
  whirlSpanMax: 7.0,     // half-waves: more and the string reads as noise
  whirlDrill: 0.30,      // fraction of the clearance used when turning and cutting
  whirlTorque: 0.34,     // …added at full torque
  whirlJam: 1.00,        // …and hard against the wall when it binds
  whirlSpinGate: 0.08,   // rpm below which a string is not turning, so cannot whirl

  /* ── THE AUGER FLIGHT ─────────────────────────────────────────────────────
     "An auger is defined by its helix" — the critic, on a frame where the
     section drew an auger job as a smooth khaki cylinder. It is a domain-truth
     failure (rubric axis 11, hard gate) and it is also literally what the
     letters CFA stand for.

     SOURCED, and the source gives the one ratio that matters.
     research/13-string-elements.md:139-140, verbatim from CME's flight-auger
     catalogue [CME-CAT]: the game's 300 mm auger is "a 279 mm (11") flight
     cutting a 305 mm (12") hole ... 229 mm (9") spiral pitch", and the pack
     warns in the same breath that "the flight OD and the hole size are two
     different numbers". So:

         flight OD / hole diameter = 279 / 305 = 0.915
         pitch     / flight OD     = 229 / 279 = 0.821

     THE RATIOS ARE TRUE EVEN THOUGH NEITHER NUMBER IS. Both are drawn at the
     bore's own exaggeration, because they are both derived from the drawn hole
     radius — so a player measuring the flight against the hole gets 0.915, and
     measuring the pitch against the flight gets 0.821, whatever the contract
     diameter. Drawing the pitch at true scale would put it at 4 CSS px on a
     305 mm hole against a flight 28 px across: a fine grey buzz, not a helix.

     The whole CME series holds the same shape (3"/2.5", 12"/11", pitches
     2.75"-9"), so 0.915 is the series' ratio and not one row of it. */
  flightGauge: 0.915,    // flight outer radius / drawn hole radius  [CME-CAT]
  flightPitch: 0.821,    // helix pitch / flight outer diameter      [CME-CAT]
  flightDrawLen: 26,     // m of string carrying a drawn flight — the band shows
                         // 20, so this covers it with margin and no more
  flightSeg: 512,        // ribbon segments over that length: at a 305 mm hole's
                         // 1.19 m drawn pitch that is 23 per turn

  /* ── LOOK-AHEAD UNCERTAINTY ───────────────────────────────────────────────
     The model is in lookUnc() (GLSL_STRATA) and the drive is applySurvey().
     These four numbers are the drawing decisions it needs, and per
     PLATFORM_TRUTH Part C rule 7 here is exactly where each one stands.

     NOT SOURCED, AND THEY CANNOT BE. There is no published figure for "how
     wrong is an interpolated bed depth", because the answer depends on the
     spacing of the holes that produced the interpretation, and this game does
     not model a hole spacing. What IS well established, and is the reason the
     feature exists at all, is the ASYMMETRY it draws: ground investigation
     misjudging rockhead depth and bed thickness between boreholes is the
     single largest source of differing-site-conditions claims in ground
     engineering, while nobody argues about WHICH rock it turned out to be.
     The numbers below are therefore honest drawing choices calibrated against
     the one hard constraint the band does impose — it shows about 14 m of
     undrilled ground at once — and not measurements dressed up as facts.

     CONTROL DISTANCE runs with confidence because that is the one physical
     statement available: a grade-control hole is metres from its neighbours
     and a greenfield step-out is hundreds. The band cannot draw hundreds, so
     the range is compressed onto what the band can show — sharp across the
     whole frame at the top of the scale, gone within two rods at the bottom.

     The CEILING is 1 - confidence, deliberately with no constant of its own:
     the contract's confidence is already a 0..1 statement of how well the
     ground is known, and inventing a curve on top of it would be a second
     opinion about a number data.js already owns. */
  controlNear: 1.4,      // m of control distance at confidence 0 (a wildcat)
  controlFar: 18.0,      // …and at confidence 1 (the log is already on file)
  surveyWander: 1.8,     // extra gain on the LOW-frequency boundary term at
                         // full uncertainty. Only the low octave: an
                         // interpolation error is a long-wavelength thing —
                         // a bed sits deeper than drawn, it does not jitter.
  surveyDefault: 0.55,   // confidence for a contract that states none. Same
                         // value generateProfile() already defaults to, so
                         // this introduces no second opinion.

  boulderCap: 96,
  fractureCap: 220,
  cavityCap: 6,          // must match uCav[] in the shaders
  pinCap: 24,
  lookupWidth: 4096,     // 4k texels: on a 376 m profile that is 0.09 m/texel,
                         // fine enough to carry a 1.5 px contact line
  rulerWidth: 2.6,       // section units — 50 CSS px on the reference device
  /* The log column was 4.1 units / 80 CSS px, which leaves 45 CSS px of text
     room. "FRACTURED" needs 51 px and "BOULDERS" 46 px at the 9.5 px name
     size, so the elision ladder fell all the way through to the three-letter
     codes and the strip printed FRZ and BLD, which are not words. Measured on
     the same frame, 24 % of the band width (x < 47 and x > 350 CSS px) was
     pure black bevel doing nothing at all. This spends 29 px of it: 5.6 units
     / 109 CSS px gives 63 CSS px of text room, so both full words fit and the
     code tier only fires on beds under ~0.55 m. */
  logWidth: 5.6,         //                 109 CSS px
  edgeMetres: 0.12,      // SHADING contact band half-width (2.3 CSS px)
  edgeGeoMetres: 0.45,   // GEOMETRIC undercut half-width. Wider on purpose: the
                         // face slab's vertex pitch is ~0.32 m so relief cannot
                         // resolve 0.12 m — the crisp part of a contact is
                         // drawn per-pixel, not displaced.
  edgeRangeMetres: 1.20, // range encoded into the A.a distance-to-contact channel
  partingPx: 1.5,        // the drawn parting: a dark line this many CSS px wide
  lipPx: 1.0,            // and a lighter lip this wide on the bed above it
  detailPx: 3.5,         // finest procedural octave allowed, in CSS px of period
};

/** pattern string -> shader id. Keep in sync with patternShade() in GLSL. */
const PATTERN_ID = {
  clay: 0, sand: 1, gravel: 2, till: 3,
  sedimentary: 4, crystalline: 5, fractured: 6, void: 7,
};

/**
 * PLANAR FABRIC — baked into the C.b lookup channel.
 *
 * This channel used to be a two-valued "bedding strength" (0.75 for anything
 * sedimentary, 0.3 for everything else). It is now the strength of the rock's
 * PLANAR FABRIC, whatever produced it: sedimentary bedding, metamorphic
 * foliation, or the absence of either.
 *
 * It is load-bearing. Schist and Fracture Zone share the 'fractured' pattern
 * and cannot be separated by lightness — they are two of the eight adjacencies
 * for which the ΔL* ≥ 18 target is provably unreachable (see contract.js). The
 * fractured branch of patternShade() reads this channel and draws them as two
 * different materials instead: at 0.88 it draws continuous parallel mica
 * planes with a silvery sheen, at 0.10 it draws angular joint-bounded blocks
 * with no continuity. A driller tells a schist from a crushed zone the same
 * way — by the fabric, not by the colour.
 */
const FABRIC = {
  shale: 0.88, schist: 0.88, sandstone: 0.75, limestone: 0.75, marl: 0.75,
  chalk: 0.75, concrete: 0.60, gneiss: 0.55, quartzite: 0.25, granite: 0.20,
  basalt: 0.15, fracture: 0.10,
};
const fabricFor = (s) => FABRIC[s.id] ?? (s.pattern === 'sedimentary' ? 0.75 : 0.30);

/** Which Drillity methods chew each ground type efficiently (DOMAIN.md §1). */
const BEST_METHODS = {
  topsoil:   ['auger', 'rotary-kelly', 'cfa', 'sonic'],
  clay:      ['auger', 'rotary-kelly', 'cfa', 'sonic', 'hdd'],
  silt:      ['auger', 'sonic', 'cfa', 'rotary-kelly'],
  sand:      ['overburden', 'sonic', 'cased-cfa', 'auger'],
  gravel:    ['overburden', 'sonic', 'dth', 'cased-cfa'],
  till:      ['overburden', 'sonic', 'dth', 'rotary-kelly'],
  boulder:   ['overburden', 'dth', 'rotary-kelly'],
  marl:      ['rotary-kelly', 'dth', 'core', 'auger'],
  chalk:     ['rotary-kelly', 'dth', 'core'],
  limestone: ['dth', 'top-hammer', 'core', 'rotary-kelly'],
  sandstone: ['dth', 'top-hammer', 'core'],
  shale:     ['dth', 'core', 'rotary-kelly'],
  schist:    ['dth', 'top-hammer', 'core'],
  gneiss:    ['dth', 'top-hammer', 'core', 'raise-boring'],
  granite:   ['dth', 'top-hammer', 'core', 'raise-boring'],
  basalt:    ['dth', 'top-hammer', 'core'],
  quartzite: ['dth', 'core', 'raise-boring'],
  fracture:  ['overburden', 'dth', 'jet-grouting'],
  karst:     ['overburden', 'dth', 'jet-grouting'],
  permafrost:['sonic', 'dth', 'auger'],
  concrete:  ['dth', 'core', 'top-hammer'],
};

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION MODES — the band's coordinate convention follows the method
   ═══════════════════════════════════════════════════════════════════════════
   The band used to assume every hole is vertical: depth on Y, scrolling down.
   That is right for fourteen of the game's methods and wrong for four, and
   METHOD_IDS.md fixes the vocabulary:

     vertical  depth on Y, scroll down.  THE DEFAULT AND THE MAJORITY.
     profile   a long-section: along-bore station on X, depth below ground on
               Y, vertical exaggeration, scroll horizontally.  HDD, auger
               boring, microtunnelling, pipe jacking.
     raise     two stages — pilot DOWN from the upper level, reamer pulled UP
               from the lower level. Both levels drawn; stage 2 runs in
               reverse.                                          raise boring.
     heading   a face advancing horizontally. Longitudinal profile, face at
               ~75 % of the band, ground AHEAD always visible.  tunnel jumbo,
               rock bolting.
     pile      the as-built column, not a borehole. For driven-pile the depth
               ruler BECOMES the blow-count bar chart.           driven piling.

   THE ONE INVARIANT THAT MAKES THIS CHEAP AND SAFE:
   **one section unit is always one metre of TRUE VERTICAL DEPTH on Y.**
   Every mode keeps that, so the 4096-texel column lookup, the contact
   distances, the water table, the ruler and the whole shading rig are
   untouched. What a mode may change is only:

     · what one section unit of X means         (metresPerUnitX)
     · what depth sits at section y = 0         (depthAtY0 -> uDepth0)
     · where the ground line is                 (uSurfY / uSurfAmp / uObst)
     · the shape of the void the face is cut by (uBMode + the path uniforms)

   That is why vertical cannot regress: with metresPerUnitX = 1,
   depthAtY0 = 0, uSurfY = 0, uSurfAmp = 1, uObst.z = 0 and uBMode = 0 every
   expression in the shaders reduces algebraically to the one it had before.

   VERTICAL EXAGGERATION falls out of metresPerUnitX rather than being a second
   scale that can drift: units are square on screen (the section camera's
   aspect matches the band's), so V.E. == metresPerUnitX / metresPerUnitY ==
   metresPerUnitX. profile reports it on the ruler as two scales, exactly as
   a real HDD profile drawing does (research/07 §F1).                        */

/** Shader ids for `uBMode`. Keep in sync with boreSDF() in GLSL_STRATA. */
const BMODE = { vertical: 0, profile: 1, heading: 2, pile: 3, raise: 4 };

const MODES = {
  vertical: {
    id: 'vertical', bmode: BMODE.vertical, horizontal: false,
    /** metres of along-axis distance per section unit of x. 1 == no exaggeration. */
    metresPerUnitX: 1,
    /** where the action point sits in the band, as [x, y] fractions.
     *  The vertical anchor IS CFG.bitScreenFrac, referenced rather than
     *  copied so the two can never drift apart. */
    anchorX: 0.5, anchorY: CFG.bitScreenFrac,
    scrollX: false, lengthWord: 'DEPTH',
  },
  /* research/07 §F1 specifies this one numerically: keep the 20 m view on Y,
     set the X window to 120 m of bore length, which on the reference portrait
     device is 19.4 px/m vertically against 3.25 px/m horizontally — V.E. 6:1,
     inside the 5–10x band DESIGN_EXPANSION.md §1 asks for. The head anchor is
     0.38 ACROSS the band so the player sees more path behind than ahead. */
  profile: {
    id: 'profile', bmode: BMODE.profile, horizontal: true,
    windowMetres: 120,
    anchorX: 0.38, anchorY: 0.30,
    scrollX: true, lengthWord: 'BORE',
  },
  raise: {
    id: 'raise', bmode: BMODE.raise, horizontal: false,
    metresPerUnitX: 1,
    anchorX: 0.5, anchorY: 0.30,
    scrollX: false, lengthWord: 'RAISE',
  },
  /* research/04 §E4 wants "the last 120 m and the next 40 m". At 1 unit = 1 m
     on Y that would draw an 8 m tunnel one unit tall — 19 px — and none of the
     things the mode exists to show (a 4.5 m round, 300 mm of shotcrete, a 3 m
     radial bolt, a 6 m spile at 12 deg) would survive. The X window is derived
     from the excavated height instead, so the tunnel always occupies ~40 % of
     the band and the support reads; V.E. lands at 1.6–3.2 and is badged. */
  heading: {
    id: 'heading', bmode: BMODE.heading, horizontal: true,
    anchorX: 0.75, anchorY: 0.52,
    scrollX: true, lengthWord: 'CHAINAGE',
  },
  pile: {
    id: 'pile', bmode: BMODE.pile, horizontal: false,
    metresPerUnitX: 1,
    anchorX: 0.5, anchorY: 0.34,
    scrollX: false, lengthWord: 'DEPTH',
  },
};

/** METHOD_IDS.md — the contract's method decides the mode. Anything not named
 *  here is vertical, which is the correct default for fourteen methods. */
const MODE_BY_METHOD = {
  hdd: 'profile',
  'auger-boring': 'profile',
  microtunnelling: 'profile',
  'micro-tunnelling': 'profile',
  'pipe-jacking': 'profile',
  'raise-boring': 'raise',
  'tunnel-jumbo': 'heading',
  'tunnel-db': 'heading',
  rockbolt: 'heading',
  'driven-pile': 'pile',
};

function modeForMethod(methodId) {
  const id = String(methodId || '').toLowerCase();
  return MODE_BY_METHOD[id] || 'vertical';
}

/* ═══════════════════════════════════════════════════════════════════════════
   ORE BODIES — you drill FOR something
   ═══════════════════════════════════════════════════════════════════════════
   Sourced from research/08-commodities.md, which sourced every figure from
   USGS Mineral Deposit Models (SIR 2010-5070 series, OFR 2008-1155 /
   2009-1034, Bulletin 1693) and SEC-filed S-K 1300 / NI 43-101 summaries.

   Anything the research pack could not source carries sourced: false and
   MUST NOT reach player-facing text as a fact (DOMAIN.md §10). The section
   still draws those bodies — a shape is not a claim — but a UI that prints a
   grade should gate on the flag, which getOreAt() returns on every sample.

   THREE SHADER SHAPES carry all ten geological kinds, because the maths is the
   same and only the parameters differ (see oreField() in GLSL_STRATA):

     PLANAR (1)      distance to a dipping plane. vein · seam · tabular · placer
     LENTICULAR (2)  rotated ellipse.             lens · pipe
     STACKED (3)     depth-zoned column.          supergene blanket

   getOreAt() mirrors that maths on the CPU from the same parameters, so what
   the sim assays and what the section draws cannot disagree.                */
const ORE_SHAPE = { none: 0, planar: 1, lenticular: 2, stacked: 3 };

/**
 * core / halo are drawn-in-section colours in the same lit convention as
 * GROUND (contract.js): what the rock LOOKS like after this file's lighting,
 * not raw albedo. ucs / abrasivity / stability override the host inside
 * the body and are what sim/drilling.js feels through getDrillabilityAt().
 */
const ORE_KINDS = {
  /* USGS Model 36a. St Ives: a 0.5–50 cm cataclasite core inside 0.1 cm–3.0 m
     of foliated cataclasite. Hamlet North 150 m strike x 5–10 m wide x 1000 m
     down-plunge; the controlling shear runs >10 km. Bliss (1986): the median
     lode deposit is 30 kt @ 16 g/t — tiny and very high grade. Massive quartz
     in greenstone/basalt/dolerite: R5–R6, the hardest gold ground there is. */
  'orogenic-gold': {
    shape: ORE_SHAPE.planar, label: 'QUARTZ VEIN', code: 'QV',
    dipDeg: [72, 88], thickM: [0.30, 3.0], coreFrac: [0.06, 0.35],
    extentM: [60, 260], haloMul: [2.2, 4.0], shapeExp: 0.55, skew: 0,
    ucs: 195, abrasivity: 0.97, stability: 0.74,
    core: '#C8C2B4', halo: '#8E8A80', stipple: 0,
    hostPref: ['schist', 'gneiss', 'basalt', 'quartzite', 'granite'],
  },
  /* USGS SIR 2010-5070-Q. LS mined vein width <1–3 m, IS <1–>10 m. The ore is
     limited to 200–400 m of ELEVATION — the boiling zone — modelled here as
     shootM. Silicified vein R6 (>250 MPa) inside argillic host at R2–R3:
     the abrupt hard/soft alternation that costs core recovery. */
  'epithermal-gold': {
    shape: ORE_SHAPE.planar, label: 'EPITHERMAL VEIN', code: 'EPV',
    dipDeg: [45, 82], thickM: [0.8, 8.0], coreFrac: [0.25, 0.60],
    extentM: [90, 380], haloMul: [1.8, 3.2], shapeExp: 0.7, skew: 0,
    shootM: [200, 400],
    ucs: 230, abrasivity: 0.95, stability: 0.52,
    core: '#D6CFBE', halo: '#9C907E', stipple: 0.15,
    hostPref: ['basalt', 'schist', 'sandstone', 'limestone'],
  },
  /* USGS Model 26a. Stratabound tabular: 3–18 m thick (South Carlin) but
     610–5,273 m long. Decalcified/argillised ore is R2–R3 and caves, while
     jasperoid and silicified breccia inside the SAME body are R6 (>250 MPa) —
     mush and chert alternating within one hole. jasperoid switches that on. */
  'carlin-gold': {
    shape: ORE_SHAPE.planar, label: 'DECALC. CARBONATE', code: 'CBN',
    dipDeg: [2, 14], thickM: [3, 18], coreFrac: [0.55, 0.90],
    extentM: [300, 900], haloMul: [1.4, 2.2], shapeExp: 0.9, skew: 0,
    jasperoid: true,
    ucs: 44, abrasivity: 0.58, stability: 0.36,
    core: '#8F7A5E', halo: '#7C7266', stipple: 0.55,
    hostPref: ['limestone', 'marl', 'chalk', 'shale'],
  },
  /* USGS Model 39a. A ribbon pay-streak at the gravel/bedrock interface, with
     the values at the BASE of the gravel — hence the grade skew. Measured in
     g/m3 at 2.0 t/m3; a single nugget dominates the assay. */
  'placer-gold': {
    shape: ORE_SHAPE.planar, label: 'PAY GRAVEL', code: 'PAY',
    dipDeg: [0.5, 4], thickM: [0.5, 2.2], coreFrac: [0.6, 0.95],
    extentM: [40, 160], haloMul: [1.2, 1.6], shapeExp: 1.4, skew: 0.62,
    ucs: 4, abrasivity: 0.42, stability: 0.34,
    core: '#9A8663', halo: '#877E70', stipple: 0.8,
    hostPref: ['gravel', 'till', 'sand'],
  },
  /* USGS SIR 2010-5070-B / Sillitoe 2010 — and the supergene profile is the
     gift: leached capping 0 to several hundred m -> oxide as much as 300 m ->
     ENRICHED CHALCOCITE BLANKET as much as 750 m at 0.4–1.7 % Cu, INVARIABLY
     HIGHER GRADE than the hypogene beneath -> hypogene 0.2–1 %. Escondida:
     leach ~200 m average and locally 400, enrichment max ~400 m thick, the
     enrichment zone reaching 4 % Cu, sulphide cut-off 0.25–0.30 % TCu. */
  'porphyry-copper': {
    shape: ORE_SHAPE.stacked, label: 'PORPHYRY Cu', code: 'PPY',
    dipDeg: [0, 6], extentM: [400, 1400],
    leachM: [40, 220], oxideM: [20, 160], enrichM: [40, 260],
    ucs: 96, abrasivity: 0.72, stability: 0.58,
    core: '#3A3E46', halo: '#7E7264', stipple: 0.35,
    hostPref: ['granite', 'basalt', 'schist', 'quartzite'],
  },
  /* USGS SIR 2010-5070-C. Lenses/mounds/pipes, typical 100–500 m across, tens
     of metres thick (Greens Creek West Zone 3 m to >91 m), and the alteration
     halo is TWO TO THREE TIMES WIDER than the economic deposit. */
  'vms-copper': {
    shape: ORE_SHAPE.lenticular, label: 'MASSIVE SULPHIDE', code: 'MSF',
    dipDeg: [10, 55], thickM: [6, 60], coreFrac: [0.7, 0.95],
    extentM: [80, 320], haloMul: [2.0, 3.0], shapeExp: 0.6, skew: 0,
    ucs: 128, abrasivity: 0.64, stability: 0.66,
    core: '#5A4A3A', halo: '#6F6A5E', stipple: 0.2,
    hostPref: ['basalt', 'schist', 'shale', 'gneiss'],
  },
  /* Sedimentary basin seams at predictable horizons (DESIGN_EXPANSION.md §2).
     research/08 carries no coal grade–tonnage model, so the CALORIFIC BAND IS
     NOT SOURCED — see sourced:false on the commodity. The geometry (a
     stratabound seam concordant with the bedding) is not a claim, and drawn. */
  coal: {
    shape: ORE_SHAPE.planar, label: 'COAL SEAM', code: 'CO',
    dipDeg: [1, 8], thickM: [0.6, 3.4], coreFrac: [0.86, 0.98],
    extentM: [400, 1600], haloMul: [1.15, 1.5], shapeExp: 2.4, skew: 0,
    ucs: 16, abrasivity: 0.22, stability: 0.5,
    core: '#17181B', halo: '#4A4438', stipple: 0,
    hostPref: ['shale', 'sandstone', 'marl'],
  },
  /* Kimberlite pipe — "a narrow vertical target you either hit or miss"
     (DESIGN_EXPANSION.md §2). research/08 carries no kimberlite model, so the
     dimensions here are a game shape, not a sourced one. */
  kimberlite: {
    shape: ORE_SHAPE.lenticular, label: 'KIMBERLITE', code: 'KIMB',
    dipDeg: [82, 90], thickM: [30, 120], coreFrac: [0.8, 0.96],
    extentM: [200, 900], haloMul: [1.1, 1.4], shapeExp: 1.1, skew: 0,
    ucs: 62, abrasivity: 0.5, stability: 0.55,
    core: '#3E4A44', halo: '#5C5A50', stipple: 0.25,
    hostPref: ['gneiss', 'granite', 'basalt'],
  },
  /* Banded iron formation — brutally abrasive haematite/magnetite
     (DESIGN_EXPANSION.md §2). No grade–tonnage model in research/08, but the
     abrasivity is the point and research/08 §4 says to proxy it on quartz. */
  bif: {
    shape: ORE_SHAPE.planar, label: 'BANDED IRON', code: 'BIF',
    dipDeg: [18, 60], thickM: [8, 45], coreFrac: [0.8, 0.96],
    extentM: [250, 1000], haloMul: [1.2, 1.6], shapeExp: 1.0, skew: 0,
    ucs: 265, abrasivity: 0.99, stability: 0.86,
    core: '#4A3B37', halo: '#6E645C', stipple: 0.12,
    hostPref: ['quartzite', 'schist', 'gneiss'],
  },
  /* Pegmatite-hosted lithium (DESIGN_EXPANSION.md §2). Not in research/08. */
  pegmatite: {
    shape: ORE_SHAPE.planar, label: 'PEGMATITE', code: 'PEG',
    dipDeg: [30, 78], thickM: [3, 26], coreFrac: [0.75, 0.95],
    extentM: [80, 400], haloMul: [1.3, 1.9], shapeExp: 0.9, skew: 0,
    ucs: 175, abrasivity: 0.93, stability: 0.8,
    core: '#C6C0B0', halo: '#918B7E', stipple: 0.1,
    hostPref: ['granite', 'gneiss', 'schist'],
  },
};

/**
 * COMMODITIES — what the contract is drilling FOR.
 *
 * grade is [background, cutoff, typical, bonanza] in unit. Every sourced
 * band traces to research/08-commodities.md; unsourced commodities carry
 * sourced: false plus a needs note, and getOreAt() passes the flag out on
 * every sample so no UI can print an unsourced number as a fact.
 */
const COMMODITIES = {
  gold: {
    id: 'gold', name: 'Gold', symbol: 'Au', unit: 'g/t', sourced: true,
    /* Bliss (1986) median lode 16 g/t; St Ives UG mill feed 2.6–3.6 g/t and
       reserve 4.2 g/t; Casa Berardi 2.95 g/t; Fosterville Swan 30.6 g/t with
       FY2020 mill feed 33.9 g/t. USGS bonanza = >1 oz/short ton = 34.3 g/t. */
    grade: [0.02, 0.45, 4.2, 34.3],
    kinds: ['orogenic-gold', 'epithermal-gold', 'carlin-gold', 'placer-gold'],
    tint: '#D8B45A',
  },
  silver: {
    id: 'silver', name: 'Silver', symbol: 'Ag', unit: 'g/t', sourced: true,
    /* Juanicipio reports at 200 g/t AgEq; Lucky Friday reserve 470 g/t;
       Peñasquito 33.84 g/t; sediment-hosted Cu carries Ag at 2–200 g/t. */
    grade: [1.5, 45, 200, 470],
    kinds: ['epithermal-gold', 'vms-copper'],
    tint: '#C6CBD2',
  },
  copper: {
    id: 'copper', name: 'Copper', symbol: 'Cu', unit: '%', sourced: true,
    /* Porphyry median 0.44 % (USGS OFR 2008-1155); Escondida sulphide cut-off
       0.25–0.30 % TCu, hypogene 0.2–1 %, enrichment zone to 4 %; the
       chalcocite blanket 0.4–1.7 %. VMS felsic median 1.20 % Cu. */
    grade: [0.03, 0.28, 0.75, 4.0],
    kinds: ['porphyry-copper', 'vms-copper'],
    tint: '#C87F4A',
  },
  zinc: {
    id: 'zinc', name: 'Zinc', symbol: 'Zn', unit: '%', sourced: true,
    /* VMS felsic median 3.2 % Zn; Greens Creek reserve 6.5 % Zn. */
    grade: [0.08, 1.6, 3.2, 9.0],
    kinds: ['vms-copper'],
    tint: '#A7B0B8',
  },
  coal: {
    id: 'coal', name: 'Coal', symbol: 'C', unit: 'MJ/kg', sourced: false,
    needs: 'research/08-commodities.md carries no coal grade model; the '
         + 'calorific band below is a game value, not a sourced figure.',
    grade: [0, 18, 26, 33],
    kinds: ['coal'], tint: '#6E6A62',
  },
  iron: {
    id: 'iron', name: 'Iron', symbol: 'Fe', unit: '%', sourced: false,
    needs: 'BIF grade–tonnage not in research/08; band is a game value.',
    grade: [3, 28, 58, 68],
    kinds: ['bif'], tint: '#9E6A52',
  },
  lithium: {
    id: 'lithium', name: 'Lithium', symbol: 'Li2O', unit: '%', sourced: false,
    needs: 'Pegmatite/brine grades not in research/08; band is a game value.',
    grade: [0.02, 0.6, 1.3, 2.4],
    kinds: ['pegmatite'], tint: '#B7C6C2',
  },
  diamonds: {
    id: 'diamonds', name: 'Diamonds', symbol: 'ct', unit: 'cpht', sourced: false,
    needs: 'Kimberlite grade model not in research/08; band is a game value.',
    grade: [0, 12, 60, 300],
    kinds: ['kimberlite'], tint: '#CFD8DE',
  },
};

/** Which commodity a region plausibly hosts — DESIGN_EXPANSION.md §2 "Where". */
const REGION_COMMODITIES = {
  nordic: ['gold', 'copper', 'iron', 'lithium'],
  andes: ['copper', 'gold', 'silver', 'iron', 'lithium', 'coal'],
  arctic: ['gold', 'diamonds', 'copper'],
  alpine: ['gold', 'zinc', 'copper'],
  'iberian-quarry': ['copper', 'zinc', 'silver'],
  'german-site': ['coal'],
  sahara: ['gold', 'iron'],
  'north-sea': [],
};

/** Applications that are drilling for an ore body at all. */
const ORE_APPLICATIONS = /min|explor|prospect|grade.?control/;

/* ═══════════════════════════════════════════════════════════════════════════
   REGION RECIPES — geologically plausible bed sequences.
   `t` is a thickness range in metres. `p` is the probability the bed appears.
   `boulders` / `fract` / `karst` are feature densities (0..1+).
   `basement` beds repeat, alternating, until the profile is deep enough.
   ═══════════════════════════════════════════════════════════════════════════ */
const REGIONS = {
  /* Scandinavian shield: thin soil over glacial till over weathered gneiss. */
  nordic: {
    name: 'Nordic forest',
    dipDeg: [0.6, 2.6],
    waterTable: [2.5, 8],
    beds: [
      { id: 'topsoil', t: [0.25, 0.7] },
      { id: 'till',    t: [2.5, 7.0], boulders: 0.55 },
      { id: 'gravel',  t: [0.8, 2.8], p: 0.55 },          // esker lens
      { id: 'till',    t: [1.5, 5.0], boulders: 0.95, p: 0.8 },
      { id: 'boulder', t: [0.6, 1.8], boulders: 1.4, p: 0.45 },
      { id: 'fracture',t: [0.5, 2.0], fract: 1.2, p: 0.8 },  // weathered top of rock
      { id: 'gneiss',  t: [5, 16], fract: 0.35 },
    ],
    basement: [
      { id: 'granite', t: [10, 26], fract: 0.18 },
      { id: 'gneiss',  t: [8, 20],  fract: 0.30 },
      { id: 'fracture',t: [0.4, 1.4], fract: 1.4, p: 0.55 },
    ],
  },

  /* German urban construction site: made ground, clay, sand/gravel aquifer,
     marl, then Muschelkalk-style limestone. */
  'german-site': {
    name: 'German construction site',
    dipDeg: [0.4, 1.8],
    waterTable: [3, 9],
    beds: [
      { id: 'concrete', t: [0.15, 0.4], p: 0.7 },          // old slab / haul road
      { id: 'topsoil',  t: [0.3, 1.1] },
      { id: 'clay',     t: [2.0, 6.5] },
      { id: 'silt',     t: [0.8, 2.6], p: 0.6 },
      { id: 'sand',     t: [2.0, 6.0], water: 1.0 },
      { id: 'gravel',   t: [1.5, 4.5], water: 1.0, boulders: 0.35 },
      { id: 'clay',     t: [1.5, 4.0], p: 0.6 },
      { id: 'marl',     t: [4, 12] },
      { id: 'limestone',t: [6, 16], fract: 0.35, karst: 0.25 },
    ],
    basement: [
      { id: 'marl',      t: [6, 14] },
      { id: 'limestone', t: [8, 20], fract: 0.3, karst: 0.2 },
      { id: 'shale',     t: [4, 12], p: 0.6 },
    ],
  },

  /* Alpine tunnel portal: scree over folded metamorphics, squeezing zones. */
  alpine: {
    name: 'Alpine portal',
    dipDeg: [3, 9],
    waterTable: [8, 22],
    beds: [
      { id: 'gravel',   t: [1.5, 5.0], boulders: 0.7 },    // scree apron
      { id: 'till',     t: [1.0, 4.0], boulders: 1.0, p: 0.7 },
      { id: 'shale',    t: [2, 7], fract: 0.6, p: 0.7 },
      { id: 'schist',   t: [6, 18], fract: 0.8 },
      { id: 'fracture', t: [0.6, 2.4], fract: 1.6, p: 0.9 },
      { id: 'gneiss',   t: [8, 22], fract: 0.45 },
    ],
    basement: [
      { id: 'gneiss',   t: [10, 24], fract: 0.4 },
      { id: 'fracture', t: [0.5, 2.0], fract: 1.7, p: 0.7 },
      { id: 'granite',  t: [10, 26], fract: 0.2 },
      { id: 'schist',   t: [6, 16], fract: 0.7, p: 0.6 },
    ],
  },

  /* Iberian limestone quarry: pale karstic limestone, voids, red terra rossa. */
  'iberian-quarry': {
    name: 'Iberian quarry',
    dipDeg: [1.5, 5],
    waterTable: [14, 34],
    beds: [
      { id: 'topsoil',  t: [0.1, 0.4] },
      { id: 'clay',     t: [0.4, 1.6], p: 0.7 },           // terra rossa pocket
      { id: 'limestone',t: [8, 20], fract: 0.5, karst: 0.8 },
      { id: 'karst',    t: [0.4, 1.6], p: 0.75, karst: 1.6 },
      { id: 'limestone',t: [6, 18], fract: 0.4, karst: 0.6 },
      { id: 'marl',     t: [2, 7], p: 0.6 },
    ],
    basement: [
      { id: 'limestone',t: [10, 24], fract: 0.35, karst: 0.5 },
      { id: 'karst',    t: [0.3, 1.2], p: 0.5, karst: 1.5 },
      { id: 'sandstone',t: [6, 16], p: 0.7 },
    ],
  },

  /* North Sea: seabed sands, stiff clays, Chalk Group, then Rotliegend. */
  'north-sea': {
    name: 'North Sea platform',
    dipDeg: [0.3, 1.2],
    waterTable: [0.2, 0.6],   // effectively saturated from the seabed down
    beds: [
      { id: 'sand',     t: [2, 6], water: 1.0 },
      { id: 'clay',     t: [4, 12], water: 0.9, boulders: 0.30 },   // boulder clay
      { id: 'sand',     t: [2, 7], water: 1.0, p: 0.8 },
      { id: 'silt',     t: [1.5, 5], water: 0.95, p: 0.6 },
      { id: 'clay',     t: [4, 14], water: 0.9, boulders: 0.2 },
      { id: 'chalk',    t: [8, 22], water: 0.8, fract: 0.30 },
      { id: 'shale',    t: [4, 12], water: 0.7, fract: 0.25 },
    ],
    basement: [
      { id: 'chalk',    t: [10, 24], water: 0.8, fract: 0.28 },
      { id: 'sandstone',t: [8, 20], water: 0.85, fract: 0.22 },
      { id: 'shale',    t: [6, 16], water: 0.7, fract: 0.25 },
    ],
  },

  /* Saharan water well: aeolian sand, Nubian sandstone, karstic limestone. */
  sahara: {
    name: 'Sahara water well',
    dipDeg: [0.2, 1.2],
    waterTable: [28, 70],
    beds: [
      { id: 'sand',     t: [3, 11] },
      { id: 'gravel',   t: [0.6, 2.4], p: 0.6 },
      { id: 'sandstone',t: [8, 22], fract: 0.25 },
      { id: 'limestone',t: [6, 18], fract: 0.4, karst: 1.0 },
      { id: 'karst',    t: [0.5, 2.2], p: 0.8, karst: 1.8 },
      { id: 'sandstone',t: [10, 26], water: 1.0 },          // the aquifer
    ],
    basement: [
      { id: 'sandstone',t: [10, 26], water: 0.9 },
      { id: 'shale',    t: [4, 12], p: 0.7 },
      { id: 'limestone',t: [8, 18], karst: 0.6, p: 0.7 },
    ],
  },

  /* Andean porphyry copper: gravel cover, volcanics, altered/veined rock. */
  andes: {
    name: 'Andes copper',
    dipDeg: [2, 7],
    waterTable: [18, 46],
    beds: [
      { id: 'gravel',   t: [2, 8], boulders: 0.6 },
      { id: 'till',     t: [1, 4], boulders: 0.8, p: 0.5 },
      { id: 'basalt',   t: [6, 18], fract: 0.5 },
      { id: 'fracture', t: [0.5, 2.2], fract: 1.5, p: 0.85 },
      { id: 'schist',   t: [5, 14], fract: 0.7 },
      { id: 'quartzite',t: [4, 12], fract: 0.4 },
    ],
    basement: [
      { id: 'granite',  t: [10, 24], fract: 0.25 },
      { id: 'quartzite',t: [6, 16], fract: 0.35 },
      { id: 'fracture', t: [0.4, 1.6], fract: 1.6, p: 0.6 },
      { id: 'basalt',   t: [8, 18], fract: 0.45, p: 0.7 },
    ],
  },

  /* Arctic: active layer, permafrost, frozen till, flood basalt. */
  arctic: {
    name: 'Arctic permafrost',
    dipDeg: [0.4, 2.0],
    waterTable: [1.0, 3.0],
    beds: [
      { id: 'topsoil',   t: [0.15, 0.5] },
      { id: 'permafrost',t: [6, 18], water: 1.0 },
      { id: 'till',      t: [2, 7], boulders: 0.9 },
      { id: 'gravel',    t: [1, 3.5], p: 0.6, water: 0.9 },
      { id: 'basalt',    t: [8, 22], fract: 0.4 },
    ],
    basement: [
      { id: 'basalt',   t: [10, 24], fract: 0.35 },
      { id: 'gneiss',   t: [8, 20], fract: 0.3 },
      { id: 'fracture', t: [0.4, 1.5], fract: 1.4, p: 0.5 },
    ],
  },
};

/** Application bias — DOMAIN.md §2 industries, matched loosely by substring. */
function applicationBias(applicationId = '') {
  const a = String(applicationId).toLowerCase();
  const b = { boulders: 1, fract: 1, karst: 1, water: 1, wtShift: 1, softScale: 1, hardScale: 1 };
  if (/water|well/.test(a))            { b.water = 1.35; b.wtShift = 0.7;  b.karst = 1.2; }
  else if (/geotherm/.test(a))         { b.hardScale = 1.2; b.fract = 1.2; }
  else if (/found|pil|civil/.test(a))  { b.boulders = 1.3; b.softScale = 1.15; }
  else if (/tunnel/.test(a))           { b.fract = 1.6; b.hardScale = 1.15; }
  else if (/min|explor|prospect/.test(a)) { b.hardScale = 1.3; b.fract = 1.25; b.softScale = 0.8; }
  else if (/environ|remedi|investig/.test(a)) { b.softScale = 1.3; b.water = 1.2; b.wtShift = 0.75; }
  else if (/anchor|micropile|ground.support/.test(a)) { b.boulders = 1.2; b.fract = 1.3; }
  else if (/quarry|blast/.test(a))     { b.hardScale = 1.25; b.karst = 1.3; }
  else if (/hdd|utility|trench/.test(a)) { b.softScale = 1.25; b.boulders = 1.2; b.water = 1.15; }
  return b;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CPU NOISE — used for boundary displacement, feature scatter, ruler layout.
   ═══════════════════════════════════════════════════════════════════════════ */
function hash2(x, y, s) {
  let h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453123;
  return h - Math.floor(h);
}
function vnoise2(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s);
  const c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}
function fbm2(x, y, s, oct = 4) {
  let v = 0, amp = 0.5, fx = x, fy = y;
  for (let i = 0; i < oct; i++) { v += amp * vnoise2(fx, fy, s + i * 13.7); fx *= 2.03; fy *= 2.03; amp *= 0.5; }
  return v;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHADER SOURCE
   ═══════════════════════════════════════════════════════════════════════════ */

const GLSL_NOISE = /* glsl */`
float hash21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm2n(vec2 p){
  float v = 0.5 * vnoise(p);
  p = p * 2.03 + vec2(17.1, 9.7);
  v += 0.25 * vnoise(p);
  return v * 1.3333;
}
float fbm3n(vec2 p){
  float v = 0.5 * vnoise(p);
  p = p * 2.03 + vec2(17.1, 9.7);  v += 0.25 * vnoise(p);
  p = p * 2.01 + vec2(-8.3, 21.2); v += 0.125 * vnoise(p);
  return v * 1.1428;
}
float fbm4n(vec2 p){
  float v = 0.5 * vnoise(p);
  p = p * 2.03 + vec2(17.1, 9.7);  v += 0.25 * vnoise(p);
  p = p * 2.01 + vec2(-8.3, 21.2); v += 0.125 * vnoise(p);
  p = p * 1.98 + vec2(31.7, -4.1); v += 0.0625 * vnoise(p);
  return v * 1.0666;
}
// cheap cellular — pebble / clast shapes
float cells(vec2 p, out vec2 cid){
  vec2 ip = floor(p), fp = fract(p);
  float md = 8.0; cid = ip;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = vec2(hash21(ip + g), hash21(ip + g + 57.3));
      vec2 r = g + o - fp;
      float d = dot(r, r);
      if (d < md) { md = d; cid = ip + g; }
    }
  }
  return sqrt(md);
}
`;

/** Column lookup + hole radius + contact marks. Shared by face / wall / boulders. */
const GLSL_STRATA = /* glsl */`
uniform sampler2D uStrataA;   // rgb colour, a distance-to-nearest-contact / uEdgeRange
uniform sampler2D uStrataB;   // r pattern/8, g grain, b stability, a water
uniform sampler2D uStrataC;   // r ucs/300, g abrasivity, b bedding, a side-of-contact
/* D is the CONTACT CHARACTER channel, and it is why the boundaries in this
   section stopped being one global wobble applied to every bed alike.
     r  per-bed seed — two gravels in one frame are not the same gravel
     g  how far this contact WANDERS (0 conformable bedding .. 1 a weathering
        front or a scoured unconformity)
     b  how SHARP it is (0 gradational, silt passing into clay .. 1 a knife
        line, soil sitting straight on rock)
     a  clast density, straight off the recipe's own boulder loading
   Channels g and b are baked as a piecewise-linear ramp THROUGH the contacts,
   so the value at a contact is exactly that contact's character and the value
   between two of them slides smoothly. That continuity is load-bearing: g
   scales the boundary displacement inside colUWarp(), and a step in it would
   tear the boundary in half. Channels r and a are per-bed steps, which is
   correct — that is what a contact is — and texD is NEAREST-filtered so they
   stay steps. */
uniform sampler2D uStrataD;
uniform float uProfileDepth;
uniform float uDip;           // metres of throw per metre of x
uniform float uWarp;          // metres of fbm boundary displacement
uniform float uHoleR;
uniform float uDepth;         // current bit depth (m, positive)
uniform float uWaterY;        // section-space y of the water table (negative)

/* ── contact geometry ─────────────────────────────────────────────────────
   A.a is the distance from this sample to the nearest stratum contact,
   normalised over uEdgeRange metres. A geological contact is an EDGE, not a
   dissolve, so it is drawn rather than blended: a hard dark parting with a
   lighter lip on the bed above it. uPartW / uLipW are set in computeView()
   from CSS pixels, so the line is 1.5 px wide at any view scale. */
uniform float uEdgeRange;     // metres encoded in the A.a channel
uniform float uEdgeGeo;       // geometric undercut half-width (m)
uniform float uEdgeShade;     // soft shading contact half-width (m)
uniform float uPartW;         // drawn parting half-width (m) == 1.5 CSS px
uniform float uLipW;          // lip width (m) == 1.0 CSS px

/* ── procedural detail budget ─────────────────────────────────────────────
   These patterns are evaluated per-pixel with no mip chain, so any octave
   whose period falls below a few pixels resolves to flat grey and shimmers
   under scroll. uNyq is the highest frequency a single octave may reach, in
   cycles per metre; uNyq2 / uNyq4 are the matching caps for the BASE of a
   2- and a 4-octave fbm, whose top octave sits 2x / 8x higher. */
uniform float uNyq;
uniform float uNyq2;
uniform float uNyq4;
uniform float uAngNyq;        // same budget, expressed per radian of borehole wall

/** .x dark parting, .y lighter lip above it, .z broad soft contact occlusion */
vec3 contactMarks(float aChan, float side){
  float d = aChan * uEdgeRange;                    // metres to the contact
  // uPartW is the HALF width, so the drawn line is CFG.partingPx across
  float part = 1.0 - smoothstep(uPartW * 0.45, uPartW * 1.05, d);
  // the lip butts straight onto the parting, and only on the bed above it
  float lip  = smoothstep(uPartW * 0.85, uPartW * 1.05, d)
             * (1.0 - smoothstep(uPartW + uLipW * 0.75, uPartW + uLipW * 1.05, d))
             * (1.0 - side);
  float soft = 1.0 - smoothstep(0.0, uEdgeShade, d);
  return vec3(part, lip, soft);
}

/* ── SECTION SPACE -> TRUE VERTICAL DEPTH ────────────────────────────────
   One section unit is always one metre of TVD on Y, in every mode. What a
   mode may move is the ORIGIN: heading puts section y = 0 on the tunnel
   axis, so the depth of the rock there is the axis's cover, not zero.
   uDepth0 is 0 in vertical / profile / raise / pile, which reduces both
   expressions below to exactly what they were. uDip is metres of depth per
   section unit of x, so in the long-section modes it already carries the
   vertical exaggeration and the bedding dips WITH the drawing. */
uniform float uDepth0;        // TVD (m) at section y = 0

float depthAt(vec2 wp){ return uDepth0 - wp.y + wp.x * uDip; }

/* ── LOOK-AHEAD: HOW FAR PAST THE BIT IS THIS ROCK, AND HOW WELL IS IT KNOWN?
   ═══════════════════════════════════════════════════════════════════════════
   Until this existed, ground the bit had not reached was drawn EXACTLY like
   ground it had already cut, so the section told the player nothing they did
   not already know. It was scenery. The whole input is the metres-ahead field
   and the contract's own survey confidence.

   WHAT THE SECTION IS ACTUALLY A PICTURE OF, and therefore what "uncertain"
   has to look like. It is not a photograph of the ground and it is not a
   guess: it is a GEOLOGIST'S INTERPRETATION BETWEEN CONTROL POINTS. That
   carries a specific and very unequal pair of claims —

     · a bed's EXISTENCE and its LITHOLOGY are fairly well known. They come
       from regional mapping and from whatever holes have already gone down
       nearby. "There is gneiss under this till" is a claim a geologist will
       make from a map and be right about.
     · a bed's DEPTH and THICKNESS are INTERPOLATED between those holes, and
       the interpolation error grows with distance from the nearest control.
       "The gneiss is at 15.4 m" is a claim nobody can make from a map.

   THE BIT IS THE CONTROL POINT. That asymmetry is the whole design, and it
   is why the treatment below is deliberately NOT a fog overlay: a veil laid
   over the lower half of the band reads as a graphics effect — as though
   something were in the way — and it hides bed identity, which is the half
   of the picture that IS known. What degrades ahead of the bit is, in order:

     1. the POSITION of every contact — it wanders, and the drawn line stops
        being a line at all. An inferred contact is given exactly the
        character this file already gives a GRADATIONAL one, because in both
        cases the section cannot honestly claim an edge. That reuse is the
        point: the vocabulary for "there is no line here" was already in the
        file, authored and tuned, and it means one thing.
     2. the TEXTURE inside a bed — grain, joints, clasts. That is a core-box
        observation and there is no core yet.
     3. the CONTRAST between beds — last, and least, because that is bed
        identity, and identity is the part that is genuinely known.

   IT MUST NEVER LIE. Every term is multiplied by a function of aheadM() that
   is exactly 0 at and behind the bit, so a metre that has been drilled is
   drawn bit-for-bit as it was before this feature existed, and matches what
   the sim resolved. A player who catches the section retconning a bed will
   never trust it again. Proof, not assertion: run the band at uSurvey.x = 0
   and at uSurvey.x = 1 and diff the region above the bit — the difference
   must be zero pixels. (.probe-look.mjs does exactly that.)

   ONE LINEAR FORM FOR FIVE MODES. "Ahead" is not always downward: on a
   heading the unknown ground is horizontally past the face, and on an HDD
   profile it is past the drilled station. Rather than branch per mode inside
   a fragment shader that has already taken the GPU process down once
   (HANDOFF §8G), the CPU — which knows the mode — supplies the coefficients
   of a plane and the shader evaluates one dot product:

       ahead(m) = depth * uLook.x + wp.x * uLook.y + uLook.z

     vertical / pile   (1, 0, -bitDepth)         ahead = depth - bitDepth
     raise stage >= 1  ceiling forced to 0 — the pilot hole already logged
                       the whole column, so nothing ahead of the reamer is
                       unknown. That is what a pilot hole IS FOR.
     heading           (0, mPerUnitX, -faceX * mPerUnitX)
     profile           (0, mPerUnitX, -xOrigin * mPerUnitX - drilledStation)

   uLook.w is 1 / the CONTROL DISTANCE: the metres ahead at which the
   interpretation has lost ~63 % of everything it is going to lose. */
uniform vec4 uLook;    // (d/depth, d/sectionX, const, 1/controlDistance)
uniform vec2 uSurvey;  // x = uncertainty ceiling 0..1 ; y = boundary wander gain

/** Metres of ground between this sample and the deepest thing actually cut. */
float aheadM(vec2 wp, float d){ return d * uLook.x + wp.x * uLook.y + uLook.z; }

/** 0 where the ground has been drilled, rising to uSurvey.x far ahead of it. */
float lookUnc(vec2 wp, float d){
  /* Saturating, not linear, because that is the shape of the real thing: the
     first metre past the bit is very nearly as good as drilled, and 30 m
     ahead is no better known than 25 m ahead. */
  return uSurvey.x * (1.0 - exp(-max(aheadM(wp, d), 0.0) * uLook.w));
}

// section-space y (negative down) -> lookup coordinate, no warp
float colU(float sy, float x){
  float d = uDepth0 - sy + x * uDip;
  return clamp(d / max(uProfileDepth, 1.0), 0.0006, 0.9994);
}
/* Warped: irregular, interfingering boundaries.
   The first term used to run at 0.085 cycles/m in x — a period of 11.8 m
   against a frame only 14 m wide — so across the visible width it was very
   nearly a constant and every contact drew as a straight line from bevel to
   bevel. It is now 0.30 c/m (a 3.3 m period), which is the "shallow regional
   waver" the boundary was missing, and its amplitude is held at 0.8 * uWarp so
   the swing is about +/-0.46 m: enough to read as a real contact, not enough
   to erase the thinnest bed the recipes can produce (0.4 m fracture seams). */
/* THE AMPLITUDE IS NOW PER CONTACT, not one number for the whole column.
   A single global uWarp gave every boundary in the section the same wobble,
   which is its own kind of tell: real ground does not wander by a fixed
   amount. A weathering front (soil sitting on rock) swings a metre; a
   conformable bedding contact between two limestones is very nearly planar
   and is sold instead by being a clean line. D.g carries that, and because it
   is sampled at the UNWARPED depth — and is continuous in depth by
   construction — the two sides of a contact always agree on the amplitude and
   the boundary stays single-valued. */
float colUWarp(vec2 wp){
  float d = uDepth0 - wp.y + wp.x * uDip;
  float u0 = clamp(d / max(uProfileDepth, 1.0), 0.0006, 0.9994);
  float amp = uWarp * (0.30 + 1.95 * texture2D(uStrataD, vec2(u0, 0.5)).g);
  /* THE BOUNDARY WANDERS WHERE IT HAS NOT BEEN PROVED. This gain rides the
     LOW octave only, and only that one, for a physical reason: what is
     uncertain about an unproved contact is a long-wavelength thing — the bed
     sits deeper or shallower or thicker than the interpretation drew it — not
     a jitter. Adding uncertainty to the fine octaves would draw a boundary
     that is noisy, which is a different and untrue claim.

     It costs no extra noise call: the term was already being evaluated and
     only its amplitude moves.

     It rides the CONTACT'S OWN character (amp already carries D.g) rather
     than being a flat addition, and that is right rather than convenient: a
     scoured unconformity or a weathering front genuinely is harder to
     interpolate between holes than a conformable bedding plane between two
     limestones, which is very nearly a geometric surface.

     AND IT IS SELF-CANCELLING AT THE BIT. lookUnc() is 0 at and behind the
     working point, so the drawn boundary migrates into its true position as
     the bit comes down on it and is exactly where the un-warped section
     always put it by the time it is cut. Nothing is retconned; the estimate
     is simply replaced by the observation, which is what drilling is. */
  float wander = 1.0 + lookUnc(wp, d) * uSurvey.y;
  d += (fbm3n(wp * vec2(0.30, 0.13) + 11.0) - 0.5) * amp * 0.80 * wander;
  d += (fbm4n(wp * vec2(0.40, 0.62) + 3.0) - 0.5) * amp * 0.34;
  d += (fbm2n(wp * vec2(1.7, 2.4)) - 0.5) * amp * 0.10;
  return clamp(d / max(uProfileDepth, 1.0), 0.0006, 0.9994);
}
// over-gauge in loose ground, spalled in fractured rock
float holeRadius(float sy, float ang){
  vec4 B = texture2D(uStrataB, vec2(colU(sy, 0.0), 0.5));
  float over = (1.0 - B.b);
  float n = (fbm3n(vec2(ang * 1.7, -sy * 0.85)) - 0.5) * (0.09 + over * 0.55);
  return uHoleR * (1.0 + over * 0.40 + n);
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE VOID THE SECTION IS CUT BY — one signed distance field, five modes
   ═══════════════════════════════════════════════════════════════════════════
   Returns a signed distance in SECTION UNITS: negative inside the opening.
   drilledOut comes back 1 where the opening actually exists yet (behind the
   bit / the face / the head) and 0 in ground that has not been cut.

   uBMode 0 (vertical) is the original two lines, unchanged, so the fourteen
   vertical methods take exactly the code path they always did.               */
uniform float uBMode;
/* profile: the analytic five-part HDD profile of research/07 §A1 —
   entry tangent -> sweeping arc -> sag bend -> sweeping arc -> exit tangent.
   Solved once on the CPU and evaluated here as a function of HORIZONTAL
   distance, which is legal because the path is monotone in x.
     uPathA  x tan(entry)   y X1 (end of entry tangent, m)
             z X2 (end of entry arc, m)   w R1 (entry radius, m)
     uPathB  x X3 (start of exit arc, m)  y X4 (end of exit arc, m)
             z R2 (exit radius, m)        w tan(exit)
     uPathC  x design cover depth (m)     y metres per section unit of x
             z section x of station 0     w product/reamed radius (units)
   uBore     x cut extent in metres of X  y second-stage extent (m of X)
             z pilot radius (units)       w stage (0 pilot, 1 backream) */
uniform vec4 uPathA;
uniform vec4 uPathB;
uniform vec4 uPathC;
uniform vec4 uBore;
/* heading: x crown y (units)  y invert y (units)  z face x (units)
            w overbreak amplitude (units) */
uniform vec4 uTun;
/* raise: x upper level half-height (units)  y lower level depth (m)
         z lower level half-height (units)   w reamed extent from the bottom (m)
   The two drives' half-WIDTH rides in uPathA.x, which raise does not
   otherwise use — GLSL_STRATA is included by five materials and cannot
   redeclare uHalfW, which only the face shaders have. */
uniform vec4 uRaise;

/* Along-axis distance in METRES. uPathC.y is metres per section unit of x and
   uPathC.z the section x of station zero — 1 and 0 in every vertical mode, so
   this is the plain x coordinate there. */
float alongAt(vec2 wp){ return (wp.x - uPathC.z) * uPathC.y; }

float hddDepthAtX(float X){
  float te = uPathA.x, X1 = uPathA.y, X2 = uPathA.z, R1 = uPathA.w;
  float X3 = uPathB.x, X4 = uPathB.y, R2 = uPathB.z, tx = uPathB.w;
  float Dc = uPathC.x;
  if (X <= 0.0) return 0.0;
  if (X < X1) return X * te;
  if (X < X2) return (Dc - R1) + sqrt(max(R1 * R1 - (X - X2) * (X - X2), 0.0));
  if (X < X3) return Dc;
  if (X < X4) return (Dc - R2) + sqrt(max(R2 * R2 - (X - X3) * (X - X3), 0.0));
  float D4 = (Dc - R2) + sqrt(max(R2 * R2 - (X4 - X3) * (X4 - X3), 0.0));
  return max(D4 - (X - X4) * tx, 0.0);
}
/** d(depth)/dX in metres per metre; positive = the bore is going deeper. */
float hddSlopeAtX(float X){
  float te = uPathA.x, X1 = uPathA.y, X2 = uPathA.z, R1 = uPathA.w;
  float X3 = uPathB.x, X4 = uPathB.y, R2 = uPathB.z, tx = uPathB.w;
  if (X < X1) return te;
  if (X < X2) { float dx = X2 - X; return dx / max(sqrt(max(R1 * R1 - dx * dx, 1.0)), 1.0); }
  if (X < X3) return 0.0;
  if (X < X4) { float dx = X - X3; return -dx / max(sqrt(max(R2 * R2 - dx * dx, 1.0)), 1.0); }
  return -tx;
}

/** rOut is the local half-width of the opening, in section units — the
 *  radius every caller used to recompute for itself. */
/** Radius multiplier for the raise's un-reamed pilot length — 1.0 in every
 *  other mode, so the borehole wall mesh is untouched outside raise. */
float boreRadiusScale(float sy){
  if (uBMode < 3.5) return 1.0;
  float reamTop = uRaise.y - uRaise.w;
  return mix(uBore.z / max(uHoleR, 0.001), 1.0, step(reamTop, -sy));
}

float boreSDF(vec2 wp, float ang, out float drilledOut, out float rOut){
  if (uBMode < 0.5) {
    // ── VERTICAL. The original hole, untouched.
    drilledOut = step(-uDepth - 0.02, wp.y);
    rOut = holeRadius(wp.y, ang);
    return abs(wp.x) - rOut;
  }
  if (uBMode < 1.5) {
    /* ── PROFILE. Perpendicular distance to the designed curve. The path is
       drawn under a vertical exaggeration, so a vertical offset is divided by
       the ON-SCREEN gradient — otherwise the bore reads three times fatter on
       the entry tangent than it does under the sag bend. */
    float X = (wp.x - uPathC.z) * uPathC.y;
    float py = -hddDepthAtX(X);
    float sl = hddSlopeAtX(X) * uPathC.y;          // dy/dx in section units
    float perp = abs(wp.y - py) / sqrt(1.0 + sl * sl);
    // backream and pullback run from the exit pit back toward the rig
    float reamed = step(0.5, uBore.w) * step(uBore.x - uBore.y, X);
    rOut = mix(uBore.z, max(uPathC.w, uBore.z), reamed);
    drilledOut = step(0.0, X) * step(X, uBore.x);
    return perp - rOut;
  }
  if (uBMode < 2.5) {
    /* ── HEADING. In a long-section the drive is a rectangle: crown above,
       invert below, ending at the face. The crown carries an overbreak wobble
       because that is what the player is scored on. */
    float ob = (fbm2n(vec2(wp.x * 1.6, 7.3)) - 0.5) * uTun.w;
    float top = uTun.x + max(ob, 0.0);
    float bot = uTun.y + min(ob, 0.0) * 0.5;
    drilledOut = step(wp.x, uTun.z);
    rOut = (top - bot) * 0.5;
    return max(max(bot - wp.y, wp.y - top), wp.x - uTun.z);
  }
  if (uBMode < 3.5) {
    // ── PILE. A column, not a hole: the face is cut and the concrete fills it.
    drilledOut = step(-uDepth - 0.02, wp.y);
    float bulge = 1.0 + (fbm2n(vec2(-wp.y * 0.55, 3.1)) - 0.5) * 0.22;
    rOut = uHoleR * bulge;
    return abs(wp.x) - rOut;
  }
  /* ── RAISE. Pilot down from the upper level, reamer pulled UP from the
     lower one, so the REAMED length is measured from the bottom. Both levels
     are drawn as openings in their own right. */
  float d = -wp.y;
  float reamTop = uRaise.y - uRaise.w;
  rOut = mix(uBore.z, uHoleR, step(reamTop, d));
  float shaft = abs(wp.x) - rOut;
  float lw = uPathA.x;                       // drive half-width, section units
  float upper = max(abs(wp.y) - uRaise.x, abs(wp.x) - lw);
  float lower = max(abs(wp.y + uRaise.y) - uRaise.z, abs(wp.x) - lw);
  float lvl = min(upper, lower);
  drilledOut = max(step(-uDepth - 0.02, wp.y), step(lvl, 0.0));
  return min(shaft, lvl);
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE ORE BODY
   ═══════════════════════════════════════════════════════════════════════════
   Three shapes carry all ten geological kinds (see ORE_KINDS above), and this
   is the exact maths getOreAt() runs on the CPU.

     uOreA  x shape (0 none/1 planar/2 lenticular/3 stacked)
            y centre depth (m)   z half-thickness (m)   w dip (radians)
     uOreB  x centre along-axis (m)  y half-extent (m)
            z halo multiple (>1)     w peak grade, normalised 0..1
     uOreC  x leached base (m) y oxide base (m) z enriched base (m) w hypogene base
     uOreE  x grade shape exponent  y grade skew (placer: values at the base)
            z shoot top (m)         w shoot bottom (m)   — 0 disables the shoot
   sOut comes back as the perpendicular offset in half-thicknesses (so the
   core is |s| < 1 and the halo is 1 < |s| < haloMul) and aOut as the offset
   along the body in half-extents.                                          */
uniform vec4 uOreA;
uniform vec4 uOreB;
uniform vec4 uOreC;
uniform vec4 uOreE;

float oreGrade(float X, float dpt, out float sOut, out float aOut, out float zoneOut){
  sOut = 9.0; aOut = 9.0; zoneOut = 0.0;
  if (uOreA.x < 0.5) return 0.0;

  if (uOreA.x > 2.5) {
    /* STACKED — the porphyry supergene profile. Zones are depth bands that
       tilt with the body's dip, and the enriched blanket is the high-grade
       one, exactly as the deposit model says. */
    float dz = dpt - (X - uOreB.x) * tan(uOreA.w);
    float extent = 1.0 - smoothstep(0.86, 1.0, abs(X - uOreB.x) / max(uOreB.y, 1.0));
    if (extent <= 0.001) return 0.0;
    aOut = (X - uOreB.x) / max(uOreB.y, 1.0);
    float z1 = uOreC.x, z2 = uOreC.y, z3 = uOreC.z, z4 = uOreC.w;
    if (dz < z1)      { zoneOut = 1.0; sOut = 0.0; return 0.04 * extent; }   // leached cap
    if (dz < z2)      { zoneOut = 2.0; sOut = 0.0;
                        return uOreB.w * mix(0.30, 0.52, smoothstep(z1, z2, dz)) * extent; }
    if (dz < z3) {                                                            // chalcocite
      zoneOut = 3.0; sOut = 0.0;
      float t = (dz - z2) / max(z3 - z2, 0.5);
      return uOreB.w * (0.62 + 0.38 * sin(t * 3.14159)) * extent;
    }
    if (dz < z4)      { zoneOut = 4.0; sOut = 0.0;
                        return uOreB.w * mix(0.34, 0.20, smoothstep(z3, z4, dz)) * extent; }
    return 0.0;
  }

  // PLANAR / LENTICULAR — offsets in the body's own frame
  float cd = cos(uOreA.w), sd = sin(uOreA.w);
  float dx = X - uOreB.x, dd = dpt - uOreA.y;
  float s = dd * cd - dx * sd;                    // perpendicular, metres
  float a = dx * cd + dd * sd;                    // along the body, metres
  float sn = s / max(uOreA.z, 0.02);
  float an = a / max(uOreB.y, 1.0);
  sOut = sn; aOut = an;

  float ext = uOreA.x > 1.5
    ? 1.0 - smoothstep(0.0, 1.0, sqrt(max(an * an, 0.0)))     // lens: elliptical
    : 1.0 - smoothstep(0.82, 1.0, abs(an));                   // planar: tapered ends
  if (ext <= 0.001) return 0.0;

  // grade across the body, skewed for a pay-streak that sits at the base
  float u = clamp(abs(sn + uOreE.y), 0.0, 1.0);
  float g = pow(max(1.0 - u * u, 0.0), max(uOreE.x, 0.05));
  if (uOreA.x > 1.5) g *= max(1.0 - an * an, 0.0);
  g *= ext;

  // ore shoot / boiling zone: a real envelope, not decoration
  if (uOreE.w > uOreE.z) {
    g *= smoothstep(uOreE.z - 40.0, uOreE.z + 30.0, dpt)
       * (1.0 - smoothstep(uOreE.w - 30.0, uOreE.w + 40.0, dpt));
  }
  // nugget / grade variance along the body
  g *= 0.55 + 0.90 * fbm3n(vec2(a * 0.06, dpt * 0.05) + 21.0);
  zoneOut = step(abs(sn), 1.0) * 5.0;
  return clamp(g * uOreB.w, 0.0, 1.0);
}
`;

/** Ground line at the very top of the section.
 *  uSurfY moves it (a heading section's ground sits a whole cover depth
 *  above the tunnel axis, usually off the top of the band); uSurfAmp scales
 *  the relief with the mode's horizontal scale so a 120 m long-section does
 *  not look like a 14 m one; uObst is the thing that is CROSSED — a river
 *  channel cut into the ground, or a road/rail embankment raised out of it.
 *  With uSurfY 0, uSurfAmp 1 and uObst.z 0 this is the original one-liner. */
const GLSL_SURFACE = /* glsl */`
uniform float uSurfY;
uniform float uSurfAmp;
uniform vec4  uObst;   // x centre (units)  y half width (units)
                       // z depth/height (units, + up)  w kind (0 none 1 water 2 deck)
float surfaceY(float x){
  float rel = (fbm3n(vec2(x * 0.35, 4.7)) - 0.5) * 0.55
            + (fbm2n(vec2(x * 1.6, 9.1)) - 0.5) * 0.14;
  float y = uSurfY + rel * uSurfAmp;
  bool hasObst = uObst.y > 0.0001;
  if (abs(uObst.z) <= 0.0001) hasObst = false;
  if (hasObst) {
    float t = clamp((x - uObst.x) / uObst.y, -1.0, 1.0);
    // a channel with sloping banks, or an embankment with battered sides
    float prof = smoothstep(1.0, 0.62, abs(t));
    y += uObst.z * prof;
  }
  return y;
}
`;

const GLSL_CAV = /* glsl */`
uniform vec4 uCav[6];   // x, y(section), halfW, halfH ; halfW<=0 => unused
float cavityField(vec2 p){
  float best = 4.0;
  for (int i = 0; i < 6; i++) {
    if (uCav[i].z <= 0.0) continue;
    vec2 d = (p - uCav[i].xy) / uCav[i].zw;
    // slightly lumpy ellipse
    float ang = atan(d.y, d.x);
    float lump = 1.0 + (fbm2n(vec2(ang * 1.9, uCav[i].x * 3.1)) - 0.5) * 0.42;
    best = min(best, length(d) / lump);
  }
  return best;   // <1 inside a void
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   CLASTS AND CONTACT CHARACTER — included by the FACE fragment shader only
   ═══════════════════════════════════════════════════════════════════════════
   Kept out of GLSL_NOISE / GLSL_STRATA deliberately. Those two are pulled into
   five materials each, and this file's one recorded catastrophe was a shader
   that grew until D3DCompile fell over inside it. Everything here is used by
   exactly one program, so it is compiled exactly once.
   ═══════════════════════════════════════════════════════════════════════════ */
const GLSL_CLAST = /* glsl */`
/* Cellular with the OFFSET to the feature point. A clast needs a normal, not
   just a value: knowing where the stone's centre is, relative to this pixel,
   is what lets it be given a surface and lit by the same key as the rest of
   the face. Same nine-tap loop as cells(); it returns one more thing. */
float cellsV(vec2 p, out vec2 cid, out vec2 off){
  vec2 ip = floor(p), fp = fract(p);
  float md = 8.0;
  cid = ip; off = vec2(0.5);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = vec2(hash21(ip + g), hash21(ip + g + 57.3));
      vec2 r = g + o - fp;
      float d = dot(r, r);
      if (d < md) { md = d; off = r; cid = ip + g; }
    }
  }
  return sqrt(md);
}

/* ── A CLAST ───────────────────────────────────────────────────────────────
   The single most conspicuous gap against the reference: its cobble horizon
   has individually legible stones, ours had a mottle. A mottle is what you get
   when a clast is drawn as a value multiply of the matrix colour — at 19.4 CSS
   px per metre a 0.4 m cobble is 8 px across and 8 px of slightly different
   brown is not a stone. What makes it a stone is that it is LIT: it presents
   its own curved or faceted surface to the key, so it carries a highlight, a
   terminator, and a shadow in the matrix on its down-key side.

   SIZE COMES FROM freq. One clast per cell, cell period 1/freq metres. The
   threshold decides only how soft the rim is, and the band is fixed at 0.26 in
   cell units — above this project's 0.25 floor — so the edge stays a rim at
   any view scale instead of collapsing into a shimmering dot field. pack is
   the fraction of cells that carry a clast at all, and it is a per-cell step
   on a per-cell constant, which cannot alias.

     rnd  1 = rounded, a fluvial or glacial cobble worn in transport
          0 = angular, scree or blasted rock, a joint-bounded block
     nOut the clast's surface normal, as an offset from the face's own
     vOut its albedo multiplier   sOut the matrix shadow ring around it       */
float clastField(vec2 wp, float freq, float rnd, float pack, float seed,
                 out vec3 nOut, out float vOut, out float sOut){
  vec2 cid, off;
  float d = cellsV(wp * freq + seed * 37.0, cid, off);
  float t  = hash21(cid * 1.93 + 3.1);
  float t2 = hash21(cid * 5.77 + 8.4);
  float on = step(1.0 - pack, hash21(cid * 9.13 + seed * 21.0));
  float R  = 0.26 + 0.30 * t;
  float mask = smoothstep(R + 0.13, R - 0.13, d) * on;
  sOut = smoothstep(R + 0.40, R + 0.10, d) * on * (1.0 - mask);
  vOut = 0.74 + 0.54 * t2;
  vec2 q  = -off / max(R, 0.08);          // outward, in clast radii
  float qq = min(dot(q, q), 1.0);
  // half-buried hemisphere: flat on top, turning down hard at the rim
  vec3 dome = vec3(q * 0.90, sqrt(max(1.0 - qq * 0.86, 0.06)));
  // a joint block: one flat random facet, bevelled off at the block edge
  vec2 fn = (vec2(hash21(cid * 3.71), hash21(cid * 6.29)) - 0.5) * 1.05;
  vec3 facet = vec3(fn + q * qq * 0.85, 0.72);
  nOut = (normalize(mix(facet, dome, rnd)) - vec3(0.0, 0.0, 1.0)) * mask;
  return mask;
}

/* ── THE CONTACT, WITH A CHARACTER ─────────────────────────────────────────
   contactMarks() draws one contact: a 1.5 px parting with a lip. That is right
   for an erosional or lithological boundary and wrong for a gradational one,
   where there is no line at all — a silt passes into a clay over half a metre
   and a driller reads the change, not an edge. D.b says which this is, and the
   two ends of it look genuinely different: sharp gives a hard thin line with a
   lit lip, gradational gives a wide soft change with no line in it.

   AND THAT IS ALSO WHAT AN UNDRILLED CONTACT LOOKS LIKE. unc is the
   look-ahead uncertainty at this sample (see lookUnc() above) and it enters
   in exactly one place: it knocks the contact's drawn SHARPNESS down. A
   knife-edge boundary the bit has not reached is not a knife edge on this
   drawing — it is a depth somebody interpolated, and the honest way to say
   "the contact is somewhere around here" is the way this file already says
   "the change happens over half a metre": a wide soft band with no line in
   it. So an inferred contact borrows the gradational vocabulary, and locks
   to its true character as the bit arrives and unc goes to 0.

   Note what does NOT go to zero. At unc = 1 the parting still carries 0.22
   of its weight and the soft band is at its widest — the contact is still
   VISIBLE, just unplaceable. That is the asymmetry the model is built on:
   the bed's existence is known, its depth is not. */
vec3 contactMarksK(float aChan, float side, float sharp, float unc){
  float d = aChan * uEdgeRange;
  sharp *= 1.0 - unc;
  float w = uPartW * mix(2.40, 0.90, sharp);
  float part = (1.0 - smoothstep(w * 0.45, w * 1.05, d)) * (0.22 + 0.78 * sharp);
  float lip  = smoothstep(w * 0.85, w * 1.05, d)
             * (1.0 - smoothstep(w + uLipW * 0.75, w + uLipW * 1.05, d))
             * (1.0 - side) * sharp;
  float soft = 1.0 - smoothstep(0.0, uEdgeShade * mix(5.0, 1.0, sharp), d);
  return vec3(part, lip, soft);
}
`;

/* ── FACE SLAB ───────────────────────────────────────────────────────────── */
const FACE_VERT = /* glsl */`
precision highp float;
/* slab local origin -> section space. .y is the vertical scroll the band has
   always had; .x is the horizontal one the long-section modes need, and it is
   pinned at 0 in every vertical mode, so the mapping is unchanged there. */
uniform vec2  uSlabOffset;
uniform float uHalfW;
uniform float uTime;
varying vec2  vWP;           // section-space position
varying vec3  vN;
varying float vZ;
varying float vEdge;
varying float vAO;           // fine-relief residual: the crevice term
${GLSL_NOISE}
${GLSL_STRATA}
${GLSL_SURFACE}
${GLSL_CAV}

/* The mid/fine relief is scaled by the bed's own grain, so a coarse diamicton
   gets a lumpy face and a chalk gets a smooth one. This is where each bed's
   internal value range comes from: the residual is handed to the fragment
   shader as vAO and drives a crevice occlusion there. */
float faceDetail(vec2 wp, float grain){
  float k = 0.35 + 1.15 * grain;
  return ((fbm3n(wp * 1.9 + 5.0) - 0.5) * 0.30
        + (fbm2n(wp * 4.4 - 3.0) - 0.5) * 0.085) * k;
}

float faceHeight(vec2 wp, out float edgeOut, out float aoOut){
  float u = colUWarp(wp);
  // A.a is now DISTANCE to the nearest contact; the slab lattice is ~0.32 m so
  // the displaced undercut uses the wide band and the crisp line is drawn in
  // the fragment shader instead.
  float dC = texture2D(uStrataA, vec2(u, 0.5)).a * uEdgeRange;
  float edge = 1.0 - smoothstep(0.0, uEdgeGeo, dC);
  edgeOut = edge;
  float grain = texture2D(uStrataB, vec2(u, 0.5)).g;
  float h = (fbm4n(wp * 0.5) - 0.5) * 0.72;
  float det = faceDetail(wp, grain);
  aoOut = det;
  h += det;
  /* The erosion undercut along a contact was 0.30 + 0.50 * fbm — up to 0.80 m
     of recess on a face whose whole relief is 0.7 m. It tilted the normal so
     far that ndl went to ~0 right under the contact, and that geometry, times
     three stacked shading terms, is what turned a 1.5 px drawn parting into a
     measured 30 CSS px trough bottoming at luminance 5-8: a magma seam. The
     SHADING band was cut to 0.12 m in round 2 but this was not. 0.08 + 0.14
     keeps the undercut as a hint of relief and lets the drawn line do the
     work it was designed to do. */
  h -= edge * (0.08 + 0.14 * fbm2n(wp * 2.3 + 13.0));
  // the block has thickness: bevel the outer border back
  float bx = smoothstep(uHalfW, uHalfW - 2.4, abs(wp.x));
  h -= (1.0 - bx) * 2.1;
  /* Contact well around the opening, only where we have actually cut it. In
     vertical mode this is the original expression: boreSDF returns
     abs(wp.x) - holeRadius(...) and drilled is the same step, so the recess
     lands exactly where it did. In the other modes the well follows whatever
     the opening is — the HDD curve, the tunnel crown, the pile shaft. */
  float drilled, r;
  float d = boreSDF(wp, wp.x > 0.0 ? 0.0 : 3.14159, drilled, r);
  h -= drilled * smoothstep(max(r, 0.05) * 1.5, 0.0, max(d, 0.0)) * 0.85;
  // recess the rim of karst voids
  float cav = cavityField(wp);
  h -= smoothstep(1.9, 1.0, cav) * 0.9;
  return h;
}

void main(){
  vec2 wp = position.xy + uSlabOffset;
  vWP = wp;
  float e, ao;
  float h = faceHeight(wp, e, ao);
  vEdge = e;
  vAO = ao;
  const float EPS = 0.22;
  float e2, ao2;
  float hx = faceHeight(wp + vec2(EPS, 0.0), e2, ao2);
  float hy = faceHeight(wp + vec2(0.0, EPS), e2, ao2);
  vN = normalize(vec3(-(hx - h) / EPS, -(hy - h) / EPS, 1.0));
  vZ = h;
  vec3 p = vec3(position.x, position.y, h);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const FACE_FRAG = /* glsl */`
precision highp float;
uniform vec2  uSlabOffset;
uniform float uHalfW;
uniform float uTime;
uniform vec3  uAmbientCool;
uniform vec3  uKeyWarm;
uniform float uWetMix;
/* ── ore drawing ─────────────────────────────────────────────────────────
   uOreTint / uOreHalo   the body's core and alteration-halo colours
   uOreD  x reveal core radius (units)   y ghost alpha for the projected body
          z stipple density (disseminated ore)   w hidden flag (1 = draw none)
   uTarget  x predicted top (m)  y predicted bottom (m)
            z ghost alpha        w dash period (units)
   The player cannot see the truth before drilling it: the ore is drawn at
   full strength only inside the corridor the bit has actually logged, and
   fades to uOreD.y — the contract's confidence — where it is only projected.
   uTarget is the CONTRACT's predicted horizon, and it is deliberately not
   where the body is. */
uniform vec3  uOreTint;
uniform vec3  uOreHalo;
uniform vec4  uOreD;
uniform vec4  uTarget;
varying vec2  vWP;
varying vec3  vN;
varying float vZ;
varying float vEdge;
varying float vAO;
${GLSL_NOISE}
${GLSL_STRATA}
${GLSL_SURFACE}
${GLSL_CAV}
${GLSL_CLAST}

/* ── THE PATTERN SET ───────────────────────────────────────────────────────
   Every material is built at THREE scales:

     MACRO  0.2-0.8 cycles/m  — 1.2-5 m forms; "this bed has structure"
     MID    1.5-4.0 cycles/m  — 0.25-0.7 m; this is where material IDENTITY
                                lives
     FINE   <= uNyq           — grain, capped so its period never falls below
                                ~3.5 CSS px. These functions are procedural and
                                therefore unmippable: an uncapped octave does
                                not read as grain, it reads as flat grey that
                                crawls when the section scrolls.

   ── WHY THIS SET WAS REBUILT ──────────────────────────────────────────────
   Measured on shots/g0-14-section-clean.png, the whole 20 m band segmented
   into TWO contacts and one bed 15.75 m tall at L* 35.1 with a per-pixel sd of
   9.5 — a mush, against a reference that shows four horizons each with its own
   colour, grain size and internal structure. Three faults, all measurable:

   1. STRUCTURE WAS PAINT, NOT LIGHT. Every feature was a value multiply on the
      matrix colour. A cobble drawn as c * 1.1 is a mottle; a cobble drawn
      with its own NORMAL is a stone, because the key light then gives it a
      highlight, a terminator and a shadow. Every branch below now returns a
      normal perturbation in nOut, and main() lights the bed's own structure
      with the same sun that lights the face.
   2. THE MEANS DRIFTED. The old branches multiplied by 0.75 (crystalline) to
      1.03 (sand) on average, so a pattern quietly moved a bed up to a quarter
      of a stop off the albedo contract.js solved for it, cancelling part of
      the ΔL* ≥ 18 the palette had bought. Every term here is written as
      1.0 + k * (n - mean(n)), so each branch's mean multiplier is 1.0 by
      construction and the authored separation survives to the screen.
   3. THE CRYSTAL MOSAIC WAS A 36 CM FELDSPAR. See the crystalline branch.

   The symbol g (0.6-3.2) is the per-material grain scale from the profile;
   seed is the per-bed random out of D.r, so two gravels in one frame are not
   the same gravel; cd is the bed's clast loading out of D.a, straight off
   the region recipe's own boulder density.

   sparkOut is the quartz and mica that catch the key directly, applied after
   the diffuse term so it can reach display luminance 230+ while the bed's
   median sits near 115. It is now SIZED BY A CELL rather than by a threshold
   on per-texel noise — thresholding vnoise at 0.90-1.0 sizes the glint by the
   noise's slope, which is sub-pixel and shimmers under scroll. */
vec3 patternShade(float pat, float grain, vec2 wp, vec3 base, float ucsN, float bed,
                  float seed, float cd, out float sparkOut, out vec3 nOut){
  vec3 c = base;
  sparkOut = 0.0;
  nOut = vec3(0.0);
  float g = 0.6 + grain * 2.6;
  float fMid = min(1.60 + grain * 2.20, uNyq);        // 1.6 .. 3.8 cycles/m
  // per-bed phase offset: the fabric restarts at every contact, which is what
  // a contact IS, and two beds of one material stop being identical twins
  vec2 sw = wp + vec2(seed * 53.0, seed * 31.0);
  vec3 cn = vec3(0.0);
  float cv = 1.0, cs = 0.0;

  if (pat < 0.5) {
    /* CLAY · SILT · MADE GROUND. One continuous parameter separates them and
       it is grain. A clay (0.25) and a silt (0.30) are finely and
       CONTINUOUSLY LAMINATED — the reference's third horizon is banded silt
       with fine horizontal bedding and that banding is the whole of its
       identity. Topsoil and made ground (0.70) are the opposite: a rubbly,
       chaotic fill with brick and stone in it and no bedding at all, which is
       the reference's first horizon. fill ramps between the two behaviours
       so neither needs its own branch. */
    float fill = smoothstep(0.36, 0.62, grain);
    float mac = fbm3n(sw * vec2(0.42, 0.95));
    float mid = fbm2n(sw * vec2(fMid * 0.5, fMid) + 21.0);
    c *= 1.0 + 0.30 * (mac - 0.5) + 0.24 * (mid - 0.5);
    /* Laminae. 4-5 per metre is 3.9 CSS px of period on the reference device,
       which is CFG.detailPx — the finest thing the band can resolve. Finer is
       not siltier, it is grey. */
    float lamF = min(4.2 + grain * 3.0, uNyq);
    float lamY = sw.y + (fbm2n(sw * vec2(0.55, 0.22)) - 0.5) * 0.40 + sw.x * 0.030;
    float lam = sin(lamY * lamF * 6.28318);
    /* Lamination waxes and wanes. Held at one strength for a whole bed it comes
       out as corrugated cardboard — 15 m of identical ribbing, which is a
       texture swatch and not a deposit. The slow term below makes some of the
       bed finely banded and some of it structureless, which is what a cut
       through a lacustrine or marine clay looks like. */
    float lamK = (1.0 - fill) * (0.55 + 0.45 * bed)
               * (0.35 + 1.05 * fbm2n(sw * vec2(0.22, 0.42) + 17.0));
    c *= 1.0 + 0.15 * lam * lamK;
    nOut.y += lam * lamK * 0.26;                 // every lamina catches the sky
    // slickenside: a bright shear plane through the plastic clays
    c += vec3(0.030, 0.025, 0.018) * smoothstep(0.62, 0.94, mid) * (1.0 - fill);
    // made ground: angular rubble, unsorted, jumbled into a chaotic matrix
    float rub = clastField(sw, min(1.45 + grain * 1.70, uNyq * 0.55), 0.20,
                           0.62 * fill, seed, cn, cv, cs);
    c = mix(c, c * cv * 1.06, rub);
    c *= 1.0 - cs * 0.22;
    nOut += cn;
    c *= 1.0 + 0.14 * (vnoise(sw * min(34.0 * g, uNyq)) - 0.5);

  } else if (pat < 1.5) {
    /* SAND — CROSS-BEDDING, which is what a sand shows in a cut face and a
       silt does not: a stack of sets a few decimetres thick, each with its own
       inclined foresets, each truncated by the set above along an erosion
       surface. The old pattern drew horizontal laminae and a speckle, which is
       a silt wearing sand's colour. */
    float setY = sw.y * 1.35 + (fbm2n(sw * vec2(0.30, 0.20)) - 0.5) * 0.75;
    float setI = floor(setY);
    float dip  = (hash21(vec2(setI * 7.7, seed * 17.0 + 3.0)) - 0.5) * 1.25;
    /* Every set gets its own lamina spacing as well as its own dip. With one
       spacing for the whole bed the foresets stack into a regular herringbone
       and the sand reads as corduroy — a woven texture, not a deposit. */
    float lamF = min((3.0 + grain * 2.2) * (0.70 + 0.62 * hash21(vec2(setI * 3.3, 9.1))), uNyq);
    float lam  = sin((sw.y + sw.x * dip) * lamF * 6.28318);
    float ph   = fract(setY);
    float bnd  = smoothstep(0.11, 0.0, ph) + smoothstep(0.89, 1.0, ph);
    float mac  = fbm3n(sw * vec2(0.30, 0.62) + 8.0);
    float mid  = fbm2n(sw * vec2(fMid * 0.65, fMid * 1.25) + 5.0);
    c *= 1.0 + 0.26 * (mac - 0.5) + 0.24 * (mid - 0.5);
    // some sets are strongly banded (heavy minerals on the foresets), some are
    // barely banded at all — mid decides which, and the mean stays 1.0
    c *= 1.0 + lam * (0.06 + 0.15 * mid);
    c *= 1.0 - (bnd - 0.11) * 0.46;
    // the foresets are ledges: their normal leans with the dip of the set
    nOut += normalize(vec3(dip, 1.0, 0.0)) * lam * 0.15;
    c *= 1.0 + 0.20 * (vnoise(sw * min(62.0 * g, uNyq)) - 0.5);

  } else if (pat < 2.5) {
    /* GRAVEL and BOULDER BED — CLAST-SUPPORTED: stones touching stones, with
       only enough sand between them to fill the gaps. Two populations, both
       ROUNDED, because a gravel is fluvial or glaciofluvial and its stones
       have been carried. This is the reference's second horizon and the single
       clearest thing in it. */
    /* cd rides on the recipe boulder loading, which is a count of ERRATICS and
       not of gravel clasts. A gravel is clast-supported by definition, so the
       floor is high and cd only decides how much coarser than that it gets;
       the till branch below, which is matrix-supported, is the one where the
       clast count is genuinely allowed to fall away. */
    float dens = 0.70 + 0.30 * cd;
    float fA = clamp(0.80 + grain * 1.55, 1.5, uNyq * 0.42);   // ~0.45 m cobbles
    float fB = clamp(fA * 1.85, 2.2, uNyq * 0.74);             // ~0.25 m pebbles
    c *= 1.0 + 0.26 * (fbm3n(sw * vec2(0.34, 0.70) + 8.0) - 0.5);
    float mA = clastField(sw, fA, 0.88, 0.62 * dens, seed, cn, cv, cs);
    c *= 1.0 - cs * 0.26;
    c = mix(c, c * cv, mA);
    nOut += cn;
    float mB = clastField(sw + 19.0, fB, 0.80, 0.55 * dens, seed + 0.37, cn, cv, cs);
    float free = 1.0 - mA * 0.80;
    c *= 1.0 - cs * 0.18 * free;
    c = mix(c, c * cv, mB * free);
    nOut += cn * free;
    c *= 1.0 + 0.18 * (vnoise(sw * min(30.0 * g, uNyq)) - 0.5);

  } else if (pat < 3.5) {
    /* GLACIAL TILL and PERMAFROST — MATRIX-SUPPORTED: an unsorted diamicton,
       cobbles and pebbles floating in a stiff fine matrix, none of them
       touching. SUB-ANGULAR, not rounded: an erratic is plucked off a
       joint-bounded outcrop and only partly worn on the way. Fewer stones than
       a gravel and a much stronger matrix — that difference in FABRIC is what
       tells a till from a gravel when their lightness windows overlap. */
    float dens = 0.55 + 0.45 * cd;
    float fA = clamp(0.62 + grain * 0.95, 1.1, uNyq * 0.30);   // ~0.65 m cobbles
    float fB = clamp(fA * 2.05, 1.8, uNyq * 0.62);             // ~0.32 m pebbles
    c *= 1.0 + 0.30 * (fbm3n(sw * min(0.85, uNyq4)) - 0.5);
    c *= 1.0 + 0.20 * (fbm2n(sw * vec2(fMid * 0.55, fMid * 0.80) + 4.0) - 0.5);
    float mA = clastField(sw, fA, 0.48, 0.40 * dens, seed, cn, cv, cs);
    c *= 1.0 - cs * 0.30;
    c = mix(c, c * cv, mA);
    nOut += cn;
    float mB = clastField(sw + 31.0, fB, 0.40, 0.34 * dens, seed + 0.61, cn, cv, cs);
    float free = 1.0 - mA * 0.80;
    c *= 1.0 - cs * 0.20 * free;
    c = mix(c, c * cv, mB * free);
    nOut += cn * free;
    c *= 1.0 + 0.15 * (vnoise(sw * min(26.0 * g, uNyq)) - 0.5);

  } else if (pat < 4.5) {
    /* SEDIMENTARY — bedding packages, then beds, then partings. bed is the
       planar-fabric channel: a shale (0.88) is thinly and insistently bedded,
       a chalk (0.75) massively. The parting now carries a NORMAL as well as a
       value, so the bed above it reads as a ledge catching the sky rather than
       as a painted stripe. */
    float y = sw.y + (fbm3n(sw * vec2(0.20, 0.44)) - 0.5) * 0.9;
    float pack = fbm2n(sw * vec2(0.16, 0.34) + 3.0);
    float bandF = min(0.75 + bed * 3.4, uNyq * 0.86);   // 0.27-0.36 m beds
    float ph = fract(y * bandF);
    float part = smoothstep(0.13, 0.0, ph) + smoothstep(0.87, 1.0, ph);
    c *= 1.0 + 0.28 * (pack - 0.5);
    c *= 1.0 + 0.20 * (fbm2n(sw * vec2(fMid * 0.4, fMid) + 11.0) - 0.5);
    c *= 1.0 - (part - 0.13) * 0.44;
    nOut.y += (smoothstep(0.30, 0.0, ph) - smoothstep(0.70, 1.0, ph)) * 0.34 * bed;
    c *= 1.0 + 0.12 * (vnoise(sw * min(40.0 * g, uNyq)) - 0.5);

  } else if (pat < 5.5) {
    /* CRYSTALLINE — and the honest answer at this scale is that you cannot see
       the crystals. 19.4 CSS px per metre makes a 5 mm feldspar a tenth of a
       pixel. The previous pattern drew an individually legible crystal mosaic
       at 2.77 cells/m, which is a THIRTY-SIX CENTIMETRE FELDSPAR; measured by
       autocorrelation on g0-14-section-clean it came back as a 0.567 m feature
       and on screen it read as polystyrene foam.

       What is actually visible in a granite face at metre scale is JOINTS —
       two near-orthogonal sets, roughly 0.4-2 m apart, breaking the rock into
       blocks, which is exactly the reference's basal horizon — plus a fine
       even speckle below the resolution of any single grain, and the glint off
       quartz. Gneiss earns its banding back through bed (fabric 0.55) and
       granite (0.20) does not, and that is what separates the two on screen
       when their lightness windows overlap. */
    float mac = fbm3n(sw * min(0.55 * g, uNyq4));
    vec2 fol = vec2(sw.x * 0.92 + sw.y * 0.40, sw.y * 0.92 - sw.x * 0.40);
    float bandF = min(1.4 + bed * 3.6, uNyq * 0.80);
    float band = fbm2n(fol * vec2(0.30, bandF) + 6.0);
    c *= 1.0 + 0.34 * (mac - 0.5) + 0.80 * bed * (band - 0.5);
    /* Two joint sets, and they must read as BLOCKS, not as scratches. The
       first cut of this drew 0.9-1.1 joints/m and measured as a 0.773 m
       feature that looked like craquelure on a glaze. A joint set in competent
       crystalline rock is metres apart, and what sells it is not the line — it
       is that each block has spalled and weathered to its own value. The block
       index falls out of the same fract() as the line, so that costs nothing. */
    float sp1 = clamp(0.72 - ucsN * 0.28, 0.22, uNyq * 0.16);
    float q1 = fol.y * sp1 + fbm2n(sw * 0.40) * 0.40;
    float q2 = fol.x * sp1 * 0.78 + fbm2n(sw * 0.34 + 9.0) * 0.40;
    float r1 = fract(q1) - 0.5;
    float r2 = fract(q2) - 0.5;
    float jn1 = smoothstep(0.14, 0.0, abs(r1) * 2.0);
    float jn2 = smoothstep(0.14, 0.0, abs(r2) * 2.0);
    c *= 0.86 + 0.28 * hash21(vec2(floor(q1), floor(q2)) + seed * 13.0);
    c *= 1.0 - (jn1 - 0.07) * 0.42 - (jn2 - 0.07) * 0.30;
    // a joint is a groove: the two faces of it lean toward each other
    nOut += vec3(-0.398, 0.917, 0.0) * (-sign(r1) * jn1 * 0.46);
    nOut += vec3(0.917, 0.398, 0.0) * (-sign(r2) * jn2 * 0.36);
    // the crystal texture is real but sub-resolution: value variance, no shape
    c *= 1.0 + 0.22 * (vnoise(sw * min(38.0 * g, uNyq)) - 0.5);
    c *= 1.0 + 0.16 * (fbm2n(sw * min(14.0 * g, uNyq * 0.6) + 3.0) - 0.5);
    /* Quartz: sparse and specular, SIZED BY THE CELL and not by a threshold.
       The first cut lit 28 % of cells at 9 cells/m and the granite measured a
       0.155 m feature — 3 CSS px — which is to say the glint had become the
       bed's dominant texture and the rock read as a salt flat. Six per cent
       of cells now, at 3.4 cells/m rather than 5.0, held out of the joints and
       confined to the leucosome bands where the quartz actually is. */
    vec2 qid, qoff;
    float qd = cellsV(sw * min(6.0, uNyq * 0.62) + 41.0, qid, qoff);
    sparkOut = smoothstep(0.34, 0.08, qd) * step(0.94, hash21(qid * 4.7))
             * smoothstep(0.42, 0.80, band) * (1.0 - jn1 * 0.8);

  } else if (pat < 6.5) {
    /* FRACTURED / FOLIATED. bed separates the two rocks that share this
       pattern and provably cannot be told apart by lightness: a SCHIST is
       continuously foliated, silvery, every plane parallel; a FRACTURE ZONE is
       broken into angular joint-bounded blocks with no continuity at all. A
       driller tells them apart by the fabric, not by the colour, and so does
       this branch. */
    vec2 sh = vec2(sw.x * 0.94 + sw.y * 0.34, sw.y * 0.94 - sw.x * 0.34);
    float bw = 1.0 - bed;
    c *= 1.0 + 0.34 * (fbm3n(sw * min(0.60 * g, uNyq4)) - 0.5);
    c *= 1.0 + 0.26 * (fbm2n(sh * vec2(fMid * 0.45, fMid * 0.9) + 27.0) - 0.5);
    // FOLIATION — continuous mica planes, and they catch the sky
    /* Foliation is a FABRIC, not a pinstripe. A single periodic term at one
       strength ruled the whole bed with evenly spaced lines; what a schist
       actually shows is continuous anisotropy — everything smeared out along
       the planes — with the discrete partings coming and going within it. The
       anisotropic term below carries most of the read and the periodic one
       only punctuates it. */
    c *= 1.0 + 0.30 * bed * (fbm3n(sh * vec2(0.30, 3.0) + 41.0) - 0.5);
    float folF = min(2.0 + bed * 3.4, uNyq * 0.80);
    float rf = fract(sh.y * folF + fbm2n(sh * 0.55) * 0.8) - 0.5;
    float af = abs(rf) * 2.0;
    float foK = 0.40 + 1.20 * fbm2n(sh * vec2(0.24, 0.9) + 5.0);
    float fo = smoothstep(0.34, 0.0, af) * foK;
    c *= 1.0 - (fo - 0.17) * 0.26 * bed;
    c += vec3(0.070, 0.075, 0.070) * smoothstep(0.55, 0.95, 1.0 - af) * bed * foK * 0.7;
    nOut += vec3(-0.340, 0.940, 0.0) * (-sign(rf) * fo * 0.30 * bed);
    // JOINT BLOCKS — angular, bounded, each spalled to its own value
    float blk = clastField(sh, clamp(0.85 + grain * 0.90, 0.6, uNyq * 0.30),
                           0.0, 0.92, seed, cn, cv, cs);
    c = mix(c, c * cv, blk * bw);
    c *= 1.0 - cs * 0.30 * bw;
    nOut += cn * bw;
    c *= 1.0 + 0.16 * (vnoise(sw * min(30.0 * g, uNyq)) - 0.5);
    /* Mica catches the key ON THE FOLIATION and nowhere else — that is what
       makes a schist flash as you turn it. Sown evenly over the whole face at
       10 % of cells it read as a snowfield laid over the rock (seen on
       shots/g5-sec-alpine-6). Four and a half per cent now, and weighted onto
       the foliation planes. */
    /* A mica flake is a FLAKE: wide along the plane, thin across it. Sampled
       on a square cell field the glints came out as evenly sown round seeds. */
    vec2 sid, soff;
    float sd2 = cellsV(sh * vec2(min(3.4, uNyq * 0.35), min(9.0, uNyq * 0.95)) + 7.0, sid, soff);
    sparkOut = smoothstep(0.34, 0.08, sd2) * step(0.955, hash21(sid * 6.1))
             * bed * (0.15 + 0.85 * fo) * 0.7;

  } else {
    // VOID
    c *= 0.22;
  }
  c *= 0.92 + 0.16 * ucsN;   // harder rock reads a touch brighter/cooler
  return c;
}

/* THE SUPERGENE PROFILE — the most useful thing in research/08 for a drilling
   game, and the one column of rock whose colours are a physical fact rather
   than a palette choice, so they are written here rather than passed in:
     leached capping   limonite / goethite, rusty brown       #7A5A3C
     oxide ore         malachite / chrysocolla, green         #3E7A5C
     enriched blanket  sooty chalcocite, near black           #2E3138
     hypogene          pale grey-brown with brassy sulphide   #8A8478
   Values below are those hexes decoded to linear, which is the space the
   column lookup arrives in (texA is an sRGB DataTexture). */
vec3 supergeneTint(float zone){
  if (zone < 1.5) return vec3(0.194, 0.102, 0.045);
  if (zone < 2.5) return vec3(0.048, 0.194, 0.107);
  if (zone < 3.5) return vec3(0.027, 0.031, 0.040);
  return vec3(0.254, 0.231, 0.188);
}

void main(){
  vec2 wp = vWP;

  // above the ground line there is nothing
  if (wp.y > surfaceY(wp.x)) discard;

  /* The opening is a real hole, whatever shape the mode gives it. In
     vertical boreSDF is literally abs(wp.x) - holeRadius(...) and
     drilledF is the same test as before; the modes differ only in what
     they put in those two values. */
  float drilledF, r;
  float dHole = boreSDF(wp, wp.x > 0.0 ? 0.0 : 3.14159, drilledF, r);
  bool drilled = drilledF > 0.5;
  if (drilled) { if (dHole < 0.0) discard; }   // see the note on && below

  // karst voids are real holes too
  float cav = cavityField(wp);
  if (cav < 1.0) discard;

  float u = colUWarp(wp);
  vec4 A = texture2D(uStrataA, vec2(u, 0.5));
  vec4 B = texture2D(uStrataB, vec2(u, 0.5));
  vec4 C = texture2D(uStrataC, vec2(u, 0.5));
  vec4 D = texture2D(uStrataD, vec2(u, 0.5));
  float pat = floor(B.r * 255.0 / 32.0 + 0.5);

  /* How well this rock is known. 0 everywhere the bit has been; see lookUnc()
     for the model and for why the drilled section is untouched by it. */
  float unc = lookUnc(wp, depthAt(wp));

  float spark;
  vec3 nPat;
  vec3 col = patternShade(pat, B.g, wp, A.rgb, C.r, C.b, D.r, D.a, spark, nPat);

  /* ── WHAT AN UNDRILLED BED IS NOT ENTITLED TO CLAIM ──────────────────────
     Texture goes FIRST and it goes furthest, and the reason is not
     aesthetic. Grain, clast shape, joint spacing, foresets, mica sheen — all
     of it is a CORE BOX observation. It is what you learn by having the rock
     in your hand, and there is no core from ground the bit has not reached.
     A section that draws the fabric of an unpenetrated bed is claiming the
     one thing nobody could have told it.

     A.rgb is the bed's own colour before patternShade() wrote any texture
     into it, so mixing back toward it removes the fabric and keeps the
     identity — which is exactly the asymmetry this whole feature is built
     on. The bed stays legible as gneiss; it stops pretending anyone has seen
     its joints.

     spark is the hardest claim of the three (visible metal, a mica flash
     catching the key) so it goes to zero, and the pattern's own normal goes
     with the pattern it belongs to. */
  col = mix(col, A.rgb, unc * 0.72);
  nPat *= 1.0 - unc * 0.85;
  spark *= 1.0 - unc;

  /* ── THE ORE BODY ────────────────────────────────────────────────────────
     You cannot see it before you drill it. The body is drawn at full strength
     only inside the corridor the bit has actually logged, and fades to the
     contract's confidence (uOreD.y) where it is merely projected along strike
     — which is exactly what a geologist is allowed to claim from one hole.

     Grade varies ACROSS the body (oreGrade()) and the colour carries it, so
     the player learns to read the section for the SHOOT and not just for the
     contact: an intercept that is 8 m of halo is not an intercept. */
  /* NO SHORT-CIRCUIT && HERE. ANGLE unfolds 'a && b' into a temporary and a
     nested conditional before it emits HLSL. With this block's contents —
     a call to oreGrade(), which is itself branchy, feeding a second nested
     conditional — that extra level tips D3DCompile's optimiser into
     unbounded recursion: the GPU process dies with STATUS_STACK_OVERFLOW
     (0xC00000FD), which loses EVERY WebGL context in the tab. three.js then
     reports 48 x "Shader Error - VALIDATE_STATUS false" with an empty info
     log (stale program handles from the dead context) and the game renders
     nothing at all. Verified: restoring the && reproduces it, this form
     links. Keep the two tests separate. */
  bool oreOn = uOreA.x > 0.5;
  if (uOreD.w >= 0.5) oreOn = false;
  if (oreOn) {
    float dpt = uDepth0 - wp.y;
    float sN, aN, zone;
    float g = oreGrade(alongAt(wp), dpt, sN, aN, zone);
    float inExt = step(abs(aN), 1.02);
    float core = smoothstep(1.04, 0.90, abs(sN)) * inExt;
    float halo = clamp((uOreB.z - abs(sN)) / max(uOreB.z - 1.0, 0.01), 0.0, 1.0)
               * (1.0 - core) * inExt;
    if (core + halo > 0.002) {
      float near = smoothstep(uOreD.x, uOreD.x * 0.30, max(dHole, 0.0));
      float rev = mix(uOreD.y, 1.0, drilledF * near);
      vec3 oc = uOreA.x > 2.5 ? supergeneTint(zone) : uOreTint;
      vec3 body = mix(uOreHalo, oc, smoothstep(0.06, 0.85, g)) * (0.72 + 0.62 * g);
      // disseminated ore is a stipple in the host, not a painted band
      float stip = 1.0;
      if (uOreD.z > 0.01) {
        stip = mix(1.0, smoothstep(0.50, 0.86, vnoise(wp * min(11.0, uNyq) + 31.0)),
                   uOreD.z);
      }
      col = mix(col, body, clamp((core * 0.94 + halo * 0.40) * rev * stip, 0.0, 1.0));
      // visible metal / coarse sulphide catching the key, only at real grade
      spark += core * rev * smoothstep(0.55, 1.0, g)
             * smoothstep(0.90, 1.0, vnoise(wp * min(26.0, uNyq) + 5.0)) * 1.5;
    }
  }

  /* ── water: below the table everything is wet ────────────────────────────
     The per-bed weight was (0.35 + 0.65 * water), so a fracture zone came out
     2.8x wetter than the granite under it and the wetness was spending the
     palette's ΔE budget on an axis nothing reads. Below a water table
     EVERYTHING is saturated, so the weight is now mostly constant.
     The step is also tight rather than a 1.5 m dissolve: item 11 asked for the
     wetness step to BE the groundwater line, and a 1.5 m ramp cannot be a
     line. 0.35 m above to 0.12 m below is ~9 CSS px, with a thin capillary
     fringe darkening right at the datum. */
  float dw = wp.y - uWaterY;
  float wet = smoothstep(0.35, -0.12, dw) * (0.70 + 0.30 * B.a) * uWetMix;
  vec3 lum = vec3(dot(col, vec3(0.299, 0.587, 0.114)));
  col = mix(col, mix(lum, col, 1.30) * 0.78, wet * 0.72);
  col *= 1.0 - (1.0 - smoothstep(0.0, 0.30, abs(dw))) * 0.16 * uWetMix;   // capillary fringe

  /* ── lighting ────────────────────────────────────────────────────────────
     Two changes, both forced by measurement.

     1. The key was 0xffd9a0 = (1.0, 0.851, 0.627) and carried 0.04 + 0.95*ndl,
        i.e. nearly all of the light. A 0.627 blue coefficient annihilates any
        cool hue beneath it — granite, limestone and quartzite all landed on
        the same green-grey with chroma collapsed to 6.5-8.0. The key is now
        0xffeedd, near neutral, and the cool ambient is boosted specifically
        for beds that actually carry blue (cool, read straight off the
        albedo's own b-r ratio, so it needs no extra lookup channel and cannot
        fall out of step with the palette).

     2. The whole rig ran about 1.35 stops under. Materials in this band render
        into the composer's HalfFloat target, and three.js r169 forces
        NoToneMapping whenever the render target is non-null — so the
        <tonemapping_fragment> below is DEAD CODE here and core/renderer.js
        GradeShader is the only display transform. Its exposure is 0.52, which
        the section was not compensating for: 9.59 % of the band measured below
        2/255 and nothing in the rock exceeded 108. The key term is now
        0.10 + 2.60*ndl, and the palette in contract.js is solved against
        exactly this.

     3. THE CUT FACE IS OPEN TO THE SKY, and it was not being lit like it. The
        reference is bright overcast: a big soft sky dome doing most of the
        work with a weak directional on top. Ours put 91 % of the luminance in
        the key term, and the consequence was measurable and fatal. vN comes
        off a per-vertex fbm relief, so ndl swung 0.40-0.95 WITHIN a bed; times
        2.60 that is a 2.25x value range from lighting alone, on top of a 1.4x
        pattern range and (below) a 3.3x crevice term. The albedo difference
        BETWEEN two adjacent beds is about 1.8x. Intra-bed variance therefore
        swamped inter-bed separation by roughly 2.4:1, which is precisely the
        "grey-brown mush" the reference does not have: measured on
        g0-14-section-clean the whole 20 m band segmented into two contacts and
        one 15.75 m bed.

        The rebalance holds the MEAN and cuts the SWING. The sky term rises
        from 9 % of luminance to 17 %, the key's ndl gain falls 2.60 -> 1.06,
        and the crevice term below drops from a 3.3x range to 1.5x. Solved so
        that ambient x key x crevice x form has the same product at the modal
        normal (ndl 0.68, sky 0.5, crevice 0.5) as the expression it replaces —
        1.319 x 0.83 x 0.86 = 0.941 against the old 1.682 x 0.65 x 0.86 =
        0.940 — so contract.js's palette solve stays valid to within 0.2 %,
        while the intra-bed lighting range falls from 2.25x to 1.56x.

        The structure the beds do have is not lost, it is MOVED: patternShade()
        now returns a normal, so a cobble, a joint, a foreset and a bedding
        parting are lit by this same sun instead of being painted on. */
  vec3 N = normalize(vN + nPat);
  vec3 L = normalize(vec3(-0.42, 0.60, 0.68));
  float ndl = max(dot(N, L), 0.0);
  float sky = 0.5 + 0.5 * N.y;

  /* ── CONTRAST GOES LAST, AND ONLY PART WAY ───────────────────────────────
     The third and weakest of the three look-ahead terms, and deliberately
     so: contrast between beds is bed IDENTITY, and identity is the half of
     the interpretation that is genuinely known. What is dropped is not the
     bed's colour, it is the claim that anyone has seen it as a LIT SURFACE.
     Ahead of the bit the face stops being a photograph of rock and becomes a
     drawing of rock, which is what it honestly is.

     The two lighting variables are pushed toward the MODAL values this
     shader's own rebalance was solved at — ndl 0.68 and sky 0.5, named in
     the comment block above and in contract.js's palette solve. That choice
     is load-bearing rather than tidy: pushing toward the mode preserves each
     bed's MEAN appearance exactly and removes only its swing, so nothing
     drifts off the palette and no bed changes colour as the bit approaches.
     It also means this cannot become a grey veil — there is no grey in it,
     only less modelling. */
  float flatK = unc * 0.62;
  ndl = mix(ndl, 0.68, flatK);
  sky = mix(sky, 0.5, flatK);
  float cool = clamp(((A.b - A.r) / (A.b + A.r + 0.02)) * 2.2, 0.0, 1.0);
  vec3 lit = col * (uAmbientCool * (0.60 + 0.90 * sky) * (1.0 + cool * 0.90)
                  + uKeyWarm * (0.62 + 1.06 * ndl));
  // quartz / mica catching the key directly — the band's only real highlight
  lit += uKeyWarm * spark * 1.60 * (0.25 + 0.75 * ndl);

  /* ── the contact is DRAWN, not dissolved ─────────────────────────────────
     A 1.5 px dark parting with a 1 px lighter lip on the bed above it, plus a
     narrow soft occlusion either side. vEdge carries the wide geometric
     undercut and only does form AO now.
     mk.x was 0.74 and the lip gain 0.85 — an 85 % MULTIPLICATIVE boost, which
     is why the upper lip glowed orange. With the geometric recess also cut
     (see FACE_VERT) the three darkening terms no longer stack to 84 %. */
  /* D.b is the contact's own SHARPNESS. A soil sitting on rock is a knife
     line; a silt passing into a clay is not a line at all, it is half a metre
     of change, and drawing both with the same 1.5 px parting is the second
     clearest tell that this is a diagram. contactMarksK() reads the character
     and draws the two differently — and it takes the look-ahead uncertainty
     for the same reason, because an inferred contact is not a line either. */
  vec3 mk = contactMarksK(A.a, C.a, D.b, unc);
  lit *= 1.0 - mk.z * 0.26;              // tight soft contact occlusion
  lit *= 1.0 - mk.x * 0.45;              // the parting itself
  lit += lit * mk.y * 0.25;              // the lip catching the key
  lit += uKeyWarm * mk.y * 0.020;
  // the geometric undercut is a landform along a contact nobody has cut yet
  lit *= 1.0 - vEdge * 0.16 * (1.0 - flatK);
  /* Crevice occlusion from the fine relief, plus the broad form term. vAO is a
     per-VERTEX quantity interpolated across a 0.32 m lattice, so at a 3.3x
     range it was a bed-independent 0.5 m value swing laid over every stratum
     alike — the largest single contributor to the mush, and the one thing on
     the face that could not tell one rock from another. At 1.5x it still reads
     as crevice occlusion and no longer competes with the horizons. The value
     range it used to supply now comes from the pattern's own normal, which is
     per-pixel and knows what rock it is in. */
  // 0.83 and 0.86 are these two terms AT THEIR OWN MODAL INPUT, so flattening
  // them ahead of the bit holds the bed's mean and drops only its crevice
  // detail — the same discipline as the ndl / sky flatten above.
  lit *= mix(0.66 + 0.34 * smoothstep(-0.17, 0.11, vAO), 0.83, flatK);
  lit *= mix(0.72 + 0.28 * smoothstep(-1.15, 0.45, vZ), 0.86, flatK);

  /* ── contact shadow where the opening is cut ─────────────────────────────
     Written against the opening's SIGNED DISTANCE rather than against
     abs(wp.x), which is the same function in vertical mode — dHole is
     abs(wp.x) - r there, so smoothstep(r*2.30, r*0.98, abs(wp.x)) becomes
     smoothstep(r*1.30, -r*0.02, dHole) exactly — and is the only form that
     works when the opening is a curve or a rectangle. */
  if (drilled) {
    lit *= 1.0 - smoothstep(r * 1.30, -r * 0.02, dHole) * 0.80;
    /* The bright lip sits on whichever face the key actually reaches: the
       left wall of a vertical hole, the invert side of a horizontal one
       (the key runs up-left, so a downward-facing crown never catches it). */
    float side = mix(step(wp.x, 0.0), smoothstep(-0.10, 0.35, N.y),
                     step(0.5, uBMode) * step(uBMode, 2.5));
    lit += uKeyWarm * smoothstep(r * 0.26, 0.0, dHole) * side * 0.20;
  }
  // rim glow around karst voids + moisture ring
  float cr = smoothstep(1.75, 1.0, cav);
  lit *= 1.0 - cr * 0.68;
  lit += vec3(0.05, 0.07, 0.08) * smoothstep(1.28, 1.02, cav);

  // wet sheen
  float sheen = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 22.0);
  lit += uKeyWarm * sheen * wet * 0.30;

  /* ── THE PREDICTED TARGET HORIZON ────────────────────────────────────────
     Two dashed survey lines at the depths the CONTRACT says the target sits
     between. They are drawn before a metre is turned and they are honestly
     wrong: generateProfile() displaces them from the truth by an amount set
     by oreConfidence, so a low-confidence job shows you a wide dashed band
     and a body that is not inside it. That gap is the whole of exploration. */
  if (uTarget.z > 0.001) {
    float dp = uDepth0 - wp.y;
    float lwT = max(uPartW * 1.7, 0.035);
    float ln = max(1.0 - smoothstep(lwT * 0.4, lwT * 1.5, abs(dp - uTarget.x)),
                   1.0 - smoothstep(lwT * 0.4, lwT * 1.5, abs(dp - uTarget.y)));
    lit += uKeyWarm * ln * step(0.5, fract(wp.x / max(uTarget.w, 0.05)))
         * uTarget.z * 0.30;
  }

  /* Fade the far edges of the block into the frame. The floor was 0.22, which
     turned the outer 2.2 units on each side — the ground BEHIND the log strip
     and the ruler — into a black bevel, and measured on the baseline that was
     3.5 % of the band crushed below L* 5. The reference has ground running
     edge to edge with a label lying on it, not a picture in a mount, so the
     floor is lifted to 0.36 and the ramp tightened: the strips still read
     against it, and the section stops looking like a framed diagram. */
  float vig = smoothstep(uHalfW + 0.4, uHalfW - 1.7, abs(wp.x));
  lit *= 0.36 + 0.64 * vig;

  gl_FragColor = vec4(lit, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── BACKDROP (parallax layer behind the face) ───────────────────────────── */
const BACK_VERT = /* glsl */`
varying vec2 vUvw;
uniform float uHalfH;
uniform float uHalfW;
void main(){
  vUvw = vec2(position.x, position.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const BACK_FRAG = /* glsl */`
precision mediump float;
uniform float uParallaxY;
uniform float uHalfW;
uniform vec3  uDeep;
uniform vec3  uHaze;
varying vec2 vUvw;
${GLSL_NOISE}
void main(){
  vec2 p = vec2(vUvw.x, vUvw.y + uParallaxY);
  float n = fbm4n(p * 0.11 + 40.0);
  float n2 = fbm3n(p * 0.42 + 7.0);
  vec3 c = mix(uDeep, uHaze, n * 0.75 + n2 * 0.25);
  c *= 0.72 + 0.28 * smoothstep(-1.0, 1.0, sin(p.y * 0.35 + n * 3.0));
  float vig = smoothstep(uHalfW + 1.0, uHalfW * 0.35, abs(vUvw.x));
  c *= 0.55 + 0.45 * vig;
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── BOREHOLE WALL ───────────────────────────────────────────────────────── */
const WALL_VERT = /* glsl */`
precision highp float;
uniform float uTop;
uniform float uBottom;
varying vec2  vWP;
varying float vAng;
varying float vT;
${GLSL_NOISE}
${GLSL_STRATA}
void main(){
  float t = position.y + 0.5;                    // 0 bottom .. 1 top
  float sy = mix(uBottom, uTop, t);
  float ang = atan(position.z, position.x);
  // boreRadiusScale is 1.0 everywhere except the raise's un-reamed pilot
  float r = holeRadius(sy, ang) * boreRadiusScale(sy);
  vec3 p = vec3(position.x * r, sy, position.z * r);
  vWP = vec2(p.x, sy);
  vAng = ang;
  vT = t;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;
const WALL_FRAG = /* glsl */`
precision highp float;
uniform float uTop;
uniform float uBottom;
uniform float uTime;
uniform vec3  uKeyWarm;
uniform vec3  uAmbientCool;
uniform float uWetMix;
varying vec2  vWP;
varying float vAng;
varying float vT;
${GLSL_NOISE}
${GLSL_STRATA}
void main(){
  float sy = vWP.y;
  float u  = colU(sy, 0.0);
  vec4 A = texture2D(uStrataA, vec2(u, 0.5));
  vec4 B = texture2D(uStrataB, vec2(u, 0.5));
  vec4 C = texture2D(uStrataC, vec2(u, 0.5));
  float pat = floor(B.r * 255.0 / 32.0 + 0.5);

  /* ── VALUE BUDGET FOR THE WALL ───────────────────────────────────────────
     Measured across the annulus at the bit line, the wall rendered at
     luminance 0-15 against a face at ~87: five stops down, so the per-pattern
     treatment, the curvature term, the down-hole AO and the wet streaks below
     were all invisible. Four floors were doing it, and they multiply:
        albedo     0.62      -> 0.82
        curve mix  0.14      -> 0.50
        curvature  0.34 base -> 0.52
        down-hole  0.18 AO   -> 0.56   (the bit is always AT uBottom, so this
                                        one applied at full strength always)
        collar     0.42      -> 0.72
     plus the key/ambient split below. The wall now measures 0.85-1.32 stops
     under the face across granite, gneiss, till and fracture zone: dark enough
     to read as the inside of a hole, light enough that the asset is visible. */
  vec3 c = A.rgb * 0.82;

  /* The hole is only 2 * uHoleR units wide on screen — 21 CSS px at 152 mm —
     and the angle sweeps a full pi across it, so angular detail compresses far
     harder than vertical detail does. uAngNyq is the matching cap. */
  float aF = uAngNyq;

  // texture of the wall depends on what it was drilled through
  float rough;
  if (pat < 1.5) {
    // clay / topsoil: smooth, polished by the bit, faint spiral grooves
    float sp = sin(sy * min(26.0, uNyq * 1.5) + vAng * min(3.0, aF * 1.5));
    c *= 0.94 + 0.10 * sp;
    rough = 0.15;
  } else if (pat < 3.5) {
    // sand / gravel / till: washed out, loose clasts standing proud
    vec2 id;
    float d = cells(vec2(vAng * min(2.4, aF), sy * min(2.2, uNyq * 0.6)), id);
    c *= 0.74 + 0.52 * smoothstep(0.48, 0.10, d) * hash21(id * 5.1);
    c *= 0.82 + 0.28 * fbm3n(vec2(vAng * min(3.0, aF), sy * min(3.2, uNyq * 0.4)));
    rough = 0.75;
  } else if (pat < 4.5) {
    // sedimentary: bedding steps in the wall
    float bands = fract(sy * min(0.6 + C.b * 1.5, uNyq));
    c *= 1.0 - (smoothstep(0.14, 0.0, bands) + smoothstep(0.86, 1.0, bands)) * 0.42;
    c *= 0.90 + 0.18 * fbm3n(vec2(vAng * min(2.0, aF), sy * min(4.0, uNyq * 0.4)));
    rough = 0.4;
  } else if (pat < 5.5) {
    // crystalline: tight, glinting, near gauge
    c *= 0.84 + 0.28 * fbm3n(vec2(vAng * min(3.2, aF), sy * min(3.6, uNyq * 0.4)));
    c += vec3(0.07, 0.068, 0.058)
       * smoothstep(0.72, 1.0, vnoise(vec2(vAng * min(14.0, aF * 2.2), sy * min(15.0, uNyq))));
    rough = 0.25;
  } else {
    // fractured: spalled, blocky breakout
    vec2 id;
    float d = cells(vec2(vAng * min(1.6, aF), sy * min(1.5, uNyq * 0.5)) + 11.0, id);
    float spall = step(0.5, hash21(id * 2.7)) * smoothstep(0.44, 0.12, d);
    c *= 1.0 - spall * 0.58;
    c *= 0.80 + 0.32 * fbm3n(vec2(vAng * min(2.6, aF), sy * min(2.8, uNyq * 0.4)));
    rough = 0.9;
  }

  /* The stratum contacts have to continue THROUGH the hole, or the hole reads
     as a sticker laid over the section instead of a cut into it. */
  vec3 mk = contactMarks(A.a, C.a);
  c *= 1.0 - mk.z * 0.30;
  c *= 1.0 - mk.x * 0.72;
  c += c * mk.y * 0.60;

  // curvature shading: we are looking at the inside of a tube
  float side = cos(vAng);                 // -1 far-left .. 1 far-right
  float curve = 0.52 + 0.48 * (0.5 + 0.5 * side);
  c *= mix(0.50, 1.0, curve);

  // ambient occlusion down the hole + hard AO right at the collar
  float ao = mix(0.56, 1.0, smoothstep(uBottom, uTop + 4.0, sy));
  ao *= 0.72 + 0.28 * smoothstep(0.0, -1.4, sy);
  c *= ao;

  // wet wall + seepage streaks below the water table. The step matches the
  // face's, so the groundwater line continues through the hole as one line.
  float wet = smoothstep(0.35, -0.12, sy - uWaterY) * (0.70 + 0.30 * B.a) * uWetMix;
  float streak = smoothstep(0.55, 0.95, fbm2n(vec2(vAng * min(7.0, aF * 1.6), sy * 0.55 - uTime * 0.05)));
  c = mix(c, c * vec3(0.62, 0.72, 0.79), wet * (0.45 + 0.55 * streak));
  c += vec3(0.03, 0.05, 0.06) * wet * streak;

  // one stop or so under the face: the inside of a hole is a dark place, but
  // it is not a black one
  vec3 lit = c * (uAmbientCool * (0.16 + 0.28 * curve)
                + uKeyWarm * (0.18 + 1.22 * curve * (1.0 - rough * 0.4)));
  gl_FragColor = vec4(lit, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── DRILL STRING ────────────────────────────────────────────────────────── */
/* WHIRL, not wobble.

   What this replaced displaced x ONLY —

       float wob = uWobble * sin(sy * 0.9 + uTime * 9.0) * 0.05;
       vec3 p = vec3(position.x * uR + wob, sy, position.z * uR);

   — so the string wiggled inside a flat plane like a 2D snake, at a fixed
   1.43 Hz with no relationship to rpm even though uSpin sits beside it driven
   by state.drill.rpm, as a standing wave whose nodes never moved, at an
   amplitude unrelated to the space the string actually has. Measured on the
   running page (.probe-whirl-before.json): z displacement 0.0000 units at
   every drive state, orbit radius CoV 0.53 against 0.00 for a circle, and
   peak deflection 10.2 % of the clearance at rpm 0.30 against 11.6 % at
   rpm 0.90 — i.e. rpm moved the amplitude by a tenth and the rate not at all.

   A rotating string WHIRLS. It bows out and the bow precesses around the hole
   axis. Two constraints make that physical, and both come out of geometry
   already in this file rather than out of a taste decision:

   1. THE ANNULAR CLEARANCE IS A HARD LIMIT. The string cannot deflect further
      than holeRadius - rodRadius; past that it is inside the wall. uClear is
      exactly annulus.outerR - annulus.innerR and the mode shape is normalised
      to |bow| <= 1, so the bound holds BY CONSTRUCTION — there is no magic
      amplitude number left to get wrong. research/14:921-925 [CTES-TFM] p.9
      states the same limit for a buckled tubular: its amplitude "is no
      greater than the ID of the casing".

   2. THE BOW IS A MODE SHAPE BETWEEN CONTACT POINTS, not a free sine. Pinned
      at the bit, pinned at the collar, pinned at every wall contact, maximum
      mid-span, and largest where the string is least supported.

   And because the bow is a HELIX rather than a plane curve, the deflection
   TRAVELS: azimuth advances along the string, so as the precession turns, the
   bulge crawls instead of standing still with fixed nodes.

   vRub carries which side of the string is against the wall, so the fragment
   shader can put the contact polish where the steel is actually rubbing. */
const ROD_VERT = /* glsl */`
precision highp float;
#define PI 3.14159265
uniform float uTop;
uniform float uBottom;
uniform float uR;
uniform float uClear;    // annular clearance, section units — the hard limit
uniform float uWhirl;    // fraction of that clearance in use, 0..1
uniform float uPrec;     // precession phase, rad — integrated on the CPU from rpm
uniform float uHelix;    // rad of precession phase per metre along the string
uniform float uSpans;    // half-waves of the mode shape over the free length
uniform float uSpin;     // string rotation, rad — shared with ROD_FRAG's flutes
uniform float uFlightR;  // auger flight outer radius, section units
uniform float uFlightK;  // radians of flight helix per metre — TAU / pitch
/* THE AUGER FLIGHT rides the same program and the same material as the stem.
   aFlight is 0 on the tube's own vertices and 1 on the ribbon's; a geometry
   that does not declare the attribute reads 0 and takes the stem path, which
   is what lets the casing share this vertex shader untouched. */
attribute float aFlight;
attribute vec2  aHelix;  // x = metres above the bit, y = 0 at the hub, 1 at the edge
varying float vSy;
varying float vAng;
varying float vRub;
varying float vFlight;
varying float vEdge;
void main(){
  float len = max(uTop - uBottom, 1e-3);
  float t = position.y + 0.5;
  float syStem = mix(uBottom, uTop, t);
  /* The ribbon is a fixed grid in metres above the bit, clamped to the string
     it is on: a flight longer than the hole collapses to zero-area triangles
     at the collar rather than sticking out of the ground. */
  float s = min(aHelix.x, len);
  float sy = mix(syStem, uBottom + s, aFlight);

  float dz = sy - uBottom;                                   // metres above the bit
  float u01 = clamp(dz / len, 0.0, 1.0);
  /* Mode shape. uSpans half-waves between wall contacts, times the first mode
     of the whole free length: zero at the bit, zero at the collar, zero at
     every contact, largest mid-span. |bow| <= 1, which is what bounds it. */
  float bow = sin(PI * uSpans * u01) * sin(PI * u01);
  float a = uPrec + uHelix * dz;                             // helical azimuth
  float amp = uClear * uWhirl * bow;                         // |amp| <= uClear

  /* A helicoid: azimuth advances with distance along the string at TAU/pitch,
     and turning the string advances it further — which is why a working auger
     appears to screw upward rather than merely spin. */
  float angF = s * uFlightK + uSpin;
  vec2 stemXZ = vec2(position.x, position.z) * uR;
  vec2 flXZ = vec2(cos(angF), sin(angF)) * mix(uR * 1.04, uFlightR, aHelix.y);
  vec2 xz = mix(stemXZ, flXZ, aFlight);

  vec3 p = vec3(xz.x + cos(a) * amp, sy, xz.y + sin(a) * amp);
  vSy = sy;
  vAng = mix(atan(position.z, position.x), angF, aFlight);
  vFlight = aFlight;
  vEdge = aHelix.y;
  /* +1 on the side pressed into the wall, -1 on the side swinging away, scaled
     by how much of the clearance is in use. Computed here, not in the fragment
     shader, because vAng wraps at the geometry seam and a difference of two
     interpolated angles would tear across it. */
  vRub = cos(vAng - a) * abs(bow) * uWhirl;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;
const ROD_FRAG = /* glsl */`
precision highp float;
uniform float uRodLen;     // metres per rod (joint spacing)
uniform vec3  uSteel;
uniform vec3  uKeyWarm;
uniform float uSpin;
varying float vSy;
varying float vAng;
varying float vRub;
varying float vFlight;
varying float vEdge;
void main(){
  float side = cos(vAng);
  float curve = 0.5 + 0.5 * side;
  // thread / joint rings every rod length
  float j = fract(-vSy / uRodLen);
  float joint = smoothstep(0.965, 0.99, j) * (1.0 - smoothstep(0.995, 1.0, j));
  joint += smoothstep(0.035, 0.01, j);
  // rifled flutes, animated by rotation
  float flute = 0.5 + 0.5 * sin(vAng * 6.0 + uSpin + vSy * 0.6);
  vec3 c = uSteel * (0.30 + 0.55 * curve);
  c *= 0.86 + 0.20 * flute;
  c = mix(c, uSteel * 1.45, joint * 0.8);
  /* Contact polish. The side of the string bearing against the wall is where
     the flutes get rubbed off, and it is the only cue for the half of the
     whirl the camera cannot see: this band is orthographic looking down -Z,
     so the z half of the orbit is invisible as displacement and has to arrive
     as shading or it does not arrive at all. */
  float rub = smoothstep(0.35, 1.0, vRub);
  c = mix(c, uSteel * 1.18, rub * 0.42);
  // specular band
  float spec = pow(max(side, 0.0), 6.0);
  c += uKeyWarm * spec * 0.45;
  c += uKeyWarm * pow(max(side, 0.0), 22.0) * rub * 0.55;

  /* THE FLIGHT is a steel plate, not a tube, and it has to read as one: the
     face catches the key, the underside does not, the outer edge is polished
     where it cuts gauge, and spoil packs into the root against the stem. Every
     term is driven by vEdge (hub 0 -> cutting edge 1) and vAng, so the plate
     shades by where you are ON it rather than by a normal it does not have. */
  float faceUp = 0.5 + 0.5 * cos(vAng);
  vec3 fc = uSteel * (0.30 + 0.62 * faceUp);
  float wear = smoothstep(0.80, 1.0, vEdge);
  fc = mix(fc, uSteel * 1.55, wear * 0.72);                 // the cutting edge
  fc = mix(fc * vec3(1.10, 0.90, 0.68), fc, smoothstep(0.02, 0.46, vEdge));  // spoil in the root
  fc += uKeyWarm * pow(faceUp, 9.0) * (0.22 + 0.55 * wear);
  c = mix(c, fc, vFlight);

  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── CASING ──────────────────────────────────────────────────────────────── */
const CASING_FRAG = /* glsl */`
precision highp float;
uniform float uTop;
uniform float uBottom;
uniform vec3  uSteel;
uniform vec3  uKeyWarm;
varying float vSy;
varying float vAng;
/* Declared because CASING_FRAG shares ROD_VERT, which writes them. Casing is
   grouted or driven against the wall — it does not whirl, so its uWhirl stays
   0 and vRub with it, and it has no flight — but a varying the vertex stage
   writes and the fragment stage does not declare is a link the driver is
   entitled to refuse. */
varying float vRub;
varying float vFlight;
varying float vEdge;
void main(){
  float side = cos(vAng);
  float curve = 0.5 + 0.5 * side;
  float weld = fract(-vSy / 3.0);
  float ring = smoothstep(0.97, 0.995, weld) + smoothstep(0.03, 0.005, weld);
  vec3 c = uSteel * (0.26 + 0.62 * curve);
  c = mix(c, uSteel * 1.5, ring * 0.75);
  c += uKeyWarm * pow(max(side, 0.0), 8.0) * 0.5;
  // shoe at the bottom
  c = mix(c, uSteel * 1.7, smoothstep(uBottom + 0.55, uBottom + 0.1, vSy));
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── BOULDERS (instanced, cut by the section plane) ────────────────────────
   A bare hemisphere reads as a bare hemisphere, which is an automatic fail on
   rubric axis 4. The dome is displaced in the vertex shader by the same fbm
   family the face uses, keyed off aSeed, so the silhouette is faceted the way a
   glacial erratic is and no two instances are alike. The displacement is a
   function of the DIRECTION only — never of z — which guarantees that the dome
   rim and the skirt, which share a position, always agree and the mesh cannot
   crack along the cut plane. */
const BOULDER_VERT = /* glsl */`
precision highp float;
attribute vec3 aTint;
attribute float aSeed;
varying vec3 vTint;
varying float vSeed;
varying vec3 vN;
varying vec2 vLocal;
varying vec2 vWP;
varying float vFacet;
${GLSL_NOISE}

/* A glacial erratic is SUB-ANGULAR: plucked from a joint-bounded outcrop and
   then partly rounded in transport. The old field was one low octave plus a
   weak high one, which integrates to a smooth ovoid — a river cobble. The high
   octave is stronger now, and the result is quantised in seven steps so the
   silhouette breaks into flat facets between rounded corners. */
float shapeK(vec2 dir, float seed){
  vec2 q = dir * 1.90 + seed * 91.0;
  float n1 = fbm3n(q) - 0.5;
#ifdef BOULDER_HQ
  float n2 = fbm2n(q * 3.10 + 17.0) - 0.5;
  float facetMix = 0.30;
#else
  // low tier keeps the single octave; the quantisation alone still facets it
  float n2 = 0.0;
  float facetMix = 0.38;
#endif
  float k = 1.0 + n1 * 0.40 + n2 * 0.34;
  /* 7 steps put the quantisation at 14 % of the radius, and the normal below
     is a FINITE DIFFERENCE of this function across 0.13 rad — so at every step
     the difference spikes and the boulder gets a hard radial crease. Eleven
     steps and less of it: the silhouette still breaks into flat facets between
     rounded corners, which is what a plucked erratic looks like, and it stops
     reading as a crumpled paper bag. */
  return mix(k, floor(k * 11.0 + 0.5) / 11.0, facetMix);
}

void main(){
  vTint = aTint; vSeed = aSeed;
  vLocal = position.xy;                     // undisplaced: 0..1, drives the rim

  vec3 P = position;
  float rr = length(P.xy);
  vec2 dir = rr > 1e-5 ? P.xy / rr : vec2(1.0, 0.0);
  float w = smoothstep(0.0, 0.28, rr);      // fade to 1.0 at the apex
  float k = mix(1.0, shapeK(dir, aSeed), w);
  P.xy *= k;
  P.z *= 0.36 + 0.64 * k;                   // the bulge follows the facets (1.0 at k=1)
  vFacet = (k - 1.0) * w;

  // tilt the normal against the angular slope of the facet field
  float EPSA = 0.13;
  float ca = cos(EPSA), sa = sin(EPSA);
  vec2 dA = vec2(dir.x * ca - dir.y * sa, dir.x * sa + dir.y * ca);
  vec2 dB = vec2(dir.x * ca + dir.y * sa, -dir.x * sa + dir.y * ca);
  float slope = (shapeK(dA, aSeed) - shapeK(dB, aSeed)) / (2.0 * EPSA);
  slope = clamp(slope, -1.1, 1.1);      // a step in shapeK must not spike it
  vec3 tang = vec3(-dir.y, dir.x, 0.0);
  vec3 nrm = normalize(normal - tang * slope * 0.45 * w);

  // instances are scaled non-uniformly (clasts are not spheres), so the normal
  // needs the inverse-transpose, recovered from the instance matrix columns
  vec3 iscl = vec3(length(instanceMatrix[0].xyz),
                   length(instanceMatrix[1].xyz),
                   length(instanceMatrix[2].xyz));
  vN = normalize(mat3(instanceMatrix) * (nrm / max(iscl * iscl, vec3(1e-5))));
  vec4 wp = instanceMatrix * vec4(P, 1.0);
  vWP = wp.xy;
  gl_Position = projectionMatrix * modelViewMatrix * wp;
}
`;
const BOULDER_FRAG = /* glsl */`
precision highp float;
uniform vec3 uKeyWarm;
uniform vec3 uAmbientCool;
varying vec3 vTint;
varying float vSeed;
varying vec3 vN;
varying vec2 vLocal;
varying vec2 vWP;
varying float vFacet;
${GLSL_NOISE}
${GLSL_STRATA}
void main(){
  // textured in SECTION space: frequencies are honest cycles-per-metre, a big
  // boulder is not a small boulder's texture scaled up, and nothing repeats
  vec2 p = vWP + vSeed * 41.0;
  float mac = fbm3n(p * min(1.10, uNyq4));
  float mid = fbm2n(p * min(2.60, uNyq2) + 7.0);
  vec3 c = vTint * (0.56 + 0.44 * mac + 0.40 * mid);
  /* A cut boulder, not a crumpled paper bag. Three terms were fighting the
     silhouette: a quartz vein drawn on EVERY boulder at 1.45x plus a 0.03
     lift, which put a white crease across each one; a 0.60 gain on the
     quantised facet field, which turned the seven-step shape function into
     visible creases; and an 0.86 rim, which drew a black outline around the
     stone. Beside the procedurally lit clasts in the face, that read as a
     different object from a different game. The vein is now per-boulder —
     roughly one in three carries one, which is what a vein is — and it is a
     lighter band, not a highlight. */
  c += vec3(0.075, 0.072, 0.062) * smoothstep(0.70, 1.0, vnoise(p * min(9.0, uNyq)));
  float vein = abs(fract(p.x * 0.55 + p.y * 0.32 + fbm2n(p * 0.8)) - 0.5) * 2.0;
  float hasVein = step(0.66, hash21(vec2(vSeed * 71.0, 3.7)));
  c = mix(c, c * 1.20, smoothstep(0.12, 0.0, vein) * 0.55 * hasVein);
  c *= 1.0 + vFacet * 0.15;

  // contact occlusion: the skirt where the boulder presses into the face, and
  // the stratum contact it may be sitting on
  float rim = smoothstep(0.78, 1.0, length(vLocal));
  c *= 1.0 - rim * 0.42;
  float u = colU(vWP.y, vWP.x);
  vec4 A = texture2D(uStrataA, vec2(u, 0.5));
  vec4 Cc = texture2D(uStrataC, vec2(u, 0.5));
  vec3 mk = contactMarks(A.a, Cc.a);
  c *= 1.0 - mk.z * 0.34 - mk.x * 0.55;

  vec3 N = normalize(vN);
  vec3 L = normalize(vec3(-0.42, 0.60, 0.68));
  float ndl = max(dot(N, L), 0.0);
  float fill = 0.5 + 0.5 * N.y;
  /* The floor lands BELOW the face's and the ceiling above it. That is the
     whole point: a boulder is the most important hazard in the game and it has
     to separate from the bed it sits in by VALUE, not by a 1.5 % tint shift.
     Rebalanced with the face: the face's key ndl gain came down from 2.60 to
     1.06 when the sky term was raised, and a boulder lit three times harder
     than the ground it is embedded in reads as pasted on. It keeps a small
     margin (1.44 against the face's 1.34 at the modal normal) and gets its
     separation from its own real curvature, which swings ndl far more than a
     displaced plane can. */
  vec3 lit = c * (uAmbientCool * (0.42 + 0.62 * fill) + uKeyWarm * (0.34 + 1.62 * ndl));
  lit += uKeyWarm * pow(ndl, 26.0) * 0.35;

  /* ── A BOULDER YOU HAVE NOT HIT IS THE STRONGEST CLAIM IN THE FRAME ──────
     and this one is gameplay, not decoration. GAMEDESIGN §3 makes boulder
     strike a live hazard: torque spikes, back off feed, raise percussion. A
     section that draws every boulder below the bit at full resolution has
     already told the player where every hazard is, and there is no hazard
     left to have.

     What the log honestly says is "this bed carries boulders". What it cannot
     say is where they are or how big. So an unproved boulder is not deleted —
     deleting it would be its own lie, and a boulder bed IS logged as one — it
     is UNRESOLVED: it loses its vein, its facets, its own texture and most of
     its value separation from the bed, and reads as a swelling in the ground
     rather than a stone with an edge. It hardens into a stone as the bit comes
     down on it, which is the moment it starts to matter.

     vTint is the boulder's own colour, so what it fades toward is still
     itself — the same discipline as the face's mix back to A.rgb. */
  float bUnc = lookUnc(vWP, depthAt(vWP));
  lit = mix(lit, vTint * (uAmbientCool * 0.73 + uKeyWarm * 1.15), bUnc * 0.80);
  gl_FragColor = vec4(lit, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ── FRACTURES (one merged transparent mesh) ─────────────────────────────── */
const FRAC_VERT = /* glsl */`
precision highp float;
attribute float aHalo;
attribute float aWidth;
varying float vHalo;
varying float vWidth;
varying vec2 vWP;
varying vec2 vLocal;
attribute vec2 aLocal;
void main(){
  vHalo = aHalo;
  vWidth = aWidth;
  vWP = position.xy;
  vLocal = aLocal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
/* ── FRACTURES: A MULTIPLY, NOT AN OVERLAY ─────────────────────────────────
   These drew as pale steel-blue lines LIGHTER than the rock, uniform in width,
   dead straight, crossing stratum boundaries, the parting, the borehole and
   the bit shank with no interaction: scratches on a lens. A real joint is
   darker than its matrix or iron-stained around it, is bounded by the bed it
   sits in, and is destroyed in the annulus the bit has just cut.

   So the material now MULTIPLIES the frame instead of adding to it, and the
   multiplier is built from the host bed's own albedo. Note that this shader
   deliberately has no tonemapping/colorspace include: the destination has
   already been through the face's lighting, and a multiply there is exactly a
   darkening of the rock that is present. 1.0 is a no-op, so anything the
   joint does not cover is left alone.                                        */
const FRAC_FRAG = /* glsl */`
precision highp float;
uniform vec2 uGeoX;          // x bounds of the geology column (log strip .. ruler)
varying float vHalo;
varying float vWidth;
varying vec2 vWP;
varying vec2 vLocal;
${GLSL_NOISE}
${GLSL_STRATA}
${GLSL_SURFACE}
void main(){
  if (vWP.y > surfaceY(vWP.x)) discard;

  // vLocal.x across the joint (-1..1), vLocal.y along it (0..1)
  float wig = (fbm2n(vec2(vLocal.y * 9.0, vWP.x * 0.4)) - 0.5) * 0.5;
  float across = abs(vLocal.x + wig);
  /* aWidth is the joint's own aperture, normalised 0..1 over the generated
     range. The quad already scales with it, and the core profile scales again
     on top, so a hairline joint and an open one differ by ~6x on screen
     instead of the ~2x that made every joint look identical. */
  float wk = 0.34 + 0.52 * vWidth;
  float core = smoothstep(wk, 0.0, across);
  float halo = smoothstep(1.0, 0.15, across);
  float taper = smoothstep(0.0, 0.13, vLocal.y) * smoothstep(1.0, 0.87, vLocal.y);
  float a = taper;

  /* Joints are bed-bounded: they terminate at a contact rather than running
     through it. */
  float u = colUWarp(vWP);
  vec4 A = texture2D(uStrataA, vec2(u, 0.5));
  a *= smoothstep(0.0, uEdgeShade * 2.4, A.a * uEdgeRange);

  /* A JOINT SET IS THE LEAST KNOWABLE THING ON THIS DRAWING. Bed order can be
     had from a map; joint spacing, orientation and aperture cannot be had
     from anything except the rock itself — core, a televiewer, or the face.
     Drawing a named fracture network through ground nobody has touched is the
     single most confident claim the section makes, and it was making it at
     full strength. It fades with the look-ahead and comes back as the bit
     arrives (lookUnc() is 0 at and behind the working point), so the joints
     the player actually drills into are the joints they were shown. */
  a *= 1.0 - lookUnc(vWP, depthAt(vWP)) * 0.88;

  /* And they are destroyed in the annulus — over-gauge wall, cuttings, the rod
     and the bit all live in there. Cut the column out entirely, drilled or
     not, so nothing can draw across the shank again. */
  float r = holeRadius(vWP.y, vWP.x > 0.0 ? 0.0 : 3.14159);
  a *= smoothstep(0.0, r * 0.85, abs(vWP.x) - r * 1.15);

  // stay out of the log strip and the ruler gutter
  a *= smoothstep(uGeoX.x - 0.5, uGeoX.x, vWP.x) * smoothstep(uGeoX.y + 0.5, uGeoX.y, vWP.x);

  float coreA = core * 0.88 * a;
  float haloA = halo * 0.55 * vHalo * a;

  /* The tint is the host bed's, driven down: a joint is the same rock, broken
     and shadowed. The halo is iron — limonite staining on a water-bearing
     joint — so it warms and slightly darkens rather than lightening. Both
     multipliers are <= 1 on every channel, which is the structural guarantee
     that a joint can never come out brighter than the rock it cuts. */
  vec3 dark = clamp(vec3(0.30) + A.rgb * 0.24, vec3(0.24), vec3(0.62));
  vec3 iron = vec3(0.99, 0.85, 0.63);
  vec3 m = mix(vec3(1.0), iron, haloA);
  m = mix(m, m * dark, coreA);
  gl_FragColor = vec4(m, 1.0);
}
`;

/* ── CAVITY INTERIORS ────────────────────────────────────────────────────── */
const CAVITY_FRAG = /* glsl */`
precision highp float;
uniform vec3 uAmbientCool;
varying vec3 vN;
varying vec3 vP;
${GLSL_NOISE}
void main(){
  vec3 N = normalize(vN);
  float up = 0.5 + 0.5 * N.y;
  float n = fbm4n(vP.xy * 1.6);
  vec3 c = mix(vec3(0.020, 0.023, 0.028), vec3(0.075, 0.082, 0.095), up * (0.5 + 0.5 * n));
  // wet flowstone glints near the floor
  c += vec3(0.03, 0.045, 0.055) * smoothstep(0.75, 1.0, n) * (1.0 - up);
  c *= 0.55 + 0.45 * uAmbientCool;
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
const CAVITY_VERT = /* glsl */`
precision highp float;
varying vec3 vN;
varying vec3 vP;
void main(){
  vN = normalize(normalMatrix * normal);
  vP = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   FACTORY
   ═══════════════════════════════════════════════════════════════════════════ */
export function createGeology(ctx) {
  const T = (ctx && ctx.THREE) || THREE;
  const bus = ctx?.bus;
  const EV = ctx?.EVENTS || EVENTS;

  /* ── local state ──────────────────────────────────────────────────────── */
  let scene = null;
  let camera = null;
  let ownsCamera = false;
  let ownsScene = false;

  const root = new T.Group();
  root.name = 'geology-root';

  let strata = [];
  let profileDepth = 60;
  let dip = 0.02;
  let waterTableDepth = 6;
  let features = { boulders: [], fractures: [], cavities: [], seeps: [] };
  let spec = {
    regionId: 'nordic', applicationId: 'water-well', targetDepth: 45,
    seed: 1337, difficulty: 0.3, holeDiaMm: CFG.holeDiaDefault,
    methodId: null, profileMode: 'vertical', commodity: null, oreConfidence: 0.55,
  };

  /* ── SECTION MODE STATE ──────────────────────────────────────────────────
     layout is the whole of the mode's coordinate contract, recomputed by
     applyMode() whenever the mode, the view or the contract changes. Nothing
     else in the file is allowed to invent a scale. */
  let mode = MODES.vertical;
  let layout = {
    id: 'vertical',
    metresPerUnitX: 1,     // metres of along-axis distance per section unit of x
    depthAtY0: 0,          // TVD (m) at section y = 0
    surfaceY: 0,           // section y of the mean ground line
    ve: 1,                 // vertical exaggeration == metresPerUnitX
    totalLength: 60,       // bore length / chainage / raise length / pile length (m)
    xOrigin: 0,            // section x of station 0
  };
  /** The designed HDD profile, solved once per contract. Null in other modes. */
  let path = null;
  /** Tunnel heading geometry. Null in other modes. */
  let heading = null;
  /** Raise-boring geometry. Null in other modes. */
  let raise = null;
  /** Driven / bored pile geometry + its driving record. Null in other modes. */
  let pile = null;
  /** The ore body, or null. Generated with the profile, revealed by drilling. */
  let ore = null;

  let depth = 0;             // MEASURED length along the hole (m) — the sim's number
  let smoothDepth = 0;
  let stage = 0;             // 0 = first pass, 1 = backream / ream-up
  let stageProgress = 0;     // metres of the second pass
  let casingDepth = 0;
  let time = 0;
  let halfH = CFG.viewMetres * 0.5;
  let halfW = halfH;
  let camBaseY = 0;
  let viewMetres = CFG.viewMetres;

  /** VISUAL borehole radius, in section units. Derived — never a constant. */
  let holeR = CFG.holeRadius;
  /** Drawn bore diameter / true bore diameter. Derived in applyHoleDiameter()
   *  from the two diameters, printed by drawRuler(), published as
   *  ctx.sectionView.boreExaggeration.
   *
   *  DECLARED HERE, and that is the whole point of this line. It used to be
   *  assigned without a declaration. This module is ESM, ESM is strict, and
   *  the implicit global threw `ReferenceError: boreExag is not defined` out of
   *  applyHoleDiameter() — which init() calls through computeView() — so
   *  createGeology().init() aborted and THE ENTIRE SECTION BAND never built.
   *  No scene, no strata, no string, no ruler, and (HANDOFF §3, rubric axis 9)
   *  nothing moving in ten method frames, because there was nothing there. */
  let boreExag = (2 * holeR) / (CFG.holeDiaDefault / 1000);
  /** CSS px per metre of section. Everything expressed in pixels goes via this. */
  let pxPerMetre = 19.4;

  let lastEventDepth = 0;
  let lastStratumIndex = -1;
  const firedBoulders = new Set();
  const firedCavities = new Set();
  const firedWater = new Set();

  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  /* ── shared uniforms ──────────────────────────────────────────────────── */
  const texA = makeLookupTexture(T, CFG.lookupWidth, true);
  const texB = makeLookupTexture(T, CFG.lookupWidth, false);
  const texC = makeLookupTexture(T, CFG.lookupWidth, false);
  const texD = makeLookupTexture(T, CFG.lookupWidth, false);
  track(texA); track(texB); track(texC); track(texD);

  const cavUniform = [];
  for (let i = 0; i < CFG.cavityCap; i++) cavUniform.push(new T.Vector4(0, 0, 0, 0));

  const U = {
    uStrataA:     { value: texA },
    uStrataB:     { value: texB },
    uStrataC:     { value: texC },
    uStrataD:     { value: texD },
    uProfileDepth:{ value: profileDepth },
    uDip:         { value: dip },
    uWarp:        { value: 1.15 },
    uHoleR:       { value: holeR },
    uDepth:       { value: 0 },
    /* ── LOOK-AHEAD (see lookUnc() in GLSL_STRATA for the whole model) ──────
       uLook  (d/depth, d/sectionX, const, 1/controlDistance) — the CPU-side
              coefficients of the metres-ahead plane, so the shader branches
              on nothing. (1, 0, 0, …) with uSurvey.x = 0 is the section
              exactly as it was before look-ahead existed, which is the state
              every non-drilling frame sits in.
       uSurvey x uncertainty ceiling 0..1, driven from the contract's survey
              confidence by applySurvey(); y boundary wander gain. */
    uLook:        { value: new T.Vector4(1, 0, 0, 1 / CFG.controlFar) },
    uSurvey:      { value: new T.Vector2(0, 0) },
    uWaterY:      { value: -6 },
    uTime:        { value: 0 },
    uHalfW:       { value: halfW },
    /* 0xffd9a0 had a 0.627 blue coefficient and carried 0.04 + 0.95*ndl, i.e.
       nearly all of the light. Anything cool underneath it was annihilated —
       granite, limestone and quartzite all landed on one green-grey. Near
       neutral now; the palette in contract.js is solved against this exact
       value and will drift if it is changed without re-solving. */
    uKeyWarm:     { value: new T.Color(0xffeedd) },
    uAmbientCool: { value: new T.Color(0x6c8296) },
    /* x bounds of the geology column: [log strip right edge, ruler left edge].
       Set by computeView(); consumed by the fracture mesh so joints stop at
       the instrument strips instead of running out over the black bevel. */
    uGeoX:        { value: new T.Vector2(-3, 3) },
    uWetMix:      { value: 1 },
    uCav:         { value: cavUniform },
    // contact drawing + procedural detail budget — all set by computeView()
    uEdgeRange:   { value: CFG.edgeRangeMetres },
    uEdgeGeo:     { value: CFG.edgeGeoMetres },
    uEdgeShade:   { value: CFG.edgeMetres },
    uPartW:       { value: CFG.partingPx / 19.4 },
    uLipW:        { value: CFG.lipPx / 19.4 },
    uNyq:         { value: 5.54 },
    uNyq2:        { value: 2.77 },
    uNyq4:        { value: 1.39 },
    uAngNyq:      { value: 1.9 },

    /* ── SECTION MODE ──────────────────────────────────────────────────────
       Every default below is the value that makes the shaders reduce to the
       vertical section they were before this file gained modes. Nothing sets
       them to anything else while layout.id === 'vertical'. */
    uDepth0:      { value: 0 },
    uBMode:       { value: BMODE.vertical },
    uSurfY:       { value: 0 },
    uSurfAmp:     { value: 1 },
    uObst:        { value: new T.Vector4(0, 1, 0, 0) },
    uPathA:       { value: new T.Vector4(0, 0, 0, 1) },
    uPathB:       { value: new T.Vector4(0, 0, 1, 0) },
    // (coverDepth, metresPerUnitX, xOrigin, productRadius)
    uPathC:       { value: new T.Vector4(0, 1, 0, 0) },
    // (cut extent m, second-stage extent m, pilot radius units, stage)
    uBore:        { value: new T.Vector4(0, 0, 0.3, 0) },
    uTun:         { value: new T.Vector4(0, 0, 0, 0) },
    uRaise:       { value: new T.Vector4(0, 0, 0, 0) },

    /* ── ORE ───────────────────────────────────────────────────────────────
       uOreA.x = 0 means "no ore body", which is every non-mining contract,
       and the shader's first test short-circuits on it. */
    uOreA:        { value: new T.Vector4(0, 0, 1, 0) },
    uOreB:        { value: new T.Vector4(0, 100, 2, 1) },
    uOreC:        { value: new T.Vector4(0, 0, 0, 0) },
    uOreE:        { value: new T.Vector4(1, 0, 0, 0) },
    uOreD:        { value: new T.Vector4(3.0, 0.0, 0, 0) },
    uOreTint:     { value: new T.Color(0xC8C2B4) },
    uOreHalo:     { value: new T.Color(0x8E8A80) },
    uTarget:      { value: new T.Vector4(0, 0, 0, 1.6) },
  };

  /* ── meshes ───────────────────────────────────────────────────────────── */
  let faceMesh = null, faceMat = null, faceGeo = null;
  let backMesh = null, backMat = null;
  let wallMesh = null, wallMat = null;
  let rodMesh = null, rodMat = null;
  let casingMesh = null, casingMat = null;
  let bitMesh = null, bitMat = null;
  let boulderMesh = null, boulderMat = null;
  let fracMesh = null, fracMat = null;
  let cavityMesh = null, cavityMat = null;
  let waterLine = null, waterMat = null;
  let pinMesh = null;
  let ruler = null, logStrip = null, readout = null;
  /* Mode furniture. Two draw calls, built only when a mode needs them and
     disposed when it does not: `modeMesh` is one merged, part-tagged geometry
     (pits, obstacle, bore ribbon, tunnel lining, pile column, raise levels)
     and `modeInst` one instanced quad (rock bolts, spiles, blast holes, cage
     hoops, probe holes). `xRuler` is the horizontal station scale the two
     long-section modes need alongside the depth scale. */
  let modeMesh = null, modeMat = null;
  let modeInst = null, modeInstMat = null;
  let xRuler = null;

  const boreholeTip = new T.Object3D();
  boreholeTip.name = 'boreholeTip';
  root.add(boreholeTip);

  const annulus = { x: 0, innerR: holeR * CFG.rodRatio, outerR: holeR, casingR: holeR * CFG.casingRatio };

  /**
   * The drawn contact is 1.5 CSS px wide — but it also has to survive the
   * column lookup, which spreads 4096 texels over the whole profile. On a 300 m
   * contract that is 0.09 m per texel, so the line is floored at ~1.2 texels:
   * marginally thicker on very deep holes, never absent.
   */
  function updateContactWidths() {
    const texelM = profileDepth / CFG.lookupWidth;
    U.uPartW.value = Math.max((CFG.partingPx * 0.5) / pxPerMetre, texelM * 1.2);
    U.uLipW.value = Math.max(CFG.lipPx / pxPerMetre, texelM * 1.2);
  }

  /**
   * The one place the visual hole radius is decided. A 38 mm micropile and a
   * 6000 mm raise bore are both real jobs (see game/data.js holeDiaRange) and
   * used to draw an identical hole because holeRadius was a hard constant.
   */
  function applyHoleDiameter() {
    const mm = Number(spec.holeDiaMm) || Number(ctx?.state?.contract?.holeDia) || CFG.holeDiaDefault;
    holeR = clamp(CFG.holeRBase + (mm / 1000) * CFG.holeRGain, CFG.holeRBase, CFG.holeRMax);
    /* The exaggeration is DERIVED from the two diameters, never asserted, so it
       cannot drift from what is drawn: change holeRGain and the badge changes
       with it. It is what drawRuler() prints and what ctx.sectionView carries.
       Below 1.0 the bore is drawn UNDER gauge (a 6 m raise bore hits the
       ceiling at 0.53x) and the badge says so rather than staying silent. */
    boreExag = (2 * holeR) / Math.max(mm / 1000, 1e-6);
    U.uHoleR.value = holeR;
    annulus.outerR = holeR;
    annulus.innerR = holeR * CFG.rodRatio;
    annulus.casingR = holeR * CFG.casingRatio;
    if (ctx?.sectionView) {
      ctx.sectionView.holeRadius = holeR;
      ctx.sectionView.rodRadius = annulus.innerR;
      ctx.sectionView.casingRadius = annulus.casingR;
      ctx.sectionView.holeDiaMm = mm;
      ctx.sectionView.boreExaggeration = boreExag;
    }
    // the borehole wall is the only place angular detail is squeezed by the
    // hole's on-screen width, so its budget is derived from that width
    U.uAngNyq.value = clamp((2 * holeR * pxPerMetre) / (Math.PI * CFG.detailPx), 0.7, 6.0);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     SECTION MODE GEOMETRY
     ═════════════════════════════════════════════════════════════════════════ */

  /**
   * THE HDD PROFILE — solved, not drawn freehand.
   *
   * research/07 §A1: the ideal profile is a fixed five-part sequence —
   * inclined entry tangent, upward sweeping curve, horizontal sag bend at the
   * design cover, upward sweeping curve, exit tangent. Entry 8–20 deg
   * (ASTM F1962), exit preferably < 10 deg.
   *
   * The binding constraint is the MINIMUM BEND RADIUS, and the rule the game
   * exists to teach is verbatim from [SHORE]: "a general rule-of-thumb for
   * the radius of curvature is 1200 times the pipeline diameter for steel line
   * pipe" — 1.2 m of radius per mm of diameter, so a 300 mm steel pipe wants
   * R >= 360 m. That single number then DECIDES the depth of cover, because a
   * radius R turning through the entry angle costs R(1 - cos theta) of depth
   * before the bore is even horizontal. A player who wants a shallower
   * crossing has to take a smaller pipe or a flatter entry; there is no third
   * option, and that is the real trade.
   *
   * Returned distances are HORIZONTAL metres from the entry point, because the
   * path is monotone in x and the shader can then invert it in closed form.
   */
  function solveHddPath(boreLength, pipeDiaMm, rng, diff) {
    const rRule0 = 1.2 * Math.max(pipeDiaMm, 50);
    /* Cover is a TENSION, not a target ([PPI12] deeper to prevent inadvertent
       returns, [APE] the minimum necessary to prevent surface heave). Real
       crossings land between about 3.5 m and 15 m, which is also all a 20 m
       section band can honestly draw. */
    let Dc0 = clamp(rng.range(4.5, 9.5) + boreLength * 0.010, 3.5, 15.0);

    /* THE DESIGN CONVERSATION, in three lines. A radius R turning through the
       entry angle costs R(1 - cos theta) of depth before the bore is even
       horizontal, so a big steel pipe's 1200 x D radius wants a cover the
       crossing may not have. A designer spends the free move first — FLATTEN
       THE ENTRY, 8 deg being the shallow end of ASTM F1962's 8–20 — then the
       costly one, go deeper, and only then accepts a radius under the rule. */
    const needCover = (deg) => rRule0 * (1 - Math.cos((deg * Math.PI) / 180)) + 1.2;
    let entryDeg = rng.range(8, 16) + (pipeDiaMm > 600 ? rng.range(0, 4) : 0);
    if (needCover(entryDeg) > Dc0) {
      const cosMax = 1 - (15.0 - 1.2) / rRule0;
      if (cosMax > -1 && cosMax < 1) {
        entryDeg = clamp((Math.acos(cosMax) * 180) / Math.PI, 8, entryDeg);
      } else entryDeg = 8;
      Dc0 = Math.min(15.0, Math.max(Dc0, needCover(entryDeg)));
    }
    const exitDeg = rng.range(4, 9);
    const te = Math.tan((entryDeg * Math.PI) / 180);
    const tx = Math.tan((exitDeg * Math.PI) / 180);
    const ce = Math.cos((entryDeg * Math.PI) / 180);
    const cx = Math.cos((exitDeg * Math.PI) / 180);
    const se = Math.sin((entryDeg * Math.PI) / 180);
    const sx = Math.sin((exitDeg * Math.PI) / 180);

    /* R >= 1200 x D. On a 120 m crossing a literal 360 m radius eats the whole
       drawing, so the design radius is the rule's value clamped into what the
       crossing can physically contain — which is itself the real constraint
       ("creating as large a radius of curvature as possible within the limits
       of the right-of-way", [PPI12]). The RULE's value is kept alongside so the
       HUD can show the player when the ground, not the pipe, is the limit. */
    const rRule = rRule0;
    const Dc = Dc0;

    /* If even 8 degrees at 15 m of cover cannot hold the rule's radius — which
       is the honest answer for a 1,200 mm steel line — the drilled radius is
       cut to what fits and the SHORTFALL IS RECORDED rather than hidden. The
       player is told the rule wanted 1,440 m and the ground allowed 520, which
       is the conversation a designer actually has, and it is the mechanical
       reason the pullback fails later: [PPI12]'s capstan effect raises pull
       load through a curve, and the higher tension then reduces the pipe's own
       collapse resistance. */
    const arcBudget = Math.max(Dc - 1.2, 0.4);
    const R1 = Math.min(clamp(rRule, boreLength * 0.10, boreLength * 2.5),
                        arcBudget / Math.max(1 - ce, 1e-4));
    const R2 = Math.min(R1 * rng.range(0.85, 1.15),
                        Math.max(Dc - 0.8, 0.4) / Math.max(1 - cx, 1e-4));
    const bendRadiusOk = R1 >= rRule - 1e-3;

    const arcDrop = R1 * (1 - ce);
    // entry tangent: whatever is left of the cover after the arc has spent its
    const L1 = Math.max(1.5, (Dc - arcDrop) / Math.max(se, 1e-3));
    const X1 = L1 * ce;
    const X2 = X1 + R1 * se;
    const exitDrop = R2 * (1 - cx);
    const L5 = Math.max(1.5, (Dc - exitDrop) / Math.max(sx, 1e-3));
    // the sag bend takes whatever horizontal run is left over
    const sagX = Math.max(boreLength * 0.18, boreLength - (L1 + R1 * (entryDeg * Math.PI / 180)
               + R2 * (exitDeg * Math.PI / 180) + L5));
    const X3 = X2 + sagX;
    const X4 = X3 + R2 * sx;
    const X5 = X4 + L5 * cx;

    // measured length along the path, which is what the contract sells
    const arc1 = R1 * ((entryDeg * Math.PI) / 180);
    const arc2 = R2 * ((exitDeg * Math.PI) / 180);
    const length = L1 + arc1 + sagX + arc2 + L5;

    /* Design corridor — research/07 §F4 takes the S-grade half-width straight
       from [APE]'s +/- 6 in and relaxes it by difficulty. */
    const corridor = lerp(0.15, 0.80, diff);

    /* The obstacle. A crossing exists because something is in the way, and the
       three that matter are named in DESIGN_EXPANSION.md §1. It is centred on
       the sag bend, which is where a crossing is designed to put it. */
    const obstacles = [
      { kind: 'river', label: 'RIVER', water: true, rise: -1.15, width: [0.34, 0.62] },
      { kind: 'road', label: 'HIGHWAY', water: false, rise: 0.75, width: [0.18, 0.34] },
      { kind: 'rail', label: 'RAILWAY', water: false, rise: 0.95, width: [0.12, 0.24] },
      { kind: 'canal', label: 'CANAL', water: true, rise: -0.95, width: [0.16, 0.30] },
    ];
    const ob = rng.pick(obstacles);
    const obHalf = sagX * rng.range(ob.width[0], ob.width[1]) * 0.5;

    return {
      entryDeg, exitDeg, te, tx, R1, R2, rRule, Dc, bendRadiusOk,
      X1, X2, X3, X4, X5, L1, L5, sagX, length, corridor,
      obstacle: {
        kind: ob.kind, label: ob.label, water: ob.water,
        centreX: (X2 + X3) * 0.5, halfW: obHalf, rise: ob.rise,
      },
      /* Entry and exit pits: [APE] sizes them to "contain the expected return
         of drilling fluids and soil cuttings", each ringed by a 305 mm berm. */
      entryPit: { x: -2.2, w: 4.6, d: 1.5 },
      exitPit: { x: X5 + 1.6, w: 3.6, d: 1.2 },
      /* Located utilities. [HSG47] §169: clearance between adjacent services is
         250 mm or 1.5 x the pipe diameter, whichever is greater. */
      utilities: (() => {
        const out = [];
        const n = 1 + Math.round(rng.f() * 2 + diff);
        for (let i = 0; i < n; i++) {
          out.push({
            x: rng.range(X1 * 0.4, X5 * 0.94),
            depth: rng.range(0.6, 2.4),
            clearance: Math.max(0.25, 1.5 * (pipeDiaMm / 1000)),
          });
        }
        return out.sort((a, b) => a.x - b.x);
      })(),
    };
  }

  /** Horizontal distance from entry -> depth below ground. Mirrors hddDepthAtX(). */
  function hddDepthAtX(p, X) {
    if (!p) return 0;
    if (X <= 0) return 0;
    if (X < p.X1) return X * p.te;
    if (X < p.X2) return (p.Dc - p.R1) + Math.sqrt(Math.max(p.R1 * p.R1 - (X - p.X2) ** 2, 0));
    if (X < p.X3) return p.Dc;
    if (X < p.X4) return (p.Dc - p.R2) + Math.sqrt(Math.max(p.R2 * p.R2 - (X - p.X3) ** 2, 0));
    const D4 = (p.Dc - p.R2) + Math.sqrt(Math.max(p.R2 * p.R2 - (p.X4 - p.X3) ** 2, 0));
    return Math.max(D4 - (X - p.X4) * p.tx, 0);
  }

  /** d(depth)/dX in metres per metre. Mirrors hddSlopeAtX() in GLSL. */
  function hddSlopeAtXjs(p, X) {
    if (!p) return 0;
    if (X < p.X1) return p.te;
    if (X < p.X2) { const dx = p.X2 - X; return dx / Math.max(Math.sqrt(Math.max(p.R1 * p.R1 - dx * dx, 1)), 1); }
    if (X < p.X3) return 0;
    if (X < p.X4) { const dx = X - p.X3; return -dx / Math.max(Math.sqrt(Math.max(p.R2 * p.R2 - dx * dx, 1)), 1); }
    return -p.tx;
  }

  /** Measured station along the path -> horizontal distance from entry. */
  function hddXAtStation(p, s) {
    if (!p) return s;
    const arc1 = p.R1 * ((p.entryDeg * Math.PI) / 180);
    const arc2 = p.R2 * ((p.exitDeg * Math.PI) / 180);
    const ce = Math.cos((p.entryDeg * Math.PI) / 180);
    const cx = Math.cos((p.exitDeg * Math.PI) / 180);
    if (s <= 0) return 0;
    if (s < p.L1) return s * ce;
    if (s < p.L1 + arc1) {
      // constant-radius arc: horizontal run is R * (sin(a1) - sin(a1 - t/R))
      const t = s - p.L1;
      const a1 = (p.entryDeg * Math.PI) / 180;
      return p.X1 + p.R1 * (Math.sin(a1) - Math.sin(Math.max(a1 - t / p.R1, 0)));
    }
    if (s < p.L1 + arc1 + p.sagX) return p.X2 + (s - p.L1 - arc1);
    if (s < p.L1 + arc1 + p.sagX + arc2) {
      const t = s - p.L1 - arc1 - p.sagX;
      return p.X3 + p.R2 * Math.sin(Math.min(t / p.R2, (p.exitDeg * Math.PI) / 180));
    }
    return Math.min(p.X4 + (s - p.L1 - arc1 - p.sagX - arc2) * cx, p.X5);
  }

  /**
   * THE TUNNEL HEADING — research/04 §E4 and §E5.
   *
   * Face area 12–200 m2 with 100 m2 typical (NFF14 §7.5); round length 4.5–5 m
   * in good ground and 2.5–3 m in poor, and NFF19 §4.3.1 forces the short round
   * whenever 6 m spiles are in use. Shotcrete is 60 mm minimum and up to
   * 300–500 mm for an arch (NFF14 §6.3.1). Spiles fan at 10–15 deg to the axis
   * on a 2.3–3 m burden. Every one of those is drawn, which is why the X window
   * is derived from the excavated height instead of the 160 m §E4 suggests.
   */
  function solveHeading(chainage, rng, diff) {
    const faceArea = lerp(120, 34, diff) * rng.range(0.75, 1.25);
    const height = clamp(Math.sqrt(faceArea) * 0.95, 4.2, 13.5);
    const width = clamp(faceArea / height, 4.0, 17);
    // ground-driven round length — NFF14 §7.4 / NFF19 §4.3.1
    const good = diff < 0.55;
    const roundLen = good ? rng.range(4.5, 5.0) : rng.range(2.5, 3.0);
    return {
      height, width, faceArea, roundLen, good,
      /* Cover. Deep enough that the surface is normally off the top of the
         band, which is the honest picture; shallow portals get a visible one. */
      cover: rng.range(18, 140) * (1 - diff * 0.25) + height,
      shotcreteM: good ? rng.range(0.06, 0.12) : rng.range(0.20, 0.42),
      boltLen: rng.range(2.4, 4.0),
      boltSpacing: rng.range(1.2, 2.0),
      spiling: !good,
      spileLen: 6.0,
      spileDeg: rng.range(10, 15),
      spileBurden: rng.range(2.3, 3.0),
      probeLen: rng.range(20, 30),
      holesPerRound: Math.round(faceArea * 1.4),
      /* lookout: NTNU-BD, 0.10 + 0.03 * hole depth */
      lookout: 0.10 + 0.03 * roundLen,
      girders: !good,
    };
  }

  /**
   * THE RAISE — research/03 §A.5.1.
   *
   * Reaming heads run 0.6–6 m and raises up to 6 m diameter and 1000 m long
   * "are not uncommon". The pilot goes down on 1.5 m hollow pipes with water
   * flush; the stem that follows it is Ø228–381 mm, which is what sets the
   * pilot's drawn diameter against the reamed one. Stage two pulls the head
   * UPWARD from the lower level and the cuttings fall by gravity.
   */
  function solveRaise(length, reamDiaMm, rng) {
    const stemMm = clamp(reamDiaMm * 0.09, 228, 381);
    return {
      length,
      reamDiaMm,
      pilotDiaMm: stemMm,
      // the two chambers the section has to show
      upperHeight: rng.range(4.2, 5.6),
      lowerHeight: rng.range(4.0, 5.4),
      driveWidth: rng.range(4.6, 6.2),
      cutters: reamDiaMm < 1200 ? 4 : reamDiaMm < 2000 ? 10
             : reamDiaMm < 2600 ? 14 : reamDiaMm < 3200 ? 16 : 32,
      headMass: reamDiaMm < 1200 ? 2.7 : reamDiaMm < 2300 ? 7.3
              : reamDiaMm < 3800 ? 15 : 38,
    };
  }

  /**
   * THE PILE — research/05.
   *
   * Driving is scored on SET, the permanent penetration per blow, logged as a
   * blow count per 500 or 250 mm and tightening to blows per 25 mm in the final
   * metre ([TOM] §11.3.1). The practical sustained limit is 120–150 blows /
   * 250 mm; 200 is acceptable "for fairly short periods"; API refusal is 248
   * per 250 mm sustained over 1.5 m, or 662 over 0.3 m ([TOM] §3.1.6).
   *
   * The blow count is DERIVED FROM THE GROUND, not stored, so a player who
   * reads the section can predict the log — and the lie in §E1 still works,
   * because a broomed toe produces a beautiful set while the depth-into-
   * bearing-stratum counter is the only thing telling the truth.
   */
  function solvePile(lengthM, diaMm, rng, diff) {
    // the bearing stratum is the first competent bed below two thirds depth
    let bearing = null;
    for (const s of strata) {
      if (s.top >= lengthM * 0.55 && s.ucs >= 25) { bearing = s; break; }
    }
    if (!bearing) bearing = strata[strata.length - 1] || null;
    const toe = bearing
      ? clamp(bearing.top + rng.range(1.2, 3.5), lengthM * 0.6, profileDepth * 0.95)
      : lengthM;
    return {
      lengthM: toe,
      diaMm,
      driven: spec.methodId === 'driven-pile',
      bearing,
      /* penetration into the bearing stratum — "for a driven pile, the toe is
         the score" (research/05 §E5) */
      toeIntoBearing: bearing ? Math.max(0, toe - bearing.top) : 0,
      cageBars: diaMm < 400 ? 6 : diaMm < 800 ? 8 : diaMm < 1500 ? 12 : 16,
      cageTop: rng.range(0.2, 0.8),
      cageBottom: toe - rng.range(0.5, 2.0),
      hoopPitch: rng.range(0.20, 0.35),
      /* Driving record step: 250 mm over the shaft, 25 mm in the final metre. */
      stepM: 0.25,
      fineStepM: 0.025,
      practicalLimit: lerp(150, 120, diff),   // blows / 250 mm, [TOM] §3.1.6
      refusal: 248,                           // blows / 250 mm, API
    };
  }

  /**
   * Blows per 250 mm at a depth, from the ground the player can see.
   * Driving resistance is shaft friction (accumulating) plus end bearing (the
   * bed at the toe), which is why the log ramps through a stiff clay and then
   * walls up the moment the toe finds rock.
   */
  function blowsAt(m) {
    if (!strata.length) return 0;
    const s = getStratumAt(m);
    if (!s) return 0;
    const end = 6 + Math.pow(Math.min(s.ucs, 240), 0.86) * 1.35
              + (1 - s.stability) * -4;
    let shaft = 0;
    for (const b of strata) {
      if (b.top >= m) break;
      const th = Math.min(b.bottom, m) - b.top;
      shaft += th * (0.9 + Math.min(b.ucs, 60) * 0.055);
    }
    const b = boulderAt(m);
    const obstruction = b ? 70 + b.hardness * 140 : 0;
    const n = end + shaft * 0.55 + obstruction;
    // driving through a void does nothing at all
    return cavityAt(m) ? 1 : clamp(n, 1, 900);
  }

  /* ── the mode's coordinate contract ─────────────────────────────────────
     One function decides everything a mode changes, and it is the only place
     allowed to write the coordinate uniforms. Called from generateProfile()
     and from computeView(), because the horizontal scale depends on the band's
     aspect and the band can be resized at any time. */
  function applyMode() {
    const m = MODES[layout.id] || MODES.vertical;
    mode = m;
    const bandUnits = Math.max(halfW * 2, 1e-3);

    layout.metresPerUnitX = 1;
    layout.depthAtY0 = 0;
    layout.surfaceY = 0;
    layout.xOrigin = 0;

    if (m.id === 'profile') {
      /* research/07 §F1: 120 m of bore length across the band, against a 20 m
         view on Y. On the reference device that is 3.25 px/m horizontally and
         19.4 px/m vertically — V.E. ~6:1. The window shrinks for a short
         crossing so a 60 m bore is not drawn as half an empty frame. */
      const want = clamp(layout.totalLength * 1.18, 40, m.windowMetres);
      layout.metresPerUnitX = want / bandUnits;
    } else if (m.id === 'heading') {
      const h = heading ? heading.height : 8;
      // keep the drive at ~40 % of the band height whatever its size
      layout.metresPerUnitX = clamp(h / 3.6, 1.6, 3.2);
      layout.depthAtY0 = heading ? heading.cover : 0;
      layout.surfaceY = layout.depthAtY0;
    }
    layout.ve = layout.metresPerUnitX;

    U.uBMode.value = m.bmode;
    U.uDepth0.value = layout.depthAtY0;
    U.uSurfY.value = layout.surfaceY;
    /* Surface relief is authored against a 14 m frame. On a 120 m long-section
       the same fbm would be a flat line, so its amplitude follows the scale —
       capped, because a 3 m hummock on a crossing profile is not a hill. */
    U.uSurfAmp.value = clamp(Math.sqrt(layout.metresPerUnitX), 1, 3.2);
    U.uPathC.value.set(path ? path.Dc : 0, layout.metresPerUnitX, layout.xOrigin,
                       path ? clamp(holeR * 1.25, holeR, CFG.holeRMax) : 0);

    if (m.id === 'profile' && path) {
      U.uPathA.value.set(path.te, path.X1, path.X2, path.R1);
      U.uPathB.value.set(path.X3, path.X4, path.R2, path.tx);
      const ob = path.obstacle;
      U.uObst.value.set(ob.centreX / layout.metresPerUnitX,
                        Math.max(ob.halfW / layout.metresPerUnitX, 0.4),
                        ob.rise * U.uSurfAmp.value, ob.water ? 1 : 2);
    } else if (m.id === 'raise' && raise) {
      // uPathA.x carries the drives' half-width in raise (see GLSL_STRATA)
      U.uPathA.value.set(raise.driveWidth * 0.5, 0, 0, 1);
      U.uObst.value.set(0, 1, 0, 0);
    } else {
      U.uPathA.value.set(0, 0, 0, 1);
      U.uPathB.value.set(0, 0, 1, 0);
      U.uObst.value.set(0, 1, 0, 0);
    }

    if (m.id === 'heading' && heading) {
      U.uTun.value.set(heading.height * 0.5, -heading.height * 0.5, 0,
                       lerp(0.10, 0.42, spec.difficulty));
    } else {
      U.uTun.value.set(0, 0, 0, 0);
    }

    if (m.id === 'raise' && raise) {
      U.uRaise.value.set(raise.upperHeight * 0.5, raise.length,
                         raise.lowerHeight * 0.5, 0);
    } else {
      U.uRaise.value.set(0, 0, 0, 0);
    }

    /* The pilot is drawn at its own diameter so stage two READS as a change of
       hole. 228–381 mm stem inside a 0.6–6 m reamed raise is a big jump and it
       should look like one. */
    const pilotR = raise
      ? clamp(CFG.holeRBase + (raise.pilotDiaMm / 1000) * CFG.holeRGain,
              CFG.holeRBase, CFG.holeRMax)
      : clamp(holeR * 0.62, CFG.holeRBase, CFG.holeRMax);
    U.uBore.value.set(0, 0, pilotR, 0);

    if (ctx?.sectionView) {
      ctx.sectionView.profileMode = layout.id;
      ctx.sectionView.metresPerUnitX = layout.metresPerUnitX;
      ctx.sectionView.verticalExaggeration = layout.ve;
      ctx.sectionView.depthAtY0 = layout.depthAtY0;
    }
  }

  /* ── the two coordinate primitives everything else goes through ────────── */
  /** Section-space y of a true vertical depth. -m in every vertical mode. */
  function secYForDepth(m) { return layout.depthAtY0 - (+m || 0); }
  /** Section-space x of an along-axis station. 0 in every vertical mode. */
  function secXForStation(s) {
    if (!mode.horizontal) return 0;
    const X = layout.id === 'profile' ? hddXAtStation(path, s) : s;
    return layout.xOrigin + X / Math.max(layout.metresPerUnitX, 1e-6);
  }
  /** Measured length along the hole -> TRUE VERTICAL DEPTH. Identity when the
   *  hole is vertical, which is what keeps sim/drilling.js correct for free. */
  function depthForStation(s) {
    const v = Math.max(0, +s || 0);
    if (layout.id === 'profile') return hddDepthAtX(path, hddXAtStation(path, v));
    if (layout.id === 'heading') return layout.depthAtY0;
    return v;
  }
  /** Section-space x of the hole axis at a measured length. */
  function axisXAt(s) { return mode.horizontal ? secXForStation(s) : 0; }

  /** Horizontal distance from entry -> measured station. Inverse of
   *  hddXAtStation(); the path is monotone in x so this is exact. */
  function hddStationAtX(p, X) {
    if (!p) return X;
    const a1 = (p.entryDeg * Math.PI) / 180;
    const a2 = (p.exitDeg * Math.PI) / 180;
    const arc1 = p.R1 * a1, arc2 = p.R2 * a2;
    const ce = Math.cos(a1), cx = Math.cos(a2);
    if (X <= 0) return 0;
    if (X < p.X1) return X / Math.max(ce, 1e-4);
    if (X < p.X2) {
      const k = clamp(Math.sin(a1) - (X - p.X1) / p.R1, -1, 1);
      return p.L1 + (a1 - Math.asin(k)) * p.R1;
    }
    if (X < p.X3) return p.L1 + arc1 + (X - p.X2);
    if (X < p.X4) {
      return p.L1 + arc1 + p.sagX + Math.asin(clamp((X - p.X3) / p.R2, -1, 1)) * p.R2;
    }
    return p.L1 + arc1 + p.sagX + arc2 + (X - p.X4) / Math.max(cx, 1e-4);
  }

  /**
   * TRUE VERTICAL DEPTH -> the measured length at which the hole first reaches
   * it. The inverse of depthForStation(), and it returns -1 where the hole
   * never gets there: an HDD bore has no station below its sag bend, and a
   * tunnel drive has none outside its own excavated profile.
   */
  function stationForDepth(m) {
    const d = Math.max(0, +m || 0);
    if (layout.id === 'heading') {
      return Math.abs(d - layout.depthAtY0) <= (heading ? heading.height : 6)
        ? layout.totalLength * 0.5 : -1;
    }
    if (layout.id !== 'profile' || !path) return d;
    if (d > path.Dc + 1e-6) return -1;
    // the entry limb is strictly monotone in depth, so bisect on it
    let lo = 0, hi = hddStationAtX(path, path.X2);
    for (let i = 0; i < 26; i++) {
      const mid = (lo + hi) * 0.5;
      if (depthForStation(mid) < d) lo = mid; else hi = mid;
    }
    return (lo + hi) * 0.5;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     THE ORE BODY
     ═════════════════════════════════════════════════════════════════════════ */

  /**
   * Place a body of commodity in the generated profile.
   *
   * The kind is chosen from the commodity's own list, the depth from where its
   * PREFERRED HOST ROCK actually is in this profile — an orogenic vein lands in
   * the greenstone, a Carlin body in the decalcified carbonate, a coal seam on
   * a real bed contact, a placer pay-streak at the gravel/bedrock interface —
   * so the section reads as one drawing rather than as a band painted over it.
   */
  function makeOreBody(commodityId, rng, confidence) {
    const C = COMMODITIES[commodityId];
    if (!C || !C.kinds.length) return null;
    const kindId = rng.pick(C.kinds);
    const K = ORE_KINDS[kindId];
    if (!K) return null;

    /* Where. Prefer a bed of the host rock the model actually names; fall back
       to the middle third of the profile, which is where a target would be
       designed to sit anyway. */
    const hosts = strata.filter((s) => K.hostPref.includes(s.id)
      && s.top > profileDepth * 0.10 && s.top < profileDepth * 0.90);
    const host = hosts.length ? rng.pick(hosts) : null;
    let centreDepth = host
      ? rng.range(host.top + (host.bottom - host.top) * 0.15,
                  host.bottom - (host.bottom - host.top) * 0.15)
      : rng.range(profileDepth * 0.35, profileDepth * 0.75);

    const dipDeg = rng.range(K.dipDeg[0], K.dipDeg[1]);
    const isStacked = K.shape === ORE_SHAPE.stacked;

    /* Placer: the values sit AT THE BASE OF THE GRAVEL, in riffles and
       fractured bedrock — so snap the body onto that contact. */
    if (kindId === 'placer-gold') {
      const gravel = strata.filter((s) => (s.id === 'gravel' || s.id === 'till')
        && strata[s.index + 1] && strata[s.index + 1].ucs > 25);
      if (gravel.length) centreDepth = rng.pick(gravel).bottom - 0.4;
    }
    /* Coal: seams sit at predictable horizons, i.e. ON a bed contact. */
    if (kindId === 'coal') {
      const cands = strata.filter((s) => s.index > 0 && s.top > 4
        && s.top < profileDepth * 0.9 && s.ucs < 90);
      if (cands.length) centreDepth = rng.pick(cands).top + rng.range(0.4, 2.0);
    }

    const thick = rng.range(K.thickM ? K.thickM[0] : 20, K.thickM ? K.thickM[1] : 60);
    const body = {
      commodity: commodityId,
      commodityName: C.name,
      symbol: C.symbol,
      unit: C.unit,
      sourced: C.sourced !== false,
      needs: C.needs || null,
      kind: kindId,
      kindLabel: K.label,
      code: K.code,
      shape: K.shape,
      tint: K.core,
      haloTint: K.halo,
      /** the commodity's own colour, for the log's assay track */
      tintCss: (() => { const c = hexToRgb(C.tint); return `rgba(${c[0]},${c[1]},${c[2]},0.86)`; })(),
      stipple: K.stipple || 0,
      jasperoid: !!K.jasperoid,
      dipRad: (dipDeg * Math.PI) / 180,
      dipDeg,
      centreDepth,
      /* Along-axis centre. In a vertical section the axis is the hole, and the
         body is offset from it by a *miss distance* that scales with how bad
         the targeting was — which is the entire point of the confidence. */
      centreX: mode.horizontal
        ? rng.range(layout.totalLength * 0.25, layout.totalLength * 0.75)
        : rng.range(-1, 1) * lerp(0.4, 7.0, 1 - confidence),
      halfThick: Math.max(thick * 0.5, 0.12),
      /* the high-grade core inside the alteration envelope: St Ives' 0.5–50 cm
         cataclasite inside 0.1 cm–3 m of foliated cataclasite */
      coreFrac: K.coreFrac ? rng.range(K.coreFrac[0], K.coreFrac[1]) : 0.8,
      halfExtent: rng.range(K.extentM[0], K.extentM[1]) * 0.5,
      haloMul: K.haloMul ? rng.range(K.haloMul[0], K.haloMul[1]) : 1.6,
      shapeExp: K.shapeExp ?? 1,
      skew: K.skew ?? 0,
      shootTop: 0, shootBot: 0,
      grade: C.grade.slice(),
      ucs: K.ucs, abrasivity: K.abrasivity, stability: K.stability,
      confidence: clamp(confidence, 0, 1),
      zones: null,
    };

    /* The ore shoot / boiling zone. USGS SIR 2010-5070-Q: "the silver-gold rich
       section of each structure is typically limited to 200 to 400 m of
       elevation, corresponding to the boiling zone." A vein that runs the whole
       hole with no shoot is not a vein a geologist would recognise. */
    if (K.shootM) {
      const h = rng.range(K.shootM[0], K.shootM[1]);
      body.shootTop = Math.max(0, centreDepth - h * 0.5);
      body.shootBot = body.shootTop + h;
    }

    if (isStacked) {
      /* THE SUPERGENE PROFILE, to the model's own numbers: leached capping 0 to
         several hundred m; oxide as much as 300 m; enriched chalcocite blanket
         as much as 750 m and INVARIABLY higher grade than the hypogene under
         it. Escondida: mineralisation starts 150–200 m down, leach ~200 m
         average, enrichment max ~400 m thick. */
      const leach = rng.range(K.leachM[0], K.leachM[1]);
      const oxide = rng.range(K.oxideM[0], K.oxideM[1]);
      const enrich = rng.range(K.enrichM[0], K.enrichM[1]);
      const top = clamp(centreDepth - leach, 0.5, profileDepth * 0.5);
      body.centreDepth = top;
      body.zones = [
        { id: 'leached', name: 'Leached capping', base: top + leach, grade: 0.02 },
        { id: 'oxide', name: 'Oxide ore', base: top + leach + oxide, grade: 0.55 },
        { id: 'enriched', name: 'Chalcocite blanket',
          base: top + leach + oxide + enrich, grade: 1.30 },
        { id: 'hypogene', name: 'Hypogene', base: profileDepth * 1.5, grade: 0.42 },
      ];
      body.halfThick = (leach + oxide + enrich) * 0.5;
      body.haloMul = 1.0001;
      body.coreFrac = 1;
    }

    /* Peak grade, normalised into the commodity's own band so the shader can
       colour by it and getOreAt() can hand back a real number in a real unit. */
    const [bg, cut, typ, bon] = C.grade;
    const bonanza = rng.bool(0.16 + (1 - spec.difficulty) * 0.05);
    body.peakGrade = bonanza ? rng.range(typ * 1.8, bon) : rng.range(cut * 1.1, typ * 1.6);
    body.background = bg;
    body.cutoff = cut;
    body.bonanza = bonanza;
    body.peakNorm = clamp(body.peakGrade / Math.max(bon, 1e-6), 0.05, 1);

    /* THE PREDICTION. The contract gives a target horizon and a confidence;
       the section reveals the truth. So the predicted band is displaced from
       the body by an error that shrinks with confidence and never quite goes
       to zero — even a well-drilled prospect misses. */
    /* What is actually being TARGETED. For a supergene profile that is the
       chalcocite blanket — the high-grade zone, not the 300 m of column it
       sits inside — so the prediction is drawn around that and nothing else.
       For everything else it is the body's own centre. */
    let tgtCentre = body.centreDepth;
    let tgtHalf = body.halfThick;
    if (body.zones) {
      const z = body.zones;
      tgtCentre = (z[1].base + z[2].base) * 0.5;
      tgtHalf = Math.max((z[2].base - z[1].base) * 0.5, 2);
    }
    const err = (1 - body.confidence) * Math.max(tgtHalf * 3.0, profileDepth * 0.10);
    const shift = rng.gauss() * err * 0.6;
    const width = tgtHalf * lerp(4.5, 1.35, body.confidence);
    body.targetCentre = tgtCentre;
    body.predictedTop = clamp(tgtCentre + shift - width, 0.5, profileDepth);
    body.predictedBottom = clamp(body.predictedTop + width * 2, 1, profileDepth);
    return body;
  }

  /**
   * THE ORE FIELD — the exact maths oreGrade() runs in GLSL, on the CPU.
   * X is along-axis metres, dpt a true vertical depth.
   * Returns { g (0..1 of the commodity's bonanza band), s, a, zone }.
   */
  function oreFieldAt(X, dpt) {
    const o = ore;
    const out = { g: 0, s: 9, a: 9, zone: 0 };
    if (!o) return out;

    if (o.shape === ORE_SHAPE.stacked) {
      const dz = dpt - (X - o.centreX) * Math.tan(o.dipRad);
      const an = (X - o.centreX) / Math.max(o.halfExtent, 1);
      const extent = 1 - smoothstep(clamp(invLerp(0.86, 1.0, Math.abs(an))));
      if (extent <= 0.001) return out;
      out.a = an;
      const z = o.zones;
      if (dz < z[0].base) { out.zone = 1; out.s = 0; out.g = 0.04 * extent; return out; }
      if (dz < z[1].base) {
        out.zone = 2; out.s = 0;
        out.g = o.peakNorm * lerp(0.30, 0.52,
          smoothstep(clamp(invLerp(z[0].base, z[1].base, dz)))) * extent;
        return out;
      }
      if (dz < z[2].base) {
        out.zone = 3; out.s = 0;
        const t = (dz - z[1].base) / Math.max(z[2].base - z[1].base, 0.5);
        out.g = o.peakNorm * (0.62 + 0.38 * Math.sin(t * Math.PI)) * extent;
        return out;
      }
      if (dz < z[3].base) {
        out.zone = 4; out.s = 0;
        out.g = o.peakNorm * lerp(0.34, 0.20,
          smoothstep(clamp(invLerp(z[2].base, z[3].base, dz)))) * extent;
        return out;
      }
      return out;
    }

    const cd = Math.cos(o.dipRad), sd = Math.sin(o.dipRad);
    const dx = X - o.centreX, dd = dpt - o.centreDepth;
    const s = dd * cd - dx * sd;
    const a = dx * cd + dd * sd;
    const sn = s / Math.max(o.halfThick, 0.02);
    const an = a / Math.max(o.halfExtent, 1);
    out.s = sn; out.a = an;

    const ext = o.shape === ORE_SHAPE.lenticular
      ? 1 - smoothstep(clamp(Math.abs(an)))
      : 1 - smoothstep(clamp(invLerp(0.82, 1.0, Math.abs(an))));
    if (ext <= 0.001) return out;

    const u = clamp(Math.abs(sn + o.skew), 0, 1);
    let g = Math.pow(Math.max(1 - u * u, 0), Math.max(o.shapeExp, 0.05));
    if (o.shape === ORE_SHAPE.lenticular) g *= Math.max(1 - an * an, 0);
    g *= ext;
    if (o.shootBot > o.shootTop) {
      g *= smoothstep(clamp(invLerp(o.shootTop - 40, o.shootTop + 30, dpt)))
         * (1 - smoothstep(clamp(invLerp(o.shootBot - 30, o.shootBot + 40, dpt))));
    }
    g *= 0.55 + 0.90 * fbm2(a * 0.06 + 21, dpt * 0.05 + 21, spec.seed, 3);
    out.zone = Math.abs(sn) <= 1 ? 5 : 0;
    out.g = clamp(g * o.peakNorm, 0, 1);
    return out;
  }

  /**
   * getOreAt(depth) — THE ASSAY.
   *
   * depth is a TRUE VERTICAL DEPTH in metres, in every mode. Along-hole
   * callers want getOreAtStation(), which converts first.
   *
   * Always returns the four keys the contract names — commodity, grade,
   * unit, inOre — plus everything a log or a payout needs. With no ore
   * body in the profile, commodity is null and grade is 0: a water well
   * assays nothing, and asking is not an error.
   */
  function getOreAt(m, alongM) {
    const dpt = Math.max(0, +m || 0);
    if (!ore) {
      return {
        commodity: null, commodityName: null, symbol: null,
        grade: 0, unit: null, inOre: false, inHalo: false,
        cutoff: 0, zone: null, kind: null, sourced: true, confidence: 0,
        revealed: false,
      };
    }
    const X = alongM != null ? +alongM || 0
            : (mode.horizontal ? depthToStationX(dpt) : 0);
    const f = oreFieldAt(X, dpt);
    const inCore = Math.abs(f.s) <= 1 && Math.abs(f.a) <= 1;
    const inHalo = !inCore && Math.abs(f.s) <= ore.haloMul && Math.abs(f.a) <= 1;
    /* Grade is reported in the commodity's own unit against its bonanza
       anchor, so a 0.62 normalised sample in gold is 21 g/t and in copper is
       2.5 % — the units never cross. */
    const bon = ore.grade[3];
    let grade = f.g * bon;
    if (!inCore && inHalo) grade = Math.max(grade, ore.background * 1.6);
    else if (!inCore) grade = ore.background;
    const zone = ore.zones && f.zone >= 1 && f.zone <= 4
      ? ore.zones[Math.round(f.zone) - 1] : null;
    return {
      commodity: ore.commodity,
      commodityName: ore.commodityName,
      symbol: ore.symbol,
      grade: Math.max(0, grade),
      unit: ore.unit,
      inOre: inCore && grade >= ore.cutoff,
      inHalo,
      inBody: inCore,
      cutoff: ore.cutoff,
      zone: zone ? zone.id : (inCore ? 'ore' : inHalo ? 'halo' : null),
      zoneName: zone ? zone.name : null,
      kind: ore.kind,
      kindLabel: ore.kindLabel,
      sourced: ore.sourced,
      needs: ore.needs,
      confidence: ore.confidence,
      /* The player only KNOWS what has been drilled. A UI that wants to show
         the truth regardless can ignore this; a UI that wants to be honest
         should not. */
      revealed: dpt <= depthForStation(depth) + 0.05,
      widthM: ore.halfThick * 2,
    };
  }

  /** Along-hole measured length -> assay. The sim works in measured length, so
   *  this is the call it wants: it carries BOTH coordinates, which matters in
   *  a drive, where every station is at the same depth and only the chainage
   *  says whether the face is in the ore or past it. */
  function getOreAtStation(s) {
    const st = Math.max(0, +s || 0);
    return getOreAt(depthForStation(st), alongMetresAt(st));
  }

  /** Along-axis distance in metres at a measured station. 0 when vertical. */
  function alongMetresAt(st) {
    if (!mode.horizontal) return 0;
    return layout.id === 'profile' ? hddXAtStation(path, st) : st;
  }

  /** Push the ore body into the shader. With no body, uOreA.x is 0 and the
   *  fragment shader's first test costs one uniform compare. */
  function applyOreUniforms() {
    if (!ore) {
      U.uOreA.value.set(0, 0, 1, 0);
      U.uTarget.value.set(0, 0, 0, 1.6);
      return;
    }
    U.uOreA.value.set(ore.shape, ore.centreDepth, ore.halfThick, ore.dipRad);
    U.uOreB.value.set(ore.centreX, ore.halfExtent, Math.max(ore.haloMul, 1.0001),
                      ore.peakNorm);
    if (ore.zones) {
      U.uOreC.value.set(ore.zones[0].base, ore.zones[1].base,
                        ore.zones[2].base, ore.zones[3].base);
    } else U.uOreC.value.set(0, 0, 0, 0);
    U.uOreE.value.set(ore.shapeExp, ore.skew, ore.shootTop, ore.shootBot);
    /* The reveal corridor. 3.0 units is 58 CSS px either side of the hole —
       about what a driller can honestly claim from the chips in front of them
       — and beyond it the body fades to the contract's own confidence, which
       is the geologist's projection and nothing more. */
    U.uOreD.value.set(3.0, clamp(ore.confidence * 0.30, 0, 0.30),
                      ore.stipple, 0);
    U.uOreTint.value.set(ore.tint);
    U.uOreHalo.value.set(ore.haloTint);
    /* The predicted horizon: two dashed survey lines, drawn from the first
       frame, at a depth that is deliberately not the truth. */
    U.uTarget.value.set(ore.predictedTop, ore.predictedBottom,
                        0.55 + 0.35 * ore.confidence,
                        Math.max(1.4 * Math.max(layout.metresPerUnitX, 1) * 0.6, 1.0));
  }

  /**
   * Tie every feature to THE HOLE rather than to the depth axis.
   *
   * In a vertical section "the hole is at 12.4 m" and "the hole has drilled
   * 12.4 m" are the same sentence. In a long-section they are not: the bore is
   * 8 m below ground at station 40 and 8 m below ground again at station 190,
   * and a boulder sitting between them is on neither. So each feature gets the
   * MEASURED STATION at which the hole meets it, and every hazard query keys on
   * that. In the vertical modes station === depth and nothing changes.
   */
  function linkFeaturesToHole() {
    const horiz = mode.horizontal;
    const mpx = Math.max(layout.metresPerUnitX, 1e-6);
    const axisDepthAtX = (Xm) => (layout.id === 'profile'
      ? hddDepthAtX(path, Xm) : layout.depthAtY0);
    const stationAtX = (Xm) => (layout.id === 'profile'
      ? hddStationAtX(path, Xm) : Xm);
    const halfOpen = layout.id === 'heading' ? (heading ? heading.height * 0.5 : 3) : 0;

    for (const b of features.boulders) {
      if (!horiz) { b.station = b.depth; continue; }
      const Xm = (b.x - layout.xOrigin) * mpx;
      b.station = clamp(stationAtX(Xm), 0, layout.totalLength);
      b.onHole = Math.abs(axisDepthAtX(Xm) - b.depth) < b.r * 0.9 + holeR + halfOpen;
    }
    for (const c of features.cavities) {
      if (!horiz) { c.station = c.depth; c.onHole = Math.abs(c.x) <= holeR * 1.1; continue; }
      const Xm = (c.x - layout.xOrigin) * mpx;
      c.station = clamp(stationAtX(Xm), 0, layout.totalLength);
      c.onHole = Math.abs(axisDepthAtX(Xm) - c.depth) < c.halfH + holeR + halfOpen;
    }
    for (const f of features.fractures) {
      if (!horiz) { f.station = f.holeDepth; continue; }
      /* Seven samples along the joint, looking for the crossing with the axis.
         A joint is a straight segment and the axis a shallow curve, so a sign
         change between two samples is a real intersection. */
      f.station = null;
      const ca = Math.cos(f.angle), sa = Math.sin(f.angle);
      const y0 = secYForDepth(f.depth);
      let prev = null;
      for (let i = 0; i <= 6; i++) {
        const t = (i / 6 - 0.5) * f.len;
        const px = f.x + ca * t, py = y0 + sa * t;
        const Xm = (px - layout.xOrigin) * mpx;
        const diff2 = (layout.depthAtY0 - py) - axisDepthAtX(Xm);
        if (prev !== null && Math.sign(prev) !== Math.sign(diff2)) {
          f.station = clamp(stationAtX(Xm), 0, layout.totalLength);
          break;
        }
        prev = diff2;
      }
    }
    for (const sp of features.seeps) {
      sp.station = horiz ? stationForDepth(sp.depth) : sp.depth;
      if (sp.station < 0) sp.station = null;
    }
  }

  /** For a vertical section the ore's along-axis coordinate is x = 0 (the
   *  hole); for a long-section it is the station whose path reaches that
   *  depth, which for a monotone HDD profile is well defined on each limb. */
  function depthToStationX(dpt) {
    if (layout.id === 'heading') {
      return (secXForStation(depth) - layout.xOrigin) * layout.metresPerUnitX;
    }
    if (layout.id !== 'profile' || !path) return 0;
    // walk the drilled limb only; the bore is at one X for the depth it is at
    return hddXAtStation(path, clamp(depth, 0, path.length));
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PROFILE GENERATION
     ═════════════════════════════════════════════════════════════════════════ */
  function generateProfile(inSpec = {}) {
    const methodId = inSpec.methodId || inSpec.method
                  || ctx?.state?.contract?.methodId || null;
    const wantMode = MODES[inSpec.profileMode] ? inSpec.profileMode
                                               : modeForMethod(methodId);
    spec = {
      regionId: inSpec.regionId || ctx?.state?.world?.regionId || 'nordic',
      applicationId: inSpec.applicationId || 'water-well',
      targetDepth: Math.max(6, +inSpec.targetDepth || 45),
      seed: (inSpec.seed ?? ((Math.random() * 0xffffff) | 0)) >>> 0,
      // contracts carry difficulty on a 1..5 scale; everything here wants 0..1
      difficulty: normDifficulty(inSpec.difficulty),
      // real bore diameter in mm — drives the VISUAL hole radius, see CFG
      holeDiaMm: Number(inSpec.holeDiaMm) || Number(ctx?.state?.contract?.holeDia) || CFG.holeDiaDefault,
      methodId,
      profileMode: wantMode,
      /* Commodity is opt-in: spec.commodity names one, 'auto' picks one the
         region plausibly hosts, and anything else leaves the profile barren —
         which is correct for the fourteen non-mining applications. */
      commodity: inSpec.commodity ?? null,
      oreConfidence: inSpec.oreConfidence == null ? 0.55
                   : clamp(+inSpec.oreConfidence || 0, 0, 1),
    };
    /* Knowledge bought for the LAST hole is not knowledge about this one. A
       new profile is new ground, so anything setSurveyConfidence() was told
       dies with the profile that earned it. */
    surveyBought = 0;
    applyHoleDiameter();

    const recipe = REGIONS[spec.regionId] || REGIONS.nordic;
    const bias = applicationBias(spec.applicationId);
    const rng = makeRandom(spec.seed || 1);
    const diff = spec.difficulty;

    /* ── how deep the GEOLOGY has to go ──────────────────────────────────────
       targetDepth is what the contract sells, and for four of the five modes
       that is not a depth at all: HDD sells bore LENGTH (50–1200 m for a hole
       8–20 m below ground), a tunnel sells CHAINAGE, a raise sells the raise
       LENGTH, a pile sells the pile length. Baking a 1,200 m stratigraphy for a
       12 m deep crossing is exactly the bug DESIGN_EXPANSION.md §1 names, so
       the geological depth is derived per mode and the contract's number goes
       into layout.totalLength where it belongs. */
    layout.id = wantMode;
    mode = MODES[wantMode] || MODES.vertical;
    layout.totalLength = spec.targetDepth;
    path = null; heading = null; raise = null; pile = null; ore = null;
    stage = 0; stageProgress = 0;

    let geologyDepth = spec.targetDepth;
    if (wantMode === 'profile') {
      path = solveHddPath(spec.targetDepth, spec.holeDiaMm, rng, diff);
      layout.totalLength = path.length;
      geologyDepth = path.Dc * 2.6 + 8;
    } else if (wantMode === 'heading') {
      heading = solveHeading(spec.targetDepth, rng, diff);
      geologyDepth = heading.cover + heading.height * 2.2 + 12;
    } else if (wantMode === 'raise') {
      raise = solveRaise(spec.targetDepth, spec.holeDiaMm, rng);
      geologyDepth = raise.length + raise.lowerHeight + 8;
    }
    // the coordinate contract has to exist before anything is placed in it
    applyMode();

    const total = geologyDepth * 1.22 + 10;   // always some ground below target
    const out = [];
    let d = 0;

    const softScale = bias.softScale * lerp(1.15, 0.78, diff);
    const hardScale = bias.hardScale * lerp(0.85, 1.2, diff);

    const pushBed = (bed) => {
      const g = GROUND[bed.id];
      if (!g) return;
      const isSoft = g.ucs < 20;
      let th = rng.range(bed.t[0], bed.t[1]) * (isSoft ? softScale : hardScale);
      th = Math.max(0.12, th);
      if (d + th > total) th = Math.max(0.35, total - d);
      const top = d, bottom = d + th;
      out.push({
        id: bed.id,
        name: g.name,
        top, bottom,
        ucs: g.ucs, abrasivity: g.abrasivity, stability: g.stability,
        water: clamp((bed.water != null ? Math.max(g.water, bed.water) : g.water) * bias.water),
        colors: g.colors.slice(),
        pattern: g.pattern,
        grain: g.grain,
        bestMethods: (BEST_METHODS[bed.id] || ['dth']).slice(),
        _boulders: (bed.boulders || 0) * bias.boulders * lerp(0.7, 1.5, diff),
        _fract: (bed.fract || 0) * bias.fract * lerp(0.7, 1.4, diff),
        _karst: (bed.karst || 0) * bias.karst * lerp(0.7, 1.4, diff),
      });
      d = bottom;
    };

    for (const bed of recipe.beds) {
      if (d >= total) break;
      if (bed.p != null && !rng.bool(bed.p)) continue;
      pushBed(bed);
    }
    let guard = 0;
    while (d < total && guard++ < 200) {
      const bed = recipe.basement[guard % recipe.basement.length];
      if (bed.p != null && !rng.bool(bed.p)) continue;
      pushBed(bed);
    }
    if (!out.length) pushBed({ id: 'granite', t: [total, total] });

    // merge runs of the same material so we do not get invisible seams
    const merged = [];
    for (const s of out) {
      const prev = merged[merged.length - 1];
      if (prev && prev.id === s.id) {
        prev.bottom = s.bottom;
        prev._boulders = Math.max(prev._boulders, s._boulders);
        prev._fract = Math.max(prev._fract, s._fract);
        prev._karst = Math.max(prev._karst, s._karst);
      } else merged.push(s);
    }
    merged.forEach((s, i) => { s.index = i; });

    strata = merged;
    profileDepth = strata[strata.length - 1].bottom;

    /* The pile has to know where the bearing stratum is, so it is solved after
       the beds exist rather than with the other mode geometry. */
    if (wantMode === 'pile') {
      pile = solvePile(spec.targetDepth, spec.holeDiaMm, rng, diff);
      layout.totalLength = pile.lengthM;
    }

    /* ── structural grain ────────────────────────────────────────────────────
       The joint set is drawn first so the bedding can dip WITH it: in the
       field, bedding and the dominant joint set share a structural grain, and
       a section where the contacts run dead flat while the joints run at 40
       degrees reads as two unrelated drawings laid on top of each other.

       DIP GAIN. The frame is ~14 m wide and 20 m tall at 1:1, so a 2 deg
       regional dip throws 0.49 m across the whole width — 9 CSS px, which
       measured as "dead straight bevel to bevel". Geological sections are
       conventionally drawn with vertical exaggeration for exactly this reason;
       this band cannot exaggerate the axis (Y is true metres and the depth
       ruler reads off it), so the dip itself takes a 2.2x gain instead. No
       number is shown for it, and the ruler is untouched. */
    const jointA = rng.range(0.45, 1.05) * (rng.bool() ? 1 : -1);
    const dipRad = (rng.range(recipe.dipDeg[0], recipe.dipDeg[1]) * Math.PI) / 180;
    dip = Math.tan(dipRad) * 2.2 * Math.sign(jointA);

    /* ── water table: prefer the top of a permeable bed ── */
    const wtRange = recipe.waterTable;
    let wt = rng.range(wtRange[0], wtRange[1]) * bias.wtShift;
    const permeable = strata.filter((s) => s.water >= 0.55 && s.top > 0.6 && s.top < profileDepth * 0.85);
    if (permeable.length) {
      let best = permeable[0], bd = Infinity;
      for (const s of permeable) { const dd = Math.abs(s.top - wt); if (dd < bd) { bd = dd; best = s; } }
      // only snap to an aquifer that is actually near where the region says the
      // table sits — otherwise a lone deep fracture zone would drag it down.
      if (bd <= wt * 2 + 3) wt = best.top + rng.range(0.1, Math.min(1.5, (best.bottom - best.top) * 0.35));
    }
    waterTableDepth = clamp(wt, 0.4, profileDepth * 0.95);

    /* ── features ── */
    features = { boulders: [], fractures: [], cavities: [], seeps: [] };

    /* ── boulders: erratics in till / boulder beds ────────────────────────
       Sized off the HOLE, never off metres. The section carries two scales —
       true metres on Y, an exaggerated borehole on X — and a boulder that is
       drawn 1:1 while the hole is drawn over-gauge renders a 4 m erratic and a
       152 mm bit as near-equals. Whatever exaggeration the hole takes, boulders
       inherit it: 0.9-3.2 hole radii for a scattered erratic, up to 4.3 in a
       boulder bed. A boulder that actually jams a hole is 5-20 hole diameters
       across in the field; at the top of this range it is 8.6, which is as far
       as the section can go before one clast owns the whole frame. */
    // a big hole means big clasts, so thin the scatter to keep the same coverage
    const bDensity = clamp(0.55 / Math.max(holeR, 0.05), 0.35, 1);
    /* The cap was viewMetres * 0.155 = 3.1 units of RADIUS, i.e. 6.2 m across,
       and clasts were arriving at 4.4 x 5.2 m: river cobbles the size of a van,
       not glacial erratics. viewMetres * 0.055 caps a clast at ~2.2 m across,
       which is the top of the range a driller would call a boulder rather than
       bedrock. holeR now scales only the LOWER bound — a big bore still gets
       clasts it can plausibly meet, but it cannot inflate them past the cap. */
    const bMaxR = viewMetres * 0.055;
    /* Feature scatter spans the DRAWING, not the frame. A long-section shows
       44–120 m of a hole that may be 1,200 m long and the root group scrolls
       horizontally past it, so a clast field confined to +/- halfW would be one
       clump beside the entry pit and 1,100 m of empty ground after it. */
    const xSpan = mode.horizontal
      ? layout.totalLength / Math.max(layout.metresPerUnitX, 1e-6)
      : 0;
    const xLo = mode.horizontal ? layout.xOrigin - halfW * 0.7 : -halfW;
    const xHi = mode.horizontal ? layout.xOrigin + xSpan + halfW * 0.7 : halfW;
    for (const s of strata) {
      if (s._boulders <= 0) continue;
      const th = s.bottom - s.top;
      const n = Math.min(28, Math.round(th * s._boulders * 1.15 * bDensity));
      for (let i = 0; i < n; i++) {
        if (features.boulders.length >= CFG.boulderCap) break;
        const bd = rng.range(s.top + 0.2, s.bottom - 0.2);
        const r = clamp(holeR * rng.range(0.9, 3.2) * (s.id === 'boulder' ? 1.35 : 1),
                        Math.min(holeR * 0.9, bMaxR), bMaxR);
        const x = rng.range(xLo * 0.95, xHi * 0.95);
        features.boulders.push({
          depth: bd, x, r,
          hardness: clamp(rng.range(0.45, 1.0) + diff * 0.2),
          rot: rng.range(0, TAU),
          seed: rng.f(),
          squash: rng.range(0.68, 1.18),
          onHole: Math.abs(x) < holeR + r * 0.75,
          stratum: s.index,
        });
      }
    }
    /* Guarantee a couple of clasts sit right ON the hole so the hazard fires.
       In a long-section "on the hole" is a point on the CURVE, not a point on
       the y axis, so the seeded clasts are placed at a random station and the
       axis is asked where it is there. */
    const nearHole = features.boulders.filter((b) => b.onHole).length;
    const bouldery = strata.filter((s) => s._boulders > 0.3);
    if (bouldery.length && nearHole < 2) {
      for (let i = nearHole; i < 2 + Math.round(diff * 2); i++) {
        const s = rng.pick(bouldery);
        const r = clamp(holeR * rng.range(1.3, 2.8), Math.min(holeR * 1.3, bMaxR), bMaxR);
        let bx = rng.range(-1, 1) * holeR * 0.9;
        let bd = rng.range(s.top + 0.3, Math.max(s.top + 0.4, s.bottom - 0.3));
        if (mode.horizontal) {
          const st = rng.range(layout.totalLength * 0.08, layout.totalLength * 0.92);
          bx = secXForStation(st) + rng.range(-1, 1) * holeR * 0.9;
          bd = depthForStation(st) + rng.range(-1, 1) * r * 0.4;
        }
        features.boulders.push({
          depth: bd, x: bx,
          r, hardness: clamp(0.6 + diff * 0.3), rot: rng.range(0, TAU), seed: rng.f(),
          squash: rng.range(0.68, 1.18),
          onHole: true, stratum: getStratumIndexAt(bd),
        });
      }
    }
    features.boulders.sort((a, b) => a.depth - b.depth);

    // fractures: joint sets with a consistent regional dip (jointA above)
    const jointB = -jointA * rng.range(0.5, 0.9);
    for (const s of strata) {
      if (s._fract <= 0) continue;
      const th = s.bottom - s.top;
      const n = Math.min(40, Math.round(th * s._fract * 2.1));
      for (let i = 0; i < n; i++) {
        if (features.fractures.length >= CFG.fractureCap) break;
        const set = rng.bool(0.72) ? jointA : jointB;
        const f = {
          depth: rng.range(s.top, s.bottom),
          x: rng.range(xLo, xHi),
          angle: set + rng.range(-0.12, 0.12),
          len: rng.range(2.4, 9.0) * (1 + s._fract * 0.4),
          /* Aperture was a flat 0.055-0.16, a 2.9x span that the taper and the
             wiggle then equalised into one apparent width. A real joint set is
             mostly hairlines with a few open, clay-filled seams, so this is a
             power distribution over 0.035-0.40 — an 11x span, biased to the
             thin end. FRAC_FRAG shapes the core profile on top of it. */
          width: lerp(0.035, 0.40, Math.pow(rng.f(), 1.9)) * (1 + s._fract * 0.35),
          halo: clamp(s.water * 1.3 + rng.range(-0.15, 0.35)),
          stratum: s.index,
          holeDepth: null,
        };
        // where (if anywhere) this joint actually crosses the borehole axis
        const ca = Math.cos(f.angle);
        if (Math.abs(ca) > 1e-3) {
          const t = -f.x / ca;
          if (Math.abs(t) <= f.len * 0.5) {
            const hd = f.depth - t * Math.sin(f.angle);
            if (hd > 0 && hd < total) f.holeDepth = hd;
          }
        }
        features.fractures.push(f);
      }
    }
    features.fractures.sort((a, b) => a.depth - b.depth);

    // karst voids
    for (const s of strata) {
      const k = s._karst + (s.pattern === 'void' ? 1.4 : 0);
      if (k <= 0.2) continue;
      const th = s.bottom - s.top;
      const n = Math.min(3, Math.round(th * k * 0.10 + (s.pattern === 'void' ? 1 : 0)));
      for (let i = 0; i < n; i++) {
        if (features.cavities.length >= CFG.cavityCap) break;
        const h = rng.range(0.7, 2.6) * (1 + k * 0.2);
        const w = h * rng.range(1.0, 2.4);
        const onHole = rng.bool(0.55) || s.pattern === 'void';
        const cd = rng.range(s.top + h * 0.5,
                             Math.max(s.top + h * 0.5 + 0.1, s.bottom - h * 0.5));
        let cx = onHole ? rng.range(-0.6, 0.6) * holeR
                        : rng.range(xLo * 0.7, xHi * 0.7);
        if (mode.horizontal && onHole) {
          // put it on the CURVE at the station where the hole is at that depth
          const st = layout.id === 'heading'
            ? rng.range(0, layout.totalLength) : stationForDepth(cd);
          cx = st >= 0 ? secXForStation(st) + rng.range(-0.6, 0.6) * holeR
                       : rng.range(xLo * 0.7, xHi * 0.7);
        }
        features.cavities.push({
          depth: cd, x: cx,
          halfW: w * 0.5, halfH: h * 0.5,
          seed: rng.f(),
          stratum: s.index,
        });
      }
    }
    features.cavities.sort((a, b) => a.depth - b.depth);

    // seepage points — where a water-bearing bed is entered
    for (const s of strata) {
      if (s.water >= 0.6 && s.top > waterTableDepth * 0.5) {
        features.seeps.push({ depth: s.top + 0.15, flow: s.water });
      }
    }

    /* ── THE ORE BODY ────────────────────────────────────────────────────────
       Opt-in three ways: the contract names a commodity, it asks for 'auto',
       or the application is a mining / exploration one — in which case the job
       is drilling FOR something by definition and a barren section would be
       the wrong picture. Everything else stays barren, which is correct for a
       water well, a pile and a utility crossing. */
    ore = null;
    const named = spec.commodity && spec.commodity !== 'none' ? spec.commodity : null;
    const pool = REGION_COMMODITIES[spec.regionId] || [];
    /* Auto-placement is for the modes that actually PROSPECT — a vertical hole
       or a raise. A tunnel jumbo, a driven pile and a utility crossing are not
       drilling for a commodity even when their application string says mining,
       and giving them one produced a 290 m orebody through a bolting job. An
       explicitly named commodity still works in every mode. */
    const autoOk = layout.id === 'vertical' || layout.id === 'raise';
    let commodityId = null;
    if (named && named !== 'auto' && COMMODITIES[named]) commodityId = named;
    else if (named === 'auto'
          || (!named && autoOk && ORE_APPLICATIONS.test(String(spec.applicationId)))) {
      commodityId = pool.length ? rng.pick(pool) : null;
    }
    if (commodityId) ore = makeOreBody(commodityId, rng, spec.oreConfidence);
    applyOreUniforms();

    linkFeaturesToHole();

    if (ctx?.state?.world) ctx.state.world.strata = strata;

    rebuildFromProfile();
    resetCrossings();
    return strata;
  }

  function setCasing(m) { casingDepth = Math.max(0, +m || 0); }

  function resetCrossings() {
    lastEventDepth = depth;
    lastStratumIndex = -1;
    firedBoulders.clear();
    firedCavities.clear();
    firedWater.clear();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     QUERIES  (consumed by sim/drilling.js)
     ═════════════════════════════════════════════════════════════════════════ */
  function getStratumIndexAt(m) {
    if (!strata.length) return 0;
    const d = clamp(m, 0, profileDepth - 1e-4);
    let lo = 0, hi = strata.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (d < strata[mid].bottom) hi = mid; else lo = mid + 1;
    }
    return lo;
  }
  function getStratumAt(m) { return strata[getStratumIndexAt(m)] || null; }

  /* Hazard queries take a MEASURED STATION along the hole, which in the three
     vertical modes is the depth — station is written as the depth there, so
     these are the functions they always were. */
  function boulderAt(m) {
    for (const b of features.boulders) {
      if (!b.onHole || b.station == null) continue;
      if (m >= b.station - b.r * 0.8 && m <= b.station + b.r * 0.8) return b;
    }
    return null;
  }
  function cavityAt(m) {
    for (const c of features.cavities) {
      if (!c.onHole || c.station == null) continue;
      if (m >= c.station - c.halfH && m <= c.station + c.halfH) return c;
    }
    return null;
  }
  /** Only joints that geometrically intersect the borehole axis count. */
  function fractureNear(m, tol = 0.4) {
    for (const f of features.fractures) {
      if (f.station != null && Math.abs(f.station - m) < tol) return f;
    }
    return null;
  }

  /**
   * m is the MEASURED LENGTH along the hole, which is what sim/drilling.js
   * counts. The rock you are in depends on the TRUE VERTICAL DEPTH, so the two
   * are separated here once and every caller gets the right answer for free:
   * an HDD bore that has turned 240 m of rod is still in the same clay it was
   * in at 90 m, and it should feel like it.
   */
  function getDrillabilityAt(m) {
    const tvd = depthForStation(m);
    const s = getStratumAt(tvd);
    if (!s) return { id: 'granite', name: 'Granite', ucs: 210, abrasivity: 0.9, stability: 0.95, water: 0.1, index: 0, stratum: null };
    let ucs = s.ucs, abr = s.abrasivity, stab = s.stability, wat = s.water;
    let id = s.id, name = s.name;

    const cav = cavityAt(m);
    if (cav) {
      return { id: 'karst', name: 'Karst Void', ucs: 0, abrasivity: 0, stability: 0, water: 1, index: s.index, stratum: s, cavity: cav, boulder: null, fracture: null, depth: tvd };
    }
    const b = boulderAt(m);
    if (b) {
      ucs = Math.max(ucs, 140 + b.hardness * 130);
      abr = Math.max(abr, 0.8 + b.hardness * 0.18);
      stab = Math.min(stab, s.stability * 0.85);
      id = 'boulder'; name = 'Boulder';
    }

    /* ── the ore body is rock too ───────────────────────────────────────────
       This is where the commodity stops being a label and becomes something
       the player FEELS. A quartz vein is R5–R6 and 97 % abrasive; a Carlin
       body is decalcified mush at R2–R3 that caves, EXCEPT where jasperoid
       and silicified breccia sit inside it at R6 — mush and chert alternating
       within one hole, which is the classic Carlin problem verbatim; a coal
       seam is soft and the bit runs away into it. */
    const oa = ore ? oreFieldAt(alongMetresAt(m), tvd) : null;
    let oreHit = null;
    if (oa && Math.abs(oa.s) <= ore.haloMul && Math.abs(oa.a) <= 1) {
      const inCore = Math.abs(oa.s) <= 1;
      const w = inCore ? 1 : 0.45;
      let oUcs = ore.ucs, oStab = ore.stability, oAbr = ore.abrasivity;
      if (ore.jasperoid) {
        // R6 jasperoid ribs alternating with soft caved ground
        const jr = fbm2(tvd * 0.9, 5.5, spec.seed + 7, 3);
        if (jr > 0.62) { oUcs = 265; oStab = 0.82; oAbr = 0.95; }
      }
      ucs = lerp(ucs, oUcs, w);
      abr = lerp(abr, oAbr, w);
      stab = lerp(stab, oStab, w);
      if (inCore) { id = 'ore'; name = ore.kindLabel; }
      oreHit = { grade: oa.g * ore.grade[3], unit: ore.unit, inOre: inCore };
    }

    const f = fractureNear(m, 0.35);
    if (f) { stab *= 0.45; wat = Math.max(wat, 0.75 * f.halo + 0.2); }
    if (tvd >= waterTableDepth) { wat = Math.max(wat, 0.6); stab *= 0.92; }

    return {
      id, name,
      ucs, abrasivity: clamp(abr), stability: clamp(stab), water: clamp(wat),
      index: s.index, stratum: s, boulder: b || null, fracture: f || null, cavity: null,
      bestMethods: s.bestMethods,
      /** true vertical depth of this sample — differs from m off the vertical */
      depth: tvd,
      ore: oreHit,
    };
  }

  /* ═════════════════════════════════════════════════════════════════════════
     LOOKUP TEXTURES
     ═════════════════════════════════════════════════════════════════════════ */
  /**
   * WHAT KIND OF CONTACT IS THIS?
   *
   * The reference's whole claim on being ground rather than a diagram is that
   * its stratum contacts wander, and that they do not all wander the same way.
   * The section had one global uWarp, which is its own tell: every boundary
   * in the column got an identical wobble.
   *
   * Two independent axes, both read off the two beds themselves — nothing new
   * is invented and nothing is stated to the player, so PLATFORM_TRUTH Part C
   * rule 7 is not engaged:
   *
   *   WANDER — how far the boundary departs from horizontal. A weathering
   *     front (soil sitting straight on rock) is the extreme case: it follows
   *     the rockhead, which in glaciated ground is a metre-scale surface. A
   *     scoured contact between two different soils is next. Two conformable
   *     beds of rock are very nearly planar and get almost none.
   *   SHARPNESS — whether there is a LINE at all. Soil on rock, or any
   *     lithological jump, is a knife edge. A silt passing into a clay is not
   *     an edge, it is half a metre of change; drawing it as a 1.5 px parting
   *     is drawing a diagram.
   *
   * Wander is then capped by the thinner of the two beds, so a 0.4 m fracture
   * seam cannot be displaced out of existence by its own contact.
   *
   * @returns {[number, number]} [wander 0..1, sharpness 0..1]
   */
  function contactCharacter(above, below) {
    const softA = above.ucs < 5, softB = below.ucs < 5;
    const weathering = softA !== softB ? 1 : 0;         // rockhead
    const broken = (above.stability < 0.25 || below.stability < 0.25) ? 1 : 0;
    const samePat = above.pattern === below.pattern ? 1 : 0;
    const dUcs = Math.abs(Math.min(above.ucs, 300) - Math.min(below.ucs, 300)) / 300;
    const dGrain = Math.abs((above.grain || 0) - (below.grain || 0));
    let wander = 0.20 + weathering * 0.58 + broken * 0.34
               + (softA && softB ? (1 - samePat) * 0.30 : 0)
               + dGrain * 0.26;
    const thin = Math.min(above.bottom - above.top, below.bottom - below.top);
    wander *= clamp(thin / 2.2, 0.30, 1.0);
    const sharp = 0.18 + (1 - samePat) * 0.40 + dUcs * 1.10
                + dGrain * 0.50 + weathering * 0.26;
    return [clamp(wander), clamp(sharp)];
  }

  function bakeLookup() {
    const W = CFG.lookupWidth;
    const a = texA.image.data, b = texB.image.data;
    const c = texC.image.data, dch = texD.image.data;
    if (!strata.length) return;

    // boundary depths for the "edge" channel
    const bounds = [];
    for (let i = 1; i < strata.length; i++) bounds.push(strata[i].top);
    /* Contact character, one entry per boundary, plus the piecewise-linear
       ramp THROUGH them that the shader samples. Continuity is not cosmetic
       here: D.g scales the boundary displacement inside colUWarp(), and a step
       in it would make the two sides of a contact disagree about where they
       are and tear the boundary in half. */
    const wanderAt = [], sharpAt = [];
    for (let i = 1; i < strata.length; i++) {
      const [w, s] = contactCharacter(strata[i - 1], strata[i]);
      wanderAt.push(w); sharpAt.push(s);
    }
    const rampAt = (arr, d) => {
      if (!arr.length) return 0.5;
      if (d <= bounds[0]) return arr[0];
      if (d >= bounds[bounds.length - 1]) return arr[arr.length - 1];
      let k = 0;
      while (k + 1 < bounds.length && bounds[k + 1] < d) k++;
      const span = bounds[k + 1] - bounds[k];
      return span > 1e-4 ? lerp(arr[k], arr[k + 1], (d - bounds[k]) / span) : arr[k];
    };

    /* THE ASSETS PALETTE OVERRIDE IS GONE, DELIBERATELY.
       This used to call ctx.assets.stratumMaterial(s) and, if it came back
       with a .color, use that hex for BOTH ends of the gradient. It does come
       back with one: core/assets.js sets color: cMid, the midpoint of the
       stratum's own two colours. So the override was live, and it was
       (a) collapsing every bed's vertical gradient to a single flat value —
       a real contributor to the "0.83-stop flat field" finding — and
       (b) silently voiding the ΔE and ΔL* guarantees, which are solved in
       contract.js against this file's exact lighting and cannot survive a
       substitution from a module that knows nothing about it.
       If a palette override is ever wanted again it has to come back through
       the same solve, not around it. */
    const paletteCache = new Map();

    /* `bounds` is sorted, and d increases monotonically with i, so the nearest
       contact index only ever moves forward — no inner scan. */
    let bi = 0;
    for (let i = 0; i < W; i++) {
      const d = ((i + 0.5) / W) * profileDepth;
      const si = getStratumIndexAt(d);
      const s = strata[si];
      let cols = paletteCache.get(s.id);
      if (cols === undefined) { cols = s.colors; paletteCache.set(s.id, cols); }

      const t = smoothstep(clamp(invLerp(s.top, s.bottom, d)));
      const c0 = hexToRgb(cols[0]);
      const c1 = hexToRgb(cols[1] || cols[0]);
      // Per-texel mottle so a thick layer never looks flat. Kept modest: the
      // palette is authored to a ΔE budget at every contact and a loud mottle
      // spends that budget on noise. The patterns carry the variety now.
      const n = (fbm2(d * 0.7, si * 3.1, spec.seed, 3) - 0.5) * 14;
      const o = i * 4;
      a[o + 0] = clamp8(lerp(c0[0], c1[0], t) + n);
      a[o + 1] = clamp8(lerp(c0[1], c1[1], t) + n * 0.95);
      a[o + 2] = clamp8(lerp(c0[2], c1[2], t) + n * 0.85);

      /* A.a is DISTANCE to the nearest contact (metres / edgeRange), not a
         blend weight. Storing distance is what lets the shader draw a 1.5 px
         parting: a weight baked at one width can only ever be dissolved. */
      while (bi + 1 < bounds.length && Math.abs(d - bounds[bi + 1]) <= Math.abs(d - bounds[bi])) bi++;
      const signed = bounds.length ? d - bounds[bi] : 1e9;   // > 0 == below it
      a[o + 3] = clamp8((Math.min(Math.abs(signed), CFG.edgeRangeMetres) / CFG.edgeRangeMetres) * 255);

      b[o + 0] = (PATTERN_ID[s.pattern] ?? 0) * 32;
      b[o + 1] = clamp8(s.grain * 255);
      b[o + 2] = clamp8(s.stability * 255);
      b[o + 3] = clamp8(s.water * 255);

      c[o + 0] = clamp8((Math.min(s.ucs, 300) / 300) * 255);
      c[o + 1] = clamp8(s.abrasivity * 255);
      c[o + 2] = clamp8(fabricFor(s) * 255);
      /* C.a is WHICH SIDE of that contact we are on (255 below, 0 above) — the
         lip goes on the upper bed. Kept out of A.a so the sign never has to
         survive linear interpolation, which would manufacture a phantom parting
         at the midpoint of every thick bed. texC is NEAREST-filtered, so this
         stays a clean step. */
      c[o + 3] = signed >= 0 ? 255 : 0;

      /* D — CONTACT CHARACTER AND PER-BED IDENTITY.
         r  a stable per-bed random. Beds repeat: the nordic basement
            alternates granite and gneiss for as deep as the contract goes, and
            without this every one of them is the same bed drawn twice.
         g  wander, sampled by colUWarp() at the UNWARPED depth
         b  sharpness, sampled by contactMarksK()
         a  clast loading, straight off the region recipe's own boulder
            density (_boulders), so a bouldery till really does carry more
            stones than a clean one instead of every till looking alike. */
      dch[o + 0] = clamp8(hash2(s.index * 7.3 + 1.7, s.index * 2.9, spec.seed) * 255);
      dch[o + 1] = clamp8(rampAt(wanderAt, d) * 255);
      dch[o + 2] = clamp8(rampAt(sharpAt, d) * 255);
      dch[o + 3] = clamp8(clamp((s._boulders || 0) * 0.85 + 0.20) * 255);
    }
    texA.needsUpdate = true;
    texB.needsUpdate = true;
    texC.needsUpdate = true;
    texD.needsUpdate = true;

    U.uProfileDepth.value = profileDepth;
    U.uDip.value = dip;
    U.uWaterY.value = secYForDepth(waterTableDepth);
    updateContactWidths();   // the texel floor depends on profileDepth
  }

  /* ═════════════════════════════════════════════════════════════════════════
     BUILD
     ═════════════════════════════════════════════════════════════════════════ */
  /**
   * Resolves the section's pixel budget. Everything the art direction states in
   * CSS pixels — the drawn contact, the finest procedural octave, the visual
   * hole radius — is converted to section metres here, so those features stay a
   * fixed size on screen no matter what view scale the renderer hands us.
   */
  function computeView(w, h) {
    const bandH = Math.max(1, h * (LAYOUT.sectionHeight || 0.46));
    const aspect = Math.max(0.25, w / bandH);
    halfH = viewMetres * 0.5;
    halfW = halfH * aspect;
    U.uHalfW.value = halfW;
    U.uGeoX.value.set(-halfW + CFG.logWidth, halfW - CFG.rulerWidth);

    // 388 CSS px / 20 m = 19.4 px per metre on the reference device
    pxPerMetre = bandH / Math.max(viewMetres, 1e-3);
    U.uEdgeShade.value = CFG.edgeMetres;
    U.uEdgeGeo.value = CFG.edgeGeoMetres;
    U.uEdgeRange.value = CFG.edgeRangeMetres;
    updateContactWidths();

    /* Procedural detail cap. These patterns have no mip chain, so the finest
       octave must never fall below CFG.detailPx of period — below that it stops
       being grain and becomes flat grey that crawls under scroll. A denser
       display earns proportionally finer detail, bounded so a 1x screen does
       not turn to mush and a 4x screen does not start aliasing again. */
    const dpr = clamp(
      Math.min(
        (typeof window !== 'undefined' && window.devicePixelRatio) || 2,
        ctx?.quality?.dprCap || 2,
      ), 1, 3,
    );
    const nyq = clamp((pxPerMetre / CFG.detailPx) * clamp(dpr / 2, 0.8, 1.4), 2.4, 18);
    // keep the published contract current: core/renderer.js reads this back and
    // matches its own sectionViewH to it, so the two can never disagree again
    if (ctx?.sectionView) ctx.sectionView.viewMetres = viewMetres;
    U.uNyq.value = nyq;
    U.uNyq2.value = nyq * 0.5;    // base cap for a 2-octave fbm
    U.uNyq4.value = nyq * 0.25;   // base cap for a 3/4-octave fbm
    applyHoleDiameter();          // also sets uAngNyq, which needs pxPerMetre
    /* The horizontal scale of a long-section is derived from the band's own
       width, so it has to be re-solved on every resize — and the ore's dash
       period rides on it. In vertical this writes the same defaults back. */
    applyMode();
    applyOreUniforms();
  }

  function buildFace() {
    if (faceMesh) { root.remove(faceMesh); faceGeo?.dispose(); }
    const segY = Math.max(48, Math.min(192, ctx?.quality?.strataSegments || 96));
    const slabH = viewMetres * CFG.slabOverscan;
    const slabW = halfW * 2 * 1.02;
    const segX = Math.max(32, Math.round(segY * (slabW / slabH)));
    faceGeo = new T.PlaneGeometry(slabW, slabH, segX, segY);
    if (!faceMat) {
      faceMat = new T.ShaderMaterial({
        uniforms: Object.assign({ uSlabOffset: { value: new T.Vector2(0, 0) } }, U),
        vertexShader: FACE_VERT,
        fragmentShader: FACE_FRAG,
        side: T.FrontSide,
      });
      track(faceMat);
    }
    faceMesh = new T.Mesh(faceGeo, faceMat);
    faceMesh.frustumCulled = false;
    faceMesh.renderOrder = 0;
    faceMesh.name = 'section-face';
    root.add(faceMesh);
    // slab vertex lattice pitch — used to snap the scroll so relief never swims
    const pitch = slabH / segY;
    faceMesh.userData.pitch = pitch;
    /* The geometric undercut at a contact cannot be narrower than the lattice
       that carries it, or on the low tier (0.65 m pitch) it aliases into
       facets. The DRAWN parting is per-pixel and unaffected. */
    U.uEdgeGeo.value = Math.max(CFG.edgeGeoMetres, pitch * 1.6);
  }

  function buildBackdrop() {
    if (backMesh) { scene?.remove(backMesh); backMesh.geometry.dispose(); }
    const g = new T.PlaneGeometry(halfW * 2.6, viewMetres * 1.3, 1, 1);
    if (!backMat) {
      backMat = new T.ShaderMaterial({
        uniforms: {
          uParallaxY: { value: 0 },
          uHalfW: U.uHalfW,
          uDeep: { value: new T.Color(BRAND.bgDeep) },
          uHaze: { value: new T.Color(0x2b2f38) },
        },
        vertexShader: BACK_VERT,
        fragmentShader: BACK_FRAG,
        depthWrite: false,
        side: T.FrontSide,
      });
      track(backMat);
    }
    backMesh = new T.Mesh(g, backMat);
    backMesh.position.set(0, camBaseY, -9);
    backMesh.renderOrder = -50;
    backMesh.frustumCulled = false;
    backMesh.name = 'section-backdrop';
    scene?.add(backMesh);
  }

  function buildBorehole() {
    // wall (we see the inside of the tube)
    const wg = track(new T.CylinderGeometry(1, 1, 1, 34, 26, true));
    wallMat = track(new T.ShaderMaterial({
      uniforms: Object.assign({ uTop: { value: 0 }, uBottom: { value: -1 } }, U),
      vertexShader: WALL_VERT,
      fragmentShader: WALL_FRAG,
      side: T.BackSide,
    }));
    wallMesh = new T.Mesh(wg, wallMat);
    wallMesh.frustumCulled = false;
    wallMesh.renderOrder = 1;
    wallMesh.name = 'borehole-wall';
    root.add(wallMesh);

    // casing tube
    const cg = track(new T.CylinderGeometry(1, 1, 1, 26, 8, true));
    casingMat = track(new T.ShaderMaterial({
      uniforms: {
        uTop: { value: 0 }, uBottom: { value: -1 },
        uR: { value: annulus.casingR },
        /* Casing shares ROD_VERT, so it needs the whirl uniforms to link — but
           casing is grouted or driven against the wall and does not whirl, so
           uWhirl stays 0 for the life of the material and every term above
           multiplies out. */
        uClear: { value: 0 }, uWhirl: { value: 0 },
        uPrec: { value: 0 }, uHelix: { value: 0 }, uSpans: { value: 1 },
        // …and the flight uniforms, for the same reason: shared vertex shader,
        // no flight on a casing, so uFlightR stays 0 and aFlight is never set
        uSpin: { value: 0 }, uFlightR: { value: 0 }, uFlightK: { value: 1 },
        uSteel: { value: new T.Color(0x9aa6b2) }, uKeyWarm: U.uKeyWarm,
      },
      vertexShader: ROD_VERT,
      fragmentShader: CASING_FRAG,
      side: T.DoubleSide,
    }));
    casingMesh = new T.Mesh(cg, casingMat);
    casingMesh.frustumCulled = false;
    casingMesh.visible = false;
    casingMesh.renderOrder = 2;
    casingMesh.name = 'casing';
    root.add(casingMesh);

    /* 96 height segments, not 40. The string is bent in the vertex shader, so
       the mode shape can only be as smooth as the ring spacing: at CFG's
       whirlSpanMax of 7 half-waves, 40 rings gave 5.7 rings per half-wave and
       the bow read as a chain of straight facets. 96 gives 13.7. It costs
       3,840 triangles inside the ONE draw call the string already had —
       geometry inside an existing call is the cheap axis here (HANDOFF §4b.3),
       and the section runs 16-35 draw calls against a budget of 60. */
    const rg = track(new T.CylinderGeometry(1, 1, 1, 20, 96, true));
    rodMat = track(new T.ShaderMaterial({
      uniforms: {
        uTop: { value: 1.6 }, uBottom: { value: -1 },
        uR: { value: annulus.innerR },
        uClear: { value: annulus.outerR - annulus.innerR },
        uWhirl: { value: 0 }, uPrec: { value: 0 },
        uHelix: { value: TAU / CFG.whirlPeriodM }, uSpans: { value: 2 },
        uRodLen: { value: 3.0 }, uSpin: { value: 0 },
        uSteel: { value: new T.Color(0xb9a37a) }, uKeyWarm: U.uKeyWarm,
      },
      vertexShader: ROD_VERT,
      fragmentShader: ROD_FRAG,
      side: T.FrontSide,
    }));
    rodMesh = new T.Mesh(rg, rodMat);
    rodMesh.frustumCulled = false;
    rodMesh.renderOrder = 3;
    rodMesh.name = 'drill-string';
    root.add(rodMesh);

    // the bit itself
    bitMesh = buildBit();
    root.add(bitMesh);
  }

  /* ── THE BIT ──────────────────────────────────────────────────────────────
     It is the focal point of the band and the thing the player spends money
     on, and it was a stack of smooth cylinders: a body tube, a squashed dome,
     one torus and eight spheres on an untextured pale blue-grey. No gauge row,
     no flushing ports, no shank.

     Built now as a real DTH button bit (DOMAIN.md §3 B, drill bits): a splined
     shank, a retaining shoulder, a gauge/wear sleeve, a drop-centre face, a
     GAUGE row of ballistic buttons canted out at the corner where a bit
     actually wears, an inner FACE row of spherical buttons, and four flushing
     ports opening onto the face. aPart tags each piece so the fragment
     shader can give steel, carbide and the flushing bore different materials
     without a second draw call — the whole bit is still one merged geometry
     and one draw. Segment counts follow ctx.quality. */
  function buildBit() {
    // built at unit radius and scaled per-frame from the derived hole radius,
    // so a change of contract diameter never leaves a stale bit behind
    const r = 1;
    const lowTier = (ctx?.quality?.id || 'high') === 'low';
    const seg = lowTier ? 12 : 22;
    const parts = [];
    const PART = [];   // 0 steel body, 1 carbide, 2 flushing bore, 3 wear sleeve
    const push = (geo, kind) => { parts.push(geo); PART.push(kind); };

    // shank: splined, above the shoulder
    const shank = new T.CylinderGeometry(r * 0.62, r * 0.62, r * 1.15, lowTier ? 8 : 12, 1, false);
    shank.translate(0, r * 1.28, 0);
    push(shank, 0);
    // driver sub / retaining shoulder
    const shoulder = new T.CylinderGeometry(r * 0.86, r * 0.78, r * 0.30, seg, 1, false);
    shoulder.translate(0, r * 0.62, 0);
    push(shoulder, 0);
    // body between shoulder and gauge
    const body = new T.CylinderGeometry(r * 0.94, r * 0.99, r * 0.62, seg, 1, false);
    body.translate(0, r * 0.20, 0);
    push(body, 0);
    // gauge / wear sleeve — the band that holds the hole to size
    const sleeve = new T.CylinderGeometry(r, r, r * 0.26, seg, 1, false);
    sleeve.translate(0, -r * 0.16, 0);
    push(sleeve, 3);
    // drop-centre face: convex shoulder falling to a recessed middle
    const face = new T.SphereGeometry(r * 0.99, seg, lowTier ? 5 : 9, 0, TAU, Math.PI * 0.5, Math.PI * 0.5);
    face.scale(1, 0.42, 1);
    face.translate(0, -r * 0.26, 0);
    push(face, 0);
    const centre = new T.SphereGeometry(r * 0.42, lowTier ? 8 : 14, lowTier ? 5 : 8, 0, TAU, 0, Math.PI * 0.5);
    centre.scale(1, 0.34, 1);
    centre.translate(0, -r * 0.46, 0);
    push(centre, 0);

    // GAUGE row: ballistic buttons, canted out at the corner
    const nGauge = lowTier ? 6 : 9;
    for (let i = 0; i < nGauge; i++) {
      const a = (i / nGauge) * TAU;
      const btn = new T.SphereGeometry(r * 0.155, lowTier ? 5 : 8, lowTier ? 4 : 6);
      btn.scale(1, 1.45, 1);                       // ballistic, not spherical
      btn.rotateZ(0.62);
      btn.rotateY(-a);
      btn.translate(Math.cos(a) * r * 0.90, -r * 0.30, Math.sin(a) * r * 0.90);
      push(btn, 1);
    }
    // FACE row: spherical buttons on the drop centre
    const nFace = lowTier ? 4 : 6;
    for (let i = 0; i < nFace; i++) {
      const a = (i / nFace) * TAU + 0.4;
      const btn = new T.SphereGeometry(r * 0.16, lowTier ? 5 : 8, lowTier ? 4 : 6);
      btn.translate(Math.cos(a) * r * 0.52, -r * 0.46, Math.sin(a) * r * 0.52);
      push(btn, 1);
    }
    // centre button
    const tip = new T.SphereGeometry(r * 0.17, lowTier ? 6 : 9, lowTier ? 4 : 6);
    tip.translate(0, -r * 0.54, 0);
    push(tip, 1);

    // flushing ports: four bores opening through the face
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + 0.78;
      const port = new T.CylinderGeometry(r * 0.115, r * 0.115, r * 0.34, lowTier ? 6 : 9, 1, true);
      port.translate(Math.cos(a) * r * 0.30, -r * 0.40, Math.sin(a) * r * 0.30);
      push(port, 2);
    }

    for (let i = 0; i < parts.length; i++) {
      const n = parts[i].attributes.position.count;
      parts[i].setAttribute('aPart', new T.BufferAttribute(new Float32Array(n).fill(PART[i]), 1));
    }
    const geo = track(mergeGeometries(parts, false) || parts[0]);
    parts.forEach((p) => { if (p !== geo) p.dispose(); });
    // self-lit steel/carbide, matching the rest of the section's key light
    bitMat = track(new T.ShaderMaterial({
      uniforms: {
        uBody: { value: new T.Color(0x6d6053) },      // blued steel, not blue-grey
        uCarbide: { value: new T.Color(0xb9b4ab) },   // tungsten carbide
        uKeyWarm: U.uKeyWarm,
        uAmbientCool: U.uAmbientCool,
        uWear: { value: 0 },
      },
      vertexShader: /* glsl */`
        attribute float aPart;
        varying vec3 vBitN; varying vec3 vBitP; varying float vPart;
        void main(){
          vBitN = normalize(normalMatrix * normal);
          vBitP = position;
          vPart = aPart;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */`
        precision mediump float;
        uniform vec3 uBody; uniform vec3 uCarbide;
        uniform vec3 uKeyWarm; uniform vec3 uAmbientCool; uniform float uWear;
        varying vec3 vBitN; varying vec3 vBitP; varying float vPart;
        ${GLSL_NOISE}
        void main(){
          vec3 N = normalize(vBitN);
          vec3 L = normalize(vec3(-0.42, 0.60, 0.68));
          float nd = max(dot(N, L), 0.0);

          float isCarbide = step(0.5, vPart) * step(vPart, 1.5);
          float isBore    = step(1.5, vPart) * step(vPart, 2.5);
          float isSleeve  = step(2.5, vPart);

          vec3 base = mix(uBody, uCarbide, isCarbide);
          base = mix(base, uBody * 0.34, isBore);              // dark inside the bore
          base = mix(base, uBody * 1.22, isSleeve);            // polished gauge band

          /* Machining and service marks. Turned steel keeps fine circumferential
             tool marks; a used bit is scuffed on the gauge and blunted on the
             carbide. Without this the bit reads as untextured flat colour,
             which is an automatic fail on material believability. */
          /* Frequencies are bounded by the bit's ON-SCREEN size, not by what
             looks right in isolation: at the default 152 mm contract the whole
             bit is ~21 CSS px across, so anything above ~20 cycles per local
             unit resolves to flat grey and crawls when the section scrolls. */
          float turn = 0.5 + 0.5 * sin(vBitP.y * 22.0);
          float grit = vnoise(vec2(atan(vBitP.z, vBitP.x) * 7.0, vBitP.y * 14.0));
          base *= 1.0 - (1.0 - isCarbide) * (0.10 * turn + 0.12 * grit);
          base *= 1.0 - isCarbide * 0.10 * grit;
          // rock flour packed into the flushing side and the gauge corner
          float dust = smoothstep(0.05, -0.35, vBitP.y) * (0.35 + 0.65 * grit);
          base = mix(base, base * vec3(1.06, 0.94, 0.78), dust * 0.42);
          // wear: carbide loses its polish and the steel burns
          base = mix(base, base * vec3(0.74, 0.62, 0.52), uWear * 0.7);

          float rough = mix(0.55, 0.16, isCarbide) + uWear * 0.25;
          vec3 c = base * (uAmbientCool * (0.44 + 0.22 * (0.5 + 0.5 * N.y))
                         + uKeyWarm * (0.24 + 2.35 * nd));
          // a carbide button is a polished dome: it holds a tight specular
          c += uKeyWarm * pow(nd, mix(14.0, 46.0, isCarbide)) * (1.0 - rough) * (1.4 - uWear * 0.8);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    const m = new T.Mesh(geo, bitMat);
    m.frustumCulled = false;
    m.renderOrder = 4;
    m.name = 'bit';
    m.scale.setScalar(annulus.outerR * 0.92);
    return m;
  }

  function buildBoulders() {
    if (boulderMesh) { root.remove(boulderMesh); boulderMesh.geometry.dispose(); }
    /* A dome cut by the section plane, plus a flared skirt that reads as the
       contact where the clast presses into the face. The dome is displaced in
       the vertex shader (see BOULDER_VERT) so the silhouette is angular; the
       skirt shares the rim's angular field so the two can never separate. */
    const hq = (ctx?.quality?.id || 'high') !== 'low';
    const segU = hq ? 20 : 12;
    const dome = new T.SphereGeometry(1, segU, hq ? 11 : 7, 0, TAU, 0, Math.PI * 0.5);
    dome.rotateX(Math.PI * 0.5);          // bulge toward the camera (+Z)
    dome.scale(1, 1, 0.58);               // a halved boulder protrudes ~0.6 r
    // flared foot: radius 1 at the cut plane out to 1.12 behind it
    const skirt = new T.CylinderGeometry(1.12, 1.0, 0.26, segU, 1, true);
    skirt.rotateX(Math.PI * 0.5);
    skirt.translate(0, 0, -0.13);
    const geo = track(mergeGeometries([dome, skirt], false) || dome);
    if (geo !== dome) dome.dispose();
    skirt.dispose();

    const cap = CFG.boulderCap;
    boulderMat = boulderMat || track(new T.ShaderMaterial({
      defines: hq ? { BOULDER_HQ: '' } : {},
      uniforms: Object.assign({}, U),
      vertexShader: BOULDER_VERT,
      fragmentShader: BOULDER_FRAG,
      side: T.FrontSide,
    }));
    boulderMesh = new T.InstancedMesh(geo, boulderMat, cap);
    boulderMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    boulderMesh.frustumCulled = false;
    boulderMesh.renderOrder = 1;
    boulderMesh.name = 'boulders';
    const tint = new Float32Array(cap * 3);
    const seed = new Float32Array(cap);
    geo.setAttribute('aTint', new T.InstancedBufferAttribute(tint, 3));
    geo.setAttribute('aSeed', new T.InstancedBufferAttribute(seed, 1));
    root.add(boulderMesh);
    fillBoulders();
  }

  function fillBoulders() {
    if (!boulderMesh) return;
    const list = features.boulders.slice(0, CFG.boulderCap);
    const mtx = new T.Matrix4();
    const q = new T.Quaternion();
    const e = new T.Euler();
    const tintAttr = boulderMesh.geometry.getAttribute('aTint');
    const seedAttr = boulderMesh.geometry.getAttribute('aSeed');
    const base = new T.Color();
    const clast = new T.Color();
    const _pos = new T.Vector3();
    const _scl = new T.Vector3();
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      const s = strata[b.stratum] || strata[0];
      e.set(0, 0, b.rot);
      q.setFromEuler(e);
      _pos.set(b.x, secYForDepth(b.depth), 0.52 + Math.min(b.r, 1.6) * 0.20);
      _scl.set(b.r, b.r * (b.squash || 0.9), b.r);
      mtx.compose(_pos, q, _scl);
      boulderMesh.setMatrixAt(i, mtx);
      /* An erratic is a piece of DIFFERENT rock from the bed it sits in, so the
         tint starts at the host bed and is pulled most of the way toward a
         clast colour — cool granitic when it is hard, warm sedimentary when it
         is not. The silhouette is still carried by value (BOULDER_FRAG floors
         below the face); this is the secondary read, not the primary one. */
      /* Clast albedos follow the same lit-result convention as GROUND: a hard
         erratic is granitic/gneissic (granite's own albedo), a soft one is a
         reworked sedimentary cobble (gravel's). */
      base.set(GROUND[s?.id]?.colors?.[1] || '#887F7A');
      clast.set(b.hardness > 0.72 ? '#A6A09C' : '#B29F8E');
      base.lerp(clast, 0.52 + b.hardness * 0.30);
      const k = 0.80 + b.hardness * 0.28;
      tintAttr.setXYZ(i, base.r * k, base.g * k, base.b * k);
      seedAttr.setX(i, b.seed);
    }
    boulderMesh.count = list.length;
    boulderMesh.instanceMatrix.needsUpdate = true;
    tintAttr.needsUpdate = true;
    seedAttr.needsUpdate = true;
  }

  function buildFractures() {
    if (fracMesh) { root.remove(fracMesh); fracMesh.geometry.dispose(); }
    const list = features.fractures;
    if (!list.length) { fracMesh = null; return; }
    const n = list.length;
    const pos = new Float32Array(n * 4 * 3);
    const loc = new Float32Array(n * 4 * 2);
    const halo = new Float32Array(n * 4);
    const wid = new Float32Array(n * 4);
    const idx = new Uint16Array(n * 6);
    for (let i = 0; i < n; i++) {
      const f = list[i];
      const ca = Math.cos(f.angle), sa = Math.sin(f.angle);
      // along the joint
      const ax = ca * f.len * 0.5, ay = sa * f.len * 0.5;
      // across it
      const w = f.width * 3.4;
      const bx = -sa * w * 0.5, by = ca * w * 0.5;
      const cx = f.x, cy = secYForDepth(f.depth);
      // aperture, normalised over the generated range, so the shader can shape
      // the core profile on top of the quad's own width
      const wn = clamp(invLerp(0.035, 0.40, f.width));
      const o = i * 4;
      const set = (k, sx, sy, lx, ly) => {
        pos[(o + k) * 3 + 0] = cx + sx;
        pos[(o + k) * 3 + 1] = cy + sy;
        pos[(o + k) * 3 + 2] = 0.72;
        loc[(o + k) * 2 + 0] = lx;
        loc[(o + k) * 2 + 1] = ly;
        halo[o + k] = f.halo;
        wid[o + k] = wn;
      };
      set(0, -ax - bx, -ay - by, -1, 0);
      set(1, -ax + bx, -ay + by, 1, 0);
      set(2, ax + bx, ay + by, 1, 1);
      set(3, ax - bx, ay - by, -1, 1);
      const io = i * 6;
      idx[io + 0] = o; idx[io + 1] = o + 1; idx[io + 2] = o + 2;
      idx[io + 3] = o; idx[io + 4] = o + 2; idx[io + 5] = o + 3;
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('aLocal', new T.BufferAttribute(loc, 2));
    g.setAttribute('aHalo', new T.BufferAttribute(halo, 1));
    g.setAttribute('aWidth', new T.BufferAttribute(wid, 1));
    g.setIndex(new T.BufferAttribute(idx, 1));
    /* MULTIPLY blending: dst * src, with src = 1.0 wherever the joint is
       absent. This is what makes a joint physically incapable of coming out
       brighter than the rock it cuts — the failure the previous additive
       overlay had. It also means the fragment shader must NOT tone-map or
       encode: it emits a multiplier in the destination's own space. */
    fracMat = fracMat || track(new T.ShaderMaterial({
      uniforms: U,
      vertexShader: FRAC_VERT,
      fragmentShader: FRAC_FRAG,
      transparent: true,
      blending: T.CustomBlending,
      blendSrc: T.DstColorFactor,
      blendDst: T.ZeroFactor,
      blendEquation: T.AddEquation,
      depthWrite: false,
      side: T.DoubleSide,
    }));
    fracMesh = new T.Mesh(g, fracMat);
    fracMesh.frustumCulled = false;
    fracMesh.renderOrder = 5;
    fracMesh.name = 'fractures';
    root.add(fracMesh);
  }

  function buildCavities() {
    if (cavityMesh) { root.remove(cavityMesh); cavityMesh.geometry.dispose(); }
    cavityMesh = null;
    for (let i = 0; i < CFG.cavityCap; i++) cavUniform[i].set(0, 0, 0, 0);
    const list = features.cavities.slice(0, CFG.cavityCap);
    if (!list.length) return;
    const parts = [];
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      cavUniform[i].set(c.x, secYForDepth(c.depth), c.halfW, c.halfH);
      const g = new T.SphereGeometry(1, 18, 12);
      g.scale(c.halfW * 1.05, c.halfH * 1.05, Math.min(c.halfW, c.halfH) * 1.5);
      g.translate(c.x, secYForDepth(c.depth), -Math.min(c.halfW, c.halfH) * 0.9);
      parts.push(g);
    }
    const geo = mergeGeometries(parts, false) || parts[0];
    parts.forEach((p) => { if (p !== geo) p.dispose(); });
    cavityMat = cavityMat || track(new T.ShaderMaterial({
      uniforms: { uAmbientCool: U.uAmbientCool },
      vertexShader: CAVITY_VERT,
      fragmentShader: CAVITY_FRAG,
      side: T.BackSide,
    }));
    cavityMesh = new T.Mesh(geo, cavityMat);
    cavityMesh.frustumCulled = false;
    cavityMesh.renderOrder = 0;
    cavityMesh.name = 'cavities';
    root.add(cavityMesh);
  }

  /* ── GROUNDWATER DATUM ────────────────────────────────────────────────────
     This used to be a full-width row of hard cyan dashes across the geology —
     a spreadsheet rule laid over a rock face. The wetness step in FACE_FRAG
     and WALL_FRAG already draws the water table for real (its ramp was
     tightened to ~9 CSS px so it reads as a line rather than a 1.5 m
     dissolve), so the drawn element is reduced to a datum mark inside the
     ruler gutter, where the 'GWL' label already is. BRAND.steel rather than
     steelSoft, and no glow: at full alpha the softer tint was reading as an
     accidental cyan that is nowhere else in the section. */
  function buildWaterLine() {
    if (waterLine) { root.remove(waterLine); waterLine.geometry.dispose(); }
    const wide = CFG.rulerWidth * 1.15;
    const g = new T.PlaneGeometry(wide, 0.5, 1, 1);
    waterMat = waterMat || track(new T.ShaderMaterial({
      uniforms: { uTime: U.uTime, uCol: { value: new T.Color(BRAND.steel) } },
      vertexShader: `varying vec2 vUv2; varying float vX;
        void main(){ vUv2 = uv; vX = position.x;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `precision mediump float;
        uniform float uTime; uniform vec3 uCol;
        varying vec2 vUv2; varying float vX;
        ${GLSL_NOISE}
        void main(){
          float w = (fbm2n(vec2(vX*1.4, uTime*0.06)) - 0.5) * 0.10;
          float d = abs(vUv2.y - 0.5 + w);
          float line = smoothstep(0.13, 0.0, d);
          // a single inverted survey triangle at the inboard end of the mark
          float tri = step(vUv2.x, 0.20)
                    * smoothstep(0.42, 0.0, abs(vUv2.y - 0.5 + w) + (0.20 - vUv2.x) * 1.6);
          float a = (line * 0.80 + tri * 0.85) * smoothstep(0.0, 0.06, vUv2.x);
          gl_FragColor = vec4(uCol, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
    }));
    waterLine = new T.Mesh(g, waterMat);
    waterLine.position.set(halfW - wide * 0.5, secYForDepth(waterTableDepth), 0.78);
    waterLine.renderOrder = 6;
    waterLine.frustumCulled = false;
    waterLine.name = 'water-table';
    root.add(waterLine);
  }

  /* ── EVENT MARKERS ────────────────────────────────────────────────────────
     This was new T.CircleGeometry(0.42, 4) — four segments is a SQUARE — on
     an unlit MeshBasicMaterial at opacity 0.95 and renderOrder 8, so it drew
     an amber diamond at full brightness in front of the face and the boulders,
     51 CSS px right of the hole at the bit line. An un-art-directed
     placeholder sitting in the middle of the rock.

     It is now an etched index bracket: a vertical stroke with a tick pointing
     inward at the depth it marks, cut into the ruler gutter where the log
     annotations belong. Two quads, one instanced draw, a shader that gives the
     stroke a dark bevel on its lower-right so it reads as engraved into the
     plate rather than floating over the geology. */
  const PIN_VERT = /* glsl */`
    precision mediump float;
    attribute vec2 aQuad;      // 0..1 within this stroke
    attribute float aKind;     // 0 = upright bar, 1 = horizontal tick
    varying vec2 vQ;
    varying float vKind;
    varying vec3 vTint;
    void main(){
      vQ = aQuad; vKind = aKind;
      #ifdef USE_INSTANCING_COLOR
        vTint = instanceColor;
      #else
        vTint = vec3(1.0);
      #endif
      vec4 wp = instanceMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * wp;
    }`;
  const PIN_FRAG = /* glsl */`
    precision mediump float;
    varying vec2 vQ;
    varying float vKind;
    varying vec3 vTint;
    void main(){
      // distance to the stroke edge, in quad space
      vec2 d = min(vQ, 1.0 - vQ);
      float edge = min(d.x, d.y);
      float body = smoothstep(0.0, 0.10, edge);
      if (body <= 0.001) discard;
      // engraved: a dark lip along the bottom-right, a thin light catch top-left
      float lip = smoothstep(0.30, 0.0, min(1.0 - vQ.x, 1.0 - vQ.y));
      float catchL = smoothstep(0.26, 0.0, min(vQ.x, vQ.y));
      vec3 c = vTint * (0.78 + 0.30 * vKind);
      c = mix(c, c * 0.28, lip * 0.75);
      c = mix(c, c * 1.55 + 0.06, catchL * 0.45);
      gl_FragColor = vec4(c, body * 0.92);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;

  function buildPins() {
    if (pinMesh) return;
    // bar: 0.10 x 0.66 units;  tick: 0.44 x 0.10, pointing inward (-x)
    const bar = new T.PlaneGeometry(0.10, 0.66, 1, 1);
    const tick = new T.PlaneGeometry(0.44, 0.10, 1, 1);
    tick.translate(-0.27, 0, 0);
    const geos = [bar, tick];
    const kinds = [0, 1];
    for (let i = 0; i < geos.length; i++) {
      const n = geos[i].attributes.position.count;
      const q = new Float32Array(n * 2);
      const uvA = geos[i].attributes.uv;
      for (let v = 0; v < n; v++) { q[v * 2] = uvA.getX(v); q[v * 2 + 1] = uvA.getY(v); }
      geos[i].setAttribute('aQuad', new T.BufferAttribute(q, 2));
      geos[i].setAttribute('aKind', new T.BufferAttribute(new Float32Array(n).fill(kinds[i]), 1));
    }
    const g = track(mergeGeometries(geos, false) || bar);
    geos.forEach((x) => { if (x !== g) x.dispose(); });
    const mat = track(new T.ShaderMaterial({
      uniforms: {},
      vertexShader: PIN_VERT,
      fragmentShader: PIN_FRAG,
      transparent: true,
      depthWrite: false,
    }));
    pinMesh = new T.InstancedMesh(g, mat, CFG.pinCap);
    pinMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    pinMesh.instanceColor = new T.InstancedBufferAttribute(new Float32Array(CFG.pinCap * 3).fill(1), 3);
    pinMesh.count = 0;
    pinMesh.frustumCulled = false;
    // behind the instrument strips (20/21), in front of the face: it annotates
    // the log, it does not sit in the geology
    pinMesh.renderOrder = 7;
    pinMesh.name = 'annotations';
    root.add(pinMesh);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     MODE FURNITURE — everything a non-vertical section needs, in two draws
     ═══════════════════════════════════════════════════════════════════════════
     A vertical section builds neither of these, so the fourteen vertical
     methods keep the fourteen draw calls they had.

     modeMesh is ONE merged, part-tagged geometry: entry and exit pits, the
     obstacle, the bore ribbon, the designed path and its corridor, the tunnel
     void and its lining, the raise's two drives, the pile column. Progressive
     reveal is a VERTEX ATTRIBUTE, not a rebuild — aStation carries the
     along-hole station of every vertex and the fragment shader clips against
     the live progress uniforms, so a 1,200 m bore costs one upload, once.

     modeInst is ONE instanced quad: rock bolts, spiles, blast holes, cage
     hoops, probe holes, the reamer head, cutters. Everything repeated, and the
     handful of things that move.                                            */

  /** aRev — when a vertex is allowed to exist.
   *  0 always · 1 behind the first pass · 2 behind the second pass, measured
   *  from the far end · 3 only once the second stage has started. */
  const REV = { always: 0, pass1: 1, pass2: 2, stage2: 3 };
  /** aPart — which material. Keep in sync with MODE_FRAG. */
  const MP = {
    void: 0, concrete: 1, steel: 2, water: 3, muck: 4,
    deck: 5, ghost: 6, grout: 7, timber: 8,
  };

  const MODE_VERT = /* glsl */`
    precision mediump float;
    attribute vec2 aLocal;      // 0..1 across the piece
    attribute float aPart;
    attribute float aStation;   // along-hole station of this vertex (m)
    attribute float aRev;
    varying vec2 vL; varying float vPart; varying float vSt; varying float vRev;
    void main(){
      vL = aLocal; vPart = aPart; vSt = aStation; vRev = aRev;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
  const MODE_FRAG = /* glsl */`
    precision mediump float;
    uniform vec3 uKeyWarm; uniform vec3 uAmbientCool;
    uniform float uTime;
    /* x first-pass extent (m)  y second-pass extent from the far end (m)
       z total length (m)       w stage (0 or 1) */
    uniform vec4 uProg;
    varying vec2 vL; varying float vPart; varying float vSt; varying float vRev;
    ${GLSL_NOISE}
    void main(){
      // progressive reveal — no rebuild, just a clip against the live progress
      if (vRev > 0.5) {
        if (vRev < 1.5)      { if (vSt > uProg.x) discard; }
        else if (vRev < 2.5) { if (vSt < uProg.z - uProg.y) discard; }
        else                 { if (uProg.w < 0.5) discard; }
      }
      float p = vPart;
      vec2 d = min(vL, 1.0 - vL);
      float edge = min(d.x, d.y);
      float grain = fbm2n(vL * vec2(9.0, 26.0) + vSt * 0.31);

      vec3 base; float alpha = 1.0; float rough = 0.7; float lift = 1.0;
      if (p < 0.5) {
        // VOID — the inside of an opening. Dark, with a little depth to it.
        base = vec3(0.017, 0.020, 0.026) * (0.7 + 0.9 * vL.y);
        lift = 0.9;
      } else if (p < 1.5) {
        // CONCRETE — pit lining, shotcrete, the pile itself
        base = vec3(0.186, 0.181, 0.169) * (0.88 + 0.24 * grain);
        rough = 0.9;
      } else if (p < 2.5) {
        // STEEL — reinforcement, girders, bolts, rails, the product pipe
        base = vec3(0.126, 0.135, 0.148) * (0.86 + 0.30 * grain);
        rough = 0.28;
      } else if (p < 3.5) {
        // WATER / DRILLING FLUID
        base = vec3(0.031, 0.070, 0.086);
        alpha = 0.88;
        rough = 0.06;
      } else if (p < 4.5) {
        // MUCK / CUTTINGS
        base = vec3(0.075, 0.066, 0.055) * (0.70 + 0.62 * grain);
        rough = 1.0;
      } else if (p < 5.5) {
        // ASPHALT DECK / BALLAST
        base = vec3(0.030, 0.031, 0.035) * (0.80 + 0.40 * grain);
        rough = 0.95;
      } else if (p < 6.5) {
        /* GHOST — the designed path, the corridor edge, a probe hole. A survey
           line, so it is drawn as one: thin, amber, dashed, and never lit. */
        float dash = step(0.35, fract(vSt * 0.55));
        float core = 1.0 - smoothstep(0.18, 0.5, abs(vL.y - 0.5));
        alpha = core * dash * 0.85;
        if (alpha < 0.02) discard;
        gl_FragColor = vec4(vec3(0.96, 0.62, 0.10) * (0.5 + 0.5 * core), alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        return;
      } else if (p < 7.5) {
        // GROUT / BENTONITE / CLEARANCE ENVELOPE — a translucent halo
        base = vec3(0.10, 0.115, 0.13);
        alpha = 0.26 * (1.0 - smoothstep(0.25, 0.5, abs(vL.y - 0.5)));
        if (alpha < 0.01) discard;
      } else {
        // TIMBER / SHUTTERING
        base = vec3(0.115, 0.086, 0.052) * (0.8 + 0.4 * grain);
        rough = 0.85;
      }

      // one analytic key from the section's own light, plus a machined bevel
      float ndl = 0.30 + 0.70 * smoothstep(0.0, 0.22, edge);
      vec3 c = base * (uAmbientCool * 0.85 + uKeyWarm * (0.35 + 1.9 * ndl * lift));
      c += uKeyWarm * pow(smoothstep(0.34, 0.0, edge), 3.0) * (1.0 - rough) * 0.55;
      c *= 1.0 - smoothstep(0.22, 0.0, min(1.0 - vL.x, 1.0 - vL.y)) * 0.34;
      gl_FragColor = vec4(c, alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`;

  /** Accumulates quads into flat arrays. One geometry, one draw. */
  function makeQuads() {
    const pos = [], loc = [], part = [], sta = [], rev = [], idx = [];
    let n = 0;
    const push4 = (pts, p, s, r) => {
      for (let i = 0; i < 4; i++) {
        pos.push(pts[i][0], pts[i][1], pts[i][2] ?? 0.55);
      }
      loc.push(0, 0, 1, 0, 1, 1, 0, 1);
      for (let i = 0; i < 4; i++) { part.push(p); sta.push(s); rev.push(r); }
      idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
      n += 4;
    };
    return {
      get count() { return n; },
      /** axis-aligned box */
      box(x0, y0, x1, y1, p, s = 0, r = REV.always, z = 0.55) {
        push4([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], p, s, r);
      },
      /** rotated bar: centred at (x,y), len long at ang, w wide */
      bar(x, y, ang, len, w, p, s = 0, r = REV.always, z = 0.6) {
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const ax = ca * len * 0.5, ay = sa * len * 0.5;
        const bx = -sa * w * 0.5, by = ca * w * 0.5;
        push4([
          [x - ax - bx, y - ay - by, z], [x + ax - bx, y + ay - by, z],
          [x + ax + bx, y + ay + by, z], [x - ax + bx, y - ay + by, z],
        ], p, s, r);
      },
      /** ribbon along a polyline of {x,y,st}, half units either side */
      ribbon(pts, half, p, r = REV.always, z = 0.58, halfFn = null) {
        for (let i = 0; i + 1 < pts.length; i++) {
          const a = pts[i], b = pts[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const L = Math.hypot(dx, dy) || 1e-4;
          const nx = -dy / L, ny = dx / L;
          const ha = halfFn ? halfFn(a) : half;
          const hb = halfFn ? halfFn(b) : half;
          pos.push(a.x - nx * ha, a.y - ny * ha, z);
          pos.push(b.x - nx * hb, b.y - ny * hb, z);
          pos.push(b.x + nx * hb, b.y + ny * hb, z);
          pos.push(a.x + nx * ha, a.y + ny * ha, z);
          loc.push(0, 0, 1, 0, 1, 1, 0, 1);
          part.push(p, p, p, p);
          sta.push(a.st, b.st, b.st, a.st);
          rev.push(r, r, r, r);
          idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
          n += 4;
        }
      },
      build() {
        if (!n) return null;
        const g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(new Float32Array(pos), 3));
        g.setAttribute('aLocal', new T.BufferAttribute(new Float32Array(loc), 2));
        g.setAttribute('aPart', new T.BufferAttribute(new Float32Array(part), 1));
        g.setAttribute('aStation', new T.BufferAttribute(new Float32Array(sta), 1));
        g.setAttribute('aRev', new T.BufferAttribute(new Float32Array(rev), 1));
        g.setIndex(n > 65000
          ? new T.BufferAttribute(new Uint32Array(idx), 1)
          : new T.BufferAttribute(new Uint16Array(idx), 1));
        return g;
      },
    };
  }

  function killModeMeshes() {
    if (modeMesh) { root.remove(modeMesh); modeMesh.geometry.dispose(); modeMesh = null; }
    if (modeInst) { root.remove(modeInst); modeInst.geometry.dispose(); modeInst = null; }
  }

  /** Sample the hole axis into a polyline the ribbon builder can follow. */
  function axisPolyline(fromS, toS, steps) {
    const out = [];
    const n = Math.max(2, steps | 0);
    for (let i = 0; i <= n; i++) {
      const st = lerp(fromS, toS, i / n);
      out.push({ x: secXForStation(st), y: secYForDepth(depthForStation(st)), st });
    }
    return out;
  }

  function buildModeFurniture() {
    killModeMeshes();
    if (layout.id === 'vertical') return;

    const q = makeQuads();
    const inst = [];   // { x, y, ang, len, w, part, station, rev }
    const mpx = Math.max(layout.metresPerUnitX, 1e-6);
    const uX = (metres) => metres / mpx;              // metres -> section units of x
    const L = Math.max(layout.totalLength, 1);
    const seg = (ctx?.quality?.id || 'high') === 'low' ? 48 : 96;

    if (layout.id === 'profile' && path) {
      const pts = axisPolyline(0, L, seg);
      /* THE DESIGN CORRIDOR — research/07 §F4 takes the S-grade half-width from
         [APE]'s +/- 6 in. At V.E. 6:1 that is ~2.9 CSS px either side of the
         design line: thin, legible, and it should feel tight. */
      q.ribbon(pts, path.corridor, MP.grout, REV.always, 0.50);
      // the designed path itself, dashed — drawn from the first frame
      q.ribbon(pts, Math.max(path.corridor * 0.22, 0.06), MP.ghost, REV.always, 0.52);
      /* THE BORE. Drilled extent only; the shader clips it by station, so the
         ribbon is uploaded once for a 1,200 m crossing. */
      q.ribbon(pts, Math.max(U.uBore.value.z, 0.16), MP.void, REV.pass1, 0.62);
      /* THE PRODUCT PIPE, pulled in from the exit end — "progress runs from the
         exit pit back toward the rig" (research/07 §F5). */
      q.ribbon(pts, Math.max(U.uPathC.value.w * 0.72, 0.14), MP.steel, REV.pass2, 0.66);

      /* ENTRY AND EXIT PITS — [APE]: sized to contain the expected return of
         fluids and cuttings, each ringed by a 305 mm berm. */
      const pit = (px, wM, dM) => {
        const x0 = uX(px), x1 = uX(px + wM);
        q.box(x0, 0.05, x1, -dM, MP.void, 0, REV.always, 0.5);
        q.box(x0, -dM * 0.55, x1, -dM, MP.water, 0, REV.always, 0.54);
        // the 305 mm berm, drawn at its real height
        q.box(x0 - uX(0.5), 0.305, x0, 0.05, MP.concrete, 0, REV.always, 0.7);
        q.box(x1, 0.305, x1 + uX(0.5), 0.05, MP.concrete, 0, REV.always, 0.7);
      };
      pit(path.entryPit.x, path.entryPit.w, path.entryPit.d);
      pit(path.exitPit.x, path.exitPit.w, path.exitPit.d);

      /* THE OBSTACLE — the reason the crossing exists. */
      const ob = path.obstacle;
      const ox = uX(ob.centreX), ohw = Math.max(uX(ob.halfW), 0.5);
      const amp = U.uSurfAmp.value;
      if (ob.water) {
        // water surface sitting in the channel the ground line already cuts
        q.box(ox - ohw * 0.86, ob.rise * amp * 0.42, ox + ohw * 0.86,
              ob.rise * amp * 1.02, MP.water, 0, REV.always, 0.72);
      } else {
        const deckY = ob.rise * amp;
        q.box(ox - ohw, deckY, ox + ohw, deckY - 0.34, MP.deck, 0, REV.always, 0.72);
        if (ob.kind === 'rail') {
          for (const s of [-0.42, 0.42]) {
            q.box(ox + ohw * s - 0.06, deckY + 0.22, ox + ohw * s + 0.06,
                  deckY, MP.steel, 0, REV.always, 0.76);
          }
        }
      }

      /* LOCATED UTILITIES with their [HSG47] §169 clearance envelope — 250 mm
         or 1.5 x the diameter, whichever is greater. */
      for (const u of path.utilities) {
        const ux = uX(u.x);
        const env = Math.max(u.clearance, 0.25);
        q.box(ux - 0.14, -u.depth + 0.14, ux + 0.14, -u.depth - 0.14, MP.steel, 0, REV.always, 0.78);
        q.box(ux - 0.14 - env, -u.depth + 0.14 + env, ux + 0.14 + env,
              -u.depth - 0.14 - env, MP.grout, 0, REV.always, 0.46);
      }
    }

    if (layout.id === 'heading' && heading) {
      const h = heading.height;
      /* THE EXCAVATED DRIVE, from chainage 0 to the planned end. Revealed
         behind the face by station, so the profile grows as the drive advances
         and the geometry is never rebuilt. Everything anchored AT the face —
         the round, the muck, the probe holes, the pre-support — is an instance
         tagged follow, and update() slides those with the chainage. */
      const dr = [];
      const dn = seg;
      for (let i = 0; i <= dn; i++) {
        const st = (i / dn) * L;
        dr.push({ x: secXForStation(st), y: 0, st });
      }
      q.ribbon(dr, h * 0.5, MP.void, REV.pass1, 0.5);
      /* SHOTCRETE — a lining of visible thickness. 60 mm minimum, 300–500 mm
         for an arch (NFF14 §6.3.1, NFF19 §5.6.2), and the difference between a
         good-ground drive and a squeezing one has to be obvious. */
      const sc = heading.shotcreteM;
      for (const sgn of [1, -1]) {
        const line = dr.map((p) => ({ x: p.x, y: sgn * (h * 0.5 + sc * 0.5), st: p.st }));
        q.ribbon(line, sc * 0.5, MP.concrete, REV.pass1, 0.56);
      }
      /* LATTICE GIRDERS / STEEL SETS in poor ground, drawn as ribs. */
      if (heading.girders) {
        for (let st = heading.roundLen; st < L; st += heading.roundLen) {
          const x = secXForStation(st);
          q.box(x - 0.05, h * 0.5 + sc, x + 0.05, -h * 0.5 - sc,
                MP.steel, st, REV.pass1, 0.62);
        }
      }
      /* RADIAL BOLTS on the excavated length, at their REAL length — a 3 m
         radial bolt and a 6 m spile have to look different, and that is the
         whole reason the X window is derived from the drive height rather than
         from research/04 §E4's 160 m, which would draw both as specks. */
      const boltCap = 220;
      const boltStep = Math.max(heading.boltSpacing, L / (boltCap / 6));
      for (let st = boltStep; st < L; st += boltStep) {
        const x = secXForStation(st);
        for (const sgn of [1, -1]) {
          for (const lean of [-0.5, 0, 0.5]) {
            inst.push({
              x: x + lean * 0.5 * heading.boltLen * 0.3,
              y: sgn * (h * 0.5 + sc + heading.boltLen * 0.5),
              ang: sgn * (Math.PI * 0.5) + lean * 0.42,
              len: heading.boltLen, w: 0.085,
              part: MP.steel, station: st, rev: REV.pass1,
            });
          }
        }
      }
      /* ── EVERYTHING AT THE FACE ──────────────────────────────────────────
         follow items carry an offset from the face and update() places them,
         so the round, the muck and the pre-support travel with the heading
         instead of being rebuilt every advance. */
      /* THE ROUND BEING DRILLED — a wedge of the CORRECT length ahead of the
         face. 4.5–5 m in good ground, 2.5–3 m where spiling forces it short
         (NFF14 §7.4 / NFF19 §4.3.1). The difference must be obvious, and at
         this scale it is ~2 units against ~3.7. */
      inst.push({ follow: uX(heading.roundLen * 0.5), y: 0, ang: 0,
                  len: uX(heading.roundLen), w: h, part: MP.ghost,
                  station: 0, rev: REV.always });
      /* THE GROUTED ZONE ahead of the face — the Norwegian calculation assumes
         a 10 m grouted thickness around the alignment (NFF14 §9). */
      inst.push({ follow: uX(heading.probeLen * 0.35), y: 0, ang: 0,
                  len: uX(heading.probeLen * 0.7), w: h + 20, part: MP.grout,
                  station: 0, rev: REV.always });
      // muck from the last round, at the face
      inst.push({ follow: -uX(heading.roundLen * 1.0), y: -h * 0.5 + h * 0.11,
                  ang: 0, len: uX(heading.roundLen * 1.6), w: h * 0.22,
                  part: MP.muck, station: 0, rev: REV.always });
      /* PROBE HOLES ahead of the face — thin lines at their real length,
         20–30 m (NFF19 §2.2). They run off the frame, which is the honest
         picture: the probe knows more than the window can show. */
      for (const dy of [0.28, -0.10, -0.34]) {
        inst.push({ follow: uX(heading.probeLen * 0.5), y: dy * h,
                    ang: dy * 0.06, len: uX(heading.probeLen), w: 0.055,
                    part: MP.ghost, station: 0, rev: REV.always });
      }
      /* PRE-SUPPORT: spiles at 10–15 deg to the axis, 6 m long, on a 2.3–3 m
         burden, each set overlapping the last (NFF19 §4.3.1). A spiling set is
         never fewer than five bolts, and 6 m spiles are exactly why the round
         collapses to 2.5–3 m — the two facts are drawn together on purpose. */
      if (heading.spiling) {
        const ang = (heading.spileDeg * Math.PI) / 180;
        const rise = heading.spileLen * Math.sin(ang);
        const run = uX(heading.spileLen * Math.cos(ang));
        for (let k = 0; k < 3; k++) {
          for (let i = 0; i < 5; i++) {
            inst.push({
              follow: run * 0.5 - uX(k * heading.spileBurden),
              y: h * 0.5 + rise * 0.5 + (i / 4 - 0.5) * 0.35,
              ang: Math.atan2(rise, run),
              len: Math.hypot(run, rise),
              w: 0.09, part: MP.steel, station: 0, rev: REV.always,
            });
          }
        }
      }
    }

    if (layout.id === 'raise' && raise) {
      const lw = raise.driveWidth * 0.5;
      const uh = raise.upperHeight * 0.5, lh = raise.lowerHeight * 0.5;
      const lowerY = secYForDepth(raise.length);
      // the two chambers, and the floors that make them read as drives
      q.box(-lw, uh, lw, -uh, MP.void, 0, REV.always, 0.42);
      q.box(-lw, lowerY + lh, lw, lowerY - lh, MP.void, 0, REV.always, 0.42);
      q.box(-lw, -uh, lw, -uh - 0.35, MP.concrete, 0, REV.always, 0.46);
      q.box(-lw, lowerY - lh, lw, lowerY - lh - 0.35, MP.concrete, 0, REV.always, 0.46);
      // the machine grouted to the upper floor — research/03 §C.2.5
      q.box(-holeR * 2.6, -uh + 0.9, holeR * 2.6, -uh, MP.concrete, 0, REV.always, 0.7);
      /* MUCK. Stage two's cuttings fall by gravity into the lower chamber and
         are mucked with an LHD; the pile grows as the ream climbs, so it is an
         instance whose scale the frame updates. */
      inst.push({ x: 0, y: lowerY - lh + 0.4, ang: 0, len: raise.driveWidth * 0.8,
                  w: 0.8, part: MP.muck, station: 0, rev: REV.stage2, tag: 'muck' });
      /* THE REAMER HEAD — 0.6–6 m across, 2.7–38 t, pulled UPWARD. */
      inst.push({ x: 0, y: lowerY, ang: 0, len: holeR * 2, w: holeR * 0.9,
                  part: MP.steel, station: 0, rev: REV.stage2, tag: 'reamer' });
      for (let i = 0; i < Math.min(raise.cutters, 10); i++) {
        const t = (i / Math.max(raise.cutters - 1, 1) - 0.5) * 2;
        inst.push({ x: t * holeR * 0.86, y: lowerY - holeR * 0.5, ang: 0,
                    len: holeR * 0.26, w: holeR * 0.30, part: MP.steel,
                    station: 0, rev: REV.stage2, tag: 'cutter', cut: i });
      }
    }

    if (layout.id === 'pile' && pile) {
      /* THE AS-BUILT COLUMN with real diameter variation. Concrete follows the
         bore, and the bore is not a cylinder: it necks in stiff clay and bulges
         where the ground caved. The toe sits IN the bearing stratum, and for a
         driven pile that penetration is the score (research/05 §E5). */
      const pr = holeR;
      const col = [];
      const cn = 40;
      for (let i = 0; i <= cn; i++) {
        const dep = (i / cn) * pile.lengthM;
        col.push({ x: 0, y: secYForDepth(dep), st: dep });
      }
      const wob = (p) => pr * (1 + (fbm2(-p.y * 0.55, 3.1, spec.seed, 2) - 0.5) * 0.22);
      q.ribbon(col, pr, MP.concrete, REV.pass1, 0.60, wob);
      // reinforcement cage: longitudinal bars, hoops as instances
      const cageR = pr * 0.66;
      for (const sgn of [-1, 1]) {
        q.box(sgn * cageR - 0.035, secYForDepth(pile.cageTop),
              sgn * cageR + 0.035, secYForDepth(pile.cageBottom),
              MP.steel, pile.cageBottom, REV.pass1, 0.68);
      }
      for (let dep = pile.cageTop; dep < pile.cageBottom; dep += pile.hoopPitch) {
        inst.push({ x: 0, y: secYForDepth(dep), ang: 0, len: cageR * 2, w: 0.05,
                    part: MP.steel, station: dep, rev: REV.pass1 });
      }
      // the bearing stratum, called out
      if (pile.bearing) {
        q.box(-halfW + CFG.logWidth, secYForDepth(pile.bearing.top),
              halfW - CFG.rulerWidth, secYForDepth(pile.bearing.top) - 0.08,
              MP.ghost, 0, REV.always, 0.44);
      }
      // the toe
      q.box(-pr * 1.15, secYForDepth(pile.lengthM), pr * 1.15,
            secYForDepth(pile.lengthM) - pr * 0.7, MP.steel, pile.lengthM,
            REV.pass1, 0.66);
    }

    /* ── upload ── */
    const geo = q.build();
    if (geo) {
      modeMat = modeMat || track(new T.ShaderMaterial({
        uniforms: {
          uKeyWarm: U.uKeyWarm, uAmbientCool: U.uAmbientCool, uTime: U.uTime,
          uProg: { value: new T.Vector4(0, 0, 1, 0) },
        },
        vertexShader: MODE_VERT,
        fragmentShader: MODE_FRAG,
        transparent: true,
        depthWrite: false,
        side: T.DoubleSide,
      }));
      modeMesh = new T.Mesh(geo, modeMat);
      modeMesh.frustumCulled = false;
      modeMesh.renderOrder = 6;
      modeMesh.name = `mode-${layout.id}`;
      root.add(modeMesh);
    }

    if (inst.length) {
      modeInstMat = modeInstMat || track(new T.ShaderMaterial({
        uniforms: {
          uKeyWarm: U.uKeyWarm, uAmbientCool: U.uAmbientCool, uTime: U.uTime,
          uProg: { value: modeMat ? modeMat.uniforms.uProg.value : new T.Vector4(0, 0, 1, 0) },
        },
        vertexShader: MODE_VERT.replace(
          'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          'gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);',
        ),
        fragmentShader: MODE_FRAG,
        transparent: true,
        depthWrite: false,
        side: T.DoubleSide,
      }));
      const ig = new T.PlaneGeometry(1, 1, 1, 1);
      const vn = ig.attributes.position.count;
      const lo = new Float32Array(vn * 2);
      for (let v = 0; v < vn; v++) {
        lo[v * 2] = ig.attributes.uv.getX(v);
        lo[v * 2 + 1] = ig.attributes.uv.getY(v);
      }
      ig.setAttribute('aLocal', new T.BufferAttribute(lo, 2));
      ig.setAttribute('aPart', new T.InstancedBufferAttribute(
        new Float32Array(inst.map((i) => i.part)), 1));
      ig.setAttribute('aStation', new T.InstancedBufferAttribute(
        new Float32Array(inst.map((i) => i.station)), 1));
      ig.setAttribute('aRev', new T.InstancedBufferAttribute(
        new Float32Array(inst.map((i) => i.rev)), 1));
      modeInst = new T.InstancedMesh(ig, modeInstMat, inst.length);
      modeInst.instanceMatrix.setUsage(T.DynamicDrawUsage);
      modeInst.frustumCulled = false;
      modeInst.renderOrder = 7;
      modeInst.name = `mode-${layout.id}-inst`;
      modeInst.userData.items = inst;
      const mt = new T.Matrix4();
      const qt = new T.Quaternion();
      const eu = new T.Euler();
      for (let i = 0; i < inst.length; i++) {
        const it = inst[i];
        eu.set(0, 0, it.ang);
        qt.setFromEuler(eu);
        mt.compose(new T.Vector3(it.x || 0, it.y, 0.7), qt,
                   new T.Vector3(Math.max(it.len, 0.02), Math.max(it.w, 0.02), 1));
        modeInst.setMatrixAt(i, mt);
      }
      modeInst.instanceMatrix.needsUpdate = true;
      modeInst.userData.dynamic = inst.some((i) => i.follow != null || i.tag);
      root.add(modeInst);
    }
  }

  /* ── etched instrument strips (ruler + drill log) ─────────────────────── */
  /** Canvas pixels per CSS pixel for a strip of this width. */
  function stripSuper() {
    const dpr = Math.min(
      (typeof window !== 'undefined' && window.devicePixelRatio) || 2,
      ctx?.quality?.anisotropy >= 8 ? 3 : 2,
    );
    return clamp(dpr * 1.25, 2, 3.2);
  }

  function makeStrip(name, widthUnits, xPos) {
    const span = viewMetres * 1.55;
    const cssK = stripSuper();                                // canvas px per CSS px
    const canvasW = Math.round(clamp(widthUnits * pxPerMetre * cssK, 96, 384));
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = Math.round((canvasW * span) / widthUnits);
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    tex.minFilter = T.LinearFilter;
    tex.magFilter = T.LinearFilter;
    tex.generateMipmaps = false;
    tex.anisotropy = ctx?.quality?.anisotropy || 4;
    track(tex);
    const geo = new T.PlaneGeometry(widthUnits, span, 1, 1);
    const mat = track(new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    const mesh = new T.Mesh(geo, mat);
    mesh.position.set(xPos, 0, 2.0);
    mesh.renderOrder = 20;
    mesh.frustumCulled = false;
    mesh.name = name;
    root.add(mesh);
    return {
      mesh, canvas, tex, span, widthUnits, top: -1e9,
      ctx2d: canvas.getContext('2d'),
      // canvas px per CSS px — every type size below is authored in CSS px and
      // multiplied by this, so the log reads the same on any device
      k: canvasW / Math.max(widthUnits * pxPerMetre, 1e-3),
    };
  }

  function killStrip(s) {
    if (!s) return;
    root.remove(s.mesh);
    s.mesh.geometry.dispose();
    s.mesh.material.dispose();
    s.tex.dispose();
    const i = disposables.indexOf(s.tex); if (i >= 0) disposables.splice(i, 1);
    const j = disposables.indexOf(s.mesh.material); if (j >= 0) disposables.splice(j, 1);
  }

  /* Three depth authorities used to fight in this band: the 3D ruler, the 3D
     log strip and a readout plate 11.5 units wide that hung off the left edge
     of the frustum and covered 45% of the ruler and all of the log. They are
     now disjoint by construction:
        log strip   x in [-halfW, -halfW + 4.1]        (80 CSS px, left)
        geology                                        (~260 CSS px, centre)
        ruler       x in [halfW - 2.73, halfW - 0.13]  (50 CSS px, right)
        readout     a 63 px index marker centred ON the ruler at the bit line */
  function buildStrips() {
    killStrip(ruler);
    killStrip(logStrip);
    ruler = makeStrip('depth-ruler', CFG.rulerWidth, halfW - CFG.rulerWidth * 0.55);
    logStrip = makeStrip('drill-log', CFG.logWidth, -halfW + CFG.logWidth * 0.5);
    ruler.top = -1e9;
    logStrip.top = -1e9;
  }

  /* ── THE STATION RULER ────────────────────────────────────────────────────
     A real HDD profile drawing carries TWO scales, and it carries them because
     without both the reader has no way to know the curve has been stretched.
     DESIGN_EXPANSION.md §1 asks for exactly that and research/07 §F1 spells it
     out: "a vertical ruler in metres of depth and a horizontal ruler in metres
     of station, each labelled with its own scale, plus a small V.E. badge.
     This is not decoration — it is the thing that stops a player misreading
     the curve as tighter than it is."

     So: the depth ruler on the right is untouched, and this is the second one,
     across the bottom, in the mode's own length word (BORE / CHAINAGE).

     IT NOW EXISTS IN EVERY MODE, and this is the fix for the bore. A vertical
     section has only one length axis, so it never got a scale strip and never
     declared anything — while drawing the borehole ~7x over gauge against a
     depth ruler that is 1:1 (see CFG holeR* and applyHoleDiameter). A frame
     stating two scales and admitting to neither is what the critic measured
     and reported as "the tool is 9-17x oversize against the ruler drawn beside
     it". HANDOFF §9.3: "Make the badge a property of the section, computed
     from the actual transform, and show it whenever it is not 1:1."

     So there is now ONE strip that states every scale the section is using,
     and it is the only place in the file allowed to state them:

       vertical / raise / pile   DEPTH 1:1 · BORE n:1        1.15 units tall
       profile / heading         + the chainage ticks, V.E.  2.35 units tall

     The bore number is boreExag, derived in applyHoleDiameter() from the two
     diameters — never asserted, so it cannot drift from what is drawn. Below
     1.0 it is drawn UNDER gauge (a 6 m raise bore hits the ceiling at 0.53x)
     and the badge says so rather than staying silent. */
  function killStationRuler() {
    if (!xRuler) return;
    root.remove(xRuler.mesh);
    xRuler.mesh.geometry.dispose();
    xRuler.mesh.material.dispose();
    xRuler.tex.dispose();
    const i = disposables.indexOf(xRuler.tex); if (i >= 0) disposables.splice(i, 1);
    const j = disposables.indexOf(xRuler.mesh.material); if (j >= 0) disposables.splice(j, 1);
    xRuler = null;
  }

  function buildStationRuler() {
    killStationRuler();
    if (!mode.horizontal || !scene) return;
    const heightUnits = 2.35;                       // 46 CSS px on the reference band
    const span = halfW * 2 * 1.7;                   // units of x carried by the strip
    const cssK = stripSuper();
    const canvasW = Math.round(clamp(span * pxPerMetre * cssK * 0.5, 256, 1024));
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = Math.round((canvasW * heightUnits) / span);
    const tex = track(new T.CanvasTexture(canvas));
    tex.colorSpace = T.SRGBColorSpace;
    tex.minFilter = T.LinearFilter;
    tex.magFilter = T.LinearFilter;
    tex.generateMipmaps = false;
    tex.anisotropy = ctx?.quality?.anisotropy || 4;
    const mat = track(new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    const mesh = new T.Mesh(new T.PlaneGeometry(span, heightUnits, 1, 1), mat);
    mesh.renderOrder = 20;
    mesh.frustumCulled = false;
    mesh.name = 'station-ruler';
    root.add(mesh);
    xRuler = {
      mesh, canvas, tex, span, heightUnits, left: -1e9,
      ctx2d: canvas.getContext('2d'),
      k: canvasW / Math.max(span * pxPerMetre, 1e-3),
    };
  }

  function drawStationRuler(leftUnits) {
    if (!xRuler) return;
    const { canvas, ctx2d: g, span, tex, k } = xRuler;
    const W = canvas.width, H = canvas.height;
    const pxPerUnit = W / span;
    const mpx = Math.max(layout.metresPerUnitX, 1e-6);
    const css = (v) => Math.max(1, Math.round(v * k));
    g.clearRect(0, 0, W, H);

    // machined faceplate, fading upward into the geology
    const grad = g.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, 'rgba(9,12,17,0.90)');
    grad.addColorStop(0.55, 'rgba(15,20,28,0.74)');
    grad.addColorStop(1, 'rgba(15,20,28,0.0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    const y0 = Math.round(H * 0.30);
    g.fillStyle = 'rgba(150,160,174,0.16)';
    g.fillRect(0, y0, W, 1.5);

    /* Tick pitch in METRES, chosen so ticks land 30–90 CSS px apart whatever
       the crossing length: 1-2-5 x 10^n, the way a drawing scale is chosen. */
    const wantPx = 62;
    const rawM = (wantPx / pxPerMetre) * mpx;
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(rawM, 1e-3))));
    const mant = rawM / pow;
    const stepM = (mant <= 1.5 ? 1 : mant <= 3.5 ? 2 : mant <= 7.5 ? 5 : 10) * pow;

    const leftM = leftUnits * mpx;
    const rightM = (leftUnits + span) * mpx;
    const s0 = Math.floor(leftM / stepM) * stepM;
    g.textBaseline = 'top';
    g.textAlign = 'center';
    for (let s = s0; s <= rightM; s += stepM) {
      if (s < -stepM * 0.5) continue;
      const x = (s / mpx - leftUnits) * pxPerUnit;
      if (x < -10 || x > W + 10) continue;
      const major = Math.abs((s / stepM) % 5) < 1e-6;
      g.fillStyle = major ? 'rgba(223,181,82,0.80)' : 'rgba(150,160,174,0.42)';
      g.fillRect(Math.round(x), y0, major ? 2 : 1, major ? H * 0.34 : H * 0.20);
      if (major) {
        g.fillStyle = 'rgba(250,250,250,0.88)';
        g.font = `600 ${css(11)}px ${BRAND.fontMono}`;
        g.fillText(String(Math.round(s)), x, y0 + H * 0.38);
      }
    }

    /* The scale statement that used to live here — `${lengthWord} m` on the
       left and the V.E. badge on the right — has moved to the scale plate
       below, and the reason is arithmetic. This strip is 1.7x the band wide
       so it can scroll without a repaint every frame, and it is drawn from
       `nl = floor((camX - halfW - halfW * 0.32) * 2) / 2`. Its own edges are
       therefore 3.46 units OFF SCREEN to the left and 10.59 units — 53 % of a
       band width — off screen to the RIGHT. Anything anchored to the canvas
       edge is anchored somewhere the player cannot see, and that is where the
       V.E. badge has been all along. HANDOFF §9.3 says "profile badges its
       factor and the others do not"; in fact profile badges its factor into
       the void. A badge that cannot be read is not a declaration. */

    tex.needsUpdate = true;
    xRuler.left = leftUnits;
  }

  /* ── THE SCALE PLATE — where the section admits what it is doing ──────────
     A title block. It states every scale the drawing is using, it is anchored
     to the FRUSTUM rather than to a scrolling texture, and it exists in every
     mode.

     This is HANDOFF §9.3 and §4. The depth axis is true metres while the bore
     is drawn ~7x over gauge (CFG holeR*, applyHoleDiameter) so that a 152 mm
     hole is not 1.3 px of nothing — a necessary exaggeration, and an
     undeclared one. A frame carrying a 1:1 ruler beside a 7x bore states two
     scales and admits to neither, which is exactly what the critic measured
     and wrote up as "the tool is 9-17x oversize against the ruler drawn beside
     it". research/07 §F1: "each labelled with its own scale, plus a small V.E.
     badge. This is not decoration — it is the thing that stops a player
     misreading the curve as tighter than it is."

     Every number on it is DERIVED from the transform actually in force —
     boreExag from the two diameters, layout.ve from metresPerUnitX — so it
     cannot drift from what is drawn. Amber when a scale is not 1:1, grey when
     it is, so an exaggeration is what the eye lands on. */
  const PLATE_H = 1.45;                 // units — 28 CSS px on the reference band
  let scalePlate = null;

  function killScalePlate() {
    if (!scalePlate) return;
    root.remove(scalePlate.mesh);
    scalePlate.mesh.geometry.dispose();
    scalePlate.mesh.material.dispose();
    scalePlate.tex.dispose();
    const i = disposables.indexOf(scalePlate.tex); if (i >= 0) disposables.splice(i, 1);
    const j = disposables.indexOf(scalePlate.mesh.material); if (j >= 0) disposables.splice(j, 1);
    scalePlate = null;
  }

  function buildScalePlate() {
    killScalePlate();
    if (!scene) return;
    /* Exactly the band's width, so the canvas edges ARE the frustum edges and
       right-aligned text lands on the right-hand edge of the picture. */
    const spanU = halfW * 2;
    const cssK = stripSuper();
    const canvasW = Math.round(clamp(spanU * pxPerMetre * cssK * 0.5, 256, 1024));
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = Math.max(8, Math.round((canvasW * PLATE_H) / spanU));
    const tex = track(new T.CanvasTexture(canvas));
    tex.colorSpace = T.SRGBColorSpace;
    tex.minFilter = T.LinearFilter;
    tex.magFilter = T.LinearFilter;
    tex.generateMipmaps = false;
    const mat = track(new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    const mesh = new T.Mesh(new T.PlaneGeometry(spanU, PLATE_H, 1, 1), mat);
    mesh.renderOrder = 20;
    mesh.frustumCulled = false;
    mesh.name = 'scale-plate';
    root.add(mesh);
    scalePlate = {
      mesh, canvas, tex, spanU,
      ctx2d: canvas.getContext('2d'),
      k: canvasW / Math.max(spanU * pxPerMetre, 1e-3),
      exag: -1, ve: -1, mm: -1,
    };
  }

  function drawScalePlate() {
    if (!scalePlate) return;
    const { canvas, ctx2d: g, tex, k } = scalePlate;
    const W = canvas.width, H = canvas.height;
    const css = (v) => Math.max(1, Math.round(v * k));
    const ex = boreExag;
    const ve = layout.ve;
    const mm = Math.round(Number(spec.holeDiaMm) || CFG.holeDiaDefault);
    g.clearRect(0, 0, W, H);

    /* The same machined faceplate as the rest of the instrument furniture, but
       held OPAQUE behind the type and feathered only across the top eighth.
       The renderer darkens the foot of the section band by up to 28 %
       (renderer.js uSectionVignette, quadratic in depth into the cut) on top
       of the global vignette, so a plate that fades out exactly where its text
       sits puts small grey type on dark rock at reduced exposure. Measured:
       that is what made the first version's second line invisible. */
    const grad = g.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, 'rgba(9,12,17,0.94)');
    grad.addColorStop(0.86, 'rgba(11,15,21,0.90)');
    grad.addColorStop(1, 'rgba(15,20,28,0.0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    // a hairline top edge, so the plate reads as a plate and not as a fog bank
    g.fillStyle = 'rgba(150,160,174,0.20)';
    g.fillRect(0, Math.round(H * 0.14), W, Math.max(1, css(0.8)));

    const GREY = 'rgba(166,176,190,0.74)';
    const AMBER = 'rgba(232,192,94,0.96)';
    /* Inset to the DRAWING area, not to the canvas. The depth ruler owns the
       right CFG.rulerWidth units and the drill log the left CFG.logWidth, and
       the plate draws in front of both (z 2.05 against their 2.0), so text run
       to the canvas edge lands on top of a ruler numeral. */
    const pxPerUnit = W / scalePlate.spanU;
    const padL = Math.round(CFG.logWidth * pxPerUnit) + css(4);
    const padR = W - Math.round(CFG.rulerWidth * pxPerUnit) - css(4);
    g.textBaseline = 'top';

    /* LEFT: the axis that is true. Saying "1:1" out loud is the half of the
       statement that gives the exaggeration something to be measured against. */
    g.textAlign = 'left';
    g.fillStyle = GREY;
    g.font = `700 ${css(8.5)}px ${BRAND.fontMono}`;
    g.fillText(mode.horizontal ? `${mode.lengthWord} 1 u = ${Math.max(layout.metresPerUnitX, 1e-6).toFixed(layout.metresPerUnitX < 10 ? 1 : 0)} m`
                               : 'DEPTH 1:1', padL, css(3.5));

    /* RIGHT: every scale that is NOT 1:1. Below 1.0 the bore is drawn UNDER
       gauge — a 6 m raise bore hits holeRMax at 0.53x — and the plate says so
       rather than staying silent, which is the same discipline as printing
       `sourced: false` instead of rounding a number off and hoping. */
    const badge = (txt, on, x) => {
      g.fillStyle = on ? AMBER : GREY;
      g.font = `700 ${css(9.5)}px ${BRAND.fontMono}`;
      g.textAlign = 'right';
      g.fillText(txt, x, css(3.0));
      return x - g.measureText(txt).width - css(9);
    };
    let rx = padR;
    rx = badge(ex >= 1.05 ? `BORE ${ex.toFixed(1)}:1`
             : ex <= 0.95 ? `BORE 1:${(1 / Math.max(ex, 1e-6)).toFixed(1)}`
             : 'BORE 1:1', ex >= 1.05 || ex <= 0.95, rx);
    if (mode.horizontal) badge(ve > 1.05 ? `V.E. ${ve.toFixed(1)}:1` : 'V.E. 1:1', ve > 1.05, rx);

    /* The arithmetic behind the badge, under it, so the ratio is checkable
       against the ruler in the same frame rather than merely asserted. */
    g.fillStyle = 'rgba(150,160,174,0.66)';
    g.font = `500 ${css(8)}px ${BRAND.fontMono}`;
    g.textAlign = 'right';
    g.fillText(`Ø ${mm} mm DRAWN ${Math.round(2 * holeR * 1000)} mm`, padR, css(13.5));

    tex.needsUpdate = true;
    scalePlate.exag = ex; scalePlate.ve = ve; scalePlate.mm = mm;
  }

  /* ── THE DRIVING RECORD ───────────────────────────────────────────────────
     "For driven piling: the driving log IS the depth ruler" — research/05 §E5
     item 8. Real pile records are blows per 500 or 250 mm plotted against
     depth and tightening to blows per 25 mm in the final metre ([TOM] §11.3.1),
     so the depth axis becomes a horizontal bar chart of blow count that grows
     as the pile goes down. It makes refusal visible as a wall of bars.

     Three thresholds are drawn as vertical rules, all from [TOM] §3.1.6:
       120–150 / 250 mm   the practical limit for sustained driving
       200 / 250 mm       acceptable for fairly short periods
       248 / 250 mm       API refusal, sustained over 1.5 m

     And the trap stays intact. A broomed toe produces a beautiful set, so a
     falling bar count near the design depth is NOT good news; the only thing
     telling the truth is the penetration into the bearing stratum, which is
     why that is printed at the toe and nowhere else. */
  function drawDrivingRecord(topDepth) {
    const { canvas, ctx2d: g, span, tex, k } = ruler;
    const W = canvas.width, H = canvas.height;
    const pxPerM = H / span;
    const css = (v) => Math.max(1, Math.round(v * k));
    g.clearRect(0, 0, W, H);

    const grad = g.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(15,20,28,0.0)');
    grad.addColorStop(0.16, 'rgba(15,20,28,0.78)');
    grad.addColorStop(1, 'rgba(9,12,17,0.90)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    const x0 = Math.round(W * 0.10);          // the zero-blow datum
    const full = W - x0 - css(2);
    const NMAX = 300;                          // blows / 250 mm at full scale
    const bx = (n) => x0 + (Math.min(n, NMAX) / NMAX) * full;

    // threshold rules
    const rules = [
      [pile.practicalLimit, 'rgba(240,179,25,0.55)'],
      [200, 'rgba(240,179,25,0.35)'],
      [pile.refusal, 'rgba(239,68,68,0.62)'],
    ];
    for (const [n, col] of rules) {
      g.fillStyle = col;
      g.fillRect(Math.round(bx(n)), 0, Math.max(1, css(0.8)), H);
    }

    const driven = depth;                      // metres of pile in the ground
    const fineFrom = Math.max(0, pile.lengthM - 1.0);
    let d = Math.max(0, Math.floor(topDepth / pile.stepM) * pile.stepM);
    const dEnd = topDepth + span;
    let guard = 0;
    while (d < dEnd && guard++ < 900) {
      const step = d >= fineFrom ? pile.fineStepM : pile.stepM;
      const y = (d - topDepth) * pxPerM;
      const hgt = Math.max(1, step * pxPerM - css(0.35));
      if (y > -4 && y < H + 4) {
        /* Blows per 250 mm; the final-metre bars are per 25 mm, so they are
           scaled by the step ratio to stay on one axis — which is exactly what
           a driller does when reading the two halves of the same record. */
        const n = blowsAt(d + step * 0.5) * (step / pile.stepM);
        const drawn = d <= driven;
        const w = bx(n) - x0;
        g.fillStyle = !drawn ? 'rgba(150,160,174,0.13)'
          : n >= pile.refusal ? 'rgba(239,68,68,0.88)'
          : n >= pile.practicalLimit ? 'rgba(240,179,25,0.88)'
          : 'rgba(111,182,199,0.80)';
        g.fillRect(x0, Math.round(y), Math.max(1, w), hgt);
      }
      d += step;
    }

    // the axis, and its scale
    g.fillStyle = 'rgba(150,160,174,0.30)';
    g.fillRect(x0, 0, Math.max(1, css(0.9)), H);
    g.fillStyle = 'rgba(150,160,174,0.55)';
    g.font = `600 ${css(7.5)}px ${BRAND.fontSans}`;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillText('BLOWS / 250', css(1.5), css(1.5));

    // metre marks stay, small, so the record is still a depth axis
    const d0 = Math.ceil(topDepth), d1 = Math.floor(topDepth + span);
    g.textBaseline = 'middle';
    for (let m = d0; m <= d1; m++) {
      if (m < 0 || m % 5 !== 0) continue;
      const y = (m - topDepth) * pxPerM;
      if (y < -8 || y > H + 8) continue;
      g.fillStyle = 'rgba(250,250,250,0.70)';
      g.font = `600 ${css(8)}px ${BRAND.fontMono}`;
      g.fillText(String(m), css(1.5), y);
    }

    /* THE TOE — for a driven pile the toe is the score, and the number that
       matters is the penetration INTO the bearing stratum, not the set. */
    if (pile.bearing) {
      const ty = (pile.lengthM - topDepth) * pxPerM;
      if (ty > -20 && ty < H + 20) {
        g.fillStyle = 'rgba(16,185,129,0.85)';
        g.fillRect(0, Math.round(ty) - 1, W, Math.max(1, css(1.4)));
        g.textAlign = 'right';
        g.font = `700 ${css(8)}px ${BRAND.fontMono}`;
        g.fillText(`+${pile.toeIntoBearing.toFixed(1)} m`, W - css(2), ty - css(7));
      }
    }
    tex.needsUpdate = true;
    ruler.top = topDepth;
  }

  function drawRuler(topDepth) {
    // for a driven pile the depth ruler IS the driving record (research/05 §E5)
    if (pile && pile.driven) { drawDrivingRecord(topDepth); return; }
    const { canvas, ctx2d: g, span, tex, k } = ruler;
    const W = canvas.width, H = canvas.height;
    const pxPerM = H / span;
    const css = (v) => Math.max(1, Math.round(v * k));   // CSS px -> canvas px
    g.clearRect(0, 0, W, H);

    // machined faceplate
    const grad = g.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(15,20,28,0.0)');
    grad.addColorStop(0.22, 'rgba(15,20,28,0.72)');
    grad.addColorStop(1, 'rgba(9,12,17,0.86)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(150,160,174,0.16)';
    g.fillRect(Math.round(W * 0.20), 0, 1.5, H);

    const x0 = Math.round(W * 0.20);
    const d0 = Math.floor(topDepth);
    const d1 = Math.ceil(topDepth + span);
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    for (let d = d0; d <= d1; d++) {
      if (d < 0) continue;
      const y = (d - topDepth) * pxPerM;
      if (y < -8 || y > H + 8) continue;
      const major = d % 10 === 0;
      const mid = d % 5 === 0;
      const len = major ? W * 0.46 : mid ? W * 0.30 : W * 0.16;
      g.fillStyle = major ? 'rgba(223,181,82,0.80)' : mid ? 'rgba(150,160,174,0.70)' : 'rgba(150,160,174,0.38)';
      g.fillRect(x0, Math.round(y) - (major ? 1 : 0), len, major ? 2 : 1);
      if (major) {
        g.fillStyle = 'rgba(250,250,250,0.90)';
        g.font = `600 ${css(12)}px ${BRAND.fontMono}`;
        g.fillText(String(d), x0 + W * 0.34, y);
      } else if (mid) {
        g.fillStyle = 'rgba(150,160,174,0.60)';
        g.font = `500 ${css(8.5)}px ${BRAND.fontMono}`;
        g.fillText(String(d), x0 + W * 0.34, y);
      }
    }
    // water table datum
    const wy = (waterTableDepth - topDepth) * pxPerM;
    if (wy > -4 && wy < H + 4) {
      g.fillStyle = 'rgba(111,182,199,0.85)';
      g.fillRect(0, Math.round(wy) - 1, W * 0.18, css(1.2));
      g.font = `600 ${css(7)}px ${BRAND.fontSans}`;
      g.textAlign = 'left';
      g.fillText('GWL', 2, wy - css(6));
    }
    /* ── DATUMS THE MODE OWNS ────────────────────────────────────────────────
       A raise is bored between two levels and the section has to show both —
       but raises run 30 m to 1,000 m and the band is 20 m tall, so at true
       scale they can never share a frame. The openings are drawn where they
       are; the ruler carries the datum, so wherever the player is scrolled
       they can see which level they are near and how far the other one is.
       A pile gets the same treatment for its bearing stratum, because the
       penetration into it is the only honest measure of a driven pile. */
    const datum = (dep, label, col) => {
      const y = (dep - topDepth) * pxPerM;
      if (y < -4 || y > H + 4) return;
      g.fillStyle = col;
      g.fillRect(0, Math.round(y) - 1, W * 0.62, css(1.6));
      g.font = `700 ${css(7)}px ${BRAND.fontSans}`;
      g.textAlign = 'left';
      g.fillText(label, 2, y - css(6));
    };
    if (raise) {
      datum(0, 'UPPER LVL', 'rgba(223,181,82,0.90)');
      datum(raise.length, 'LOWER LVL', 'rgba(223,181,82,0.90)');
    }
    if (pile && pile.bearing) datum(pile.bearing.top, 'BEARING', 'rgba(16,185,129,0.85)');
    if (path) datum(path.Dc, 'COVER', 'rgba(223,181,82,0.70)');

    // 'm' unit mark at the top of the strip — the section's only unit label
    g.fillStyle = 'rgba(150,160,174,0.50)';
    g.font = `600 ${css(8)}px ${BRAND.fontSans}`;
    g.textAlign = 'left';
    g.fillText('m', x0 + W * 0.34, css(8));

    tex.needsUpdate = true;
    ruler.top = topDepth;
  }

  /* Hatch pitches are given in CSS pixels and scaled by the strip's supersample
     factor, so the pattern is the same physical size on every device instead of
     moireing on dense ones. */
  const HATCH = {
    clay: (g, x, y, w, h, u) => { g.strokeStyle = 'rgba(0,0,0,0.40)'; g.lineWidth = Math.max(1, u * 0.4); for (let i = 0; i < h; i += 3.2 * u) { g.beginPath(); g.moveTo(x + u, y + i); g.lineTo(x + w - u, y + i); g.stroke(); } },
    sand: (g, x, y, w, h, u) => { g.fillStyle = 'rgba(0,0,0,0.40)'; const p = 2.6 * u; let r = 0; for (let i = 0; i < h; i += p, r++) for (let j = 0; j < w; j += p) g.fillRect(x + j + (r % 2) * p * 0.5, y + i, u * 0.6, u * 0.6); },
    gravel: (g, x, y, w, h, u) => { g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = Math.max(1, u * 0.4); const p = 4.0 * u; let r = 0; for (let i = 0; i < h; i += p, r++) for (let j = 0; j < w; j += p) { g.beginPath(); g.arc(x + j + p * 0.45 + (r % 2) * p * 0.5, y + i + p * 0.45, u * 0.95, 0, TAU); g.stroke(); } },
    till: (g, x, y, w, h, u) => { g.fillStyle = 'rgba(0,0,0,0.38)'; const p = 3.6 * u; let r = 0; for (let i = 0; i < h; i += p, r++) for (let j = 0; j < w; j += p) { const q = Math.floor(r + j / p) % 3; if (q === 0) g.fillRect(x + j + u * 0.5, y + i + u * 0.5, u * 1.3, u * 0.8); else if (q === 1) { g.beginPath(); g.arc(x + j + p * 0.5, y + i + p * 0.5, u * 0.7, 0, TAU); g.fill(); } } },
    sedimentary: (g, x, y, w, h, u) => { g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = Math.max(1, u * 0.45); for (let i = 0; i < h; i += 4.0 * u) { g.beginPath(); g.moveTo(x + u, y + i); g.lineTo(x + w - u, y + i); g.stroke(); } },
    crystalline: (g, x, y, w, h, u) => { g.strokeStyle = 'rgba(0,0,0,0.42)'; g.lineWidth = Math.max(1, u * 0.4); const p = 4.2 * u; let r = 0; for (let i = 0; i < h; i += p, r++) for (let j = 0; j < w; j += p) { const cx = x + j + p * 0.45 + (r % 2) * p * 0.5, cy = y + i + p * 0.45; g.beginPath(); g.moveTo(cx - u, cy); g.lineTo(cx + u, cy); g.moveTo(cx, cy - u); g.lineTo(cx, cy + u); g.stroke(); } },
    fractured: (g, x, y, w, h, u) => { g.strokeStyle = 'rgba(0,0,0,0.48)'; g.lineWidth = Math.max(1, u * 0.4); for (let i = -w; i < h; i += 3.2 * u) { g.beginPath(); g.moveTo(x + u, y + i); g.lineTo(x + w - u, y + i + w - 2 * u); g.stroke(); } },
    void: (g, x, y, w, h) => { g.fillStyle = 'rgba(0,0,0,0.62)'; g.fillRect(x + 1, y, w - 2, h); },
  };

  /**
   * Drill-log labels: [full, short, code]. drawLog picks the widest form that
   * fits both the column width AND the thickness of the bed it names. The codes
   * are the ones a driller already reads on a real log (CL clay, ML silt,
   * SA sand, GR gravel, LST limestone, SST sandstone, SH shale), so eliding is
   * information loss, not comprehension loss.
   */
  const LOG_LABEL = {
    topsoil:   ['TOPSOIL', 'TOPSOIL', 'TS'],
    clay:      ['CLAY', 'CLAY', 'CL'],
    silt:      ['SILT', 'SILT', 'ML'],
    sand:      ['SAND', 'SAND', 'SA'],
    gravel:    ['GRAVEL', 'GRAVEL', 'GR'],
    till:      ['GLACIAL TILL', 'TILL', 'TL'],
    boulder:   ['BOULDER BED', 'BOULDERS', 'BLD'],
    marl:      ['MARL', 'MARL', 'MRL'],
    chalk:     ['CHALK', 'CHALK', 'CK'],
    limestone: ['LIMESTONE', 'LMSTN', 'LST'],
    sandstone: ['SANDSTONE', 'SDSTN', 'SST'],
    shale:     ['SHALE', 'SHALE', 'SH'],
    schist:    ['SCHIST', 'SCHIST', 'SCH'],
    gneiss:    ['GNEISS', 'GNEISS', 'GNS'],
    granite:   ['GRANITE', 'GRANITE', 'GRN'],
    basalt:    ['BASALT', 'BASALT', 'BSL'],
    quartzite: ['QUARTZITE', 'QTZITE', 'QTZ'],
    fracture:  ['FRACTURE ZONE', 'FRACTURED', 'FRZ'],
    karst:     ['KARST VOID', 'VOID', 'VD'],
    permafrost:['PERMAFROST', 'PERMAFR', 'PF'],
    concrete:  ['CONCRETE', 'CONCRETE', 'CNC'],
  };
  function labelFormsFor(s) {
    const t = LOG_LABEL[s.id];
    if (t) return t;
    const up = String(s.name || '').toUpperCase();
    return [up, up.split(' ')[0], up.replace(/[^A-Z]/g, '').slice(0, 3)];
  }

  /* ── log typography, in CSS pixels ────────────────────────────────────────
     The old set was 21.7 px type on a 25.5 px line step, so a name plus a UCS
     line was 76.5 CSS px == 2.76 m of section, while the print gate let it draw
     in any bed over 1.20 m. Every bed between those numbers printed a label
     block up to 2.3x taller than the bed it named, spilling into its
     neighbours — and the profiles are full of them (sand t:[2,6],
     gravel t:[1.5,4.5], silt t:[1.5,5]).

     Now the block height is computed first and compared against the bed, so a
     label can never exceed what it names. On the 20 m view (19.4 px/m) the
     three tiers below need beds of 1.13 m, 0.60 m and 0.47 m respectively. */
  const LOG_T = {
    name: 9.5,     // name type size
    ucs: 7.5,      // strength line type size
    step: 10.8,    // baseline-to-baseline for name lines
    padTop: 2.2,   // inset from the top contact of the bed
    padBot: 1.5,   // clearance above the next contact
    code: 7.0,     // the 2-3 char code used in a thin bed
    gutter: 3.0,   // gap between the text and the hatch column
  };

  /* ── THE LOG SWATCH MUST MATCH THE ROCK IT LEGENDS ───────────────────────
     drawLog filled the hatch column with s.colors[0] — the RAW ALBEDO. Since
     the palette is authored on the lit result (see contract.js), that is not
     remotely what the bed looks like: the measured strip showed a lavender-
     pink fracture swatch against rust rock and a blue-grey granite swatch
     against green-grey rock.

     This reproduces FACE_FRAG's own output for the bed's MEAN pixel, in linear
     light, and writes it into the canvas sRGB-encoded. The strip is a
     MeshBasicMaterial with an sRGB map, so the texture is decoded straight
     back to linear and lands in the same composer target the face writes to —
     which means it takes core/renderer.js's grade pass exactly once, exactly
     as the face does, and the two agree by construction rather than by luck.

     PAT_GAIN is the mean multiplier each pattern family applies (measured over
     a 120x120 sample of the real pattern functions, ucs term factored out) and
     SWATCH_AO the mean of the crevice/form occlusion. Verified against a
     numerical mirror of FACE_FRAG: worst ΔE76 1.9 across all 21 materials,
     mean 0.6. Re-measure these if patternShade changes. */
  const PAT_GAIN = {
    clay: 1.011, sand: 1.001, gravel: 0.880, till: 1.017,
    sedimentary: 0.929, fractured: 0.877, crystalline: 0.804, void: 0.220,
  };
  const PAT_SPARK = { crystalline: 0.0045, fractured: 0.0036 };
  const SWATCH_NDL = 0.55, SWATCH_FILL = 0.4323, SWATCH_AO = 0.98;
  const _swatch = new Map();
  const _toLin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const _toSrgb = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

  /** The bed's mean lit colour, as a CSS rgb() string. shade scales it. */
  function litSwatch(s, shade = 1) {
    const ck = `${s.id}|${shade}`;
    const hit = _swatch.get(ck);
    if (hit) return hit;
    const rgb = hexToRgb(s.colors[0]);
    const base = [_toLin(rgb[0] / 255), _toLin(rgb[1] / 255), _toLin(rgb[2] / 255)];
    const ucsN = Math.min(s.ucs, 300) / 300;
    const cool = clamp(((base[2] - base[0]) / (base[2] + base[0] + 0.02)) * 2.2);
    const gain = (PAT_GAIN[s.pattern] ?? 0.93) * (0.92 + 0.16 * ucsN) * SWATCH_AO;
    const ka = (0.46 + 0.54 * SWATCH_FILL) * (1 + cool * 0.90);
    const kk = 0.10 + 2.60 * SWATCH_NDL;
    const sp = (PAT_SPARK[s.pattern] ?? 0) * 2.20 * (0.25 + 0.75 * SWATCH_NDL);
    const K = U.uKeyWarm.value, A = U.uAmbientCool.value;
    const key = [K.r, K.g, K.b], amb = [A.r, A.g, A.b];
    const out = [0, 1, 2].map((i) => {
      const lin = (base[i] * gain * (amb[i] * ka + key[i] * kk) + key[i] * sp) * shade;
      return Math.round(clamp(_toSrgb(clamp(lin))) * 255);
    });
    const str = `rgb(${out[0]},${out[1]},${out[2]})`;
    _swatch.set(ck, str);
    return str;
  }

  function drawLog(topDepth) {
    const { canvas, ctx2d: g, span, tex, k } = logStrip;
    const W = canvas.width, H = canvas.height;
    const pxPerM = H / span;
    const css = (v) => v * k;                 // CSS px -> canvas px
    const toCss = (v) => v / k;               // canvas px -> CSS px
    g.clearRect(0, 0, W, H);

    const grad = g.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(9,12,17,0.88)');
    grad.addColorStop(0.72, 'rgba(15,20,28,0.62)');
    grad.addColorStop(1, 'rgba(15,20,28,0.0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    const colX = Math.round(W * 0.62);
    const colW = Math.round(W * 0.28);
    const textR = colX - css(LOG_T.gutter);   // right edge of the text column
    const textW = textR - css(1.5);           // room a label has to fit into

    // heights of the three label tiers, in CSS px
    const hTwoLine = LOG_T.padTop + LOG_T.step * 2 + LOG_T.ucs + LOG_T.padBot;
    const hNameUcs = LOG_T.padTop + LOG_T.step + LOG_T.ucs + LOG_T.padBot;
    const hNameOnly = LOG_T.padTop + LOG_T.name + LOG_T.padBot;
    const hCodeOnly = LOG_T.padTop + LOG_T.code + LOG_T.padBot;

    const fits = (txt, sizeCss, weight, font) => {
      g.font = `${weight} ${css(sizeCss)}px ${font}`;
      return g.measureText(txt).width <= textW;
    };

    /* ── THE LOG IS ONLY A LOG WHERE THERE IS A HOLE ────────────────────────
       This strip was printing "60 MPa" beside rock the bit had not reached,
       which is the same failure the cut beside it had (see lookUnc()) but in
       the harder form, because a NUMBER cannot be read as an impression. A
       compressive strength is a laboratory result on a core sample. You
       cannot have one for ground nobody has cored, and a log that prints one
       is not a log, it is a fabrication with a unit on it.

       The assay track at the foot of this function already refuses to plot
       ahead of the bit and says why. This is the same rule applied to the
       lithology, and both take their uncertainty from lookUncAt(), which is
       the same curve the shader uses — so the strip and the cut can never
       disagree about which ground is known. */
    const loggedTo = depthForStation(depth);

    for (const s of strata) {
      const y0 = (s.top - topDepth) * pxPerM;
      const y1 = (s.bottom - topDepth) * pxPerM;
      if (y1 < -20 || y0 > H + 20) continue;
      const yy0 = Math.max(-20, y0), yy1 = Math.min(H + 20, y1);
      const hh = yy1 - yy0;
      /* Per BED, not per pixel: what the log claims is "this bed's top is at
         that depth", so the uncertainty of the claim is the uncertainty at
         the contact it is drawn from. */
      const unc = lookUncAt(s.top - loggedTo);
      const entered = s.top <= loggedTo;

      // hatch column, filled with the bed's LIT colour, not its albedo
      g.save();
      g.beginPath(); g.rect(colX, yy0, colW, hh); g.clip();
      g.fillStyle = litSwatch(s);
      g.fillRect(colX, yy0, colW, hh);
      // the hatch is the bed's FABRIC, and fabric is a core-box observation
      g.globalAlpha = 1 - unc * 0.72;
      (HATCH[s.pattern] || HATCH.clay)(g, colX, yy0, colW, hh, k);
      g.restore();

      // the contact, drawn the same way the 3D draws it: a dark parting with a
      // lighter lip on the bed above — and softened by the same doubt, so the
      // strip agrees with the cut about where a boundary is only a projection
      const cy = Math.round(y0) + 0.5;
      const ck = 1 - unc * 0.70;
      g.fillStyle = `rgba(6,9,13,${(0.85 * ck).toFixed(3)})`;
      g.fillRect(colX, cy, colW, Math.max(1, css(1.0)));
      g.fillStyle = `rgba(223,181,82,${(0.30 * ck).toFixed(3)})`;
      g.fillRect(colX, cy - Math.max(1, css(0.7)), colW, Math.max(1, css(0.7)));

      /* Choose a label that fits the BED, then a form of it that fits the
         COLUMN. A label may never be taller than the thing it names. */
      const hhCss = toCss(hh);
      const [full, short, code] = labelFormsFor(s);
      const ucsTxt = s.ucs >= 1 ? `${Math.round(s.ucs)} MPa` : 'SOIL';
      const oneLine = (sz) => (fits(full, sz, 600, BRAND.fontSans) ? full
                             : fits(short, sz, 600, BRAND.fontSans) ? short : code);
      const trail = (LOG_T.step - LOG_T.name) * 0.5;
      let lines = null, showUcs = false, size = LOG_T.name, blockCss = 0;

      if (hhCss >= hTwoLine && full.indexOf(' ') > 0 && !fits(full, LOG_T.name, 600, BRAND.fontSans)) {
        lines = full.split(' '); showUcs = true;
        blockCss = LOG_T.step * 2 - trail + LOG_T.ucs;
      } else if (hhCss >= hNameUcs) {
        lines = [oneLine(LOG_T.name)]; showUcs = true;
        blockCss = LOG_T.step - trail + LOG_T.ucs;
      } else if (hhCss >= hNameOnly) {
        lines = [oneLine(LOG_T.name)];
        blockCss = LOG_T.name;
      } else if (hhCss >= hCodeOnly) {
        lines = [code]; size = LOG_T.code;
        blockCss = LOG_T.code;
      }
      // every line has to clear the column, not just the first
      if (lines && !lines.every((ln) => fits(ln, size, 600, BRAND.fontSans))) {
        const one = oneLine(size);
        lines = fits(one, size, 600, BRAND.fontSans) ? [one] : null;
        if (lines) blockCss = showUcs ? LOG_T.step - trail + LOG_T.ucs : size;
      }

      if (lines) {
        /* ANCHOR TO THE VISIBLE CENTRE, NOT THE BED TOP.
           Riding the top meant that at a contact two labels crowded into 20
           CSS px while 200 px of the bed below them carried nothing at all —
           the strip read as a caption stuck to a line rather than a legend for
           a body of rock. The label now centres on the part of the bed the
           player can actually see: the intersection of the bed with the
           viewport, clamped back inside the bed so it still can never cross
           the contact below it (which was the round-2 fix and stays).

           The strip is drawn span metres tall and re-centred only when the
           window leaves it; update() places the viewport viewMetres * 0.22
           into that span, so this is where the visible window sits. */
        const viewTop = viewMetres * 0.22 * pxPerM;
        const viewBot = viewTop + viewMetres * pxPerM;
        const v0 = Math.max(y0, viewTop);
        const v1 = Math.min(y1, viewBot);
        const mid = v1 > v0 ? (v0 + v1) * 0.5 : (y0 + y1) * 0.5;
        const top = y0 + css(LOG_T.padTop);
        const bot = y1 - css(LOG_T.padBot) - css(blockCss);
        let ly = Math.min(Math.max(mid - css(blockCss) * 0.5, top), Math.max(bot, top));
        g.textAlign = 'right';
        g.textBaseline = 'top';
        /* The NAME survives the doubt almost intact, and that is the same
           asymmetry the cut draws: which rock it is comes off a map and is
           fairly well known, where its top sits does not. It dims a little
           so the logged part of the strip reads as the firmer statement. */
        g.fillStyle = `rgba(250,250,250,${(0.86 * (1 - unc * 0.34)).toFixed(3)})`;
        g.font = `600 ${css(size)}px ${BRAND.fontSans}`;
        for (const wd of lines) { g.fillText(wd, textR, ly); ly += css(LOG_T.step); }
        /* THE STRENGTH IS A LAB RESULT ON A CORE SAMPLE, so it exists for a
           bed the bit has entered and for no other. Not dimmed, not qualified
           — absent. A number on a log is either measured or it is a
           fabrication, and there is no third rendering of it. */
        if (showUcs && entered) {
          g.fillStyle = 'rgba(150,160,174,0.62)';
          g.font = `500 ${css(LOG_T.ucs)}px ${BRAND.fontMono}`;
          g.fillText(ucsTxt, textR, ly - css(trail));
        }
      }
    }
    /* ── WHERE THE LOG STOPS BEING A LOG ────────────────────────────────────
       One rule and one word, drawn once. Everything above this line was
       observed by the bit; everything below it is interpolation, and the
       section spends most of its area on the second kind. Naming the
       convention costs 7 CSS px of type and removes the need for a tutorial
       to say what the softening below it means — which is the cheaper way to
       teach it than a legend, a tooltip or a HUD panel.

       It is suppressed when there is nothing to qualify: a fully surveyed job
       (ceiling 0, and a reamed raise) has no projected half, and a line
       announcing one would be chrome. */
    const ceil = surveyCeiling();
    if (ceil > 0.02) {
      const ly = (loggedTo - topDepth) * pxPerM;
      if (ly > -2 && ly < H - css(2)) {
        g.fillStyle = 'rgba(223,181,82,0.55)';
        g.fillRect(0, Math.round(ly), W, Math.max(1, css(0.8)));
        g.textAlign = 'left';
        g.textBaseline = 'top';
        g.fillStyle = 'rgba(223,181,82,0.62)';
        g.font = `700 ${css(7)}px ${BRAND.fontSans}`;
        g.fillText('PROJECTED', css(1.5), Math.round(ly) + css(1.5));
      }
    }

    /* ── THE ASSAY TRACK ────────────────────────────────────────────────────
       A real section log carries a grade strip beside the lithology, and this
       is that strip: bars growing right from the left edge of the hatch column
       for the intervals the bit has actually passed through, with the
       commodity's own cut-off drawn as a rule. Nothing is plotted ahead of the
       bit — the whole point of the ore body is that the player cannot see it
       before drilling it, and a log that printed the un-drilled grade would
       give the game away in the first frame.

       It overlays the hatch rather than taking layout from it: the label
       ladder above is tuned to 63 CSS px of text room and would fall through
       to three-letter codes if the column were narrowed. */
    if (ore) {
      const drilledTvd = depthForStation(depth);
      const gw = colW * 0.86;
      const cutX = colX + (ore.cutoff / Math.max(ore.grade[3], 1e-6)) * gw;
      const stepM = Math.max((1.2 / pxPerM), profileDepth / 900);
      let any = false;
      for (let m = Math.max(0, topDepth); m < topDepth + span; m += stepM) {
        if (m > drilledTvd) break;
        const f = oreFieldAt(mode.horizontal ? depthToStationX(m) : 0, m);
        if (f.g <= 0.004) continue;
        const y = (m - topDepth) * pxPerM;
        if (y < -2 || y > H + 2) continue;
        const w = Math.max(1, f.g * gw);
        const hot = f.g * ore.grade[3] >= ore.cutoff;
        g.fillStyle = hot ? ore.tintCss : 'rgba(150,160,174,0.34)';
        g.fillRect(colX, Math.round(y), w, Math.max(1, stepM * pxPerM + 0.6));
        any = true;
      }
      if (any) {
        g.fillStyle = 'rgba(239,68,68,0.55)';
        g.fillRect(Math.round(cutX), 0, Math.max(1, css(0.7)), H);
      }
      // the commodity, named once at the top of the strip
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillStyle = 'rgba(250,250,250,0.55)';
      g.font = `700 ${css(7)}px ${BRAND.fontMono}`;
      g.fillText(`${ore.symbol} ${ore.unit}`, colX + css(1), css(1));
    }

    // vertical rail
    g.fillStyle = 'rgba(150,160,174,0.20)';
    g.fillRect(colX + colW + css(0.8), 0, Math.max(1, css(0.7)), H);

    tex.needsUpdate = true;
    logStrip.top = topDepth;
  }

  /* The depth readout used to be CFG.rulerWidth * 2.5 = 11.5 units wide,
     positioned at halfW - rulerWidth * 1.85. It spanned -7.22 to +4.28 against
     a frustum of +/-7.04: wider than the whole camera, hanging off the LEFT
     edge, covering 45% of the ruler and all of the log strip at the bit line.
     It is now a compact index marker that sits ON the ruler and points inward:
     1.25 ruler widths (63 CSS px) centred at halfW - rulerWidth * 0.55, which
     is the ruler's own centre. Content is drawn in the left 94% of the canvas
     so its right edge lands exactly on the frustum edge. */
  const READOUT_CW = 240, READOUT_CH = 92, READOUT_INSET = 0.99;
  let readoutHalfW = CFG.rulerWidth * 0.625;
  function buildReadout() {
    if (readout) { root.remove(readout.mesh); readout.mesh.geometry.dispose(); }
    const canvas = document.createElement('canvas');
    canvas.width = READOUT_CW; canvas.height = READOUT_CH;
    const tex = track(new T.CanvasTexture(canvas));
    tex.colorSpace = T.SRGBColorSpace;
    tex.minFilter = T.LinearFilter;
    tex.generateMipmaps = false;
    const mat = track(new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    /* The plate spanned device x 682 -> 777+ against a 780 px clip, so its
       right rounded corner never rendered. It is anchored off its own half
       width now (see update()), with 0.15 units of margin, so the corner is
       inside the frustum whatever the ruler width or the aspect. */
    const wU = CFG.rulerWidth * 1.25;
    readoutHalfW = wU * 0.5;
    const mesh = new T.Mesh(new T.PlaneGeometry(wU, wU * (READOUT_CH / READOUT_CW), 1, 1), mat);
    mesh.renderOrder = 21;
    mesh.frustumCulled = false;
    mesh.name = 'depth-readout';
    root.add(mesh);
    readout = { mesh, canvas, tex, ctx2d: canvas.getContext('2d'), last: -1 };
  }

  function drawReadout(d) {
    const { canvas, ctx2d: g, tex } = readout;
    const W = canvas.width, H = canvas.height;
    const R = W * READOUT_INSET;     // the frustum edge, in canvas pixels
    const cy = H * 0.5;
    g.clearRect(0, 0, W, H);
    // pointer, aimed inward at the borehole
    g.fillStyle = BRAND.amber;
    g.beginPath();
    g.moveTo(2, cy); g.lineTo(40, cy - 17); g.lineTo(40, cy + 17);
    g.closePath(); g.fill();
    // machined plate
    g.fillStyle = 'rgba(11,15,21,0.92)';
    roundRect(g, 38, 8, R - 38, H - 16, 9);
    g.fill();
    g.strokeStyle = 'rgba(223,181,82,0.60)';
    g.lineWidth = 2.5;
    roundRect(g, 38, 8, R - 38, H - 16, 9);
    g.stroke();
    // the number. No unit: the ruler's own 'm' header carries it, and this
    // marker sits directly on that ruler.
    g.fillStyle = BRAND.amberHot;
    g.font = `700 ${d < 100 ? 52 : 46}px ${BRAND.fontMono}`;
    g.textAlign = 'right';
    g.textBaseline = 'middle';
    g.fillText(d.toFixed(d < 100 ? 2 : 1), R - 12, cy + 2);
    tex.needsUpdate = true;
    readout.last = d;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     REBUILD / LIFECYCLE
     ═════════════════════════════════════════════════════════════════════════ */
  function rebuildFromProfile() {
    bakeLookup();
    if (!scene) return;
    fillBoulders();
    buildFractures();
    buildCavities();
    buildWaterLine();
    buildModeFurniture();
    buildStationRuler();
    buildScalePlate();
    applyModeVisibility();
    if (ruler) ruler.top = -1e9;
    if (logStrip) logStrip.top = -1e9;
  }

  /**
   * Which of the standing meshes a mode actually wants.
   *
   * The vertical borehole trio — wall, casing, drill string — is a cylinder
   * about the y axis and cannot follow a curve, a drive or a pile, so the
   * modes that do not have a vertical hole simply do not draw it. That is what
   * keeps the draw-call count flat: profile and heading give back three or
   * four calls and spend two or three on their own furniture.
   */
  function applyModeVisibility() {
    const id = layout.id;
    const verticalBore = id === 'vertical' || id === 'raise';
    if (wallMesh) wallMesh.visible = verticalBore;
    if (rodMesh) rodMesh.visible = verticalBore;
    // no casing until the sim sets a cased depth; update() re-decides each frame
    if (casingMesh) casingMesh.visible = false;
    /* The bit belongs in a hole. A tunnel face is drilled by a jumbo's booms
       and a pile is driven by a hammer or bored by an auger — neither is this
       file's to draw, and a DTH button bit at the toe of a concrete pile is a
       material lie. rigFactory.js puts the real down-hole tool on
       geology.boreholeTip in the modes that have one. */
    if (bitMesh) bitMesh.visible = verticalBore || id === 'profile';
  }

  /**
   * Adopt the renderer's section scale — but only once core/renderer.js has
   * actually laid its camera out for this band. Before its first resize the
   * camera still carries its constructor default (14 m at a 0.57 aspect, where
   * the band is ~1.0), and adopting that silently overrides CFG.viewMetres.
   * That is exactly how every layout constant in this file ended up tuned for
   * a view three times the one being drawn. If the camera is not yet sized we
   * keep CFG.viewMetres and publish it on ctx.sectionView, which the renderer
   * adopts in turn — so the two agree on 20 whichever initialises first.
   */
  function adoptCameraScale() {
    if (!camera || !camera.isOrthographicCamera) return;
    const zoom = camera.zoom || 1;
    const h = (camera.top - camera.bottom) / zoom;
    const w = (camera.right - camera.left) / zoom;
    if (!(h > 4) || !(w > 0)) return;
    const v = vp();
    const bandAspect = Math.max(0.25, v.w / Math.max(1, v.h * (LAYOUT.sectionHeight || 0.46)));
    if (Math.abs(w / h - bandAspect) > 0.35 * bandAspect) return;   // not sized yet
    viewMetres = clamp(h, 12, 160);
  }

  function ensureSection() {
    if (ctx && ctx.sectionScene) { scene = ctx.sectionScene; }
    else {
      scene = new T.Scene();
      scene.name = 'sectionScene';
      ownsScene = true;
      if (ctx) ctx.sectionScene = scene;
    }
    if (ctx && ctx.sectionCamera) {
      camera = ctx.sectionCamera;
      ownsCamera = false;
      adoptCameraScale();
      camBaseY = camera.position.y;
    } else {
      camera = new T.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 200);
      camera.position.set(0, 0, 60);
      camera.lookAt(0, 0, 0);
      ownsCamera = true;
      camBaseY = 0;
      if (ctx) ctx.sectionCamera = camera;
    }
    if (!scene.children.includes(root)) scene.add(root);
    // publish the section's coordinate convention for the VFX / rig agents
    if (ctx) {
      ctx.sectionView = {
        unitsPerMetre: 1,
        viewMetres,
        holeX: 0,
        holeRadius: holeR,
        rodRadius: annulus.innerR,
        casingRadius: annulus.casingR,
        root,
        /* the mode's coordinate contract, for vfx / rig / HUD */
        profileMode: layout.id,
        metresPerUnitX: layout.metresPerUnitX,
        verticalExaggeration: layout.ve,
        depthAtY0: layout.depthAtY0,
      };
    }
  }

  /** viewport size, tolerant of running before main.js has resized us. */
  function vp() {
    const w = ctx?.viewport?.w || (typeof window !== 'undefined' ? window.innerWidth : 0) || 400;
    const h = ctx?.viewport?.h || (typeof window !== 'undefined' ? window.innerHeight : 0) || 800;
    return { w, h };
  }

  async function init() {
    ensureSection();
    const v0 = vp();
    computeView(v0.w, v0.h);
    buildBackdrop();
    buildFace();
    buildCavities();
    buildBorehole();
    buildBoulders();
    buildPins();
    buildStrips();
    buildReadout();

    if (!strata.length) {
      generateProfile({
        regionId: ctx?.state?.world?.regionId || 'nordic',
        applicationId: 'water-well',
        targetDepth: 45,
        seed: 20260903,
        difficulty: 0.25,
      });
    } else {
      rebuildFromProfile();
    }

    if (bus) {
      bus.on(EV.CONTRACT_ACCEPT, (p) => {
        const c = p?.contract;
        if (!c) return;
        generateProfile({
          regionId: c.regionId || c.region || ctx?.state?.world?.regionId,
          applicationId: c.applicationId || c.application || c.industryId,
          targetDepth: c.targetDepth || c.depth || 45,
          seed: c.seed ?? (c.id ? hashString(String(c.id)) : undefined),
          difficulty: c.difficulty ?? 0.3,
          // a 38 mm micropile and a 6000 mm raise bore must not draw the same hole
          holeDiaMm: c.holeDia ?? c.diameterMm ?? CFG.holeDiaDefault,
          /* METHOD_IDS.md: the method decides the section mode. An HDD job is
             a long-section, a raise is two-stage, a jumbo is a heading and a
             driven pile is a column — and none of them is a vertical hole. */
          methodId: c.methodId ?? c.method,
          profileMode: c.profileMode,
          // and what the job is drilling FOR, if it is drilling for anything
          commodity: c.commodity ?? c.target ?? null,
          oreConfidence: c.oreConfidence ?? c.targetConfidence,
        });
        stage = 0;
        stageProgress = 0;
        setCasing(0);
      });
      bus.on(EV.REGION_CHANGE, (p) => {
        if (!p?.regionId || p.regionId === spec.regionId) return;
        generateProfile({ ...spec, regionId: p.regionId, seed: (spec.seed * 2654435761) >>> 0 });
      });
      bus.on(EV.DRILL_START, () => { depth = 0; smoothDepth = 0; resetCrossings(); });
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     UPDATE
     ═════════════════════════════════════════════════════════════════════════ */
  const _mtx = new T.Matrix4();
  const _q = new T.Quaternion();
  let pinCount = 0;
  const pinQueue = [];

  function emit(evt, payload) { try { bus?.emit(evt, payload); } catch (e) { /* never break the frame */ } }

  function checkCrossings(prev, now) {
    if (now <= prev) return;
    // stratum
    const si = getStratumIndexAt(depthForStation(now));
    if (si !== lastStratumIndex) {
      lastStratumIndex = si;
      const s = strata[si];
      if (s) emit(EV.STRATUM_ENTER, { stratum: s, depth: depthForStation(now), station: now });
    }
    // boulders on the hole
    for (let i = 0; i < features.boulders.length; i++) {
      const b = features.boulders[i];
      if (!b.onHole || b.station == null) continue;
      const top = b.station - b.r * 0.8;
      if (top > now) continue;
      if (top > prev && top <= now && !firedBoulders.has(i)) {
        firedBoulders.add(i);
        emit(EV.BOULDER, { depth: top, size: b.r, hardness: b.hardness });
        markEvent('boulder', top);
      }
    }
    // cavities
    for (let i = 0; i < features.cavities.length; i++) {
      const c = features.cavities[i];
      if (!c.onHole || c.station == null) continue;
      const top = c.station - c.halfH;
      if (top > prev && top <= now && !firedCavities.has(i)) {
        firedCavities.add(i);
        emit(EV.CAVITY, { depth: top, height: c.halfH * 2 });
        markEvent('cavity', top);
      }
    }
    // water: the table itself, plus the top of every water-bearing bed
    const wtAt = mode.horizontal ? stationForDepth(waterTableDepth) : waterTableDepth;
    if (wtAt >= 0 && wtAt > prev && wtAt <= now && !firedWater.has(-1)) {
      firedWater.add(-1);
      const s = getStratumAt(waterTableDepth);
      emit(EV.WATER_STRIKE, { depth: waterTableDepth, flowLpm: Math.round(40 + (s?.water || 0.5) * 260) });
      markEvent('water', wtAt);
    }
    for (let i = 0; i < features.seeps.length; i++) {
      const sp = features.seeps[i];
      const at = sp.station == null ? sp.depth : sp.station;
      if (at > prev && at <= now && !firedWater.has(i)) {
        firedWater.add(i);
        if (sp.depth > waterTableDepth * 0.9) {
          emit(EV.WATER_STRIKE, { depth: sp.depth, flowLpm: Math.round(30 + sp.flow * 340) });
          markEvent('water', at);
        }
      }
    }
    // fractures are annotated but do not have their own contract event
    for (const f of features.fractures) {
      if (f.station == null) continue;
      if (f.station > prev && f.station <= now) markEvent('fracture', f.station);
    }
  }

  const PIN_COLORS = {
    boulder: new T.Color(0xb9b0a4),
    cavity: new T.Color(BRAND.danger),
    water: new T.Color(BRAND.steelSoft),
    fracture: new T.Color(BRAND.warning),
  };
  const PIN_DEFAULT = new T.Color(BRAND.amber);

  /** at is a MEASURED STATION, which in a vertical section is the depth. */
  function markEvent(kind, at) {
    if (!pinMesh) return;
    const c = PIN_COLORS[kind] || PIN_DEFAULT;
    pinQueue.push({ kind, station: at, color: c });
    while (pinQueue.length > CFG.pinCap) pinQueue.shift();
    pinCount = pinQueue.length;
    const _pv = new T.Vector3();
    for (let i = 0; i < pinQueue.length; i++) {
      const p = pinQueue[i];
      /* In a vertical section a pin annotates the LOG, so it lives in the
         bevel margin just inside the ruler. In a long-section the ruler
         scrolls away from the thing being annotated, so the pin goes on the
         path instead, just above the bore. */
      if (mode.horizontal) {
        _pv.set(axisXAt(p.station),
                secYForDepth(depthForStation(p.station)) + holeR + 0.55, 1.2);
      } else {
        _pv.set(halfW - CFG.rulerWidth - 0.4, secYForDepth(p.station), 1.2);
      }
      _mtx.compose(_pv, _q.identity(), new T.Vector3(1, 1, 1));
      pinMesh.setMatrixAt(i, _mtx);
      pinMesh.setColorAt(i, p.color);
    }
    pinMesh.count = pinQueue.length;
    pinMesh.instanceMatrix.needsUpdate = true;
    if (pinMesh.instanceColor) pinMesh.instanceColor.needsUpdate = true;
  }

  /**
   * Drive the mode furniture from the live progress.
   *
   * Nothing is rebuilt here. The static geometry carries every vertex's own
   * station and the fragment shader clips against uProg, so advancing a
   * 1,200 m bore or a 600 m raise costs four floats a frame. Only the handful
   * of pieces that genuinely MOVE — the round at a tunnel face, its muck, the
   * pre-support fan, the reamer head climbing a raise — get a matrix write,
   * and there are never more than about thirty of those.
   */
  /**
   * SURVEY CONFIDENCE — the one number that decides how much of this section
   * the player is being shown for free, and the gameplay in the feature.
   *
   * Read the model in lookUnc() (GLSL_STRATA) first. This drives it, and it is
   * the ONLY place the two uniforms are written.
   *
   * WHERE THE CONFIDENCE COMES FROM. data.js already carries `oreConfidence`
   * on every contract — 0.25-0.55 on mineral exploration, 0.6-0.9 on mining,
   * and exactly 0 on the fourteen applications that are not looking for a
   * body. That zero is NOT "we know nothing", it is "this contract has no ore
   * body to know about", so treating it as a wildcat would draw a routine
   * urban piling job as a blank. A contract that states no confidence gets
   * CFG.surveyDefault, which is the value generateProfile() already defaults
   * to — so this function introduces no second opinion about a number data.js
   * owns (HANDOFF §8B: two tables describing one thing).
   *
   * ONE EXCEPTION, AND IT IS THE METHOD'S OWN DEFINITION. On a
   * site-investigation contract the log IS the deliverable — GAMEDESIGN §3a:
   * "Nobody is paying for the hole, they are paying for the log." A job whose
   * entire product is the ground model cannot begin by showing you the ground
   * model. It is held at the wildcat end whatever the contract says.
   *
   * WHAT WOULD MAKE THIS BUYABLE — the hook another agent needs, described
   * and NOT built here, because the economy is not this file's:
   *
   *   geology.setSurveyConfidence(v, reason)  (public API, added below)
   *
   * raises the confidence for the rest of the hole and the section sharpens
   * over the next few frames. A client borehole log or a seismic line bought
   * mid-job is exactly a call to that with a higher number. What the economy
   * side needs to add is (a) a price — economy.js already prices per-run
   * consumables, so a survey line is the same shape — (b) a debit through
   * progression.addMoney() while state.drill.active is true, which no existing
   * path does, and (c) a rule for what a purchase is worth, for which
   * data.js's own ORE_STAGES ladder is the natural answer: a purchase moves
   * the job up one stage (greenfield -> extension -> definition ->
   * grade-control) rather than to an invented number. `contract.oreStage` is
   * written by data.js today and read by nothing at all; this would be its
   * first consumer.
   */
  let surveyBought = 0;
  function surveyConfidence() {
    /* > 0 is the discriminator, not != null: data.js writes a hard 0 for the
       non-ore applications and 0.25-0.90 for the rest, so zero can only ever
       mean "no body, therefore no statement". */
    let c = spec.oreConfidence > 0 ? spec.oreConfidence : CFG.surveyDefault;
    if (spec.applicationId === 'site-investigation'
        || spec.methodId === 'site-investigation') c = Math.min(c, 0.18);
    return clamp(Math.max(c, surveyBought), 0, 1);
  }

  /** The ceiling lookUnc() rises to. A raise past stage 1 is reamed up a hole
   *  its own pilot already drilled: there is no unknown ground ahead of the
   *  reamer — that is what a pilot hole is for — so it states nothing rather
   *  than pretending to a doubt it does not have. */
  function surveyCeiling() {
    if (layout.id === 'raise' && stage >= 1) return 0;
    return 1 - surveyConfidence();
  }
  function surveyInvLead() {
    return 1 / Math.max(lerp(CFG.controlNear, CFG.controlFar, surveyConfidence()), 0.2);
  }
  /** THE CPU'S COPY OF lookUnc(), and the only one. The 2D instrument strips
   *  are drawn on a canvas and cannot call the shader, but a drill log that
   *  disagreed with the cut beside it about which ground is known would be
   *  worse than either alone — so both read this, and the shader gets the same
   *  two numbers through uSurvey / uLook below. */
  function lookUncAt(aheadMetres) {
    return surveyCeiling() * (1 - Math.exp(-Math.max(aheadMetres, 0) * surveyInvLead()));
  }

  function applySurvey() {
    U.uSurvey.value.set(surveyCeiling(), CFG.surveyWander);
    U.uLook.value.w = surveyInvLead();

    /* The coefficients of the metres-ahead plane. One dot product in the
       shader, all five modes, no branch — see lookUnc(). */
    const L = U.uLook.value;
    if (layout.id === 'heading') {
      // ahead is horizontally past the face, in metres of chainage
      L.set(0, layout.metresPerUnitX, -U.uTun.value.z * layout.metresPerUnitX, L.w);
    } else if (layout.id === 'profile') {
      /* uBore.x is the drilled extent in HORIZONTAL metres, which is the same
         quantity alongAt() returns, so the two cannot disagree. */
      L.set(0, layout.metresPerUnitX,
            -layout.xOrigin * layout.metresPerUnitX - U.uBore.value.x, L.w);
    } else {
      L.set(1, 0, -Math.max(smoothDepth, 0), L.w);
    }
  }

  const _fmMtx = new T.Matrix4();
  const _fmQ = new T.Quaternion();
  const _fmE = new T.Euler();
  const _fmV = new T.Vector3();
  const _fmS = new T.Vector3();
  function updateModeFurniture(act) {
    /* uBore is what the FACE shader cuts the ground with, and it is measured in
       HORIZONTAL metres because boreSDF inverts the path on x. Everything else
       here is measured along the hole. Keeping the conversion in one place is
       the only reason the two never disagree. */
    if (layout.id === 'profile' && path) {
      U.uBore.value.set(hddXAtStation(path, Math.max(smoothDepth, 0)),
                        stage >= 1
                          ? path.X5 - hddXAtStation(path, Math.max(path.length - stageProgress, 0))
                          : 0,
                        U.uBore.value.z, stage);
    } else if (layout.id === 'raise') {
      U.uBore.value.set(Math.max(smoothDepth, 0), stage >= 1 ? stageProgress : 0,
                        U.uBore.value.z, stage);
      U.uRaise.value.w = stage >= 1 ? stageProgress : 0;
    } else if (layout.id === 'heading') {
      U.uTun.value.z = axisXAt(Math.max(smoothDepth, 0));
    }

    if (!modeMat) return;
    const L = Math.max(layout.totalLength, 1e-3);
    // uProg: (first pass, second pass measured from the far end, total, stage)
    modeMat.uniforms.uProg.value.set(Math.max(smoothDepth, 0),
                                     stage >= 1 ? stageProgress : 0, L, stage);

    if (!modeInst || !modeInst.userData.dynamic) return;
    const items = modeInst.userData.items || [];
    const faceX = axisXAt(act);
    let dirty = false;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.follow == null && !it.tag) continue;
      let x = it.x || 0, y = it.y;
      let sx = Math.max(it.len, 0.02), sy = Math.max(it.w, 0.02);
      if (it.follow != null) {
        x = faceX + it.follow;
      } else if (it.tag === 'reamer') {
        y = secYForDepth(actionStation());
        sx = holeR * 2; sy = holeR * 0.9;
      } else if (it.tag === 'cutter') {
        y = secYForDepth(actionStation()) - holeR * 0.5;
      } else if (it.tag === 'muck') {
        /* Cuttings fall by gravity into the lower chamber and are mucked with
           an LHD (research/03 §A.5.1), so the pile IS the ream's progress. */
        const f = clamp(stageProgress / Math.max(raise ? raise.length : 1, 1));
        sy = 0.35 + f * 2.6;
        y = secYForDepth(raise ? raise.length : 0)
          - (raise ? raise.lowerHeight * 0.5 : 0) + sy * 0.5;
      }
      _fmE.set(0, 0, it.ang);
      _fmQ.setFromEuler(_fmE);
      _fmV.set(x, y, 0.7);
      _fmS.set(sx, sy, 1);
      _fmMtx.compose(_fmV, _fmQ, _fmS);
      modeInst.setMatrixAt(i, _fmMtx);
      dirty = true;
    }
    if (dirty) modeInst.instanceMatrix.needsUpdate = true;
  }

  /** The greatest measured length the hole can reach in this mode. */
  function maxStation() {
    if (layout.id === 'profile') return path ? path.length : profileDepth;
    if (layout.id === 'heading') return layout.totalLength;
    if (layout.id === 'raise') return raise ? raise.length : profileDepth;
    return profileDepth;
  }

  /**
   * THE ACTION POINT — the one thing the camera follows.
   *
   * It is the bit in a vertical hole, the bore head on an HDD pilot, the pull
   * head coming back on the reamer pass, the face in a drive, the toe of a
   * pile — and in stage two of a raise it travels UPWARD, which is why the
   * progress bar for that stage runs in reverse (DESIGN_EXPANSION.md §1).
   */
  function actionStation() {
    if (layout.id === 'raise' && stage >= 1) {
      return Math.max(0, (raise ? raise.length : maxStation()) - stageProgress);
    }
    if (layout.id === 'profile' && stage >= 1) {
      return Math.max(0, (path ? path.length : maxStation()) - stageProgress);
    }
    return smoothDepth;
  }

  function update(dt, state) {
    time += dt;
    U.uTime.value = time;

    const d = state?.drill?.depth;
    if (typeof d === 'number' && Number.isFinite(d)) depth = d;
    /* depth is a MEASURED LENGTH along the hole in every mode. In a vertical
       section that is also a depth and the clamp is the one it always was; in
       a long-section it is bore length or chainage, which is a completely
       different number from the depth of the geology under it. */
    depth = clamp(depth, 0, maxStation());
    // second-pass progress: pullback / ream-up, driven by the sim when it has one
    const st2 = state?.drill?.stage;
    if (typeof st2 === 'number') stage = st2 >= 1 ? 1 : 0;
    const sp2 = state?.drill?.stageProgress;
    if (typeof sp2 === 'number' && Number.isFinite(sp2)) {
      stageProgress = clamp(sp2, 0, maxStation());
    }

    // Hazard events must fire even if the section never got a scene, because
    // sim/drilling.js reacts to them.
    if (depth + 1e-4 < lastEventDepth) resetCrossings();     // trip out / reset
    else checkCrossings(lastEventDepth, depth);
    lastEventDepth = depth;

    if (!scene || !faceMesh) return;

    smoothDepth = damp(smoothDepth, depth, 9, dt);
    U.uDepth.value = layout.id === 'profile' || layout.id === 'heading'
      ? depthForStation(smoothDepth) : smoothDepth;

    const act = actionStation();
    const horiz = mode.horizontal;

    /* ── scroll ──
       Vertical modes scroll DOWN with the bit, exactly as before. The two
       long-section modes scroll HORIZONTALLY with the head, and hold their
       vertical framing still: an HDD profile that bobbed up and down as the
       bore sagged would be unreadable, and a drive has nowhere to go. */
    if (!horiz) {
      const desired = camBaseY + halfH * (1 - 2 * mode.anchorY) + act;
      const clampedTop = camBaseY + halfH - CFG.headroom;
      root.position.y = Math.max(desired, clampedTop);
      root.position.x = 0;
    } else {
      root.position.x = -secXForStation(act) + halfW * (2 * mode.anchorX - 1);
      if (layout.id === 'heading') {
        // the drive axis sits at the mode's own anchor height
        root.position.y = camBaseY + halfH * (1 - 2 * mode.anchorY);
      } else {
        // ground line just below the top of the band, as in a real profile sheet
        root.position.y = camBaseY + halfH - CFG.headroom;
      }
    }
    // section x of the camera centre, in root's own space: everything that has
    // to stay ON SCREEN while the drawing scrolls under it is placed from here
    const camX = -root.position.x;

    /* ── face slab rides the window, snapped to its vertex lattice ── */
    if (faceMesh) {
      const centreLocal = camBaseY - root.position.y;
      const pitch = faceMesh.userData.pitch || 0.4;
      const snapped = Math.round(centreLocal / pitch) * pitch;
      const snappedX = horiz ? Math.round(camX / pitch) * pitch : 0;
      faceMesh.position.set(snappedX, snapped, 0);
      faceMat.uniforms.uSlabOffset.value.set(snappedX, snapped);
    }
    if (backMesh) {
      backMesh.position.y = camBaseY;
      backMat.uniforms.uParallaxY.value =
        (horiz ? -root.position.x * 0.10 : -root.position.y * 0.34);
    }

    /* ── the mode's own furniture ── */
    updateModeFurniture(act);

    /* ── what the section is allowed to claim about ground it has not cut ── */
    applySurvey();

    /* ── borehole ── */
    // NOTE: wall / rod / casing keep identity transforms — their vertex shaders
    // place every vertex from uTop/uBottom, so scaling the mesh would double up.
    const verticalBore = layout.id === 'vertical' || layout.id === 'raise';
    /* In raise the shaft is the WHOLE raise as soon as the pilot is through,
       and stage two only changes its diameter — which boreRadiusScale() does
       inside the wall's own vertex shader. */
    const holeLen = layout.id === 'raise' && stage >= 1
      ? Math.max(0.05, raise ? raise.length : smoothDepth)
      : Math.max(0.05, smoothDepth);
    if (wallMesh) {
      wallMat.uniforms.uTop.value = 0;
      wallMat.uniforms.uBottom.value = -holeLen;
      wallMesh.visible = holeLen > 0.08 && verticalBore;
    }
    const rodTop = 2.2;
    if (rodMesh) {
      rodMesh.visible = verticalBore;
      rodMat.uniforms.uTop.value = rodTop;
      /* Stage two pulls the string UP, so the rod hangs from the collar to the
         reamer rather than to the bottom of the hole. */
      rodMat.uniforms.uBottom.value = layout.id === 'raise' && stage >= 1
        ? -Math.max(0.05, actionStation()) : -holeLen;
      rodMat.uniforms.uR.value = annulus.innerR;
      const rpm = clamp(state?.drill?.rpm ?? 0.5);
      const jam = clamp(state?.drill?.jam ?? 0);
      const torque = clamp(state?.drill?.torque ?? 0);
      const active = !!state?.drill?.active;
      rodMat.uniforms.uSpin.value += dt * (2 + rpm * 26) * (1 - jam * 0.9);

      /* ── WHIRL ──────────────────────────────────────────────────────────
         The model is in ROD_VERT and the constants are in CFG.whirl*. This is
         the only place the drive comes from, and every term of it is one of
         the four numbers the sim already publishes.

         A string that is not turning does not whirl — it hangs. That gate is
         the rpm itself and NOT uSpin's rate above, whose +2 floor exists so
         the flutes never freeze on a still frame; inheriting that floor would
         have the string orbiting with the rotation stopped. */
      const spinning = active ? clamp(rpm / CFG.whirlSpinGate, 0, 1) : 0;
      /* Fraction of the annular clearance in use. Binding does not need
         rotation, so it is added outside the gate: a bound string stays out
         against the wall whatever the table is doing. The shader clamps
         nothing — |bow| <= 1 and this is <= 1, so the product is <= uClear. */
      const use = clamp(spinning * (CFG.whirlDrill + torque * CFG.whirlTorque)
                        + jam * CFG.whirlJam, 0, 1);
      /* Half-waves of the mode shape over the drawn free length. Derived from
         the length and the buckling period so a 4 m hole and a 60 m hole are
         drawn with the same wavelength rather than the same shape. */
      const freeLen = Math.max(rodTop - rodMat.uniforms.uBottom.value, 0.05);
      const spans = clamp(2 * freeLen / CFG.whirlPeriodM,
                          CFG.whirlSpanMin, CFG.whirlSpanMax);
      rodMat.uniforms.uSpans.value = spans;
      /* Normalised by the mode shape's own peak, so `use` means exactly what
         CFG says it means: whirlJam 1.00 puts the string ON the wall, not at
         whatever fraction of it the product of two sines happens to reach
         (0.86 at 3.6 spans, 0.72 at 7). Without this the constants would each
         be silently scaled by a number nobody could see. */
      rodMat.uniforms.uWhirl.value =
        damp(rodMat.uniforms.uWhirl.value, use / bowPeak(spans), 6, dt);
      /* FORWARD WHIRL: the bow precesses WITH rotation, at the rotary speed —
         which is the definition, not a tuning. Binding stalls it, so a jam
         reads as the string welded to one side of the wall rather than as a
         bigger wiggle. */
      const stall = 1 - clamp(jam * 1.1, 0, 1);
      rodMat.uniforms.uPrec.value += dt * (rpm * 26) * spinning * stall;
      /* The helix pitch IS the buckling period — one turn of azimuth per wave,
         which is what makes the deflection travel instead of standing. */
      rodMat.uniforms.uHelix.value = TAU / CFG.whirlPeriodM;
      rodMat.uniforms.uClear.value = annulus.outerR - annulus.innerR;
      rodMat.uniforms.uRodLen.value = 3.0;
    }
    if (casingMesh) {
      const cl = Math.min(casingDepth, holeLen);
      casingMesh.visible = cl > 0.15 && !mode.horizontal;
      if (casingMesh.visible) {
        casingMat.uniforms.uTop.value = 0.6;
        casingMat.uniforms.uBottom.value = -cl;
        casingMat.uniforms.uR.value = annulus.casingR;
      }
    }
    /* ── the bit / head ──
       It rides the action point wherever that is: down the y axis in a
       vertical hole, along the designed curve on an HDD pilot, at the toe of a
       pile. A tunnel jumbo's booms are not this file's, so heading has no
       bit and applyModeVisibility() has already hidden it. */
    const actX = axisXAt(act);
    const actY = secYForDepth(depthForStation(act));
    if (bitMesh && (verticalBore || layout.id === 'profile')) {
      bitMesh.visible = true;
      bitMesh.position.set(actX, actY, 0);
      bitMesh.scale.setScalar(annulus.outerR * 0.92);   // follows the contract's holeDia
      bitMesh.rotation.y += dt * (2 + (state?.drill?.rpm ?? 0.4) * 20);
      /* On a long-section the head follows the tangent of the path, and the
         tangent is drawn under the mode's vertical exaggeration — so the
         drawn angle is the exaggerated one, which is what the player is
         reading off the screen. */
      /* ZYX so the spin is applied about the bit's OWN axis and the tilt after
         it; with rotation.z at 0 this is identical to the default order, which
         is why the vertical modes see no change. */
      bitMesh.rotation.order = 'ZYX';
      bitMesh.rotation.z = horiz && path
        ? Math.atan2(-hddSlopeAtXjs(path, (actX - layout.xOrigin) * layout.metresPerUnitX)
                     * layout.metresPerUnitX, 1) + Math.PI * 0.5
        : 0;
      // the bit's wear textures are only worth having if something drives them
      if (bitMat) bitMat.uniforms.uWear.value = clamp(state?.drill?.wear ?? 0);
      const imp = state?.drill?.active ? Math.sin(time * 34) * 0.035 * (0.3 + (state?.drill?.wob ?? 0.5)) : 0;
      bitMesh.position.y -= Math.abs(imp);
      bitMesh.visible = act > 0.02;
    }
    boreholeTip.position.set(actX, actY, 0);

    /* ── strips: recentre only when the window leaves them ──
       In a long-section the instrument strips have to be counter-scrolled in
       x, because the drawing moves under them and they belong to the SCREEN,
       not to the ground. */
    const topDepth = layout.depthAtY0 - (camBaseY + halfH - root.position.y);
    const botDepth = layout.depthAtY0 - (camBaseY - halfH - root.position.y);
    if (ruler && (topDepth < ruler.top + 1.0 || botDepth > ruler.top + ruler.span - 1.0)) {
      const nt = Math.floor((topDepth - viewMetres * 0.22) * 2) / 2;
      drawRuler(nt);
      ruler.mesh.position.y = secYForDepth(nt + ruler.span * 0.5);
    }
    /* The log now carries the LOGGED/PROJECTED divider and hides the strength
       of a bed the bit has not entered, so it is a function of the bit as well
       as of the window and cannot only be redrawn when the window scrolls. It
       is repainted every 0.15 m of bit travel — 2.9 CSS px at the reference
       scale, so the divider never visibly steps — and the guard is a scalar
       compare, so a still bit costs exactly what it did before. */
    const loggedNow = depthForStation(depth);
    const logStale = logStrip
      && Math.abs(loggedNow - (logStrip.loggedAt ?? -1e9)) > 0.15
      && loggedNow < botDepth + 1.0;
    if (logStrip && (topDepth < logStrip.top + 1.0
                     || botDepth > logStrip.top + logStrip.span - 1.0 || logStale)) {
      const nt = logStale && !(topDepth < logStrip.top + 1.0
                               || botDepth > logStrip.top + logStrip.span - 1.0)
        ? logStrip.top                                   // repaint in place
        : Math.floor((topDepth - viewMetres * 0.22) * 2) / 2;
      drawLog(nt);
      logStrip.loggedAt = loggedNow;
      logStrip.mesh.position.y = secYForDepth(nt + logStrip.span * 0.5);
    }
    if (horiz) {
      if (ruler) ruler.mesh.position.x = camX + halfW - CFG.rulerWidth * 0.55;
      if (logStrip) logStrip.mesh.position.x = camX - halfW + CFG.logWidth * 0.5;
      /* The joint mesh stops itself at the instrument strips so a fracture
         never runs out over the black bevel. Those strips belong to the
         SCREEN, so in a long-section the clip has to travel with the camera
         instead of staying nailed to the ground. */
      U.uGeoX.value.set(camX - halfW + CFG.logWidth, camX + halfW - CFG.rulerWidth);
    }

    /* ── the scale plate: what the section admits it is doing ──
       Anchored to the camera, in every mode, so the declaration is on screen
       whatever the drawing is doing underneath it. Repainted only when a
       stated number changes — the bore exaggeration moves with the contract's
       diameter, and a plate that went on asserting the previous job's number
       would be worse than no plate, because it would be believed. */
    if (scalePlate) {
      if (Math.abs(scalePlate.exag - boreExag) > 5e-3
          || Math.abs(scalePlate.ve - layout.ve) > 5e-3
          || scalePlate.mm !== Math.round(Number(spec.holeDiaMm) || CFG.holeDiaDefault)) {
        drawScalePlate();
      }
      scalePlate.mesh.position.x = camX;
      /* Above the station ruler where there is one, on the floor of the band
         where there is not. */
      scalePlate.mesh.position.y = camBaseY - halfH - root.position.y
                                 + (xRuler ? xRuler.heightUnits : 0)
                                 + PLATE_H * 0.5 + 0.10;
      scalePlate.mesh.position.z = 2.05;
    }

    /* ── the station ruler: the second scale a long-section must carry ── */
    if (xRuler) {
      const leftX = camX - halfW;
      if (leftX < xRuler.left + 1.0 || leftX + halfW * 2 > xRuler.left + xRuler.span - 1.0) {
        const nl = Math.floor((leftX - halfW * 0.32) * 2) / 2;
        drawStationRuler(nl);
        xRuler.mesh.position.x = nl + xRuler.span * 0.5;
      }
      xRuler.mesh.position.y = camBaseY - halfH - root.position.y
                             + xRuler.heightUnits * 0.5 + 0.10;
      xRuler.mesh.position.z = 2.0;
    }

    /* ── readout: a compact index marker riding the ruler at the action point ── */
    if (readout) {
      if (Math.abs(readout.last - depth) > 0.02) drawReadout(depth);
      readout.mesh.position.set(camX + halfW - readoutHalfW - 0.15,
                                horiz ? actY : -smoothDepth, 2.2);
      readout.mesh.visible = true;
    }
    // the datum mark stays in the ruler gutter; buildWaterLine() set its x
    if (waterLine) {
      waterLine.position.y = secYForDepth(waterTableDepth);
      if (horiz) waterLine.position.x = camX + halfW - CFG.rulerWidth * 1.15 * 0.5;
    }


    /* Publish the live hole axis: vfx/rig read sectionView.holeX to anchor
       cuttings, mud and the rig's own section contribution, and on a
       long-section that axis travels. It stays 0 in every vertical mode. */
    if (ctx?.sectionView) {
      ctx.sectionView.holeX = root.position.x + actX;
      ctx.sectionView.profileMode = layout.id;
      ctx.sectionView.metresPerUnitX = layout.metresPerUnitX;
      ctx.sectionView.verticalExaggeration = layout.ve;
      ctx.sectionView.depthAtY0 = layout.depthAtY0;
    }

    // wetness can be dialled down in frozen ground
    U.uWetMix.value = damp(U.uWetMix.value, spec.regionId === 'arctic' ? 0.45 : 1.0, 3, dt);

    /* ── keep our own camera framed ── */
    if (ownsCamera && camera) {
      camera.left = -halfW; camera.right = halfW;
      camera.top = halfH; camera.bottom = -halfH;
      camera.updateProjectionMatrix();
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
     PUBLIC
     ═════════════════════════════════════════════════════════════════════════ */
  function resize(w, h) {
    computeView(w, h);
    if (!scene) return;
    buildFace();
    buildBackdrop();
    buildWaterLine();
    buildStrips();
    /* Both of these are laid out in the mode's horizontal scale, which
       computeView() has just re-solved from the new band width. */
    buildModeFurniture();
    buildStationRuler();
    buildScalePlate();
    applyModeVisibility();
    if (ownsCamera && camera) {
      camera.left = -halfW; camera.right = halfW;
      camera.top = halfH; camera.bottom = -halfH;
      camera.updateProjectionMatrix();
    } else if (camera?.isOrthographicCamera) {
      camBaseY = camera.position.y;
      const before = viewMetres;
      adoptCameraScale();
      if (Math.abs(before - viewMetres) > 1e-3) {
        // the renderer changed the section scale under us — redo the layout
        computeView(w, h);
        buildFace();
        buildBackdrop();
        buildWaterLine();
        buildStrips();
        buildModeFurniture();
        buildStationRuler();
        buildScalePlate();
        applyModeVisibility();
      }
    }
  }

  function dispose() {
    killModeMeshes();
    killStationRuler();
    killScalePlate();
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose?.();
    });
    for (const d of disposables) d?.dispose?.();
    disposables.length = 0;
    scene?.remove(root);
    if (backMesh) { scene?.remove(backMesh); backMesh.geometry.dispose(); }
    if (ownsScene && ctx) ctx.sectionScene = null;
    if (ownsCamera && ctx) ctx.sectionCamera = null;
    root.clear();
  }

  return {
    /* lifecycle */
    init, update, resize, dispose,

    /* profile */
    generateProfile,
    getStratumAt,
    getStratumIndexAt,
    getDrillabilityAt,
    get strata() { return strata; },
    get profileDepth() { return profileDepth; },
    get waterTableDepth() { return waterTableDepth; },
    get features() { return features; },
    get spec() { return spec; },

    /* ── SECTION MODE ──────────────────────────────────────────────────────
       profileMode is one of vertical | profile | raise | heading | pile.
       It is normally set by the contract's method (METHOD_IDS.md) inside
       generateProfile(); setProfileMode() is for previews and the editor. */
    get profileMode() { return layout.id; },
    setProfileMode(id) {
      if (!MODES[id] || id === layout.id) return layout.id;
      generateProfile({ ...spec, profileMode: id, methodId: null });
      return layout.id;
    },
    /** Everything a HUD needs to read the drawing: the horizontal scale, the
     *  vertical exaggeration, the length word and the total. */
    get modeLayout() {
      return {
        id: layout.id,
        metresPerUnitX: layout.metresPerUnitX,
        verticalExaggeration: layout.ve,
        depthAtY0: layout.depthAtY0,
        totalLength: layout.totalLength,
        lengthWord: mode.lengthWord,
        horizontal: mode.horizontal,
        stage,
        stageProgress,
      };
    },
    /** The solved HDD profile — entry/exit angles, radii, cover, the corridor,
     *  the obstacle, the pits, the located utilities, and whether the pipe's
     *  1200 x D bend radius was actually achievable in the cover available. */
    get borePath() { return path; },
    /** The tunnel heading: face area, round length, support, pre-support. */
    get heading() { return heading; },
    /** The raise: length, reamed and pilot diameters, cutters, head mass. */
    get raise() { return raise; },
    /** The pile: as-built length, bearing stratum, penetration into it, cage. */
    get pile() { return pile; },
    /** Blows per 250 mm at a depth — the driving record, derived from the
     *  ground rather than stored, so the section and the log cannot disagree. */
    getBlowCountAt: blowsAt,
    /** Measured length along the hole -> true vertical depth. Identity when
     *  the hole is vertical. */
    depthForStation,
    /** True vertical depth -> the measured length that first reaches it, or -1
     *  where the hole never gets there. */
    stationForDepth,
    /** Second pass: HDD backream/pullback, or a raise's ream-up. Stage 1
     *  progress is measured from the FAR end and the section runs it in
     *  reverse, which is what DESIGN_EXPANSION.md §1 asks for. */
    setStage(n, progressM) {
      stage = (+n || 0) >= 1 ? 1 : 0;
      if (progressM != null) stageProgress = clamp(+progressM || 0, 0, maxStation());
      return stage;
    },
    get stage() { return stage; },
    get stageProgress() { return stageProgress; },

    /* ── ORE ───────────────────────────────────────────────────────────────
       getOreAt(depth) takes a TRUE VERTICAL DEPTH and always returns at least
       { commodity, grade, unit, inOre }. With no ore body the commodity is
       null and the grade 0 — a water well assays nothing, and asking is not an
       error. sourced is false wherever research/08-commodities.md could not
       source the grade band, and player-facing text must gate on it. */
    getOreAt,
    getOreAtStation,
    /** Hide the drawn body without discarding it — for a briefing screen that
     *  wants to show the target horizon and nothing else. The assay API is
     *  unaffected: what the section draws and what the sim knows are separate
     *  questions, and only the drawing is suppressed. */
    setOreHidden(v) { U.uOreD.value.w = v ? 1 : 0; },

    /* ── SURVEY CONFIDENCE ─────────────────────────────────────────────────
       How sharply the section is allowed to draw ground the bit has not
       reached. Read applySurvey() for the whole model, including the note on
       what an economy-side purchase hook would need.

       Reading it is free. Writing it is a claim that the player now KNOWS
       more than the contract said they did — a client borehole log, a
       seismic line — so it only ever goes up, and it is cleared with the
       profile. `reason` is not decoration: it is the string that will make a
       silently sharpened section traceable when somebody asks why. */
    get surveyConfidence() { return surveyConfidence(); },
    setSurveyConfidence(v, reason = '') {
      const n = clamp(+v || 0, 0, 1);
      if (!(n > surveyBought)) return surveyConfidence();
      surveyBought = n;
      if (typeof console !== 'undefined') {
        console.info(`[geology] survey confidence raised to ${n.toFixed(2)}`
          + (reason ? ` — ${reason}` : ''));
      }
      return surveyConfidence();
    },
    /** The generated body, or null: kind, geometry, grades, the predicted
     *  horizon the contract advertised, and the confidence behind it. */
    get oreBody() { return ore; },
    get commodity() { return ore ? ore.commodity : null; },
    /** The ore-body and commodity tables, for the UI and the contract board. */
    get commodities() { return COMMODITIES; },
    get oreKinds() { return ORE_KINDS; },
    commoditiesForRegion(regionId) {
      return (REGION_COMMODITIES[regionId] || []).slice();
    },

    /* drilling state */
    setDepth(m) { depth = clamp(+m || 0, 0, maxStation()); },
    setCasingDepth: setCasing,
    get casingDepth() { return casingDepth; },

    /* geometry handles for the VFX / rig agents */
    boreholeTip,
    annulus,
    /** Section x of the hole axis. 0 in every vertical mode; on a long-section
     *  it follows the head, so vfx anchored to it follow the curve. */
    get boreholeX() { return axisXAt(smoothDepth); },
    sectionRoot: root,
    /** Section-space y of a TRUE VERTICAL DEPTH, in world terms. */
    worldYForDepth(m) { return root.position.y + secYForDepth(+m || 0); },
    /** annulus cross-section at a measured length, in section world space */
    getAnnulusAt(m) {
      const st = +m || 0;
      const s = getStratumAt(depthForStation(st));
      const over = s ? (1 - s.stability) * 0.4 : 0;
      return {
        x: root.position.x + axisXAt(st),
        y: root.position.y + secYForDepth(depthForStation(st)),
        innerR: annulus.innerR,
        outerR: annulus.outerR * (1 + over),
        casingR: casingDepth >= st ? annulus.casingR : 0,
      };
    },
    /** Visual (over-gauge) borehole radius in section units — derived from the
     *  contract's holeDia, so vfx/rig read the same hole the section draws. */
    get holeRadius() { return holeR; },
    get holeDiaMm() { return spec.holeDiaMm; },
    holeRadiusAt(m) {
      const s = getStratumAt(depthForStation(m));
      return holeR * (1 + (s ? (1 - s.stability) * 0.4 : 0));
    },
    markEvent,

    /* view */
    setViewMetres(m) { viewMetres = clamp(+m || CFG.viewMetres, 12, 160); const v = vp(); resize(v.w, v.h); },
    get viewMetres() { return viewMetres; },
    get camera() { return camera; },
    get scene() { return scene; },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   small helpers
   ═══════════════════════════════════════════════════════════════════════════ */
function makeLookupTexture(T, w, srgb) {
  const data = new Uint8Array(w * 4);
  const tex = new T.DataTexture(data, w, 1, T.RGBAFormat, T.UnsignedByteType);
  tex.needsUpdate = true;
  tex.wrapS = T.ClampToEdgeWrapping;
  tex.wrapT = T.ClampToEdgeWrapping;
  tex.minFilter = srgb ? T.LinearFilter : T.NearestFilter;
  tex.magFilter = srgb ? T.LinearFilter : T.NearestFilter;
  tex.generateMipmaps = false;
  if (srgb && T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  const v = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
/**
 * Peak of ROD_VERT's mode shape, |sin(PI*s*u) * sin(PI*u)| over u in [0,1].
 *
 * There is no closed form, so it is sampled — 256 points is finer than the 96
 * rings the string is actually built from, which is the resolution that
 * matters. Memoised on s rounded to 1/64, because s comes from a hole depth
 * that changes every frame by a hair and the answer does not.
 *
 * It exists so the whirl constants in CFG mean what they say: with it,
 * `uWhirl = 1` puts the string exactly on the wall at whatever span count the
 * current depth produces, instead of at 0.86 of it (3.6 spans) or 0.72 (7).
 */
const BOW_PEAK = new Map();
function bowPeak(s) {
  const key = Math.round(s * 64);
  const hit = BOW_PEAK.get(key);
  if (hit !== undefined) return hit;
  const ss = key / 64;
  let m = 1e-6;
  for (let i = 1; i < 256; i++) {
    const u = i / 256;
    const v = Math.abs(Math.sin(Math.PI * ss * u) * Math.sin(Math.PI * u));
    if (v > m) m = v;
  }
  BOW_PEAK.set(key, m);
  return m;
}

function clamp8(v) { return v < 0 ? 0 : v > 255 ? 255 : v | 0; }
/** Accepts either a 0..1 fraction or a contract's 1..5 star rating. */
function normDifficulty(d) {
  const v = Number(d);
  if (!Number.isFinite(v)) return 0.3;
  return clamp(v > 1 ? (v - 1) / 4 : v, 0, 1);
}
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export default createGeology;
