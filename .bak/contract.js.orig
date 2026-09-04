/**
 * DRILLITY I THE GAME — shared contract.
 *
 * Every subsystem module in this project is built against the interfaces in
 * this file. Nothing here imports three.js, so it can be read/loaded by any
 * module without cycles.
 *
 * ── SYSTEM INTERFACE ───────────────────────────────────────────────────────
 * Each subsystem exports a factory `createX(ctx)` returning an object with:
 *
 *   init()                    async, called once after ctx is fully populated
 *   update(dt, state)         called every frame (dt in seconds, clamped)
 *   resize(w, h, dpr)         called on viewport change
 *   dispose()                 free GPU resources
 *
 * ── CTX ────────────────────────────────────────────────────────────────────
 * The context object handed to every system. Populated by main.js in order.
 *
 *   ctx.THREE        the three.js namespace
 *   ctx.canvas       HTMLCanvasElement
 *   ctx.renderer     THREE.WebGLRenderer   (from core/renderer.js)
 *   ctx.scene        THREE.Scene           (surface world)
 *   ctx.camera       THREE.PerspectiveCamera
 *   ctx.composer     post-processing composer (has .render())
 *   ctx.quality      QualityTier  — see QUALITY below
 *   ctx.bus          EventBus     — see below
 *   ctx.state        GameState    — the single mutable game state object
 *   ctx.assets       texture/material factory (core/assets.js)
 *   ctx.audio        audio system (audio/audio.js)
 *   ctx.rand         seeded PRNG helper  { f(), range(a,b), int(a,b), pick(arr) }
 *
 * ── EVENT BUS ──────────────────────────────────────────────────────────────
 *   bus.on(evt, fn) -> unsubscribe
 *   bus.emit(evt, payload)
 *
 * Canonical events (payloads documented at EVENTS below).
 */

/* ═══════════════════════════════════════════════════════════════════════════
   BRAND — Drillity "Liquid Industrial" design system.
   Sourced verbatim from drillity-mobile-magic/src/index.css (HSL tokens) and
   tailwind.config.ts (type stack). Do not invent colours outside this palette.
   ═══════════════════════════════════════════════════════════════════════════ */
