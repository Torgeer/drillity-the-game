/**
 * HAPTIC SIGNATURES — a vocabulary, not a volume knob.
 * ─────────────────────────────────────────────────────────────────────────────
 * This game is played one-handed, on a phone, standing up, by somebody whose
 * other hand is on something else, and often with the screen glanced at rather
 * than watched. Haptics are a primary channel here, not decoration.
 *
 * Until now every event in the game arrived as one of `light` / `medium` /
 * `heavy` / `snap` / `detent` / `impact` — six names, but FIVE OF THEM WERE A
 * SINGLE PULSE of 6, 8, 10, 22 or 30 ms. On a phone actuator those are not six
 * signals. They are "a tick" and "a bump", and they tell the player HOW MUCH
 * happened, never WHAT happened. A driller working by feel knows a rod change
 * from a jam from a breakthrough without looking. That is the literacy this
 * file exists to build.
 *
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHAT THE PLATFORM ACTUALLY GIVES US — checked against the spec, not assumed
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The Vibration API takes a pattern that is A LIST OF MILLISECONDS and nothing
 * else. W3C Vibration API, Candidate Recommendation Draft 2026-05-21, §3
 * <https://www.w3.org/TR/vibration/>:
 *
 *     "If the index of time is even (the first entry has index 0), vibrate the
 *      device for time milliseconds." / "Otherwise wait for time milliseconds."
 *
 * There is **no amplitude, intensity, sharpness or waveform parameter anywhere
 * in the API.** The IDL is `typedef (unsigned long or sequence<unsigned long>)
 * VibratePattern;` and that is the entire surface. §1 excludes it on purpose —
 * *"Use cases requiring more fine-grained control are out of scope for this
 * specification"* — and it has stayed out: strength control was formally
 * proposed as W3C DAP-ISSUE-146 in **August 2013** and the 2026 draft still
 * does not contain the word. Android's native `VibrationEffect` has amplitude;
 * the web does not expose it, and there is no live successor proposal. So:
 *
 *     ►  A SIGNATURE HERE IS RHYTHM AND LENGTH. IT CAN NEVER BE FORCE.
 *
 * Four more normative facts from the same spec that shape everything below:
 *
 *  - **Ten entries, maximum.** *"Let max length have the value 10."* A longer
 *    pattern is silently TRUNCATED, not rejected. No shape here exceeds seven,
 *    and `tools/checkhaptics.mjs` fails the build if one ever does.
 *  - **A trailing pause is discarded**, so every pattern here ends on a pulse.
 *  - **Sticky user activation is required**, and **the document must be
 *    visible** — both are `return false` in the algorithm. Neither throws.
 *  - **The UA may rate-limit us**: *"The user agent SHOULD employ global rate
 *    limiting"*. Which is a second reason to spend the motor carefully rather
 *    than a reason to hope.
 *
 * A pattern also **replaces** whatever is playing rather than queueing behind
 * it (the algorithm aborts the running instance first). That is what makes the
 * pre-emption rules below cheap: a hazard signature simply overwrites an info
 * signature mid-flight.
 *
 * ── WHO FEELS ANY OF THIS ────────────────────────────────────────────────────
 *
 * From MDN's browser-compat-data for `api.Navigator.vibrate`:
 *
 *  - **iOS Safari: `false`. Never supported, in any version.** Every iOS
 *    browser is WebKit, so that is the whole platform, and WebKit's standards
 *    position on the API is formally `oppose` (WebKit/standards-positions#267,
 *    labelled *annoyance*, *power*, *portability*). It is not coming.
 *  - Chrome Android 32+, Edge, Opera Android 19+, Samsung: supported.
 *  - **Firefox Android: returns `true` and does not vibrate.** BCD, verbatim:
 *    *"Vibration is disabled. If the window is visible, then
 *    `navigator.vibrate()` returns `true`, but no vibration takes place."*
 *    Firefox desktop **removed** it at 129.
 *
 *     ►  A LARGE SHARE OF THIS AUDIENCE FEELS NOTHING, AND `canVibrate` BEING
 *        TRUE DOES NOT MEAN THEY DO.
 *
 * So haptics may never be the sole carrier of a fact. Every signature below has
 * a one-shot in `audio.js` and a change in the section band beside it. This is
 * a THIRD channel that makes the other two cheaper to read, not a replacement
 * for either.
 *
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE VOCABULARY — six shapes, and why each one suits its event
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A player can learn about six things by feel. So there are six SHAPES, and
 * two of them carry a DIRECTION rather than being two separate shapes to learn:
 *
 *   1. STUTTER  ·-·-·—     tick tick tick THUNK
 *      "the string changed length"        rod added, casing set, trip, bailer
 *
 *      Three stutters closing into one firm stop is literally what making up a
 *      threaded joint feels like in the hand: an R32 thread does not glide into
 *      engagement, it stutters, and then it torques solid and stops dead. It is
 *      also beat-for-beat what `SHOTS.rod_add` already plays — clamp, spin-up,
 *      three stuttering taps, and a snug that is CUT off in 8 ms — so the hand
 *      and the ear describe the same mechanical event rather than two events
 *      that happen to coincide.
 *
 *   2. GRIND    ——-—--———  long, uneven, ending on its longest pulse
 *      "it is stuck"                      jam, bind, choke, blocked hole
 *
 *      The only pattern that is both LONG and IRREGULAR, and the only one that
 *      does not resolve — it ends on its heaviest pulse because the bind has
 *      not let go. Stick-slip is metal grabbing and releasing several times a
 *      second (`SHOTS.jam_bind` models it as a 7 Hz square gate on brown
 *      noise); uneven pulses are the honest tactile version of the same thing.
 *      At 440 ms it is nearly twice the span of anything else here.
 *
 *   3. VOID     —      ·   grab · a hole · a small catch
 *      "the ground went away"             cavity, breakthrough, lost returns
 *
 *      THE GAP IS THE MESSAGE. This is the one event whose physical content is
 *      an ABSENCE — resistance vanishes and the string drops — and on a
 *      duration-only API absence is the single thing that can be rendered
 *      unmistakably. The silence in the middle is the longest in the vocabulary
 *      by more than 2x, so the player feels the floor disappear and then the
 *      bit catch. Its length scales with the void's own published height, so a
 *      1 m cavity and a 6 m one do not feel the same.
 *
 *      `SHOTS.cavity` reaches for exactly the same device in the other channel
 *      — its comment calls its 350 ms of silence "the most important 350 ms in
 *      the game's sound design". Two channels, one argument.
 *
 *   4. TWIN     —  —       two identical pulses, evenly spaced
 *      "you changed the tool"             bit change, equip, dolly, power
 *
 *      The only SYMMETRICAL pattern in the set. Symmetry reads as deliberate,
 *      and this is the only one of the six that the player DID ON PURPOSE:
 *      break out, make up — two halves of one action, off and on. Nothing that
 *      happens TO the player is symmetrical, and that is the whole
 *      discriminator.
 *
 *   5. RAMP     a direction, not a shape — the two ways a hole ends
 *      RAMP-DOWN  —-—-·-·  four pulses, each shorter than the last
 *      "it stopped before you were done"  premature refusal, bit broken,
 *                                         collapse, twist-off, obstruction
 *      RAMP-UP    ·-·-—-—  the exact reverse
 *      "it finished"                      hole complete, jam cleared, resin set
 *
 *      A refusal IS rebound: the energy comes back at you and dies away. A
 *      finish builds and lands. These are deliberately mirror images because
 *      they are the two ways every hole ends, and confusing them is the worst
 *      failure this vocabulary could have — so they are made the SAME shape
 *      read in opposite directions, which is easier to learn than two unrelated
 *      patterns and impossible to confuse once learned. Whatever else a player
 *      never picks up, they will pick up *lengthening = it landed, shortening =
 *      it stopped*, because they feel one at the end of every hole they finish
 *      and the other at the end of every hole they do not.
 *
 *   6. STEP     a direction, not a shape — the ground changed under you
 *      STEP-UP    ·-—      small then big
 *      "harder ground"                    stratum enter, UCS rising
 *      STEP-DOWN  —-·      big then small
 *      "softer ground"                    stratum enter, UCS falling
 *
 *      Information rather than an incident, and it fires more often than
 *      anything except a rod — so it is the shortest shape in the set and the
 *      first to decay. It is also the only one that teaches itself: the section
 *      band changes colour on the same frame, so the player is told what it
 *      means the first time without a tutorial line. Its decayed form is a
 *      SINGLE pulse whose length still carries the direction, which is why the
 *      step survives decay when nothing else does.
 *
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY THESE SHAPES SURVIVE HARDWARE WE CANNOT MEASURE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The hand is not the bottleneck. Vibrotactile two-pulse gap detection
 * threshold is **5.0 ms** (SE 0.37) — Villalonga & Sekuler, *Attention,
 * Perception & Psychophysics* (2023), DOI 10.3758/s13414-023-02736-y,
 * Experiment 2, 2AFC at 76 % correct, 50 ms pulses at 250 Hz on the index
 * finger. The same study puts the visual threshold at 15.5 ms, which is a
 * three-fold argument for using this channel at all.
 *
 * The ACTUATOR is the bottleneck, and by a wide margin. Precision Microdrives'
 * own datasheets, at rated voltage on their inertial test load, no overdrive:
 *
 *   | | ERM 310-103 (10 mm coin) | LRA C10-100 (10 mm, 175 Hz) |
 *   |---|---|---|
 *   | lag time (to 0.08 G)        | **40 ms** | **11 ms** |
 *   | rise time (to 50 % ampl.)   | **87 ms** | **37 ms** |
 *   | stop time (unbraked)        | 115 ms    | 177 ms    |
 *
 * Rise time there is to FIFTY per cent, not ninety — Precision Microdrives
 * AB-029 defines it that way — so time to full output is materially longer
 * than the table says. Handset actuators are not these parts and phone haptic
 * drivers use active braking, so the real numbers are better; but the DIRECTION
 * is unambiguous, and it condemns the table this file replaces:
 *
 *     ►  THE OLD COMMENT CLAIMED "~15 ms TO SPIN UP" AND SHIPPED 6, 8 AND
 *        10 ms PULSES. THE ONLY MANUFACTURER FIGURES AVAILABLE PUT THE LAG
 *        ALONE AT 11 ms (LRA) TO 40 ms (ERM). MOST OF THAT OLD TABLE WAS
 *        COMMANDING MOVEMENT THAT NEVER REACHED THE HAND.
 *
 * Hence the floor below is 20 ms, not 6. And hence the real design argument:
 *
 *     ►  THE DISCRIMINATOR IS PULSE **COUNT** AND THE **ORDER** OF PULSE
 *        LENGTHS — NOT ANY ABSOLUTE DURATION.
 *
 * That is what makes the vocabulary robust to hardware nobody here can
 * measure. Put a lagging ERM under STUTTER and it renders faint-faint-faint-
 * BUMP: still three-then-one. Put it under RAMP-DOWN and it renders BUMP-bump-
 * faint-nothing: still a decay. Lag compresses the short end of an ordered
 * series but it cannot REVERSE the order, so every shape degrades toward a
 * cruder version of itself rather than into a different shape. A design that
 * leaned on 6 ms versus 8 ms would have no such property, which is precisely
 * why the old one could not work.
 *
 * The exact braked stop time of a phone actuator is **NOT SOURCED**, so the
 * gaps below are set as long as the spans can afford rather than as short as
 * theory allows, and no shape depends on a short gap being resolvable.
 *
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * FREQUENCY IS PART OF THE DESIGN — the part that decides whether this is
 * loved or switched off in Settings on the second hole
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A 300 m hole on 3 m rods is ONE HUNDRED rod additions. A hundred identical
 * buzzes is not a signature; it is a nuisance with a pattern attached, and the
 * player will disable haptics globally — taking the six signatures that DO
 * matter down with it.
 *
 *     ►  REPETITION IS THE ENEMY OF A SIGNATURE. NOVELTY IS WHAT IT ENCODES.
 *
 * So every shape decays against its own repetition, per hole:
 *
 *     occurrence 1..full      the whole signature
 *     the next `head` times   the HEAD only — enough to identify the shape,
 *                             not enough to be an event
 *     after that              a single tick, subject to the class refractory
 *
 * and the counter RESETS when the event's qualifier changes — a different rod
 * kind, a worse jam, harder after a run of softer. So **the full signature
 * comes back exactly when it carries information again**, which is the whole
 * trick. Rare shapes barely decay: a void is not repetitive and a hole ends
 * once.
 *
 * MEASURED, in `tools/checkhaptics.mjs`, over a simulated 300 m hole — 100 rod
 * additions, same rod kind, one every 24 s:
 *
 *     one full signature every time   13 000 ms of motor time
 *     with the novelty decay           2 300 ms   — 5.7x less
 *     full / head / tick                   2 / 4 / 94
 *
 * and the gate asserts all three: that the saving is at least half, that the
 * FIRST additions are still full signatures, and that changing the qualifier
 * brings the full signature back. On top of the decay sits
 * a rolling motor-time budget as a hard backstop, so no combination of events
 * the sim can produce leaves the motor running continuously, and classes
 * pre-empt: a hazard overwrites an info signature still in flight, and an info
 * signature is dropped rather than queued while a hazard is playing.
 *
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY THIS IS ITS OWN FILE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * It is PURE. No DOM, no AudioContext, no imports, an injected clock and an
 * injected `vibrate`. That is what lets `tools/checkhaptics.mjs` assert the
 * event → pattern mapping in plain node, which is the only way this channel can
 * be verified at all: a vibration cannot be photographed, and the `--headed`
 * Chrome the capture harness drives has no motor to observe.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   1. TIMING CONSTANTS
   ───────────────────────────────────────────────────────────────────────────
   The FLOOR is sourced (see the actuator table in the header): 20 ms clears an
   LRA's 11 ms lag and is deliberately marginal on an ERM's 40 ms, because on
   an ERM "marginal" is still the short end of an ordered series and the order
   is what carries the meaning.

   The three levels and the three gaps are DESIGN CHOICES and are NOT SOURCED
   as perceptual thresholds — no first-hand measurement of this game on real
   handsets exists, and a plausible invented citation would be worse than an
   admitted gap. What they are defensible on is separation: each level is
   roughly double the one below, so no plausible actuator response collapses
   two of them together.
   ═══════════════════════════════════════════════════════════════════════════ */

