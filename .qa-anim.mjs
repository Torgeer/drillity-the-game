/**
 * .qa-anim.mjs — does the clip actually MOVE the machine?
 *
 *   node .qa-anim.mjs [path/to/model.glb] [clip-name]
 *
 * ── WHY THIS EXISTS ────────────────────────────────────────────────────────
 * A clean console is not evidence. This tree has shipped, more than once, a
 * pipeline with correct log lines at every step and nothing on screen:
 * `gltfRig.builder()` with zero call sites, a `preview.aim` that `tools.js`
 * declared and `preview.js` never read, a material silently substituted for
 * every chassis on seventeen machines. Animation is worse than any of them,
 * because a clip that loads, binds and drives nothing looks exactly like a
 * clip that is simply not playing yet.
 *
 * So this asserts on MEASURED TRANSFORMS AT TWO DIFFERENT TIMES, and it fails
 * if a claimed node is in the same place at both.
 *
 * ── AND DOES IT FIGHT THE SIM? ─────────────────────────────────────────────
 * The interesting half. `rigFactory.js:setCarriage()` writes
 * `dyn.carriage.position.y` EVERY FRAME, and the rod-change clip writes the
 * same node's translation. This harness reproduces that exactly — it writes
 * the carriage the way `setCarriage()` does, then ticks the animator, in that
 * order, every frame — and then checks the four things that have to be true:
 *
 *   1. at full weight the clip wins on the channel it keyed;
 *   2. `.rotation.x`, which `setCarriage()` also writes and the clip does NOT
 *      key, still holds the sim's value underneath it — arbitration is per
 *      CHANNEL, not per node;
 *   3. during the fade the node is strictly between the two, so nothing snaps;
 *   4. once the clip has released, the sim's value is back, exactly.
 *
 * Node, not a browser, on purpose: none of this is a GPU question, and a test
 * that needs a server and a 27 s shader compile is a test that gets skipped.
 * `.qa-anim-shot.mjs` does the on-screen half.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { readClips, createAnimator } from './src/core/gltfAnim.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const MODEL = resolve(HERE, process.argv[2] || 'public/models/dth-crawler.glb');
const CLIP = process.argv[3] || 'rod-change';

let failures = 0;
const ok = (cond, what, detail) => {
  if (cond) console.log(`  PASS  ${what}${detail ? '   ' + detail : ''}`);
  else { failures++; console.log(`  FAIL  ${what}${detail ? '   ' + detail : ''}`); }
};
const f = (x) => (x >= 0 ? ' ' : '') + x.toFixed(5);

/* ── load, exactly the way gltfRig.js does ─────────────────────────────────
   Including restoreNames(), because that repair is what breaks a stock
   AnimationMixer and is therefore the condition gltfAnim has to survive. */
function restoreNames(gltf) {
  const { json, associations } = gltf.parser;
  let restored = 0;
  for (const [obj, ref] of associations) {
    if (!ref || ref.nodes === undefined || !obj || !obj.isObject3D) continue;
    const authored = (json.nodes[ref.nodes] || {}).name;
    if (authored && obj.name !== authored) { obj.name = authored; restored++; }
  }
  return restored;
}

async function parse() {
  if (!existsSync(MODEL)) {
    console.error(`\n${MODEL} is not there. Build it:\n`
      + '  blender --background --python blender/motion/dth_crawler.py -- '
      + 'public/models/dth-crawler.glb\n');
    process.exit(2);
  }
  const b = readFileSync(MODEL);
  const gltf = await new GLTFLoader().parseAsync(
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), '');
  return gltf;
}

const bytes = readFileSync(MODEL).byteLength;
console.log(`\n.qa-anim  ${MODEL}  ${(bytes / 1024).toFixed(1)} kB`);