export const BRAND = {
  // Core surfaces (deep slate)
  bg:        '#0F141C', // hsl(218 26% 8%)
  bgDeep:    '#0D1219', // hsl(216 28% 7%)  — sidebar / darkest
  card:      '#161C26', // hsl(217 24% 11%)
  muted:     '#1E242E', // hsl(217 20% 15%)
  border:    '#28303B', // hsl(215 20% 19%)

  // Electric amber — the Drillity primary. CTAs, active gauges, level-ups.
  // Taken from the actual logo artwork (drillity logo tryck.png), NOT from the
  // web app's index.css, which had drifted to a duller hsl(43 70% 59%).
  amber:     '#F59E0B', // the Drillity primary
  amberDeep: '#231502', // text on amber
  amberHot:  '#FFBE3D',
  amberDim:  '#B06F05',

  /**
   * Machine bodywork amber — NOT the wordmark amber.
   *
   * `BRAND.amber` (#F59E0B, S 0.955) is a UI accent on dark slate. Used as the
   * albedo for painted plant it renders at S 0.82 on lit panels and S 0.889 on
   * highlights, drifting to hue 41.7° — past amber into yellow. Derived from the
   * render: the light chain adds +0.123 saturation, so an albedo at S 0.788
   * lands at the measured-correct S ≈ 0.665. Same hue by construction —
   * (G−B)/(R−B) is 0.626 for both.
   *
   * Hazard markings (barrier stripes, toe-boards, livery accents) stay on
   * `amber`: retroreflective tape really is that saturated.
   */
  amberPlant: '#D9992E',   // H 37.5° · S 0.788 · V 0.851

  // Steel blue accent
  steel:     '#3F92A6', // hsl(199 45% 45%)
  steelSoft: '#6FB6C7',

  // Semantic
  success:   '#10B981', // hsl(160 84% 39%)
  warning:   '#F0B319', // hsl(45 93% 47%)
  danger:    '#EF4444', // hsl(0 84% 60%)

  // Type
  fg:        '#FAFAFA',
  fgMuted:   '#96A0AE', // hsl(213 10% 63%)

  fontSans:  "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontLogo:  "'Oswald', 'Inter', system-ui, sans-serif",
  fontMono:  "'JetBrains Mono', 'SF Mono', ui-monospace, monospace",

  radius:    14,   // 0.875rem
  radiusLg:  24,
  radiusXl:  32,
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUALITY TIERS — resolved at boot from device probe. Systems must respect it.
   ═══════════════════════════════════════════════════════════════════════════ */
export const QUALITY = {
  LOW:    { id: 'low',    dprCap: 1.5, shadowMap: 1024, bloom: true,  ssao: false, aa: 'none', particles: 0.45, anisotropy: 4,  strataSegments: 48,  softShadows: false },
  MEDIUM: { id: 'medium', dprCap: 2.0, shadowMap: 2048, bloom: true,  ssao: true,  aa: 'smaa', particles: 0.8,  anisotropy: 8,  strataSegments: 96,  softShadows: true  },
  HIGH:   { id: 'high',   dprCap: 2.5, shadowMap: 4096, bloom: true,  ssao: true,  aa: 'smaa', particles: 1.0,  anisotropy: 16, strataSegments: 144, softShadows: true  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   LAYOUT — portrait mobile split. Values are fractions of viewport height.
   The surface (hero) view occupies the top band, the geological cross-section
   the bottom band. Both are rendered by the same WebGL context using scissor
   viewports so we keep one renderer and one post chain.
   ═══════════════════════════════════════════════════════════════════════════ */
export const LAYOUT = {
  surfaceTop:    0.00,
  surfaceHeight: 0.54,  // top 54% = rig / sky / environment
  sectionTop:    0.54,
  sectionHeight: 0.46,  // bottom 46% = geology cross-section
  hudSafeTop:    0.06,

  /* ── THE HUD CHROME, AND THE 3D THAT MUST NOT BE UNDER IT ──────────────
     The site screen is a stacked column: a status strip, the two 3D bands,
     and an instrument dock. Nothing is drawn on top of the bands — every HUD
     element has reserved space in that column — so these two fractions are
     the share of the stage the chrome occupies at the top and at the bottom,
     and `surfaceHeight` / `sectionHeight` are the split of WHAT IS LEFT.

     ui/styles.css declares the same two numbers in pixels as `--hud-top` and
     `--hud-dock`; these are those pixels over an 844px reference stage.
     Change one, change the other.

       --hud-top   52px  → 0.062
       --hud-dock  227px → 0.269   (189px / 0.224 on a method with no
                                    auxiliary row, which is the common case;
                                    the larger figure is the safe one to
                                    reserve, because it never leaves a band
                                    under the dock)

     core/renderer.js is the consumer: `computeLayout()` should carve these
     off `stage.h` BEFORE splitting the remainder 54/46, so the scissored
     viewports land exactly on the two spacer rows. Until it does, the seam
     sits at 54% of the whole stage rather than 54% of the visible part, and
     the bands still extend under the chrome — visually correct, because the
     chrome is opaque, but paying for pixels nobody sees. */
  chromeTop:    0.062,
  chromeBottom: 0.269,
};

/* ═══════════════════════════════════════════════════════════════════════════
   EVENTS
   ═══════════════════════════════════════════════════════════════════════════ */
export const EVENTS = {
  // ── sim → everyone
  DRILL_START:     'drill:start',      // { methodId, contract }
  DRILL_TICK:      'drill:tick',       // { depth, rop, torque, wob, wear, stratum }
  DRILL_STOP:      'drill:stop',       // { reason }
  STRATUM_ENTER:   'drill:stratum',    // { stratum, depth }
  BIT_IMPACT:      'drill:impact',     // { intensity 0..1, stratum, worldY }
  BIT_WORN:        'drill:bitworn',    // { wear }
  BIT_BROKEN:      'drill:bitbroken',  // { }
  ROD_ADDED:       'drill:rodadded',   // { count, perfect, kind, depth }
  /* The stringless equivalent. Cable percussion has no rod to add — its
     cadence is pulling the tool and running the bailer to lift the cuttings
     out. Consumers that animate or sound a ROD STAB must not listen to this
     one; consumers whose reaction is generic (camera shake, a UI beat, the
     counter) should listen to both. */
  BAILER_RUN:      'drill:bailerrun',  // { count, perfect, depth, label }
  JAM:             'drill:jam',        // { severity }
  JAM_CLEARED:     'drill:jamcleared', // { }
  WATER_STRIKE:    'drill:water',      // { depth, flowLpm }
  CAVITY:          'drill:cavity',     // { depth, height }
  BOULDER:         'drill:boulder',    // { depth }
  HOLE_COMPLETE:   'drill:complete',   // { depth, timeSec, grade }

  // ── progression
  XP_GAIN:         'prog:xp',          // { amount, reason }
  LEVEL_UP:        'prog:levelup',     // { level, unlocks[] }
  MONEY_CHANGE:    'prog:money',       // { delta, balance, reason }
  UNLOCK:          'prog:unlock',      // { kind:'method'|'rig'|'tool'|'region', id }
  CERT_EARNED:     'prog:cert',        // { certId }

  // ── shell / flow
  SCENE_CHANGE:    'ui:scene',         // { scene: SCENES.* }
  CONTRACT_ACCEPT: 'ui:contract',      // { contract }
  PURCHASE:        'ui:purchase',      // { itemId, price }
  EQUIP:           'ui:equip',         // { slot, itemId }
  RIG_CHANGE:      'world:rig',        // { rigId, methodId }
  REGION_CHANGE:   'world:region',     // { regionId }
  QUALITY_CHANGE:  'sys:quality',      // { tier }
  HAPTIC:          'sys:haptic',       // { pattern:'light'|'medium'|'heavy'|'success'|'fail' }
};

/** Top-level app scenes. */
export const SCENES = {
  BOOT:      'boot',
  MENU:      'menu',
  CONTRACTS: 'contracts',
  SITE:      'site',      // the drilling gameplay scene
  RESULTS:   'results',
  SHOP:      'shop',      // iMarket
  CAREER:    'career',    // Talent: certs, roles, skill tree
  GARAGE:    'garage',    // rigs + loadout
};

/* ═══════════════════════════════════════════════════════════════════════════
   GAME STATE — the single mutable object. Systems read it; only sim/progression
   write to their own branches. Shape is frozen by this contract.
   ═══════════════════════════════════════════════════════════════════════════ */
export function createGameState() {
  return {
    scene: SCENES.BOOT,
    tSec: 0,

    player: {
      name: 'Rookie',
      level: 1,
      xp: 0,
      money: 4500,          // EUR
      roleId: 'helper',
      certs: [],            // certId[]
      skills: {},           // skillId -> ranks
      skillPoints: 0,
      stats: { metresDrilled: 0, holesDone: 0, bitsBurned: 0, perfectRuns: 0, jamsCleared: 0 },
    },

    unlocked: {
      methods: ['auger'],
      regions: ['nordic'],
      rigs: ['crawler-lite'],
      tools: [],
    },

    garage: {
      rigId: 'crawler-lite',
      loadout: {            // slot -> itemId  (see game/data.js SLOTS)
        bit: 'auger-flight-std',
        // `rod-r32` used to sit here and was wrong: an R32 is a *percussion*
        // thread, and data.js correctly refuses it on an auger — the seed was
        // handing the player a rod their only unlocked method cannot fit.
        // A sectional auger string is built from flighted sections joined by a
        // hex pin and a drive pin, which is what this is (research/13 §1).
        rod: 'auger-flight-sec-280',
        hammer: null,
        compressor: null,
        pump: null,
      },
      condition: {},        // itemId -> 0..1 remaining life
      owned: ['auger-flight-std', 'auger-flight-sec-280'],
    },

    contract: null,         // active Contract (see data.js)

    /** Live drilling telemetry — written by sim/drilling.js each tick. */
    drill: {
      active: false,
      depth: 0,             // m
      target: 0,            // m
      rop: 0,               // m/h instantaneous
      wob: 0.5,             // 0..1 weight-on-bit (player input)
      rpm: 0.5,             // 0..1 rotation/percussion (player input)
      flush: 0.5,           // 0..1 flushing air/water (player input)
      torque: 0,            // 0..1 normalised
      wear: 0,              // 0..1 current bit wear
      heat: 0,              // 0..1
      stability: 1,         // 0..1 hole stability
      load: 0,              // 0..1 cuttings load in the annulus — the HUD's
                            // CUTTINGS meter reads this; the sim mirrors it here
      returns: 1,           // 0..1 flushing return quality (1 = full returns)
      timeSec: 0,           // seconds on tools this run
      jam: 0,               // 0..1 jam severity, 0 = free
      rods: 1,
      stratumIndex: 0,
      inGreenBand: false,
      greenBandTime: 0,     // seconds accumulated in the sweet spot
      score: 0,
    },

    world: {
      regionId: 'nordic',
      timeOfDay: 0.35,      // 0..1 → 0 = midnight, 0.5 = noon
      weather: 'clear',     // clear | overcast | rain | snow | fog
      strata: [],           // Stratum[] generated per contract
    },

    settings: {
      quality: 'auto',
      haptics: true,
      sfx: 0.85,
      music: 0.5,
      reducedMotion: false,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   STRATUM — one geological layer. Generated by world/geology.js from the
   contract's ground profile; consumed by sim (drillability) and the renderer.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @typedef {Object} Stratum
 * @property {string} id           e.g. 'granite'
 * @property {string} name         'Granite'
 * @property {number} top          depth (m) of layer top
 * @property {number} bottom       depth (m) of layer bottom
 * @property {number} ucs          unconfined compressive strength, MPa (0 for soils)
 * @property {number} abrasivity   0..1 — how fast it eats carbide
 * @property {number} stability    0..1 — 1 = self-supporting, 0 = needs casing
 * @property {number} water        0..1 — water bearing potential
 * @property {[string,string]} colors  [top, bottom] hex — vertical gradient
 * @property {string} pattern      'clay'|'sand'|'gravel'|'till'|'sedimentary'|'crystalline'|'fractured'|'void'
 * @property {number} grain        0..1 visual grain scale
 * @property {string[]} bestMethods method ids that chew this efficiently
 */

/**
 * Canonical ground materials, tuned against real drilling practice.
 *
 * ── COLOUR TABLE — AUTHORED ON THE LIT RESULT, NOT ON THE HEX ──────────────
 * `colors` is [top, bottom] and is blended down the bed by world/geology.js.
 *
 * READ THIS BEFORE EDITING A HEX. These values are NOT what the bed looks
 * like. They are the ALBEDO that produces the intended appearance after the
 * section's key light and the renderer's grade pass. The previous table was
 * authored the other way round — a ΔE budget computed on the raw hex — and it
 * did not survive first contact with the light:
 *
 *     albedo               lit + graded     L*     C*
 *     granite    #637F8E ->  ( 81,100,102)  40.8   7.4
 *     limestone  #718F99 ->  ( 93,113,110)  45.9   8.0
 *     quartzite  #B4C9CF ->  (149,159,150)  64.6   6.5
 *
 * Three different rocks, one desaturated green-grey, chroma collapsed from
 * ~14-20 to 6.5-8.0: a fixed warm key annihilates any cool hue underneath it,
 * and the separation that did survive had been bought by rotating hue off the
 * truth — blue granite, pink gneiss, blue-grey limestone, green schist.
 * DOMAIN.md §9 says a driller must recognise their world. No driller
 * recognises blue granite.
 *
 * So the table is solved backwards now. For each material a TRUE hue angle and
 * a target lightness/chroma are stated for the DISPLAYED pixel, and the albedo
 * below is whatever lands on that target once run through world/geology.js
 * FACE_FRAG and core/renderer.js GradeShader (exposure 0.52, lift/gain/gamma,
 * split-tone, ACES, S-curve 0.30, sRGB encode). That is why these hexes look
 * washed out, and why sand is #FFD3AE rather than an ochre: the section's
 * light plus a 0.52 exposure sits ~1.35 stops down, so the albedo has to sit
 * that much up. Judge these values in a screenshot, never in a swatch.
 *
 * What the table guarantees, measured on the LIT result:
 *   • hue is the truth constraint — warm ochre overburden, neutral-to-warm
 *     grey crystallines, rust-stained fracture zones, blue-grey shale and
 *     basalt, ice-blue permafrost. Nothing is rotated for contrast.
 *   • ΔL* ≥ 18 on 48 of the 56 real adjacencies the region recipes in
 *     world/geology.js can produce.
 *   • The other eight (basalt/fracture, boulder/fracture, boulder/till,
 *     fracture/schist, gneiss/gravel, gravel/till, schist/shale, schist/till)
 *     are provably impossible by lightness alone: {basalt, fracture, schist,
 *     till} is a 4-clique whose honest lightness windows span L* 10-52, and
 *     four mutually adjacent beds 18 apart need 54. Those eight are separated
 *     by TEXTURE CLASS instead, which a warm key cannot flatten. That is why
 *     boulder beds moved from the 'till' pattern (matrix-supported diamicton)
 *     to 'gravel' (clast-supported — which is what a boulder bed actually is),
 *     and why schist and fracture zone, though they share the 'fractured'
 *     pattern, are split inside it by the fabric channel: continuous mica
 *     foliation against joint-bounded angular blocks.
 *   • lit ΔE76 at ndl 0.55: min 13.8, median 36.1, 50 of 56 clear of 20.
 *
 * `grain` now scales the face RELIEF as well as the pattern's mid/fine
 * octaves, so it doubles as surface roughness: granite is coarse (0.72)
 * because granite is by definition coarse-grained, basalt fine (0.28), chalk
 * finer still. That is where each bed's internal value range comes from.
 *
 * Within a bed the gradient is chroma and temperature and only ~1.6 L*, so it
 * never eats the contrast at the contact below it.
 */
export const GROUND = {
  //                                                                                             lit target: L*  C*  hue
  topsoil:   { name: 'Topsoil',        ucs: 0,   abrasivity: 0.05, stability: 0.35, water: 0.2, colors: ['#624E3D', '#614938'], pattern: 'clay',         grain: 0.7 },  // 20.5 16  56  dark humic brown
  clay:      { name: 'Clay',           ucs: 0.4, abrasivity: 0.08, stability: 0.55, water: 0.15, colors: ['#866F67', '#846A63'], pattern: 'clay',        grain: 0.25 }, // 39.8 19  46  brown, faintly red
  silt:      { name: 'Silt',           ucs: 0.2, abrasivity: 0.12, stability: 0.35, water: 0.45, colors: ['#A59B92', '#A2968E'], pattern: 'clay',        grain: 0.3 },  // 59.4 13  66  pale buff
  sand:      { name: 'Sand',           ucs: 0.1, abrasivity: 0.55, stability: 0.15, water: 0.8,  colors: ['#FFD3AE', '#FFC7A9'], pattern: 'sand',        grain: 0.55 }, // 81.0 24  76  light warm buff
  gravel:    { name: 'Gravel',         ucs: 0.3, abrasivity: 0.7,  stability: 0.2,  water: 0.85, colors: ['#B6A99B', '#B4A495'], pattern: 'gravel',      grain: 0.8 },  // 61.0 16  72  mid buff-grey
  till:      { name: 'Glacial Till',   ucs: 2,   abrasivity: 0.75, stability: 0.4,  water: 0.4,  colors: ['#8B837E', '#887F7A'], pattern: 'till',        grain: 0.9 },  // 48.0 11  62  grey-brown diamicton
  boulder:   { name: 'Boulder Bed',    ucs: 140, abrasivity: 0.85, stability: 0.3,  water: 0.5,  colors: ['#72716C', '#6F6D68'], pattern: 'gravel',      grain: 1.0 },  // 35.0  6  74  clast-supported erratics
  marl:      { name: 'Marl',           ucs: 8,   abrasivity: 0.3,  stability: 0.6,  water: 0.3,  colors: ['#DFE5D1', '#DBE1CA'], pattern: 'sedimentary', grain: 0.3 },  // 80.0 11 102  pale grey-green
  chalk:     { name: 'Chalk',          ucs: 12,  abrasivity: 0.2,  stability: 0.55, water: 0.6,  colors: ['#FFF6EB', '#FFF1E6'], pattern: 'sedimentary', grain: 0.25 }, // 86.0  8  80  near white, warm
  limestone: { name: 'Limestone',      ucs: 90,  abrasivity: 0.45, stability: 0.8,  water: 0.55, colors: ['#9F9F9A', '#9B9B95'], pattern: 'sedimentary', grain: 0.35 }, // 59.1  9  84  pale grey, cream cast
  sandstone: { name: 'Sandstone',      ucs: 70,  abrasivity: 0.8,  stability: 0.75, water: 0.5,  colors: ['#946F63', '#936A5E'], pattern: 'sedimentary', grain: 0.5 },  // 40.5 28  44  red-brown
  shale:     { name: 'Shale',          ucs: 40,  abrasivity: 0.35, stability: 0.5,  water: 0.35, colors: ['#49545A', '#445156'], pattern: 'sedimentary', grain: 0.2 },  // 20.0  7 252  very dark blue-grey
  schist:    { name: 'Schist',         ucs: 110, abrasivity: 0.7,  stability: 0.7,  water: 0.25, colors: ['#6A7369', '#666F64'], pattern: 'fractured',   grain: 0.52 }, // 35.0  8 122  dark silvery grey-green
  gneiss:    { name: 'Gneiss',         ucs: 180, abrasivity: 0.85, stability: 0.9,  water: 0.15, colors: ['#DFCED0', '#DCC9CC'], pattern: 'crystalline', grain: 0.62 }, // 74.0  9  46  light banded grey, pink cast
  granite:   { name: 'Granite',        ucs: 210, abrasivity: 0.9,  stability: 0.95, water: 0.1,  colors: ['#A19B99', '#9E9794'], pattern: 'crystalline', grain: 0.72 }, // 55.3  9  62  warm light grey
  basalt:    { name: 'Basalt',         ucs: 250, abrasivity: 0.95, stability: 0.9,  water: 0.12, colors: ['#384347', '#344043'], pattern: 'crystalline', grain: 0.28 }, // 12.0  5 250  near black
  quartzite: { name: 'Quartzite',      ucs: 300, abrasivity: 1.0,  stability: 0.95, water: 0.08, colors: ['#F1E2EB', '#EDDDE7'], pattern: 'crystalline', grain: 0.4 },  // 80.3  6  36  very pale, faint pink
  fracture:  { name: 'Fracture Zone',  ucs: 60,  abrasivity: 0.6,  stability: 0.15, water: 0.95, colors: ['#765344', '#764E40'], pattern: 'fractured',   grain: 0.7 },  // 22.0 22  42  dark iron-stained rubble
  karst:     { name: 'Karst Void',     ucs: 0,   abrasivity: 0,    stability: 0.0,  water: 1.0,  colors: ['#829699', '#7C9295'], pattern: 'void',        grain: 0.1 },  // 15.3  5 240  a void: the pattern is x0.22
  permafrost:{ name: 'Permafrost',     ucs: 25,  abrasivity: 0.4,  stability: 0.7,  water: 0.9,  colors: ['#9CCAE6', '#90C7E4'], pattern: 'till',        grain: 0.6 },  // 76.0 12 230  pale ice (L* held down from 81.6: at 81.6 the albedo needed blue > 255 and the ice went colourless; its only neighbours are till at 48 and topsoil at 20.5, so the lightness was free to give)
  concrete:  { name: 'Concrete',       ucs: 45,  abrasivity: 0.65, stability: 0.85, water: 0.05, colors: ['#BDBDBD', '#B8B8B8'], pattern: 'sedimentary', grain: 0.3 },  // 70.0  3  80  mid grey slab
};


/**
 * DISPLAYED colours, for 2D/DOM use only.
 *
 * `GROUND[].colors` are ALBEDOS — they are fed through the section's lighting
 * and then the grade pass, and they are deliberately much brighter than what
 * the player sees (sand's albedo is #FFD3AE). Anything drawing a swatch in the
 * DOM must use these instead, or the legend will not match the rock it labels.
 *
 * Measured from the rendered framebuffer, grade included.
 */
export const GROUND_DISPLAY = Object.freeze({
  topsoil:   '#442c1e', clay:      '#795548', silt:      '#a18c7a',
  sand:      '#e0c19b', gravel:    '#a68f79', till:      '#816e62',
  boulder:   '#59524a', marl:      '#cbc6b2', chalk:     '#dbd0c3',
  limestone: '#978d80', sandstone: '#875241', shale:     '#28313a',
  schist:    '#505547', gneiss:    '#c6b2ab', granite:   '#928277',
  basalt:    '#192126', quartzite: '#d3c4c1', fracture:  '#502a20',
  karst:     '#1f282c', permafrost:'#a2c0cc', concrete:  '#b3aaa2',
});

/** Swatch pair for a stratum id — display colour with a darker foot. */
export function groundSwatch(id) {
  const hex = GROUND_DISPLAY[id] || '#5A5A5A';
  const n = parseInt(hex.slice(1), 16);
  const dim = (v) => Math.max(0, Math.round(v * 0.62));
  const foot = '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => dim(v).toString(16).padStart(2, '0')).join('');
  return [hex, foot];
}

/* ═══════════════════════════════════════════════════════════════════════════
   Small shared utilities. Pure, dependency-free.
   ═══════════════════════════════════════════════════════════════════════════ */
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
export const smoothstep = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const smootherstep = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const TAU = Math.PI * 2;

/** Mulberry32 — small, fast, seedable. */
export function makeRandom(seed = 1) {
  let s = seed >>> 0 || 1;
  const f = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    f,
    range: (a, b) => a + f() * (b - a),
    int: (a, b) => Math.floor(a + f() * (b - a + 1)),
    pick: (arr) => arr[Math.floor(f() * arr.length)],
    bool: (p = 0.5) => f() < p,
    gauss: () => {
      let u = 0, v = 0;
      while (u === 0) u = f();
      while (v === 0) v = f();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
    },
  };
}

/** Tiny event bus. */
export function createBus() {
  const map = new Map();
  return {
    on(evt, fn) {
      if (!map.has(evt)) map.set(evt, new Set());
      map.get(evt).add(fn);
      return () => map.get(evt)?.delete(fn);
    },
    off(evt, fn) { map.get(evt)?.delete(fn); },
    emit(evt, payload) {
      const s = map.get(evt);
      if (!s) return;
      for (const fn of [...s]) {
        try { fn(payload); } catch (e) { console.error(`[bus] ${evt}`, e); }
      }
    },
    clear() { map.clear(); },
  };
}

/** EUR formatter used across HUD/shop. */
export const fmtMoney = (n) => {
  const v = Math.round(n);
  if (Math.abs(v) >= 1_000_000) return `€${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (Math.abs(v) >= 10_000) return `€${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `€${v.toLocaleString('en-US')}`;
};
export const fmtDepth = (m) => `${m.toFixed(m < 10 ? 2 : 1)} m`;
