/**
 * SITE — the in-game HUD.
 *
 * NOTHING IN THIS FILE IS EVER DRAWN ON TOP OF THE 3D.
 *
 * The screen is a stacked column — status strip, surface band, section band,
 * instrument dock — and the two bands are spacers that are never painted and
 * never given a child. There are exactly two regions of chrome, both opaque,
 * both a fixed height, and EVERYTHING this screen has to say lives inside one
 * of them:
 *
 *   the STRIP carries money, the method's own unit of progress, the clock and
 *     the ONE alert channel — hazard telegraphs and strikes, ground contacts,
 *     a well going underbalanced, and every message the screen used to throw
 *     as a floating toast. Two faces stacked in the same space, so an alert
 *     costs no room,
 *   the DOCK carries the gauge, one readout slot with three possible
 *     occupants, an auxiliary row that holds the action rail or the well
 *     strip, and the three sliders. The unit card takes the top of the dock
 *     over for a few seconds at a unit boundary and leaves the sliders live.
 *
 * There are no floating panels, no scrims and no cards on the render, and
 * nothing here can make the layout jump: the auxiliary row's presence is a
 * property of the METHOD, settled on the first telemetry frame of a run.
 *
 * Rules this file also obeys, every frame, without exception:
 *   • update() touches transform / opacity / CSS custom properties and two 2D
 *     canvases — never a layout-triggering property,
 *   • every DOM reference is cached at build time; no innerHTML after mount.
 */
import { SCENES, EVENTS, GROUND, clamp, damp } from '../../core/contract.js';
import { SITE_ACTIONS, strataFromProfile, methodInfo } from './catalog.js';

/* Fallback ground profile so the screen reviews standalone. */
const DEMO_PROFILE = [
  { g: 'topsoil', to: 1.4 }, { g: 'clay', to: 6 }, { g: 'till', to: 14 },
  { g: 'boulder', to: 17 }, { g: 'gneiss', to: 38 }, { g: 'fracture', to: 44 },
  { g: 'granite', to: 72 },
];

/* ═══ THE CONTROL MODEL — ADVANCE / WORK / PROTECT ═══════════════════════
   GAMEDESIGN §7. The three sliders were authored for rotary and percussive
   drilling — Feed, Rotation, Flush — and that does not survive contact with
   the rest of the trade: driven piling has no rotation and no flush at all, a
   CPT is a steady push with no rotation, and an oil well's third control is
   mud, not "flushing flow". Restating the three controls semantically makes
   one scheme serve every method, and a player who has learnt the shape of one
   can read another immediately.

   The three controls keep the same three places and the same three accents;
   only the labels change. `pushControl` still writes wob / rpm / flush,
   because that is the sim's input contract and it is method-independent.

   RESOLUTION ORDER, most authoritative first:
     1. `method.controls = { advance, work, protect }` in game/data.js. When
        the data carries the labels the UI does not second-guess them.
     2. The method FAMILY, derived from fields the data already has — the
        sim's `method.kind`, `flushMedium`, the tool slots and the iMarket
        application facet.
     3. Rotary with flushing: the shape most of the trade shares.

   There is deliberately NO method-id → label table in this file. A new method
   in data.js gets sensible controls without this screen being touched, and
   the day data.js grows a `controls` field, step 2 stops being consulted at
   all. (The career screen used to keep exactly such a duplicate table, and it
   had four entries matching no real region.)

   STEP 2 NOW HAS A BETTER DISCRIMINATOR THAN `kind`. sim/drilling.js publishes
   `telemetry.programme.kind` — 'rc' | 'jumbo' | 'longhole' | 'bolt' | 'pile' |
   'probe' | 'twoStage' — which is the sim's OWN statement of what programme
   the machine is running, derived from the method model rather than from an id.
   Three of the six new methods are percussive rigs whose third control is not
   the same thing at all (RC's air holds the SAMPLE, a jumbo's flush holds the
   HOLE ACCURACY, a longhole's holds DEVIATION), so the programme is what the
   labels key off. Still no ids in this file.

   A third string in a pair overrides the spoken role sentence, because on the
   six new methods PROTECT is not generic: it is the specific thing that would
   be ruined. */
const CONTROL_SETS = {
  rotary:     { advance: ['Weight on bit', 'WOB'],           work: ['Rotation', 'ROTATION'] },
  auger:      { advance: ['Weight on bit', 'WOB'],           work: ['Rotation', 'ROTATION'],
                protect: ['Flight cleaning', 'CLEANING'] },
  percussive: { advance: ['Feed', 'FEED'],                   work: ['Percussion rate', 'HAMMER'] },
  core:       { advance: ['Weight on bit, light', 'WOB'],    work: ['Rotation speed, high', 'RPM'],
                protect: ['Water', 'WATER'] },
  sonic:      { advance: ['Feed', 'FEED'],                   work: ['Oscillator frequency', 'FREQ'] },
  oil:        { advance: ['Weight on bit', 'WOB'],           work: ['Rotary speed', 'ROTARY'],
                protect: ['Mud flow', 'MUD'] },
  hdd:        { advance: ['Thrust', 'THRUST'],               work: ['Rotate against slide', 'ROTATE'],
                protect: ['Mud flow', 'MUD'] },
  cfa:        { advance: ['Penetration rate', 'ADVANCE'],    work: ['Rotation', 'ROTATION'],
                protect: ['Concrete pressure', 'CONCRETE'] },
  jet:        { advance: ['Withdrawal rate', 'WITHDRAW'],    work: ['Jet pressure', 'JET'],
                protect: ['Rotation speed', 'ROTATION'] },
  piling:     { advance: ['Hammer energy', 'ENERGY'],        work: ['Blow rate', 'BLOWS'],
                protect: ['Alignment', 'ALIGN', 'the pile wanders off line unattended — trim the rake'] },

  /* ── the six from METHOD_IDS.md, keyed on the sim's programme ─────────── */
  rc:         { advance: ['Feed', 'FEED'],                   work: ['Percussion rate', 'HAMMER'],
                protect: ['Air', 'AIR', 'the air holds the face and the sample — sample integrity'] },
  jumbo:      { advance: ['Feed', 'FEED'],                   work: ['Percussion rate', 'HAMMER'],
                protect: ['Flushing', 'FLUSH', 'a clean hole is an accurate hole — hole accuracy'] },
  longhole:   { advance: ['Feed', 'FEED'],                   work: ['Percussion rate', 'HAMMER'],
                protect: ['Flushing', 'FLUSH', 'what keeps the string off the wall — deviation'] },
  bolt:       { advance: ['Thrust', 'THRUST'],               work: ['Rotation', 'ROTATION'],
                protect: ['Resin mix', 'MIX', 'the resin and water mix ratio, and then the hold'] },
  /* A pushed piezocone. Nothing turns and nothing is circulated, so two of the
     three places are inert — and the HUD says so rather than leaving them
     live and lying. sim/drilling.js publishes the locks and their wording. */
  cpt:        { advance: ['Push rate', 'PUSH'],              work: ['—', '—'],
                protect: ['Verticality', 'PLUMB', 'the sounding is only usable while the cone runs plumb'] },
  spt:        { advance: ['Feed', 'FEED'],                   work: ['Hammer cadence', 'CADENCE'],
                protect: ['Water', 'WATER', 'a clean base under the spoon — sample quality'] },
};

/* PROTECT is whatever keeps the hole, the tool and the crew intact, so where
   the family does not name it, the method's own flushing medium does. */
const PROTECT_BY_FLUSH = {
  air:   ['Air', 'AIR'],
  water: ['Water', 'WATER'],
  mud:   ['Mud flow', 'MUD'],
  foam:  ['Foam', 'FOAM'],
  none:  ['Hole cleaning', 'CLEANING'],
};

/* The semantics, verbatim from GAMEDESIGN §7 — spoken by the screen reader in
   place of a unit, because the slider commands a percentage of the machine's
   available travel and printing "kN" next to a 0–100 number would be a wrong
   unit (PLATFORM_TRUTH Part C §3). */
const CONTROL_ROLE = {
  advance: 'how hard you push into the ground',
  work: 'the energy you put into breaking it',
  protect: 'what keeps the hole, the tool and the crew intact',
};

/* sim/drilling.js `programme.kind` (+ ':mode') → the control vocabulary above.
   Anything not listed falls through to the older `kind`/flush derivation. */
const PROGRAMME_FAMILY = {
  rc: 'rc',
  jumbo: 'jumbo',
  longhole: 'longhole',
  bolt: 'bolt',
  pile: 'piling',
  'probe:cpt': 'cpt',
  'probe:spt': 'spt',
};

/**
 * The sim's programme key for this run: `programme.kind`, with the mode
 * appended where the programme publishes one. `programmeTelemetry()` names
 * itself — 'rc', 'jumbo', 'longhole', 'rockbolt', 'driven-pile', 'cpt', 'spt',
 * 'two-stage' — so both spellings are accepted and normalised here, and a
 * method with no programme at all resolves to ''.
 */
const PROG_ALIAS = {
  rc: 'rc', jumbo: 'jumbo', 'tunnel-jumbo': 'jumbo', longhole: 'longhole',
  bolt: 'bolt', rockbolt: 'bolt', pile: 'pile', 'driven-pile': 'pile',
  cpt: 'probe:cpt', spt: 'probe:spt', probe: 'probe',
  twoStage: 'twoStage', 'two-stage': 'twoStage',
};
function progKey(prog) {
  if (!prog || !prog.kind) return '';
  const base = PROG_ALIAS[prog.kind] || prog.kind;
  if (base === 'probe') return prog.mode === 'cpt' ? 'probe:cpt' : 'probe:spt';
  return base;
}

/* What the DEPTH cell in the status strip is counting. On a method paid for
   metres it is the depth; on a heading it is the advance into the drive, on a
   pile it is how far the head has been driven, on a sounding it is how deep
   the log now reaches. Same cell, same place, honest word. */
const DEPTH_KEY = {
  jumbo: 'Advance', bolt: 'Advance', pile: 'Driven',
  'probe:cpt': 'Sounding', 'probe:spt': 'Borehole',
  longhole: 'Into hole', rc: 'Hole',
};

const pct01 = (v) => `${Math.round(clamp(Number(v) || 0, 0, 1) * 100)}%`;
const num = (v, dp = 1) => (Number.isFinite(+v) ? (+v).toFixed(dp) : '—');
const int = (v) => (Number.isFinite(+v) ? String(Math.round(+v)) : '—');
const n01 = (v, dflt = 0) => clamp(Number.isFinite(+v) ? +v : dflt, 0, 1);

/* ═══ WHAT THE SCREEN SHOWS WHILE YOU ARE DRILLING ══════════════════════
   THE 3D IS THE GAME. The HUD is the instrument panel, and an instrument
   panel you have to READ instead of watching the work is a bad one. A driller
   watches the hole and the machine, glances at one gauge, and reads the log
   afterwards.

   So the live screen carries exactly two permanent things — one thin status
   line and one instrument cluster — and everything else earns its place by
   being true RIGHT NOW: a hazard banner while a hazard is live, an action pill
   while that action is actually available, a stratum tag for a moment after
   the ground changes, and a short card after each finished unit.

   THE TEST APPLIED TO EVERY ELEMENT: does the player act on this in the next
   three seconds? If not it is a log entry, not a HUD element. That is why the
   four permanent meters are gone: BIT LIFE, HEAT, CUTTINGS and HOLE were a
   standing restatement of a channel that already interrupts — sim/drilling.js
   raises `bit-worn`, `bit-critical`, `overheat`, `hole-cleaning` and
   `collapse` as warnings the moment they matter, and the hazard banner carries
   each one with its instruction attached. The numbers themselves are outcomes,
   and outcomes belong on the unit card and on the results screen.
   ═══════════════════════════════════════════════════════════════════════ */

const n = (v) => (Number.isFinite(+v) ? +v : 0);

/* The DEPTH cell of the status line, in the method's own unit of completion.
   One short term — the only place the programme appears while drilling, and it
   is there because "bolt 12 of 40" is the answer to "how far through am I",
   which is the one question a status line exists to answer. */
const STATUS_UNIT = {
  rc: (p) => ['Bags', `${int(p.bagsCut)}`],
  jumbo: (p) => ['Round', `${int(p.roundIndex)} · ${int(p.holesDone)}/${int(p.holesPerRound)}`],
  longhole: (p) => ['Hole', `${int(p.holeIndex)}/${int(p.holesTotal)}`],
  bolt: (p) => ['Bolt', `${int(p.boltIndex)}/${int(p.boltsTotal)}`],
  pile: (p) => ['Blows', `${int(p.blows)}`],
  'probe:cpt': (p) => ['Sounding', `${num(p.pushRateMmS, 0)} mm/s`],
  'probe:spt': (p) => ['Test', `${int(p.testIndex)}`],
  twoStage: (p) => [p.reverse ? 'Ream' : 'Pilot', `${num(p.passM, 0)}/${num(p.passTargetM, 0)} m`],
};

/* ═══ THE UNIT CARD ═════════════════════════════════════════════════════
   Every method has a natural unit boundary — a bag, a round, a ring hole, a
   bolt, a pile's set, an SPT test — and that boundary is the honest moment to
   say what just happened. `stamp` is a scalar that only moves when a unit
   completes; `card` turns the finished unit into a title, a few outcome
   figures and ONE line of consequence. Then it goes away.

   Everything here is an OUTCOME, never a control: the anchorage you got, the
   recovery on the bag, the crown you spent. Controls live on the sliders and
   the gauge; a value that appears in both places is a value stated twice. The
   figures come off `telemetry.programme` and nothing is re-derived. */