/* ═══════════════════════════════════════════════════════════════════════════
   1. The clips are in the file and readClips can address them
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n[1] read');
const gltf = await parse();
const sanitisedNames = [];
gltf.scene.traverse((o) => { if (o.name) sanitisedNames.push(o.name); });
const restored = restoreNames(gltf);
console.log(`  GLTFLoader sanitised ${restored} node name(s); restored before indexing`);
ok(sanitisedNames.includes('pivotcarousel') || sanitisedNames.includes('pivotspindle'),
  'GLTFLoader really does strip the colons (the reason a mixer cannot bind)',
  sanitisedNames.filter((n) => n.startsWith('pivot')).slice(0, 3).join(' '));

const clipset = readClips(THREE, gltf, 'dth-crawler');
ok(clipset.problems.length === 0, 'no refused tracks', clipset.problems.join(' | '));
ok(clipset.clips.length >= 1, `${clipset.clips.length} clip(s) read`);
const meta = clipset.clips.find((c) => c.name === CLIP);
ok(!!meta, `clip "${CLIP}" is present`,
  meta ? `${meta.duration.toFixed(3)} s, nodes: ${meta.nodes.join(' ')}` : '');
if (!meta) process.exit(1);

/* ═══════════════════════════════════════════════════════════════════════════
   2. It binds against the RESTORED names (the real runtime condition)
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n[2] bind');
const root = gltf.scene;
const anim = createAnimator(THREE, clipset, root);
ok(anim.problems().length === 0, 'every claimed node resolved on the instance',
  anim.problems().join(' | '));
ok(anim.has(CLIP), `animator carries "${CLIP}"`);
console.log('  ' + JSON.stringify(anim.describe()));

const nodeOf = {};
root.traverse((o) => { if (o.name) nodeOf[o.name] = o; });
const carriage = nodeOf['slide:carriage'];
const spindle = nodeOf['pivot:spindle'];
const carousel = nodeOf['pivot:carousel'];
const arm = nodeOf['pivot:rodArm'];
ok(!!(carriage && spindle && carousel && arm), 'the four named nodes are in the scene');

/* An UNCLAIMED dynamic node, to prove a clip touches only what it keyed. */
let untouched = null;
root.traverse((o) => {
  if (!untouched && o.name && o.name.startsWith('pivot:') && !meta.nodes.includes(o.name)) {
    untouched = o;
  }
});
const untouchedBefore = untouched ? untouched.position.clone() : null;

/* ═══════════════════════════════════════════════════════════════════════════
   3. Play it, with the sim writing the same node every frame
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n[3] play — the sim writes slide:carriage every frame, then the clip does');

const REST_Y = carriage.position.y;         // Y-up: the feed axis after export
const SIM_Y = REST_Y - 0.7;                 // where setCarriage() is holding it
const SIM_FLEX = 0.031;                     // setCarriage() also writes rotation.x

const DT = 1 / 60;
const samples = [];
function frame(t) {
  // ── what rigFactory.js does, unconditionally, every frame ──────────────
  carriage.position.y = SIM_Y;
  carriage.rotation.x = SIM_FLEX;
  // ── then the clip arbitrates ────────────────────────────────────────────
  anim.update(DT);
  samples.push({
    t,
    w: anim.weight(CLIP),
    cy: carriage.position.y,
    crx: carriage.rotation.x,
    sq: spindle.quaternion.clone(),
    cz: carousel.quaternion.clone(),
    aq: arm.quaternion.clone(),
  });
}

anim.play(CLIP, { fadeIn: 0.25, fadeOut: 0.25 });
const N = Math.ceil((meta.duration + 1.0) / DT);
for (let i = 0; i < N; i++) frame(i * DT);

const at = (t) => samples.reduce((b, s) =>
  (Math.abs(s.t - t) < Math.abs(b.t - t) ? s : b), samples[0]);

/* ── 3a. THE HEADLINE: two different times, two different transforms ─────── */
const A = at(3.0);          // running to the bottom of the pass
const B = at(9.0);          // retracting to the top
console.log(`\n  slide:carriage .position.y   t=${A.t.toFixed(2)} ${f(A.cy)}   `
  + `t=${B.t.toFixed(2)} ${f(B.cy)}   (sim alone would hold ${f(SIM_Y)})`);
ok(Math.abs(A.cy - B.cy) > 0.5,
  'the carriage is in a DIFFERENT PLACE at two different times',
  `moved ${Math.abs(A.cy - B.cy).toFixed(3)} m between them`);
ok(Math.abs(A.cy - SIM_Y) > 0.1 && Math.abs(B.cy - SIM_Y) > 0.1,
  'and neither place is where the sim was holding it — the clip won the channel');

/* ── 3b. per channel, not per node ──────────────────────────────────────── */
ok(Math.abs(B.crx - SIM_FLEX) < 1e-9,
  'setCarriage()\'s .rotation.x survives underneath — the clip keyed only translation',
  `${f(B.crx)} vs ${f(SIM_FLEX)}`);