/** The shortest pulse we will ever ask for. Below this the command does not
 *  reliably reach the hand on either actuator type. */
export const TICK = 20;
/** A definite, single bump — past an LRA's 37 ms rise to half amplitude. */
export const PULSE = 40;
/** A long pulse with weight to it. Above ~110 ms it starts to read as a phone
 *  notification rather than as something that happened in the ground. */
export const PRESS = 70;

/** Pauses. TIGHT binds pulses into one gesture; OPEN separates them into
 *  distinct beats; VOID is long enough to be felt as an absence in its own
 *  right and is used in exactly one shape, for exactly that reason. Set long
 *  rather than short because the braked stop time of a phone actuator is NOT
 *  SOURCED and a gap shorter than it simply does not exist. */
export const GAP_TIGHT = 45;
export const GAP_OPEN = 90;
export const GAP_VOID = 180;

/** Hard ceiling on any one pattern's wall-clock span, ms. A signature that
 *  outlasts the player's attention is a notification, not a cue. */
export const MAX_SPAN = 500;

/** Spec ceiling: W3C Vibration API §3, "Let max length have the value 10."
 *  A longer pattern is silently truncated, so exceeding this is a bug that
 *  produces a WRONG signature rather than an error. The gate enforces it. */
export const MAX_ENTRIES = 10;

