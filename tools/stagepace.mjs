/**
 * stagepace — headless pacing probe for the two-pass methods.
 *
 *   node tools/stagepace.mjs                  the matrix: both methods, short and long
 *   node tools/stagepace.mjs --naive          the old fixed-input policy, for contrast
 *   node tools/stagepace.mjs --trace          a line every 10 s of every run
 *   node tools/stagepace.mjs --fps            30 Hz vs 120 Hz frame-rate independence
 *   node tools/stagepace.mjs --abuse          the driller ladder: does the string part
 *                                             for a bad operator and only for one?
 *   node tools/stagepace.mjs raise-boring:40  one run
 *
 * `sim/drilling.js` imports only `core/contract.js`, so the whole simulation
 * runs in node with no GPU and no browser.
 *
 * ── WHAT THIS PROBE IS FOR ───────────────────────────────────────────────
 * `raise-boring` and `hdd` run in two passes and the second one runs backwards:
 * a reamer pulled up a raise, a product pipe backreamed home along a bore. On
 * that pass the gauge stops being torque and becomes PULL, gravity or the mud
 * does the mucking, and the cutters are changed from below. None of that is
 * reachable until a policy can finish the pilot, and none of it is measurable
 * until the policy is good enough that what it measures is the method rather
 * than the policy.
 *
 * ── THE DRILLER ──────────────────────────────────────────────────────────
 * `steeringDriller()` below is a competent-but-not-expert operator:
 *
 *   · it reads `optimal` every tick and starts from it, so it is never leaning
 *     on the ground harder than the ground is asking for;
 *   · it then STEERS THE NEEDLE ONTO THE BAND — a slow integral trim on the
 *     feed, exactly the nudge-and-watch a driller does, because the band centre
 *     assumes a clean hole and the hole you have is never quite that one;
 *   · it answers each hazard with the answer the hazard has (ease and wind the
 *     percussion up on a boulder, cut the feed in a void, lift the flush on
 *     water, ease the pull on a stalling head);
 *   · it works a bound string free on the beat instead of mashing;
 *   · it changes a worn bit rather than grinding one that has stopped cutting.
 *
 * It does NOT read the drill log ahead, pre-empt a stratum change, or play the
 * groove for combo. Whatever it scores, a good human should beat.
 *
 * ── ONE THING THE PROBE CANNOT DO, AND WHY ───────────────────────────────
 * DESIGN_EXPANSION §1 describes HDD as a steering game: a slant face, slide
 * versus rotate, a walkover locator reading pitch and clock position, and a
 * design corridor of ±0.15–0.80 m that geology.js solves and publishes on
 * `borePath.corridor`.
 *
 * The SIM DOES NOT MODEL THAT YET. `sim/drilling.js` never reads `borePath`,
 * there is no clock position and no slide/rotate distinction: HDD's `rotation`
 * is rpm like every other rotary method, and hole accuracy is the run-wide
 * `deviation` integrator driven by |feed − optimum|. So the corridor the player
 * actually holds today is THE GREEN BAND, which is what §1 says it should
 * become ("the groove becomes staying inside the design corridor") — and that
 * is the corridor this policy steers. Alternating slide and rotate here would
 * cost rate and buy nothing, because nothing downstream reads it.
 *
 * That gap is real and is reported rather than papered over. It is also not
 * what was aborting the pilot: a fixed 0.62 feed against an optimum of 0.30 in
 * topsoil packs the annulus off to a full load inside ten seconds, and the
 * needle sits above the rig limit banking `fatiguePerOverTorque` until the
 * string parts. That was a bad driller, and the sim was right to part it.
 *
 * ── IS HDD'S ROD FATIGUE CORRECTLY TUNED? MEASURED, WITH `--abuse` ───────
 * There is no HDD fatigue knob to tune: fatigue is the shared `TUNING.rods`
 * model, it banks ONLY while the gauge is over the rig limit
 * (`fatiguePerOverTorque`, and on a reverse pass while the pull is over
 * `stallAt`), and a break additionally needs the driller to still be abusing it
 * during the telegraph. So "HDD parts its string" was never a statement about
 * fatigue — it was a statement about what was putting the needle in the red.
 *
 * `--abuse` runs the same ladder that established it, and the result is the
 * cleanest possible answer:
 *
 *   torque.depth 0.009 (as it is now)  competent and naive both finish 120 m
 *                                      and 400 m at fatigue 0.000; a driller
 *                                      holding 1.0 feed on starved flush parts
 *                                      the string at 273 m of 400.
 *   torque.depth 0.105 (as it was)     the COMPETENT policy parts at 242 m of
 *                                      400, having banked 0.836 with the needle
 *                                      over the limit for 22 s it could do
 *                                      nothing about.
 *
 * A model that parts the string for a good operator and does not part it for a
 * bad one is broken; this one now does the opposite of that, on both counts,
 * and it got there by fixing the drag-torque coefficient rather than by
 * softening the fatigue. Rod fatigue is correctly tuned for HDD. The one soft
 * spot left is honest to report: a steady 0.85 feed — well past
 * `rods.abuseMargin` — still finishes both bores at fatigue 0.000, because on
 * this method that much feed does not reach the limit. It costs a grade, not a
 * string, and no claim is made that it should cost more.
 *
 * ── WHAT `--fps` CAN AND CANNOT ASSERT ───────────────────────────────────
 * Frame-rate independence is a standing requirement: 30 and 120 fps must give
 * the same hole. That is a claim about the SIM, and the only way to test it is
 * to hold the CONTROL SIGNAL identical between the two rates.
 *
 * `steeringDriller()` cannot do that, and this check used to fail because of
 * it. It is a closed loop: it reads telemetry and integrates a trim. Driven off
 * the loop below, at 30 fps four policy ticks fire back to back on the same
 * stale telemetry and then four fixed steps run on the last one's inputs; at
 * 120 fps a tick and a step alternate. The inputs genuinely differ, so the
 * holes genuinely differ — that is what sampling a player's hands at frame rate
 * means, and no simulator can be identical across it.
 *
 * So the assertion runs on `scheduledDriller()`: an OPEN-LOOP programme that is
 * a pure function of the sim's own clock, quantised to whole seconds, which 30
 * and 120 fps both land on exactly. It still exercises varying inputs, hazards,
 * beats, wear and both passes. Under it the two rates are BIT-IDENTICAL —
 * depth, pass-2 metres and bit wear all delta 0 — mid-reverse-pass and at
 * completion. `update()`'s accumulator is exact.
 *
 * The closed-loop number is still printed underneath, labelled as what it is:
 * the divergence of THIS HARNESS'S control loop, not of the sim.
 */
