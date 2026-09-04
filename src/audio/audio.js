/**
 * DRILLITY I THE GAME — audio/audio.js
 * ═══════════════════════════════════════════════════════════════════════════
 * Everything you hear in this game is synthesised at runtime. There is not one
 * audio file in the project, no network request, no library. This module bakes
 * its own noise, its own impulse responses and its own metallic resonators into
 * AudioBuffers at unlock() time, then plays a 30-tonne diesel drill rig through
 * a phone speaker.
 *
 * ── THE CORE PROBLEM ───────────────────────────────────────────────────────
 * A phone speaker is a 12 mm driver in a plastic box. It produces essentially
 * nothing below ~450 Hz and its useful band is roughly 500 Hz – 8 kHz with a
 * peak around 2–4 kHz. So the whole mix is designed around one rule:
 *
 *      ALL LOAD-BEARING INFORMATION LIVES BETWEEN 300 Hz AND 5 kHz.
 *
 * "Low" is therefore *implied*, never reproduced. The diesel is a harmonically
 * rich pulse train whose fundamental (39–105 Hz over the model's full
 * range; 65–94 Hz in actual play) is inaudible but whose
 * harmonics 4–40 land squarely in the speaker's band; the ear reconstructs the
 * missing fundamental (residue pitch) and hears a big slow engine. A Chebyshev
 * harmonic exciter reinforces 2f/3f/4f explicitly. Same trick for the hammer:
 * the *rate* is what makes it feel heavy, not the spectrum.
 *
 * ── SIGNAL FLOW (complete) ─────────────────────────────────────────────────
 *
 *   CONTINUOUS VOICES              TRANSIENT VOICES (pooled, capped)
 *   ─────────────────              ────────────────────────────────
 *   engine   ─┐                    one-shots ─┐
 *   hydraulic ┤                    blow accents┤
 *   airComp   ┼─► sfxBus ◄─────────music notes │ (music notes go to musicBus)
 *   rotation  ┤      │             ambience evt┘
 *   percTrain ┤      │             pile blows  │
 *   flush     ┤      │             SPT drops   │
 *   ┄┄┄┄┄┄┄┄┄ ┤      │             cyclone slugs
 *   cyclone   ┤      │             bailing runs
 *   drifter2/3┤      │  §13b, built lazily, one method each:
 *   ITH path  ┤      │    rc · tunnel-jumbo · longhole · rockbolt ·
 *   flush-back┤      │    driven-pile · site-investigation
 *   resin mix ┤      │
 *   hold tone ┤      │  §13b-2b, built lazily for power:'dual' only:
 *   pile lift ┤      │    mains hum / slot tone / motor fan — and while it
 *   CPT ram   ┤      │    is running the DIESEL IS SHUT DOWN, not ducked
 *   mains bed ┘      │
 *                    │
 *   musicBed  ──► musicDuck ──► musicBus ─┐
 *   ambience  ──┬───────────► ambBus ─────┤
 *   ugVent/mach ┘  (§14b — replaces the region bed, never layers over it)
 *                                          │
 *   (every voice may also feed reverbSend) │
 *   reverbSend ─► convolver ─► verbReturn ─┤
 *                                          ▼
 *                                       preMaster
 *                                          │
 *                                    hpf 78 Hz  (kill sub rumble the speaker
 *                                          │     cannot make — pure headroom)
 *                                    glueComp   (thr −18 dB, ratio 2.5,
 *                                          │     atk 12 ms, rel 220 ms)
 *                                    presence   (peaking +3 dB @ 2.6 kHz Q .9)
 *                                          │
 *                                    limiter    (thr −3.5 dB, ratio 20,
 *                                          │     atk 2 ms, rel 90 ms)
 *                                    makeup     (×1.55)
 *                                          │
 *                                    softClip   (tanh ceiling 0.97 — the true
 *                                          │     brickwall; nothing can clip)
 *                                    masterGain
 *                                          ▼
 *                                     destination
 *
 * NOTE ON "LOOKAHEAD": DynamicsCompressorNode has no sidechain input, so a
 * genuine lookahead limiter is not constructible in the Web Audio API. What we
 * build instead is the practical equivalent used in broadcast: a slow glue
 * compressor to hold the average level, a fast peak limiter, then a memoryless
 * tanh soft-clipper as an absolute ceiling. The soft-clipper cannot overshoot
 * by construction (|tanh| < 1), so the output is mathematically guaranteed
 * never to clip the DAC regardless of how many voices fire at once.
 *
 * ── THE TWENTY-ONE METHODS ─────────────────────────────────────────────────
 * §1 gives every method id in METHOD_IDS.md an acoustic personality. Fifteen of
 * them are variations on one machine: a diesel, a pump, a rotary head and some
 * kind of hammer. Six are not, and each needed something the original voices
 * could not make:
 *
 *   rc                  the CYCLONE — a continuous roar of air and chips whose
 *                       NOTE changes when the sample goes wet, before the
 *                       gauge does (§13b-1)
 *   tunnel-jumbo        two or three drifters at once, deliberately never in
 *                       phase, in a hard little room (§13b-2 + §14b)
 *   longhole            the blow arriving at the collar delayed and lowpassed
 *                       by 15–45 m of rod string (§13b-3)
 *   rockbolt            resin cartridges punctured and spun, and the silence
 *                       when the hold time starts (§13b-4)
 *   driven-pile         no rotation, no flush: one enormous blow at a time on
 *                       a power hyperbola, into a pile that rings and dies
 *                       differently at refusal than running free (§13b-5)
 *   site-investigation  63.5 kg falling 760 mm, countable — and a CPT push,
 *                       the only quiet thing in the game (§13b-6)
 *
 * ── THE SECOND WAVE ─────────────────────────────────────────────────
 * Six things the first pass left on the table. Each has its own note where it
 * lives; this is the index.
 *
 *   §3d    THE PROGRAMME BLOCK. The sim publishes the six methods' state
 *          nested under `telemetry.programme` in its own vocabulary, and
 *          nothing here read it. Every one of the six voices above was
 *          running on its DEFAULTS — correct, and completely deaf.
 *   §13b-1 THE CHOKE. `holdUp01` — carry-over in the sample train — surges
 *          the cyclone. A choking cyclone is now audible before it is visible.
 *   §13b-2b THE REEL. tunnel-jumbo trams on diesel and drills on mains
 *          electric. Two noise floors, one audible transfer between them, and
 *          the hydraulic pack's note stops drooping because its prime mover is
 *          a synchronous machine.
 *   §13b-3 THE FLUSH-BACK. An uphole rains its own cuttings back over the
 *          collar. Half a production fan is drilled up and it never sounded
 *          any different from drilling down.
 *   §13b-4 THE CLOCK. The gel/hold time had a start and no middle and no end.
 *          Now it has all three, and none of them is a beep.
 *   §13b-5 THE BROOM. The set gauge lies while the toe destroys itself. The
 *          blow's own ring does not, and this is the one place in the game
 *          where listening beats reading. The best thing in this file.
 *   §18b   THE BAILING RUN. EVENTS.BAILER_RUN played `flush_spit` — a packed
 *          annulus burping — for a whole release. It is a winch under load
 *          and a wet dump, built from the winch that was already here.
 *
 * ── AUTOPLAY / LIFECYCLE ───────────────────────────────────────────────────
 * createAudio() and init() never touch AudioContext. The context is created in
 * unlock(), which must be called from a user gesture. Before that every public
 * method is a silent, non-throwing no-op that still records intent (bus gains,
 * region, engine on/off) so the world spins up correctly the instant we unlock.
 * A capture-phase pointerdown/touchend/keydown listener is installed as a
 * safety net in case the shell forgets to call unlock().
 *
 * ── PERFORMANCE CONTRACT ───────────────────────────────────────────────────
 *  • Continuous params are smoothed in JS (exponential damp) and written with
 *    direct `.value` assignment at frame rate. We deliberately do NOT use
 *    setTargetAtTime per frame: that grows the automation timeline unboundedly.
 *    Because the JS side is already smoothed, per-quantum steps are < 0.5 % and
 *    inaudible.
 *  • update() allocates nothing. Voice descriptors are pooled, scratch objects
 *    are module-level, arrays are swap-removed (never spliced).
 *  • Transient voices are capped (16/20/24 by quality tier) with priority
 *    stealing. The hammer at 62 blows/s is NOT node-per-blow: it is a
 *    continuous bandlimited pulse train (zero per-blow cost) plus a decimated
 *    accent layer limited to ≤16 discrete hits/s.
 *  • visibilitychange suspends the context; returning resumes it.
 */

import { EVENTS, clamp, damp, TAU, GROUND } from '../core/contract.js';

/* ═══════════════════════════════════════════════════════════════════════════
   0. CONSTANTS & SMALL MATH
   ═══════════════════════════════════════════════════════════════════════════ */

const EPS = 1e-4;                    // exponentialRamp target floor (never 0)
const VOICE_CAP = { low: 16, medium: 20, high: 24 };

/** Priorities for voice stealing. Higher survives. */
const PRIO = {
  ambient: 1,
  music: 2,
  ui: 3,
  flush: 4,
  blow: 5,
  event: 7,
  hazard: 9,
  critical: 10,
};

const mixf = (a, b, t) => a + (b - a) * t;
const dbToGain = (db) => Math.pow(10, db / 20);

/** Deterministic small PRNG so baked buffers are reproducible per seed. */
function prng(seed) {
  let s = (seed >>> 0) || 0x9e3779b9;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. METHOD → SOUND TABLE
   ───────────────────────────────────────────────────────────────────────────
   Every drilling method from DOMAIN.md §1 gets an acoustic personality. The
   numbers are the real machine's behaviour scaled to something a phone speaker
   and a human ear can enjoy.

   percussion : 'none' | 'top' | 'dth' | 'drop' | 'sonic'
   blowHz     : [min,max] blows per second at rpm control 0 → 1.
                Real top hammer runs 2400–4200 bpm = 40–70 Hz; we use 34–62 Hz
                because above ~62 Hz on a small speaker the individual blows
                smear into a buzz and you lose the "machine" read.
                Real DTH runs 1600–2200 bpm = 27–37 Hz → we use 20–34 Hz, which
                keeps the blows individually audible and reads as heavier.
                Cable-tool is a literal falling weight: 0.6–1.1 Hz.
                Sonic is resonance, not blows: 55–165 Hz continuous.
   ringHz     : base pitch of the drill-string resonator at 1 rod.
                Short steel string rings high and briefly; each added rod drops
                pitch and lengthens decay (see blowPlaybackRate()).
   shaftHz    : [min,max] rotary head revolutions/second at rpm control 0 → 1.
   meshTeeth  : gearbox mesh order — mesh tone = shaftHz × meshTeeth.
   compressor : needs an air compressor running (DTH, top hammer w/ air flush).
   hydraulic  : 0..1 how hard the hydraulic pack works (whine level).
   engineBase : 0..1 baseline engine load before player input.
   medium     : 'air' | 'water' | 'mud' | 'none' — flush voice character.

   ── SIX OPTIONAL KEYS ADDED FOR THE SIX NEW METHODS (METHOD_IDS.md) ───────
   Every one of them defaults, so not one of the fifteen original methods
   changes behaviour by a single sample.

   voice      : an extra continuous voice module, built LAZILY the first time
                the method is selected (§26):
                  'cyclone' rc                 the cyclone / splitter / booster
                  'jumbo'   tunnel-jumbo       drifters 2 and 3, out of phase
                  'ith'     longhole           downhole delay + rod-string LPF
                  'bolter'  rockbolt           resin cartridges being spun
                  'pile'    driven-pile        the impact-hammer scheduler
                  'si'      site-investigation SPT drop scheduler / CPT ram
   acoustic   : 'underground' selects the region-independent underground bed
                (§14b) INSTEAD of the region's wind, wildlife and IR.
   discrete   : true = percussion is one enormous blow at a time rather than a
                train. Suppresses the continuous hammer voice entirely and
                hands blow scheduling to the method's own module.
   trim       : master trim on the machine voices (engine / hydraulic / air /
                rotation / percussion / flush). Only site-investigation sets it
                (0.50), because a CPT rig is the quietest thing in the game and
                that silence is the entire point of the method.
   pileHz     : free-free longitudinal ring of the pile, Hz — see stepPile().
   boomHz     : rate detune of the extra drifters on a multi-boom jumbo.
   power      : 'dual' — the machine has TWO noise floors and switches between
                them in play (§13b-2b). Only tunnel-jumbo sets it: a face rig
                TRAMS on its diesel and DRILLS on mains electric, and those are
                not the same machine. Absent means the diesel is the only power
                source, which is every other machine in the game, so nothing
                else changes by a sample.
   ═══════════════════════════════════════════════════════════════════════════ */
const METHODS = {
  'auger':            { percussion: 'none',  blowHz: [0, 0],       ringHz: 300, shaftHz: [0.5, 2.6],  meshTeeth: 26, compressor: false, hydraulic: 0.75, engineBase: 0.28, medium: 'none'  },
  'cable-tool':       { percussion: 'drop',  blowHz: [0.6, 1.1],   ringHz: 190, shaftHz: [0.0, 0.2],  meshTeeth: 14, compressor: false, hydraulic: 0.30, engineBase: 0.22, medium: 'water' },
  'top-hammer':       { percussion: 'top',   blowHz: [34, 62],     ringHz: 520, shaftHz: [1.0, 4.2],  meshTeeth: 31, compressor: true,  hydraulic: 0.95, engineBase: 0.34, medium: 'air'   },
  'dth':              { percussion: 'dth',   blowHz: [20, 34],     ringHz: 330, shaftHz: [0.4, 1.6],  meshTeeth: 23, compressor: true,  hydraulic: 0.70, engineBase: 0.40, medium: 'air'   },
  'overburden':       { percussion: 'top',   blowHz: [30, 55],     ringHz: 430, shaftHz: [0.6, 2.4],  meshTeeth: 29, compressor: true,  hydraulic: 0.90, engineBase: 0.38, medium: 'air'   },
  'core':             { percussion: 'none',  blowHz: [0, 0],       ringHz: 780, shaftHz: [3.0, 13.0], meshTeeth: 18, compressor: false, hydraulic: 0.55, engineBase: 0.24, medium: 'water' },
  'rotary-kelly':     { percussion: 'none',  blowHz: [0, 0],       ringHz: 240, shaftHz: [0.3, 1.4],  meshTeeth: 37, compressor: false, hydraulic: 0.95, engineBase: 0.42, medium: 'mud'   },
  'cfa':              { percussion: 'none',  blowHz: [0, 0],       ringHz: 260, shaftHz: [0.4, 1.8],  meshTeeth: 35, compressor: false, hydraulic: 0.92, engineBase: 0.44, medium: 'none'  },
  'cased-cfa':        { percussion: 'none',  blowHz: [0, 0],       ringHz: 250, shaftHz: [0.3, 1.5],  meshTeeth: 39, compressor: false, hydraulic: 1.00, engineBase: 0.50, medium: 'none'  },
  'hdd':              { percussion: 'none',  blowHz: [0, 0],       ringHz: 360, shaftHz: [0.5, 2.2],  meshTeeth: 27, compressor: false, hydraulic: 0.85, engineBase: 0.36, medium: 'mud'   },
  'sonic':            { percussion: 'sonic', blowHz: [55, 165],    ringHz: 410, shaftHz: [0.2, 1.2],  meshTeeth: 21, compressor: false, hydraulic: 0.88, engineBase: 0.46, medium: 'water' },
  'jet-grouting':     { percussion: 'none',  blowHz: [0, 0],       ringHz: 300, shaftHz: [0.1, 0.7],  meshTeeth: 24, compressor: false, hydraulic: 1.00, engineBase: 0.55, medium: 'mud'   },
  'anchor':           { percussion: 'top',   blowHz: [32, 58],     ringHz: 610, shaftHz: [0.8, 3.4],  meshTeeth: 25, compressor: true,  hydraulic: 0.85, engineBase: 0.30, medium: 'air'   },
  // METHOD_IDS.md calls this one 'oil-rotary'; this file shipped it as 'dw'
  // (deep well), so both spellings resolve to the same machine and neither
  // side of the contract has to change.
  'oil-rotary':       { percussion: 'none',  blowHz: [0, 0],       ringHz: 200, shaftHz: [0.2, 0.9],  meshTeeth: 43, compressor: false, hydraulic: 1.00, engineBase: 0.58, medium: 'mud'   },
  'dw':               { percussion: 'none',  blowHz: [0, 0],       ringHz: 200, shaftHz: [0.2, 0.9],  meshTeeth: 43, compressor: false, hydraulic: 1.00, engineBase: 0.58, medium: 'mud'   },
  'displacement':     { percussion: 'none',  blowHz: [0, 0],       ringHz: 255, shaftHz: [0.3, 1.5],  meshTeeth: 38, compressor: false, hydraulic: 0.96, engineBase: 0.50, medium: 'none'  },
  'soil-mixing':      { percussion: 'none',  blowHz: [0, 0],       ringHz: 230, shaftHz: [0.2, 1.1],  meshTeeth: 41, compressor: false, hydraulic: 0.94, engineBase: 0.48, medium: 'mud'   },
  'raise-boring':     { percussion: 'none',  blowHz: [0, 0],       ringHz: 175, shaftHz: [0.1, 0.6],  meshTeeth: 47, compressor: false, hydraulic: 1.00, engineBase: 0.62, medium: 'water' },
  'microtunnelling':  { percussion: 'none',  blowHz: [0, 0],       ringHz: 210, shaftHz: [0.2, 0.8],  meshTeeth: 45, compressor: false, hydraulic: 0.98, engineBase: 0.56, medium: 'mud'   },
  'pipe-bursting':    { percussion: 'drop',  blowHz: [3.5, 7.0],   ringHz: 260, shaftHz: [0.0, 0.2],  meshTeeth: 16, compressor: false, hydraulic: 0.90, engineBase: 0.40, medium: 'none'  },
  'auger-boring':     { percussion: 'none',  blowHz: [0, 0],       ringHz: 280, shaftHz: [0.4, 2.0],  meshTeeth: 33, compressor: false, hydraulic: 0.82, engineBase: 0.38, medium: 'none'  },
  'vibro':            { percussion: 'sonic', blowHz: [22, 34],     ringHz: 300, shaftHz: [0.0, 0.3],  meshTeeth: 20, compressor: true,  hydraulic: 0.90, engineBase: 0.52, medium: 'air'   },
  'dynamic-compaction': { percussion: 'drop', blowHz: [0.25, 0.5], ringHz: 150, shaftHz: [0.0, 0.1],  meshTeeth: 12, compressor: false, hydraulic: 0.45, engineBase: 0.30, medium: 'none'  },

  /* ── THE SIX (METHOD_IDS.md) ─────────────────────────────────────────────
     rc — an RC rig is TWO machines: the drill (a DTH hammer on a dual-wall
     pipe, 1100–1800 bpm = 18–30 Hz, low ring because the rod is a fat
     concentric pipe, not a slim rod) and the air plant (a 1000 cfm compressor
     plus a booster). engineBase is the highest in the game for that reason.

     tunnel-jumbo — electro-hydraulic on mains power underground, so the diesel
     is only the idling tramming engine (engineBase 0.20) and the HYDRAULICS
     are pegged. Water flush. Three booms: see stepJumbo().

     longhole — an ITH hammer at the bottom of a 15–45 m hole. Same blow rate
     as DTH but the collar hears it through the whole rod string: see stepITH().

     rockbolt — rotation and thrust only. The percussion field is 'none'; the
     method's signature sound is the resin, not the drilling.

     driven-pile — no rotation, no flush, no train. blowHz is 30–100 blows per
     MINUTE (0.50–1.667 Hz) and each blow is a separate one-shot. ringHz is
     unused; pileHz carries the pile's own ring.

     site-investigation — SPT is 20–45 blows/min of a falling 63.5 kg weight;
     CPT is a hydraulic push and is very nearly silent. No rotation, no flush.
     ──────────────────────────────────────────────────────────────────────── */
  'rc':                 { percussion: 'dth',  blowHz: [18, 30],     ringHz: 300, shaftHz: [0.3, 1.5],  meshTeeth: 25, compressor: true,  hydraulic: 0.78, engineBase: 0.58, medium: 'air',   voice: 'cyclone' },
  'tunnel-jumbo':       { percussion: 'top',  blowHz: [36, 60],     ringHz: 560, shaftHz: [0.9, 3.6],  meshTeeth: 30, compressor: false, hydraulic: 1.00, engineBase: 0.20, medium: 'water', voice: 'jumbo',  acoustic: 'underground', boomHz: [1.0374, 0.9686], power: 'dual' },
  'longhole':           { percussion: 'dth',  blowHz: [18, 30],     ringHz: 250, shaftHz: [0.3, 1.4],  meshTeeth: 24, compressor: true,  hydraulic: 0.88, engineBase: 0.34, medium: 'air',   voice: 'ith',    acoustic: 'underground' },
  'rockbolt':           { percussion: 'none', blowHz: [0, 0],       ringHz: 340, shaftHz: [0.6, 3.2],  meshTeeth: 28, compressor: false, hydraulic: 0.94, engineBase: 0.22, medium: 'water', voice: 'bolter', acoustic: 'underground' },
  'driven-pile':        { percussion: 'pile', blowHz: [0.50, 1.667],ringHz: 118, shaftHz: [0.0, 0.0],  meshTeeth: 10, compressor: false, hydraulic: 1.00, engineBase: 0.50, medium: 'none',  voice: 'pile',   discrete: true, pileHz: 128 },
  'site-investigation': { percussion: 'spt',  blowHz: [0.33, 0.75], ringHz: 230, shaftHz: [0.0, 0.0],  meshTeeth: 12, compressor: false, hydraulic: 0.34, engineBase: 0.14, medium: 'none',  voice: 'si',     discrete: true, trim: 0.50 },
};

/** Percussion kinds whose blows are discrete one-shots, not a pulse train. */
const DISCRETE_PERC = { pile: 1, spt: 1 };
const METHOD_DEFAULT = METHODS['top-hammer'];

/* ═══════════════════════════════════════════════════════════════════════════
   2. ROCK → PERCUSSION CHARACTER
   ───────────────────────────────────────────────────────────────────────────
   The rock's response to a blow. Derived from Stratum.ucs (MPa) and .pattern.
   Granite cracks; clay thuds. The audible difference is (a) how much of the
   blow energy comes back as high-frequency splinter noise, (b) how long the
   drill string is allowed to ring (soft ground damps the string), (c) the
   centre frequency of the impact transient.
   ═══════════════════════════════════════════════════════════════════════════ */
const ROCK_CLASSES = [
  //                     crackF  crackQ  splinter  ringMul  thump   name
  { id: 'soil',  ucsMax: 1,    crackF: 620,  crackQ: 0.9, splinter: 0.06, ringMul: 0.18, thump: 1.00, decayMul: 0.35 },
  { id: 'soft',  ucsMax: 15,   crackF: 1100, crackQ: 1.3, splinter: 0.20, ringMul: 0.42, thump: 0.75, decayMul: 0.55 },
  { id: 'med',   ucsMax: 60,   crackF: 1900, crackQ: 1.8, splinter: 0.45, ringMul: 0.70, thump: 0.50, decayMul: 0.78 },
  { id: 'hard',  ucsMax: 160,  crackF: 3100, crackQ: 2.4, splinter: 0.72, ringMul: 0.92, thump: 0.34, decayMul: 0.95 },
  { id: 'vhard', ucsMax: 1e9,  crackF: 4600, crackQ: 3.2, splinter: 1.00, ringMul: 1.00, thump: 0.26, decayMul: 1.12 },
];
function rockClassForUCS(ucs) {
  for (let i = 0; i < ROCK_CLASSES.length; i++) if (ucs <= ROCK_CLASSES[i].ucsMax) return i;
  return ROCK_CLASSES.length - 1;
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. REGION AMBIENCE TABLE
   ───────────────────────────────────────────────────────────────────────────
   Each region is: two decorrelated wind layers (a low bed + a high sibilant
   layer that gusts), an optional steady "texture" layer, a sparse random event
   scheduler, and a procedurally generated impulse response.

   wind.lowHz / wind.hiHz : the lowpass corner of each layer (Hz).
   wind.level             : base gain of the bed.
   wind.gust              : [ratePerSec, depth] — how often and how deep the
                            granular gusts swell.
   events                 : [{ id, perMin, gain, pan }] — sparse one-shots.
   ir                     : impulse-response recipe (see bakeIR()).
   ═══════════════════════════════════════════════════════════════════════════ */
const REGIONS = {
  nordic: {
    name: 'Nordic forest',
    wind: { level: 0.16, lowHz: 340, hiHz: 1500, gust: [0.16, 0.85], rough: 0.25 },
    texture: null,
    events: [
      { id: 'bird_chirp',  perMin: 14, gain: 0.30, pan: 0.55 },
      { id: 'bird_trill',  perMin: 6,  gain: 0.24, pan: -0.6 },
      { id: 'branch_creak',perMin: 3,  gain: 0.22, pan: -0.3 },
    ],
    ir: { seconds: 1.7, decay: 2.6, predelayMs: 14, lpHz: 2100, hpHz: 180, echoes: [], diffusion: 1.0, seed: 101 },
    verbSend: 0.30,
  },
  german: {
    name: 'German construction site',
    wind: { level: 0.10, lowHz: 300, hiHz: 900, gust: [0.10, 0.5], rough: 0.15 },
    texture: { kind: 'cityDrone', level: 0.12, lowHz: 420 },
    events: [
      { id: 'site_beeper',  perMin: 5,  gain: 0.20, pan: 0.7 },
      { id: 'metal_clang',  perMin: 7,  gain: 0.26, pan: -0.5 },
      { id: 'distant_truck',perMin: 4,  gain: 0.22, pan: 0.35 },
    ],
    ir: { seconds: 1.2, decay: 3.4, predelayMs: 9, lpHz: 3400, hpHz: 220, echoes: [[0.045, 0.34], [0.081, 0.18]], diffusion: 0.75, seed: 202 },
    verbSend: 0.26,
  },
  alpine: {
    name: 'Alpine valley',
    wind: { level: 0.20, lowHz: 380, hiHz: 2400, gust: [0.22, 1.0], rough: 0.35 },
    texture: null,
    events: [
      { id: 'rock_fall',   perMin: 2.5, gain: 0.26, pan: -0.65 },
      { id: 'bird_trill',  perMin: 4,   gain: 0.20, pan: 0.6 },
      { id: 'cowbell',     perMin: 2,   gain: 0.13, pan: 0.8 },
    ],
    // The signature: three discrete slap-back echoes off the far valley wall,
    // 180/330/520 ms — that is 30/56/89 m of round trip, a real valley.
    ir: { seconds: 3.6, decay: 2.0, predelayMs: 22, lpHz: 2600, hpHz: 200, echoes: [[0.180, 0.42], [0.330, 0.26], [0.520, 0.16], [0.760, 0.09]], diffusion: 0.55, seed: 303 },
    verbSend: 0.48,
  },
  quarry: {
    name: 'Iberian quarry',
    wind: { level: 0.13, lowHz: 320, hiHz: 1800, gust: [0.13, 0.7], rough: 0.30 },
    texture: { kind: 'heatShimmer', level: 0.05, lowHz: 5200 },
    events: [
      { id: 'rock_fall',   perMin: 5,  gain: 0.30, pan: 0.5 },
      { id: 'metal_clang', perMin: 3,  gain: 0.22, pan: -0.7 },
      { id: 'distant_blast', perMin: 0.7, gain: 0.34, pan: 0.15 },
    ],
    ir: { seconds: 2.5, decay: 2.4, predelayMs: 18, lpHz: 4200, hpHz: 190, echoes: [[0.095, 0.40], [0.168, 0.22]], diffusion: 0.65, seed: 404 },
    verbSend: 0.40,
  },
  offshore: {
    name: 'North Sea platform',
    wind: { level: 0.30, lowHz: 420, hiHz: 3200, gust: [0.30, 1.0], rough: 0.55 },
    texture: { kind: 'sea', level: 0.20, lowHz: 900 },
    events: [
      { id: 'gull',        perMin: 9,  gain: 0.26, pan: 0.7 },
      { id: 'steel_groan', perMin: 4,  gain: 0.24, pan: -0.4 },
      { id: 'wave_slam',   perMin: 6,  gain: 0.28, pan: 0.0 },
    ],
    // Small, hard, steel: short decay with a tight 18 ms flutter between decks.
    ir: { seconds: 0.85, decay: 4.5, predelayMs: 5, lpHz: 5200, hpHz: 260, echoes: [[0.018, 0.45], [0.036, 0.24], [0.054, 0.12]], diffusion: 0.5, seed: 505 },
    verbSend: 0.22,
  },
  desert: {
    name: 'Sahara water well',
    wind: { level: 0.22, lowHz: 300, hiHz: 1200, gust: [0.09, 0.9], rough: 0.45 },
    texture: { kind: 'sandHiss', level: 0.09, lowHz: 3800 },
    events: [
      { id: 'sand_gust',   perMin: 6,  gain: 0.24, pan: -0.5 },
      { id: 'insect',      perMin: 8,  gain: 0.10, pan: 0.6 },
    ],
    // Open desert has almost no reflection. 350 ms of nothing much.
    ir: { seconds: 0.4, decay: 6.0, predelayMs: 3, lpHz: 1800, hpHz: 240, echoes: [], diffusion: 1.0, seed: 606 },
    verbSend: 0.10,
  },
  altiplano: {
    name: 'Chilean copper mine — high altitude',
    // Thin air: less mass, so the wind is bright and hissy, not full.
    wind: { level: 0.19, lowHz: 520, hiHz: 4200, gust: [0.20, 0.95], rough: 0.40 },
    texture: null,
    events: [
      { id: 'rock_fall',    perMin: 3,  gain: 0.24, pan: -0.6 },
      { id: 'distant_truck',perMin: 3,  gain: 0.18, pan: 0.5 },
      { id: 'distant_blast',perMin: 0.5,gain: 0.30, pan: 0.2 },
    ],
    ir: { seconds: 2.1, decay: 3.0, predelayMs: 20, lpHz: 5000, hpHz: 300, echoes: [[0.140, 0.28], [0.255, 0.15]], diffusion: 0.7, seed: 707 },
    verbSend: 0.34,
  },
  arctic: {
    name: 'Arctic permafrost',
    // Arctic silence is not silence — it is a very low, very quiet bed with
    // nothing in the midrange, which is why the ice creaks are so shocking.
    wind: { level: 0.11, lowHz: 260, hiHz: 700, gust: [0.07, 0.6], rough: 0.20 },
    texture: null,
    events: [
      { id: 'ice_creak',  perMin: 5,  gain: 0.34, pan: -0.55 },
      { id: 'ice_crack',  perMin: 2,  gain: 0.30, pan: 0.6 },
      { id: 'snow_settle',perMin: 4,  gain: 0.14, pan: 0.2 },
    ],
    ir: { seconds: 1.4, decay: 3.2, predelayMs: 11, lpHz: 6000, hpHz: 320, echoes: [[0.062, 0.20]], diffusion: 0.85, seed: 808 },
    verbSend: 0.30,
  },
};

const REGION_ALIAS = {
  'nordic-forest': 'nordic', forest: 'nordic', sweden: 'nordic', norway: 'nordic', finland: 'nordic',
  germany: 'german', 'german-construction': 'german', construction: 'german', city: 'german', urban: 'german',
  alps: 'alpine', 'alpine-tunnel': 'alpine', tunnel: 'alpine', valley: 'alpine',
  iberian: 'quarry', 'iberian-quarry': 'quarry', spain: 'quarry', portugal: 'quarry', pit: 'quarry',
  'north-sea': 'offshore', northsea: 'offshore', platform: 'offshore', marine: 'offshore', rig: 'offshore', sea: 'offshore',
  sahara: 'desert', 'sahara-water-well': 'desert', africa: 'desert', dune: 'desert',
  chile: 'altiplano', chilean: 'altiplano', 'chilean-copper': 'altiplano', copper: 'altiplano', mine: 'altiplano', andes: 'altiplano', highaltitude: 'altiplano',
  'arctic-permafrost': 'arctic', permafrost: 'arctic', ice: 'arctic', polar: 'arctic', greenland: 'arctic',
};
function resolveRegion(id) {
  if (!id) return 'nordic';
  const k = String(id).toLowerCase();
  if (REGIONS[k]) return k;
  if (REGION_ALIAS[k]) return REGION_ALIAS[k];
  return 'nordic';
}

/* ═══════════════════════════════════════════════════════════════════════════
   3b. THE UNDERGROUND ACOUSTIC  (tunnel-jumbo · longhole · rockbolt)
   ───────────────────────────────────────────────────────────────────────────
   Three of the six new methods happen inside rock. An underground heading is
   acoustically the OPPOSITE of every one of the eight region beds:

     • there is no wind and there are no animals. Nothing gusts. The bed does
       not breathe — it is CONSTANT, and that constancy is the first thing the
       ear notices when you go underground.
     • the reverb is short (a 5 × 5 m drift is a small room), hard (bare rock
       and shotcrete absorb almost nothing above 250 Hz) and VERY present,
       because there is no open air for the energy to escape into. So the IR is
       0.62 s where the alpine valley is 3.6 s, but the wet return is 1.45× —
       short and loud, not long and quiet.
     • the loudest constant thing is the VENTILATION: a 1000–1600 mm flexible
       duct moving 20–40 m³/s. That is a fat low rush at ~235 Hz plus the fan's
       blade-pass tone. It never stops, so it becomes the room tone.
     • everything else you hear is far away and around a corner — a mucker, a
       loader tramming, water dripping, the rock ticking as it relaxes.

   THE ECHO TAPS are real geometry, not taste. Sound travels 343 m/s, so a tap
   at time t is a reflector at t·343/2 metres:
       12.5 ms →  2.14 m   the back of the drift / the roof
       23.1 ms →  3.96 m   the far wall across a 4 m heading
       37.4 ms →  6.41 m   the corner behind the jumbo
       60.5 ms → 10.4 m    down the drift toward the last round
   diffusion 0.92 (rough blasted rock is a good diffuser); lpHz 2600 because
   wet shotcrete and rock dust eat the top octave.
   ═══════════════════════════════════════════════════════════════════════════ */
const UNDERGROUND = {
  name: 'Underground heading / production level',
  // Ventilation duct: the room tone. ductHz is the duct's own resonance, the
  // blade tone is fan blades × shaft rate for a typical 8-blade 1450 rpm fan
  // (8 × 24.2 = 193 Hz fundamental, and it is the 8th order at 1550 Hz that
  // actually survives a phone speaker — so that is where we put the peak).
  vent: { level: 0.150, ductHz: 235, bladeHz: 1550, surgeHz: 0.31 },
  // Distant machinery: a loader two crosscuts away. Brown noise under 210 Hz
  // with a very slow wander. Never a recognisable engine — only its weight.
  machinery: { level: 0.055, lpHz: 210 },
  events: [
    { id: 'ug_drip',           perMin: 16,  gain: 0.20, pan: -0.45 },
    { id: 'ug_rock_tick',      perMin: 7,   gain: 0.17, pan: 0.55 },
    { id: 'ug_distant_mucker', perMin: 2.2, gain: 0.22, pan: 0.30 },
    { id: 'ug_vent_surge',     perMin: 3.5, gain: 0.16, pan: 0.0 },
  ],
  ir: {
    seconds: 0.62, decay: 2.9, predelayMs: 3, lpHz: 2600, hpHz: 240,
    echoes: [[0.0125, 0.52], [0.0231, 0.34], [0.0374, 0.21], [0.0605, 0.12]],
    diffusion: 0.92, seed: 909,
  },
  verbMul: 1.45,
};
const UG_ROOM = '__ug';       // convolver cache key; never enters the region LRU

/* Weather modifiers — multiply/offset the region bed. */
const WEATHER = {
  clear:    { windMul: 1.00, damp: 1.00, rain: 0.00, verbMul: 1.00 },
  overcast: { windMul: 0.85, damp: 0.88, rain: 0.00, verbMul: 1.05 },
  rain:     { windMul: 1.10, damp: 0.72, rain: 0.55, verbMul: 0.85 },
  snow:     { windMul: 0.70, damp: 0.45, rain: 0.10, verbMul: 0.55 }, // snow absorbs
  fog:      { windMul: 0.55, damp: 0.60, rain: 0.00, verbMul: 1.25 },
};

/* ═══════════════════════════════════════════════════════════════════════════
   3c. TELEMETRY ALIASES FOR THE NEW METHODS
   ───────────────────────────────────────────────────────────────────────────
   The sim agent is adding blow counts, N-values, sample recovery, deviation,
   round pull and bolt torque to the drill telemetry in parallel with this
   file. We do not know which spelling will land, so every field is accepted
   under several names and NONE of them is required — each has a default that
   keeps the method sounding correct if the sim never writes it at all.

   The list is a flat array of [incomingName, canonicalName] pairs rather than
   an object, because ingest() runs every frame and Object.keys() allocates.
   ═══════════════════════════════════════════════════════════════════════════ */
const TEL_ALIASES = [
  ['blows', 'blowCount'], ['hammerBlows', 'blowCount'], ['blowsThisIncrement', 'blowCount'],
  ['spt', 'nValue'], ['sptN', 'nValue'], ['nSpt', 'nValue'], ['nvalue', 'nValue'], ['Nvalue', 'nValue'],
  ['recovery', 'sampleRecovery'], ['sampleQuality', 'sampleRecovery'], ['coreRecovery', 'sampleRecovery'],
  ['contaminated', 'contamination'], ['sampleContamination', 'contamination'], ['wetSample', 'contamination'],
  ['toeDeviation', 'deviation'], ['holeDeviation', 'deviation'], ['deviation01', 'deviation'],
  ['pull', 'roundPull'], ['pullPerRound', 'roundPull'], ['advancePerRound', 'roundPull'],
  ['torqueTest', 'boltTorque'], ['boltPreload', 'boltTorque'], ['anchorage', 'boltTorque'],
  ['resin', 'resinMix'], ['grout', 'resinMix'], ['mixing', 'resinMix'],
  ['hold', 'holdTime'], ['holdTimer', 'holdTime'], ['resinHold', 'holdTime'],
  ['energy', 'hammerEnergy'], ['ramEnergy', 'hammerEnergy'], ['hammerEnergy01', 'hammerEnergy'],
  ['blowsPerMin', 'blowRate'], ['blowsPerMinute', 'blowRate'], ['bpm', 'blowRate'],
  ['set', 'setMm'], ['setPerBlow', 'setMm'], ['penetrationPerBlow', 'setMm'],
  ['holeNumber', 'holeIndex'], ['holeNo', 'holeIndex'], ['hole', 'holeIndex'],
  ['vent', 'ventilation'], ['ventilation01', 'ventilation'],
  ['pileLen', 'pileLength'], ['pileEmbedment', 'embedment'], ['embed', 'embedment'],
  ['siMode', 'pushMode'], ['probeMode', 'pushMode'], ['testMode', 'pushMode'],
  ['pileMaterial', 'pileType'], ['pileKind', 'pileType'],
  ['toeDamage01', 'toeDamage'], ['broom', 'toeDamage'], ['toeBroom', 'toeDamage'],
  ['holdUp01', 'holdUp'], ['carryOver', 'holdUp'], ['carryOver01', 'holdUp'],
  ['wet01', 'wet'], ['sampleWet', 'wet'],
  ['upHole', 'uphole'], ['isUphole', 'uphole'],
  ['deviationCue01', 'devCue'], ['devCue01', 'devCue'],
  ['driving01', 'driving'], ['isDriving', 'driving'],
  ['power', 'powerMode'], ['supply', 'powerMode'],
];
/** Telemetry fields that carry a string, not a number. */
const TEL_STRINGS = { pushMode: 1, pileType: 1, powerMode: 1, phase: 1 };

/* ═══════════════════════════════════════════════════════════════════════════
   3d. THE PROGRAMME BLOCK — READING WHAT THE SIM ACTUALLY PUBLISHES
   ───────────────────────────────────────────────────────────────────────────
   §3c was written before the sim landed, against names we guessed at. The sim
   landed, and it does not publish the six methods' state as flat fields at all:
   it publishes `telemetry.programme`, one nested object whose SHAPE depends on
   `programme.kind`, with its own vocabulary — `setMmPerBlow`, `toeDamage01`,
   `recovery01`, `pull01`, `deviationCue01`, `blowsThisIncrement`.

   Without this table every one of the six new voices runs on the DEFAULTS in
   `tel` and hears nothing the player is doing. Measured before it existed: an
   RC hole ran 90 s at cycloneWet 0.000 with the sim reporting real
   contamination, and a pile ran the whole hole at pileRefusal 0.000 through a
   bearing stratum. The voices were correct and deaf.

   FORMAT. One flat array of alternating source/destination names per kind —
   flat rather than pairs because ingestProgramme() runs every frame and an
   array of arrays is one more indirection per field for no benefit. Numbers
   only; booleans, strings and anything needing a scale factor are handled
   explicitly in ingestProgramme(), where the reasoning is visible.

   NOTHING HERE IS REQUIRED. Every destination has a default in `tel` that
   keeps the method sounding correct on its own, so a sim that stops publishing
   a field degrades to the pre-existing derived behaviour rather than to
   silence — which is the same contract §3c has always kept.

   `wear` is deliberately NOT a destination anywhere below. Three programmes
   publish a wear-shaped number (trainWear01, headDamage01, coneDamage01) and
   none of them is the BIT, which is what `tel.wear` means to §11–§13. Letting
   pile head damage arrive as bit wear would quietly detune the rotation voice
   on a rig that does not rotate.
   ═══════════════════════════════════════════════════════════════════════════ */
const PROG_NUM = {
  rc: ['recovery01', 'sampleRecovery', 'contamination01', 'contamination',
       'holdUp01', 'holdUp', 'wet01', 'wet', 'bagsCut', 'holeIndex'],
  jumbo: ['pull01', 'roundPull', 'holesDone', 'holeIndex', 'lookout01', 'devCue'],
  // intoHoleM, not depth: an ITH hammer is at the bottom of THIS hole, so the
  // rod string the blow travels up is the hole, never the metres drilled.
  longhole: ['deviationCue01', 'devCue', 'holeIndex', 'holeIndex', 'intoHoleM', 'depth'],
  rockbolt: ['lastAnchorage01', 'boltTorque', 'boltIndex', 'holeIndex', 'intoHoleM', 'depth'],
  // setMmPerBlow is the MEASURED set — the instrument that lies. That is the
  // correct thing to hand the refusal derivation, because the player's gauge
  // is lying by exactly the same amount. toeDamage01 is the honest one, and it
  // is kept separate on purpose (§13b-5, THE BROOM).
  'driven-pile': ['setMmPerBlow', 'setMm', 'blowRateBpm', 'blowRate',
                  'toeDamage01', 'toeDamage', 'blows', 'blowCount',
                  'rakeDeg', 'deviation', 'toeDepthM', 'embedment'],
  spt: ['blowsThisIncrement', 'blowCount', 'increment', 'holeIndex'],
  cpt: ['readings', 'blowCount'],
};

/** The pile's energy hyperbola in real units — see §13b-5. 12 kNm is the light
 *  end of the envelope and 235 kNm the heavy end, so this maps the sim's
 *  `energyKnm` onto the audio's 0..1 `hammerEnergy` without either side having
 *  to know the other's scale. */
const PILE_KNM_MIN = 12, PILE_KNM_SPAN = 223;

/* ═══════════════════════════════════════════════════════════════════════════
   4. MUSIC THEORY TABLES
   ───────────────────────────────────────────────────────────────────────────
   D Aeolian with a Dorian lift. Nordic + industrial: minor, modal, no leading
   tone, fourths and fifths rather than thirds. Root D2 = 73.416 Hz — the
   fundamental is below the speaker, which is fine: the pad's harmonics and the
   bass pluck's 2nd/3rd carry it.
   ═══════════════════════════════════════════════════════════════════════════ */
const ROOT_HZ = 73.4162;                                  // D2
const AEOLIAN = [0, 2, 3, 5, 7, 8, 10];                   // natural minor
const DORIAN  = [0, 2, 3, 5, 7, 9, 10];                   // raised 6th — lifts at high intensity
const semi = (n) => Math.pow(2, n / 12);

/**
 * Chord plan. Each entry: [scaleDegreeRoot, quality, bars].
 * Progression A (low intensity):  i – VI – III – VII   (Dm – Bb – F – C)
 * Progression B (high intensity): i – iv – VII – VI    (Dm – Gm – C – Bb)
 * Voiced in fourths/fifths, no thirds in the bass — keeps it industrial.
 */
const PROG_CALM  = [[0, 'min', 2], [5, 'maj', 2], [2, 'maj', 2], [6, 'maj', 2]];
const PROG_DRIVE = [[0, 'min', 2], [3, 'min', 2], [6, 'maj', 1], [5, 'maj', 1]];
const CHORD_TONES = { min: [0, 7, 15, 19], maj: [0, 7, 16, 19], sus: [0, 5, 12, 17] };

/** The lead motif: scale-degree offsets and rhythmic weight. Restrained. */
const LEAD_MOTIF = [
  { deg: 4, beats: 2 }, { deg: 6, beats: 1 }, { deg: 7, beats: 3 },
  { deg: -1, beats: 2 },                                   // -1 = rest
  { deg: 5, beats: 2 }, { deg: 4, beats: 2 }, { deg: 2, beats: 4 },
  { deg: -1, beats: 4 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   5. HAPTIC PATTERNS  (ms on/off pairs for navigator.vibrate)
   Kept deliberately short — a phone motor takes ~15 ms to spin up, so anything
   under 10 ms is felt as nothing. These are tuned to land ON the audio
   transient, not after it.
   ═══════════════════════════════════════════════════════════════════════════ */
const HAPTICS = {
  light:   [10],
  medium:  [22],
  heavy:   [38, 26, 62],
  success: [16, 42, 16, 42, 46],
  fail:    [64, 46, 64],
  blow:    [8],
  detent:  [6],
  impact:  [30],
  snap:    [12, 24, 46],
};

/* ═══════════════════════════════════════════════════════════════════════════
   6. DSP BAKERY — everything below writes raw samples into AudioBuffers.
   All synchronous, all deterministic, no OfflineAudioContext (which is async
   and historically flaky on iOS Safari). ~40 ms total on a mid phone, run once
   inside the unlock() gesture.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * White / pink / brown noise, loop-safe.
 *  - white : uniform, loops perfectly (a discontinuity in noise is more noise).
 *  - pink  : Paul Kellet's economy filter (−3 dB/oct). The natural spectrum of
 *            wind, air flush and machine hiss.
 *  - brown : leaky integrator (−6 dB/oct) for rumble beds. DC-removed and
 *            wrap-crossfaded over 40 ms, because integrated noise drifts and a
 *            drift discontinuity at the loop point IS audible as a thump.
 */
function bakeNoise(ac, seconds, channels, kind, seed) {
  const sr = ac.sampleRate;
  const n = Math.max(1, Math.floor(seconds * sr));
  const buf = ac.createBuffer(channels, n, sr);
  for (let c = 0; c < channels; c++) {
    const d = buf.getChannelData(c);
    const rnd = prng(seed + c * 7919);
    if (kind === 'white') {
      for (let i = 0; i < n; i++) d[i] = rnd() * 2 - 1;
    } else if (kind === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < n; i++) {
        const w = rnd() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else { // brown
      let last = 0;
      for (let i = 0; i < n; i++) {
        const w = rnd() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
      // DC removal
      let mean = 0;
      for (let i = 0; i < n; i++) mean += d[i];
      mean /= n;
      for (let i = 0; i < n; i++) d[i] -= mean;
      // wrap crossfade so loop() is seamless
      const xf = Math.min(Math.floor(sr * 0.04), n >> 2);
      for (let i = 0; i < xf; i++) {
        const t = i / xf;
        d[i] = d[i] * t + d[n - xf + i] * (1 - t);
      }
    }
    // Peak-normalise so downstream gain staging is predictable.
    let peak = 0;
    for (let i = 0; i < n; i++) { const a = d[i] < 0 ? -d[i] : d[i]; if (a > peak) peak = a; }
    if (peak > EPS) { const g = 0.92 / peak; for (let i = 0; i < n; i++) d[i] *= g; }
  }
  return buf;
}

/**
 * Convolution impulse response, generated from decaying noise plus discrete
 * echo taps.
 *
 *   h[n] = predelay · [ diffuse(n) · e^(−decay·n/N) + Σ_k tapGain_k · burst_k ]
 *
 * then shaped by a one-pole LP (air absorption / material darkness) and a
 * one-pole HP (rooms do not have DC). L and R use different PRNG streams so
 * the reverb is genuinely stereo-decorrelated rather than a mono blur.
 *
 * `diffusion` < 1 thins the noise into sparse discrete reflections, which is
 * how you get an alpine valley instead of a shower cubicle.
 */
function bakeIR(ac, r) {
  const sr = ac.sampleRate;
  const n = Math.max(64, Math.floor(r.seconds * sr));
  const pre = Math.floor((r.predelayMs / 1000) * sr);
  const buf = ac.createBuffer(2, n + pre, sr);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    const rnd = prng(r.seed + c * 104729);
    // one-pole coefficients
    const lpA = Math.exp(-TAU * r.lpHz / sr);
    const hpA = Math.exp(-TAU * r.hpHz / sr);
    let lpZ = 0, hpZ = 0;
    const density = clamp(r.diffusion, 0.05, 1);
    for (let i = 0; i < n; i++) {
      // exponential energy decay; r.decay is the number of e-foldings over the tail
      const envv = Math.exp(-r.decay * (i / n));
      let x = 0;
      if (rnd() < density) x = (rnd() * 2 - 1) * envv;
      // one-pole LP (darkness) then one-pole HP (remove rumble)
      lpZ = x * (1 - lpA) + lpZ * lpA;
      const lo = lpZ;
      hpZ = lo * (1 - hpA) + hpZ * hpA;
      d[i + pre] = lo - hpZ;
    }
    // discrete echo taps — each a short decaying noise burst, slightly
    // decorrelated between channels so the slap-back has width
    if (r.echoes) {
      for (let k = 0; k < r.echoes.length; k++) {
        const [tSec, g] = r.echoes[k];
        const off = pre + Math.floor((tSec + (c ? 0.0031 : 0)) * sr);
        const len = Math.floor(sr * 0.035);
        for (let i = 0; i < len && off + i < d.length; i++) {
          d[off + i] += (rnd() * 2 - 1) * g * Math.exp(-6 * (i / len));
        }
      }
    }
    // normalise to a fixed RMS so switching regions does not jump the wet level
    let rms = 0;
    for (let i = 0; i < d.length; i++) rms += d[i] * d[i];
    rms = Math.sqrt(rms / d.length);
    if (rms > EPS) { const g = 0.055 / rms; for (let i = 0; i < d.length; i++) d[i] *= g; }
  }
  return buf;
}

/**
 * TAIL GUARD — force a baked buffer's tail to true silence.
 *
 * Modal decays are exponential and therefore never actually reach zero. If the
 * buffer ends while the tail is still at, say, −10 dB, the hard cut is an
 * audible click and a short fade only turns the click into a chirp. Every
 * baked body below is therefore (a) given a decay constant short enough that
 * the natural tail is under −30 dB by the buffer's end, and (b) multiplied by
 * a raised-cosine window over its last 12 % so the residue is taken to exact
 * zero smoothly. Cost: one pass over 12 % of the samples.
 */
function tailGuard(d, sr, fracOrSec) {
  const n = d.length;
  const w = fracOrSec <= 1 ? Math.floor(n * fracOrSec) : Math.floor(fracOrSec * sr);
  const len = Math.max(1, Math.min(w, n));
  for (let i = 0; i < len; i++) {
    // raised cosine 1 → 0 across the window
    const t = i / len;
    d[n - len + i] *= 0.5 * (1 + Math.cos(Math.PI * t));
  }
}

/**
 * THE DRILL STRING RESONATOR — modal synthesis.
 *
 *   y[n] = Σ_k  a_k · e^(−n/(τ_k·sr)) · sin(2π f_k n / sr)
 *
 * A drill string is a long steel bar excited longitudinally at one end. A
 * free-free bar's transverse modes sit at ratios 1 : 2.756 : 5.404 : 8.933 :
 * 13.34 — strongly inharmonic, which is exactly why struck steel sounds
 * metallic rather than pitched. We use those ratios plus two "coupling" modes
 * from the hammer body and the shank adapter.
 *
 * Higher partials decay faster (τ ∝ 1/f^0.55), which is physically correct
 * (radiation + internal damping both rise with frequency) and is what makes the
 * ring "close down" into a hum instead of staying bright.
 *
 * The first 2.5 ms is excited with noise, not a click: a carbide button hitting
 * rock is not a Dirac impulse, it is a crushing event.
 *
 * DECAY BUDGET: the buffer must outlast its own tail. decaySec is chosen so
 * that seconds/decaySec >= 3.7 (i.e. the fundamental mode is below −32 dB by
 * the buffer's end), then tailGuard() takes the residue to exact zero. A top
 * hammer at 50 blows/s re-strikes every 20 ms, so a SHORT tau (0.20 s) is not
 * a compromise — it is what a string being hit fifty times a second actually
 * does, each blow damping the last.
 *
 * Baked ONCE at a reference pitch. Depth/rod-count pitch shifting is done at
 * playback with playbackRate — which shifts pitch AND stretches decay together,
 * exactly the coupled behaviour a longer string has. See blowPlaybackRate().
 */
function bakeRing(ac, f0, seconds, decaySec, seed, brightness) {
  const sr = ac.sampleRate;
  const n = Math.floor(seconds * sr);
  const buf = ac.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  const rnd = prng(seed);
  const ratios = [1, 2.756, 5.404, 8.933, 13.34, 1.41, 3.72];
  const amps   = [1.0, 0.62, 0.34, 0.19, 0.10, 0.28, 0.16];
  const excite = Math.floor(sr * 0.0025);

  for (let k = 0; k < ratios.length; k++) {
    const f = f0 * ratios[k];
    if (f > sr * 0.45) continue;                       // above Nyquist guard
    const tau = decaySec / Math.pow(ratios[k], 0.55);  // HF decays faster
    const w = TAU * f / sr;
    const dampCoef = Math.exp(-1 / (tau * sr));
    // recursive complex rotation: 2 mults/sample, no trig in the inner loop
    const cw = Math.cos(w) * dampCoef, sw = Math.sin(w) * dampCoef;
    let re = 0, im = 0;
    const a = amps[k] * Math.pow(brightness, k * 0.35) * (0.8 + rnd() * 0.4);
    for (let i = 0; i < n; i++) {
      // inject the crushing excitation into every mode for the first 2.5 ms
      const drive = i < excite ? (rnd() * 2 - 1) * (1 - i / excite) : 0;
      const nre = re * cw - im * sw + drive;
      const nim = re * sw + im * cw;
      re = nre; im = nim;
      d[i] += im * a;
    }
  }
  // 1.2 ms fade-in kills the DC step; tailGuard takes the tail to true zero
  const fi = Math.floor(sr * 0.0012);
  for (let i = 0; i < fi; i++) d[i] *= i / fi;
  tailGuard(d, sr, 0.12);
  let peak = 0;
  for (let i = 0; i < n; i++) { const v = d[i] < 0 ? -d[i] : d[i]; if (v > peak) peak = v; }
  if (peak > EPS) { const g = 0.9 / peak; for (let i = 0; i < n; i++) d[i] *= g; }
  return buf;
}

/**
 * ROCK IMPACT TRANSIENT — one per rock class.
 *
 * Two summed elements:
 *   1. "thump"  — a 55–90 Hz sine with a 25–60 ms decay: the ground moving.
 *                 Inaudible as pitch on a phone, but its harmonics from the
 *                 master soft-clipper give weight.
 *   2. "crack"  — noise through a 2-pole resonant bandpass at the class's
 *                 crackF with a 4–22 ms decay: the actual fracture.
 *   3. "splinter" — a very short (1.5–6 ms) burst of highpassed noise at
 *                 4–9 kHz. This is the single most important element for
 *                 "granite" — it is what makes a blow read as brittle.
 *
 * Total length 90 ms. These are the accents, not the sustain.
 */
function bakeCrack(ac, cls, seed) {
  const sr = ac.sampleRate;
  const n = Math.floor(sr * 0.09);
  const buf = ac.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  const rnd = prng(seed);

  // 1. thump — decaying sine, pitch drops an octave over its life (real impacts
  //    lose stiffness as the contact patch spreads)
  const thumpF = mixf(88, 56, cls.thump);
  // 90 ms buffer / 3.75 = 24 ms max time constant, so even the softest, longest
  // thump is under −32 dB before the buffer ends.
  const thumpDec = mixf(0.011, 0.024, cls.thump);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const e = Math.exp(-t / thumpDec);
    ph += TAU * (thumpF * (0.55 + 0.45 * e)) / sr;
    d[i] += Math.sin(ph) * e * cls.thump * 0.55;
  }

  // 2. crack — resonant bandpass on a noise burst (2-pole state-variable)
  const f = cls.crackF, Q = cls.crackQ;
  const w = TAU * f / sr;
  const g = Math.tan(w / 2);
  const k = 1 / Q;
  const a1 = 1 / (1 + g * (g + k)), a2 = g * a1, a3 = g * a2;
  let ic1 = 0, ic2 = 0;
  const crackDec = mixf(0.022, 0.005, cls.splinter);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const x = (rnd() * 2 - 1) * Math.exp(-t / crackDec);
    const v3 = x - ic2;
    const v1 = a1 * ic1 + a2 * v3;
    const v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2;
    d[i] += v1 * 0.8 * Q;                     // v1 = bandpass output
  }

  // 3. splinter — ultra-short bright noise, one-pole highpassed
  const spDec = 0.0045;
  const hpA = Math.exp(-TAU * 4200 / sr);
  let hz = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const x = (rnd() * 2 - 1) * Math.exp(-t / spDec);
    hz = x * (1 - hpA) + hz * hpA;
    d[i] += (x - hz) * cls.splinter * 0.75;
  }

  tailGuard(d, sr, 0.12);
  let peak = 0;
  for (let i = 0; i < n; i++) { const v = d[i] < 0 ? -d[i] : d[i]; if (v > peak) peak = v; }
  if (peak > EPS) { const gg = 0.95 / peak; for (let i = 0; i < n; i++) d[i] *= gg; }
  return buf;
}

/**
 * GENERIC METAL BODY — used by boulder strike, bit break, rod add, casing set,
 * collapse and the grade stamp. Same modal engine as the drill string but with
 * a squatter, denser mode set (a lump of steel, not a bar) and a controllable
 * inharmonicity so one baker serves "clang", "snap" and "stamp".
 */
function bakeMetal(ac, f0, seconds, decaySec, inharm, seed) {
  const sr = ac.sampleRate;
  const n = Math.floor(seconds * sr);
  const buf = ac.createBuffer(1, n, sr);
  const d = buf.getChannelData(0);
  const rnd = prng(seed);
  const M = 9;
  const excite = Math.floor(sr * 0.0015);
  for (let k = 0; k < M; k++) {
    // ratios drift from harmonic (inharm 0) toward stretched-metal (inharm 1)
    const harmonic = k + 1;
    const stretched = Math.pow(k + 1, 1.44) * (1 + 0.06 * rnd());
    const ratio = mixf(harmonic, stretched, inharm);
    const f = f0 * ratio;
    if (f > sr * 0.45) continue;
    const tau = decaySec / Math.pow(ratio, 0.62);
    const dampCoef = Math.exp(-1 / (tau * sr));
    const w = TAU * f / sr;
    const cw = Math.cos(w) * dampCoef, sw = Math.sin(w) * dampCoef;
    let re = 0, im = 0;
    const a = (1 / Math.pow(k + 1, 0.85)) * (0.7 + rnd() * 0.6);
    for (let i = 0; i < n; i++) {
      const drive = i < excite ? (rnd() * 2 - 1) * (1 - i / excite) : 0;
      const nre = re * cw - im * sw + drive;
      const nim = re * sw + im * cw;
      re = nre; im = nim;
      d[i] += im * a;
    }
  }
  const fi = Math.floor(sr * 0.001);
  for (let i = 0; i < fi; i++) d[i] *= i / fi;
  tailGuard(d, sr, 0.12);
  let peak = 0;
  for (let i = 0; i < n; i++) { const v = d[i] < 0 ? -d[i] : d[i]; if (v > peak) peak = v; }
  if (peak > EPS) { const g = 0.9 / peak; for (let i = 0; i < n; i++) d[i] *= g; }
  return buf;
}

/* ── Waveshaper curves ───────────────────────────────────────────────────── */

/**
 * Soft saturation for engine grit. asinh-style: linear at low level, gently
 * compressive above, odd-symmetric so it makes 3rd/5th harmonics (warm) rather
 * than 2nd (buzzy). `drive` 1..8.
 */
function makeSaturationCurve(drive, len) {
  const c = new Float32Array(len);
  const k = drive;
  for (let i = 0; i < len; i++) {
    const x = (i / (len - 1)) * 2 - 1;
    c[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return c;
}

/**
 * PSYCHOACOUSTIC BASS — Chebyshev harmonic exciter.
 * Feeding cos(θ) through the Chebyshev polynomial T_n yields exactly cos(nθ).
 * So a weighted sum Σ w_n·T_n(x) applied to a pure sine at the engine's firing
 * frequency f synthesises f, 2f, 3f, 4f, 5f at controlled amplitudes. We weight
 * toward 3f–5f (which for a 40–105 Hz fire rate lands at 120–525 Hz — right at
 * the bottom edge of what a phone can actually move) and let the ear infer the
 * missing fundamental below.
 */
function makeExciterCurve(len) {
  const c = new Float32Array(len);
  const w = [0.00, 0.18, 0.34, 0.30, 0.18];   // weights for T1..T5
  for (let i = 0; i < len; i++) {
    const x = (i / (len - 1)) * 2 - 1;
    const x2 = x * x, x3 = x2 * x, x4 = x3 * x, x5 = x4 * x;
    const T1 = x;
    const T2 = 2 * x2 - 1;
    const T3 = 4 * x3 - 3 * x;
    const T4 = 8 * x4 - 8 * x2 + 1;
    const T5 = 16 * x5 - 20 * x3 + 5 * x;
    c[i] = w[0] * T1 + w[1] * T2 + w[2] * T3 + w[3] * T4 + w[4] * T5;
  }
  // remove DC (T2 and T4 have non-zero mean) so we do not offset the bus
  let mean = 0;
  for (let i = 0; i < len; i++) mean += c[i];
  mean /= len;
  for (let i = 0; i < len; i++) c[i] -= mean;
  return c;
}

/**
 * The master ceiling. tanh(1.9x)/tanh(1.9) scaled to 0.97 — memoryless, so it
 * cannot overshoot, cannot pump, and adds only gentle odd harmonics on the very
 * loudest transients (which on a phone speaker reads as "loud", not "broken").
 */
function makeCeilingCurve(len) {
  const c = new Float32Array(len);
  const k = 1.9, nrm = Math.tanh(k);
  for (let i = 0; i < len; i++) {
    const x = (i / (len - 1)) * 2 - 1;
    c[i] = (Math.tanh(k * x) / nrm) * 0.97;
  }
  return c;
}

/**
 * BANDLIMITED PULSE for the diesel firing train.
 *
 * A diesel cylinder fires as a short, violent pressure pulse. A rectangular
 * pulse of duty d has Fourier magnitudes |a_n| = |sin(nπd)| / (nπd). At d=0.11
 * the first null is at the 9th harmonic, so the spectrum is dense and flat-ish
 * across harmonics 1–8 then rolls — a bark, not a hum.
 *
 * We additionally apply 1/n^0.32 so the very high harmonics do not alias into
 * fizz at 105 Hz × 40 = 4.2 kHz.
 *
 * At a firing frequency of 39 Hz (idle) harmonics 8–128 span 312 Hz – 5 kHz:
 * the ENTIRE audible-on-phone band is periodic at 39 Hz. That periodicity is
 * what the ear reads as a big slow engine even though nothing below 300 Hz
 * survives the speaker.
 */
function makeDieselWave(ac, duty, harmonics) {
  const N = harmonics + 1;
  const real = new Float32Array(N);
  const imag = new Float32Array(N);
  for (let n = 1; n < N; n++) {
    const x = n * Math.PI * duty;
    const sinc = x === 0 ? 1 : Math.sin(x) / x;
    imag[n] = (sinc * (2 * duty)) / Math.pow(n, 0.32);
  }
  return ac.createPeriodicWave(real, imag, { disableNormalization: false });
}

/**
 * PERCUSSION TRAIN WAVE — the continuous hammer.
 * A much narrower pulse (duty 0.035) than the diesel: a hammer blow is ~1 ms of
 * contact in a 16–50 ms period. Narrow duty = very dense harmonic series = a
 * blow train that reads as blows rather than as a tone, at zero per-blow node
 * cost. The resonant filter bank downstream turns this into steel.
 */
function makeHammerWave(ac, harmonics) {
  const N = harmonics + 1;
  const real = new Float32Array(N);
  const imag = new Float32Array(N);
  const duty = 0.035;
  for (let n = 1; n < N; n++) {
    const x = n * Math.PI * duty;
    const sinc = x === 0 ? 1 : Math.sin(x) / x;
    imag[n] = (sinc * (2 * duty)) / Math.pow(n, 0.18);
  }
  return ac.createPeriodicWave(real, imag, { disableNormalization: false });
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. THE SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */

export function createAudio(ctx) {
  /* ── lifecycle flags ─────────────────────────────────────────────────── */
  let ac = null;                 // AudioContext — created ONLY in unlock()
  let built = false;             // graph constructed
  let failed = false;            // context creation threw; stay a no-op forever
  let disposed = false;
  let suspendedByVisibility = false;
  const unsubs = [];

  /* ── mix state (valid even before unlock, so intent is never lost) ────── */
  const busUser = { master: 1, sfx: 1, music: 1, ambience: 1 };
  const busSettings = { sfx: 0.85, music: 0.5, ambience: 0.85 };
  let duckUntil = 0;             // ctx-time until which duckFor() holds
  let duckAmount = 1;            // smoothed 0..1 multiplier applied to music+amb

  /* ── world state ─────────────────────────────────────────────────────── */
  let regionId = 'nordic';
  let weatherId = 'clear';
  let engineOn = false;
  let engineRigId = null;
  let methodId = 'top-hammer';
  let method = METHOD_DEFAULT;
  let sceneId = 'boot';

  /* ── telemetry ───────────────────────────────────────────────────────────
     `tel` is the single source of truth for every continuous voice. It is
     written by setDrillState() (preferred — the integrator calls it) and, if
     the integrator has been silent for > 0.5 s, back-filled from
     ctx.state.drill so the audio still tracks a sim that only writes state.
     ───────────────────────────────────────────────────────────────────────── */
  const tel = {
    active: false, depth: 0, target: 30, rop: 0,
    wob: 0.5, rpm: 0.5, flush: 0.5,
    torque: 0, wear: 0, heat: 0, stability: 1, jam: 0,
    rods: 1, stratumIndex: 0, inGreenBand: false, greenBandTime: 0,
    combo: 0, ucs: 60, abrasivity: 0.5,

    /* ── the six new methods. Every default is chosen so that a sim which
       never writes the field still produces the correct sound:
         sampleRecovery 1  — assume the sample is good until told otherwise
         contamination  0  — assume the seal is holding
         roundPull      1  — assume a full round
         setMm         25  — assume the pile is running free (25 mm/blow)
         ventilation 0.55  — a heading is always ventilated
         hammerEnergy 0.5  — mid-stroke; the hyperbola in stepPile() derives
                             the blow rate from it if blowRate is absent
         pushMode  'spt'   — SPT unless the sim says CPT

       ── AND THE SECOND WAVE (§3d) ──────────────────────────────────────
       Every one of these is defaulted to the value that makes the method
       sound RIGHT rather than to zero, for the same reason as above. The
       three that are not obvious:
         toeDamage 0 — assume the pile is intact. The broom tell (§13b-5) is
                       purely additive, so a sim that never publishes it
                       leaves pile_blow byte-identical to what shipped.
         driving true — assume the machine is working. The SPT scheduler gates
                       on it, and a `false` default would silence the method
                       outright the moment the sim stopped publishing.
         powerMode '' — empty means DERIVE it (§13b-2b). Not 'diesel': a
                       default of 'diesel' would peg a jumbo to its tramming
                       engine and the mains transfer would never be heard.
       THE gustDepth LESSON. Every field here is read through clamp() or
       Number.isFinite() at the point of use and every one has a defined
       default, because the last time a parameter in this file had neither,
       Math.max(0.1, undefined) put a NaN into a filter frequency and the
       whole ambience chain went silent for the rest of the session. See
       api.debug.assertFinite(), which is the standing check against it.     */
    blowCount: 0, nValue: 0, sampleRecovery: 1, contamination: 0,
    deviation: 0, roundPull: 1, boltTorque: 0, resinMix: 0, holdTime: 0,
    hammerEnergy: 0.5, blowRate: 0, setMm: 25, refusal: 0,
    holeIndex: 0, ventilation: 0.55, underground: false,
    pileLength: 20, embedment: 0,
    pushMode: 'spt', pileType: 'steel',
    toeDamage: 0, holdUp: 0, wet: 0, devCue: 0,
    uphole: false, driving: true, torquePending: false,
    powerMode: '', phase: '', beatT: 0, beatDur: 0,
  };
  let lastExternalTel = -1e9;

  /* ── derived / smoothed audio-side model state (no allocation per frame) ─ */
  const m = {
    // engine governor
    load: 0.1, loadTarget: 0.1,
    rpm01: 0.14, rpmVel: 0, rpmTarget: 0.14,
    fireHz: 40,
    // hydraulic
    hydPress: 0, hydTarget: 0,
    loadPrev: 0.1,
    // air
    airFlow: 0, airTarget: 0,
    // rotation
    shaftHz: 0, shaftTarget: 0,
    // percussion
    blowHz: 0, blowTarget: 0, percOn: 0, percTarget: 0,
    accentPhase: 0, accentDiv: 4, accentRate: 0,
    lastImpactAt: -1e9,
    ringRate: 1,
    rockIdx: 2,
    // flush / annulus
    annulus: 0, annulusTarget: 0,
    flushBright: 1, chokeAM: 0,
    // music
    intensity: 0, intensityTarget: 0,
    groove: 0,
    // global
    masterSmooth: 1,
    hazard: 0,

    /* ── the six new methods ──────────────────────────────────────────────
       Every one of these is a SMOOTHED audio-side value, never a raw
       telemetry read, so that no AudioParam ever takes a step. */
    ug: 0, ugTarget: 0,          // underground bed presence 0..1
    ventBoost: 0,                // vent swell after a blast, decays over ~12 s
    cyWet: 0,                    // RC: the contamination tell (leads the gauge)
    cyRoar: 0,                   // RC: cyclone air-flow level
    slugT: 0,                    // RC: countdown to the next splitter slug
    jbWander: [0, 0],            // jumbo: per-drifter rate wander
    jbWanderT: [0, 0],
    ithDelay: 0.004, ithLP: 3200,// longhole: downhole path
    boMix: 0,                    // rockbolt: resin mixing level
    boWasMixing: 0,
    plPhase: 0, plRate: 0,       // driven pile: blow scheduler
    plEnergy: 0.5, plRefusal: 0,
    siPhase: 0, siRate: 0,       // site investigation: SPT drop scheduler
    siCreakT: 0,
    cpt: 0,                      // 1 while a CPT push is running
    quiet: 0,                    // how much the mix should stand back (CPT)
    discrete: 0, dBlowHz: 0,     // discrete-hammer activity + rate
    methodHazard: 0,             // per-method contribution to musical tension
    lastHoleIndex: -1,
    lastMetre: -1,               // RC: last whole metre sampled
    ringExtra: 1,                // extra depth sag on the string ring (ITH)

    /* ── second wave (§3d and below). Same rule: SMOOTHED, never a raw read,
       and every one initialised here so no AudioParam can ever be handed an
       undefined. ─────────────────────────────────────────────────────────── */
    cyChoke: 0,                  // RC: carry-over choking the cyclone
    mains: 0, mainsWant: 0,      // jumbo: 0 = diesel, 1 = mains electric
    mainsHold: 0,                // debounce timer on the transfer
    elSpin: 0,                   // jumbo: electric motor spin-up 0..1
    // The prime mover the hydraulic pack is hung off (§13b-2b). Seeded to the
    // diesel's own idle values so stepHydraulic() reads something correct on
    // the very first frame, before stepPower() has ever run.
    driveHz: 40, driveSpd: 0.14,
    upHole: 0,                   // longhole: 0 = downhole, 1 = uphole
    boHold: 0, boHoldWas: 0,     // rockbolt: the gel/hold clock
    boHoldLeft: 1,               // ... and how much of it is left, 1 → 0
    boHoldT: 0,                  // ... and how long it has actually run, sec
    plBroom: 0,                  // driven pile: toe damage, smoothed
    siDrive: 1,                  // site investigation: the drive is running
  };

  /* ── baked buffers (filled in build()) ───────────────────────────────── */
  const B = {
    white: null, pink: null, brown: null,
    ring: null,                 // drill string @ RING_REF_HZ
    ringDTH: null,              // heavier, lower string for down-the-hole
    cracks: [],                 // one per ROCK_CLASSES entry
    metalClang: null,           // boulder / casing
    metalSnap: null,            // bit break
    metalThread: null,          // rod thread engage
    metalStamp: null,           // grade stamp
    irs: {},                    // regionId -> AudioBuffer (capped, see irOrder)
    // Lazily baked, per-method (see ensureVoiceBuffers). Baking all of these
    // up front would add ~18 ms to unlock() for methods most sessions never
    // touch, so they are baked on the scene transition that selects the
    // method — exactly like the region impulse responses.
    pileSteel: null,            // driven-pile: the pile's own longitudinal ring
    pileConcrete: null,         // driven-pile: precast concrete, heavily damped
    anvil: null,                // site-investigation: SPT anvil / drive head
    ugIR: null,                 // underground room (also cached in B.irs)
    dieselWave: null,
    hammerWave: null,
    satCurve: null,
    satCurveHot: null,
    exciterCurve: null,
    ceilingCurve: null,
  };
  const RING_REF_HZ = 520;      // reference pitch the ring buffer is baked at
  const irOrder = [];           // LRU order for the impulse-response cache

  /* ── graph nodes ─────────────────────────────────────────────────────── */
  let masterGain, ceiling, makeup, limiter, presence, glueComp, hpfMaster, preMaster;
  let sfxBus, musicBus, ambBus, musicDuck, ambDuck;
  let convolver, reverbSend, reverbReturn;
  let hasPanner = false;

  /* ═══════════════════════════════════════════════════════════════════════
     7a. TINY NODE HELPERS
     ═══════════════════════════════════════════════════════════════════════ */

  const now = () => (ac ? ac.currentTime : 0);

  function gain(v) { const g = ac.createGain(); g.gain.value = v; return g; }

  function filt(type, f, Q, gainDb) {
    const b = ac.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    if (Q !== undefined) b.Q.value = Q;
    if (gainDb !== undefined) b.gain.value = gainDb;
    return b;
  }

  function shaper(curve, oversample) {
    const w = ac.createWaveShaper();
    w.curve = curve;
    try { w.oversample = oversample || '2x'; } catch (e) { /* older impls */ }
    return w;
  }

  /**
   * Stereo placement. StereoPannerNode is missing on some older WebKit builds,
   * so we fall back to a plain gain (mono). Deliberately subtle: a phone
   * speaker is mono anyway, and on headphones anything wider than ±0.5 makes
   * the rig feel like it is standing next to you rather than in front.
   */
  function pan(p) {
    if (hasPanner) { const n = ac.createStereoPanner(); n.pan.value = clamp(p, -1, 1); return n; }
    return gain(1);
  }

  /** Looping noise source. Started immediately; lives as long as its voice. */
  function noiseSrc(buffer, rate) {
    const s = ac.createBufferSource();
    s.buffer = buffer;
    s.loop = true;
    if (rate !== undefined) s.playbackRate.value = rate;
    // random loop offset so two noise sources are never phase-identical
    return s;
  }

  function startNoise(s, offset) {
    try { s.start(0, offset === undefined ? Math.random() * (s.buffer.duration * 0.8) : offset); }
    catch (e) { try { s.start(0); } catch (e2) { /* already started */ } }
  }

  function chain(nodes) {
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
    return nodes[nodes.length - 1];
  }

  function safeDisconnect(n) { try { n.disconnect(); } catch (e) { /* ignore */ } }

  /* Envelope helpers for transient voices. `expo` never targets 0. */
  function expoTo(p, v, t) { try { p.exponentialRampToValueAtTime(Math.max(v, EPS), t); } catch (e) { p.linearRampToValueAtTime(v, t); } }
  function linTo(p, v, t) { p.linearRampToValueAtTime(v, t); }
  function setAt(p, v, t) { p.setValueAtTime(v, t); }

  /**
   * Standard percussive envelope: silence → peak over `atk`, then exponential
   * decay to silence over `dec`. Used by nearly every one-shot.
   */
  function perc(param, t0, peak, atk, dec) {
    param.cancelScheduledValues(t0);
    setAt(param, EPS, t0);
    expoTo(param, peak, t0 + atk);
    expoTo(param, EPS, t0 + atk + dec);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     7b. VOICE POOL
     ───────────────────────────────────────────────────────────────────────
     Transient voices only (one-shots, blow accents, music notes, ambience
     events). Continuous voices are persistent and are not counted here.

     Capacity: 16 / 20 / 24 by quality tier. On overflow we steal the voice
     with the LOWEST priority that is strictly below the incoming priority, and
     among equals the oldest. A hammer blow will therefore always displace a
     bird; a bit-break will always displace a hammer blow; nothing displaces a
     `critical`.

     Descriptors are pooled objects — alloc()/reap() never allocate.
     ═══════════════════════════════════════════════════════════════════════ */
  let MAXV = 24;
  const vActive = [];
  const vPool = [];

  function takeDesc() {
    const d = vPool.pop();
    if (d) return d;
    return { out: null, end: 0, prio: 0, nodes: [], srcs: [] };
  }
  function freeDesc(d) {
    d.out = null; d.end = 0; d.prio = 0;
    d.nodes.length = 0; d.srcs.length = 0;
    if (vPool.length < 64) vPool.push(d);
  }
  function killDesc(d) {
    safeDisconnect(d.out);
    for (let i = 0; i < d.nodes.length; i++) safeDisconnect(d.nodes[i]);
    for (let i = 0; i < d.srcs.length; i++) { try { d.srcs[i].stop(); } catch (e) { /* not started / already stopped */ } }
  }
  function reapVoices(t) {
    for (let i = vActive.length - 1; i >= 0; i--) {
      const d = vActive[i];
      if (d.end <= t) {
        killDesc(d);
        vActive[i] = vActive[vActive.length - 1];
        vActive.pop();
        freeDesc(d);
      }
    }
  }
  /** @returns {object|null} a voice descriptor, or null if we must drop. */
  function alloc(prio, dur, t) {
    if (vActive.length >= MAXV) {
      let worst = -1, worstPrio = prio, worstEnd = Infinity;
      for (let i = 0; i < vActive.length; i++) {
        const d = vActive[i];
        if (d.prio < worstPrio || (d.prio === worstPrio && d.end < worstEnd)) {
          worst = i; worstPrio = d.prio; worstEnd = d.end;
        }
      }
      if (worst < 0) return null;                      // nothing cheap enough
      const d = vActive[worst];
      killDesc(d);
      vActive[worst] = vActive[vActive.length - 1];
      vActive.pop();
      freeDesc(d);
    }
    const d = takeDesc();
    d.prio = prio;
    d.end = t + dur + 0.05;                            // +50 ms disconnect slack
    vActive.push(d);
    return d;
  }
  function track(d, node) { if (d) d.nodes.push(node); return node; }
  function trackSrc(d, s) { if (d) { d.nodes.push(s); d.srcs.push(s); } return s; }

  /* ═══════════════════════════════════════════════════════════════════════
     7c. BUS ARCHITECTURE
     ───────────────────────────────────────────────────────────────────────
     See the diagram at the top of this file. Every number below is chosen for
     a phone speaker, not for a studio monitor.
     ═══════════════════════════════════════════════════════════════════════ */
  function buildBuses() {
    masterGain = gain(1);

    // ── Absolute ceiling. Memoryless tanh at 0.97 — cannot overshoot, so the
    //    DAC can never clip no matter how many voices fire simultaneously.
    ceiling = shaper(B.ceilingCurve, '4x');

    // ── Makeup. The limiter below pulls peaks down by up to ~10 dB; +3.8 dB of
    //    makeup restores the loudness a phone needs without touching the
    //    ceiling (the soft-clipper mops up whatever is left).
    makeup = gain(dbToGain(3.8));

    // ── Peak limiter. 2 ms attack catches the hammer transient; 90 ms release
    //    is short enough not to pump on a 62 Hz blow train, long enough not to
    //    chatter. Knee 0 = hard, ratio 20 = effectively a limiter.
    limiter = ac.createDynamicsCompressor();
    limiter.threshold.value = -3.5;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.09;

    // ── Presence lift. +3 dB @ 2.6 kHz Q 0.9 sits exactly where a phone
    //    speaker is most efficient and where the drill string's 2nd/3rd modes
    //    live. This is what makes the rig "cut" on a tiny driver.
    presence = filt('peaking', 2600, 0.9, 3.0);

    // ── Glue compressor. Slow (12 ms / 220 ms), gentle (2.5:1 @ −18 dB). Its
    //    job is to hold the *average* level so ambience does not vanish behind
    //    the engine — not to control peaks (that is the limiter's job).
    glueComp = ac.createDynamicsCompressor();
    glueComp.threshold.value = -18;
    glueComp.knee.value = 12;
    glueComp.ratio.value = 2.5;
    glueComp.attack.value = 0.012;
    glueComp.release.value = 0.22;

    // ── Master highpass at 78 Hz, 12 dB/oct. A phone speaker reproduces
    //    nothing there; all that energy does is eat limiter headroom and make
    //    the speaker distort. Removing it makes the mix LOUDER, not thinner.
    hpfMaster = filt('highpass', 78, 0.6);

    preMaster = gain(1);

    chain([preMaster, hpfMaster, glueComp, presence, limiter, makeup, ceiling, masterGain]);
    masterGain.connect(ac.destination);

    // ── Sub-buses ──────────────────────────────────────────────────────────
    sfxBus = gain(1);
    musicBus = gain(1);
    ambBus = gain(1);

    // Ducking stages sit BEFORE the bus gain so a duck never fights a user
    // volume change.
    musicDuck = gain(1);
    ambDuck = gain(1);

    musicDuck.connect(musicBus);
    ambDuck.connect(ambBus);
    sfxBus.connect(preMaster);
    musicBus.connect(preMaster);
    ambBus.connect(preMaster);

    // ── Reverb. One convolver, one send, per-voice send levels. The IR is
    //    procedurally generated per region (see bakeIR). normalize=true so the
    //    wet level is stable across regions with very different tail lengths.
    convolver = ac.createConvolver();
    convolver.normalize = true;
    reverbSend = gain(1);
    reverbReturn = gain(0.9);
    // A short highpass on the send keeps low-mid energy out of the tail; a
    // muddy reverb is the single fastest way to destroy a phone mix.
    const sendHP = filt('highpass', 260, 0.7);
    reverbSend.connect(sendHP);
    sendHP.connect(convolver);
    convolver.connect(reverbReturn);
    reverbReturn.connect(preMaster);
  }

  /** Per-voice reverb send. Returns a gain node already wired to reverbSend. */
  function sendTo(amount) {
    const g = gain(amount);
    g.connect(reverbSend);
    return g;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     7d. BUILD — bake every buffer and construct the graph. Runs once, inside
     the unlock() user gesture. Measured at ~35–60 ms on a mid-range phone;
     the region IRs for OTHER regions are deferred to setRegion().
     ═══════════════════════════════════════════════════════════════════════ */
  function build() {
    if (built) return;

    hasPanner = typeof ac.createStereoPanner === 'function';
    const tier = (ctx && ctx.quality && ctx.quality.id) || 'medium';
    MAXV = VOICE_CAP[tier] || 20;

    // ── curves & waves ────────────────────────────────────────────────────
    B.satCurve = makeSaturationCurve(2.2, 2048);
    B.satCurveHot = makeSaturationCurve(5.5, 2048);
    B.exciterCurve = makeExciterCurve(2048);
    B.ceilingCurve = makeCeilingCurve(4096);
    B.dieselWave = makeDieselWave(ac, 0.11, 48);
    B.hammerWave = makeHammerWave(ac, 64);

    // ── noise beds ────────────────────────────────────────────────────────
    // 2.4 s stereo pink covers wind/air/hiss; 2.8 s stereo brown covers
    // rumble; 1.6 s mono white feeds the short transient generators.
    B.pink  = bakeNoise(ac, 2.4, 2, 'pink', 1337);
    B.brown = bakeNoise(ac, 2.8, 2, 'brown', 4242);
    B.white = bakeNoise(ac, 1.6, 1, 'white', 9001);

    // ── percussion bodies ─────────────────────────────────────────────────
    // Top-hammer string: 520 Hz reference, tau 0.20 s (audible ring ~0.55 s),
    // bright. Short on purpose — at 50 blows/s each blow damps the last.
    B.ring    = bakeRing(ac, RING_REF_HZ, 0.75, 0.20, 5150, 1.0);
    // DTH string: the hammer is AT the bit, so what rings is the whole pipe
    // column — lower (330 Hz), longer (tau 0.30 s), darker (brightness 0.72).
    B.ringDTH = bakeRing(ac, 330, 1.15, 0.30, 5151, 0.72);
    for (let i = 0; i < ROCK_CLASSES.length; i++) {
      B.cracks[i] = bakeCrack(ac, ROCK_CLASSES[i], 7000 + i * 137);
    }

    // ── one-shot metal bodies ─────────────────────────────────────────────
    // These are rare one-shots, so they get long buffers and long tails. Each
    // seconds/tau ratio is >= 3.7 so the tail is spent before the buffer ends.
    B.metalClang  = bakeMetal(ac, 196, 2.20, 0.58, 0.80, 3110);  // boulder, casing
    B.metalSnap   = bakeMetal(ac, 742, 2.60, 0.70, 0.92, 3111);  // bit break ring-down
    B.metalThread = bakeMetal(ac, 388, 0.42, 0.11, 0.55, 3112);  // rod thread snug
    B.metalStamp  = bakeMetal(ac, 262, 3.40, 0.92, 0.34, 3113);  // grade stamp (near-harmonic → bell-like)

    buildBuses();
    B.irs[regionId] = bakeIR(ac, REGIONS[regionId].ir);
    irOrder.push(regionId);
    convolver.buffer = B.irs[regionId];

    buildEngine();
    buildHydraulic();
    buildAirComp();
    buildRotation();
    buildPercussion();
    buildFlush();
    buildAmbience();
    buildMusic();

    applyRegionToAmbience(regionId, true);
    applyBusGains(true);
    built = true;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     8. CONTINUOUS VOICE — DIESEL ENGINE
     ───────────────────────────────────────────────────────────────────────
     THE most important sound in the game. If the engine does not audibly lug
     when the driller leans on the feed, nothing else matters.

     GRAPH
       pulseOsc (PeriodicWave, bandlimited 11% duty, 48 harmonics)
          │   frequency = fireHz = rpm / 20   (6-cylinder 4-stroke: rpm/60 × 3)
          │   Model endpoints, never actually reached in play:
          │     rpm01 = 0  →   780 rpm →  39 Hz
          │     rpm01 = 1  →  2100 rpm → 105 Hz
          │   MEASURED by a step-response test of the governor below
          │   (feed 0.15 → 0.95, top hammer):
          │     idling on site       ~1300 rpm → 65 Hz
          │     drilling, light feed ~1890 rpm → 94 Hz
          │     drilling, full feed  ~1730 rpm → 86 Hz
          │   The 94 → 86 Hz sag is small in absolute terms and
          │   enormous perceptually: it moves EVERY harmonic of a
          │   spectrum that spans the entire speaker band, so the whole
          │   machine appears to sag as one body. Reinforced by the
          │   exhaust lowpass opening 2.5 → 3.8 kHz and the
          │   1150 Hz bark peak coming in.
          ├─► pulseGain ──► sat (tanh, drive 2.2→5.5 with load)
          │                    │
          │                    ├─► exh1  peaking 92 Hz  Q 3.0 +9 dB   ┐ exhaust
          │                    ├─► exh2  peaking 205 Hz Q 2.4 +6 dB   ├ pipe
          │                    ├─► exh3  peaking 460 Hz Q 2.0 +4 dB   ┘ modes
          │                    └─► bark  peaking 1150 Hz Q 1.4 (0→+8 dB w/ load)
          │                            │
          │                            └─► lp (lowpass 900→4200 Hz w/ load)
          │                                     └─► engMix
          │
          ├─► excSine (sine @ fireHz) ─► exciter (Chebyshev T2..T5)
          │        ─► excBP (bandpass 260 Hz Q 0.8) ─► excGain ─► engMix
          │        [psychoacoustic bass: synthesises 2f..5f = 78–525 Hz]
          │
          ├─► turboOsc (sine, 1400 + rpm·3400 + load·900 Hz  →  1.4–5.7 kHz)
          │     + turboOsc2 (×1.5, the 3rd-order blade tone, −12 dB)
          │        ─► turboBP (bandpass Q 4.5) ─► turboGain (∝ load^1.4·rpm)
          │                                              └─► engMix
          │
          ├─► clatterNoise (pink) ─► clatterBP (bandpass 1600 Hz Q 1.2)
          │        ─► clatterGate (gain modulated AT AUDIO RATE by a copy of
          │           the firing pulse → the clatter is locked to the firing
          │           order, which is what "mechanical" means) ─► engMix
          │
          └─► wobble (brown noise, LP 3 Hz) ──► pulseGain.gain (±6%)
                   [combustion is never perfectly even; without this the
                    engine sounds like a synthesiser, with it, like a machine]

       engMix ─► engPan (−0.20, the power pack sits left of the mast)
              ─► engOut ─► sfxBus
              └─► engSend (0.10) ─► reverbSend

     GOVERNOR (in update(), not here) — see stepEngine().
     ═══════════════════════════════════════════════════════════════════════ */
  const E = {};
  function buildEngine() {
    E.pulse = ac.createOscillator();
    E.pulse.setPeriodicWave(B.dieselWave);
    E.pulse.frequency.value = 40;

    E.pulseGain = gain(0.30);
    E.sat = shaper(B.satCurve, '2x');

    E.exh1 = filt('peaking', 92, 3.0, 9);
    E.exh2 = filt('peaking', 205, 2.4, 6);
    E.exh3 = filt('peaking', 460, 2.0, 4);
    E.bark = filt('peaking', 1150, 1.4, 0);
    E.lp = filt('lowpass', 1400, 0.9);

    E.mix = gain(1);

    chain([E.pulse, E.pulseGain, E.sat, E.exh1, E.exh2, E.exh3, E.bark, E.lp, E.mix]);

    // ── psychoacoustic bass branch ────────────────────────────────────────
    E.excSine = ac.createOscillator();
    E.excSine.type = 'sine';
    E.excSine.frequency.value = 40;
    E.excPre = gain(0.9);                      // exciter wants near-full-scale in
    E.exciter = shaper(B.exciterCurve, '4x');
    E.excBP = filt('bandpass', 260, 0.8);
    E.excGain = gain(0.22);
    chain([E.excSine, E.excPre, E.exciter, E.excBP, E.excGain, E.mix]);

    // ── turbo ─────────────────────────────────────────────────────────────
    E.turbo = ac.createOscillator();  E.turbo.type = 'sine';  E.turbo.frequency.value = 2200;
    E.turbo2 = ac.createOscillator(); E.turbo2.type = 'sine'; E.turbo2.frequency.value = 3300;
    E.turboPre = gain(1);
    E.turbo2Gain = gain(0.25);
    E.turboBP = filt('bandpass', 2200, 4.5);
    E.turboGain = gain(0);
    E.turbo.connect(E.turboPre);
    E.turbo2.connect(E.turbo2Gain); E.turbo2Gain.connect(E.turboPre);
    chain([E.turboPre, E.turboBP, E.turboGain, E.mix]);

    // ── mechanical clatter, gated by the firing pulse ─────────────────────
    E.clatterSrc = noiseSrc(B.pink, 1);
    E.clatterBP = filt('bandpass', 1600, 1.2);
    E.clatterGate = gain(0.0);                 // DC offset set in stepEngine()
    E.clatterOut = gain(0.16);
    chain([E.clatterSrc, E.clatterBP, E.clatterGate, E.clatterOut, E.mix]);
    // audio-rate gate: a scaled copy of the firing pulse drives the gain param
    E.gatePulse = ac.createOscillator();
    E.gatePulse.setPeriodicWave(B.hammerWave);  // narrow pulse = tight clatter
    E.gatePulse.frequency.value = 40;
    E.gateDepth = gain(0.55);
    E.gatePulse.connect(E.gateDepth);
    E.gateDepth.connect(E.clatterGate.gain);

    // ── combustion irregularity ───────────────────────────────────────────
    E.wobSrc = noiseSrc(B.brown, 0.05);        // 0.05× rate ≈ sub-1 Hz drift
    E.wobLP = filt('lowpass', 3.0, 0.7);
    E.wobDepth = gain(0.018);
    chain([E.wobSrc, E.wobLP, E.wobDepth, E.pulseGain.gain]);

    // ── output ────────────────────────────────────────────────────────────
    E.pan = pan(-0.20);
    E.out = gain(0);                            // silent until startEngine()
    E.mix.connect(E.pan); E.pan.connect(E.out);
    E.out.connect(sfxBus);
    E.send = sendTo(0.10);
    E.out.connect(E.send);

    E.pulse.start(); E.excSine.start(); E.turbo.start(); E.turbo2.start(); E.gatePulse.start();
    startNoise(E.clatterSrc); startNoise(E.wobSrc);
  }

  /**
   * THE GOVERNOR — the lug/recover behaviour, run every frame.
   *
   * A mechanically-governed diesel under load does three things, in order:
   *   1. DROOP   — the load steals kinetic energy from the flywheel and rpm
   *                falls fast (0.15–0.30 s). The governor has not reacted yet.
   *   2. RECOVER — the governor opens the rack, rpm climbs back over
   *                0.6–1.2 s, slower than it fell.
   *   3. OVERSHOOT — when the load is suddenly removed the flywheel runs away
   *                for ~0.3 s before the governor closes.
   *
   * We model it as a second-order system with ASYMMETRIC stiffness:
   *      rpmVel += (rpmTarget − rpm) · k − rpmVel · c
   *   k = 70 when dropping (fast droop), k = 26 when recovering (slow pull-up)
   *   c = 9  → damping ratio ζ = c / (2√k) ≈ 0.54 recovering → mild overshoot.
   *
   * That asymmetry is the entire trick. Symmetric springs sound like a synth
   * filter sweep; asymmetric ones sound like an engine working.
   */
  function stepEngine(dt) {
    const met = method;

    // ── LOAD DEMAND ──────────────────────────────────────────────────────
    // Feed (WOB) is the largest single term — that is the point of the whole
    // voice. The coefficients are scaled so the PLAYER'S usable range maps to
    // roughly 0.40 (drilling gently) → 0.92 (leaning on it), leaving the
    // saturated top of the scale for hazards. Getting this wrong is the
    // classic failure mode: if the sum pegs at 1.0 during normal drilling then
    // the engine timbre stops responding and the player loses the single most
    // important piece of feedback in the game.
    //   engine idling, not drilling  ≈ 0.14
    //   drilling light               ≈ 0.40
    //   drilling hard                ≈ 0.92
    //   stuck                        → pegged (correctly)
    const drilling = tel.active ? 1 : 0;
    let ld = engineOn ? 0.08 : 0;                      // fan, alternator, pumps
    if (drilling) {
      ld += met.engineBase * 0.30;                     // the method's own draw
      ld += 0.34 * tel.wob;                            // ← the dominant term
      ld += 0.10 * tel.rpm;
      ld += 0.05 * tel.flush;
      ld += 0.18 * tel.torque;
      ld += 0.12 * m.hydPress;
      ld += 0.06 * m.annulus;
    } else if (engineOn) {
      ld += 0.06;                                      // idling on site
    }
    ld += 0.30 * tel.jam;                              // a bind loads it hard
    m.loadTarget = clamp(ld, 0, 1.35);
    // A diesel feels a torque demand almost immediately — the delay you hear
    // is the governor reacting, not the load arriving. lambda 14 = 71 ms.
    m.loadPrev = m.load;
    m.load = damp(m.load, m.loadTarget, 14, dt);

    // Throttle setting: idle in menus, working rpm on site.
    // ON THE REEL the engine is not idling, it is STOPPED (§13b-2b): m.mains
    // pulls the rpm target down to below cranking speed, and because the
    // governor model in this function is what carries it there, what you hear
    // is a diesel dying rather than a gain fading out. m.mains is 0 for every
    // method that is not power:'dual', so this is a no-op everywhere else.
    const mains = clamp(m.mains, 0, 1);
    const throttle = engineOn ? ((tel.active && mains < 0.5) ? 0.82 + 0.18 * tel.rpm : 0.30) : 0;
    const idle01 = 0.14;
    const rpmSet = mixf(idle01 + throttle * (1 - idle01), 0.045, mains);

    // Droop: up to 22 % of rated speed lost at full load.
    m.rpmTarget = clamp(rpmSet - m.load * 0.22, 0.06, 1);

    const err = m.rpmTarget - m.rpm01;
    const k = err < 0 ? 110 : 26;                      // ↓ fast, ↑ slow
    const c = 9;
    // k=110 → omega 10.5 rad/s, zeta 0.43: the droop bottoms out in ~0.15 s
    // and dips slightly past its mark before the governor catches it — the lug.
    // k=26 → omega 5.1 rad/s, zeta 0.88: the pull back up is slow and smooth.
    m.rpmVel += (err * k - m.rpmVel * c) * dt;
    // FLYWHEEL RUN-AWAY: when load is suddenly REMOVED the stored rotational
    // energy has nowhere to go and the engine surges before the governor can
    // close the rack. Without this term the recovery is merely a slow ramp to
    // the new target and the release of a hard cut never feels like relief.
    const dLoad = m.load - m.loadPrev;
    if (dLoad < 0) m.rpmVel += -dLoad * 1.5;
    m.rpm01 = clamp(m.rpm01 + m.rpmVel * dt, 0.04, 1.10);

    // 6-cylinder 4-stroke: firing frequency = rpm/60 × cylinders/2 = rpm/20.
    const rpmAbs = mixf(780, 2100, m.rpm01);
    m.fireHz = rpmAbs / 20;

    if (!engineOn && E.out.gain.value < 0.001) return; // fully stopped: skip

    E.pulse.frequency.value = m.fireHz;
    E.gatePulse.frequency.value = m.fireHz;
    E.excSine.frequency.value = m.fireHz;

    const L = clamp(m.load, 0, 1);

    // Exhaust opens up and gets barky under load. 900 Hz (soft, loping idle) to
    // 4200 Hz (hard, working). This sweep IS the "it is pulling" cue.
    E.lp.frequency.value = mixf(900, 4200, Math.pow(L, 0.75));
    E.bark.gain.value = L * 8;
    E.exh1.gain.value = mixf(9, 5, L);                 // low pipe mode compresses
    E.exh3.gain.value = mixf(4, 7.5, L);

    // Grit: swap saturation drive by crossfading is expensive, so we drive the
    // fixed curve harder instead — same audible effect, one param.
    E.pulseGain.gain.value = mixf(0.26, 0.52, L) * mixf(0.55, 1.0, m.rpm01);

    // Psychoacoustic bass: track the fire frequency's 3rd harmonic with the
    // bandpass so the synthesised partials always land in the phone's band.
    E.excBP.frequency.value = clamp(m.fireHz * 3.2, 180, 620);
    E.excGain.gain.value = mixf(0.16, 0.30, L);

    // Turbo: only meaningful above ~40 % load; whine rises with both boost and
    // shaft speed. ^1.4 keeps it out of the way at part load.
    E.turbo.frequency.value = 1400 + m.rpm01 * 3400 + L * 900;
    E.turbo2.frequency.value = E.turbo.frequency.value * 1.5;
    E.turboBP.frequency.value = E.turbo.frequency.value;
    E.turboGain.gain.value = Math.pow(clamp(L - 0.12, 0, 1), 1.4) * m.rpm01 * 0.13;

    // Clatter: DC offset opens the gate, the pulse modulates it. More load =
    // more mechanical noise but the gate stays pulse-locked.
    E.clatterGate.gain.value = 0.10 + 0.22 * L;
    E.gateDepth.gain.value = mixf(0.45, 0.75, L);
    E.clatterBP.frequency.value = mixf(1300, 2400, L);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     9. CONTINUOUS VOICE — HYDRAULICS
     ───────────────────────────────────────────────────────────────────────
     A 9-piston axial pump driven off the engine. Two elements:

       PUMP WHINE — sawtooth at the piston-passing frequency
                    f = engineShaftHz × 9   (39–105 Hz fire → 117–315 Hz)
                    through a narrow bandpass at f (Q 6) plus a second
                    resonance at the 8th order (0.9–2.5 kHz) which is the
                    "singing" you hear standing next to a working pack.
       RELIEF HISS — white noise, highpass 2.6 kHz, into a bandpass that sweeps
                    3.4 → 6.6 kHz as pressure rises. Gain is a knee: nearly
                    silent below 0.55 pressure, then rises steeply — because a
                    relief valve does exactly nothing until it cracks, then
                    screams. That knee is a real gameplay tell: if you hear the
                    relief, you are wasting the pump's flow as heat.

       hydPan +0.30 (the power pack's valve bank sits right of the mast)
     ═══════════════════════════════════════════════════════════════════════ */
  const H = {};
  function buildHydraulic() {
    H.saw = ac.createOscillator(); H.saw.type = 'sawtooth'; H.saw.frequency.value = 180;
    H.bp = filt('bandpass', 180, 6);
    H.sing = filt('peaking', 1400, 3.5, 8);
    H.whineGain = gain(0);
    chain([H.saw, H.bp, H.sing, H.whineGain]);

    H.noise = noiseSrc(B.white, 1);
    H.hp = filt('highpass', 2600, 0.7);
    H.reliefBP = filt('bandpass', 3800, 2.2);
    H.reliefGain = gain(0);
    chain([H.noise, H.hp, H.reliefBP, H.reliefGain]);

    H.mix = gain(1);
    H.whineGain.connect(H.mix);
    H.reliefGain.connect(H.mix);
    H.pan = pan(0.30);
    H.out = gain(0);
    H.mix.connect(H.pan); H.pan.connect(H.out); H.out.connect(sfxBus);
    H.send = sendTo(0.08); H.out.connect(H.send);

    H.saw.start(); startNoise(H.noise);
  }

  function stepHydraulic(dt) {
    // Pressure demand: feed cylinder + rotation motor + (if fitted) the drifter.
    const drilling = tel.active ? 1 : 0;
    let p = 0.06 + method.hydraulic * (
      drilling * (0.45 * tel.wob + 0.28 * tel.rpm + 0.30 * tel.torque) + (engineOn ? 0.10 : 0)
    );
    p += 0.45 * tel.jam;                   // a stuck string dead-heads the pump
    m.hydTarget = clamp(p, 0, 1.15);
    m.hydPress = damp(m.hydPress, m.hydTarget, 9, dt);

    if (!engineOn && H.out.gain.value < 0.001) return;

    const P = clamp(m.hydPress, 0, 1);
    // m.driveHz is the PRIME MOVER, not the diesel: on a jumbo running off the
    // mains reel this is a constant and the pump note stops drooping (§13b-2b).
    // For every other method in the game m.driveHz === m.fireHz to the sample.
    const pumpF = clamp(m.driveHz * 3, 90, 340);        // 9 pistons / 3 firings
    H.saw.frequency.value = pumpF;
    H.bp.frequency.value = pumpF;
    H.sing.frequency.value = clamp(pumpF * 8, 700, 2600);
    H.whineGain.gain.value = (0.035 + 0.075 * P) * clamp(m.driveSpd, 0, 1.2);

    // The relief knee. Below 0.55 → essentially nothing. Above → steep.
    const crack = clamp((P - 0.55) / 0.45, 0, 1);
    H.reliefGain.gain.value = Math.pow(crack, 1.8) * 0.10;
    H.reliefBP.frequency.value = mixf(3400, 6600, crack);
    H.reliefBP.Q.value = mixf(1.6, 3.4, crack);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     10. CONTINUOUS VOICE — AIR COMPRESSOR  (DTH / top hammer air flush)
     ───────────────────────────────────────────────────────────────────────
     A screw compressor is two things: a slow mechanical pulsing (the unloader
     and the rotor pass) and a huge amount of moving air.

       DRONE  — sine @ 47 Hz + saw @ 94 Hz, amplitude-modulated at 6.5 Hz by a
                dedicated LFO (the unloader cycling). 47 Hz is inaudible on a
                phone; the saw's harmonics and the AM sidebands (94 ± 6.5 Hz …)
                carry it. Deliberate: the pulsing RATE is the information.
       AIRFLOW — pink noise through a bandpass 700 Hz → 4 kHz whose centre and
                gain both rise with the flush control. This is the loudest
                single element on a real DTH site.
       BLOW-DOWN — one-shot, see SHOTS.blowdown: when flush is released the
                receiver dumps and you get a 0.9 s falling hiss.

       compPan −0.45 — the compressor is a separate skid parked off to one side.
       This is the only strongly-panned voice in the game.
     ═══════════════════════════════════════════════════════════════════════ */
  const A = {};
  function buildAirComp() {
    A.sub = ac.createOscillator(); A.sub.type = 'sine'; A.sub.frequency.value = 47;
    A.saw = ac.createOscillator(); A.saw.type = 'sawtooth'; A.saw.frequency.value = 94;
    A.sawG = gain(0.35);
    A.droneLP = filt('lowpass', 520, 1.1);
    A.am = gain(1);
    A.droneGain = gain(0);
    A.sub.connect(A.am); A.saw.connect(A.sawG); A.sawG.connect(A.am);
    chain([A.am, A.droneLP, A.droneGain]);

    A.lfo = ac.createOscillator(); A.lfo.type = 'triangle'; A.lfo.frequency.value = 6.5;
    A.lfoDepth = gain(0.35);
    A.lfo.connect(A.lfoDepth); A.lfoDepth.connect(A.am.gain);
    A.am.gain.value = 0.65;                     // DC + LFO → 0.30 … 1.00

    A.flowSrc = noiseSrc(B.pink, 1);
    A.flowBP = filt('bandpass', 1400, 0.55);
    A.flowHP = filt('highpass', 480, 0.6);
    A.flowGain = gain(0);
    chain([A.flowSrc, A.flowHP, A.flowBP, A.flowGain]);

    A.mix = gain(1);
    A.droneGain.connect(A.mix); A.flowGain.connect(A.mix);
    A.pan = pan(-0.45);
    A.out = gain(0);
    A.mix.connect(A.pan); A.pan.connect(A.out); A.out.connect(sfxBus);
    A.send = sendTo(0.14); A.out.connect(A.send);

    A.sub.start(); A.saw.start(); A.lfo.start(); startNoise(A.flowSrc);
  }

  function stepAir(dt) {
    const needsAir = !!method.compressor && engineOn;
    m.airTarget = needsAir ? clamp(0.22 + 0.78 * tel.flush * (tel.active ? 1 : 0.35), 0, 1) : 0;
    m.airFlow = damp(m.airFlow, m.airTarget, 3.2, dt);

    if (A.out.gain.value < 0.001 && m.airFlow < 0.002) return;

    const F = m.airFlow;
    // Drone level tracks the compressor working, not the flush valve — the
    // machine runs whether or not you are blowing air downhole.
    A.droneGain.gain.value = (needsAir ? 0.13 : 0) * mixf(0.55, 1, m.rpm01);
    A.lfo.frequency.value = mixf(5.2, 8.4, m.load);      // unloader cycles faster under load

    // Air rush: brighter and louder with more flow. 700 Hz at a trickle,
    // 4 kHz wide open — a real 25 bar/30 l/s hose is mostly 2–5 kHz.
    A.flowBP.frequency.value = mixf(700, 4000, Math.pow(F, 0.7));
    A.flowBP.Q.value = mixf(0.9, 0.4, F);                // wider as it opens
    A.flowGain.gain.value = Math.pow(F, 1.15) * 0.20;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     11. CONTINUOUS VOICE — ROTATION
     ───────────────────────────────────────────────────────────────────────
       GEAR MESH — three detuned sawtooth-ish tones at the mesh frequency
                   f = shaftHz × meshTeeth  (e.g. 4.2 rev/s × 31 = 130 Hz for a
                   top hammer, 1.4 × 37 = 52 Hz for a big rotary head). The two
                   detuned copies (±0.4 %, ±0.8 %) produce the slow beating that
                   makes a gearbox sound like metal rather than a synth.
                   A peaking filter at the 6th mesh order adds the whine that
                   actually survives a phone speaker.
       BEARING RUMBLE — brown noise, lowpass 220 Hz, amplitude-modulated once
                   per shaft revolution (a bearing has one loaded zone). Below
                   the speaker but its AM sidebands are not, and the AM RATE is
                   read as rotational speed.
       Centred (the rotary head is directly above the hole).
     ═══════════════════════════════════════════════════════════════════════ */
  const R = {};
  function buildRotation() {
    R.o1 = ac.createOscillator(); R.o1.type = 'sawtooth';
    R.o2 = ac.createOscillator(); R.o2.type = 'sawtooth';
    R.o3 = ac.createOscillator(); R.o3.type = 'triangle';
    R.g1 = gain(0.5); R.g2 = gain(0.32); R.g3 = gain(0.22);
    R.meshLP = filt('lowpass', 2200, 0.8);
    R.meshPk = filt('peaking', 900, 2.2, 5);
    R.meshGain = gain(0);
    R.o1.connect(R.g1); R.o2.connect(R.g2); R.o3.connect(R.g3);
    R.meshSum = gain(1);
    R.g1.connect(R.meshSum); R.g2.connect(R.meshSum); R.g3.connect(R.meshSum);
    chain([R.meshSum, R.meshPk, R.meshLP, R.meshGain]);

    R.rumbleSrc = noiseSrc(B.brown, 1);
    R.rumbleLP = filt('lowpass', 220, 1.0);
    R.rumbleAM = gain(0.7);
    R.rumbleGain = gain(0);
    chain([R.rumbleSrc, R.rumbleLP, R.rumbleAM, R.rumbleGain]);
    R.amLfo = ac.createOscillator(); R.amLfo.type = 'sine'; R.amLfo.frequency.value = 2;
    R.amDepth = gain(0.3);
    R.amLfo.connect(R.amDepth); R.amDepth.connect(R.rumbleAM.gain);

    R.mix = gain(1);
    R.meshGain.connect(R.mix); R.rumbleGain.connect(R.mix);
    R.pan = pan(0.05);
    R.out = gain(0);
    R.mix.connect(R.pan); R.pan.connect(R.out); R.out.connect(sfxBus);
    R.send = sendTo(0.08); R.out.connect(R.send);

    R.o1.start(); R.o2.start(); R.o3.start(); R.amLfo.start(); startNoise(R.rumbleSrc);
  }

  function stepRotation(dt) {
    const [lo, hi] = method.shaftHz;
    const want = tel.active ? mixf(lo, hi, tel.rpm) * (1 - 0.55 * tel.jam) : 0;
    m.shaftTarget = want;
    // Rotation has real inertia — a 400 kg rotary head does not change speed in
    // one frame. λ=2.2 gives roughly a 0.45 s time constant.
    m.shaftHz = damp(m.shaftHz, m.shaftTarget, 2.2, dt);

    if (R.out.gain.value < 0.001 && m.shaftHz < 0.01) return;

    const mesh = clamp(m.shaftHz * method.meshTeeth, 20, 1800);
    R.o1.frequency.value = mesh;
    R.o2.frequency.value = mesh * 1.004;
    R.o3.frequency.value = mesh * 2.011;
    R.meshPk.frequency.value = clamp(mesh * 6, 300, 5200);
    R.meshLP.frequency.value = clamp(mesh * 14, 600, 7000);

    const spin = clamp(m.shaftHz / Math.max(hi, 0.001), 0, 1);
    // Torque makes the gearbox groan: more level, more low mesh order.
    R.meshGain.gain.value = spin * (0.030 + 0.055 * tel.torque);
    R.amLfo.frequency.value = clamp(m.shaftHz, 0.05, 20);
    R.rumbleGain.gain.value = spin * (0.08 + 0.10 * tel.torque) * 0.5;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     12. CONTINUOUS VOICE — PERCUSSION (THE HAMMER)
     ───────────────────────────────────────────────────────────────────────
     Two layers, because 62 blows/second cannot be 62 node graphs/second.

     LAYER 1 — THE TRAIN (continuous, zero per-blow cost)
       hammerOsc (PeriodicWave, 3.5 % duty, 64 harmonics) @ blowHz
         │  top hammer 34–62 Hz · DTH 20–34 Hz · cable-tool 0.6–1.1 Hz
         ├─► trainSat (tanh drive 5.5 — a hammer is a violently nonlinear event)
         ├─► res1 bandpass  f = ringHz         Q 7   ┐ the drill string's first
         ├─► res2 bandpass  f = ringHz × 2.756 Q 6   ├ three free-free bar modes
         ├─► res3 bandpass  f = ringHz × 5.404 Q 5   ┘ (parallel, summed)
         ├─► rockTilt  (highshelf, −14 dB in clay … +6 dB in granite)
         └─► trainGain ─► percPan (0.0, the hole is centred) ─► percOut

     LAYER 2 — THE ACCENTS (discrete, ≤16/s, locked to EVENTS.BIT_IMPACT)
       For each accent:
         crackBuf[rockClass] ─┐
         ringBuf @ playbackRate r ─┤─► voiceGain (perc env) ─► percOut
                                    └─► accentSend (0.22) ─► reverb
       where r = 1 / (1 + 0.10·(rods−1))^0.55, clamped 0.34…1.0
       Because playbackRate scales pitch AND duration together, adding rods
       lowers the ring and lengthens it in exactly the ratio a longer steel
       string does. At 1 rod r=1.00 (520 Hz, 0.62 s); at 12 rods r=0.55
       (286 Hz, 1.13 s). That coupling is the depth cue.

     ACCENT DECIMATION
       accentDiv = ceil(blowHz / 16) so accents never exceed 16/s.
       At 62 Hz → div 4 → 15.5 accents/s (a 4-to-the-blow subdivision).
       At 20 Hz → div 2 → 10/s.  At 1 Hz → div 1 → every blow.
       The music's pulse layer locks to accentRate, which is why the score
       always feels like it is riding the hammer.
     ═══════════════════════════════════════════════════════════════════════ */
  const P = {};
  function buildPercussion() {
    P.osc = ac.createOscillator();
    P.osc.setPeriodicWave(B.hammerWave);
    P.osc.frequency.value = 40;
    P.sat = shaper(B.satCurveHot, '2x');
    P.pre = gain(0.35);

    P.res1 = filt('bandpass', 520, 7);
    P.res2 = filt('bandpass', 1433, 6);
    P.res3 = filt('bandpass', 2810, 5);
    P.r1g = gain(1.0); P.r2g = gain(0.6); P.r3g = gain(0.35);
    P.resSum = gain(1);
    P.osc.connect(P.pre); P.pre.connect(P.sat);
    P.sat.connect(P.res1); P.sat.connect(P.res2); P.sat.connect(P.res3);
    P.res1.connect(P.r1g); P.res2.connect(P.r2g); P.res3.connect(P.r3g);
    P.r1g.connect(P.resSum); P.r2g.connect(P.resSum); P.r3g.connect(P.resSum);

    P.rockTilt = filt('highshelf', 2200, 0.7, 0);
    P.trainGain = gain(0);
    chain([P.resSum, P.rockTilt, P.trainGain]);

    P.mix = gain(1);
    P.trainGain.connect(P.mix);
    P.pan = pan(0.0);
    P.out = gain(1);
    P.mix.connect(P.pan); P.pan.connect(P.out); P.out.connect(sfxBus);
    P.send = sendTo(0.20); P.out.connect(P.send);
    // Accents bypass the train's filter bank and go straight to P.mix — via a
    // trim, because longhole (§13b-3) replaces this direct "collar" path with a
    // delayed, lowpassed one and needs to be able to pull the direct one down.
    // For every other method accentDry stays at 1.0 and this is a no-op.
    P.accentBus = gain(1);
    P.accentDry = gain(1);
    P.accentBus.connect(P.accentDry);
    P.accentDry.connect(P.mix);
    P.accentSend = sendTo(0.22);
    P.accentBus.connect(P.accentSend);

    P.osc.start();
  }

  /** Rod-count → ring playback rate. See the block comment above. */
  function blowPlaybackRate(rods, depth) {
    const r = 1 / Math.pow(1 + 0.10 * Math.max(0, rods - 1), 0.55);
    // A little extra sag with raw depth so a deep hole in one long rod still
    // reads as deep. Depth contributes at most another −8 %.
    const d = 1 - 0.08 * clamp(depth / 220, 0, 1);
    return clamp(r * d, 0.34, 1.0);
  }

  function stepPercussion(dt) {
    const kind = method.percussion;
    const [lo, hi] = method.blowHz;
    // 'pile' and 'spt' are DISCRETE: one enormous blow at a time, scheduled by
    // the method's own module (§13b-5, §13b-6) as full one-shots. They must not
    // also run the continuous train, or a 0.5 Hz pile hammer would come with a
    // 0.5 Hz buzz underneath it.
    const wants = tel.active && kind !== 'none' && !DISCRETE_PERC[kind] && tel.jam < 0.85;
    m.percTarget = wants ? 1 : 0;
    m.percOn = damp(m.percOn, m.percTarget, 8, dt);

    // Blow rate. Percussion rate is set by the rpm/percussion control, but a
    // hammer also slows slightly when it is loaded hard into rock (the piston
    // has to push more) — 8 % droop at full torque. Small, but you feel it.
    const base = mixf(lo, hi, tel.rpm);
    m.blowTarget = base * (1 - 0.08 * tel.torque) * (1 - 0.5 * tel.jam);
    m.blowHz = damp(m.blowHz, m.blowTarget, 5.5, dt);

    // Rock class from the current stratum.
    const cls = ROCK_CLASSES[m.rockIdx];

    if (m.percOn > 0.001) {
      const f = clamp(m.blowHz, 0.2, 200);
      P.osc.frequency.value = f;

      // The string's pitch: base ring for the method, scaled by rod count —
      // and, for longhole, by depth much harder, because with an ITH hammer the
      // resonator IS the whole rod string and a 45 m hole is a 45 m bar.
      // 1 − 0.34·(depth/45) at 45 m = 0.66×: the ring drops a perfect fifth and
      // lengthens 1.5×, together, because playbackRate couples them.
      m.ringExtra = method.voice === 'ith' ? (1 - 0.34 * clamp(tel.depth / 45, 0, 1)) : 1;
      m.ringRate = clamp(blowPlaybackRate(tel.rods, tel.depth) * m.ringExtra, 0.20, 1.0);
      const ringF = method.ringHz * m.ringRate;
      P.res1.frequency.value = clamp(ringF, 60, 4000);
      P.res2.frequency.value = clamp(ringF * 2.756, 80, 8000);
      P.res3.frequency.value = clamp(ringF * 5.404, 100, 12000);

      // Soft ground damps the string: Q collapses and the highs go with it.
      const ring = cls.ringMul;
      P.res1.Q.value = mixf(2.5, 8.0, ring);
      P.res2.Q.value = mixf(2.0, 6.5, ring);
      P.res3.Q.value = mixf(1.5, 5.5, ring);
      P.r2g.gain.value = mixf(0.18, 0.62, ring);
      P.r3g.gain.value = mixf(0.05, 0.40, ring);
      P.rockTilt.gain.value = mixf(-14, 6, cls.splinter);

      // Level tracks feed hard — leaning on the bit makes the hammer bite.
      const bite = 0.35 + 0.65 * tel.wob;
      P.trainGain.gain.value = m.percOn * bite * 0.16 * (1 - 0.4 * tel.wear);
      P.pre.gain.value = mixf(0.24, 0.42, tel.wob);
    } else {
      P.trainGain.gain.value = 0;
    }

    // ── accent scheduling ────────────────────────────────────────────────
    m.accentDiv = Math.max(1, Math.ceil(m.blowHz / 16));
    m.accentRate = m.blowHz / m.accentDiv;

    if (m.percOn > 0.4 && m.accentRate > 0.05) {
      // If the sim is emitting BIT_IMPACT we let IT drive the accents so audio,
      // particles and haptics land on the same frame. If nothing has arrived
      // for 0.5 s we free-run so the sound never dies during a stall in the
      // event stream.
      const simDriving = (now() - m.lastImpactAt) < 0.5;
      if (!simDriving) {
        m.accentPhase += m.accentRate * dt;
        while (m.accentPhase >= 1) {
          m.accentPhase -= 1;
          fireAccent(clamp(0.45 + 0.45 * tel.wob, 0, 1), now());
        }
      }
    } else {
      m.accentPhase = 0;
    }
  }

  /**
   * One discrete hammer blow. 3 nodes (2 sources + 1 gain) at priority `blow`.
   * Rate-limited by the caller; additionally hard-gated here to 20/s so a
   * pathological BIT_IMPACT storm cannot flood the pool.
   */
  let lastAccentAt = -1;
  function fireAccent(intensity, t) {
    if (!built || t - lastAccentAt < 0.05) return;
    lastAccentAt = t;
    const cls = ROCK_CLASSES[m.rockIdx];
    const I = clamp(intensity, 0, 1);
    const d = alloc(PRIO.blow, 0.5 * m.ringRate + 0.12, t);
    if (!d) return;

    const g = track(d, gain(EPS));
    d.out = g;
    g.connect(P.accentBus);

    // 1. the rock's response — the fracture
    const crack = trackSrc(d, ac.createBufferSource());
    crack.buffer = B.cracks[m.rockIdx];
    // ±6 % rate jitter: no two blows into rock are identical, and without this
    // the accent layer phases into an obvious machine-gun artefact.
    crack.playbackRate.value = 1 + (Math.random() - 0.5) * 0.12;
    const crackG = track(d, gain(0.85 * mixf(0.5, 1.0, I)));
    crack.connect(crackG); crackG.connect(g);

    // 2. the drill string ringing down
    const ring = trackSrc(d, ac.createBufferSource());
    ring.buffer = method.percussion === 'dth' ? B.ringDTH : B.ring;
    ring.playbackRate.value = m.ringRate * (1 + (Math.random() - 0.5) * 0.02);
    const ringG = track(d, gain(0.55 * cls.ringMul * mixf(0.4, 1.0, I) * (1 - 0.35 * tel.wear)));
    ring.connect(ringG); ringG.connect(g);

    // Envelope: 1.5 ms attack (a hammer has no attack), then let the buffers
    // decay naturally; the gain is a level trim plus a safety fade.
    const peak = clamp(0.20 + 0.55 * I, 0.02, 0.9) * m.percOn;
    g.gain.cancelScheduledValues(t);
    setAt(g.gain, EPS, t);
    linTo(g.gain, peak, t + 0.0015);
    expoTo(g.gain, EPS, t + 0.45 * m.ringRate + 0.10);

    crack.start(t);
    ring.start(t);

    // Sidechain the music under the blow, and fire a haptic tick.
    duckMusic(t, 0.34 + 0.32 * I);
    if (I > 0.45) hapticBlow(I);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     13. CONTINUOUS VOICE — FLUSH / CUTTINGS / ANNULUS
     ───────────────────────────────────────────────────────────────────────
     THE FAIR TELL. This voice must warn the player BEFORE the gauge does.

     A borehole annulus that is carrying its cuttings sounds like a clean rush:
     broad, bright, steady. An annulus that is starting to load up begins to
     GARGLE — the flow goes intermittent, the spectrum collapses downward, and
     you get a low resonant burble. On a real rig this is the noise that makes
     an experienced driller back off the feed a full ten seconds before the
     pressure gauge moves.

     GRAPH
       flushSrc (pink, rate 1.0) ─► flushHP (highpass, 180→900 Hz)
          ─► flushBP (bandpass, centre 420 Hz … 3400 Hz, Q 0.5 … 2.6)
          ─► gargle (peaking, 300 Hz, 0 … +14 dB, Q 6)   ← the choke resonance
          ─► amGain  (gain modulated by gargleLFO, 5 → 13 Hz, depth 0 … 0.5)
          ─► flushGain ─► flushPan (0.0, it comes out of the hole) ─► flushOut

     ANNULUS LOAD MODEL (the tell)
        loadRaw = (0.35 + rop01·0.90 + wob·0.50 + wear·0.25)
                / (0.35 + flush·1.80)
        annulus = smooth(clamp(loadRaw − 0.55), λ = 2.6)

     λ = 2.6 → ~0.38 s time constant. The sim's own jam integrator is far
     slower (it has to be, or the game would be unplayable), so the audio
     genuinely leads the gauge. That is deliberate and it is the fair tell.

     Thresholds:
       annulus < 0.30  clean rush, bright, no AM
       0.30 – 0.60     centre frequency starts falling, gargle appears
       0.60 – 0.85     AM at 9–13 Hz, obvious burbling
       > 0.85          sputter bursts (see the spit scheduler in stepFlush)
     ═══════════════════════════════════════════════════════════════════════ */
  const F = {};
  function buildFlush() {
    F.src = noiseSrc(B.pink, 1);
    F.hp = filt('highpass', 400, 0.7);
    F.bp = filt('bandpass', 2400, 0.6);
    F.gargle = filt('peaking', 300, 6, 0);
    F.am = gain(1);
    F.flushGain = gain(0);
    chain([F.src, F.hp, F.bp, F.gargle, F.am, F.flushGain]);

    F.lfo = ac.createOscillator(); F.lfo.type = 'sine'; F.lfo.frequency.value = 6;
    F.lfoDepth = gain(0);
    F.lfo.connect(F.lfoDepth); F.lfoDepth.connect(F.am.gain);

    // A second, lower layer: the cuttings themselves tumbling up the annulus.
    // Brown noise, tightly bandpassed, only audible when the hole is loaded.
    F.grit = noiseSrc(B.brown, 1);
    F.gritBP = filt('bandpass', 520, 1.6);
    F.gritGain = gain(0);
    chain([F.grit, F.gritBP, F.gritGain]);

    F.mix = gain(1);
    F.flushGain.connect(F.mix); F.gritGain.connect(F.mix);
    F.pan = pan(0.0);
    F.out = gain(1);
    F.mix.connect(F.pan); F.pan.connect(F.out); F.out.connect(sfxBus);
    F.send = sendTo(0.16); F.out.connect(F.send);

    F.lfo.start(); startNoise(F.src); startNoise(F.grit);
  }

  let spitTimer = 0;
  function stepFlush(dt) {
    const medium = method.medium;
    const on = tel.active && medium !== 'none';

    // ROP normalised — we do not know the sim's absolute scale, so normalise
    // defensively against a plausible 40 m/h ceiling and clamp.
    const rop01 = clamp(tel.rop / 40, 0, 1);
    const loadRaw = (0.35 + rop01 * 0.90 + tel.wob * 0.50 + tel.wear * 0.25)
                  / (0.35 + tel.flush * 1.80);
    m.annulusTarget = on ? clamp(loadRaw - 0.55, 0, 1.2) : 0;
    m.annulus = damp(m.annulus, m.annulusTarget, 2.6, dt);

    if (!on && F.flushGain.gain.value < 0.001) { F.gritGain.gain.value = 0; return; }

    const L = clamp(m.annulus, 0, 1);
    const flow = tel.flush;

    // Medium character:
    //   air   — bright, hissy, wide band, loud
    //   water — darker, denser, narrower, a gush rather than a hiss
    //   mud   — darkest and thickest; mud does not hiss, it glugs
    let baseLo, baseHi, hpF, level, gritMul;
    if (medium === 'air')        { baseLo = 620; baseHi = 3400; hpF = 520; level = 0.115; gritMul = 0.5; }
    else if (medium === 'water') { baseLo = 460; baseHi = 2300; hpF = 300; level = 0.100; gritMul = 0.8; }
    else                         { baseLo = 300; baseHi = 1300; hpF = 190; level = 0.090; gritMul = 1.0; }

    // Clean centre rises with flow; loading DRAGS IT DOWN. That downward drag
    // is the primary audible tell.
    const clean = mixf(baseLo, baseHi, Math.pow(flow, 0.65));
    F.bp.frequency.value = mixf(clean, baseLo * 0.7, Math.pow(L, 0.8));
    F.bp.Q.value = mixf(0.5, 2.6, L);
    F.hp.frequency.value = mixf(hpF, hpF * 0.45, L);

    // The choke resonance: a fat peak that grows at ~300 Hz as it loads.
    F.gargle.gain.value = L * 14;
    F.gargle.frequency.value = mixf(340, 250, L);

    // Amplitude modulation — the burble. Rate climbs with load.
    F.lfo.frequency.value = mixf(5, 13, L);
    F.lfoDepth.gain.value = clamp((L - 0.28) / 0.72, 0, 1) * 0.5;
    F.am.gain.value = 1 - F.lfoDepth.gain.value * 0.5;

    F.flushGain.gain.value = (0.10 + 0.90 * flow) * level * mixf(1, 0.72, L);

    // Cuttings tumbling — only when there is something to carry.
    F.gritBP.frequency.value = mixf(420, 760, L);
    F.gritGain.gain.value = clamp(L * 0.9 + rop01 * 0.25 - 0.10, 0, 1) * 0.075 * gritMul;

    // Sputter: past 0.85 the annulus is packing off and the return goes
    // intermittent. Short bright bursts, ~3/s.
    if (L > 0.85) {
      spitTimer -= dt;
      if (spitTimer <= 0) {
        spitTimer = 0.20 + Math.random() * 0.22;
        playShot('flush_spit', { gain: clamp((L - 0.85) / 0.15, 0, 1) });
      }
    } else spitTimer = 0;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     13b. THE SIX NEW METHODS — CONTINUOUS VOICES
     ───────────────────────────────────────────────────────────────────────
     Six modules, one per method that needs a voice the original eight cannot
     make. They follow the same contract as §8–§13: persistent nodes, built
     once, driven by direct .value writes from a step function that allocates
     nothing.

     LAZY CONSTRUCTION. Unlike §8–§13 these are NOT built in build(). Between
     them they are 233 persistent nodes including 16 always-running oscillators
     and 11 looping noise sources, and a session that plays nothing but auger
     contracts should not pay for the RC cyclone. ensureVoice() builds the one
     module the active method needs, once, on the scene transition that selects
     the method — the same reasoning as the region impulse responses, and the
     same place in the frame budget (a transition, never mid-drill).

     ── MEASURED ───────────────────────────────────────────────────────────
     Driven through a Web Audio harness at 48 kHz, 60 fps, quality tier high.

       PER-METHOD CONSTRUCTION COST (nodes / newly baked buffers, once)
         rc 56/0 · tunnel-jumbo 71/1 · longhole 45/0 · rockbolt 32/0 ·
         driven-pile 18/2 · site-investigation 11/1.   All six resident at
         once would be 233 nodes; in play exactly one method is ever active.

       BAKED BODIES (Goertzel peak-pick, then a log-linear fit of the
       fundamental's magnitude in 50 ms windows)
         pileSteel     f0 109.50 Hz vs 108 asked (+1.39 %)  tau 0.774 s (−0.8 %)
         pileConcrete  f0 172.50 Hz vs 168 asked (+2.68 %)  tau 0.216 s (−1.6 %)
         anvil         f0 416.25 Hz vs 415 asked (+0.30 %)  tau 0.260 s (−0.0 %)
       The f0 error is the inharmonicity: bakeMetal stretches mode k to
       (k+1)^1.44, so the strongest partial is not exactly f0. Under 3 % on all
       three, and every one is inside the intended semitone.
       All three normalise to 0.900 peak; buffer/tau ratios 3.85 / 5.00 / 5.00
       against the house minimum of 3.7; tailGuard leaves the last 2 % of each
       buffer at −64.5 / −82.0 / −73.5 dBFS, i.e. true silence.

       RC — THE FAIR TELL
         cyclone body mode 330 Hz dry -> 230 Hz at contamination 0.8, and on a
         0 -> 1 contamination step the note is 63 % of the way there in 0.300 s
         against the 1/3.4 = 0.294 s the smoother asks for.

       TUNNEL-JUMBO — THE THREE DRIFTERS
         at a 56.40 Hz base: drifter 2 58.37 Hz, drifter 3 54.57 Hz, so the
         pairwise beat rates measured 1.97 / 1.83 / 3.80 Hz. Never in phase,
         never repeating, and every value re-randomised every 1.1–2.9 s.

       LONGHOLE — DEPTH
         depth   0 m  delay  4.2 ms  LPF 3183 Hz  ring 250 Hz
                12 m  delay 14.7 ms  LPF 2693 Hz  ring 226 Hz
                30 m  delay 30.9 ms  LPF 1924 Hz  ring 191 Hz
                45 m  delay 44.4 ms  LPF 1277 Hz  ring 162 Hz
                90 m  delay 84.7 ms  LPF  632 Hz  ring 160 Hz
         The delay crosses the ~15 ms echo-fusion threshold at 12 m, which is
         where a longhole starts sounding like one.

       ROCKBOLT — THE HOLD TIME
         mixing 0.900 -> hold timer starts -> 0.315 after 110 ms (one tau) ->
         0.009 after 510 ms. The spinning stops, audibly, on the frame the
         clock starts.

       DRIVEN PILE — THE HYPERBOLA, ROUND TRIP THROUGH THE MODEL
         ADVANCE 0.000 =  12 kNm -> 100.1 blows/min   (GAMEDESIGN says 100)
         ADVANCE 0.245 =  67 kNm ->  50.0 blows/min
         ADVANCE 1.000 = 235 kNm ->  30.0 blows/min   (GAMEDESIGN says 30)
         set 25 mm -> refusal 0.00 · set 1 mm -> refusal 0.95 · set 0 -> 1.00
         The energy/rate trade also protects the limiter for free: the loud
         blow (peak 1.886) can only happen at 0.50/s and the fast blow
         (1.67/s) peaks at 0.444, so the product barely moves — 0.94 against
         0.74 — across the entire curve.

       SITE INVESTIGATION — THE SILENCE
         The whole continuous bed, summed coherently at preMaster: a working
         top hammer 3.905, an SPT rig 1.151, a live CPT push 1.050. A CPT push
         is 11.4 dB under a top hammer, with the score at intensity 0.075.

     ── MEASURED AGAIN, AFTER THE SECOND WAVE ────────────────────────────
     Driven by the REAL simulation — src/sim/drilling.js stepped at 120 Hz
     against a Web Audio mock that traps every AudioParam write — for 90 to
     150 player seconds per method at 60 fps.

       WHAT IT COSTS. The same pathological worst case (every tell pinned at
       once) with the second wave inert, against the second wave live, as a
       coherent peak at preMaster:
                        inert    live     delta
         rc             6.140    5.935    −0.205   a choking cyclone gets
                                                   QUIETER, which is correct
         tunnel-jumbo   6.121    2.258    −3.863   the diesel is SHUT DOWN on
                                                   the reel, not ducked
         longhole       6.365    6.440    +0.075   the flush-back layer, and
                                                   that is the whole of it
         rockbolt       6.210    6.210     0.000  the hold tone only exists
                                                   during a hold, which by
                                                   definition excludes this
         driven-pile    5.081    5.097    +0.016   the crush layer
       So the entire second wave costs +0.075 on the worst continuous bus in
       the game and gives back 3.86 on the jumbo. Every one of these is a
       COHERENT sum — every source in phase at its extreme simultaneously —
       and the tanh ceiling at 0.97 remains the absolute brickwall regardless.

       WHAT IT COSTS PER FRAME. Added AudioParam writes, counted:
         rc +2 · tunnel-jumbo +8 · longhole +3 · rockbolt +3 · all others 0.
       Measured totals 61–103 writes/frame across the nine methods driven,
       against 86.3 for top-hammer, which this pass does not touch at all.
       No new allocation on any frame path; the bailing-run event payload is
       a reused object like every other payload in this file.

       NODES. Live high-water per method 239–358, against 219–335 before. The
       mains bed is 14 nodes and only tunnel-jumbo ever builds it; the
       flush-back is 6 and only longhole; the hold tone is 3 and only rockbolt.

       VOICES. Transient pool occupancy, mean and time-at-cap, over the same
       runs. The peaks are higher than they were only because the voices are
       now being fed real telemetry instead of defaults — an RC hole actually
       cuts bags, and a pile actually swings at 92 blows/min:
                            LOW tier (cap 16)        default (cap 20)
                            mean   peak   at cap     mean   peak   at cap
         rc                  9.6     16     0.1 %     9.7     16     0 %
         tunnel-jumbo        9.3     15     0.0 %     9.2     16     0 %
         driven-pile        10.5     16     0.4 %    10.5     17     0 %
         driven-pile/broom  11.1     16     0.1 %    11.0     16     0 %
         longhole            6.7     12     0.0 %     6.7     12     0 %
         rockbolt            1.6     13     0.0 %     1.6     13     0 %
         site-investigation  2.5     11     0.0 %     2.5     11     0 %
         cable-tool          1.9      8     0.0 %     1.9      7     0 %
         top-hammer          7.8     12     0.0 %     7.8     12     0 %
       Even on a phone at the LOW tier the pool is full for four frames in a
       thousand at worst, and the stealing that happens there is by priority,
       so what is dropped is a bird and never a blow.

       SOAK. Ten minutes at 60 fps cycling all twenty-one methods and four
       regions: 316 live nodes at one minute, 333 at nine, flat in between —
       the +17 is the lazy voice modules and the IR cache reaching their
       plateau, not a leak. Transient voices 1–4 throughout. assertFinite()
       clean on 642 parameters. Zero non-finite writes in 4.0 million.

       THE BROOM, ROUND TRIP THROUGH THE MODEL. A driven pile forced into
       granite at full hammer, 150 s:
            t    toeDamage   setMm   blows/250   ringLvl  ringTau   ping  crush
            0 s     0.000     1.40      178       0.240    0.174   0.007  0.000
           10 s     0.641     2.54       98       0.486    0.386   0.070  0.218
           20 s     1.000     3.19       78       0.295    0.273   0.000  0.340
       Read the gauge columns and the pile is driving BETTER as it goes: the
       set climbs 1.40 → 3.19 mm/blow and the blow count per 250 mm falls
       from 178 to 78. Read the sound columns and the ring is dying. At full
       broom ringLvl is 0.295 against 0.776 for the same refusal with an
       intact toe (−8.4 dB), tau is 0.273 against 0.44, the refusal PING has
       gone entirely, and the crush layer that was not there at all is 0.340.
         The crush becomes audible at   5.7 s.
         The set gauge inflates 15 % at 8.3 s.
       2.6 seconds of honest lead. pile_refusal fired twice, both of them
       before the broom passed 0.45, against five times in the soft-ground
       run. The audio never repeats the gauge’s lie.
     ═══════════════════════════════════════════════════════════════════════ */
  const CY = {}, JB = {}, DH = {}, BO = {}, PL = {}, SI = {};
  const voiceBuilt = { cyclone: false, jumbo: false, ith: false, bolter: false, pile: false, si: false };
  let boTorqueAt = -10;      // last torque-wrench one-shot (lock-out)
  let boTqWas = 0;           // torque-test pending, previous frame (edge)
  let boTqSeen = 0;          // has the sim ever published a pending flag?
  let plRefusalAt = -10;     // last pile-refusal one-shot (lock-out)
  let cptWas = 0;            // CPT push edge detector
  let bagAt = -10;           // last RC sample bag (lock-out)

  /** Bake the buffers a method needs, once. See the note in B above. */
  function ensureVoiceBuffers(v) {
    if (v === 'pile' && !B.pileSteel) {
      // A driven pile is a 6–40 m bar. Baked once at 108 Hz (a 23.6 m steel
      // pile) and retuned per pile with playbackRate — which stretches the
      // decay in the same direction as the pitch, which is what a longer bar
      // actually does. seconds/decaySec = 3.85, so the fundamental is below
      // −33 dB before the buffer ends and tailGuard() zeroes the residue.
      B.pileSteel    = bakeMetal(ac, 108, 3.00, 0.78, 0.30, 5201);
      // Precast concrete: the same modes, far more damping (tau 0.22 against
      // 0.78) and much more inharmonicity, because concrete is not homogeneous.
      B.pileConcrete = bakeMetal(ac, 168, 1.10, 0.22, 0.62, 5203);
    }
    if (v === 'si' && !B.anvil) {
      // The SPT anvil / drive head: a squat steel block on the top of the rods.
      B.anvil = bakeMetal(ac, 415, 1.30, 0.26, 0.72, 5204);
    }
  }

  /**
   * Build whatever the active method needs. Idempotent, cheap when there is
   * nothing to do (two property reads), safe to call every frame.
   */
  function ensureVoice() {
    if (!built) return;
    if (method.acoustic === 'underground' && !ugBuilt) buildUnderground();
    if (method.power === 'dual' && !mainsBuilt) buildMains();
    const v = method.voice;
    if (!v || voiceBuilt[v]) return;
    voiceBuilt[v] = true;
    ensureVoiceBuffers(v);
    if (v === 'cyclone') buildCyclone();
    else if (v === 'jumbo') buildJumbo();
    else if (v === 'ith') buildITH();
    else if (v === 'bolter') buildBolter();
    else if (v === 'pile') buildPile();
    else if (v === 'si') buildSI();
  }

  /**
   * Boom re-index between holes — shared by tunnel-jumbo and longhole.
   *
   * RATE-LIMITED, and it has to be. The sim compresses a face round hard: a
   * jumbo measured 250 hole changes in 90 player-seconds, which is 2.8 boom
   * moves a second. A boom weighs two tonnes and takes about fifteen seconds
   * to set on a collar; 2.8 a second is not a machine, it is a rattle, and it
   * was also the single biggest consumer of the transient voice pool (the cap
   * was pegged at 20/20 for the whole run). One every 1.2 s reads as a rig
   * working through a pattern, which is the honest impression, and the count
   * the player is actually being told is on the HUD anyway.
   */
  let boomAt = -10;
  function stepHoleIndex() {
    const hi = Math.floor(tel.holeIndex || 0);
    if (m.lastHoleIndex < 0) { m.lastHoleIndex = hi; return; }
    if (hi === m.lastHoleIndex) return;
    m.lastHoleIndex = hi;
    const t = now();
    if (t - boomAt < 1.2) return;
    boomAt = t;
    playShot('boom_reposition', { gain: 0.9 });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     13b-1. RC — THE CYCLONE
     ───────────────────────────────────────────────────────────────────────
     The defining sound of reverse circulation is NOT the hammer. It is the
     cyclone: 20–30 m³/min of air and rock chips arriving up the inner tube at
     30 m/s and being spun to a stop in a steel cone a metre from the driller's
     head. It never stops while the hole is returning, and its NOTE is the most
     informative thing on the rig.

     GRAPH
       ROAR   pink ─► hp (300→150 Hz) ─► bp (centre 760→1950 Hz, Q .45→1.5)
                   ─► body (peaking, 330→205 Hz, Q 3→7.5, 0→+15 dB)  ◄ THE TELL
                   ─► roarG
       CHIPS  brown(1.35×) ─► bp (470→790 Hz, Q 2) ─► chipAM (gated by a
                   9–17 Hz sine, depth .10→.44) ─► chipG
       BOOST  sine 61 Hz + saw 122 Hz (×0.42) ─► bAM (3.1 Hz unloader)
                   ─► lp 470 Hz ─► bG
       all ─► mix ─► pan(+0.28, the cyclone hangs off the right of the mast)
                  ─► out ─► sfxBus (+0.18 reverb send)

     WHY THOSE NUMBERS
       The roar is a broadband rush and its centre frequency is set by air
       velocity, so it climbs with the flush control. The cone has its own
       body mode; dry, with chips flying, it is damped and you barely hear it
       (gain 0 dB). Put WATER in it and the cone loads: the mode drops from
       330 Hz to 205 Hz, its Q more than doubles, and it comes up 15 dB. At the
       same time the roar's centre collapses to 42 % of clean (wet chips do not
       hiss) and the chip layer stops rattling and starts slapping (AM depth
       0.10 → 0.44). Four parameters, one event, and none of them is a level
       change — which is why it survives a phone speaker at any volume.

     THE FAIR TELL — WHY IT LEADS THE GAUGE
       m.cyWet is smoothed at λ 3.4 (τ = 0.29 s) from
           max(contamination, 1 − sampleRecovery)
       The max means the note changes as soon as ANY of the seal going, the
       sim's own wet meter or the recovery dropping starts to move. The sim's
       contamination integrator is necessarily slower than 0.29 s (it has to
       be, or the assay gauge would be unreadable), so the cyclone changes note
       first and the gauge follows — the same contract the flush voice keeps in
       §13.

     THE CHOKE — A DIFFERENT AXIS FROM THE WET
       Wet and choked are two different failures and they must not sound the
       same. Wet is the SAMPLE going bad; choked is the sample train BLOCKING,
       and the sim publishes it as `programme.holdUp01` — the carry-over meter,
       which is also the cue for the blowDown pulse action.

       A choking cyclone surges. The flow stalls against the plug, the pressure
       builds behind it, it clears, and it stalls again — so the tell is not a
       level, it is an INSTABILITY:
           roar level        × (1 → 0.66)     less air is getting through
           roar centre       × (1 → 0.62)     what does get through is slower
           roar Q            + 0 → 0.9        and narrower, because it is a jet
                                              through a hole rather than a cone
           surge AM          2.6 → 4.4 Hz at depth 0 → 0.42
       m.cyChoke smooths at λ 4.2 (τ = 0.24 s) — faster than the wet tell,
       because carry-over builds fast and the entire value of the cue is that
       it arrives before the meter. At holdUp 0 the surge depth is exactly 0
       and the roar multipliers are exactly 1, so a clean hole sounds like it
       always did, to the sample.
     ═══════════════════════════════════════════════════════════════════════ */
  function buildCyclone() {
    CY.roarSrc = noiseSrc(B.pink, 1);
    CY.roarHP = filt('highpass', 300, 0.6);
    CY.roarBP = filt('bandpass', 1200, 0.45);
    CY.body = filt('peaking', 330, 3.0, 0);
    // THE CHOKE (see the note above the step function). A surge gate on the
    // roar, flat at depth 0 and therefore silent until the tube starts to
    // carry over. Three nodes, and they are the earliest honest warning the
    // player gets that the sample train is loading up.
    CY.surgeAM = gain(1);
    CY.roarG = gain(0);
    chain([CY.roarSrc, CY.roarHP, CY.roarBP, CY.body, CY.surgeAM, CY.roarG]);
    CY.surgeLfo = ac.createOscillator(); CY.surgeLfo.type = 'triangle'; CY.surgeLfo.frequency.value = 2.6;
    CY.surgeD = gain(0);
    CY.surgeLfo.connect(CY.surgeD); CY.surgeD.connect(CY.surgeAM.gain);

    CY.chipSrc = noiseSrc(B.brown, 1.35);
    CY.chipBP = filt('bandpass', 520, 2.0);
    CY.chipAM = gain(0.55);
    CY.chipG = gain(0);
    chain([CY.chipSrc, CY.chipBP, CY.chipAM, CY.chipG]);
    CY.chipLfo = ac.createOscillator(); CY.chipLfo.type = 'sine'; CY.chipLfo.frequency.value = 13;
    CY.chipLfoD = gain(0.18);
    CY.chipLfo.connect(CY.chipLfoD); CY.chipLfoD.connect(CY.chipAM.gain);

    // The booster. An RC spread is a 1000 cfm primary plus a booster taking it
    // to 35 bar; the booster is a slow, heavy, unloading thing and its ~3 Hz
    // cycle is audible right across the pad.
    CY.bSub = ac.createOscillator(); CY.bSub.type = 'sine'; CY.bSub.frequency.value = 61;
    CY.bSaw = ac.createOscillator(); CY.bSaw.type = 'sawtooth'; CY.bSaw.frequency.value = 122;
    CY.bSawG = gain(0.42);
    CY.bAM = gain(0.70);
    CY.bLP = filt('lowpass', 470, 1.0);
    CY.bG = gain(0);
    CY.bSub.connect(CY.bAM); CY.bSaw.connect(CY.bSawG); CY.bSawG.connect(CY.bAM);
    chain([CY.bAM, CY.bLP, CY.bG]);
    CY.bLfo = ac.createOscillator(); CY.bLfo.type = 'triangle'; CY.bLfo.frequency.value = 3.1;
    CY.bLfoD = gain(0.30);
    CY.bLfo.connect(CY.bLfoD); CY.bLfoD.connect(CY.bAM.gain);

    CY.mix = gain(1);
    CY.roarG.connect(CY.mix); CY.chipG.connect(CY.mix); CY.bG.connect(CY.mix);
    CY.pan = pan(0.28);
    CY.out = gain(0);
    CY.mix.connect(CY.pan); CY.pan.connect(CY.out); CY.out.connect(sfxBus);
    CY.send = sendTo(0.18); CY.out.connect(CY.send);

    CY.chipLfo.start(); CY.bSub.start(); CY.bSaw.start(); CY.bLfo.start(); CY.surgeLfo.start();
    startNoise(CY.roarSrc); startNoise(CY.chipSrc);
  }

  function stepCyclone(dt) {
    if (!voiceBuilt.cyclone) return;
    const on = method.voice === 'cyclone' && engineOn;
    CY.out.gain.value = damp(CY.out.gain.value, on ? 1 : 0, 2.0, dt);
    const air = on ? clamp(tel.flush, 0, 1) : 0;
    const recov = clamp(tel.sampleRecovery, 0, 1);
    // `wet` is the sim's own wet-sample meter; it is folded in with a max
    // rather than replacing the pair, so the tell still fires on either the
    // seal going or the recovery dropping when the sim publishes neither.
    const wetDrive = on ? clamp(Math.max(clamp(tel.contamination, 0, 1),
                                         clamp(tel.wet, 0, 1),
                                         1 - recov), 0, 1) : 0;
    m.cyWet = damp(m.cyWet, wetDrive, 3.4, dt);
    // THE CHOKE. Faster than the wet tell (λ 4.2, τ 0.24 s) because carry-over
    // in the tube builds fast and the whole point of the cue is to arrive
    // before the meter does.
    m.cyChoke = damp(m.cyChoke, on ? clamp(tel.holdUp, 0, 1) : 0, 4.2, dt);
    m.cyRoar = damp(m.cyRoar, on ? (tel.active ? 0.25 + 0.75 * air : 0.30 * air) : 0, 2.4, dt);
    if (CY.out.gain.value < 0.001 && m.cyRoar < 0.002) { m.slugT = 0; return; }

    const W = clamp(m.cyWet, 0, 1);
    const C = clamp(m.cyChoke, 0, 1);
    const A2 = clamp(m.cyRoar, 0, 1);
    const rop01 = clamp(tel.rop / 40, 0, 1);

    const clean = mixf(760, 1950, Math.pow(A2, 0.6));
    CY.roarBP.frequency.value = clean * mixf(1, 0.42, W) * mixf(1, 0.62, C);
    CY.roarBP.Q.value = mixf(0.45, 1.5, W) + C * 0.9;
    CY.roarHP.frequency.value = mixf(300, 150, W);
    CY.roarG.gain.value = A2 * 0.135 * mixf(1, 0.75, W) * mixf(1, 0.66, C);
    // The surge: 2.6 → 4.4 Hz, depth 0 → 0.42. At C = 0 the depth is exactly
    // zero, so an unchoked cyclone is bit-identical to what it was before.
    CY.surgeLfo.frequency.value = mixf(2.6, 4.4, C);
    CY.surgeD.gain.value = C * 0.42;

    CY.body.frequency.value = mixf(330, 205, W);
    CY.body.Q.value = mixf(3.0, 7.5, W);
    CY.body.gain.value = W * 15;

    CY.chipBP.frequency.value = mixf(470, 790, rop01);
    CY.chipG.gain.value = (0.22 + 0.78 * rop01) * 0.075 * mixf(0.35, 1, recov) * A2;
    CY.chipLfo.frequency.value = mixf(9, 17, rop01);
    CY.chipLfoD.gain.value = 0.10 + 0.34 * W;

    CY.bG.gain.value = A2 * 0.085;
    CY.bLfo.frequency.value = mixf(2.6, 4.2, clamp(m.load, 0, 1));

    // One sample bag per metre of hole — which is how an RC hole is actually
    // logged. Rate-limited to one every 4 s so that a fast run through soft
    // ground cannot turn the bag rack into a rhythm section, and skipped
    // entirely if the recovery is too poor for there to be a bag worth tying.
    const metre = Math.floor(tel.depth);
    if (m.lastMetre < 0) m.lastMetre = metre;
    else if (metre !== m.lastMetre) {
      m.lastMetre = metre;
      if (recov > 0.25 && now() - bagAt > 4) { bagAt = now(); playShot('sample_bag', { gain: 0.35 + 0.5 * recov }); }
    }

    // Splitter slugs. The rate rises with ROP (more rock arriving) and falls
    // with poor recovery (less rock arriving). Jittered ±22 % so a steady hole
    // never turns into a machine gun.
    if (on && tel.active && A2 > 0.15) {
      m.slugT -= dt;
      if (m.slugT <= 0) {
        const rate = clamp(0.8 + 2.6 * rop01 * mixf(0.4, 1, recov), 0.3, 4);
        m.slugT = (1 / rate) * (0.78 + 0.44 * Math.random());
        playShot('cyclone_slug', { gain: 0.45 + 0.5 * recov, wet: W });
      }
    } else m.slugT = 0;

    m.methodHazard = Math.max(m.methodHazard, W * 0.8, C * 0.7);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     13b-2. TUNNEL-JUMBO — TWO MORE DRIFTERS, DELIBERATELY OUT OF PHASE
     ───────────────────────────────────────────────────────────────────────
     A three-boom face rig runs two or three drifters at once. They are
     separate hydraulic circuits with separate accumulators, so they are NEVER
     in phase and never at exactly the same rate — and that is the whole sound.
     One drifter is a machine; three drifters is a WALL.

     The main percussion voice (§12) is drifter 1. This module adds 2 and 3 as
     complete parallel copies of the train: their own bandlimited pulse
     oscillator, their own hot saturator, their own two-mode resonator (tuned
     −6 % and +9 % off drifter 1, because the three feeds are at different
     extensions so the free rod lengths differ), their own pan (∓0.43), their
     own gain.

     THE RATE OFFSETS ARE THE POINT
       drifter 2 = 1.0374 × base      drifter 3 = 0.9686 × base
     At a 50 Hz base that is 51.87 and 48.43 Hz, so the pairwise beat rates are
         |51.87 − 50.00| = 1.87 Hz
         |50.00 − 48.43| = 1.57 Hz
         |51.87 − 48.43| = 3.44 Hz
     — a slow churning flam at 1.5–3.5 Hz that never repeats. On top of that
     each drifter gets an independent ±0.6 % wander re-randomised every
     1.1–2.9 s, so the phase relationship is always sliding and the pattern can
     never lock into the false rhythm two fixed ratios eventually settle into.

     The 3rd boom is a QUALITY decision: at the low tier (MAXV 16) we run two
     drifters, at medium and high three. A phone that cannot afford the voices
     hears a two-boom jumbo, which is a real machine, not a broken one.
     ═══════════════════════════════════════════════════════════════════════ */
  function buildDrifter(ratio, panPos, ringMul) {
    const D = {};
    D.ratio = ratio;
    D.ringMul = ringMul;
    D.osc = ac.createOscillator();
    D.osc.setPeriodicWave(B.hammerWave);
    D.osc.frequency.value = 40 * ratio;
    D.pre = gain(0.30);
    D.sat = shaper(B.satCurveHot, '2x');
    D.res1 = filt('bandpass', 520 * ringMul, 6.5);
    D.res2 = filt('bandpass', 520 * ringMul * 2.756, 5.5);
    D.g1 = gain(1.0); D.g2 = gain(0.50);
    D.sum = gain(1);
    D.osc.connect(D.pre); D.pre.connect(D.sat);
    D.sat.connect(D.res1); D.sat.connect(D.res2);
    D.res1.connect(D.g1); D.res2.connect(D.g2);
    D.g1.connect(D.sum); D.g2.connect(D.sum);
    D.pan = pan(panPos);
    D.out = gain(0);
    D.sum.connect(D.pan); D.pan.connect(D.out); D.out.connect(JB.mix);
    D.osc.start();
    return D;
  }

  function buildJumbo() {
    JB.mix = gain(1);
    JB.out = gain(0);
    JB.mix.connect(JB.out);
    JB.out.connect(sfxBus);
    // 0.26 send — higher than any surface voice, because underground the room
    // is short and hard and EVERYTHING is soaked in it.
    JB.send = sendTo(0.26); JB.out.connect(JB.send);
    const r = method.boomHz || [1.0374, 0.9686];
    JB.d = [buildDrifter(r[0], -0.43, 0.94), buildDrifter(r[1], 0.44, 1.09)];
  }

  function stepJumbo(dt) {
    if (!voiceBuilt.jumbo) return;
    const on = method.voice === 'jumbo';
    JB.out.gain.value = damp(JB.out.gain.value, on ? 1 : 0, 2.4, dt);
    if (!on && JB.out.gain.value < 0.001) return;

    const base = clamp(m.blowHz, 0.2, 200);
    // (on ? 1 : 0): once the method has changed, the drifters must go quiet on
    // their OWN account and not follow the new rig's percussion while JB.out
    // is still fading. λ 4 on each drifter gets them out in ~250 ms.
    const lvl = (on ? 1 : 0) * m.percOn * (0.35 + 0.65 * tel.wob) * 0.16 * (1 - 0.4 * tel.wear);
    const three = MAXV >= 20;
    for (let i = 0; i < JB.d.length; i++) {
      const D = JB.d[i];
      m.jbWanderT[i] -= dt;
      if (m.jbWanderT[i] <= 0) {
        m.jbWanderT[i] = 1.1 + Math.random() * 1.8;
        m.jbWander[i] = (Math.random() * 2 - 1) * 0.006;
      }
      D.osc.frequency.value = clamp(base * (D.ratio + m.jbWander[i]), 0.2, 200);
      const ringF = method.ringHz * m.ringRate * D.ringMul;
      D.res1.frequency.value = clamp(ringF, 60, 4000);
      D.res2.frequency.value = clamp(ringF * 2.756, 80, 8000);
      const enable = (i === 1 && !three) ? 0 : 1;
      D.out.gain.value = damp(D.out.gain.value, lvl * (i === 0 ? 0.72 : 0.55) * enable, 4, dt);
    }
    if (!on) return;
    // Pull per round is the score here: a short round reads as tension.
    m.methodHazard = Math.max(m.methodHazard, clamp(1 - clamp(tel.roundPull, 0, 1), 0, 1) * 0.6);
    stepHoleIndex();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     13b-2b. TUNNEL-JUMBO — IT TRAMS ON DIESEL AND DRILLS ON MAINS ELECTRIC
     ───────────────────────────────────────────────────────────────────────
     This is not a detail. A face rig drives itself up the drive on a diesel,
     stops, and the crew plugs it into the mine's 1000 V reel. Then the diesel
     is SHUT DOWN and everything — the percussion, the feeds, the water pump —
     runs off an electric motor. Those are not two settings of one machine,
     they are two different noise floors, and a driller can tell you across a
     kilometre of drive which one a jumbo is on.

       DIESEL     a governed engine: the pitch MOVES. It droops under load, it
                  recovers, it wanders (§8 puts ±6 % of combustion irregularity
                  in on purpose). Its noise floor is broadband clatter locked
                  to the firing order. Nothing about it is steady.
       MAINS      a direct-on-line induction motor: the pitch DOES NOT MOVE.
                  Ever. The mains is 50 Hz whatever the rock does, so the
                  stator hum sits on 100 Hz (magnetostriction is at 2f, not f)
                  and stays there through the hardest ground in the game. Its
                  noise floor is a steady cooling fan. Load changes the LEVEL
                  and nothing else.

     That immovability is the whole cue and it costs nothing to make audible on
     a phone: 100 Hz is inaudible on the speaker, but its harmonics 3–20 land
     at 300–2000 Hz, which is the middle of the band, and a perfectly periodic
     harmonic stack against a wandering diesel is about as easy a discrimination
     as the ear performs.

     GRAPH (all built lazily, only for a method with power:'dual')
       HUM   saw (60 → 100 Hz) ─► pk 400 Hz Q 1.1 +6 dB ─► lp 2200 Hz ─► humG
       SLOT  sine (400 → 1180 Hz) ─► bp Q 7 ─► slotG
             [the rotor-slot passing tone. A 4-pole 50 Hz motor turns at about
              24.7 rev/s, so with 48 rotor slots the passing tone is 1186 Hz.
              It is the brightest thing the motor makes and the only part of
              it a small speaker really reproduces.]
       FAN   pink ─► bp 900 Hz Q 0.8 ─► fanG      [the motor's own cooling fan:
             the electric noise FLOOR, and it does not vary]
       ─► mix ─► pan −0.3 ─► out ─► sfxBus (+0.20 send)

     THE TRANSFER IS ASYMMETRIC, BECAUSE THE MACHINES ARE
       CLOSING (diesel → mains): the contactor clacks, the motor DOL-starts and
         the hum and the slot tone SWEEP UP over ~1.3 s (m.elSpin, λ 2.6) while
         the diesel winds down over ~2.5 s (m.mains ramps the engine's rpm
         target and its output gain together, so you hear it die, not mute).
       OPENING (mains → diesel): the contactor drops out and the electric bed
         stops DEAD — m.elSpin releases at λ 12, τ = 83 ms. An induction motor
         off the line makes no noise at all; there is no run-down to hear
         because there is nothing burning. Then the diesel cranks.

     THE PUMP GIVES IT AWAY TOO, AND FOR FREE
       §9's pump note tracks the prime mover. On diesel that is m.fireHz, so
       the pack's 117–315 Hz whine droops with the engine. On mains the pump is
       turned at a CONSTANT 24.7 rev/s, so the 9-piston passing frequency is
       pinned at 222 Hz and does not move under load. m.driveHz/m.driveSpd
       carry that crossfade, and for every method that is not power:'dual' they
       are m.fireHz and m.rpm01 exactly, so nothing else changes by a sample.

     WHEN. Derived, not asked for: a jumbo is on mains when it is drilling and
     on the diesel when it is not, because tramming is the only reason to run
     the engine. tel.powerMode overrides it if the sim ever wants to say so.
     A 1.1 s debounce stops a rod change or a short pause from flapping the
     contactor, which would be both wrong and unpleasant.
     ═══════════════════════════════════════════════════════════════════════ */
  const EL = {};
  let mainsBuilt = false;
  /** Constant prime-mover speed on mains: a 4-pole motor on a 50 Hz supply
   *  runs at ~1480 rpm = 24.67 rev/s with slip. Everything electric in this
   *  module is derived from that one number. */
  const EL_SHAFT_HZ = 24.67;
  const EL_HUM_HZ = 100;            // magnetostriction is at 2 × line, not line
  const EL_SLOT_HZ = EL_SHAFT_HZ * 48;   // 48 rotor slots → 1184 Hz
  /** §9 derives the pump's 9-piston passing frequency as driveHz × 3, because
   *  on the diesel driveHz is the FIRING rate and firing = shaft × 3. So the
   *  electric prime mover has to be expressed in the same currency: 24.67 × 3
   *  = 74.0, which comes back out of §9 as 9 × 24.67 = 222 Hz, pinned. */
  const EL_FIRE_EQUIV = EL_SHAFT_HZ * 3;
  /** How long a settled request must stand before the contactor moves. */
  const MAINS_HOLD_SEC = 4.0;

  function buildMains() {
    if (mainsBuilt || !built) return;
    mainsBuilt = true;

    EL.hum = ac.createOscillator(); EL.hum.type = 'sawtooth'; EL.hum.frequency.value = EL_HUM_HZ;
    EL.humPk = filt('peaking', 400, 1.1, 6);
    EL.humLP = filt('lowpass', 2200, 0.8);
    EL.humG = gain(0);
    chain([EL.hum, EL.humPk, EL.humLP, EL.humG]);

    EL.slot = ac.createOscillator(); EL.slot.type = 'sine'; EL.slot.frequency.value = EL_SLOT_HZ;
    EL.slotBP = filt('bandpass', EL_SLOT_HZ, 7);
    EL.slotG = gain(0);
    chain([EL.slot, EL.slotBP, EL.slotG]);

    EL.fanSrc = noiseSrc(B.pink, 1);
    EL.fanBP = filt('bandpass', 900, 0.8);
    EL.fanG = gain(0);
    chain([EL.fanSrc, EL.fanBP, EL.fanG]);

    EL.mix = gain(1);
    EL.humG.connect(EL.mix); EL.slotG.connect(EL.mix); EL.fanG.connect(EL.mix);
    EL.pan = pan(-0.30);
    EL.out = gain(0);
    EL.mix.connect(EL.pan); EL.pan.connect(EL.out); EL.out.connect(sfxBus);
    EL.send = sendTo(0.20); EL.out.connect(EL.send);

    EL.hum.start(); EL.slot.start(); startNoise(EL.fanSrc);
  }

  /**
   * The prime mover. Runs BEFORE stepHydraulic() every frame — for every
   * method without power:'dual' it is four assignments and an early return,
   * and m.driveHz/m.driveSpd come out as m.fireHz/m.rpm01 unchanged.
   */
  function stepPower(dt) {
    const dual = method.power === 'dual';

    if (!dual) {
      m.mainsWant = 0;
      m.mains = damp(m.mains, 0, 3.0, dt);
      m.mainsHold = 0;
    } else {
      // The sim may say so outright. If it does not, derive it: "at the face
      // and working", which is drilling OR still percussing, so that
      // collaring, a boom re-position and the gap between two holes of the
      // same round all read as ON the reel. Nobody unplugs a jumbo to move a
      // boom, and tramming is the only reason to burn diesel at the face.
      let want;
      if (tel.powerMode === 'mains' || tel.powerMode === 'electric') want = 1;
      else if (tel.powerMode === 'diesel' || tel.powerMode === 'tram') want = 0;
      else want = (engineOn && (tel.active || m.percOn > 0.05)) ? 1 : 0;
      // Debounce: MAINS_HOLD_SEC of a settled request before the contactor
      // moves. It is deliberately long. A jumbo plugs in once, drills forty
      // holes and unplugs after the round; the gaps inside a round are seconds
      // and must not touch it, while charging and firing is far longer than
      // this and correctly does. Short enough to still be a heard consequence
      // of what the player did, long enough that it can never chatter — and a
      // chattering 1000 V contactor is both wrong and horrible.
      if (want !== m.mainsWant) {
        m.mainsHold += dt;
        if (m.mainsHold >= MAINS_HOLD_SEC) { m.mainsHold = 0; m.mainsWant = want; }
      } else m.mainsHold = 0;
      const prev = m.mains;
      m.mains = damp(m.mains, m.mainsWant, 1.1, dt);
      // The contactor, on the crossing. One shot per transfer, both directions,
      // and they are not the same sound (see the header).
      if (prev < 0.5 && m.mains >= 0.5) playShot('power_transfer', { close: 1 });
      else if (prev >= 0.5 && m.mains < 0.5) playShot('power_transfer', { close: 0 });
    }

    // The prime mover the pump is hung off. Diesel → the engine's own firing
    // rate; mains → a constant. Crossfaded so the pack's note slides from
    // "drooping with the engine" to "pinned", which is the tell in §9.
    const M = clamp(m.mains, 0, 1);
    m.driveHz = mixf(m.fireHz, EL_FIRE_EQUIV, M);
    m.driveSpd = mixf(m.rpm01, 1, M);

    if (!mainsBuilt) return;

    // DOL start / instant stop. Up λ 2.6 (τ 0.38 s), down λ 12 (τ 83 ms).
    const wantSpin = M > 0.5 ? 1 : 0;
    m.elSpin = damp(m.elSpin, wantSpin, wantSpin > m.elSpin ? 2.6 : 12, dt);

    const S = clamp(m.elSpin, 0, 1);
    EL.out.gain.value = damp(EL.out.gain.value, S, 6, dt);
    if (S < 0.002) { EL.humG.gain.value = 0; EL.slotG.gain.value = 0; EL.fanG.gain.value = 0; return; }

    // The run-up sweep. At S = 1 both land exactly on their electrical values
    // and STAY there — load moves the level below, never the frequency.
    EL.hum.frequency.value = mixf(60, EL_HUM_HZ, S);
    EL.slot.frequency.value = mixf(400, EL_SLOT_HZ, S);
    EL.slotBP.frequency.value = EL.slot.frequency.value;

    // Load: an electric machine gets LOUDER, not slower. The hum grows because
    // the stator current grows; the slot tone grows with torque.
    const L = clamp(m.load, 0, 1);
    EL.humG.gain.value = S * (0.052 + 0.048 * L);
    EL.humPk.gain.value = mixf(6, 9, L);
    EL.slotG.gain.value = S * (0.014 + 0.026 * L);
    EL.fanG.gain.value = S * 0.030;                 // the floor, and it is flat
  }

  /* ═══════════════════════════════════════════════════════════════════════
     13b-3. LONGHOLE — THE BLOW ARRIVES THROUGH THE ROD STRING
     ───────────────────────────────────────────────────────────────────────
     An ITH hammer is at the BOTTOM of a 15–45 m hole. You are standing at the
     collar. What reaches you is not the blow — it is the blow after it has
     travelled the whole rod string, and the string is a lossy, dispersive,
     low-pass waveguide.

     GRAPH (inserted in parallel with the existing accent path)
       P.accentBus ─┬─► P.accentDry (1.0 → 0.18 when ITH is active) ─► P.mix
                    └─► delay (4 → 85 ms) ─► lp (3.2 kHz → 620 Hz)
                        ─► pk (520 → 190 Hz, +2 → +9 dB) ─► dhG ─► P.mix
       rub: brown ─► bp (620→980 Hz) ─► AM at the rotation rate ─► rubG ─► P.mix

     THE DELAY IS DELIBERATELY 5× LIFE-SIZE, AND HERE IS WHY
       Steel carries a longitudinal wave at ~5100 m/s, so 30 m of rod is really
       5.9 ms. Below about 15 ms the ear FUSES an echo with its source (the
       precedence effect) and hears no delay at all — only a slightly odd
       timbre. A physically exact delay would therefore be inaudible and the
       "down a hole" cue would not exist. So we use 0.90 ms/m: 4 ms at the
       collar, 31 ms at 30 m, 85 ms at the 90 m clamp. That crosses the fusion
       threshold at about 12 m, which is exactly where a longhole starts
       feeling like a longhole.

     THE FILTER IS LIFE-SIZE
       Attenuation in a jointed rod string rises steeply with frequency: every
       threaded coupling is an impedance mismatch that reflects the top octave.
       3.2 kHz at the collar down to 620 Hz at 60 m is a fair model of a string
       with a coupling every 1.5 m, and the 190 Hz peak that grows with depth
       is the rod/air column mode that replaces it.

     PITCH AND DECAY WITH DEPTH
       m.ringExtra multiplies the normal rod-count playback rate by
       1 − 0.34·(depth/45), so a 45 m hole plays the string buffer at 0.66×:
       the ring drops a perfect fifth AND lengthens by 1.5×, together, because
       playbackRate couples them — the same trick §12 uses for rod count.

     DEVIATION
       tel.deviation drives a rubbing layer: brown noise at 620–980 Hz gated at
       the rotation rate. A hole going off line is a string dragging on the
       wall, and that is what dilution sounds like before the survey says so.

     UPHOLE VERSUS DOWNHOLE — THE LOUDEST DIFFERENCE ON THE RIG
       Half a production fan is drilled UP. It is the same hammer and the same
       rod, and it does not sound remotely the same, because gravity is now
       working against the flush instead of with it:

         DOWNHOLE  the cuttings go away from you. What returns at the collar is
                   air, and it leaves through a hole pointing at the floor.
         UPHOLE    everything you put up the hole comes back DOWN it and out
                   over the collar onto the boom, the platform and the driller.
                   A production driller on upholes is standing under a
                   continuous wet fall of cuttings and water. It is the
                   defining discomfort of the job and it is extremely audible.

       So an uphole adds a FLUSH-BACK layer: pink noise through a bandpass at
       430 → 900 Hz, gated by a triangle at 5–11 Hz at depth 0.55 — irregular,
       not a tremolo, because a fall of wet grit is lumpy. Its level tracks the
       flush control, which makes the sim's `uphole-flush` hazard ("CUT THE
       FLUSH") audible as a cause rather than as an alarm: turn the flush up on
       an uphole and you can hear it drowning before the meter says so.

       The room gets involved as well. On an uphole the collar is above head
       height and the back of the drive is a metre from the bit, so the send
       goes 0.95 → 1.35 of nominal: the whole voice sits closer to the rock.
       Two layers, six nodes, and at uphole = 0 all of it is exactly zero.
     ═══════════════════════════════════════════════════════════════════════ */
  function buildITH() {
    DH.delay = ac.createDelay(0.12);
    DH.delay.delayTime.value = 0.006;
    DH.lp = filt('lowpass', 3200, 0.9);
    DH.pk = filt('peaking', 420, 2.2, 2);
    DH.g = gain(0);
    P.accentBus.connect(DH.delay);
    chain([DH.delay, DH.lp, DH.pk, DH.g]);
    DH.g.connect(P.mix);

    DH.rubSrc = noiseSrc(B.brown, 1);
    DH.rubBP = filt('bandpass', 700, 2.6);
    DH.rubAM = gain(0.70);
    DH.rubG = gain(0);
    chain([DH.rubSrc, DH.rubBP, DH.rubAM, DH.rubG]);
    DH.rubG.connect(P.mix);
    DH.rubLfo = ac.createOscillator(); DH.rubLfo.type = 'sine'; DH.rubLfo.frequency.value = 2;
    DH.rubLfoD = gain(0.35);
    DH.rubLfo.connect(DH.rubLfoD); DH.rubLfoD.connect(DH.rubAM.gain);

    // THE FLUSH-BACK (upholes only — see the header). Its own send, because it
    // is happening at the collar in the room rather than 30 m down a hole, so
    // it must not be filtered by the rod-string path above it.
    DH.fbSrc = noiseSrc(B.pink, 1);
    DH.fbBP = filt('bandpass', 430, 1.3);
    DH.fbAM = gain(0.72);
    DH.fbG = gain(0);
    chain([DH.fbSrc, DH.fbBP, DH.fbAM, DH.fbG]);
    DH.fbG.connect(P.mix);
    // 0.34, the wettest send in the file. Wet grit falling onto a steel boom in
    // a 4 m drive is about as reverberant as this game gets, and it is the
    // clearest single reason an uphole does not sound like a downhole.
    DH.fbSend = sendTo(0.34); DH.fbG.connect(DH.fbSend);
    DH.fbLfo = ac.createOscillator(); DH.fbLfo.type = 'triangle'; DH.fbLfo.frequency.value = 7;
    DH.fbLfoD = gain(0.55);
    DH.fbLfo.connect(DH.fbLfoD); DH.fbLfoD.connect(DH.fbAM.gain);

    DH.rubLfo.start(); DH.fbLfo.start(); startNoise(DH.rubSrc); startNoise(DH.fbSrc);
  }

  function stepITH(dt) {
    if (!voiceBuilt.ith) return;
    const on = method.voice === 'ith';
    DH.g.gain.value = damp(DH.g.gain.value, on ? 0.95 : 0, 3.0, dt);
    P.accentDry.gain.value = damp(P.accentDry.gain.value, on ? 0.18 : 1.0, 3.0, dt);
    if (!on && DH.g.gain.value < 0.002) { DH.rubG.gain.value = 0; DH.fbG.gain.value = 0; return; }

    const dep = clamp(tel.depth, 0, 90);
    const d60 = clamp(dep / 60, 0, 1);
    m.ithDelay = damp(m.ithDelay, clamp(0.004 + dep * 0.00090, 0.004, 0.085), 1.2, dt);
    DH.delay.delayTime.value = m.ithDelay;
    m.ithLP = damp(m.ithLP, mixf(3200, 620, d60), 1.0, dt);
    DH.lp.frequency.value = m.ithLP;
    DH.pk.frequency.value = mixf(520, 190, d60);
    DH.pk.gain.value = mixf(2, 9, d60);

    // tel.deviation is in the flat telemetry's own units (÷8 → 0..1); devCue
    // is the sim's `deviationCue01`, already 0..1 and deliberately the ONLY
    // deviation reading a production driller gets before the ring is surveyed.
    // Take whichever is louder so the voice works with either publisher.
    const dev = clamp(Math.max(tel.deviation / 8, clamp(tel.devCue, 0, 1)), 0, 1);
    DH.rubBP.frequency.value = mixf(620, 980, dev);
    DH.rubLfo.frequency.value = clamp(m.shaftHz, 0.05, 12);
    DH.rubG.gain.value = damp(DH.rubG.gain.value, (tel.active ? 1 : 0) * dev * 0.085, 2.5, dt);

    // THE FLUSH-BACK. λ 1.6 (τ 0.63 s) on the uphole state so that stepping
    // from a downhole to an uphole between fan holes is a fade, not a switch.
    m.upHole = damp(m.upHole, (on && tel.uphole === true) ? 1 : 0, 1.6, dt);
    const U = clamp(m.upHole, 0, 1);
    const fl = clamp(tel.flush, 0, 1);
    DH.fbBP.frequency.value = mixf(430, 900, fl);
    DH.fbLfo.frequency.value = mixf(5, 11, fl);
    DH.fbG.gain.value = damp(DH.fbG.gain.value,
      U * (tel.active ? 1 : 0) * (0.12 + 0.88 * fl) * 0.075, 2.2, dt);

    if (!on) return;
    m.methodHazard = Math.max(m.methodHazard, dev * 0.7, U * fl * 0.45);
    stepHoleIndex();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     13b-4. ROCKBOLT — RESIN CARTRIDGES PUNCTURED AND SPUN
     ───────────────────────────────────────────────────────────────────────
     The drilling is ordinary. The signature sound of ground support is the
     twenty seconds AFTER it: the bolt is pushed up the hole, it bursts the
     polyester cartridges, and then it SPINS in the resin. That is a wet
     granular mixing noise — thick, low, and unmistakably not dry.

     GRAPH
       WET     brown(1.1×) ─► bp (320→820 Hz, Q 1.5)
                           ─► AM gated at 3× shaft rate, depth 0.40 ─► wetG
       GRAIN   pink ─► bp (1200→2600 Hz, Q 1.1)
                    ─► AM gated at 4.5× shaft rate, depth 0.34 ─► grainG
       ─► mix ─► pan 0 ─► out ─► sfxBus (+0.20 send)

     WHY TWO GATE RATES, AND WHY THOSE MULTIPLES
       A resin bolt has a chisel-cut or paddle end, so the mixing is not
       smooth — the cartridge film and the aggregate get caught and released
       several times per revolution. 3× (the bolt's own lobes) and 4.5× (the
       thread dragging) are mutually irrational, so the two layers never lock
       and the texture stays granular instead of turning into a tremolo. Both
       track m.shaftHz, so mixing faster is audibly mixing faster — the WORK
       control doing something you can hear.

     THE HOLD TIME IS SILENCE
       The moment tel.holdTime goes non-zero the drive is forced to 0, and the
       release λ is 9 (τ = 0.11 s) against an attack λ of 4. The mixing stops
       almost instantly and then you hold the bolt still while the resin gels.
       That abrupt stop IS the hold timer — the player hears the clock start.

     ── AND THEN THE CLOCK HAS TO BE LEGIBLE ────────────────────────────────
       Stopping is only half of it. gelSec is a timer the player is waiting
       out, and a wait with an audible start, no middle and no end is not a
       mechanic, it is a dead patch. Three things carry it, and not one of them
       is a beep:

       1. IT STARTS. The mixing dies in ~110 ms. Already true; unchanged.

       2. IT RUNS. A resin bolt is held at constant thrust while it cures, and
          the feed circuit is dead-headed against the bolt with the pump on
          relief. That is a real, narrow, absolutely steady tone — and a
          hydraulic accumulator holding a static load BLEEDS, so the tone falls
          slowly: 620 Hz at the start of the hold to 470 Hz at the end, a minor
          third over the whole clock. Nothing else in the file moves that
          slowly, and a slow monotone glide is about the most legible "time is
          passing" a sound can be without counting at you. Level 0.022 — under
          everything, and deliberately sitting 300 Hz clear of the pump's
          fundamental so it cannot be mistaken for it.
          The glide needs a CLOCK, and the sim publishes one: the install is a
          beat, so telemetry.beat.t / .dur is the fraction elapsed. With no
          beat published it holds at the start of the glide and simply does not
          move, which is honest — we do not know how long is left, so we do not
          claim to.

       3. IT ENDS. m.boHold falling fires `resin_set`: the relief drops off,
          the thrust comes back, the boom breathes out. That release is the
          "you can move now" and it is the same information the plate beat
          gives the player visually, half a second earlier.

     FALLBACK: if the sim never writes resinMix we derive it from rotation ×
     thrust with a −0.15 offset, so idle rotation with no thrust cannot fake it.
     The HOLD is derived the same way and from the player's own hand: a bolt
     install beat with the rotation stopped IS the hold, which is exactly the
     answer the sim's `gel-clock` hazard is asking for ("STOP THE ROTATION").
     ═══════════════════════════════════════════════════════════════════════ */
  function buildBolter() {
    BO.wetSrc = noiseSrc(B.brown, 1.1);
    BO.wetBP = filt('bandpass', 420, 1.5);
    BO.wetAM = gain(0.55);
    BO.wetG = gain(0);
    chain([BO.wetSrc, BO.wetBP, BO.wetAM, BO.wetG]);
    BO.lfo = ac.createOscillator(); BO.lfo.type = 'triangle'; BO.lfo.frequency.value = 8;
    BO.lfoD = gain(0.40);
    BO.lfo.connect(BO.lfoD); BO.lfoD.connect(BO.wetAM.gain);

    BO.grSrc = noiseSrc(B.pink, 1);
    BO.grBP = filt('bandpass', 1700, 1.1);
    BO.grAM = gain(0.60);
    BO.grG = gain(0);
    chain([BO.grSrc, BO.grBP, BO.grAM, BO.grG]);
    BO.lfo2 = ac.createOscillator(); BO.lfo2.type = 'sine'; BO.lfo2.frequency.value = 12;
    BO.lfo2D = gain(0.34);
    BO.lfo2.connect(BO.lfo2D); BO.lfo2D.connect(BO.grAM.gain);

    // THE HOLD TONE. One oscillator, one resonator, one gain — the whole
    // clock. Triangle rather than saw so it is a tone and not a buzz; it has
    // to be legible at 0.022 on a phone speaker without ever being a texture.
    BO.holdOsc = ac.createOscillator(); BO.holdOsc.type = 'triangle'; BO.holdOsc.frequency.value = 620;
    BO.holdPk = filt('peaking', 620, 4.0, 8);
    BO.holdG = gain(0);
    chain([BO.holdOsc, BO.holdPk, BO.holdG]);

    BO.mix = gain(1);
    BO.wetG.connect(BO.mix); BO.grG.connect(BO.mix); BO.holdG.connect(BO.mix);
    BO.pan = pan(0.0);
    BO.out = gain(0);
    BO.mix.connect(BO.pan); BO.pan.connect(BO.out); BO.out.connect(sfxBus);
    BO.send = sendTo(0.20); BO.out.connect(BO.send);

    BO.lfo.start(); BO.lfo2.start(); BO.holdOsc.start();
    startNoise(BO.wetSrc); startNoise(BO.grSrc);
  }

  function stepBolter(dt) {
    if (!voiceBuilt.bolter) return;
    const on = method.voice === 'bolter';
    BO.out.gain.value = damp(BO.out.gain.value, on ? 1 : 0, 2.5, dt);
    if (!on && BO.out.gain.value < 0.002) {
      BO.wetG.gain.value = 0; BO.grG.gain.value = 0; BO.holdG.gain.value = 0;
      m.boHold = 0; m.boHoldWas = 0; m.boHoldLeft = 1;
      return;
    }

    // THE HOLD. Believe the sim's timer if it publishes one; otherwise derive
    // it from what the player is actually doing, which is the mechanic: an
    // install beat is running and the rotation has stopped.
    const installing = tel.phase === 'bolt-install' ? 1 : 0;
    const holding = (clamp(tel.holdTime, 0, 1) > 0.02
                     || (on && installing && clamp(tel.rpm, 0, 1) <= 0.12)) ? 1 : 0;
    const given = clamp(tel.resinMix, 0, 1);
    const derived = tel.active ? clamp(tel.rpm * tel.wob * 1.5 - 0.15, 0, 1) : 0;
    const drive = (on ? 1 : 0) * (given > 0.001 ? given : derived) * (1 - holding) * (tel.active ? 1 : 0);
    const prev = m.boMix;
    m.boMix = damp(m.boMix, drive, drive > prev ? 4.0 : 9.0, dt);

    if (prev < 0.12 && m.boMix >= 0.12 && m.boWasMixing < 0.5) {
      m.boWasMixing = 1;
      playShot('resin_puncture', { gain: 0.9 });
    } else if (m.boMix < 0.05) m.boWasMixing = 0;

    const M2 = clamp(m.boMix, 0, 1);
    const spin = clamp(m.shaftHz, 0.05, 12);
    BO.lfo.frequency.value = clamp(spin * 3.0, 0.2, 40);
    BO.lfo2.frequency.value = clamp(spin * 4.5, 0.2, 60);
    BO.wetBP.frequency.value = mixf(320, 820, M2);
    BO.wetG.gain.value = M2 * 0.105;
    BO.grBP.frequency.value = mixf(1200, 2600, M2);
    BO.grG.gain.value = M2 * 0.042;

    // ── the clock (see the header) ────────────────────────────────────────
    // The beat's own progress if there is one, otherwise held at the top of
    // the glide: we do not know how long is left, so the tone does not pretend.
    const bd0 = tel.beatDur;
    if (holding) {
      if (m.boHoldWas < 0.5) { m.boHoldLeft = 1; m.boHoldT = 0; }   // a new clock
      m.boHoldT += dt;
      // With a beat we know the fraction elapsed and the tone glides. Without
      // one we do not, and it stays put rather than inventing a duration.
      if (bd0 > 0.05) m.boHoldLeft = damp(m.boHoldLeft, 1 - clamp(tel.beatT / bd0, 0, 1), 5, dt);
    }
    m.boHold = damp(m.boHold, holding, holding ? 5 : 8, dt);
    const HD = clamp(m.boHold, 0, 1);
    BO.holdOsc.frequency.value = mixf(470, 620, clamp(m.boHoldLeft, 0, 1));
    BO.holdPk.frequency.value = BO.holdOsc.frequency.value;
    BO.holdG.gain.value = HD * 0.022;
    // The release. Edge-detected on the DISCRETE state so a smoothing tail can
    // never fire it twice, and gated on the clock having actually run: coming
    // off a hold you abandoned after 200 ms is not a set resin bolt, and
    // saying that it is would be the one dishonest sound in the method.
    if (m.boHoldWas > 0.5 && holding === 0) {
      m.boHoldWas = 0;
      if (on && m.boHoldT > 1.0) playShot('resin_set', { gain: 0.8 });
      m.boHoldT = 0; m.boHoldLeft = 1;
    } else if (holding === 1) m.boHoldWas = 1;

    if (!on) return;
    // THE TORQUE TEST that closes an install. NOT statutory at a stated rate —
    // the "first, every tenth, last" rule was cited to a source that does not
    // contain it (see research/03-mining.md). 29 CFR 1926.800(o)(3)(iv)(A)
    // requires torque wrenches for ground support; it sets no sample rate.
    // sim's own pending flag — never on a level, which is the mistake that
    // turned a compliance sample into a metronome (21 wrenches in 90 s).
    const tq = clamp(tel.boltTorque, 0, 1);
    const pend = tel.torquePending === true ? 1 : 0;
    if (pend) boTqSeen = 1;
    if (pend && !boTqWas && now() - boTorqueAt > 2) { boTorqueAt = now(); playShot('torque_wrench'); }
    boTqWas = pend;
    // Fallback for a sim that publishes no pending flag at all: the old
    // level trigger, gated so it can never run alongside the edge above.
    if (!boTqSeen && tq > 0.55 && now() - boTorqueAt > 4) { boTorqueAt = now(); playShot('torque_wrench'); }

    // Anchorage is the score here: a bolt held to torque is a calm bolt.
    m.methodHazard = Math.max(m.methodHazard, clamp(0.55 - tq, 0, 1) * (holding ? 0.8 : 0.2));
  }

  /* ═══════════════════════════════════════════════════════════════════════
     13b-5. DRIVEN PILE — 30 TO 100 BLOWS/MIN, EACH ONE ENORMOUS
     ───────────────────────────────────────────────────────────────────────
     No rotation. No flush. No train. This method's voice is a scheduler that
     fires one very large one-shot between 0.5 and 1.67 times a second, plus
     the hammer's own hydraulics lifting the ram between blows.

     THE POWER HYPERBOLA (GAMEDESIGN §7)
       "A piling hammer that delivers 235 kNm does 30 blows/min; the same
        machine at 12 kNm does 100 — it is one power hyperbola."
       Those two points fit E·f^p = constant exactly:
           235 · 30^p = 12 · 100^p
           p = ln(235/12) / ln(100/30) = 2.9752 / 1.2040 = 2.4711
       so   E(f) = 235 · (30/f)^2.468       f(E) = 30 · (235/E)^(1/2.468)
       Check: f = 100 → E = 235 · 0.3^2.468 = 12.0 kNm ✓
              f = 50  → E = 235 · 0.6^2.468 = 66.5 kNm
       We read whichever of the two the sim publishes and derive the other, so
       the audio is on the curve whether the sim exposes energy or rate.

     HEARING WHICH END YOU ARE ON — four things move together:
       strike centroid  2600 Hz at 12 kNm → 1050 Hz at 235 kNm
                        (contact time grows with ram mass, so the impulse gets
                         longer and its spectrum lower — real physics, and by
                         far the strongest of the four cues)
       attack           1.2 ms → 3.5 ms   (same reason)
       level            0.30 → 0.92 peak  (√ law, not linear: 20× the energy is
                        only ~13 dB, and anything more would eat the limiter
                        alive at 100 blows/min)
       rate             1.67/s → 0.50/s
     At the light end you hear a fast, bright, snappy machine; at the heavy end
     a slow enormous one. You cannot have both, and you can hear which you have.

     THE LIFT (this module's only continuous element)
       pink ─► bp (700→1250 Hz) ─► AM by a SINE at the blow rate ─► liftG
       A hydraulic hammer spends most of its cycle raising the ram, and that is
       an audible flow of oil. Gating it with a sine (rather than the narrow
       pulse the blows use) puts its energy BETWEEN the blows, which is exactly
       where the ram is.
     ═══════════════════════════════════════════════════════════════════════ */
  function buildPile() {
    PL.liftSrc = noiseSrc(B.pink, 1);
    PL.liftBP = filt('bandpass', 900, 1.2);
    PL.liftAM = gain(0.50);
    PL.liftG = gain(0);
    chain([PL.liftSrc, PL.liftBP, PL.liftAM, PL.liftG]);
    PL.lfo = ac.createOscillator(); PL.lfo.type = 'sine'; PL.lfo.frequency.value = 1;
    PL.lfoD = gain(0.45);
    PL.lfo.connect(PL.lfoD); PL.lfoD.connect(PL.liftAM.gain);

    PL.mix = gain(1);
    PL.liftG.connect(PL.mix);
    PL.pan = pan(-0.12);
    PL.out = gain(0);
    PL.mix.connect(PL.pan); PL.pan.connect(PL.out); PL.out.connect(sfxBus);
    PL.send = sendTo(0.22); PL.out.connect(PL.send);

    PL.lfo.start(); startNoise(PL.liftSrc);
  }

  /* Reused param object for the pile scheduler: the frame loop allocates
     nothing, and playShot() never retains the object past the call. */
  const PILE_P = { energy: 0.5, refusal: 0, length: 20, material: 'steel', embed: 0, deviation: 0, broom: 0, gain: 1 };

  function stepPile(dt) {
    if (!voiceBuilt.pile) return;
    const on = method.voice === 'pile';
    PL.out.gain.value = damp(PL.out.gain.value, on ? 1 : 0, 2.5, dt);
    if (!on) {
      m.discrete = damp(m.discrete, 0, 4, dt);
      PL.liftG.gain.value = damp(PL.liftG.gain.value, 0, 4, dt);
      // Toe damage belongs to ONE pile. Releasing it here means the next
      // contract starts on an intact toe rather than inheriting the last
      // pile's ruin, which is what the sim does too.
      m.plBroom = damp(m.plBroom, 0, 3, dt);
      m.plPhase = 0;
      return;
    }

    let e01, rateMin;
    if (tel.blowRate > 0.5) {
      rateMin = clamp(tel.blowRate, 20, 130);
      const kNm = 235 * Math.pow(30 / rateMin, 2.468);
      e01 = clamp((kNm - 12) / 223, 0, 1);
    } else {
      e01 = clamp(tel.hammerEnergy, 0, 1);
      const kNm = mixf(12, 235, e01);
      rateMin = clamp(30 * Math.pow(235 / Math.max(kNm, 1), 1 / 2.468), 20, 130);
    }
    m.plEnergy = damp(m.plEnergy, e01, 3.0, dt);
    m.plRate = damp(m.plRate, rateMin / 60, 2.5, dt);
    m.dBlowHz = m.plRate;
    m.discrete = damp(m.discrete, tel.active ? 1 : 0, 4, dt);

    // Refusal: believe the sim if it says so, otherwise derive it from the
    // set. 20 mm/blow is a pile running free; 0 mm/blow is refusal.
    // NOTE that the set we derive from is the MEASURED set — the same lying
    // instrument the player's gauge reads. That is deliberate: see the broom
    // note below. The audio must not be given a truth the driller has not got.
    const setMm = Number.isFinite(tel.setMm) ? clamp(tel.setMm, 0, 60) : 25;
    const refDerived = clamp(1 - setMm / 20, 0, 1);
    m.plRefusal = damp(m.plRefusal, Math.max(clamp(tel.refusal, 0, 1), refDerived), 2.0, dt);

    // THE BROOM. λ 1.5 (τ = 0.67 s). Slower than the energy and rate smoothers
    // because toe damage is cumulative and never recovers — a fast smoother
    // would only add noise to a number that already only goes one way.
    m.plBroom = damp(m.plBroom, clamp(tel.toeDamage, 0, 1), 1.5, dt);

    PL.lfo.frequency.value = clamp(m.plRate, 0.2, 4);
    PL.liftBP.frequency.value = mixf(700, 1250, m.plEnergy);
    PL.liftG.gain.value = damp(PL.liftG.gain.value,
      (tel.active ? 1 : 0) * 0.030 * (0.4 + 0.6 * m.plEnergy), 3, dt);

    // tel.driving, not just tel.active: taking the set, changing the dolly and
    // pitching the next pile are all live phases on a loud site during which
    // nothing is being hit, and blows through them would make the blow count —
    // which IS the instrument on this method — a fiction. Defaults to true, so
    // a sim that never publishes it behaves exactly as before.
    if (tel.active && tel.driving !== false && m.plRate > 0.05) {
      m.plPhase += m.plRate * dt;
      while (m.plPhase >= 1) {
        m.plPhase -= 1;
        PILE_P.energy = m.plEnergy;
        PILE_P.refusal = m.plRefusal;
        PILE_P.length = tel.pileLength;
        PILE_P.material = tel.pileType;
        PILE_P.embed = clamp(tel.embedment / Math.max(tel.pileLength, 1), 0, 1);
        PILE_P.deviation = clamp(tel.deviation / 8, 0, 1);
        PILE_P.broom = clamp(m.plBroom, 0, 1);
        PILE_P.gain = 1;
        playShot('pile_blow', PILE_P);
      }
    } else m.plPhase = 0;

    // A broomed pile does not bounce, so the refusal verdict is suppressed as
    // the toe goes: the ram is not rebounding off rock, it is driving a
    // crushed end into the ground. Firing the rebound voice here would be the
    // audio telling the same lie as the gauge, and it is the one thing this
    // method must never do.
    if (m.plRefusal > 0.85 && m.plBroom < 0.45 && now() - plRefusalAt > 6) {
      plRefusalAt = now();
      PILE_P.length = tel.pileLength;
      playShot('pile_refusal', PILE_P);
    }
    m.methodHazard = Math.max(m.methodHazard,
      clamp(tel.deviation / 8, 0, 1) * 0.6 + m.plRefusal * 0.35,
      clamp(m.plBroom, 0, 1) * 0.9);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     13b-6. SITE INVESTIGATION — SPT COUNTS, CPT WHISPERS
     ───────────────────────────────────────────────────────────────────────
     Two completely different sounds behind one method id, switched by
     tel.pushMode.

     SPT — a scheduler firing spt_drop at 20–45 blows/min. All the physics is
     in the one-shot; the module only owns the rate and the N pass-through.

     CPT — the only quiet thing in this game, and the silence is the feature.
       ram   saw 34→44 Hz ─► pk 165 Hz (+4→+9 dB) ─► lp 270 Hz
             ─► AM at 0.85 Hz (the pump strokes) ─► ramG (peak 0.026)
       plus a sparse steel_groan (§18, reused) as the reaction frame takes
       load — rarer when the push is light, more often as the cone loads up.
     A CPT push sits about 26 dB under a hammer blow, and on top of that
     method.trim (0.50) and m.quiet pull the engine, hydraulics and score back
     as well. Nothing about it is loud, and after ten minutes of top hammer it
     is genuinely startling.
     ═══════════════════════════════════════════════════════════════════════ */
  function buildSI() {
    SI.ramSaw = ac.createOscillator(); SI.ramSaw.type = 'sawtooth'; SI.ramSaw.frequency.value = 38;
    SI.ramPk = filt('peaking', 165, 3.0, 7);
    SI.ramLP = filt('lowpass', 270, 1.1);
    SI.ramAM = gain(0.78);
    SI.ramG = gain(0);
    chain([SI.ramSaw, SI.ramPk, SI.ramLP, SI.ramAM, SI.ramG]);
    SI.ramLfo = ac.createOscillator(); SI.ramLfo.type = 'sine'; SI.ramLfo.frequency.value = 0.85;
    SI.ramLfoD = gain(0.20);
    SI.ramLfo.connect(SI.ramLfoD); SI.ramLfoD.connect(SI.ramAM.gain);

    SI.mix = gain(1);
    SI.ramG.connect(SI.mix);
    SI.pan = pan(0.08);
    SI.out = gain(0);
    SI.mix.connect(SI.pan); SI.pan.connect(SI.out); SI.out.connect(sfxBus);
    SI.send = sendTo(0.12); SI.out.connect(SI.send);

    SI.ramSaw.start(); SI.ramLfo.start();
  }

  const SPT_P = { n: 0, depth: 0 };

  function stepSI(dt) {
    if (!voiceBuilt.si) return;
    const on = method.voice === 'si';
    SI.out.gain.value = damp(SI.out.gain.value, on ? 1 : 0, 2.5, dt);
    if (!on) {
      m.cpt = damp(m.cpt, 0, 4, dt);
      m.quiet = damp(m.quiet, 0, 2, dt);
      m.discrete = damp(m.discrete, 0, 4, dt);
      m.siPhase = 0;
      return;
    }

    const cpt = tel.pushMode === 'cpt' ? 1 : 0;
    // The DRIVE, not the hole. An SPT rig spends most of the hole washing out
    // to the next test depth, and a hammer that never stops falling would
    // destroy the one thing this voice exists to do, which is be counted.
    const driving = tel.driving !== false ? 1 : 0;
    m.siDrive = damp(m.siDrive, driving, 6, dt);
    m.cpt = damp(m.cpt, cpt, 5, dt);
    m.quiet = damp(m.quiet, cpt ? 1 : 0.45, 2.2, dt);
    m.discrete = damp(m.discrete, (!cpt && tel.active && driving) ? 1 : 0, 4, dt);

    const pushing = (cpt && tel.active && driving) ? 1 : 0;
    if (pushing !== cptWas) {
      cptWas = pushing;
      playShot(pushing ? 'cpt_push_start' : 'cpt_push_stop');
    }

    if (cpt) {
      const load = clamp(0.25 + 0.55 * tel.wob + 0.40 * tel.torque, 0, 1);
      SI.ramG.gain.value = damp(SI.ramG.gain.value, pushing ? 0.026 * (0.5 + 0.5 * load) : 0, 2.5, dt);
      SI.ramSaw.frequency.value = mixf(34, 44, load);
      SI.ramPk.gain.value = mixf(4, 9, load);
      if (pushing) {
        m.siCreakT -= dt;
        if (m.siCreakT <= 0) {
          m.siCreakT = 2.6 + Math.random() * 4.2 - load * 1.4;
          playShot('steel_groan', { gain: 0.10 + 0.14 * load, pan: (Math.random() * 2 - 1) * 0.4 });
        }
      }
      m.siPhase = 0;
      m.dBlowHz = 0;
    } else {
      SI.ramG.gain.value = damp(SI.ramG.gain.value, 0, 4, dt);
      const rateMin = tel.blowRate > 0.5 ? clamp(tel.blowRate, 8, 60) : mixf(20, 45, clamp(tel.rpm, 0, 1));
      m.siRate = damp(m.siRate, rateMin / 60, 2.0, dt);
      m.dBlowHz = m.siRate;
      if (tel.active && driving && m.siRate > 0.02) {
        m.siPhase += m.siRate * dt;
        while (m.siPhase >= 1) {
          m.siPhase -= 1;
          SPT_P.n = tel.nValue;
          SPT_P.depth = tel.depth;
          playShot('spt_drop', SPT_P);
        }
      } else m.siPhase = 0;
    }
    // N > 45 is the ground telling you it is nearly refusal.
    m.methodHazard = Math.max(m.methodHazard, clamp((tel.nValue - 45) / 30, 0, 1) * 0.5);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     14. AMBIENCE
     ───────────────────────────────────────────────────────────────────────
     Two decorrelated wind layers plus an optional texture layer plus a sparse
     random event scheduler. All persistent — the region change retunes them
     rather than rebuilding, so switching regions never allocates.

     WIND LAYER (×2, panned ∓0.7, reading different points of the same pink
     buffer so they are genuinely decorrelated):
        pink ─► windLP (lowpass, region.lowHz / hiHz)
             ─► windRes (peaking, 700 Hz, +0…+8 dB — the "moaning" of wind
                         through a mast, which is what makes it a DRILL SITE
                         rather than a nature documentary)
             ─► gustGain (driven by the granular gust scheduler)
             ─► windGain ─► pan ─► ambMix

     GRANULAR GUSTS: rather than an LFO (which sounds like a tremolo), each
     gust is an explicitly scheduled envelope — attack 0.8–2.2 s, hold, release
     1.4–4 s — with a simultaneous upward sweep of the lowpass. Real gusts get
     BRIGHTER as they get louder because turbulence generates high frequencies.
     Two gust generators run out of phase so the bed never fully settles.
     ═══════════════════════════════════════════════════════════════════════ */
  const AM = {};
  function buildAmbience() {
    AM.mix = gain(1);
    AM.out = gain(1);
    AM.mix.connect(AM.out);
    AM.out.connect(ambDuck);
    AM.send = sendTo(0.30);
    AM.out.connect(AM.send);

    AM.layers = [];
    for (let i = 0; i < 2; i++) {
      const L = {};
      L.src = noiseSrc(B.pink, 0.9 + i * 0.17);
      L.lp = filt('lowpass', 900, 0.6);
      L.hp = filt('highpass', 160, 0.5);
      L.res = filt('peaking', 700, 1.4, 0);
      L.gust = gain(1);
      L.g = gain(0);
      L.pan = pan(i === 0 ? -0.7 : 0.7);
      chain([L.src, L.hp, L.lp, L.res, L.gust, L.g, L.pan]);
      L.pan.connect(AM.mix);
      startNoise(L.src, i * 0.9);
      // gust scheduler state
      L.gustT = 0.5 + i * 2.3;
      L.gustLevel = 0.55;
      L.gustTargetLevel = 0.55;
      L.gustSpeed = 0.4;
      // gustDepth needs a default here too: stepAmbience can run before the
      // first applyRegion(), and Math.max(0.1, undefined) is NaN — which then
      // poisons gustLevel and every AudioParam downstream of it.
      L.gustDepth = 0.35;
      L.baseLo = 900;
      AM.layers.push(L);
    }

    // texture layer (sea / city drone / sand hiss / heat shimmer)
    AM.tex = {};
    AM.tex.src = noiseSrc(B.brown, 1);
    AM.tex.lp = filt('lowpass', 500, 0.8);
    AM.tex.bp = filt('bandpass', 900, 0.5);
    AM.tex.am = gain(1);
    AM.tex.g = gain(0);
    chain([AM.tex.src, AM.tex.lp, AM.tex.bp, AM.tex.am, AM.tex.g]);
    AM.tex.g.connect(AM.mix);
    AM.tex.lfo = ac.createOscillator(); AM.tex.lfo.type = 'sine'; AM.tex.lfo.frequency.value = 0.09;
    AM.tex.lfoD = gain(0.3);
    AM.tex.lfo.connect(AM.tex.lfoD); AM.tex.lfoD.connect(AM.tex.am.gain);
    AM.tex.am.gain.value = 0.7;
    AM.tex.lfo.start(); startNoise(AM.tex.src);

    // rain layer (weather, not region)
    AM.rain = {};
    AM.rain.src = noiseSrc(B.pink, 1.6);
    AM.rain.hp = filt('highpass', 1100, 0.5);
    AM.rain.lp = filt('lowpass', 7000, 0.5);
    AM.rain.g = gain(0);
    chain([AM.rain.src, AM.rain.hp, AM.rain.lp, AM.rain.g]);
    AM.rain.g.connect(AM.mix);
    startNoise(AM.rain.src);

    // Global damping for weather (snow/fog eat the highs).
    AM.damp = filt('lowpass', 20000, 0.5);
    AM.mix.disconnect();
    AM.mix.connect(AM.damp);
    AM.damp.connect(AM.out);

    AM.eventT = [];   // per-event next-fire countdown
  }

  /** Retune the persistent ambience chain for a region. No allocation. */
  function applyRegionToAmbience(id, immediate) {
    if (!built) return;
    const R2 = REGIONS[id];
    const w = R2.wind;
    for (let i = 0; i < AM.layers.length; i++) {
      const L = AM.layers[i];
      L.baseLo = i === 0 ? w.lowHz : w.hiHz;
      L.lp.frequency.value = L.baseLo;
      L.hp.frequency.value = i === 0 ? 110 : 380;
      L.res.gain.value = mixf(0, 8, w.rough);
      L.gustSpeed = Number.isFinite(w.gust?.[0]) ? w.gust[0] : 0.4;
      L.gustDepth = Number.isFinite(w.gust?.[1]) ? w.gust[1] : 0.35;
      L.target = w.level * (i === 0 ? 1 : 0.62);
      if (immediate) L.g.gain.value = L.target;
    }
    // texture
    const t = R2.texture;
    if (t) {
      AM.tex.target = t.level;
      if (t.kind === 'sea')          { AM.tex.lp.frequency.value = 900;  AM.tex.bp.frequency.value = 420; AM.tex.bp.Q.value = 0.4; AM.tex.lfo.frequency.value = 0.11; AM.tex.lfoD.gain.value = 0.42; }
      else if (t.kind === 'cityDrone'){ AM.tex.lp.frequency.value = 420;  AM.tex.bp.frequency.value = 190; AM.tex.bp.Q.value = 0.7; AM.tex.lfo.frequency.value = 0.05; AM.tex.lfoD.gain.value = 0.18; }
      else if (t.kind === 'sandHiss'){ AM.tex.lp.frequency.value = 9000; AM.tex.bp.frequency.value = 3800; AM.tex.bp.Q.value = 0.5; AM.tex.lfo.frequency.value = 0.14; AM.tex.lfoD.gain.value = 0.35; }
      else                           { AM.tex.lp.frequency.value = 9000; AM.tex.bp.frequency.value = 5200; AM.tex.bp.Q.value = 0.8; AM.tex.lfo.frequency.value = 0.22; AM.tex.lfoD.gain.value = 0.30; }
    } else {
      AM.tex.target = 0;
    }
    if (immediate) AM.tex.g.gain.value = AM.tex.target || 0;

    // event scheduler: reset countdowns
    AM.eventT.length = 0;
    for (let i = 0; i < R2.events.length; i++) {
      AM.eventT.push(1 + Math.random() * (60 / R2.events[i].perMin));
    }
    // Reverb. IRs are baked lazily on first visit and cached, but the cache is
    // capped: eight stereo IRs at up to 3.6 s each is ~7 MB of Float32, which
    // is not a reasonable resident cost on a phone. Three is enough to cover
    // the current region plus the two most recently visited; re-baking costs
    // ~10–20 ms and only ever happens on a region change, which is a scene
    // transition, never mid-drill.
    if (!B.irs[id]) {
      B.irs[id] = bakeIR(ac, R2.ir);
      irOrder.push(id);
      while (irOrder.length > 3) {
        const evict = irOrder.shift();
        if (evict !== id) delete B.irs[evict];
      }
    }
    // The convolver swap itself now belongs to stepRoom(), which fades the wet
    // return out first — because the underground acoustic can replace the
    // region IR at any time and a hard buffer swap under a live tail clicks.
    // At build time there is no tail to protect, so we set it directly.
    if (immediate) { convolver.buffer = B.irs[id]; roomHave = id; roomWant = id; roomFade = 1; }
    applyVerbLevel();
  }

  function stepAmbience(dt) {
    const R2 = REGIONS[regionId];
    const wx = WEATHER[weatherId] || WEATHER.clear;
    // Underground replaces the region bed rather than layering over it: one
    // multiplier on every region target, so wind and ventilation are never
    // both audible. See §14b.
    const sky = 1 - clamp(m.ug, 0, 1);

    // ── wind layers with granular gusts ──────────────────────────────────
    for (let i = 0; i < AM.layers.length; i++) {
      const L = AM.layers[i];
      L.gustT -= dt;
      if (L.gustT <= 0) {
        // schedule the next gust: a new target level and a new duration
        L.gustTargetLevel = 0.35 + Math.random() * Math.max(0.1, L.gustDepth);
        L.gustT = (0.8 + Math.random() * 3.4) / Math.max(0.02, L.gustSpeed) * 0.35;
      }
      // rising gusts are fast (turbulence arrives), falling gusts are slow
      const rising = L.gustTargetLevel > L.gustLevel;
      L.gustLevel = damp(L.gustLevel, L.gustTargetLevel, rising ? 0.85 : 0.35, dt);
      if (!Number.isFinite(L.gustLevel)) L.gustLevel = 0.55; // never feed NaN to an AudioParam
      L.gust.gain.value = 0.45 + L.gustLevel;
      // brighter when louder — real turbulence generates HF
      L.lp.frequency.value = L.baseLo * mixf(0.62, 1.55, L.gustLevel);
      const target = (L.target || 0) * wx.windMul * sky;
      L.g.gain.value = damp(L.g.gain.value, target, 1.5, dt);
    }

    // ── texture ──────────────────────────────────────────────────────────
    AM.tex.g.gain.value = damp(AM.tex.g.gain.value, (AM.tex.target || 0) * wx.windMul * sky, 1.2, dt);

    // ── rain / snow ──────────────────────────────────────────────────────
    AM.rain.g.gain.value = damp(AM.rain.g.gain.value, wx.rain * 0.11 * sky, 1.0, dt);
    // Snow makes the world dead: a global lowpass down to 3.2 kHz. Underground
    // there is no weather at all, but rock dust and wet shotcrete still eat the
    // top octave, so the same node lands on 9 kHz instead of wide open.
    AM.damp.frequency.value = damp(AM.damp.frequency.value,
      mixf(mixf(3200, 20000, wx.damp), 9000, clamp(m.ug, 0, 1)), 1.5, dt);

    // ── sparse events ────────────────────────────────────────────────────
    // Underground runs its own scheduler (§14b); there are no birds in a drift.
    if (sky < 0.5) return;
    for (let i = 0; i < R2.events.length && i < AM.eventT.length; i++) {
      AM.eventT[i] -= dt;
      if (AM.eventT[i] <= 0) {
        const ev = R2.events[i];
        // Poisson-ish: exponential inter-arrival around the stated rate.
        const mean = 60 / ev.perMin;
        AM.eventT[i] = mean * (0.35 + 1.6 * Math.random());
        // Suppress wildlife while the hammer is running — birds do not sing
        // next to a working top hammer, and it keeps the mix clear.
        const busy = Math.max(m.percOn, m.discrete) * 0.8 + (tel.active ? 0.3 : 0);
        const wildlife = ev.id.startsWith('bird') || ev.id === 'gull' || ev.id === 'insect' || ev.id === 'cowbell';
        if (wildlife && busy > 0.5) continue;
        playShot(ev.id, { gain: ev.gain * (1 - 0.5 * busy), pan: ev.pan, bus: 'ambience' });
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     14b. THE UNDERGROUND ACOUSTIC
     ───────────────────────────────────────────────────────────────────────
     A region-independent ambience MODE, selected by the method rather than by
     the map: tunnel-jumbo, longhole and rockbolt set acoustic:'underground',
     and any method can be forced into it with tel.underground = true. The
     Alpine tunnel contract and the Chilean mine contract therefore keep their
     own region identity everywhere else in the game (weather, region events on
     the surface, the region's IR while you are outside) and only the DRILLING
     goes underground — which is how it actually works.

     IT DOES NOT FIGHT THE REGION BED, IT REPLACES IT
     stepAmbience() multiplies every region target — both wind layers, the
     texture layer and the rain layer — by (1 − m.ug), and skips the region
     event scheduler entirely above m.ug > 0.5. So there is never a moment
     where wind and ventilation are both audible: m.ug crossfades at λ 1.3
     (τ = 0.77 s) and one bed hands over to the other. The UG bed feeds AM.mix,
     so it inherits the ambience bus, the weather damping node and the
     sidechain duck for free and cannot get out of step with them.

     WHAT IS IN IT
       VENT (the room tone — a heading is never quiet, it is CONSTANT)
         pink(0.82×) ─► hp 120 ─► lp (610→1270 Hz with airflow)
              ─► duct  (peaking 235 Hz Q 1.6 +7 dB — the 1000 mm duct's own
                        resonance: a 1.0 m duct is a half-wave resonator at
                        c/2L ≈ 171 Hz, and the flexible spiral's first cross
                        mode sits just above it)
              ─► blade (peaking 1550 Hz Q 5.5, +2→+7 dB — an 8-blade fan at
                        1450 rpm has a blade-pass fundamental of 193 Hz, and
                        it is its 8th order at 1.55 kHz that actually survives
                        a phone speaker, so that is where we put the peak)
              ─► AM (0.31 Hz sine, ±0.10 — the duct breathing, NOT a tremolo)
              ─► ventG
       MACHINERY (a loader two crosscuts away, felt not identified)
         brown(0.6×) ─► lp 210 Hz ─► machG (0.055)
       EVENTS  ug_drip 16/min · ug_rock_tick 7/min · ug_distant_mucker
               2.2/min · ug_vent_surge 3.5/min — no wind, no birds, nothing
               that could ever happen in daylight.

     BLAST HAND-OFF: SHOTS.blast sets m.ventBoost = 1, which multiplies the
     vent level by up to 1.9× and decays at λ 0.28 (τ = 3.6 s, ~12 s to
     inaudible). The fans going to full after a round is a CONSEQUENCE of the
     round, carried by the persistent bed long after the one-shot has been
     reaped — which is what makes the round feel like it had a consequence
     rather than a sound effect.

     ── MEASURED ───────────────────────────────────────────────────────────
       THE IR         0.623 s, 2 channels, L/R correlation 0.0225 (genuinely
                      decorrelated stereo, not a mono blur). RMS 0.0550, the
                      same as every region IR, so the wet level does not jump
                      when you go underground. 2nd-half/1st-half energy 0.0507
                      against the e^−2.9 = 0.0550 the recipe asks for.
       THE ECHO TAPS  asked -> found -> the reflector that implies at 343 m/s
                        12.5 ms -> 12.5 ms ->  2.14 m   roof / back of the drift
                        23.1 ms -> 23.0 ms ->  3.94 m   far wall of a 4 m heading
                        37.4 ms -> 37.5 ms ->  6.43 m   the corner behind the rig
                        60.5 ms -> 62.5 ms -> 10.72 m   down toward the last round
       FOR SCALE      the alpine valley IR in this same file is 3.62 s. The
                      underground room is 5.8x shorter and 1.45x wetter, which
                      is the whole difference between outside and inside.
       HANDOVER       method change -> the crossfade reaches ug 0.994 in under
                      4 s, and the convolver buffer is swapped 0.267 s later
                      with the wet return already muted, so the swap is silent.
     ═══════════════════════════════════════════════════════════════════════ */
  const UG = {};
  let ugBuilt = false;

  function buildUnderground() {
    if (ugBuilt || !built) return;
    ugBuilt = true;
    if (!B.irs[UG_ROOM]) { B.ugIR = bakeIR(ac, UNDERGROUND.ir); B.irs[UG_ROOM] = B.ugIR; }
    const V = UNDERGROUND.vent;

    UG.ventSrc = noiseSrc(B.pink, 0.82);
    UG.ventHP = filt('highpass', 120, 0.6);
    UG.ventLP = filt('lowpass', V.ductHz * 3.4, 0.7);
    UG.duct = filt('peaking', V.ductHz, 1.6, 7);
    UG.blade = filt('peaking', V.bladeHz, 5.5, 5);
    UG.ventAM = gain(0.90);
    UG.ventG = gain(0);
    chain([UG.ventSrc, UG.ventHP, UG.ventLP, UG.duct, UG.blade, UG.ventAM, UG.ventG]);
    UG.ventLfo = ac.createOscillator(); UG.ventLfo.type = 'sine'; UG.ventLfo.frequency.value = V.surgeHz;
    UG.ventLfoD = gain(0.10);
    UG.ventLfo.connect(UG.ventLfoD); UG.ventLfoD.connect(UG.ventAM.gain);

    UG.machSrc = noiseSrc(B.brown, 0.6);
    UG.machLP = filt('lowpass', UNDERGROUND.machinery.lpHz, 0.8);
    UG.machG = gain(0);
    chain([UG.machSrc, UG.machLP, UG.machG]);

    UG.mix = gain(1);
    UG.ventG.connect(UG.mix); UG.machG.connect(UG.mix);
    UG.mix.connect(AM.mix);

    UG.eventT = [];
    for (let i = 0; i < UNDERGROUND.events.length; i++) {
      UG.eventT.push(1 + Math.random() * (60 / UNDERGROUND.events[i].perMin));
    }
    UG.ventLfo.start(); startNoise(UG.ventSrc); startNoise(UG.machSrc);
  }

  function stepUnderground(dt) {
    const want = (method.acoustic === 'underground' || tel.underground === true) ? 1 : 0;
    m.ugTarget = want;
    m.ug = damp(m.ug, want, 1.3, dt);
    m.ventBoost = damp(m.ventBoost, 0, 0.28, dt);
    if (!ugBuilt) return;

    const U = clamp(m.ug, 0, 1);
    const V = UNDERGROUND.vent;
    const vent = clamp(tel.ventilation, 0, 1);
    const lvl = V.level * mixf(0.45, 1.25, vent) * (1 + 0.9 * clamp(m.ventBoost, 0, 1));
    UG.ventG.gain.value = damp(UG.ventG.gain.value, U * lvl, 1.4, dt);
    UG.ventLP.frequency.value = damp(UG.ventLP.frequency.value, V.ductHz * mixf(2.6, 5.4, vent), 1.2, dt);
    UG.blade.gain.value = mixf(2, 7, vent);
    UG.machG.gain.value = damp(UG.machG.gain.value, U * UNDERGROUND.machinery.level, 1.0, dt);

    if (U < 0.5) return;
    const busy = Math.max(m.percOn, m.discrete);
    for (let i = 0; i < UNDERGROUND.events.length && i < UG.eventT.length; i++) {
      UG.eventT[i] -= dt;
      if (UG.eventT[i] > 0) continue;
      const ev = UNDERGROUND.events[i];
      UG.eventT[i] = (60 / ev.perMin) * (0.35 + 1.6 * Math.random());
      playShot(ev.id, { gain: ev.gain * (1 - 0.45 * busy), pan: ev.pan, bus: 'ambience' });
    }
  }

  /* ── THE ROOM SWAP ──────────────────────────────────────────────────────
     One ConvolverNode serves both the eight region IRs and the underground IR.
     Assigning .buffer while a tail is sounding truncates it, and a truncated
     reverb tail is a click — which used to be acceptable because the region
     only ever changed on a scene transition, but the underground acoustic can
     now arrive on a method change. So the swap is a three-frame state machine:
     fade the WET RETURN to silence at λ 14 (τ 71 ms), swap the buffer while it
     is inaudible, then fade back at λ 5 (τ 200 ms). Total ~350 ms, entirely
     under the crossfade of the beds themselves.
     ─────────────────────────────────────────────────────────────────────── */
  let roomWant = null, roomHave = null, roomFade = 1;

  /** The wet-return level for whatever room we are actually in. */
  function applyVerbLevel() {
    if (!built) return;
    const mul = (roomHave === UG_ROOM)
      ? UNDERGROUND.verbMul
      : (WEATHER[weatherId] || WEATHER.clear).verbMul;
    reverbReturn.gain.value = 0.9 * mul * roomFade;
  }

  function stepRoom(dt) {
    roomWant = (m.ugTarget > 0.5) ? UG_ROOM : regionId;
    if (roomWant !== roomHave) {
      roomFade = damp(roomFade, 0, 14, dt);
      if (roomFade < 0.03) {
        if (roomWant === UG_ROOM) {
          if (!B.irs[UG_ROOM]) B.irs[UG_ROOM] = bakeIR(ac, UNDERGROUND.ir);
        } else if (!B.irs[roomWant]) {
          // The region IR may have been evicted by the LRU while we were
          // underground. Re-baking costs ~10–20 ms and happens at most once
          // per surfacing, which is a scene transition.
          B.irs[roomWant] = bakeIR(ac, REGIONS[roomWant].ir);
          if (irOrder.indexOf(roomWant) < 0) irOrder.push(roomWant);
        }
        convolver.buffer = B.irs[roomWant];
        roomHave = roomWant;
      }
    } else {
      roomFade = damp(roomFade, 1, 5, dt);
    }
    applyVerbLevel();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     15. MUSIC — adaptive generative score
     ───────────────────────────────────────────────────────────────────────
     Never a loop. Three layers, each gated by a single `intensity` 0..1:

       BED    (always, gain 0.35 → 0.9)
         Three persistent voice pairs (saw + triangle, detuned ±5 cents) whose
         frequencies GLIDE to the new chord tones over 0.6 s rather than being
         retriggered. Result: an organ-like harmonic morph, zero allocation per
         chord, and no attack transients fighting the hammer.
         Through a lowpass that opens 320 Hz → 1900 Hz with intensity.

       PULSE  (intensity > 0.22)
         Locked to the hammer. BPM = clamp(blowHz·60/24, 72, 148); at a 50 Hz
         top-hammer blow rate that is 125 BPM, at a 24 Hz DTH rate it is 72.
         On each beat: a short bass pluck (root, 2 octaves below the chord) and
         an industrial metal tick on the off-beats (a bandpassed noise burst
         with a 12 ms resonant tail — a hammer on a rod, not a hi-hat).

       LEAD   (only IN THE GROOVE: greenBandTime > 2.5 s)
         A soft FM bell (carrier:modulator 1:2, index 1.8 decaying to 0.3)
         playing LEAD_MOTIF over the current chord, one note per 2–4 beats,
         with rests. Restrained on purpose: this is the reward for holding the
         sweet spot, not a fanfare.

     SIDECHAIN: musicDuck is pulled down by every hammer accent (see
     duckMusic()) with a 8 ms attack / 140 ms release. The score therefore
     breathes with the machine and the low-mids never collide.

     SCHEDULING: a 0.25 s lookahead scheduler driven from update(). We schedule
     ahead of ac.currentTime so note starts are sample-accurate regardless of
     frame jitter — the standard "two clocks" pattern.
     ═══════════════════════════════════════════════════════════════════════ */
  const MU = {
    bedVoices: [],
    chordIdx: 0, barCount: 0,
    beat: 0, nextBeatTime: 0, bpm: 92,
    leadIdx: 0, leadBeatsLeft: 0,
    progression: PROG_CALM,
    scale: AEOLIAN,
    started: false,
  };

  function buildMusic() {
    MU.out = gain(1);
    MU.out.connect(musicDuck);
    MU.send = sendTo(0.24);
    MU.out.connect(MU.send);

    MU.bedLP = filt('lowpass', 500, 0.9);
    MU.bedGain = gain(0);
    MU.bedLP.connect(MU.bedGain); MU.bedGain.connect(MU.out);

    // three persistent bed voices
    for (let i = 0; i < 3; i++) {
      const v = {};
      v.a = ac.createOscillator(); v.a.type = 'sawtooth';
      v.b = ac.createOscillator(); v.b.type = 'triangle';
      v.ga = gain(0.28); v.gb = gain(0.5);
      v.sum = gain(1);
      v.a.connect(v.ga); v.b.connect(v.gb);
      v.ga.connect(v.sum); v.gb.connect(v.sum);
      v.pan = pan((i - 1) * 0.35);
      v.sum.connect(v.pan); v.pan.connect(MU.bedLP);
      v.a.frequency.value = ROOT_HZ * 2;
      v.b.frequency.value = ROOT_HZ * 2 * 1.003;
      v.a.start(); v.b.start();
      MU.bedVoices.push(v);
    }

    MU.pulseGain = gain(0); MU.pulseGain.connect(MU.out);
    MU.leadGain = gain(0);  MU.leadGain.connect(MU.out);
  }

  /** Frequency of a scale degree above the root, in the current mode. */
  function degHz(deg, octave) {
    const sc = MU.scale;
    const n = sc.length;
    let d = deg, oct = octave || 0;
    while (d < 0) { d += n; oct -= 1; }
    while (d >= n) { d -= n; oct += 1; }
    return ROOT_HZ * semi(sc[d] + 12 * oct);
  }

  function currentChord() { return MU.progression[MU.chordIdx % MU.progression.length]; }

  /** Retune the bed to the current chord with a 0.7 s glide. */
  function voiceChord(t) {
    const ch = currentChord();
    const tones = CHORD_TONES[ch[1]] || CHORD_TONES.min;
    const rootSemi = MU.scale[ch[0] % MU.scale.length] + 12 * Math.floor(ch[0] / MU.scale.length);
    for (let i = 0; i < MU.bedVoices.length; i++) {
      const v = MU.bedVoices[i];
      // Octave 2–3 for the bed: fundamental 147–330 Hz. Deliberately ABOVE the
      // phone's rolloff — a pad that lives at 70 Hz is a pad you cannot hear.
      const f = ROOT_HZ * semi(rootSemi + tones[i] + 24);
      v.a.frequency.cancelScheduledValues(t);
      v.b.frequency.cancelScheduledValues(t);
      // Anchor at the present value: an exponential ramp with no preceding
      // event is under-specified across implementations.
      setAt(v.a.frequency, Math.max(v.a.frequency.value, EPS), t);
      setAt(v.b.frequency, Math.max(v.b.frequency.value, EPS), t);
      expoTo(v.a.frequency, f, t + 0.7);
      expoTo(v.b.frequency, f * 1.004, t + 0.7);
    }
  }

  /** Short bass pluck. 3 nodes. */
  function musicBass(t, hz, level) {
    const d = alloc(PRIO.music, 0.5, t);
    if (!d) return;
    const o = trackSrc(d, ac.createOscillator());
    o.type = 'sawtooth'; o.frequency.value = hz;
    const lp = track(d, filt('lowpass', hz * 6, 3.2));
    const g = track(d, gain(EPS));
    d.out = g;
    o.connect(lp); lp.connect(g); g.connect(MU.pulseGain);
    // 4 ms attack / 260 ms decay — a plucked, damped bass, not a pad.
    perc(g.gain, t, level, 0.004, 0.26);
    // filter closes as it decays: the classic "pluck"
    lp.frequency.setValueAtTime(hz * 7, t);
    expoTo(lp.frequency, hz * 2.2, t + 0.22);
    o.start(t); o.stop(t + 0.42);
  }

  /** Industrial metal tick — a rod being tapped, not a hi-hat. 4 nodes. */
  function musicTick(t, level, bright) {
    const d = alloc(PRIO.music, 0.12, t);
    if (!d) return;
    const s = trackSrc(d, ac.createBufferSource());
    s.buffer = B.white;
    s.playbackRate.value = 1 + Math.random() * 0.3;
    const bp = track(d, filt('bandpass', mixf(2400, 5200, bright), 4.5));
    const g = track(d, gain(EPS));
    d.out = g;
    s.connect(bp); bp.connect(g); g.connect(MU.pulseGain);
    perc(g.gain, t, level, 0.001, 0.048);
    s.start(t, Math.random() * 1.2, 0.09);
  }

  /** FM bell for the lead. Carrier:modulator 1:2, index 1.8 → 0.3. 5 nodes. */
  function musicLead(t, hz, level, dur) {
    const d = alloc(PRIO.music, dur + 0.4, t);
    if (!d) return;
    const car = trackSrc(d, ac.createOscillator());
    car.type = 'sine'; car.frequency.value = hz;
    const mod = trackSrc(d, ac.createOscillator());
    mod.type = 'sine'; mod.frequency.value = hz * 2;
    const idx = track(d, gain(hz * 1.8));
    mod.connect(idx); idx.connect(car.frequency);
    const g = track(d, gain(EPS));
    d.out = g;
    car.connect(g); g.connect(MU.leadGain);
    // 90 ms attack — soft, never a stab. Long release so it blooms.
    g.gain.cancelScheduledValues(t);
    setAt(g.gain, EPS, t);
    expoTo(g.gain, level, t + 0.09);
    expoTo(g.gain, level * 0.55, t + dur * 0.5);
    expoTo(g.gain, EPS, t + dur + 0.35);
    // FM index collapses → the tone loses its bell edge and becomes a sine
    idx.gain.setValueAtTime(hz * 1.8, t);
    expoTo(idx.gain, hz * 0.3, t + Math.min(0.6, dur));
    car.start(t); mod.start(t);
    car.stop(t + dur + 0.45); mod.stop(t + dur + 0.45);
  }

  /** The 0.25 s lookahead scheduler. Called from update(). */
  function stepMusic(dt) {
    const t = now();

    // ── intensity ────────────────────────────────────────────────────────
    // combo/groove (0.45) + depth progress (0.25) + hazard (0.30)
    const prog = tel.target > 0 ? clamp(tel.depth / tel.target, 0, 1) : 0;
    const grooveN = clamp(tel.greenBandTime / 8, 0, 1);
    m.groove = damp(m.groove, tel.inGreenBand ? grooveN : grooveN * 0.4, 2, dt);
    // m.methodHazard is written by the six new voices (§13b): RC contamination,
    // jumbo short pull, longhole deviation, bolt torque, pile refusal/rake, SPT
    // approaching refusal. Each is that method's PROTECT axis going wrong, so
    // each belongs in exactly the same term as a jam or a collapsing hole.
    m.hazard = damp(m.hazard, clamp(tel.jam * 0.8 + (1 - tel.stability) * 0.6
      + tel.wear * 0.35 + m.methodHazard * 0.7, 0, 1), 1.5, dt);
    let inten = 0.45 * m.groove + 0.25 * prog + 0.30 * m.hazard;
    if (!tel.active) inten *= 0.32;
    if (sceneId === 'menu' || sceneId === 'contracts' || sceneId === 'shop' || sceneId === 'career' || sceneId === 'garage') inten = 0.18;
    // THE QUIET METHOD. A CPT push is the only moment in the game where the
    // score is asked to get out of the way completely. m.quiet is 0.45 for SPT
    // and 1.0 while a CPT push is running, so the bed drops to 30 % and the
    // pulse layer falls below its own 0.22 gate and stops entirely.
    inten *= mixf(1, 0.30, clamp(m.quiet, 0, 1));
    m.intensityTarget = clamp(inten, 0, 1);
    m.intensity = damp(m.intensity, m.intensityTarget, 0.8, dt);

    const I = m.intensity;

    // Mode lifts to Dorian when it is going well — the raised 6th is the
    // single cheapest way to make a minor key feel hopeful.
    MU.scale = (m.groove > 0.6 && m.hazard < 0.3) ? DORIAN : AEOLIAN;
    MU.progression = I > 0.5 ? PROG_DRIVE : PROG_CALM;

    // ── layer gains ──────────────────────────────────────────────────────
    MU.bedGain.gain.value = damp(MU.bedGain.gain.value, mixf(0.055, 0.115, I), 1.2, dt);
    MU.bedLP.frequency.value = damp(MU.bedLP.frequency.value, mixf(320, 1900, Math.pow(I, 0.8)), 1.0, dt);
    const pulseWant = I > 0.22 ? clamp((I - 0.22) / 0.5, 0, 1) * 0.16 : 0;
    MU.pulseGain.gain.value = damp(MU.pulseGain.gain.value, pulseWant, 1.5, dt);
    const leadWant = (tel.greenBandTime > 2.5 && m.hazard < 0.45) ? 0.085 : 0;
    MU.leadGain.gain.value = damp(MU.leadGain.gain.value, leadWant, 0.7, dt);

    // ── tempo ────────────────────────────────────────────────────────────
    // Locked to the hammer when it is running, otherwise a walking pulse.
    const bpmWant = (m.percOn > 0.4 && m.blowHz > 1)
      ? clamp(m.blowHz * 60 / 24, 72, 148)
      : (m.discrete > 0.4 && m.dBlowHz > 0.05)
        ? musicalTempo(m.dBlowHz * 60)
        : 84 + I * 30;
    MU.bpm = damp(MU.bpm, bpmWant, 0.6, dt);

    if (!MU.started) { MU.started = true; MU.nextBeatTime = t + 0.1; voiceChord(t); }

    // ── lookahead scheduling ─────────────────────────────────────────────
    const spb = 60 / MU.bpm;
    const horizon = t + 0.25;
    let guard = 0;
    while (MU.nextBeatTime < horizon && guard++ < 16) {
      const bt = MU.nextBeatTime;
      const beatInBar = MU.beat % 4;

      // chord change every `bars` bars of the current progression entry
      if (MU.beat % 4 === 0) {
        MU.barCount++;
        const barsForChord = currentChord()[2];
        if (MU.barCount > barsForChord) {
          MU.barCount = 1;
          MU.chordIdx++;
          voiceChord(bt);
        }
      }

      if (MU.pulseGain.gain.value > 0.004) {
        const ch = currentChord();
        const rootSemi = MU.scale[ch[0] % MU.scale.length];
        // bass on 1 and 3 (and on 4 at high intensity — a push)
        if (beatInBar === 0 || beatInBar === 2 || (I > 0.7 && beatInBar === 3)) {
          musicBass(bt, ROOT_HZ * semi(rootSemi + 12), beatInBar === 0 ? 0.55 : 0.36);
        }
        // ticks on the off-beats, plus 16ths when it is really moving
        musicTick(bt + spb * 0.5, 0.16 + 0.10 * I, I);
        if (I > 0.62) musicTick(bt + spb * 0.75, 0.09, I);
      }

      if (MU.leadGain.gain.value > 0.004) {
        if (MU.leadBeatsLeft <= 0) {
          const step = LEAD_MOTIF[MU.leadIdx % LEAD_MOTIF.length];
          MU.leadIdx++;
          MU.leadBeatsLeft = step.beats;
          if (step.deg >= 0) {
            const ch = currentChord();
            musicLead(bt, degHz(step.deg + ch[0], 3), 0.5, step.beats * spb * 0.85);
          }
        }
        MU.leadBeatsLeft -= 1;
      }

      MU.beat++;
      MU.nextBeatTime += spb;
    }
    // If we fell far behind (tab was backgrounded), resync rather than
    // scheduling a burst of catch-up notes.
    if (MU.nextBeatTime < t - 0.5) { MU.nextBeatTime = t + 0.05; MU.beat = 0; }
  }

  /**
   * Double (or halve) a blow rate until it lands in the score's 72–148 BPM
   * window. A driven pile at 30 blows/min gives 120 BPM, at 45 gives 90, at
   * 63 gives 126, at 100 gives 100; an SPT at 20 blows/min gives 80. Because
   * the result is always the blow rate times a power of two, EVERY blow falls
   * exactly on a beat — which is what makes a pile hammer feel like the drum
   * rather than like something fighting it.
   */
  function musicalTempo(bpm) {
    let b = bpm, guard = 0;
    while (b < 72 && guard++ < 8) b *= 2;
    while (b > 148 && guard++ < 8) b *= 0.5;
    return clamp(b, 72, 148);
  }

  /* ── sidechain ducking ───────────────────────────────────────────────── */
  let lastDuckAt = -1;
  function duckMusic(t, depth) {
    if (!built) return;
    // Decimate to ≤10/s: at 15 accents/s the automation queue is pointless
    // work and the ear cannot resolve individual ducks anyway.
    if (t - lastDuckAt < 0.1) return;
    lastDuckAt = t;
    const d = clamp(1 - depth, 0.25, 1);
    const p = musicDuck.gain;
    p.cancelScheduledValues(t);
    setAt(p, p.value, t);
    linTo(p, d, t + 0.008);          // 8 ms attack — under the transient
    expoTo(p, 1, t + 0.14);          // 140 ms release — breathes, never pumps
    // The ambience bed ducks too, but only half as deep: wind that disappears
    // under every blow reads as a bug, wind that leans back reads as loud.
    const a = ambDuck.gain;
    const da = clamp(1 - depth * 0.5, 0.55, 1);
    a.cancelScheduledValues(t);
    setAt(a, a.value, t);
    linTo(a, da, t + 0.010);
    expoTo(a, 1, t + 0.18);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     16. ONE-SHOTS
     ───────────────────────────────────────────────────────────────────────
     Every one-shot is composed from four primitives. Each primitive creates
     its nodes, registers them with the voice descriptor, STARTS its source at
     the requested time, and returns handles so the caller can automate.

        out(d, level, pan, send, bus)   routed output stage
        nz(d, t, o)                     noise burst  → { g, src, hp, bp, lp }
        tn(d, t, o)                     tone         → { g, osc }
        bd(d, t, buf, rate)             baked body   → { g, src }

     One-shots are rare (never per-frame), so the small object each primitive
     returns is not on any hot path. The frame loop itself allocates nothing.

     Frequencies are chosen to sit in the phone's 300 Hz – 5 kHz window; where
     a sound "should" be low we place its ENERGY at 300–900 Hz and let the
     master exciter and the ceiling's odd harmonics imply the rest.
     ═══════════════════════════════════════════════════════════════════════ */

  const EMPTY = Object.freeze({});

  function busNode(name) {
    if (name === 'music') return MU.out;
    if (name === 'ambience') return AM.mix;
    return sfxBus;
  }

  /** Routed output stage: gain → pan → bus (+ optional reverb send). */
  function out(d, level, panPos, sendAmt, bus) {
    const g = track(d, gain(level === undefined ? 1 : level));
    const p = track(d, pan(panPos || 0));
    g.connect(p);
    p.connect(busNode(bus));
    if (sendAmt > 0) { const s = track(d, sendTo(sendAmt)); p.connect(s); }
    d.out = g;
    return g;
  }

  /**
   * Noise burst. o = { buf, rate, dur, hp, hpQ, bp, bpQ, lp, lpQ, pk, pkQ, pkDb }
   * Starts at `t` from a random offset in the loop buffer (so repeated hits are
   * never identical) and runs for `dur` seconds.
   */
  function nz(d, t, o) {
    const s = trackSrc(d, ac.createBufferSource());
    const buf = o.buf || B.white;
    s.buffer = buf;
    s.playbackRate.value = o.rate || 1;
    let n = s;
    const h = { src: s, hp: null, bp: null, lp: null, pk: null, g: null };
    if (o.hp) { h.hp = track(d, filt('highpass', o.hp, o.hpQ || 0.7)); n.connect(h.hp); n = h.hp; }
    if (o.bp) { h.bp = track(d, filt('bandpass', o.bp, o.bpQ || 1)); n.connect(h.bp); n = h.bp; }
    if (o.lp) { h.lp = track(d, filt('lowpass', o.lp, o.lpQ || 0.8)); n.connect(h.lp); n = h.lp; }
    if (o.pk) { h.pk = track(d, filt('peaking', o.pk, o.pkQ || 2, o.pkDb || 6)); n.connect(h.pk); n = h.pk; }
    h.g = track(d, gain(EPS));
    n.connect(h.g);
    const dur = o.dur || 1;
    // A burst longer than the source buffer must loop, or it goes silent
    // partway through (collapse rumble asks for 3.0 s from a 2.8 s buffer).
    if (dur > buf.duration - 0.02) { s.loop = true; }
    const maxOff = Math.max(0, buf.duration - dur - 0.01);
    try { s.start(t, Math.random() * maxOff, dur); }
    catch (e) { try { s.start(t); } catch (e2) { /* already started */ } }
    return h;
  }

  /** Tone. o = { type, f, dur, detune } — osc started at t, stopped at t+dur. */
  function tn(d, t, o) {
    const osc = trackSrc(d, ac.createOscillator());
    osc.type = o.type || 'sine';
    osc.frequency.value = o.f;
    if (o.detune) osc.detune.value = o.detune;
    const g = track(d, gain(EPS));
    osc.connect(g);
    osc.start(t);
    osc.stop(t + (o.dur || 1));
    return { osc, g };
  }

  /** Baked body (metal / ring buffer), started at t. */
  function bd(d, t, buffer, rate) {
    const s = trackSrc(d, ac.createBufferSource());
    s.buffer = buffer;
    s.playbackRate.value = rate || 1;
    const g = track(d, gain(EPS));
    s.connect(g);
    try { s.start(t); } catch (e) { /* already started */ }
    return { src: s, g };
  }

  /** Square/triangle LFO used to gate a gain node (stick-slip, rattles). */
  function lfoGate(d, t, dur, hz, depth, target) {
    const l = trackSrc(d, ac.createOscillator());
    l.type = 'square'; l.frequency.value = hz;
    const g = track(d, gain(depth));
    l.connect(g); g.connect(target);
    l.start(t); l.stop(t + dur);
    return l;
  }

  const SHOTS = {

    /* ── BOULDER STRIKE ────────────────────────────────────────────────────
       The bit meets something that is not the formation.
         1. a 12 ms crushing transient — white noise, BP 1.8 kHz Q 2.0, HP 300
         2. the boulder's own body — metalClang at rate 0.55 (fundamental
            196 × 0.55 = 108 Hz, 1.5 s tail): a large, dense, dead mass
         3. the drill string SHOCKED — the ring buffer at the current rod rate,
            then a second bounce 40 ms later 6 % sharp, because a boulder
            strike is never one clean impact.
       ~1.6 s, priority hazard.                                               */
    boulder(t, p) {
      const d = alloc(PRIO.hazard, 1.9, t); if (!d) return;
      const g = out(d, clamp(p.gain !== undefined ? p.gain : 1, 0, 1.4), 0.0, 0.30);
      const crush = nz(d, t, { buf: B.white, bp: 1800, bpQ: 2.0, hp: 300, dur: 0.05 });
      crush.g.connect(g); perc(crush.g.gain, t, 0.85, 0.0012, 0.012);
      const body = bd(d, t, B.metalClang, 0.55);
      body.g.connect(g); perc(body.g.gain, t, 0.55, 0.002, 0.9);
      const r1 = bd(d, t, B.ring, m.ringRate);
      r1.g.connect(g); perc(r1.g.gain, t, 0.45, 0.001, 0.5);
      const r2 = bd(d, t + 0.04, B.ring, m.ringRate * 1.06);
      r2.g.connect(g); perc(r2.g.gain, t + 0.04, 0.22, 0.001, 0.35);
      duckMusic(t, 0.55); haptic('impact');
    },

    /* ── BIT BREAK ─────────────────────────────────────────────────────────
       The most expensive event in the game; it must FEEL expensive.
         1. THE SNAP — 4 ms of white noise through a Q-9 bandpass whose centre
            falls 5.2 kHz → 2.1 kHz in 60 ms. That downward chirp on a brittle
            transient is the signature of carbide failing. It is what makes it
            sickening rather than merely loud.
         2. RING-DOWN — metalSnap (742 Hz, inharmonic, 1.05 s) at rate 1.00
            plus a copy at 0.97. The 3 % detune makes the two decays BEAT
            against each other at ~22 Hz — an unstable, wrong sound.
         3. MASS — a sine at 210 Hz gliding to 96 Hz over 350 ms.
       Ducks the whole mix for 900 ms afterwards. Haptic: fail.                */
    bit_break(t) {
      const d = alloc(PRIO.critical, 2.6, t); if (!d) return;
      const g = out(d, 1.05, 0.0, 0.40);

      const snap = nz(d, t, { buf: B.white, bp: 5200, bpQ: 9, hp: 900, dur: 0.18 });
      snap.g.connect(g); perc(snap.g.gain, t, 1.0, 0.0008, 0.075);
      snap.bp.frequency.setValueAtTime(5200, t);
      expoTo(snap.bp.frequency, 2100, t + 0.06);

      const splint = nz(d, t, { buf: B.white, bp: 3400, bpQ: 4, dur: 0.22 });
      splint.g.connect(g); perc(splint.g.gain, t, 0.55, 0.001, 0.14);
      splint.bp.frequency.setValueAtTime(3400, t);
      expoTo(splint.bp.frequency, 1200, t + 0.13);

      const ring = bd(d, t + 0.004, B.metalSnap, 1.0);
      ring.g.connect(g); perc(ring.g.gain, t + 0.004, 0.62, 0.002, 1.5);
      const ring2 = bd(d, t + 0.012, B.metalSnap, 0.97);
      ring2.g.connect(g); perc(ring2.g.gain, t + 0.012, 0.42, 0.002, 1.4);

      const mass = tn(d, t, { type: 'sine', f: 210, dur: 0.6 });
      mass.g.connect(g); perc(mass.g.gain, t, 0.50, 0.002, 0.40);
      mass.osc.frequency.setValueAtTime(210, t);
      expoTo(mass.osc.frequency, 96, t + 0.35);

      duckFor(900); haptic('fail');
    },

    /* ── BIT WORN ──────────────────────────────────────────────────────────
       A change of state, not an impact. A dull falling minor third
       (620 → 414 Hz) on filtered triangles, plus a scrape: pink noise through
       a bandpass sliding 2.6 kHz → 900 Hz over 500 ms. The downward slide is
       "the edge has gone".                                                    */
    bit_worn(t) {
      const d = alloc(PRIO.event, 1.1, t); if (!d) return;
      const g = out(d, 0.55, -0.1, 0.20);
      const a = tn(d, t, { type: 'triangle', f: 620, dur: 0.4 });
      a.g.connect(g); perc(a.g.gain, t, 0.30, 0.010, 0.22);
      const b = tn(d, t + 0.16, { type: 'triangle', f: 414, dur: 0.55 });
      b.g.connect(g); perc(b.g.gain, t + 0.16, 0.34, 0.010, 0.34);
      const sc = nz(d, t, { buf: B.pink, bp: 2600, bpQ: 2.4, dur: 0.6 });
      sc.g.connect(g); perc(sc.g.gain, t, 0.24, 0.02, 0.5);
      sc.bp.frequency.setValueAtTime(2600, t);
      expoTo(sc.bp.frequency, 900, t + 0.5);
      haptic('medium');
    },

    /* ── JAM / BIND ────────────────────────────────────────────────────────
       Metal under torsion that cannot move.
         1. STALL GROAN — sawtooth 128 → 92 Hz over 700 ms through a +9 dB
            peak at 340 Hz and a 1.2 kHz lowpass. Its envelope SWELLS and
            holds rather than decaying: the load is not going away.
         2. STICK-SLIP — brown noise, BP 480 Hz Q 3, gated by a 7 Hz square.
            Stick-slip is literally metal grabbing and releasing several times
            a second; the square gate is the honest model.
         3. The hydraulic relief valve is already screaming, because tel.jam
            feeds m.hydPress in stepHydraulic().                               */
    jam_bind(t, p) {
      const d = alloc(PRIO.hazard, 2.1, t); if (!d) return;
      const sev = clamp(p.severity !== undefined ? p.severity : 0.7, 0, 1);
      const g = out(d, 0.55 + 0.35 * sev, 0.15, 0.24);

      const groan = tn(d, t, { type: 'sawtooth', f: 128, dur: 1.7 });
      const pk = track(d, filt('peaking', 340, 4, 9));
      const lp = track(d, filt('lowpass', 1200, 1.2));
      groan.g.connect(pk); pk.connect(lp); lp.connect(g);
      groan.g.gain.cancelScheduledValues(t);
      setAt(groan.g.gain, EPS, t);
      expoTo(groan.g.gain, 0.42, t + 0.28);
      expoTo(groan.g.gain, 0.30, t + 0.90);
      expoTo(groan.g.gain, EPS, t + 1.60);
      groan.osc.frequency.setValueAtTime(128, t);
      expoTo(groan.osc.frequency, 92, t + 0.70);

      const ss = nz(d, t, { buf: B.brown, bp: 480, bpQ: 3.0, rate: 1.2, dur: 1.6 });
      const gate = track(d, gain(0.5));
      ss.g.connect(gate); gate.connect(g);
      lfoGate(d, t, 1.6, 7, 0.45, gate.gain);
      perc(ss.g.gain, t, 0.5 * sev, 0.03, 1.3);

      duckFor(600); haptic('heavy');
    },

    /* ── JAM RELEASE ───────────────────────────────────────────────────────
       Relief, in three beats: a squeal chirping UP 700 → 3200 Hz in 90 ms
       (the opposite direction to the bit-break chirp — up means good), the
       string free-ringing, then rotation spinning back up (sawtooth 90 → 220
       Hz over 400 ms with the lowpass opening 700 → 2200 Hz).                 */
    jam_release(t) {
      const d = alloc(PRIO.event, 1.6, t); if (!d) return;
      const g = out(d, 0.7, 0.1, 0.28);
      const sq = nz(d, t, { buf: B.white, bp: 700, bpQ: 6, dur: 0.16 });
      sq.g.connect(g); perc(sq.g.gain, t, 0.50, 0.004, 0.11);
      sq.bp.frequency.setValueAtTime(700, t);
      expoTo(sq.bp.frequency, 3200, t + 0.09);
      const ring = bd(d, t + 0.01, B.ring, m.ringRate);
      ring.g.connect(g); perc(ring.g.gain, t + 0.01, 0.42, 0.001, 0.55);
      const spin = tn(d, t + 0.05, { type: 'sawtooth', f: 90, dur: 0.70 });
      const lp = track(d, filt('lowpass', 700, 1.4));
      spin.g.connect(lp); lp.connect(g);
      perc(spin.g.gain, t + 0.05, 0.22, 0.08, 0.5);
      spin.osc.frequency.setValueAtTime(90, t + 0.05);
      expoTo(spin.osc.frequency, 220, t + 0.45);
      lp.frequency.setValueAtTime(700, t + 0.05);
      expoTo(lp.frequency, 2200, t + 0.45);
      haptic('success');
    },

    /* ── ROD ADD ───────────────────────────────────────────────────────────
       The full mechanical cycle, four beats over 1.85 s. A real driller will
       judge us on the ORDER and the TIMING more than the timbre:

         t+0.00  CLAMP    hydraulic clamp closes — 45 ms pink hiss (BP 2.2 kHz)
                          resolving into a solid metal thunk at t+0.04
         t+0.42  SPIN-UP  rotary head spins the new rod in — sawtooth
                          70 → 260 Hz over 520 ms, lowpass opening 500 → 2600
         t+0.98  THREAD   the thread catches — three taps 40 ms apart, rising
                          in pitch and falling in level. An R32 thread STUTTERS
                          into engagement; it does not glide.
         t+1.28  SNUG     final torque — a saturated sawtooth straining
                          150 → 205 Hz for 180 ms, then CUT in 8 ms and capped
                          with a clack. The abruptness is the "it is tight" cue.
       Haptic: 'snap' (12/24/46 ms) lands on clamp / thread / snug.            */
    rod_add(t) {
      const d = alloc(PRIO.event, 2.3, t); if (!d) return;
      const g = out(d, 0.75, -0.12, 0.22);

      // 1. clamp
      const hiss = nz(d, t, { buf: B.pink, bp: 2200, bpQ: 1.4, dur: 0.09 });
      hiss.g.connect(g); perc(hiss.g.gain, t, 0.30, 0.008, 0.045);
      const thunk = bd(d, t + 0.04, B.metalThread, 0.70);
      thunk.g.connect(g); perc(thunk.g.gain, t + 0.04, 0.50, 0.001, 0.12);

      // 2. spin-up
      const t1 = t + 0.42;
      const spin = tn(d, t1, { type: 'sawtooth', f: 70, dur: 0.62 });
      const slp = track(d, filt('lowpass', 500, 1.6));
      spin.g.connect(slp); slp.connect(g);
      spin.g.gain.cancelScheduledValues(t1);
      setAt(spin.g.gain, EPS, t1);
      expoTo(spin.g.gain, 0.26, t1 + 0.10);
      expoTo(spin.g.gain, 0.20, t1 + 0.44);
      expoTo(spin.g.gain, EPS, t1 + 0.56);
      spin.osc.frequency.setValueAtTime(70, t1);
      expoTo(spin.osc.frequency, 260, t1 + 0.52);
      slp.frequency.setValueAtTime(500, t1);
      expoTo(slp.frequency, 2600, t1 + 0.52);

      // 3. thread engage — three stuttering taps
      for (let i = 0; i < 3; i++) {
        const tt = t + 0.98 + i * 0.04;
        const tap = bd(d, tt, B.metalThread, 1.15 + i * 0.09);
        tap.g.connect(g);
        perc(tap.g.gain, tt, 0.30 - i * 0.05, 0.001, 0.07);
      }

      // 4. torque snug — rising strain, cut off hard
      const t3 = t + 1.28;
      const snug = tn(d, t3, { type: 'sawtooth', f: 150, dur: 0.30 });
      const sat = track(d, shaper(B.satCurveHot, '2x'));
      const nlp = track(d, filt('lowpass', 1400, 1.0));
      snug.g.connect(sat); sat.connect(nlp); nlp.connect(g);
      snug.g.gain.cancelScheduledValues(t3);
      setAt(snug.g.gain, EPS, t3);
      expoTo(snug.g.gain, 0.34, t3 + 0.17);
      setAt(snug.g.gain, 0.34, t3 + 0.180);
      linTo(snug.g.gain, EPS, t3 + 0.188);           // the abrupt stop: 8 ms
      snug.osc.frequency.setValueAtTime(150, t3);
      expoTo(snug.osc.frequency, 205, t3 + 0.18);
      const clack = bd(d, t3 + 0.186, B.metalThread, 0.9);
      clack.g.connect(g); perc(clack.g.gain, t3 + 0.186, 0.42, 0.001, 0.16);

      haptic('snap');
    },

    /* ── CASING SET ────────────────────────────────────────────────────────
       A casing shoe seating: big, dull, final. metalClang at rate 0.42
       (fundamental 82 Hz, 2 s) through a 900 Hz lowpass — casing is
       thick-walled and full of ground, it does NOT ring. Plus gravel settling
       (brown noise, BP 620 Hz, 700 ms) as the annulus closes around it.       */
    casing_set(t) {
      const d = alloc(PRIO.event, 2.5, t); if (!d) return;
      const g = out(d, 0.8, 0.0, 0.26);
      const lp = track(d, filt('lowpass', 900, 0.8));
      lp.connect(g);
      const body = bd(d, t, B.metalClang, 0.42);
      body.g.connect(lp); perc(body.g.gain, t, 0.75, 0.002, 1.6);
      const grav = nz(d, t + 0.05, { buf: B.brown, bp: 620, bpQ: 1.2, rate: 1.4, dur: 0.8 });
      grav.g.connect(g); perc(grav.g.gain, t + 0.05, 0.30, 0.04, 0.7);
      haptic('heavy');
    },

    /* ── WATER STRIKE ──────────────────────────────────────────────────────
         1. THE GUSH — pink noise, bandpass sweeping UP 380 → 1900 Hz in
            250 ms then settling to 1100 Hz. Gain SWELLS over 400 ms and
            holds. Water arriving under head accelerates, so the sound must
            accelerate too; a decaying gush sounds like a leak, not a strike.
         2. PRESSURE CHANGE — a sine gliding 90 → 60 Hz under it: the pump
            taking on a column of water.
         3. six randomised droplet ticks (BP 2.6–4.2 kHz, Q 7) over 900 ms.    */
    water_strike(t) {
      const d = alloc(PRIO.hazard, 2.7, t); if (!d) return;
      const g = out(d, 0.9, 0.0, 0.34);
      const gush = nz(d, t, { buf: B.pink, bp: 380, bpQ: 1.1, hp: 240, dur: 2.4 });
      gush.g.connect(g);
      gush.g.gain.cancelScheduledValues(t);
      setAt(gush.g.gain, EPS, t);
      expoTo(gush.g.gain, 0.55, t + 0.40);
      expoTo(gush.g.gain, 0.34, t + 1.20);
      expoTo(gush.g.gain, EPS, t + 2.30);
      gush.bp.frequency.setValueAtTime(380, t);
      expoTo(gush.bp.frequency, 1900, t + 0.25);
      expoTo(gush.bp.frequency, 1100, t + 1.00);
      const load = tn(d, t, { type: 'sine', f: 90, dur: 1.2 });
      load.g.connect(g); perc(load.g.gain, t, 0.28, 0.06, 0.9);
      load.osc.frequency.setValueAtTime(90, t);
      expoTo(load.osc.frequency, 60, t + 0.8);
      for (let i = 0; i < 6; i++) {
        const tt = t + 0.35 + Math.random() * 0.9;
        const dp = nz(d, tt, { buf: B.white, bp: 2600 + Math.random() * 1600, bpQ: 7, dur: 0.09 });
        dp.g.connect(g); perc(dp.g.gain, tt, 0.10, 0.001, 0.05);
      }
      haptic('medium');
    },

    /* ── CAVITY / KARST VOID ───────────────────────────────────────────────
       USE SILENCE. The bit free-falls into nothing. This is a NEGATIVE event:
         1. the whole mix ducks to ~20 % for 1.1 s (duckFor)
         2. a single falling triangle, 520 → 130 Hz over 900 ms, quiet, with
            the reverb send at 0.70 so it disappears INTO the space
         3. ~350 ms of near-total silence — the most important 350 ms in the
            game's sound design
         4. the far-below echo: the ring buffer at rate 0.36 (187 Hz, 1.7 s)
            routed almost entirely to reverb — dry 0.06, wet 0.85
       Nothing else in the game is allowed to be this quiet, which is exactly
       why it lands.                                                           */
    cavity(t) {
      const d = alloc(PRIO.critical, 3.6, t); if (!d) return;
      const g = out(d, 0.5, 0.0, 0.70);
      const fall = tn(d, t, { type: 'triangle', f: 520, dur: 1.1 });
      fall.g.connect(g);
      fall.g.gain.cancelScheduledValues(t);
      setAt(fall.g.gain, EPS, t);
      expoTo(fall.g.gain, 0.30, t + 0.05);
      expoTo(fall.g.gain, 0.06, t + 0.85);
      expoTo(fall.g.gain, EPS, t + 0.95);
      fall.osc.frequency.setValueAtTime(520, t);
      expoTo(fall.osc.frequency, 130, t + 0.9);
      // ── ~350 ms of nothing ──
      const echoDry = track(d, gain(0.06));
      const echoWet = track(d, sendTo(0.85));
      echoDry.connect(sfxBus);
      const far = bd(d, t + 1.30, B.ring, 0.36);
      far.g.connect(echoDry); far.g.connect(echoWet);
      perc(far.g.gain, t + 1.30, 0.55, 0.004, 1.4);
      duckFor(1100);
      haptic('light');
    },

    /* ── COLLAPSE RUMBLE ───────────────────────────────────────────────────
       The hole is failing. Brown noise through a lowpass that OPENS
       180 → 900 Hz over 1.2 s — more and more material joining in — with a
       3.1 Hz amplitude churn and eight randomised rock impacts (BP 0.7–2.1
       kHz). The energy is deliberately at 300–900 Hz, not 40 Hz, so a phone
       can actually deliver the threat. 2.8 s.                                 */
    collapse(t) {
      const d = alloc(PRIO.hazard, 3.3, t); if (!d) return;
      const g = out(d, 1.0, 0.0, 0.40);
      const rum = nz(d, t, { buf: B.brown, lp: 180, lpQ: 1.1, hp: 150, rate: 1.1, dur: 3.0 });
      const churn = track(d, gain(0.75));
      rum.g.connect(churn); churn.connect(g);
      const lfo = trackSrc(d, ac.createOscillator());
      lfo.type = 'sine'; lfo.frequency.value = 3.1;
      const ld = track(d, gain(0.25));
      lfo.connect(ld); ld.connect(churn.gain);
      lfo.start(t); lfo.stop(t + 3.0);
      rum.g.gain.cancelScheduledValues(t);
      setAt(rum.g.gain, EPS, t);
      expoTo(rum.g.gain, 0.75, t + 0.35);
      expoTo(rum.g.gain, 0.55, t + 1.50);
      expoTo(rum.g.gain, EPS, t + 2.80);
      rum.lp.frequency.setValueAtTime(180, t);
      expoTo(rum.lp.frequency, 900, t + 1.2);
      for (let i = 0; i < 8; i++) {
        const tt = t + 0.15 + Math.random() * 2.0;
        const hit = nz(d, tt, { buf: B.white, bp: 700 + Math.random() * 1400, bpQ: 3, dur: 0.13 });
        hit.g.connect(g); perc(hit.g.gain, tt, 0.14 + Math.random() * 0.14, 0.002, 0.09);
      }
      duckFor(700); haptic('heavy');
    },

    /* ── TRIP IN / TRIP OUT ────────────────────────────────────────────────
       The winch. A motor whine that RISES for trip-out (pulling the string up
       against its own weight — the motor loads) and FALLS for trip-in
       (running down), with a chain rattle (white noise gated at 11 Hz) and a
       terminal clunk at 1.45 s.

       __winch() below is the shared machine. trip_in/trip_out are it with no
       load term — bit-identical to what shipped, because every load-dependent
       coefficient is written to vanish at load 0. The bailing run is the same
       machine WITH a load, because a bailer full of slurry is the heaviest
       thing this winch ever lifts.                                            */
    trip_out(t) { SHOTS.__trip(t, 1); },
    trip_in(t) { SHOTS.__trip(t, -1); },
    __trip(t, dir) {
      const d = alloc(PRIO.event, 2.3, t); if (!d) return;
      const g = out(d, 0.6, -0.2, 0.20);
      SHOTS.__winch(d, g, t, dir, 0, 1.4);
      const clunk = bd(d, t + 1.45, B.metalThread, 0.6);
      clunk.g.connect(g); perc(clunk.g.gain, t + 1.45, 0.40, 0.001, 0.2);
      haptic('medium');
    },

    /**
     * THE WINCH ITSELF, factored out so the bailing run is the same machine
     * rather than a second one that merely sounds like it.
     *
     *   d     voice descriptor — the CALLER owns the allocation, so a caller
     *         can build a longer sound around one haul without a second voice
     *   g     the output stage to connect into
     *   t     start time
     *   dir   +1 hauling up (the motor loads, the note RISES 120 → 240 Hz)
     *         −1 running down (240 → 120 Hz)
     *   load  0..1 weight on the line. Adds three things a free winch does not
     *         do, all of which are exactly zero at load 0:
     *           DROOP  the note sags 22 % as the motor takes the weight before
     *                  its controller catches it — the same lug the diesel
     *                  governor makes in §8, and for the same physical reason
     *           BARK   a peaking filter at 430 Hz, 0 → +9 dB
     *           ROPE   the sheave slap slows 11 → 7 Hz and gets harder,
     *                  because a stretched wire slaps less often
     *   dur   seconds of haul.
     */
    __winch(d, g, t, dir, load, dur) {
      const L = clamp(load || 0, 0, 1);
      const D = clamp(dur || 1.4, 0.3, 4.5);
      const f0 = dir > 0 ? 120 : 240, f1 = dir > 0 ? 240 : 120;
      const mot = tn(d, t, { type: 'sawtooth', f: f0, dur: D + 0.3 });
      const lp = track(d, filt('lowpass', f0 * 5, 2.2));
      const bark = track(d, filt('peaking', 430, 1.5, 9 * L));
      mot.g.connect(lp); lp.connect(bark); bark.connect(g);
      mot.g.gain.cancelScheduledValues(t);
      setAt(mot.g.gain, EPS, t);
      expoTo(mot.g.gain, 0.30 + 0.16 * L, t + 0.12);
      expoTo(mot.g.gain, 0.26 + 0.16 * L, t + D * 0.96);
      expoTo(mot.g.gain, EPS, t + D + 0.20);
      mot.osc.frequency.setValueAtTime(f0, t);
      if (L > 0.02) {
        expoTo(mot.osc.frequency, f0 * (1 - 0.22 * L), t + 0.18);
        expoTo(mot.osc.frequency, f1, t + D);
      } else {
        expoTo(mot.osc.frequency, f1, t + D);
      }
      lp.frequency.setValueAtTime(f0 * 5, t);
      expoTo(lp.frequency, f1 * 5, t + D);
      const rat = nz(d, t, { buf: B.white, bp: mixf(3200, 2300, L), bpQ: 2.0, dur: D + 0.1 });
      const gate = track(d, gain(0.4));
      rat.g.connect(gate); gate.connect(g);
      lfoGate(d, t, D + 0.1, mixf(11, 7, L), 0.35 + 0.15 * L, gate.gain);
      perc(rat.g.gain, t, 0.14 + 0.10 * L, 0.05, Math.max(0.1, D - 0.1));
      return mot;
    },

    /* ── THE BAILING RUN ───────────────────────────────────────────────────
       EVENTS.BAILER_RUN. A cable-tool rig has no drill string, so it has no
       rod to add: its cadence is pulling the tool off the rope, running the
       bailer down the hole and lifting the cuttings out. Nothing else cleans a
       cable-tool hole — the method does not circulate — so this event is the
       method's heartbeat and it must not be a repurposed flush burp.

       One machine doing one thing, in three parts:

       1. THE WINCH, UNDER LOAD (0 → dur). __winch() at load 0.55–1.00. A
          bailer coming up a hole is dead weight on a wire rope and the HAUL is
          what you hear: the motor droops as it takes the weight, barks at
          430 Hz through the pull, and the rope over the sheave slaps at 7 Hz
          instead of 11. The haul runs 1.15 s in a shallow hole to 2.60 s at
          60 m, because a deep hole is a long lift — and that lengthening IS
          the cost the player is paying. Cable tool gets slower as it gets
          deeper, and here that is audible rather than merely tabulated.

       2. IT CLEARS THE COLLAR (dur). The dart valve in the bottom of the
          bailer knocking shut: metalThread at 0.80, 140 ms.

       3. THE WET DUMP (dur+0.10 → +0.95). The bailer is swung over the sump
          and tipped, and what comes out is not water — it is the paste the
          chisel has spent two minutes pounding out of the formation. So it is
          not a splash:
            SLUG    brown noise, bandpass falling 330 → 180 Hz over 220 ms with
                    a 30 ms attack. Slow, low and heavy: a MASS leaving a tube.
            SPATTER pink noise, highpass falling 2.6 kHz → 700 Hz over 400 ms —
                    the fines and the water, which arrive after the slug and go
                    on longer than it does.
            TUBE    metalClang at 1.35, level 0.18: the emptied bailer knocking
                    the side of the sump as it swings back.

       PERFECT IS FULLER, NOT LOUDER. Nail the landing and the bailer comes up
       full: the slug carries 1.35× the mass and sits 8 % lower, and the winch
       runs at the top of its load range. Miss it and the same run lifts about
       two thirds as much. The tell is WEIGHT, not volume — which is the only
       kind that survives a phone speaker at an unknown listening level, and it
       is the same reasoning as the cyclone's note in §13b-1.                   */
    bailer_run(t, p) {
      const dep = clamp((p && p.depth) || 0, 0, 60);
      const dur = mixf(1.15, 2.60, dep / 60);
      const perfect = !!(p && p.perfect);
      const full = perfect ? 1 : 0.62;
      const d = alloc(PRIO.event, dur + 1.6, t); if (!d) return;
      const g = out(d, 0.72, -0.18, 0.24);

      // 1. the haul
      SHOTS.__winch(d, g, t, 1, 0.55 + 0.45 * full, dur);

      // 2. the dart valve, as it clears the collar
      const t1 = t + dur;
      const dart = bd(d, t1, B.metalThread, 0.8);
      dart.g.connect(g); perc(dart.g.gain, t1, 0.34, 0.0015, 0.14);

      // 3. the dump
      const t2 = t1 + 0.10;
      const f0 = perfect ? 303 : 330;
      const slug = nz(d, t2, { buf: B.brown, bp: f0, bpQ: 1.0, lp: 900, dur: 0.55, rate: 0.85 });
      slug.g.connect(g);
      perc(slug.g.gain, t2, 0.52 * (perfect ? 1.35 : 1), 0.030, 0.34);
      slug.bp.frequency.setValueAtTime(f0, t2);
      expoTo(slug.bp.frequency, 180, t2 + 0.22);

      const spat = nz(d, t2 + 0.05, { buf: B.pink, hp: 2600, hpQ: 0.7, dur: 0.60 });
      spat.g.connect(g);
      perc(spat.g.gain, t2 + 0.05, 0.26, 0.012, 0.46);
      spat.hp.frequency.setValueAtTime(2600, t2 + 0.05);
      expoTo(spat.hp.frequency, 700, t2 + 0.45);

      const tube = bd(d, t2 + 0.38, B.metalClang, 1.35);
      tube.g.connect(g); perc(tube.g.gain, t2 + 0.38, 0.18, 0.002, 0.30);

      haptic(perfect ? 'medium' : 'light');
    },

    /* ── POWER TRANSFER ────────────────────────────────────────────────────
       §13b-2b. The jumbo going on and off the mains reel. The two directions
       are not symmetrical, because the machines are not:

       CLOSING (p.close) — a 1000 V contactor is a large piece of ironmongery
         and it closes in two stages you can hear separately: the armature
         slams (metalThread at 1.10), and 55 ms later the auxiliary blades seat
         (a lighter knock at 1.60). Then the direct-on-line INRUSH: a short
         rising hiss, 900 → 2200 Hz over 260 ms, which is the motor pulling six
         times full-load current. The continuous electric bed takes over from
         there and stays for as long as the machine is drilling.

       OPENING — one knock and an ARC: 18 ms of bright noise at 4.2 kHz as the
         contacts part under load. Nothing sustains, because an induction motor
         off the line makes no noise at all — there is no run-down to hear.

       No music duck. This is a machine changing state, not an incident.        */
    power_transfer(t, p) {
      const d = alloc(PRIO.event, 0.9, t); if (!d) return;
      const closing = !!(p && p.close);
      const g = out(d, 0.55, -0.30, 0.26);

      const k1 = bd(d, t, B.metalThread, 1.1);
      k1.g.connect(g); perc(k1.g.gain, t, 0.46, 0.003, 0.10);

      if (closing) {
        const k2 = bd(d, t + 0.055, B.metalThread, 1.6);
        k2.g.connect(g); perc(k2.g.gain, t + 0.055, 0.24, 0.002, 0.07);
        const inr = nz(d, t + 0.06, { buf: B.pink, bp: 900, bpQ: 1.4, dur: 0.34 });
        inr.g.connect(g); perc(inr.g.gain, t + 0.06, 0.20, 0.030, 0.24);
        inr.bp.frequency.setValueAtTime(900, t + 0.06);
        expoTo(inr.bp.frequency, 2200, t + 0.32);
      } else {
        const arc = nz(d, t + 0.004, { buf: B.white, bp: 4200, bpQ: 3.2, hp: 2000, dur: 0.05 });
        arc.g.connect(g); perc(arc.g.gain, t + 0.004, 0.30, 0.001, 0.018);
      }
      haptic('detent');
    },

    /* ── RESIN SET ─────────────────────────────────────────────────────────
       §13b-4. The end of the hold: the feed circuit comes off relief and the
       thrust releases. A hydraulic sigh — bandpassed pink noise falling
       620 → 240 Hz over 320 ms, meeting the hold tone exactly where it ended —
       plus the boom taking its own weight back (metalThread at 0.55, soft).
       Deliberately quiet: this is permission to move, not an achievement.      */
    resin_set(t, p) {
      const d = alloc(PRIO.event, 1.0, t); if (!d) return;
      const g = out(d, 0.5 * (p && p.gain !== undefined ? p.gain : 1), 0.10, 0.22);
      const sigh = nz(d, t, { buf: B.pink, bp: 620, bpQ: 1.1, dur: 0.45 });
      sigh.g.connect(g); perc(sigh.g.gain, t, 0.30, 0.020, 0.32);
      sigh.bp.frequency.setValueAtTime(620, t);
      expoTo(sigh.bp.frequency, 240, t + 0.32);
      const th = bd(d, t + 0.16, B.metalThread, 0.55);
      th.g.connect(g); perc(th.g.gain, t + 0.16, 0.16, 0.004, 0.22);
      haptic('success');
    },

    /* ── FLUSH SPIT ────────────────────────────────────────────────────────
       A packed-off annulus burping. 50 ms, bandpass chirping DOWN
       1.9 kHz → 700 Hz. Fired ~3/s by stepFlush() once annulus > 0.85.        */
    flush_spit(t, p) {
      const d = alloc(PRIO.flush, 0.25, t); if (!d) return;
      const lvl = clamp(p.gain !== undefined ? p.gain : 1, 0, 1);
      const g = out(d, 0.5 * lvl, 0.0, 0.18);
      const s = nz(d, t, { buf: B.pink, bp: 1900, bpQ: 5, dur: 0.12 });
      s.g.connect(g); perc(s.g.gain, t, 0.7, 0.004, 0.05);
      s.bp.frequency.setValueAtTime(1900, t);
      expoTo(s.bp.frequency, 700, t + 0.05);
    },

    /* ── BLOW-DOWN ─────────────────────────────────────────────────────────
       Flush released: the receiver dumps to atmosphere. A big bright hiss
       whose highpass FALLS 1.4 kHz → 400 Hz over 850 ms as it decays —
       pressure dropping means the jet slows means the spectrum darkens.
       Instantly readable as "air off".                                        */
    blowdown(t, p) {
      const d = alloc(PRIO.event, 1.5, t); if (!d) return;
      const g = out(d, 0.7 * (p.gain !== undefined ? p.gain : 1), -0.35, 0.24);
      const s = nz(d, t, { buf: B.pink, hp: 1400, hpQ: 0.6, bp: 2600, bpQ: 0.7, dur: 1.0 });
      s.g.connect(g);
      s.g.gain.cancelScheduledValues(t);
      setAt(s.g.gain, EPS, t);
      linTo(s.g.gain, 0.55, t + 0.012);
      expoTo(s.g.gain, EPS, t + 0.90);
      s.hp.frequency.setValueAtTime(1400, t);
      expoTo(s.hp.frequency, 400, t + 0.85);
      s.bp.frequency.setValueAtTime(2600, t);
      expoTo(s.bp.frequency, 900, t + 0.85);
    },

    /* ── STRATUM CHANGE ────────────────────────────────────────────────────
       A quiet informational marker whose INTERVAL encodes the change: a rising
       perfect fourth going into harder ground, a falling fourth going softer.
       Filtered triangles, 260 ms total. Fires often, so it must never be a
       fanfare.                                                                */
    stratum(t, p) {
      const d = alloc(PRIO.ui, 0.7, t); if (!d) return;
      const harder = !!p.harder;
      const g = out(d, 0.34, 0.25, 0.30);
      const f0 = 440, f1 = harder ? 440 * 4 / 3 : 440 * 3 / 4;
      const a = tn(d, t, { type: 'triangle', f: f0, dur: 0.20 });
      a.g.connect(g); perc(a.g.gain, t, 0.24, 0.006, 0.13);
      const b = tn(d, t + 0.085, { type: 'triangle', f: f1, dur: 0.28 });
      b.g.connect(g); perc(b.g.gain, t + 0.085, 0.26, 0.006, 0.2);
      haptic('detent');
    },

    /* ── DRILL START / STOP ────────────────────────────────────────────────
       Mechanical, not musical. Start: the feed engaging — a soft thunk plus
       the hydraulic pack taking the load (a 300 ms swell). Stop: the string
       ringing down once, plus the clamp.                                      */
    drill_start(t) {
      const d = alloc(PRIO.event, 1.0, t); if (!d) return;
      const g = out(d, 0.6, 0.0, 0.18);
      const th = bd(d, t, B.metalThread, 0.55);
      th.g.connect(g); perc(th.g.gain, t, 0.4, 0.002, 0.18);
      const sw = nz(d, t, { buf: B.pink, bp: 900, bpQ: 1.0, dur: 0.8 });
      sw.g.connect(g);
      setAt(sw.g.gain, EPS, t);
      expoTo(sw.g.gain, 0.22, t + 0.30);
      expoTo(sw.g.gain, EPS, t + 0.75);
      haptic('medium');
    },
    drill_stop(t) {
      const d = alloc(PRIO.event, 1.4, t); if (!d) return;
      const g = out(d, 0.6, 0.0, 0.24);
      const ring = bd(d, t, B.ring, m.ringRate);
      ring.g.connect(g); perc(ring.g.gain, t, 0.35, 0.002, 0.6);
      const th = bd(d, t + 0.02, B.metalThread, 0.5);
      th.g.connect(g); perc(th.g.gain, t + 0.02, 0.30, 0.002, 0.2);
      haptic('light');
    },
  };

  /* ═══════════════════════════════════════════════════════════════════════
     17. PROGRESSION, UI AND GRADE ONE-SHOTS
     ───────────────────────────────────────────────────────────────────────
     These are the only sounds in the game with deliberate musical pitch. They
     are all built from the CURRENT chord so a level-up never clashes with the
     score playing underneath it — the reward sound is always consonant.

     House rule for UI: nothing over 90 ms, nothing above 5.5 kHz, nothing
     with a decay tail. UI must feel like a mechanical detent, not a chime.
     ═══════════════════════════════════════════════════════════════════════ */

  /** Root of the currently sounding chord, in Hz, at a given octave. */
  function chordRootHz(octave) {
    const ch = currentChord();
    const rootSemi = MU.scale[ch[0] % MU.scale.length];
    return ROOT_HZ * semi(rootSemi + 12 * (octave === undefined ? 2 : octave));
  }

  Object.assign(SHOTS, {

    /* ── LEVEL UP ──────────────────────────────────────────────────────────
       "Amber, triumphant but restrained." Not a fanfare — a machine coming up
       to power. Three elements over 1.9 s, all in the current key:

         1. THE SWELL — two detuned sawtooths on the chord root, two octaves
            up, through a lowpass that opens 400 → 3200 Hz over 700 ms. This
            is the "power arriving" gesture.
         2. THE MOTIF — three FM bell notes: root → fifth → octave (a rising
            perfect fifth then a fourth). Perfect intervals only; a major third
            would make it sweet, and Drillity is not sweet.
            Timing 0.00 / 0.18 / 0.40 s — accelerating, which reads as
            confident rather than ceremonial.
         3. THE STAMP — a single soft metal body (metalStamp at 0.75) at
            t+0.40 under the top note, so the moment lands on something
            physical.
       Music ducks 40 % for 1.2 s underneath.                                  */
    level_up(t) {
      const d = alloc(PRIO.critical, 2.6, t); if (!d) return;
      const g = out(d, 0.85, 0.0, 0.42);
      const root = chordRootHz(3);

      // 1. swell
      const lp = track(d, filt('lowpass', 400, 1.1));
      lp.connect(g);
      for (let i = 0; i < 2; i++) {
        const o = tn(d, t, { type: 'sawtooth', f: root, dur: 1.9, detune: i ? 7 : -7 });
        o.g.connect(lp);
        o.g.gain.cancelScheduledValues(t);
        setAt(o.g.gain, EPS, t);
        expoTo(o.g.gain, 0.13, t + 0.45);
        expoTo(o.g.gain, 0.09, t + 1.10);
        expoTo(o.g.gain, EPS, t + 1.80);
      }
      lp.frequency.setValueAtTime(400, t);
      expoTo(lp.frequency, 3200, t + 0.70);
      expoTo(lp.frequency, 1400, t + 1.70);

      // 2. motif: root → fifth → octave, accelerating
      const notes = [[0.00, 1.0, 0.42], [0.18, 1.5, 0.46], [0.40, 2.0, 0.58]];
      for (let i = 0; i < notes.length; i++) {
        const [off, mul, lvl] = notes[i];
        const tt = t + off;
        const car = trackSrc(d, ac.createOscillator());
        car.type = 'sine'; car.frequency.value = root * mul;
        const mod = trackSrc(d, ac.createOscillator());
        mod.type = 'sine'; mod.frequency.value = root * mul * 3;   // 1:3 → hollow, bell-like
        const idx = track(d, gain(root * mul * 1.1));
        mod.connect(idx); idx.connect(car.frequency);
        const bg = track(d, gain(EPS));
        car.connect(bg); bg.connect(g);
        setAt(bg.gain, EPS, tt);
        expoTo(bg.gain, lvl * 0.30, tt + 0.012);
        expoTo(bg.gain, EPS, tt + 1.10);
        idx.gain.setValueAtTime(root * mul * 1.1, tt);
        expoTo(idx.gain, root * mul * 0.12, tt + 0.45);
        car.start(tt); mod.start(tt);
        car.stop(tt + 1.25); mod.stop(tt + 1.25);
      }

      // 3. the stamp
      const st = bd(d, t + 0.40, B.metalStamp, 0.75);
      st.g.connect(g); perc(st.g.gain, t + 0.40, 0.26, 0.003, 1.3);

      duckFor(1200); haptic('success');
    },

    /* ── GRADE STAMP ───────────────────────────────────────────────────────
       Fires at results. Five distinct sounds, escalating. The grade is
       encoded in THREE dimensions simultaneously so it reads instantly:
         pitch of the stamp body, the interval stack above it, and reverb.

         D  ·  0.55× body (144 Hz), no interval, dry (send 0.10)  — a dull thud
         C  ·  0.65× body, unison only,          send 0.18
         B  ·  0.78× body, + perfect fifth,      send 0.26
         A  ·  0.95× body, + fifth + octave,     send 0.34
         S  ·  1.15× body, + fifth + octave + twelfth, send 0.55, PLUS a
               2.4 s shimmer (three FM bells detuned ±4 cents, entering at
               60/140/240 ms) and a 30 ms pre-echo before the stamp so it
               feels like the room inhaled first.
       Only S gets the shimmer and the pre-echo. That asymmetry is the point:
       every other grade is a stamp, S is an event.                            */
    grade_stamp(t, p) {
      const grade = String((p.grade || 'C')).toUpperCase();
      const spec = {
        D: { rate: 0.55, ivals: [1], send: 0.10, lvl: 0.55 },
        C: { rate: 0.65, ivals: [1], send: 0.18, lvl: 0.62 },
        B: { rate: 0.78, ivals: [1, 1.5], send: 0.26, lvl: 0.70 },
        A: { rate: 0.95, ivals: [1, 1.5, 2], send: 0.34, lvl: 0.80 },
        S: { rate: 1.15, ivals: [1, 1.5, 2, 3], send: 0.55, lvl: 0.92 },
      }[grade] || { rate: 0.65, ivals: [1], send: 0.18, lvl: 0.62 };

      const d = alloc(PRIO.critical, grade === 'S' ? 3.4 : 2.2, t); if (!d) return;
      const g = out(d, spec.lvl, 0.0, spec.send);
      const root = chordRootHz(3);

      // S only: a 30 ms pre-echo — the room inhaling
      if (grade === 'S') {
        // 30 ms before the strike, if we have the headroom to schedule it.
        const tp = Math.max(t - 0.03, now());
        const pre = nz(d, tp, { buf: B.pink, hp: 2200, bp: 4200, bpQ: 1.2, dur: 0.06 });
        pre.g.connect(g); perc(pre.g.gain, tp, 0.10, 0.024, 0.014);
      }

      for (let i = 0; i < spec.ivals.length; i++) {
        const body = bd(d, t + i * 0.006, B.metalStamp, spec.rate * spec.ivals[i]);
        body.g.connect(g);
        perc(body.g.gain, t + i * 0.006, 0.55 / (1 + i * 0.7), 0.002, 1.5 + i * 0.2);
      }
      // the strike itself
      const hit = nz(d, t, { buf: B.white, bp: 2600, bpQ: 2.2, dur: 0.06 });
      hit.g.connect(g); perc(hit.g.gain, t, 0.55, 0.001, 0.03);

      if (grade === 'S') {
        for (let i = 0; i < 3; i++) {
          const tt = t + 0.06 + i * 0.08;
          const car = trackSrc(d, ac.createOscillator());
          car.type = 'sine'; car.frequency.value = root * [2, 3, 4][i];
          car.detune.value = (i - 1) * 4;
          const mod = trackSrc(d, ac.createOscillator());
          mod.type = 'sine'; mod.frequency.value = car.frequency.value * 2;
          const idx = track(d, gain(car.frequency.value * 0.9));
          mod.connect(idx); idx.connect(car.frequency);
          const bg = track(d, gain(EPS));
          car.connect(bg); bg.connect(g);
          setAt(bg.gain, EPS, tt);
          expoTo(bg.gain, 0.12 / (1 + i * 0.4), tt + 0.02);
          expoTo(bg.gain, EPS, tt + 2.3);
          idx.gain.setValueAtTime(car.frequency.value * 0.9, tt);
          expoTo(idx.gain, car.frequency.value * 0.05, tt + 0.9);
          car.start(tt); mod.start(tt); car.stop(tt + 2.5); mod.stop(tt + 2.5);
        }
      }
      duckFor(grade === 'S' ? 1400 : 700);
      haptic(grade === 'S' || grade === 'A' ? 'success' : 'heavy');
    },

    /* ── HOLE COMPLETE ─────────────────────────────────────────────────────
       The rig winding down. A falling engine-like tone (sawtooth 190 → 84 Hz
       over 1.1 s through a closing lowpass) plus the string's last ring plus
       a settling hiss. Deliberately understated — the grade stamp follows and
       that is where the payoff lives.                                         */
    hole_complete(t) {
      const d = alloc(PRIO.event, 2.2, t); if (!d) return;
      const g = out(d, 0.7, 0.0, 0.30);
      const wd = tn(d, t, { type: 'sawtooth', f: 190, dur: 1.3 });
      const lp = track(d, filt('lowpass', 1800, 1.3));
      wd.g.connect(lp); lp.connect(g);
      perc(wd.g.gain, t, 0.26, 0.02, 1.1);
      wd.osc.frequency.setValueAtTime(190, t);
      expoTo(wd.osc.frequency, 84, t + 1.1);
      lp.frequency.setValueAtTime(1800, t);
      expoTo(lp.frequency, 420, t + 1.1);
      const ring = bd(d, t, B.ring, m.ringRate);
      ring.g.connect(g); perc(ring.g.gain, t, 0.30, 0.002, 0.7);
      const hs = nz(d, t + 0.9, { buf: B.pink, bp: 1200, bpQ: 0.9, dur: 0.7 });
      hs.g.connect(g); perc(hs.g.gain, t + 0.9, 0.14, 0.04, 0.55);
      haptic('medium');
    },

    /* ── CONTRACT ACCEPTED ─────────────────────────────────────────────────
       A signature going down: a short paper-ish scrape (pink, BP 3.4 kHz,
       55 ms) then two firm confirmation notes a fifth apart on filtered
       triangles. Businesslike. 520 ms.                                        */
    contract_accept(t) {
      const d = alloc(PRIO.ui, 0.9, t); if (!d) return;
      const g = out(d, 0.6, 0.1, 0.22);
      const sc = nz(d, t, { buf: B.pink, bp: 3400, bpQ: 1.8, dur: 0.08 });
      sc.g.connect(g); perc(sc.g.gain, t, 0.18, 0.006, 0.05);
      const root = chordRootHz(4);
      const a = tn(d, t + 0.06, { type: 'triangle', f: root, dur: 0.30 });
      a.g.connect(g); perc(a.g.gain, t + 0.06, 0.24, 0.004, 0.20);
      const b = tn(d, t + 0.17, { type: 'triangle', f: root * 1.5, dur: 0.40 });
      b.g.connect(g); perc(b.g.gain, t + 0.17, 0.26, 0.004, 0.30);
      haptic('medium');
    },

    /* ── PURCHASE ──────────────────────────────────────────────────────────
       Money leaving. A tight metallic double-tick (a till, not a coin pile)
       plus a short descending pair — because you just SPENT it. 320 ms.       */
    purchase(t) {
      const d = alloc(PRIO.ui, 0.7, t); if (!d) return;
      const g = out(d, 0.55, 0.15, 0.20);
      for (let i = 0; i < 2; i++) {
        const tt = t + i * 0.055;
        const k = nz(d, tt, { buf: B.white, bp: 4200 - i * 900, bpQ: 8, dur: 0.05 });
        k.g.connect(g); perc(k.g.gain, tt, 0.30 - i * 0.08, 0.001, 0.030);
      }
      const root = chordRootHz(4);
      const a = tn(d, t + 0.09, { type: 'triangle', f: root * 1.5, dur: 0.22 });
      a.g.connect(g); perc(a.g.gain, t + 0.09, 0.18, 0.004, 0.15);
      const b = tn(d, t + 0.17, { type: 'triangle', f: root, dur: 0.30 });
      b.g.connect(g); perc(b.g.gain, t + 0.17, 0.20, 0.004, 0.22);
      haptic('light');
    },

    /* ── EQUIP ─────────────────────────────────────────────────────────────
       A tool going into a holder: a short scrape into a solid seat. Two
       metalThread taps 55 ms apart, the second lower and louder — the sound
       of something locating and then seating. 260 ms.                         */
    equip(t) {
      const d = alloc(PRIO.ui, 0.6, t); if (!d) return;
      const g = out(d, 0.55, -0.15, 0.18);
      const a = bd(d, t, B.metalThread, 1.35);
      a.g.connect(g); perc(a.g.gain, t, 0.24, 0.001, 0.06);
      const b = bd(d, t + 0.055, B.metalThread, 0.85);
      b.g.connect(g); perc(b.g.gain, t + 0.055, 0.40, 0.001, 0.16);
      haptic('detent');
    },

    /* ── UNLOCK ────────────────────────────────────────────────────────────
       Something new is available. A rising perfect fourth on FM bells with a
       bright, short shimmer. Shorter and lighter than level_up — this fires
       several times per level. 700 ms.                                        */
    unlock(t) {
      const d = alloc(PRIO.event, 1.4, t); if (!d) return;
      const g = out(d, 0.6, 0.0, 0.34);
      const root = chordRootHz(4);
      const muls = [1, 4 / 3];
      for (let i = 0; i < 2; i++) {
        const tt = t + i * 0.11;
        const car = trackSrc(d, ac.createOscillator());
        car.type = 'sine'; car.frequency.value = root * muls[i];
        const mod = trackSrc(d, ac.createOscillator());
        mod.type = 'sine'; mod.frequency.value = root * muls[i] * 2;
        const idx = track(d, gain(root * muls[i] * 1.4));
        mod.connect(idx); idx.connect(car.frequency);
        const bg = track(d, gain(EPS));
        car.connect(bg); bg.connect(g);
        setAt(bg.gain, EPS, tt);
        expoTo(bg.gain, 0.26, tt + 0.008);
        expoTo(bg.gain, EPS, tt + 0.62);
        idx.gain.setValueAtTime(root * muls[i] * 1.4, tt);
        expoTo(idx.gain, root * muls[i] * 0.1, tt + 0.30);
        car.start(tt); mod.start(tt); car.stop(tt + 0.75); mod.stop(tt + 0.75);
      }
      haptic('medium');
    },

    /* ── CERT EARNED ───────────────────────────────────────────────────────
       An official stamp: metalStamp at 0.9 with a short bright strike, drier
       than a grade stamp (send 0.20) so it reads as paperwork rather than
       triumph. 900 ms.                                                        */
    cert(t) {
      const d = alloc(PRIO.event, 1.4, t); if (!d) return;
      const g = out(d, 0.65, 0.1, 0.20);
      const hit = nz(d, t, { buf: B.white, bp: 2200, bpQ: 2.6, dur: 0.05 });
      hit.g.connect(g); perc(hit.g.gain, t, 0.45, 0.001, 0.025);
      const st = bd(d, t, B.metalStamp, 0.90);
      st.g.connect(g); perc(st.g.gain, t, 0.34, 0.002, 0.85);
      haptic('heavy');
    },

    /* ── XP TICK ───────────────────────────────────────────────────────────
       Fires often, so it is 45 ms and almost subliminal: one FM blip on the
       chord's fifth, ascending slightly each time it repeats within 1.5 s
       (xpStack) so a burst of XP reads as a run rather than a stutter.        */
    xp(t) {
      const d = alloc(PRIO.ui, 0.35, t); if (!d) return;
      const g = out(d, 0.34, 0.3, 0.24);
      const step = Math.min(xpStack, 7);
      const f = chordRootHz(5) * Math.pow(2, step / 12);
      const o = tn(d, t, { type: 'sine', f, dur: 0.22 });
      o.g.connect(g); perc(o.g.gain, t, 0.22, 0.003, 0.11);
      const k = nz(d, t, { buf: B.white, bp: 5200, bpQ: 9, dur: 0.03 });
      k.g.connect(g); perc(k.g.gain, t, 0.10, 0.0008, 0.014);
    },

    /* ── MONEY ─────────────────────────────────────────────────────────────
       A payout. Three ascending metallic ticks with a slight swing, plus the
       chord's octave underneath. 400 ms. Rising, unlike purchase().           */
    money(t) {
      const d = alloc(PRIO.ui, 0.8, t); if (!d) return;
      const g = out(d, 0.55, 0.2, 0.26);
      for (let i = 0; i < 3; i++) {
        const tt = t + i * 0.052 + (i === 1 ? 0.008 : 0);
        const k = nz(d, tt, { buf: B.white, bp: 3200 + i * 900, bpQ: 8, dur: 0.05 });
        k.g.connect(g); perc(k.g.gain, tt, 0.26, 0.001, 0.030);
      }
      const o = tn(d, t + 0.05, { type: 'triangle', f: chordRootHz(4) * 2, dur: 0.35 });
      o.g.connect(g); perc(o.g.gain, t + 0.05, 0.16, 0.004, 0.26);
      haptic('light');
    },

    /* ── UI: TAP / DETENT / ERROR / BACK ───────────────────────────────────
       House rule: under 90 ms, under 5.5 kHz, no tail. These are mechanical
       detents on a control panel, not chimes.
         tap    — 25 ms, BP 2.8 kHz Q 6, plus a 1.4 kHz body click
         detent — 18 ms, BP 4.4 kHz Q 12: a sharper, higher notch for sliders
                  crossing a graduation
         back   — 30 ms, BP 1.6 kHz, pitch falling: the "undo" direction
         error  — two 40 ms buzzes 70 ms apart on a square through a 700 Hz
                  bandpass. Low and flat, never a musical interval — an error
                  must not sound like part of the score.                       */
    ui_tap(t, p) {
      const d = alloc(PRIO.ui, 0.14, t); if (!d) return;
      const g = out(d, 0.42 * (p.gain !== undefined ? p.gain : 1), p.pan || 0, 0.06);
      const k = nz(d, t, { buf: B.white, bp: 2800, bpQ: 6, dur: 0.04 });
      k.g.connect(g); perc(k.g.gain, t, 0.5, 0.0008, 0.022);
      const b = tn(d, t, { type: 'triangle', f: 1400, dur: 0.05 });
      b.g.connect(g); perc(b.g.gain, t, 0.16, 0.001, 0.020);
      haptic('detent');
    },
    ui_detent(t, p) {
      const d = alloc(PRIO.ui, 0.10, t); if (!d) return;
      const g = out(d, 0.30 * (p.gain !== undefined ? p.gain : 1), p.pan || 0, 0.04);
      const k = nz(d, t, { buf: B.white, bp: 4400, bpQ: 12, dur: 0.03 });
      k.g.connect(g); perc(k.g.gain, t, 0.5, 0.0006, 0.016);
      haptic('detent');
    },
    ui_back(t) {
      const d = alloc(PRIO.ui, 0.16, t); if (!d) return;
      const g = out(d, 0.38, -0.1, 0.06);
      const k = nz(d, t, { buf: B.white, bp: 1600, bpQ: 5, dur: 0.05 });
      k.g.connect(g); perc(k.g.gain, t, 0.42, 0.001, 0.028);
      k.bp.frequency.setValueAtTime(1900, t);
      expoTo(k.bp.frequency, 900, t + 0.03);
      haptic('detent');
    },
    ui_error(t) {
      const d = alloc(PRIO.ui, 0.35, t); if (!d) return;
      const g = out(d, 0.45, 0.0, 0.08);
      for (let i = 0; i < 2; i++) {
        const tt = t + i * 0.07;
        const o = tn(d, tt, { type: 'square', f: 220, dur: 0.06 });
        const bp = track(d, filt('bandpass', 700, 2.2));
        o.g.connect(bp); bp.connect(g);
        perc(o.g.gain, tt, 0.22, 0.002, 0.038);
      }
      haptic('fail');
    },
  });

  /** XP stacking: consecutive XP ticks within 1.5 s walk up a scale. */
  let xpStack = 0, xpStackAt = -10;

  /* ═══════════════════════════════════════════════════════════════════════
     18. AMBIENCE EVENT VOICES
     ───────────────────────────────────────────────────────────────────────
     Sparse, randomised, low priority (they are the first thing stolen when
     the hammer is running). Every one is 2–5 nodes.

     Birds are FM: a sine carrier with a fast pitch envelope and a sine
     modulator at 1:1 with a decaying index. That is genuinely how a small
     bird's syrinx behaves — a rapidly frequency-swept near-sinusoid — and it
     is why FM birds sound real while filtered-noise birds never do.
     ═══════════════════════════════════════════════════════════════════════ */
  Object.assign(SHOTS, {

    /* Short two-note chirp, 2.6 → 3.9 kHz, 70 ms. Randomised each time. */
    bird_chirp(t, p) {
      const d = alloc(PRIO.ambient, 0.5, t); if (!d) return;
      const g = out(d, 0.5 * (p.gain || 0.3), p.pan || 0, 0.45, 'ambience');
      const n = 2 + (Math.random() < 0.4 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const tt = t + i * (0.055 + Math.random() * 0.03);
        const f0 = 2400 + Math.random() * 1500;
        const o = tn(d, tt, { type: 'sine', f: f0, dur: 0.09 });
        o.g.connect(g);
        perc(o.g.gain, tt, 0.5, 0.004, 0.045);
        o.osc.frequency.setValueAtTime(f0, tt);
        expoTo(o.osc.frequency, f0 * (1.25 + Math.random() * 0.4), tt + 0.028);
        expoTo(o.osc.frequency, f0 * 0.85, tt + 0.055);
      }
    },

    /* A trill: 6–9 rapid FM blips over 400 ms with a slight overall rise. */
    bird_trill(t, p) {
      const d = alloc(PRIO.ambient, 0.8, t); if (!d) return;
      const g = out(d, 0.45 * (p.gain || 0.25), p.pan || 0, 0.5, 'ambience');
      const n = 6 + Math.floor(Math.random() * 4);
      const base = 3000 + Math.random() * 1200;
      for (let i = 0; i < n; i++) {
        const tt = t + i * 0.045;
        const f = base * (1 + i * 0.02) * (0.95 + Math.random() * 0.1);
        const car = trackSrc(d, ac.createOscillator());
        car.type = 'sine'; car.frequency.value = f;
        const mod = trackSrc(d, ac.createOscillator());
        mod.type = 'sine'; mod.frequency.value = f;
        const idx = track(d, gain(f * 0.55));
        mod.connect(idx); idx.connect(car.frequency);
        const bg = track(d, gain(EPS));
        car.connect(bg); bg.connect(g);
        perc(bg.gain, tt, 0.32, 0.003, 0.026);
        idx.gain.setValueAtTime(f * 0.55, tt);
        expoTo(idx.gain, f * 0.05, tt + 0.03);
        car.start(tt); mod.start(tt); car.stop(tt + 0.06); mod.stop(tt + 0.06);
      }
    },

    /* Gull: a harsher cry — sawtooth through two formant peaks (900/2100 Hz)
       with a falling pitch and a rasp from a 34 Hz amplitude gate. */
    gull(t, p) {
      const d = alloc(PRIO.ambient, 1.2, t); if (!d) return;
      const g = out(d, 0.45 * (p.gain || 0.26), p.pan || 0, 0.42, 'ambience');
      const n = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) {
        const tt = t + i * 0.19;
        const f0 = 760 + Math.random() * 240;
        const o = tn(d, tt, { type: 'sawtooth', f: f0, dur: 0.22 });
        const f1 = track(d, filt('peaking', 900, 5, 12));
        const f2 = track(d, filt('peaking', 2100, 6, 10));
        const lp = track(d, filt('lowpass', 4200, 0.8));
        o.g.connect(f1); f1.connect(f2); f2.connect(lp); lp.connect(g);
        perc(o.g.gain, tt, 0.20, 0.012, 0.15);
        o.osc.frequency.setValueAtTime(f0 * 1.15, tt);
        expoTo(o.osc.frequency, f0 * 0.80, tt + 0.16);
      }
    },

    /* Branch creak / steel groan / ice creak — all the same physical model:
       STICK-SLIP. A low resonant tone gated by an irregular low-frequency
       square. Only the resonance and the rate differ:
         branch  180 Hz, 9 Hz gate, wooden (Q 4, lowpassed at 1.2 kHz)
         steel   240 Hz, 5 Hz gate, metallic (Q 12, peak at 1.8 kHz)
         ice     420 Hz, 14 Hz gate, glassy (Q 18, peak at 3.4 kHz)            */
    branch_creak(t, p) { SHOTS.__creak(t, p, 180, 9, 4, 1200, 0.9); },
    steel_groan(t, p) { SHOTS.__creak(t, p, 240, 5, 12, 2600, 1.3); },
    ice_creak(t, p) { SHOTS.__creak(t, p, 420, 14, 18, 5200, 1.1); },
    __creak(t, p, f, rate, Q, lpHz, dur) {
      const d = alloc(PRIO.ambient, dur + 0.4, t); if (!d) return;
      const g = out(d, 0.5 * (p.gain || 0.25), p.pan || 0, 0.5, 'ambience');
      const src = nz(d, t, { buf: B.brown, bp: f, bpQ: Q, lp: lpHz, dur: dur + 0.2, rate: 0.8 + Math.random() * 0.5 });
      const gate = track(d, gain(0.45));
      src.g.connect(gate); gate.connect(g);
      lfoGate(d, t, dur, rate * (0.7 + Math.random() * 0.6), 0.4, gate.gain);
      perc(src.g.gain, t, 0.55, 0.05, dur);
      // the resonance rises as the material strains
      src.bp.frequency.setValueAtTime(f, t);
      expoTo(src.bp.frequency, f * 1.5, t + dur * 0.8);
    },

    /* Ice crack: a sudden brittle fracture. 3 ms transient at 5.5 kHz into a
       short glassy ring (metalSnap at 1.6 → 1187 Hz) and a fast reverb tail. */
    ice_crack(t, p) {
      const d = alloc(PRIO.ambient, 1.2, t); if (!d) return;
      const g = out(d, 0.5 * (p.gain || 0.3), p.pan || 0, 0.6, 'ambience');
      const k = nz(d, t, { buf: B.white, bp: 5500, bpQ: 7, hp: 1800, dur: 0.05 });
      k.g.connect(g); perc(k.g.gain, t, 0.55, 0.0008, 0.020);
      const r = bd(d, t, B.metalSnap, 1.6);
      r.g.connect(g); perc(r.g.gain, t, 0.18, 0.002, 0.5);
    },

    /* Rock fall: 5–9 impacts with randomised times, pitches and levels,
       decaying in density — a real fall is front-loaded then trails off. */
    rock_fall(t, p) {
      const d = alloc(PRIO.ambient, 1.8, t); if (!d) return;
      const g = out(d, 0.5 * (p.gain || 0.26), p.pan || 0, 0.5, 'ambience');
      const n = 5 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i++) {
        const tt = t + Math.pow(Math.random(), 0.6) * 1.2;
        const hit = nz(d, tt, { buf: B.white, bp: 500 + Math.random() * 1600, bpQ: 3.5, dur: 0.10 });
        hit.g.connect(g); perc(hit.g.gain, tt, 0.16 + Math.random() * 0.2, 0.002, 0.07);
      }
    },

    /* Distant blast: a quarry shot heard across 2 km. All the high frequency
       has been absorbed by the air, so it is a 90 Hz-centred thump with a
       1.4 s reverb-dominated tail and NO transient at all. The absence of a
       transient is what encodes the distance. */
    distant_blast(t, p) {
      const d = alloc(PRIO.ambient, 2.6, t); if (!d) return;
      const g = out(d, 0.55 * (p.gain || 0.3), p.pan || 0, 0.85, 'ambience');
      const b = nz(d, t, { buf: B.brown, bp: 190, bpQ: 1.4, lp: 420, dur: 1.6, rate: 0.9 });
      b.g.connect(g);
      setAt(b.g.gain, EPS, t);
      expoTo(b.g.gain, 0.6, t + 0.09);         // 90 ms attack = far away
      expoTo(b.g.gain, EPS, t + 1.5);
      const rr = nz(d, t + 0.12, { buf: B.brown, bp: 420, bpQ: 0.8, dur: 1.4 });
      rr.g.connect(g); perc(rr.g.gain, t + 0.12, 0.20, 0.20, 1.1);
    },

    /* Distant truck: a diesel two blocks away — a 78 Hz-ish pulse train
       heavily lowpassed at 380 Hz with a slow random pitch drift. */
    distant_truck(t, p) {
      const d = alloc(PRIO.ambient, 3.4, t); if (!d) return;
      const g = out(d, 0.5 * (p.gain || 0.22), p.pan || 0, 0.5, 'ambience');
      const o = tn(d, t, { type: 'sawtooth', f: 74, dur: 3.0 });
      const lp = track(d, filt('lowpass', 380, 1.4));
      const pk = track(d, filt('peaking', 190, 3, 8));
      o.g.connect(pk); pk.connect(lp); lp.connect(g);
      setAt(o.g.gain, EPS, t);
      expoTo(o.g.gain, 0.30, t + 0.9);
      expoTo(o.g.gain, 0.24, t + 1.8);
      expoTo(o.g.gain, EPS, t + 2.9);
      o.osc.frequency.setValueAtTime(70, t);
      expoTo(o.osc.frequency, 96, t + 1.4);
      expoTo(o.osc.frequency, 62, t + 2.8);
    },

    /* Site reversing beeper: three 1000 Hz square beeps, 180 ms on / 220 off.
       Exactly the EN 500 pattern every European site worker knows. */
    site_beeper(t, p) {
      const d = alloc(PRIO.ambient, 1.6, t); if (!d) return;
      const g = out(d, 0.35 * (p.gain || 0.2), p.pan || 0, 0.55, 'ambience');
      for (let i = 0; i < 3; i++) {
        const tt = t + i * 0.40;
        const o = tn(d, tt, { type: 'square', f: 1000, dur: 0.20 });
        const bp = track(d, filt('bandpass', 1000, 3));
        o.g.connect(bp); bp.connect(g);
        setAt(o.g.gain, EPS, tt);
        linTo(o.g.gain, 0.16, tt + 0.006);
        setAt(o.g.gain, 0.16, tt + 0.174);
        linTo(o.g.gain, EPS, tt + 0.180);
      }
    },

    /* Metal clang: something dropped on a steel deck two hundred metres away. */
    metal_clang(t, p) {
      const d = alloc(PRIO.ambient, 1.6, t); if (!d) return;
      const g = out(d, 0.5 * (p.gain || 0.26), p.pan || 0, 0.62, 'ambience');
      const body = bd(d, t, B.metalClang, 0.8 + Math.random() * 0.6);
      const lp = track(d, filt('lowpass', 2600, 0.8));
      body.g.connect(lp); lp.connect(g);
      perc(body.g.gain, t, 0.34, 0.003, 0.9);
    },

    /* Cowbell: two inharmonic partials (metalClang at 2.1 and 3.15) — the
       classic 1 : 1.5 cowbell ratio, short and dry. */
    cowbell(t, p) {
      const d = alloc(PRIO.ambient, 0.7, t); if (!d) return;
      const g = out(d, 0.4 * (p.gain || 0.13), p.pan || 0, 0.5, 'ambience');
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const tt = t + i * (0.13 + Math.random() * 0.09);
        const a = bd(d, tt, B.metalClang, 2.1);
        a.g.connect(g); perc(a.g.gain, tt, 0.20, 0.002, 0.16);
        const b = bd(d, tt, B.metalClang, 3.15);
        b.g.connect(g); perc(b.g.gain, tt, 0.12, 0.002, 0.11);
      }
    },

    /* Wave slam against a jacket leg: a 600 ms swell of bandpassed brown noise
       rising 220 → 900 Hz, then a hiss of spray falling away. */
    wave_slam(t, p) {
      const d = alloc(PRIO.ambient, 2.4, t); if (!d) return;
      const g = out(d, 0.5 * (p.gain || 0.28), p.pan || 0, 0.55, 'ambience');
      const w = nz(d, t, { buf: B.brown, bp: 220, bpQ: 1.0, dur: 1.4, rate: 1.1 });
      w.g.connect(g);
      setAt(w.g.gain, EPS, t);
      expoTo(w.g.gain, 0.5, t + 0.22);
      expoTo(w.g.gain, EPS, t + 1.30);
      w.bp.frequency.setValueAtTime(220, t);
      expoTo(w.bp.frequency, 900, t + 0.4);
      const spray = nz(d, t + 0.18, { buf: B.pink, hp: 2400, bp: 4200, bpQ: 0.7, dur: 1.4 });
      spray.g.connect(g); perc(spray.g.gain, t + 0.18, 0.22, 0.12, 1.1);
    },

    /* Sand gust: a broadband hiss that sweeps its bandpass up and back down —
       the granular sound of sand actually moving past you. */
    sand_gust(t, p) {
      const d = alloc(PRIO.ambient, 2.8, t); if (!d) return;
      const g = out(d, 0.5 * (p.gain || 0.24), p.pan || 0, 0.35, 'ambience');
      const s = nz(d, t, { buf: B.pink, bp: 1200, bpQ: 0.8, hp: 700, dur: 2.2, rate: 1.2 });
      s.g.connect(g);
      setAt(s.g.gain, EPS, t);
      expoTo(s.g.gain, 0.42, t + 0.7);
      expoTo(s.g.gain, EPS, t + 2.1);
      s.bp.frequency.setValueAtTime(1200, t);
      expoTo(s.bp.frequency, 4200, t + 0.8);
      expoTo(s.bp.frequency, 900, t + 2.0);
    },

    /* Insect: a dry 40 Hz-gated buzz at 4.6 kHz, 300 ms. Desert cicada. */
    insect(t, p) {
      const d = alloc(PRIO.ambient, 0.8, t); if (!d) return;
      const g = out(d, 0.4 * (p.gain || 0.10), p.pan || 0, 0.3, 'ambience');
      const s = nz(d, t, { buf: B.white, bp: 4600, bpQ: 6, dur: 0.5 });
      const gate = track(d, gain(0.5));
      s.g.connect(gate); gate.connect(g);
      lfoGate(d, t, 0.45, 40, 0.45, gate.gain);
      perc(s.g.gain, t, 0.22, 0.04, 0.30);
    },

    /* Snow settle: a very quiet, very soft 500 ms puff, lowpassed at 900 Hz.
       Almost inaudible — its job is to make the arctic silence feel occupied
       rather than broken. */
    snow_settle(t, p) {
      const d = alloc(PRIO.ambient, 1.0, t); if (!d) return;
      const g = out(d, 0.4 * (p.gain || 0.14), p.pan || 0, 0.5, 'ambience');
      const s = nz(d, t, { buf: B.pink, lp: 900, lpQ: 0.6, hp: 300, dur: 0.7 });
      s.g.connect(g); perc(s.g.gain, t, 0.30, 0.09, 0.5);
    },
  });

  /* ═══════════════════════════════════════════════════════════════════════
     18b. ONE-SHOTS FOR THE SIX NEW METHODS
     ───────────────────────────────────────────────────────────────────────
     Same four primitives, same house rules: all load-bearing information
     between 300 Hz and 5 kHz, nothing that relies on a frequency a phone
     speaker cannot make, every envelope written out so a reviewer can check
     it against the physics in the comment above it.
     ═══════════════════════════════════════════════════════════════════════ */

  /* A real face round fires on a millisecond-delay detonator series. These are
     the nominal delays of a standard short-period series, and firing the holes
     on them (rather than together) is what stops the burden being thrown at
     the machine — so it is also what a round actually sounds like. */
  const BLAST_DELAYS = [0, 0.025, 0.050, 0.100, 0.175, 0.300];
  /* Click-type torque wrench: the pawl steps up as preload rises, then breaks
     over. Times from the wrench, not from taste — a 3/4" click wrench ratchets
     at about 6–7 Hz when you are leaning on it. */
  const TORQUE_CLICKS = [0, 0.155, 0.290];
  /* Ram rebound on refusal: the hammer bounces, and the bounces get closer
     together and much weaker. This pattern is what a piling crew listens for. */
  const PILE_BOUNCE_T = [0, 0.095, 0.168];
  const PILE_BOUNCE_A = [1.0, 0.42, 0.18];

  Object.assign(SHOTS, {

    /* ── BLAST — THE ROUND GOES ────────────────────────────────────────────
       Three movements, because that is what a face blast is.

       1. THE RIPPLE (0 – 300 ms). A round is NOT one bang. Forty holes fire on
          a millisecond-delay series — 0 / 25 / 50 / 100 / 175 / 300 ms — so we
          fire six sub-detonations on exactly those delays. Each is white noise
          through a bandpass that steps DOWN 2600 → 700 Hz across the sequence
          and chirps down another 58 % inside each hit: the cut holes go first
          and are relatively unconfined, so they CRACK; the lifters go last,
          buried under the whole burden, so they THUD. Attack 0.8 ms (nothing
          in nature is faster), decay 45 → 90 ms.
       2. THE RUMBLE (0.02 – 3.3 s). Brown noise, bandpass 150 Hz Q 1.1 with a
          520 Hz lowpass over it, attack 110 ms, exponential decay to silence at
          3.3 s. The muck pile arriving and the rock mass relaxing. On a phone
          speaker almost none of this is reproduced directly — what you hear is
          the underground IR (0.62 s, 1.45× wet) being driven by it, which is
          exactly how a real drift makes a blast feel enormous in a small space.
       3. THE FANS (1.5 – 5.7 s). Pink noise with its highpass sweeping
          260 → 900 Hz over 1.4 s, swelling to 0.20 and holding: the ventilation
          going to full to clear the fumes. It also sets m.ventBoost = 1, so the
          PERSISTENT vent bed (§14b) swells for a further ~12 s after this voice
          has been reaped. That hand-off is the point: the round has a
          consequence, not just a sound.

       ~6 s, priority critical, ducks the whole mix for 1.4 s, haptic heavy.   */
    blast(t, p) {
      const d = alloc(PRIO.critical, 6.4, t); if (!d) return;
      const g = out(d, clamp(p.gain !== undefined ? p.gain : 1, 0, 1.3), 0.0, 0.55);

      for (let i = 0; i < BLAST_DELAYS.length; i++) {
        const tt = t + BLAST_DELAYS[i];
        const k = i / (BLAST_DELAYS.length - 1);
        const f = mixf(2600, 700, k);
        const s = nz(d, tt, { buf: B.white, bp: f, bpQ: 1.1, hp: 180, dur: 0.16 });
        s.g.connect(g);
        perc(s.g.gain, tt, mixf(0.95, 0.55, k), 0.0008, mixf(0.045, 0.090, k));
        s.bp.frequency.setValueAtTime(f, tt);
        expoTo(s.bp.frequency, f * 0.42, tt + 0.07);
      }

      const rum = nz(d, t + 0.02, { buf: B.brown, bp: 150, bpQ: 1.1, lp: 520, dur: 3.4, rate: 0.85 });
      rum.g.connect(g);
      setAt(rum.g.gain, EPS, t + 0.02);
      expoTo(rum.g.gain, 0.72, t + 0.13);
      expoTo(rum.g.gain, EPS, t + 3.30);

      const fan = nz(d, t + 1.5, { buf: B.pink, hp: 260, hpQ: 0.6, bp: 900, bpQ: 0.5, dur: 4.2 });
      fan.g.connect(g);
      setAt(fan.g.gain, EPS, t + 1.5);
      expoTo(fan.g.gain, 0.20, t + 2.9);
      expoTo(fan.g.gain, 0.13, t + 4.6);
      expoTo(fan.g.gain, EPS, t + 5.7);
      fan.hp.frequency.setValueAtTime(260, t + 1.5);
      expoTo(fan.hp.frequency, 900, t + 2.9);

      m.ventBoost = 1;
      duckFor(1400); haptic('heavy');
    },

    /* ── MISFIRE ───────────────────────────────────────────────────────────
       The firing line goes and nothing happens. Two dry clicks 700 ms apart —
       the exploder, then the second attempt — and then NOTHING, which is the
       most frightening thing that can happen at a face.

       The send is 0.02, effectively zero. In a room as reverberant as the
       underground acoustic, a sound with no tail is physically impossible, and
       that wrongness is doing all the work: the click reads as being inside
       your own head rather than out at the face. 30 ms total, no body, no
       pitch, nothing to hold on to.                                           */
    misfire(t, p) {
      const d = alloc(PRIO.hazard, 1.2, t); if (!d) return;
      const g = out(d, 0.85 * (p.gain !== undefined ? p.gain : 1), 0.0, 0.02);
      for (let i = 0; i < 2; i++) {
        const tt = t + i * 0.70;
        const c = nz(d, tt, { buf: B.white, bp: 2800, bpQ: 3.2, hp: 1200, dur: 0.03 });
        c.g.connect(g); perc(c.g.gain, tt, 0.55 - i * 0.12, 0.0006, 0.006);
      }
      haptic('light');
    },

    /* ── RESIN PUNCTURE ────────────────────────────────────────────────────
       The bolt reaches the first cartridge and bursts it. Three elements:
         1. THE FILM SPLITTING — pink noise through a Q-3.4 bandpass sweeping
            UP 900 → 2400 Hz in 45 ms. Upward is the whole character: a
            tearing polyester sleeve gets brighter as the tear accelerates,
            which is the opposite of every breaking-rock sound in this file.
         2. THE COLLAPSE — a 210 Hz sine falling to 132 Hz in 70 ms. The
            cartridge losing its shape. Low, brief, and the only pitched thing
            in the voice.
         3. THE RESIN MOVING — 260 ms of brown noise at 480 Hz Q 1.6, 20 ms
            attack, which hands straight over to the continuous mixing voice
            (§13b-4). By the time this decays the bolter is already spinning.  */
    resin_puncture(t, p) {
      const d = alloc(PRIO.event, 0.9, t); if (!d) return;
      const g = out(d, 0.70 * (p.gain !== undefined ? p.gain : 1), 0.05, 0.16);

      const split = nz(d, t, { buf: B.pink, bp: 900, bpQ: 3.4, dur: 0.12 });
      split.g.connect(g); perc(split.g.gain, t, 0.62, 0.002, 0.055);
      split.bp.frequency.setValueAtTime(900, t);
      expoTo(split.bp.frequency, 2400, t + 0.045);

      const pop = tn(d, t, { type: 'sine', f: 210, dur: 0.16 });
      pop.g.connect(g); perc(pop.g.gain, t, 0.30, 0.002, 0.055);
      pop.osc.frequency.setValueAtTime(210, t);
      expoTo(pop.osc.frequency, 132, t + 0.07);

      const wet = nz(d, t + 0.03, { buf: B.brown, bp: 480, bpQ: 1.6, dur: 0.34 });
      wet.g.connect(g); perc(wet.g.gain, t + 0.03, 0.34, 0.02, 0.26);
      haptic('light');
    },

    /* ── TORQUE WRENCH ─────────────────────────────────────────────────────
       The pull test that closes a bolt install.
         CLICKS at 0 / 155 / 290 ms — the pawl stepping, and the centre
           frequency CLIMBS 3200 → 4120 Hz across the three, because the pawl
           is loading against a stiffer and stiffer bolt. 20 ms each, Q 4.5.
         BREAK-OVER at 440 ms — the wrench giving way at the set torque:
           metalThread at rate 1.35 (388 × 1.35 = 524 Hz) with a 2.1 kHz noise
           snap on top and 190 ms of ring.
         LOAD — a 168 Hz sawtooth through a 900 Hz lowpass with a 30 ms attack
           and 340 ms decay: the bolt itself taking the preload.
       Haptic: success. This is the sound of a bolt that will hold.            */
    torque_wrench(t, p) {
      const d = alloc(PRIO.event, 1.6, t); if (!d) return;
      const g = out(d, 0.72 * (p.gain !== undefined ? p.gain : 1), -0.15, 0.22);
      for (let i = 0; i < TORQUE_CLICKS.length; i++) {
        const tt = t + TORQUE_CLICKS[i];
        const c = nz(d, tt, { buf: B.white, bp: 3200 + i * 460, bpQ: 4.5, hp: 1400, dur: 0.02 });
        c.g.connect(g); perc(c.g.gain, tt, 0.34 + i * 0.07, 0.0006, 0.008);
      }
      const tb = t + 0.44;
      const body = bd(d, tb, B.metalThread, 1.35);
      body.g.connect(g); perc(body.g.gain, tb, 0.55, 0.001, 0.19);
      const snap = nz(d, tb, { buf: B.white, bp: 2100, bpQ: 2.2, dur: 0.05 });
      snap.g.connect(g); perc(snap.g.gain, tb, 0.42, 0.0008, 0.020);
      const grn = tn(d, tb, { type: 'sawtooth', f: 168, dur: 0.50 });
      const lp = track(d, filt('lowpass', 900, 1.4));
      grn.g.connect(lp); lp.connect(g); perc(grn.g.gain, tb, 0.20, 0.03, 0.34);
      haptic('success');
    },

    /* ── PILE BLOW ─────────────────────────────────────────────────────────
       One blow of a hydraulic impact hammer onto a driven pile. Four layers,
       and which of them you hear is the whole gameplay read.

       THE PILE'S OWN RING is real physics, not a preset. A pile is a free bar,
       so its fundamental longitudinal mode is f = c / 2L:
           steel    c = 5100 m/s   20 m → 128 Hz   12 m → 213 Hz   35 m → 73 Hz
           concrete c = 3800 m/s   20 m →  95 Hz   12 m → 158 Hz
       B.pileSteel is baked at 108 Hz and B.pileConcrete at 168 Hz, and we
       retune per pile with playbackRate — which stretches the DECAY by the
       same factor, which is exactly what a longer bar does. So a 35 m pile is
       not just lower than a 12 m pile, it rings for 2.9× as long, correctly.

       THE PENETRATION TELL — the two ends of this are not a level change, they
       are two different sounds:
         RUNNING FREE (set 20–25 mm/blow). The toe is unsupported, so the
           stress wave reflects in TENSION at the toe and cancels the incident
           compression; the shaft is damped along its whole embedded length by
           the soil it is displacing. Result: ringTau 0.16 s — a short, dull
           "boonk" — plus a big 96 Hz ground thump, because a quarter of a
           tonne of ram is putting a metre of soil into motion.
         AT REFUSAL (set → 0). The toe is on rock, so the wave reflects in
           COMPRESSION and REINFORCES; nothing is moving, so there is no soil
           to damp it and no ground thump at all. Result: ringTau 0.62 s (3.9×
           longer), ring level 0.22 → 0.88 (+12 dB), and a triangle partial at
           4·f (512 Hz on a 20 m pile) that is not there at all when the pile
           is running. A pile at refusal PINGS. A pile running free THUDS.

       THE ENERGY TELL (see the hyperbola in §13b-5):
         strike centroid 2600 Hz (12 kNm) → 1050 Hz (235 kNm), then chirping
         down another 55 % over 60 ms; attack 1.2 → 3.5 ms; level 0.30 → 0.92.

       ALIGNMENT: deviation > 0.15 adds metalClang at rate 1.6–2.1 — the helmet
       not seating square and ringing the cap inharmonically. It is the only
       inharmonic thing in the voice, so it stands out immediately, which is
       what a PROTECT-axis tell has to do.

       ── THE BROOM. THE ONE THING THIS METHOD IS ACTUALLY ABOUT. ───────────
       The sim's own note on the driven pile says it plainly: "the instrument
       can lie: a pile whose toe is brooming produces a beautiful set while it
       destroys itself." The mechanism is arithmetic —
           measuredSet = trueSet + broom
       — so as the toe crushes and splays, the head keeps going down, the SET
       GAUGE KEEPS READING WELL, and the pile is not advancing at all. The
       player is watching an instrument that is being fooled by the damage.

       We are handed `toeDamage01`, which is honest, and `setMmPerBlow`, which
       is not. It would be trivial and WRONG to just put the honest number on a
       meter of our own — that is not a sound, it is a cheat, and it would tell
       the player something the driller on the hammer does not have.

       What a driller on the hammer does have is the blow. A stress wave sent
       down a pile comes back off the toe and the head hears the reflection,
       and those three toes are three different reflections:

         RUNNING FREE      free end: reflects in TENSION, cancels the incident
                           compression. Short dull ring, big soil thump.
         ON ROCK           fixed end: reflects in COMPRESSION, reinforces. Long
                           bright ring with a strong 4·f partial. It PINGS.
         BROOMED           neither. A splayed, crushed, splitting toe is a
                           lossy diffuse termination: the reflection comes back
                           late, smeared and much weaker, and a lot of the
                           energy never comes back at all because it went into
                           destroying the pile. The ring DIES.

       So the broom is not a warning tone laid over the blow, it is the blow's
       own ring being taken away:
           ring level  × (1 − 0.62·broom)     the reflection is lossy
           ring tau    × (1 − 0.50·broom)     and it does not sustain
           ring rate   × (1 − 0.055·broom)    a splayed end is a longer,
                                              softer bar: the pitch sags
           the 4·f refusal PING × (1 − broom) a broomed pile never pings, no
                                              matter what the set gauge says
       plus one thing that is added rather than removed: a CRUSH layer, brown
       noise at 190 → 260 Hz, 45 ms, entirely unpitched. That is the toe
       failing, and it is the only non-tonal thing in a blow that is otherwise
       all pitch.

       WHY IT LEADS THE GAUGE, HONESTLY. toeDamage integrates from the first
       hard blow into a sharp toe, and the measured set only starts to inflate
       once broomSetMm × toeDamage is a visible fraction of a millimetre. So
       the ring is already dying while the gauge still reads beautifully, and
       the player who is LISTENING knows before the player who is only
       watching. It is not extra information — it is the same information,
       arriving through the ear at the speed the physics actually delivers it.

       And the ram stops sounding like it is bouncing: stepPile() suppresses
       the pile_refusal rebound above broom 0.45, because a hammer driving a
       crushed end does not rebound. The audio never repeats the gauge's lie.  */
    pile_blow(t, p) {
      const e = clamp(p.energy !== undefined ? p.energy : 0.5, 0, 1);
      const ref = clamp(p.refusal !== undefined ? p.refusal : 0, 0, 1);
      const brm = clamp(p.broom !== undefined ? p.broom : 0, 0, 1);
      const dev = clamp(p.deviation || 0, 0, 1);
      const L = clamp(p.length || 20, 6, 40);
      const concrete = p.material === 'concrete' || p.material === 'precast';
      const c = concrete ? 3800 : 5100;
      const ringHz = clamp(c / (2 * L), 55, 330);
      const baseHz = concrete ? 168 : 108;
      const body = concrete ? (B.pileConcrete || B.metalClang) : (B.pileSteel || B.metalClang);
      // The splayed end is a longer, softer bar: the pitch sags with the broom.
      const rate = clamp((ringHz / baseHz) * (1 - 0.055 * brm), 0.25, 3.2);

      const ringTau = mixf(0.16, 0.62, ref) * mixf(1.0, 0.72, clamp(p.embed || 0, 0, 1))
                      * (1 - 0.50 * brm);
      const ringLvl = (0.22 + 0.66 * ref) * (concrete ? 0.55 : 1) * (1 - 0.62 * brm);
      const thudLvl = 0.62 * (1 - ref) * mixf(0.5, 1, e);

      const d = alloc(PRIO.blow, 0.4 + ringTau * 3.6, t); if (!d) return;
      const lvl = (0.30 + 0.62 * Math.pow(e, 0.55)) * (p.gain !== undefined ? p.gain : 1);
      const g = out(d, clamp(lvl, 0, 1.2), -0.05, 0.30);

      const cf = mixf(2600, 1050, e);
      const hit = nz(d, t, { buf: B.white, bp: cf, bpQ: 1.6, hp: 240, dur: 0.18 });
      hit.g.connect(g);
      perc(hit.g.gain, t, 0.95, mixf(0.0012, 0.0035, e), mixf(0.030, 0.075, e));
      hit.bp.frequency.setValueAtTime(cf, t);
      expoTo(hit.bp.frequency, cf * 0.45, t + 0.06);

      const rg = bd(d, t + 0.0015, body, rate);
      rg.g.connect(g); perc(rg.g.gain, t + 0.0015, ringLvl, 0.0015, ringTau * 3.2);

      // A pile at refusal PINGS — but only if the toe is still a toe. Scaling
      // by (1 − broom) is the single most load-bearing multiplication in this
      // voice: it is what stops the audio repeating the set gauge's lie.
      if (ref > 0.25 && brm < 0.98) {
        const png = tn(d, t + 0.002, { type: 'triangle', f: clamp(ringHz * 4, 200, 2600), dur: ringTau * 3 + 0.1 });
        png.g.connect(g); perc(png.g.gain, t + 0.002, 0.22 * ref * (1 - brm), 0.003, ringTau * 2.2);
      }

      // THE CRUSH. The toe failing: unpitched, low, short, and the only
      // non-tonal element in an otherwise entirely tonal blow. Threshold 0.06
      // rather than 0 so a pristine pile allocates nothing at all.
      if (brm > 0.06) {
        const cr = nz(d, t + 0.001, { buf: B.brown, bp: mixf(190, 260, e), bpQ: 0.9, lp: 620, dur: 0.10, rate: 0.9 });
        cr.g.connect(g); perc(cr.g.gain, t + 0.001, 0.34 * brm * mixf(0.6, 1, e), 0.004, 0.045);
      }

      if (thudLvl > 0.02) {
        const th = nz(d, t, { buf: B.brown, bp: 96, bpQ: 1.2, lp: 300, dur: 0.5, rate: 0.8 });
        th.g.connect(g); perc(th.g.gain, t, thudLvl, 0.006, mixf(0.10, 0.24, e));
      }

      if (dev > 0.15) {
        const cl = bd(d, t + 0.004, B.metalClang, 1.6 + dev * 0.5);
        cl.g.connect(g); perc(cl.g.gain, t + 0.004, 0.26 * dev, 0.002, 0.16);
      }

      duckMusic(t, 0.42 + 0.35 * e);
      hapticBlow(0.5 + 0.5 * e);
    },

    /* The three named energies. 12 kNm at 100 blows/min, ~66 kNm at 50, and
       235 kNm at 30 — the two ends of the hyperbola and its middle. These
       exist so the sim, the garage preview and QA can trigger a known point on
       the curve by name instead of guessing at a float. */
    pile_blow_soft(t, p) {
      SHOTS.pile_blow(t, { energy: 0.00, refusal: p.refusal, length: p.length, material: p.material, embed: p.embed, deviation: p.deviation, broom: p.broom, gain: p.gain });
    },
    pile_blow_mid(t, p) {
      SHOTS.pile_blow(t, { energy: 0.245, refusal: p.refusal, length: p.length, material: p.material, embed: p.embed, deviation: p.deviation, broom: p.broom, gain: p.gain });
    },
    pile_blow_hard(t, p) {
      SHOTS.pile_blow(t, { energy: 1.00, refusal: p.refusal, length: p.length, material: p.material, embed: p.embed, deviation: p.deviation, broom: p.broom, gain: p.gain });
    },

    /* ── PILE REFUSAL ──────────────────────────────────────────────────────
       Not a blow — a verdict. The ram hits, the pile does not move, and the
       ram REBOUNDS and strikes again at 95 ms and 168 ms with 42 % and 18 % of
       the energy. That accelerating, decaying rebound is unmistakable and it is
       what a piling crew actually listens for: the hammer stops sounding like
       it is driving and starts sounding like it is bouncing.

       Each of the three carries its own full pile ring at c/2L, so the pile
       rings three times over in 170 ms and the ring-downs overlap into one
       long pitched tone. Ducks the mix 500 ms; haptic fail.                    */
    pile_refusal(t, p) {
      const d = alloc(PRIO.hazard, 2.6, t); if (!d) return;
      const g = out(d, 1.0, -0.05, 0.34);
      const L = clamp(p.length || 20, 6, 40);
      const ringHz = clamp(5100 / (2 * L), 55, 330);
      const rate = clamp(ringHz / 108, 0.25, 3.2);
      for (let i = 0; i < PILE_BOUNCE_T.length; i++) {
        const tt = t + PILE_BOUNCE_T[i];
        const a = PILE_BOUNCE_A[i];
        const hit = nz(d, tt, { buf: B.white, bp: 2400 + i * 500, bpQ: 2.2, hp: 500, dur: 0.09 });
        hit.g.connect(g); perc(hit.g.gain, tt, 0.90 * a, 0.0009, 0.024);
        const rg = bd(d, tt + 0.001, B.pileSteel || B.metalClang, rate);
        rg.g.connect(g); perc(rg.g.gain, tt + 0.001, 0.62 * a, 0.0015, 1.05 * a + 0.20);
      }
      duckFor(500); haptic('fail');
    },

    /* ── SPT HAMMER DROP ───────────────────────────────────────────────────
       BS EN ISO 22476-3 / BS 1377-9: a 63.5 kg hammer falling 760 mm onto the
       drive head. Every number in this voice comes off that one sentence:
           free-fall time   t = √(2h/g) = √(2 × 0.760 / 9.81) = 0.394 s
           impact velocity  v = √(2gh)  = 3.86 m/s
           nominal energy   E = mgh     = 63.5 × 9.81 × 0.760 = 473 J
       The player is COUNTING these, so the whole structure exists to make the
       clang predictable and then unmissable:

         t + 0            THE TRIP. 20 ms, 2.6 kHz, level 0.10. Quiet, but it
                          is the cue that starts the count in the player's head.
         t + 0.02 → 0.414 THE FALL. Pink noise, bandpass climbing 220 → 640 Hz,
                          level rising LINEARLY because v = g·t is linear in
                          time. Peak 0.115 — about 19 dB under the clang. Its
                          job is not to be heard, it is to make you know exactly
                          when the clang is coming.
         t + 0.394        THE CLANG. 1.2 ms attack, nothing else scheduled
                          within 150 ms of it in either direction. There is no
                          way to mistake where this transient is, which is the
                          entire requirement.

       N-VALUE colours the clang and nothing else (n01 = N/50):
         loose (N = 4)   the rods ring on — anvil tau 0.42 s, rod ring at full
                         level, strike centred at 1.5 kHz. Soft and hollow.
         refusal (N ≥ 50) the energy has nowhere to go: strike centred at
                         2.6 kHz, anvil tau 0.11 s (3.8× shorter), rod ring
                         GONE (scaled by 1 − n01). Bright, hard and dead.
       Counting blows in dense ground therefore SOUNDS like work, which is the
       honest thing for this voice to say.

       NO HAPTIC. navigator.vibrate cannot be scheduled, so firing it now would
       put the buzz 394 ms before the clang and destroy the one cue this voice
       exists to make unambiguous. duckMusic() is scheduled on the audio clock
       and therefore lands correctly, on the impact.                            */
    spt_drop(t, p) {
      const d = alloc(PRIO.blow, 1.6, t); if (!d) return;
      const n01 = clamp((p.n || 0) / 50, 0, 1);
      const g = out(d, 0.90 * (p.gain !== undefined ? p.gain : 1), 0.0, 0.26);

      const trip = nz(d, t, { buf: B.white, bp: 2600, bpQ: 3.0, hp: 1100, dur: 0.02 });
      trip.g.connect(g); perc(trip.g.gain, t, 0.10, 0.0008, 0.007);

      const FALL = 0.394;
      const fall = nz(d, t + 0.02, { buf: B.pink, bp: 220, bpQ: 1.1, hp: 150, dur: FALL });
      fall.g.connect(g);
      setAt(fall.g.gain, EPS, t + 0.02);
      linTo(fall.g.gain, 0.055, t + 0.20);
      linTo(fall.g.gain, 0.115, t + 0.02 + FALL);
      linTo(fall.g.gain, EPS, t + 0.03 + FALL);
      fall.bp.frequency.setValueAtTime(220, t + 0.02);
      linTo(fall.bp.frequency, 640, t + 0.02 + FALL);

      const ti = t + FALL;
      const strike = nz(d, ti, { buf: B.white, bp: mixf(1500, 2600, n01), bpQ: 2.0, hp: 320, dur: 0.20 });
      strike.g.connect(g); perc(strike.g.gain, ti, 1.0, 0.0012, mixf(0.055, 0.022, n01));

      const anv = bd(d, ti + 0.0008, B.anvil || B.metalThread, mixf(0.86, 1.24, n01));
      anv.g.connect(g); perc(anv.g.gain, ti + 0.0008, 0.62, 0.0015, mixf(0.42, 0.11, n01));

      const rods = bd(d, ti + 0.003, B.ringDTH, 0.62);
      rods.g.connect(g); perc(rods.g.gain, ti + 0.003, 0.34 * (1 - n01), 0.002, mixf(0.55, 0.12, n01));

      duckMusic(ti, 0.50);
    },

    /* ── CPT PUSH START ────────────────────────────────────────────────────
       A cone penetrometer is pushed at a fixed 20 mm/s by a hydraulic ram
       reacting against 15–20 t of ballast. No rotation, no flush, no
       percussion, no cuttings — there is almost nothing to hear, and that is
       the design:
         VALVE  50 ms at 1.8 kHz, level 0.16 — the directional valve shifting.
         RAM    a 34 → 44 Hz sawtooth through a +8 dB peak at 165 Hz and a
                260 Hz lowpass, swelling over 550 ms and settling. The
                fundamental is inaudible on a phone; what you get is the
                165 Hz peak and the harmonics above it, which is precisely the
                "something very large is moving very slowly" cue.
       Peak level 0.30 into a 0.55 output gain — roughly 26 dB under a hammer
       blow. On top of that method.trim (0.50) and m.quiet pull the engine,
       hydraulics and score back. This is the quietest voice in the game.      */
    cpt_push_start(t, p) {
      const d = alloc(PRIO.event, 1.6, t); if (!d) return;
      const g = out(d, 0.55 * (p.gain !== undefined ? p.gain : 1), 0.08, 0.16);
      const v = nz(d, t, { buf: B.white, bp: 1800, bpQ: 2.4, hp: 800, dur: 0.05 });
      v.g.connect(g); perc(v.g.gain, t, 0.16, 0.003, 0.028);
      const ram = tn(d, t + 0.02, { type: 'sawtooth', f: 34, dur: 1.10 });
      const pk = track(d, filt('peaking', 165, 3.0, 8));
      const lp = track(d, filt('lowpass', 260, 1.2));
      ram.g.connect(pk); pk.connect(lp); lp.connect(g);
      setAt(ram.g.gain, EPS, t + 0.02);
      expoTo(ram.g.gain, 0.30, t + 0.55);
      expoTo(ram.g.gain, 0.20, t + 0.95);
      expoTo(ram.g.gain, EPS, t + 1.10);
      ram.osc.frequency.setValueAtTime(34, t + 0.02);
      linTo(ram.osc.frequency, 44, t + 0.90);
      haptic('light');
    },

    /* ── CPT PUSH STOP ─────────────────────────────────────────────────────
       The ram relieving. A 420 ms hiss whose highpass FALLS 900 → 350 Hz as
       the pressure bleeds off (slower jet, darker spectrum — the same physics
       as the blow-down in §16, an octave and a half quieter), then the rod
       clamp releasing at 50 ms. Nothing else. A CPT test ends by stopping.     */
    cpt_push_stop(t, p) {
      const d = alloc(PRIO.event, 1.0, t); if (!d) return;
      const g = out(d, 0.50 * (p.gain !== undefined ? p.gain : 1), 0.08, 0.16);
      const s = nz(d, t, { buf: B.pink, hp: 900, hpQ: 0.6, bp: 1600, bpQ: 0.8, dur: 0.50 });
      s.g.connect(g);
      setAt(s.g.gain, EPS, t);
      linTo(s.g.gain, 0.20, t + 0.01);
      expoTo(s.g.gain, EPS, t + 0.42);
      s.hp.frequency.setValueAtTime(900, t);
      expoTo(s.hp.frequency, 350, t + 0.40);
      const cl = bd(d, t + 0.05, B.metalThread, 0.70);
      cl.g.connect(g); perc(cl.g.gain, t + 0.05, 0.22, 0.002, 0.12);
    },

    /* ── CYCLONE SLUG ──────────────────────────────────────────────────────
       Sample dropping out of the cyclone cone into the splitter. An RC return
       is not a continuous stream — the chip column arrives in SLUGS, one every
       0.3–1.2 s, and that rhythm is how the crew knows the hole is returning.
         BODY    brown noise, bandpass 380 Hz Q 1.4, 6 ms attack, 150 ms decay
                 — a few hundred grams of chips landing in a steel cone.
         RATTLE  white noise at 2.4 kHz gated by a 42 Hz square for 90 ms — the
                 individual chips bouncing off the cone wall.
       p.wet 0..1 is the contamination tell arriving in the one-shots as well as
       in the continuous voice: the rattle is scaled by (1 − wet) and dropped
       entirely above 0.85, while the body drops to 240 Hz, its Q more than
       doubles (1.4 → 3.2) and its decay lengthens 150 → 230 ms. Wet chips do
       not rattle. They slap, and then they stick.                              */
    cyclone_slug(t, p) {
      const d = alloc(PRIO.flush, 0.7, t); if (!d) return;
      const w = clamp(p.wet || 0, 0, 1);
      const g = out(d, 0.55 * (p.gain !== undefined ? p.gain : 1), 0.22, 0.20);
      const body = nz(d, t, { buf: B.brown, bp: mixf(380, 240, w), bpQ: mixf(1.4, 3.2, w), dur: 0.30, rate: 1.1 });
      body.g.connect(g); perc(body.g.gain, t, 0.62, 0.006, mixf(0.150, 0.230, w));
      if (w < 0.85) {
        const rat = nz(d, t + 0.004, { buf: B.white, bp: 2400, bpQ: 2.2, hp: 900, dur: 0.09 });
        const gt = track(d, gain(0.50));
        rat.g.connect(gt); gt.connect(g);
        lfoGate(d, t + 0.004, 0.09, 42, 0.42, gt.gain);
        perc(rat.g.gain, t + 0.004, 0.30 * (1 - w), 0.003, 0.06);
      }
    },

    /* ── SAMPLE BAG ────────────────────────────────────────────────────────
       The bag coming off the splitter and going down in the row. Woven
       polypropylene rustles at 3–5 kHz, so the rustle is white noise at
       3.6 kHz gated by a 23 Hz square (a hand shaking a bag, not a machine);
       the sample lands 240 ms later as a dead 92 Hz thump with NO ring at all,
       because 3 kg of wet rock chips is the most heavily damped object on the
       entire site. The absence of a tail is what makes it read as heavy.       */
    sample_bag(t, p) {
      const d = alloc(PRIO.event, 1.0, t); if (!d) return;
      const g = out(d, 0.50 * (p.gain !== undefined ? p.gain : 1), 0.30, 0.18);
      const r = nz(d, t, { buf: B.white, bp: 3600, bpQ: 0.9, hp: 1800, dur: 0.30 });
      const gt = track(d, gain(0.55));
      r.g.connect(gt); gt.connect(g);
      lfoGate(d, t, 0.30, 23, 0.40, gt.gain);
      perc(r.g.gain, t, 0.34, 0.02, 0.22);
      const th = nz(d, t + 0.24, { buf: B.brown, bp: 92, bpQ: 1.0, lp: 260, dur: 0.30, rate: 0.8 });
      th.g.connect(g); perc(th.g.gain, t + 0.24, 0.42, 0.008, 0.10);
      haptic('light');
    },

    /* ── BOOM REPOSITION ───────────────────────────────────────────────────
       A jumbo boom swinging to the next collar, or a longhole rig re-indexing
       round the ring. Three hydraulic elements:
         SWING   sawtooth 88 → 152 Hz over 800 ms through a lowpass that tracks
                 it at 5× — a proportional valve opening, then the boom
                 accelerating. The rising pitch is the flow increasing.
         RELIEF  pink noise 2.8 → 5.2 kHz swelling only in the last 250 ms,
                 when the boom reaches its stop and the pressure spikes. A boom
                 that arrives without this sounds like it never stopped.
         SEAT    40 ms of metalThread at rate 0.9 as the feed lands on the face.
       Fired automatically whenever tel.holeIndex changes (§13b), so the sim
       gets it for free just by counting holes.                                 */
    boom_reposition(t, p) {
      const d = alloc(PRIO.event, 1.6, t); if (!d) return;
      const g = out(d, 0.60 * (p.gain !== undefined ? p.gain : 1), -0.25, 0.24);
      const sw = tn(d, t, { type: 'sawtooth', f: 88, dur: 1.00 });
      const lp = track(d, filt('lowpass', 440, 2.0));
      const pk = track(d, filt('peaking', 260, 2.6, 6));
      sw.g.connect(pk); pk.connect(lp); lp.connect(g);
      setAt(sw.g.gain, EPS, t);
      expoTo(sw.g.gain, 0.30, t + 0.14);
      expoTo(sw.g.gain, 0.24, t + 0.72);
      expoTo(sw.g.gain, EPS, t + 0.95);
      sw.osc.frequency.setValueAtTime(88, t);
      expoTo(sw.osc.frequency, 152, t + 0.80);
      lp.frequency.setValueAtTime(440, t);
      expoTo(lp.frequency, 760, t + 0.80);

      const rel = nz(d, t + 0.55, { buf: B.pink, bp: 2800, bpQ: 1.6, hp: 1400, dur: 0.42 });
      rel.g.connect(g); perc(rel.g.gain, t + 0.55, 0.20, 0.10, 0.26);
      rel.bp.frequency.setValueAtTime(2800, t + 0.55);
      expoTo(rel.bp.frequency, 5200, t + 0.82);

      const seat = bd(d, t + 0.86, B.metalThread, 0.90);
      seat.g.connect(g); perc(seat.g.gain, t + 0.86, 0.42, 0.001, 0.16);
      haptic('detent');
    },

    /* ── UNDERGROUND: DRIP ─────────────────────────────────────────────────
       Water off the back, landing in a puddle. A 20 ms bandpassed click at
       1.2–2.6 kHz and then a 60 ms sine whose pitch RISES 340–500 Hz to 2.4×
       that. The rise is the whole thing: what makes a drip sound like a drip
       rather than a tick is the entrained air bubble collapsing behind the
       drop, and a shrinking bubble's Minnaert frequency climbs. Randomised
       per drip so no two are the same.                                        */
    ug_drip(t, p) {
      const d = alloc(PRIO.ambient, 0.6, t); if (!d) return;
      const g = out(d, 0.50 * (p.gain || 0.20), p.pan || 0, 0.75, 'ambience');
      const c = nz(d, t, { buf: B.white, bp: 1200 + Math.random() * 1400, bpQ: 3.0, dur: 0.02 });
      c.g.connect(g); perc(c.g.gain, t, 0.35, 0.0008, 0.006);
      const f0 = 340 + Math.random() * 160;
      const b = tn(d, t + 0.002, { type: 'sine', f: f0, dur: 0.10 });
      b.g.connect(g); perc(b.g.gain, t + 0.002, 0.30, 0.002, 0.055);
      b.osc.frequency.setValueAtTime(f0, t + 0.002);
      expoTo(b.osc.frequency, f0 * 2.4, t + 0.05);
    },

    /* ── UNDERGROUND: ROCK TICK ────────────────────────────────────────────
       The new face relaxing. A single dry high-Q click (Q 6, random 0.9–3.1
       kHz) with essentially no body at all — it is the REVERB that tells you
       how big the drift is, not the sound. Send 0.9, the highest in the file.  */
    ug_rock_tick(t, p) {
      const d = alloc(PRIO.ambient, 0.8, t); if (!d) return;
      const g = out(d, 0.50 * (p.gain || 0.17), p.pan || 0, 0.90, 'ambience');
      const c = nz(d, t, { buf: B.white, bp: 900 + Math.random() * 2200, bpQ: 6, dur: 0.03 });
      c.g.connect(g); perc(c.g.gain, t, 0.50, 0.0007, 0.010);
    },

    /* ── UNDERGROUND: DISTANT MUCKER ───────────────────────────────────────
       An LHD two crosscuts away. A 58–78 Hz diesel with EVERYTHING above
       300 Hz gone — rock is a lowpass with a very steep skirt and the sound
       has been round two corners — plus 1.2 s of bucket scraping at 240 Hz
       with a 250 ms attack. No transient anywhere in the voice, because
       nothing that far away has one.                                          */
    ug_distant_mucker(t, p) {
      const d = alloc(PRIO.ambient, 4.2, t); if (!d) return;
      const g = out(d, 0.50 * (p.gain || 0.22), p.pan || 0, 0.60, 'ambience');
      const o = tn(d, t, { type: 'sawtooth', f: 58, dur: 3.60 });
      const pk = track(d, filt('peaking', 168, 3.2, 9));
      const lp = track(d, filt('lowpass', 300, 1.6));
      o.g.connect(pk); pk.connect(lp); lp.connect(g);
      setAt(o.g.gain, EPS, t);
      expoTo(o.g.gain, 0.32, t + 1.10);
      expoTo(o.g.gain, 0.26, t + 2.20);
      expoTo(o.g.gain, EPS, t + 3.50);
      o.osc.frequency.setValueAtTime(58, t);
      expoTo(o.osc.frequency, 78, t + 1.60);
      expoTo(o.osc.frequency, 54, t + 3.40);
      const sc = nz(d, t + 0.90, { buf: B.brown, bp: 240, bpQ: 1.4, dur: 1.20 });
      sc.g.connect(g); perc(sc.g.gain, t + 0.90, 0.16, 0.25, 0.85);
    },

    /* ── UNDERGROUND: VENT SURGE ───────────────────────────────────────────
       The duct surging as a door opens somewhere on the level. Deliberately
       occupies the SAME band as the persistent vent bed (300 → 620 → 280 Hz),
       so it reads as that duct breathing rather than as a new object arriving.
       1.4 s swell, 1.9 s total, no transient.                                 */
    ug_vent_surge(t, p) {
      const d = alloc(PRIO.ambient, 2.4, t); if (!d) return;
      const g = out(d, 0.50 * (p.gain || 0.16), p.pan || 0, 0.50, 'ambience');
      const s = nz(d, t, { buf: B.pink, bp: 300, bpQ: 0.9, hp: 150, dur: 2.00 });
      s.g.connect(g);
      setAt(s.g.gain, EPS, t);
      expoTo(s.g.gain, 0.34, t + 0.60);
      expoTo(s.g.gain, EPS, t + 1.90);
      s.bp.frequency.setValueAtTime(300, t);
      expoTo(s.bp.frequency, 620, t + 0.60);
      expoTo(s.bp.frequency, 280, t + 1.80);
    },
  });

  /* Aliases so callers can use whichever id they naturally reach for. */
  const SHOT_ALIAS = {
    bitbreak: 'bit_break', bitBroken: 'bit_break', bit_broken: 'bit_break', bitbroken: 'bit_break',
    bitworn: 'bit_worn', bitWorn: 'bit_worn',
    jam: 'jam_bind', jamBind: 'jam_bind', jamcleared: 'jam_release', jamCleared: 'jam_release', jam_cleared: 'jam_release',
    rodadd: 'rod_add', rodAdded: 'rod_add', rod_added: 'rod_add', rodAdd: 'rod_add',
    casing: 'casing_set', casingSet: 'casing_set',
    water: 'water_strike', waterStrike: 'water_strike',
    void: 'cavity', karst: 'cavity',
    levelup: 'level_up', levelUp: 'level_up',
    grade: 'grade_stamp', gradeStamp: 'grade_stamp', stamp: 'grade_stamp',
    contract: 'contract_accept', contractAccept: 'contract_accept',
    buy: 'purchase', sell: 'purchase',
    tap: 'ui_tap', click: 'ui_tap', uiTap: 'ui_tap',
    detent: 'ui_detent', uiDetent: 'ui_detent',
    error: 'ui_error', uiError: 'ui_error', invalid: 'ui_error',
    back: 'ui_back', uiBack: 'ui_back', cancel: 'ui_back',
    complete: 'hole_complete', holeComplete: 'hole_complete',
    start: 'drill_start', stop: 'drill_stop',
    tripIn: 'trip_in', tripOut: 'trip_out',
    stratumChange: 'stratum', strata: 'stratum',
    xpGain: 'xp', moneyGain: 'money', cash: 'money',
    certEarned: 'cert', certificate: 'cert',
    blowDown: 'blowdown', flushRelease: 'blowdown',

    // ── the six new methods ──────────────────────────────────────────────
    round_fire: 'blast', fireRound: 'blast', detonation: 'blast', shot_fired: 'blast',
    misfire_click: 'misfire', misfireClick: 'misfire',
    resin: 'resin_puncture', resinPuncture: 'resin_puncture', cartridge: 'resin_puncture',
    wrench: 'torque_wrench', torqueWrench: 'torque_wrench', torque_test: 'torque_wrench', torqueTest: 'torque_wrench',
    pile_hit: 'pile_blow', pileBlow: 'pile_blow', hammer_blow: 'pile_blow', hammerBlow: 'pile_blow',
    pile_blow_low: 'pile_blow_soft', pile_blow_high: 'pile_blow_hard', pile_blow_med: 'pile_blow_mid',
    refusal: 'pile_refusal', pileRefusal: 'pile_refusal',
    spt: 'spt_drop', spt_blow: 'spt_drop', sptDrop: 'spt_drop', hammer_drop: 'spt_drop', hammerDrop: 'spt_drop',
    cpt_start: 'cpt_push_start', cptStart: 'cpt_push_start', cptPushStart: 'cpt_push_start',
    cpt_stop: 'cpt_push_stop', cptStop: 'cpt_push_stop', cptPushStop: 'cpt_push_stop',
    slug: 'cyclone_slug', cyclone: 'cyclone_slug', cycloneSlug: 'cyclone_slug', splitter: 'cyclone_slug',
    bag: 'sample_bag', sampleBag: 'sample_bag', sample: 'sample_bag',
    boom: 'boom_reposition', boomReposition: 'boom_reposition', reindex: 'boom_reposition', re_index: 'boom_reposition',
    drip: 'ug_drip', rock_tick: 'ug_rock_tick', mucker: 'ug_distant_mucker', vent_surge: 'ug_vent_surge',
    // ── the second wave
    bailer: 'bailer_run', bailerRun: 'bailer_run', bail: 'bailer_run', bailing_run: 'bailer_run',
    powerTransfer: 'power_transfer', contactor: 'power_transfer', transfer: 'power_transfer',
    resinSet: 'resin_set', gel_done: 'resin_set', holdDone: 'resin_set',
  };

  /** The public one-shot entry point (also used internally). */
  /* A census of every one-shot fired and every one that threw, exposed on
     api.debug. One property increment per one-shot — never per frame, because
     the hammer train is continuous and the accent layer is rate-limited to 17/s
     — and it is the only way to see inside the catch below. That catch is
     correct (a dropped one-shot must never break a frame) but it is also a
     place a broken voice can hide forever, which is exactly what happened to
     the bailing run: it played `flush_spit` for a whole release and nothing
     anywhere said so. shotErr is now the check for that. */
  const shotCount = Object.create(null);
  const shotErr = Object.create(null);

  function playShot(id, params) {
    if (!built || disposed || !ac) return;
    const key = SHOTS[id] ? id : SHOT_ALIAS[id];
    const fn = key && SHOTS[key];
    if (typeof fn !== 'function') { shotErr['?' + id] = (shotErr['?' + id] || 0) + 1; return; }
    const p = params || EMPTY;
    const t = now() + (p.delay || 0);
    shotCount[key] = (shotCount[key] || 0) + 1;
    try { fn(t, p); }
    catch (e) {
      // a dropped one-shot must never break a frame — but it must be countable
      shotErr[key] = (shotErr[key] || 0) + 1;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     19. HAPTICS
     ───────────────────────────────────────────────────────────────────────
     navigator.vibrate is unsupported on iOS Safari and can be disabled by
     policy anywhere, so every call is guarded and failure is silent. Patterns
     are short by design: a phone's eccentric-rotating-mass motor needs ~15 ms
     to spin up, so anything under 10 ms is felt as nothing at all, and
     anything over ~60 ms feels like a notification rather than an impact.

     Continuous drilling haptics are separately rate-limited to 4/s: at 15
     accents/s the motor never stops, which both destroys the battery and
     turns every distinct blow into one undifferentiated mush.
     ═══════════════════════════════════════════════════════════════════════ */
  const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  let lastHapticAt = -10;
  let lastBlowHapticAt = -10;

  function hapticsEnabled() {
    const s = ctx && ctx.state && ctx.state.settings;
    return canVibrate && (!s || s.haptics !== false);
  }

  function haptic(name) {
    if (!hapticsEnabled()) return;
    const t = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    if (t - lastHapticAt < 0.045) return;         // never stack patterns
    lastHapticAt = t;
    const pat = HAPTICS[name] || HAPTICS.light;
    try { navigator.vibrate(pat); } catch (e) { /* policy-blocked */ }
  }

  function hapticBlow(intensity) {
    if (!hapticsEnabled()) return;
    const t = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    if (t - lastBlowHapticAt < 0.25) return;      // ≤4/s while drilling
    lastBlowHapticAt = t;
    lastHapticAt = t;
    try { navigator.vibrate(intensity > 0.8 ? 12 : 8); } catch (e) { /* ignore */ }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     20. MIX CONTROL
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Combine the design gains (setBus) with the player's settings and the
   * global duck. Called every frame; smoothed in JS so a settings change or a
   * duck never zippers.
   *
   *   master    = busUser.master
   *   sfx       = busUser.sfx       × settings.sfx
   *   music     = busUser.music     × settings.music × duck
   *   ambience  = busUser.ambience  × settings.sfx   × duck^0.6
   *
   * Ambience follows the SFX setting (there is no separate ambience slider in
   * GameState) and ducks less deeply than music, because an ambience bed that
   * disappears reads as a bug rather than as an effect.
   */
  function applyBusGains(immediate) {
    if (!built) return;
    const s = (ctx && ctx.state && ctx.state.settings) || null;
    if (s) {
      busSettings.sfx = typeof s.sfx === 'number' ? clamp(s.sfx, 0, 1) : busSettings.sfx;
      busSettings.music = typeof s.music === 'number' ? clamp(s.music, 0, 1) : busSettings.music;
      busSettings.ambience = busSettings.sfx;
    }
    const mg = busUser.master;
    const sg = busUser.sfx * busSettings.sfx;
    const gg = busUser.music * busSettings.music * duckAmount;
    const ag = busUser.ambience * busSettings.ambience * Math.pow(duckAmount, 0.6);
    if (immediate) {
      masterGain.gain.value = mg;
      sfxBus.gain.value = sg;
      musicBus.gain.value = gg;
      ambBus.gain.value = ag;
    } else {
      // 8 Hz one-pole toward target — inaudible as a step, instant as a feel
      const k = 0.25;
      masterGain.gain.value += (mg - masterGain.gain.value) * k;
      sfxBus.gain.value += (sg - sfxBus.gain.value) * k;
      musicBus.gain.value += (gg - musicBus.gain.value) * k;
      ambBus.gain.value += (ag - ambBus.gain.value) * k;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     21. TELEMETRY INGEST
     ───────────────────────────────────────────────────────────────────────
     Two paths, one truth:
       setDrillState(t)  — the integrator pushes. Preferred.
       ctx.state.drill   — back-fill, used only if the integrator has been
                           silent for > 0.5 s, so a sim that only writes state
                           still drives the audio correctly.
     We never reach into the sim.
     ═══════════════════════════════════════════════════════════════════════ */
  const TEL_KEYS = ['active', 'depth', 'target', 'rop', 'wob', 'rpm', 'flush', 'torque',
                    'wear', 'heat', 'stability', 'jam', 'rods', 'stratumIndex',
                    'inGreenBand', 'greenBandTime', 'combo', 'ucs', 'abrasivity',
                    // ── the six new methods (all optional, all defaulted)
                    'blowCount', 'nValue', 'sampleRecovery', 'contamination',
                    'deviation', 'roundPull', 'boltTorque', 'resinMix', 'holdTime',
                    'hammerEnergy', 'blowRate', 'setMm', 'refusal', 'holeIndex',
                    'ventilation', 'underground', 'pileLength', 'embedment',
                    'pushMode', 'pileType',
                    // ── §3d, the second wave
                    'toeDamage', 'holdUp', 'wet', 'devCue', 'uphole', 'driving',
                    'torquePending', 'powerMode', 'phase'];

  /** Write one telemetry field, type-checked. Shared by the canonical pass and
   *  the alias pass so both behave identically. Returns nothing, allocates
   *  nothing. */
  function telWrite(k, v) {
    if (v === undefined || v === null) return;
    if (TEL_STRINGS[k]) {
      if (typeof v === 'string') tel[k] = v.toLowerCase();
      return;
    }
    if (typeof v === 'boolean') { tel[k] = v; return; }
    if (typeof v === 'number' && v === v) tel[k] = v;      // NaN guard
  }

  function ingest(srcObj) {
    if (!srcObj) return;
    for (let i = 0; i < TEL_KEYS.length; i++) telWrite(TEL_KEYS[i], srcObj[TEL_KEYS[i]]);
    // Alias pass. The canonical spelling always wins: an alias is only read if
    // the field it maps to was not written above, which is why this loop runs
    // second and checks for undefined on the SOURCE object, not on tel.
    for (let i = 0; i < TEL_ALIASES.length; i++) {
      const a = TEL_ALIASES[i];
      if (srcObj[a[1]] !== undefined) continue;            // canonical present
      telWrite(a[1], srcObj[a[0]]);
    }
    // The beat, if one is running. bolt-install and take-the-set are CLOCKS the
    // player is waiting out, and the only place their length is published.
    const b = srcObj.beat;
    if (b) { telWrite('beatT', b.t); telWrite('beatDur', b.dur); }
    else { tel.beatT = 0; tel.beatDur = 0; }
    ingestProgramme(srcObj.programme);
  }

  /**
   * §3d. Read the sim's nested `programme` block.
   *
   * Runs every frame, allocates nothing: one property read for the kind, one
   * table lookup, then a strided walk of a flat string array. The explicit
   * tail handles the fields that are a boolean, a string, or on a different
   * scale from the audio side — each one commented where it is not obvious,
   * because a silent unit mismatch here is exactly the class of bug that let
   * every one of these voices run deaf on defaults for a whole release.
   */
  function ingestProgramme(p) {
    if (!p || !p.kind) return;
    const map = PROG_NUM[p.kind];
    if (map) for (let i = 0; i < map.length; i += 2) telWrite(map[i + 1], p[map[i]]);

    if (p.kind === 'driven-pile') {
      // Energy: the sim publishes real kNm on the power hyperbola, the audio
      // wants 0..1 across the same envelope. Rate is published too and
      // stepPile() prefers it, so this is the belt to that braces.
      if (typeof p.energyKnm === 'number' && p.energyKnm === p.energyKnm) {
        tel.hammerEnergy = clamp((p.energyKnm - PILE_KNM_MIN) / PILE_KNM_SPAN, 0, 1);
      }
      // `refused` is the verdict, not a meter. stepPile() takes the max of this
      // and its own derivation from the set, so a hard refusal is never missed
      // and a soft one is still heard coming.
      if (p.refused !== undefined) tel.refusal = p.refused ? 1 : 0;
      if (p.steel !== undefined) tel.pileType = p.steel ? 'steel' : 'concrete';
      // The pile's own length sets its ring: f = c/2L. headDepthM is the head
      // above ground plus the toe below it, so head-to-toe IS the free bar.
      if (typeof p.toeDepthM === 'number' && typeof p.headDepthM === 'number') {
        const L = p.toeDepthM - p.headDepthM;            // headDepthM is negative above grade
        if (L === L && L > 1) tel.pileLength = clamp(L, 6, 40);
      }
      // The hammer is only swinging while the rig is driving. Taking the set,
      // changing the dolly and pitching a new pile are all phases in which a
      // piling site is loud but not being hit, and hearing blows through them
      // would make the blow count — the whole instrument — a lie.
      tel.driving = tel.phase ? tel.phase === 'drilling' : true;
    } else if (p.kind === 'longhole') {
      // THE ONE FIELD THAT CHANGES THE WHOLE VOICE. An uphole flushes back at
      // you; a downhole does not (§13b-3, THE FLUSH-BACK).
      if (p.uphole !== undefined) tel.uphole = !!p.uphole;
      // A blocked hole is a packed annulus and the flush voice already has a
      // language for that, so raise the cue rather than inventing a sound.
      if (p.blocked) tel.devCue = Math.max(tel.devCue, 0.55);
    } else if (p.kind === 'rockbolt') {
      // Assigned, not max'd: nothing else writes devCue on this method, so a
      // max would latch the first collapsed hole in for the rest of the shift.
      tel.devCue = p.holeOpen === false ? 0.5 : 0;
      // The wrench is an EVENT, not a level. `lastAnchorage01` above is a
      // quality score and sits above 0.55 for most of a good shift, so hanging
      // the wrench off it fired one every four seconds — measured 21 in a 90 s
      // run against the game's one-bolt-in-ten sample. The pending flag is the
      // actual test, and stepBolter() edge-detects it.
      if (p.torqueTestPending !== undefined) tel.torquePending = !!p.torqueTestPending;
    } else if (p.kind === 'spt') {
      tel.pushMode = 'spt';
      // The drive is the only time the hammer is falling. Without this the
      // scheduler counts blows through the whole hole, including while the
      // rods are being washed out, which is not a thing that happens.
      if (p.driving !== undefined) tel.driving = !!p.driving;
      // N as the player knows it: the last completed test, RAISED by the
      // increment being driven right now. Two test increments make the N, so a
      // heavy current increment shows in the clang before the test closes —
      // which is the same "ahead of the gauge" contract the cyclone keeps.
      const lastN = p.lastTest && typeof p.lastTest.N === 'number' ? p.lastTest.N : 0;
      const live = (typeof p.blowsThisIncrement === 'number' ? p.blowsThisIncrement : 0) * 2;
      const n = Math.max(lastN, live);
      if (n === n) tel.nValue = n;
    } else if (p.kind === 'cpt') {
      tel.pushMode = 'cpt';
      // A CPT only makes its (very small) noise while the cone is going down.
      if (typeof p.pushRateMmS === 'number') tel.driving = p.pushRateMmS > 0.05;
      if (p.terminated) tel.driving = false;
    } else if (p.kind === 'rc') {
      // blowDownReady is not a sound; holdUp is. See §13b-1, THE CHOKE.
      tel.driving = true;
    } else if (p.kind === 'jumbo') {
      tel.driving = true;
    }
  }

  /** Refresh the rock class and the method from world state. Cheap; no alloc. */
  function refreshGround(state) {
    if (!state || !state.world) return;
    const strata = state.world.strata;
    if (strata && strata.length) {
      const idx = clamp(Math.floor(tel.stratumIndex || 0), 0, strata.length - 1);
      const st = strata[idx];
      if (st) {
        if (typeof st.ucs === 'number') tel.ucs = st.ucs;
        if (typeof st.abrasivity === 'number') tel.abrasivity = st.abrasivity;
      }
    }
    m.rockIdx = rockClassForUCS(tel.ucs);
  }

  /**
   * THE single place the active method changes. Everything that used to write
   * methodId/method inline now routes through here so that the lazy voice
   * modules, the lazy buffers and the room selection can never miss a change.
   * Cheap and idempotent — safe to call every frame.
   */
  function setMethod(id) {
    // An unknown id KEEPS the current method rather than falling back to the
    // default. A typo in a contract should not silently turn a piling rig into
    // a top hammer halfway through a job; the previous method is always the
    // better guess than an arbitrary one.
    const next = METHODS[id] ? id : methodId;
    if (next === methodId && method) return;
    methodId = next;
    method = METHODS[next] || METHOD_DEFAULT;
    // Reset the per-method schedulers so a method swap never leaves a stale
    // phase running (a pile scheduler still ticking under an RC rig).
    m.plPhase = 0; m.siPhase = 0; m.slugT = 0;
    m.lastHoleIndex = -1; m.lastMetre = -1;
    // The contactor must not clack because the player changed contract. A
    // method with no dual supply is on its diesel by definition, and the new
    // method's first stepPower() re-derives from there.
    m.mainsWant = 0; m.mainsHold = 0;
    if (!METHODS[next] || METHODS[next].power !== 'dual') { m.mains = 0; m.elSpin = 0; }
    if (built) ensureVoice();
  }

  /** Resolve the active method from garage/contract state. */
  function refreshMethod(state) {
    let id = methodId;
    if (state) {
      if (state.contract && state.contract.methodId) id = state.contract.methodId;
      else if (state.contract && state.contract.method) id = state.contract.method;
    }
    setMethod(id);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     22. EVENT WIRING
     ───────────────────────────────────────────────────────────────────────
     Every relevant event in contract.js EVENTS. Handlers are deliberately
     thin: they translate an event into a one-shot or a state change and
     nothing else. All subscriptions are recorded so dispose() can unhook.
     ═══════════════════════════════════════════════════════════════════════ */
  let lastStratumUCS = 0;
  /** Reused payload for the bailing run — event handlers are not a hot path,
   *  but the house rule in this file is that nothing allocates per event
   *  either, and a cable-tool hole fires a great many of these. */
  const BAIL_P = { depth: 0, perfect: false };

  function wire() {
    const bus = ctx && ctx.bus;
    if (!bus) return;
    const on = (evt, fn) => { const u = bus.on(evt, fn); if (u) unsubs.push(u); };
    const E2 = (ctx && ctx.EVENTS) || EVENTS;

    // ── drilling ────────────────────────────────────────────────────────
    on(E2.DRILL_START, (p) => {
      if (p && p.methodId) setMethod(p.methodId);
      tel.active = true;
      if (p && p.contract) {
        if (typeof p.contract.targetDepth === 'number') tel.target = p.contract.targetDepth;
        else if (typeof p.contract.target === 'number') tel.target = p.contract.target;
        if (p.contract.regionId) setRegion(p.contract.regionId);
      }
      startEngine(engineRigId);
      playShot('drill_start');
    });

    on(E2.DRILL_TICK, (p) => { ingest(p); lastExternalTel = now(); });

    on(E2.DRILL_STOP, () => { tel.active = false; playShot('drill_stop'); });

    on(E2.STRATUM_ENTER, (p) => {
      if (!p) return;
      if (typeof p.index === 'number') tel.stratumIndex = p.index;
      const st = p.stratum;
      let ucs = lastStratumUCS;
      if (st) {
        if (typeof st.ucs === 'number') { ucs = st.ucs; tel.ucs = st.ucs; }
        if (typeof st.abrasivity === 'number') tel.abrasivity = st.abrasivity;
        if (st.id && GROUND[st.id] && typeof GROUND[st.id].ucs === 'number') { ucs = GROUND[st.id].ucs; tel.ucs = ucs; }
      }
      m.rockIdx = rockClassForUCS(tel.ucs);
      playShot('stratum', { harder: ucs > lastStratumUCS });
      lastStratumUCS = ucs;
    });

    // THE beat everything locks to: audio, particles and haptics all key off
    // this one event so they cannot drift apart.
    on(E2.BIT_IMPACT, (p) => {
      m.lastImpactAt = now();
      const I = p && typeof p.intensity === 'number' ? clamp(p.intensity, 0, 1) : 0.6;
      // Honour the sim's rate but never exceed our own accent budget.
      if (now() - lastAccentAt >= 1 / 17) fireAccent(I, now());
    });

    on(E2.BIT_WORN, () => playShot('bit_worn'));
    on(E2.BIT_BROKEN, () => playShot('bit_break'));
    on(E2.ROD_ADDED, (p) => { if (p && typeof p.count === 'number') tel.rods = p.count; playShot('rod_add'); });
    // A bailing run is the cable-tool cadence. The counter is the same one —
    // telemetry names it correctly — but the sound is the wet dump of a loaded
    // bailer, not a rod being made up.
    on(E2.BAILER_RUN, (p) => {
      if (p && typeof p.count === 'number') tel.rods = p.count;
      // depth sets the length of the haul and `perfect` sets how full the
      // bailer came up. See SHOTS.bailer_run — this used to be flush_spit,
      // which is a packed annulus burping and has nothing to do with a winch.
      BAIL_P.depth = p && typeof p.depth === 'number' ? p.depth : tel.depth;
      BAIL_P.perfect = !!(p && p.perfect);
      playShot('bailer_run', BAIL_P);
    });
    on(E2.JAM, (p) => playShot('jam_bind', { severity: p && p.severity }));
    on(E2.JAM_CLEARED, () => playShot('jam_release'));
    on(E2.WATER_STRIKE, () => playShot('water_strike'));
    on(E2.CAVITY, () => playShot('cavity'));
    on(E2.BOULDER, () => playShot('boulder'));
    on(E2.HOLE_COMPLETE, (p) => {
      tel.active = false;
      playShot('hole_complete');
      if (p && p.grade) playShot('grade_stamp', { grade: p.grade, delay: 1.25 });
    });

    // ── progression ─────────────────────────────────────────────────────
    on(E2.XP_GAIN, () => {
      const t = now();
      xpStack = (t - xpStackAt < 1.5) ? xpStack + 1 : 0;
      xpStackAt = t;
      playShot('xp');
    });
    on(E2.LEVEL_UP, () => playShot('level_up'));
    on(E2.MONEY_CHANGE, (p) => {
      if (!p || typeof p.delta !== 'number' || p.delta === 0) return;
      playShot(p.delta > 0 ? 'money' : 'purchase');
    });
    on(E2.UNLOCK, () => playShot('unlock'));
    on(E2.CERT_EARNED, () => playShot('cert'));

    // ── shell / flow ────────────────────────────────────────────────────
    on(E2.SCENE_CHANGE, (p) => {
      sceneId = (p && p.scene) || sceneId;
      // The site scene runs the machine; everywhere else it idles or is off.
      if (sceneId === 'site') startEngine(engineRigId);
      else if (sceneId === 'menu' || sceneId === 'boot') stopEngine();
    });
    on(E2.CONTRACT_ACCEPT, (p) => {
      playShot('contract_accept');
      const c = p && p.contract;
      if (c) {
        if (c.regionId) setRegion(c.regionId);
        if (c.methodId) setMethod(c.methodId);
        if (typeof c.targetDepth === 'number') tel.target = c.targetDepth;
      }
    });
    on(E2.PURCHASE, () => playShot('purchase'));
    on(E2.EQUIP, () => playShot('equip'));
    on(E2.RIG_CHANGE, (p) => {
      if (!p) return;
      if (p.methodId) setMethod(p.methodId);
      if (p.rigId) engineRigId = p.rigId;
      if (engineOn) startEngine(engineRigId);
    });
    on(E2.REGION_CHANGE, (p) => { if (p && p.regionId) setRegion(p.regionId); });
    on(E2.QUALITY_CHANGE, (p) => {
      const id = p && (p.tier && p.tier.id ? p.tier.id : p.tier);
      if (VOICE_CAP[id]) MAXV = VOICE_CAP[id];
    });
    on(E2.HAPTIC, (p) => haptic((p && p.pattern) || 'light'));
  }

  /* ═══════════════════════════════════════════════════════════════════════
     23. CONTEXT LIFECYCLE
     ═══════════════════════════════════════════════════════════════════════ */
  function onVisibility() {
    if (!ac || disposed) return;
    if (document.visibilityState === 'hidden') {
      suspendedByVisibility = true;
      try { ac.suspend(); } catch (e) { /* ignore */ }
    } else if (suspendedByVisibility) {
      suspendedByVisibility = false;
      try { ac.resume(); } catch (e) { /* ignore */ }
      // Resync the music scheduler; the clock ran on without us.
      MU.nextBeatTime = now() + 0.05;
    }
  }

  let autoUnlockAttached = false;
  function attachAutoUnlock() {
    if (autoUnlockAttached || typeof window === 'undefined') return;
    autoUnlockAttached = true;
    const go = () => { try { api.unlock(); } catch (e) { /* ignore */ } detach(); };
    const evts = ['pointerdown', 'touchend', 'mousedown', 'keydown'];
    const detach = () => { for (const e of evts) window.removeEventListener(e, go, true); };
    for (const e of evts) window.addEventListener(e, go, true);
    unsubs.push(detach);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     24. FRAME
     ═══════════════════════════════════════════════════════════════════════ */
  function stepEngineGains(dt) {
    // Engine/hydraulic/air/rotation output gains fade rather than switching,
    // so startEngine()/stopEngine() are never a click.
    //
    // method.trim lets a whole method stand back — only site-investigation uses
    // it (0.50) — and m.quiet takes a live CPT push down a further 32 %. The
    // two multiply, so a CPT push runs the machine voices at 0.34 of a normal
    // rig. That is the only place in the game where the mix deliberately
    // empties out, and it is the whole character of the method.
    const want = engineOn ? 1 : 0;
    const tr = (method.trim || 1) * mixf(1, 0.68, clamp(m.quiet, 0, 1));
    // The diesel alone follows m.mains (§13b-2b): on the reel it is shut down,
    // while the hydraulic pack, the rotation and the percussion are all still
    // running — off the electric motor. That is the point. 0.03 rather than 0
    // leaves the last breath of the run-down audible instead of gating it.
    const dsl = mixf(1, 0.03, clamp(m.mains, 0, 1));
    E.out.gain.value = damp(E.out.gain.value, want * 0.42 * tr * dsl, 2.2, dt);
    H.out.gain.value = damp(H.out.gain.value, want * 0.55 * tr, 2.2, dt);
    A.out.gain.value = damp(A.out.gain.value, (want && method.compressor) ? 0.60 * tr : 0, 1.6, dt);
    R.out.gain.value = damp(R.out.gain.value, want * 0.55 * tr, 2.2, dt);
    P.out.gain.value = damp(P.out.gain.value, want * 0.85 * tr, 3.0, dt);
    F.out.gain.value = damp(F.out.gain.value, want * 0.80 * tr, 2.5, dt);
  }

  function update(dt, state) {
    if (!built || disposed || !ac) return;
    if (ac.state === 'suspended') return;
    const d = clamp(dt, 0, 1 / 15);
    const t = now();

    // ── telemetry ────────────────────────────────────────────────────────
    if (state) {
      refreshMethod(state);
      if (t - lastExternalTel > 0.5 && state.drill) ingest(state.drill);
      refreshGround(state);
      if (state.world && state.world.regionId && state.world.regionId !== regionId) setRegion(state.world.regionId);
      if (state.world && state.world.weather && state.world.weather !== weatherId) setWeather(state.world.weather);
    }

    // ── global duck decay ────────────────────────────────────────────────
    const duckWant = t < duckUntil ? 0.20 : 1;
    // Fast in (60 ms), slow out (600 ms) — a duck must grab and then release
    // gracefully, never the other way round.
    duckAmount = damp(duckAmount, duckWant, duckWant < duckAmount ? 22 : 3.0, d);

    // ── lazily build whatever this method needs (§13b, §14b) ─────────────
    // Two property reads when there is nothing to do. When there IS, it runs on
    // the first frame after a method change — a scene transition, the same
    // budget the region IRs are baked in, and never mid-drill.
    if ((method.voice && !voiceBuilt[method.voice]) ||
        (method.acoustic === 'underground' && !ugBuilt) ||
        (method.power === 'dual' && !mainsBuilt)) ensureVoice();

    // ── voices ───────────────────────────────────────────────────────────
    stepEngine(d);
    // Between the engine and the pack, because it decides which prime mover
    // the pack is hung off this frame (§13b-2b).
    stepPower(d);
    stepHydraulic(d);
    stepAir(d);
    stepRotation(d);
    stepPercussion(d);
    stepFlush(d);
    // Each of the six writes its own PROTECT-axis failure into m.methodHazard,
    // so it is cleared here and only ever raised (Math.max) below.
    m.methodHazard = 0;
    stepCyclone(d);
    stepJumbo(d);
    stepITH(d);
    stepBolter(d);
    stepPile(d);
    stepSI(d);
    stepUnderground(d);
    stepAmbience(d);
    stepRoom(d);
    stepMusic(d);
    stepEngineGains(d);
    applyBusGains(false);

    // ── housekeeping ─────────────────────────────────────────────────────
    reapVoices(t);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     25. PUBLIC API
     ═══════════════════════════════════════════════════════════════════════ */

  function setRegion(id) {
    const r = resolveRegion(id);
    if (r === regionId && built) return;
    regionId = r;
    if (built) applyRegionToAmbience(regionId, false);
  }

  function setWeather(name) {
    weatherId = WEATHER[name] ? name : 'clear';
    applyVerbLevel();
  }

  function startEngine(rigId) {
    engineRigId = rigId || engineRigId;
    engineOn = true;
  }

  function stopEngine() {
    if (!engineOn) return;
    engineOn = false;
    // If the compressor was running, it dumps its receiver on shutdown.
    if (built && method.compressor && m.airFlow > 0.15) playShot('blowdown', { gain: 0.8 });
  }

  function duckFor(ms) {
    const secs = clamp((ms || 0) / 1000, 0, 6);
    const until = now() + secs;
    if (until > duckUntil) duckUntil = until;
  }

  const api = {
    /** Called once by main.js after ctx is populated. Must not touch audio. */
    async init() {
      wire();
      attachAutoUnlock();
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVisibility, false);
        unsubs.push(() => document.removeEventListener('visibilitychange', onVisibility, false));
      }
      // Seed from whatever state already exists.
      const st = ctx && ctx.state;
      if (st) {
        refreshMethod(st);
        if (st.world) {
          if (st.world.regionId) regionId = resolveRegion(st.world.regionId);
          if (st.world.weather) weatherId = WEATHER[st.world.weather] ? st.world.weather : 'clear';
        }
        if (st.drill) ingest(st.drill);
        if (st.scene) sceneId = st.scene;
      }
      m.rockIdx = rockClassForUCS(tel.ucs);
    },

    update,

    /** Viewport changes do not affect audio; accepted for interface parity. */
    resize() { /* no-op */ },

    dispose() {
      disposed = true;
      for (let i = 0; i < unsubs.length; i++) { try { unsubs[i](); } catch (e) { /* ignore */ } }
      unsubs.length = 0;
      if (!ac) return;
      for (let i = vActive.length - 1; i >= 0; i--) killDesc(vActive[i]);
      vActive.length = 0;
      try { masterGain.gain.value = 0; } catch (e) { /* ignore */ }
      try { ac.close(); } catch (e) { /* ignore */ }
      ac = null; built = false;
    },

    /**
     * Create/resume the AudioContext. MUST be called from a user gesture the
     * first time. Idempotent, never throws. A failure here permanently
     * degrades the system to a silent no-op rather than breaking the game.
     */
    unlock() {
      if (disposed || failed) return false;
      try {
        if (!ac) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) { failed = true; return false; }
          // 'interactive' latency hint: we want the hammer transient tight to
          // the frame it was scheduled on, and we are not doing heavy DSP.
          ac = new AC({ latencyHint: 'interactive' });
        }
        if (ac.state === 'suspended') ac.resume();
        if (!built) build();
        return true;
      } catch (e) {
        failed = true;
        console.warn('[audio] unlock failed —', e && e.message);
        return false;
      }
    },

    /** Fire a one-shot. Unknown ids are ignored silently. */
    play(id, params) { playShot(id, params); },

    /** name: 'master' | 'sfx' | 'music' | 'ambience', gain 0..1 */
    setBus(name, gain01) {
      if (!(name in busUser)) return;
      busUser[name] = clamp(typeof gain01 === 'number' ? gain01 : 1, 0, 1);
      if (built) applyBusGains(true);
    },

    startEngine,
    stopEngine,

    /** Push live telemetry. Called every frame by the integrator. */
    setDrillState(t) {
      if (!t) return;
      ingest(t);
      if (t.methodId) setMethod(t.methodId);
      lastExternalTel = now();
    },

    setRegion,
    setWeather,
    duckFor,

    /** True once the context exists and the graph is live. */
    get isReady() { return !!(built && ac && !disposed && ac.state !== 'closed'); },

    /* ── extras the shell may find useful (not part of the required API) ── */
    get context() { return ac; },
    get voiceCount() { return vActive.length; },
    haptic,

    /**
     * Read-only introspection for the dev/QA handle (window.__DRILLITY.audio).
     * Exposes the live synthesis model so engine load, blow rate, annulus
     * loading and music intensity can be asserted against the sim without a
     * microphone. Returns the live object — do not write to it.
     */
    get debug() {
      return {
        model: m, telemetry: tel, method: methodId, region: regionId,
        weather: weatherId, engineOn, scene: sceneId,
        voices: vActive.length, maxVoices: MAXV,
        exhaustLP: built ? E.lp.frequency.value : 0,
        turboHz: built ? E.turbo.frequency.value : 0,
        blowTrainHz: built ? P.osc.frequency.value : 0,
        bpm: MU.bpm, duck: duckAmount,

        /* ── the six new methods, so the sim agent can assert against the
           audio model without a microphone ─────────────────────────────── */
        voice: method.voice || null,
        underground: +clamp(m.ug, 0, 1).toFixed(3),
        room: roomHave, roomFade: +roomFade.toFixed(3),
        cycloneWet: +clamp(m.cyWet, 0, 1).toFixed(3),
        cycloneBodyHz: voiceBuilt.cyclone ? +CY.body.frequency.value.toFixed(1) : 0,
        drifterHz: voiceBuilt.jumbo && JB.d
          ? [+JB.d[0].osc.frequency.value.toFixed(2), +JB.d[1].osc.frequency.value.toFixed(2)]
          : null,
        ithDelayMs: voiceBuilt.ith ? +(m.ithDelay * 1000).toFixed(1) : 0,
        ithLPHz: voiceBuilt.ith ? Math.round(m.ithLP) : 0,
        ringRate: +m.ringRate.toFixed(3),
        resinMix: +clamp(m.boMix, 0, 1).toFixed(3),
        pileEnergy01: +clamp(m.plEnergy, 0, 1).toFixed(3),
        pileBlowsPerMin: +(m.plRate * 60).toFixed(1),
        pileRefusal: +clamp(m.plRefusal, 0, 1).toFixed(3),
        sptBlowsPerMin: +(m.siRate * 60).toFixed(1),
        cpt: +clamp(m.cpt, 0, 1).toFixed(3),
        quiet: +clamp(m.quiet, 0, 1).toFixed(3),
        methodHazard: +clamp(m.methodHazard, 0, 1).toFixed(3),
        voicesBuilt: voiceBuilt, ugBuilt,

        /* ── the second wave ─────────────────────────────────────────────── */
        cycloneChoke: +clamp(m.cyChoke, 0, 1).toFixed(3),
        mains: +clamp(m.mains, 0, 1).toFixed(3),
        elSpin: +clamp(m.elSpin, 0, 1).toFixed(3),
        pumpHz: built ? +H.saw.frequency.value.toFixed(1) : 0,
        uphole: +clamp(m.upHole, 0, 1).toFixed(3),
        holdTone: +clamp(m.boHold, 0, 1).toFixed(3),
        holdLeft: +clamp(m.boHoldLeft, 0, 1).toFixed(3),
        pileBroom: +clamp(m.plBroom, 0, 1).toFixed(3),
        driving: tel.driving !== false,
        mainsBuilt,
        shots: shotCount,
        /** Any entry here is a one-shot that threw inside playShot's catch, or
         *  (with a leading '?') an id nothing in SHOTS answers to. Both are
         *  bugs and neither is audible. Empty is the only acceptable state. */
        shotErrors: shotErr,

        /**
         * THE STANDING CHECK AGAINST THE gustDepth BUG.
         *
         * A single undefined that reached Math.max(0.1, undefined) once put a
         * NaN into a filter frequency, and a NaN in a BiquadFilterNode does not
         * throw, does not warn and does not recover — the node outputs silence
         * for the life of the context and takes its whole chain with it. There
         * is no way to detect that by listening to a bug report.
         *
         * So: walk every persistent voice module, read every AudioParam on
         * every node we hold a reference to, and return the ones that are not
         * finite. Costs nothing until it is called (it is not on any frame
         * path), allocates freely because it is a debug call, and is what the
         * headless harness asserts on after every method it drives.
         *
         * @returns {{ok:boolean, checked:number, bad:string[]}}
         */
        assertFinite() {
          const bad = [];
          let checked = 0;
          const PARAMS = ['gain', 'frequency', 'Q', 'detune', 'pan', 'delayTime',
                          'playbackRate', 'threshold', 'knee', 'ratio', 'attack', 'release'];
          const seen = new Set();
          const visit = (node, path) => {
            if (!node || typeof node !== 'object' || seen.has(node)) return;
            seen.add(node);
            for (let i = 0; i < PARAMS.length; i++) {
              const pr = node[PARAMS[i]];
              if (!pr || typeof pr !== 'object' || typeof pr.value !== 'number') continue;
              checked++;
              if (!Number.isFinite(pr.value)) bad.push(`${path}.${PARAMS[i]} = ${pr.value}`);
            }
          };
          const sweep = (obj, name) => {
            if (!obj) return;
            for (const k in obj) {
              const v = obj[k];
              if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) sweep(v[i], `${name}.${k}[${i}]`); }
              else if (v && typeof v === 'object') visit(v, `${name}.${k}`);
            }
          };
          sweep(E, 'engine'); sweep(H, 'hyd'); sweep(A, 'air'); sweep(R, 'rot');
          sweep(P, 'perc'); sweep(F, 'flush'); sweep(AM, 'amb'); sweep(MU, 'music');
          sweep(CY, 'cyclone'); sweep(JB, 'jumbo'); sweep(DH, 'ith'); sweep(BO, 'bolter');
          sweep(PL, 'pile'); sweep(SI, 'si'); sweep(UG, 'ug'); sweep(EL, 'mains');
          if (JB.d) for (let i = 0; i < JB.d.length; i++) sweep(JB.d[i], `jumbo.d${i}`);
          // The model itself: every one of these becomes an AudioParam next frame.
          for (const k in m) {
            const v = m[k];
            if (typeof v === 'number') { checked++; if (!Number.isFinite(v)) bad.push(`m.${k} = ${v}`); }
          }
          for (const k in tel) {
            const v = tel[k];
            if (typeof v === 'number') { checked++; if (!Number.isFinite(v)) bad.push(`tel.${k} = ${v}`); }
          }
          return { ok: bad.length === 0, checked, bad };
        },
      };
    },
  };

  return api;
}

export default createAudio;