/* ═══════════════════════════════════════════════════════════════════════════
   2. CLASSES — what may interrupt what
   ═══════════════════════════════════════════════════════════════════════════ */

/** Higher pre-empts lower. Equal or lower is dropped while one is in flight. */
export const CLS = {
  texture: 0,   // the drilling beat itself; continuous, heavily rate-limited
  info: 1,      // something changed that you may want to know
  event: 2,     // something happened that you did
  hazard: 3,    // something happened that you did not want
};

/** Minimum seconds between two signatures of the same class. A hazard may
 *  arrive sooner than an info cue because it matters more and is rarer;
 *  texture keeps the historical 4/s cap of the drilling beat. */
export const REFRACTORY = {
  texture: 0.25,
  info: 0.50,
  event: 0.30,
  hazard: 0.35,
};

/* ═══════════════════════════════════════════════════════════════════════════
   3. THE SHAPES
   ───────────────────────────────────────────────────────────────────────────
   `full` / `head` are the novelty budget: how many times per hole this shape
   plays in full, and then how many times as its head, before it collapses to a
   single tick. They differ per shape because the right answer is entirely a
   question of how often the shape actually fires:

     STUTTER  up to 100 times in a deep hole      -> decays hard
     STEP     once per bed, tens of times         -> decays hard, and its head
                                                     still carries the direction
     TWIN     player-initiated, a handful of times-> mild decay
     GRIND    a bad hole has many binds           -> mild decay
     VOID     rare, and the highest-value cue     -> never below its head
     RAMP     a hole ends once                    -> never decays

   `pair` marks the two DIRECTIONAL shapes. rampUp/rampDown and stepUp/stepDown
   are each ONE thing to learn read in two directions, not two things — so
   tools/checkhaptics.mjs compares the six shapes against each other and, within
   a pair, asserts the opposite instead. Without that declaration the gate would
   correctly report the pairs as collisions, because a mirror pair differs on
   exactly one feature by construction, and "fixing" that would destroy the most
   learnable distinction in the vocabulary.
   ═══════════════════════════════════════════════════════════════════════════ */