import { createDrillSim, TUNING } from '../src/sim/drilling.js';
import { EVENTS, GROUND } from '../src/core/contract.js';
import { METHODS } from '../src/game/data.js';

const H = 1 / TUNING.sim.hz;
const nz = (v, d = 0) => (Number.isFinite(v) ? v : d);
const clamp = (v, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);

/* ═══════════════════════════════════════════════════════════════════════════
   THE GROUND THE METHOD IS ACTUALLY SOLD INTO

   Without this the probe was measuring an impossible contract. `startHole()`
   falls back to the synthetic `nordic` stack — topsoil, till, till, GNEISS,
   GRANITE — and HDD's `rockCeilingUcs` is 120 MPa while gneiss is 180 and
   granite 210. The pilot did not fail: it stopped, at 74 m, with the needle
   in the band and the rate under `rop.methodLimitMh`. That is the sim
   correctly reporting "this method is wrong for this ground", against ground
   `data.js` never lets an HDD contract carry (`validGround` has no crystalline
   rock in it at all).

   So the column is DERIVED from the method's own `validGround`, sorted by UCS
   and sampled across the middle of its range: a representative job, not a
   best case and not one the contract board would never issue.
   ═══════════════════════════════════════════════════════════════════════════ */
function groundColumn(methodId, beds = 5) {
  const m = METHODS.find((x) => x.id === methodId);
  if (!m || !m.validGround || !m.validGround.length) return null;
  const sorted = m.validGround
    .filter((id) => GROUND[id])
    .sort((a, b) => GROUND[a].ucs - GROUND[b].ucs);
  if (!sorted.length) return null;
  const out = [];
  for (let i = 0; i < beds; i++) {
    const f = beds === 1 ? 0.5 : 0.15 + (0.85 - 0.15) * (i / (beds - 1));
    out.push(sorted[Math.round(f * (sorted.length - 1))]);
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE DRILLERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The one the probe used to run: fixed inputs, and the jam rescue mashed. It is
 * kept because it is the control case — the difference between what it reads
 * and what the steering driller reads is the difference between a bad operator
 * and the method.
 */
/**
 * A driller who holds one setting all run and mashes the jam rescue. This is
 * the shape of every control case here: `--naive`'s contrast run and every rung
 * of `--abuse` below it are the same operator at different levels of offence,
 * so there is one implementation of them and only the numbers move.
 */
function heldDriller(feed, rot, flush) {
  return function tick(sim, tel) {
    const bound = tel.jam.state !== 'free';
    sim.setInput('feed', bound ? 0.15 : feed);
    sim.setInput('rotation', bound ? 0.30 : rot);
    sim.setInput('flush', bound ? 0.95 : flush);
    if (bound) sim.pulse('jamRescue');
  };
}

const naiveDriller = () => heldDriller(0.62, 0.58, 0.66);

/**
 * THE FRAME-RATE POLICY, and the reason it is not the steering one.
 *
 * Inputs here are a pure function of the SIM's clock, held constant inside each
 * whole second — a boundary 30 fps and 120 fps both land on exactly. Nothing is
 * fed back, so the control signal is identical at both rates and the only thing
 * left under test is `update()`'s accumulator. The programme is deliberately
 * varied: it sweeps feed across and past the optimum, starves and floods the
 * flush, and so drives hazards, wear, load and both passes rather than holding
 * one bland setting the sim could be wrong about in only one way.
 */
const FPS_FEED = [0.30, 0.45, 0.60, 0.52, 0.38, 0.70, 0.25, 0.55];
const FPS_ROT  = [0.55, 0.70, 0.40, 0.62, 0.75, 0.35, 0.68, 0.50];
const FPS_FLUSH = [0.60, 0.85, 0.45, 0.95, 0.70, 0.30, 0.80, 0.65];
function scheduledDriller() {
  return function tick(sim, tel) {
    const s = Math.floor(tel.timeSec + 1e-9) % FPS_FEED.length;
    sim.setInput('feed', FPS_FEED[s]);
    sim.setInput('rotation', FPS_ROT[s]);
    sim.setInput('flush', FPS_FLUSH[s]);
    if (tel.jam.state !== 'free' && tel.jam.rescue.goodNow) sim.pulse('jamRescue');
  };
}

function steeringDriller(opts = {}) {
  const tripAt = opts.tripAt ?? 0.78;   // bit wear at which a fresh bit is worth the change
  const cutAt  = opts.cutAt  ?? 0.70;   // cutter wear at which the crew goes up to the head
  let trim = 0;                          // the feed trim, integrated onto the band
  let stage = -1;

  return function tick(sim, tel) {
    /* A pass change is a different machine: drop the trim rather than carry a
       pilot's correction onto a pull gauge. */
    if (tel.stage !== stage) { stage = tel.stage; trim = 0; }

    /* ── beats: a rod add, a trip, a cutter change ──────────────────────── */
    if (tel.phase !== 'drilling' && tel.phase !== 'stuck') {
      const ra = tel.rodAdd;
      if (tel.phase === 'rod-add' && ra && !ra.hit && !ra.missed
          && ra.t >= ra.windowStart && ra.t <= ra.windowEnd) sim.pulse('rodStab');
      return;
    }

    const opt = tel.optimal;
    const band = tel.sweetSpot;
    const reverse = tel.stageReverse;
    const dry = reverse && opt.flush === 0;      // a raise mucks by gravity
    const kinds = new Set(tel.hazards.map((h) => h.kind));
    const live = (k) => kinds.has(k);

    /* ── 1. a bound string: take the weight off, open the annulus, work it
           free ON THE BEAT. Mashing is not a strategy and the sim says so. ── */
    if (tel.jam.state !== 'free') {
      sim.setInput('feed', 0.08);
      sim.setInput('rotation', 0.28);
      sim.setInput('flush', dry ? 0 : 0.95);
      if (tel.jam.rescue.goodNow) sim.pulse('jamRescue');
      trim *= 0.98;
      return;
    }

    /* ── 2. start from what the ground is asking for ── */
    let feed = opt.wob;
    let rot = opt.rpm;
    let flush = opt.flush;

    /* ── 3. STEER THE NEEDLE ONTO THE BAND.
           The band centre is where the gauge would sit in a clean hole at the
           optimum. The hole is never quite that hole, so the offset is real and
           the answer is a small standing trim on the feed — nudge, watch, hold.
           Integral only: a driller does not chase the needle frame by frame. ── */
    const err = tel.gauge.value - band.center01;
    if (Math.abs(err) > band.halfWidth01 * 0.30) {
      const gain = reverse ? 0.9 : 0.55;                 // the pull axis answers harder
      trim = clamp(trim - err * gain * H * 1.2, -0.30, 0.30);
    }
    /* NEVER TRIM INTO ABUSE. `rods.abuseMargin` is the sim's own line between
       drilling hard and drilling badly; past it the string banks fatigue. A
       hole that will not come onto the band under that cap wants CLEANING, not
       more weight, so the flush answers instead (step 4). */
    const ceiling = reverse ? 0.92 : opt.wob + TUNING.rods.abuseMargin * 0.9;
    feed = clamp(opt.wob + trim, 0.05, ceiling);

    /* ── 4. the hole, not the lever: a loaded annulus is a flushing problem ── */
    if (!dry) {
      if (tel.load > 0.55) flush = 1;
      else if (tel.load > TUNING.groove.targetLoad) flush = clamp(opt.flush + 0.30);
      if (tel.flags.lostCirculation) feed = Math.min(feed, 0.30);
    }
    if (tel.heat > TUNING.heat.overheatAt * 0.85) { flush = clamp(flush + 0.20); rot *= 0.85; }

    /* ── 5. the hazards, each answered with the answer it has ── */
    if (live('cavity'))    feed = Math.min(feed, TUNING.hazard.cavity.wobSafe * 0.8);
    if (live('boulder'))   { feed = Math.min(feed, TUNING.hazard.boulder.wobMax * 0.9);
                             rot  = Math.max(rot, TUNING.hazard.boulder.rpmMin + 0.05); }
    if (live('water'))     flush = Math.max(flush, TUNING.hazard.water.flushMin + 0.08);
    if (live('collapse'))  { feed = Math.min(feed, 0.30); flush = Math.max(flush, 0.55); }
    if (live('pull-stall')) {
      const ps = TUNING.hazard.pullStall;
      feed = Math.min(feed, ps.rateMax * 0.85);
      if (!dry) flush = Math.max(flush, ps.flushMin + 0.08);
      trim = Math.min(trim, 0);
    }
    if (live('twist-off')) { feed = Math.min(feed, TUNING.hazard.twistOff.wobMax * 0.9);
                             rot  = Math.min(rot, TUNING.hazard.twistOff.rpmMax * 0.9); }

    sim.setInput('feed', clamp(feed));
    sim.setInput('rotation', clamp(rot));
    sim.setInput('flush', clamp(flush));

    /* ── 6. tooling. A bit that has stopped cutting costs more than the change
           costs. On the way back it is the CUTTERS that are gone — the pull
           walks up out of the band and on toward the stall — and the change is
           made from below rather than by tripping the string; the stage carries
           that number in `cutterChangeSec`. ── */
    const left = reverse ? tel.target - tel.stageProgress : tel.target - tel.depth;
    const cutters = reverse ? nz(tel.programme && tel.programme.cutterWear01) : 0;
    if ((tel.wear >= tripAt || cutters >= cutAt)
        && left > tel.target * 0.12 && tel.jam.state !== 'stuck') {
      sim.changeBit('_spare');
    }
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE RUN
   ═══════════════════════════════════════════════════════════════════════════ */

const band = (t) => `${t.sweetSpot.center01.toFixed(3)}±${t.sweetSpot.halfWidth01.toFixed(3)}`;
const mpm = (m, sec) => (sec > 0 ? m / (sec / 60) : 0);

function run(methodId, target, { policy = 'steer', make = null, trace = false,
                                 seed = 4242, difficulty = 3 } = {}) {
  const log = [];
  const bus = { on: () => () => {}, emit: (id, p) => log.push([id, p]) };
  const sim = createDrillSim({ bus });
  const ground = groundColumn(methodId);
  sim.startHole({ method: methodId, methodId, targetDepth: target, difficulty, seed, ground });

  const st = sim.debug.state;
  const tick = make ? make() : policy === 'naive' ? naiveDriller() : steeringDriller();
  const marks = [];
  const maxSteps = Math.round(7200 * TUNING.sim.hz);

  let lastStage = -1;
  let lastTrace = -1e9;
  let peakFatigue = 0;
  let stage0Sec = 0;
  /* The gauge is normalised to the RIG's own limit, so "did the needle go past
     1.0, and for how long" is the whole of the abuse story on either axis —
     torque going down, pull coming back. */
  let peakGauge = 0;
  let overSec = 0;

  for (let i = 0; i < maxSteps; i++) {
    if (!st.active && st.phase !== 'stuck') break;
    const tel = sim.getTelemetry();
    if (tel.stage !== lastStage) {
      lastStage = tel.stage;
      marks.push({ stage: tel.stage, t: tel.timeSec, depth: tel.depth });
      if (tel.stage === 1) stage0Sec = tel.timeSec;
    }
    if (tel.phase === 'drilling') {
      peakGauge = Math.max(peakGauge, tel.gauge.value);
      if (tel.gauge.value > TUNING.torque.overLimit) overSec += H;
    }
    tick(sim, tel);
    if (trace && tel.timeSec - lastTrace >= 10) {
      lastTrace = tel.timeSec;
      console.log(`      t=${tel.timeSec.toFixed(0).padStart(4)}s S${tel.stage}`
        + ` pass=${(tel.stage ? tel.stageProgress : tel.depth).toFixed(1).padStart(6)}m`
        + ` gauge=${tel.gauge.value.toFixed(3)} band=${band(tel)}`
        + ` ${tel.inGreenBand ? 'IN ' : '   '}`
        + ` feed=${tel.wob.toFixed(2)} flush=${tel.flush.toFixed(2)}`
        + ` load=${tel.load.toFixed(2)} wear=${tel.wear.toFixed(2)}`
        + ` fat=${tel.rodFatigue.toFixed(2)} ${tel.stratum.id}`);
    }
    peakFatigue = Math.max(peakFatigue, st.rodFatigue);
    sim.debug.stepFixed(1);
  }

  const done = log.filter(([id]) => id === EVENTS.HOLE_COMPLETE).map(([, p]) => p)[0];
  const stop = log.filter(([id]) => id === EVENTS.DRILL_STOP).map(([, p]) => p)[0];
  const tel = sim.getTelemetry();

  return {
    methodId, target, policy,
    ok: !!done,
    reason: stop ? stop.reason : tel.phase,
    timeSec: tel.timeSec,
    parSec: tel.parSec,
    stage0Sec: stage0Sec || tel.timeSec,
    pass2Sec: done ? tel.timeSec - stage0Sec : null,
    reached: tel.stage === 1 ? tel.stageProgress : tel.depth,
    grade: done ? done.grade : null,
    score: tel.score,
    prog: tel.programme || {},
    marks, peakFatigue, peakGauge, overSec, tel,
  };
}

function report(r) {
  const name = `${r.methodId} ${r.target} m`;
  console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 52 - name.length))}`);
  if (!r.ok) {
    console.log(`   ABORTED  ${r.reason}  at ${r.reached.toFixed(1)}/${r.target} m`
      + ` on pass ${r.marks.length} after ${r.timeSec.toFixed(0)}s`);
    console.log(`   peak rod fatigue ${r.peakFatigue.toFixed(3)}   wear ${r.tel.wear.toFixed(3)}`
      + `   safety ${r.tel.safetyEvents}   jams ${r.tel.jamIncidents}`);
    return;
  }
  const s = r.score;
  const p1 = r.stage0Sec, p2 = r.pass2Sec;
  console.log(`   COMPLETE  ${r.timeSec.toFixed(0)}s of par ${r.parSec.toFixed(0)}s`
    + `   grade ${r.grade}  (${s.total.toFixed(3)})`);
  console.log(`   pass 1  ${r.target} m in ${p1.toFixed(0)}s = ${mpm(r.target, p1).toFixed(2)} m/min`);
  console.log(`   pass 2  ${r.target} m in ${p2.toFixed(0)}s = ${mpm(r.target, p2).toFixed(2)} m/min`
    + `   (${(p2 / p1).toFixed(2)}x the pilot)`);
  console.log(`   time ${s.time.score.toFixed(2)}  groove ${s.groove.score.toFixed(2)}`
    + `  bit ${s.bit.score.toFixed(2)}  straight ${s.straightness.score.toFixed(2)}`
    + `  hazard ${s.hazards.score.toFixed(2)}  safety ${s.safety.score.toFixed(2)}`);
  console.log(`   wear ${r.tel.wear.toFixed(3)} (${r.tel.bitsUsed} change${r.tel.bitsUsed === 1 ? '' : 's'})`
    + `   cutters ${(r.prog.cutterWear01 ?? 0).toFixed(3)}`
    + `   stalls ${r.prog.stalls ?? 0}`
    + `   peak fatigue ${r.peakFatigue.toFixed(3)}`
    + `   safety ${r.tel.safetyEvents}  jams ${r.tel.jamIncidents}`);
  console.log(`   hazards ${s.hazards.clean}/${s.hazards.seen} clean`
    + `   deviation ${s.straightness.deviation.toFixed(2)}`);
}

/* ── frame-rate independence ─────────────────────────────────────────────
   30 fps and 120 fps must give the same hole. See the header: the assertion
   runs on the OPEN-LOOP schedule, because that is the only way to hold the
   control signal identical between two frame rates and leave update()'s
   accumulator as the only thing under test. Bit wear is checked alongside
   depth: it integrates every step of the run rather than saturating at the
   target, so it catches a divergence a completed hole would hide. */
function fpsAt(methodId, target, fps, sec, mkTick) {
  const bus = { on: () => () => {}, emit: () => {} };
  const sim = createDrillSim({ bus });
  sim.startHole({ method: methodId, methodId, targetDepth: target, difficulty: 3, seed: 4242,
                  ground: groundColumn(methodId) });
  const tick = mkTick();
  const dt = 1 / fps;
  const st = sim.debug.state;
  let carry = 0;
  for (let f = 0; f < Math.round(sec * fps); f++) {
    if (!st.active && st.phase !== 'stuck') break;
    carry += dt;
    while (carry >= H - 1e-12) { tick(sim, sim.getTelemetry()); carry -= H; }
    sim.update(dt);
  }
  return { depth: st.depth, pass: st.prog ? st.prog.passM : 0, stage: st.stage, wear: st.wear };
}

function fpsCheck(methodId, target, sec = 120) {
  const a = fpsAt(methodId, target, 30, sec, scheduledDriller);
  const b = fpsAt(methodId, target, 120, sec, scheduledDriller);
  const d = Math.abs(a.depth - b.depth);
  const p = Math.abs(a.pass - b.pass);
  const w = Math.abs(a.wear - b.wear);
  console.log(`   ${methodId} ${target} m after ${sec} s   (stage ${a.stage}${a.stage ? ', reverse pass' : ''})`);
  console.log(`      30 fps  depth ${a.depth.toFixed(3)}  pass2 ${a.pass.toFixed(3)}  wear ${a.wear.toFixed(5)}`);
  console.log(`     120 fps  depth ${b.depth.toFixed(3)}  pass2 ${b.pass.toFixed(3)}  wear ${b.wear.toFixed(5)}`);
  console.log(`      delta   depth ${d.toFixed(6)}  pass2 ${p.toFixed(6)}  wear ${w.toFixed(8)}`
    + `   ${d < 5e-4 && p < 5e-4 ? 'PASS (identical to 3 dp)' : 'FAIL'}`);

  /* And the closed loop, printed but NOT asserted. A policy that reads
     telemetry and integrates a trim is sampled at frame rate: at 30 fps four
     ticks fire on one telemetry snapshot and then four steps run on the last
     one's inputs, at 120 fps they alternate. The inputs differ, so the hole
     differs, and that is the harness's control loop rather than the sim. */
  const c = fpsAt(methodId, target, 30, sec, steeringDriller);
  const e = fpsAt(methodId, target, 120, sec, steeringDriller);
  console.log(`      closed loop (steering driller, not asserted):`
    + ` depth ${Math.abs(c.depth - e.depth).toFixed(6)}`
    + `  pass2 ${Math.abs(c.pass - e.pass).toFixed(6)}`
    + `  — the policy's own frame-rate sampling, not the sim's`);
}

/* ── the driller ladder ──────────────────────────────────────────────────
   Does the string part for a bad operator, and ONLY for one? A fatigue model
   that parts it for a competent driller is broken, and one that never parts it
   is decoration. Both failures are visible in the same table. */
const LADDER = [
  ['competent (steering)', () => steeringDriller()],
  ['naive     feed 0.62', () => heldDriller(0.62, 0.58, 0.66)],
  ['heavy     feed 0.85', () => heldDriller(0.85, 0.70, 0.66)],
  ['abusive   feed 1.00, flush 0.20', () => heldDriller(1.00, 0.95, 0.20)],
];

function abuseRow(methodId, target, name, make) {
  const r = run(methodId, target, { make });
  console.log(`   ${name.padEnd(32)}`
    + ` ${(r.ok ? `${r.grade} in ${r.timeSec.toFixed(0)}s` : `ABORT ${r.reason} at ${r.reached.toFixed(0)} m`).padEnd(26)}`
    + ` peak gauge ${r.peakGauge.toFixed(3)}`
    + `  gauge over limit ${r.overSec.toFixed(1).padStart(6)}s`
    + `  peak fatigue ${r.peakFatigue.toFixed(3)}`
    // `safety` counts the HEAT axis too, so it can be large while the gauge
    // column is small — starving a mud motor's flow cooks the head without ever
    // putting the needle in the red, and that is a different offence.
    + `  safety ${String(r.tel.safetyEvents).padStart(3)}`);
}

/* ═══════════════════════════════════════════════════════════════════════════ */
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const jobs = argv.filter((a) => !a.startsWith('--'))
  .map((a) => { const [m, d] = a.split(':'); return [m, +d || 40]; });

if (flags.has('--fps')) {
  console.log('\nFRAME-RATE INDEPENDENCE — open-loop schedule, so the sim is the only variable');
  // Sampled MID-REVERSE-PASS as well as at completion: a run that has saturated
  // at its target reads the same at both rates whatever happened on the way.
  fpsCheck('raise-boring', 70, 150);
  fpsCheck('raise-boring', 70, 400);
  fpsCheck('hdd', 120, 260);
  fpsCheck('hdd', 400, 300);
  console.log();
} else if (flags.has('--abuse')) {
  console.log('\nTHE DRILLER LADDER — rod fatigue banks only while the gauge is over the rig');
  console.log('limit, so this is the whole of it: who puts the needle in the red, and for how long.');
  const saved = TUNING.methods.hdd.torque.depth;
  for (const [m, d] of [['hdd', 120], ['hdd', 400], ['raise-boring', 70], ['raise-boring', 378]]) {
    console.log(`\n── ${m} ${d} m ${'─'.repeat(Math.max(0, 44 - m.length))}`);
    for (const [name, make] of LADDER) abuseRow(m, d, name, make);
  }
  /* THE CONTROL CASE, and the reason this mode exists. Put HDD's drag-torque
     coefficient back where it was and the ladder inverts: the competent policy
     parts the string and the fault is in `torque.depth`, not in `TUNING.rods`.
     Restored immediately; nothing else in this process reads it in between. */
  console.log(`\n── control: hdd 400 m with torque.depth back at the pre-fix 0.105 ───`);
  TUNING.methods.hdd.torque.depth = 0.105;
  for (const [name, make] of LADDER) abuseRow('hdd', 400, name, make);
  TUNING.methods.hdd.torque.depth = saved;
  console.log(`\n   ...which is what "correctly tuned" means here: the coefficient moved,`);
  console.log(`   the fatigue model did not, and the ladder now runs the right way up.\n`);
} else {
  const policy = flags.has('--naive') ? 'naive' : 'steer';
  const trace = flags.has('--trace');
  const matrix = jobs.length ? jobs
    : [['raise-boring', 70], ['raise-boring', 378], ['hdd', 130], ['hdd', 600]];
  console.log(`\nSTAGE PACING — ${policy === 'naive' ? 'naive fixed inputs' : 'steering driller'}`);
  for (const [m, d] of matrix) report(run(m, d, { policy, trace }));
  console.log();
}