const UNIT_VIEWS = {
  rc: {
    stamp: (p) => p.bagsCut,
    card: (p, tl) => {
      const b = p.lastBag;
      if (!b) return null;
      const bad = b.rating === 'contaminated' || b.rating === 'lost';
      return {
        title: `Bag ${int(b.index)} · ${num(b.fromM, 1)}–${num(b.toM, 1)} m`,
        tone: bad ? 'bad' : b.rating === 'moderate' ? 'warn' : 'good',
        rows: [
          ['Mass', `${num(b.massKg, 2)} kg`],
          ['Recovery', pct01(b.recovery01)],
          ['Foreign', pct01(b.contam01)],
          ['Crown', pct01(1 - n01(tl.wear))],
        ],
        /* THE CONSEQUENCE. On RC it is the assay, and the assay is where
           PLATFORM_TRUTH Part C rule 7 bites. */
        note: assayNote(b),
      };
    },
  },
  jumbo: {
    stamp: (p) => p.roundsFired,
    card: (p, tl) => ({
      title: `Round ${int(p.roundsFired)} fired`,
      tone: p.pull01 >= 0.9 ? 'good' : p.pull01 >= 0.75 ? 'warn' : 'bad',
      rows: [
        ['Pull', pct01(p.pull01)],
        ['Overbreak', pct01(p.overbreak)],
        ['Half-barrel', pct01(p.halfBarrel01)],
        ['Advance', `${num(p.advanceM, 2)} m`],
      ],
      note: p.chokedRounds
        ? 'The cut froze — a round is decided before it is fired.'
        : `Crown ${pct01(1 - n01(tl.wear))}. The accuracy of the holes is what bought that pull.`,
    }),
  },
  longhole: {
    stamp: (p) => p.holeIndex,
    card: (p, tl) => ({
      title: `Hole ${int(p.holeIndex - 1)} of ${int(p.holesTotal)} drilled`,
      tone: p.blocked ? 'warn' : 'good',
      rows: [
        ['Ring', `${int(p.ring)}`],
        ['Length', `${num(p.holeLengthM, 1)} m`],
        ['Re-drills', int(p.redrills)],
        ['Crown', pct01(1 - n01(tl.wear))],
      ],
      note: 'The toes are surveyed when the ring is fired. Deviation becomes dilution, and you will not see it before then.',
    }),
  },
  bolt: {
    stamp: (p) => p.boltIndex,
    card: (p, tl) => {
      const inst = Array.isArray(p.installs) ? p.installs[p.installs.length - 1] : null;
      const anch = inst ? inst.anchorage01 : p.lastAnchorage01;
      /* Three figures, not four: the bolt TYPE is a garage decision and the
         note below already names it wherever it changes what the numbers
         mean. A fourth cell only crowded the other three into ellipses. */
      const rows = [
        ['Anchorage', anch == null ? '—' : pct01(anch)],
        ['Crown', pct01(1 - n01(tl.wear))],
      ];
      /* THE HOLE DIAMETER IS A LOADOUT DECISION, made in the garage, so it is
         only worth the room when it is WRONG — which is exactly when it is the
         most interesting number on the method: a friction bolt in an
         over-gauge hole is holding nothing at all. */
      const off = Math.abs(n(p.holeMm) - n(p.holeIdealMm));
      if (off > 0.6) rows.push(['Hole vs ideal', `${num(p.holeMm, 1)} / ${num(p.holeIdealMm, 1)} mm`]);
      return {
        title: `Bolt ${int(p.boltIndex)} of ${int(p.boltsTotal)} in`,
        tone: anch == null ? 'warn' : anch >= 0.75 ? 'good' : anch >= 0.5 ? 'warn' : 'bad',
        rows,
        note: inst && inst.slotClosureIn != null
          ? `Slot closed ${num(inst.slotClosureIn, 4)} in — full contact is ${num(p.slotFullContactIn, 4)} in.`
          : p.torqueTestPending
            ? 'A statutory torque test is due on this one. The end-of-shift audit checks it.'
            : (off > 0.6
              ? 'The hole is off the bit this bolt wants. That is where the anchorage went.'
              : 'Anchorage is what the roof hangs on. Metres of drive are not.'),
      };
    },
  },
  pile: {
    stamp: (p) => (p.setTaken ? 1 : 0) + (p.founded ? 2 : 0) + (p.refused ? 4 : 0),
    card: (p) => ({
      title: p.hardRefused ? 'Hard refusal' : p.refused ? 'Refusal' : p.setTaken ? 'Set taken' : 'Founded',
      tone: p.hardRefused ? 'bad' : p.founded ? 'good' : 'warn',
      rows: [
        ['Set', `${int(p.blowsPer250)} /250 mm`],
        ['Design', `${num(p.designSetMm, 1)} mm/blow`],
        ['Toe', `${num(p.toeDepthM, 2)} m`],
        ['Into bearing', `${num(p.bearingPenM, 2)} / ${num(p.bearingPenRequiredM, 2)} m`],
      ],
      /* The instrument that can lie, said out loud at the one moment the
         player can still do something about it. */
      note: p.founded
        ? 'Founded: the toe is far enough into the bearing stratum for that set to mean something.'
        : 'The set reads the same whether the toe is bearing or brooming. Only the depth into bearing is honest.',
    }),
  },
  'probe:spt': {
    stamp: (p) => p.testIndex,
    card: (p) => {
      const t = p.lastTest;
      if (!t) return null;
      return {
        title: `SPT ${int(t.index)} at ${num(t.depthM, 2)} m`,
        tone: t.refusal ? 'warn' : 'good',
        rows: [
          ['N', t.refusal ? t.refusal : int(t.N)],
          ['N60', t.N60 == null ? '—' : num(t.N60, 1)],
          ['Energy ratio', pct01(t.energyRatio)],
          ['Sample', pct01(t.sampleQuality01)],
        ],
        note: t.refusal
          ? 'A refused test is a result, and it is reported as blows over penetration.'
          : `Area ratio ~${Math.round((t.areaRatio || 1.1) * 100)} % — every split-spoon sample is a disturbed sample.`,
      };
    },
  },
  'probe:cpt': {
    stamp: (p) => p.dissipations * 2 + (p.terminated ? 1 : 0),
    card: (p) => ({
      title: p.terminated ? 'Sounding terminated' : 'Dissipation test',
      tone: p.terminated ? 'warn' : 'good',
      rows: [
        ['Readings', int(p.readings)],
        ['Rate held', pct01(p.inTolerance01)],
        ['Inclination', `${num(p.inclinationDeg, 2)}°`],
        ['Cone', pct01(1 - n01(p.coneDamage01))],
      ],
      note: p.terminated
        ? 'Stopped at thrust capacity — a valid, reportable, paid result.'
        : 'u2 is back on its baseline; the trace can be trusted again.',
    }),
  },
  twoStage: {
    stamp: (p) => p.stage,
    card: (p) => ({
      title: `${p.stageName || 'Pass'} · ${p.reverse ? 'coming back' : 'going down'}`,
      tone: 'good',
      rows: [
        ['Along', `${num(p.passM, 1)} / ${num(p.passTargetM, 1)} m`],
        ['Cutters', pct01(1 - n01(p.cutterWear01))],
        ['Stalls', int(p.stalls)],
      ],
      note: p.mucksByGravity
        ? 'A raise mucks by gravity — there is nothing to circulate on the way up.'
        : 'The constraint on the way back is pull, not rate.',
    }),
  },
};

/**
 * The assay line for an RC bag — PLATFORM_TRUTH Part C rule 7.
 *
 * `gradeKnown` is false wherever research/08-commodities.md carries no grade
 * band: coal, iron, lithium and diamonds. The intercept is real — a shape is
 * not a claim — so the bag reports THAT IT IS IN ORE and the number stays
 * unprinted. Show the target, never a figure the research does not support.
 */
function assayNote(bag) {
  if (!bag) return 'One bag a metre off the splitter. The bag is the product, not the hole.';
  const what = bag.commodityName || bag.commodity;
  if (!what) return 'No ore body in this profile — the log is the product.';
  if (!bag.assayable) return `${what}: this bag is not assayable. That metre is a hole in the data.`;
  if (!bag.gradeKnown) {
    // The one line this rule exists for: name the intercept, print no number.
    return bag.inOre
      ? `${what} intercept logged. No sourced grade band, so no figure is quoted.`
      : `${what} target — outside the body on this metre.`;
  }
  if (bag.reportedGrade == null) return `${what}: no grade reported off this bag.`;
  const g = `${num(bag.reportedGrade, bag.unit === '%' ? 2 : 1)} ${bag.unit || ''}`.trim();
  return bag.inOre
    ? `${what} ${g} — above the ${num(bag.cutoff, 2)} cut-off.`
    : `${what} ${g} — background.`;
}

/* ═══ THE BEAT ═══════════════════════════════════════════════════════════
   Every new method has stretches where the machine is doing the work and the
   player is waiting: the resin curing, the round charging, the set being
   taken, the cone dissipating. Waiting is not a dead screen — it IS the
   method — so it is instrumented, INSIDE the cluster where the rate readout
   normally sits. It takes no new room on the stage and it is only there while
   something is running. Keyed on the sim's own beat vocabulary
   (`BEAT_PHASES` in sim/drilling.js). */
const BEAT_COPY = {
  'boom-setup':   ['Boom setting up', 'Lining up on the next hole group'],
  charging:       ['Charging the round', 'The score was settled before this'],
  firing:         ['Firing', 'Face is clear'],
  mucking:        ['Mucking out', 'Round away'],
  misfire:        ['Misfire', 'Made safe before the next round'],
  'trim-blast':   ['Trim blast', 'Bringing the profile back to line'],
  'ring-index':   ['Indexing the cradle', 'Round to the next hole in the ring'],
  redrill:        ['Re-drilling', 'Pulled back — starting the hole again'],
  'bolt-install': ['Installing the bolt', 'The drive time is the tell'],
  'bolt-plate':   ['Plating up', 'Tight to the rock'],
  'bolt-torque':  ['Torque test', 'The statutory sample'],
  'bolt-ream':    ['Reaming the hole', 'It closed before the bolt went in'],
  'bolt-inspect': ['Reading the slot', 'A light down the tube'],
  pitch:          ['Pitching the pile', 'Into the leader guides'],
  'take-set':     ['Taking the set', 'Ten blows, held steady'],
  'dolly-change': ['Changing the dolly', 'New packing under the helmet'],
  're-drive':     ['Re-driving', 'A second pile alongside the rejected one'],
  'spt-drive':    ['SPT drive', 'Release cleanly on the beat'],
  'clean-out':    ['Cleaning out', 'Fall-in off the base of the hole'],
  dissipation:    ['Dissipation test', 'Excess pore pressure decaying'],
  'blow-down':    ['Blowing the string down', 'Clearing the sample train'],
  bail:           ['Bailing run', 'Lifting the cuttings out of the hole'],
  'bailing-run':  ['Bailing run', 'Lifting the cuttings out of the hole'],
  'cutter-change':['Changing cutters', 'From below, on the reamer head'],
  /* Phases that are not beats but are still not drilling. The sim publishes
     no clock for these, so the bar runs indeterminate rather than lying. */
  'tripping-out': ['Tripping out', 'The string is coming back up'],
  'tripping-in':  ['Tripping in', 'Back to bottom'],
  'bit-swap':     ['Changing the crown', 'On the floor'],
  'casing-run':   ['Running casing', 'Following the bit down'],
  'rod-add':      ['Rod coming in', 'Nail the stab'],
};

/* The resin bolt is the one wait with three distinct jobs in it, and getting
   the middle one wrong shears the bond the first one just made. */
const RESIN_STEPS = [
  ['Spin', 'Spin the bar through the cartridges'],
  ['Gel', 'STOP the rotation — the resin is gelling'],
  ['Hold', 'Hold it still while it cures'],
];

/** One-line captions for the sim's pulse verbs. The label is the sim's. */
const PULSE_SUB = {
  blowDown:   'Clear the sample train before the next bag',
  shortRound: 'Take the round the ground class allows',
  redrill:    'Pull back and start the hole again',
  inspectSlot:'Read the slot closure on the last bolt',
  torqueTest: 'The statutory torque sample',
  reamHole:   'Open a hole that has closed',
  changeDolly:'New packing under the helmet',
  takeSet:    'Ten blows, held steady, and read the toe',
  strike:     'Release the hammer cleanly',
  cleanOut:   'Clean the fall-in off the base',
  dissipation:'Stop and let the excess pore pressure decay',
  terminate:  'Stop the sounding at thrust capacity',
};

/* Shutting in is not a matter of degree — you space out, close the preventer
   and read the pressures — so it is a button and never a fourth slider. It is
   a RAIL button like every other machine action the sim publishes, because
   that is what it is; what keeps it out of reach of the wrong reflex is the
   hazard striping and the fact that the rail is not where the primary
   contextual action lives. `is-critical` marks both of them. */
const RAIL_CRITICAL = { shutIn: 1, lcmPill: 1 };

/**
 * The family whose control vocabulary a method belongs to.
 *
 * @param {object|null} method   the game/data.js record, when the data layer is up
 * @param {string|null} kindHint the sim's `method.kind`
 * @param {string|null} progHint the sim's `programme.kind`, plus ':mode' where
 *                               the programme has one (`probe:cpt`, `probe:spt`)
 */
function controlFamily(method, kindHint, progHint) {
  const m = method || {};
  const kind = m.kind || kindHint || 'rotary';
  const flush = m.flushMedium || null;
  const slots = Array.isArray(m.toolSlots) ? m.toolSlots : [];
  const apps = Array.isArray(m.applications) ? m.applications : [];

  /* The sim's own programme outranks everything below it: it is the model that
     actually decided what the three controls do this run, and it is the only
     thing that can tell a pushed piezocone from the boring rig it shares a
     method id with. */
  const prog = PROGRAMME_FAMILY[progHint || ''];
  if (prog && CONTROL_SETS[prog]) return prog;

  // Anything that models a mud column and a preventer is an oil well.
  if (m.wellControl || slots.includes('wellcontrol')) return 'oil';
  // A hammer and nothing to turn.
  if (kind === 'piling' || kind === 'impact' || kind === 'vibro') return 'piling';
  if (kind === 'core') return 'core';
  if (kind === 'sonic') return 'sonic';
  if (kind === 'percussive') return 'percussive';
  // A continuous auger carrying a concrete pump is a CFA rig — the pump is
  // literally what makes it one, and its third control is concrete pressure.
  if (kind === 'auger') return slots.includes('pump') ? 'cfa' : 'auger';
  // Two mud rotaries that are not oil wells. The iMarket application facet
  // tells them apart, so no list of method ids is needed here.
  if (flush === 'mud') {
    if (apps.includes('utility-hdd') || apps.includes('trenching')) return 'hdd';
    if (apps.includes('soil-stabilisation')) return 'jet';
  }
  return 'rotary';
}

/** A short head label for a data-supplied control that carries no `short`. */
const shortOf = (label) => String(label || '').split(/[\s,]+/)[0].toUpperCase().slice(0, 9);