export const SHAPES = {
  /* ── 1. STUTTER — the string changed length ──────────────────────────── */
  stutter: {
    cls: 'event', full: 2, head: 4,
    pattern: [TICK, GAP_TIGHT, TICK, GAP_TIGHT, TICK, GAP_OPEN, PRESS],
    why: 'three stutters closing into one firm stop — a thread engaging, then torqued solid',
  },

  /* ── 2. GRIND — it is stuck ──────────────────────────────────────────── */
  grind: {
    cls: 'hazard', full: 3, head: 4,
    // Uneven ON PURPOSE, and it ENDS on its longest pulse: the bind has not let
    // go. The four pulses run 70/50/85/110 — no two alike, and not monotonic,
    // so it can never be misread as a RAMP.
    pattern: [PRESS, GAP_TIGHT, 50, 40, 85, 40, 110],
    why: 'long, uneven and unresolved — stick-slip, and it has not let go',
  },

  /* ── 3. VOID — the ground went away ──────────────────────────────────── */
  void_: {
    cls: 'hazard', full: 6, head: Infinity,
    // The catch is TWO ticks, not one, and that is not decoration — it is what
    // separates this from stepDown. As [PRESS, GAP_VOID, TICK] the void was
    // structurally identical to "the ground got softer" ([PRESS, GAP_TIGHT,
    // TICK]) and differed only in the length of one gap, which would have made
    // the most important hazard cue in the game a judgement about an absolute
    // duration. Three pulses against two settles it on a feature no actuator
    // can blur. It is also the truer thing: a bit dropping into a void does not
    // land once and stop, it catches and settles.
    pattern: [PRESS, GAP_VOID, TICK, GAP_TIGHT, TICK],
    why: 'the gap is the message — grab, nothing, then a scrabbling catch',
  },

  /* ── 4. TWIN — you changed the tool ──────────────────────────────────── */
  twin: {
    cls: 'event', full: 3, head: 3,
    pattern: [PULSE, GAP_OPEN, PULSE],
    why: 'the only symmetrical pattern — two halves of one deliberate action',
  },

  /* ── 5. RAMP — the two ways a hole ends ──────────────────────────────── */
  rampDown: {
    cls: 'hazard', full: Infinity, head: Infinity, pair: 'ramp',
    pattern: [95, GAP_TIGHT, PRESS, GAP_TIGHT, PULSE, GAP_TIGHT, TICK],
    why: 'a bounce settling — refusal is rebound, and it dies away',
  },
  rampUp: {
    cls: 'event', full: Infinity, head: Infinity, pair: 'ramp',
    // The EXACT reverse of rampDown. That is the point. Do not "improve" one
    // without reversing the other, or the pair stops being a pair and the most
    // important distinction in the vocabulary quietly stops working.
    pattern: [TICK, GAP_TIGHT, PULSE, GAP_TIGHT, PRESS, GAP_TIGHT, 95],
    why: 'the exact reverse of a refusal — it builds, and it lands',
  },

  /* ── 6. STEP — the ground changed under you ──────────────────────────── */
  stepUp: {
    cls: 'info', full: 3, head: 6, pair: 'step',
    pattern: [TICK, GAP_TIGHT, PRESS],
    why: 'small then big — the ground got harder',
  },
  stepDown: {
    cls: 'info', full: 3, head: 6, pair: 'step',
    pattern: [PRESS, GAP_TIGHT, TICK],
    why: 'big then small — the ground got softer',
  },

  /* ── the floor ───────────────────────────────────────────────────────── */
  tick: {
    cls: 'info', full: Infinity, head: Infinity,
    pattern: [TICK],
    why: 'the decayed form of everything, and the UI detent',
  },
  beat: {
    cls: 'texture', full: Infinity, head: Infinity,
    pattern: [8],
    why: 'the drilling beat itself — texture, not a signature',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   4. EVENT → SHAPE
   ───────────────────────────────────────────────────────────────────────────
   Keyed by the AUDIO-SIDE event class rather than by the bus event name, so
   the sim and the shell can both reach the same signature by describing what
   happened. Hazard-kind strings are spelled exactly as `src/sim/drilling.js`
   spells them, so the day that file forwards `h.kind` alongside its pattern
   (see the note on LEGACY below) the mapping already exists and nothing here
   has to change.
   ═══════════════════════════════════════════════════════════════════════════ */

export const EVENT_SHAPE = {
  /* the string changed length */
  'rod-added':          'stutter',
  'casing-set':         'stutter',
  'trip':               'stutter',
  'bailer-run':         'stutter',

  /* it is stuck */
  'jam':                'grind',
  'diff-stick':         'grind',
  'hole-blocked':       'grind',
  'bolt-hole-collapse': 'grind',
  'cyclone-choke':      'grind',
  'cut-choke':          'grind',
  'thrust-limit':       'grind',

  /* the ground went away */
  'cavity':             'void_',
  'lost-zone':          'void_',
  'return-lost':        'void_',
  'fall-in':            'void_',

  /* you changed the tool */
  'bit-change':         'twin',
  'equip':              'twin',
  'dolly-change':       'twin',
  'power-transfer':     'twin',

  /* it stopped before you were done */
  'premature-refusal':  'rampDown',
  'bit-broken':         'rampDown',
  'collapse':           'rampDown',
  'twist-off':          'rampDown',
  'obstruction':        'rampDown',
  'rod-whip':           'rampDown',
  'kick':               'rampDown',
  'misfire':            'rampDown',
  'ground-heave':       'rampDown',
  'precarious':         'rampDown',
  // The resin is gelling: rotation must stop. Share the established stop
  // signature, not the completion cue reserved for a successfully set bolt.
  'gel-clock':          'rampDown',

  /* it finished */
  'hole-complete':      'rampUp',
  'jam-cleared':        'rampUp',
  'resin-set':          'rampUp',
  'level-up':           'rampUp',
  'cert':               'rampUp',

  /* the ground changed — variant chosen in shapeFor() */
  'stratum':            'stepUp',

  /* a boulder is an obstacle you drill THROUGH, not a hole that ended */
  'boulder':            'twin',

  /* everything with no signature of its own */
  'ui':                 'tick',
  'beat':               'beat',
};

/**
 * LEGACY INTENSITY NAMES.
 *
 * `light` / `medium` / `heavy` / `success` / `fail` / `snap` / `detent` /
 * `impact` / `blow` are what the rest of the codebase passes today, and
 * `EVENTS.HAPTIC` in `core/contract.js` documents five of them as the contract.
 * Every one keeps working, so nothing regresses on the day this lands and
 * callers can migrate one at a time.
 *
 * The mapping is a DEMOTION, not a translation. An intensity name cannot say
 * what happened, so it gets the shape least likely to LIE about what happened:
 *
 *   `heavy` → tick, NOT grind. `src/sim/drilling.js` fires `haptic('heavy')`
 *   for eleven unrelated hazards — boulder, cavity, kick, diff-stick,
 *   cut-choke, rod-whip, gel-clock, obstruction, premature-refusal,
 *   precarious, thrust-limit. Giving all eleven the "it is stuck" signature
 *   would actively teach the player something false, which is worse than
 *   teaching them nothing. Until the sim forwards its hazard kind, `heavy`
 *   stays a tick and the specific signatures are fired from the shots in
 *   audio.js, which DO know which event they are.
 *
 * `snap`, `success` and `fail` are the three legacy names whose meaning is
 * unambiguous, so those three are promoted rather than demoted.
 */
export const LEGACY = {
  light:   'tick',
  detent:  'tick',
  medium:  'tick',
  impact:  'tick',
  heavy:   'tick',
  blow:    'beat',
  snap:    'stutter',
  success: 'rampUp',
  fail:    'rampDown',
};

/* ═══════════════════════════════════════════════════════════════════════════
   5. RESOLUTION — pure, allocation-light, testable
   ═══════════════════════════════════════════════════════════════════════════ */

/** Total motor-on time of a pattern, ms. Even indices vibrate (spec §3). */
export function onMs(pattern) {
  let s = 0;
  for (let i = 0; i < pattern.length; i += 2) s += pattern[i];
  return s;
}

/** Wall-clock span of a pattern, ms. */
export function spanMs(pattern) {
  let s = 0;
  for (let i = 0; i < pattern.length; i++) s += pattern[i];
  return s;
}

/**
 * The HEAD of a shape — its decayed form.
 *
 * For a long shape that is the first two pulses and the gap between them:
 * enough to identify the shape, not enough to read as an event.
 *
 * For a shape that is already three entries, the head is its FIRST PULSE
 * ALONE, and that is not a shortcut — it is the reason STEP survives decay.
 * `stepUp` heads to [20] and `stepDown` to [70], so even the cheapest possible
 * form of the cue still says which way the ground went. Halving a three-entry
 * pattern to two entries would leave a trailing pause, which the spec discards
 * anyway.
 */
export function head(pattern) {
  return pattern.length <= 3 ? [pattern[0]] : pattern.slice(0, 3);
}

/**
 * Resolve an event name to a shape id.
 *
 * @param {string} name   an EVENT_SHAPE key, a LEGACY name, or a SHAPES id
 * @param {object} [opt]  { harder } for `stratum`
 * @returns {string|null} shape id, or null if nothing answers to the name
 */
export function shapeFor(name, opt) {
  if (name === 'stratum') {
    // The direction IS the content. `harder === undefined` means the caller
    // does not know, and an unknown direction must never be reported as a
    // known one — it degrades to a plain tick rather than guessing "harder".
    if (!opt || opt.harder === undefined || opt.harder === null) return 'tick';
    return opt.harder ? 'stepUp' : 'stepDown';
  }
  if (EVENT_SHAPE[name]) return EVENT_SHAPE[name];
  if (LEGACY[name]) return LEGACY[name];
  if (SHAPES[name]) return name;
  return null;
}

/**
 * The VOID pattern scales with the void.
 *
 * `EVENTS.CAVITY` has carried `{ depth, height }` since the contract was
 * written and nothing has ever read the height. A 1 m cavity and a 6 m one are
 * not the same event and must not feel the same: the drop is longer, so the
 * gap is longer.
 *
 * Clamped hard at both ends — the short end so it stays a gap rather than a
 * stumble, the long end so a sim publishing a bad number cannot leave the
 * player holding a silent phone wondering whether it broke. The mapping itself
 * is a design choice and is NOT SOURCED; the clamp is what makes that safe.
 */
function voidPattern(heightM) {
  const h = typeof heightM === 'number' && heightM === heightM ? heightM : 1.2;
  const gap = Math.round(Math.min(300, Math.max(GAP_VOID, 150 + h * 30)));
  return [PRESS, gap, TICK];
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. THE CHANNEL
   ───────────────────────────────────────────────────────────────────────────
   Owns the novelty decay, the class refractories, the pre-emption and the
   rolling motor budget. Everything it needs from outside is injected, so the
   whole thing runs — and is asserted — in plain node.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Rolling window over which motor-on time is capped, seconds. */
export const BUDGET_WINDOW = 10;
/**
 * Motor-on time allowed inside that window, ms — a 9 % duty ceiling.
 *
 * Sized so that two hazard signatures and a handful of steps fit in any ten
 * seconds and a third hazard does not. It is a BACKSTOP, not the mechanism:
 * the novelty decay is what actually keeps the rate sane, and if this budget
 * is ever the thing doing the work, something upstream is firing far too much.
 */
export const BUDGET_MS = 900;

/**
 * @param {object} [cfg]
 * @param {function(number[]):void} [cfg.vibrate]  actuator. Omit for a dry run.
 * @param {function():number} [cfg.now]            seconds, monotonic.
 * @param {function():boolean} [cfg.enabled]       player setting + capability.
 * @param {function():boolean} [cfg.silent]        capture harness. Suppresses
 *        the ACTUATOR ONLY — resolution and bookkeeping still run, so a probe
 *        can assert the mapping in-browser while the motor stays still.
 */
export function createHaptics(cfg) {
  const c = cfg || {};
  const vibrate = typeof c.vibrate === 'function' ? c.vibrate : null;
  const nowFn = typeof c.now === 'function' ? c.now : () => Date.now() / 1000;
  const enabledFn = typeof c.enabled === 'function' ? c.enabled : () => true;
  const silentFn = typeof c.silent === 'function' ? c.silent : () => false;

  /** shapeId → times fired this hole. Reset by newHole(). */
  const seen = Object.create(null);
  /** shapeId → the qualifier last seen, so a CHANGE resets the counter. */
  const qual = Object.create(null);
  /** class → seconds of the last fire in that class. */
  const lastAt = { texture: -99, info: -99, event: -99, hazard: -99 };
  /** what is in flight. */
  let flight = { cls: -1, until: -99 };
  /** rolling budget: [tSec, ms] pairs, oldest first. */
  const spend = [];
  let spent = 0;

  /** Introspection for the gate and for window.__DRILLITY. */
  const stats = { fired: 0, dropped: 0, full: 0, headed: 0, ticked: 0, motorMs: 0, last: null };

  function trimBudget(t) {
    while (spend.length && spend[0][0] < t - BUDGET_WINDOW) { spent -= spend[0][1]; spend.shift(); }
  }

  /**
   * Fire a signature.
   *
   * @param {string} name  event class, legacy intensity name, or shape id
   * @param {object} [opt] { harder, height, qualifier, force }
   *        `qualifier` is any value whose CHANGE means "this is news again" —
   *        a rod kind, a jam severity band, a boulder hardness band. Changing
   *        it resets the novelty decay for that shape, which is what brings
   *        the full signature back exactly when it carries information.
   * @returns {number[]|null} the pattern actually issued, or null if dropped.
   */
  function fire(name, opt) {
    if (!enabledFn()) return null;

    const id = shapeFor(name, opt);
    if (!id) return null;
    const sh = SHAPES[id];
    if (!sh) return null;

    const t = nowFn();
    const cls = sh.cls;
    const rank = CLS[cls];

    // ── pre-emption: a lower or equal class never interrupts one in flight ──
    if (t < flight.until && rank <= flight.cls) { stats.dropped++; return null; }

    // ── refractory, per class ──────────────────────────────────────────────
    if (!(opt && opt.force) && t - lastAt[cls] < REFRACTORY[cls]) { stats.dropped++; return null; }

    // ── novelty decay ─────────────────────────────────────────────────────
    // A changed qualifier makes this news again and resets the count.
    if (opt && opt.qualifier !== undefined && qual[id] !== opt.qualifier) {
      qual[id] = opt.qualifier;
      seen[id] = 0;
    }
    const n = (seen[id] || 0) + 1;
    seen[id] = n;

    let pattern;
    if (n <= sh.full) {
      pattern = id === 'void_' ? voidPattern(opt && opt.height) : sh.pattern;
      stats.full++;
    } else if (n <= sh.full + sh.head) {
      pattern = head(sh.pattern);
      stats.headed++;
    } else {
      pattern = SHAPES.tick.pattern;
      stats.ticked++;
    }

    // ── rolling motor budget, the hard backstop ───────────────────────────
    trimBudget(t);
    if (spent + onMs(pattern) > BUDGET_MS) {
      // Over budget: fall back to a tick, and if even that will not fit, drop.
      if (spent + TICK > BUDGET_MS) { stats.dropped++; return null; }
      pattern = SHAPES.tick.pattern;
    }

    const issuedOn = onMs(pattern);
    spend.push([t, issuedOn]);
    spent += issuedOn;

    lastAt[cls] = t;
    flight = { cls: rank, until: t + spanMs(pattern) / 1000 };
    stats.fired++;
    stats.motorMs += issuedOn;
    stats.last = { name, id, pattern, n };

    // SILENCE UNDER THE CAPTURE HARNESS. Everything above still ran, so a probe
    // can read api.debug.haptics.last and assert the mapping; the actuator is
    // the only thing suppressed. `audio.js` passes the same `_silent` that
    // mutes the buses under `?shot`, so the flag means silent in every sense.
    if (vibrate && !silentFn()) {
      try { vibrate(pattern); } catch (e) { /* policy-blocked; never throws up */ }
    }
    return pattern;
  }

  /** New hole: the novelty budget is per hole, because that is the unit of
   *  work over which "I have felt this one already" is actually true. */
  function newHole() {
    for (const k in seen) delete seen[k];
    for (const k in qual) delete qual[k];
  }

  function reset() {
    newHole();
    spend.length = 0; spent = 0;
    flight = { cls: -1, until: -99 };
    for (const k in lastAt) lastAt[k] = -99;
    stats.fired = stats.dropped = stats.full = stats.headed = stats.ticked = stats.motorMs = 0;
    stats.last = null;
  }

  return {
    fire, newHole, reset,
    get stats() { return stats; },
    /** Live budget usage 0..1, for the debug handle. */
    get load() { trimBudget(nowFn()); return spent / BUDGET_MS; },
  };
}

export default createHaptics;
