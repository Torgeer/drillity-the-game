/**
 * DRILLITY I THE GAME — sim/drilling.js
 * The drilling simulation: the actual game.
 *
 * A small set of honest equations, fixed-stepped at 120 Hz, producing the
 * emergent behaviour the design calls "the groove".
 *
 *   inputs  feed (WOB) · rotation/percussion (RPM) · flushing (air/water/mud)
 *   ground  ctx.geology.getDrillabilityAt(depth)  (synthetic fallback if absent)
 *   out     ROP, torque, wear, heat, cuttings load, hole stability, jam state
 *
 * TWO CLOCKS.  Everything downhole (penetration, bit wear) runs on a compressed
 * clock — TUNING.sim.timeCompression downhole seconds per player second — so
 * the ROP a driller reads on the gauge is realistic (26 m/h in granite on DTH)
 * while a 50 m hole is a three minute phone session.  Everything the player
 * reacts to (groove ramp, hazard telegraphs, jam rescue rhythm, rod-add timing)
 * runs on real player seconds so the feel is honest.
 *
 * Owned by the simulation agent. Reads ctx.state, writes only ctx.state.drill.
 * No three.js, no DOM: pure logic, unit-testable in node.
 */

import {
  EVENTS, GROUND,
  clamp, lerp, smoothstep, damp, makeRandom,
} from '../core/contract.js';

/* ═══════════════════════════════════════════════════════════════════════════
   TUNING — every number in the model lives here.
   ═══════════════════════════════════════════════════════════════════════════ */
export const TUNING = {

  /* ── loop & feel ─────────────────────────────────────────────────────── */
  sim: {
    hz: 120,                  // fixed physics rate — identical behaviour at 30 or 120 fps
    maxSubSteps: 10,          // catch-up cap per frame; backlog beyond this is dropped
    timeCompression: 48,      // downhole seconds per player second (a 2 h hole ≈ 2.5 min)
                              // methods also carry a timeMul — see TUNING.methods.*.timeMul
    inputLambda: 12,          // actuator response (1/s): moves within 1 frame, settles ≈250 ms
    dispFastLambda: 9,        // display smoothing for live gauges (rop, torque)
    dispSlowLambda: 3.5,      // display smoothing for slow gauges (wear, heat, stability)
    maxImpactHz: 30,          // hard cap on BIT_IMPACT emissions per second
    maxHapticHz: 9,           // hard cap on HAPTIC emissions per second
    beatHapticHz: 5,          // percussion beat-cluster haptic rate
    rotaryImpactHz: [5, 13],  // rotary cutting-impact emission rate at rpm 0 → 1
  },

  /* ── rock strength normalisation ─────────────────────────────────────── */
  rock: {
    hardRefUcs: 100,          // UCS (MPa) that maps to hardness 1.0
    hardExp: 0.6,             // hardness = (ucs/ref)^exp — compresses the 0..300 MPa range
    hardMin: 0.18,            // hardness floor (soft soils still resist a little)
    hardMax: 2.4,             // hardness ceiling (quartzite)
    voidUcs: 0.05,            // UCS treated as an open void (karst) — triggers free-fall
  },

  /* ── ROP ─────────────────────────────────────────────────────────────── */
  rop: {
    couplingFloor: 0.10,      // min percussion coupling — over-feeding never quite reads zero
    stallDroop: 0.55,         // rotation lost per unit of torque above the rig limit
    cleanKnee: 0.55,          // cuttings load above which ROP starts to collapse
    cleanCollapse: 0.85,      // fraction of ROP lost at a fully choked hole
    wearPenalty: 0.92,        // ROP lost at wear = 1 …
    wearExp: 2.4,             // … with this exponent (70 % worn ≈ 5.5× the loss of 35 %)
    glazeHeat: 0.82,          // heat above which the bit glazes and stops cutting
    glazePenalty: 0.45,       // ROP lost to a fully glazed bit
    freeFallMh: 150,          // ROP while the bit runs through a void (m/h) — scaled by feed,
                              // so cutting the feed is literally holding the string back
    stabilityDrag: 0.30,      // ROP lost in a fully collapsing hole (drag on the string)
    comboMax: 2.2,            // groove multiplier ceiling — matches GAMEDESIGN §3
    methodLimitMh: 1.5,       // potential ROP below which the method is simply wrong for the ground
  },

  /* ── torque (the main gauge; 1.0 = rig limit) ────────────────────────── */
  torque: {
    cutHardExp: 1.0,          // how much stratum hardness scales the cutting reaction
    cuttingsExp: 1.6,         // cuttings drag is super-linear — a choked hole binds fast
    depthRef: 30,             // metres of rod string per unit of drag torque
    bindGain: 0.35,           // torque added per unit of bind pressure
    overLimit: 1.0,           // gauge value that counts as overtorque
    safetyLimit: 1.05,        // sustained above this = a logged safety event
    safetyHoldSec: 1.0,       // seconds above the safety limit before it is logged
    displayMax: 1.25,         // gauge clamp (the needle can peg past the red line)
    optimalHeadroom: 0.92,    // the fraction of the rig limit a competent operator's own
                              // optimum may sit at. Above it the weight comes off, because
                              // nobody drills a shift with the needle in the red.
    jitterBoulder: 0.055,     // telegraph judder amplitude — boulder
    jitterRod: 0.075,         // telegraph judder amplitude — rod fatigue (low frequency)
    jitterBind: 0.040,        // telegraph judder amplitude — binding string
    jitterHz: { boulder: 11, rod: 2.6, bind: 6.5, water: 4.0 },
  },

  /* ── wear ────────────────────────────────────────────────────────────── */
  wear: {
    perMetre: 0.0030,         // base wear per metre drilled at abrasivity 1, carbide 1
    abrasivityExp: 1.2,       // abrasivity dominates: sand and quartzite eat carbide
    heatMul: 0.30,            // extra wear at full heat
    rubPerSec: 0.0040,        // wear per PLAYER second spinning without penetrating
    rubRopFrac: 0.15,         // "not penetrating" = below this fraction of potential ROP
    percussionMul: 1.15,      // percussion is harder on buttons than pure rotation
    indexMul: 0.9,            // extra wear when DTH rotation is mismatched to blow rate
    shockPerEvent: 0.06,      // wear added by a mishandled boulder / void re-entry
    // Bearings — the other way a roller-cone bit dies, and the one you cannot
    // see. A sealed journal tricone gives up at the bearings about as often as
    // at the teeth, and nothing on the surface says which until it is up.
    // `bearings: 0` on a bit archetype means it has none (a PDC).
    bearingPerMetre: 0.0018,  // bearing life consumed per metre at reference load
    bearingCriticalAt: 0.88,  // beyond this a bearing can seize at any moment
    bearingFailPerSec: 0.30,  // seizure probability per player second at full wear
    wornAt: 0.80,             // BIT_WORN fires here
    criticalAt: 0.90,         // above this the bit can break
    breakChancePerSec: 0.22,  // break probability per player second at wear 1.0, full load
    breakTelegraphSec: 1.2,   // warning shown before a break becomes possible
  },

  /* ── heat ────────────────────────────────────────────────────────────── */
  heat: {
    gen: 0.30,                // heat generated at full rpm × wob × hardness 1
    wobFloor: 0.25,           // heat still generated with no weight on bit
    cool: 0.55,               // cooling rate coefficient
    ambient: 0.12,            // cooling with zero flush (rock conducts a little)
    overheatAt: 0.85,         // logged as a safety event above this
    overheatHoldSec: 1.2,     // seconds above the limit before it is logged
  },

  /* ── cuttings & hole cleaning ────────────────────────────────────────── */
  cuttings: {
    gen: 0.22,                // load generated per second at reference ROP
    ropRef: 30,               // reference ROP (m/h) for cuttings generation
    packing: 0.30,            // self-limiting: a full annulus generates less new load
    annulusRef: 60,           // metres of hole per halving of cleaning efficiency
    clear: 1.0,               // cleaning rate at full flush with full returns
    bleed: 0.02,              // passive settling / bailing per second
    lostReturns: 0.18,        // cleaning efficiency retained when circulation is lost
    kickClear: 0.28,          // load removed by a blow-down / bail pulse
    augerLift: 0.90,          // an auger flight lifts spoil mechanically with rotation —
                              // for auger-type methods this, not the flush, cleans the hole
  },

  /* ── hole stability, erosion & casing ────────────────────────────────── */
  stability: {
    lambda: 1.6,              // how fast the hole reacts toward its target stability
    erodeMargin: 0.15,        // flush this far above what the ground needs starts washing it out
    erodeK: 0.050,            // erosion per second at full over-flush in loose ground
    erodeRecover: 0.030,      // erosion healing per second when flushing sensibly
    erodeMax: 0.55,           // erosion ceiling — over-flushing alone can never kill a hole
    waterHit: 0.28,           // stability lost to a full water inflow
    dragThresh: 0.30,         // stability below this starts accumulating open-hole drag
    dragK: 0.25,              // drag accumulated per second per unit of deficit
    dragDecay: 0.35,          // drag shed per second when the hole is behaving
    dragTorque: 0.16,         // torque per unit of accumulated drag
    dragMax: 1.0,             // drag ceiling
    collapseAt: 0.15,         // below this the hole is actively collapsing
    casedStability: 1.0,      // stability of a cased interval — permanent
    casingDragCut: 0.12,      // fraction of drag left once casing is set
    casingRopMul: 0.72,       // ROP cost of drilling with casing advancing
    casingTorqueAdd: 0.14,    // torque cost of turning the casing string
    casingSecPerMetre: 0.05,  // player seconds to run casing per metre of hole
  },

  /* ── jam / stuck string ──────────────────────────────────────────────── */
  jam: {
    torqueThresh: 0.78,       // torque above which the string starts to bind
    torqueK: 1.5,             // bind pressure per unit of excess torque
    loadThresh: 0.70,         // cuttings load above which packing-off begins
    loadK: 1.1,               // bind pressure per unit of excess load
    dragK: 0.35,              // bind pressure per unit of open-hole drag
    stabThresh: 0.22,         // stability below which the walls squeeze the string
    stabK: 1.2,               // bind pressure per unit of stability deficit
    relief: 0.55,             // natural relief per second at full flush
    reliefFloor: 0.10,        // relief that always exists — never unwinnable
    reliefLowWob: 0.30,       // extra relief for backing the feed right off
    bindEnter: 0.35,          // free → binding
    stuckEnter: 1.00,         // binding → stuck
    stuckForgive: 0.5,        // stuck-clock seconds forgiven per second of clean drilling
    stuckReliefFloor: 0.05,   // relief that always exists while stuck — slow, but never zero
    stuckReliefFlush: 0.10,   // extra relief per unit of flush while stuck
    stuckReliefLowWob: 0.06,  // extra relief for taking the weight off while stuck
    stuckExit: 0.34,          // a stuck string comes free here — while stuck NO new bind
                              // pressure is applied, so the escape is always reachable
    rescueMinCycle: 0.55,     // only one effective rescue tap per rhythm cycle (no mashing)
    bindMax: 1.60,            // bind ceiling
    rescueHz: 1.1,            // "work the string" rhythm frequency
    rescueWindow: 0.28,       // fraction of the cycle that counts as a good tap
    rescueGain: 0.22,         // bind removed by a good tap
    rescueMiss: 0.05,         // bind added by a bad tap
    rescueFatigue: 0.020,     // rod fatigue added by a bad tap
    rescueGoodFatigue: 0.004, // rod fatigue added even by a good tap
    kickGain: 0.15,           // bind removed by a torque kick
    kickCooldown: 2.5,        // player seconds between kicks
    kickHeat: 0.05,           // heat added by a kick
    warnSec: 18,              // stuck seconds before the "losing the hole" warning
    loseSec: 26,              // stuck seconds before the hole (and string) is lost
  },

  /* ── rod fatigue & rod break ─────────────────────────────────────────── */
  rods: {
    lengthDefault: 3,         // metres per rod when the method does not say otherwise
    addSec: 4.2,              // player seconds for a rod add
    addSecPerfect: 2.3,       // … when the stab is nailed
    windowDelay: 1.1,         // player seconds before the timing window opens
    windowSec: 0.55,          // width of the timing window
    perfectComboKeep: 1.0,    // fraction of groove time kept on a perfect stab
    missComboKeep: 0.45,      // … and on a miss
    fatiguePerOverTorque: 0.06,   // fatigue per second of overtorque
    fatiguePerShock: 0.05,    // fatigue per shock load (void re-entry, boulder deflection)
    fatigueDecay: 0.012,      // fatigue shed per downhole second of clean drilling
    breakFatigue: 0.70,       // fatigue above which a break becomes possible
    breakDepthFrac: 0.35,     // … and only past this fraction of target depth
    breakChancePerSec: 0.10,  // break probability per player second at fatigue 1
    breakTelegraphSec: 1.0,   // low-frequency warning before the break
    /* ABUSE IS RELATIVE. Drilling above what the ground is asking for is abuse;
       running a method whose optimum happens to be high is not. A raise borer
       sits at 0.70 thrust all day and breaks nothing, and an absolute
       threshold called that abuse and parted its string for doing its job. */
    abuseMargin: 0.15,
  },

  /* ── trips ───────────────────────────────────────────────────────────── */
  /* A method may override secPerRod with `tripSecPerRod`. On an oil well the
     round trip is the single largest discretionary cost in the run — 1,800 m
     is sixty-odd stands out and sixty-odd back — so it gets its own number. */
  trip: {
    secPerRod: 0.28,          // player seconds per rod, each way
    swapSec: 1.4,             // player seconds to break out and make up a new bit
    emergencySwapSec: 3.0,    // … when fishing a broken bit out first
    minSec: 1.2,              // floor so a shallow trip still reads as an operation
  },

  /* ── mud, pore pressure and well control ─────────────────────────────
     Only methods with `wellControl: true` run this. Everything here is in
     specific gravity (sg), the unit a mud engineer actually uses: 1.00 is
     water, a normally-pressured formation balances at about 1.05, and the
     difference between the two is the overbalance that holds the hole shut.

     The loop it creates is the real one. Not enough weight and formation
     fluid enters the well — a KICK, whose answer is to shut in, not to back
     off feed. Too much weight, or too much flow, and a weak formation breaks
     down and swallows the mud — LOST CIRCULATION, which drops the column and
     can itself cause a kick. Kill a kick and the mud comes back heavier, which
     is safer against the next kick and presses the string harder against the
     wall: DIFFERENTIAL STICKING. Every one of the three leads to the others.
     ─────────────────────────────────────────────────────────────────────── */
  mud: {
    /* The mud programme, keyed by the id fitted in the `mud` loadout slot
       (game/data.js ITEMS_OILGAS). sg is the mud weight it is mixed to. */
    programmes: {
      'mud-spud-gel':           { name: 'Spud mud',        sg: 1.06, lubricity: 0.82, inhibition: 0.20 },
      'mud-kcl-polymer':        { name: 'KCl / polymer',   sg: 1.20, lubricity: 1.00, inhibition: 0.80 },
      'mud-barite-weighted-hd': { name: 'Barite-weighted', sg: 1.52, lubricity: 0.94, inhibition: 0.75 },
      'mud-invert-emulsion-hd': { name: 'Invert emulsion', sg: 1.34, lubricity: 1.45, inhibition: 1.00 },
      _default:                 { name: 'Water-based mud', sg: 1.15, lubricity: 1.00, inhibition: 0.60 },
    },
    lcmItemId: 'svc-lcm-pallet',  // carrying this makes the LCM pill available

    poreNormalSg: 1.05,       // normal formation pressure, as an sg equivalent
    poreOverSg: [0.16, 0.52], // extra sg inside an overpressured zone
    overZoneChance: 0.55,     // wells that have one
    overZoneFrac: [0.45, 0.92], // where it sits, as a fraction of target depth
    overZoneThick: [30, 220], // metres

    ecdBase: 0.03,            // sg the annulus adds just by circulating
    ecdPerFlush: 0.05,        // … and by how hard you circulate
    kickMargin: 0.02,         // overbalance below this and the formation flows
    fracMarginSg: 0.80,       // overbalance above this breaks weak ground down
    killWeightAdd: 0.09,      // minimum sg the mud comes back heavier after a kill
    killTripMargin: 0.13,     // … and the trip margin the kill mud is mixed to
    weightCap: 2.20,

    lossPerSec: 0.020,        // mud level lost per player second, losses unchecked
    levelKickAt: 0.55,        // column this low and the losses induce a kick
    levelRecover: 0.05,       // level regained per second once the losses are cured
    stickPerSg: 0.55,         // differential-sticking pressure per sg of overbalance
    stickPermeable: 0.45,     // ground water rating above which a filter cake forms
  },

  /* ── the groove ──────────────────────────────────────────────────────── */
  groove: {
    targetLoad: 0.30,         // cuttings load the band centre assumes — a fouled hole
                              // pushes your needle above the band until you clean it
    /* …except on a method whose cuttings load genuinely swings with the
       formation. A 2,000 m well cleans itself in a slow limestone and loads up
       in a fast clay, so a single fixed reference puts the band out of reach
       for half the hole. `bandLoadFollow` on the method blends the reference
       toward the load the hole actually has: 0 keeps the fixed reference (every
       method that had one before), 1 follows the hole completely. The blend
       keeps a fouled hole reading high without making a clean one unplayable. */
    loadFollowDefault: 0,
    baseHalfWidth: 0.075,     // half width of the green band on the torque gauge
    minHalfWidth: 0.022,      // never narrower than this
    wearNarrow: 0.45,         // band narrowing at full bit wear
    difficultyNarrow: 0.30,   // band narrowing at difficulty 5
    skillWiden: 0.055,        // band widening per rank of the Operator groove skill
    driftAmp: [0.058, 0.034], // amplitude of the two drift sines — deliberately wider than
                              // the band half-width, so holding a fixed input drifts you out
    driftHz: [0.075, 0.026],  // frequency (Hz) of the two drift sines
    driftDifficulty: 0.35,    // extra drift speed at difficulty 5
    comboRampSec: 6.0,        // seconds in band to reach the full multiplier
    comboDecayMul: 3.2,       // groove time decays this much faster than it builds
    enterGraceSec: 0.12,      // hysteresis so the needle riding the edge does not chatter
    stratumJumpFlashSec: 0.8, // how long telemetry reports "the band just jumped"
  },

  /* ── hazards ─────────────────────────────────────────────────────────── */
  hazard: {
    telegraphSec: {
      boulder: 0.7, cavity: 0.5, water: 0.6, collapse: 1.0, bit: 1.2, rod: 1.0,
      // The four that belong to mud rotary and to no other method. Each reads
      // differently on the gauges and each has a different correct answer.
      kick: 1.0, 'lost-zone': 0.8, 'diff-stick': 1.0, 'twist-off': 1.1,
      // RC. Not one of these is a hole problem — all three are assay problems,
      // which is the entire character of the method.
      'wet-sample': 0.8, 'carry-over': 0.6, 'cyclone-choke': 1.0,
      // Tunnel jumbo. A pattern game: every one of these is decided before the
      // round is fired, and the answer is never "drill faster".
      'collar-slip': 0.5, 'cut-choke': 0.9, 'bad-ground': 1.2,
      // Longhole. Two of these have OPPOSITE flushing answers, and which one is
      // correct depends on whether the hole is an uphole or a downhole.
      'hole-blocked': 0.8, 'uphole-flush': 0.7, 'rod-whip': 1.0,
      // Ground support. The bolt that looks installed and holds nothing.
      'gel-clock': 0.9, 'bolt-hole-collapse': 1.0, 'loose-plate': 0.5,
      // Driven piling. No rotation, no flush, and a set gauge that can lie.
      obstruction: 0.7, 'head-damage': 0.9, 'premature-refusal': 1.1,
      // Site investigation. SPT is driven and CPT is pushed; neither is drilling,
      // so neither of their hazards has a drilling answer.
      'rod-bounce': 0.7, 'fall-in': 0.9, precarious: 0.6, 'thrust-limit': 1.0,
      'cone-desaturation': 0.8,
      // The second pass of a two-stage method: the reamer stalling on the way
      // up, or the product pipe about to stick on the way back.
      'pull-stall': 1.0,
      // Jet grouting's lift. The sourced failure is losing control of the
      // return, and it fails in BOTH directions — nothing coming back, or the
      // annulus packing off until the ground lifts. Two events, two opposite
      // correct answers, on two different controls.
      'return-lost': 0.8, 'ground-heave': 0.9,
    },
    boulder: {
      sec: [3.0, 6.5],        // player seconds to get through, best → worst case
      torqueSpike: 0.42,      // torque added while grinding on it
      ropMul: 0.18,           // ROP while on the boulder
      wobMax: 0.45,           // correct response: feed at or below this …
      rpmMin: 0.60,           // … and percussion at or above this
      cleanFrac: 0.60,        // fraction of the event handled well to count as clean
      handledSpeed: 1.7,      // time multiplier when handled correctly
      bindAdd: 0.55,          // bind pressure from grinding on it badly
      deviationAdd: 0.35,     // hole deviation from being deflected off it
    },
    cavity: {
      reactSec: 1.0,          // seconds allowed to cut the feed before the string drops
      wobSafe: 0.25,          // feed considered "cut"
      shockStability: 0.30,   // stability lost by dropping the string into the void
      shockBind: 0.45,        // bind pressure from the drop
      returnsLost: 0.10,      // circulation returns while in the void
    },
    water: {
      flushMin: 0.60,         // correct response: lift the extra column with more flush
      graceSec: 3.0,          // seconds to respond before it starts costing stability
      inflowLambda: 0.35,     // how fast the inflow builds
      returnsCut: 0.35,       // returns lost to a full inflow (air methods especially)
      erodeMul: 1.8,          // erosion multiplier while water is flowing
    },
    lostCirc: {
      waterMin: 0.70,         // ground water rating that can swallow the flush
      stabMax: 0.35,          // … in ground this unstable
      exitSec: 1.5,           // how long returns take to come back after leaving the zone
    },
    /* ── kick / influx ──────────────────────────────────────────────────
       Formation pressure has beaten the mud column and formation fluid is
       entering the well. The tell is a gain on the pit totaliser and a fall in
       standpipe pressure while the rate of penetration jumps (a drilling
       break). The answer is to SHUT THE WELL IN — space out, close the
       preventer, read the pressures. Backing off the feed does nothing: the
       well is flowing whether the bit turns or not. */
    kick: {
      reactSec: 1.8,          // player seconds to shut in once it is flowing
      growLambda: 0.30,       // how fast the influx builds
      killSec: [7, 15],       // shut in, circulate the influx out, weight up
      lateKillMul: 2.2,       // … and how much longer it takes if the crew shut in for you
      ropBreak: 1.35,         // the drilling break: ROP rises entering the zone
    },
    /* ── lost circulation ───────────────────────────────────────────────
       The mud is going into a thief zone instead of back up the annulus.
       Returns fall, the pit level falls with them, and the column that was
       holding the hole open goes with it. The answer is to cut the pump rate
       — less equivalent circulating density, less driving the loss — and to
       spot a lost-circulation pill across the zone if one is on board. */
    lostZone: {
      flushMax: 0.34,         // cut the pumps to at or below this
      wobMax: 0.45,           // and stop making new hole into it
      cureSec: 6.0,           // seconds of correct handling to cure it
      pillCureSec: 1.6,       // … with an LCM pill spotted across the zone
      kickAfterSec: 9.0,      // an unchecked loss drops the column into a kick
    },
    /* ── differential sticking ──────────────────────────────────────────
       Not a packed-off hole: the string is lying against a permeable bed with
       the mud column pressing it into the filter cake. It comes on with
       overbalance and with a string that has stopped moving. The answer is the
       opposite of a pack-off — KEEP IT TURNING and take the weight off. */
    diffStick: {
      rpmMin: 0.42,           // keep it rotating …
      wobMax: 0.38,           // … and lift the weight off the wall
      sec: [4.0, 8.5],
      bindAdd: 0.42,          // pressure added per second of getting it wrong
    },
    /* ── twist-off ──────────────────────────────────────────────────────
       Torsional fatigue parts the string, usually at a tool joint. It
       telegraphs as a low-frequency torque oscillation with erratic rotation.
       Back the feed AND the rotation off and it survives; ignore it and the
       string parts, and the well costs you a fishing trip — never the hole. */
    twistOff: {
      wobMax: 0.42, rpmMax: 0.55,   // the response, during the telegraph
      fishTripMul: 2.4,             // a fishing trip is a slow trip
      fishSwapSec: 6.0,             // … plus the time on the overshot
    },
    /* ── RC: wet sample ─────────────────────────────────────────────────
       Below the water table the bit face loses positive air pressure, water
       enters the sample stream and the bag comes up as slurry. The hole is
       perfect. The assay is not. The answer is AIR — the bleed chuck holds the
       water head above the chuck sleeve only while there is pressure behind it. */
    wetSample: {
      airMin: 0.82,           // hold the air at or above this and the sample stays dry
      wobMax: 0.55,           // … and do not lean on it, or the hammer floods
      graceSec: 1.6,          // player seconds before the sample starts going wet
      wetPerSec: 0.34,        // sample wetness gained per second of not answering it
      dryPerSec: 0.45,        // … and shed per second once the air is back up
      recoveryCut: 0.35,      // recovery lost at a fully wet sample
    },
    /* ── RC: carry-over ─────────────────────────────────────────────────
       Metre 40 is still in the inner tube when metre 41 starts, so the bag is a
       mixture of two intervals. The answer is the blow-down: clear the string.
       It is a discrete action, not a slider — the pill is `pulse('blowDown')`. */
    carryOver: {
      warnAt: 0.42,           // hold-up in the sample train that raises the hazard
      reactSec: 2.2,          // player seconds to blow the string down
      contamPerSec: 0.30,     // contamination added per second of leaving it in the tube
      clearFrac: 0.85,        // hold-up removed by a blow-down cycle
      blowDownSec: 0.35,      // player seconds the blow-down cycle takes. The sliding
                              // hydraulic actuation exists precisely to make this quick —
                              // a driller who has to choose between a clean bag and the
                              // clock is being asked the wrong question
      blowDownCooldown: 2.0,  // … and the minimum interval between them
    },
    /* ── RC: cyclone choke ──────────────────────────────────────────────
       The ceramic-lined sample train is silting up. Every wetted surface in it
       is a wear part, and abrasive ground eats the plumbing, not just the bit.
       Stop making new chips and hold full air until it clears. */
    cycloneChoke: {
      wobMax: 0.30,           // stop cutting into it …
      airMin: 0.80,           // … and keep the air on the train
      clearSec: 3.4,          // seconds of correct handling to clear it
      recoveryCut: 0.45,      // recovery lost per second while it is choked
      trainWearAdd: 0.06,     // sample-train wear added by a choke handled badly
    },

    /* ── Jumbo: collar slip ─────────────────────────────────────────────
       Real jumbos have a separate, lower COLLARING power setting because a bit
       at full feed on an unbroken face walks off the mark. The mark is where
       the round was designed; a collar error on the cut eats the whole burden. */
    collarSlip: {
      wobMax: 0.34,           // collar at or below this feed …
      rpmMin: 0.45,           // … with the percussion up, so the bit bites rather than skates
      sec: 1.1,               // player seconds the collaring window lasts
      collarErrM: 0.085,      // collar error (m) added by collaring at full feed
    },
    /* ── Jumbo: the cut is closing ──────────────────────────────────────
       With a 76 mm relief hole the first burden is 0.113 m. Over a 2.85 m hole
       a 3 degree deviation moves the toe 0.149 m — more than the whole burden.
       If the accumulated cut error approaches the burden, the cut will not open
       and the round will freeze. Ease the feed and let the percussion work. */
    cutChoke: {
      wobMax: 0.32,           // the same answer as collaring: take the weight off
      rpmMin: 0.55,
      sec: 2.6,               // player seconds to recover the hole
      redrillSec: 2.8,        // … and the cost of re-drilling the hole you saved
      errRelief: 0.55,        // fraction of the cut error a good recovery buys back
    },
    /* ── Jumbo: bad ground at the face ──────────────────────────────────
       Bad ground SHORTENS THE ROUND. It does not slow the drill. A face that
       needs 6 m spiles is drilled at 2.5-3.0 m per round instead of 4.5-5.0,
       and the weekly advance falls with it. `pulse('shortRound')` accepts it. */
    badGround: {
      reactSec: 2.4,          // player seconds to accept the shorter round
      overbreakAdd: 0.32,     // overbreak added by driving a full round into bad ground
      pullCut: 0.22,          // pull lost by the same
    },

    /* ── Longhole: blocked downhole ─────────────────────────────────────
       Cuttings fall back down a downhole and pack it. A packed hole is a hole
       the charge crew cannot load, so it is a hole that was never drilled.
       Lift the flush and take the weight off; `pulse('redrill')` always works. */
    holeBlocked: {
      flushMin: 0.72,         // lift the flushing …
      wobMax: 0.34,           // … and take the weight off so the string cleans itself
      clearSec: 2.8,          // seconds of correct handling to clear the hole
      sec: 9.0,               // … after which the hole is logged as blocked
      redrillSec: 3.2,        // player seconds to pull back and re-drill it
    },
    /* ── Longhole: uphole flush-back ────────────────────────────────────
       The opposite hole and the opposite answer. In an uphole the cuttings and
       the water come back down over the machine and the operator. You CUT the
       flushing and let the hole drain, then bring it back up. */
    upholeFlush: {
      flushMax: 0.38,         // cut the flushing to at or below this …
      wobMin: 0.22,           // … but keep enough feed on that the string stays coupled
      sec: 4.5,
      visibilityCut: 0.5,     // how much of the deviation cue is lost while it is running
      deviationAdd: 0.030,    // deviation banked per second of drowning the hole
    },
    /* ── Longhole: rod whip ─────────────────────────────────────────────
       A long, slender string on a short feed. Push it and the string whips, and
       the whip goes into the hole as deviation you will not see until the ring
       is surveyed. Ease the feed and hold the percussion. */
    rodWhip: {
      wobMax: 0.36,
      rpmMin: 0.50,
      sec: 3.6,
      deviationAdd: 0.075,    // deviation banked per second of drilling through it hard
      fatigueAdd: 0.030,      // … and rod fatigue, because the joints take it
    },

    /* ── Bolting: the resin has gelled ──────────────────────────────────
       Spin the bar through the cartridges, then STOP before the resin gels and
       hold while it cures. Spinning after the gel shears the bond it just made,
       and the bolt looks installed and holds nothing. */
    gelClock: {
      rpmMax: 0.12,           // stop the rotation — this is the whole answer
      reactSec: 1.4,          // player seconds before the bond is sheared
      bondLossPerSec: 0.55,   // anchorage destroyed per second of spinning past the gel
    },
    /* ── Bolting: the bolt hole closes ──────────────────────────────────
       Broken ground squeezes the hole shut between drilling it and getting the
       bolt into it. Re-ream and get the bolt in: `pulse('reamHole')`. Never a
       dead end — re-reaming always works, and it costs time. */
    boltHoleCollapse: {
      reactSec: 3.0,          // player seconds before the hole is lost and must be re-drilled
      reamSec: 1.6,           // player seconds to re-ream it
      redrillSec: 3.4,        // … or the cost of drilling a fresh hole
    },
    /* ── Bolting: the plate is not tight ────────────────────────────────
       A bolt bearing on nothing supports nothing. Tension it: `pulse('torqueTest')`
       both reads the torque and pulls the plate up to the rock. */
    loosePlate: {
      reactSec: 2.0,
      qualityCut: 0.35,       // install quality lost by leaving the plate loose
    },

    /* ── Piling: obstruction ────────────────────────────────────────────
       A sudden blow-count spike and the pile starts to walk off line. STOP
       DRIVING: cut the energy and re-trim the alignment. Driving harder bends
       the pile and brooms the toe, which is the one thing you cannot undo. */
    obstruction: {
      energyMax: 0.35,        // cut the hammer energy to at or below this …
      alignBand: 0.14,        // … and bring the alignment back inside this of plumb
      sec: 3.8,
      rakePerSec: 0.16,       // rake (degrees off line) added per second of driving on
      toePerSec: 0.10,        // toe damage added per second of the same
    },
    /* ── Piling: pile head damage ───────────────────────────────────────
       The dolly and the packing have stopped rebounding cleanly, the head is
       spalling and the energy that used to reach the toe is going into the
       concrete. Stop and change the dolly: `pulse('changeDolly')`. */
    headDamage: {
      reactSec: 3.2,
      headPerSec: 0.11,       // head damage added per second of driving on a dead dolly
      stressAdd: 0.16,        // driving stress added by the same
      changeSec: 3.6,         // player seconds to change dolly and packing
    },
    /* ── Piling: premature refusal ──────────────────────────────────────
       The blow count is climbing through the practical limit ABOVE the design
       toe level. This is a dense layer, not the bearing stratum. Take a formal
       set and read the toe level: `pulse('takeSet')`. Driving to an arbitrary
       set for compliance is exactly how a pile is destroyed. */
    prematureRefusal: {
      reactSec: 3.4,
      toePerSec: 0.13,        // toe damage per second of driving on for the number
      stressAdd: 0.20,
    },

    /* ── SPT: the hammer is not in free fall ────────────────────────────
       Rope riding the cathead, or the sampler bouncing. The blow count inflates
       and the N is not defensible. Re-establish the clean release: tap
       `pulse('strike')` inside the release window. */
    rodBounce: {
      needGoodTaps: 3,        // clean releases required to clear it
      sec: 6.0,
      energyCut: 0.30,        // energy ratio lost while it is running
      fidelityCut: 0.22,      // log fidelity lost if it is never cleared
    },
    /* ── SPT: fall-in at the base of the hole ───────────────────────────
       The seating drive is being driven through material that fell in, not
       through ground. Clean the base first: `pulse('cleanOut')`. */
    fallIn: {
      reactSec: 3.0,
      cleanSec: 2.0,          // player seconds to clean out the base
      qualityCut: 0.40,       // sample quality lost by driving through fall-in
      nBias: -0.25,           // fractional bias the fall-in puts on N (it reads LOW)
    },
    /* ── CPT: a precarious situation ────────────────────────────────────
       A sudden dramatic rise in cone resistance, bending, or inclination. Slow
       down — and because it must be reported, the slow-down is logged on the
       trace rather than hidden. */
    precarious: {
      rateMax: 0.42,          // push rate control at or below this (slow, not stopped)
      sec: 4.0,
      inclPerSec: 0.35,       // inclination (degrees) added per second of pushing on
      damageChance: 0.22,     // chance per second of damaging the cone if ignored
    },
    /* ── CPT: thrust capacity reached ───────────────────────────────────
       The rods rebound when released and the machine physically moves during
       penetration. The correct answer is to TERMINATE the sounding: a sounding
       stopped at thrust capacity is a valid, reportable result and it pays.
       Pushing on while the machine moves is a hard fail on the sounding. */
    thrustLimit: {
      reactSec: 2.6,
      fidelityCut: 0.45,      // log fidelity lost by pushing on past it
    },
    /* ── CPT: cone desaturation ─────────────────────────────────────────
       The porous element loses saturation crossing a thin dense layer and the
       u2 channel goes flat, so qt cannot be corrected. Slow through it, then
       run a dissipation test on the far side: `pulse('dissipation')`. */
    coneDesat: {
      rateMax: 0.55,          // ease the push through the layer
      sec: 5.0,
      dissipationSec: 4.0,    // player seconds a dissipation test costs
      fidelityCut: 0.20,
    },

    /* ── The second pass: the reamer is stalling ────────────────────────
       On the way back the constraint stops being rate of penetration and
       becomes PULL FORCE. Ease the pull and keep the hole clean; keep hauling
       into a stalling head and the string binds, and on a pullback a stuck
       product pipe loses the job. */
    pullStall: {
      rateMax: 0.38,          // ease the pull to at or below this ...
      flushMin: 0.55,         // ... and keep the annulus open behind the head
      sec: 4.0,
      bindAdd: 0.50,          // bind added per second of hauling into a stall
      cutterAdd: 0.05,        // ... and cutter life burned doing it
    },

    /* ── LOSING CONTROL OF THE JET GROUTING RETURN ────────────────────────
       research/05 §A12: the KPI is the column achieved WITH THE RETURN
       MANAGED, and losing it — no return at all, or heave — is the failure.
       Two events, and the correct answers are NOT the same lever:

         return-lost   the mix is going into a permeable formation instead of
                       coming back. CUT THE PUMP. Lifting faster helps a
                       little; jetting harder feeds the loss.
         ground-heave  the annulus cannot pass what is being made and the
                       pressure is going into lifting the ground — the one
                       outcome nobody on an urban plot forgives. GET THE
                       MONITOR MOVING: lift faster, so less is made per metre.

       Neither answer is "back off everything", and neither is the other's. */
    jetReturn: {
      sec: 4.0,
      workMax: 0.42,          // return-lost: pump at or below this is the answer
      liftMin: 0.62,          // ground-heave: withdraw at or above this
      mishandlePerSec: 0.34,  // column penalty banked per second of the wrong answer
      recoverPerSec: 0.10,    // ... and how slowly it stops costing once fixed
      colCut: 0.55,           // full penalty, in column index
    },

    /* Fallback hazard rates when geology is not emitting them, PER METRE.
       These were authored against 50 m holes. A method drilling thousands of
       metres must scale them down with `hazardScale`, or a 2,000 m well takes a
       water strike every twenty metres and the hazard log becomes noise. */
    selfGenPerMetre: {
      boulderTill: 0.06, boulderBed: 0.22, boulderGravel: 0.03,
      cavityLimestone: 0.02, waterPerWater: 0.05,
    },
    dedupeSec: 2.5,           // ignore a duplicate external/internal hazard within this
    dedupeMetres: 1.5,        // … and within this depth window
  },

  /* ── hole straightness ───────────────────────────────────────────────── */
  straight: {
    devK: 0.030,              // deviation per downhole second per unit of off-optimal feed
    hardMul: 0.6,             // hard ground punishes off-optimal feed more
    maxDev: 12,               // deviation that scores zero (arbitrary units, ≈ 12°)
    // Deviation accumulates per downhole second, so a method running a large
    // `timeMul` would otherwise bank a whole run's worth of it in a minute.
    // `oil-rotary` compresses 26x, and a well path is measured over kilometres,
    // so its multiplier divides that back out.
    // The six new methods each compress time differently, and three of them are
    // SCORED on deviation rather than merely taxed for it, so each divides the
    // per-downhole-second rate back out to its own scale.
    methodMul: {
      /* HDD IS SOLD BY BORE LENGTH, 50 TO 1,200 m, and `maxDev` is 12. At 2.0
         a competent 400 m bore banked 17.7 and scored ZERO on straightness,
         and so did every bore past about 270 m — the axis was dead over most
         of the method's own range for no fault of the driller's. This is the
         same reasoning `rc` carries one line down, applied to a method whose
         holes are longer still: 0.30 puts a well-driven 120 m bore at 0.55,
         a 400 m at 2.7 and the 1,200 m top of the range at about 8. */
      hdd: 0.30, core: 1.5, anchor: 1.3, 'oil-rotary': 0.05,
      /* A raise runs 30 to 600 m and the pilot's accuracy is the whole point of
         it — a deviated pilot misses the lower level. But at the implicit 1.0
         a 378 m raise banked 55, six times what scores zero, so the axis said
         nothing except "this raise is long". */
      'raise-boring': 0.06,
      rc: 0.30,               // a 300 m RC hole is not a 40 m water bore
      'tunnel-jumbo': 0.22,   // 5x time compression, and the number that matters is per hole
      longhole: 0.28,         // 5.2x compression; the toe error model does the real work
      /* A 2.4 m bolt hole banks almost nothing per hole, so the axis needs a
         large multiplier to say anything at all across a pattern. THIS IS
         DRILLING ACCURACY — collaring on the mark, at the design angle, in the
         right ring — and it carries 0.04 of the method's weight. It is NOT a
         bolt-capacity term: what a crooked hole does to a bolt's hold is
         modelled nowhere, in either direction, and `bolt.devDegPerM` says why. */
      rockbolt: 0.75,
      'driven-pile': 0,       // a driven pile has no rotation to wander — rake is its own axis
      'site-investigation': 0.5,
    },
  },

  /* ── scoring ─────────────────────────────────────────────────────────── */
  score: {
    /* `quality` is the METHOD'S OWN AXIS and it is zero by default, because on a
       method that is paid for depth there is nothing else to measure. The six
       methods that are NOT paid for depth — RC's bag, the jumbo's round, the
       longhole ring's toes, a bolt's anchorage, a pile's set, a sounding's log —
       override the whole weight set in `TUNING.methods.<id>.score.weights` and
       give this term most of it. Nothing here changes for a method without one. */
    weights: { time: 0.24, groove: 0.26, bit: 0.14, straight: 0.14, hazard: 0.12, safety: 0.10, quality: 0 },
    par: {                    // the reference run par time is computed against
      combo: 1.60,            // groove multiplier a good driller sustains
      wearMid: 0.50,          // bit wear consumed over the reference hole
      heat: 0.35,             // steady-state heat of a well-flushed hole
      torque: 0.60,           // torque the reference run sits at
    },
    parHumanFactor: 1.30,     // par is the theoretical optimum × this — a human cannot hold
                              // perfect inputs, so the displayed par is the realistic benchmark
    parSlack: 1.25,           // finishing at par × this still scores 0.5 on time
    bitBudget: 0.35,          // bit life a par run is expected to consume
    safetyPenalty: 0.22,      // score lost per logged safety event
    jamPenalty: 0.10,         // score lost per stuck-string incident
    grades: [                 // thresholds, highest first
      ['S', 0.90], ['A', 0.78], ['B', 0.62], ['C', 0.44], ['D', 0],
    ],
  },

  /* ── skill hooks (Operator/Toolsmith branch ids; missing ranks read 0) ── */
  /* Each entry is a list of candidate skill ids; the highest rank found wins.
     The FIRST id in each list is the real id in game/data.js SKILLS — without
     it none of these hooks ever fired, because every candidate here was a
     spelling the skill tree does not use. The rest are kept as aliases. */
  skills: {
    grooveWidth:  ['op.steady-hand', 'op-steady-hand', 'operator-groove', 'groove-width', 'steady-hand'],
    feedControl:  ['op.feed-finesse', 'op-feed-control', 'operator-feed', 'feed-control'],
    rodSpeed:     ['op.rod-handler', 'op-rod-handling', 'operator-rods', 'rod-speed'],
    jamRescue:    ['op.jam-sense', 'op-jam-rescue', 'operator-rescue', 'jam-rescue'],
    bitLife:      ['ts.carbide-care', 'ts-carbide', 'toolsmith-bit-life', 'bit-life'],
    // Tripping IS rod handling — the same hands, the same racking board.
    tripSpeed:    ['op.rod-handler', 'ts-quick-change', 'toolsmith-trip', 'trip-speed'],
    perRank: {                // effect size per rank, all capped at 5 ranks
      grooveWidth: 0.055, feedControl: 0.04, rodSpeed: 0.07,
      jamRescue: 0.10, bitLife: 0.07, tripSpeed: 0.08,
    },
    maxRank: 5,
  },

  /* ── methods: the reason to unlock them ──────────────────────────────── */
  /* kind: 'percussive' | 'rotary' | 'auger' | 'core' | 'sonic'            */
  /* ═════════════════════════════════════════════════════════════════════
     THIS TABLE AND game/data.js METHODS ARE TWO TABLES, ON PURPOSE.

     `drilling.js` imports `core/contract.js` and nothing else. That is not
     tidiness — it is what lets the whole simulation run in node with no GPU
     and no browser, which is what `tools/stagepace.mjs` and every other
     headless probe are built on, and what makes balancing this file possible
     at all. Importing `data.js` would trade that away for four numbers, and
     `data.js` is only pure today: nothing enforces that it stays pure.

     Taking the numbers off the contract passed into `startHole()` is worse
     than either: the physics would then depend on what the caller happened to
     hand over, every harness would have to supply a method row, and a missing
     row falls back here anyway — so there would still be two sources, one of
     them silent and situational.

     `rodLength` HERE IS THE ROD-ADD CADENCE — how much hole a run makes
     between connections — and `0` means the method has no connection beat at
     all. In `data.js` the same field name is the LENGTH OF THE STRING ELEMENT.
     For most methods those are the same number and must agree; for CFA,
     cable-tool and the rest they are legitimately different, which is exactly
     why the mechanism that keeps them honest has to be a CHECK that can carry
     the exemptions (`tools/checkdata.mjs`) and not a shared import that
     cannot. That check should FAIL the build, not warn: every divergence it
     has caught so far has been a defect, including a 28.5 m stand that cannot
     be made out of Range 2 pipe.
     ═════════════════════════════════════════════════════════════════════ */
  methods: {
    auger: {
      // 1.5 m is the flighted section this method actually adds — game/data.js
      // METHODS carries it, sourced from research/13. The 3 here was a guess.
      name: 'Auger', kind: 'auger', rodLength: 1.5, ropMax: 70,
      K: 73.5, wobExp: 0.35, rpmExp: 0.85, ucsExp: 0.60, ucsFloor: 1.2,
      softFloorUcs: 0, softEffMin: 1, rockCeilingUcs: 8,   // torque-limited, dies in rock
      optWob: 0.45, optRpm: 0.80, optFlush: 0.35,
      flushIsSpoil: true,                                   // "flush" = spoil-clearing cycles
      flushRopCost: 0.25,                                   // cleaning cycles cost penetration
      torque: { base: 0.10, wob: 0.55, cut: 0.85, abr: 0.30, depth: 0.075, wear: 0.10 },
      wearMul: 0.7, heatMul: 0.5, flushK: 0.55, erodeK: 0.4,
      bandMul: 1.15, driftMul: 0.8, casing: false, impact: 'grind',
      bitKinds: ['auger', 'drag'],
    },
    'cable-tool': {
      /* A SPUDDER: a winch, a wire rope, a chisel and a bailer. There is no
         drill string, so there is nothing to thread on and NO ROD ADD. What
         the cadence actually is, is the BAILING RUN — you spud for a while,
         then pull the tool and run the bailer to lift the cuttings and the
         slurry out. `rodLength` here is that cadence, not a rod, and nothing
         player-facing may call it one. */
      name: 'Cable-tool', kind: 'percussive', rodLength: 3.0, ropMax: 4, timeMul: 3.0,
      hasDrillString: false, rodAddKind: 'bail',
      K: 62, ucsExp: 0.55, ucsFloor: 8, softFloorUcs: 0, softEffMin: 1,
      blowHz: [0.6, 1.3], rateFromFlush: false, energyFromFlush: false,
      optWob: 0.60, wobSigma: 0.30, wobStallK: 1.20, optRpm: 0.75, optFlush: 0.55,
      mustBail: true,                                       // cuttings only leave by bailing
      torque: { base: 0.08, wob: 0.20, cut: 0.60, abr: 0.12, depth: 0.030, wear: 0.08 },
      wearMul: 0.6, heatMul: 0.3, flushK: 0.25, erodeK: 0.3,
      bandMul: 1.30, driftMul: 0.6, casing: true, impact: 'drop',
      bitKinds: ['chisel', 'drag'],
    },
    'top-hammer': {
      // 3.66 m is the real T38/T45 rod length, and it is what the rod items in
      // the shop are named after — a 3 m step here would visibly disagree with
      // the tool the player actually bought.
      name: 'Top hammer', kind: 'percussive', rodLength: 3.66, ropMax: 60,
      K: 54.2, ucsExp: 0.72, ucsFloor: 30, softFloorUcs: 25, softEffMin: 0.30,
      blowHz: [30, 55], rateFromFlush: false, energyFromFlush: false,
      optWob: 0.42, wobSigma: 0.19, wobStallK: 1.50, optRpm: 0.82, optFlush: 0.60,
      depthEnergyRef: 25,                                   // energy lost down the rod string
      torque: { base: 0.06, wob: 0.28, cut: 0.44, abr: 0.30, depth: 0.075, wear: 0.20 },
      wearMul: 1.15, heatMul: 1.0, flushK: 0.95, erodeK: 0.8,
      bandMul: 0.95, driftMul: 1.1, casing: false, impact: 'hammer',
      bitKinds: ['button', 'cross'],
    },
    dth: {
      name: 'DTH', kind: 'percussive', rodLength: 6, ropMax: 55,
      K: 57, ucsExp: 0.72, ucsFloor: 30, softFloorUcs: 25, softEffMin: 0.35,
      blowHz: [14, 26], rateFromFlush: true, energyFromFlush: true,  // air drives the hammer
      indexMatch: true, indexSigma: 0.22,                   // rotation must match the blow rate
      indexBase: 0.25, indexPerAir: 0.55,
      optWob: 0.45, wobSigma: 0.20, wobStallK: 1.55, optRpm: 0.55, optFlush: 0.72,
      airDepthDemand: 0.0032,                               // extra air per metre of annulus
      torque: { base: 0.06, wob: 0.30, cut: 0.42, abr: 0.26, depth: 0.055, wear: 0.18 },
      wearMul: 1.0, heatMul: 0.85, flushK: 1.0, erodeK: 0.9,
      bandMul: 1.0, driftMul: 1.0, casing: false, impact: 'hammer',
      bitKinds: ['dth', 'button'],
    },
    overburden: {
      name: 'Overburden / duplex', kind: 'percussive', rodLength: 3, ropMax: 40,
      K: 41, ucsExp: 0.72, ucsFloor: 30, softFloorUcs: 15, softEffMin: 0.55,
      blowHz: [14, 24], rateFromFlush: true, energyFromFlush: true,
      indexMatch: true, indexSigma: 0.26, indexBase: 0.25, indexPerAir: 0.55,
      optWob: 0.48, wobSigma: 0.22, wobStallK: 1.45, optRpm: 0.58, optFlush: 0.75,
      airDepthDemand: 0.0034, casingFollows: true,          // casing advances with the bit
      torque: { base: 0.10, wob: 0.34, cut: 0.46, abr: 0.34, depth: 0.085, wear: 0.20 },
      wearMul: 1.35, heatMul: 0.9, flushK: 1.0, erodeK: 0.5,
      bandMul: 1.05, driftMul: 0.95, casing: true, impact: 'hammer',
      bitKinds: ['ring', 'dth', 'button'],
    },
    core: {
      name: 'Core / wireline', kind: 'core', rodLength: 3, ropMax: 22, timeMul: 1.8,
      K: 1150, wobExp: 0.45, rpmExp: 1.0, ucsExp: 0.80, ucsFloor: 5,
      softFloorUcs: 3, softEffMin: 0.45,
      optWob: 0.30, optRpm: 0.85, optFlush: 0.78,
      flushCritical: 0.45,                                  // below this the diamonds burn
      flushBurnHeat: 2.4, flushBurnWear: 3.0,
      coreRun: 3.0,                                         // metres per inner-tube retrieval
      torque: { base: 0.05, wob: 0.22, cut: 0.55, abr: 0.20, depth: 0.045, wear: 0.26 },
      wearMul: 0.85, heatMul: 1.4, flushK: 1.05, erodeK: 0.6,
      bandMul: 0.85, driftMul: 1.15, casing: false, impact: 'grind',
      bitKinds: ['core', 'diamond'],
    },
    'rotary-kelly': {
      name: 'Rotary / Kelly', kind: 'rotary', rodLength: 4, ropMax: 60,
      K: 993, wobExp: 0.90, rpmExp: 0.65, ucsExp: 0.85, ucsFloor: 6,
      softFloorUcs: 0, softEffMin: 1, rockCeilingUcs: 140,
      optWob: 0.62, optRpm: 0.45, optFlush: 0.50,
      torque: { base: 0.12, wob: 0.62, cut: 0.70, abr: 0.28, depth: 0.090, wear: 0.16 },
      wearMul: 0.9, heatMul: 0.7, flushK: 0.8, erodeK: 0.7,
      bandMul: 1.10, driftMul: 0.85, casing: true, impact: 'grind',
      bitKinds: ['tricone', 'drag', 'auger', 'bucket'],
    },
    cfa: {
      name: 'CFA', kind: 'auger', rodLength: 0, ropMax: 75,        // continuous — no rod adds
      K: 88, wobExp: 0.30, rpmExp: 0.90, ucsExp: 0.62, ucsFloor: 1.4,
      softFloorUcs: 0, softEffMin: 1, rockCeilingUcs: 12,
      optWob: 0.40, optRpm: 0.85, optFlush: 0.30, flushIsSpoil: true, flushRopCost: 0.18,
      torque: { base: 0.14, wob: 0.60, cut: 0.95, abr: 0.32, depth: 0.100, wear: 0.10 },
      wearMul: 0.7, heatMul: 0.5, flushK: 0.5, erodeK: 0.35,
      bandMul: 1.20, driftMul: 0.9, casing: false, impact: 'grind',
      bitKinds: ['auger', 'drag'],
    },
    'cased-cfa': {
      name: 'Cased CFA', kind: 'auger', rodLength: 0, ropMax: 55,
      K: 66, wobExp: 0.30, rpmExp: 0.88, ucsExp: 0.62, ucsFloor: 1.4,
      softFloorUcs: 0, softEffMin: 1, rockCeilingUcs: 14,
      optWob: 0.44, optRpm: 0.80, optFlush: 0.32, flushIsSpoil: true, flushRopCost: 0.18,
      casingFollows: true,
      torque: { base: 0.18, wob: 0.66, cut: 0.95, abr: 0.36, depth: 0.115, wear: 0.10 },
      wearMul: 0.8, heatMul: 0.55, flushK: 0.5, erodeK: 0.25,
      bandMul: 1.15, driftMul: 0.9, casing: true, impact: 'grind',
      bitKinds: ['auger', 'drag'],
    },
    hdd: {
      // 4.6 m is the real HDD pipe length, it is what METHODS in game/data.js
      // says, and it is what both rod items in the shop are named after
      // (`hdd-pipe-2875`, `hdd-pipe-hdx-hd`). The 3 m here disagreed with all
      // three, and on a bore measured in hundreds of metres the player stood
      // through half again as many connections as the pipe they bought has.
      /* AND IT IS SOLD BY THE HUNDRED METRES. With no `timeMul` at all, a
         300 m bore — the SMALLEST the board issues once the player has held
         the method for a couple of levels — was a 31 minute session and a
         600 m one was 71, because the clock was authored as if the contract
         were a 50 m one. The connection is not a hand-threaded rod either: the
         rig has a rod magazine and erector feeding one rod at a time
         (research/07-hdd-trenchless.md §D2), which is why it is quick, the
         same reason `oil-rotary` gives for its iron roughneck. */
      name: 'HDD', kind: 'rotary', rodLength: 4.6, ropMax: 45, timeMul: 4,
      rodAddSecMul: 0.5,
      K: 760, wobExp: 0.55, rpmExp: 0.80, ucsExp: 0.82, ucsFloor: 4,
      softFloorUcs: 0, softEffMin: 1, rockCeilingUcs: 120,
      optWob: 0.38, optRpm: 0.70, optFlush: 0.80,
      // A product pipe that has gone tight on the pullback is worked for hours
      // before anyone talks about abandoning it, and freeing it and pulling on
      // cleanly buys the clock back at the rate it was spent.
      jamWarnSec: 30, jamLoseSec: 45, jamForgive: 1.0,
      flushCritical: 0.40, flushBurnHeat: 1.6, flushBurnWear: 1.8,  // mud motor needs flow
      /* ── TWO PASSES, AND THE SECOND ONE RUNS BACKWARDS ─────────────────
         The pilot is a fraction of the work. Stage 1 backreams to the product
         diameter and pulls the pipe home, and on that pass the constraint is
         PULL FORCE, not rate — a stuck product pipe loses the job. The
         contract's target is BORE LENGTH, not depth, on both passes. */
      completeOnProgramme: true,
      stages: [
        { id: 'pilot', name: 'Pilot bore', reverse: false },
        { id: 'pullback', name: 'Backream & pullback', reverse: true,
          /* Measured, the 0.55 was pulling the pipe home at 0.61 m/min — the
             very top of the band below — and doing it FASTER in player time
             than the pilot bore, because the pullback drains the annulus the
             pilot has to carry and holds a flat optimum where the pilot's is
             clamped for torque headroom. A backream at a larger diameter is
             not quicker than the pilot that made the hole. 0.36 puts it at
             about 0.39 m/min, mid-band, and a shade longer than the pilot. */
          ropMul: 0.36,         // 0.30-0.61 m/min on the product pipe
          gauge: { axis: 'pull', label: 'PULL', unit: '', max: 1.25 },
          flushOff: false,      // mud is what makes the pullback possible at all
          optWob: 0.45,         // pull force, not thrust — the opposite end of the string
          pullBase: 0.15, pullPerHard: 0.16, pullPerRate: 0.45,
          pullPerLoad: 0.35,    // the annulus is what the product pipe has to come through
          pullPerUnstable: 0.12,
          loadDrain: 0.30,      // the mud is already in the hole and already carrying
          stallAt: 1.00,
          // The consumable story here is the pipe, not the head: a backreamer
          // in the sedimentary ground an HDD bore is sold into (game/data.js
          // `validGround` tops out at limestone) is barely worked. `cutterPerM`
          // is gone — it was a second wear counter running beside `stepWear`,
          // which already charges the head per metre with the abrasivity, the
          // heat and the carbide grade in it. `wearMul` is the rate knob now.
          wearMul: 0.9, pullPerCutter: 0.08, cutterChangeSec: 8.0,
        },
      ],
      /* HDD IS MEASURED IN BORE LENGTH, AND THE BOARD ISSUES 50 TO 1,200 m OF
         IT (game/data.js `depthRange`). `torque.depth` is charged per
         `T.torque.depthRef` = 30 m of string, so the 0.105 this method carried
         — a coefficient authored on the shallow vertical-hole scale, where
         every other value near it belongs — put 0.42 of drag torque on the
         gauge at 120 m and 1.40 at 400 m, ON ITS OWN, against a rig limit of
         1.0. A competent steering policy could not reach 200 m of a 400 m
         bore: the needle sat over the limit whatever the driller did, banked
         `fatiguePerOverTorque` for a mistake nobody made, and parted the
         string. That is the same fault raise-boring's `wob` had, in the same
         place, for the same reason, and the fix is the same one — the gauge is
         normalised to the RIG's limit, so the coefficient has to be the
         machine the method actually is over the range it is actually sold in.
         `rc` (300-400 m holes) carries 0.012 and `oil-rotary` (2,000 m)
         carries 0.0035; 0.009 puts HDD between them, which is where a bore
         measured in hundreds of metres belongs: 0.04 at 120 m, 0.12 at 400 m,
         0.36 at the 1,200 m top of the range. */
      torque: { base: 0.09, wob: 0.44, cut: 0.80, abr: 0.30, depth: 0.009, wear: 0.18 },
      wearMul: 1.0, heatMul: 0.9, flushK: 1.15, erodeK: 1.2,
      bandMul: 0.90, driftMul: 1.2, casing: false, impact: 'grind',
      bitKinds: ['pdc', 'tricone', 'drag'],
    },
    sonic: {
      name: 'Sonic', kind: 'sonic', rodLength: 3, ropMax: 65,
      K: 300, wobExp: 0.30, rpmExp: 0, ucsExp: 1.0, ucsFloor: 1.8,
      softFloorUcs: 0, softEffMin: 1,
      resonanceCentre: 0.62, resonanceSigma: 0.12,          // a narrow resonance peak on rpm
      optWob: 0.40, optRpm: 0.62, optFlush: 0.45,
      torque: { base: 0.14, wob: 0.36, cut: 0.55, abr: 0.22, depth: 0.070, wear: 0.12 },
      wearMul: 0.75, heatMul: 2.0, flushK: 0.7, erodeK: 0.5,  // the head is heat-limited
      bandMul: 0.85, driftMul: 1.25, casing: false, impact: 'vibe',
      bitKinds: ['sonic', 'core', 'drag'],
    },
    anchor: {
      name: 'Anchor / micropile', kind: 'percussive', rodLength: 3, ropMax: 35,
      K: 44, ucsExp: 0.70, ucsFloor: 25, softFloorUcs: 10, softEffMin: 0.6,
      blowHz: [20, 38], rateFromFlush: false, energyFromFlush: false,
      optWob: 0.50, wobSigma: 0.22, wobStallK: 1.40, optRpm: 0.78, optFlush: 0.55,
      sacrificialBit: true,                                 // the bit stays in the ground
      torque: { base: 0.08, wob: 0.32, cut: 0.50, abr: 0.36, depth: 0.070, wear: 0.22 },
      wearMul: 1.6, heatMul: 1.0, flushK: 0.85, erodeK: 0.7,
      bandMul: 1.0, driftMul: 1.05, casing: false, impact: 'hammer',
      bitKinds: ['sda', 'button', 'cross'],
    },
    'raise-boring': {
      /* ── THE CLOCK, AND WHY THE CONNECTION IS NOT A BEAT ────────────────
         A raise is 30 to 600 m (game/data.js), it is drilled twice, and the
         way back is the slow half: at `timeMul: 2.5` a 70 m raise — under the
         SMALLEST job the board issues at unlock — ran 31 minutes and a 155 m
         one 76, with the ream four times the pilot. That is the engineering
         being right and the session being wrong: 5 m/h down and 2 m/h up is
         what a raise borer does, and 20 downhole hours is 8 player hours at
         2.5. At 20 the same run is 4 minutes and 11, and the top of the range
         is a long job rather than an impossible one.

         The stem is 1.5 m and it stays 1.5 m, so at this clock a connection
         comes round every 0.8 player seconds and CANNOT be a timed beat — the
         player would do nothing else. It goes where longhole's 159 connections
         went: into the compressed clock, counted and charged, not played. The
         beat the pass actually has is the cutter change, which is the decision
         that belongs to this method anyway. */
      name: 'Raise boring', kind: 'rotary', rodLength: 1.5, ropMax: 8, timeMul: 20,
      rodAddBeat: false,
      K: 380, wobExp: 0.85, rpmExp: 0.50, ucsExp: 0.80, ucsFloor: 20,
      softFloorUcs: 0, softEffMin: 1,
      optWob: 0.70, optRpm: 0.35, optFlush: 0.55,
      jamWarnSec: 30, jamLoseSec: 45, jamForgive: 1.0,
      /* ── TWO PASSES, AND THE SECOND ONE RUNS BACKWARDS ─────────────────
         Stage 0 drills the pilot DOWN from the upper level. Stage 1 pulls the
         reamer head UP from the lower level, and everything changes with it:
         the gauge stops being torque and becomes PULL FORCE, gravity does the
         mucking so there is nothing to flush, cutters are changed from below,
         and reaming too fast stalls the head instead of going faster. */
      completeOnProgramme: true,
      stages: [
        { id: 'pilot', name: 'Pilot bore', reverse: false },
        { id: 'ream', name: 'Ream up', reverse: true,
          /* THE MULTIPLIER IS NOT THE WHOLE RATIO. The stage's own `optWob` is
             0.45 against the pilot's 0.70, and rate goes as wob^0.85, so 0.32
             here actually reamed at 0.22 of the pilot — about 1.1 m/h, under
             the 1-3 m/h a raise borer really reams a raise at, and it made the
             way up FIVE TIMES the pilot in player time on a short job. 0.50
             lands the effective ratio at 0.35 (about 1.7 m/h) and the pass at
             two-and-a-half to three times the pilot, which is the shape the
             method wants: the way up is the job, not the whole session. */
          ropMul: 0.50,         // a reamer head is a far larger face than the pilot bit
          gauge: { axis: 'pull', label: 'PULL', unit: '', max: 1.25 },
          flushOff: true,       // GRAVITY MUCKS A RAISE. There is nothing to circulate.
          /* … and because there is nothing to circulate, there is nothing
             cooling the head either, so the heat model's only coolant is gone
             and the bit pegged at 1.00 for the whole pass. It is the right
             model for a bit in a dry hole and the wrong one for a 1.8 m reamer
             turning at a few rpm with the muck falling clear of it. The head
             on the way up is a torque-and-pull problem, not a thermal one. */
          heatMul: 0.10,
          optWob: 0.45,         // the pull a raise borer holds on the way up — far less than
                                // the thrust it leaned on driving the pilot down
          pullBase: 0.12,       // pull on an easy head in a clean hole ...
          pullPerHard: 0.16,    // ... plus the rock the cutters are actually breaking
          pullPerRate: 0.45,    // ... plus how hard the head is being hauled into it
          pullPerLoad: 0.20,    // ... plus muck that has not fallen away below it
          pullPerUnstable: 0.10,// ... plus a hole that is closing on the head
          stallAt: 1.00,        // pull past this and the head stalls
          /* `cutterPerM` is gone. It was a SECOND wear counter running beside
             `stepWear`, which already charges the head per metre reamed with
             the abrasivity, the heat, the carbide grade and the Toolsmith
             skill in it — so the pass had two thresholds, two budgets and two
             ways to pay for one object, and a change reset one and left the
             other. The cutters ARE the wear part of the head; `wearMul` is how
             fast a 1.8 m reamer face eats a set against the pilot bit. */
          wearMul: 1.3,
          pullPerCutter: 0.10,  // ... and a worn set is heavier to haul into the face,
                                // which is the tell that sends the crew up to change it
          cutterChangeSec: 6.0, // and they are changed FROM BELOW: a real time cost
        },
      ],
      /* A raise borer is built around high thrust and low speed, and the gauge
         is normalised to the rig's own limit — so `wob: 0.70` against an
         `optWob` of 0.70 had the method reading 1.2 while doing exactly what it
         is designed to do, pegging the needle, banking rod fatigue and parting
         the string for no mistake anyone made. The coefficients are the machine
         the method actually is. */
      /* And `depth` is the same argument a second time. A raise is 30 to 600 m
         (game/data.js `depthRange`), and 0.060 charged per 30 m of stem put
         0.60 of drag on the gauge at 300 m — enough, with the base and the
         wall friction, that `optimalNow()` had to clamp the weight to its
         floor and the pilot simply stopped. A competent policy could not reach
         312 m of a 378 m raise. 0.018 puts 0.36 there at the 600 m top of the
         range: heavy, which is honest for 400 stems of stem, and drillable. */
      torque: { base: 0.16, wob: 0.48, cut: 0.60, abr: 0.30, depth: 0.018, wear: 0.20 },
      wearMul: 1.1, heatMul: 0.8, flushK: 0.9, erodeK: 0.4,
      bandMul: 1.05, driftMul: 0.7, casing: false, impact: 'grind',
      bitKinds: ['tricone', 'reamer', 'pdc'],
    },
    'oil-rotary': {
      /* 27.0 m, NOT 28.5. A stand is three joints of Range 2 pipe and a Range 2
         joint is 8.23-9.14 m, so 28.5 is a stand that cannot be made up out of
         the pipe it is made of. game/data.js was corrected at source and
         carries the reasoning; this is the sim following it. */
      name: 'Rotary / oil & gas', kind: 'rotary', rodLength: 27.0, ropMax: 70, timeMul: 36,
      K: 1500, wobExp: 1.0, rpmExp: 0.55, ucsExp: 0.85, ucsFloor: 5,
      softFloorUcs: 0, softEffMin: 1, rockCeilingUcs: 280,
      optWob: 0.48, optRpm: 0.46, optFlush: 0.62,

      /* ── the founder point ────────────────────────────────────────────
         Rate of penetration climbs with weight on bit until the bit cannot
         clear what it is cutting. Past that point more weight buys nothing:
         a milled-tooth bit balls up in the cuttings, a PDC stalls the motor,
         and the only thing still rising is the torque. `founderExp` below 1
         puts the peak of rop(wob) EXACTLY at the founder point, so the skill
         is creeping the weight up until the rate stops answering — and then
         backing off a shade. The point itself MOVES: clean the hole and it
         rises, foul the hole and it falls under your feet. */
      founderWob: 0.52,       // founder weight in a clean hole, before shifts
      founderExp: 0.75,       // < 1 so the peak sits on the founder point itself
      founderK: 1.5,          // how hard the rate falls away past it
      founderFloor: 0.28,     // it never quite reaches zero — you are still cutting
      founderClean: [0.70, 0.58], // founder = base * (a + b * hole cleanliness)
      founderOptFrac: 0.97,   // where a good driller parks: just under it
      ballingUcs: 14,         // below this UCS the formation is sticky …
      ballingSoftMul: 0.70,   // … and the bit balls up far earlier

      /* ── mud ──────────────────────────────────────────────────────────
         Cleaning does get harder with depth — a longer annulus holds more
         cuttings in suspension — but not on a 60 m scale, which is what the
         shallow methods use. And below `flushCritical` the bit is running in
         its own cuttings: it stops cooling and it stops cutting. */
      annulusRef: 1800,
      flushCritical: 0.30, flushBurnHeat: 1.5, flushBurnWear: 1.9,

      /* ── trips: the economics of the method ───────────────────────────
         One stand is three joints of Range 2 pipe. A bit change at 1,800 m is
         sixty-three stands out and sixty-three back, and that is the number
         you weigh against a bit you cannot see. */
      // A stuck string at 2,000 m is worked for hours before anyone talks about
      // abandoning the hole, and freeing it is most of what a driller does. The
      // global 26 s fuse is right for a 40 m water bore and wrong here.
      jamWarnSec: 30, jamLoseSec: 48,
      // A well is ten times the run a water bore is, and it takes ten times the
      // ordinary binding on the way down. Freeing the string and drilling ahead
      // cleanly buys the stuck clock back at the rate it was spent, so the hole
      // is lost only to a string that will not come free — never to the sum of
      // six episodes the driller handled correctly.
      jamForgive: 1.0,
      tripSecPerRod: 0.46,
      rodAddSecMul: 0.40,     // a connection with an iron roughneck is quick
      rodAddKind: 'stand',
      bitBudget: 2.4,         // bits a par well is expected to eat
      hazardScale: 0.05,      // per-metre hazard rates, at oil-well depth scale

      /* ── the reference well par is scored against ──────────────────────
         The global reference in TUNING.score.par describes a shallow hole
         held in the band almost continuously with a clean annulus. A well is
         not that hole. The band chases a cuttings load that swings with every
         formation (`bandLoadFollow` above), the annulus over a kilometre of
         open hole is never as clean as the reference assumes, and a bit whose
         wear you cannot see gets run well past half-worn — because tripping
         early to look at it costs more than drilling dull. Par has to be the
         well a good driller actually gets, or every well grades C for doing
         the job correctly. */
      par: {
        combo: 1.25,          // the groove a driller holds against a moving band
        load: 0.20,           // cuttings a kilometre of annulus genuinely carries
        returns: 0.78,        // returns are never quite 100 % over that length
        heat: 0.12,           // mud is a far better coolant than air or water
        torque: 0.58,         // where the needle sits on a well being drilled right
        wearMid: 0.64,        // the bit is run to the trip, not to half-worn
        tripDepthFrac: 0.62,  // the changes that matter are the late, deep ones
      },

      /* ── what only this method has ─────────────────────────────────── */
      wellControl: true,      // mud weight, pore pressure, kicks, kill circulations
      blindWear: true,        // the wear gauge is an ESTIMATE until you trip out
      bearings: true,         // a tricone dies at the bearings, not just the teeth
      twistOff: true,
      diffStick: true,
      thiefZones: true,

      torque: { base: 0.11, wob: 0.52, cut: 0.74, abr: 0.26, depth: 0.0035, wear: 0.20 },
      wearMul: 1.35, heatMul: 0.75, flushK: 1.05, erodeK: 1.25,
      bandMul: 0.92, driftMul: 0.95, casing: true, impact: 'grind',
      bandLoadFollow: 0.75,   // the annulus load swings hard with the formation
      bitKinds: ['tricone', 'pdc', 'drag'],
    },
    /* ═══════════════════════════════════════════════════════════════════
       rc — REVERSE CIRCULATION
       Dual-wall pipe: air down the annulus, the sample up the sealed inner
       tube to a cyclone and a splitter, one bag per metre. Three to four times
       the metres of core at a quarter of the sample quality — and the failure
       mode is never the hole. You can drill a perfect-looking hole and deliver
       nothing, because what you are selling is the bag, not the metre.
       ═══════════════════════════════════════════════════════════════════ */
    rc: {
      // 3 m of dual-wall pipe, per game/data.js METHODS.
      name: 'Reverse circulation', kind: 'percussive', rodLength: 3, ropMax: 55, timeMul: 4.0,
      K: 54, ucsExp: 0.72, ucsFloor: 30, softFloorUcs: 18, softEffMin: 0.42,
      blowHz: [14, 26], rateFromFlush: true, energyFromFlush: true,  // the air drives the hammer
      indexMatch: true, indexSigma: 0.24, indexBase: 0.25, indexPerAir: 0.55,
      optWob: 0.44, wobSigma: 0.20, wobStallK: 1.55, optRpm: 0.55, optFlush: 0.78,
      airDepthDemand: 0.00045,  // the inner tube is sealed, so the air demand climbs far more
                                // slowly with depth than an open-hole DTH annulus does
      annulusRef: 220,          // hole cleaning at RC's 300-400 m working depth
      hazardScale: 0.30,        // per-metre hazard rates, at that same depth scale
      suppressHazards: ['water'], // crossing the water table in RC is not a hole event.
                                  // It is a SAMPLE event, and it has its own hazard.
      rodAddSecMul: 0.80,       // a dual-wall rod handler makes a joint quickly
      bitBudget: 0.85,          // RC drills a hole a day; one bit does not do it
      jamWarnSec: 22, jamLoseSec: 34,
      torque: { base: 0.06, wob: 0.30, cut: 0.40, abr: 0.28, depth: 0.012, wear: 0.18 },
      wearMul: 1.05, heatMul: 0.85, flushK: 1.05, erodeK: 0.7,
      bandMul: 1.0, driftMul: 1.0, casing: false, impact: 'hammer',
      bandLoadFollow: 0.45,     // the annulus load swings with the formation over 300 m
      bitKinds: ['rc', 'dth', 'button'],
      gauge: { axis: 'torque', label: 'TORQUE', unit: '', max: 1.25 },
      /* The score is sample recovery and contamination. Metres are what you are
         paid for; the bag is what you are judged on, and they are not the same. */
      score: { weights: { time: 0.10, groove: 0.14, bit: 0.08, straight: 0.04,
                          hazard: 0.10, safety: 0.08, quality: 0.46 } },
      sample: {
        intervalM: 1.0,         // one bag per metre — the standard exploration interval
        targetKgPerM: 2.5,      // the representative split off the splitter, 2-3 kg/m
        massSigma: 0.18,        // natural scatter of the split, as a fraction of the target
        // Recovery is rated statistically, by standard deviations from the mean
        // sample mass — and a sample that is TOO HEAVY is as suspect as one that
        // is too light, because the extra rock is caving or carry-over.
        highSd: 1.0,            // within this many SD of the mean: high confidence
        contamSd: 2.0,          // above mean + this: unreliable, flagged as contamination
        lossSd: 3.0,            // below mean - this: unacceptable loss
        recoveryPerAir: 0.62,   // recovery carried by the air holding the bit face
        recoveryFloor: 0.30,    // ... and what a badly-run hole still delivers
        holdUpToBag: 1.00,      // how much of the tube's hold-up ends up in the NEXT bag.
                                // At 1.0 an uncleared metre arrives whole in its successor,
                                // which is what makes an over-heavy bag the tell it really is
        holdUpGen: 0.34,        // hold-up in the inner tube per second at the reference ROP
        holdUpRopRef: 30,       // reference ROP (m/h) for hold-up generation
        holdUpClear: 0.50,      // hold-up cleared per second at full air
        caveGen: 0.26,          // caved wall rock entering the sample per second, unstable hole
        contamFromCave: 0.90,   // contamination per unit of caved material in the bag
        wetRecoveryCut: 0.35,   // recovery lost at a fully wet sample
        trainWearPerM: 0.0022,  // ceramic sample train consumed per metre at abrasivity 1
        trainChokeAt: 0.80,     // train wear above which the cyclone starts choking
        gradeCutoff: 0.35,      // grade above which the interval is economic
        assayFloor: 0.30,       // sample quality below which the interval is not assayable
        blowDownEveryM: 8,      // metres between the blow-downs a competent driller makes.
                                // PAR HAS TO CONTAIN THEM, or doing the job properly is a
                                // time penalty and the scoring quietly rewards skipping it.
      },
    },

    /* ═══════════════════════════════════════════════════════════════════
       tunnel-jumbo — DRILL & BLAST FACE DRILLING
       A pattern game. You drill a round of many holes to a design, and
       ACCURACY, NOT SPEED, decides the pull and the overbreak. The score was
       settled before the round was fired. Bad ground does not slow the drill —
       it SHORTENS THE ROUND, and the weekly advance falls with it.
       ═══════════════════════════════════════════════════════════════════ */
    'tunnel-jumbo': {
      // timeMul 12: the sourced cycle is 4-5 h of drilling, charging and
      // blasting on a 100 m2 face, and a round of 140 holes is 670 m of hole.
      // Compressed at 48 x 12 the drilling is about 25 s and a whole round —
      // cut, stoping, lifters, contour, charge, fire, muck — is about 70, so a
      // tunnel contract is a handful of rounds and a session stays a session.
      name: 'Drill & blast (face)', kind: 'percussive', rodLength: 0, ropMax: 180, timeMul: 12.0,
      K: 105, ucsExp: 0.72, ucsFloor: 30, softFloorUcs: 20, softEffMin: 0.5,
      blowHz: [40, 68], rateFromFlush: false, energyFromFlush: false,  // a hydraulic drifter
      optWob: 0.46, wobSigma: 0.20, wobStallK: 1.50, optRpm: 0.85, optFlush: 0.62,
      depthEnergyRef: 14,       // one-pass drill steel. The blow decays a little down 4.8 m of
                                // rod, but there are no couplings in it to lose energy at,
                                // which is exactly why the round length is the steel length
      stabilityRopImmune: true, // BAD GROUND SHORTENS THE ROUND, IT DOES NOT SLOW THE DRILL
      stringFromHole: true,     // the string is one 4.8 m steel, not the whole chainage
      hazardScale: 0.10,        // the face is rock; the generic borehole hazards are rare here
      suppressHazards: ['boulder', 'collapse'],
      /* Par has to be the round a good jumbo hand actually gets. 670 m of hole
         per round means the bit spends most of the round past half-worn — you
         change it between rounds, not the moment the gauge dips — and the band
         on a face that changes every hole is not held the way it is held in a
         50 m water bore. Anything without an override here keeps the numbers
         it had before. */
      par: { wearMid: 0.62, combo: 1.30 },
      bitBudget: 2.8,           // a round of 140 holes is 670 m of hole. A button bit does
                                // 200-250 m of granite, so a round eats about three of them
                                // and the bit line is a real cost centre, not a rounding error
      tripSecPerRod: 0.05,      // "tripping" a jumbo is pulling one 4.8 m steel off the face
      torque: { base: 0.07, wob: 0.30, cut: 0.42, abr: 0.32, depth: 0.030, wear: 0.22 },
      wearMul: 0.95, heatMul: 1.0, flushK: 1.0, erodeK: 0.35,
      bandMul: 0.92, driftMul: 1.1, casing: false, impact: 'hammer',
      bitKinds: ['button', 'cross'],
      gauge: { axis: 'torque', label: 'TORQUE', unit: '', max: 1.25 },
      /* Pull 30 %, overbreak 25 %, half-barrel 20 %, collar + alignment 15 %,
         cycle time 10 % — speed is deliberately the LAST term. */
      score: { weights: { time: 0.10, groove: 0.08, bit: 0.06, straight: 0.00,
                          hazard: 0.08, safety: 0.06, quality: 0.62 } },
      round: {
        faceAreaM2: 100,        // reference face area; a contract may name its own
        holesPerM2: 1.4,        // about 140 holes on a 100 m2 section
        booms: 2,               // a twin-boom jumbo drills two holes at once
        // Round length is set by the ground class, not by the driller.
        lengthGood: 4.8,        // competent rock: 4.5-5.0 m on 18 ft steels
        lengthFair: 3.0,        // bolting at the face
        lengthPoor: 2.7,        // 6 m spiles force the round down to 2.5-3.0 m
        stabGood: 0.68, stabFair: 0.36,   // stability bands the three lengths sit in
        cutFrac: 0.10,          // the cut: 8-16 holes of a 140-hole round
        contourFrac: 0.22,      // the perimeter — the shape of the finished tunnel
        lifterFrac: 0.10,       // the floor holes, the most heavily charged
        alignSpecPct: 6.0,      // general alignment tolerance, % of hole depth
        cutAlignPct: 1.5,       // the cut needs about a quarter of the general allowance
        collarSpecM: 0.10,      // collaring accuracy against the theoretical pattern
        collarWindowM: 0.35,    // metres of hole over which the collar is still being made
        devDegPerM: 0.85,       // degrees of hole deviation per metre of hole, per unit of
                                // off-optimal feed in hard rock. Calibrated on the sourced
                                // arithmetic: a steady hand (0.10 off) banks 0.8 deg over a
                                // 4.8 m round — a 0.066 m toe offset, comfortably inside the
                                // burden — and a heavy hand (0.30 off) banks 2.4 deg, a
                                // 0.20 m offset, which loses the cut and survives the stoping.
        /* THE CUT BURDEN — the number that makes the cut unforgiving. On a
           76 mm relief hole the first burden is 0.113 m, and over a 2.85 m hole
           a 3 degree deviation moves the toe 0.149 m: MORE THAN THE WHOLE
           BURDEN. The hole either collides with the relief hole or misses its
           influence entirely, and a cut that does not open freezes the round.

           A longer round is drilled to a larger relief hole, and the second
           sourced pair says what that buys: 115 mm gives a 0.182 m burden. So
           the burden is interpolated between the two measured cuts rather than
           pinned at the short-round figure, because pinning it would make a
           5 m Norwegian round impossible for a reason no driller would accept. */
        cutBurdenM: 0.113,      // 76 mm relief hole, at a 2.85 m round ...
        cutBurdenLongM: 0.182,  // ... and 115 mm relief at a 5.0 m round
        cutBurdenShortRoundM: 2.85,
        cutBurdenLongRoundM: 5.0,
        /* The cut is drilled far more slowly than the rest of the face, and
           that is not a game concession: collaring and alignment precision in
           the cut matters an order of magnitude more than anywhere else, and
           the operator spends the time accordingly. It is also what makes the
           cut the minigame the research says it is, rather than two seconds. */
        cutSlowdown: 6,
        contourSpacingM: 0.7,   // maximum contour hole spacing
        lookoutBaseM: 0.10,     // look-out allowance: 10 cm ...
        lookoutPerM: 0.03,      // ... plus 3 cm per metre of hole depth
        lookoutBand: [0.45, 1.00],       // the fraction of the allowance that is neither
                                         // underbreak nor overbreak
        contourChargeKgM: [0.25, 0.45],  // piped reduced-energy charge on the contour
        chargeRange: [0.10, 0.80],       // what the charging control can actually load
        chargeSec: 6.0,         // player seconds the charging beat runs
        fireSec: 3.0,           // the blast and the ventilation wait
        muckSecPerM: 1.6,       // mucking and scaling, per metre of advance
        pullGood: 0.90,         // pull on a round drilled to design
        pullFloor: 0.34,        // ... and on a round whose cut did not open: a choked round
        pullPerAlign: 0.55,     // pull lost per unit of mean alignment error over spec
        overbreakPerLookout: 0.85,  // overbreak per unit of look-out over the allowance
        overbreakPerCharge: 1.30,   // OVER-CHARGING COSTS: overloading the perimeter damages
                                    // the rock behind the line and adds scaling time
        scalePerOverbreak: 5.0, // extra player seconds of scaling per unit of overbreak
        halfBarrelBase: 0.88,   // half-casts surviving a well-drilled, correctly charged round
        halfBarrelPerCharge: 1.6,
        halfBarrelPerAlign: 0.9,
        boomSetupSec: 1.3,      // the boom-setup beat that opens each hole group; the ADVANCE
                                // control is sampled at the end of it as the group's AIM
        underbreakTrimSec: 5.0, // a trim blast: no rock may protrude inside the profile
        misfireSec: 7.0,        // a choked round leaves holes that did not fire. You wait.
      },
    },

    /* ═══════════════════════════════════════════════════════════════════
       longhole — UNDERGROUND PRODUCTION DRILLING
       Fans and rings out of a drill drive, upholes and downholes. The drill
       never sees the rock it is breaking, so DEVIATION IS THE ENEMY: a hole
       that wanders leaves ore standing or blasts waste into the muck. Scored
       on toe accuracy, explicitly not on rate.
       ═══════════════════════════════════════════════════════════════════ */
    longhole: {
      name: 'Longhole production', kind: 'percussive', rodLength: 1.525, ropMax: 38, timeMul: 5.2,
      K: 29, ucsExp: 0.72, ucsFloor: 30, softFloorUcs: 25, softEffMin: 0.35,
      blowHz: [28, 50], rateFromFlush: false, energyFromFlush: false,
      optWob: 0.40, wobSigma: 0.17, wobStallK: 1.65, optRpm: 0.80, optFlush: 0.66,
      depthEnergyRef: 18,       // a long, slender string: the blow decays down it
      stringFromHole: true,     // the string is as long as THIS hole, not the ring's total
      rodAddBeat: false,        // the rods still count up and the string still lengthens, but
                                // 159 connections in a ring is not a beat a player can play.
                                // The rod handling lives in the compressed clock; the beat the
                                // player DOES get is the feed cradle indexing to the next hole.
      hazardScale: 0.15,
      suppressHazards: ['boulder'],   // underground, in ore. There is no till up here.
      bitBudget: 1.4,
      blindDeviation: true,     // deviation is INVISIBLE while drilling and revealed when the
                                // hole is surveyed. You get cues, not a readout — because that
                                // is what a production driller actually has.
      torque: { base: 0.07, wob: 0.32, cut: 0.44, abr: 0.34, depth: 0.055, wear: 0.20 },
      wearMul: 1.20, heatMul: 0.95, flushK: 0.95, erodeK: 0.5,
      bandMul: 0.94, driftMul: 1.05, casing: false, impact: 'hammer',
      bitKinds: ['button', 'dth', 'cross'],
      gauge: { axis: 'torque', label: 'TORQUE', unit: '', max: 1.25 },
      score: { weights: { time: 0.08, groove: 0.10, bit: 0.06, straight: 0.04,
                          hazard: 0.08, safety: 0.06, quality: 0.58 } },
      ring: {
        holesPerRing: 11,       // a fan of 9-13 holes radiating from the drill drive
        holeLengthM: 22,        // 20-30 m fan holes are the worked example
        upholeFrac: 0.45,       // fraction of the fan drilled upward
        devSpecPct: 2.0,        // over 25 m, deviation past 2 % buys poor fragmentation,
                                // dilution, or a frozen stope
        oreHalfWidthM: 0.9,     // half-width of the ore lens at the toe: outside it is waste
        convergeM: 0.60,        // two toes closer than this risk dead-pressing each other
        designToeSpacingM: 2.2, // designed distance between adjacent toes out in the fan
        devPctPerM: 0.38,       // deviation, as % of hole depth, per metre of hole per unit of
                                // off-optimal feed in hard rock. A steady hand ends a 22 m hole
                                // at about 0.8 %; a heavy one at 4 %, which is twice the spec
                                // and half a metre of toe error out in the ore.
        indexSec: 2.6,          // the feed cradle rotating to the next hole in the fan
        indexWindowSec: 0.55,   // ... and the timing window on it
        blockChancePerM: 0.006, // downhole packing, per metre drilled — about one hole in
                                // eight over a 22 m downhole, which is a shift, not a plague
        whipChancePerM: 0.008,  // rod whip, per metre drilled
        upholeChancePerM: 0.012,// flush-back, per metre of uphole
        cuePerDev: 2.4,         // how strongly the feed-pressure cue reads the hidden deviation
        devPerWhip: 0.55,       // deviation banked by a whip event handled badly, in % of depth
      },
    },

    /* ═══════════════════════════════════════════════════════════════════
       rockbolt — GROUND SUPPORT
       Resin, grout and friction bolts. Scored on INSTALL QUALITY, never on
       bolts per hour: a bolter who installs sixty bad bolts has done worse
       than one who installs forty good ones, and the regulations agree.
       ═══════════════════════════════════════════════════════════════════ */
    rockbolt: {
      name: 'Ground support', kind: 'percussive', rodLength: 0, ropMax: 110, timeMul: 1.8,
      K: 70, ucsExp: 0.72, ucsFloor: 30, softFloorUcs: 15, softEffMin: 0.55,
      blowHz: [35, 60], rateFromFlush: false, energyFromFlush: false,
      optWob: 0.38, wobSigma: 0.18, wobStallK: 1.55, optRpm: 0.80, optFlush: 0.66,
      depthEnergyRef: 4,        // a 2.4 m hole: the string is one steel
      stringFromHole: true,     // ... and it never gets longer than that
      hazardScale: 0.08,
      suppressHazards: ['boulder', 'water'],
      bitBudget: 1.1,
      torque: { base: 0.07, wob: 0.30, cut: 0.40, abr: 0.34, depth: 0.020, wear: 0.24 },
      wearMul: 1.30, heatMul: 0.9, flushK: 0.95, erodeK: 0.4,
      bandMul: 1.0, driftMul: 1.0, casing: false, impact: 'hammer',
      bitKinds: ['bolt', 'button', 'cross'],
      gauge: { axis: 'torque', label: 'TORQUE', unit: '', max: 1.25 },
      score: { weights: { time: 0.08, groove: 0.08, bit: 0.06, straight: 0.04,
                          hazard: 0.08, safety: 0.08, quality: 0.58 } },
      bolt: {
        lengthM: 2.4,           // a 39 mm friction bolt runs 0.9-3.0 m; 2.4 m is the workhorse
        odMm: 39,               // nominal outside diameter of the split tube
        overdrillM: 0.05,       // the hole must be at least two inches longer than the bolt
        ringSpacingM: 1.5,      // rings of bolts along the drive
        perRing: 5,             // bolts per ring across the back and the shoulders
        // FRICTION BOLTS: THE HOLE MUST BE SMALLER THAN THE BOLT. Pull-out
        // strength falls monotonically as the bit gets bigger, and competent
        // rock is the MOST sensitive because there is almost no overbreak to
        // forgive the diameter — the hole really is the bit.
        bitMmIdeal: 33.0,       // 1.3 in for a 33 mm bolt; 1.5 in for a 39 mm bolt
        bitMmZero: 39.5,        // a hole this size leaves the slot unchanged: no anchorage
        competentUcs: 90,       // above this the hole is the bit diameter ...
        competentSensitivity: 1.6,  // ... so a diameter error costs this much more
        slotClosedIn: 0.0625,   // a slot closed by 1/16 in is full rock-to-metal contact
        gaugeWearMm: 2.2,       // gauge lost to a fully worn bit, in mm of hole diameter
        overbreakMm: 3.0,       // extra hole diameter broken ground gives you for free —
                                // and free diameter is the last thing a friction bolt wants
        devDegPerM: 1.35,       // hole crookedness per metre per unit of off-optimal feed.
                                /* MEASURED AND LOGGED, NOT CHARGED FOR. The research pack
                                   asserted in its own voice that "crooked or curved holes
                                   reduce capacity"; the Rocscience Split Set study it cited
                                   says the opposite in as many words — crooked or rough
                                   holes do not adversely affect a Split Set, they INCREASE
                                   the anchorage, because a friction bolt anchors by radial
                                   spring force and irregularity adds interference. The
                                   penalty this drove (`crookedPerDev`) is gone.
                                   It is NOT inverted into a bonus. That finding is about
                                   Split Sets; for a resin-grouted bar a varying annulus
                                   plausibly does hurt encapsulation, and "plausibly" is not
                                   a source. Hole DIAMETER is the sourced mechanic and it is
                                   untouched: `bitMmIdeal` 33.0 -> `bitMmZero` 39.5. */
        driveSecFull: 2.2,      // drive time for a fully anchored bolt — the drive time
                                // is itself the field tell, exactly as slot closure is
        spinSec: 1.4,           // resin: spin the bar through the cartridges for this long
        gelSec: 2.6,            // ... the resin gels here, and spinning past it shears the bond
        holdSec: 1.8,           // ... then hold, without turning, while it cures
        mixBand: [0.45, 0.75],  // PROTECT during the spin IS the resin/water mix ratio
        torqueBandKnm: [0.9, 1.4],  // the specified installation torque band
        /* THE SAMPLE RATE IS THE GAME'S, NOT A STATUTE'S. What is sourced is
           that torque testing is REQUIRED PRACTICE: 29 CFR 1926.800(o)(3)(iv)(A)
           — "torque wrenches shall be used wherever bolts that depend on
           torsionally applied force are used for ground support". It sets no
           numeric rate. The "first, every tenth, last — statutory" claim this
           line used to carry was not in the cited MSHA page nor in 30 CFR
           57.3360; the nearest real rate is 30 CFR 75.204(f), one in four,
           which is US underground COAL roof bolting and the wrong jurisdiction
           for a hard-rock method in a European game. Nothing user-visible may
           call this a statutory rate. */
        torqueTestEvery: 10,    // the crew's own sample: first, every tenth, and the last
        torqueTestSec: 2.2,     // player seconds a torque test costs
        torqueWindowSec: 4.5,   // ... and how long the player has to honour the sample
        plateSec: 0.9,          // plating the bolt up tight to the rock
        auditPenalty: 0.30,     // quality lost for every due torque test never taken
        inspectSec: 1.2,        // shining a light down the tube and reading the slot
        gapPenalty: 0.5,        // pattern score lost per missing bolt: a gap in the pattern
                                // is a hole in the roof
      },
    },

    /* ═══════════════════════════════════════════════════════════════════
       driven-pile — DRIVEN PILING
       NO ROTATION AND NO FLUSH. Hammer energy, blow rate and alignment, and
       the first two are coupled on a real hydraulic power hyperbola. Scored on
       driving to set — and the instrument can lie: a pile whose toe is
       brooming produces a beautiful set while it destroys itself. Only the
       depth into the bearing stratum tells the truth.
       ═══════════════════════════════════════════════════════════════════ */
    'driven-pile': {
      name: 'Driven piling', kind: 'impact', rodLength: 0, ropMax: 90, timeMul: 0.55,
      /* NO DRILL STRING — the second of the two, and this table only ever
         carried the first. game/data.js says `hasDrillString: false` here and
         DOMAIN.md §1a names both: cable-tool (a wire rope, cleaned by bailing)
         and driven-pile (a ram, a helmet and a pile). Neither has a rod to add.

         Without it `getTelemetry()` published `hasDrillString: true`, `rods: 1`
         and `rodLengthMeans: 'rod length'` for a pile, because the flag was
         read as `!== false` and undefined is not false. The mechanics were
         already right by a different route — `rodLength: 0` means no cadence
         and `noJam` covers the fatigue path — which is exactly why nothing
         looked broken while the published fact was wrong. */
      hasDrillString: false,
      // At timeMul 0.55 the compressed blow stream lands at about 24 Hz, just
      // under the sim's 30 Hz impact cap — so every single blow can be emitted
      // and the rhythm the player hears IS the blow count being logged.
      K: 1, ucsExp: 1, ucsFloor: 0.1, softFloorUcs: 0, softEffMin: 1,
      optWob: 0.55, optRpm: 0.55, optFlush: 0.50,
      dryMethod: true,          // no flush at all: no cuttings, no annulus, no cooling water
      noJam: true,              // there is no string in a hole to bind
      noOverTorque: true,       // the safety axis here is DRIVING STRESS, not torque
      hazardScale: 0,           // no borehole hazards exist on a pile that makes no hole
      bandDrift: false,         // the design set window is a contract number. It does not drift.
      completeOnProgramme: true,// a pile is finished when the SET IS TAKEN, not when a depth
                                // counter reaches a number — which is the whole argument
      toolIsDolly: true,        // the consumable is the DOLLY, not a bit — see TUNING.dollies
      bitBudget: 1.0,
      torque: { base: 0.05, wob: 0.10, cut: 0, abr: 0, depth: 0.010, wear: 0.05 },
      wearMul: 1.0, heatMul: 0, flushK: 0, erodeK: 0,
      bandMul: 1.0, driftMul: 0, casing: false, impact: 'drop',
      bitKinds: ['dolly'],
      gauge: { axis: 'set', label: 'SET', unit: 'mm/blow', max: 30 },
      score: { weights: { time: 0.10, groove: 0.10, bit: 0.06, straight: 0.00,
                          hazard: 0.08, safety: 0.08, quality: 0.58 } },
      pile: {
        ramKg: 16000,           // the large class: a 16 t ram block
        strokeMaxM: 1.5,        // the maximum drop that protects the pile
        // ramKg x g x strokeMaxM = 235.4 kNm, which is exactly the catalogue
        // rating for this class. The energy IS the drop height, which is why
        // the drop is what the safety rule caps.
        energyMinKnm: 12,       // the bottom of the adjustable range on the same machine
        bpmRange: [30, 100],    // blow rate on the heavy classic hammers
        // THE COUPLING. Energy and rate are on one hydraulic circuit: 235 kNm at
        // 30 bpm is 7,050 kNm/min, and that product is the envelope. You buy
        // energy per blow with blow rate and you cannot max both. 12 kNm at
        // 100 bpm sits far under the curve, which is why the low end is
        // reachable at any rate and the high end is not.
        powerKnmPerMin: 7050,
        effHydraulic: [0.65, 0.90],  // measured hammer/cushioning efficiency, hydraulic
        // Where a competent pile driver sits on that envelope. You START SOFT
        // and FINISH HARD: fast light blows through the soft beds, slow heavy
        // ones onto the bearing stratum. The driver is the resistance under the
        // toe, not the clock.
        optEnergyBase: 0.32, optEnergyPerRes: 0.60,
        optRateBase: 0.80, optRatePerRes: 0.55,
        optResRef: 10,          // driving resistance that counts as "fully hard"
        // ── the set model ──
        setK: 45,               // mm of permanent set per blow at unit energy, unit resistance
        rBase: 0.55,            // driving resistance floor: even soft ground resists something
        rHard: 12.0,            // end bearing from the bed under the toe ...
        rHardExp: 2.6,          // ... and it rises very steeply with bed strength
        rDense: 2.0,            // granular resistance (the ground table's abrasivity is the
                                //  best density proxy the game has: sand 0.55, gravel 0.7)
        rShaft: 0.90,           // shaft friction accumulated per rShaftRefM of embedment
        rShaftRefM: 20,
        setMaxMm: 60,           // a blow never drives further than this, however soft the ground
        setGaugeMaxMm: 30,      // full scale on the set gauge ...
        gaugeExp: 0.5,          // ... read on a square-root scale, because the honest range is
                                //     5 to 250 blows per 250 mm and a linear gauge is unreadable
        incrementMm: 250,       // blows are logged per 250 mm over the drive ...
        finalIncrementMm: 25,   // ... and per 25 mm through the final metre
        finalMetreM: 1.0,
        practicalBlows: 135,    // 120-150 blows/250 mm is the practical sustained limit
        shortBurstBlows: 200,   // acceptable for fairly short periods only
        refusalBlows: 248,      // 300 blows/ft: refusal when sustained ...
        refusalOverM: 1.5,      // ... over 1.5 consecutive metres
        hardRefusalBlows: 662,  // 800 blows/ft ...
        hardRefusalOverM: 0.3,  // ... over 0.3 m
        // ── alignment. The helmet is deliberately NOT tight on the pile head,
        //    so the pile can rotate when it strikes an obstruction — which
        //    means the alignment wanders and has to be trimmed back.
        alignCentre: 0.5,       // the PROTECT control at plumb
        alignBandGood: 0.10,    // inside this the blow lands on the pile centre
        alignDriftPerSec: 0.055,// how fast the pile wanders off line unattended
        alignEffMin: 0.55,      // delivered energy at full misalignment
        rakePerAlign: 0.35,     // degrees off line per second per unit of misalignment
        rakeMaxDeg: 5.0,        // rake that scores zero
        // ── the dolly: the consumable that decides what reaches the toe
        dollyWearPerBlow: 0.00022,  // resilience consumed per blow at full drop
        dollyEffMin: 0.62,      // energy transmitted through a fully degraded dolly
        // ── damage. THIS IS THE PART THAT MAKES THE GAUGE LIE.
        headPerBlow: 0.00030,   // head damage per blow at full drop and full misalignment
        toePerBlow: 0.00040,    // toe damage per blow at full drop into a hard toe
        toeSpikeUcs: 40,        // bed strength above which the reflection at the toe is sharp
        broomSetMm: 9.0,        // MEASURED set added by a fully broomed toe at full drop.
                                // The toe is crushing and splaying, so the head goes down and
                                // the pile does not: the set gauge reads BETTER while the pile
                                // is being destroyed. Only depth into bearing is honest.
        stressPerDrop: 0.78,    // driving stress, as a fraction of the code limit, at full drop
        stressPerToe: 0.42,     // ... plus the sharp reflection off a hard toe
        stressLimit: 1.0,       // 0.8 fck for concrete, 0.9 fy for steel, normalised to 1.0
        stressMonitoredAdd: 0.10,   // +10 % permitted if driving stresses are monitored ...
        stressSteelAdd: 0.20,       // ... and +20 % for steel. Buy the instrumentation,
                                    //     unlock more hammer.
        stressHoldSec: 0.8,     // seconds over the limit before it is a logged safety event
        // ── the bearing stratum, and the counter that tells the truth
        bearingUcsMin: 30,      // a bed at least this strong is a bearing stratum
        bearingPenM: 0.6,       // required penetration INTO it before the pile is founded —
                                // two or three pile diameters, and no more, because every
                                // blow past it is being spent on the toe rather than on depth
        // ── the beats
        pitchSec: 3.0,          // pitching the pile into the leader guides
        pitchWindowDelay: 1.0,  // ... the timing window on the stab ...
        pitchWindowSec: 0.55,
        setBlows: 10,           // "take the set": hold energy and alignment for ten blows
        setBandFrac: 0.55,      // half-width of the design set window, as a fraction of it
        setRealTime: true,      // the take-set beat runs on REAL player seconds at the real
                                // blow rate, because counting ten blows is the point of it
        setHoldTolerance: 0.12, // how far the controls may move during the set and still count
        reDriveSec: 6.0,        // re-driving a rejected pile alongside. Expensive, never fatal.
      },
    },

    /* ═══════════════════════════════════════════════════════════════════
       site-investigation — SPT / CPT / SAMPLING
       SPT IS DRIVEN: a 63.5 kg hammer falling 760 mm, blows counted per 75 mm,
       N is the blow count for the last 300 mm. CPT IS PUSHED at 20 mm/s and is
       not drilling at all — it produces a live qc / fs / u2 trace. Neither is
       slider gameplay in the ordinary sense. Scored on sample quality and log
       fidelity; depth is not the number.
       ═══════════════════════════════════════════════════════════════════ */
    'site-investigation': {
      // 1.0 m rods, per game/data.js METHODS — the same metre the CPT probe
      // mode below already uses, so the two halves of one method now agree.
      name: 'Site investigation', kind: 'rotary', rodLength: 1.0, ropMax: 26, timeMul: 1.4,
      K: 210, wobExp: 0.55, rpmExp: 0.60, ucsExp: 0.80, ucsFloor: 1.5,
      softFloorUcs: 0, softEffMin: 1, rockCeilingUcs: 60,   // a wash boring dies in rock
      optWob: 0.34, optRpm: 0.52, optFlush: 0.60,
      hazardScale: 0.5,         // a split-spoon really does meet cobbles in till
      suppressHazards: [],
      bitBudget: 0.5,
      rodAddSecMul: 1.0,
      torque: { base: 0.09, wob: 0.40, cut: 0.55, abr: 0.24, depth: 0.055, wear: 0.14 },
      wearMul: 0.8, heatMul: 0.6, flushK: 0.9, erodeK: 0.8,
      bandMul: 1.10, driftMul: 0.85, casing: true, impact: 'grind',
      bitKinds: ['tricone', 'drag', 'core', 'auger'],
      gauge: { axis: 'torque', label: 'TORQUE', unit: '', max: 1.25 },
      score: { weights: { time: 0.08, groove: 0.10, bit: 0.04, straight: 0.02,
                          hazard: 0.08, safety: 0.08, quality: 0.60 } },
      /* CPT is not a variant of boring, it is a different machine action, so it
         replaces the method wholesale when a piezocone is the fitted probe. */
      cpt: {
        kind: 'push', ropMax: 130, timeMul: 0.35,
        dryMethod: true,        // the cone does not turn and nothing is circulated
        noJam: true, noOverTorque: true,
        bandDrift: false,       // 20 +/- 5 mm/s is a standard, not a moving sweet spot
        rodLength: 1.0,         // a rod break every metre — and on a seismic CPT, the beat
                                // on which the seismic reading is taken
        rodAddBeat: false,
        hazardScale: 0,
        impact: 'push',
        gauge: { axis: 'push-rate', label: 'PUSH RATE', unit: 'mm/s', max: 34 },
      },
      probe: {
        testEveryM: 1.5,        // SPT at 1.5 m centres is the standard schedule
        boreSecPerTest: 0.4,    // settling the string on the base of the hole before a drive
        spt: {
          hammerKg: 63.5,       // 63.5 +/- 0.5 kg
          dropMm: 760,          // 760 +/- 10 mm (the ASTM 750 mm is 30 in rounded the other way)
          incrementMm: 75,      // ISO 22476-3 records blows per 75 mm ...
          seatingIncrements: 2, // ... two of them are the 150 mm SEATING DRIVE, and discarded:
                                //     it is fall-in and disturbed base material
          testIncrements: 4,    // ... and four are the 300 mm TEST DRIVE. Their sum is N.
          refusalPerIncrement: 50,   // 50 blows in any one 150 mm increment ...
          refusalTotal: 100,         // ... or 100 blows over the whole 450 mm drive ...
          refusalNoAdvance: 10,      // ... or no observed advance in 10 successive blows.
                                     // A refused test is a RESULT, reported as blows/penetration.
          cadenceBpm: [18, 42], // the WORK control is the hammer cadence
          driveTimeMul: 6.0,    // the drive runs on its own clock: fast enough that a dozen
                                // tests fit in a session, slow enough to be played
          releaseHz: 1.6,       // the release rhythm. It is the OPERATOR'S ATTENTION, sampled,
                                // not one tap per blow — a driller does not tap 25 times a test
          releaseWindow: 0.30,  // fraction of the cycle that is a clean free-fall release
          releaseDecay: 0.34,   // release quality lost per player second without a clean tap
          releaseGain: 0.38,    // ... and regained by one
          erRange: [0.45, 0.85],// rod energy ratio, from a bad release to a clean one
          er60: 0.60,           // N60 is normalised to a 60 % energy ratio
          crShallowM: 3.0,      // the rod-length correction is 0.75 below 3 m ...
          crFullM: 10.0,        // ... and only reaches 1.00 beyond 10 m. Shallow tests are the
                                //     least reliable, and the foundation sits on them.
          crShallow: 0.75,
          blowsPerMm: 0.055,    // blows per mm of drive at unit resistance and full energy
          resistK: 3.2,         // how hard the ground's resistance scales the blow count
          areaRatioDisturbed: 0.10,   // an "undisturbed" sample needs an area ratio under 10 %.
                                      // A split-spoon is about 110 %: EVERY SPT sample is
                                      // a disturbed sample, and the game says so.
        },
        cpt: {
          rateMmS: 20,          // pushed at a constant 20 mm/s
          rateTolMmS: 5,        // +/- 5 mm/s, and holding it is the entire skill
          rateMaxMmS: 34,       // full scale on the rate gauge
          readingEveryMm: 50,   // a reading lands every 50 mm (20 or 10 on better kit)
          paKpa: 100,           // atmospheric reference pressure for the SBT index
          netAreaRatio: 0.80,   // an, the cone's net area ratio, for qt = qc + u2(1 - an)
          /* qc and Rf are computed from the GAME'S OWN ground table, not from
             published absolute bands per soil type: the research flags those as
             unverified and they are not shipped as fact. The EQUATIONS are the
             sourced part — Rf = (fs/qc) x 100, qt = qc + u2(1 - an), and the
             non-normalised soil behaviour type index. */
          qcFromUcsMpa: 3.2,    // cone resistance per MPa of bed strength ...
          qcFromDensity: 22,    // ... plus the granular term, in MPa at abrasivity 1
          qcSoftFloor: 0.25,    // the softest bed still resists this much, MPa
          qcMax: 60,            // beyond this the cone is not going in at all
          rfClay: 4.5,          // friction ratio, %, in a fine-grained bed ...
          rfSand: 0.55,         // ... and in a clean granular one
          rfDensRef: 0.72,      // ground-table abrasivity that counts as fully granular
          u0PerM: 9.81,         // hydrostatic pore pressure, kPa per metre below the water table
          waterTableM: 2.0,     // default water table when the contract does not name one
          u2ExcessClay: 4.2,    // excess u2 per MPa of qc in fine-grained soil ...
          u2DilateSand: -0.45,  // ... and the dilative drop in a dense one
          inclLimitDeg: 8.0,    // inclination beyond which the sounding is out of tolerance
          inclPerRate: 0.05,    // inclination per second per unit of over-rate in coarse ground
          desatUcs: 8,          // a bed this strong or better can strip the cone's saturation
          desatChance: 0.55,    // ... and how often crossing one does
          baselineDriftPerM: 0.00022,  // baseline drift accumulated per metre of push ...
          baselineTol: 0.030,   // ... and the tolerance the post-sounding check applies
          thrustCapacity01: 0.86,      // ground resistance, normalised, that stalls the rig:
                                       // the rods rebound and the machine starts to move
        },
      },
    },

    /* ═════════════════════════════════════════════════════════════════
       JET GROUTING (HDI) — TWO PASSES, AND THE WORK IS ON THE WAY UP.

       This method used to have no entry at all and played as the generic
       downward rotary rig below. That was not merely generic, it was WRONG:
       `ui/screens/site.js` resolves it to its `jet` control family and labels
       the three sliders WITHDRAW / JET / ROTATION, so under a rotary model the
       slider marked "withdrawal rate" was weight-on-bit pushing DOWN — the
       opposite direction, on the one control the player uses most.

       ── WHAT IS SOURCED, AND IS THEREFORE MODELLED ──
       research/05-foundation-piling.md §A12, from the primary documents:

       • THE SEQUENCE. The monitor is drilled to maximum treatment depth
         FIRST; then the jets are started; then the stem and monitor are
         ROTATED AND RAISED, eroding the in-situ soil and mixing it with grout
         on the way out `[KELLER-JET]`. That is a two-pass method whose second
         pass runs backwards — exactly the `stages[]` machinery `hdd` and
         `raise-boring` already use, with `actionDepth()` counting back down
         the hole as the monitor comes up.
       • THE PRESSURE FLOOR. 25 MPa / 250 bar, EN 12716:2018's own definition
         `[PANDREA]` §4.2. Below it there is no coherent jet and the work is
         grouting, not jet grouting. It is the one hard number this method has
         and it is a live mechanic: metres lifted under it are not a column.
       • THE PUMP CEILING. 700 bar, 400 l/min `[KLEMM]`. Both endpoints of the
         WORK axis are therefore sourced, which is the only reason this file
         is willing to put a `bar` figure on a 0..1 slider at all.
       • THE LADDER. single < double < triple for a given soil `[KELLER-JET]`.
       • THE HIDDEN VARIABLE. Soil erodibility: *"plays a major role in
         predicting geometry, quality, and production"*, and COHESIONLESS
         SOILS ARE MORE ERODIBLE THAN COHESIVE `[KELLER-JET]`. The same energy
         makes a fat column in sand and a thin one in stiff clay.
       • THE KPI. Column diameter achieved at the design UCS, WITH THE RETURN
         MANAGED. Losing control of the return — no return at all, or heave —
         is the failure. Spoil comes up the annulus and is pumped away; the rig
         kit includes suction hose pumps for the backflow `[KLEMM]`.

       ── WHAT IS NOT SOURCED, AND IS THEREFORE NOT CLAIMED ──
       §A12 marks these UNVERIFIED and says in as many words not to ship a
       table without a source. Each is carried below as a normalised 0..1
       tuning constant with `sourced: false` beside it, the same way the ore
       grades are, and `programmeTelemetry()` publishes `*Known: false` flags
       so no caption can print one as fact:

         column diameter by soil and system  — genuinely project-specific
         withdrawal rate                     — no sourced figure in any unit
         monitor rotation speed              — no sourced rpm anywhere

       A normalised constant with no unit printed beside it is not a claim; a
       millimetre or a metre-per-minute would be. PLATFORM_TRUTH Part C rule 7
       is "say less", not "round off", and DOMAIN's rule is that NOT SOURCED is
       always acceptable and a plausible invented number never is.

       (`game/data.js`'s shop copy for this method prints "400 bar". That sits
       inside the sourced 250–700 envelope but is not itself cited — a note for
       whoever owns that file, not something this one can fix.)
       ═════════════════════════════════════════════════════════════════ */
    'jet-grouting': {
      /* 3.0 m is what game/data.js says and what tools/checkdata.mjs checks
         against; [EMDE-AN] gives useable HDI rod lengths of 500–3 000 mm. */
      name: 'Jet grouting', kind: 'rotary', rodLength: 3.0, ropMax: 26,
      /* The pre-drill is a monitor threaded down a small-diameter hole in
         SOIL — clay, silt, sand, gravel, till, marl (data.js `validGround`) —
         on a 3-wing bit with a flushing bore [EMDE-AN]. It is the easy half of
         the job and the model says so: low weight, modest rotation, and a
         `ucsFloor` that keeps a 0.1 MPa sand from returning an absurd rate. */
      K: 62, wobExp: 0.60, rpmExp: 0.35, ucsExp: 0.55, ucsFloor: 1.2,
      softFloorUcs: 0, softEffMin: 1,
      optWob: 0.34, optRpm: 0.50, optFlush: 0.62,
      torque: { base: 0.08, wob: 0.34, cut: 0.45, abr: 0.22, depth: 0.055, wear: 0.10 },
      wearMul: 0.55, heatMul: 0.45, flushK: 1.05, erodeK: 1.0,
      bandMul: 1.0, driftMul: 0.9, casing: false, impact: 'grind',
      bitKinds: ['drag', 'tricone'],
      /* ── WHAT THE JOB IS JUDGED ON ────────────────────────────────────
         The sourced KPI is the COLUMN, not the metre: "column diameter
         achieved at the design UCS, with the return managed". The metres are
         drilled twice and paid once; what the client buys is a continuous
         treated column, and a break in it is the failure whatever the clock
         said. So the method's own axis carries most of the grade, the same
         way RC's bag and a pile's set do — and `straight` carries nothing,
         because a jet grouting column's geometry is the column's, not the
         pre-drill's, and the pass that makes it travels back along a hole
         that already exists and cannot bend it.
         (game/data.js says `scoredOn: 'metres drilled'` for this method. That
         is the wrong axis and it is not this file's field to change.) */
      score: { weights: { time: 0.10, groove: 0.12, bit: 0.08, straight: 0.00,
                          hazard: 0.10, safety: 0.10, quality: 0.50 } },
      /* The run is over when the monitor is back at the collar, not when the
         contract's metre count is reached — the same as both other two-pass
         methods. `stepTwoStage` owns the transition. */
      completeOnProgramme: true,
      stages: [
        /* Stage 0. Drill the monitor down. Nothing is jetted; the pumps are
           not running; this is an ordinary small rotary hole in soil. */
        { id: 'predrill', name: 'Monitor to depth', reverse: false },
        /* Stage 1. THE JOB. Rotate and raise while jetting. */
        { id: 'jet-lift', name: 'Jet & lift', reverse: true,
          /* ── THE THREE CONTROLS, AND WHICH IS WHICH ──────────────────
             GAMEDESIGN §7 publishes this row and site.js already prints it:
                ADVANCE (wob)   = WITHDRAWAL RATE
                WORK    (rpm)   = JET PRESSURE
                PROTECT (flush) = ROTATION SPEED
             Under the old rotary fallback ADVANCE pushed the string DOWN. It
             now lifts it, and `liftMaxMh` is what makes that true: the rate on
             this pass is the withdrawal the operator COMMANDS, capped by the
             machine, not a rate of penetration into rock the monitor is not
             touching. Same shape as the CPT push, which is also commanded. */
          liftMaxMh: 21,
          liftRateSourced: false,   // ← no withdrawal rate is sourced in any unit
          armOnEnter: true,         // the jets are started BEFORE the lift begins
          /* THE PUMP IS THE CIRCULATION, NOT THE THIRD SLIDER. On this pass
             PROTECT is rotation; what keeps the annulus open and carries the
             spoil out is 400 l/min off the WORK axis. See circulationNow(). */
          flushFromWork: true,
          /* …and the same argument one level up: this pass computes what is
             coming back over the collar, so the generic "wet and loose bed =
             no returns" test does not get to answer the question a second
             time. See section 4 of step(). */
          ownsReturns: true,
          gauge: { axis: 'return', label: 'RETURN', unit: '', max: 1.25 },
          flushOff: false,          // the annulus is carrying spoil, not nothing
          optWob: 0.45,             // a lift, not a thrust
          optRpm: 0.62,             // ≈ 434 bar — inside the sourced envelope
          optFlush: 0.55,           // rotation
          /* The monitor is not cutting rock and 400 l/min is going past it.
             It is not the heat-limited object a bit in a dry hole is. */
          heatMul: 0.05,
          /* The nozzles ARE the consumable. data.js's own copy — "one blocked
             nozzle ruins the whole panel" — is the mechanic: a worn nozzle
             throws an incoherent jet and the column narrows with it
             (`colPerWear` below). And unlike a raise borer's cutters it CANNOT
             be changed from below: changing a nozzle means tripping the
             monitor out of a column that is half made. No `cutterChangeSec`,
             so the re-cutter action is never offered on this pass. */
          wearMul: 1.15,
          loadDrain: 0.26,          // spoil leaves up the annulus, it does not pack
          jet: {
            /* ── SOURCED, BOTH ENDS ─────────────────────────────────────
               floorBar: EN 12716:2018 §4.2 — below 25 MPa it is not jet
               grouting. maxBar / maxLmin: [KLEMM] HP injection pumps, max
               700 bar and max 400 l/min. The WORK slider is a fraction of the
               pump, so bar = maxBar × slider is a real number on a real
               machine limit, and the 250 bar floor lands at 0.357 of travel —
               a threshold the player can feel for. */
            floorBar: 250, maxBar: 700, maxLmin: 400,
            sourcedPressure: true,

            /* ── EVERYTHING BELOW IS NORMALISED GAME TUNING ─────────────
               Not one of these prints beside a unit. `sourced: false` is
               carried through to telemetry so nothing can quote them. */
            sourced: false,

            /* Energy per metre of lift. Slower withdrawal = more dwell at each
               station = a bigger column. The SHAPE is sourced (that is what
               "rotated and raised" means); the constant is not. */
            dwellRef: 0.45,
            /* Rotation spreads the jet round the axis. Too slow and the jet
               cuts a slot rather than a column; too fast and no radius is held
               long enough. A bell, because both ends are wrong — and its
               centre is NOT an rpm, because no rpm is sourced. */
            optRot: 0.55, rotSigma: 0.26, rotFloor: 0.22,
            /* Column index. 1.0 is "the design column for this contract" and
               it is DIMENSIONLESS — never a diameter, because column diameter
               by soil is exactly what §A12 refuses to table. Calibrated so a
               competent operator in mid-erodibility ground sits at 1.0. */
            colGain: 7.2, colPerWear: 0.45,
            /* SOIL ERODIBILITY. Only the ORDERING is sourced — cohesionless
               above cohesive — and that is all this encodes: the two clean
               granular beds at the top, the cohesive ones below, the rock a
               jet has no business in at the floor. Restricted to the beds
               data.js lists in `validGround`, plus the two a hole can stray
               into. No diameter is derived from it; it scales the column
               INDEX, which is a score, not a measurement. */
            erodibility: {
              sand: 1.00, gravel: 0.92, topsoil: 0.78, silt: 0.68,
              clay: 0.50, marl: 0.42, till: 0.34, chalk: 0.30,
              _default: 0.26,       // anything the method should not have met
            },

            /* ── THE RETURN, WHICH IS THE SOURCED KPI ───────────────────
               "Losing control of the return — either no return at all, or
               heave — is the failure." So the gauge on this pass is the
               RETURN at the collar, and it fails at BOTH ends:
                 0.00  nothing coming back — the mix is going into the ground
                 0.50  a healthy return, pumped away by the backflow pumps
                 1.00+ the annulus is packing off and the ground is lifting
               A permeable, cohesionless bed eats the return; a tight cohesive
               one backs it up. Same erodibility number, opposite failure. */
            /* ── MEASURED, AND THE BAND HAS TO BE REACHABLE ─────────────
               The band centre has to sit where a competent operator's own
               optimum puts the needle, or it is telling them to do the wrong
               thing — the same lesson raise-boring's centre already carries.
               The first cut of these constants put a good lift in silt on
               0.28 against an ideal of 0.50: outside the band for the whole
               pass, with no setting that could reach it. These land it on
               0.50 exactly.

               `retPerSupply` also had to grow. At 0.78 the return barely
               moved with the pump — silt at 630 bar returned 0.54 against
               0.46 at 434, so over-jetting was free and the gauge said
               nothing. At 1.60 the same pair reads 0.50 → 0.76: still safe,
               visibly climbing, and the operator can see where it is going. */
            retIdeal: 0.50, retTol: 0.16, retLambda: 1.6,
            retBase: 0.256, retPerSupply: 1.60,
            /* ESCAPE DOES NOT DEPEND ON DWELL AND SUPPLY DOES, which is the
               whole reason the two failures land on opposite ends of the
               ADVANCE control. Lift fast through clean sand at full pump and
               you are pumping into a permeable formation faster than a return
               path can establish: measured 0.07, the return is gone. Lift
               slowly through the same sand and it comes back. */
            retPerEscape: 0.95,      // permeable ground takes it away
            retPerPack: 0.55,        // a tight annulus will not pass it
            /* 1.00 was unreachable: the worst case a player can actually set
               up — slowest lift, hardest pump, tight cohesive ground —
               measured 0.94 and heave never fired once. 0.88 fires on exactly
               that case and leaves 0.22 of clear air above the band. */
            lostAt: 0.13, heaveAt: 0.88,
            /* While the return is gone the grout is not building a column at
               that station, and while the ground is heaving the job is being
               lost rather than the metre. */
            lostColMul: 0.45, heaveColMul: 0.80,
          },
        },
      ],
    },

    /* any method without its own entry falls back to this generic rotary rig */

    /* ═════════════════════════════════════════════════════════════════
       WHAT THIS FALLBACK IS FOR, NOW THAT NOTHING IS STUCK IN IT.

       `jet-grouting` was the last method living down here, and living here was
       not a decision anyone made — it was the entry nobody had written. It has
       one now (above), so as of this commit EVERY method in game/data.js has
       its own model and `tools/checkdata.mjs`'s "no sim tuning at all for"
       warning is empty.

       That makes this entry what it should always have been: the model a
       method gets while it is being written, and nothing else. If a shipped
       method reaches it again, that is a bug and checkdata will say so.

       ONE THING IT STILL CANNOT DO, so nobody re-learns it the expensive way:
       a fallback model is generic, but a fallback model under a HUD that has
       already committed to a vocabulary is WRONG. site.js derives its control
       labels from data.js — not from this table — so a method can arrive here
       with its sliders already labelled for a machine this entry does not
       simulate. Jet grouting spent its whole life doing exactly that, with
       "Withdrawal rate" wired to weight-on-bit pushing down. Check what the
       HUD is already promising before leaving anything on this row.
       ═════════════════════════════════════════════════════════════════ */
    _default: {
      name: 'Rotary', kind: 'rotary', rodLength: 3, ropMax: 45,
      K: 900, wobExp: 0.85, rpmExp: 0.65, ucsExp: 0.85, ucsFloor: 6,
      softFloorUcs: 0, softEffMin: 1,
      optWob: 0.55, optRpm: 0.55, optFlush: 0.60,
      torque: { base: 0.10, wob: 0.50, cut: 0.65, abr: 0.28, depth: 0.080, wear: 0.16 },
      wearMul: 1.0, heatMul: 0.8, flushK: 0.9, erodeK: 0.7,
      bandMul: 1.0, driftMul: 1.0, casing: false, impact: 'grind',
      bitKinds: ['tricone', 'drag', 'pdc'],
    },
  },

  /* ── bit archetypes: matched by exact id, then by substring, then method ─ */
  /* carbide 0.5 (mild steel drag) … 1.5 (premium gauge-protected carbide)   */
  bits: {
    'auger-flight-std': { name: 'Auger Flight',        kind: 'auger',   carbide: 0.80, wobCap: 1.00, aggression: 1.00 },
    'auger-flight-hd':  { name: 'Auger Flight HD',     kind: 'auger',   carbide: 1.05, wobCap: 1.15, aggression: 1.05 },
    'drag-bit-3w':      { name: '3-Wing Drag Bit',     kind: 'drag',    carbide: 0.75, wobCap: 0.95, aggression: 1.10 },
    'chisel-bit':       { name: 'Cable-tool Chisel',   kind: 'chisel',  carbide: 0.70, wobCap: 1.20, aggression: 0.95 },
    'button-bit-r32':   { name: 'Button Bit R32',      kind: 'button',  carbide: 0.95, wobCap: 1.00, aggression: 1.00 },
    'button-bit-t45':   { name: 'Button Bit T45 HD',   kind: 'button',  carbide: 1.20, wobCap: 1.10, aggression: 1.08 },
    'cross-bit-r32':    { name: 'Cross Bit R32',       kind: 'cross',   carbide: 0.85, wobCap: 1.00, aggression: 0.92 },
    'dth-bit-4in':      { name: 'DTH Bit 4"',          kind: 'dth',     carbide: 1.00, wobCap: 1.00, aggression: 1.00 },
    'dth-bit-6in-hd':   { name: 'DTH Bit 6" HD',       kind: 'dth',     carbide: 1.25, wobCap: 1.10, aggression: 1.10 },
    'ring-bit-sym':     { name: 'Ring Bit System',     kind: 'ring',    carbide: 1.10, wobCap: 1.05, aggression: 0.95 },
    'core-bit-nq':      { name: 'Core Bit NQ',         kind: 'core',    carbide: 1.15, wobCap: 0.70, aggression: 1.00 },
    'core-bit-hq-imp':  { name: 'Core Bit HQ Impreg',  kind: 'diamond', carbide: 1.35, wobCap: 0.75, aggression: 1.06 },
    'tricone-std':      { name: 'Tricone Bit',         kind: 'tricone', carbide: 0.90, wobCap: 1.15, aggression: 1.00 },
    'pdc-bit':          { name: 'PDC Bit',             kind: 'pdc',     carbide: 1.30, wobCap: 0.95, aggression: 1.20 },
    'sda-bit':          { name: 'Self-Drilling Anchor',kind: 'sda',     carbide: 0.65, wobCap: 1.00, aggression: 0.95 },
    'sonic-shoe':       { name: 'Sonic Drive Shoe',    kind: 'sonic',   carbide: 0.90, wobCap: 1.00, aggression: 1.00 },
    'reamer-head':      { name: 'Reamer Head',         kind: 'reamer',  carbide: 1.20, wobCap: 1.20, aggression: 0.90 },
    /* Oil-well bits. Two extra fields matter here and nowhere else:
       `founder` shifts the founder point (a soft-formation milled tooth balls
       up early, a PDC without a depth-of-cut ring stalls early, a hard-
       formation TCI takes more weight than either), and `bearings` is the
       BEARING life multiplier — 0 means the bit has no bearings at all, which
       is the whole reason a PDC can be left on bottom and a tricone cannot. */
    'bit-oil-tri-6-mill':    { name: '6 in Tricone, Milled Tooth',   kind: 'tricone', carbide: 0.85, wobCap: 1.00, aggression: 1.14, founder: 0.90, bearings: 1.00 },
    'bit-oil-tri-8-econ':    { name: '8 1/2 in Tricone, Economy',    kind: 'tricone', carbide: 0.60, wobCap: 0.95, aggression: 0.92, founder: 0.86, bearings: 0.45 },
    'bit-oil-tri-8-tci':     { name: '8 1/2 in Tricone, TCI',        kind: 'tricone', carbide: 1.05, wobCap: 1.05, aggression: 1.06, founder: 1.05, bearings: 1.25 },
    'bit-oil-tri-17-mill':   { name: '17 1/2 in Tricone, Milled',    kind: 'tricone', carbide: 0.80, wobCap: 1.10, aggression: 1.24, founder: 0.88, bearings: 0.90 },
    'bit-oil-tri-12-tci-hd': { name: '12 1/4 in Tricone, TCI HD',    kind: 'tricone', carbide: 1.30, wobCap: 1.15, aggression: 1.02, founder: 1.12, bearings: 1.60 },
    'bit-oil-pdc-8':         { name: '8 1/2 in PDC, 6-Blade',        kind: 'pdc',     carbide: 1.15, wobCap: 0.90, aggression: 1.45, founder: 0.82, bearings: 0 },
    'bit-oil-pdc-12-hd':     { name: '12 1/4 in PDC, 7-Blade HD',    kind: 'pdc',     carbide: 1.35, wobCap: 0.95, aggression: 1.58, founder: 1.00, bearings: 0 },
    /* RC bits. `sampleGain` is the extra SAMPLE RECOVERY the face design buys —
       a venturi-flushing face is documented at "40 % plus improvement in sample
       recovery versus conventional RC drill bit designs", and it keeps flushing
       a water-logged hole where a conventional face silts. It is the only place
       in the bit table where a number affects the assay rather than the metre. */
    'rc-bit-std':       { name: 'RC Bit, Drop Centre',  kind: 'rc',      carbide: 1.00, wobCap: 1.00, aggression: 1.00, sampleGain: 1.00 },
    'rc-bit-venturi':   { name: 'RC Bit, Venturi Face', kind: 'rc',      carbide: 1.10, wobCap: 1.00, aggression: 1.04, sampleGain: 1.40 },
    /* Bolting bits. `gaugeMm` is the HOLE DIAMETER, and on a friction bolt it is
       the single number that decides whether the bolt holds anything: the hole
       must be smaller than the tube, and pull-out falls monotonically as the bit
       gets bigger. This is the only bit field the anchorage model reads. */
    'bolt-bit-33':      { name: 'Bolting Bit 33 mm',   kind: 'bolt',    carbide: 0.95, wobCap: 1.00, aggression: 0.96, gaugeMm: 33.0 },
    'bolt-bit-38':      { name: 'Bolting Bit 38 mm',   kind: 'bolt',    carbide: 1.00, wobCap: 1.00, aggression: 1.00, gaugeMm: 38.1 },
    'bolt-bit-39':      { name: 'Bolting Bit 39 mm',   kind: 'bolt',    carbide: 1.00, wobCap: 1.00, aggression: 1.02, gaugeMm: 39.1 },
    /* the field spare fitted when a bit breaks and nothing else is available */
    _spare:             { name: 'Field Spare',         kind: 'any',     carbide: 0.60, wobCap: 0.85, aggression: 0.80, founder: 0.85, bearings: 0.75 },
  },
  bitMismatchEff: 0.45,       // ROP multiplier for running the wrong bit kind for the method

  /* ── dollies: the cushion between a piling hammer and the pile head ─────
     A driven pile has no bit. What it has is a helmet holding a resilient
     dolly, with packing beneath it, and the dolly's condition is what decides
     how much of the hammer's energy reaches the toe — the resilience changes
     with use, and so does the energy transmitted. That is the same shape as
     bit wear on every other method, so the sim carries the dolly in the bit
     slot and the whole tool-wear, tool-worn and tool-change loop just works.
     `carbide` here reads as DOLLY LIFE and `aggression` as ENERGY TRANSMISSION. */
  dollies: {
    'dolly-hardwood':  { name: 'Hardwood Dolly, End Grain',        kind: 'dolly', carbide: 0.70, wobCap: 1.00, aggression: 0.92 },
    'dolly-plastic':   { name: 'Plastic Dolly, Phenolic Laminate', kind: 'dolly', carbide: 1.15, wobCap: 1.00, aggression: 1.00 },
    'dolly-composite': { name: 'Composite Dolly, Steel-Faced',     kind: 'dolly', carbide: 1.40, wobCap: 1.00, aggression: 1.05 },
    _default:          { name: 'Hardwood Dolly, End Grain',        kind: 'dolly', carbide: 0.70, wobCap: 1.00, aggression: 0.92 },
  },

  /* ── probes: SPT samplers and CPT cones. THESE ARE NOT BITS. ────────────
     A split-spoon is a SAMPLER that is DRIVEN by a falling weight. A piezocone
     is a SENSOR that is PUSHED at a constant rate. Neither one cuts anything,
     so neither belongs in the bit table, and neither has a rock-strength
     rating to give. The sim resolves them from their own slot.

     `er` is the ROD ENERGY RATIO the hammer delivers, which is the single
     number that turns a raw N into an N60 — so the shop item is visibly a
     CORRECTION FACTOR, not a hidden multiplier. */
  probes: {
    'spt-split-spoon': { name: 'SPT Split-Spoon Sampler, 51 mm', mode: 'spt',
                         odMm: 50.8, idMm: 34.9, areaRatio: 1.10, liner: false },
    'spt-hammer-auto': { name: 'Automatic SPT Trip Hammer', mode: 'spt-hammer', er: 0.85, trip: true },
    'spt-hammer-donut':{ name: 'Donut Hammer', mode: 'spt-hammer', er: 0.45, trip: false },
    /* `piezo` is not a trim level — it is whether the instrument HAS a pore
       pressure channel at all. Without u2 there is no qt: the correction
       qt = qc + u2(1 - an) has nothing to correct with, so a plain friction
       cone under-reads tip resistance in clay and cannot be told it is doing
       so. ASTM D5778 covers both instruments separately, and the game must
       not hand a cone a channel it does not physically have. */
    'cpt-piezocone':   { name: 'Piezocone CPTu Assembly', mode: 'cpt', piezo: true,
                         coneAreaCm2: 10, netAreaRatio: 0.80, resolutionMm: 50 },
    'cpt-cone-piezo':  { name: 'Piezocone CPTu Assembly', mode: 'cpt', piezo: true,
                         coneAreaCm2: 10, netAreaRatio: 0.80, resolutionMm: 50 },
    'cpt-cone-small':  { name: 'Piezocone CPTu Assembly, 5 cm2', mode: 'cpt', piezo: true,
                         coneAreaCm2: 5, netAreaRatio: 0.80, resolutionMm: 20 },
    'cpt-cone-15':     { name: 'Friction Cone, 15 cm2', mode: 'cpt', piezo: false,
                         coneAreaCm2: 15, netAreaRatio: 0.80, resolutionMm: 50 },
    _default:          { name: 'SPT Split-Spoon Sampler, 51 mm', mode: 'spt',
                         odMm: 50.8, idMm: 34.9, areaRatio: 1.10, liner: false },
  },
  sptHammerDefaultEr: 0.60,   // a safety hammer with a rope and cathead, the N60 reference
};

/* ═══════════════════════════════════════════════════════════════════════════
   PURE HELPERS — no state, unit-testable.
   ═══════════════════════════════════════════════════════════════════════════ */

const T = TUNING;

/** smoothstep between two edges */
const sstep = (a, b, x) => smoothstep((x - a) / (b - a || 1e-6));
/** gaussian bell, 1 at centre */
const bell = (x, centre, sigma) => Math.exp(-((x - centre) ** 2) / (2 * sigma * sigma || 1e-6));
/** asymmetric bell — falls off faster above the centre (percussion stall) */
function bellStall(x, centre, sigma, stallK, floor) {
  const s = x > centre ? sigma / Math.max(1e-3, stallK) : sigma;
  return Math.max(floor, bell(x, centre, s));
}
const nz = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/* ── THE SILENT FALLBACK, AND THE ONE LINE THAT ENDS IT ─────────────────────
   Not one `console.warn` existed on any missing-contract path in this file, and
   the bill for that is on record: `sim.methodId` read `auger` for 513 of 519
   samples in a longhole run, because a caller reached `startHole(undefined)`
   and the resolution chain ended in a bare `|| 'auger'`. A plausible wrong
   answer is worse than a crash — it survives review, it survives a screenshot,
   and it survives four rounds of someone else's bug hunt.

   So every terminal default in this file says so, once per distinct message, on
   the console. Once, because these sit inside a 120 Hz loop and a warning that
   floods is a warning nobody reads. HANDOFF §9.2 asks for this as a shared
   `mustResolve()` helper; the sim deliberately imports only contract.js (that
   isolation is what makes `debug.simulate()` runnable in node), so it keeps its
   own copy rather than reaching for one. */
const _warned = new Set();
function warnOnce(key, ...msg) {
  if (_warned.has(key)) return;
  _warned.add(key);
  try { console.warn(...msg); } catch { /* no console in some harnesses */ }
}

/** Normalised rock hardness — compresses 0..300 MPa into roughly 0.18..2.4. */
function hardnessOf(ucs) {
  const r = T.rock;
  return clamp(Math.pow(Math.max(0, ucs) / r.hardRefUcs, r.hardExp), r.hardMin, r.hardMax);
}

/** Resolve a method id to its tuning entry (never returns undefined). */
export function methodOf(id) {
  return T.methods[id] || T.methods._default;
}

/** Resolve a bit id to its tuning entry, tolerating ids this file never saw. */
export function bitOf(itemId, method) {
  const bits = T.bits;
  if (itemId && bits[itemId]) return { id: itemId, ...bits[itemId] };
  if (typeof itemId === 'string') {
    const key = itemId.toLowerCase();
    for (const k of Object.keys(bits)) {
      if (k === '_spare') continue;
      const kind = bits[k].kind;
      if (key.includes(k) || (kind && key.includes(kind))) return { id: itemId, ...bits[k] };
    }
  }
  // Nothing matched: fit the archetype this method expects.
  const want = (method?.bitKinds || ['tricone'])[0];
  for (const k of Object.keys(bits)) {
    if (bits[k].kind === want) return { id: itemId || k, ...bits[k] };
  }
  return { id: itemId || '_spare', ...bits._spare };
}

/** Does this bit belong on this method's string? */
function bitFits(bit, method) {
  if (!bit || !method) return true;
  if (bit.kind === 'any') return true;
  return (method.bitKinds || []).includes(bit.kind);
}

/**
 * Resolve a method id to the tuning entry the RUN will use.
 *
 * One method genuinely becomes a different machine depending on what is fitted:
 * with a piezocone in the probe slot, `site-investigation` is not a boring rig
 * at all — the cone is PUSHED at a constant rate, nothing turns and nothing
 * circulates. That is a method-level override, not a modifier, so it is applied
 * once here rather than branched on in twenty places.
 */
export function resolveMethod(id, opts = {}) {
  const base = methodOf(id);
  if (base.cpt && opts.probeMode === 'cpt') {
    return { ...base, ...base.cpt, name: `${base.name} (CPT)` };
  }
  return base;
}

/** Resolve a dolly id to its archetype — the piling equivalent of `bitOf`. */
export function dollyOf(itemId) {
  const d = T.dollies;
  if (itemId && d[itemId]) return { id: itemId, ...d[itemId] };
  if (typeof itemId === 'string') {
    const key = itemId.toLowerCase();
    for (const k of Object.keys(d)) {
      if (k !== '_default' && key.includes(k.replace('dolly-', ''))) return { id: itemId, ...d[k] };
    }
  }
  return { id: itemId || 'dolly-hardwood', ...d._default };
}

/** Resolve a probe id (split-spoon or piezocone) to its archetype. */
export function probeOf(itemId) {
  const p = T.probes;
  if (itemId && p[itemId]) return { id: itemId, ...p[itemId] };
  if (typeof itemId === 'string') {
    const key = itemId.toLowerCase();
    if (key.includes('cpt') || key.includes('cone') || key.includes('piezo')) {
      // Only call it a piezocone if it says so. A bare "cone" is the friction
      // cone: no u2 channel, and therefore no qt.
      const piezo = key.includes('piezo') || key.includes('cptu');
      return { id: itemId, ...p[piezo ? 'cpt-piezocone' : 'cpt-cone-15'] };
    }
    if (key.includes('spoon') || key.includes('spt')) return { id: itemId, ...p['spt-split-spoon'] };
  }
  return { id: itemId || 'spt-split-spoon', ...p._default };
}

/* ── driven piling ─────────────────────────────────────────────────────── */

/**
 * The hammer's operating envelope at a given blow rate.
 *
 * Energy per blow and blow rate are on ONE hydraulic circuit: the pump has to
 * refill the accumulator between blows, so asking for more blows per minute
 * leaves less energy in each of them. The ram at its full stroke sets the
 * absolute ceiling; the circuit's power sets the ceiling at every rate above
 * the slowest. You are choosing a point on a curve, not two numbers.
 */
export function hammerEnvelope(m, rate01) {
  const p = m.pile;
  const bpm = lerp(p.bpmRange[0], p.bpmRange[1], clamp(nz(rate01, 0.5)));
  const eRam = (p.ramKg * 9.81 * p.strokeMaxM) / 1000;      // kNm at the full stroke
  const ePower = p.powerKnmPerMin / Math.max(1, bpm);       // what the circuit can refill
  return { bpm, eRam, eMax: Math.min(eRam, ePower), eMin: p.energyMinKnm };
}

/** The hammer setting the player has actually asked for, in real units. */
export function hammerSetting(m, energy01, rate01) {
  const e = hammerEnvelope(m, rate01);
  const kNm = clamp(lerp(e.eMin, e.eMax, clamp(nz(energy01, 0.5))), e.eMin, e.eRam);
  return {
    ...e,
    kNm,
    dropM: (kNm * 1000) / (m.pile.ramKg * 9.81),   // energy IS the drop height
    energy01: kNm / e.eRam,                        // as a fraction of the ram's full stroke
    capped: e.eMax < e.eRam - 1e-6,                // the circuit, not the ram, is the limit
  };
}

/**
 * Driving resistance under the toe, in the set model's own units.
 * End bearing off the bed the toe is in (steeply non-linear with strength),
 * plus a granular term, plus shaft friction accumulated over the embedment.
 */
export function driveResistance(m, ground, embedM) {
  const p = m.pile;
  if (!p) return 1;
  const hard = hardnessOf(nz(ground.ucs));
  return p.rBase
       + p.rHard * Math.pow(hard, p.rHardExp)
       + p.rDense * clamp(nz(ground.abrasivity, 0.5))
       + p.rShaft * (Math.max(0, nz(embedM)) / p.rShaftRefM);
}

/** TRUE permanent set per blow, mm. What the pile actually goes down. */
export function setPerBlow(m, ground, embedM, delivered01) {
  const p = m.pile;
  const R = driveResistance(m, ground, embedM);
  return Math.min(p.setMaxMm, (p.setK * clamp(nz(delivered01), 0, 1)) / Math.max(0.10, R));
}

/* ── CPT ───────────────────────────────────────────────────────────────── */

/**
 * The live cone trace at a depth.
 *
 * `qc` and the friction ratio are derived from the GAME'S OWN ground table, not
 * from published absolute cone-resistance bands per soil type — the research
 * flags those as unverified and they are not shipped as fact. Everything below
 * that is a published equation and is used verbatim:
 *
 *     Rf = (fs / qc) x 100                          (both in kPa)
 *     qt = qc + u2 (1 - an)                         an = the net area ratio
 *     Isbt = sqrt[ (3.47 - log10(qc/pa))^2 + (log10 Rf + 1.22)^2 ],  pa = 100 kPa
 */
export function cptTrace(m, ground, depth, waterTableM) {
  const c = m.probe.cpt;
  const ucs = Math.max(0, nz(ground.ucs));
  const dens = clamp(nz(ground.abrasivity, 0.4));
  const qcMpa = clamp(c.qcSoftFloor + c.qcFromUcsMpa * ucs + c.qcFromDensity * dens * dens,
                      c.qcSoftFloor, c.qcMax);
  const coarse = clamp(dens / c.rfDensRef);           // 0 = all fines, 1 = clean granular
  const rf = lerp(c.rfClay, c.rfSand, coarse);        // friction ratio, %
  const qcKpa = qcMpa * 1000;
  const fs = (qcKpa * rf) / 100;                      // kPa
  const u0 = Math.max(0, nz(depth) - nz(waterTableM, c.waterTableM)) * c.u0PerM;
  // Excess pore pressure: a fine-grained bed generates it, a dense granular one
  // dilates and drops below hydrostatic. The cone can and does read negative.
  const excess = ((1 - coarse) * c.u2ExcessClay + coarse * c.u2DilateSand) * qcMpa * 10;
  const hasU2 = m.probe && m.probe.piezo !== false;
  // No pore-pressure channel means no u2 and no qt — NOT a u2 of zero, which
  // would silently claim hydrostatic and read as a correction that happened.
  // `qt: null` is the honest answer and the UI must show a blank, not a number.
  const u2 = hasU2 ? clamp(u0 + excess, -80, 4000) : null;
  const qt = hasU2 ? qcMpa + (u2 * (1 - c.netAreaRatio)) / 1000 : null;
  const a = 3.47 - Math.log10(Math.max(1e-3, qcKpa / c.paKpa));
  const b = Math.log10(Math.max(1e-3, rf)) + 1.22;
  return { qc: qcMpa, qt, fs, rf, u0, u2, hasU2, isbt: Math.sqrt(a * a + b * b), coarse };
}

/** Soil behaviour type band for a non-normalised SBT index. */
export function sbtName(isbt) {
  if (!Number.isFinite(isbt)) return 'unknown';
  if (isbt < 1.31) return 'Gravelly sand';
  if (isbt < 2.05) return 'Sand';
  if (isbt < 2.60) return 'Sand mixture';
  if (isbt < 2.95) return 'Silt mixture';
  if (isbt < 3.60) return 'Clay';
  return 'Organic soil';
}

/* ── SPT ───────────────────────────────────────────────────────────────── */

/** Normalised ground resistance to a driven split-spoon. */
export function sptResistance(m, ground) {
  const s = m.probe.spt;
  const hard = hardnessOf(nz(ground.ucs));
  const dens = clamp(nz(ground.abrasivity, 0.4));
  return 0.20 + s.resistK * (0.35 * hard + 0.75 * dens * dens);
}

/**
 * The rod-length correction. It is 0.75 below 3 m and only reaches 1.00 past
 * 10 m — so the shallowest tests are the least reliable ones, and the
 * foundation sits on exactly those.
 */
export function sptRodCorrection(m, depth) {
  const s = m.probe.spt;
  return lerp(s.crShallow, 1, sstep(s.crShallowM, s.crFullM, Math.max(0, nz(depth))));
}

/**
 * THE FOUNDER POINT — the weight on bit past which the rate stops answering.
 *
 * It is not a property of the bit alone. It is where the bit can no longer
 * clear what it is cutting, so it moves with three things:
 *
 *   - hole cleaning. Flow that lifts the cuttings away raises the founder
 *     point; a fouled annulus lowers it under your feet while you are drilling.
 *   - the formation. Below `ballingUcs` the cuttings are sticky and a bit balls
 *     up long before it runs out of weight — the classic top-hole problem.
 *   - the cutting structure. A long-tooth milled bit balls early, a PDC without
 *     a depth-of-cut control ring stalls early, a hard-formation TCI takes more
 *     weight than either.
 *
 * @param {Object} m           method tuning
 * @param {Object} [bit]       bit archetype (its `founder` multiplier)
 * @param {number} ucs         formation strength, MPa
 * @param {number} cleanliness 0..1 — how well the hole is being cleaned
 * @returns {number|null} weight-on-bit (0..1) at the founder point
 */
export function founderPoint(m, bit, ucs, cleanliness) {
  if (!m || !m.founderWob) return null;
  const c = m.founderClean || [0.70, 0.58];
  let f = m.founderWob * (c[0] + c[1] * clamp(nz(cleanliness, 0.5)));
  if (m.ballingUcs) {
    f *= lerp(nz(m.ballingSoftMul, 0.7), 1, sstep(0, m.ballingUcs, Math.max(0, nz(ucs))));
  }
  f *= nz(bit && bit.founder, 1);
  return clamp(f, 0.08, 1.0);
}

/**
 * The inputs a competent driller would be running right now.
 * Drives the sweet-spot centre, the par time, the forecast hints and the
 * straightness reference — so "in the band" always means "drilling well".
 */
export function optimalInputs(m, ground, depth = 0, bit = null) {
  // Two of the methods do not drill, and nothing below this applies to them.
  if (m.kind === 'impact') {
    // START SOFT, FINISH HARD. Where a pile driver sits on the hammer's power
    // curve is decided by the resistance under the toe: fast light blows
    // through the soft beds, slow heavy ones onto the bearing stratum. And the
    // alignment is plumb, because there is never a reason for it not to be.
    const p = m.pile;
    const res01 = clamp((driveResistance(m, ground, depth) - 1) / p.optResRef);
    return {
      wob: clamp(p.optEnergyBase + p.optEnergyPerRes * res01, 0.15, 0.95),
      rpm: clamp(p.optRateBase - p.optRatePerRes * res01, 0.10, 0.95),
      flush: p.alignCentre,
    };
  }
  if (m.kind === 'push') {
    // 20 mm/s, exactly. The cone does not turn and nothing is circulated.
    const c = m.probe.cpt;
    return { wob: clamp(c.rateMmS / c.rateMaxMmS), rpm: 0, flush: 0 };
  }

  const hard = hardnessOf(ground.ucs);
  const hard01 = clamp((hard - T.rock.hardMin) / (T.rock.hardMax - T.rock.hardMin));
  let wob = nz(m.optWob, 0.5);
  let rpm = nz(m.optRpm, 0.6);
  let flush = nz(m.optFlush, 0.6);

  if (m.founderWob) {
    // A founder-limited method is not drilled by feel. You creep the weight up
    // until the rate stops answering and park a shade under that, and you bring
    // the rotation down as the rock hardens so the cutting structure survives.
    // The reference is a hole being cleaned properly — foul it and the real
    // founder point drops below this, which is exactly the pressure the
    // cuttings model is supposed to apply.
    const cleanRef = clamp(nz(m.optFlush, 0.6) * (1 - T.groove.targetLoad));
    const f = founderPoint(m, bit, ground.ucs, cleanRef);
    wob = clamp(f * nz(m.founderOptFrac, 0.95), 0.12, 0.95);
    rpm = clamp(nz(m.optRpm, 0.5) + 0.22 * (1 - hard01) - 0.12 * hard01, 0.18, 0.95);
  } else if (m.kind === 'rotary') {
    wob = clamp(0.30 + 0.45 * hard01, 0.15, 0.95);   // lean on hard rock
    rpm = clamp(0.90 - 0.45 * hard01, 0.20, 0.95);   // and slow the table down
  } else if (m.kind === 'auger') {
    wob = clamp(m.optWob + 0.20 * hard01, 0.15, 0.9);
    rpm = clamp(m.optRpm - 0.20 * hard01, 0.25, 0.95);
  } else if (m.kind === 'percussive') {
    wob = clamp(m.optWob + 0.06 * hard01, 0.1, 0.9); // a touch more coupling in hard rock
    if (m.rateFromFlush) flush = clamp(m.optFlush + nz(m.airDepthDemand) * depth, 0.35, 0.98);
    if (m.indexMatch) rpm = clamp(nz(m.indexBase, 0.25) + nz(m.indexPerAir, 0.55) * flush, 0.1, 0.95);
  } else if (m.kind === 'sonic') {
    rpm = m.resonanceCentre;
  }
  // Dirty ground needs more flow; soft ground needs less or it washes out.
  flush = clamp(flush + 0.12 * (ground.water || 0) - 0.10 * (1 - (ground.stability ?? 1)), 0.15, 0.98);
  return { wob, rpm, flush };
}

/**
 * ROP model — method-specific character. Returns m/h plus the diagnostic terms
 * so the HUD and the tuning harness can see WHY it is what it is.
 *
 * env: { depth, load, wear, heat, returns, stability, combo, casing, torque01 }
 */
export function ropModel(m, bit, ground, inp, env) {
  const ucs = Math.max(0, nz(ground.ucs));

  /* ── driven piling: nothing is cut, so nothing below applies ───────────
     A pile has no rate of penetration in the drilling sense. What it has is a
     permanent set per blow and a blow rate, and the two are on one hydraulic
     envelope. Their product is the rate, and it falls to nothing at refusal —
     which is a legitimate result, not a stall. */
  if (m.kind === 'impact') {
    const p = m.pile;
    const h = hammerSetting(m, inp.wob, inp.rpm);
    // The PROTECT control is the alignment; `alignCentre` is plumb. Out of
    // line and the blow stops landing on the pile centre.
    const off = Math.abs(clamp(inp.flush) - p.alignCentre) / Math.max(1e-3, p.alignCentre);
    const align = lerp(1, p.alignEffMin, clamp(off));
    // Hammer and cushioning efficiency: hydraulic hammers measure 65-90 %, and
    // where in that range you sit is the dolly's condition and its material.
    const eff = clamp(lerp(p.effHydraulic[0], p.effHydraulic[1], clamp(nz(env.dollyCond, 1)))
                      * nz(bit.aggression, 1), p.dollyEffMin * 0.9, 0.98);
    const delivered = h.energy01 * eff * align;
    const setMm = setPerBlow(m, ground, nz(env.embedM, env.depth), delivered);
    const rop = Math.min(m.ropMax, (setMm / 1000) * h.bpm * 60);
    return {
      rop, potential: rop, isVoid: false, setMm, delivered, hammer: h,
      terms: { base: rop, setMm, delivered, bpm: h.bpm, dropM: h.dropM, align, eff,
               energyKnm: h.kNm, capped: h.capped },
    };
  }

  /* ── CPT: pushed, not drilled ─────────────────────────────────────────
     The rate is whatever the operator holds, until the ground asks for more
     reaction than the rig can mobilise — at which point the rods rebound, the
     machine starts to move, and the sounding is over. */
  if (m.kind === 'push') {
    const c = m.probe.cpt;
    const want = clamp(inp.wob) * c.rateMaxMmS;
    const resist = clamp(nz(env.groundResist, 0));
    const capable = resist >= c.thrustCapacity01
      ? 0
      : 1 - (resist / c.thrustCapacity01) * 0.35;
    const mmS = want * capable;
    return {
      rop: mmS * 3.6, potential: c.rateMmS * 3.6, isVoid: false, rateMmS: mmS,
      terms: { base: mmS * 3.6, rateMmS: mmS, commandedMmS: want, capable },
    };
  }

  /* ── a pass that is LIFTED, not driven ────────────────────────────────
     A jet grouting monitor coming back up a hole that already exists has no
     rate of penetration: it has a WITHDRAWAL RATE, which is whatever the
     operator commands off the ADVANCE control, capped by the machine. Running
     it through the rotary model below would make the rate a function of rock
     the monitor is not touching — and would make the ADVANCE control push the
     string DOWN, which is the whole defect this method was carrying.

     Same shape as the CPT push above, and the same reason: some passes are
     commanded rather than cut. `env.stageLiftMaxMh` is set only by a stage
     that declares `liftMaxMh`, so nothing else can reach this branch. */
  if (nz(env.stageLiftMaxMh) > 0) {
    const cmd = clamp(inp.wob);
    const rop = cmd * env.stageLiftMaxMh;
    return {
      rop, potential: env.stageLiftMaxMh, isVoid: false,
      terms: { base: rop, lift: 1, commanded: cmd },
    };
  }

  // Free-fall through a void: the bit is not cutting anything.
  if (ucs <= T.rock.voidUcs) {
    const fall = T.rop.freeFallMh * (0.25 + 0.75 * clamp(inp.wob));
    return { rop: fall, potential: T.rop.freeFallMh, isVoid: true, terms: { free: 1 } };
  }

  const ucsEff = Math.max(ucs, nz(m.ucsFloor, 4));
  const strength = Math.pow(ucsEff, nz(m.ucsExp, 0.8));

  // Rotation actually delivered: the rig droops when the torque limit is hit.
  const over = Math.max(0, nz(env.torque01) - T.torque.overLimit);
  const rpmEff = clamp(inp.rpm * (1 - T.rop.stallDroop * over), 0, 1);
  const wobEff = clamp(inp.wob * nz(bit.wobCap, 1), 0, 1.2);
  const flushEff = clamp(inp.flush, 0, 1);

  let base = 0;
  let coupling = 1, index = 1, resonance = 1, depthFactor = 1;
  let founder = 1, founderAt = 0;

  if (m.kind === 'percussive') {
    // Blow energy and blow rate. On DTH the air does both jobs; on a top hammer
    // the drifter does, and the air only cleans.
    const drive = m.energyFromFlush ? flushEff : rpmEff;
    const rate = lerp(m.blowHz[0], m.blowHz[1], m.rateFromFlush ? flushEff : rpmEff);
    const energy = 0.25 + 0.75 * drive;
    coupling = bellStall(wobEff, m.optWob, m.wobSigma, m.wobStallK, T.rop.couplingFloor);
    if (m.indexMatch) {
      // Rotation has to index the buttons onto fresh rock between blows.
      const matched = clamp(nz(m.indexBase, 0.25) + nz(m.indexPerAir, 0.55) * flushEff, 0, 1);
      index = Math.max(0.25, bell(rpmEff, matched, m.indexSigma));
    }
    if (m.depthEnergyRef) depthFactor = 1 / (1 + nz(env.depth) / m.depthEnergyRef); // rod losses
    base = m.K * energy * rate * coupling * index * depthFactor / strength;
  } else if (m.kind === 'sonic') {
    resonance = Math.max(0.12, bell(rpmEff, m.resonanceCentre, m.resonanceSigma));
    base = m.K * Math.pow(Math.max(1e-3, wobEff), m.wobExp) * resonance / strength;
  } else {
    // Rotary / auger / core
    base = m.K * Math.pow(Math.max(1e-3, wobEff), m.wobExp)
               * Math.pow(Math.max(1e-3, rpmEff), m.rpmExp) / strength;

    // Founder. Past the founder point the bit stops clearing what it cuts:
    // a milled tooth balls up, a PDC stalls, and the rate falls away while the
    // torque keeps climbing. `founderExp` below 1 gives the penalty an infinite
    // slope at the point itself, so the peak of rop(wob) sits ON the founder
    // point rather than somewhere above it — which is what makes "creep the
    // weight up until it stops answering" the right thing to do.
    if (m.founderWob) {
      const cleanliness = clamp(flushEff * clamp(nz(env.returns, 1)) * (1 - clamp(nz(env.load))));
      founderAt = founderPoint(m, bit, ucs, cleanliness);
      const over = Math.max(0, wobEff - founderAt);
      if (over > 0) {
        founder = Math.max(nz(m.founderFloor, 0.30),
                           1 - nz(m.founderK, 1.5) * Math.pow(over, nz(m.founderExp, 0.75)));
        base *= founder;
      }
    }
  }

  // Method/ground mismatch: percussion in mud, augers in granite.
  let softEff = 1;
  if (m.softFloorUcs > 0) softEff = lerp(m.softEffMin, 1, sstep(0, m.softFloorUcs, ucs));
  let rockEff = 1;
  if (m.rockCeilingUcs) rockEff = lerp(1, 0.02, sstep(m.rockCeilingUcs * 0.35, m.rockCeilingUcs, ucs));

  // Bit condition, grade and fitment.
  const wearEff = clamp(1 - T.rop.wearPenalty * Math.pow(clamp(nz(env.wear)), T.rop.wearExp), 0.03, 1);
  const glazeEff = 1 - T.rop.glazePenalty * sstep(T.rop.glazeHeat, 1, nz(env.heat));
  const bitEff = nz(bit.aggression, 1) * (bitFits(bit, m) ? 1 : T.bitMismatchEff);

  // Hole cleaning: a choked annulus grinds the cuttings instead of the rock.
  const cleanEff = 1 - T.rop.cleanCollapse * sstep(T.rop.cleanKnee, 1, nz(env.load));

  // Flushing character: augers spend time cleaning, diamonds burn without water.
  let flushEffMul = 1;
  if (m.flushIsSpoil) flushEffMul = 1 - nz(m.flushRopCost) * flushEff;
  if (m.flushCritical) {
    flushEffMul *= lerp(0.30, 1, sstep(m.flushCritical * 0.4, m.flushCritical, flushEff * nz(env.returns, 1)));
  }

  // A collapsing hole drags on the string. Except at a tunnel face, where bad
  // ground does not slow the drill at all — it SHORTENS THE ROUND, and the
  // weekly advance falls with the round length rather than with the rate.
  const stabEff = m.stabilityRopImmune
    ? 1 : 1 - T.rop.stabilityDrag * (1 - clamp(nz(env.stability, 1)));
  const casingMul = env.casing ? T.stability.casingRopMul : 1;
  const combo = nz(env.combo, 1);

  const stageMul = clamp(nz(env.stageRopMul, 1), 0.05, 4);
  const potential = base * softEff * rockEff * bitEff * flushEffMul * stageMul;
  let rop = potential * wearEff * glazeEff * cleanEff * stabEff * casingMul * combo;
  rop = Math.min(rop, m.ropMax * combo);

  return {
    rop: Math.max(0, rop),
    potential: Math.max(0, Math.min(potential, m.ropMax)),
    isVoid: false,
    founderAt: founderAt || null,
    foundered: founder < 0.995,
    terms: { base, coupling, index, resonance, depthFactor, softEff, rockEff,
             wearEff, glazeEff, cleanEff, flushEffMul, stabEff, bitEff, rpmEff, wobEff,
             founder, founderAt },
  };
}

/**
 * Torque model — the gauge the whole game is played on. 1.0 = rig limit.
 * Rises with weight, cuttings, abrasivity, depth (rod friction), open-hole drag,
 * a dull bit, and whatever is currently binding the string.
 */
export function torqueModel(m, bit, ground, inp, env) {
  const t = m.torque;
  const hard = hardnessOf(nz(ground.ucs));
  const wobEff = clamp(inp.wob * nz(bit.wobCap, 1), 0, 1.2);
  const rpmEff = clamp(inp.rpm, 0, 1);
  const load = clamp(nz(env.load));

  let q = t.base;
  q += t.wob * wobEff * Math.pow(hard, T.torque.cutHardExp);           // cutting reaction
  q += t.cut * Math.pow(load, T.torque.cuttingsExp);                   // cuttings drag
  q += t.abr * clamp(nz(ground.abrasivity, 0.5)) * rpmEff;             // wall friction
  q += t.depth * (nz(env.depth) / T.torque.depthRef);                  // rod string friction
  q += T.stability.dragTorque * clamp(nz(env.drag), 0, T.stability.dragMax); // open-hole drag
  q += t.wear * clamp(nz(env.wear)) * rpmEff;                          // dull bit rubbing
  q += T.torque.bindGain * clamp(nz(env.bind), 0, T.jam.bindMax);      // binding string
  q += nz(env.hazardTorque);                                           // boulder spike etc.
  if (env.casing) q += T.stability.casingTorqueAdd;
  return Math.max(0, q);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SYNTHETIC GEOLOGY — only used when ctx.geology is absent, so the sim is
   playable and testable standalone.
   ═══════════════════════════════════════════════════════════════════════════ */
const SYNTH_PROFILES = {
  nordic:   ['topsoil', 'till', 'till', 'gneiss', 'granite'],
  german:   ['topsoil', 'clay', 'sand', 'marl', 'limestone'],
  alpine:   ['topsoil', 'till', 'schist', 'gneiss', 'granite'],
  iberian:  ['topsoil', 'clay', 'limestone', 'limestone', 'quartzite'],
  northsea: ['sand', 'clay', 'chalk', 'shale', 'sandstone'],
  sahara:   ['sand', 'gravel', 'sandstone', 'shale', 'limestone'],
  chile:    ['topsoil', 'gravel', 'schist', 'granite', 'quartzite'],
  arctic:   ['topsoil', 'permafrost', 'till', 'gneiss', 'granite'],
  _default: ['topsoil', 'clay', 'till', 'sandstone', 'granite'],
};
/* The region ids the rest of the game actually uses (game/data.js REGIONS).
   Without these the fallback stack quietly served granite at 2,000 m to a well
   in the North Sea, which is not a balance problem — it is a wrong answer. */
SYNTH_PROFILES['north-sea'] = SYNTH_PROFILES.northsea;
SYNTH_PROFILES['german-site'] = SYNTH_PROFILES.german;
SYNTH_PROFILES['iberian-quarry'] = SYNTH_PROFILES.iberian;
SYNTH_PROFILES.andes = SYNTH_PROFILES.chile;

/** Build a plausible layer stack down past `targetDepth` metres. */
export function synthProfile({ regionId = 'nordic', targetDepth = 40, seed = 1, ground = null } = {}) {
  const rnd = makeRandom((seed | 0) || 1);
  const total = Math.max(6, targetDepth * 1.25 + 10);

  // A contract that already carries a measured ground column (`groundSpec`) is
  // the authority: use its beds and its contacts verbatim rather than rolling a
  // new stack that disagrees with the one the player was shown on the board.
  if (Array.isArray(ground) && ground.length && typeof ground[0] === 'object') {
    const strata = [];
    let prev = 0;
    for (let i = 0; i < ground.length; i++) {
      const src = ground[i] || {};
      const id = GROUND[src.id] ? src.id : 'clay';
      const g = GROUND[id];
      const top = nz(src.top, prev);
      const bottom = Math.max(top + 0.5, nz(src.bottom, top + 5));
      strata.push({
        id, name: g.name, top, bottom, index: i,
        ucs: g.ucs, abrasivity: g.abrasivity, stability: g.stability, water: g.water,
        colors: g.colors, pattern: g.pattern, grain: g.grain, bestMethods: [],
      });
      prev = bottom;
    }
    if (strata.length) {
      strata[strata.length - 1].bottom = Math.max(strata[strata.length - 1].bottom, total);
    }
    return strata;
  }

  const ids = (Array.isArray(ground) && ground.length
    ? ground : SYNTH_PROFILES[regionId] || SYNTH_PROFILES._default).slice();
  const strata = [];
  let top = 0;
  for (let i = 0; i < ids.length; i++) {
    const id = GROUND[ids[i]] ? ids[i] : 'clay';
    const g = GROUND[id];
    const last = i === ids.length - 1;
    // Shallow layers thin; the bedrock takes whatever is left.
    const share = rnd.range(0.10, 0.26) * (i === 0 ? 0.35 : 1);
    const thick = last ? Math.max(2, total - top) : Math.max(0.8, total * share);
    strata.push({
      id, name: g.name, top, bottom: top + thick, index: i,
      ucs: g.ucs, abrasivity: g.abrasivity, stability: g.stability, water: g.water,
      colors: g.colors, pattern: g.pattern, grain: g.grain, bestMethods: [],
    });
    top += thick;
    if (top >= total) break;
  }
  if (strata.length) strata[strata.length - 1].bottom = Math.max(strata[strata.length - 1].bottom, total);
  return strata;
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */
export function createDrillSim(ctx = {}) {
  const bus = ctx.bus || { on: () => () => {}, emit: () => {} };
  const EV = EVENTS;
  const subs = [];
  const H = 1 / T.sim.hz;                       // fixed physics step (player seconds)

  let rand = makeRandom(0xD121);
  let viewport = { w: 400, h: 800, dpr: 1 };

  /* ── run state ──────────────────────────────────────────────────────── */
  const S = newRunState();

  function newRunState() {
    return {
      active: false,
      phase: 'idle',       // idle|drilling|rod-add|tripping-out|bit-swap|tripping-in|casing-run|stuck|complete|aborted
      phaseT: 0,
      phaseDur: 0,
      stopReason: null,

      contract: null,
      methodId: 'auger',
      /* 'air' | 'water' | 'mud' | 'foam' | 'none', or NULL when the caller did
         not tell us. Null is published as null and warned about once — see
         resolveFlushMedium(). A guessed medium draws the wrong plume. */
      flushMedium: null,
      m: methodOf('auger'),
      bit: bitOf('auger-flight-std', methodOf('auger')),
      difficulty: 1,

      /* ── the three depths ────────────────────────────────────────────
         `depth` is what the CONTRACT is measured in and what the section band
         scrolls with. `holeDepth` is metres into the unit being worked right
         now — this hole of the fan, this hole of the round, this bolt hole.
         `stringDepth` is how much string is actually in the ground, which is
         what loads the rods, damps the blow and lengthens the annulus. On a
         method that drills one hole all three are the same number. */
      depth: 0,
      holeDepth: 0,
      stringDepth: 0,
      target: 0,
      timeSec: 0,          // player seconds since startHole
      drillSec: 0,         // player seconds actually making hole
      downholeSec: 0,      // compressed (real drilling) seconds

      // inputs: commanded (raw, from the UI) and actual (actuator-lagged)
      cmd: { wob: 0.5, rpm: 0.5, flush: 0.5 },
      act: { wob: 0.5, rpm: 0.5, flush: 0.5 },

      rop: 0, ropPotential: 0, torque: 0, torqueJitter: 0,
      /* THE GAUGE the green band is measured against. It is the torque on
         every method that turns something. On a driven pile it is the SET, in
         mm per blow; on a CPT it is the PUSH RATE, in mm/s. The groove, the
         band and the display all read `gauge`, so one mechanic serves all
         three and a player who can read one gauge can read the others. */
      gauge: 0, gaugeRaw: 0,
      /* The method's own programme — the sequence of bags, rounds, fan holes,
         bolts, blows or tests the run is actually made of. Null on a method
         that simply drills a hole. See startProgramme(). */
      prog: null,
      beat: null,          // the live timed interruption, if there is one

      /* ── STAGE: which pass of a two-pass method is running ──────────────
         Raise boring drills a pilot DOWN and then pulls a reamer UP; HDD bores
         a pilot and then backreams the product pipe HOME. The cross-section
         can draw both, but only if it is told which one is running and how far
         through it is — so the sim owns `stage` and `stageProgress`, PUSHES
         them into world/geology.js through setStage(), and mirrors them onto
         state.drill for anything that would rather poll. A single-pass method
         sits at stage 0 for the whole run and none of this does anything. */
      stage: 0, stageProgress: 0, stageCount: 1,
      pushedStage: -1, pushedStageProgress: -1,
      wear: 0, heat: 0, load: 0, returns: 1,
      stability: 1, erosion: 0, drag: 0, casedDepth: 0,
      casingOn: false, casingArmed: false,
      bind: 0, jamState: 'free', stuckSec: 0, rescuePhase: 0, rescueCycles: 0, lastRescueCycle: -1,
      rodFatigue: 0, kickCooldown: 0,

      rods: 1, nextRodDepth: 0, rodAdd: null, rodsAdded: 0, perfectRods: 0,
      bailingRuns: 0,      // a stringless method counts these, and never "rods"

      /* ── mud, pore pressure and well control (wellControl methods only) ──
         Everything here is in specific gravity. `mudLevel` is the fraction of
         the hydrostatic column still in the hole: lose returns and it falls,
         and the pressure holding the formation back falls with it. */
      mudId: null, mud: null, mudWeight: 1.15, mudLevel: 1,
      poreZone: null, thiefZone: null,
      poreSg: 1.05, overbalance: 0, ecd: 0,
      influx: 0, shutIn: false, stickClock: 0,
      kicksHandled: 0, kicksLate: 0, wellControlEvents: 0, kills: 0,
      hasLcm: false, lcmUsed: false,

      /* ── the bit you cannot see ──────────────────────────────────────
         `wear` is the truth. `wearBook` is the driller's running estimate,
         built from metres and the formation the log SAID was there, carrying a
         bias sampled when the bit went in the hole. On a blind-wear method the
         gauges show the book; the truth arrives when the bit does. */
      wearBook: 0, wearBias: 1, bearing: 0,

      fishing: false, twistOffs: 0,

      combo: 1, greenBandTime: 0, inBand: false, bandEnterGrace: 0,
      grooveAccum: 0, bandCentre: 0.5, bandHalf: T.groove.baseHalfWidth,
      bandJumpT: 0, driftPhase: [0, 0],

      ground: fallbackGround(), groundId: '', stratumIndex: 0,
      strata: [], syntheticGeology: false,

      hazards: [], hazardsSeen: 0, hazardsClean: 0, hazardLog: [],
      recentHazards: [],
      warning: null,
      lostCirc: 0, waterInflow: 0, waterFlowLpm: 0,
      safetyEvents: 0, jamIncidents: 0, overSec: 0, hotSec: 0,
      deviation: 0, bitStartWear: 0, bitsUsed: 0,

      parSec: 60,
      blowPhase: 0, blowsPending: 0, impactAccum: 0,
      lastImpactT: 0, lastHapticT: 0, lastBeatHapticT: 0,
      wornFired: false, breakArmed: 0, rodBreakArmed: 0,
      externalGeology: { stratum: false, boulder: false, cavity: false, water: false },
      tripResolve: null,
    };
  }

  /* smoothed display duals — the sim stays crisp underneath */
  const D = { rop: 0, torque: 0, gauge: 0, wear: 0, wearBook: 0, heat: 0, load: 0,
              stability: 1, depth: 0, combo: 1, bandCentre: 0.5 };

  /* ── skills ─────────────────────────────────────────────────────────── */
  function skillRank(kind) {
    const sk = ctx.state?.player?.skills;
    if (!sk) return 0;
    let best = 0;
    for (const id of T.skills[kind] || []) {
      const v = sk[id];
      if (typeof v === 'number' && v > best) best = v;
    }
    return clamp(best, 0, T.skills.maxRank);
  }
  /** multiplicative skill bonus, 1.0 with no ranks */
  const skillBonus = (kind) => 1 + skillRank(kind) * (T.skills.perRank[kind] || 0);

  /* ── ground sampling ────────────────────────────────────────────────── */
  function fallbackGround() {
    const g = GROUND.clay;
    return { id: 'clay', name: g.name, ucs: g.ucs, abrasivity: g.abrasivity,
             stability: g.stability, water: g.water, index: 0, top: 0, bottom: 999 };
  }

  /** Normalise whatever geology hands back into the shape the model needs. */
  function normaliseGround(raw, depth) {
    if (!raw || typeof raw !== 'object') return null;
    const base = raw.stratum && typeof raw.stratum === 'object' ? raw.stratum : null;
    const id = raw.id || base?.id || '';
    const known = GROUND[id] || null;
    const pick = (k, d) => nz(raw[k], nz(base?.[k], nz(known?.[k], d)));
    return {
      id: id || 'unknown',
      name: raw.name || base?.name || known?.name || 'Ground',
      ucs: pick('ucs', 20),
      abrasivity: clamp(pick('abrasivity', 0.5)),
      stability: clamp(pick('stability', 0.7)),
      water: clamp(pick('water', 0.3)),
      index: nz(raw.index, nz(base?.index, 0)),
      top: nz(base?.top, nz(raw.top, depth)),
      bottom: nz(base?.bottom, nz(raw.bottom, depth + 10)),
      boulder: raw.boulder || null,
      cavity: raw.cavity || null,
      fracture: raw.fracture || null,
    };
  }

  function groundFromSynth(depth) {
    const list = S.strata;
    for (let i = 0; i < list.length; i++) {
      if (depth < list[i].bottom) {
        const s = list[i];
        return { id: s.id, name: s.name, ucs: s.ucs, abrasivity: s.abrasivity,
                 stability: s.stability, water: s.water, index: i, top: s.top, bottom: s.bottom,
                 boulder: null, cavity: null, fracture: null };
      }
    }
    const s = list[list.length - 1];
    return s ? { id: s.id, name: s.name, ucs: s.ucs, abrasivity: s.abrasivity,
                 stability: s.stability, water: s.water, index: list.length - 1,
                 top: s.top, bottom: s.bottom, boulder: null, cavity: null, fracture: null }
             : fallbackGround();
  }

  let forcedGround = null;

  function sampleGround(depth) {
    if (forcedGround) return forcedGround;
    const geo = ctx.geology;
    if (geo && typeof geo.getDrillabilityAt === 'function') {
      try {
        const g = normaliseGround(geo.getDrillabilityAt(depth), depth);
        if (g) return g;
      } catch { /* geology mid-rebuild — fall through */ }
    }
    if (S.strata.length) return groundFromSynth(depth);
    return fallbackGround();
  }

  /** Strata list for forecasts: geology's if it has one, else our synthetic one. */
  function strataList() {
    const geo = ctx.geology;
    const gs = geo && Array.isArray(geo.strata) ? geo.strata : null;
    if (gs && gs.length) return gs;
    if (Array.isArray(ctx.state?.world?.strata) && ctx.state.world.strata.length) return ctx.state.world.strata;
    return S.strata;
  }

  /* ── event plumbing ─────────────────────────────────────────────────── */
  function emit(evt, payload) {
    try { bus.emit(evt, payload); } catch (e) { console.error('[sim] emit', evt, e); }
  }
  function haptic(pattern, force = false) {
    if (ctx.state?.settings?.haptics === false) return;
    const now = S.timeSec;
    if (!force && now - S.lastHapticT < 1 / T.sim.maxHapticHz) return;
    S.lastHapticT = now;
    emit(EV.HAPTIC, { pattern });
  }

  /* ── environment snapshot handed to the pure models ─────────────────── */
  function env(extra) {
    return {
      // `depth` here is the STRING depth, because everything that reads it —
      // rod friction, blow decay down the string, annulus length — is a
      // property of the steel in the ground, not of the contract's progress.
      depth: S.stringDepth, load: S.load, wear: S.wear, heat: S.heat, returns: S.returns,
      stability: S.stability, drag: S.drag, bind: S.bind, combo: S.combo,
      casing: S.casingOn, torque01: S.torque, hazardTorque: hazardTorque(),
      // Read only by the methods that do not drill.
      dollyCond: S.prog && S.prog.kind === 'pile' ? clamp(1 - S.prog.dollyWear) : 1,
      embedM: S.prog && S.prog.kind === 'pile' ? S.prog.toeDepthM : S.stringDepth,
      groundResist: S.groundResist,
      // The way back is not the way down: a reamer head is a far larger face
      // than the pilot bit that made the hole for it.
      stageRopMul: (() => { const st = activeStage(); return st ? nz(st.ropMul, 1) : 1; })(),
      // …and a pass that is LIFTED rather than cut has no rate of penetration
      // at all: the rate is the withdrawal the operator commands. Only a stage
      // that declares `liftMaxMh` ever sets this.
      stageLiftMaxMh: (() => { const st = activeStage(); return st ? nz(st.liftMaxMh, 0) : 0; })(),
      ...extra,
    };
  }

  /* ═════════════════════════════════════════════════════════════════════
     PAR TIME — what a competent driller would take, in player seconds.
     ═════════════════════════════════════════════════════════════════════ */
  /**
   * The reference hole par is measured against.
   *
   * `TUNING.score.par` describes a shallow hole that a driller can hold in the
   * band almost continuously with clean returns. That is a fair reference for
   * a 40 m water bore and a dishonest one for a 1,500 m well, where the band
   * follows a cuttings load that swings with every formation change, the
   * annulus is never as clean as the reference assumes, and the bit is run
   * well past half-worn because tripping early costs more than drilling dull.
   * A method may therefore override any part of the reference; everything
   * without an override keeps exactly the numbers it had before.
   */
  function parReference(m) {
    const pr = T.score.par;
    const o = (m && m.par) || {};
    return {
      combo:   nz(o.combo, pr.combo),
      wearMid: nz(o.wearMid, pr.wearMid),
      heat:    nz(o.heat, pr.heat),
      torque:  nz(o.torque, pr.torque),
      load:    nz(o.load, T.groove.targetLoad),
      returns: nz(o.returns, 1),
      tripDepthFrac: nz(o.tripDepthFrac, 0.55),
    };
  }

  /**
   * How long the string is on a method that drills many short holes. Feeding a
   * jumbo's chainage into the blow-decay term would say the drifter is pushing
   * a blow down forty metres of steel; it is pushing it down 4.8.
   */
  function nominalStringM(m) {
    if (m.round) return m.round.lengthGood;
    if (m.ring) return m.ring.holeLengthM;
    if (m.bolt) return m.bolt.lengthM + m.bolt.overdrillM;
    return Infinity;
  }

  /**
   * Metres of HOLE a run has to drill to deliver `target` of whatever the
   * contract is measured in. They are the same number on a borehole. On a
   * 100 m2 tunnel face, 4.1 m of chainage costs 672 m of hole.
   */
  /**
   * The round schedule a competent crew would actually get out of this heading.
   *
   * It is not `target / 4.8`: the round length is set by the GROUND, and a
   * heading that starts in weak rock is drilled short until it is not. Par has
   * to walk the column the same way the run will, or it prices a tunnel that
   * nobody was ever going to drive.
   */
  function jumboParSchedule(m, target) {
    const r = m.round;
    const holes = Math.max(12, Math.round(nz(S.contract?.faceAreaM2, r.faceAreaM2) * r.holesPerM2));
    let chain = 0, rounds = 0, boreM = 0, beatSec = 0, guard = 0;
    while (chain < target && guard++ < 400) {
      const g = S.strata.length ? groundFromSynth(chain) : sampleGround(chain);
      const len = jumboRoundLength(g);
      const adv = len * r.pullGood;
      // The CUT is drilled at a fraction of the rate the rest of the face is,
      // so its metres cost `cutSlowdown` times what they look like they cost.
      boreM += holes * len * (1 - r.cutFrac) + holes * r.cutFrac * len * r.cutSlowdown;
      beatSec += 4 * r.boomSetupSec + r.chargeSec + r.fireSec + r.muckSecPerM * adv;
      chain += adv;
      rounds++;
    }
    return { rounds: Math.max(1, rounds), boreM: Math.max(target, boreM), beatSec };
  }

  function parBoreMetres(m, target) {
    if (m.round) return jumboParSchedule(m, target).boreM;
    if (m.bolt) {
      const b = m.bolt;
      const bolts = Math.max(1, Math.round(target / (b.ringSpacingM / b.perRing)));
      return bolts * (b.lengthM + b.overdrillM);
    }
    return target;
  }

  /** Player seconds of beats a programme adds on top of the drilling. */
  function parBeatSeconds(m, target) {
    if (m.round) return jumboParSchedule(m, target).beatSec;
    if (m.bolt) {
      const b = m.bolt;
      const bolts = Math.max(1, Math.round(target / (b.ringSpacingM / b.perRing)));
      const type = (S.prog && S.prog.kind === 'bolt') ? S.prog.type : resolveBoltType();
      const install = type === 'friction' ? b.driveSecFull : b.spinSec + b.gelSec + b.holdSec;
      const tests = Math.max(2, Math.ceil(bolts / b.torqueTestEvery) + 1);
      return bolts * (install + b.plateSec) + tests * b.torqueTestSec;
    }
    if (m.ring) {
      const r = m.ring;
      return Math.max(1, Math.round(target / r.holeLengthM)) * r.indexSec;
    }
    if (m.pile) {
      const p = m.pile;
      return p.pitchSec + (p.setBlows / lerp(p.bpmRange[0], p.bpmRange[1], 0.5)) * 60;
    }
    if (m.sample) {
      // The blow-downs. A driller who clears the string on cue is doing the job,
      // not losing time at it, so par carries the cadence.
      return (target / Math.max(1, m.sample.blowDownEveryM)) * T.hazard.carryOver.blowDownSec;
    }
    if (m.probe && m.kind !== 'push') {
      // Every SPT is a 450 mm drive on its own clock, and there is one every
      // 1.5 m of hole. The drives are most of the shift, not an interruption.
      const s = m.probe.spt;
      const tests = Math.max(1, Math.floor(target / m.probe.testEveryM));
      const drivenMm = (s.seatingIncrements + s.testIncrements) * s.incrementMm;
      const blows = drivenMm * s.blowsPerMm * 1.2;
      return tests * ((blows / lerp(s.cadenceBpm[0], s.cadenceBpm[1], 0.6)) * 60 / s.driveTimeMul);
    }
    return 0;
  }

  function computePar(target) {
    const m = S.m;
    const pr = parReference(m);
    const step = Math.max(0.25, target / 120);
    const stringCap = nominalStringM(m);
    let hours = 0;
    for (let d = 0; d < target; d += step) {
      const g = S.strata.length ? groundFromSynth(d) : sampleGround(d);
      const sd = Math.min(d, stringCap);
      const inp = optimalInputs(m, g, sd, S.bit);
      const wear = clamp(S.bitStartWear + pr.wearMid * (d / Math.max(1, target)));
      const r = ropModel(m, S.bit, g, inp, {
        depth: sd, load: pr.load, wear, heat: pr.heat, returns: pr.returns,
        stability: g.stability, combo: pr.combo, casing: S.casingArmed, torque01: pr.torque,
        dollyCond: 1 - pr.wearMid, embedM: sd,
        groundResist: m.probe && m.probe.cpt
          ? clamp(cptTrace(m, g, d, m.probe.cpt.waterTableM).qc / m.probe.cpt.qcMax) : 0,
      });
      hours += step / Math.max(0.2, r.rop);
    }
    // Scale the integral from the contract's own unit to metres of hole, and
    // divide out the booms that are drilling at the same time.
    hours *= parBoreMetres(m, target) / Math.max(1e-6, target);
    if (m.round && m.round.booms > 1) hours /= m.round.booms;

    /* ── THE SECOND PASS ──────────────────────────────────────────────────
       A raise is not finished when the pilot breaks through, and a bore is not
       finished when the head comes out of the ground: the reamer still has to
       come back up and the product pipe still has to be pulled home. The
       contract counts those metres ONCE, `parBoreMetres` returns the contract,
       and so par was pricing half the run — a raise-boring job that did the
       whole of it correctly finished at 2.2x par and scored ZERO on time,
       every time, which cost it the better part of a grade for no mistake.

       The pass is walked with the stage's own rate multiplier and its own
       optimum because it is a different machine, and it carries no rod adds:
       nothing is threaded on the way back, the string is already in the hole. */
    const rev = m.stages && m.stages.length > 1 ? m.stages[1] : null;
    if (rev) {
      const passDepth = Math.min(target, stringCap);
      const passWob = nz(rev.optWob, null);
      let back = 0;
      for (let d = 0; d < target; d += step) {
        // The head comes back along the hole it made, so it meets the column
        // in reverse: at `d` metres of the pass it is at `target - d` of hole.
        const g = S.strata.length ? groundFromSynth(target - d) : sampleGround(target - d);
        const inp = optimalInputs(m, g, passDepth, S.bit);
        if (passWob != null) inp.wob = passWob;
        /* A HALF-WORN HEAD PULLS HARDER, and the only lever that answers is the
           feed — so a competent operator reams the second half of the pass at
           less than the stage optimum, and par has to walk the pass the way it
           will actually be run or it prices a head that never dulls. */
        if (rev.pullPerCutter && rev.pullPerRate) {
          inp.wob = clamp(inp.wob - rev.pullPerCutter * pr.wearMid / rev.pullPerRate, 0.08, 1);
        }
        if (rev.flushOff) inp.flush = 0;
        const wear = clamp(S.bitStartWear + pr.wearMid);
        const r = ropModel(m, S.bit, g, inp, {
          depth: passDepth, load: rev.flushOff ? 0 : pr.load * 0.5, wear,
          heat: pr.heat, returns: pr.returns, stability: g.stability,
          combo: pr.combo, casing: false, torque01: pr.torque,
          stageRopMul: nz(rev.ropMul, 1),
          /* A LIFTED PASS HAS NO RATE OF PENETRATION, and par has to walk it
             through the same branch the run will. `env()` mirrors both of the
             stage's rate controls into the live model; this loop mirrored only
             the first, so par walked a jet grouting lift through the ROTARY
             model — pricing the monitor as if it were re-cutting the soil it
             is being pulled back out of, at a rate set by ground it is not
             touching. Measured: 18 m priced at 113 s against 258 s actually
             run at the stage optimum, so `time` scored 0.000 on a pass played
             correctly — exactly the way raise-boring scored zero before the
             second pass was priced at all. */
          stageLiftMaxMh: nz(rev.liftMaxMh, 0),
        });
        back += step / Math.max(0.2, r.rop);
      }
      hours += back;
    }

    let sec = (hours * 3600) / (T.sim.timeCompression * (S.m.timeMul || 1));


    // Rod handling is real player time, not compressed — and a method that
    // makes up stands with an iron roughneck is quicker at it than one where
    // the driller threads a rod by hand. A method whose connections are too
    // frequent to be a beat does not charge for them here either: they live in
    // the compressed clock, which is where the run actually spends them.
    const rodLen = S.m.rodLength || 0;
    const rodFast = Math.max(0.05, nz(S.m.rodAddSecMul, 1));
    if (rodLen > 0 && S.m.rodAddBeat !== false) {
      sec += Math.floor(target / rodLen) * T.rods.addSecPerfect * rodFast;
    }

    // The programme's own beats: rounds charged and fired, bolts installed and
    // plated, a cradle indexed round a fan, a set taken, a drive counted.
    sec += parBeatSeconds(m, target);

    // TRIPS. On a shallow hole one bit does the job and this is zero. On a deep
    // well it is the single largest number in the run, and par has to contain
    // it or every well grades D for doing the obvious thing. `tripDepthFrac` is
    // the depth a trip is assumed to happen at, as a fraction of target: bits
    // are not consumed evenly, and on a well the expensive changes are the late
    // ones, with the whole string to pull.
    const trips = expectedTrips(target);
    const swap = S.m.blindWear ? (T.trip.swapSec + T.trip.emergencySwapSec) / 2 : T.trip.swapSec;
    if (trips.fwd > 0) {
      const rods = Math.max(1, Math.ceil((target * pr.tripDepthFrac) / Math.max(0.5, rodLen || T.rods.lengthDefault)));
      const per = nz(S.m.tripSecPerRod, T.trip.secPerRod);
      sec += trips.fwd * (2 * rods * per + swap);
    }
    /* A change on the way back is NOT a trip: the crew goes up to the head and
       re-cutters it where it hangs, and the stage carries that number. Pricing
       these as string trips is exactly what `tripSeconds()` stopped the run
       doing, and par has to make the same distinction or it prices a raise at
       eight full trips of 1.5 m stems. */
    if (trips.rev > 0 && rev && rev.cutterChangeSec != null) {
      sec += trips.rev * (2 * rev.cutterChangeSec + swap);
    }
    return Math.max(8, sec * T.score.parHumanFactor);
  }

  /**
   * How many bit changes a competent driller would make over `target` metres
   * with the bit that is fitted. Uses the same wear model the run does, walked
   * down the column at optimal inputs.
   */
  function expectedTrips(target) {
    const w = T.wear, m = S.m;
    const pr = parReference(m);
    const carbide = Math.max(0.3, nz(S.bit.carbide, 1) * skillBonus('bitLife'));
    const step = Math.max(0.5, target / 60);
    // Bits are eaten by metres of HOLE, and on a jumbo or a bolter that is not
    // the number on the contract: 4 m of tunnel costs 670 m of hole and a
    // pattern of bolts costs 2.45 m of hole for every 0.3 m of drive supported.
    const boreScale = parBoreMetres(m, target) / Math.max(1e-6, target);
    /* … and on a TWO-PASS method it is not the number on the contract either.
       A raise is drilled down and reamed up: the tool eats twice the metres
       the contract counts, and walking only the first pass said a 70 m raise
       needed no change at all when it genuinely needs most of a crown, and
       that a 378 m raise needed four when it needs eight. Both par and the
       bit budget are built on this walk, so both were half-priced. */
    const rev = m.stages && m.stages.length > 1 ? m.stages[1] : null;
    let total = S.bitStartWear;
    let consumed = S.bitStartWear;   // whole tool life eaten, changes included
    let fwd = 0, back = 0;
    for (let d = 0; d < target; d += step) {
      const g = S.strata.length ? groundFromSynth(d) : sampleGround(d);
      const dw = w.perMetre * step * boreScale * wearMulAt(g, m, pr.heat, carbide, null);
      total += dw; consumed += dw;
      if (total >= w.wornAt) { total = 0; fwd++; }
    }
    if (rev) {
      // Back up the same column, at the head's own wear rate.
      for (let d = 0; d < target; d += step) {
        const g = S.strata.length ? groundFromSynth(target - d) : sampleGround(target - d);
        const dw = w.perMetre * step * wearMulAt(g, m, pr.heat, carbide, rev);
        total += dw; consumed += dw;
        if (total >= w.wornAt) { total = 0; back++; }
      }
    }
    return { fwd, rev: back, changes: fwd + back, consumed };
  }

  /** The wear multiplier at one point of the column, for a stage or the method. */
  function wearMulAt(g, m, heat, carbide, stage) {
    const w = T.wear;
    const abr = Math.pow(clamp(g.abrasivity), w.abrasivityExp);
    const base = stage && stage.wearMul != null ? stage.wearMul : (m.wearMul || 1);
    let mul = base * abr * (1 + w.heatMul * heat) * hardnessOf(g.ucs) / carbide;
    if (!stage && m.kind === 'percussive') mul *= w.percussionMul;
    return mul;
  }

  /* ═════════════════════════════════════════════════════════════════════
     RUN LIFECYCLE
     ═════════════════════════════════════════════════════════════════════ */
  /**
   * WHICH METHOD THIS RUN IS.
   *
   * ── THIS FUNCTION HAS ALREADY SHIPPED A WRONG ANSWER 513 TIMES ──
   * `ui/screens/site.js` reaches `startHole(undefined)` whenever no contract is
   * in hand, and this chain ended in a bare `|| 'auger'`. A longhole run
   * measured `sim.methodId === 'auger'` on 513 of 519 samples: an underground
   * production rig playing as a surface auger, in silence, through four rounds
   * of review. Nothing crashed. Nothing logged. Everything downstream — vfx,
   * audio, terrain, env — followed it, because they all ask the sim.
   *
   * Two changes stop that repeating.
   *
   * 1. `state.world.site.methodId` joins the chain. `progression.js` publishes
   *    that descriptor when the job is ACCEPTED and — unlike `state.contract`,
   *    which is nulled at settlement from inside `HOLE_COMPLETE` dispatch — it
   *    is never cleared, only marked `live: false`. It is the durable answer to
   *    "what is on screen", which is exactly the question this is.
   * 2. The last two links WARN. The unlocked-methods guess and the terminal
   *    `'auger'` are not resolutions, they are inventions, and an invented
   *    method is worse than no run at all: it is plausible, so it survives.
   */
  function resolveMethodId(contract) {
    const c = contract || {};
    // `c.method` is an id on most callers and the METHOD ROW on a few, so it
    // is only an id when it is a string — otherwise the row itself would be
    // returned as the method id and every table lookup would miss silently.
    const id = c.methodId
        || (typeof c.method === 'string' ? c.method : c.method?.id)
        || ctx.rig?.methodId
        || ctx.state?.contract?.methodId
        /* The SITE, not the contract. Published on accept, still standing at
           settlement — the one place that still knows the method while the
           results screen is up. See HANDOFF §12. */
        || ctx.state?.world?.site?.methodId;
    if (id) return id;

    const guess = (ctx.state?.unlocked?.methods || []).slice(-1)[0];
    if (guess) {
      warnOnce('resolveMethodId:unlocked',
        `[sim] startHole() got no method — no contract, no rig, no state.world.site. `
        + `GUESSING "${guess}" from the last unlocked method. The run, the section, `
        + `the particles and the audio will all play as that method. Pass a contract `
        + `to startHole(), or publish state.world.site before mounting the site screen.`);
      return guess;
    }
    warnOnce('resolveMethodId:auger',
      '[sim] startHole() got no method AND nothing is unlocked — falling back to '
      + '"auger". This is a WRONG ANSWER, not a default: every consumer that asks '
      + 'sim.methodId will now be told it is watching a surface auger.');
    return 'auger';
  }

  /**
   * WHAT THIS RUN CIRCULATES — and why the sim does not keep its own table.
   *
   * `flushMedium` is a `game/data.js` METHODS fact ('air' | 'water' | 'mud' |
   * 'foam' | 'none'). `sim/vfx.js` draws the collar plume from it, `audio.js`
   * voices the pump from it and `economy.js` bills the consumable from it —
   * three consumers, one fact, and the sim publishes about fifty fields beside
   * it without ever publishing this one.
   *
   * It is NOT copied into a table here. This file already carries a private
   * per-method tuning table and HANDOFF §8B is the record of what a second
   * table of one fact costs (`catalog.js`'s parallel universe, the `rodLength`
   * divergence `tools/checkdata.mjs` exists to catch). The fact belongs to the
   * method row, so the sim takes it from the row it was handed — which is also
   * the direction HANDOFF §9.1 wants everything else to move.
   *
   * TODAY THE ROW IS NOT HANDED IN. `makeContract()` (game/data.js) copies
   * `methodId` off the method and stops; there is no `flushMedium` on a
   * contract. So this resolves to null and says so, once, naming the fix.
   * Null published honestly is a consumer falling back to its own table, which
   * is recoverable. A guessed 'air' published as fact is the collar of a jet
   * grouting column drawn as a dust plume, and nobody finds that for four
   * rounds.
   */
  function resolveFlushMedium(c) {
    // `c.method` is an id string on some callers and the METHOD ROW on others.
    const row = c && typeof c.method === 'object' ? c.method : null;
    const fm = (c && c.flushMedium) || (row && row.flushMedium) || null;
    if (fm) return fm;
    warnOnce('flushMedium:missing',
      `[sim] no flushMedium for "${S.methodId}" — the contract does not carry one `
      + 'and the sim will not invent one. state.drill.flushMedium publishes null; '
      + 'consumers fall back to their own per-method tables. FIX: have '
      + 'game/data.js makeContract() copy flushMedium off the method row (or pass '
      + 'the row itself as contract.method).');
    return null;
  }

  /** The fitted loadout, whatever shape the state is in. */
  function loadoutIds() {
    const lo = ctx.state?.garage?.loadout;
    return lo && typeof lo === 'object' ? lo : {};
  }

  /**
   * The mud programme fitted in the `mud` bay, and whether a lost-circulation
   * pill is on board. The sim deliberately does not import game/data.js, so the
   * programme table in TUNING.mud is keyed by the same item ids that file uses.
   */
  function resolveMud() {
    const lo = loadoutIds();
    const table = T.mud.programmes;
    const id = lo.mud || null;
    const prog = (id && table[id]) || table._default;
    S.mudId = id;
    S.mud = prog;
    S.mudWeight = prog.sg;
    S.mudLevel = 1;
    S.hasLcm = Object.keys(lo).some((k) => lo[k] === T.mud.lcmItemId);
  }

  function resolveBit() {
    const lo = loadoutIds();
    // On a driven pile the tool in this slot is not a bit — it is the DOLLY,
    // and it is the thing that wears, that changes what reaches the toe, and
    // that gets changed mid-drive. Same slot, same wear loop, right object.
    const id = (S.m.toolIsDolly ? (lo.dolly || lo.bit) : lo.bit) || null;
    const bit = S.m.toolIsDolly ? dollyOf(id) : bitOf(id, S.m);
    const cond = ctx.state?.garage?.condition?.[id];
    S.bitStartWear = typeof cond === 'number' ? clamp(1 - cond) : 0;
    return bit;
  }

  /**
   * Reset the driller's running estimate of bit wear to what they actually
   * know: the condition the bit went in at, plus a bias they cannot measure.
   */
  function newWearBook() {
    S.wearBook = S.wear;
    S.wearBias = 0.72 + rand.f() * 0.62;
  }

  function startHole(contract) {
    Object.assign(S, newRunState());
    const c = contract || ctx.state?.contract || {};
    S.contract = c;
    S.methodId = resolveMethodId(c);
    // One method genuinely becomes a different machine depending on what is
    // fitted: with a piezocone in the probe slot, site investigation is not a
    // boring rig at all — the cone is pushed, nothing turns and nothing is
    // circulated. Resolve that once, here, and everything downstream is honest.
    S.m = resolveMethod(S.methodId, { probeMode: resolveProbeMode() });
    S.flushMedium = resolveFlushMedium(c);
    S.bit = resolveBit();
    S.wear = S.bitStartWear;
    S.difficulty = clamp(nz(c.difficulty, 1), 0, 5);
    S.target = Math.max(1, nz(c.targetDepth, nz(c.depth, 30)));
    rand = makeRandom(((nz(c.seed, Date.now() & 0xffff) | 0) ^ 0x5EED) >>> 0 || 7);

    // Ground: geology if present, otherwise a synthetic stack so we still play.
    const geo = ctx.geology;
    const geoHas = !!(geo && typeof geo.getDrillabilityAt === 'function'
                      && Array.isArray(geo.strata) && geo.strata.length);
    S.syntheticGeology = !geoHas;
    S.strata = geoHas ? [] : synthProfile({
      regionId: c.regionId || ctx.state?.world?.regionId || 'nordic',
      targetDepth: S.target, seed: nz(c.seed, 1) | 0,
      // A caller may hand us an explicit column (ids, or beds with top/bottom);
      // otherwise the region's synthetic stack. NOT the contract's `groundSpec`:
      // that table and world/geology.js's region recipes are generated
      // independently, and the section the player actually sees is geology's.
      // See the handover note about reconciling the two.
      ground: c.ground || c.profile || null,
    });

    S.ground = sampleGround(0);
    S.groundId = S.ground.id;
    S.stratumIndex = S.ground.index;

    // Mud, pore pressure and the two zones the well can find. Both are laid
    // out at spud from the contract seed, so the same well always has the same
    // hazards in the same place — the drill log is a forecast, not a lottery.
    if (S.m.wellControl) {
      resolveMud();
      const mud = T.mud;
      if (rand.f() < mud.overZoneChance) {
        const top = S.target * rand.range(mud.overZoneFrac[0], mud.overZoneFrac[1]);
        S.poreZone = {
          top,
          bottom: top + rand.range(mud.overZoneThick[0], mud.overZoneThick[1]),
          sg: rand.range(mud.poreOverSg[0], mud.poreOverSg[1]),
        };
      }
      if (S.m.thiefZones && rand.f() < 0.6) {
        const top = S.target * rand.range(0.18, 0.85);
        S.thiefZone = { top, bottom: top + rand.range(15, 90) };
      }
      S.poreSg = mud.poreNormalSg;
      S.overbalance = S.mudWeight - S.poreSg;
    }
    newWearBook();

    // The method's own programme — the sequence of bags, rounds, fan holes,
    // bolts, blows or tests this run is actually made of. Null on a method
    // that simply drills a hole, and then none of it runs.
    S.holeDepth = 0;
    S.stringDepth = 0;
    startProgramme();

    // Casing: duplex methods run it from the collar by default.
    S.casingArmed = !!S.m.casingFollows;
    S.casingOn = S.casingArmed;

    const rodLen = S.m.rodLength || 0;
    S.nextRodDepth = rodLen > 0 ? rodLen : Infinity;
    S.rods = 1;

    // Start the player somewhere sane rather than at whatever the sliders held.
    const inp = optimalInputs(S.m, S.ground, 0, S.bit);
    S.cmd = { ...inp }; S.act = { ...inp };

    S.parSec = computePar(S.target);
    S.torque = torqueModel(S.m, S.bit, S.ground, S.act, env());
    // The set gauge starts where the design set is, so a pile driver opens on
    // the band rather than pegged at zero blows.
    if (S.prog && S.prog.kind === 'pile') S.prog.measuredSetMm = S.prog.designSetMm;
    S.gauge = gaugeNow();
    updateBand(0, true);
    D.rop = 0; D.torque = S.torque; D.gauge = S.gauge; D.wear = S.wear; D.heat = 0; D.load = 0;
    D.stability = S.ground.stability; D.depth = 0; D.combo = 1; D.bandCentre = S.bandCentre;
    D.wearBook = S.wearBook;

    S.active = true;
    S.phase = 'drilling';
    emit(EV.DRILL_START, { methodId: S.methodId, contract: c });
    emit(EV.STRATUM_ENTER, { stratum: S.ground, depth: 0, __sim: true });
    writeState();
    return getTelemetry();
  }

  function abortHole(reason = 'aborted') {
    if (!S.active) return null;
    S.active = false;
    S.phase = 'aborted';
    S.stopReason = reason;
    if (S.tripResolve) { S.tripResolve({ ok: false, reason }); S.tripResolve = null; }
    writeState();
    emit(EV.DRILL_STOP, { reason });
    return { reason, depth: S.depth, timeSec: S.timeSec };
  }

  /* ═════════════════════════════════════════════════════════════════════
     THE GROOVE — a moving green band on the torque gauge.

     The centre is not decoration: it is the torque you would read if you
     were running the physically optimal inputs for this ground, this bit
     and this depth, with a clean hole. So "in the band" literally means
     "drilling this stratum properly". It drifts, it jumps at every stratum
     change, and it narrows as the bit dulls.
     ═════════════════════════════════════════════════════════════════════ */
  /**
   * THE GAUGE the band is measured against, normalised to 0..1.
   *
   * It is the torque on every method that turns something. On a driven pile it
   * is the SET, in mm per blow, read on a square-root scale because the honest
   * range is 5 to 250 blows per 250 mm. On a CPT it is the PUSH RATE in mm/s.
   * Same needle, same band, same groove — three different physical quantities,
   * which is exactly how a driller moves between machines.
   */
  /** The gauge spec in force right now — the stage's, if the stage has one. */
  function currentGauge() {
    const st = activeStage();
    return (st && st.gauge) || S.m.gauge || null;
  }

  function gaugeNow() {
    const m = S.m;
    const g0 = currentGauge();
    const axis = (g0 && g0.axis) || 'torque';
    // The way back is measured in PULL, not in torque and not in metres.
    if (axis === 'pull') return clamp(S.prog ? nz(S.prog.pull) : 0, 0, T.torque.displayMax);
    /* …and on a jet grouting lift it is measured in RETURN. The sourced KPI is
       the column achieved WITH THE RETURN MANAGED, and the failure is losing
       control of it in either direction — nothing coming back, or the annulus
       packing off until the ground heaves. It is the only gauge in this file
       that is wrong at BOTH ends of its travel. */
    if (axis === 'return') return clamp(S.prog?.jet ? nz(S.prog.jet.return01) : 0, 0, T.torque.displayMax);
    if (axis === 'set') {
      const mm = S.prog ? S.prog.measuredSetMm : 0;
      return clamp(Math.pow(clamp(mm / m.pile.setGaugeMaxMm), m.pile.gaugeExp));
    }
    if (axis === 'push-rate') {
      return clamp((S.rop / 3.6) / m.probe.cpt.rateMaxMmS);
    }
    return S.torque;
  }

  /** Where the needle would sit if the job were being done correctly. */
  function gaugeIdeal() {
    const g = TUNING.groove, m = S.m;
    const g0 = currentGauge();
    const axis = (g0 && g0.axis) || 'torque';
    if (axis === 'pull') {
      // The pull a good operator holds: enough to keep the cutters engaged,
      // and not so much that the head stalls in the rock it is breaking.
      const st = activeStage();
      const hard = hardnessOf(S.ground.ucs);
      /* THE LOAD THE PASS CAN ACTUALLY HAVE. `groove.targetLoad` describes a
         hole being drilled and cleaned; a raise mucks by gravity and holds
         essentially nothing, so charging the band centre for 0.30 of annulus
         load put the centre 0.06 above any pull the stage's own optimum can
         produce — and the only way onto the band was to haul at 0.58 when the
         stage says 0.45. The band has to be reachable AT the optimum, or it is
         telling the operator to do the wrong thing. */
      const bandLoad = st.flushOff ? 0 : g.targetLoad;
      return clamp(st.pullBase + st.pullPerHard * hard
                   + st.pullPerRate * nz(st.optWob, 0.45)
                   + st.pullPerLoad * bandLoad
                   + nz(st.pullPerUnstable, 0) * clamp(1 - S.ground.stability),
                   /* NO CUTTER TERM. The band follows bit wear on the torque
                      axis because there the penalty is the rate, and the band
                      following keeps the lever honest. Here the penalty IS the
                      needle: dull cutters walk the pull up out of the band and
                      on toward the stall, and the answer is to go up and change
                      them. A band that followed them would make a worn set
                      free, which is the one thing it must not be. */
                   0.08, 0.95);
    }
    /* A managed return. Not a maximum and not a minimum: a jet grouting crew
       wants spoil coming steadily over the collar and pumped away, and both
       "none" and "too much to pass" are the same failure with opposite signs.
       This is a written target rather than a moving sweet spot, so it does not
       drift and it does not narrow with a dull nozzle — `bandDrift` is left
       alone for the pre-drill and the fixed half-width below owns the pass. */
    if (axis === 'return') {
      const st = activeStage();
      return clamp(nz(st && st.jet && st.jet.retIdeal, 0.5), 0.1, 0.95);
    }
    if (axis === 'set') {
      const d = S.prog ? S.prog.designSetMm : 5;
      return clamp(Math.pow(clamp(d / m.pile.setGaugeMaxMm), m.pile.gaugeExp));
    }
    if (axis === 'push-rate') return clamp(m.probe.cpt.rateMmS / m.probe.cpt.rateMaxMmS);
    const inp = optimalNow();
    const follow = clamp(nz(m.bandLoadFollow, g.loadFollowDefault));
    const bandLoad = lerp(g.targetLoad, clamp(S.load), follow);
    return torqueModel(m, S.bit, S.ground, inp, {
      depth: S.stringDepth, load: bandLoad, wear: S.wear, drag: S.drag * 0.5,
      bind: 0, casing: S.casingOn, hazardTorque: 0,
    });
  }

  /**
   * A band that is a written standard rather than a moving sweet spot has a
   * fixed half-width, and it does not narrow with a dull bit: 20 +/- 5 mm/s is
   * the tolerance whatever the machine has been through, and the design set
   * window is a contract number.
   */
  function bandHalfOverride() {
    const m = S.m;
    const g0 = currentGauge();
    const axis = (g0 && g0.axis) || 'torque';
    if (axis === 'push-rate') return m.probe.cpt.rateTolMmS / m.probe.cpt.rateMaxMmS;
    if (axis === 'return') {
      const st = activeStage();
      return Math.max(TUNING.groove.minHalfWidth, nz(st && st.jet && st.jet.retTol, 0.16));
    }
    if (axis === 'set') {
      const p0 = m.pile;
      const d = S.prog ? S.prog.designSetMm : 5;
      const hi = clamp(Math.pow(clamp((d * (1 + p0.setBandFrac)) / p0.setGaugeMaxMm), p0.gaugeExp));
      const lo = clamp(Math.pow(clamp((d * (1 - p0.setBandFrac)) / p0.setGaugeMaxMm), p0.gaugeExp));
      return Math.max(TUNING.groove.minHalfWidth, (hi - lo) / 2);
    }
    return null;
  }

  function updateBand(dt, snap = false) {
    const g = TUNING.groove;
    const m = S.m;

    // Where a good driller's needle would sit right now.
    const ideal = gaugeIdeal();

    // Drift: two slow sines, faster and wider on harder contracts. A band that
    // is a published standard does not drift, so those methods opt out.
    let drift = 0;
    if (m.bandDrift !== false) {
      const dmul = 1 + g.driftDifficulty * (S.difficulty / 5);
      S.driftPhase[0] += dt * g.driftHz[0] * dmul * (m.driftMul || 1) * Math.PI * 2;
      S.driftPhase[1] += dt * g.driftHz[1] * dmul * (m.driftMul || 1) * Math.PI * 2;
      drift = g.driftAmp[0] * Math.sin(S.driftPhase[0])
            + g.driftAmp[1] * Math.sin(S.driftPhase[1] * 1.37 + 1.1);
    }

    S.bandCentre = clamp(ideal + drift, 0.08, 0.98);
    if (snap) D.bandCentre = S.bandCentre;

    const fixed = bandHalfOverride();
    if (fixed != null) { S.bandHalf = fixed; return; }

    // Width: narrows with wear and difficulty, widens with the Operator skill.
    let half = g.baseHalfWidth * (m.bandMul || 1);
    half *= 1 - g.wearNarrow * clamp(S.wear);
    half *= 1 - g.difficultyNarrow * (S.difficulty / 5);
    half *= 1 + skillRank('grooveWidth') * g.skillWiden;
    S.bandHalf = Math.max(g.minHalfWidth, half);
  }

  function updateGroove(dt) {
    const g = TUNING.groove;
    const drillingNow = S.phase === 'drilling' && S.jamState !== 'stuck';
    const inside = drillingNow && Math.abs(S.gauge - S.bandCentre) <= S.bandHalf;

    if (inside) {
      S.bandEnterGrace = g.enterGraceSec;
      if (!S.inBand) { S.inBand = true; haptic('medium', true); S.grooveJustEntered = true; }
      S.greenBandTime = Math.min(g.comboRampSec, S.greenBandTime + dt);
      S.grooveAccum += dt;
    } else {
      S.bandEnterGrace -= dt;
      if (S.inBand && S.bandEnterGrace <= 0) { S.inBand = false; S.grooveJustLeft = true; }
      // Rod adds do not have to cost you the groove if you nail the stab.
      const keep = S.phase === 'rod-add' ? (S.rodAdd?.hit ? 0 : 0.5) : 1;
      S.greenBandTime = Math.max(0, S.greenBandTime - dt * g.comboDecayMul * keep);
    }
    S.combo = 1 + (T.rop.comboMax - 1) * smoothstep(S.greenBandTime / g.comboRampSec);
    if (S.bandJumpT > 0) S.bandJumpT -= dt;
  }

  /* ═════════════════════════════════════════════════════════════════════
     HAZARDS — every one telegraphs on the gauges before it bites, has a
     correct response, and has a cost for getting it wrong. Never damage
     the player could not have avoided.
     ═════════════════════════════════════════════════════════════════════ */
  function recentlySeen(kind, depth) {
    for (const r of S.recentHazards) {
      if (r.kind === kind && Math.abs(r.depth - depth) < T.hazard.dedupeMetres
          && S.timeSec - r.t < T.hazard.dedupeSec) return true;
    }
    return false;
  }

  function queueHazard(kind, data = {}) {
    const depth = nz(data.depth, S.depth);
    if (!S.active || recentlySeen(kind, depth)) return null;
    // A method may declare that a generic borehole hazard does not belong to
    // it. Crossing the water table in RC is not a hole event, it is a SAMPLE
    // event with its own hazard; there is no till at a tunnel face to hide a
    // boulder in; and a pile that makes no hole cannot lose one.
    if (Array.isArray(S.m.suppressHazards) && S.m.suppressHazards.includes(kind)) return null;
    // never stack a second instance of the same kind on top of a live one
    for (const h of S.hazards) if (h.kind === kind && h.phase !== 'done') return null;
    S.recentHazards.push({ kind, depth, t: S.timeSec });
    if (S.recentHazards.length > 24) S.recentHazards.shift();

    const hz = {
      kind, data, depth,
      phase: 'telegraph',
      t: 0,
      telegraph: T.hazard.telegraphSec[kind] ?? 0.6,
      dur: 0,
      goodTime: 0, badTime: 0, resolved: false, clean: false,
      severity: clamp(nz(data.severity, 0.6)),
    };
    S.hazards.push(hz);
    S.hazardsSeen++;
    return hz;
  }

  /** Extra torque the live hazards are putting on the string right now. */
  function hazardTorque() {
    let q = 0;
    for (const h of S.hazards) {
      if (h.phase !== 'active') continue;
      if (h.kind === 'boulder') q += T.hazard.boulder.torqueSpike * (0.5 + 0.5 * h.severity);
      else if (h.kind === 'cavity') q -= 0.30;   // the gauge falls away — unmistakable
      // The string is being pressed into the filter cake: drag, not cutting load.
      else if (h.kind === 'diff-stick') q += 0.26 * (0.5 + 0.5 * h.severity);
      // A well taking a kick unloads: returns rise, standpipe pressure falls.
      else if (h.kind === 'kick') q -= 0.08 * (0.5 + 0.5 * h.severity);
      // Mud going into the formation instead of up the annulus.
      else if (h.kind === 'lost-zone') q -= 0.05;
    }
    return q;
  }

  /** Display-only needle judder so every telegraph is visible on the gauge. */
  function telegraphJitter() {
    let j = 0;
    const tq = T.torque;
    for (const h of S.hazards) {
      if (h.phase !== 'telegraph') continue;
      const ramp = clamp(h.t / Math.max(1e-3, h.telegraph));
      if (h.kind === 'boulder') j += tq.jitterBoulder * ramp * Math.sin(S.timeSec * tq.jitterHz.boulder * 6.28);
      else if (h.kind === 'water') j += tq.jitterBoulder * 0.6 * ramp * Math.sin(S.timeSec * tq.jitterHz.water * 6.28);
      else if (h.kind === 'cavity') j -= 0.09 * ramp;                      // the needle sags first
      else if (h.kind === 'collapse') j += tq.jitterBind * ramp * Math.sin(S.timeSec * tq.jitterHz.bind * 6.28);
      // A kick reads as an irregular flutter with the needle drifting DOWN —
      // the well is unloading while the pit level climbs.
      else if (h.kind === 'kick') {
        j -= 0.07 * ramp;
        j += tq.jitterBoulder * 0.8 * ramp * Math.sin(S.timeSec * 8.5 * 6.28) * Math.sin(S.timeSec * 2.3);
      }
      // Losing returns: the needle sags as the annulus empties ahead of you.
      else if (h.kind === 'lost-zone') j -= 0.06 * ramp;
      // Differential sticking comes on as steady drag, not as a spike.
      else if (h.kind === 'diff-stick') j += tq.jitterBind * 1.4 * ramp;
      // A twisting string oscillates slowly and hard — the classic rod signature.
      else if (h.kind === 'twist-off') j += tq.jitterRod * 1.5 * ramp * Math.sin(S.timeSec * tq.jitterHz.rod * 6.28);
      /* ── the six newest methods. Each telegraph has to be readable ON THE
            GAUGE, because that is where the player is looking. ── */
      // RC: the sample train loading up drags on nothing — the needle barely
      // moves and the tell is the cyclone, so the judder is deliberately small.
      else if (h.kind === 'carry-over') j += tq.jitterBind * 0.6 * ramp;
      else if (h.kind === 'cyclone-choke') j += tq.jitterBind * 1.6 * ramp;
      else if (h.kind === 'wet-sample') j -= 0.05 * ramp;          // the face pressure sagging
      // Jumbo: the bit skating at the collar is a fast, shallow chatter; the
      // cut closing is the slow, heavy one that means the round.
      else if (h.kind === 'collar-slip') j += tq.jitterBoulder * 0.7 * ramp * Math.sin(S.timeSec * 14 * 6.28);
      else if (h.kind === 'cut-choke') j += tq.jitterRod * 1.3 * ramp * Math.sin(S.timeSec * 3.2 * 6.28);
      else if (h.kind === 'bad-ground') j -= 0.06 * ramp;
      // Longhole: a packed hole climbs, a drowned uphole sags, a whipping
      // string oscillates. Three different shapes for three different answers.
      else if (h.kind === 'hole-blocked') j += tq.jitterBind * 1.8 * ramp;
      else if (h.kind === 'uphole-flush') j -= 0.07 * ramp;
      else if (h.kind === 'rod-whip') j += tq.jitterRod * 1.7 * ramp * Math.sin(S.timeSec * 2.2 * 6.28);
      // Bolting: resin stiffening reads as a steady climb, and that is exactly
      // what it is — the bond setting around a bar that is still turning.
      else if (h.kind === 'gel-clock') j += 0.10 * ramp;
      else if (h.kind === 'bolt-hole-collapse') j += tq.jitterBind * 1.4 * ramp;
      else if (h.kind === 'loose-plate') j -= 0.04 * ramp;
      // Piling: an obstruction spikes the set gauge downward — the blow count
      // jumps, which is precisely the thing that must not be trusted.
      else if (h.kind === 'obstruction') j -= 0.12 * ramp;
      else if (h.kind === 'head-damage') j += tq.jitterRod * 1.2 * ramp * Math.sin(S.timeSec * 2.0 * 6.28);
      else if (h.kind === 'premature-refusal') j -= 0.09 * ramp;
      // Site investigation: a bouncing hammer flutters, fall-in sags, a
      // precarious cone climbs hard and a thrust limit rebounds.
      else if (h.kind === 'rod-bounce') j += tq.jitterBoulder * 0.9 * ramp * Math.sin(S.timeSec * 9 * 6.28);
      else if (h.kind === 'fall-in') j -= 0.05 * ramp;
      else if (h.kind === 'precarious') j += 0.11 * ramp;
      else if (h.kind === 'thrust-limit') j += tq.jitterRod * 2.0 * ramp * Math.sin(S.timeSec * 4.5 * 6.28);
      else if (h.kind === 'cone-desaturation') j -= 0.04 * ramp;
    }
    if (S.rodBreakArmed > 0) j += tq.jitterRod * Math.sin(S.timeSec * tq.jitterHz.rod * 6.28);
    if (S.jamState === 'binding') j += tq.jitterBind * (S.bind - T.jam.bindEnter) * Math.sin(S.timeSec * tq.jitterHz.bind * 6.28);
    return j;
  }

  function stepHazards(dt) {
    const hb = T.hazard.boulder, hc = T.hazard.cavity, hw = T.hazard.water;

    for (let i = S.hazards.length - 1; i >= 0; i--) {
      const h = S.hazards[i];
      h.t += dt;

      if (h.phase === 'telegraph') {
        // A twist-off is survived or not survived during the warning itself:
        // once the joint has parted there is nothing left to decide.
        if (h.kind === 'twist-off') {
          const to = T.hazard.twistOff;
          if (S.act.wob <= to.wobMax && S.act.rpm <= to.rpmMax) h.goodTime += dt;
          else h.badTime += dt;
        }
        if (h.t >= h.telegraph) {
          h.phase = 'active'; h.t = 0;
          fireHazard(h);
        }
        continue;
      }
      if (h.phase !== 'active') { S.hazards.splice(i, 1); continue; }

      /* ── boulder: back off the feed, wind the percussion up ── */
      if (h.kind === 'boulder') {
        const good = S.act.wob <= hb.wobMax && S.act.rpm >= hb.rpmMin;
        if (good) h.goodTime += dt; else h.badTime += dt;
        if (!h.dur) h.dur = lerp(hb.sec[0], hb.sec[1], h.severity);
        const speed = good ? hb.handledSpeed : 0.7;
        h.progress = nz(h.progress) + dt * speed / h.dur;
        if (!good) {
          S.bind += hb.bindAdd * dt;
          S.deviation += hb.deviationAdd * dt;
          S.wear += T.wear.shockPerEvent * dt * 0.15;
          S.rodFatigue += T.rods.fatiguePerShock * dt * 0.5;
        }
        if (h.progress >= 1) finishHazard(h, h.goodTime / Math.max(1e-3, h.goodTime + h.badTime) >= hb.cleanFrac);
        continue;
      }

      /* ── cavity: the bit free-falls. Cut the feed, now. ── */
      if (h.kind === 'cavity') {
        const cut = S.act.wob <= hc.wobSafe;
        if (cut) h.goodTime += dt; else h.badTime += dt;
        S.returns = Math.min(S.returns, hc.returnsLost);
        if (!cut && h.badTime > hc.reactSec && !h.shocked) {
          h.shocked = true;
          S.stability -= hc.shockStability;
          S.erosion += hc.shockStability;
          S.bind += hc.shockBind;
          S.wear += T.wear.shockPerEvent;
          S.rodFatigue += T.rods.fatiguePerShock;
          S.deviation += 0.5;
          haptic('heavy', true);
        }
        // The void ends once the string has run through it.
        if (nz(h.fallen) >= nz(h.data.height, 1) || h.t > 12) {
          // Landing on the far side with the feed still on is a shock load.
          if (!cut && !h.shocked) {
            h.shocked = true;
            S.wear += T.wear.shockPerEvent;
            S.rodFatigue += T.rods.fatiguePerShock;
            S.bind += hc.shockBind * 0.5;
            haptic('heavy', true);
          }
          finishHazard(h, !h.shocked);
        }
        continue;
      }

      /* ── water strike: lift the column or case it off ── */
      if (h.kind === 'water') {
        const handled = S.act.flush >= hw.flushMin || S.casedDepth >= S.depth - 0.5;
        if (handled) h.goodTime += dt; else h.badTime += dt;
        S.waterInflow = damp(S.waterInflow, clamp(0.35 + 0.65 * h.severity), hw.inflowLambda, dt);
        if (!handled && h.t > hw.graceSec) {
          S.erosion += T.stability.erodeK * dt * 0.8;
          S.stability -= T.stability.waterHit * dt * 0.25;
        }
        if (h.t > 10) finishHazard(h, h.goodTime > h.badTime);
        continue;
      }

      /* ── collapsing hole: case it, or slow down and clean ── */
      if (h.kind === 'collapse') {
        const handled = S.casedDepth >= S.depth - 0.5
                     || (S.act.wob < 0.35 && S.act.flush > 0.5);
        if (handled) h.goodTime += dt; else { h.badTime += dt; S.drag += T.stability.dragK * dt; }
        if (S.stability > T.stability.dragThresh + 0.12 || h.t > 12) {
          finishHazard(h, h.goodTime > h.badTime);
        }
        continue;
      }

      /* ── kick / influx ───────────────────────────────────────────────
         The well is flowing. The answer is to SHUT IT IN — not to back off the
         feed, which changes nothing, and not to pull off bottom, which makes it
         worse. `pulse('shutIn')` closes the preventer and starts the kill. */
      if (h.kind === 'kick') {
        const k = T.hazard.kick;
        S.influx = damp(S.influx, clamp(0.35 + 0.65 * h.severity), k.growLambda, dt);
        if (h.t > k.reactSec) {
          // Never an unwinnable state: if the driller does not shut in, the
          // crew does. The well is saved; the run is not.
          finishHazard(h, false);
          S.safetyEvents++;
          S.wellControlEvents++;
          beginWellControl(true);
        }
        continue;
      }

      /* ── lost circulation ────────────────────────────────────────────
         The mud is going into a thief zone. Cut the pumps to drop the
         equivalent circulating density and stop driving the loss, take the
         weight off, and spot an LCM pill across it if one is on board. Leave it
         and the column falls far enough to bring a kick with it. */
      if (h.kind === 'lost-zone') {
        const lz = T.hazard.lostZone;
        const handled = S.act.flush <= lz.flushMax && S.act.wob <= lz.wobMax;
        if (handled) h.goodTime += dt; else h.badTime += dt;
        S.returns = Math.min(S.returns, handled ? 0.55 : 0.18);
        if (!handled) {
          S.mudLevel = clamp(S.mudLevel - T.mud.lossPerSec * (0.5 + S.act.flush) * dt, 0, 1);
          if (h.badTime > lz.kickAfterSec && !h.spawnedKick) {
            h.spawnedKick = true;
            queueHazard('kick', { depth: S.depth, severity: 0.85, fromLoss: true });
          }
        }
        const need = h.pill ? lz.pillCureSec : lz.cureSec;
        if (h.goodTime >= need) { h.cured = true; finishHazard(h, h.badTime < need); }
        else if (h.t > 24) finishHazard(h, false);
        continue;
      }

      /* ── differential sticking ───────────────────────────────────────
         The exact opposite response to a packed-off hole. The string is pinned
         against a permeable bed by the overbalance, so you KEEP IT TURNING and
         lift the weight off it. Stop rotating and it sets. */
      if (h.kind === 'diff-stick') {
        const ds = T.hazard.diffStick;
        const working = S.act.rpm >= ds.rpmMin && S.act.wob <= ds.wobMax;
        if (working) h.goodTime += dt; else { h.badTime += dt; S.bind += ds.bindAdd * dt; }
        if (!h.dur) h.dur = lerp(ds.sec[0], ds.sec[1], h.severity);
        h.progress = nz(h.progress) + dt * (working ? 1.6 : 0.45) / h.dur;
        if (h.progress >= 1) finishHazard(h, h.goodTime > h.badTime);
        continue;
      }

      /* ── twist-off ───────────────────────────────────────────────────
         Decided during the telegraph. If the string parted, the cost is a
         fishing trip: hours, not the hole. */
      if (h.kind === 'twist-off') {
        if (h.survived) { finishHazard(h, true); continue; }
        if (!h.parted) {
          h.parted = true;
          S.twistOffs++;
          S.safetyEvents++;
          S.rodFatigue = 0.2;
          S.rodBreakArmed = 0;
          S.bind = 0;
          S.jamState = 'free';
          beginTrip(S.bit.id, true, true);
          haptic('fail', true);
        }
        finishHazard(h, false);
        continue;
      }

      /* ══════════════════════════════════════════════════════════════════
         rc — three ways to lose the sample while the hole stays perfect
         ══════════════════════════════════════════════════════════════════ */

      /* ── wet sample: hold the air, or the bag comes up as slurry ── */
      if (h.kind === 'wet-sample') {
        const ws = T.hazard.wetSample;
        const air = clamp(S.act.flush * S.returns);
        const held = air >= ws.airMin && S.act.wob <= ws.wobMax;
        if (held) h.goodTime += dt; else h.badTime += dt;
        if (!held && h.t > ws.graceSec && S.prog) {
          S.prog.wet = clamp(S.prog.wet + ws.wetPerSec * dt);
        }
        if (h.t > 9 || (held && h.goodTime > 2.2)) finishHazard(h, h.goodTime > h.badTime);
        continue;
      }

      /* ── carry-over: blow the string down, or metre N is in metre N+1 ── */
      if (h.kind === 'carry-over') {
        const co = T.hazard.carryOver;
        if (h.t > co.reactSec && S.prog) {
          S.prog.cave = clamp(S.prog.cave + co.contamPerSec * dt * 0.4);
          S.prog.holdUp = clamp(S.prog.holdUp + co.contamPerSec * dt * 0.2);
        }
        // The blow-down pulse resolves it; left alone it fades once the tube
        // has emptied itself, so it is never a state you cannot get out of.
        if (S.prog && S.prog.holdUp < co.warnAt * 0.6) { finishHazard(h, false); continue; }
        if (h.t > 12) finishHazard(h, false);
        continue;
      }

      /* ── cyclone choke: stop cutting, hold the air on the train ── */
      if (h.kind === 'cyclone-choke') {
        const cc = T.hazard.cycloneChoke;
        const good = S.act.wob <= cc.wobMax && S.act.flush * S.returns >= cc.airMin;
        if (good) h.goodTime += dt; else { h.badTime += dt; if (S.prog) S.prog.trainWear = clamp(S.prog.trainWear + cc.trainWearAdd * dt); }
        if (h.goodTime >= cc.clearSec) {
          if (S.prog) S.prog.trainWear = clamp(S.prog.trainWear - 0.25);
          finishHazard(h, h.badTime < cc.clearSec);
        } else if (h.t > 16) finishHazard(h, false);
        continue;
      }

      /* ══════════════════════════════════════════════════════════════════
         tunnel-jumbo — every one of these is decided before the round fires
         ══════════════════════════════════════════════════════════════════ */

      /* ── collar slip: collar soft, or the bit walks off the mark ── */
      if (h.kind === 'collar-slip') {
        const cs = T.hazard.collarSlip;
        const good = S.act.wob <= cs.wobMax && S.act.rpm >= cs.rpmMin;
        if (good) h.goodTime += dt; else h.badTime += dt;
        if (h.t >= cs.sec) {
          if (!good && S.prog && S.prog.round) S.prog.round.collarErrM += cs.collarErrM;
          finishHazard(h, good);
        }
        continue;
      }

      /* ── the cut is closing: the same answer as collaring, and the last
            chance to save the hole before the round freezes ── */
      if (h.kind === 'cut-choke') {
        const cc = T.hazard.cutChoke;
        const good = S.act.wob <= cc.wobMax && S.act.rpm >= cc.rpmMin;
        if (good) h.goodTime += dt; else h.badTime += dt;
        if (h.goodTime >= cc.sec) {
          // The hole is saved, and re-drilling it costs exactly what it costs.
          if (S.prog && S.prog.round) S.prog.round.cutErrM *= 1 - cc.errRelief;
          finishHazard(h, true);
          beginBeat('redrill', cc.redrillSec, { kind: 'redrill' });
        } else if (h.t > 10) finishHazard(h, false);
        continue;
      }

      /* ── bad ground: the round must come down. It does not slow down. ── */
      if (h.kind === 'bad-ground') {
        const bg = T.hazard.badGround;
        if (h.t > bg.reactSec) {
          const rd = S.prog && S.prog.round;
          if (rd && !rd.shortened) {
            rd.lookout01 += bg.overbreakAdd;   // a full round into bad ground overbreaks
            rd.forcedPull = bg.pullCut;
          }
          finishHazard(h, false);
        }
        continue;
      }

      /* ══════════════════════════════════════════════════════════════════
         longhole — and two of these have OPPOSITE flushing answers
         ══════════════════════════════════════════════════════════════════ */

      /* ── blocked downhole: LIFT the flushing and take the weight off ── */
      if (h.kind === 'hole-blocked') {
        const hb = T.hazard.holeBlocked;
        const good = S.act.flush >= hb.flushMin && S.act.wob <= hb.wobMax;
        if (good) h.goodTime += dt; else h.badTime += dt;
        if (h.goodTime >= hb.clearSec) { S.load = Math.max(0, S.load - 0.35); finishHazard(h, true); }
        else if (h.t > hb.sec) {
          // The hole is packed. It is a hole the charge crew cannot load, so it
          // is a hole that was never drilled — but `redrill` always recovers it.
          if (S.prog) S.prog.blocked = true;
          finishHazard(h, false);
          finishLongholeHole(true);
        }
        continue;
      }

      /* ── uphole flush-back: CUT the flushing and let the hole drain ── */
      if (h.kind === 'uphole-flush') {
        const uf = T.hazard.upholeFlush;
        const good = S.act.flush <= uf.flushMax && S.act.wob >= uf.wobMin;
        if (good) h.goodTime += dt;
        else { h.badTime += dt; if (S.prog) S.prog.devPct += uf.deviationAdd * dt; }
        if (h.t >= uf.sec) finishHazard(h, h.goodTime > h.badTime);
        continue;
      }

      /* ── rod whip: ease the feed, hold the percussion. The deviation this
            banks will not be seen until the ring is surveyed. ── */
      if (h.kind === 'rod-whip') {
        const rw = T.hazard.rodWhip;
        const good = S.act.wob <= rw.wobMax && S.act.rpm >= rw.rpmMin;
        if (good) h.goodTime += dt;
        else {
          h.badTime += dt;
          if (S.prog && S.prog.kind === 'longhole') S.prog.devPct += rw.deviationAdd * dt;
          S.rodFatigue = clamp(S.rodFatigue + rw.fatigueAdd * dt);
        }
        if (h.t >= rw.sec) finishHazard(h, h.goodTime > h.badTime);
        continue;
      }

      /* ══════════════════════════════════════════════════════════════════
         rockbolt — the bolt that looks installed and holds nothing
         ══════════════════════════════════════════════════════════════════ */

      /* ── the resin has gelled: STOP THE ROTATION. That is the whole answer. ── */
      if (h.kind === 'gel-clock') {
        const gc = T.hazard.gelClock;
        const stopped = S.act.rpm <= gc.rpmMax;
        if (stopped) h.goodTime += dt;
        else {
          h.badTime += dt;
          if (h.badTime > gc.reactSec && S.prog) {
            // Spinning after the gel shears the bond it has just made.
            S.prog.anchorage = clamp(nz(S.prog.anchorage, 1) - gc.bondLossPerSec * dt);
            S.prog.spunSec = Math.max(0, S.prog.spunSec - gc.bondLossPerSec * dt);
          }
        }
        if (S.phase !== 'bolt-install' || h.t > 8) finishHazard(h, h.goodTime > h.badTime);
        continue;
      }

      /* ── the bolt hole is closing: re-ream it and get the bolt in ── */
      if (h.kind === 'bolt-hole-collapse') {
        const bc = T.hazard.boltHoleCollapse;
        if (h.t > bc.reactSec) {
          if (S.prog) S.prog.holeOpen = false;
          finishHazard(h, false);
          // Never a dead end: the hole is re-drilled and it costs what it costs.
          beginBeat('redrill', bc.redrillSec, { kind: 'redrill' });
        }
        continue;
      }

      /* ── the plate is not tight: a bolt bearing on nothing supports nothing ── */
      if (h.kind === 'loose-plate') {
        if (h.t > T.hazard.loosePlate.reactSec) finishHazard(h, false);
        continue;
      }

      /* ══════════════════════════════════════════════════════════════════
         driven-pile — no rotation, no flush, and a gauge that can lie
         ══════════════════════════════════════════════════════════════════ */

      /* ── obstruction: STOP DRIVING. Cut the energy and re-trim the line. ── */
      if (h.kind === 'obstruction') {
        const ob = T.hazard.obstruction;
        const off = Math.abs(S.act.flush - 0.5) * 2;
        const good = S.act.wob <= ob.energyMax && off <= ob.alignBand * 2;
        if (good) h.goodTime += dt;
        else {
          h.badTime += dt;
          // Drive harder and the pile bends and the toe brooms — and that is
          // the one thing on this method you cannot undo.
          if (S.prog) {
            S.prog.rake = clamp(S.prog.rake + ob.rakePerSec * dt, 0, S.m.pile.rakeMaxDeg * 1.4);
            S.prog.toeDamage = clamp(S.prog.toeDamage + ob.toePerSec * dt);
          }
        }
        if (h.t >= ob.sec) finishHazard(h, h.goodTime > h.badTime);
        continue;
      }

      /* ── pile head damage: change the dolly. Nothing else will do. ── */
      if (h.kind === 'head-damage') {
        const hd = T.hazard.headDamage;
        if (h.t > hd.reactSec && S.prog) {
          S.prog.headDamage = clamp(S.prog.headDamage + hd.headPerSec * dt);
          S.prog.stress += hd.stressAdd * dt;
        }
        if (h.t > 12) finishHazard(h, false);
        continue;
      }

      /* ── premature refusal: take a set and read the toe level. Driving to an
            arbitrary set for compliance is how a pile is destroyed. ── */
      if (h.kind === 'premature-refusal') {
        const pr = T.hazard.prematureRefusal;
        if (h.t > pr.reactSec && S.prog) {
          S.prog.toeDamage = clamp(S.prog.toeDamage + pr.toePerSec * dt);
          S.prog.stress += pr.stressAdd * dt;
        }
        if (h.t > 14) finishHazard(h, false);
        continue;
      }

      /* ══════════════════════════════════════════════════════════════════
         site-investigation — none of these has a drilling answer
         ══════════════════════════════════════════════════════════════════ */

      /* ── the hammer is not in free fall: re-establish the clean release ── */
      if (h.kind === 'rod-bounce') {
        const rb = T.hazard.rodBounce;
        if (S.prog && S.prog.goodTaps >= rb.needGoodTaps) { finishHazard(h, true); continue; }
        if (h.t >= rb.sec) finishHazard(h, false);
        continue;
      }

      /* ── fall-in at the base: clean it out before the seating drive ── */
      if (h.kind === 'fall-in') {
        const fi = T.hazard.fallIn;
        if (h.t > fi.reactSec) {
          if (S.prog) S.prog.fallIn = 1;
          finishHazard(h, false);
        }
        continue;
      }

      /* ── a precarious situation: SLOW DOWN, and it goes on the trace ── */
      if (h.kind === 'precarious') {
        const pc = T.hazard.precarious;
        const good = S.act.wob <= pc.rateMax;
        if (good) h.goodTime += dt;
        else {
          h.badTime += dt;
          if (S.prog) {
            S.prog.incl = clamp(S.prog.incl + pc.inclPerSec * dt, 0, 20);
            if (rand.f() < pc.damageChance * dt) S.prog.coneDamage = clamp(S.prog.coneDamage + 0.15);
          }
        }
        if (h.t >= pc.sec) finishHazard(h, h.goodTime > h.badTime);
        continue;
      }

      /* ── thrust capacity: TERMINATE the sounding. A sounding stopped here is
            a valid, reportable result; pushing on while the machine moves is
            not, and it is a hard fail on the log. ── */
      if (h.kind === 'thrust-limit') {
        const tl = T.hazard.thrustLimit;
        if (h.t > tl.reactSec) {
          // Never an unwinnable state: if the operator does not call it, the
          // crew stops the push. The sounding is saved and reported; the log
          // fidelity is not, because the last metre was taken while the
          // machine was moving.
          if (S.prog) {
            S.prog.fidelity01 = clamp(S.prog.fidelity01 - tl.fidelityCut);
            S.prog.terminated = true;
          }
          finishHazard(h, false);
          complete();
          return;
        }
        continue;
      }

      /* ── cone desaturation: ease through, then run a dissipation test ── */
      if (h.kind === 'cone-desaturation') {
        const cd = T.hazard.coneDesat;
        const easing = S.act.wob <= cd.rateMax;
        if (easing) h.goodTime += dt; else h.badTime += dt;
        if (h.t >= cd.sec) {
          if (S.prog && h.badTime > h.goodTime) {
            S.prog.saturated = false;       // the u2 channel goes flat until it is re-established
            S.prog.fidelity01 = clamp(S.prog.fidelity01 - cd.fidelityCut);
          }
          finishHazard(h, h.goodTime > h.badTime);
        }
        continue;
      }

      /* ── the reamer is stalling on the way back ──────────────────────
         Ease the pull and keep the hole open behind the head. Keep hauling
         into a stalling head and the string binds — and on a pullback that is
         how a product pipe gets stuck, which loses the job rather than the
         metre. The bind model owns the consequence, so the escape that already
         exists (work the string) is the escape here too. */
      if (h.kind === 'pull-stall') {
        const ps = T.hazard.pullStall;
        const eased = S.act.wob <= ps.rateMax
          && (S.m.stages && S.m.stages[1] && S.m.stages[1].flushOff ? true : S.act.flush >= ps.flushMin);
        if (eased) h.goodTime += dt;
        else {
          h.badTime += dt;
          S.bind += ps.bindAdd * dt;
          if (S.prog) S.prog.cutterWear = clamp(nz(S.prog.cutterWear) + ps.cutterAdd * dt);
        }
        if (h.t >= ps.sec) {
          if (!eased && S.prog) S.prog.stalls++;
          finishHazard(h, h.goodTime > h.badTime);
        }
        continue;
      }

      /* ── the jet grouting return, in both directions ──────────────────
         The same object fails two opposite ways and each has its own answer,
         which is the whole character of the pass: there is no single "safe"
         setting, because the ground decides which way it will go wrong.

         NO RETURN — the grout is going into the formation. Cut the pump: at
         low pressure the mix stops being driven out into the ground and the
         annulus can re-establish. Jetting harder feeds the loss, which is
         exactly the instinct the gauge provokes when it reads low.

         HEAVE — the annulus will not pass what is being made. Get the monitor
         moving: a faster withdrawal makes less per metre, so the pressure has
         somewhere to go other than into lifting whatever is standing on top of
         it. Cutting the pump also helps and is not required. */
      if (h.kind === 'return-lost' || h.kind === 'ground-heave') {
        const jr = T.hazard.jetReturn;
        const J = S.prog && S.prog.jet;
        const right = h.kind === 'return-lost'
          ? S.act.rpm <= jr.workMax
          : S.act.wob >= jr.liftMin;
        if (right) h.goodTime += dt;
        else {
          h.badTime += dt;
          // The cost is not the event, it is the column being built through it.
          if (J) J.mishandled = clamp(nz(J.mishandled) + jr.mishandlePerSec * dt);
        }
        if (h.t >= jr.sec) finishHazard(h, h.goodTime > h.badTime);
        continue;
      }

      /* ── bit critical / rod fatigue: pure warnings, resolved elsewhere ── */
      if (h.t > 8) finishHazard(h, true);
    }
  }

  function fireHazard(h) {
    const d = h.data || {};
    switch (h.kind) {
      case 'boulder':
        h.severity = clamp(nz(d.hardness, h.severity));
        emit(EV.BOULDER, { depth: h.depth, __sim: true, ...d });
        haptic('heavy', true);
        break;
      case 'cavity':
        emit(EV.CAVITY, { depth: h.depth, height: nz(d.height, 1.2), __sim: true });
        haptic('heavy', true);
        break;
      case 'water':
        S.waterFlowLpm = Math.round(nz(d.flowLpm, 60 + h.severity * 240));
        emit(EV.WATER_STRIKE, { depth: h.depth, flowLpm: S.waterFlowLpm, __sim: true });
        haptic('medium', true);
        break;
      case 'collapse':
        haptic('medium', true);
        break;
      case 'kick':
        // A drilling break: the bit runs away as it enters the pressured bed,
        // which is the first thing a driller notices and the reason to flow-check.
        S.influx = Math.max(S.influx, 0.25);
        haptic('heavy', true);
        break;
      case 'lost-zone':
        S.returns = Math.min(S.returns, 0.35);
        haptic('medium', true);
        break;
      case 'diff-stick':
        haptic('heavy', true);
        break;
      case 'twist-off':
        // Survived if the weight and the rotation came off during the warning.
        h.survived = h.goodTime > h.badTime;
        haptic(h.survived ? 'medium' : 'fail', true);
        break;
      // RC: the hole is fine. It is the bag that is in trouble.
      case 'wet-sample':
        if (S.prog) S.prog.wet = Math.max(S.prog.wet, 0.25);
        haptic('medium', true);
        break;
      case 'carry-over': haptic('light', true); break;
      case 'cyclone-choke': haptic('medium', true); break;
      // The jumbo: the round's fate, decided one hole at a time.
      case 'collar-slip': haptic('light', true); break;
      case 'cut-choke': haptic('heavy', true); break;
      case 'bad-ground': haptic('medium', true); break;
      // Longhole: two of these want opposite things from the flushing control.
      case 'hole-blocked': haptic('medium', true); break;
      case 'uphole-flush': haptic('medium', true); break;
      case 'rod-whip': haptic('heavy', true); break;
      // Ground support.
      case 'gel-clock': haptic('heavy', true); break;
      case 'bolt-hole-collapse': haptic('medium', true); break;
      case 'loose-plate': haptic('light', true); break;
      // Driven piling.
      case 'obstruction': haptic('heavy', true); break;
      case 'head-damage': haptic('medium', true); break;
      case 'premature-refusal': haptic('heavy', true); break;
      // Site investigation.
      case 'rod-bounce': if (S.prog) S.prog.goodTaps = 0; haptic('medium', true); break;
      case 'fall-in': haptic('light', true); break;
      case 'precarious': haptic('heavy', true); break;
      case 'thrust-limit': haptic('heavy', true); break;
      case 'cone-desaturation': haptic('medium', true); break;
      default: break;
    }
  }

  function finishHazard(h, clean) {
    h.phase = 'done';
    h.resolved = true;
    h.clean = !!clean;
    if (clean) { S.hazardsClean++; haptic('success', true); }
    else haptic('fail', true);
    S.hazardLog.push({ kind: h.kind, depth: h.depth, clean: h.clean, at: S.timeSec });
    if (h.kind === 'water') S.waterInflow = Math.max(S.waterInflow, 0.3);
  }

  /** Self-generated hazards, used when geology is not emitting them. */
  function rollHazards(dDepth) {
    if (dDepth <= 0) return;
    const p = T.hazard.selfGenPerMetre;
    const g = S.ground;
    const ext = S.externalGeology;
    // Per-metre rates authored for a 50 m hole, scaled to the depth scale this
    // method actually works at.
    const scale = Math.max(0, nz(S.m.hazardScale, 1));
    if (scale <= 0) return;
    dDepth *= scale;

    if (!ext.boulder) {
      let rate = 0;
      if (g.id === 'boulder') rate = p.boulderBed;
      else if (g.id === 'till') rate = p.boulderTill;
      else if (g.id === 'gravel') rate = p.boulderGravel;
      if (rate > 0 && rand.f() < 1 - Math.exp(-rate * dDepth)) {
        queueHazard('boulder', { depth: S.depth, hardness: rand.range(0.35, 0.95) });
      }
    }
    if (!ext.cavity && (g.id === 'limestone' || g.id === 'karst')) {
      const rate = g.id === 'karst' ? 1.5 : p.cavityLimestone;
      if (rand.f() < 1 - Math.exp(-rate * dDepth)) {
        queueHazard('cavity', { depth: S.depth, height: rand.range(0.4, 2.5) });
      }
    }
    if (!ext.water && g.water > 0.5) {
      const rate = p.waterPerWater * g.water;
      if (rand.f() < 1 - Math.exp(-rate * dDepth)) {
        queueHazard('water', { depth: S.depth, severity: g.water,
                               flowLpm: Math.round(40 + g.water * 280) });
      }
    }
  }

  /* ═════════════════════════════════════════════════════════════════════
     METHOD PROGRAMMES

     Five of the six newest methods are not paid for depth, and two of them do
     not drill at all. What they have in common is that a run is a SEQUENCE OF
     UNITS — a sample bag, a blast round, a hole in a fan, a bolt, a pile, a
     test — and the score is the quality of the units, never the sum of the
     metres. This section owns those units.

     Three depths, and keeping them apart is what makes this work:

       S.depth        the number the CONTRACT is measured in and the number the
                      section band scrolls with. Chainage on a heading, ring
                      metres on a fan, head penetration on a pile.
       S.holeDepth    metres into the unit being worked right now.
       S.stringDepth  how much string is actually in the ground — what loads the
                      rods, damps the blow and lengthens the annulus.

     On a method that drills one hole all three are the same number and nothing
     in this section runs.
     ═════════════════════════════════════════════════════════════════════ */

  /**
   * The assay at a measured depth, from world/geology.js when it is present.
   *
   * The sim works in MEASURED LENGTH along the hole, so `getOreAtStation` is
   * the call that wants it: it converts to true vertical depth internally and
   * carries both coordinates, which matters in a drive where every station is
   * at the same depth and only the chainage says whether the face is in ore.
   *
   * `sourced` is false wherever the research could not source a grade band, and
   * NOTHING player-facing may quote a number that is not sourced. The intercept
   * is still real — a shape is not a claim — so the bag reports that it is in
   * ore and withholds the figure.
   */
  function sampleAssay(alongM) {
    const geo = ctx.geology;
    const at = Math.max(0, nz(alongM, S.depth));
    let o = null;
    try {
      if (geo && typeof geo.getOreAtStation === 'function') o = geo.getOreAtStation(at);
      else if (geo && typeof geo.getOreAt === 'function') o = geo.getOreAt(at);
    } catch { /* geology mid-rebuild */ }
    if (!o || !o.commodity) {
      return { commodity: null, grade: 0, unit: null, inOre: false, gradeKnown: false };
    }
    const known = o.sourced !== false;
    return {
      commodity: o.commodity,
      commodityName: o.commodityName || o.commodity,
      grade: known ? +nz(o.grade, 0).toFixed(3) : null,
      unit: known ? o.unit : null,
      cutoff: known ? o.cutoff : null,
      inOre: !!o.inOre,
      inHalo: !!o.inHalo,
      zone: o.zone || null,
      // The one flag every caption must gate on. False means "the geometry is
      // real and the number is not sourced", and the number stays unprinted.
      gradeKnown: known,
      gradeNeeds: known ? null : (o.needs || 'grade band not sourced'),
    };
  }

  /* ── stages ────────────────────────────────────────────────────────────
     A two-pass method is one run with two different jobs in it, and the second
     one runs BACKWARDS: the reamer travels up the raise, the product pipe comes
     home along the bore. Everything about the second pass is different — the
     gauge is pull force rather than torque, gravity mucks a raise so there is
     nothing to circulate, and the thing that ends the job badly is a stuck head
     rather than a slow one. */

  /** The spec for the pass that is running, or null on a single-pass method. */
  function activeStage() {
    const st = S.m.stages;
    return st && st.length > 1 ? st[Math.min(S.stage, st.length - 1)] : null;
  }

  /** Is the run on a pass that travels back along the hole? */
  function onReversePass() { const st = activeStage(); return !!(st && st.reverse); }

  /**
   * WHAT IS ACTUALLY CIRCULATING, which is not always the PROTECT control.
   *
   * Three models read "flush" as the thing keeping the annulus open, cooling
   * the tool and carrying the cuttings out: hole cleaning, heat, and the bind
   * relief term. On nearly every method that is the third slider and the
   * mapping is invisible.
   *
   * IT IS NOT INVISIBLE ON A JET GROUTING LIFT. There the third slider is
   * ROTATION (GAMEDESIGN §7), and the circulation is the pump — 400 l/min of
   * grout going down the monitor and spoil coming back up the annulus, which
   * is the WORK control. Reading rotation as flow there is not a cosmetic
   * mislabel: measured, it collapsed the bind relief term to its floor and
   * stuck the string 9 m into the lift on the first three seeds tried, in a
   * hole that has 400 l/min going through it. A stage says so with
   * `flushFromWork`, and `flushOff` still means nothing is circulating at all
   * (a raise, mucked by gravity).
   */
  function circulationNow() {
    const st = activeStage();
    if (st && st.flushOff) return 0;
    if (st && st.flushFromWork) return clamp(S.act.rpm);
    return clamp(S.act.flush);
  }

  /**
   * WHERE THE BIT OR THE HEAD ACTUALLY IS, in measured length along the hole.
   *
   * On the way down that is the depth. On the way back it is the far end minus
   * how much of the second pass is done — and it is what the ground has to be
   * sampled at, because the reamer is cutting the rock it is passing through,
   * not the rock at the bottom of the hole.
   *
   * Measured length is also what world/geology.js now expects: it converts to
   * true vertical depth itself, and the identity holds in vertical mode.
   */
  function actionDepth() {
    if (onReversePass()) return Math.max(0, S.target - S.stageProgress);
    return S.depth;
  }

  /**
   * Tell world/geology.js which pass is running. PUSHED, not polled: the sim is
   * the only thing that knows when the transition happens, and the section has
   * to be able to turn round on the same frame. Mirrored onto state.drill as
   * well, so a consumer that would rather read state can.
   */
  function pushStage() {
    if (S.stage === S.pushedStage
        && Math.abs(S.stageProgress - S.pushedStageProgress) < 0.1) return;
    S.pushedStage = S.stage;
    S.pushedStageProgress = S.stageProgress;
    try { ctx.geology?.setStage?.(S.stage, S.stageProgress); } catch { /* optional */ }
  }

  /**
   * The inputs a competent operator would be running, WITH the pass taken into
   * account. Driving a pilot down and hauling a reamer up are opposite ends of
   * the same string, and the number the operator holds is not the same one.
   */
  function optimalNow(ground = S.ground, depth = S.stringDepth) {
    const inp = optimalInputs(S.m, ground, depth, S.bit);
    const st = activeStage();
    if (st && st.optWob != null) inp.wob = st.optWob;
    /* A REVERSE PASS MAY MOVE ALL THREE CONTROLS, NOT JUST THE FIRST.
       Only `optWob` used to be overridable, which was enough while both
       reverse passes in the game were pull-force problems whose other two
       levers barely moved. Jet grouting's are not: WORK becomes jet pressure
       and PROTECT becomes rotation, and the operator holds neither of them
       where the pre-drill did. Without these two the green band would tell a
       jet grouting operator to run the pump at the pre-drill's rotation. */
    if (st && st.optRpm != null) inp.rpm = st.optRpm;
    if (st && st.optFlush != null) inp.flush = st.optFlush;
    if (st && st.flushOff) inp.flush = 0;
    if (st && st.reverse) return inp;      // the pull axis has its own model

    /* NO COMPETENT OPERATOR PARKS THE NEEDLE IN THE RED.
       The pure model leans into hard rock, which is right for a bit that wants
       weight and wrong the moment the answer pegs the rig: a raise borer in
       quartzite would sit above its own torque limit all shift, banking rod
       fatigue and eventually parting a string for doing exactly what the model
       told it to do. Torque is linear in weight, so take the excess back off
       over the slope — one evaluation, no loop — and the green band always
       lands somewhere a machine can actually be held. */
    const t = S.m.torque;
    const q = torqueModel(S.m, S.bit, ground, inp, {
      depth, load: T.groove.targetLoad, wear: S.wear, drag: S.drag * 0.5,
      bind: 0, casing: S.casingOn, hazardTorque: 0,
    });
    const cap = T.torque.overLimit * T.torque.optimalHeadroom;
    const slope = t.wob * Math.pow(hardnessOf(nz(ground.ucs)), T.torque.cutHardExp)
                * nz(S.bit.wobCap, 1);
    if (q > cap && slope > 1e-3) inp.wob = clamp(inp.wob - (q - cap) / slope, 0.08, 1);
    return inp;
  }

  /** The live instance of a hazard kind, if there is one. */
  function liveHazard(kind) {
    for (const h of S.hazards) if (h.kind === kind && h.phase !== 'done') return h;
    return null;
  }

  /** Probability of an event with a per-metre rate over `dm` metres. */
  const perMetre = (rate, dm) => (dm > 0 && rand.f() < 1 - Math.exp(-rate * dm));

  /* ── generic timed beat ───────────────────────────────────────────────
     A short interruption with an optional timing window: the boom setting up
     on the next hole group, the cradle indexing round the fan, the resin
     curing, the pile going into the leaders, the set being taken. The rod add
     has its own older implementation and keeps it; everything new uses this. */
  const BEAT_PHASES = new Set([
    'boom-setup', 'charging', 'firing', 'mucking', 'misfire', 'trim-blast',
    'ring-index', 'redrill',
    'bolt-install', 'bolt-plate', 'bolt-torque', 'bolt-ream', 'bolt-inspect',
    'pitch', 'take-set', 'dolly-change', 're-drive',
    'spt-drive', 'clean-out', 'dissipation', 'blow-down',
    'bailing-run', 'cutter-change',
  ]);

  function beginBeat(phase, dur, opts = {}) {
    S.phase = phase;
    S.phaseT = 0;
    S.phaseDur = Math.max(0.05, dur);
    S.beat = {
      kind: opts.kind || phase,
      dur: S.phaseDur,
      windowStart: nz(opts.windowDelay, -1),
      windowEnd: nz(opts.windowDelay, -1) + nz(opts.windowSec, 0),
      hasWindow: opts.windowDelay != null,
      hit: false, missed: false,
      data: opts.data || null,
    };
    if (opts.quiet !== true) haptic('light', true);
    return S.beat;
  }

  function stepBeat(dt) {
    void dt;
    const b = S.beat;
    if (!b) { S.phase = 'drilling'; return; }
    if (b.hasWindow && !b.hit && !b.missed && S.phaseT > b.windowEnd) b.missed = true;
    // Live, per-frame work some beats need while they run.
    if (S.phase === 'charging') stepCharging();
    else if (S.phase === 'bolt-install') stepBoltInstall(dt);
    else if (S.phase === 'take-set') { if (stepTakeSet(dt)) return; }
    else if (S.phase === 'spt-drive') { if (stepSptDrive(dt)) return; }
    if (S.phaseT < S.phaseDur) return;
    finishBeat();
  }

  function finishBeat() {
    const b = S.beat;
    S.beat = null;
    S.phase = 'drilling';
    if (!b) return;
    switch (b.kind) {
      case 'boom-setup':   finishBoomSetup(b); break;
      case 'charging':     fireRound(); break;
      case 'firing':       settleRound(); break;
      case 'mucking':      beginRound(); break;
      case 'misfire':      beginRound(); break;
      case 'trim-blast':   beginRound(); break;
      case 'ring-index':   finishRingIndex(b); break;
      case 'redrill':      finishRedrill(); break;
      case 'bolt-install': finishBoltInstall(); break;
      case 'bolt-plate':   finishBoltPlate(); break;
      case 'bolt-torque':  finishTorqueTest(); break;
      case 'bolt-ream':    S.prog.holeOpen = true; break;
      case 'bolt-inspect': break;
      case 'pitch':        finishPitch(b); break;
      case 'take-set':     finishTakeSet(); break;
      case 'dolly-change': finishDollyChange(); break;
      case 're-drive':     finishReDrive(); break;
      case 'spt-drive':    finishSptDrive(); break;
      case 'clean-out':    S.prog.fallIn = 0; break;
      case 'dissipation':  finishDissipation(); break;
      case 'blow-down':    finishBlowDown(); break;
      case 'bail':         finishBailingRun(b); break;
      default: break;
    }
  }

  /* ── programme lifecycle ──────────────────────────────────────────────── */

  function startProgramme() {
    const m = S.m;
    if (m.sample) S.prog = startRc();
    else if (m.round) S.prog = startJumbo();
    else if (m.ring) S.prog = startLonghole();
    else if (m.bolt) S.prog = startBolt();
    else if (m.pile) S.prog = startPile();
    else if (m.probe) S.prog = startProbe();
    else if (m.stages && m.stages.length > 1) S.prog = startTwoStage();
    else S.prog = null;
    S.stageCount = (m.stages && m.stages.length) || 1;
  }

  /**
   * How much string is in the ground right now.
   *
   * This is the number that decides rod friction, blow decay down the steel and
   * annulus length, and getting it wrong is not a balance error — it is a wrong
   * answer. A jumbo drilling a 140-hole round has 4.8 m of drill steel out, not
   * the 670 m of hole the round adds up to, and not the tunnel's chainage.
   */
  function stringDepthNow() {
    const p = S.prog;
    if (p && p.kind === 'jumbo' && p.round) {
      return Math.max(0, p.round.drilledM - p.round.holeIndex * p.round.length);
    }
    return S.m.stringFromHole ? S.holeDepth : S.depth;
  }

  /**
   * Advance the programme by the metres of hole the bit just made, and return
   * the metres of CONTRACT progress that buys. On most methods it is the same
   * number; on a jumbo 670 m of hole buys 4.1 m of tunnel, and only after the
   * round has been charged and fired.
   */
  function stepProgramme(dt, dtD, dBore) {
    const p = S.prog;
    if (!p) return dBore;
    switch (p.kind) {
      case 'rc':       return stepRc(dt, dtD, dBore);
      case 'jumbo':    return stepJumbo(dt, dtD, dBore);
      case 'longhole': return stepLonghole(dt, dtD, dBore);
      case 'bolt':     return stepBolt(dt, dtD, dBore);
      case 'pile':     return stepPile(dt, dtD, dBore);
      case 'probe':    return stepProbe(dt, dtD, dBore);
      case 'twoStage': return stepTwoStage(dt, dtD, dBore);
      default:         return dBore;
    }
  }

  /* ═════════════════════════════════════════════════════════════════════
     rc — THE SAMPLE, NOT THE HOLE

     Air down the annulus of a dual-wall pipe, chips up the sealed inner tube
     to a cyclone and a splitter, one bag per metre. The sample never touches
     the hole above the bit face — that is the whole trick, and every failure
     mode here is a way of breaking that seal.
     ═════════════════════════════════════════════════════════════════════ */

  function startRc() {
    const s = S.m.sample;
    return {
      kind: 'rc',
      nextSampleDepth: s.intervalM,
      index: 0,
      holdUp: 0,            // last metre's chips still sitting in the inner tube
      wet: 0,               // 0 = dry sample, 1 = slurry
      cave: 0,              // wall rock that has joined the sample stream
      trainWear: 0,         // the ceramic cyclone, deflector and hose
      bags: [],             // one per metre, newest last
      recovery01: 1, contam01: 0, quality01: 1,
      highBags: 0, contamBags: 0, lossBags: 0, wetBags: 0,
      // Bags cut inside the ore body, split by whether the assay can be
      // trusted. `oreBagsLost` is the number that hurts: metres of economic
      // intercept the campaign drilled through and cannot report.
      oreBags: 0, oreBagsLost: 0,
      blowDowns: 0, lastBlowDown: -99,
    };
  }

  function stepRc(dt, dtD, dBore) {
    void dtD;
    const s = S.m.sample, p = S.prog;
    const air = clamp(S.act.flush * S.returns);

    // Hold-up: chips still in the inner tube when the next metre starts. This
    // is what the blow-down cycle exists to clear, and it is the only reason
    // metre 41 can arrive in the bag carrying metre 40.
    const gen = s.holdUpGen * (S.rop / s.holdUpRopRef) * (1 - 0.35 * air);
    p.holdUp = clamp(p.holdUp + (gen - s.holdUpClear * air * p.holdUp) * dt);

    // Wall rock joining the stream. The dual wall cannot stop material that
    // caves into the shroud at the face itself.
    p.cave = clamp(p.cave + (s.caveGen * (1 - clamp(S.stability)) - 0.5 * air) * dt);

    // Wetness dries back once the air is holding the face again.
    if (!liveHazard('wet-sample')) p.wet = clamp(p.wet - T.hazard.wetSample.dryPerSec * air * dt);

    // The sample train is a ceramic consumable and abrasive ground eats it.
    p.trainWear = clamp(p.trainWear + s.trainWearPerM * dBore
      * Math.pow(clamp(S.ground.abrasivity), T.wear.abrasivityExp));

    // ── the three hazards that belong to this method and to no other ──
    if (S.ground.water > 0.5 && air < T.hazard.wetSample.airMin && !liveHazard('wet-sample')
        && perMetre(0.9 * S.ground.water, dBore)) {
      queueHazard('wet-sample', { depth: S.depth, severity: clamp(S.ground.water) });
    }
    if (p.holdUp > T.hazard.carryOver.warnAt && !liveHazard('carry-over')) {
      queueHazard('carry-over', { depth: S.depth, severity: clamp(p.holdUp) });
    }
    if (p.trainWear > s.trainChokeAt && !liveHazard('cyclone-choke')
        && rand.f() < (p.trainWear - s.trainChokeAt) * 1.4 * dt) {
      queueHazard('cyclone-choke', { depth: S.depth, severity: clamp(p.trainWear) });
    }

    // ── cut the bag ──
    while (S.holeDepth >= p.nextSampleDepth) {
      cutSampleBag();
      p.nextSampleDepth += s.intervalM;
    }
    return dBore;
  }

  /**
   * One metre of hole becomes one bag off the splitter — or it does not.
   *
   * Recovery is rated statistically, against the mean split mass. A bag that is
   * too LIGHT is loss; a bag that is too HEAVY is caving or carry-over and is
   * flagged as contamination, which is the failure state this method is built
   * around: a perfect-looking hole delivering a worthless assay.
   */
  function cutSampleBag() {
    const s = S.m.sample, p = S.prog;
    const air = clamp(S.act.flush * S.returns);
    const gain = nz(S.bit.sampleGain, 1);

    // What the face actually delivered up the inner tube. A venturi-flushing
    // face is documented at a "40 % plus improvement in sample recovery", so it
    // closes 40 % of the SHORTFALL rather than multiplying the recovery — which
    // keeps a good bit meaningful without ever returning more rock than the
    // metre contained.
    const base = s.recoveryFloor + s.recoveryPerAir * air;
    let recovery = gain > 1 ? 1 - (1 - base) / gain : base;
    recovery *= 1 - s.wetRecoveryCut * p.wet;
    recovery = clamp(recovery, 0, 1);

    // What should not be in the bag: last metre's chips, and caved wall rock.
    const foreign = clamp(p.holdUp * s.holdUpToBag + p.cave * s.contamFromCave, 0, 1.5);

    // The split, in kilogrammes, with its natural scatter.
    const noise = 1 + (rand.f() - 0.5) * 2 * s.massSigma;
    const massKg = Math.max(0, s.targetKgPerM * (recovery + foreign) * noise);
    const sd = (massKg - s.targetKgPerM) / Math.max(1e-3, s.targetKgPerM * s.massSigma);

    let rating = 'high';
    if (sd > s.contamSd) { rating = 'contaminated'; p.contamBags++; }
    else if (sd < -s.lossSd) { rating = 'lost'; p.lossBags++; }
    else if (Math.abs(sd) > s.highSd) { rating = 'moderate'; }
    else { p.highBags++; }
    if (p.wet > 0.5) p.wetBags++;

    // Sample quality: what the assay can actually be trusted to say.
    const q = clamp(recovery * (1 - foreign) * (1 - 0.45 * p.wet));

    /* THE ASSAY. The whole point of the method: a bag has a grade, and the
       grade is only worth the sample it came out of. A contaminated bag reports
       a diluted number and a lost one reports nothing, which is exactly how a
       real campaign loses a discovery it actually drilled through.

       The grade band is only quoted when the geology says it is SOURCED —
       coal, iron, lithium and diamonds carry no sourced band, so their bags
       report the intercept and withhold the number rather than invent one. */
    const assay = sampleAssay(S.holeDepth - s.intervalM * 0.5);
    const bag = {
      index: ++p.index, fromM: +(S.holeDepth - s.intervalM).toFixed(2), toM: +S.holeDepth.toFixed(2),
      massKg: +massKg.toFixed(2), sd: +sd.toFixed(2), rating,
      recovery01: +clamp(recovery).toFixed(3), contam01: +foreign.toFixed(3),
      wet01: +p.wet.toFixed(2), quality01: +q.toFixed(3),
      assayable: q >= s.assayFloor,
      stratum: S.ground.id,
      ...assay,
      // What the lab reports is the bag, not the ground: dilute the grade by
      // what should not have been in it, and report nothing off a bag the
      // assay cannot be trusted with.
      reportedGrade: assay.gradeKnown && q >= s.assayFloor
        ? +(assay.grade / (1 + foreign)).toFixed(3) : null,
    };
    if (assay.inOre && bag.assayable) p.oreBags++;
    if (assay.inOre && !bag.assayable) p.oreBagsLost++;
    p.bags.push(bag);
    if (p.bags.length > 400) p.bags.shift();

    // Running totals, over every bag cut this hole.
    const n = p.index;
    p.recovery01 = ((n - 1) * p.recovery01 + clamp(recovery)) / n;
    p.contam01 = ((n - 1) * p.contam01 + foreign) / n;
    p.quality01 = ((n - 1) * p.quality01 + q) / n;

    // Cutting the bag empties the tube of what actually made it into the bag.
    p.holdUp *= 0.55;
    p.cave *= 0.5;
    haptic('light');
  }

  /* ═════════════════════════════════════════════════════════════════════
     tunnel-jumbo — THE ROUND

     The score is settled before the round is fired. Accuracy decides the pull
     and the overbreak; speed only decides how many rounds fit in a shift. And
     bad ground does not slow the drill — it shortens the round.
     ═════════════════════════════════════════════════════════════════════ */

  /** The cut's first burden, from the relief hole a round of this length uses. */
  function cutBurdenFor(lengthM) {
    const r = S.m.round;
    return lerp(r.cutBurdenM, r.cutBurdenLongM,
      sstep(r.cutBurdenShortRoundM, r.cutBurdenLongRoundM, nz(lengthM, r.lengthGood)));
  }

  function jumboRoundLength(g) {
    const r = S.m.round;
    const st = clamp(nz(g.stability, 0.7));
    if (st >= r.stabGood) return r.lengthGood;
    if (st >= r.stabFair) return r.lengthFair;
    return r.lengthPoor;      // 6 m spiles: the round comes down to 2.5-3.0 m
  }

  function startJumbo() {
    const r = S.m.round;
    const area = Math.max(8, nz(S.contract?.faceAreaM2, r.faceAreaM2));
    const holes = Math.max(12, Math.round(area * r.holesPerM2));
    const p = {
      kind: 'jumbo', faceAreaM2: area, holesPerRound: holes,
      roundIndex: 0, rounds: [], round: null,
      pull01: r.pullGood, overbreak: 0, halfBarrel: r.halfBarrelBase,
      chokedRounds: 0, underbreakRounds: 0, quality01: 1,
      advanceM: 0, drilledM: 0,
    };
    S.prog = p;
    p.round = newJumboRound();
    return p;
  }

  function newJumboRound() {
    const r = S.m.round, p = S.prog;
    const holes = p.holesPerRound;
    const len = jumboRoundLength(S.ground);
    const cut = Math.max(4, Math.round(holes * r.cutFrac));
    const contour = Math.max(6, Math.round(holes * r.contourFrac));
    const lifters = Math.max(3, Math.round(holes * r.lifterFrac));
    const stoping = Math.max(1, holes - cut - contour - lifters);
    return {
      index: p.roundIndex + 1,
      length: len, designLength: len, shortened: false,
      groups: [
        { id: 'cut',     holes: cut,     tolPct: r.cutAlignPct,   errPct: 0, drilled: 0 },
        { id: 'stoping', holes: stoping, tolPct: r.alignSpecPct,  errPct: 0, drilled: 0 },
        { id: 'lifters', holes: lifters, tolPct: r.alignSpecPct,  errPct: 0, drilled: 0 },
        { id: 'contour', holes: contour, tolPct: r.alignSpecPct,  errPct: 0, drilled: 0 },
      ],
      groupIndex: -1, holeIndex: 0, holeDevDeg: 0, holesDone: 0,
      aim: 0.5, collarErrM: 0, cutErrM: 0,
      lookout01: 0.7, chargeKgM: (r.contourChargeKgM[0] + r.contourChargeKgM[1]) / 2,
      totalHoles: cut + stoping + lifters + contour,
      totalM: holes * len, drilledM: 0,
      lastCollarWarn: -1,
      cutOpened: true, fired: false,
    };
  }

  const jumboGroup = () => {
    const rd = S.prog && S.prog.round;
    return rd && rd.groupIndex >= 0 ? rd.groups[rd.groupIndex] : null;
  };

  /** Open the next hole group with the boom-setup beat that sets its AIM. */
  function beginJumboGroup() {
    const rd = S.prog.round;
    rd.groupIndex++;
    if (rd.groupIndex >= rd.groups.length) { beginCharging(); return; }
    rd.holeDevDeg = 0;      // `holeIndex` counts holes across the WHOLE round, not the group
    beginBeat('boom-setup', S.m.round.boomSetupSec, {
      kind: 'boom-setup', data: { group: rd.groups[rd.groupIndex].id },
    });
  }

  /**
   * The boom is set. Whatever the ADVANCE control was holding at the end of the
   * beat is this group's AIM — which is exactly the sequence a jumbo operator
   * works in: collar, aim, drill. On the cut it means parallel; on the contour
   * it means look-out, and look-out is the structural cause of overbreak.
   */
  function finishBoomSetup(b) {
    const rd = S.prog.round;
    rd.aim = clamp(S.act.wob);
    if ((b.data && b.data.group) === 'contour') rd.lookout01 = rd.aim;
    haptic('medium', true);
  }

  function beginCharging() {
    beginBeat('charging', S.m.round.chargeSec, { kind: 'charging' });
  }

  /** While the round is being charged, the WORK control IS the contour charge. */
  function stepCharging() {
    const r = S.m.round, rd = S.prog.round;
    rd.chargeKgM = lerp(r.chargeRange[0], r.chargeRange[1], clamp(S.act.rpm));
  }

  function fireRound() {
    beginBeat('firing', S.m.round.fireSec, { kind: 'firing' });
    emitImpact(1, true);
    haptic('heavy', true);
  }

  /** The round has gone. Work out what it actually bought. */
  function settleRound() {
    const r = S.m.round, p = S.prog, rd = p.round;
    rd.fired = true;

    // Mean alignment error over the round, weighted by hole count, and the
    // contour's own error, which is what the half-casts remember.
    let holes = 0, errSum = 0, contourErr = 0;
    for (const g of rd.groups) {
      holes += g.holes;
      errSum += g.errPct * g.holes;
      if (g.id === 'contour') contourErr = g.errPct;
    }
    const alignMean = errSum / Math.max(1, holes);
    const alignOver = Math.max(0, alignMean / r.alignSpecPct - 1);

    // THE CUT. With a 0.113 m first burden, a hole whose toe misses by more
    // than the burden either collides with the relief hole or misses its
    // influence entirely — and a cut that does not open freezes the round.
    rd.cutOpened = rd.cutErrM <= cutBurdenFor(rd.length);

    // Look-out, and the two ways to get it wrong. `lookout01` started as the
    // aim the operator set on the boom and grew with every contour hole's own
    // splay, which is exactly how a real over-profile is built.
    const allow = r.lookoutBaseM + r.lookoutPerM * rd.length;
    const lookoutM = rd.lookout01 * 1.4 * allow;
    const lookoutFrac = lookoutM / Math.max(1e-3, allow);
    const underbreak = lookoutFrac < r.lookoutBand[0];
    const lookoutOver = Math.max(0, lookoutFrac - r.lookoutBand[1]);

    // OVER-CHARGING COSTS. Overloading the perimeter breaks rock behind the
    // line, which is overbreak you pay for twice: in shotcrete and in scaling.
    const chargeOver = Math.max(0, (rd.chargeKgM - r.contourChargeKgM[1])
      / Math.max(0.05, r.chargeRange[1] - r.contourChargeKgM[1]));
    const chargeUnder = Math.max(0, (r.contourChargeKgM[0] - rd.chargeKgM)
      / Math.max(0.05, r.contourChargeKgM[0] - r.chargeRange[0]));

    const pull = rd.cutOpened
      ? clamp(r.pullGood - r.pullPerAlign * alignOver - 0.25 * chargeUnder, r.pullFloor, 0.98)
      : r.pullFloor;
    const overbreak = clamp(r.overbreakPerLookout * lookoutOver + r.overbreakPerCharge * chargeOver, 0, 2);
    const halfBarrel = clamp(r.halfBarrelBase
      - r.halfBarrelPerCharge * chargeOver
      - r.halfBarrelPerAlign * Math.max(0, contourErr / r.alignSpecPct - 1));

    const advance = rd.length * pull;
    const accuracy = clamp(1 - alignOver * 0.8 - Math.max(0, rd.collarErrM / r.collarSpecM - 1) * 0.4);

    // The round's own grade, on the weighting the trade uses: pull 30,
    // overbreak 25, half-barrel 20, collar + alignment 15 — renormalised,
    // because cycle time is already the run's own time term.
    let q = 0.333 * pull / r.pullGood
          + 0.278 * clamp(1 - overbreak)
          + 0.222 * halfBarrel
          + 0.167 * accuracy;
    if (underbreak) q = Math.min(q, 0.35);      // no rock may protrude inside the profile
    q = clamp(q);

    const rec = {
      index: rd.index, lengthM: +rd.length.toFixed(2), advanceM: +advance.toFixed(2),
      pull01: +pull.toFixed(3), cutOpened: rd.cutOpened,
      alignPct: +alignMean.toFixed(2), contourAlignPct: +contourErr.toFixed(2),
      collarErrM: +rd.collarErrM.toFixed(3), cutErrM: +rd.cutErrM.toFixed(3),
      lookoutM: +lookoutM.toFixed(3), lookoutAllowM: +allow.toFixed(3),
      chargeKgM: +rd.chargeKgM.toFixed(2),
      overbreak: +overbreak.toFixed(3), halfBarrel01: +halfBarrel.toFixed(3),
      underbreak, quality01: +q.toFixed(3),
    };
    p.rounds.push(rec);
    p.roundIndex++;
    p.advanceM += advance;
    p.drilledM += rd.drilledM;
    p.pull01 = pull;
    p.overbreak = overbreak;
    p.halfBarrel = halfBarrel;
    if (!rd.cutOpened) p.chokedRounds++;
    if (underbreak) p.underbreakRounds++;
    p.quality01 = p.rounds.reduce((a, x) => a + x.quality01, 0) / p.rounds.length;

    // The chainage the blast bought, banked the moment it is fired.
    S.depth += advance;

    S.hazardsSeen++;
    if (q >= 0.6) S.hazardsClean++;
    S.hazardLog.push({ kind: 'round', depth: S.depth, clean: q >= 0.6, at: S.timeSec });

    // What happens next depends on what the round did.
    if (!rd.cutOpened) {
      // A choked round leaves a face full of holes that did not fire. You wait.
      // You do not reload, and you do not drill through the muck.
      beginBeat('misfire', r.misfireSec, { kind: 'misfire' });
      haptic('fail', true);
    } else if (underbreak) {
      beginBeat('trim-blast', r.underbreakTrimSec, { kind: 'trim-blast' });
      haptic('fail', true);
    } else {
      const sec = r.muckSecPerM * advance + r.scalePerOverbreak * overbreak;
      beginBeat('mucking', Math.max(1.0, sec), { kind: 'mucking' });
      haptic('success', true);
    }
    if (S.depth >= S.target) complete();
  }

  function beginRound() {
    if (!S.active) return;
    const p = S.prog;
    p.round = newJumboRound();
    S.holeDepth = 0;
    beginJumboGroup();
  }

  function stepJumbo(dt, dtD, dBore) {
    void dtD;
    const r = S.m.round, p = S.prog, rd = p.round;
    if (!rd || rd.fired) return 0;
    if (rd.groupIndex < 0) { beginJumboGroup(); return 0; }

    const g = jumboGroup();
    if (!g) return 0;

    // A twin-boom jumbo drills two holes at once, and the gauge shows what ONE
    // drill is doing, because that is what the operator is watching. The CUT is
    // drilled hole by hole at a fraction of that rate, because on the cut the
    // collar and the aim are worth an order of magnitude more than the metres.
    const dHole = (dBore * r.booms) / (g.id === 'cut' ? r.cutSlowdown : 1);
    rd.drilledM += dHole;
    // `holeDepth` on a jumbo is metres into THIS hole, not metres of round.
    S.holeDepth = Math.max(0, rd.drilledM - rd.holeIndex * rd.length);

    // Deviation is banked per METRE OF HOLE, not per second — a hole wanders
    // because of how it was drilled, not because of how long it took.
    const opt = optimalInputs(S.m, S.ground, S.stringDepth, S.bit);
    const hard = hardnessOf(S.ground.ucs);
    rd.holeDevDeg += r.devDegPerM * Math.abs(S.act.wob - opt.wob)
                   * (1 + T.straight.hardMul * hard) * dHole;

    // The collaring window at the start of every hole: at full feed the bit
    // walks off the mark, and on the cut the mark is the whole game.
    /* The collar is scored on the CUT and on the CONTOUR — the two groups whose
       position is the tunnel. Raising it on all 140 holes of the face would be
       noise, and on the stoping it is not the number that decides anything. */
    const intoHole = rd.drilledM - rd.holeIndex * rd.length;
    if ((g.id === 'cut' || g.id === 'contour')
        && intoHole < r.collarWindowM && !liveHazard('collar-slip')
        && S.act.wob > T.hazard.collarSlip.wobMax && rd.holeIndex !== rd.lastCollarWarn) {
      rd.lastCollarWarn = rd.holeIndex;
      queueHazard('collar-slip', { depth: S.depth, severity: clamp(S.act.wob) });
    }

    // The cut closing. Warn while there is still a hole to save.
    if (g.id === 'cut') {
      const toeM = rd.length * Math.tan((rd.holeDevDeg * Math.PI) / 180);
      const err = rd.collarErrM + toeM;
      const burden = cutBurdenFor(rd.length);
      if (err > burden * 0.72 && !liveHazard('cut-choke')) {
        queueHazard('cut-choke', { depth: S.depth, severity: clamp(err / burden) });
      }
    }

    // Bad ground at the face. The round must come down; it does not slow down.
    if (S.ground.stability < r.stabFair && !rd.shortened && !liveHazard('bad-ground')
        && perMetre(0.02, dHole)) {
      queueHazard('bad-ground', { depth: S.depth, severity: clamp(1 - S.ground.stability) });
    }

    // A hole is finished: record its toe and move on.
    let guard = 0;
    while (rd.drilledM >= (rd.holeIndex + 1) * rd.length
           && rd.holeIndex < rd.totalHoles && guard++ < 64) {
      finishJumboHole(g, rd);
      if (g.drilled >= g.holes) { beginJumboGroup(); break; }
    }
    return 0;
  }

  function finishJumboHole(g, rd) {
    const r = S.m.round;
    const toeM = rd.length * Math.tan((rd.holeDevDeg * Math.PI) / 180);
    const errPct = ((rd.collarErrM + toeM) / Math.max(0.1, rd.length)) * 100;
    g.errPct = (g.errPct * g.drilled + errPct) / (g.drilled + 1);
    g.drilled++;
    rd.holeIndex++;
    rd.holesDone++;
    if (g.id === 'cut') rd.cutErrM = Math.max(rd.cutErrM, rd.collarErrM + toeM);
    if (g.id === 'contour') {
      // Every contour hole's own splay adds to the look-out the round leaves.
      rd.lookout01 += toeM / Math.max(1e-3, r.lookoutBaseM + r.lookoutPerM * rd.length) / Math.max(1, g.holes);
    }
    rd.holeDevDeg = 0;
    rd.collarErrM = Math.max(0, rd.collarErrM - 0.02);   // the next collar is a fresh mark
    haptic('light');
  }

  /* ═════════════════════════════════════════════════════════════════════
     longhole — THE RING

     A fan of holes out of a drill drive, and the driller never sees the rock
     being broken. Deviation moves the toe, the toe decides dilution, and the
     deviation is INVISIBLE until the ring is surveyed. You get cues.
     ═════════════════════════════════════════════════════════════════════ */

  function startLonghole() {
    const r = S.m.ring;
    const len = Math.max(4, nz(S.contract?.holeLengthM, r.holeLengthM));
    const total = Math.max(3, Math.round(S.target / len));
    const p = {
      kind: 'longhole', holeLengthM: len, holesTotal: total,
      holeIndex: 0, ringIndex: 0, inRing: 0,
      uphole: false, devPct: 0, blocked: false, cue01: 0,
      toes: [], quality01: 1,
      dilutionHoles: 0, oreLossHoles: 0, convergedPairs: 0, blockedHoles: 0, redrills: 0,
      lastToeOffset: null,
    };
    S.prog = p;
    setLongholeHole(p, 0);
    return p;
  }

  /** Which hole of the fan is on the feed, and is it an uphole or a downhole? */
  function setLongholeHole(p, index) {
    const r = S.m.ring;
    p.holeIndex = index;
    p.inRing = index % r.holesPerRing;
    p.ringIndex = Math.floor(index / r.holesPerRing);
    p.uphole = p.inRing < Math.round(r.holesPerRing * r.upholeFrac);
    p.devPct = 0;
    p.blocked = false;
    S.holeDepth = 0;
  }

  function stepLonghole(dt, dtD, dBore) {
    void dtD;
    const r = S.m.ring, p = S.prog;
    if (p.holeIndex >= p.holesTotal) return 0;

    // Deviation, banked per metre of hole and never shown.
    const opt = optimalInputs(S.m, S.ground, S.stringDepth, S.bit);
    const hard = hardnessOf(S.ground.ucs);
    p.devPct += r.devPctPerM * Math.abs(S.act.wob - opt.wob)
              * (1 + T.straight.hardMul * hard) * dBore;

    // The cue. Not a readout: the feed pressure roughening and the string
    // talking, which is all a production driller actually has.
    const base = clamp((p.devPct / (r.devSpecPct * 1.6)) * r.cuePerDev / 2.4);
    p.cue01 = clamp(base * (0.80 + 0.20 * Math.sin(S.timeSec * 0.7 + p.holeIndex)));

    // ── the three hazards, and two of them have OPPOSITE flushing answers ──
    if (!p.uphole && !liveHazard('hole-blocked') && perMetre(r.blockChancePerM, dBore)) {
      queueHazard('hole-blocked', { depth: S.depth, severity: clamp(0.4 + 0.5 * S.load) });
    }
    if (p.uphole && !liveHazard('uphole-flush') && perMetre(r.upholeChancePerM, dBore)) {
      queueHazard('uphole-flush', { depth: S.depth, severity: clamp(0.35 + 0.5 * S.act.flush) });
    }
    if (!liveHazard('rod-whip') && perMetre(r.whipChancePerM * (0.4 + S.act.wob), dBore)) {
      queueHazard('rod-whip', { depth: S.depth, severity: clamp(S.act.wob) });
    }

    if (S.holeDepth >= p.holeLengthM) finishLongholeHole(false);
    return dBore;
  }

  function finishLongholeHole(blocked) {
    const r = S.m.ring, p = S.prog;
    /* A hole that is abandoned still USED UP its position in the fan. The ring
       is measured in designed metres, so an abandoned hole's undrilled metres
       are consumed whether or not the rock was ever cut — otherwise the ring
       could never be completed and a blocked hole would quietly become an
       unwinnable run rather than the ore loss it actually is. */
    if (blocked) S.depth += Math.max(0, p.holeLengthM - S.holeDepth);
    const toeErrM = p.holeLengthM * (p.devPct / 100);
    // Which way it wandered. Deterministic per hole, so a replay is a replay.
    const sign = ((p.holeIndex * 2654435761) >>> 0) % 2 ? 1 : -1;
    const toeOffset = sign * toeErrM;
    const outsideOre = toeErrM > r.oreHalfWidthM;
    const converged = p.lastToeOffset != null
      && Math.abs(toeOffset - p.lastToeOffset) > r.designToeSpacingM - r.convergeM;

    const accuracy = clamp(1 - Math.max(0, p.devPct / r.devSpecPct - 1) / 2);
    const q = clamp(accuracy * (blocked ? 0.35 : 1) * (outsideOre ? 0.45 : 1) * (converged ? 0.7 : 1));

    p.toes.push({
      index: p.holeIndex + 1, ring: p.ringIndex + 1, inRing: p.inRing + 1,
      uphole: p.uphole, lengthM: +p.holeLengthM.toFixed(1),
      devPct: +p.devPct.toFixed(2), toeErrM: +toeErrM.toFixed(3), toeOffsetM: +toeOffset.toFixed(3),
      outsideOre, converged, blocked, quality01: +q.toFixed(3),
    });
    if (outsideOre) p.dilutionHoles++;
    if (blocked) { p.blockedHoles++; p.oreLossHoles++; }
    if (converged) p.convergedPairs++;
    p.quality01 = p.toes.reduce((a, x) => a + x.quality01, 0) / p.toes.length;
    p.lastToeOffset = toeOffset;

    S.hazardsSeen++;
    if (q >= 0.6) S.hazardsClean++;

    const next = p.holeIndex + 1;
    if (next >= p.holesTotal) { setLongholeHole(p, next); return; }
    // The feed cradle rotating round the fan: the beat this method owns.
    beginBeat('ring-index', r.indexSec, {
      kind: 'ring-index', windowDelay: r.indexSec * 0.4, windowSec: r.indexWindowSec,
      data: { next: next + 1 },
    });
  }

  function finishRingIndex(b) {
    const p = S.prog;
    setLongholeHole(p, p.holeIndex + 1);
    if (b.hit) { S.greenBandTime = Math.min(T.groove.comboRampSec, S.greenBandTime + 0.6); haptic('success', true); }
  }

  function finishRedrill() {
    const p = S.prog;
    p.redrills++;
    p.blocked = false;
    S.load = Math.max(0, S.load - 0.4);
    const h = liveHazard('hole-blocked');
    if (h) finishHazard(h, false);
  }

  /* ═════════════════════════════════════════════════════════════════════
     rockbolt — THE BOLT

     Scored on install quality, never on bolts per hour. Two mechanics live
     here and nowhere else: reading friction-bolt slot closure, and the
     scheduled first / every-tenth / last torque sample (a crew rule, not a
     statute — see `bolt.torqueTestEvery`).
     ═════════════════════════════════════════════════════════════════════ */

  function resolveBoltType() {
    const lo = loadoutIds();
    const ids = Object.values(lo).filter((v) => typeof v === 'string').join(' ').toLowerCase();
    if (ids.includes('friction') || ids.includes('split-set') || ids.includes('split-tube')) return 'friction';
    if (ids.includes('mech') || ids.includes('expansion')) return 'mechanical';
    return 'resin';           // resin cartridges are the default: PROTECT is the mix and the hold
  }

  function startBolt() {
    const b = S.m.bolt;
    const total = Math.max(1, Math.round(S.target / (b.ringSpacingM / b.perRing)));
    const p = {
      kind: 'bolt', type: resolveBoltType(),
      total, index: 0, ring: 1, inRing: 1,
      holeTargetM: b.lengthM + b.overdrillM,
      holeOpen: true, holeDevDeg: 0, holeMm: 0,
      spinT: 0, spunSec: 0, gelled: false, heldSec: 0, mixIn: 0, mixT: 0,
      driveSec: 0, anchorage: 1, slotClosureIn: b.slotClosedIn,
      installs: [], testsDue: 0, testsTaken: 0, testsMissed: 0, testsFailed: 0,
      torqueWindowT: -1, lastTorqueKnm: 0,
      quality01: 1, patternGaps: 0, supportedM: 0,
      advancePerBolt: b.ringSpacingM / b.perRing,
    };
    return p;
  }

  /** The hole diameter the fitted bit is actually making right now. */
  function boltHoleMm() {
    const b = S.m.bolt;
    const gauge = nz(S.bit.gaugeMm, b.bitMmIdeal + 3);
    // A worn button bit under-gauges: the hole gets TIGHTER, which is harder to
    // drive and better anchorage. Broken ground over-breaks and does the
    // opposite. Both are real and they pull against each other.
    return gauge - b.gaugeWearMm * clamp(S.wear) + b.overbreakMm * (1 - clamp(S.stability));
  }

  function stepBolt(dt, dtD, dBore) {
    void dtD;
    const b = S.m.bolt, p = S.prog;
    if (p.index >= p.total) {
      // The pattern is complete — but the LAST BOLT of the shift is one of the
      // three that must be torque tested, so the shift is not over until the
      // window on it has been honoured or has run out.
      if (p.torqueWindowT > 0 && S.timeSec < p.torqueWindowT) return 0;
      complete();
      return 0;
    }

    const opt = optimalInputs(S.m, S.ground, S.stringDepth, S.bit);
    const hard = hardnessOf(S.ground.ucs);
    p.holeDevDeg += b.devDegPerM * Math.abs(S.act.wob - opt.wob)
                  * (1 + T.straight.hardMul * hard) * dBore;

    // The hole squeezing shut in broken ground before the bolt gets into it.
    if (S.ground.stability < 0.4 && !liveHazard('bolt-hole-collapse')
        && perMetre(0.09 * (1 - S.ground.stability), dBore)) {
      queueHazard('bolt-hole-collapse', { depth: S.depth, severity: clamp(1 - S.ground.stability) });
    }

    if (S.holeDepth >= p.holeTargetM) beginBoltInstall();
    return 0;               // the drive is only supported once the bolt is IN
  }

  function beginBoltInstall() {
    const b = S.m.bolt, p = S.prog;
    p.holeMm = boltHoleMm();
    p.spunSec = 0; p.gelled = false; p.heldSec = 0; p.mixIn = 0; p.mixT = 0; p.driveSec = 0;

    if (p.type === 'friction') {
      // A slotted tube larger than the hole, hammered in with the drifter. The
      // drive time is itself the field tell: a bolt that goes in easily has not
      // gripped anything.
      const tight = clamp((b.bitMmZero - p.holeMm) / Math.max(0.1, b.bitMmZero - b.bitMmIdeal));
      const dur = Math.max(0.5, b.driveSecFull * (0.35 + 0.65 * tight));
      beginBeat('bolt-install', dur, { kind: 'bolt-install', data: { type: 'friction', tight } });
    } else if (p.type === 'resin') {
      beginBeat('bolt-install', b.spinSec + b.gelSec + b.holdSec,
        { kind: 'bolt-install', data: { type: 'resin' } });
    } else {
      beginBeat('bolt-install', b.driveSecFull, { kind: 'bolt-install', data: { type: 'mechanical' } });
    }
  }

  /**
   * WHICH THIRD OF A RESIN INSTALL IS RUNNING — spin, gel or hold, or null when
   * no resin bolt is being installed. `gelSec` is measured from the first turn
   * of the bar, not from the end of the spin, so the boundaries are simply
   * `spinSec` then `gelSec`. This is the ONE place they are read: the step
   * function scores against it and both telemetry surfaces publish it, so a
   * consumer animating the still pose and the code deciding whether the bar is
   * allowed to turn cannot drift apart.
   */
  function resinStage() {
    const p = S.prog;
    if (S.phase !== 'bolt-install' || !p || p.kind !== 'bolt' || p.type !== 'resin') return null;
    const b = S.m.bolt, t = S.phaseT;
    return t <= b.spinSec ? 'spin' : t <= b.gelSec ? 'gel' : 'hold';
  }

  /**
   * The install, live. For a resin bolt this is the whole method in one beat:
   * spin the bar through the cartridges, STOP before the gel, and hold without
   * turning while it cures. Spinning past the gel shears the bond it just made.
   */
  function stepBoltInstall(dt) {
    const b = S.m.bolt, p = S.prog;
    if (p.type !== 'resin') { p.driveSec += dt; return; }

    const stage = resinStage();
    // PROTECT is the resin / water mix ratio for as long as the spin lasts.
    if (stage === 'spin') {
      const inBand = S.act.flush >= b.mixBand[0] && S.act.flush <= b.mixBand[1];
      if (inBand) p.mixIn += dt;
      p.mixT += dt;
      if (S.act.rpm > 0.35) p.spunSec += dt;
    } else if (stage === 'gel') {
      // The gel window. Rotation now is the one thing that must not happen.
      if (!p.gelled && !liveHazard('gel-clock')) {
        p.gelled = true;
        queueHazard('gel-clock', { depth: S.depth, severity: 0.8 });
      }
    } else if (S.act.rpm <= T.hazard.gelClock.rpmMax) {
      p.heldSec += dt;
    }
  }

  function finishBoltInstall() {
    const b = S.m.bolt, p = S.prog;
    /* NO CROOKEDNESS TERM — see `bolt.devDegPerM`. `holeDevDeg` is still
       measured and still goes in the install log, because it is a real thing
       about the hole; it just does not change what the bolt holds, in either
       direction, because nothing here can source that it does. */
    let anchorage;

    if (p.type === 'friction') {
      // The hole must be SMALLER than the tube, and pull-out falls monotonically
      // as the bit gets bigger. In competent rock there is no overbreak to
      // forgive the diameter, so the hole really is the bit.
      let dia = clamp((b.bitMmZero - p.holeMm) / Math.max(0.1, b.bitMmZero - b.bitMmIdeal));
      if (S.ground.ucs >= b.competentUcs) dia = Math.pow(dia, b.competentSensitivity);
      const drive = clamp(p.driveSec / b.driveSecFull, 0.2, 1.2);
      anchorage = clamp(dia * Math.min(1, drive));
      // THE SLOT. Closed by 1/16 in means full rock-to-metal contact; unchanged
      // means the hole was too big and the bolt is holding nothing.
      p.slotClosureIn = +(b.slotClosedIn * dia).toFixed(4);
    } else if (p.type === 'resin') {
      const mix = p.mixT > 0 ? clamp(p.mixIn / p.mixT) : 0;
      const spin = clamp(p.spunSec / b.spinSec);
      const hold = clamp(p.heldSec / b.holdSec);
      anchorage = clamp(mix * spin * (0.35 + 0.65 * hold));
      p.slotClosureIn = null;
    } else {
      anchorage = 0.85;                      // the torque test is what finishes this one
      p.slotClosureIn = null;
    }

    p.anchorage = anchorage;
    beginBeat('bolt-plate', b.plateSec, { kind: 'bolt-plate' });
  }

  function finishBoltPlate() {
    const b = S.m.bolt, p = S.prog;
    const plateTight = !liveHazard('loose-plate');
    const quality = clamp(p.anchorage * (plateTight ? 1 : 1 - T.hazard.loosePlate.qualityCut));

    const n = p.index + 1;
    // The crew's sample: the first bolt, every tenth, and the last of the
    // shift. Testing is required practice (29 CFR 1926.800(o)(3)(iv)(A)); the
    // RATE is the game's own schedule and must never be called statutory.
    const due = n === 1 || n % b.torqueTestEvery === 0 || n === p.total;
    p.installs.push({
      index: n, ring: p.ring, type: p.type,
      holeMm: +p.holeMm.toFixed(1), holeDevDeg: +p.holeDevDeg.toFixed(2),
      anchorage01: +p.anchorage.toFixed(3),
      slotClosureIn: p.slotClosureIn,
      plateTight, quality01: +quality.toFixed(3),
      torqueDue: due, torqueTaken: false, torqueKnm: null,
    });
    if (p.installs.length > 400) p.installs.shift();

    p.index = n;
    p.supportedM += p.advancePerBolt;
    // The drive is supported once the bolt is IN — never while the hole is open.
    S.depth += p.advancePerBolt;
    p.inRing++;
    if (p.inRing > b.perRing) { p.inRing = 1; p.ring++; }
    p.quality01 = p.installs.reduce((a, x) => a + x.quality01, 0) / p.installs.length;
    S.hazardsSeen++;
    if (quality >= 0.6) S.hazardsClean++;

    if (due) { p.testsDue++; p.torqueWindowT = S.timeSec + b.torqueWindowSec; }

    // Reset for the next bolt.
    p.holeDevDeg = 0;
    p.holeOpen = true;
    S.holeDepth = 0;
    // If a scheduled test is now due, the run stays open until its window has
    // passed — otherwise the last bolt of the shift could never be tested and
    // the audit would fail the player for the sim's own timing.
    if (!due && (S.depth >= S.target || p.index >= p.total)) complete();
  }

  function finishTorqueTest() {
    const b = S.m.bolt, p = S.prog;
    const rec = p.installs[p.installs.length - 1];
    // Installation tension should be at least 50 % of the lesser of the bolt
    // yield point or the rock's anchorage capacity — so a bolt that is not
    // anchored CANNOT be torqued into the band, and the test is what finds it.
    // A properly installed bolt reads mid-band; a half-anchored one reads low.
    const mid = lerp(b.torqueBandKnm[0], b.torqueBandKnm[1], 0.55);
    const kNm = mid * (0.5 + 0.5 * clamp(p.anchorage)) * (0.92 + 0.16 * rand.f());
    const inBand = kNm >= b.torqueBandKnm[0] && kNm <= b.torqueBandKnm[1];
    p.lastTorqueKnm = +kNm.toFixed(2);
    p.testsTaken++;
    if (!inBand) p.testsFailed++;
    if (rec) { rec.torqueTaken = true; rec.torqueKnm = p.lastTorqueKnm; rec.torqueInBand = inBand; }
    p.torqueWindowT = -1;
    haptic(inBand ? 'success' : 'fail', true);
  }

  /* ═════════════════════════════════════════════════════════════════════
     driven-pile — DRIVING TO SET

     No rotation, no flush, no hole. Hammer energy and blow rate off one
     hydraulic envelope, alignment as the third control, and a set gauge that
     CAN LIE: a brooming toe drives the measured set down while the pile goes
     nowhere. Only the depth into the bearing stratum is honest.
     ═════════════════════════════════════════════════════════════════════ */

  function startPile() {
    const p0 = S.m.pile;
    const p = {
      kind: 'pile',
      blows: 0, incBlows: 0, incTopM: 0, log: [],
      toeDepthM: 0,                 // THE TRUTH: where the toe actually is
      headDepthM: 0,                // what the driving record says
      headDamage: 0, toeDamage: 0, rake: 0,
      stress: 0, stressPeak: 0, stressSec: 0,
      dollyWear: 0, dollyChanges: 0,
      measuredSetMm: 0, trueSetMm: 0, broomMm: 0,
      designSetMm: 0, bearingTopM: null, bearingPenM: 0, founded: false,
      refusalRun: 0, refused: false, hardRefused: false,
      setTaken: false, setBlows: 0, setHeld: 0, setSamples: [],
      monitored: hasPdaInstrumentation(), steel: pileIsSteel(),
      pitched: false, quality01: 1, rejected: false, reDrives: 0,
    };
    S.prog = p;
    p.bearingTopM = findBearingStratum();
    p.designSetMm = designSetMm(p);
    return p;
  }

  /** Does the loadout carry driving-stress instrumentation? */
  function hasPdaInstrumentation() {
    const lo = loadoutIds();
    const ids = Object.values(lo).filter((v) => typeof v === 'string').join(' ').toLowerCase();
    return ids.includes('pda') || ids.includes('pile-driving-analyser') || ids.includes('stress-monitor');
  }

  /** Concrete or steel — it changes which code limit the driving stress is against. */
  function pileIsSteel() {
    const lo = loadoutIds();
    const ids = Object.values(lo).filter((v) => typeof v === 'string').join(' ').toLowerCase();
    return ids.includes('steel') || ids.includes('tubular') || ids.includes('sheet') || ids.includes('h-pile');
  }

  /** The first bed at or below the design toe level that can carry the pile. */
  function findBearingStratum() {
    const p0 = S.m.pile;
    const step = Math.max(0.25, S.target / 80);
    for (let d = S.target * 0.35; d <= S.target * 1.4; d += step) {
      const g = S.strata.length ? groundFromSynth(d) : sampleGround(d);
      if (nz(g.ucs) >= p0.bearingUcsMin) return nz(g.top, d);
    }
    return null;
  }

  /**
   * The design set — the green band on the set gauge. It is the set this
   * hammer produces at the design toe level, and it is a contract number, so
   * it does not drift the way a torque sweet spot does.
   */
  function designSetMm(p) {
    const m = S.m, p0 = m.pile;
    // The design set is the set the pile must achieve AT ITS FOUNDING LEVEL —
    // in the bearing stratum, at the required penetration into it. Computing it
    // at the nominal design depth instead would put the band in a bed the toe
    // is not going to stop in, and the gauge would be asking for the wrong set.
    const level = p.bearingTopM == null ? S.target : p.bearingTopM + p0.bearingPenM;
    const g = S.strata.length ? groundFromSynth(level) : sampleGround(level);
    const h = hammerSetting(m, 0.85, 0.30);
    const eff = lerp(p0.effHydraulic[0], p0.effHydraulic[1], 0.85) * nz(S.bit.aggression, 1);
    return Math.max(0.6, setPerBlow(m, g, level, h.energy01 * eff));
  }

  function stepPile(dt, dtD, dBore) {
    void dBore;
    const m = S.m, p0 = m.pile, p = S.prog;
    if (!p.pitched) { beginPitch(); return 0; }

    const h = hammerSetting(m, S.act.wob, S.act.rpm);
    const drop01 = clamp(h.dropM / p0.strokeMaxM);
    const blows = (h.bpm / 60) * dtD;
    const off = Math.abs(clamp(S.act.flush) - p0.alignCentre) / Math.max(1e-3, p0.alignCentre);
    const dollyCond = clamp(1 - p.dollyWear);
    const toeSharp = sstep(0, p0.toeSpikeUcs * 2, nz(S.ground.ucs));

    // ── the alignment wanders, because the helmet is deliberately not tight ──
    p.rake = clamp(p.rake + p0.rakePerAlign * off * dt, 0, p0.rakeMaxDeg * 1.4);
    if (off < 0.2) p.rake = Math.max(0, p.rake - p0.rakePerAlign * 0.4 * dt);

    // ── set: what the pile actually does, and what the instrument reads ──
    const eff = clamp(lerp(p0.effHydraulic[0], p0.effHydraulic[1], dollyCond)
                      * nz(S.bit.aggression, 1), p0.dollyEffMin * 0.9, 0.98);
    const align = lerp(1, p0.alignEffMin, clamp(off));
    const delivered = h.energy01 * eff * align;
    p.trueSetMm = setPerBlow(m, S.ground, p.toeDepthM, delivered);
    p.broomMm = p0.broomSetMm * p.toeDamage * drop01;
    p.measuredSetMm = p.trueSetMm + p.broomMm;

    // ── damage ──
    p.headDamage = clamp(p.headDamage + p0.headPerBlow * blows * drop01
      * (0.25 + 0.75 * clamp(off)) * (2 - dollyCond));
    p.toeDamage = clamp(p.toeDamage + p0.toePerBlow * blows * drop01 * toeSharp);
    p.dollyWear = clamp(p.dollyWear + p0.dollyWearPerBlow * blows * drop01);

    // ── driving stress, and the code limit it is measured against ──
    p.stress = p0.stressPerDrop * drop01 + p0.stressPerToe * toeSharp;
    p.stressPeak = Math.max(p.stressPeak, p.stress);
    const limit = p0.stressLimit
      + (p.monitored ? (p.steel ? p0.stressSteelAdd : p0.stressMonitoredAdd) : 0);
    if (p.stress > limit) {
      p.stressSec += dt;
      if (p.stressSec > p0.stressHoldSec) { p.stressSec = 0; S.safetyEvents++; haptic('fail'); }
    } else p.stressSec = Math.max(0, p.stressSec - dt * 0.5);

    // ── penetration, and the blow log ──
    const dTrue = (p.trueSetMm / 1000) * blows;
    const dHead = (p.measuredSetMm / 1000) * blows;
    p.toeDepthM += dTrue;
    p.headDepthM += dHead;
    p.blows += blows;
    p.incBlows += blows;
    logPileBlows(p);

    if (p.bearingTopM != null && p.toeDepthM > p.bearingTopM) {
      p.bearingPenM = p.toeDepthM - p.bearingTopM;
      p.founded = p.bearingPenM >= p0.bearingPenM;
    }

    // ── the three hazards that belong to a driven pile ──
    if (!liveHazard('obstruction') && toeSharp > 0.25 && rand.f() < 0.35 * toeSharp * dt) {
      queueHazard('obstruction', { depth: p.headDepthM, severity: clamp(toeSharp) });
    }
    if (!liveHazard('head-damage') && dollyCond < 0.45 && rand.f() < 0.5 * (0.45 - dollyCond) * dt) {
      queueHazard('head-damage', { depth: p.headDepthM, severity: clamp(1 - dollyCond) });
    }
    const blowsPer250 = 250 / Math.max(0.05, p.measuredSetMm);
    if (!liveHazard('premature-refusal') && !p.founded
        && blowsPer250 > p0.practicalBlows && p.headDepthM < S.target * 0.9
        && rand.f() < 0.6 * dt) {
      queueHazard('premature-refusal', { depth: p.headDepthM, severity: clamp(blowsPer250 / p0.refusalBlows) });
    }

    // ── the end of the pile ──
    // Never an unwinnable state: if the driller has not called the set, the
    // crew calls it. Refusal is a legitimate outcome and so is a founded pile;
    // the depth backstop exists only so a run can never fail to terminate.
    if (!p.setTaken && S.phase === 'drilling'
        && (p.hardRefused || p.refused
            || (p.founded && p.headDepthM >= S.target)
            || p.headDepthM >= S.target * 1.35)) {
      beginTakeSet();
    }
    return dHead;
  }

  /** Blows per 250 mm over the drive, and per 25 mm through the final metre. */
  function logPileBlows(p) {
    const p0 = S.m.pile;
    const finalMetre = p.headDepthM >= Math.max(0, S.target - p0.finalMetreM);
    const incM = (finalMetre ? p0.finalIncrementMm : p0.incrementMm) / 1000;
    while (p.headDepthM - p.incTopM >= incM) {
      const blows = p.incBlows * (incM / Math.max(1e-6, p.headDepthM - p.incTopM));
      const per250 = blows * (0.25 / incM);
      p.log.push({
        fromM: +p.incTopM.toFixed(3), toM: +(p.incTopM + incM).toFixed(3),
        incrementMm: Math.round(incM * 1000),
        blows: Math.round(blows), blowsPer250: Math.round(per250),
        toeM: +p.toeDepthM.toFixed(3),
      });
      if (p.log.length > 500) p.log.shift();

      // Refusal: 248 blows/250 mm sustained over 1.5 consecutive metres, or
      // 662 over 0.3 m. A refused pile is a RESULT, not a failure.
      if (per250 >= p0.refusalBlows) p.refusalRun += incM; else p.refusalRun = 0;
      if (p.refusalRun >= p0.refusalOverM) p.refused = true;
      if (per250 >= p0.hardRefusalBlows && incM >= 0.02) p.hardRefused = true;

      p.incTopM += incM;
      p.incBlows = Math.max(0, p.incBlows - blows);
    }
  }

  function beginPitch() {
    const p0 = S.m.pile;
    S.prog.pitched = true;
    beginBeat('pitch', p0.pitchSec, {
      kind: 'pitch', windowDelay: p0.pitchWindowDelay, windowSec: p0.pitchWindowSec,
    });
  }

  function finishPitch(b) {
    if (b.hit) { S.timeSec = Math.max(0, S.timeSec - 1.2); haptic('success', true); }
  }

  function beginTakeSet() {
    const p0 = S.m.pile, p = S.prog;
    // Ten blows at the blow rate the player is actually running, in REAL player
    // seconds — counting them is the whole point of the beat, so the compressed
    // clock does not apply to it.
    const h = hammerEnvelope(S.m, S.act.rpm);
    p.setBlows = 0; p.setHeld = 0; p.setSamples = [];
    p.setRefWob = S.act.wob; p.setRefFlush = S.act.flush;
    beginBeat('take-set', (p0.setBlows / h.bpm) * 60, { kind: 'take-set' });
  }

  /** The set, blow by blow: hold the energy and the alignment steady for ten. */
  function stepTakeSet(dt) {
    const p0 = S.m.pile, p = S.prog;
    const h = hammerSetting(S.m, S.act.wob, S.act.rpm);
    const steady = Math.abs(S.act.wob - p.setRefWob) <= p0.setHoldTolerance
                && Math.abs(S.act.flush - p.setRefFlush) <= p0.setHoldTolerance;
    if (steady) p.setHeld += dt;
    const want = Math.floor((S.phaseT / Math.max(1e-3, S.phaseDur)) * p0.setBlows);
    while (p.setSamples.length < Math.min(p0.setBlows, want)) {
      // The pencil trace: temporary compression springs back, permanent set does not.
      p.setSamples.push({
        blow: p.setSamples.length + 1,
        permanentMm: +p.measuredSetMm.toFixed(2),
        temporaryMm: +(p.measuredSetMm * (0.8 + 0.9 * clamp(h.dropM / p0.strokeMaxM))).toFixed(2),
      });
      emitImpact(0.9, true);
      haptic('medium');
    }
    return false;
  }

  function finishTakeSet() {
    const p0 = S.m.pile, p = S.prog;
    p.setTaken = true;
    p.setSteady01 = clamp(p.setHeld / Math.max(0.1, S.phaseDur));
    const inWindow = Math.abs(p.measuredSetMm - p.designSetMm)
                   <= p.designSetMm * p0.setBandFrac;
    p.setInWindow = inWindow;
    // A pile that made its set but never reached the bearing stratum is
    // under-driven, however good the gauge looked — and a pile whose toe is
    // brooming is exactly that pile.
    p.rejected = !p.founded && !p.refused;
    if (p.rejected && p.reDrives < 1) {
      p.reDrives++;
      beginBeat('re-drive', p0.reDriveSec, { kind: 're-drive' });
      return;
    }
    complete();
  }

  function finishReDrive() {
    // Re-pitched alongside and driven again. Expensive, never fatal.
    const p = S.prog;
    p.setTaken = false;
    p.rejected = false;
    p.toeDamage = clamp(p.toeDamage * 0.4);
    p.headDamage = clamp(p.headDamage * 0.4);
    S.phase = 'drilling';
  }

  function finishDollyChange() {
    const p = S.prog;
    p.dollyWear = 0;
    p.dollyChanges++;
    S.wear = 0;
    S.wornFired = false;
    S.breakArmed = 0;
    const h = liveHazard('head-damage');
    if (h) finishHazard(h, true);
    haptic('success', true);
  }

  /* ═════════════════════════════════════════════════════════════════════
     site-investigation — THE LOG

     SPT is DRIVEN: 63.5 kg falling 760 mm, blows per 75 mm, N is the count for
     the last 300 mm. CPT is PUSHED at 20 mm/s and is not drilling at all.
     Neither is slider gameplay in the ordinary sense, and neither is scored on
     depth: the product is the log.
     ═════════════════════════════════════════════════════════════════════ */

  function resolveProbeMode() {
    const lo = loadoutIds();
    const id = lo.probe || lo.bit || null;
    return probeOf(id).mode === 'cpt' ? 'cpt' : 'spt';
  }

  function startProbe() {
    const pr = S.m.probe;
    const lo = loadoutIds();
    const probe = probeOf(lo.probe || lo.bit);
    const hammer = probeOf(lo.workshop || lo.hammer);
    const p = {
      kind: 'probe',
      mode: probe.mode === 'cpt' ? 'cpt' : 'spt',
      probe, hammer: hammer.mode === 'spt-hammer' ? hammer : null,
      er: hammer.mode === 'spt-hammer' ? hammer.er : T.sptHammerDefaultEr,
      nextTestDepth: pr.testEveryM, testIndex: 0, tests: [],
      // SPT drive state
      release: 0.5, releaseCycles: 0, releasePhase: 0, lastReleaseCycle: -1,
      inc: 0, incBlows: 0, incMm: 0, blowsTotal: 0, driveMm: 0, fallIn: 0,
      goodTaps: 0,
      // CPT trace state
      trace: [], nextReadingM: 0, incl: 0, baseline: 0, saturated: true,
      dissipations: 0, terminated: false, coneDamage: 0,
      inTolSec: 0, pushSec: 0,
      quality01: 1, fidelity01: 1,
    };
    return p;
  }

  function stepProbe(dt, dtD, dBore) {
    return S.prog.mode === 'cpt' ? stepCpt(dt, dtD, dBore) : stepSpt(dt, dtD, dBore);
  }

  /* ── SPT: bore to the test depth, then drive ──────────────────────────── */
  function stepSpt(dt, dtD, dBore) {
    void dt; void dtD;
    const p = S.prog;
    if (S.depth + dBore >= p.nextTestDepth && S.phase === 'drilling') {
      // Fall-in: material has dropped into the base of the hole and the seating
      // drive is about to be driven through it rather than through ground.
      if (S.stability < 0.55 && !liveHazard('fall-in') && rand.f() < 0.45) {
        queueHazard('fall-in', { depth: S.depth, severity: clamp(1 - S.stability) });
      }
      beginSptDrive();
      return dBore;
    }
    return dBore;
  }

  function beginSptDrive() {
    const s = S.m.probe.spt, p = S.prog;
    p.inc = 0; p.incBlows = 0; p.incMm = 0; p.blowsTotal = 0; p.driveMm = 0;
    p.goodTaps = 0; p.refusal = null;
    p.incLog = [];
    // The drive runs on its own clock: fast enough that thirteen tests fit in a
    // session, slow enough that the release rhythm is playable.
    beginBeat('spt-drive', 30, { kind: 'spt-drive' });   // ends on the drive, not the clock
  }

  /** Returns true when the drive has finished and the beat has been closed. */
  function stepSptDrive(dt) {
    const s = S.m.probe.spt, p = S.prog;
    const total = s.seatingIncrements + s.testIncrements;

    // The release rhythm. It is the operator's attention, not one tap per blow:
    // a clean release transfers full energy, a bad one transfers less — and the
    // punishment is not a fail state, it is a WORSE NUMBER.
    p.releaseCycles += dt * s.releaseHz;
    p.releasePhase = p.releaseCycles % 1;
    p.release = clamp(p.release - s.releaseDecay * dt);
    const bounce = liveHazard('rod-bounce');
    const er = clamp(lerp(s.erRange[0], s.erRange[1], p.release)
                     * (p.er / T.sptHammerDefaultEr)
                     * (bounce ? 1 - T.hazard.rodBounce.energyCut : 1), 0.15, 1.2);

    // Blows accumulate at the cadence the WORK control is holding.
    const bpm = lerp(s.cadenceBpm[0], s.cadenceBpm[1], clamp(S.act.rpm));
    const blows = (bpm / 60) * dt * s.driveTimeMul;
    const resist = sptResistance(S.m, S.ground) * (1 + p.fallIn * T.hazard.fallIn.nBias);
    const mmPerBlow = 1 / Math.max(1e-4, s.blowsPerMm * resist / Math.max(0.1, er / s.er60));

    p.incBlows += blows;
    p.incMm += blows * mmPerBlow;
    p.blowsTotal += blows;
    p.driveMm += blows * mmPerBlow;

    // Refusal, and it is a legitimate result that gets paid for.
    const per150 = p.inc % 2 === 1 ? p.incBlows + nz(p.prevIncBlows) : p.incBlows;
    if (per150 >= s.refusalPerIncrement || p.blowsTotal >= s.refusalTotal
        || (mmPerBlow * s.refusalNoAdvance < 0.5 && p.incBlows > s.refusalNoAdvance)) {
      p.refusal = { blows: Math.round(p.blowsTotal), penetrationMm: Math.round(p.driveMm) };
      finishSptDrive();
      return true;
    }

    while (p.incMm >= s.incrementMm && p.inc < total) {
      p.incLog.push({
        index: p.inc + 1, mm: s.incrementMm, blows: Math.round(p.incBlows),
        counted: p.inc >= s.seatingIncrements,     // the seating drive is DISCARDED
      });
      p.prevIncBlows = p.incBlows;
      p.incMm -= s.incrementMm;
      p.incBlows = 0;
      p.inc++;
      haptic('light');
    }
    if (p.inc >= total) { finishSptDrive(); return true; }
    return false;
  }

  function finishSptDrive() {
    const pr = S.m.probe, s = pr.spt, p = S.prog;
    const counted = (p.incLog || []).filter((x) => x.counted);
    const N = counted.reduce((a, x) => a + x.blows, 0);
    const cr = sptRodCorrection(S.m, S.depth);
    const ce = p.er / s.er60;
    const cb = 1.0, cs = p.probe.liner ? 1.15 : 1.0;
    const n60 = N * ce * cr * cb * cs;
    const fall = liveHazard('fall-in') ? 1 : clamp(p.fallIn);
    const quality = clamp((1 - T.hazard.fallIn.qualityCut * fall)
                          * (0.55 + 0.45 * p.release));
    const fidelity = clamp((p.refusal ? 1 : counted.length / s.testIncrements)
                           * (0.6 + 0.4 * p.release)
                           * (liveHazard('rod-bounce') ? 1 - T.hazard.rodBounce.fidelityCut : 1));

    p.tests.push({
      index: ++p.testIndex, depthM: +S.depth.toFixed(2),
      increments: p.incLog || [], seatingDiscarded: s.seatingIncrements,
      N: p.refusal ? null : Math.round(N),
      refusal: p.refusal ? `${p.refusal.blows}/${p.refusal.penetrationMm} mm` : null,
      N60: p.refusal ? null : +n60.toFixed(1),
      corrections: { ce: +ce.toFixed(2), cr: +cr.toFixed(2), cb, cs },
      energyRatio: +p.er.toFixed(2),
      sampleQuality01: +quality.toFixed(3),
      // A split-spoon's area ratio is about 110 % against an "undisturbed"
      // threshold of 10 %. EVERY SPT sample is a disturbed sample.
      disturbed: true, areaRatio: nz(p.probe.areaRatio, 1.10),
      logFidelity01: +fidelity.toFixed(3),
      stratum: S.ground.id,
    });
    const n = p.tests.length;
    p.quality01 = p.tests.reduce((a, x) => a + x.sampleQuality01, 0) / n;
    p.fidelity01 = p.tests.reduce((a, x) => a + x.logFidelity01, 0) / n;
    p.fallIn = 0;
    p.nextTestDepth = S.depth + pr.testEveryM;
    S.hazardsSeen++;
    if (quality >= 0.6) S.hazardsClean++;
    S.beat = null;
    S.phase = 'drilling';
    haptic('success', true);

    // A refused test in dense gravel is information the client bought.
    if (p.refusal) emit(EV.STRATUM_ENTER, { stratum: S.ground, depth: S.depth, __sim: true, refusal: true });
  }

  /* ── CPT: the steady push ─────────────────────────────────────────────── */
  function stepCpt(dt, dtD, dBore) {
    void dtD;
    const c = S.m.probe.cpt, p = S.prog;
    if (p.terminated) return 0;

    const rateMmS = clamp(S.act.wob) * c.rateMaxMmS;
    p.pushSec += dt;
    if (Math.abs(rateMmS - c.rateMmS) <= c.rateTolMmS) p.inTolSec += dt;

    // Inclination creeps in coarse ground when the push is being forced.
    const coarse = clamp(nz(S.ground.abrasivity, 0.4) / c.rfDensRef);
    p.incl = clamp(p.incl + c.inclPerRate * coarse
      * Math.max(0, rateMmS - c.rateMmS - c.rateTolMmS) / c.rateTolMmS * dt, 0, 20);
    p.baseline += c.baselineDriftPerM * dBore;

    // Readings land on a fixed depth interval, not on a clock.
    while (S.depth >= p.nextReadingM) {
      const t = cptTrace(S.m, S.ground, p.nextReadingM, nz(S.contract?.waterTableM, c.waterTableM));
      p.trace.push({
        depthM: +p.nextReadingM.toFixed(3),
        qcMpa: +t.qc.toFixed(3),
        // Two different nulls, and the log must not conflate them: a friction
        // cone HAS no u2 channel, while a piezocone whose filter has
        // desaturated has one that has gone flat. Both print blank; only the
        // second is a fault the driller can do something about.
        qtMpa: t.qt == null ? null : +t.qt.toFixed(3),
        fsKpa: +t.fs.toFixed(1), rfPct: +t.rf.toFixed(2),
        u0Kpa: +t.u0.toFixed(1),
        u2Kpa: (t.u2 != null && p.saturated) ? +t.u2.toFixed(1) : null,
        hasU2: !!t.hasU2,
        isbt: p.saturated ? +t.isbt.toFixed(2) : +t.isbt.toFixed(2),
        sbt: sbtName(t.isbt),
        inTolerance: Math.abs(rateMmS - c.rateMmS) <= c.rateTolMmS,
      });
      if (p.trace.length > 2000) p.trace.shift();
      p.nextReadingM += nz(p.probe.resolutionMm, c.readingEveryMm) / 1000;
    }

    // ── the three things that can go wrong with a sounding ──
    const t = cptTrace(S.m, S.ground, S.depth, nz(S.contract?.waterTableM, c.waterTableM));
    const resist = clamp(t.qc / c.qcMax);
    if (resist >= c.thrustCapacity01 && !liveHazard('thrust-limit')) {
      queueHazard('thrust-limit', { depth: S.depth, severity: clamp(resist) });
    }
    if (!liveHazard('precarious') && perMetre(0.10 * clamp(t.qc / 20), dBore)) {
      queueHazard('precarious', { depth: S.depth, severity: clamp(t.qc / c.qcMax) });
    }
    if (p.saturated && S.ground.ucs >= c.desatUcs && !liveHazard('cone-desaturation')
        && perMetre(c.desatChance, dBore)) {
      queueHazard('cone-desaturation', { depth: S.depth, severity: 0.7 });
    }

    p.fidelity01 = clamp((p.pushSec > 0 ? p.inTolSec / p.pushSec : 1)
      * (1 - clamp(p.incl / c.inclLimitDeg) * 0.35)
      * (Math.abs(p.baseline) <= c.baselineTol ? 1 : 0.65));
    p.quality01 = clamp((p.saturated ? 1 : 0.6) * (1 - p.coneDamage * 0.5));
    return dBore;
  }

  function finishDissipation() {
    const p = S.prog;
    p.dissipations++;
    p.saturated = true;
    const h = liveHazard('cone-desaturation');
    if (h) finishHazard(h, true);
    haptic('success', true);
  }

  function finishBlowDown() {
    const p = S.prog;
    p.holdUp *= 1 - T.hazard.carryOver.clearFrac;
    p.blowDowns++;
    p.lastBlowDown = S.timeSec;
    const h = liveHazard('carry-over');
    if (h) finishHazard(h, true);
    haptic('success', true);
  }

  /**
   * Abandon the UNIT the run is on, rather than the run.
   *
   * Only the programmes made of many independent units can do this, and for
   * them it is the honest outcome: a stuck string in one fan hole, or a bolt
   * hole that has squeezed shut around the steel, costs that hole. The rest of
   * the ring, and the rest of the pattern, are still there to be drilled.
   *
   * @returns {boolean} true if a unit was abandoned and the run continues
   */
  function loseCurrentUnit() {
    const p = S.prog;
    if (!p) return false;
    S.bind = 0;
    S.stuckSec = 0;
    S.jamState = 'free';
    S.drag = 0;
    S.phase = 'drilling';
    if (p.kind === 'longhole') {
      // The metres the hole was designed to have are consumed whether or not
      // the rock was drilled, or the ring could never be finished at all.
      S.depth += Math.max(0, p.holeLengthM - S.holeDepth);
      finishLongholeHole(true);
      emit(EV.JAM_CLEARED, { abandoned: 'hole' });
      return true;
    }
    if (p.kind === 'bolt') {
      const b = S.m.bolt;
      p.installs.push({
        index: p.index + 1, ring: p.ring, type: p.type,
        holeMm: +boltHoleMm().toFixed(1), holeDevDeg: +p.holeDevDeg.toFixed(2),
        anchorage01: 0, slotClosureIn: null, plateTight: false,
        quality01: 0, abandoned: true, torqueDue: false, torqueTaken: false, torqueKnm: null,
      });
      p.index++;
      p.quality01 = p.installs.reduce((a, x) => a + x.quality01, 0) / p.installs.length;
      S.depth += p.advancePerBolt;         // the ring position is used up; the roof is not held
      S.holeDepth = 0;
      p.holeDevDeg = 0;
      S.hazardsSeen++;
      emit(EV.JAM_CLEARED, { abandoned: 'bolt' });
      if (S.depth >= S.target || p.index >= p.total) complete();
      void b;
      return true;
    }
    return false;
  }

  /* ═════════════════════════════════════════════════════════════════════
     TWO-PASS METHODS — raise boring and HDD

     One run, two different jobs, and the second one runs backwards. Stage 0 is
     an ordinary bore. Stage 1 pulls a reamer up a raise, or backreams a product
     pipe home along an HDD bore, and on that pass the constraint stops being
     rate of penetration and becomes PULL FORCE. A raise mucks by gravity, so
     there is nothing to circulate; a pullback lives or dies on the mud.
     ═════════════════════════════════════════════════════════════════════ */

  function startTwoStage() {
    const st = S.m.stages && S.m.stages[1];
    return {
      kind: 'twoStage',
      passM: 0,                 // metres of the SECOND pass completed
      pull: 0, stallSec: 0, stalls: 0,
      cutterWear: 0, cutterChanges: 0,
      pilotDeviation: 0, quality01: 1,
      startedPass: false,
      /* Only a stage that declares `jet` carries this, so `p.jet` being null
         is the test for "this reverse pass is a pull problem, not a jetting
         one" everywhere below. */
      jet: st && st.jet ? {
        bar: 0,               // live jet pressure — the ONE figure with a source
        belowFloor: false,    // …and whether it is under EN 12716's 250 bar
        column01: 0,          // the column being built right here, right now
        worst01: 1,           // the NECK. A column is as good as its thinnest section.
        meanSum: 0, shortSum: 0, belowFloorM: 0,
        return01: 0.5,        // spoil at the collar: 0 = none, 1+ = packing off
        lostM: 0, heaveM: 0,  // metres lifted with the return out of control
        lostEvents: 0, heaveEvents: 0,
        mishandled: 0,        // a return event answered wrongly, still costing column
        erodibility: 0,       // the ground's, right now — ordering only, never a size
      } : null,
    };
  }

  /** The pilot has broken through. Turn the run round. */
  function beginSecondPass() {
    const p = S.prog, st = S.m.stages[1];
    p.startedPass = true;
    p.pilotDeviation = S.deviation;
    S.stage = 1;
    S.stageProgress = 0;
    S.depth = S.target;
    S.holeDepth = 0;
    S.greenBandTime = 0;
    /* THE JETS ARE STARTED BEFORE THE STEM IS RAISED.
       The sourced sequence is three steps, not two: drill to depth, START THE
       JETS, then rotate and raise. A stage that says `armOnEnter` opens with
       the pump and the rotation already at the pass's own optimum instead of
       ramping up through the first metres from whatever the pre-drill left on
       the sliders — which on a jetting pass is not a soft start, it is the
       bottom of the column built under the EN 12716 floor and scored as a
       break in it. The two pull-force passes do not declare it and are
       unchanged: on those, carrying the pilot's settings into the pullback is
       the player's problem to notice, and costs a metre rather than the job. */
    if (st.armOnEnter) {
      const inp = optimalNow();
      S.cmd = { ...inp };
      S.act = { ...inp };
    }
    // The reamer head goes on from the lower level, or the product pipe is
    // made up on the reamer. Either way the string is turned round and the
    // gauge the operator is watching changes with it.
    pushStage();
    emit(EV.STRATUM_ENTER, { stratum: S.ground, depth: S.target, __sim: true, stage: 1, stageId: st.id });
    haptic('success', true);
  }

  function stepTwoStage(dt, dtD, dBore) {
    void dtD;
    const p = S.prog;
    const stages = S.m.stages;

    /* ── stage 0: the pilot ── */
    if (S.stage === 0) {
      if (S.depth + dBore >= S.target) {
        const left = Math.max(0, S.target - S.depth);
        beginSecondPass();
        return left;
      }
      return dBore;
    }

    /* ── stage 1: the way back ── */
    const st = stages[1];
    p.passM = Math.min(S.target, p.passM + dBore);
    S.stageProgress = p.passM;
    S.holeDepth = p.passM;

    /* THE SECOND PASS IS REAMING A HOLE THAT ALREADY EXISTS. It is not making
       one, so it does not load the annulus the way a fresh bore does — and on a
       raise, gravity mucks it outright: the cuttings fall away below the head
       and there is nothing to circulate at all. */
    S.load = clamp(S.load - nz(st.loadDrain, 0.22) * dt);
    if (st.flushOff) S.load = clamp(S.load - 0.60 * dt);

    /* ── the pass that is JETTING rather than reaming ────────────────────
       Two of this game's three reverse passes haul a head into rock and are
       played on pull force. The third does not touch the ground at all: it
       lifts a monitor through a hole that already exists while jets take the
       soil apart around it. It has its own model, and it ends here. */
    if (st.jet) return stepJetLift(dt, dBore, st);

    // PULL FORCE. Not a rate: how hard the head is being hauled into the rock
    // it is breaking, plus whatever has not fallen away behind it.
    const hard = hardnessOf(S.ground.ucs);
    p.pull = clamp(st.pullBase
      + st.pullPerHard * hard
      + st.pullPerRate * clamp(S.act.wob)
      + st.pullPerLoad * clamp(S.load)
      + nz(st.pullPerUnstable, 0) * clamp(1 - S.stability)
      /* DULL CUTTERS PULL HARDER. Without this term the cutters wore, hit 1.0
         about a third of the way up a raise, and then did NOTHING for the rest
         of the pass: no rate cost, no pull cost, and no reason ever to spend
         `cutterChangeSec` on a fresh set — the whole cutter-change mechanic
         was a counter with nothing on the other end of it. A worn set makes
         the head heavier to haul into the rock, which is what a raise borer
         actually reads and the reason the crew goes up to change them. */
      + nz(st.pullPerCutter, 0) * clamp(p.cutterWear), 0, T.torque.displayMax);

    /* ONE HEAD, ONE COUNTER.
       `cutterWear` used to be its own accumulator (`cutterPerM x metres x
       hardness`) running alongside `stepWear`, which already charges the head
       per metre reamed with the abrasivity, the heat, the carbide grade and
       the Toolsmith skill in it. Two counters for one object is how the pass
       ended up with two thresholds, two budgets and two ways to pay: a change
       reset one of them and left the other, so the head could be re-cuttered
       eight times and still be too dull to cut, or the score could be charged
       twice for the same set. The cutters ARE the wear part of the head, so
       this is the head's wear, named the way the crew names it. A stage that
       wants the head to wear at its own rate says so with `wearMul`. */
    p.cutterWear = S.wear;

    if (p.pull >= st.stallAt) {
      p.stallSec += dt;
      if (!liveHazard('pull-stall')) {
        queueHazard('pull-stall', { depth: actionDepth(), severity: clamp(p.pull) });
      }
    } else p.stallSec = Math.max(0, p.stallSec - dt * 0.5);

    if (p.passM >= S.target - 1e-6) {
      p.quality01 = clamp(1
        - 0.30 * (p.stalls / Math.max(1, p.stalls + 3))
        - 0.25 * p.cutterWear
        - 0.35 * clamp(p.pilotDeviation / T.straight.maxDev));
      complete();
    }
    return 0;                    // the contract depth does not grow on the way back
  }

  /**
   * THE JET LIFT — jet grouting's second pass, and the whole of the job.
   *
   * The monitor is already at depth. Nothing below it is being drilled: the
   * jets are cutting the soil apart radially while the stem is ROTATED AND
   * RAISED, and what is left behind is a column of soil remixed with grout.
   * The three controls are the ones site.js already prints —
   *
   *   ADVANCE  withdrawal rate   how fast the column is left behind
   *   WORK     jet pressure      how hard the soil is being taken apart
   *   PROTECT  rotation          whether it is a column or a slot
   *
   * — and the score is COLUMN CONTINUITY, weighted on the worst section,
   * because a column with one neck in it is a column that did not work.
   *
   * TWO SOURCED THINGS DECIDE IT. The EN 12716 pressure floor, below which the
   * jet does not erode and the metre is not jet grouting at all; and soil
   * erodibility, cohesionless above cohesive, which is why the same settings
   * make a fat column in sand and a thin one in clay. Everything else here is
   * a normalised tuning constant that never prints beside a unit — no
   * diameter, no withdrawal rate, no rpm. See the method entry in TUNING.
   */
  function stepJetLift(dt, dLift, st) {
    const p = S.prog, j = st.jet, J = p.jet;
    if (!J) return 0;

    const lift01 = clamp(S.act.wob);      // ADVANCE — withdrawal rate
    const work01 = clamp(S.act.rpm);      // WORK    — jet pressure
    const rot01 = clamp(S.act.flush);     // PROTECT — rotation

    /* THE ONE FIGURE ON THIS PASS WITH A SOURCE AT BOTH ENDS. The WORK control
       commands a fraction of the pump, the pump's ceiling is 700 bar [KLEMM],
       and 250 bar is EN 12716's own dividing line. So this is a real pressure
       on a real machine limit, and the floor lands at 0.357 of slider travel —
       close enough to the bottom that a player can find it, far enough up that
       they cannot sit under it by accident. */
    J.bar = j.maxBar * work01;
    J.belowFloor = J.bar < j.floorBar;
    const power01 = J.belowFloor ? 0 : clamp((J.bar - j.floorBar) / (j.maxBar - j.floorBar));

    /* Dwell. The slower the stem comes up, the longer the jet works each
       station and the further out it reaches. This is the shape the sourced
       sequence implies; the constant is game tuning and prints nowhere. */
    const dwell = j.dwellRef / (j.dwellRef + lift01);

    /* Rotation. Too slow and the jet cuts a SLOT rather than sweeping a
       column; too fast and no radius is held long enough to be eroded. Both
       ends are wrong, so it is a bell — and its centre is deliberately not an
       rpm, because no monitor rpm is sourced anywhere in the pack. */
    const spread = Math.max(j.rotFloor, bell(rot01, j.optRot, j.rotSigma));

    /* SOIL ERODIBILITY — the hidden variable, and the only part of the ground
       model here that is sourced. Ordering only: cohesionless erodes more than
       cohesive. It scales the column INDEX, which is a score. No diameter is
       derived from it, in this file or any other. */
    const erod = nz(j.erodibility[S.ground.id], j.erodibility._default);
    J.erodibility = erod;

    /* A worn nozzle throws an incoherent jet, and it cannot be changed without
       tripping the monitor out of a half-built column. This is the mechanic
       behind data.js's own line about one blocked nozzle ruining the panel. */
    const nozzle = clamp(1 - j.colPerWear * clamp(S.wear), 0.15, 1);

    const supply = power01 * dwell * spread;
    let col = j.colGain * supply * erod * nozzle;

    /* ── THE RETURN, WHICH IS THE FAILURE MODE THE SOURCE NAMES ──────────
       Spoil rises up the annulus and is pumped away. Two ways to lose it, and
       the ground decides which one is waiting: a permeable cohesionless bed
       takes the mix away into the formation and nothing comes back; a tight
       cohesive one will not pass what the jet is making and the pressure goes
       into lifting the ground instead. Same erodibility number, opposite
       failure, which is why one gauge can carry both. */
    const water = clamp(nz(S.ground.water, 0.4));
    const escape = clamp(erod * water * power01);
    const pack = clamp((1 - erod) * supply);
    const want = j.retBase + j.retPerSupply * supply
               - j.retPerEscape * escape
               + j.retPerPack * pack;
    J.return01 = clamp(damp(J.return01, clamp(want, 0, 1.25), j.retLambda, dt), 0, 1.25);

    const hz = T.hazard.jetReturn;
    if (J.return01 <= j.lostAt) {
      col *= j.lostColMul;
      J.lostM += dLift;
      if (!liveHazard('return-lost')
          && queueHazard('return-lost', { depth: actionDepth(), severity: 0.8 })) J.lostEvents++;
    } else if (J.return01 >= j.heaveAt) {
      col *= j.heaveColMul;
      J.heaveM += dLift;
      if (!liveHazard('ground-heave')
          && queueHazard('ground-heave', { depth: actionDepth(), severity: clamp(J.return01) })) J.heaveEvents++;
    }
    /* Mishandling either one costs the column where it is standing, so the
       hazard is not a light — it is metres of neck. It also recovers, slowly:
       getting the return back does not un-neck what is already behind you, but
       it does stop making more of it. */
    J.mishandled = clamp(nz(J.mishandled) - hz.recoverPerSec * dt);
    col = Math.max(0, col - J.mishandled * hz.colCut);

    J.column01 = col;

    /* ── CONTINUITY ──────────────────────────────────────────────────────
       Sampled per metre LIFTED, so a monitor parked at the collar accumulates
       nothing and a slow lift is scored on every metre it actually makes. */
    if (dLift > 0) {
      const c01 = clamp(col);
      J.meanSum += c01 * dLift;
      J.shortSum += Math.max(0, 1 - c01) * dLift;
      if (c01 < J.worst01) J.worst01 = c01;
      // Metres lifted under EN 12716's floor are not a column at all. They are
      // counted separately because they are a different failure from a thin
      // one: nothing was jetted there, whatever the gauge said.
      if (J.belowFloor) J.belowFloorM += dLift;
    }

    if (p.passM >= S.target - 1e-6) {
      p.quality01 = jetQuality();
      complete();
    }
    return 0;                    // the contract depth does not grow on the way up
  }

  /**
   * COLUMN CONTINUITY, which is what jet grouting is scored on.
   *
   * The KPI in the source is "column diameter achieved at the design UCS, with
   * the return managed", and the failure is a break in it. So the mean column
   * is only part of the mark and the WORST SECTION carries nearly as much:
   * a treatment block is only as good as the thinnest place in it, and a
   * player who jets a beautiful 55 m and necks the last 3 has not made a
   * column, they have made two.
   */
  function jetQuality() {
    const p = S.prog, J = p && p.jet;
    if (!J) return 1;
    const m = Math.max(1e-3, p.passM);
    const mean = clamp(J.meanSum / m);
    const shortFrac = clamp(J.shortSum / m);
    return clamp(
      0.40 * mean
      + 0.34 * clamp(J.worst01)          // the neck
      + 0.26 * (1 - shortFrac)
      // Under the floor there is no jet, so these metres are not thin column —
      // they are no column, and they are charged as such.
      - 0.80 * clamp(J.belowFloorM / m)
      - 0.30 * clamp(J.lostM / m)
      // Heave loses the JOB, not the metre: jet grouting is sold under things
      // that are still standing, and lifting them is the one outcome no client
      // forgives. data.js puts this method on urban plots for that reason.
      - 0.45 * clamp(J.heaveM / m));
  }

  /* ═════════════════════════════════════════════════════════════════════
     THE METHOD'S OWN SCORE AXIS
     ═════════════════════════════════════════════════════════════════════ */
  function methodQuality() {
    const p = S.prog;
    if (!p) return null;
    switch (p.kind) {
      case 'rc': {
        const s = S.m.sample;
        const n = Math.max(1, p.index);
        const contamFrac = p.contamBags / n;
        const lossFrac = p.lossBags / n;
        const assayable = p.bags.filter((b) => b.assayable).length / Math.max(1, p.bags.length);
        /* CONTAMINATION OUTWEIGHS RECOVERY. A light bag is a hole in the data
           and everyone can see it; a bag carrying the metre above it reads
           normal on the scales and reports a grade that was never there. The
           second is worth more money and does more damage, and the weighting
           has to say so — otherwise skipping the blow-down, which saves time
           AND hides the loss by making the bags weigh right, out-scores doing
           the job properly. */
        // Squared, because a bag that is a third foreign material is not two
        // thirds of a sample — it is a grade that was never in that metre.
        const clean = (1 - clamp(p.contam01)) ** 2;
        const score = clamp(0.38 * p.recovery01 + 0.47 * clean
                          + 0.15 * assayable - 0.6 * contamFrac - 0.5 * lossFrac);
        return { score, label: 'SAMPLE',
          detail: { bags: p.index, recovery01: +p.recovery01.toFixed(3),
                    contamination01: +p.contam01.toFixed(3),
                    assayable01: +assayable.toFixed(3),
                    highConfidence: p.highBags, contaminated: p.contamBags,
                    lost: p.lossBags, wet: p.wetBags, blowDowns: p.blowDowns,
                    trainWear01: +p.trainWear.toFixed(3), cutoff: s.gradeCutoff } };
      }
      case 'jumbo':
        return { score: clamp(p.quality01), label: 'ROUND',
          detail: { rounds: p.rounds.length, advanceM: +p.advanceM.toFixed(2),
                    drilledM: +p.drilledM.toFixed(1), pull01: +p.pull01.toFixed(3),
                    overbreak: +p.overbreak.toFixed(3), halfBarrel01: +p.halfBarrel.toFixed(3),
                    chokedRounds: p.chokedRounds, underbreakRounds: p.underbreakRounds,
                    log: p.rounds.slice(-6) } };
      case 'longhole': {
        const n = Math.max(1, p.toes.length);
        const score = clamp(p.quality01 - 0.35 * (p.dilutionHoles / n)
                          - 0.25 * (p.oreLossHoles / n) - 0.15 * (p.convergedPairs / n));
        return { score, label: 'RING',
          detail: { holes: p.toes.length, ofTotal: p.holesTotal,
                    meanDevPct: +(p.toes.reduce((a, x) => a + x.devPct, 0) / n).toFixed(2),
                    specPct: S.m.ring.devSpecPct,
                    dilutionHoles: p.dilutionHoles, oreLossHoles: p.oreLossHoles,
                    convergedPairs: p.convergedPairs, blockedHoles: p.blockedHoles,
                    redrills: p.redrills, log: p.toes.slice(-8) } };
      }
      case 'bolt': {
        const b = S.m.bolt;
        const missed = Math.max(0, p.testsDue - p.testsTaken);
        const gaps = Math.max(0, p.total - p.index);
        const score = clamp(p.quality01
          - b.auditPenalty * (missed / Math.max(1, p.testsDue))
          - b.gapPenalty * (gaps / Math.max(1, p.total))
          - 0.2 * (p.testsFailed / Math.max(1, p.testsTaken || 1)));
        return { score, label: 'INSTALL',
          detail: { bolts: p.index, ofTotal: p.total, type: p.type,
                    meanAnchorage01: +p.quality01.toFixed(3),
                    torqueTestsDue: p.testsDue, taken: p.testsTaken,
                    missed, failed: p.testsFailed,
                    slotClosureIn: p.slotClosureIn,
                    patternGaps: gaps, log: p.installs.slice(-8) } };
      }
      case 'pile': {
        const p0 = S.m.pile;
        const setOk = p.setInWindow ? 1 : 0.45;
        const founded = p.founded ? 1 : (p.refused ? 0.8 : 0.3);
        const damage = clamp(1 - p.headDamage * 0.8 - p.toeDamage * 1.2);
        const rake = clamp(1 - p.rake / p0.rakeMaxDeg);
        const stress = p.stressPeak <= p0.stressLimit
          + (p.monitored ? (p.steel ? p0.stressSteelAdd : p0.stressMonitoredAdd) : 0) ? 1 : 0.5;
        const score = clamp(0.28 * setOk + 0.30 * founded + 0.22 * damage
                          + 0.10 * rake + 0.10 * stress - 0.15 * p.reDrives);
        return { score, label: 'PILE',
          detail: {
            blows: Math.round(p.blows),
            headDepthM: +p.headDepthM.toFixed(2),
            toeDepthM: +p.toeDepthM.toFixed(2),
            bearingTopM: p.bearingTopM == null ? null : +p.bearingTopM.toFixed(2),
            bearingPenM: +p.bearingPenM.toFixed(2), founded: p.founded,
            measuredSetMm: +p.measuredSetMm.toFixed(2),
            trueSetMm: +p.trueSetMm.toFixed(2),
            broomingMm: +p.broomMm.toFixed(2),
            designSetMm: +p.designSetMm.toFixed(2), setInWindow: !!p.setInWindow,
            refused: p.refused, hardRefused: p.hardRefused,
            headDamage01: +p.headDamage.toFixed(3), toeDamage01: +p.toeDamage.toFixed(3),
            rakeDeg: +p.rake.toFixed(2), peakStress01: +p.stressPeak.toFixed(3),
            monitored: p.monitored, steel: p.steel,
            dollyChanges: p.dollyChanges, reDrives: p.reDrives,
            log: p.log.slice(-10),
          } };
      }
      case 'twoStage': {
        /* THE AXIS NAME IS WHAT IS BEING SCORED, and on a jetting lift that is
           not a pass, it is the COLUMN. 'PILOT'/'REAM' stay exactly as they
           were for the two pull-force passes — `results.js` prints this string
           and it is a short caption, so it is not the place to widen.
           (The stage's own NAME is published separately, on both
           `state.drill.stageName` and telemetry, and that is what a stage strip
           should read. `ui/screens/site.js:220` still hardcodes 'Pilot'/'Ream'
           there — reported, not owned here.) */
        const label = S.stage === 0 ? 'PILOT' : 'REAM';
        const J = p.jet;
        const js = S.m.stages[1] && S.m.stages[1].jet;
        if (J && js) {
          const mm = Math.max(1e-3, p.passM);
          return { score: clamp(p.quality01), label: S.stage === 0 ? 'PRE-DRILL' : 'COLUMN',
            detail: {
              stage: S.stage, passM: +p.passM.toFixed(2),
              /* CONTINUITY, and the neck that decides it. Both are indices,
                 both are dimensionless, and neither is ever a diameter —
                 column diameter by soil is UNVERIFIED (research/05 §A12) and
                 `columnDiaKnown` below is what any caption must gate on. */
              columnMean01: +clamp(J.meanSum / mm).toFixed(3),
              columnWorst01: +clamp(J.worst01).toFixed(3),
              continuity01: +clamp(1 - J.shortSum / mm).toFixed(3),
              // The one figure here with a source at both ends.
              jetPressureBar: Math.round(J.bar),
              pressureFloorBar: js.floorBar,
              metresBelowFloor: +J.belowFloorM.toFixed(2),
              // The sourced KPI: was the return managed?
              returnLostM: +J.lostM.toFixed(2), heaveM: +J.heaveM.toFixed(2),
              returnEvents: J.lostEvents + J.heaveEvents,
              nozzleWear01: +clamp(S.wear).toFixed(3),
              // ── never print what is not sourced ──
              columnDiaKnown: false,
              withdrawRateKnown: false,
              rotationSpeedKnown: false,
              needs: 'column diameter by soil, withdrawal rate and monitor rpm are UNVERIFIED (research/05 §A12)',
            } };
        }
        return { score: clamp(p.quality01), label,
          detail: { stage: S.stage, passM: +p.passM.toFixed(2),
                    stalls: p.stalls, cutterWear01: +p.cutterWear.toFixed(3),
                    cutterChanges: p.cutterChanges,
                    pilotDeviation: +p.pilotDeviation.toFixed(2) } };
      }
      case 'probe': {
        const score = clamp(0.5 * p.quality01 + 0.5 * p.fidelity01);
        return { score, label: p.mode === 'cpt' ? 'SOUNDING' : 'LOG',
          detail: p.mode === 'cpt'
            ? { mode: 'cpt', readings: p.trace.length, inTolerance01: +p.fidelity01.toFixed(3),
                inclinationDeg: +p.incl.toFixed(2), baselineDrift: +p.baseline.toFixed(4),
                saturated: p.saturated, dissipations: p.dissipations,
                terminated: p.terminated, coneDamage01: +p.coneDamage.toFixed(3),
                trace: p.trace.slice(-8) }
            : { mode: 'spt', tests: p.tests.length,
                sampleQuality01: +p.quality01.toFixed(3),
                logFidelity01: +p.fidelity01.toFixed(3),
                energyRatio: +p.er.toFixed(2),
                refusals: p.tests.filter((t) => t.refusal).length,
                log: p.tests.slice(-6) } };
      }
      default: return null;
    }
  }

  /* ═════════════════════════════════════════════════════════════════════
     FIXED STEP — 120 Hz. dt here is always exactly H player-seconds.
     Downhole physics uses dtD = dt × timeCompression.
     ═════════════════════════════════════════════════════════════════════ */
  function step(dt) {
    const m = S.m;
    const dtD = dt * T.sim.timeCompression * (m.timeMul || 1);
    S.timeSec += dt;

    /* ── 1. inputs: instant to start, ~250 ms to settle ── */
    const lam = T.sim.inputLambda;
    S.act.wob = damp(S.act.wob, S.cmd.wob, lam, dt);
    S.act.rpm = damp(S.act.rpm, S.cmd.rpm, lam, dt);
    S.act.flush = damp(S.act.flush, S.cmd.flush, lam, dt);

    /* ── 2. phases that are not making hole ── */
    // A stuck string outranks everything: you cannot trip or case your way out of it.
    if (S.jamState === 'stuck' || S.phase === 'stuck') { stepStuck(dt, dtD); return; }
    if (S.phase !== 'drilling') { stepNonDrilling(dt, dtD); return; }

    /* ── 3. ground under the bit ──
       At the ACTION POINT, which on the way back up a raise is not the bottom
       of the hole: the reamer is cutting the rock it is passing through. */
    const prevId = S.groundId;
    S.ground = sampleGround(actionDepth());
    S.stratumIndex = S.ground.index;
    if (S.ground.id !== prevId) {
      S.groundId = S.ground.id;
      S.bandJumpT = T.groove.stratumJumpFlashSec;
      if (!S.externalGeology.stratum) emit(EV.STRATUM_ENTER, { stratum: S.ground, depth: S.depth, __sim: true });
      haptic('light');
      // A void the geology reports as ground rather than as an event.
      if (S.ground.ucs <= T.rock.voidUcs && !S.externalGeology.cavity) {
        queueHazard('cavity', { depth: S.depth, height: 1.0 });
      }
    }

    // An open void under the bit: nothing to cut, and no returns.
    const cav = S.hazards.find((h) => h.kind === 'cavity' && h.phase === 'active');
    if (cav) {
      S.ground = { ...S.ground, id: 'karst', name: GROUND.karst.name, ucs: 0,
                   abrasivity: 0, stability: 0, water: 1 };
    }

    /* ── 4. circulation returns ──
       A method that circulates nothing cannot lose returns. A driven pile has
       no annulus and a cone push has no fluid, so reporting "no returns" at
       them is not conservative — it is a false instrument reading, and this
       sim's whole argument is that the instruments have to be honest. */
    const rst = activeStage();
    if (m.dryMethod) {
      S.lostCirc = 0;
      S.returns = 1;
    } else if (rst && rst.ownsReturns && S.prog && S.prog.jet) {
      /* ── A PASS THAT MEASURES ITS OWN RETURN OWNS IT ─────────────────
         The generic model below asks two questions of the BED — is it wet,
         is it loose — and calls the returns lost if both are true. That is
         the right instrument for a water bore and the wrong one for a jetting
         lift, where the whole pass is a return model already: what comes back
         over the collar is computed from the pump, the withdrawal rate, the
         soil's erodibility and the annulus, and it is the gauge the player is
         holding.

         Running both meant the same physical fact was charged twice through
         two systems, and the crude one won. MEASURED: a lift with a perfectly
         managed return (0.50, mid-band) crossing a clean sand bed had
         `S.returns` cut to 0.05 by the bed alone, which collapsed the bind
         relief term to 0.12 and stuck the string — in a hole with 400 l/min
         going through it and spoil coming over the collar.

         So on this pass the annulus is as open as the return says it is, and
         no more. Lose the return and the hole does start to bind, which is
         correct and is the mechanic biting twice for the right reason. */
      const ideal = Math.max(0.05, nz(rst.jet && rst.jet.retIdeal, 0.5));
      S.lostCirc = clamp(1 - S.prog.jet.return01 / ideal);
      S.returns = clamp(S.prog.jet.return01 / ideal, T.cuttings.lostReturns, 1);
    } else {
      const lc = T.hazard.lostCirc;
      const losing = (S.ground.water >= lc.waterMin && S.ground.stability <= lc.stabMax)
                  || S.ground.ucs <= T.rock.voidUcs;
      S.lostCirc = damp(S.lostCirc, losing ? 1 : 0, losing ? 3 : 1 / lc.exitSec, dt);
      const cased = S.casedDepth >= S.depth - 0.25;
      S.returns = clamp(lerp(1, T.cuttings.lostReturns, S.lostCirc * (cased ? 0.3 : 1))
                        - S.waterInflow * T.hazard.water.returnsCut * (m.energyFromFlush ? 1 : 0.5), 0.05, 1);
    }

    /* ── 4b. mud weight, pore pressure and the well-control loop ── */
    stepWellControl(dt);

    /* ── 4c. ground resistance, for the methods that are pushed not drilled ── */
    if (m.probe && m.probe.cpt) {
      const t = cptTrace(m, S.ground, S.depth, nz(S.contract?.waterTableM, m.probe.cpt.waterTableM));
      S.groundResist = clamp(t.qc / m.probe.cpt.qcMax);
    }

    /* ── 5. torque (evaluated before ROP so the stall droop is causal) ── */
    S.torque = torqueModel(m, S.bit, S.ground, S.act, env());

    /* ── 6. ROP ── */
    const r = ropModel(m, S.bit, S.ground, S.act, env());
    S.rop = r.rop;
    S.ropPotential = r.potential;
    S.ropTerms = r.terms;

    /* ── 7. hazard ROP overrides ── */
    let ropEff = S.rop;
    for (const h of S.hazards) {
      if (h.phase === 'active' && h.kind === 'boulder') ropEff *= T.hazard.boulder.ropMul;
      // The sample train is choked: the chips are not getting to the cyclone,
      // so there is no point making more of them.
      else if (h.phase === 'active' && h.kind === 'cyclone-choke') ropEff *= 0.30;
      // A blocked downhole is a hole that is not being deepened.
      else if (h.phase === 'active' && h.kind === 'hole-blocked') ropEff *= 0.22;
    }

    /* ── 8. penetration ──
       Two different quantities, and keeping them apart is what lets one loop
       serve a water bore and a tunnel face. `dBore` is the hole the bit made.
       `dDepth` is what the CONTRACT got for it — the same metre on a borehole,
       and on a jumbo 670 m of hole buying 4.1 m of tunnel, after the blast. */
    const dBore = Math.max(0, ropEff / 3600) * dtD;
    if (dBore > 0) {
      S.holeDepth += dBore;
      S.drillSec += dt;
      S.downholeSec += dtD;
      if (S.syntheticGeology || !S.externalGeology.boulder) rollHazards(dBore);
      if (cav) cav.fallen = nz(cav.fallen) + dBore;
    }
    const dDepth = stepProgramme(dt, dtD, dBore);
    if (dDepth > 0) S.depth += dDepth;
    if (!S.prog) S.holeDepth = S.depth;
    S.stringDepth = stringDepthNow();
    if (!S.active) return;                  // a programme may have completed the run
    if (S.phase !== 'drilling') { updateBand(dt); updateGroove(dt); return; }
    if (S.casingOn && S.m.casingFollows) setCasedDepth(S.depth);

    /* ── 9. cuttings load & hole cleaning ──
       A DRY method has no annulus, no returns and nothing to clean: a driven
       pile makes no hole at all and a CPT displaces the soil rather than
       cutting it. Running the cuttings model on either is not conservative,
       it is wrong, so it does not run. */
    const cu = T.cuttings;
    const hard = hardnessOf(S.ground.ucs);
    let rub = 0;
    if (!m.dryMethod) {
      // Hole cleaning does get harder with depth, but the scale is the method's:
      // a 60 m water bore and a 2,000 m well do not share an annulus.
      const annulus = 1 / (1 + S.stringDepth / (m.annulusRef || cu.annulusRef));
      const lift = m.flushIsSpoil ? cu.augerLift * S.act.rpm : 0;
      // circulationNow(), not act.flush: see the note on that function.
      const clearRate = cu.clear * (m.flushK || 1) * (circulationNow() + lift) * S.returns * annulus;
      const gen = cu.gen * (ropEff / cu.ropRef) * (1 - cu.packing * S.load);
      S.load = clamp(S.load + (gen - clearRate * S.load - cu.bleed) * dt);

      /* ── 10. heat ──
         A STAGE MAY BE A DIFFERENT THERMAL MACHINE FROM THE ONE THAT DRILLED
         THE PILOT, and one of them is: `cool` is `ambient + flush`, so a pass
         that declares `flushOff` — a raise, where gravity mucks and there is
         nothing to circulate — cools at 0.066/s against a generation of about
         0.105/s and the bit pegs at 1.00 within thirty seconds, every run, for
         the whole pass. That logged an overheat safety event every 1.2 s: 844
         of them on a 40 m raise, which is not a mechanic, it is a stuck horn.
         And it is not what a raise is: the gauges on the way up are torque and
         pull, the muck falls clear of a 1.8 m head turning at a few rpm, and
         the head is not the heat-limited object a bit in a dry 100 mm hole is.
         The stage says so with its own `heatMul`. */
      const ht = T.heat;
      const stg = activeStage();
      const stageHeatMul = stg && stg.heatMul != null ? stg.heatMul : 1;
      rub = S.ropPotential > 0.01 && ropEff < S.ropPotential * T.wear.rubRopFrac ? 1 : 0;
      const heatGen = ht.gen * (m.heatMul || 1) * stageHeatMul * S.act.rpm
                    * (ht.wobFloor + (1 - ht.wobFloor) * S.act.wob) * hard * (1 + 0.5 * rub);
      const cool = ht.cool * (ht.ambient + circulationNow() * S.returns);
      S.heat = clamp(S.heat + (heatGen - cool * S.heat) * dt);
    }

    /* ── 11. wear. On a piling hammer the consumable is the dolly and it is
       consumed by BLOWS, not by metres — stepWear knows the difference. ── */
    stepWear(dt, dtD, dBore, rub);

    /* ── 12. hole stability & erosion ── */
    if (!m.dryMethod) stepStability(dt);

    /* ── 13. bind / jam pressure ── */
    if (!m.noJam) stepBind(dt);

    /* ── 14. hazards, groove, band ── */
    stepHazards(dt);
    S.gauge = gaugeNow();
    updateBand(dt);
    updateGroove(dt);

    /* ── 15. straightness ──
       The methods that are SCORED on accuracy keep their own per-hole toe
       error in the programme, where it can be compared against a real spec.
       This global integrator stays as the run-wide straightness term. */
    const opt = optimalNow();
    const st = T.straight;
    // A pass that travels back along a hole that already exists cannot bend it.
    const devMul = onReversePass() ? 0 : nz(st.methodMul[S.methodId], 1);
    if (devMul > 0) {
      S.deviation += st.devK * Math.abs(S.act.wob - opt.wob) * (1 + st.hardMul * hard)
                   * devMul * dt * (m.timeMul || 1);
    }

    /* ── 16. safety log ── */
    /* On the way back the string is in TENSION: the limit that matters is the
       pull against the head's stall, not a rotary torque nothing is applying.
       And on a jetting lift there is no tension either — the string is being
       raised through its own hole. What is unsafe there is the ground going up
       with it, so the limit is the RETURN packing off, which is the same
       number the gauge is showing. */
    const revSt = onReversePass() ? activeStage() : null;
    const overLimit = revSt
      ? (revSt.jet
          ? nz(S.prog && S.prog.jet && S.prog.jet.return01) >= nz(revSt.jet.heaveAt, 1)
          : nz(S.prog && S.prog.pull) > nz(revSt.stallAt, 1))
      : (!m.noOverTorque && S.torque > T.torque.safetyLimit);
    if (overLimit) {
      S.overSec += dt;
      S.rodFatigue += T.rods.fatiguePerOverTorque * dt;
      if (S.overSec > T.torque.safetyHoldSec) { S.overSec = 0; S.safetyEvents++; haptic('fail'); }
    } else S.overSec = Math.max(0, S.overSec - dt * 0.5);

    if (S.heat > T.heat.overheatAt) {
      S.hotSec += dt;
      if (S.hotSec > T.heat.overheatHoldSec) { S.hotSec = 0; S.safetyEvents++; haptic('fail'); }
    } else S.hotSec = Math.max(0, S.hotSec - dt * 0.5);

    S.rodFatigue = clamp(S.rodFatigue - T.rods.fatigueDecay * dt * (S.torque < 0.8 ? 1 : 0));

    /* ── 17. tool failure rolls ── */
    stepBitFailure(dt, dtD);
    stepRodFailure(dt);

    /* ── 18. rod add & completion ──
       Rods are counted against the STRING, not against the contract: a longhole
       ring is 240 m of ring metres made of eleven 22 m strings. A method whose
       connections are too frequent to be a beat (159 of them in a ring) counts
       them and lengthens the string without interrupting the player — the rod
       handling lives in the compressed clock, which is what it is for. */
    if (S.stringDepth >= S.nextRodDepth && S.phase === 'drilling') {
      if (m.rodAddBeat === false) {
        const rodLen = m.rodLength || T.rods.lengthDefault;
        S.rods++;
        S.rodsAdded++;
        S.nextRodDepth = (Math.floor(S.stringDepth / rodLen) + 1) * rodLen;
      } else beginRodAdd();
    }
    // A method whose unit of completion is not a depth says so; its programme
    // calls complete() when the work is actually finished.
    if (!m.completeOnProgramme && S.depth >= S.target) complete();

    /* ── 19. percussion beats ── */
    stepBeats(dt);
  }

  /* ═════════════════════════════════════════════════════════════════════
     MUD, PORE PRESSURE AND WELL CONTROL

     Only methods with `wellControl: true` run any of this. The single number
     that matters is the OVERBALANCE: how much more pressure the mud column is
     putting on the formation than the formation is putting back, expressed in
     sg because that is the unit the mud is mixed to.

         overbalance = mud weight × column height + ECD − pore pressure

     Too little and the formation flows into the well. Too much and a weak
     formation breaks down and the well flows into the formation. Both of those
     move the column height, which moves the overbalance, which is why the two
     hazards cause one another.
     ═════════════════════════════════════════════════════════════════════ */

  /** Formation pore pressure at a depth, as an sg equivalent. */
  function porePressureSg(depth) {
    const mud = T.mud;
    let sg = mud.poreNormalSg;
    const z = S.poreZone;
    if (z && depth >= z.top && depth <= z.bottom) {
      // Pressure ramps in over the top of the zone rather than stepping, so the
      // gauges have something to say before the margin is gone.
      const ramp = clamp((depth - z.top) / Math.max(1, Math.min(25, (z.bottom - z.top) * 0.4)));
      sg += z.sg * ramp;
    }
    return sg;
  }

  /** Is a live kick on the well right now? */
  function activeKick() {
    for (const h of S.hazards) if (h.kind === 'kick' && h.phase !== 'done') return h;
    return null;
  }

  function stepWellControl(dt) {
    if (!S.m.wellControl) return;
    const mud = T.mud;
    const hz = T.hazard;

    // Equivalent circulating density: the annulus adds pressure while the pumps
    // are running, and takes it away the moment they stop.
    S.ecd = (mud.ecdBase + mud.ecdPerFlush * S.act.flush) * clamp(S.returns, 0, 1);
    S.poreSg = porePressureSg(S.depth);
    S.overbalance = S.mudWeight * S.mudLevel + S.ecd - S.poreSg;

    if (S.phase !== 'drilling' || S.shutIn) return;

    // ── kick: the formation has beaten the column ──
    if (S.overbalance < mud.kickMargin || S.mudLevel < mud.levelKickAt) {
      queueHazard('kick', {
        depth: S.depth,
        severity: clamp(0.35 + Math.max(0, mud.kickMargin - S.overbalance) * 1.8
                             + Math.max(0, mud.levelKickAt - S.mudLevel)),
      });
    }

    // ── losses: a thief zone, or a column heavy enough to break weak ground ──
    const tz = S.thiefZone;
    const inThief = !!(tz && S.depth >= tz.top && S.depth <= tz.bottom);
    const induced = S.overbalance > mud.fracMarginSg && S.ground.stability < 0.5;
    if (inThief || induced) {
      queueHazard('lost-zone', {
        depth: S.depth, induced: !inThief && induced,
        severity: inThief ? 0.78 : 0.52,
      });
    }

    // ── differential sticking: overbalance, a permeable bed, a still string ──
    if (S.m.diffStick && S.overbalance > 0.30
        && S.ground.water >= mud.stickPermeable
        && S.act.rpm < hz.diffStick.rpmMin * 0.8) {
      S.stickClock += dt * (1 + mud.stickPerSg * S.overbalance);
      if (S.stickClock > 2.4) {
        S.stickClock = 0;
        queueHazard('diff-stick', { depth: S.depth, severity: clamp(S.overbalance / 0.9) });
      }
    } else {
      S.stickClock = Math.max(0, S.stickClock - dt);
    }

    // The column comes back once nothing is being lost.
    let losing = false;
    for (const h of S.hazards) if (h.kind === 'lost-zone' && h.phase === 'active' && !h.cured) losing = true;
    if (!losing) S.mudLevel = clamp(S.mudLevel + mud.levelRecover * dt, 0, 1);
  }

  /**
   * Shut in and kill the well. `late` means the crew did it rather than the
   * driller: same outcome for the well, a logged well-control event and a much
   * longer kill for the driller. The well is never lost — this method has no
   * unwinnable state, only expensive ones.
   */
  function beginWellControl(late) {
    const k = T.hazard.kick;
    S.shutIn = true;
    S.phase = 'well-control';
    S.phaseT = 0;
    S.phaseDur = lerp(k.killSec[0], k.killSec[1], clamp(S.influx)) * (late ? k.lateKillMul : 1);
    S.greenBandTime = 0;
    S.kills++;
    if (late) S.kicksLate++; else S.kicksHandled++;
    haptic(late ? 'fail' : 'success', true);
  }

  /* ── wear ──────────────────────────────────────────────────────────── */
  function stepWear(dt, dtD, dDepth, rub) {
    if (debug.godMode) return;
    const w = T.wear, m = S.m;

    // A piling hammer has no bit. Its consumable is the DOLLY, and a dolly is
    // consumed by blows at a drop height, not by metres of hole — so the wear
    // gauge, the BIT_WORN event and the tool-change loop all read the dolly's
    // resilience instead. Everything downstream of this is unchanged.
    if (m.toolIsDolly) {
      if (S.prog && S.prog.kind === 'pile') S.wear = clamp(S.prog.dollyWear);
      S.wearBook = S.wear;
      if (!S.wornFired && S.wear >= w.wornAt) {
        S.wornFired = true;
        emit(EV.BIT_WORN, { wear: S.wear, itemId: S.bit.id });
        haptic('medium', true);
      }
      return;
    }
    // A cone that is being pushed is not cutting anything either. It can be
    // damaged, and that is tracked on the sounding, but it does not wear out.
    if (m.kind === 'push') { S.wearBook = S.wear; return; }
    const abr = Math.pow(clamp(S.ground.abrasivity), w.abrasivityExp);
    const carbide = Math.max(0.3, nz(S.bit.carbide, 1) * skillBonus('bitLife'));
    const hard = hardnessOf(S.ground.ucs);

    // A reverse pass may be turning a different tool from the one that drilled
    // the pilot — a reamer head, not a pilot bit — and it wears at its own rate.
    const wStage = activeStage();
    const wearMul = wStage && wStage.wearMul != null ? wStage.wearMul : (m.wearMul || 1);
    let mul = wearMul * abr * (1 + w.heatMul * S.heat) * hard / carbide;
    if (m.kind === 'percussive') mul *= w.percussionMul;
    if (m.indexMatch) {
      const matched = clamp(nz(m.indexBase, 0.25) + nz(m.indexPerAir, 0.55) * S.act.flush);
      mul *= 1 + w.indexMul * (1 - bell(S.act.rpm, matched, m.indexSigma));
    }
    // Diamonds and mud motors burn without flow.
    if (m.flushCritical && S.act.flush * S.returns < m.flushCritical) {
      const short = 1 - (S.act.flush * S.returns) / m.flushCritical;
      mul *= 1 + (m.flushBurnWear - 1) * short;
      S.heat = clamp(S.heat + (m.flushBurnHeat - 1) * 0.08 * short * dt);
    }
    S.wear = clamp(S.wear + w.perMetre * dDepth * mul
                          + w.rubPerSec * rub * dt * mul * S.act.rpm);

    // THE BOOK. On a blind-wear method the gauges show what the driller can
    // work out, not what is true: metres drilled against the abrasivity the
    // drill log promised, times a bias sampled when the bit went in the hole.
    // It is usually close. It is never right, and you find out on the floor.
    if (S.m.blindWear) {
      // Same model as the truth, run on the numbers the contract's ground
      // investigation gave you rather than on the rock actually under the bit:
      // mean abrasivity, mean hardness, a textbook running temperature. It
      // tracks the truth's shape and misses its detail, which is exactly what a
      // driller's running estimate does.
      const nominalAbr = clamp(nz(S.contract && S.contract.abrasivity, 0.5));
      const nominalHard = clamp(0.25 + 1.6 * clamp(nz(S.contract && S.contract.hardness, 0.4)), 0.2, 1.8);
      const bookMul = (m.wearMul || 1) * Math.pow(nominalAbr, w.abrasivityExp)
                    * (1 + w.heatMul * T.score.par.heat) * nominalHard / carbide;
      S.wearBook = clamp(S.wearBook + w.perMetre * dDepth * bookMul * S.wearBias);
    } else {
      S.wearBook = S.wear;
    }

    // Bearings. Load and speed kill them, heat helps; the teeth can be fine.
    // A PDC (`bearings: 0`) has none, which is the whole argument for one.
    const bearingLife = nz(S.bit.bearings, S.m.bearings ? 1 : 0);
    if (bearingLife > 0 && !debug.godMode) {
      const load = 0.35 + 0.65 * S.act.wob;
      const speed = 0.35 + 0.65 * S.act.rpm;
      S.bearing = clamp(S.bearing
        + w.bearingPerMetre * dDepth * load * speed * (1 + w.heatMul * S.heat) / bearingLife);
    }

    if (!S.wornFired && S.wear >= w.wornAt) {
      S.wornFired = true;
      emit(EV.BIT_WORN, { wear: S.wear, itemId: S.bit.id });
      haptic('medium', true);
    }
  }

  /* ── stability, erosion, drag, casing ──────────────────────────────── */
  function stepStability(dt) {
    const sb = T.stability, m = S.m;
    // Erosion is relative to what this ground actually needs: flushing to clean
    // the hole is free, flushing well past that washes soft ground out. So the
    // sweet spot is always reachable without destroying the hole.
    const need = optimalInputs(m, S.ground, S.depth, S.bit).flush;
    const overFlush = S.act.flush - (need + sb.erodeMargin);
    const erodible = 1 - S.ground.stability;
    if (overFlush > 0 && erodible > 0.05 && !cased()) {
      S.erosion += sb.erodeK * (m.erodeK || 1) * overFlush * erodible
                 * (1 + S.ground.water) * (S.waterInflow > 0.1 ? T.hazard.water.erodeMul : 1) * dt;
    } else {
      S.erosion = Math.max(0, S.erosion - sb.erodeRecover * dt);
    }
    S.erosion = clamp(S.erosion, 0, sb.erodeMax);

    const target = cased() ? sb.casedStability
      : clamp(S.ground.stability - S.erosion - S.waterInflow * sb.waterHit);
    S.stability = clamp(damp(S.stability, target, sb.lambda, dt));

    if (S.stability < sb.dragThresh && !cased()) {
      S.drag = Math.min(sb.dragMax, S.drag + (sb.dragThresh - S.stability) * sb.dragK * dt);
      if (S.stability < sb.collapseAt) queueHazard('collapse', { depth: S.depth, severity: 0.8 });
    } else {
      S.drag = Math.max(0, S.drag - sb.dragDecay * dt);
    }
  }

  const cased = () => S.casedDepth >= S.depth - 0.25;

  function setCasedDepth(d) {
    const nd = Math.max(S.casedDepth, d);
    if (nd === S.casedDepth) return;
    S.casedDepth = nd;
    S.drag *= T.stability.casingDragCut;
    S.erosion *= 0.25;
    try { ctx.geology?.setCasingDepth?.(S.casedDepth); } catch { /* optional */ }
  }

  /** The "work the string" rhythm. One tap per cycle counts. */
  function advanceRescue(dt) {
    S.rescueCycles += dt * T.jam.rescueHz;
    S.rescuePhase = S.rescueCycles % 1;
  }

  /* ── bind / jam ────────────────────────────────────────────────────── */
  function stepBind(dt) {
    const j = T.jam;
    // Stuck time bleeds off while the string is genuinely free, so a driller who
    // keeps getting stuck in the same spot still runs out of hole eventually.
    //
    // `jamLoseSec` is a budget for the WHOLE run, which is right for a 40 m
    // bore that lasts three minutes and wrong for a well that lasts ten. On a
    // long run the budget is spent by ordinary, correctly-handled episodes and
    // the hole is lost for no mistake the player made — which is exactly the
    // unwinnable state this sim must never create. A method may therefore
    // forgive stuck time faster: at `jamForgive` 1.0 a second of clean drilling
    // buys back a second of stuck clock, so only a string you genuinely cannot
    // free costs you the hole, and that is still a real and reachable loss.
    if (S.jamState === 'free' && S.bind < j.bindEnter) {
      S.stuckSec = Math.max(0, S.stuckSec - dt * nz(S.m.jamForgive, j.stuckForgive));
    }
    let pressure = 0;
    /* On the way back the string is in TENSION, not torsion: what binds a
       reamer head or a product pipe is the pull, and reading the rotary torque
       for it would double-count something that is not happening. */
    if (onReversePass()) {
      const st = activeStage();
      pressure += j.torqueK * Math.max(0, nz(S.prog && S.prog.pull) - nz(st.stallAt, 1) * 0.9);
    } else {
      pressure += j.torqueK * Math.max(0, S.torque - j.torqueThresh);
    }
    pressure += j.loadK * Math.max(0, S.load - j.loadThresh);
    pressure += j.dragK * S.drag;
    pressure += j.stabK * Math.max(0, j.stabThresh - S.stability);

    // What is circulating, not what the third slider happens to be labelled —
    // on a jetting lift that slider is rotation and the pump is the WORK axis.
    const relief = j.reliefFloor
                 + j.relief * circulationNow() * S.returns
                 + j.reliefLowWob * Math.max(0, 0.35 - S.act.wob) / 0.35;

    S.bind = clamp(S.bind + (pressure - relief * (S.bind > 0 ? 1 : 0)) * dt, 0, j.bindMax);
    advanceRescue(dt);

    const was = S.jamState;
    // hysteresis: once stuck you stay stuck until the string is properly free
    S.jamState = S.jamState === 'stuck'
      ? (S.bind <= j.stuckExit ? 'free' : 'stuck')
      : (S.bind >= j.stuckEnter ? 'stuck' : S.bind >= j.bindEnter ? 'binding' : 'free');
    if (S.jamState !== was) {
      if (S.jamState === 'binding' && was === 'free') {
        emit(EV.JAM, { severity: S.bind / j.bindMax });
        haptic('heavy', true);
      } else if (S.jamState === 'stuck') {
        S.jamIncidents++;
        S.phase = 'stuck';
        emit(EV.JAM, { severity: 1 });
        haptic('heavy', true);
      } else if (S.jamState === 'free' && was !== 'free') {
        emit(EV.JAM_CLEARED, {});
        haptic('success', true);
        if (S.phase === 'stuck') S.phase = 'drilling';
      }
    }
  }

  /** Stuck: no hole is made. Work the string with jamRescue, or kick it. */
  function stepStuck(dt, dtD) {
    void dtD;
    S.rop = 0;
    S.stuckSec += dt;
    advanceRescue(dt);
    S.torque = torqueModel(S.m, S.bit, S.ground, S.act, env());
    S.heat = clamp(S.heat - T.heat.cool * 0.5 * circulationNow() * dt);
    // Backing the feed off and keeping flow up always relieves something —
    // and what "flow" is depends on the pass, not on the slider's caption.
    const relief = T.jam.stuckReliefFloor
                 + T.jam.stuckReliefFlush * circulationNow() * S.returns
                 + T.jam.stuckReliefLowWob * Math.max(0, 0.35 - S.act.wob) / 0.35;
    S.bind = clamp(S.bind - relief * dt, 0, T.jam.bindMax);
    S.drag = Math.max(0, S.drag - T.stability.dragDecay * dt);
    S.erosion = Math.max(0, S.erosion - T.stability.erodeRecover * dt);
    S.stability = clamp(damp(S.stability, cased() ? 1 : S.ground.stability, T.stability.lambda * 0.5, dt));
    if (S.bind <= T.jam.stuckExit) {
      S.jamState = 'free';
      S.phase = 'drilling';
      emit(EV.JAM_CLEARED, {});
      haptic('success', true);
      if (ctx.state?.player?.stats) ctx.state.player.stats.jamsCleared++;
    } else if (S.stuckSec > nz(S.m.jamLoseSec, T.jam.loseSec) && !debug.godMode) {
      // A run made of MANY UNITS does not end because one of them jammed. On a
      // fan, a string stuck in hole seven costs hole seven: it is cut and left,
      // the ring is one hole short, and the ore behind it stands. That is a
      // real and expensive outcome. Losing the whole ring for it is not, and
      // neither is losing a bolting pattern to one squeezed hole.
      if (loseCurrentUnit()) return;
      abortHole('stuck');
    }
    updateBand(dt);
    updateGroove(dt);
    stepHazards(dt);
  }

  /* ── tool failure ──────────────────────────────────────────────────── */
  function stepBitFailure(dt, dtD) {
    const w = T.wear;
    // A bearing that is about to seize gets the same telegraph the teeth get —
    // it is the ONLY warning, because nothing on the wear gauge ever showed it.
    if (!debug.godMode && S.bearing >= w.bearingCriticalAt) {
      S.breakArmed += dt;
      if (S.breakArmed >= w.breakTelegraphSec) {
        const over = (S.bearing - w.bearingCriticalAt) / (1 - w.bearingCriticalAt);
        if (rand.f() < w.bearingFailPerSec * over * dt) { breakBit('bearing'); return; }
      }
      return;
    }
    if (debug.godMode || S.wear < w.criticalAt) { S.breakArmed = 0; return; }
    S.breakArmed += dt;
    if (S.breakArmed < w.breakTelegraphSec) return;      // you always get a warning first
    const over = (S.wear - w.criticalAt) / (1 - w.criticalAt);
    const stress = clamp(S.torque) * clamp(hardnessOf(S.ground.ucs) / 1.5);
    const p = w.breakChancePerSec * over * stress * dt;
    if (rand.f() < p) breakBit();
  }

  function breakBit(cause = 'cutting-structure') {
    S.wear = 1;
    if (cause === 'bearing') S.bearing = 1;
    emit(EV.BIT_BROKEN, { itemId: S.bit.id, depth: S.depth, cause });
    haptic('fail', true);
    // The trip that follows counts the bit — counting it here as well charged
    // every break twice and made the bit score unreachable.
    // Never a dead end: fish it out and run the field spare.
    beginTrip('_spare', true);
  }

  function stepRodFailure(dt) {
    const rd = T.rods;
    // NO STRING, NO ROD TO BREAK. A spudder runs a wire rope and a chisel, and
    // a driven pile runs nothing at all — neither has a joint to part.
    if (S.m.hasDrillString === false || S.m.noJam) { S.rodBreakArmed = 0; return; }
    const eligible = S.rodFatigue >= rd.breakFatigue && S.depth >= S.target * rd.breakDepthFrac;
    if (!eligible || debug.godMode) { S.rodBreakArmed = 0; return; }
    S.rodBreakArmed += dt;
    if (S.rodBreakArmed < rd.breakTelegraphSec) return;
    if (S.m.twistOff) {
      // On a long rotary string a fatigued joint TWISTS OFF: it does not end
      // the well, it costs a fishing trip. The hazard carries its own telegraph
      // and its own correct response (weight AND rotation off), so the outcome
      // is decided there rather than by a hidden roll here.
      if (rand.f() < rd.breakChancePerSec * S.rodFatigue * dt * 2.5) {
        S.rodBreakArmed = 0;
        queueHazard('twist-off', { depth: S.depth, severity: clamp(S.rodFatigue) });
      }
      return;
    }
    // Backing off during the telegraph is always enough to survive it.
    const abusing = S.act.wob > optimalNow().wob + rd.abuseMargin || S.torque > 0.85;
    if (!abusing) return;
    if (rand.f() < rd.breakChancePerSec * S.rodFatigue * dt) {
      haptic('fail', true);
      abortHole('rod-break');
    }
  }

  /* ── percussion beats → BIT_IMPACT / haptics ───────────────────────── */
  function stepBeats(dt) {
    const m = S.m;
    let hz;
    if (m.kind === 'impact') {
      // A piling hammer's beat is the BLOW, and at this method's compression
      // the stream lands just under the emission cap — so what the player hears
      // is one impact per blow, which is the blow count being logged.
      hz = (hammerEnvelope(m, S.act.rpm).bpm / 60) * T.sim.timeCompression * (m.timeMul || 1);
    } else if (m.kind === 'push') {
      hz = 0;                                  // a cone push is silent. Deliberately.
    } else if (m.kind === 'percussive') {
      hz = lerp(m.blowHz[0], m.blowHz[1], m.rateFromFlush ? S.act.flush : S.act.rpm);
    } else {
      hz = lerp(T.sim.rotaryImpactHz[0], T.sim.rotaryImpactHz[1], S.act.rpm);
    }
    if (S.rop <= 0.01) hz *= 0.35;
    S.blowHz = hz;
    S.blowPhase += dt * hz;
    while (S.blowPhase >= 1) { S.blowPhase -= 1; S.blowsPending++; }
  }

  /* ═════════════════════════════════════════════════════════════════════
     NON-DRILLING PHASES — rod adds, trips, casing runs.
     These run on player time only: no hole is made, but the world keeps
     breathing (heat bleeds off, cuttings settle, an unstable hole keeps
     squeezing, so you cannot park here to dodge a problem).
     ═════════════════════════════════════════════════════════════════════ */
  function stepNonDrilling(dt, dtD) {
    void dtD;
    const m = S.m;
    S.phaseT += dt;
    S.rop = 0;
    S.torque = torqueModel(m, S.bit, S.ground, { wob: 0, rpm: 0, flush: S.act.flush }, env());
    if (!m.dryMethod) {
      S.heat = clamp(S.heat - T.heat.cool * (T.heat.ambient + S.act.flush) * 0.8 * S.heat * dt);
      S.load = clamp(S.load - (T.cuttings.clear * 0.4 * S.act.flush * S.returns + T.cuttings.bleed) * dt);
      stepStability(dt);
    }
    if (!m.noJam) stepBind(dt);
    stepHazards(dt);
    S.gauge = gaugeNow();
    updateBand(dt);
    updateGroove(dt);

    if (BEAT_PHASES.has(S.phase)) { stepBeat(dt); return; }
    if (S.phase === 'rod-add') stepRodAdd(dt);
    else if (S.phase === 'tripping-out' || S.phase === 'bit-swap' || S.phase === 'tripping-in') stepTrip(dt);
    else if (S.phase === 'well-control') {
      // Shut in, influx circulated out through the choke, mud weighted up. The
      // well comes back heavier than it went in — safer against the next kick,
      // and that much more likely to stick the string against a permeable bed.
      S.influx = Math.max(0, S.influx - dt / Math.max(1, S.phaseDur));
      if (S.phaseT >= S.phaseDur) {
        // A kill sheet is not a guess. Shut-in drill-pipe pressure gives you the
        // formation pressure, and the kill mud is mixed to balance it with a
        // trip margin on top — so one kill settles the zone that caused it.
        S.mudWeight = Math.min(T.mud.weightCap,
          Math.max(S.mudWeight + T.mud.killWeightAdd, S.poreSg + T.mud.killTripMargin));
        S.mudLevel = 1;
        S.influx = 0;
        S.shutIn = false;
        S.returns = 1;
        S.phase = 'drilling';
        haptic('success', true);
      }
    }
    else if (S.phase === 'casing-run') {
      if (S.phaseT >= S.phaseDur) {
        setCasedDepth(S.depth);
        S.casingOn = S.casingArmed;
        S.phase = 'drilling';
        haptic('success', true);
      }
    }
  }

  /* ── rod add (or core-run retrieval): nail the stab for a bonus ────── */
  function beginRodAdd() {
    const rodLen = S.m.rodLength || 0;
    if (rodLen <= 0) { S.nextRodDepth = Infinity; return; }
    /* A METHOD WITH NO DRILL STRING CANNOT ADD A ROD.
       Cable percussion is a spudder — a winch, a wire rope, a chisel and a
       bailer — and firing a rod add on it animates an event that cannot
       physically happen. What its cadence really is, is the BAILING RUN: pull
       the tool, run the bailer, lift the cuttings and the slurry out. The gate
       is on the CAPABILITY, not on the method id, so it holds for anything
       stringless that is added later.
       Consumers get their own event, EVENTS.BAILER_RUN — nothing that
       animates a rod stab has to remember to gate on a payload flag. */
    if (S.m.hasDrillString === false) { beginBailingRun(rodLen); return; }
    // `rodAddSecMul` lets a method say how long its own connection takes: an
    // iron roughneck making up a stand is not a driller threading a rod by hand.
    const fast = skillBonus('rodSpeed') / Math.max(0.05, nz(S.m.rodAddSecMul, 1));
    S.phase = 'rod-add';
    S.phaseT = 0;
    S.rodAdd = {
      kind: S.m.rodAddKind || (S.m.kind === 'core' ? 'core-run' : 'rod'),
      fast,
      dur: T.rods.addSec / fast,
      windowStart: T.rods.windowDelay / fast,
      windowEnd: (T.rods.windowDelay + T.rods.windowSec) / fast,
      hit: false, missed: false, resolved: false,
    };
    S.phaseDur = S.rodAdd.dur;
    haptic('light', true);
  }

  /**
   * The bailing run — the cable-tool cadence, and not a rod add.
   *
   * The chisel comes off the rope, the bailer goes down, and what comes back
   * is the cuttings and the slurry that the tool has been pounding into a
   * paste. Nail the landing and the run is quick; miss it and the bailer has
   * to be re-run. There is no string in this hole at any point.
   */
  function beginBailingRun(rodLen) {
    const fast = skillBonus('rodSpeed') / Math.max(0.05, nz(S.m.rodAddSecMul, 1));
    beginBeat('bailing-run', T.rods.addSec / fast, {
      kind: 'bail',
      windowDelay: T.rods.windowDelay / fast,
      windowSec: T.rods.windowSec / fast,
      data: { rodLen, label: 'BAILING RUN' },
    });
  }

  function finishBailingRun(b) {
    const rodLen = (b.data && b.data.rodLen) || S.m.rodLength || T.rods.lengthDefault;
    S.bailingRuns++;
    S.rods++;                         // the same counter, and telemetry names it correctly
    S.rodsAdded++;
    if (b.hit) S.perfectRods++;
    S.nextRodDepth = (Math.floor(S.stringDepth / rodLen) + 1) * rodLen;
    S.greenBandTime *= b.hit ? T.rods.perfectComboKeep : T.rods.missComboKeep;
    // A bailer that has just lifted the hole clean is the ONLY thing that
    // cleans a cable-tool hole: the method does not circulate.
    S.load = Math.max(0, S.load - (b.hit ? 0.55 : 0.35));
    emit(EV.BAILER_RUN, {
      count: S.bailingRuns, perfect: !!b.hit, kind: 'bail', rod: false,
      label: 'BAILING RUN', depth: S.depth,
    });
  }

  function stepRodAdd(dt) {
    void dt;
    const ra = S.rodAdd;
    if (!ra) { S.phase = 'drilling'; return; }
    if (!ra.hit && !ra.missed && S.phaseT > ra.windowEnd) ra.missed = true;
    const done = ra.hit ? S.phaseT >= T.rods.addSecPerfect / (ra.fast || skillBonus('rodSpeed'))
                        : S.phaseT >= ra.dur;
    if (!done) return;

    S.rods++;
    S.rodsAdded++;
    if (ra.hit) S.perfectRods++;
    const rodLen = S.m.rodLength || T.rods.lengthDefault;
    S.nextRodDepth = (Math.floor(S.depth / rodLen) + 1) * rodLen;
    S.greenBandTime *= ra.hit ? T.rods.perfectComboKeep : T.rods.missComboKeep;
    emit(EV.ROD_ADDED, { count: S.rods, perfect: !!ra.hit, kind: ra.kind, depth: S.depth });
    S.rodAdd = null;
    S.phase = 'drilling';
  }

  /* ── trips ─────────────────────────────────────────────────────────── */
  /**
   * A round trip, one way. Scales with depth and with the number of stands the
   * crew has to rack, which is the whole economics of a deep well: at 1,800 m a
   * bit change is sixty-odd stands out and sixty-odd back, and that number is
   * what you weigh against a bit you cannot see.
   */
  function tripSeconds(mul = 1) {
    /* ON A REVERSE PASS THERE IS NO TRIP.
     *
     * A raise borer's cutters are changed FROM BELOW — the crew stands in the
     * lower drive and works on the head where it hangs; nothing comes out of
     * the hole. An HDD reamer is at the far end of a pullback and cannot be
     * tripped at all. Charging either of them a full rod-by-rod string trip is
     * what made the second passes crawl: a 40 m raise reamed 17.8 m in 820 s
     * and a 120 m pullback reached 57.6 m in 680 s, nearly all of it spent
     * pulling a string that never moves.
     *
     * The stage already carries the real number in `cutterChangeSec`, and it
     * is still a genuine cost — a cutter change on a raise borer is a shift,
     * not a menu click. It just is not a trip.
     */
    const st = activeStage();
    if (st && st.reverse && st.cutterChangeSec != null) {
      return Math.max(1, st.cutterChangeSec * mul / skillBonus('tripSpeed'));
    }
    const rodLen = S.m.rodLength || T.rods.lengthDefault;
    const rods = Math.max(1, Math.ceil(S.depth / Math.max(0.5, rodLen)));
    const per = nz(S.m.tripSecPerRod, T.trip.secPerRod);
    return Math.max(T.trip.minSec, rods * per * mul / skillBonus('tripSpeed'));
  }

  function beginTrip(itemId, emergency = false, fishing = false) {
    S.pendingBit = itemId;
    S.emergencyTrip = emergency;
    S.fishing = !!fishing;
    S.phase = 'tripping-out';
    S.phaseT = 0;
    S.phaseDur = tripSeconds(fishing ? T.hazard.twistOff.fishTripMul : 1);
    S.greenBandTime = 0;
    haptic('light', true);
  }

  function stepTrip(dt) {
    void dt;
    if (S.phaseT < S.phaseDur) return;
    if (S.phase === 'tripping-out') {
      S.phase = 'bit-swap';
      S.phaseT = 0;
      S.phaseDur = S.fishing
        ? T.hazard.twistOff.fishSwapSec / skillBonus('tripSpeed')
        : (S.emergencyTrip ? T.trip.emergencySwapSec : T.trip.swapSec) / skillBonus('tripSpeed');
    } else if (S.phase === 'bit-swap') {
      const prev = S.bit.id;
      /* ON A REVERSE PASS NOTHING IS SWAPPED — THE CUTTERS ARE CHANGED.
         The crew goes up to the head where it hangs and re-cutters it: same
         head, same body, a new set of rolling cones. `tripSeconds()` already
         charges `cutterChangeSec` instead of a string trip; this is the other
         half of it. Running the ordinary bit path here would have done two
         wrong things at once — counted a bit the job never bought against
         `bitBudget`, and handed the player a free reset of the head's own wear
         for thirteen seconds, which is a loophole, not a decision. */
      const rst = activeStage();
      const reCutter = !S.fishing && rst && rst.reverse && rst.cutterChangeSec != null
                    && S.prog && S.prog.kind === 'twoStage';
      if (reCutter) {
        S.prog.cutterChanges++;
        S.prog.cutterWear = 0;
        /* THE CUTTERS ARE THE WEAR PART OF THE HEAD, so a re-cuttered head
           cuts like a new one — and leaving `S.wear` where it was made the
           reverse pass a trap with no way out of it: the head dulls, the rate
           collapses under `rop.wearPenalty`, and the only tool the player has
           does not touch it because the string cannot be tripped. A set of
           cutters is still a consumable the job buys, so it is counted as one
           (`bitBudget` on the method prices how many a job should eat). */
        S.wear = 0;
        S.bitStartWear = 0;
        S.bearing = 0;
        S.wornFired = false;
        S.breakArmed = 0;
        S.bitsUsed++;
        newWearBook();
      } else if (S.fishing) {
        // The fish came back on the overshot. The bit is the same bit — and now
        // the driller has seen it, so the book estimate is the truth again.
        S.wearBook = S.wear;
        S.wearBias = 1;
        S.rodFatigue = 0.18;
      } else {
        S.bit = bitOf(S.pendingBit, S.m);
        const cond = ctx.state?.garage?.condition?.[S.pendingBit];
        S.wear = S.pendingBit === '_spare' ? 0.25
               : (typeof cond === 'number' ? clamp(1 - cond) : 0);
        S.bitStartWear = S.wear;
        S.bearing = 0;
        S.wornFired = false;
        S.breakArmed = 0;
        S.bitsUsed++;
        newWearBook();
      }
      S.heat = clamp(S.heat * 0.4);
      void prev;
      S.phase = 'tripping-in';
      S.phaseT = 0;
      S.phaseDur = tripSeconds();
    } else {
      S.phase = 'drilling';
      S.phaseT = 0;
      S.fishing = false;
      haptic('success', true);
      if (S.tripResolve) { S.tripResolve({ ok: true, itemId: S.bit.id, wear: S.wear }); S.tripResolve = null; }
    }
  }

  /* ═════════════════════════════════════════════════════════════════════
     PLAYER ACTIONS
     ═════════════════════════════════════════════════════════════════════ */
  function setInput(name, value01) {
    const v = clamp(nz(value01, 0.5));
    if (name === 'feed' || name === 'wob') S.cmd.wob = v;
    else if (name === 'rotation' || name === 'rpm' || name === 'percussion') S.cmd.rpm = v;
    else if (name === 'flush' || name === 'flushing') S.cmd.flush = v;
  }

  function pulse(name) {
    if (!S.active) return { ok: false, reason: 'idle' };

    if (name === 'jamRescue') {
      if (S.jamState === 'free') return { ok: false, reason: 'not-bound' };
      // The rescue rhythm: tap on the beat, not between them.
      // One tap per cycle counts — mashing is not a strategy.
      const cycle = Math.floor(S.rescueCycles);
      if (S.lastRescueCycle === cycle) return { ok: false, reason: 'too-soon' };
      S.lastRescueCycle = cycle;
      const w = T.jam.rescueWindow * 0.5;
      const good = S.rescuePhase < w || S.rescuePhase > 1 - w;
      const gain = T.jam.rescueGain * skillBonus('jamRescue');
      if (good) {
        S.bind = Math.max(0, S.bind - gain);
        S.rodFatigue = clamp(S.rodFatigue + T.jam.rescueGoodFatigue);
        haptic('light', true);
      } else {
        S.bind = Math.min(T.jam.bindMax, S.bind + T.jam.rescueMiss);
        S.rodFatigue = clamp(S.rodFatigue + T.jam.rescueFatigue);
        haptic('fail', true);
      }
      return { ok: true, kind: 'jamRescue', good, bind: S.bind, phase01: S.rescuePhase };
    }

    if (name === 'rodStab') {
      const ra = S.rodAdd;
      if (S.phase !== 'rod-add' || !ra || ra.hit || ra.missed) return { ok: false, reason: 'no-window' };
      const inWindow = S.phaseT >= ra.windowStart && S.phaseT <= ra.windowEnd;
      if (inWindow) {
        ra.hit = true;
        haptic('success', true);
      } else {
        ra.missed = true;
        haptic('fail', true);
      }
      return { ok: true, kind: 'rodStab', good: inWindow, t: S.phaseT };
    }

    if (name === 'shutIn') {
      // The well-control action. It is not a slider, because shutting in is not
      // a matter of degree: you space out, close the preventer and read the
      // pressures. Answering a kick with the feed lever does nothing at all.
      if (!S.m.wellControl) return { ok: false, reason: 'method-has-no-bop' };
      if (S.shutIn || S.phase === 'well-control') return { ok: false, reason: 'already-shut-in' };
      const h = activeKick();
      if (!h) {
        // A flow check on a well that is not flowing. Honest, cheap, and it
        // costs a few seconds of the run — exactly as it should.
        S.phase = 'well-control';
        S.phaseT = 0;
        S.phaseDur = 2.2;
        S.shutIn = true;
        haptic('light', true);
        return { ok: true, kind: 'shutIn', flowing: false };
      }
      finishHazard(h, true);
      beginWellControl(false);
      return { ok: true, kind: 'shutIn', flowing: true, killSec: S.phaseDur };
    }

    if (name === 'lcmPill') {
      // Mix a lost-circulation pill and spot it across the thief zone. Only
      // possible with the material actually on board.
      if (!S.hasLcm) return { ok: false, reason: 'no-lcm-aboard' };
      if (S.lcmUsed) return { ok: false, reason: 'pill-already-spotted' };
      let target = null;
      for (const h of S.hazards) if (h.kind === 'lost-zone' && h.phase === 'active') target = h;
      if (!target) return { ok: false, reason: 'no-losses' };
      target.pill = true;
      S.lcmUsed = true;
      haptic('medium', true);
      return { ok: true, kind: 'lcmPill' };
    }

    /* ── the generic timed beat: the boom, the cradle, the pile in the leaders ── */
    if (name === 'stab' || name === 'ringIndex' || name === 'pitch') {
      const b = S.beat;
      if (!b || !b.hasWindow || b.hit || b.missed) return { ok: false, reason: 'no-window' };
      const inWindow = S.phaseT >= b.windowStart && S.phaseT <= b.windowEnd;
      if (inWindow) { b.hit = true; haptic('success', true); }
      else { b.missed = true; haptic('fail', true); }
      return { ok: true, kind: b.kind, good: inWindow, t: S.phaseT };
    }

    /* ── rc: the blow-back / blow-down cycle ───────────────────────────
       Clears the string between samples so metre 41 does not carry metre 40's
       rock into the bag. It is a discrete machine action, not a slider, and it
       is the only thing that answers carry-over. */
    if (name === 'blowDown') {
      const co = T.hazard.carryOver;
      if (!S.prog || S.prog.kind !== 'rc') return { ok: false, reason: 'method-has-no-sample-train' };
      if (S.timeSec - S.prog.lastBlowDown < co.blowDownCooldown) {
        return { ok: false, reason: 'cooldown' };
      }
      if (S.phase !== 'drilling') return { ok: false, reason: `busy:${S.phase}` };
      beginBeat('blow-down', co.blowDownSec, { kind: 'blow-down' });
      return { ok: true, kind: 'blowDown', holdUp: S.prog.holdUp };
    }

    /* ── tunnel-jumbo: accept the shorter round ────────────────────────
       Bad ground shortens the round. Taking it early costs you the metres you
       were never going to get; refusing it costs you the round. */
    if (name === 'shortRound') {
      const rd = S.prog && S.prog.round;
      if (!rd) return { ok: false, reason: 'method-has-no-round' };
      if (rd.shortened) return { ok: false, reason: 'already-shortened' };
      const r = S.m.round;
      rd.shortened = true;
      rd.length = r.lengthPoor;
      rd.totalM = rd.totalHoles * rd.length;
      const h = liveHazard('bad-ground');
      if (h) finishHazard(h, true);
      haptic('medium', true);
      return { ok: true, kind: 'shortRound', roundLengthM: rd.length };
    }

    /* ── longhole / rockbolt: pull back and re-drill ───────────────────
       The escape that is always available, on both of the methods where a
       hole can be lost. It costs time and it never costs the run. */
    if (name === 'redrill') {
      if (!S.prog || (S.prog.kind !== 'longhole' && S.prog.kind !== 'bolt')) {
        return { ok: false, reason: 'nothing-to-redrill' };
      }
      if (S.phase !== 'drilling') return { ok: false, reason: `busy:${S.phase}` };
      const sec = S.prog.kind === 'longhole'
        ? T.hazard.holeBlocked.redrillSec : T.hazard.boltHoleCollapse.redrillSec;
      beginBeat('redrill', sec, { kind: 'redrill' });
      return { ok: true, kind: 'redrill', sec };
    }

    /* ── rockbolt: shine a light down the tube and read the slot ───────
       Closed by about 1/16 in means full rock-to-metal contact. A slot the
       same width as it went in means the hole was too big and the bolt is
       holding nothing at all — and the only way to know is to look. */
    if (name === 'inspectSlot') {
      const p = S.prog;
      if (!p || p.kind !== 'bolt') return { ok: false, reason: 'method-has-no-bolts' };
      if (p.type !== 'friction') return { ok: false, reason: 'not-a-friction-bolt' };
      const last = p.installs[p.installs.length - 1];
      if (!last) return { ok: false, reason: 'no-bolt-installed' };
      last.inspected = true;
      beginBeat('bolt-inspect', S.m.bolt.inspectSec, { kind: 'bolt-inspect' });
      return {
        ok: true, kind: 'inspectSlot',
        slotClosureIn: last.slotClosureIn,
        closedFully: last.slotClosureIn >= S.m.bolt.slotClosedIn * 0.85,
        anchorage01: last.anchorage01,
      };
    }

    /* ── rockbolt: the scheduled torque sample ─────────────────────────
       Torque testing itself is required practice — 29 CFR 1926.800(o)(3)(iv)(A),
       "torque wrenches shall be used wherever bolts that depend on torsionally
       applied force are used for ground support" — and it sets no numeric rate.
       The first / every tenth / last SCHEDULE is the game's own, the crew's
       sample, and the end-of-shift audit checks it because the game says so and
       not because a statute does. See `bolt.torqueTestEvery`. */
    if (name === 'torqueTest') {
      const p = S.prog;
      if (!p || p.kind !== 'bolt') return { ok: false, reason: 'method-has-no-bolts' };
      if (S.phase !== 'drilling') return { ok: false, reason: `busy:${S.phase}` };
      const h = liveHazard('loose-plate');
      if (h) finishHazard(h, true);          // tensioning pulls the plate up to the rock
      beginBeat('bolt-torque', S.m.bolt.torqueTestSec, { kind: 'bolt-torque' });
      return { ok: true, kind: 'torqueTest', due: p.torqueWindowT > 0 };
    }

    /* ── rockbolt: re-ream a hole that has closed ──────────────────── */
    if (name === 'reamHole') {
      const p = S.prog;
      if (!p || p.kind !== 'bolt') return { ok: false, reason: 'method-has-no-bolts' };
      if (S.phase !== 'drilling') return { ok: false, reason: `busy:${S.phase}` };
      beginBeat('bolt-ream', T.hazard.boltHoleCollapse.reamSec, { kind: 'bolt-ream' });
      const h = liveHazard('bolt-hole-collapse');
      if (h) finishHazard(h, true);
      return { ok: true, kind: 'reamHole' };
    }

    /* ── driven-pile: change the dolly and the packing ─────────────────
       The dolly is what decides how much of the hammer reaches the toe, and it
       degrades over the drive. This is the consumable made physical. */
    if (name === 'changeDolly') {
      const p = S.prog;
      if (!p || p.kind !== 'pile') return { ok: false, reason: 'method-has-no-dolly' };
      if (S.phase !== 'drilling') return { ok: false, reason: `busy:${S.phase}` };
      beginBeat('dolly-change', T.hazard.headDamage.changeSec, { kind: 'dolly-change' });
      return { ok: true, kind: 'changeDolly', dollyWear: p.dollyWear };
    }

    /* ── driven-pile: TAKE THE SET ─────────────────────────────────────
       Ten blows, held steady, with the trace separating temporary compression
       from permanent set. It runs on REAL player seconds at the real blow rate,
       because counting ten blows is the entire point of it. */
    if (name === 'takeSet') {
      const p = S.prog;
      if (!p || p.kind !== 'pile') return { ok: false, reason: 'method-has-no-set' };
      if (p.setTaken) return { ok: false, reason: 'set-already-taken' };
      if (S.phase !== 'drilling') return { ok: false, reason: `busy:${S.phase}` };
      const h = liveHazard('premature-refusal');
      if (h) finishHazard(h, true);          // reading the toe level IS the correct answer
      beginTakeSet();
      return { ok: true, kind: 'takeSet', blows: S.m.pile.setBlows,
               founded: p.founded, bearingPenM: +p.bearingPenM.toFixed(2) };
    }

    /* ── SPT: the release ──────────────────────────────────────────────
       Not one tap per blow — nobody taps twenty-five times a test. This is the
       operator's attention, sampled: release cleanly on the beat and the blow
       transfers full energy, miss it and the same 75 mm costs more blows. The
       punishment is a worse number, never a fail state. */
    if (name === 'strike') {
      const p = S.prog;
      if (!p || p.kind !== 'probe' || p.mode !== 'spt') return { ok: false, reason: 'not-an-spt' };
      if (S.phase !== 'spt-drive') return { ok: false, reason: 'no-drive-running' };
      const s = S.m.probe.spt;
      const cycle = Math.floor(p.releaseCycles);
      if (p.lastReleaseCycle === cycle) return { ok: false, reason: 'too-soon' };
      p.lastReleaseCycle = cycle;
      const w = s.releaseWindow * 0.5;
      const good = p.releasePhase < w || p.releasePhase > 1 - w;
      if (good) { p.release = clamp(p.release + s.releaseGain); p.goodTaps++; haptic('light', true); }
      else { p.release = clamp(p.release - s.releaseGain * 0.5); p.goodTaps = 0; haptic('fail', true); }
      return { ok: true, kind: 'strike', good, release: p.release, phase01: p.releasePhase };
    }

    /* ── SPT: clean the base of the hole before the seating drive ───── */
    if (name === 'cleanOut') {
      const p = S.prog;
      if (!p || p.kind !== 'probe') return { ok: false, reason: 'not-a-borehole-test' };
      if (S.phase !== 'drilling') return { ok: false, reason: `busy:${S.phase}` };
      beginBeat('clean-out', T.hazard.fallIn.cleanSec, { kind: 'clean-out' });
      const h = liveHazard('fall-in');
      if (h) finishHazard(h, true);
      return { ok: true, kind: 'cleanOut' };
    }

    /* ── CPT: a dissipation test ───────────────────────────────────────
       Stop, hold, and watch the excess pore pressure decay toward equilibrium.
       Seconds in sand and many hours in a plastic clay — a real bargain of
       time against data, and the only way to re-establish the u2 channel. */
    if (name === 'dissipation') {
      const p = S.prog;
      if (!p || p.kind !== 'probe' || p.mode !== 'cpt') return { ok: false, reason: 'not-a-cpt' };
      if (S.phase !== 'drilling') return { ok: false, reason: `busy:${S.phase}` };
      beginBeat('dissipation', S.m.probe.cpt.dissipationSec, { kind: 'dissipation' });
      return { ok: true, kind: 'dissipation' };
    }

    /* ── CPT: terminate the sounding ───────────────────────────────────
       A sounding stopped at thrust capacity is a valid, reportable result and
       it is paid for. Pushing on while the machine moves is not. */
    if (name === 'terminate') {
      const p = S.prog;
      if (!p || p.kind !== 'probe' || p.mode !== 'cpt') return { ok: false, reason: 'not-a-cpt' };
      const h = liveHazard('thrust-limit');
      if (h) finishHazard(h, true);
      p.terminated = true;
      const depth = S.depth;
      complete();
      return { ok: true, kind: 'terminate', depthM: +depth.toFixed(2) };
    }

    if (name === 'kick') {
      if (S.kickCooldown > 0) return { ok: false, reason: 'cooldown', cooldown: S.kickCooldown };
      S.kickCooldown = T.jam.kickCooldown;
      S.load = Math.max(0, S.load - T.cuttings.kickClear);
      S.bind = Math.max(0, S.bind - T.jam.kickGain);
      S.heat = clamp(S.heat + T.jam.kickHeat);
      S.wear = clamp(S.wear + T.wear.shockPerEvent * 0.15);
      emitImpact(1, true);
      haptic('medium', true);
      return { ok: true, kind: 'kick', load: S.load, bind: S.bind };
    }
    return { ok: false, reason: 'unknown-pulse' };
  }

  function changeBit(itemId) {
    if (!S.active) return Promise.resolve({ ok: false, reason: 'idle' });
    if (S.phase !== 'drilling' && S.phase !== 'stuck') {
      return Promise.resolve({ ok: false, reason: `busy:${S.phase}` });
    }
    if (S.jamState === 'stuck') return Promise.resolve({ ok: false, reason: 'stuck' });
    return new Promise((resolve) => {
      S.tripResolve = resolve;
      beginTrip(itemId || '_spare', false);
    });
  }

  function setCasing(on) {
    const want = !!on;
    if (!S.m.casing && !S.m.casingFollows) return { ok: false, reason: 'method-cannot-case' };
    S.casingArmed = want;
    if (!want) { S.casingOn = false; return { ok: true, casing: false }; }
    if (S.m.casingFollows) { S.casingOn = true; return { ok: true, casing: true, follows: true }; }
    // A one-off casing run: case what has already been drilled, permanently.
    if (S.phase !== 'drilling') return { ok: false, reason: `busy:${S.phase}` };
    S.phase = 'casing-run';
    S.phaseT = 0;
    S.phaseDur = Math.max(T.trip.minSec, S.depth * T.stability.casingSecPerMetre);
    return { ok: true, casing: true, runSec: S.phaseDur };
  }

  /* ═════════════════════════════════════════════════════════════════════
     COMPLETION & GRADING
     ═════════════════════════════════════════════════════════════════════ */
  function scoreBreakdown() {
    const sc = T.score;
    const timeScore = clamp(1 - Math.max(0, S.timeSec - S.parSec) / (S.parSec * (sc.parSlack - 1) * 2));
    const uptime = clamp(S.grooveAccum / Math.max(1, S.drillSec));
    // Bits consumed, counted in whole bits. On a 50 m water bore a par run uses
    // a third of one; on a 2,000 m well it uses two or three, and grading that
    // against the same budget would fail every well for doing the job properly.
    const bitUsed = Math.max(0, S.wear - S.bitStartWear) + S.bitsUsed;
    /* THE BUDGET HAS TO BE THE JOB'S, NOT THE TABLE'S. 0.35 of a crown is what
       a shallow hole costs, and on a hole that needs no change at all
       `expectedTrips` is 0 and nothing below changes. But a job whose own wear
       model says a competent driller MUST change the tool — a raise re-cuttered
       six times on the way up, a long bore that eats a crown — was being graded
       against a third of one bit and scoring zero for doing the necessary
       thing. Par already contains those changes (see `computePar`); this is the
       same arithmetic, on the axis that prices them. `bitBudget` on the method
       still overrides outright, so oil-rotary's authored 2.4 is untouched. */
    const budget = nz(S.m.bitBudget,
                      Math.max(T.score.bitBudget, expectedTrips(S.target).consumed));
    const bitScore = clamp(1 - Math.max(0, bitUsed - budget) / Math.max(0.3, budget));
    const straight = clamp(1 - S.deviation / T.straight.maxDev);
    const hazScore = S.hazardsSeen ? clamp(S.hazardsClean / S.hazardsSeen) : 1;
    const safety = clamp(1 - S.safetyEvents * sc.safetyPenalty - S.jamIncidents * sc.jamPenalty);

    // THE METHOD'S OWN AXIS. On a method paid for depth there is nothing else
    // to measure and this weighs zero. On the six that are not paid for depth
    // — the bag, the round, the ring's toes, a bolt's anchorage, a pile's set,
    // a sounding's log — it carries most of the grade, and the method's own
    // weight set says so. Nothing changes for a method without one.
    const q = methodQuality();
    const w = (S.m.score && S.m.score.weights) || sc.weights;
    const quality = q ? clamp(q.score) : 0;

    const total = w.time * timeScore
                + w.groove * uptime
                + w.bit * bitScore
                + w.straight * straight
                + w.hazard * hazScore
                + w.safety * safety
                + nz(w.quality, 0) * quality;

    let grade = 'D';
    for (const [g, thr] of sc.grades) { if (total >= thr) { grade = g; break; } }

    return {
      grade,
      total: +total.toFixed(4),
      weights: w,
      quality: q ? { axis: q.label, score: +quality.toFixed(3), ...q.detail } : null,
      time: { parSec: +S.parSec.toFixed(1), actualSec: +S.timeSec.toFixed(1), score: +timeScore.toFixed(3) },
      groove: { uptime01: +uptime.toFixed(3), bestCombo: +D.combo.toFixed(2), score: +uptime.toFixed(3) },
      bit: { consumed01: +bitUsed.toFixed(3), bitsUsed: S.bitsUsed, endWear: +S.wear.toFixed(3), score: +bitScore.toFixed(3) },
      straightness: { deviation: +S.deviation.toFixed(2), score: +straight.toFixed(3) },
      hazards: { seen: S.hazardsSeen, clean: S.hazardsClean, log: S.hazardLog.slice(-12), score: +hazScore.toFixed(3) },
      safety: { events: S.safetyEvents, jams: S.jamIncidents, score: +safety.toFixed(3) },
      rods: { added: S.rodsAdded, perfect: S.perfectRods },
      well: S.m.wellControl ? {
        kicks: S.kicksHandled + S.kicksLate,
        shutInInTime: S.kicksHandled,
        shutInByTheCrew: S.kicksLate,
        killCirculations: S.kills,
        finalMudWeightSg: +S.mudWeight.toFixed(3),
        twistOffs: S.twistOffs,
        lcmSpotted: S.lcmUsed,
      } : null,
    };
  }

  function complete() {
    if (!S.active) return;
    S.depth = S.target;
    S.active = false;
    S.phase = 'complete';
    S.stopReason = 'complete';
    const breakdown = scoreBreakdown();
    writeState();
    emit(EV.HOLE_COMPLETE, {
      depth: +S.depth.toFixed(2),
      timeSec: +S.timeSec.toFixed(1),
      grade: breakdown.grade,
      breakdown,
      methodId: S.methodId,
      bitId: S.bit.id,
      bitWear: +S.wear.toFixed(3),
      bitWearBook: +S.wearBook.toFixed(3),
      bitBearing: +S.bearing.toFixed(3),
      contract: S.contract,
    });
    emit(EV.DRILL_STOP, { reason: 'complete' });
    haptic('success', true);
  }

  /* ═════════════════════════════════════════════════════════════════════
     FRAME — accumulator over the fixed step, then presentation.
     ═════════════════════════════════════════════════════════════════════ */
  let accum = 0;

  function update(dt, state) {
    void state;
    const frameDt = clamp(nz(dt, 1 / 60), 0, 0.25);
    if (S.active || S.phase === 'stuck') {
      accum += frameDt;
      let steps = 0;
      while (accum >= H && steps < T.sim.maxSubSteps) {
        step(H);
        accum -= H;
        steps++;
        if (!S.active && S.phase !== 'stuck') break;   // completed / aborted mid-frame
      }
      if (steps >= T.sim.maxSubSteps) accum = 0;       // drop the backlog, never spiral
      S.kickCooldown = Math.max(0, S.kickCooldown - frameDt);
    }
    updateDisplay(frameDt);
    flushImpacts(frameDt);
    writeState();
    if (S.active || S.phase === 'stuck') emitTick();
    S.grooveJustEntered = false;
    S.grooveJustLeft = false;
  }

  function updateDisplay(dt) {
    const f = T.sim.dispFastLambda, s = T.sim.dispSlowLambda;
    S.torqueJitter = telegraphJitter();
    D.rop = damp(D.rop, S.rop, f, dt);
    D.torque = damp(D.torque, clamp(S.torque + S.torqueJitter, 0, T.torque.displayMax), f, dt);
    // The gauge the band is actually measured against — torque on most methods,
    // set on a pile, push rate on a cone. The telegraph judder rides it either
    // way, because that is where the player is looking.
    D.gauge = damp(D.gauge, clamp(S.gauge + S.torqueJitter, 0, T.torque.displayMax), f, dt);
    D.depth = damp(D.depth, S.depth, f * 1.4, dt);
    D.combo = damp(D.combo, S.combo, f, dt);
    D.bandCentre = damp(D.bandCentre, S.bandCentre, f * 1.6, dt);
    D.wear = damp(D.wear, S.wear, s, dt);
    D.wearBook = damp(D.wearBook, S.wearBook, s, dt);
    D.heat = damp(D.heat, S.heat, s, dt);
    D.load = damp(D.load, S.load, s, dt);
    D.stability = damp(D.stability, S.stability, s, dt);
  }

  /* ── BIT_IMPACT: on the real percussion beat, capped for VFX/audio ──── */
  function impactIntensity() {
    const hard01 = clamp(hardnessOf(S.ground.ucs) / T.rock.hardMax);
    const drive = S.m.kind === 'percussive'
      ? (S.m.energyFromFlush ? S.act.flush : S.act.rpm) : S.act.rpm;
    let i = 0.20 + 0.45 * drive + 0.25 * hard01 + 0.25 * (S.combo - 1) / (T.rop.comboMax - 1);
    if (S.rop <= 0.01) i *= 0.45;
    if (S.inBand) i *= 1.12;
    return clamp(i, 0.05, 1);
  }

  function emitImpact(intensity, force = false) {
    const now = S.timeSec;
    if (!force && now - S.lastImpactT < 1 / T.sim.maxImpactHz) return false;
    S.lastImpactT = now;
    emit(EV.BIT_IMPACT, {
      intensity, stratum: S.ground, depth: S.depth, worldY: -S.depth,
      blows: Math.max(1, S.blowsPending), hz: nz(S.blowHz, 0),
      kind: S.m.impact, inGroove: S.inBand,
    });
    return true;
  }

  function flushImpacts(dt) {
    if (!S.blowsPending) return;
    if (S.phase === 'drilling' && S.active) {
      const i = impactIntensity();
      if (emitImpact(i)) {
        // light haptic on the beat cluster, at a rate a thumb can feel
        if (S.timeSec - S.lastBeatHapticT >= 1 / T.sim.beatHapticHz && i > 0.25) {
          S.lastBeatHapticT = S.timeSec;
          emit(EV.HAPTIC, { pattern: 'light' });
        }
        try { ctx.audio?.setDrillTone?.({ hz: S.blowHz, intensity: i, torque: S.torque, groove: S.inBand }); }
        catch { /* audio optional */ }
      }
    }
    S.blowsPending = 0;
    void dt;
  }

  /* ── state mirror (contract-defined branch only) ───────────────────── */
  /* The programme fields published on the LAST frame. writeState()'s
     programme block retires whatever is in here and is not republished.
     It deliberately SURVIVES startHole(), because the run whose fields
     have to come off the mirror is the previous one. */
  let progKeys = [];
  function writeState() {
    // Keep the gauge and its caption in step even on the frame a run ends: the
    // needle and the number under it must never disagree.
    S.gauge = gaugeNow();
    // Tell the section which pass is running before anything reads the state.
    pushStage();
    const d = ctx.state?.drill;
    if (!d) return;
    /* ── WHICH METHOD, AND WHAT IT CIRCULATES ────────────────────────────
       Fifty fields were mirrored here and these two were not, so every
       consumer that reads `state.drill` had to go and guess. `sim/vfx.js`
       carried a fallback chain three links long looking for exactly these two
       names; `ui/screens/site.js` re-derives the method from the contract,
       which `progression.js` nulls at settlement; `results.js` reads a
       normalised copy. One publisher, one answer, and it is the running
       method by construction — `startHole()` sets it before it emits anything.

       `flushMedium` may legitimately be NULL: the sim refuses to invent one
       (see resolveFlushMedium). A consumer reading null should use its own
       per-method table, not treat null as 'none'. */
    d.methodId = S.methodId;
    d.flushMedium = S.flushMedium;
    d.active = S.active;
    d.depth = S.depth;
    d.target = S.target;
    d.rop = S.rop;
    d.wob = S.act.wob;
    d.rpm = S.act.rpm;
    d.flush = S.act.flush;
    d.torque = clamp(S.torque, 0, T.torque.displayMax);
    d.wear = S.wear;
    d.heat = S.heat;
    d.stability = S.stability;
    d.jam = clamp(S.bind / T.jam.bindMax);
    d.rods = S.rods;
    d.stratumIndex = S.stratumIndex;
    // The HUD's cuttings meter reads `state.drill.load`. It was never mirrored
    // here, so the UI silently fell back to a synthetic estimate
    // (0.15 + wob*0.5 - flush*0.55) that evaluates to ~0 at ordinary inputs —
    // which is why CUTTINGS read 0% in every review screenshot for four rounds.
    d.load = S.load;
    d.returns = S.returns;
    d.timeSec = S.timeSec;
    d.inGreenBand = S.inBand;
    d.greenBandTime = S.greenBandTime;
    d.score = S.grooveAccum;

    /* ── EVERY PLAYER-VISIBLE NUMBER THE NEW METHODS PRODUCE ─────────────
       The HUD reads `state.drill`. A value that lives only in telemetry and
       never lands here is a value the HUD cannot see, and it will quietly
       fall back to a synthetic estimate rather than tell anyone — which is
       exactly how the cuttings meter read 0 % for four review rounds. So
       every gauge, counter and meter these six methods put in front of a
       player is mirrored here, next to the ones that already were. */
    d.holeDepth = S.holeDepth;
    d.stringDepth = S.stringDepth;
    /* The gauge the band is measured against, whatever it physically is.

       ── THE CAPTION HAS TO COME OFF THE SAME GAUGE AS THE NEEDLE ──
       These three read `S.m.gauge` — the METHOD's gauge — while the needle
       above them (`gaugeNow()`), the band, the sweet spot and
       `getTelemetry().gauge` all read `currentGauge()`, which is the ACTIVE
       STAGE's gauge if that stage declares one. On a reverse pass they are not
       the same object: `raise-boring` and `hdd` both swap the axis to `pull`
       for the way back. So for the whole of every second pass — half of every
       run on both methods — `state.drill` published a PULL value under the
       caption TORQUE, on the method's own scale. The HUD reads `state.drill`.
       A gauge whose caption disagrees with its needle is the one instrument
       this game is not allowed to ship, so all four now come off
       `currentGauge()` together and cannot drift apart again. */
    const g = currentGauge();
    d.gauge = clamp(S.gauge, 0, T.torque.displayMax);
    d.gaugeAxis = (g && g.axis) || 'torque';
    d.gaugeLabel = (g && g.label) || 'TORQUE';
    d.gaugeUnit = (g && g.unit) || '';
    // …and the scale it is drawn against, which moves with the axis too.
    d.gaugeMax = (g && g.max) || T.torque.displayMax;
    d.gaugeReal = gaugeRealValue();
    d.bandCentre = S.bandCentre;
    d.bandHalf = S.bandHalf;
    d.phase = S.phase;
    /* THE BEAT'S CLOCK, NOT JUST ITS NAME. `phase` was mirrored and its timer
       was not, so anything holding a pose for the length of a beat had to reach
       into the sim's read-only debug state to find out how long that is. Half
       these beats are defined by something NOT happening — a torque test is the
       spindle at 5.6 rpm with the percussion off — so the pose has to hold for
       exactly the beat and not a frame longer. */
    d.phaseT = S.phaseT;
    d.phaseDur = S.phaseDur;
    /* WHICH PASS IS RUNNING. Pushed into world/geology.js via setStage() every
       time it moves, and mirrored here as well so a consumer can poll instead.
       On a single-pass method this is 0 / 0 / 1 for the whole run.

       ── `actionDepth` IS THE MOVING QUANTITY ONCE A PASS REVERSES ──
       `depth` is what the CONTRACT is measured in, and on the way back the
       contract does not grow: `beginSecondPass()` pins `depth` at target and
       the whole of stage 1 makes no more of it. Anything that follows the tool
       — a carriage, a bit sprite, a particle emitter, a camera — must follow
       `actionDepth`, which counts down the hole as the head comes up. A rig
       feed keyed to `depth` freezes dead for the whole reverse pass, which is
       half of every raise-bore and HDD run, and looks like an animation bug. */
    d.stage = S.stage;
    d.stageProgress = S.stageProgress;
    d.stageCount = S.stageCount;
    d.stageId = (activeStage() && activeStage().id) || 'bore';
    d.stageReverse = onReversePass();
    d.actionDepth = actionDepth();
    // Overall progress across BOTH passes, so a progress bar does not read
    // 100 % for the whole of a pullback.
    d.progress01 = S.stageCount > 1
      ? clamp((S.stage + clamp(S.stageProgress / Math.max(1e-3, S.target))) / S.stageCount)
      : clamp(S.depth / Math.max(1e-3, S.target));

    /* ══ THE PROGRAMME BLOCK IS PUBLISHED WHOLE AND RETIRED WHOLE ══════
       `state.drill` is one shared mutable object that lives for the whole
       session — `core/contract.js` builds it once and nothing ever replaces
       it. Every branch below used to write straight onto it, and NOTHING
       took a field off again, so the mirror only ever GREW: measured, a
       driven-pile → rc → jet-grouting → auger sequence left the auger run
       publishing `programme: null` on top of 50 live-looking fields from
       three methods it was not — `founded: true` and `blowsPer250: 59` off a
       pile finished three holes earlier, `sampleRecovery: 0.641` off an RC
       run, and `jetBar: 434` / `return01: 0.496` off the jet grouting run.

       That last pair is the SAME DEFECT AS THE PRE-DRILL ONE BELOW, one
       level up. `sim/vfx.js` tests `d.jetBar != null && d.return01 != null`
       and nothing else, because those fields are documented as published by
       no other pass of no other method — so with them left standing the
       auger's collar drew `spoilWell`/`spoilOverflow` and its section drew a
       `spoil` return: a jet grouting column over a hole with no grout in it.
       Nulling them inside `case 'twoStage'` cannot reach this, because on the
       next hole that case does not run at all.

       So the branch writes into `pd`, and whatever the PREVIOUS frame put on
       the mirror and this frame did not is deleted. It cannot drift: a field
       is live exactly as long as the branch that owns it keeps writing it,
       and a new field needs no bookkeeping anywhere to be retired correctly.
       The core fields above are unaffected — they are written every frame by
       construction — and so is anything a consumer parks here itself
       (`ui/screens/site.js` keeps `runLog` on this object).
       ═════════════════════════════════════════════════════════════════ */
    const p = S.prog;
    const pd = {};
    switch (p ? p.kind : null) {
      case 'rc':
        pd.programme = 'rc';
        pd.sampleBags = p.index;               // bags cut
        pd.sampleRecovery = p.recovery01;      // the score, not the metres
        pd.sampleContamination = p.contam01;
        pd.sampleQuality = p.quality01;
        pd.sampleHoldUp = p.holdUp;            // the carry-over meter
        pd.sampleWet = p.wet;
        pd.sampleTrainWear = p.trainWear;
        break;
      case 'jumbo':
        pd.programme = 'tunnel-jumbo';
        pd.roundIndex = p.roundIndex + 1;
        pd.roundLength = p.round ? p.round.length : 0;
        pd.roundGroup = jumboGroup() ? jumboGroup().id : null;
        pd.roundHolesDone = p.round ? p.round.holesDone : 0;
        pd.roundHoles = p.holesPerRound;
        pd.roundDrilledM = p.round ? p.round.drilledM : 0;
        pd.roundPull = p.pull01;
        pd.roundOverbreak = p.overbreak;
        pd.roundHalfBarrel = p.halfBarrel;
        pd.roundCutErrM = p.round ? p.round.cutErrM : 0;
        pd.roundLookout = p.round ? p.round.lookout01 : 0;
        pd.roundChargeKgM = p.round ? p.round.chargeKgM : 0;
        pd.advanceM = p.advanceM;
        // `pulse('shortRound')` was the one action publishing no flag, so a
        // consumer could see the round get shorter but not that it was taken.
        pd.roundShortened = !!(p.round && p.round.shortened);
        /* WHERE THE POWER IS COMING FROM. A jumbo drills the face on mains and
           trams on its diesel, and the changeover is audible — the engine dies
           through its governor, a contactor closes, and an induction bed comes
           up whose pitch never moves. That cue was being inferred from "is
           something percussing", with a debounce to cover the gaps. It is not
           an inference: the sim knows which end of the round it is in. */
        pd.tramming = !(S.phase === 'drilling' || S.phase === 'boom-setup'
                    || S.phase === 'redrill' || S.phase === 'rod-add');
        pd.powerMode = pd.tramming ? 'diesel' : 'mains';
        break;
      case 'longhole':
        pd.programme = 'longhole';
        pd.ringHole = p.holeIndex + 1;
        pd.ringHoles = p.holesTotal;
        pd.ringIndex = p.ringIndex + 1;
        pd.uphole = p.uphole;
        /* THE FAN'S SHAPE, so nothing has to hardcode it. `holesPerRing` and
           `upholeFrac` were telemetry-only, so the rig carried its own copies —
           eleven fan angles and a 5/6 up-down split — with a note saying that
           if either constant here moved, the cradle would drill visibly into
           the floor while the HUD said uphole. A constant that two files must
           agree on and only one of them can see is a trap; this is the way out
           of it. */
        pd.holesPerRing = S.m.ring.holesPerRing;
        pd.upholeFrac = S.m.ring.upholeFrac;
        pd.holeLengthM = p.holeLengthM;
        pd.deviationCue = p.cue01;             // a CUE. The number is not published.
        pd.dilutionHoles = p.dilutionHoles;
        pd.oreLossHoles = p.oreLossHoles;
        break;
      case 'bolt': {
        const b = S.m.bolt;
        const last = p.installs[p.installs.length - 1] || null;
        pd.programme = 'rockbolt';
        pd.boltIndex = p.index;
        pd.boltsTotal = p.total;
        pd.boltType = p.type;
        pd.boltHoleMm = boltHoleMm();
        pd.boltAnchorage = last ? last.anchorage01 : 1;
        pd.boltSlotClosureIn = last && last.inspected ? last.slotClosureIn : null;
        pd.boltTorqueKnm = p.lastTorqueKnm;
        pd.boltTorqueDue = p.torqueWindowT > 0;
        pd.boltTestsTaken = p.testsTaken;
        pd.boltTestsDue = p.testsDue;
        pd.boltMixBand = b.mixBand;
        /* THE RESIN CLOCK. Spin, then gel, then HOLD without turning — and the
           hold is the part defined by something not happening, so anything
           scoring or animating it needs the seconds left, not a guess at them.

           `holdRemainingSec` MEANS THE HOLD, not the beat. It published the
           whole install beat's remainder (5.8 s of spin + gel + hold) under a
           name that says hold, so a consumer timing the still pose off it would
           have held from the first turn of the bar — through the spin, which is
           the one part of the install where the bar IS turning. The beat's own
           remainder is `boltInstallRemainingSec`, and which third of the install
           is running is `boltInstallStage`; the boundaries are the same ones
           `stepBoltInstall()` scores against, read off the same two constants. */
        pd.boltGelSec = b.gelSec;
        pd.boltHoldSec = b.holdSec;
        const resinT = (S.phase === 'bolt-install' && p.type === 'resin') ? S.phaseT : null;
        pd.boltInstallStage = resinT == null ? null
          : resinT <= b.spinSec ? 'spin' : resinT <= b.gelSec ? 'gel' : 'hold';
        pd.boltInstallRemainingSec = resinT == null ? null : Math.max(0, S.phaseDur - resinT);
        pd.boltHoldRemainingSec = pd.boltInstallStage === 'hold'
          ? Math.max(0, S.phaseDur - resinT) : null;
        // How much of the required hold has actually been banked — the hold is
        // scored on seconds NOT turning, so the clock alone does not say it.
        pd.boltHoldMetSec = p.heldSec;
        break;
      }
      case 'pile': {
        const p0 = S.m.pile;
        const h = hammerSetting(S.m, S.act.wob, S.act.rpm);
        pd.programme = 'driven-pile';
        pd.blows = Math.round(p.blows);
        pd.setMm = p.measuredSetMm;            // the instrument that can lie
        pd.blowsPer250 = Math.round(250 / Math.max(0.05, p.measuredSetMm));
        pd.designSetMm = p.designSetMm;
        pd.toeDepth = p.toeDepthM;             // the instrument that cannot
        pd.headDepth = p.headDepthM;
        pd.bearingTop = p.bearingTopM;
        pd.bearingPen = p.bearingPenM;
        pd.founded = p.founded;
        pd.hammerEnergyKnm = h.kNm;
        pd.hammerDropM = h.dropM;
        pd.hammerBpm = h.bpm;
        pd.hammerPowerLimited = h.capped;
        pd.headDamage = p.headDamage;
        pd.toeDamage = p.toeDamage;
        pd.rakeDeg = p.rake;
        pd.drivingStress = p.stress;
        pd.dollyCondition = clamp(1 - p.dollyWear);
        pd.refused = p.refused;
        pd.blowLog = p.log.slice(-24);
        // The pile itself: the design driven length, which is what the contract
        // asks for and what a ring or a rebound has to be scaled against.
        pd.pileLengthM = S.target;
        break;
      }
      case 'probe':
        pd.programme = p.mode === 'cpt' ? 'cpt' : 'spt';
        if (p.mode === 'cpt') {
          const t = p.trace[p.trace.length - 1] || null;
          pd.pushRateMmS = S.rop / 3.6;
          pd.qcMpa = t ? t.qcMpa : 0;
          pd.fsKpa = t ? t.fsKpa : 0;
          pd.u2Kpa = t ? t.u2Kpa : null;
          pd.rfPct = t ? t.rfPct : 0;
          pd.sbt = t ? t.sbt : null;
          pd.coneSaturated = p.saturated;
          pd.inclinationDeg = p.incl;
          pd.traceInTolerance = p.fidelity01;
          /* A SOUNDING STOPPED AT THRUST CAPACITY IS A VALID, REPORTABLE
             RESULT — it is not a failed run, and it must not be inferred from
             "the run ended short". Only the sim knows the difference. */
          pd.soundingTerminated = !!p.terminated;
        } else {
          pd.sptIncrement = p.inc;
          pd.sptBlows = Math.round(p.blowsTotal);
          pd.sptRelease = p.release;
          pd.sptEnergyRatio = p.er;
          const last = p.tests[p.tests.length - 1] || null;
          pd.sptN = last ? last.N : null;
          pd.sptN60 = last ? last.N60 : null;
          pd.sptRefusal = last ? last.refusal : null;
        }
        pd.logQuality = p.quality01;
        pd.logFidelity = p.fidelity01;
        break;
      /* THE TWO-PASS METHODS WERE PUBLISHING NOTHING HERE. `raise-boring` and
         `hdd` reached `default:` and set `programme = null`, so anything
         switching on `state.drill.programme` saw a two-pass run as an ordinary
         hole. The pass itself was mirrored above (`stage`, `stageProgress`,
         `stageReverse`, `actionDepth`) and so was the gauge swapping to PULL,
         but the three numbers the reverse pass is actually played on — how
         close the pull is to the head's stall, how far the cutters have gone,
         and how many times it has already stalled — lived only on
         `getTelemetry().programme`. They are what tells the player to send the
         crew up to the head, so they belong on the state the HUD reads. */
      case 'twoStage': {
        const st = S.m.stages[Math.min(S.stage, S.m.stages.length - 1)];
        pd.programme = 'two-stage';
        pd.stageName = st.name;
        pd.passM = p.passM;
        pd.pull01 = nz(p.pull);
        pd.pullStallAt = st.stallAt == null ? null : st.stallAt;
        pd.stalls = p.stalls;
        pd.cutterWear01 = p.cutterWear;
        pd.cutterChanges = p.cutterChanges;
        // Cutters on a raise borer are changed FROM BELOW and a reamer cannot
        // be tripped at all, so this is not the string-trip number.
        pd.cutterChangeSec = st.cutterChangeSec == null ? null : st.cutterChangeSec;
        pd.mucksByGravity = !!st.flushOff;
        /* THE JETTING LIFT'S OWN THREE NUMBERS. Same argument as the block
           above: these are what the pass is actually played on, so they belong
           on the state the HUD reads and not only on telemetry. `jetBar` is
           the only one with a unit, and it has one because both ends of it are
           sourced (EN 12716's 250 bar floor, [KLEMM]'s 700 bar pump). The
           column index deliberately has none. */
        /* ── PUBLISHED ONLY WHILE THE MONITOR IS ACTUALLY JETTING ────────
           `p.jet` exists from the moment the programme starts, because
           `startTwoStage()` builds it once for the whole run. Publishing off
           that alone put `jetBar` and `return01` on `state.drill` through the
           PRE-DRILL as well — and MEASURED, that is exactly what went wrong:
           `sim/vfx.js` keys its spoil return on the presence of these fields,
           so a 55 s browser capture drew a jet grouting spoil column for 1,100
           frames of a run that never left stage 0. The picture was of a pass
           that had not started.

           So the gate is the PASS, not the programme. Off the jetting stage
           these are explicitly null — `state.drill` is a shared mutable
           object and a stale number left on it reads exactly like a live one.

           The constants come off `stages[1]`, never off the active stage,
           because during the pre-drill the active stage has no `jet` block. */
        const js = onReversePass() && S.m.stages[1] && S.m.stages[1].jet;
        if (!js || !p.jet) {
          pd.jetBar = null; pd.jetFloorBar = null; pd.jetBelowFloor = false;
          pd.column01 = null; pd.columnWorst01 = null;
          pd.return01 = null; pd.returnIdeal01 = null; pd.columnDiaKnown = null;
        }
        if (p.jet && js) {
          pd.jetBar = Math.round(p.jet.bar);
          pd.jetFloorBar = js.floorBar;
          pd.jetBelowFloor = !!p.jet.belowFloor;
          pd.column01 = clamp(p.jet.column01);
          pd.columnWorst01 = clamp(p.jet.worst01);
          pd.return01 = clamp(p.jet.return01, 0, 1.25);
          pd.returnIdeal01 = js.retIdeal;
          // Column DIAMETER is not published, in any unit, at any confidence.
          pd.columnDiaKnown = false;
        }
        break;
      }
      default: pd.programme = null; break;
    }
    /* Retire the previous frame's programme fields that this one did not
       republish. `delete` rather than `= null` so a consumer's `in` / typeof
       test reads "absent", which is what it is. */
    for (let i = 0; i < progKeys.length; i++) {
      if (!(progKeys[i] in pd)) delete d[progKeys[i]];
    }
    progKeys = Object.keys(pd);
    Object.assign(d, pd);
  }

  function emitTick() {
    emit(EV.DRILL_TICK, {
      depth: S.depth, rop: S.rop, torque: S.torque, wob: S.act.wob, wear: S.wear,
      stratum: S.ground,
      // extras the HUD/VFX/audio hook the groove on
      ropDisplay: D.rop, torqueDisplay: D.torque, combo: S.combo,
      inGroove: S.inBand, grooveEnter: !!S.grooveJustEntered, grooveLeave: !!S.grooveJustLeft,
      greenBandTime: S.greenBandTime, sweetSpot: getSweetSpot(),
      heat: S.heat, load: S.load, stability: S.stability, bind: S.bind,
      jamState: S.jamState, phase: S.phase, warning: currentWarning(),
    });
  }

  /* ── the single most important warning for the gauges right now ────── */
  function currentWarning() {
    // A well that is flowing outranks every other thing happening on the rig.
    const kick = activeKick();
    if (kick) {
      const tele = kick.phase === 'telegraph';
      return {
        kind: 'kick',
        progress01: tele ? clamp(kick.t / kick.telegraph) : clamp(kick.t / T.hazard.kick.reactSec),
        severity: kick.severity, hint: HINTS.kick, telegraph: tele,
      };
    }
    if (S.phase === 'well-control') {
      return { kind: 'well-control', progress01: clamp(S.phaseT / Math.max(0.1, S.phaseDur)),
               severity: 1, hint: HINTS['well-control'], telegraph: false };
    }
    for (const h of S.hazards) {
      if (h.phase === 'telegraph') {
        return { kind: h.kind, progress01: clamp(h.t / h.telegraph), severity: h.severity,
                 hint: HINTS[h.kind] || '', telegraph: true };
      }
    }
    if (S.jamState === 'stuck') {
      return { kind: 'stuck', progress01: clamp(S.stuckSec / nz(S.m.jamLoseSec, T.jam.loseSec)),
               severity: 1, hint: HINTS.stuck, telegraph: false };
    }
    if (S.rodBreakArmed > 0) {
      return { kind: 'rod-fatigue', progress01: clamp(S.rodBreakArmed / T.rods.breakTelegraphSec),
               severity: S.rodFatigue, hint: HINTS['rod-fatigue'], telegraph: true };
    }
    if (S.breakArmed > 0) {
      return { kind: 'bit-critical', progress01: clamp(S.breakArmed / T.wear.breakTelegraphSec),
               severity: S.wear, hint: HINTS['bit-critical'], telegraph: true };
    }
    for (const h of S.hazards) {
      if (h.phase === 'active') {
        return { kind: h.kind, progress01: clamp(nz(h.progress, h.t / 8)), severity: h.severity,
                 hint: HINTS[h.kind] || '', telegraph: false };
      }
    }
    if (S.jamState === 'binding') {
      return { kind: 'binding', progress01: clamp((S.bind - T.jam.bindEnter) / (T.jam.stuckEnter - T.jam.bindEnter)),
               severity: S.bind, hint: HINTS.binding, telegraph: false };
    }
    if (S.m.wellControl && S.mudLevel < 0.9) {
      return { kind: 'pit-loss', progress01: clamp(1 - S.mudLevel), severity: clamp(1 - S.mudLevel),
               hint: HINTS['pit-loss'], telegraph: false };
    }
    // A cone that is not being pushed is not a sounding. One control, and it is
    // at rest — say so plainly rather than leaving a blank gauge.
    if (S.m.kind === 'push' && S.phase === 'drilling' && S.act.wob < 0.03) {
      return { kind: 'push-stalled', progress01: 1, severity: 0.4, hint: HINTS['push-stalled'], telegraph: false };
    }
    if (!S.m.dryMethod && S.lostCirc > 0.5) return { kind: 'lost-circulation', progress01: S.lostCirc, severity: S.lostCirc, hint: HINTS['lost-circulation'], telegraph: false };
    if (!S.m.dryMethod && S.load > 0.72) return { kind: 'hole-cleaning', progress01: S.load, severity: S.load, hint: HINTS['hole-cleaning'], telegraph: false };
    if (S.heat > T.heat.overheatAt) return { kind: 'overheat', progress01: S.heat, severity: S.heat, hint: HINTS.overheat, telegraph: false };
    if (S.torque > T.torque.overLimit) return { kind: 'overtorque', progress01: clamp(S.torque - 1, 0, 1), severity: S.torque, hint: HINTS.overtorque, telegraph: false };
    if (S.wear >= T.wear.wornAt) return { kind: 'bit-worn', progress01: S.wear, severity: S.wear, hint: HINTS['bit-worn'], telegraph: false };
    // The method simply cannot chew this ground. Abandoning the hole is the action.
    if (S.phase === 'drilling' && S.ropPotential < T.rop.methodLimitMh
        && S.m.rockCeilingUcs && S.ground.ucs > S.m.rockCeilingUcs) {
      return { kind: 'method-limit', progress01: 1, severity: 1, hint: HINTS['method-limit'], telegraph: false };
    }
    return null;
  }

  /* ═════════════════════════════════════════════════════════════════════
     READ-ONLY VIEWS FOR THE UI
     ═════════════════════════════════════════════════════════════════════ */
  function getSweetSpot() {
    return {
      center01: S.bandCentre,
      halfWidth01: S.bandHalf,
      axis: 'torque',
      // presentation extras
      display01: D.bandCentre,
      inBand: S.inBand,
      combo: S.combo,
      jumped: S.bandJumpT > 0,
    };
  }

  /** The gauge's value in its OWN units, for the caption under the needle. */
  function gaugeRealValue() {
    const g0 = currentGauge();
    const axis = (g0 && g0.axis) || 'torque';
    if (axis === 'pull') return S.prog ? +nz(S.prog.pull).toFixed(3) : 0;
    /* Normalised, and it stays normalised. A spoil return in l/min would be a
       fine caption and there is no sourced figure for it — the pack gives the
       PUMP's 400 l/min, not what comes back over the collar, and those are not
       the same number. */
    if (axis === 'return') return S.prog?.jet ? +nz(S.prog.jet.return01).toFixed(3) : 0;
    if (axis === 'set') return S.prog ? +S.prog.measuredSetMm.toFixed(2) : 0;
    if (axis === 'push-rate') return +(S.rop / 3.6).toFixed(1);
    return +S.torque.toFixed(3);
  }

  /**
   * The live programme, published for the HUD and the section band.
   *
   * Everything the player can legitimately see goes here. Everything they
   * cannot — the true toe position of a longhole, the true set of a brooming
   * pile — stays out until the unit is finished, which is exactly when a
   * driller finds out too.
   */
  function programmeTelemetry() {
    const p = S.prog;
    if (!p) return null;
    switch (p.kind) {
      case 'rc': {
        const s = S.m.sample;
        const last = p.bags[p.bags.length - 1] || null;
        return {
          kind: 'rc', unit: 'bag',
          bagsCut: p.index, intervalM: s.intervalM, targetKgPerM: s.targetKgPerM,
          nextBagAtM: +p.nextSampleDepth.toFixed(2),
          recovery01: +p.recovery01.toFixed(3),
          contamination01: +p.contam01.toFixed(3),
          quality01: +p.quality01.toFixed(3),
          holdUp01: +p.holdUp.toFixed(3),     // the carry-over meter: the blow-down cue
          wet01: +p.wet.toFixed(3),
          cave01: +p.cave.toFixed(3),
          trainWear01: +p.trainWear.toFixed(3),
          blowDowns: p.blowDowns,
          blowDownReady: S.timeSec - p.lastBlowDown >= T.hazard.carryOver.blowDownCooldown,
          highConfidence: p.highBags, contaminated: p.contamBags, lost: p.lossBags, wetBags: p.wetBags,
          lastBag: last, recentBags: p.bags.slice(-8),
        };
      }
      case 'jumbo': {
        const rd = p.round, r = S.m.round;
        const g = jumboGroup();
        return {
          kind: 'jumbo', unit: 'round',
          roundIndex: p.roundIndex + 1, roundsFired: p.rounds.length,
          faceAreaM2: p.faceAreaM2, holesPerRound: p.holesPerRound,
          roundLengthM: rd ? +rd.length.toFixed(2) : 0,
          designLengthM: rd ? +rd.designLength.toFixed(2) : 0,
          shortened: !!(rd && rd.shortened),
          group: g ? g.id : null,
          groupTolerancePct: g ? g.tolPct : null,
          specTolerancePct: r.alignSpecPct,
          holesDone: rd ? rd.holesDone : 0,
          drilledM: rd ? +rd.drilledM.toFixed(1) : 0,
          roundTotalM: rd ? +rd.totalM.toFixed(0) : 0,
          aim: rd ? +rd.aim.toFixed(3) : 0.5,
          collarErrM: rd ? +rd.collarErrM.toFixed(3) : 0,
          collarSpecM: r.collarSpecM,
          cutErrM: rd ? +rd.cutErrM.toFixed(3) : 0,
          cutBurdenM: rd ? +cutBurdenFor(rd.length).toFixed(3) : r.cutBurdenM,
          cutAtRisk: !!(rd && rd.cutErrM > cutBurdenFor(rd.length) * 0.72),
          lookout01: rd ? +rd.lookout01.toFixed(3) : 0,
          lookoutAllowM: rd ? +(r.lookoutBaseM + r.lookoutPerM * rd.length).toFixed(3) : 0,
          lookoutBand: r.lookoutBand,
          chargeKgM: rd ? +rd.chargeKgM.toFixed(2) : 0,
          chargeBandKgM: r.contourChargeKgM,
          lastRound: p.rounds[p.rounds.length - 1] || null,
          advanceM: +p.advanceM.toFixed(2),
          pull01: +p.pull01.toFixed(3), overbreak: +p.overbreak.toFixed(3),
          halfBarrel01: +p.halfBarrel.toFixed(3),
          chokedRounds: p.chokedRounds, underbreakRounds: p.underbreakRounds,
        };
      }
      case 'longhole': {
        const r = S.m.ring;
        return {
          kind: 'longhole', unit: 'hole',
          holeIndex: p.holeIndex + 1, holesTotal: p.holesTotal,
          ring: p.ringIndex + 1, inRing: p.inRing + 1, holesPerRing: r.holesPerRing,
          uphole: p.uphole, holeLengthM: +p.holeLengthM.toFixed(1),
          intoHoleM: +S.holeDepth.toFixed(2),
          // DEVIATION IS NOT PUBLISHED. What a production driller has is the
          // feel of the feed and the sound of the string; the number arrives
          // when the ring is surveyed, and not one second before.
          deviationCue01: +p.cue01.toFixed(3),
          deviationVisible: false, specPct: r.devSpecPct,
          blocked: p.blocked, redrills: p.redrills,
          dilutionHoles: p.dilutionHoles, oreLossHoles: p.oreLossHoles,
          convergedPairs: p.convergedPairs, blockedHoles: p.blockedHoles,
          surveyed: p.toes.slice(-8),
        };
      }
      case 'bolt': {
        const b = S.m.bolt;
        const last = p.installs[p.installs.length - 1] || null;
        return {
          kind: 'rockbolt', unit: 'bolt', boltType: p.type,
          boltIndex: p.index + 1, boltsTotal: p.total,
          ring: p.ring, inRing: p.inRing, perRing: b.perRing,
          boltLengthM: b.lengthM, holeTargetM: +p.holeTargetM.toFixed(2),
          intoHoleM: +S.holeDepth.toFixed(2),
          holeMm: +boltHoleMm().toFixed(1),
          holeIdealMm: b.bitMmIdeal, holeZeroMm: b.bitMmZero,
          holeOpen: p.holeOpen,
          // The slot-closure reading, and it only exists once you have looked.
          slotClosureIn: last && last.inspected ? last.slotClosureIn : null,
          slotFullContactIn: b.slotClosedIn,
          lastAnchorage01: last ? last.anchorage01 : null,
          supportedM: +p.supportedM.toFixed(2),
          torqueTestsDue: p.testsDue, torqueTestsTaken: p.testsTaken,
          torqueTestPending: p.torqueWindowT > 0,
          torqueWindowLeftSec: p.torqueWindowT > 0 ? +Math.max(0, p.torqueWindowT - S.timeSec).toFixed(1) : 0,
          torqueBandKnm: b.torqueBandKnm, lastTorqueKnm: p.lastTorqueKnm,
          nextTestAtBolt: nextTorqueTestBolt(p, b),
          mixBand: b.mixBand, mix: +S.act.flush.toFixed(2),
          /* THE RESIN CLOCK, on the programme object as well as on
             `state.drill`. Audio keys the install off this and half of it is
             defined by something not happening — the hold is the bar standing
             still — so a consumer needs the stage and the seconds left rather
             than a guess at how long "spin, gel, hold" takes. `holdRemainingSec`
             is the HOLD's remainder and is null outside it; the whole beat's is
             `installRemainingSec`. */
          installStage: resinStage(),
          installRemainingSec: S.phase === 'bolt-install' && p.type === 'resin'
            ? +Math.max(0, S.phaseDur - S.phaseT).toFixed(2) : null,
          holdRemainingSec: resinStage() === 'hold'
            ? +Math.max(0, S.phaseDur - S.phaseT).toFixed(2) : null,
          spinSec: b.spinSec, gelSec: b.gelSec, holdSec: b.holdSec,
          holdMetSec: +p.heldSec.toFixed(2),
          installs: p.installs.slice(-8),
        };
      }
      case 'pile': {
        const p0 = S.m.pile;
        const h = hammerSetting(S.m, S.act.wob, S.act.rpm);
        return {
          kind: 'driven-pile', unit: 'blow',
          blows: Math.round(p.blows),
          // THE INSTRUMENT. This is what the driller reads, and it is the one
          // that can lie: a brooming toe drives the measured set down while the
          // pile goes nowhere.
          setMmPerBlow: +p.measuredSetMm.toFixed(2),
          blowsPer250: Math.round(250 / Math.max(0.05, p.measuredSetMm)),
          designSetMm: +p.designSetMm.toFixed(2),
          practicalBlows: p0.practicalBlows, refusalBlows: p0.refusalBlows,
          // THE COUNTER-CHECK. Different instrument, and the honest one.
          toeDepthM: +p.toeDepthM.toFixed(2),
          headDepthM: +p.headDepthM.toFixed(2),
          bearingTopM: p.bearingTopM == null ? null : +p.bearingTopM.toFixed(2),
          bearingPenM: +p.bearingPenM.toFixed(2),
          bearingPenRequiredM: p0.bearingPenM,
          founded: p.founded,
          // The hammer, in real units, and the envelope it is sitting on.
          energyKnm: +h.kNm.toFixed(1), dropM: +h.dropM.toFixed(3),
          maxDropM: p0.strokeMaxM,
          blowRateBpm: Math.round(h.bpm),
          energyCeilingKnm: +h.eMax.toFixed(1), ramCeilingKnm: +h.eRam.toFixed(1),
          powerLimited: h.capped,
          // Condition, and the limits it is measured against.
          headDamage01: +p.headDamage.toFixed(3), toeDamage01: +p.toeDamage.toFixed(3),
          rakeDeg: +p.rake.toFixed(2), rakeMaxDeg: p0.rakeMaxDeg,
          drivingStress01: +p.stress.toFixed(3),
          stressLimit01: p0.stressLimit + (p.monitored ? (p.steel ? p0.stressSteelAdd : p0.stressMonitoredAdd) : 0),
          monitored: p.monitored, steel: p.steel,
          dollyCondition01: +clamp(1 - p.dollyWear).toFixed(3), dollyChanges: p.dollyChanges,
          refused: p.refused, hardRefused: p.hardRefused,
          setTaken: p.setTaken, setSamples: p.setSamples,
          // The depth ruler on a pile IS the blow-count bar chart.
          blowLog: p.log.slice(-24),
        };
      }
      case 'twoStage': {
        const st = S.m.stages[Math.min(S.stage, S.m.stages.length - 1)];
        return {
          kind: 'two-stage', unit: 'pass',
          stage: S.stage, stageId: st.id, stageName: st.name, reverse: !!st.reverse,
          passM: +p.passM.toFixed(2), passTargetM: +S.target.toFixed(2),
          // On the way back the constraint is PULL, not rate.
          pull01: +nz(p.pull).toFixed(3),
          stallAt: st.stallAt == null ? null : st.stallAt,
          stalls: p.stalls,
          cutterWear01: +p.cutterWear.toFixed(3), cutterChanges: p.cutterChanges,
          // Cutters on a raise borer are changed FROM BELOW, which is why it
          // is a real time cost and not a menu click.
          cutterChangeSec: st.cutterChangeSec == null ? null : st.cutterChangeSec,
          mucksByGravity: !!st.flushOff,
          pilotDeviation: +p.pilotDeviation.toFixed(2),
          /* A jetting lift is a different pass from a reaming one and says so,
             so a consumer can tell them apart without a method-id table. */
          // Null through the pre-drill, for the same reason state.drill's copy
          // is: nothing is being jetted yet, so there is nothing to report.
          jet: p.jet && onReversePass() && S.m.stages[1] && S.m.stages[1].jet ? {
            bar: Math.round(p.jet.bar),
            floorBar: S.m.stages[1].jet.floorBar,
            maxBar: S.m.stages[1].jet.maxBar,
            belowFloor: !!p.jet.belowFloor,
            column01: +clamp(p.jet.column01).toFixed(3),
            worst01: +clamp(p.jet.worst01).toFixed(3),
            return01: +clamp(p.jet.return01, 0, 1.25).toFixed(3),
            returnIdeal01: S.m.stages[1].jet.retIdeal,
            erodibility01: +p.jet.erodibility.toFixed(2),
            belowFloorM: +p.jet.belowFloorM.toFixed(2),
            lostM: +p.jet.lostM.toFixed(2), heaveM: +p.jet.heaveM.toFixed(2),
            /* THE GATE. Column diameter by soil and system, withdrawal rate
               and monitor rpm are all UNVERIFIED in research/05 §A12, which
               says in as many words not to ship a table without a source. The
               shapes above are real; these three numbers do not exist here and
               nothing may print one. */
            columnDiaKnown: false,
            withdrawRateKnown: false,
            rotationSpeedKnown: false,
          } : null,
        };
      }
      case 'probe': {
        const pr = S.m.probe;
        if (p.mode === 'cpt') {
          const c = pr.cpt;
          return {
            kind: 'cpt', unit: 'reading', mode: 'cpt',
            pushRateMmS: +(S.rop / 3.6).toFixed(1),
            targetMmS: c.rateMmS, toleranceMmS: c.rateTolMmS,
            inTolerance01: +p.fidelity01.toFixed(3),
            readings: p.trace.length, resolutionMm: nz(p.probe.resolutionMm, c.readingEveryMm),
            latest: p.trace[p.trace.length - 1] || null,
            trace: p.trace.slice(-40),
            saturated: p.saturated, dissipations: p.dissipations,
            inclinationDeg: +p.incl.toFixed(2), inclinationLimitDeg: c.inclLimitDeg,
            baselineDrift: +p.baseline.toFixed(4), baselineTol: c.baselineTol,
            coneDamage01: +p.coneDamage.toFixed(3), terminated: p.terminated,
            // Nothing turns and nothing is circulated. Say so, do not hide it.
            rotationLocked: true, flushLocked: true,
            lockNote: 'the cone does not turn',
          };
        }
        const s = pr.spt;
        const last = p.tests[p.tests.length - 1] || null;
        return {
          kind: 'spt', unit: 'test', mode: 'spt',
          hammerKg: s.hammerKg, dropMm: s.dropMm,
          testIndex: p.testIndex, nextTestAtM: +p.nextTestDepth.toFixed(2),
          driving: S.phase === 'spt-drive',
          increment: p.inc, incrementMm: s.incrementMm,
          seatingIncrements: s.seatingIncrements, testIncrements: s.testIncrements,
          incrementLog: p.incLog || [],
          blowsThisIncrement: Math.round(p.incBlows),
          blowsTotal: Math.round(p.blowsTotal),
          release01: +p.release.toFixed(3),
          releasePhase01: +p.releasePhase.toFixed(3),
          releaseWindow: s.releaseWindow,
          releaseGoodNow: p.releasePhase < s.releaseWindow * 0.5
                       || p.releasePhase > 1 - s.releaseWindow * 0.5,
          energyRatio: +p.er.toFixed(2), er60: s.er60,
          rodCorrection: +sptRodCorrection(S.m, S.depth).toFixed(2),
          lastTest: last,
          tests: p.tests.slice(-6),
          // Every split-spoon sample is a disturbed sample, and the game says so.
          areaRatio: nz(p.probe.areaRatio, 1.10),
          disturbedNote: 'area ratio ~110 % — every split-spoon sample is disturbed',
          feedLocked: true,
          lockNote: 'the hammer is the drive',
        };
      }
      default: return null;
    }
  }

  function nextTorqueTestBolt(p, b) {
    const n = p.index + 1;
    if (n === 1 || n === p.total) return n;
    return Math.min(p.total, Math.ceil(n / b.torqueTestEvery) * b.torqueTestEvery);
  }

  /**
   * Which discrete actions this method offers right now. The HUD reads this to
   * decide which pill to show; every entry is a `pulse()` name.
   */
  function availableActions() {
    const out = [];
    const p = S.prog;
    const drilling = S.phase === 'drilling';
    if (S.m.wellControl) out.push({ id: 'shutIn', label: 'SHUT IN', enabled: !S.shutIn });
    if (S.m.wellControl && S.hasLcm) out.push({ id: 'lcmPill', label: 'LCM PILL', enabled: !S.lcmUsed });
    if (!p) return out;
    switch (p.kind) {
      case 'rc':
        out.push({ id: 'blowDown', label: 'BLOW DOWN', enabled: drilling
          && S.timeSec - p.lastBlowDown >= T.hazard.carryOver.blowDownCooldown });
        break;
      case 'jumbo':
        out.push({ id: 'shortRound', label: 'SHORTEN ROUND',
          enabled: !!(p.round && !p.round.shortened) });
        break;
      case 'longhole':
        out.push({ id: 'redrill', label: 'RE-DRILL', enabled: drilling });
        break;
      case 'bolt':
        out.push({ id: 'torqueTest', label: 'TORQUE TEST', enabled: drilling,
          due: p.torqueWindowT > 0 });
        out.push({ id: 'reamHole', label: 'REAM HOLE', enabled: drilling });
        if (p.type === 'friction') {
          out.push({ id: 'inspectSlot', label: 'READ THE SLOT',
            enabled: drilling && p.installs.length > 0 });
        }
        break;
      case 'pile':
        out.push({ id: 'takeSet', label: 'TAKE THE SET', enabled: drilling && !p.setTaken });
        out.push({ id: 'changeDolly', label: 'CHANGE DOLLY', enabled: drilling });
        break;
      case 'probe':
        if (p.mode === 'cpt') {
          out.push({ id: 'dissipation', label: 'DISSIPATION TEST', enabled: drilling });
          out.push({ id: 'terminate', label: 'TERMINATE', enabled: !p.terminated });
        } else {
          out.push({ id: 'strike', label: 'RELEASE', enabled: S.phase === 'spt-drive' });
          out.push({ id: 'cleanOut', label: 'CLEAN OUT', enabled: drilling });
        }
        break;
      default: break;
    }
    return out;
  }

  function getTelemetry() {
    const rodLen = S.m.rodLength || 0;
    return {
      /* run */
      active: S.active, phase: S.phase, reason: S.stopReason,
      methodId: S.methodId, method: { id: S.methodId, name: S.m.name, kind: S.m.kind },
      // Null when the contract did not carry one — never guessed. See
      // resolveFlushMedium(); the same value is mirrored on state.drill.
      flushMedium: S.flushMedium,
      contractId: S.contract?.id ?? null, difficulty: S.difficulty,
      timeSec: S.timeSec, drillSec: S.drillSec, parSec: S.parSec,
      jobHours: S.downholeSec / 3600,

      /* depth */
      depth: S.depth, depthDisplay: D.depth, target: S.target,
      progress01: clamp(S.depth / Math.max(1e-3, S.target)),

      /* the gauges — raw sim value and smoothed display value */
      rop: S.rop, ropDisplay: D.rop, ropPotential: S.ropPotential,
      torque: S.torque, torqueDisplay: D.torque, torqueJitter: S.torqueJitter,
      torqueLimit: T.torque.overLimit, overtorque: S.torque > T.torque.overLimit,
      // On a blind-wear method the gauge shows the BOOK, not the truth: you
      // cannot see a tricone's teeth or its bearings until it is back on the
      // floor. `wearTrue` is here for settlement and for the results screen,
      // never for the live HUD.
      wear: S.m.blindWear ? S.wearBook : S.wear,
      wearDisplay: S.m.blindWear ? D.wearBook : D.wear,
      wearKnown: !S.m.blindWear,
      wearTrue: S.wear, wearBook: S.wearBook,
      heat: S.heat, heatDisplay: D.heat, glazed: S.heat > T.rop.glazeHeat,
      load: S.load, loadDisplay: D.load, returns: S.returns,
      stability: S.stability, stabilityDisplay: D.stability,

      /* inputs */
      wob: S.act.wob, rpm: S.act.rpm, flush: S.act.flush,
      wobCmd: S.cmd.wob, rpmCmd: S.cmd.rpm, flushCmd: S.cmd.flush,
      optimal: optimalNow(),

      /* groove */
      combo: S.combo, comboDisplay: D.combo, inGreenBand: S.inBand,
      greenBandTime: S.greenBandTime, grooveUptime01: clamp(S.grooveAccum / Math.max(1, S.drillSec)),
      sweetSpot: getSweetSpot(),

      /* string & tooling. TWO methods have NO DRILL STRING (DOMAIN.md §1a) and
         they are not the same thing as each other: a spudder's cadence counts
         BAILING RUNS, and a driven pile has no cadence at all. Nothing here may
         call a bailing run a rod — and nothing may call a pile either, which is
         what a two-valued caption on a three-valued fact was doing. `rodLen` is
         the arbiter: 0 means there is no repeating unit to name. */
      hasDrillString: S.m.hasDrillString !== false,
      rods: S.m.hasDrillString === false ? 0 : S.rods,
      bailingRuns: S.bailingRuns,
      rodLength: rodLen,
      rodLengthMeans: rodLen === 0 ? null
        : S.m.hasDrillString === false ? 'bailing-run cadence' : 'rod length',
      nextRodDepth: Number.isFinite(S.nextRodDepth) ? S.nextRodDepth : null,
      rodAdd: S.rodAdd ? { ...S.rodAdd, t: S.phaseT } : null,
      rodFatigue: S.rodFatigue,
      bit: { id: S.bit.id, name: S.bit.name, kind: S.bit.kind, carbide: S.bit.carbide,
             wear: S.wear, life01: clamp(1 - S.wear), fits: (S.m.bitKinds || []).includes(S.bit.kind) },
      bitsUsed: S.bitsUsed,

      /* casing */
      casingOn: S.casingOn, casingArmed: S.casingArmed, casedDepth: S.casedDepth,
      canCase: !!(S.m.casing || S.m.casingFollows),

      /* well control — present only on methods that model mud weight */
      well: S.m.wellControl ? {
        mudName: S.mud ? S.mud.name : 'Water-based mud',
        mudWeightSg: +S.mudWeight.toFixed(3),
        poreSg: +S.poreSg.toFixed(3),
        ecdSg: +S.ecd.toFixed(3),
        overbalanceSg: +S.overbalance.toFixed(3),
        columnLevel01: +S.mudLevel.toFixed(3),
        influx01: +S.influx.toFixed(3),
        shutIn: S.shutIn,
        flowing: !!activeKick(),
        killing: S.phase === 'well-control',
        kills: S.kills, kicksHandled: S.kicksHandled, kicksLate: S.kicksLate,
        wellControlEvents: S.wellControlEvents,
        lcmAboard: S.hasLcm, lcmUsed: S.lcmUsed,
        canShutIn: true,
      } : null,

      /* is the bit past its founder point right now? The point itself is never
         published — finding it is the skill the method is built around. */
      foundered: !!(S.ropTerms && S.ropTerms.founder < 0.995),
      twistOffs: S.twistOffs, fishing: S.fishing,

      /* jam */
      jam: {
        state: S.jamState, bind01: clamp(S.bind / T.jam.bindMax), raw: S.bind,
        stuckSec: S.stuckSec, loseSec: nz(S.m.jamLoseSec, T.jam.loseSec),
        warnSec: nz(S.m.jamWarnSec, T.jam.warnSec),
        rescue: {
          phase01: S.rescuePhase, window: T.jam.rescueWindow,
          goodNow: S.rescuePhase < T.jam.rescueWindow * 0.5 || S.rescuePhase > 1 - T.jam.rescueWindow * 0.5,
        },
      },
      kickReady: S.kickCooldown <= 0, kickCooldown: S.kickCooldown,

      /* ground & hazards */
      stratum: S.ground, stratumIndex: S.stratumIndex,
      warning: currentWarning(),
      hazards: S.hazards.filter((h) => h.phase !== 'done')
        .map((h) => ({ kind: h.kind, phase: h.phase, t: h.t, severity: h.severity, depth: h.depth })),
      flags: {
        lostCirculation: S.lostCirc > 0.5, waterInflow: S.waterInflow, waterFlowLpm: S.waterFlowLpm,
        overheat: S.heat > T.heat.overheatAt, collapsing: S.stability < T.stability.collapseAt,
        drag: S.drag,
      },

      /* ── THE GAUGE ────────────────────────────────────────────────────
         The needle the green band is measured against. It is the torque on
         every method that turns something; on a driven pile it is the SET in
         mm per blow, and on a CPT it is the PUSH RATE in mm/s. `axis`, `label`
         and `unit` tell the HUD which, and `real` carries the value in the
         gauge's own units so the caption can read "4.2 mm/blow", not "0.37". */
      gauge: {
        axis: (currentGauge() && currentGauge().axis) || 'torque',
        label: (currentGauge() && currentGauge().label) || 'TORQUE',
        unit: (currentGauge() && currentGauge().unit) || '',
        value: S.gauge, display: D.gauge, band: getSweetSpot(),
        real: gaugeRealValue(),
        max: (currentGauge() && currentGauge().max) || T.torque.displayMax,
      },

      /* ── WHICH PASS IS RUNNING ─────────────────────────────────────────
         Raise boring is a pilot down and a reamer up; HDD is a pilot bore and
         a pullback home. The sim PUSHES this into world/geology.js through
         setStage() the moment it changes, and publishes it here and on
         state.drill for anything that would rather read than be told. A
         single-pass method sits at stage 0 with stageCount 1 all run. */
      stage: S.stage,
      stageId: (activeStage() && activeStage().id) || 'bore',
      stageName: (activeStage() && activeStage().name) || 'Bore',
      stageCount: S.stageCount,
      stageProgress: S.stageProgress,
      stageReverse: onReversePass(),
      actionDepth: actionDepth(),
      progress01Overall: S.stageCount > 1
        ? clamp((S.stage + clamp(S.stageProgress / Math.max(1e-3, S.target))) / S.stageCount)
        : clamp(S.depth / Math.max(1e-3, S.target)),

      /* ── the three depths ───────────────────────────────────────────── */
      holeDepth: S.holeDepth, stringDepth: S.stringDepth,

      /* ── the method's own programme ─────────────────────────────────── */
      programme: programmeTelemetry(),

      /* the timed beat that is running right now, if any */
      beat: S.beat ? { ...S.beat, phase: S.phase, t: S.phaseT, dur: S.phaseDur } : null,

      /* the discrete actions this method offers, and whether they are live */
      actions: availableActions(),

      /* percussion / fx */
      blowHz: nz(S.blowHz, 0), impactIntensity: impactIntensity(),

      /* live score */
      deviation: S.deviation, straightness01: clamp(1 - S.deviation / T.straight.maxDev),
      safetyEvents: S.safetyEvents, jamIncidents: S.jamIncidents,
      hazardsSeen: S.hazardsSeen, hazardsClean: S.hazardsClean,
      score: scoreBreakdown(),
    };
  }

  /** Upcoming strata for the drill log — with confidence, because it is a log. */
  function getForecast(range = 20) {
    const list = strataList();
    if (!list.length) return [];
    const out = [];
    const seismic = 12 + 8 * skillRank('feedControl');
    for (const s of list) {
      const bottom = nz(s.bottom, 0);
      if (bottom <= S.depth) continue;
      const top = nz(s.top, 0);
      const dist = Math.max(0, top - S.depth);
      if (dist > range) break;
      const g = {
        id: s.id, name: s.name || GROUND[s.id]?.name || 'Ground',
        ucs: nz(s.ucs, GROUND[s.id]?.ucs ?? 20),
        abrasivity: nz(s.abrasivity, GROUND[s.id]?.abrasivity ?? 0.5),
        stability: nz(s.stability, GROUND[s.id]?.stability ?? 0.7),
        water: nz(s.water, GROUND[s.id]?.water ?? 0.3),
      };
      const inp = optimalInputs(S.m, g, top, S.bit);
      const r = ropModel(S.m, S.bit, g, inp, {
        depth: top, load: T.groove.targetLoad, wear: S.wear, heat: T.score.par.heat,
        returns: 1, stability: g.stability, combo: 1, casing: S.casingOn, torque01: T.score.par.torque,
      });
      out.push({
        ...g, top, bottom, thickness: bottom - top, distance: dist,
        current: dist <= 0.001 && bottom > S.depth,
        confidence: clamp(1 - dist / seismic, 0.2, 1),
        expectedRopMh: +r.rop.toFixed(1),
        optimal: inp,
        hint: groundHint(g),
      });
      if (out.length >= 6) break;
    }
    return out;
  }

  function groundHint(g) {
    if (g.ucs <= T.rock.voidUcs) return 'Void — cut feed on entry';
    if (g.stability < 0.25) return 'Unstable — case it or ease off';
    if (g.water > 0.7) return 'Water bearing — more flush';
    if (g.abrasivity > 0.8) return 'Abrasive — watch the crown';
    if (g.ucs > 150) return 'Hard rock — steady feed, full percussion';
    if (g.ucs < 1) return 'Soft — do not over-flush';
    return 'Steady';
  }

  /* ═════════════════════════════════════════════════════════════════════
     LIFECYCLE
     ═════════════════════════════════════════════════════════════════════ */
  function init() {
    // World events. Geology owns these when it is present; anything it fires
    // wins, and we stop self-generating that kind for the rest of the run.
    subs.push(bus.on(EV.STRATUM_ENTER, (p) => {
      if (!p || p.__sim) return;
      S.externalGeology.stratum = true;
      S.bandJumpT = T.groove.stratumJumpFlashSec;
    }));
    subs.push(bus.on(EV.BOULDER, (p) => {
      if (!p || p.__sim || !S.active) return;
      S.externalGeology.boulder = true;
      queueHazard('boulder', { depth: nz(p.depth, S.depth), hardness: nz(p.hardness, 0.6),
                               size: p.size, severity: clamp(nz(p.hardness, 0.6)) });
    }));
    subs.push(bus.on(EV.CAVITY, (p) => {
      if (!p || p.__sim || !S.active) return;
      S.externalGeology.cavity = true;
      queueHazard('cavity', { depth: nz(p.depth, S.depth), height: nz(p.height, 1),
                              severity: clamp(nz(p.height, 1) / 3) });
    }));
    subs.push(bus.on(EV.WATER_STRIKE, (p) => {
      if (!p || p.__sim || !S.active) return;
      S.externalGeology.water = true;
      queueHazard('water', { depth: nz(p.depth, S.depth), flowLpm: nz(p.flowLpm, 120),
                             severity: clamp(nz(p.flowLpm, 120) / 300) });
    }));
    // A new loadout between holes should be picked up at the next start.
    subs.push(bus.on(EV.EQUIP, (p) => {
      if (!S.active && p?.slot === 'bit') { S.bit = bitOf(p.itemId, S.m); }
    }));
  }

  function resize(w, h, dpr) { viewport = { w, h, dpr }; }

  function dispose() {
    for (const off of subs) { try { off?.(); } catch { /* ignore */ } }
    subs.length = 0;
    if (S.tripResolve) { S.tripResolve({ ok: false, reason: 'disposed' }); S.tripResolve = null; }
    S.active = false;
    S.phase = 'idle';
  }

  /* ═════════════════════════════════════════════════════════════════════
     DEBUG — used by the QA harness and the tuning script.
     ═════════════════════════════════════════════════════════════════════ */
  const debug = {
    godMode: false,

    /** Pin the ground under the bit to a GROUND id (null to release). */
    forceStratum(id) {
      if (!id) { forcedGround = null; return null; }
      const g = GROUND[id];
      if (!g) return null;
      forcedGround = { id, name: g.name, ucs: g.ucs, abrasivity: g.abrasivity,
                       stability: g.stability, water: g.water, index: S.stratumIndex,
                       top: 0, bottom: 1e6, boulder: null, cavity: null, fracture: null };
      S.ground = forcedGround;
      S.groundId = id;
      updateBand(0, true);
      return forcedGround;
    },

    /** Teleport the bit — the hole above is treated as already drilled. */
    setDepth(m) {
      const d = clamp(nz(m, 0), 0, S.target || 1e6);
      S.depth = d;
      D.depth = d;
      const rodLen = S.m.rodLength || 0;
      S.nextRodDepth = rodLen > 0 ? (Math.floor(d / rodLen) + 1) * rodLen : Infinity;
      S.rods = rodLen > 0 ? Math.max(1, Math.floor(d / rodLen) + 1) : 1;
      S.ground = sampleGround(d);
      S.groundId = S.ground.id;
      S.stratumIndex = S.ground.index;
      updateBand(0, true);
      writeState();
      return d;
    },

    /** Fire a hazard on demand. */
    triggerHazard(kind, data) { return queueHazard(kind, { depth: S.depth, severity: 0.7, ...data }); },

    /** Drive the sim headlessly: n fixed steps. */
    stepFixed(n = 1) { for (let i = 0; i < n; i++) { if (!S.active && S.phase !== 'stuck') break; step(H); } return getTelemetry(); },

    /** Run the sim with a fixed input policy for `sec` player seconds. */
    simulate(sec, policy) {
      const steps = Math.round(sec / H);
      for (let i = 0; i < steps; i++) {
        if (!S.active && S.phase !== 'stuck') break;
        if (typeof policy === 'function') {
          const p = policy(getTelemetry(), i * H);
          if (p) { if (p.feed != null) setInput('feed', p.feed);
                   if (p.rotation != null) setInput('rotation', p.rotation);
                   if (p.flush != null) setInput('flush', p.flush); }
        }
        step(H);
      }
      return getTelemetry();
    },

    /** Raw internals — read only, for the tuning harness. */
    get state() { return S; },
    get display() { return D; },
    tuning: TUNING,
    models: { ropModel, torqueModel, optimalInputs, methodOf, bitOf, hardnessOf, synthProfile },
  };

  /* ═════════════════════════════════════════════════════════════════════ */
  return {
    init, update, resize, dispose,
    startHole, abortHole,
    setInput, pulse, changeBit, setCasing,
    getTelemetry, getSweetSpot, getForecast,
    debug,
    get methodId() { return S.methodId; },
    get active() { return S.active; },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   One-line operator hints — short enough for a gauge caption.
   ═══════════════════════════════════════════════════════════════════════════ */
const HINTS = {
  boulder: 'BOULDER — EASE FEED, FULL PERCUSSION',
  cavity: 'VOID — CUT THE FEED',
  water: 'WATER — LIFT IT OR CASE IT',
  collapse: 'HOLE CLOSING — CASE IT OR SLOW DOWN',
  binding: 'STRING BINDING — FLUSH AND EASE OFF',
  stuck: 'STUCK — WORK THE STRING ON THE BEAT',
  'lost-circulation': 'NO RETURNS — DROP THE FEED',
  'hole-cleaning': 'HOLE PACKING OFF — MORE FLUSH',
  overheat: 'BIT OVERHEATING — MORE FLUSH, LESS RPM',
  overtorque: 'OVERTORQUE — BACK OFF THE FEED',
  'bit-worn': 'CROWN WORN — CONSIDER A TRIP',
  'bit-critical': 'CROWN CRITICAL — CHANGE IT NOW',
  'rod-fatigue': 'ROD FATIGUE — BACK OFF NOW',
  'method-limit': 'GROUND TOO HARD FOR THIS METHOD — ABANDON THE HOLE',
  // Mud rotary. Each of these has one correct answer and it is not the feed lever.
  kick: 'PIT GAIN — SHUT THE WELL IN',
  'well-control': 'SHUT IN — CIRCULATING OUT AND WEIGHTING UP',
  'lost-zone': 'LOSING RETURNS — CUT THE PUMPS, SPOT A PILL',
  'pit-loss': 'PIT LEVEL DOWN — THE COLUMN IS GOING SOMEWHERE',
  'diff-stick': 'DIFFERENTIAL STICKING — KEEP IT TURNING, WEIGHT OFF',
  'twist-off': 'STRING OSCILLATING — WEIGHT AND ROTATION OFF NOW',
  // Reverse circulation. Not one of these is about the hole.
  'wet-sample': 'SAMPLE GOING WET — MORE AIR, HOLD THE FACE',
  'carry-over': 'CARRY-OVER IN THE TUBE — BLOW THE STRING DOWN',
  'cyclone-choke': 'SAMPLE TRAIN CHOKING — EASE FEED, FULL AIR',
  // Tunnel jumbo. The round is decided before it is fired.
  'collar-slip': 'COLLARING — EASE FEED, FULL PERCUSSION',
  'cut-choke': 'CUT CLOSING — EASE FEED OR THE ROUND FREEZES',
  'bad-ground': 'BAD GROUND — SHORTEN THE ROUND',
  // Longhole. Two hazards, two opposite answers on the same control.
  'hole-blocked': 'DOWNHOLE PACKING — MORE FLUSH, WEIGHT OFF',
  'uphole-flush': 'UPHOLE FLOODING — CUT THE FLUSH, HOLD FEED',
  'rod-whip': 'STRING WHIPPING — EASE FEED, HOLD PERCUSSION',
  // Ground support.
  'gel-clock': 'RESIN GELLING — STOP THE ROTATION NOW',
  'bolt-hole-collapse': 'BOLT HOLE CLOSING — REAM IT AND BOLT IT',
  'loose-plate': 'PLATE LOOSE — TENSION IT',
  // Driven piling.
  obstruction: 'OBSTRUCTION — CUT THE ENERGY, TRIM THE LINE',
  'head-damage': 'PILE HEAD SPALLING — CHANGE THE DOLLY',
  'premature-refusal': 'BLOW COUNT CLIMBING — TAKE A SET, READ THE TOE',
  // Site investigation.
  'rod-bounce': 'HAMMER NOT IN FREE FALL — RELEASE CLEANLY',
  'fall-in': 'FALL-IN AT THE BASE — CLEAN OUT BEFORE THE DRIVE',
  precarious: 'CONE RESISTANCE SPIKING — SLOW THE PUSH',
  'thrust-limit': 'THRUST CAPACITY — TERMINATE THE SOUNDING',
  'cone-desaturation': 'u2 LOSING SATURATION — EASE THROUGH, THEN DISSIPATE',
  'push-stalled': 'NO PUSH — THE CONE ONLY GOES DOWN IF YOU PUSH IT',
  'pull-stall': 'HEAD STALLING — EASE THE PULL, KEEP THE HOLE OPEN',
  // Jet grouting. One object, two opposite failures, two different levers.
  'return-lost': 'NO SPOIL AT THE COLLAR — CUT THE JET PRESSURE',
  'ground-heave': 'GROUND LIFTING — WITHDRAW FASTER NOW',
};

export default createDrillSim;