/* ── 3c. the other three nodes actually turn ────────────────────────────── */
const ang = (q0, q1) => 2 * Math.acos(Math.min(1, Math.abs(q0.dot(q1))));
const deg = (r) => (r * 180 / Math.PI);
const spinTotal = samples.slice(1).reduce((a, s, i) => a + ang(samples[i].sq, s.sq), 0);
console.log(`  pivot:spindle  swept ${deg(spinTotal).toFixed(1)} deg over the clip`);
ok(deg(spinTotal) > 360 * 5,
  'the spindle really turns six times (3 out, 3 in) — not the identity quaternion',
  `${deg(spinTotal).toFixed(1)} deg`);
const carouselEnd = deg(ang(samples[0].cz, samples[samples.length - 1].cz));
ok(carouselEnd > 55 && carouselEnd < 65,
  'the carousel indexes one pocket of six', `${carouselEnd.toFixed(2)} deg`);
const armMax = Math.max(...samples.map((s) => deg(ang(samples[0].aq, s.aq))));
ok(armMax > 30 && armMax < 36,
  'the rod guide swings onto the string and back', `peak ${armMax.toFixed(2)} deg`);

/* ── 3d. nothing else moved ─────────────────────────────────────────────── */
if (untouched) {
  ok(untouched.position.distanceTo(untouchedBefore) < 1e-9,
    `an unclaimed node (${untouched.name}) was not touched`);
}

/* ── 3e. the fade is a blend, not a cut ─────────────────────────────────── */
const mid = samples.find((s) => s.w > 0.2 && s.w < 0.8);
ok(!!mid, 'there is a frame at partial weight (the hand-over is a ramp)',
  mid ? `w=${mid.w.toFixed(3)} y=${f(mid.cy)}` : '');
if (mid) {
  const clipY = samples.find((s) => s.w >= 1);
  ok(mid.cy > Math.min(SIM_Y, mid.cy) - 1e-9 && Math.abs(mid.cy - SIM_Y) > 1e-9,
    'and at partial weight the node is between the sim and the clip',
    `sim ${f(SIM_Y)} < live ${f(mid.cy)}, full-weight sample ${f(clipY ? clipY.cy : NaN)}`);
}

/* ── 3f. it hands the node back ─────────────────────────────────────────── */
const last = samples[samples.length - 1];
ok(!anim.isPlaying(CLIP), 'the clip released itself at the end');
ok(Math.abs(last.cy - SIM_Y) < 1e-9,
  'and the carriage is EXACTLY back where the sim put it — no residue',
  `${f(last.cy)} vs ${f(SIM_Y)}`);
ok(anim.claims().size === 0, 'claims() is empty once nothing is playing');

/* ═══════════════════════════════════════════════════════════════════════════
   4. It binds without restoreNames() too — order must not matter
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n[4] bind against the SANITISED names (attached before restoreNames)');
const g2 = await parse();                       // names left as GLTFLoader made them
const cs2 = readClips(THREE, g2, 'dth-crawler');
const a2 = createAnimator(THREE, cs2, g2.scene);
ok(a2.problems().length === 0, 'resolves through the sanitiser as well',
  a2.problems().join(' | '));
let c2 = null;
g2.scene.traverse((o) => { if (o.name === 'slidecarriage') c2 = o; });
const y0 = c2 ? c2.position.y : NaN;
a2.play(CLIP, { fadeIn: 0 });
for (let i = 0; i < Math.ceil(4.0 / DT); i++) a2.update(DT);
ok(c2 && Math.abs(c2.position.y - y0) > 0.5,
  'and it moves the node either way', `${f(y0)} -> ${f(c2 ? c2.position.y : NaN)}`);

/* ═══════════════════════════════════════════════════════════════════════════
   5. It refuses loudly
   ═══════════════════════════════════════════════════════════════════════════ */
console.log('\n[5] refusal');
const quiet = () => {};
ok(anim.play('no-such-clip', {}) === false, 'play() of an unknown clip returns false');
ok(createAnimator(THREE, { clips: [{
  name: 'orphan', duration: 1, nodes: ['pivot:nope'],
  channels: [{ node: 'pivot:nope', sanitised: 'pivotnope', prop: 'position',
    track: meta.channels[0].track, size: 3 }],
}] }, root, { say: quiet }).problems().length === 1,
  'a clip whose node is missing is refused, not played half-bound');

/* ═══════════════════════════════════════════════════════════════════════════ */
console.log(`\n${failures ? 'FAIL' : 'PASS'}  .qa-anim  `
  + `${samples.length} frames simulated, ${failures} failure(s)\n`);
process.exit(failures ? 1 : 0);