export function createSiteScreen(app) {
  const { C, state, fmtMoney } = app;
  const ctx = app.ctx;

  /* ═══ THE STATUS STRIP ═════════════════════════════════════════════════
     One of exactly TWO permanent regions on this screen, and the first row of
     the stacked column. Flush to the top edge, opaque, fixed height — chrome,
     not a card floating on the picture.

     It has two faces stacked inside it and only ever shows one:

       STEADY   level · balance · the method's own unit of progress · clock
       ALERT    the screen's ONE transient channel

     EVERYTHING transient goes through the alert face: a hazard telegraph and
     the strike that follows it, a ground contact, a well going underbalanced,
     and every piece of feedback this screen used to throw as a floating
     toast. One channel, one severity encoding — and because the two faces are
     stacked in the strip's own space, a hazard arriving costs no room, covers
     no band and moves nothing.

     `--p` drives the job-progress rule along the strip's foot: "how far
     through am I" in 2px of height, which is the one question a status line
     exists to answer. */
  const moneyEl = C.h('span.sstrip__v', { text: '€0' });
  const lvlEl = C.h('span.sstrip__lvl', { text: '1' });
  const depthEl = C.h('span.sstrip__v', { text: '0.00', 'aria-live': 'off' });
  const targetEl = C.h('em', { text: ' / 0 m' });
  /* Not always "Depth": a jumbo and a bolter ADVANCE a drive, a pile is
     DRIVEN, a cone is a SOUNDING. Same cell, same place, honest word. */
  const depthKeyEl = C.h('span.sstrip__k', { text: 'Depth' });
  const timeEl = C.h('span.sstrip__v', { text: '00:00' });

  /* The leave control is a cell of the strip. It used to be a 44px disc
     floating on its own over the surface band — a whole extra region over the
     3D, permanently, for a control that is pressed once a run. */
  const pauseBtn = C.h('button.sstrip__leave', { type: 'button', 'aria-label': 'Pause and leave the hole' }, C.Icon('close', 18));

  const stripSteady = C.h('div.sstrip__face.sstrip__steady',
    lvlEl,
    C.h('div.sstrip__cell.sstrip__cell--grow',
      C.h('span.sstrip__k', { text: 'Balance' }),
      moneyEl,
    ),
    C.h('i.sstrip__div'),
    C.h('div.sstrip__cell',
      depthKeyEl,
      C.h('span.sstrip__v', depthEl, targetEl),
    ),
    C.h('i.sstrip__div'),
    C.h('div.sstrip__cell',
      C.h('span.sstrip__k', { text: 'On tools' }),
      timeEl,
    ),
  );

  const alertIco = C.h('span.sstrip__ico', C.Icon('alert', 20));
  const alertTitleEl = C.h('p.sstrip__at', { text: '' });
  const alertSubEl = C.h('p.sstrip__as', { text: '' });
  const stripAlert = C.h('div.sstrip__face.sstrip__alert', { hidden: true, role: 'alert' },
    alertIco,
    C.h('div.sstrip__ab', alertTitleEl, alertSubEl),
  );
  /* The telegraph rule rides the same 2px foot as the job rule, in the
     alert's own colour, so a countdown to a strike reads identically to every
     other telegraph in the game. */
  const teleRule = C.h('i.sstrip__tele', { hidden: true });

  /* The leave control is not part of either face: it is the one thing in the
     strip that is in the same place in every state, and it stays reachable
     through an alert. */
  const sstrip = C.h('div.sstrip',
    stripSteady, stripAlert, pauseBtn, C.h('i.sstrip__prog'), teleRule);

  C.tap(pauseBtn, async () => {
    const ok = await app.confirm({
      title: 'Leave the hole?',
      message: 'Leave this contract and lose the unfinished hole and remaining payout. Mobilisation is not refunded and reputation will fall.',
      confirmLabel: 'Abandon',
      cancelLabel: 'Keep drilling',
      destructive: true,
    });
    if (!ok) return;
    const abandoned = ctx.progression?.abandonContract?.();
    if (abandoned && !abandoned.ok) { app.toast(abandoned.reason, 'warn'); return; }
    if (ctx.sim && typeof ctx.sim.abortHole === 'function') {
      try { ctx.sim.abortHole('abandoned'); } catch (e) { console.error('[ui] abortHole', e); }
    } else {
      if (state.drill) state.drill.active = false;
      app.bus.emit(EVENTS.DRILL_STOP, { reason: 'abandoned' });
    }
    app.nav(SCENES.CONTRACTS);
  });

  /* ═══ THE RUN LOG ══════════════════════════════════════════════════════
     There is no standing drill-log card. What each event WAS still matters —
     it is how a player reconstructs a bad run — so it is kept in memory and
     surfaced where it is actually read: on the results screen at the end. A
     log nailed to the stage is a log nobody reads while they are working. */
  const runLog = [];
  const LOG_MAX = 40;
  function log(depth, text, kind) {
    runLog.push({ depth: Number(depth || 0), text, kind: kind || null });
    if (runLog.length > LOG_MAX) runLog.shift();
  }

  /* ── The alert channel ──────────────────────────────────────────────────
     Two modes on one face:
       telegraph — the sim's forecast, with the countdown rule filling toward
                   the strike. Re-asserted every frame while it stands,
       strike    — something that has happened. Outranks a telegraph and holds
                   the strip for its own few seconds.
     Severity is encoded HERE and nowhere else, so the same boulder can no
     longer be amber in one place and red in another. */
  const ALERT_SEC = { danger: 3.4, warn: 3.0, info: 2.4, good: 2.0 };
  const ALERT_ICON = { danger: 'alert', warn: 'alert', info: 'info', good: 'check' };
  let alertHold = 0;          // >0 while a struck message holds the strip
  let alertMode = null;       // 'strike' | 'telegraph' | null
  let alertKind = '';
  let alertIcoKind = '';
  let alertTitle = '';
  let alertSub = '';
  let alertP = '';

  function paintAlert(title, sub, kind, mode, progress) {
    if (stripAlert.hidden) {
      stripAlert.hidden = false;
      stripSteady.hidden = true;
    }
    if (kind !== alertKind) {
      alertKind = kind;
      sstrip.className = 'sstrip is-alert' + (kind === 'danger' ? '' : ' is-' + kind);
      const ico = ALERT_ICON[kind] || 'alert';
      if (ico !== alertIcoKind) {
        alertIcoKind = ico;
        alertIco.replaceChild(C.Icon(ico, 20), alertIco.firstChild);
      }
    }
    if (title !== alertTitle) { alertTitle = title; alertTitleEl.textContent = title; }
    if (sub !== alertSub) { alertSub = sub; alertSubEl.textContent = sub; }
    alertMode = mode;
    const tele = mode === 'telegraph';
    if (teleRule.hidden !== !tele) teleRule.hidden = !tele;
    if (tele) {
      const p = clamp(progress || 0, 0, 1).toFixed(3);
      if (p !== alertP) { alertP = p; sstrip.style.setProperty('--tp', p); }
    }
  }

  function clearAlert() {
    if (stripAlert.hidden) return;
    alertMode = null; alertHold = 0;
    alertKind = ''; alertTitle = ''; alertSub = ''; alertP = '';
    stripAlert.hidden = true;
    stripSteady.hidden = false;
    teleRule.hidden = true;
    sstrip.className = 'sstrip';
  }

  /**
   * Something that has happened. Holds the strip for a few seconds, outranks
   * any telegraph underneath it, and is the ONLY transient channel this
   * screen has — there are no toasts on the site screen, because a toast is a
   * card floating on the render.
   *
   * @param {string} title  the subject, in two or three words
   * @param {string} sub    the instruction or the consequence
   * @param {'danger'|'warn'|'info'|'good'} kind
   */
  function say(title, sub, kind = 'info') {
    paintAlert(title, sub || '', kind, 'strike', 0);
    alertHold = ALERT_SEC[kind] || 2.6;
    app.haptic(kind === 'danger' ? 'heavy' : kind === 'warn' ? 'medium' : 'light');
  }

  /** A hazard that has actually happened. */
  function hazard(title, sub, kind = 'danger') {
    say(title, sub, kind);
  }

  /* sim/drilling.js writes its hints as "SUBJECT — ACTION". Reuse its own
     copy rather than inventing a parallel vocabulary: the subject becomes the
     alert title, the action becomes the instruction underneath it. */
  function splitHint(kind, hint) {
    const parts = String(hint || '').split('—');
    const head = (parts[0] || String(kind || '').replace(/-/g, ' ')).trim();
    const tail = parts.slice(1).join('—').trim();
    const sentence = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : '');
    return {
      title: head || 'Ground ahead',
      sub: sentence(tail) || 'Watch the gauge',
    };
  }


  /* ═══ WELL CONTROL ═════════════════════════════════════════════════════
     Shown only for methods that model a mud column. The test is the presence
     of `telemetry.well`, never a method id: any method the sim gives a mud
     column to gets the strip, and one that loses it loses the strip.

     WHERE IT LIVES. In the dock's auxiliary row, which is a row the dock
     already has. It is not a panel, it does not float, and it cannot cover a
     band — the old one was a 358 x 62 card anchored over the surface 3D that
     grew to 146px when it went to alarm.

     WHAT IT SAYS. Two things, in the order a driller reads them:
       • the PIT, because a gain on the totaliser is the classic first sign of
         an influx and a fall the classic first sign of a thief zone — one
         signed instrument about a zero baseline,
       • the MARGIN: mud weight against pore pressure. It is the only number
         on a well that decides whether the hole stays shut, so it is the one
         that is emphasised and the one that turns red when it goes negative.

     Mud weight, pore pressure and ECD are gone from the live screen. They are
     the INPUTS to the margin, the margin is the decision, and a driller acts
     on the decision — they are on the results screen where they can be read.

     WHAT IT DOES. Nothing: the actions are actions. `telemetry.actions[]`
     already publishes `shutIn` and `lcmPill` with their labels and their
     enabled flags, so they are rail buttons like every other machine action —
     hazard-striped, in their own place, with their own silhouette, so they
     can never be hit by the muscle memory that belongs to the primary
     contextual action.

     And the alarm itself goes to the status strip, because that is the one
     hazard channel on this screen and a kick is not a special case. */
  const WELL_WARNINGS = { kick: 1, 'well-control': 1, 'lost-zone': 1, 'pit-loss': 1, 'lost-circulation': 1 };
  const WELL_CAUTION = { 'lost-zone': 1, 'pit-loss': 1, 'lost-circulation': 1 };

  const pitTrack = C.h('div.pit__track', C.h('i.pit__loss'), C.h('i.pit__gain'), C.h('i.pit__base'));
  const pitState = C.h('span.pit__s', { text: 'Steady' });
  const pitEl = C.h('div.pit', { role: 'status' },
    C.h('span.pit__k', { text: 'Pit' }), pitTrack, pitState);

  const marginV = C.h('span.wnum__v', { text: '—' }, C.h('em', { text: 'sg' }));
  const marginEl = C.h('div.wnum.wnum--margin',
    C.h('span.wnum__k', { text: 'Margin' }), marginV);

  const wellEl = C.h('div.wellstrip', {
    hidden: true, role: 'region', 'aria-label': 'Well control',
  }, pitEl, marginEl);

  /* Cached presentation state, so the frame loop only writes what changed. */
  const wellUi = { on: false, pit: '', margin: '', marginCls: '', g: '', l: '' };

  /** true while the sim is losing returns to a thief zone right now. */
  function lossLive(tl) {
    if (!tl) return false;
    if (Array.isArray(tl.hazards)) {
      for (const h of tl.hazards) if (h && h.kind === 'lost-zone' && h.phase !== 'done') return true;
    }
    return !!(tl.flags && tl.flags.lostCirculation);
  }

  /**
   * Paint the well strip from `telemetry.well`. Writes custom properties,
   * text and classes only — nothing that triggers layout, and nothing at all
   * when the values have not moved.
   *
   * @returns {null|{title:string, sub:string, kind:string, p:number}}
   *          the alarm for the status strip, or null when the well is quiet.
   */
  function paintWell(tl) {
    const w = tl && tl.well ? tl.well : null;

    if (!w) {
      if (wellUi.on) { wellUi.on = false; wellEl.hidden = true; }
      return null;
    }
    if (!wellUi.on) { wellUi.on = true; wellEl.hidden = false; }

    const warn = tl.warning && WELL_WARNINGS[tl.warning.kind] ? tl.warning : null;
    const flowing = !!w.flowing;
    const killing = !!w.killing || !!w.shutIn;
    const losing = lossLive(tl);
    const margin = Number(w.overbalanceSg) || 0;
    const alarm = flowing || killing || losing || margin <= 0 || !!warn;
    const caution = !flowing && !killing && !!((warn && WELL_CAUTION[warn.kind]) || losing);

    /* ── the pit totaliser ──
       A kick telegraphs for about a second before it bites, and the pit is
       already gaining through that window — that is exactly why a pit gain is
       the first sign. `influx01` only starts climbing once the hazard fires,
       so the telegraph drives the needle in the meantime, the same way
       sim/drilling.js drives the torque needle's judder from its telegraphs.
       The number is presentation; the state word and the margin are not. */
    let gain = clamp(Number(w.influx01) || 0, 0, 1);
    if (warn && tl.warning.kind === 'kick' && tl.warning.telegraph) {
      gain = Math.max(gain, 0.12 + 0.34 * clamp(tl.warning.progress01 || 0, 0, 1));
    }
    const col = Number(w.columnLevel01);
    const loss = clamp(1 - (Number.isFinite(col) ? col : 1), 0, 1);
    const gTxt = gain.toFixed(3);
    if (gTxt !== wellUi.g) { wellUi.g = gTxt; pitEl.style.setProperty('--g', gTxt); }
    const lTxt = loss.toFixed(3);
    if (lTxt !== wellUi.l) { wellUi.l = lTxt; pitEl.style.setProperty('--l', lTxt); }

    const pit = gain > 0.02 ? 'gaining' : loss > 0.02 ? 'losing' : 'steady';
    if (pit !== wellUi.pit) {
      wellUi.pit = pit;
      pitEl.classList.toggle('is-gaining', pit === 'gaining');
      pitEl.classList.toggle('is-losing', pit === 'losing');
      pitState.textContent = pit === 'gaining' ? 'Gaining' : pit === 'losing' ? 'Losing' : 'Steady';
      pitEl.setAttribute('aria-label', pit === 'gaining'
        ? 'Pit level rising — the well is flowing'
        : pit === 'losing' ? 'Pit level falling — losing returns to the formation'
          : 'Pit level steady');
    }

    /* ── the margin: mud weight against pore pressure, in specific gravity ──
       The sign is carried by the TEXT, not only by the colour: an
       underbalanced well reads "−0.06 sg" whether or not the red lands
       (WCAG 2.1 AA 1.4.1), and the alert says it in words as well. */
    const mtxt = (margin >= 0 ? '+' : '−') + Math.abs(margin).toFixed(2);
    if (mtxt !== wellUi.margin) { wellUi.margin = mtxt; marginV.firstChild.textContent = mtxt; }
    // kickMargin in the sim is 0.02 sg; anything under 0.10 is not a margin
    // you can turn your back on.
    const mcls = margin <= 0 ? 'neg' : margin < 0.10 ? 'thin' : '';
    if (mcls !== wellUi.marginCls) {
      wellUi.marginCls = mcls;
      marginEl.classList.toggle('is-neg', mcls === 'neg');
      marginEl.classList.toggle('is-thin', mcls === 'thin');
    }

    if (!alarm) return null;
    /* The alarm goes to the strip, carrying the sim's own copy. Losses are
       expensive, not lethal: they get the warning band, not the red. */
    let title, sub;
    if (warn) {
      const cp = splitHint(tl.warning.kind, tl.warning.hint);
      title = cp.title; sub = cp.sub;
    } else if (flowing) {
      title = 'Pit gain'; sub = 'The well is flowing — shut it in';
    } else if (killing) {
      title = 'Shut in'; sub = 'Circulating the influx out and weighting up';
    } else {
      title = 'Underbalanced'; sub = 'The column is not holding the formation back';
    }
    return {
      title, sub,
      kind: caution ? 'warn' : 'danger',
      p: clamp(warn ? (tl.warning.progress01 || 0) : 1, 0, 1),
      telegraph: !!(warn && tl.warning.telegraph),
    };
  }

  function resetWell() {
    wellUi.on = false; wellUi.pit = ''; wellUi.margin = '';
    wellUi.marginCls = ''; wellUi.g = ''; wellUi.l = '';
    wellEl.hidden = true;
    pitEl.classList.remove('is-gaining', 'is-losing');
    marginEl.classList.remove('is-neg', 'is-thin');
  }


  /* ═══ Instrument cluster ═══════════════════════════════════════════════ */
  /* 1 border + 8 padding + 92 row + 4 gap + 88 controls + 4 padding = 197px, so
   * 191px of the 388px geological section survives (it was 9.5px). Nothing goes
   * in here without something else coming out. */
  const gaugeCanvas = C.h('canvas', { 'aria-hidden': 'true' });
  /* THE NEEDLE IS NOT ALWAYS TORQUE. sim/drilling.js publishes `gauge.axis`
     with the label, the unit, the normalised value and the value in the
     gauge's OWN units, because on a driven pile the needle is the SET in mm
     per blow, on a piezocone it is the PUSH RATE in mm/s, and on the way back
     up a raise or home along a bore it is PULL. Same dial, same band, same
     groove; the caption and the number under it follow the sim. */
  const gaugeCap = C.h('span.gaugebox__cap', { text: 'Torque' });
  const gaugeBox = C.h('div.gaugebox', {
    role: 'img',
    'aria-label': 'Torque gauge with moving sweet-spot band',
  }, gaugeCanvas, gaugeCap);

  // The band readout used to be a pill parked at 12 o'clock inside the gauge,
  // directly over the arc the sweet spot travels along. It is now the groove
  // chip: one mark for one idea — whether you are in the band, and what the
  // band is paying. Shape carries it without colour: square out, triangle in.
  const grooveX = C.h('span.groove__x', { text: '1.00×' });
  const grooveChip = C.h('div.groove', { role: 'status', 'aria-label': 'Off the sweet-spot band' },
    C.h('i'), grooveX);

  const ropVal = C.h('span.rop__v', { text: '0.0' }, C.h('span.rop__u', { text: 'm/h' }));
  const spark = C.Sparkline({ capacity: 72 });
  spark.el.classList.add('rop__spark');
  // The sparkline behind the value is the trend; the separate ±% chip said the
  // same thing a second time in the same 200px.
  const ropBox = C.h('div.rop',
    spark.el,
    C.h('span.rop__k', { text: 'ROP' }),
    ropVal,
    grooveChip,
  );

  /* ── The beat, INSIDE the cluster ──────────────────────────────────────
     A resin bolt cures, a round is charged, a set is taken over ten blows, a
     cone dissipates. Those waits are the method and they have to be legible —
     but they are also exactly when the rate readout has nothing to say, because
     nothing is being made. So the beat TAKES THE RATE ROW while it runs: no
     new region on the stage, and it is on screen only while something is
     actually running. The resin cure gets its three steps, because getting the
     middle one wrong shears the bond the first one just made. */
  const beatTitle = C.h('span.beat__t', { text: '' });
  const beatLeft = C.h('span.beat__left', { text: '' });
  const beatSub = C.h('span.beat__s', { text: '' });
  const beatSteps = RESIN_STEPS.map(([name]) => C.h('span.beat__step', { text: name }));
  const beatStepsEl = C.h('div.beat__steps', { hidden: true }, ...beatSteps);
  const beatEl = C.h('div.beat', { hidden: true, role: 'status', 'aria-live': 'polite' },
    C.h('div.beat__hd', beatTitle, beatLeft),
    beatSub,
    beatStepsEl,
    C.h('div.beat__rule', C.h('i')),
  );

  /* ONE readout slot beside the gauge, three possible occupants and never two
     at once, so the row cannot grow:
       RATE   while hole is being made,
       BEAT   while the machine is doing something you are waiting on,
       RECORD the driving record, on the one method that makes no hole at all.
     `setReadout` is the only thing that touches their `hidden` flags. */
  const readouts = C.h('div.readouts', ropBox, beatEl);
  let readout = 'rate';

  /* ── Sliders ───────────────────────────────────────────────────────────── */
  function pushControl(key, v) {
    if (state.drill) state.drill[key] = v;
    const sim = ctx.sim;
    if (sim) {
      if (typeof sim.setControl === 'function') sim.setControl(key, v);
      else if (typeof sim.setInput === 'function') sim.setInput(key, v);
    }
  }
  /* The three controls are built once with the rotary vocabulary and then
     re-labelled from the method — the accents and the order never move, so
     the muscle memory survives every method change. */
  const feedSl = C.VSlider({ label: 'Weight on bit', short: 'WOB', kind: 'feed', value: state.drill?.wob ?? 0.5, onChange: (v) => pushControl('wob', v) });
  const rotSl = C.VSlider({ label: 'Rotation', short: 'ROTATION', kind: 'rot', value: state.drill?.rpm ?? 0.5, onChange: (v) => pushControl('rpm', v) });
  const flushSl = C.VSlider({ label: 'Flushing', short: 'FLUSH', kind: 'flush', value: state.drill?.flush ?? 0.5, onChange: (v) => pushControl('flush', v) });

  // Cached at build time; the frame loop never queries the DOM.
  const feedName = feedSl.el.querySelector('.vsl__name');
  const rotName = rotSl.el.querySelector('.vsl__name');
  const flushName = flushSl.el.querySelector('.vsl__name');

  /** The raw game/data.js method record, or null when the data layer is out. */
  function rawMethod(id) {
    const g = ctx.game;
    if (!g || !id) return null;
    try {
      if (typeof g.getMethod === 'function') { const m = g.getMethod(id); if (m) return m; }
      if (Array.isArray(g.METHODS)) return g.METHODS.find((m) => m && m.id === id) || null;
    } catch (e) { console.error('[ui] getMethod', e); }
    return null;
  }

  function setSliderLabel(sl, nameEl, pair, role) {
    if (nameEl && nameEl.textContent !== pair[1]) nameEl.textContent = pair[1];
    sl.el.setAttribute('aria-label', `${pair[0]} — ${pair[2] || CONTROL_ROLE[role]}`);
  }

  /* ── Locked controls ──────────────────────────────────────────────────
     A pushed piezocone does not turn and does not circulate; an SPT drive is
     driven by a falling hammer, not by the feed. The sim publishes those locks
     (`rotationLocked`, `flushLocked`, `feedLocked`) with its own one-line
     reason. A slider that still moves while the machine ignores it is the same
     class of lie as a gauge reading 0 % because nobody mirrored the value, so
     the control is visibly stood down and says why. */
  function setSliderLock(sl, nameEl, locked, note) {
    if (sl.__locked === locked && sl.__note === note) return;
    sl.__locked = locked; sl.__note = note;
    sl.el.classList.toggle('is-locked', !!locked);
    sl.el.setAttribute('aria-disabled', locked ? 'true' : 'false');
    if (locked) {
      sl.el.setAttribute('aria-label', `${nameEl ? nameEl.textContent : 'Control'} — not on this machine: ${note}`);
    }
  }

  /* Only ever re-labels when the method, its kind, its programme or its
     well-control status actually changed: four scalar compares, no allocation. */
  let ctlMethodId, ctlKind, ctlProg, ctlWell = false;
  function syncControlLabels(methodId, kind, hasWell, prog) {
    if (methodId === ctlMethodId && kind === ctlKind
      && hasWell === ctlWell && prog === ctlProg) return;
    ctlMethodId = methodId; ctlKind = kind; ctlWell = hasWell; ctlProg = prog;

    const m = rawMethod(methodId);
    const fam = hasWell ? 'oil' : controlFamily(m, kind, prog);
    const set = CONTROL_SETS[fam] || CONTROL_SETS.rotary;
    const protect = set.protect
      || PROTECT_BY_FLUSH[(m && m.flushMedium) || '']
      || PROTECT_BY_FLUSH.water;

    // data.js may carry the labels itself; when it does, it wins outright.
    const own = m && m.controls;
    const pick = (key, fallback) => {
      const v = own && own[key];
      if (!v) return fallback;
      if (typeof v === 'string') return [v, shortOf(v)];
      const label = v.label || fallback[0];
      return [label, v.short || shortOf(label)];
    };

    setSliderLabel(feedSl, feedName, pick('advance', set.advance), 'advance');
    setSliderLabel(rotSl, rotName, pick('work', set.work), 'work');
    setSliderLabel(flushSl, flushName, pick('protect', protect), 'protect');
  }

  /* ── Contextual action ─────────────────────────────────────────────────── */
  const actLabel = C.h('span.actionbtn__l', { text: 'Hold' });
  const actSub = C.h('span.actionbtn__s', { text: 'Steady on the groove' });
  const actionBtn = C.h('button.actionbtn.actionbtn--ghost', { type: 'button', 'aria-label': 'Contextual action' },
    C.h('span.actionbtn__ico', C.Icon('bit', 20)), actLabel, actSub);
  let actionMode = 'idle';
  let actionTimer = 0;

  C.tap(actionBtn, () => doAction(), { pattern: 'heavy' });

  function setAction(mode) {
    if (mode === actionMode) return;
    actionMode = mode;
    const a = SITE_ACTIONS[mode] || SITE_ACTIONS.idle;
    actLabel.textContent = a.label;
    actSub.textContent = a.sub;
    // The hazard banner owns severity. An urgent action is still the PRIMARY
    // action, so it takes the primary colour and says "urgent" with motion.
    const urgent = a.kind === 'danger';
    actionBtn.className = 'actionbtn actionbtn--' + (urgent ? 'amber' : a.kind) + (urgent ? ' is-urgent' : '');
    actionBtn.setAttribute('aria-label', `${a.label}. ${a.sub}`);
  }

  /**
   * sim/drilling.js verbs, keyed by the HUD's action id.
   *
   * `beat` is the generic timing window every new programme opens — the boom
   * setting up, the cradle indexing, the pile going into the leaders. All
   * three run through the same window check in the sim, so one verb serves
   * them; `release` is the SPT free fall, which is a rhythm and therefore
   * belongs on the big button rather than in the rail with the machine
   * actions. `bail` is the stringless cadence and has no pulse of its own.
   */
  const PULSE = { rod: 'rodStab', jam: 'jamRescue', kick: 'kick', beat: 'stab', release: 'strike' };

  function doAction() {
    const a = SITE_ACTIONS[actionMode] || SITE_ACTIONS.idle;
    const sim = ctx.sim;
    let res = null;
    if (sim) {
      try {
        if (PULSE[actionMode] && typeof sim.pulse === 'function') res = sim.pulse(PULSE[actionMode]);
        else if (actionMode === 'casing' && typeof sim.setCasing === 'function') sim.setCasing(true);
        else if (actionMode === 'trip' && typeof sim.changeBit === 'function') Promise.resolve(sim.changeBit()).catch(() => {});
        else if (typeof sim.pulse === 'function') res = sim.pulse(a.id);
      } catch (e) { console.error('[ui] sim action', e); }
    }

    const d = state.drill || {};
    switch (actionMode) {
      case 'rod':
        if (!ctx.sim) { d.rods = (d.rods || 1) + 1; }
        log(d.depth, `Rod ${d.rods || 1} stabbed`, null);
        say('Rod in', 'A clean stab', 'good');
        if (!ctx.sim) { setAction('idle'); actionTimer = 0; }
        break;
      case 'bail':
        // No rod, no stab. A spudder's beat is the bailer coming out full.
        log(d.depth, 'Bailer run', null);
        say('Bailer out', 'Cuttings lifted', 'good');
        setAction('idle'); actionTimer = 0;
        break;
      case 'beat':
        if (res && res.ok) {
          if (res.good) say('On the beat', 'Window caught', 'good');
          else say('Missed the window', 'It comes round again', 'warn');
        }
        break;
      case 'release':
        // The punishment for a bad release is a WORSE NUMBER, never a fail
        // state, so it is not a hazard and it does not get a banner.
        if (res && res.ok && !res.good) say('Not in free fall', 'Release the hammer cleanly', 'warn');
        break;
      case 'jam':
        if (!ctx.sim) { d.jam = Math.max(0, (d.jam || 0) - 0.34); if (d.jam <= 0.02) { d.jam = 0; app.bus.emit(EVENTS.JAM_CLEARED, {}); } }
        break;
      case 'kick':
        if (!ctx.sim) { d.wob = 0.08; feedSl.set(0.08); }
        pushControl('wob', 0.08);
        log(d.depth, 'Feed killed', 'warn');
        setAction('idle'); actionTimer = 0;
        break;
      case 'casing':
        if (!ctx.sim) { d.stability = Math.min(1, (d.stability || 0) + 0.45); }
        log(d.depth, 'Casing set', null);
        say('Casing driven', 'The hole is secured', 'good');
        setAction('idle'); actionTimer = 0;
        break;
      case 'trip':
        if (!ctx.sim) { d.wear = 0; }
        log(d.depth, 'New crown fitted', null);
        say('New crown on', 'Tripped out and back in', 'info');
        setAction('idle'); actionTimer = 0;
        break;
      default:
        say('Nothing to do', 'Keep it in the band', 'info');
    }
  }

  /**
   * Fire one of the sim's discrete machine actions from the rail.
   *
   * The refusals are the sim's own words, so a rejected tap explains itself
   * instead of doing nothing: `cooldown`, `busy:<phase>`, `already-shortened`,
   * `set-already-taken` and the rest all come back on `{ ok:false, reason }`.
   */
  const PULSE_REFUSAL = {
    'already-shut-in': 'Already shut in — circulating out',
    'method-has-no-bop': 'No preventer on this method',
    'no-lcm-aboard': 'No lost-circulation material aboard',
    'pill-already-spotted': 'The pill is already spotted',
    'no-losses': 'Nothing to spot it across',
    cooldown: 'Not yet — the string is still clearing',
    'no-window': 'The window has gone',
    'already-shortened': 'This round is already shortened',
    'set-already-taken': 'The set on this pile is already taken',
    'not-a-friction-bolt': 'Only a friction bolt has a slot to read',
    'no-bolt-installed': 'Nothing installed to look at yet',
    'no-drive-running': 'No drive running',
    'too-soon': 'One release per cycle — mashing is not a strategy',
  };

  function firePulse(id, a2) {
    if (!id) return;
    const sim = ctx.sim;
    if (!sim || typeof sim.pulse !== 'function') return;
    let r = null;
    try { r = sim.pulse(id); } catch (e) { console.error('[ui] pulse', id, e); return; }
    if (!r || !r.ok) {
      const why = r && r.reason;
      const msg = PULSE_REFUSAL[why]
        || (typeof why === 'string' && why.startsWith('busy:') ? 'The machine is busy' : null);
      if (msg) say('Not yet', msg, 'info');
      return;
    }
    const d = state.drill || {};
    const sub = PULSE_SUB[id] || '';
    switch (id) {
      case 'blowDown': log(d.depth, 'String blown down', null); say('Blown down', 'The sample train is clear', 'good'); break;
      case 'shortRound': log(d.depth, `Round shortened to ${num(r.roundLengthM, 2)} m`, 'warn');
        say('Round shortened', `Taken down to ${num(r.roundLengthM, 2)} m`, 'warn'); break;
      case 'redrill': log(d.depth, 'Re-drilling the hole', 'warn'); break;
      case 'inspectSlot':
        // The slot reading is a MEASUREMENT, so it goes in the log with its
        // number and its unit, not into a toast that scrolls away.
        log(d.depth, `Slot closed ${num(r.slotClosureIn, 4)} in`, r.closedFully ? null : 'warn');
        if (r.closedFully) say('Slot closed', 'Full rock-to-metal contact', 'good');
        else say('Slot barely closed', 'The hole was too big for this bolt', 'warn');
        break;
      case 'torqueTest': log(d.depth, 'Torque test taken', null); break;
      case 'reamHole': log(d.depth, 'Hole reamed open', null); break;
      case 'changeDolly': log(d.depth, 'Dolly changed', null); say('Dolly changed', 'New packing under the helmet', 'good'); break;
      case 'shutIn':
        if (r.flowing) {
          log(d.depth, 'Shut in on the kick', 'bad');
          say('Shut in', 'Circulating the influx out', 'warn');
        } else {
          log(d.depth, 'Flow check — well static', null);
          say('Flow check', 'The well is not flowing', 'good');
        }
        break;
      case 'lcmPill':
        log(d.depth, 'LCM pill spotted', 'warn');
        say('Pill spotted', 'Across the thief zone', 'info');
        break;
      case 'takeSet': log(d.depth, `Taking the set over ${int(r.blows)} blows`, 'warn'); break;
      case 'cleanOut': log(d.depth, 'Base cleaned out', null); break;
      case 'dissipation': log(d.depth, 'Dissipation test', null); break;
      case 'terminate': log(r.depthM, 'Sounding terminated', 'warn');
        say('Terminated', 'At thrust capacity — a reportable result', 'warn'); break;
      default: if (sub) say(a2 && a2.label ? a2.label : 'Done', sub, 'info');
    }
  }

  /* ═══ The action rail — ONLY WHAT IS LIVE ══════════════════════════════
     `telemetry.actions[]` is the sim's own statement of which discrete machine
     actions this method offers, with the label and the `enabled` flag already
     decided. The rail renders ONLY the entries that are enabled right now: a
     greyed-out pill is a permanent reminder of something you cannot do, and it
     costs the same room as one you can. So the rail is empty — and therefore
     absent — most of the time, and a `due` entry (the statutory torque sample)
     is marked, because the end-of-shift audit checks it whether or not the
     player noticed it was owed. */
  const RAIL_MAX = 3;
  const railBtns = [];
  const railEl = C.h('div.actrail', { hidden: true, role: 'group', 'aria-label': 'Machine actions' });
  for (let i = 0; i < RAIL_MAX; i++) {
    const lab = C.h('span.railbtn__l', { text: '' });
    const btn = C.h('button.railbtn', { type: 'button', hidden: true }, lab);
    const slot = { btn, lab, id: null, label: '', due: false, crit: false, armed: false };
    C.tap(btn, () => firePulse(slot.id, slot), { pattern: 'medium' });
    railBtns.push(slot);
    railEl.appendChild(btn);
  }

  /* ═══ The unit card — TRANSIENT ════════════════════════════════════════
     After each finished unit: what you just did, how it scored, and one line
     of consequence. Then it gets out of the way. This is where ANCHORAGE, the
     resin mix you actually held, the recovery on the bag and the crown you
     spent belong — they are outcomes, and an outcome nailed to the stage for
     the whole run is a number nobody is acting on. */
  const unitTitle = C.h('p.unitcard__t', { text: '' });
  const unitRows = C.h('div.unitcard__rows');
  const unitNote = C.h('p.unitcard__n', { text: '' });
  const unitCells = [0, 1, 2, 3].map(() => {
    const k = C.h('span.ucell__k', { text: '' });
    const v = C.h('span.ucell__v', { text: '' });
    const el0 = C.h('div.ucell', { hidden: true }, k, v);
    unitRows.appendChild(el0);
    return { el: el0, k, v };
  });
  const unitCard = C.h('div.unitcard', { hidden: true, role: 'status', 'aria-live': 'polite' },
    unitTitle, unitRows, unitNote);
  C.tap(unitCard, () => hideUnit(), { pattern: 'light' });

  /* ═══ THE DRIVING RECORD ═══════════════════════════════════════════════
     GAMEDESIGN §7: on a driven pile THE DEPTH RULER BECOMES THE BLOW-COUNT
     BAR CHART — blows per 250 mm over the drive, tightening to 25 mm through
     the final metre. It is not an extra card and it is not on the render: a
     pile makes no hole, no cuttings and no metres per hour, so on that one
     method the driving record IS the rate readout and it takes that slot. */
  const blowCanvas = C.h('canvas', { 'aria-hidden': 'true' });
  const blowCap = C.h('span.blowchart__cap', { text: 'Blows / 250 mm' });
  const blowEl = C.h('div.blowchart', {
    hidden: true, role: 'img',
    'aria-label': 'Blow count per driven increment, deepest at the right',
  }, blowCanvas, blowCap);
  readouts.appendChild(blowEl);

  /* ═══ THE STACKED COLUMN ═══════════════════════════════════════════════
     Four rows, and the middle two are the 3D's.

       ┌──────────────────────────┐
       │ status strip             │  --hud-top
       ├──────────────────────────┤
       │ SURFACE 3D               │  flex 54   ← nothing over it, ever
       ├──────────────────────────┤
       │ SECTION 3D               │  flex 46   ← nothing over it, ever
       ├──────────────────────────┤
       │ instrument dock          │  --hud-dock
       └──────────────────────────┘

     The two band elements are SPACERS. They hold the 3D's share of the
     column, they are never painted, never hit-tested and never given a child.
     Everything the screen has to say lives in the strip or in the dock, in a
     slot that is already there whether or not it is occupied — which is why
     nothing on this screen can cover a band OR make the layout jump.

     The dock is one flat surface with three fixed rows: the instrument row
     (the gauge and one readout), the auxiliary row (the action rail, or the
     well strip, and absent entirely on a method that can use neither), and
     the controls. The unit card takes the first two of those over for a few
     seconds at a unit boundary and leaves the sliders live underneath, so the
     player never loses the machine to a piece of information. */
  /* `cluster` is a COMPATIBILITY ALIAS, not a second name for the dock. The
     QA harness proves a site shot is really a site shot by counting
     `.cluster` (tools/shoot.mjs:414 → its `site HUD is up` check at :749),
     and the instrument cluster is this element now. The class carries no CSS
     at all. When tools/ moves that count to `.sitedock`, delete it here. */
  /* Named, because the unit card does not COVER these two rows — it takes
     them. `showUnit`/`hideUnit` hide them outright while it is up. An opaque
     card laid over live rows still leaves them painted and hit-testable: the
     gauge, its caption and `.railbtn` all went on drawing underneath, an
     enumerating harness counts every one of those as an overlap, and a button
     the player cannot see is a button they can still hit. */
  const dockInst = C.h('div.dock__inst', gaugeBox, readouts);
  /* Instrument, then decision, then action — left to right, the order a
     driller reads them in. */
  const dockAux = C.h('div.dock__aux', wellEl, railEl);

  const dock = C.h('div.sitedock.cluster',
    dockInst,
    dockAux,
    C.h('div.dock__ctl',
      C.h('div.controls__sliders', feedSl.el, rotSl.el, flushSl.el),
      actionBtn,
    ),
    unitCard,
  );

  const el = C.h('div.site',
    sstrip,
    C.h('div.siteband.siteband--surface', { 'aria-hidden': 'true' }),
    C.h('div.siteband.siteband--section', { 'aria-hidden': 'true' }),
    dock,
  );


  /* ═══ Canvas gauge ═════════════════════════════════════════════════════ */
  const g2d = gaugeCanvas.getContext('2d');
  let gW = 158, gH = 90, gDpr = 1;
  let tokens = null;

  function readTokens() {
    const cs = getComputedStyle(el);
    const t = (n, fallback) => (cs.getPropertyValue(n) || fallback).trim();
    tokens = {
      amber: t('--rgb-amber', '223 181 82'),
      amberHot: t('--rgb-amber-hot', '245 207 106'),
      success: t('--rgb-success', '16 185 129'),
      danger: t('--rgb-danger', '239 68 68'),
      warning: t('--rgb-warning', '240 179 25'),
      steel: t('--rgb-steel', '63 146 166'),
      fg: t('--rgb-fg', '250 250 250'),
      border: t('--rgb-border', '40 48 59'),
      black: t('--rgb-black', '0 0 0'),
      // Cached here so the frame loop never reads computed style.
      fontBig: '850 19px ' + t('--font-sans', 'sans-serif'),
      fontUnit: '800 11px ' + t('--font-sans', 'sans-serif'),
    };
  }
  const rgba = (trip, a) => `rgb(${trip} / ${a})`;

  /* A 180° sweep, not 200°. The old dial spent 20° of its travel below the
     horizon on both sides, which cost vertical space without adding arc: at the
     same box height the semicircle carries a 10% larger radius. */
  const A0 = Math.PI;
  const SWEEP = Math.PI;
  const REDLINE = 0.86;
  /* The caption row at the foot of the box. COUPLED to `.gaugebox__cap`'s
     `height` in src/ui/styles.css — 14px is the line box this 11px text
     actually paints, and an 11px row let it spill onto the dial. */
  const CAP_H = 14;

  /** roundRect is not in every Safari the game has to run on. */
  function roundRectPath(c, x, y, w, h, rr) {
    if (typeof c.roundRect === 'function') { c.beginPath(); c.roundRect(x, y, w, h, rr); return; }
    const k = Math.min(rr, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + k, y);
    c.arcTo(x + w, y, x + w, y + h, k);
    c.arcTo(x + w, y + h, x, y + h, k);
    c.arcTo(x, y + h, x, y, k);
    c.arcTo(x, y, x + w, y, k);
    c.closePath();
  }

  /* THE CANVAS IS THE BOX MINUS THE CAPTION ROW.
     The caption used to be absolutely positioned over the bottom `CAP_H` px
     of the dial; `styles.css .gaugebox` is now a flex column and the caption
     is a real row in it. The canvas therefore no longer contains the caption
     and must not be sized as if it did — taking the whole box height pushed
     the 11px caption out of the bottom of `.gaugebox` entirely, where it
     painted on the dial above it AND on `.railbtn` in the aux row below.
     `cy` below drops its own `- CAP_H` for the same reason: the space is
     already gone from `gH`, and subtracting it twice moved the dial up. */
  function resizeGauge() {
    const r = gaugeBox.getBoundingClientRect();
    // Not laid out — the unit card has the instrument row. Keep the last good
    // size rather than writing a fallback one over it.
    if (!r.width || !r.height) return;
    gW = Math.max(80, Math.round(r.width || 158));
    gH = Math.max(48, Math.round((r.height || 90) - CAP_H));
    gDpr = app.viewport.dpr || window.devicePixelRatio || 1;
    gaugeCanvas.width = Math.round(gW * gDpr);
    gaugeCanvas.height = Math.round(gH * gDpr);
    gaugeCanvas.style.width = gW + 'px';
    gaugeCanvas.style.height = gH + 'px';
    readTokens();
  }

  function arc(c, cx, cy, r, a, b, w, style, cap = 'butt') {
    c.beginPath();
    c.arc(cx, cy, r, a, b);
    c.lineWidth = w; c.strokeStyle = style; c.lineCap = cap;
    c.stroke();
  }

  const needle = new C.Spring(0, 118, 17);   // real physical lag
  let bandLo = 0.42, bandHi = 0.58;
  let inBand = false;

  /**
   * The live gauge spec, mirrored straight off `telemetry.gauge`.
   *
   * `num`/`unit` are what goes on the knockout plate at the centre of the
   * dial. On torque and pull the honest reading is the normalised percentage
   * of the rig limit; on a set gauge and a push-rate gauge the sim carries
   * the value in real units (`real`) and the plate prints THAT, because
   * "37 %" of a set is not a thing a pile driver has ever read.
   */
  const gauge = { axis: 'torque', label: 'TORQUE', unit: '', redline: true, cap: 'Torque' };
  /* This frame's raw `telemetry.gauge`, or null with no sim. The plate reads
     `real` off it, so it must be the sim's object and not a copy. */
  let lastGauge = null;

  /** How the plate reads this axis. Nothing here re-derives a sim number. */
  function gaugePlate(g, v) {
    const axis = (g && g.axis) || 'torque';
    const real = g ? Number(g.real) : 0;
    if (axis === 'set') return [Number.isFinite(real) ? real.toFixed(1) : '—', 'mm'];
    if (axis === 'push-rate') return [Number.isFinite(real) ? real.toFixed(1) : '—', 'mm/s'];
    // Torque and pull are both fractions of the machine's limit.
    return [String(Math.round(clamp(v, 0, 1.25) * 100)), '%'];
  }

  /** The caption strip under the dial: the label, and the unit when it has one. */
  function gaugeCaption(g) {
    const label = (g && g.label) || 'TORQUE';
    const unit = (g && g.unit) || '';
    const cap = label.charAt(0) + label.slice(1).toLowerCase();
    return unit ? `${cap} · ${unit}` : cap;
  }

  function syncGauge(g) {
    const axis = (g && g.axis) || 'torque';
    const label = (g && g.label) || 'TORQUE';
    const unit = (g && g.unit) || '';
    if (axis === gauge.axis && label === gauge.label && unit === gauge.unit) return;
    gauge.axis = axis; gauge.label = label; gauge.unit = unit;
    /* The red line is the RIG LIMIT, and that is a torque idea. A set gauge's
       danger is at the OTHER end — a vanishing set is refusal, not overload —
       and the sim does not publish that threshold in normalised units, so the
       dial does not draw a rule it would have to invent the position of. The
       design-set window is already on the dial as the band, and the blows per
       250 mm are on the programme bar against the practical and refusal
       limits the sim does publish. */
    gauge.redline = axis === 'torque';
    const cap = gaugeCaption(g);
    if (gaugeCap.textContent !== cap) gaugeCap.textContent = cap;
    gaugeBox.setAttribute('aria-label', `${cap} gauge with moving sweet-spot band`);
  }

  function drawGauge(torque) {
    if (!tokens) readTokens();
    const c = g2d;
    c.setTransform(gDpr, 0, 0, gDpr, 0, 0);
    c.clearRect(0, 0, gW, gH);

    /* The dial sits on its own baseline with the caption strip below it. Both
       clearances are real: the 13px band halo must not clip at 12 o'clock, and
       the hub must not touch the caption — it used to overlap it by 3px. */
    const cx = gW / 2;
    const cy = gH - 10;   // CAP_H already removed from gH in resizeGauge()
    const r = Math.min(gW / 2 - 8, cy - 7);
    const at = (v) => A0 + SWEEP * clamp(v, 0, 1);
    const bandW = bandHi - bandLo;

    // Track
    arc(c, cx, cy, r, A0, A0 + SWEEP, 9, rgba(tokens.black, 0.5), 'round');
    arc(c, cx, cy, r, A0, A0 + SWEEP, 7, rgba(tokens.border, 0.95), 'round');

    // Ticks, under the marks that matter.
    c.strokeStyle = rgba(tokens.fg, 0.34);
    c.lineWidth = 1.4;
    for (let i = 0; i <= 10; i++) {
      const a = at(i / 10);
      const ca = Math.cos(a), sa = Math.sin(a);
      const inner = r - (i % 5 === 0 ? 15 : 12.5);
      c.beginPath();
      c.moveTo(cx + ca * inner, cy + sa * inner);
      c.lineTo(cx + ca * (r - 5.5), cy + sa * (r - 5.5));
      c.stroke();
    }

    // Redline — the rig's torque limit, and only on the axis that has one.
    if (gauge.redline) arc(c, cx, cy, r, at(REDLINE), at(1), 7, rgba(tokens.danger, 0.55));

    /* The sweet spot is the whole point of the dial, so it is the most
       prominent mark on it: a wide halo, a near-opaque core, a glow when the
       needle is inside, and — only when the band is wide enough for the hatch
       to read as texture rather than as chopping — the colour-blind hatch. */
    arc(c, cx, cy, r, at(bandLo), at(bandHi), 13, rgba(tokens.success, inBand ? 0.34 : 0.22));
    c.save();
    if (inBand) { c.shadowColor = rgba(tokens.success, 0.9); c.shadowBlur = 10; }
    arc(c, cx, cy, r, at(bandLo), at(bandHi), 7, rgba(tokens.success, inBand ? 0.98 : 0.85));
    c.restore();
    if (bandW > 0.22) {
      c.save();
      c.strokeStyle = rgba(tokens.black, 0.45);
      c.lineWidth = 1.6;
      const steps = Math.max(2, Math.round(bandW * 22));
      for (let i = 1; i < steps; i++) {
        const a = at(bandLo + bandW * (i / steps));
        const ca = Math.cos(a), sa = Math.sin(a);
        c.beginPath();
        c.moveTo(cx + ca * (r - 3.4), cy + sa * (r - 3.4));
        c.lineTo(cx + ca * (r + 3.4), cy + sa * (r + 3.4));
        c.stroke();
      }
      c.restore();
    }

    // Value arc
    const v = clamp(torque, 0, 1);
    const valCol = (gauge.redline && v > REDLINE) ? tokens.danger
      : inBand ? tokens.success : tokens.amber;
    arc(c, cx, cy, r - 8.5, A0, at(v), 3, rgba(valCol, 0.9), 'round');

    // Needle
    const na = at(needle.value);
    const nc = Math.cos(na), ns = Math.sin(na);
    c.save();
    c.shadowColor = rgba(tokens.black, 0.8);
    c.shadowBlur = 6; c.shadowOffsetY = 1;
    c.beginPath();
    c.moveTo(cx - nc * 9, cy - ns * 9);
    c.lineTo(cx + nc * (r - 3), cy + ns * (r - 3));
    c.lineWidth = 2.6; c.lineCap = 'round';
    c.strokeStyle = rgba(tokens.fg, 0.97);
    c.stroke();
    c.restore();

    // Hub
    c.beginPath(); c.arc(cx, cy, 7.5, 0, Math.PI * 2);
    c.fillStyle = rgba(tokens.black, 0.85); c.fill();
    c.lineWidth = 1.5; c.strokeStyle = rgba(valCol, 0.9); c.stroke();

    /* Readout. The needle used to stroke straight through the numerals; it now
       passes UNDER a knockout plate. One label for one quantity: the unit is
       folded into the value and the caption below the dial names the axis.
       On a set or push-rate gauge the number is the sim's own `gauge.real`,
       in its own units — a pile driver reads mm per blow, never a percent. */
    const [plateNum, plateUnit] = gaugePlate(lastGauge, v);
    c.font = tokens.fontBig;
    const wNum = c.measureText(plateNum).width;
    c.font = tokens.fontUnit;
    const wUnit = c.measureText(plateUnit).width;
    const wTot = wNum + 3 + wUnit;
    const plateW = Math.min(gW - 12, wTot + 18);
    const plateH = 24;
    const plateY = cy - 12 - plateH;
    c.fillStyle = rgba(tokens.black, 0.72);
    roundRectPath(c, cx - plateW / 2, plateY, plateW, plateH, 7);
    c.fill();

    c.textAlign = 'left'; c.textBaseline = 'middle';
    const tx = cx - wTot / 2;
    const ty = plateY + plateH / 2 + 0.5;
    c.font = tokens.fontBig;
    c.fillStyle = rgba(tokens.fg, 0.97);
    c.fillText(plateNum, tx, ty);
    c.font = tokens.fontUnit;
    c.fillStyle = rgba(tokens.fg, 0.72);
    c.fillText(plateUnit, tx + wNum + 3, ty);
  }

  /* ═══ Sweet-spot normalisation — the sim may report any of these ═══════ */
  function readSweetSpot() {
    const sim = ctx.sim;
    let ss = null;
    if (sim && typeof sim.getSweetSpot === 'function') {
      try { ss = sim.getSweetSpot(); } catch (e) { ss = null; }
    }
    if (ss === null || ss === undefined) return null;
    if (typeof ss === 'number') return [clamp(ss - 0.08, 0, 1), clamp(ss + 0.08, 0, 1)];
    if (Array.isArray(ss)) return [clamp(ss[0], 0, 1), clamp(ss[1], 0, 1)];
    const lo = ss.min ?? ss.lo ?? ss.low ?? ss.start ?? ss.from;
    const hi = ss.max ?? ss.hi ?? ss.high ?? ss.end ?? ss.to;
    if (lo !== undefined && hi !== undefined) return [clamp(lo, 0, 1), clamp(hi, 0, 1)];
    // sim/drilling.js reports { center01, halfWidth01, display01, inBand, combo }
    const cen = ss.display01 ?? ss.center01 ?? ss.center ?? ss.centre ?? ss.c ?? ss.mid;
    const half = ss.halfWidth01 ?? ss.halfWidth ?? ss.half;
    if (cen !== undefined && half !== undefined) return [clamp(cen - half, 0, 1), clamp(cen + half, 0, 1)];
    const wid = ss.width ?? ss.w ?? ss.size ?? 0.16;
    if (cen !== undefined) return [clamp(cen - wid / 2, 0, 1), clamp(cen + wid / 2, 0, 1)];
    return null;
  }

  /**
   * Tell core/renderer.js how much of the stage the HUD has reserved.
   *
   * The two 3D bands must not extend under the chrome: `computeLayout()`
   * should carve `ctx.hud.top` and `ctx.hud.bottom` off `stage.h` and split
   * only the remainder 54/46, so the seam lands on the boundary between the
   * two spacer rows instead of at 54 % of the whole screen. These are the
   * measured CSS pixels of `--hud-top` and `--hud-dock`, and the dock's
   * height depends on the method — see `.sitedock--plain` — which is exactly
   * why this is published rather than hardcoded. `LAYOUT.chromeTop` /
   * `chromeBottom` in core/contract.js carry the same two numbers as
   * fractions for a consumer that has no live screen to ask.
   *
   * Called twice per run, never per frame.
   */
  function publishChrome() {
    if (!el.isConnected) return;
    const top = Math.round(sstrip.getBoundingClientRect().height);
    const bottom = Math.round(dock.getBoundingClientRect().height);
    const prev = ctx.hud;
    if (prev && prev.top === top && prev.bottom === bottom) return;
    ctx.hud = { top, bottom };
    /* Nothing consumes this yet, and re-laying the composer out costs a
       render-target reallocation — so the nudge is opt-in. core/renderer.js
       sets `usesHudChrome = true` when `computeLayout()` starts reading
       `ctx.hud`, and only then does a change of chrome height re-derive the
       bands. Until it does, this function writes one small object and stops. */
    if (ctx.renderer && ctx.renderer.usesHudChrome
      && typeof ctx.renderer.resize === 'function' && app.viewport) {
      try { ctx.renderer.resize(app.viewport.w, app.viewport.h, app.viewport.dpr); }
      catch (e) { console.error('[ui] renderer.resize', e); }
    }
  }

  /* ═══ Live telemetry from sim/drilling.js ═══ */
  let simTel = null;
  /* The dock's shape is decided ONCE per run, on the first telemetry frame.
     See `lockDock()`. */
  let dockLocked = false;

  /** Normalise getTelemetry() onto the field names paint() reads. */
  function telemetry() {
    const sim = ctx.sim;
    if (!sim || typeof sim.getTelemetry !== 'function') { simTel = null; return null; }
    let tl;
    try { tl = sim.getTelemetry(); } catch (e) { simTel = null; return null; }
    if (!tl) { simTel = null; return null; }
    simTel = tl;
    return {
      depth: tl.depthDisplay ?? tl.depth ?? 0,
      target: tl.target ?? 0,
      torque: tl.torqueDisplay ?? tl.torque ?? 0,
      rop: tl.ropDisplay ?? tl.rop ?? 0,
      wear: tl.wearDisplay ?? tl.wear ?? 0,
      heat: tl.heatDisplay ?? tl.heat ?? 0,
      load: tl.loadDisplay ?? tl.load,
      stability: tl.stabilityDisplay ?? tl.stability ?? 1,
      inGreenBand: !!tl.inGreenBand,
      greenBandTime: tl.greenBandTime ?? 0,
      combo: tl.comboDisplay ?? tl.combo,
      timeSec: tl.timeSec,
      jam: tl.jam ? (tl.jam.bind01 || 0) : 0,
      wob: tl.wob ?? 0.5, rpm: tl.rpm ?? 0.5, flush: tl.flush ?? 0.5,
      rods: tl.rods ?? 1,
      stratum: tl.stratum || null,
      active: tl.active,
      returns: tl.returns ?? 1,
    };
  }

  /**
   * The action the sim says is available right now.
   *
   * Priority is "what would end the run badly first", then "what is on a
   * clock", then housekeeping:
   *   1. a stuck string — you cannot trip or case your way out of it
   *   2. a timing window that is open right now: the rod stab, the pile going
   *      into the leaders, the cradle indexing, the boom setting up
   *   3. the SPT free-fall release, which is a rhythm and not a machine action
   *   4. a statutory action that has come DUE (the torque sample)
   *   5. lost returns, casing, a finished crown
   *
   * A method with no drill string never offers a rod: `hasDrillString` says so
   * and the bailing run takes its place.
   */
  function simAction() {
    const tl = simTel;
    if (!tl) return null;
    if (tl.jam && tl.jam.state && tl.jam.state !== 'free') return 'jam';
    if (tl.phase === 'rod-add' && tl.rodAdd && !tl.rodAdd.hit && !tl.rodAdd.missed) {
      return tl.hasDrillString === false ? 'bail' : 'rod';
    }
    const b = tl.beat;
    if (b && b.hasWindow && !b.hit && !b.missed) return 'beat';
    if (b && b.kind === 'spt-drive') return 'release';
    if (tl.phase === 'tripping-out' || tl.phase === 'tripping-in'
      || tl.phase === 'bit-swap' || tl.phase === 'casing-run') return 'idle';
    /* On a well the answer to lost returns is to cut the pumps and spot a
       pill, not to jolt the string — the well-control panel owns that response
       and offering "Kill Feed" here would teach the wrong reflex. */
    if (tl.flags && tl.flags.lostCirculation && tl.kickReady && !tl.well) return 'kick';
    if (tl.canCase && !tl.casingOn && (tl.stabilityDisplay ?? tl.stability ?? 1) < 0.35) return 'casing';
    // Blind wear is the BOOK number; the sim already decides which to publish.
    if ((tl.wear ?? 0) > 0.9) return 'trip';
    return 'idle';
  }

  /* ═══ Local demo drilling — only when sim/drilling.js is absent ════════ */
  const demo = { t: 0, band: 0.5, bandV: 0.11, next: 6 + Math.random() * 8, strata: [], si: -1 };

  function ensureStrata() {
    let st = state.world?.strata;
    if (!st || !st.length) st = state.contract ? (app.strataFor(state.contract) || []) : [];
    if (!st.length) st = strataFromProfile(DEMO_PROFILE, 72);
    if (state.world) state.world.strata = st;
    demo.strata = st;
    return st;
  }

  function stratumAt(depth) {
    let st = demo.strata.length ? demo.strata : ensureStrata();
    if (!st.length) st = ensureStrata();
    for (let i = 0; i < st.length; i++) if (depth < st[i].bottom) return { s: st[i], i };
    return { s: st[st.length - 1], i: st.length - 1 };
  }

  function stepDemo(dt) {
    const d = state.drill;
    if (!d) return;
    demo.t += dt;
    const { s, i } = stratumAt(d.depth);
    if (i !== demo.si) {
      demo.si = i;
      d.stratumIndex = i;
      app.bus.emit(EVENTS.STRATUM_ENTER, { stratum: s, depth: d.depth });
    }

    // Sweet spot drifts with the formation.
    demo.band += demo.bandV * dt;
    if (demo.band > 0.78) { demo.band = 0.78; demo.bandV *= -1; }
    if (demo.band < 0.24) { demo.band = 0.24; demo.bandV *= -1; }

    const hardness = clamp(0.12 + s.ucs / 320, 0.12, 1);
    const target = clamp(0.15 + d.wob * 0.52 + hardness * 0.45 - d.flush * 0.10 + Math.sin(demo.t * 2.3) * 0.03, 0, 1.15);
    d.torque = damp(d.torque, target, 5, dt);

    const bandW = 0.15;
    const within = Math.abs(d.torque - demo.band) < bandW / 2;
    d.inGreenBand = within;
    d.greenBandTime = within ? (d.greenBandTime || 0) + dt : Math.max(0, (d.greenBandTime || 0) - dt * 1.8);
    const groove = 1 + clamp((d.greenBandTime || 0) / 6, 0, 1) * 1.2;

    const eff = (0.35 + d.wob * 0.7) * (0.4 + d.rpm * 0.8) / (0.5 + hardness * 2.2);
    d.rop = clamp(eff * groove * 42, 0, 90) * (1 - clamp(d.wear, 0, 1) * 0.6) * (d.jam > 0 ? 0.05 : 1);
    d.depth = Math.min(d.target || 72, d.depth + (d.rop / 3600) * dt * 22);

    d.wear = clamp(d.wear + s.abrasivity * d.rpm * dt * 0.0075, 0, 1);
    d.heat = clamp(d.heat + (d.rpm * 0.16 - d.flush * 0.19) * dt, 0, 1);
    const cuttings = clamp(0.15 + d.wob * 0.5 - d.flush * 0.55, 0, 1);
    d.stability = clamp(damp(d.stability, s.stability - cuttings * 0.25, 1.2, dt), 0, 1);
    if (d.jam > 0) d.jam = clamp(d.jam - dt * 0.03, 0, 1);
    else if (cuttings > 0.7 && Math.random() < dt * 0.25) { d.jam = 0.6; app.bus.emit(EVENTS.JAM, { severity: 0.6 }); }

    // Rod add every 3 m.
    const rodsNeeded = Math.floor(d.depth / 3) + 1;
    if (rodsNeeded > (d.rods || 1) && actionMode !== 'rod') {
      d.rods = rodsNeeded;
      app.bus.emit(EVENTS.ROD_ADDED, { count: rodsNeeded });
    }

    // Occasional formation events.
    demo.next -= dt;
    if (demo.next <= 0) {
      demo.next = 12 + Math.random() * 16;
      const roll = Math.random();
      if (s.water > 0.6 && roll < 0.4) app.bus.emit(EVENTS.WATER_STRIKE, { depth: d.depth, flowLpm: Math.round(20 + Math.random() * 400) });
      else if (s.ucs > 100 && roll < 0.7) app.bus.emit(EVENTS.BOULDER, { depth: d.depth });
      else if (s.stability < 0.3) app.bus.emit(EVENTS.CAVITY, { depth: d.depth, height: 0.6 + Math.random() * 3 });
    }

    if (d.wear > 0.92 && actionMode !== 'trip') app.bus.emit(EVENTS.BIT_WORN, { wear: d.wear });
    if (d.depth >= (d.target || 72) - 0.01 && d.active) {
      d.active = false;
      app.bus.emit(EVENTS.HOLE_COMPLETE, { depth: d.depth, timeSec: elapsed, grade: null });
    }
  }

  /* ═══ Per-frame paint ══════════════════════════════════════════════════ */
  /* The run clock. sim/drilling.js keeps its own S.timeSec and does NOT set
     state.drill.active, so the old `if (state.drill?.active) elapsed += dt`
     never ticked with the real sim running — which is how the results screen
     came to claim 28.1 m drilled in 00:00 at 1 m/h. Mirror the sim's clock
     when there is one, and integrate locally only for the standalone demo. */
  let elapsed = 0;
  let lastRop = 0, sparkAccum = 0, progAccum = 0;
  let lastStratumId = null;
  /* A ground contact seen this frame, waiting for the alert channel to be
     free. Held for one frame only — a contact is worth saying when it
     happens, and not a second later. */
  let pendingContact = null;
  let lastLoggedDepth = 0;
  let lastJobP = '';
  const moneyRoll = C.NumberRoll(moneyEl, { value: 0, duration: 0.6, format: (v) => fmtMoney(v) });

  /* ═══ The unit card ════════════════════════════════════════════════════
     Fires on a unit boundary — a bag cut, a round fired, a bolt in, a set
     taken, an SPT test finished — shows what happened for a few seconds, and
     leaves. Tap dismisses it early. */
  const UNIT_SEC = 4.2;
  let unitT = 0;
  let unitStamp = null;
  let unitKind = '';

  function hideUnit() {
    if (unitCard.hidden) return;
    unitT = 0;
    unitCard.hidden = true;
    unitCard.className = 'unitcard';
    // Give the instrument and auxiliary rows their slot back.
    dockInst.classList.remove('is-taken');
    dockAux.classList.remove('is-taken');
    // The gauge and the sparkline were not laid out while they were hidden.
    requestAnimationFrame(() => { resizeGauge(); sizeSpark(); if (blowOn) resizeBlow(); });
  }

  function showUnit(card) {
    if (!card) return;
    unitTitle.textContent = card.title;
    const rows = card.rows || [];
    for (let i = 0; i < unitCells.length; i++) {
      const cell = unitCells[i], spec = rows[i];
      cell.el.hidden = !spec;
      if (spec) { cell.k.textContent = spec[0]; cell.v.textContent = String(spec[1]); }
    }
    unitNote.textContent = card.note || '';
    unitNote.hidden = !card.note;
    unitCard.className = 'unitcard' + (card.tone ? ' unitcard--' + card.tone : '');
    unitCard.hidden = false;
    /* TAKE the two rows, do not cover them. Same picture, minus the elements
       that used to keep painting and hit-testing behind an opaque card. */
    dockInst.classList.add('is-taken');
    dockAux.classList.add('is-taken');
    if (!app.reducedMotion) {
      unitCard.style.animation = 'none';
      void unitCard.offsetWidth;
      unitCard.style.animation = '';
    }
    unitT = app.reducedMotion ? UNIT_SEC * 1.6 : UNIT_SEC;
    app.haptic(card.tone === 'bad' ? 'heavy' : 'medium');
    // The run log keeps it for the results screen; the screen itself does not.
    log(state.drill?.depth, card.title, card.tone === 'good' ? null : card.tone);
  }

  /**
   * Has a unit finished since the last frame?
   *
   * `stamp` is a scalar the sim only moves when a unit completes, so this
   * needs no event plumbing and cannot double-fire. A programme change resets
   * it rather than firing, because arriving on a new method is not an outcome.
   */
  function checkUnit(prog, tl) {
    const key = progKey(prog);
    const view = UNIT_VIEWS[key];
    if (!prog || !view) { unitStamp = null; unitKind = key; return; }
    const stamp = view.stamp(prog);
    if (key !== unitKind) { unitKind = key; unitStamp = stamp; return; }
    if (unitStamp === null) { unitStamp = stamp; return; }
    if (stamp === unitStamp || !(stamp > unitStamp)) { unitStamp = stamp; return; }
    unitStamp = stamp;
    let card = null;
    try { card = view.card(prog, tl || {}); } catch (e) { console.error('[ui] unit card', e); }
    if (card) showUnit(card);
  }

  /* ═══ The beat, in the cluster's readout slot ══════════════════════════ */
  const beatUi = { on: false, key: '', title: '', sub: '', left: '', steps: -1, p: '' };
  /* The resin cure is three jobs in one beat and the sim does not publish the
     boundaries — but it DOES fire the `gel-clock` hazard exactly when the gel
     window opens, which is the only boundary that matters. Seeing it is how
     the HUD knows the spin is over; it resets when a new install starts. */
  let gelSeen = false;

  function beatCopyFor(tl) {
    const b = tl.beat;
    const kind = b ? b.kind : tl.phase;
    const copy = BEAT_COPY[kind];
    if (!copy) return null;
    if (kind === 'bolt-install' && b && b.data) {
      if (b.data.type === 'resin') return ['Resin bolt curing', 'Spin, stop, hold — in that order'];
      if (b.data.type === 'friction') return ['Driving the friction bolt', 'The drive time is the tell'];
    }
    return copy;
  }

  function hazardLive(tl, kind) {
    if (!tl || !Array.isArray(tl.hazards)) return false;
    for (const h of tl.hazards) if (h && h.kind === kind) return true;
    return false;
  }

  /**
   * Hand the one readout slot to one occupant. The beat outranks the driving
   * record, which outranks the rate; nothing else may set these flags.
   * @param {'rate'|'beat'|'blow'} which
   */
  function setReadout(which) {
    if (which === readout) return;
    readout = which;
    ropBox.hidden = which !== 'rate';
    beatEl.hidden = which !== 'beat';
    blowEl.hidden = which !== 'blow';
    if (which === 'blow') { blowKey = ''; requestAnimationFrame(resizeBlow); }
  }

  function paintBeat(tl) {
    const b = tl && tl.beat;
    const copy = tl ? beatCopyFor(tl) : null;
    if (!copy) {
      if (beatUi.on) {
        beatUi.on = false;
        beatStepsEl.hidden = true;
        beatUi.key = ''; gelSeen = false;
      }
      // The beat TAKES the slot: nothing is being made while it runs, so the
      // rate has nothing to say and the stage gains no new region.
      setReadout(blowOn ? 'blow' : 'rate');
      return;
    }
    const key = (b ? b.kind : tl.phase) + ':' + (b ? Math.round(b.dur * 10) : 0);
    if (!beatUi.on) beatUi.on = true;
    setReadout('beat');
    if (key !== beatUi.key) { beatUi.key = key; gelSeen = false; }

    if (copy[0] !== beatUi.title) { beatUi.title = copy[0]; beatTitle.textContent = copy[0]; }

    /* The resin steps. SPIN until the gel clock fires, GEL while it is live —
       the one moment rotation must stop — and HOLD after it. */
    const resin = !!(b && b.kind === 'bolt-install' && b.data && b.data.type === 'resin');
    let sub = copy[1];
    let step = -1;
    if (resin) {
      const gelling = hazardLive(tl, 'gel-clock');
      if (gelling) gelSeen = true;
      step = gelling ? 1 : gelSeen ? 2 : 0;
      sub = RESIN_STEPS[step][1];
    }
    if (step !== beatUi.steps) {
      beatUi.steps = step;
      beatStepsEl.hidden = step < 0;
      for (let i = 0; i < beatSteps.length; i++) {
        beatSteps[i].classList.toggle('is-on', i === step);
        beatSteps[i].classList.toggle('is-done', step >= 0 && i < step);
      }
    }
    if (sub !== beatUi.sub) { beatUi.sub = sub; beatSub.textContent = sub; }

    const dur = b ? Number(b.dur) || 0 : 0;
    const t = b ? Number(b.t) || 0 : 0;
    const left = dur > 0 ? `${Math.max(0, dur - t).toFixed(1)} s` : '';
    if (left !== beatUi.left) { beatUi.left = left; beatLeft.textContent = left; }
    const p01 = dur > 0 ? clamp(t / dur, 0, 1) : 0;
    const ptxt = p01.toFixed(3);
    if (ptxt !== beatUi.p) {
      beatUi.p = ptxt;
      beatEl.style.setProperty('--p', ptxt);
      // An indeterminate wait (a trip, a casing run) is marked as one rather
      // than shown as a rule sitting at zero.
      beatEl.classList.toggle('is-indeterminate', dur <= 0);
    }
  }

  /* ═══ The action rail ══════════════════════════════════════════════════ */
  let railOn = false;
  function paintRail(tl) {
    // ONLY what is live. A disabled pill is a standing reminder of something
    // you cannot do, and it costs the same room as one you can.
    const list = (tl && Array.isArray(tl.actions))
      ? tl.actions.filter((a) => a && a.enabled !== false) : [];
    const show = list.length > 0;
    if (show !== railOn) { railOn = show; railEl.hidden = !show; }
    for (let i = 0; i < railBtns.length; i++) {
      const slot = railBtns[i], a = list[i];
      if (!a) {
        if (slot.id !== null) { slot.id = null; slot.btn.hidden = true; }
        continue;
      }
      if (slot.id !== a.id) { slot.id = a.id; slot.btn.hidden = false; }
      const label = a.label || a.id;
      if (slot.label !== label) {
        slot.label = label;
        slot.lab.textContent = label;
        const sub = PULSE_SUB[a.id] || '';
        slot.btn.setAttribute('aria-label', sub ? `${label}. ${sub}` : label);
      }
      const due = !!a.due;
      if (slot.due !== due) { slot.due = due; slot.btn.classList.toggle('is-due', due); }
      /* The two well-control actions are marked, and SHUT IN is armed the
         moment the well is actually flowing: hazard-striped, so it can never
         be tapped by the reflex that belongs to anything else in this row. */
      const crit = !!RAIL_CRITICAL[a.id];
      if (slot.crit !== crit) { slot.crit = crit; slot.btn.classList.toggle('is-critical', crit); }
      const armed = crit && a.id === 'shutIn' && !!(tl.well && tl.well.flowing);
      if (slot.armed !== armed) { slot.armed = armed; slot.btn.classList.toggle('is-armed', armed); }
    }
  }

  /* ═══ The blow-count chart ═════════════════════════════════════════════
     One row per driven increment, deepest at the foot, bar length = blows for
     that increment. The bars TIGHTEN in the final metre because the increment
     does: 250 mm over the drive, 25 mm through the last metre, exactly as the
     sim logs them. Nothing here re-counts anything — `programme.blowLog` is
     the driving record and this draws it. */
  const b2d = blowCanvas.getContext('2d');
  let bW = 196, bH = 60, bDpr = 1, blowKey = '';
  function resizeBlow() {
    const r = blowCanvas.getBoundingClientRect();
    bW = Math.max(60, Math.round(r.width || 196));
    bH = Math.max(24, Math.round(r.height || 60));
    bDpr = app.viewport.dpr || window.devicePixelRatio || 1;
    blowCanvas.width = Math.round(bW * bDpr);
    blowCanvas.height = Math.round(bH * bDpr);
    blowKey = '';
  }

  /**
   * One column per driven increment, deepest at the RIGHT, bar height = the
   * blows that increment cost. The columns NARROW through the final metre
   * because the increment does — 250 mm over the drive, 25 mm through the
   * last metre, exactly as the sim logs them. Nothing here re-counts
   * anything: `programme.blowLog` is the driving record and this draws it.
   */
  function drawBlowChart(prog) {
    if (!tokens) readTokens();
    const rec = Array.isArray(prog.blowLog) ? prog.blowLog : [];
    const key = `${rec.length}:${rec.length ? rec[rec.length - 1].blowsPer250 : 0}:${bW}x${bH}`;
    if (key === blowKey) return;
    blowKey = key;

    const c = b2d;
    c.setTransform(bDpr, 0, 0, bDpr, 0, 0);
    c.clearRect(0, 0, bW, bH);
    if (!rec.length) {
      c.font = tokens.fontUnit;
      c.fillStyle = rgba(tokens.fg, 0.42);
      c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('No blows logged', 1, bH / 2);
      return;
    }

    const gap = 2;
    const COL_MAX = 14;         // a bar, never a wall
    const fit = Math.max(4, Math.floor((bW + gap) / (COL_MAX + gap)));
    const rows = rec.slice(-Math.max(fit, 8));
    const practical = Number(prog.practicalBlows) || 135;
    const refusal = Number(prog.refusalBlows) || 248;
    /* Scaled on the refusal limit, so the two rules do not move under the
       player: a bar at the top of the box IS refusal. A drive that has gone
       PAST refusal opens the scale rather than saturating — every column
       clipped to full height is a solid block that says nothing, and the
       first two increments of a hard pile did exactly that. */
    let peak = 0;
    for (const r0 of rows) peak = Math.max(peak, Number(r0.blowsPer250) || 0);
    const top = Math.max(refusal, peak * 1.06);
    const scale = (v) => clamp(v / top, 0, 1);
    const colW = Math.min(COL_MAX, Math.max(2, (bW - gap * (rows.length - 1)) / rows.length));

    // 135 blows/250 mm is the practical sustained limit, 248 is refusal.
    // Both are the sim's own numbers where it publishes them.
    for (const [v, col, a] of [[practical, tokens.warning, 0.45], [refusal, tokens.danger, 0.7]]) {
      const y = Math.round(bH - bH * scale(v)) + 0.5;
      c.strokeStyle = rgba(col, a); c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, y); c.lineTo(bW, y); c.stroke();
    }

    // Deepest at the RIGHT: the drive reads the way it happened, and the bar
    // the player is watching is the one nearest the thumb.
    let x = bW - colW;
    for (let i = rows.length - 1; i >= 0 && x > -colW; i--) {
      const row = rows[i];
      const per = Number(row.blowsPer250) || 0;
      const h = Math.max(1.5, bH * scale(per));
      const col = per >= refusal ? tokens.danger : per >= practical ? tokens.warning : tokens.steel;
      // The tightened final-metre increments read brighter, because they are
      // the ones the set is actually taken on.
      c.fillStyle = rgba(col, row.incrementMm <= 25 ? 0.95 : 0.72);
      c.fillRect(x, bH - h, colW, h);
      x -= colW + gap;
    }

    const capTxt = rows.some((r) => r.incrementMm <= 25)
      ? `Blows / 25 mm · toe ${num(rows[rows.length - 1].toM, 2)} m`
      : `Blows / 250 mm · toe ${num(rows[rows.length - 1].toM, 1)} m`;
    if (blowCap.textContent !== capTxt) blowCap.textContent = capTxt;
  }

  let blowOn = false;

  /** The stringless cadence: the bailer coming out full. */
  function bailerBeat(p) {
    setAction('bail'); actionTimer = 4.5;
    app.haptic('medium');
    const label = (p && p.label) || 'Bailing run';
    log(p?.depth ?? state.drill?.depth, `${label} ${p?.count ?? ''}`.trim(), 'warn');
  }

  /** Everything the programme owns, back to the state a fresh hole starts in. */
  function resetProgramme() {
    beatUi.on = false; beatUi.key = ''; beatUi.title = ''; beatUi.sub = '';
    beatUi.left = ''; beatUi.steps = -1; beatUi.p = '';
    beatEl.hidden = true; beatStepsEl.hidden = true; ropBox.hidden = false; gelSeen = false;
    railOn = false; railEl.hidden = true;
    for (const s of railBtns) {
      s.id = null; s.label = ''; s.due = false; s.crit = false; s.armed = false;
      s.btn.hidden = true;
      s.btn.classList.remove('is-due', 'is-critical', 'is-armed');
    }
    blowOn = false; blowKey = '';
    readout = '';               // force the setter through on the next line
    setReadout('rate');
    unitStamp = null; unitKind = '';
    hideUnit();
    pendingContact = null;
    runLog.length = 0;
  }

  function paintBlowChart(prog) {
    const on = !!(prog && prog.kind === 'driven-pile');
    if (on !== blowOn) blowOn = on;
    // paintBeat owns the slot; only draw when the record actually has it.
    if (on && readout === 'blow') drawBlowChart(prog);
  }

  function paint(dt) {
    if (!tokens) readTokens();
    const d = telemetry() || state.drill || {};
    const p = state.player || {};

    const prog = simTel ? simTel.programme : null;
    const pkey = progKey(prog);

    /* ── The dock's shape, settled once and then left alone.
       The auxiliary row exists only on a method that can ever fill it: one the
       sim gives discrete actions to, or one with a mud column. Both are
       properties of the METHOD and fixed for the whole run —
       `availableActions()` keys off the programme and `method.wellControl` —
       so this is not a state a run can enter or leave, and the two bands
       cannot move while the player is drilling. Fifteen of the twenty-one
       methods are plain, and they get those 38px of 3D back. */
    if (!dockLocked && simTel) {
      dockLocked = true;
      const plain = !simTel.well && !(Array.isArray(simTel.actions) && simTel.actions.length);
      if (dock.classList.contains('sitedock--plain') !== plain) {
        dock.classList.toggle('sitedock--plain', plain);
        requestAnimationFrame(() => { resizeGauge(); sizeSpark(); if (blowOn) resizeBlow(); });
      }
      requestAnimationFrame(publishChrome);
    }

    /* The method decides what the three controls are called (GAMEDESIGN §7).
       The sim is the better authority than the contract, because it is the
       thing that knows the method kind, the programme it is running and
       whether the well has a mud column; mount() has already set them from the
       contract for the frames before the first telemetry read. */
    if (simTel) {
      syncControlLabels(
        simTel.methodId || null,
        simTel.method ? simTel.method.kind : null,
        !!simTel.well,
        pkey,
      );
      /* And the sim decides which of them are connected to anything. A pushed
         piezocone does not turn and circulates nothing; an SPT drive is driven
         by a falling hammer, not by the feed — so the lock only stands while
         the drive is running, because between tests the same machine really is
         boring the hole with the feed. */
      const lockNote = (prog && prog.lockNote) || 'not on this machine';
      setSliderLock(feedSl, feedName, !!(prog && prog.feedLocked && prog.driving), lockNote);
      setSliderLock(rotSl, rotName, !!(prog && prog.rotationLocked), lockNote);
      setSliderLock(flushSl, flushName, !!(prog && prog.flushLocked), lockNote);
    }

    /* ── The one status line.
       The DEPTH cell counts what this method is actually advancing, in the
       method's own unit: bolts on a bolter, bags on an RC rig, blows on a
       pile, metres on everything paid by the metre. Same cell, same place,
       honest word — and it is the ONLY place the programme appears while the
       player is drilling. `--p` is the job-progress rule along its foot. */
    moneyRoll.step(dt);
    lvlEl.textContent = String(p.level || 1);
    const dep = d.depth || 0;
    const unitFmt = prog ? STATUS_UNIT[pkey] : null;
    let dKey = DEPTH_KEY[pkey] || 'Depth';
    let dVal = dep.toFixed(dep < 10 ? 2 : 1);
    let dTail = ` / ${Math.round(d.target || 0)} m`;
    if (unitFmt) {
      const pair = unitFmt(prog);
      dKey = pair[0]; dVal = pair[1]; dTail = '';
    }
    if (depthKeyEl.textContent !== dKey) depthKeyEl.textContent = dKey;
    if (depthEl.textContent !== dVal) depthEl.textContent = dVal;
    if (targetEl.textContent !== dTail) targetEl.textContent = dTail;
    const mm = Math.floor(elapsed / 60), ssec = Math.floor(elapsed % 60);
    timeEl.textContent = `${String(mm).padStart(2, '0')}:${String(ssec).padStart(2, '0')}`;
    const jobP = clamp(simTel ? (simTel.progress01Overall ?? simTel.progress01 ?? 0)
      : (dep / Math.max(1e-3, d.target || 1)), 0, 1).toFixed(3);
    if (jobP !== lastJobP) { lastJobP = jobP; sstrip.style.setProperty('--p', jobP); }

    /* ── The ground under the bit, at the moment it CHANGES.
       That is when a driller pre-adjusts, and it is the only moment the
       stratum is worth saying: the bed is already drawn full size and in
       colour in the band a tag used to sit on, and the depth is in the cell
       to the left. So it goes down the one alert channel like everything else
       transient, and the strip is exactly as tall as it was. */
    const cur = d.stratum || stratumAt(dep).s;
    if (cur && cur.id !== lastStratumId) {
      const first = lastStratumId === null;
      lastStratumId = cur.id;
      if (!first) {
        const ucs = Math.round(cur.ucs ?? GROUND[cur.id]?.ucs ?? 0);
        const stb = cur.stability ?? GROUND[cur.id]?.stability ?? 0.7;
        pendingContact = [
          cur.name,
          `${ucs} MPa · ${stb > 0.6 ? 'self-supporting' : stb > 0.3 ? 'needs care' : 'needs casing'}`,
        ];
      }
    }

    /* ── Gauge.
       The needle is whatever the sim says the band is measured against, and
       `gauge.display` is that value already smoothed and already carrying the
       telegraph judder. Torque is the special case, not the rule: on a driven
       pile this is the SET, on a piezocone the PUSH RATE, and on the way back
       up a raise or home along a bore it is PULL. */
    lastGauge = simTel ? simTel.gauge : null;
    syncGauge(lastGauge);
    const ss = readSweetSpot();
    if (ss) { bandLo = ss[0]; bandHi = ss[1]; }
    else { bandLo = clamp(demo.band - 0.075, 0, 1); bandHi = clamp(demo.band + 0.075, 0, 1); }
    const gv = lastGauge
      ? clamp((lastGauge.display ?? lastGauge.value ?? 0), 0, 1.15)
      : clamp(d.torque || 0, 0, 1.15);
    needle.set(gv).step(dt);
    inBand = !!(d.inGreenBand ?? (gv >= bandLo && gv <= bandHi));
    drawGauge(gv);

    // ── ROP + sparkline
    const rop = d.rop || 0;
    ropVal.firstChild.textContent = rop.toFixed(1);
    sparkAccum += dt;
    if (sparkAccum > 0.12) { sparkAccum = 0; spark.push(rop); }
    spark.draw(rgba(tokens.amber, 0.95));
    lastRop = rop;

    /* THE FOUR METERS ARE GONE. Bit life, heat, cuttings and hole stability
       were four permanent bars restating a channel that already interrupts:
       sim/drilling.js raises `bit-worn`, `bit-critical`, `overheat`,
       `hole-cleaning` and `collapse` as warnings the moment they matter, and
       the hazard banner carries each with the instruction attached. What is
       left of them is an outcome, and outcomes are on the unit card and the
       results screen. */
    const stab = clamp(d.stability ?? 1, 0, 1);

    // ── Groove — the only green in the HUD.
    const gt = clamp((d.greenBandTime || 0) / 6, 0, 1);
    const mult = typeof d.combo === 'number' ? d.combo : 1 + gt * 1.2;
    const multTxt = mult.toFixed(2) + '×';
    if (grooveX.textContent !== multTxt) grooveX.textContent = multTxt;
    if (grooveChip.classList.contains('is-in') !== inBand) {
      grooveChip.classList.toggle('is-in', inBand);
      grooveChip.setAttribute('aria-label', inBand
        ? `In the groove, ${multTxt} rate of penetration`
        : 'Off the sweet-spot band');
    }

    // ── Contextual action: the sim decides whenever it is present.
    const sa = simAction();
    if (sa) {
      setAction(sa);
      actionTimer = 0;
    } else if (actionTimer > 0) {
      actionTimer -= dt;
      if (actionTimer <= 0) setAction('idle');
    } else {
      if ((d.jam || 0) > 0.05) setAction('jam');
      else if ((d.wear || 0) > 0.92) setAction('trip');
      else if (stab < 0.3) setAction('casing');
      else if (actionMode !== 'idle') setAction('idle');
    }

    /* ── The well, and the one alert channel.
       The well is painted first because its alarm outranks ground trouble:
       trouble that arrives during a kick is not the problem you have. Below
       it, a struck message holds the strip for its own few seconds, and under
       that a telegraph stands for as long as the sim keeps publishing it. One
       channel, one severity encoding, and it costs the screen nothing. */
    const wellAlarm = paintWell(simTel);

    if (alertHold > 0) alertHold -= dt;
    if (alertHold <= 0) {
      alertHold = 0;
      if (wellAlarm) {
        paintAlert(wellAlarm.title, wellAlarm.sub, wellAlarm.kind,
          wellAlarm.telegraph ? 'telegraph' : 'strike', wellAlarm.p);
      } else if (pendingContact) {
        say(pendingContact[0], pendingContact[1], 'info');
      } else {
        const warn = simTel && simTel.warning ? simTel.warning : null;
        if (warn && warn.hint) {
          const cp = splitHint(warn.kind, warn.hint);
          paintAlert(cp.title, cp.sub, (warn.severity || 0) > 0.66 ? 'danger' : 'warn',
            'telegraph', warn.progress01 || 0);
        } else if (alertMode) {
          clearAlert();
        }
      }
    }
    pendingContact = null;

    /* ── The beat, the rail, the driving record and the unit boundary.
       Counters and captions, not needles: 8 Hz is plenty and it keeps the text
       writes and the small per-frame allocation off the 60 Hz path the gauge
       and the sparkline live on. The beat's own progress rule is the exception
       — a two-second cure has to move — so it runs every frame. */
    paintBeat(simTel);
    if (unitT > 0) {
      unitT -= dt;
      if (unitT <= 0) hideUnit();
    }
    progAccum += dt;
    if (progAccum >= 0.125) {
      progAccum = 0;
      paintRail(simTel);
      paintBlowChart(prog);
      checkUnit(prog, simTel);
    }

    // ── The run log. In memory, for the unit card and the results screen.
    if (dep - lastLoggedDepth >= 5) { lastLoggedDepth = Math.floor(dep / 5) * 5; log(dep, `${cur ? cur.name : 'Drilling'} · ${rop.toFixed(0)} m/h`); }
  }

  /* ═══ Screen interface ═════════════════════════════════════════════════ */
  return {
    el,

    mount(params) {
      const c = params?.contract || state.contract;
      const d = state.drill || (state.drill = {});
      /* game/data.js names these `targetDepth`, `regionId` and `methodId`;
         `target`, `region` and `method` do not exist on a contract and read
         back undefined. That silently defaulted the target to 72 m, wrote
         undefined into the world's region and left the spud-in log line
         unable to name the method. The older spellings are still accepted so
         a hand-built QA contract keeps working. */
      if (c) {
        d.target = c.targetDepth ?? c.target;
        const rid = c.regionId ?? c.region;
        if (state.world && rid) state.world.regionId = rid;
      }
      if (!d.target) d.target = 72;
      if (d.depth === undefined) d.depth = 0;
      const sim = ctx.sim;
      if (sim && typeof sim.startHole === 'function') {
        // sim/drilling.js owns the run and mirrors it into state.drill.
        if (!sim.active) {
          try { sim.startHole(c || state.contract || undefined); }
          catch (e) { console.error('[ui] startHole', e); }
        }
      } else if (!d.active) {
        d.active = true;
        d.depth = 0; d.rop = 0; d.torque = 0; d.wear = d.wear || 0;
        d.heat = 0; d.stability = 1; d.jam = 0; d.rods = 1;
        d.greenBandTime = 0; d.score = 0; d.stratumIndex = 0;
        d.wob = 0.5; d.rpm = 0.5; d.flush = 0.5;
        app.bus.emit(EVENTS.DRILL_START, { methodId: c ? (c.methodId ?? c.method) : 'auger', contract: c || null });
      }
      if (typeof d.wob !== 'number') d.wob = 0.5;
      if (typeof d.rpm !== 'number') d.rpm = 0.5;
      if (typeof d.flush !== 'number') d.flush = 0.5;
      if (typeof d.torque !== 'number') d.torque = 0;
      if (typeof d.wear !== 'number') d.wear = 0;
      if (typeof d.heat !== 'number') d.heat = 0;
      if (typeof d.stability !== 'number') d.stability = 1;
      if (typeof d.jam !== 'number') d.jam = 0;
      if (typeof d.greenBandTime !== 'number') d.greenBandTime = 0;
      feedSl.set(d.wob); rotSl.set(d.rpm); flushSl.set(d.flush);

      /* Label the three controls before the first frame, from the contract's
         method. paint() re-resolves from the sim as soon as it has telemetry,
         which knows the method kind and whether the well has a mud column. */
      ctlMethodId = undefined; ctlKind = undefined; ctlWell = false; ctlProg = undefined;
      const mid = c ? (c.methodId || c.method) : (state.world?.methodId || null);
      syncControlLabels(mid || null, null, false, '');
      setSliderLock(feedSl, feedName, false, '');
      setSliderLock(rotSl, rotName, false, '');
      setSliderLock(flushSl, flushName, false, '');

      elapsed = 0; lastLoggedDepth = 0; lastStratumId = null;
      progAccum = 0; lastJobP = '';
      clearAlert();
      dockLocked = false;
      resetWell();
      resetProgramme();
      demo.si = -1; demo.t = 0; demo.next = 6;
      spark.reset();
      sstrip.style.setProperty('--p', '0');
      if (state.world && state.world.contractId !== (c ? c.id : null)) state.world.strata = [];
      if (state.world) state.world.contractId = c ? c.id : null;
      ensureStrata();
      // Name the method only when data.js can; never guess one into the log.
      const mName = c ? methodInfo(c.methodId ?? c.method)?.name : null;
      log(0, mName ? `Spud in · ${mName}` : 'Spud in');
      const fc = ctx.sim && ctx.sim.getForecast ? ctx.sim.getForecast() : null;
      if (Array.isArray(fc)) {
        for (const f of fc.slice(0, 2).reverse()) {
          log(f.top || 0, `${f.name} ahead${f.expectedRopMh ? ` · ~${f.expectedRopMh} m/h` : ''}`);
        }
      }
      /* The run log has no card on the stage any more, so hand the reference
         to the state the results screen reads: the events still happened and
         the end of the contract is where they are worth reading. */
      if (state.drill) state.drill.runLog = runLog;
      moneyRoll.setInstant(true); moneyRoll.to(state.player?.money || 0); moneyRoll.setInstant(false);
      setAction('idle');
      requestAnimationFrame(() => { resizeGauge(); sizeSpark(); if (blowOn) resizeBlow(); publishChrome(); });
    },

    update(dt) {
      // simTel is whatever the previous frame read from sim/drilling.js.
      if (simTel && typeof simTel.timeSec === 'number') elapsed = simTel.timeSec;
      else if (state.drill?.active) elapsed += dt;
      if (!ctx.sim && state.drill?.active) stepDemo(dt);
      paint(dt);
      // The results screen settles from state.drill when the payload is thin.
      if (state.drill) state.drill.timeSec = elapsed;
    },

    resize() { resizeGauge(); sizeSpark(); if (blowOn) resizeBlow(); publishChrome(); },

    unmount() {
      clearAlert();
      resetWell();
      resetProgramme();
    },

    /* ── Bus consequences ─────────────────────────────────────────────── */
    onTick(p) {
      if (!p) return;
      const d = state.drill;
      if (!d) return;
      // The sim owns the numbers; the HUD only mirrors them.
      if (p.depth !== undefined) d.depth = p.depth;
      if (p.rop !== undefined) d.rop = p.rop;
      if (p.torque !== undefined) d.torque = p.torque;
      if (p.wob !== undefined) d.wob = p.wob;
      if (p.wear !== undefined) d.wear = p.wear;
    },
    onStratum(p) {
      if (!p?.stratum) return;
      log(p.depth ?? state.drill?.depth, `Entered ${p.stratum.name}`);
      app.haptic('medium');
    },
    onRod(p) {
      // A method with no drill string has no rod to add. Never call the beat
      // a rod: `hasDrillString` decides, and the sim publishes it.
      if (simTel && simTel.hasDrillString === false) { bailerBeat(p); return; }
      setAction('rod'); actionTimer = 4.5;
      app.haptic('medium');
      log(state.drill?.depth, `Rod ${p?.count ?? ''} window`, 'warn');
    },
    /* EVENTS.BAILER_RUN. Cable percussion has NO ROD TO ADD — its cadence is
       pulling the tool and running the bailer to lift the cuttings out of the
       hole. Same beat, same haptic, same counter; a different piece of kit and
       therefore a different word. The payload carries its own label where the
       sim wants a particular one used. */
    onBailer: bailerBeat,
    onJam(p) {
      setAction('jam'); actionTimer = 0;
      hazard('Rod jam', 'Work the string free — tap repeatedly');
      log(state.drill?.depth, 'String stuck', 'bad');
    },
    onJamCleared() {
      setAction('idle');
      say('String free', 'Back to making hole', 'good');
      log(state.drill?.depth, 'String free');
      const st = state.player?.stats; if (st) st.jamsCleared = (st.jamsCleared || 0) + 1;
    },
    onWater(p) {
      hazard('Water strike', `${p?.flowLpm ?? '?'} l/min inflow — raise flushing or case it`, 'info');
      log(p?.depth, `Water ${p?.flowLpm ?? ''} l/min`, 'warn');
    },
    onCavity(p) {
      setAction('kick'); actionTimer = 5;
      hazard('Cavity — return lost', 'Bit is free-falling. Cut the feed now.');
      log(p?.depth, `Void ${(p?.height ?? 0).toFixed(1)} m`, 'bad');
    },
    onBoulder(p) {
      hazard('Boulder strike', 'Torque spike — back off feed, raise percussion', 'warn');
      log(p?.depth, 'Boulder', 'warn');
    },
    onBitWorn() {
      if (actionMode !== 'trip') { setAction('trip'); actionTimer = 0; hazard('Crown is finished', 'ROP has collapsed. Trip out and change it.', 'warn'); }
    },
    onBitBroken() {
      hazard('Bit broken', 'Fish it or lose the hole');
      log(state.drill?.depth, 'Bit failure', 'bad');
      const st = state.player?.stats; if (st) st.bitsBurned = (st.bitsBurned || 0) + 1;
    },
    onMoney() { moneyRoll.to(state.player?.money || 0); },
    onDrillStop() { setAction('idle'); },

    destroy() { feedSl.dispose(); rotSl.dispose(); flushSl.dispose(); },
  };

  function sizeSpark() {
    const r = ropBox.getBoundingClientRect();
    spark.resize(Math.max(40, r.width - 2), 30, app.viewport.dpr);
  }
}
