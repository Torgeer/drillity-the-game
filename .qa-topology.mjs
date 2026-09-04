/**
 * Topology proof for the overburden families in src/rig/tools.js.
 *
 * The accuracy audit's finding 4 was that buildWingBitSystem() was
 * buildConcentricSystem() with a new label, so the game modelled a wing
 * system and called it concentric. This walks the built node trees and
 * proves the two topologies are now distinct and each one is what its
 * name claims, rather than eyeballing a render.
 */
import * as THREE from 'three';
import { buildTool, listTools } from './src/rig/tools.js';

const ctx = { THREE };
const mm = (m) => Math.round(m * 20000) / 10;   // radius (m) -> diameter (mm), 0.1 mm

let bad = 0;
const ok = (cond, label, detail) => {
  if (!cond) bad++;
  console.log((cond ? '  PASS  ' : '  FAIL  ') + label.padEnd(52) + (detail === undefined ? '' : detail));
};
const h = (s) => console.log('\n' + s + '\n' + '-'.repeat(74));

/** Every descendant group flagged dynamic — i.e. every node that can move. */
function movers(root) {
  const out = [];
  root.traverse((o) => { if (o !== root && o.userData && o.userData.dynamic) out.push(o.name || '(unnamed)'); });
  return out;
}
function named(root, name) {
  let f = null;
  root.traverse((o) => { if (!f && o.name === name) f = o; });
  return f;
}
/**
 * Widest cylindrical radius of a subtree, in world space.
 * `skip` prunes named branches — the retrievable envelope of an overburden
 * system is the part that comes home, so the casing shoe (which by definition
 * stays in the hole) must not be counted against the casing bore it IS.
 */
function sweptRadius(node, skip) {
  node.updateWorldMatrix(true, true);
  const v = new THREE.Vector3();
  let r = 0;
  const walk = (o) => {
    if (skip && skip.indexOf(o.name) >= 0) return;
    if (o.isMesh && o.geometry && o.geometry.attributes.position) {
      const p = o.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
        const q = Math.hypot(v.x, v.z);
        if (q > r) r = q;
      }
    }
    for (const c of o.children) walk(c);
  };
  walk(node);
  return r;
}
function yRange(node) {
  node.updateWorldMatrix(true, true);
  const v = new THREE.Vector3();
  let lo = Infinity, hi = -Infinity;
  node.traverse((o) => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
      if (v.y < lo) lo = v.y;
      if (v.y > hi) hi = v.y;
    }
  });
  return [lo, hi];
}
function draws(root) {
  let n = 0;
  root.traverse((o) => { if (o.isMesh && o.geometry) n++; });
  return n;
}
function drawBreakdown(root) {
  const rows = [];
  root.traverse((o) => { if (o.isMesh && o.geometry) rows.push((o.parent && o.parent.name ? o.parent.name : 'root') + '/' + (o.name || 'mesh')); });
  return rows;
}

/* ══ 1. CONCENTRIC — ring bit on the shoe, same centreline, NO hinge ══════ */
h('1. CONCENTRIC SYSTEM  (concentric-system, 139.7 mm casing)');
{
  const t = buildTool(THREE, ctx, 'concentric-system', { merge: false });
  const s = t.userData.spec;
  const ring = named(t, 'ring-bit');
  const pilot = named(t, 'pilot-bit');
  const shoe = named(t, 'casing-shoe');

  ok(!!ring, 'a ring-bit node exists');
  ok(!!shoe, 'a casing-shoe node exists');
  ok(!!pilot, 'a pilot-bit node exists');

  // THE defining negative: concentric means no hinge, nothing retracts.
  const mv = movers(t);
  ok(mv.length === 0, 'NO moving/hinged node anywhere', mv.length ? 'found: ' + mv.join(', ') : '(0 dynamic nodes)');
  ok(!named(t, 'wing-pivot0') && !named(t, 'reamer-pivot'), 'no wing-pivot / reamer-pivot node');
  ok(typeof t.userData.setOpen !== 'function', 'exposes no setOpen() — nothing opens or folds');
  ok(s.hinges === 0 && s.movingParts === 0, 'spec declares hinges=0, movingParts=0');

  // Same centreline: both bodies concentric about the axis.
  const rRing = sweptRadius(ring), rPilot = sweptRadius(pilot);
  const [ringLo, ringHi] = yRange(ring);
  const [shoeLo, shoeHi] = yRange(shoe);
  ok(Math.abs(ringHi - shoeLo) < 0.02, 'ring bit sits ON the casing shoe',
    'ring top ' + ringHi.toFixed(4) + ' m vs shoe bottom ' + shoeLo.toFixed(4) + ' m');

  // The retrieval claim, in steel: everything that comes home is smaller
  // than the casing bore; the part left behind is bigger than it.
  const bore = s.casingBoreMm;
  ok(mm(rPilot) < bore, 'pilot fits back up the casing bore',
    'pilot OD ' + mm(rPilot).toFixed(1) + ' mm < bore ' + bore + ' mm');
  ok(mm(rRing) > s.casingOdMm, 'ring bit cuts over-gauge for the casing',
    'ring cut ' + mm(rRing).toFixed(1) + ' mm > casing OD ' + s.casingOdMm + ' mm');
  ok(mm(rRing) > bore, 'ring bit CANNOT come back up — it is left in the ground',
    'ring OD ' + mm(rRing).toFixed(1) + ' mm > bore ' + bore + ' mm');

  // Quoted numbers must be read off the geometry, not authored beside it.
  ok(Math.abs(s.cutDiaMm - mm(rRing)) <= 1, 'quoted cutDiaMm matches measured geometry',
    'spec ' + s.cutDiaMm + ' vs measured ' + mm(rRing).toFixed(1));
  ok(Math.abs(s.pilotDiaMm - mm(rPilot)) <= 1, 'quoted pilotDiaMm matches measured geometry',
    'spec ' + s.pilotDiaMm + ' vs measured ' + mm(rPilot).toFixed(1));
  console.log('        spec:', JSON.stringify({
    casingOdMm: s.casingOdMm, casingBoreMm: s.casingBoreMm, pilotDiaMm: s.pilotDiaMm,
    ringBitOdMm: s.ringBitOdMm, cutDiaMm: s.cutDiaMm, driveLugs: s.driveLugs, hinges: s.hinges,
  }));
  t.userData.dispose();
}

/* ══ 2. WING-BIT — wings that really rotate, and really retract ═══════════ */
h('2. WING-BIT SYSTEM  (wing-bit-system, 139.7 mm casing)');
{
  const t = buildTool(THREE, ctx, 'wing-bit-system', { merge: false });
  const s = t.userData.spec;
  const pivots = t.userData.wingPivots || [];

  ok(pivots.length === s.wings && s.wings >= 2, 'one hinge node per wing', s.wings + ' wings, ' + pivots.length + ' pivots');
  ok(movers(t).length === s.wings, 'the hinges are the only moving nodes', movers(t).join(', '));
  ok(typeof t.userData.setOpen === 'function', 'exposes setOpen() — the wings are driven');

  // Walk the wings through their whole travel and measure both ends. The
  // casing shoe is excluded: it is the casing, it does not come back up.
  const trav = t.userData.wingTravel;
  const at = (v) => { t.userData.setOpen(v); return sweptRadius(t, ['casing-shoe']); };
  const rOpen = at(1), rShut = at(0);
  ok(trav && trav.open !== trav.closed, 'travel is a real angular range',
    'closed ' + trav.closed.toFixed(2) + ' rad -> open ' + trav.open.toFixed(2) + ' rad');

  // Sample the sweep so we know the wing moves continuously, not just at ends.
  const sweepSamples = [0, 0.25, 0.5, 0.75, 1].map((v) => mm(at(v)));
  let monotone = true;
  for (let i = 1; i < sweepSamples.length; i++) if (sweepSamples[i] < sweepSamples[i - 1] - 0.01) monotone = false;
  ok(monotone, 'envelope grows monotonically as the wings open', sweepSamples.map((x) => x.toFixed(1)).join(' -> ') + ' mm');

  const wingOnly = pivots.length ? (t.userData.setOpen(1), sweptRadius(pivots[0])) : 0;
  const wingShut = pivots.length ? (t.userData.setOpen(0), sweptRadius(pivots[0])) : 0;
  ok(Math.abs(wingOnly - wingShut) > 0.004, 'a wing itself sweeps through its travel',
    'wing tip ' + mm(wingShut).toFixed(1) + ' mm folded -> ' + mm(wingOnly).toFixed(1) + ' mm open');

  // The two claims that make it a wing bit rather than a lost bit.
  ok(mm(rOpen) > s.casingOdMm, 'open, the wings ream clearance for the casing',
    'ream ' + mm(rOpen).toFixed(1) + ' mm > casing OD ' + s.casingOdMm + ' mm');
  ok(mm(rShut) <= s.casingBoreMm, 'folded, the whole bit passes back up the casing bore',
    'folded ' + mm(rShut).toFixed(1) + ' mm <= bore ' + s.casingBoreMm + ' mm');
  ok(s.retrievable === true && s.sacrificial === false, 'spec declares retrievable, not sacrificial');

  ok(Math.abs(s.reamDiaMm - mm(rOpen)) <= 1, 'quoted reamDiaMm matches measured geometry',
    'spec ' + s.reamDiaMm + ' vs measured ' + mm(rOpen).toFixed(1));
  ok(Math.abs(s.retractedDiaMm - mm(rShut)) <= 1, 'quoted retractedDiaMm matches measured geometry',
    'spec ' + s.retractedDiaMm + ' vs measured ' + mm(rShut).toFixed(1));
  console.log('        spec:', JSON.stringify({
    casingOdMm: s.casingOdMm, casingBoreMm: s.casingBoreMm, wings: s.wings, hinges: s.hinges,
    reamDiaMm: s.reamDiaMm, retractedDiaMm: s.retractedDiaMm, retrievable: s.retrievable, sacrificial: s.sacrificial,
  }));
  t.userData.dispose();
}

/* ══ 3. ECCENTRIC — the reamer swings OFF-CENTRE ══════════════════════════ */
h('3. ECCENTRIC SYSTEM  (eccentric-system, 114.3 mm casing)');
{
  const t = buildTool(THREE, ctx, 'eccentric-system', { merge: false });
  const s = t.userData.spec;
  const pivot = named(t, 'reamer-pivot');
  ok(!!pivot, 'a reamer-pivot node exists');
  ok(typeof t.userData.setOpen === 'function', 'exposes setOpen() — the reamer swings');

  const at = (v) => { t.userData.setOpen(v); return sweptRadius(t); };
  const rOpen = at(1), rShut = at(0);

  // Eccentric = off-centre. Prove the reamer is NOT concentric with the axis:
  // its own centroid must sit off the tool axis.
  t.userData.setOpen(1);
  pivot.updateWorldMatrix(true, true);
  const c = new THREE.Vector3();
  let n = 0;
  const v = new THREE.Vector3();
  pivot.traverse((o) => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { c.add(v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld)); n++; }
  });
  c.divideScalar(Math.max(1, n));
  const offAxis = Math.hypot(c.x, c.z);
  ok(offAxis > 0.005, 'the reamer sits OFF the tool centreline (this is what eccentric means)',
    'reamer centroid ' + (offAxis * 1000).toFixed(1) + ' mm off axis');

  ok(mm(rOpen) > s.casingOdMm, 'open, the reamer cuts clearance for the casing',
    'ream ' + mm(rOpen).toFixed(1) + ' mm > casing OD ' + s.casingOdMm + ' mm');
  const bore = s.casingBoreMm;
  if (bore === undefined) {
    ok(false, 'spec quotes a casing bore to retract through', 'casingBoreMm is MISSING from the spec');
  } else {
    ok(mm(rShut) <= bore, 'closed, the tool withdraws back through the casing bore',
      'closed ' + mm(rShut).toFixed(1) + ' mm <= bore ' + bore + ' mm');
  }
  ok(s.reamDiaMm !== undefined && Math.abs(s.reamDiaMm - mm(rOpen)) <= 1,
    'quoted reamDiaMm matches measured geometry',
    'spec ' + s.reamDiaMm + ' vs measured ' + mm(rOpen).toFixed(1));
  ok(s.retractedDiaMm !== undefined && Math.abs(s.retractedDiaMm - mm(rShut)) <= 1,
    'quoted retractedDiaMm matches measured geometry',
    'spec ' + s.retractedDiaMm + ' vs measured ' + mm(rShut).toFixed(1));
  const pilotOnly = mm(sweptRadius(named(t, 'pilot'), ['reamer-pivot', 'reamer-seat']));
  ok(s.pilotDiaMm !== undefined && Math.abs(s.pilotDiaMm - pilotOnly) <= 1,
    'quoted pilotDiaMm matches measured geometry',
    'spec ' + s.pilotDiaMm + ' vs measured ' + pilotOnly.toFixed(1));
  ok(s.sacrificial === false && s.retrievable === true, 'spec declares retrievable, not sacrificial');
  console.log('        spec:', JSON.stringify({
    casingOdMm: s.casingOdMm, casingBoreMm: s.casingBoreMm,
    pilotDiaMm: s.pilotDiaMm, reamDiaMm: s.reamDiaMm, retractedDiaMm: s.retractedDiaMm,
  }));
  t.userData.dispose();
}

/* ══ 3b. RING-BIT — same family, same class of quoted-number bug ══════════ */
h('3b. RING-BIT SYSTEM  (ring-bit, 139.7 mm casing)');
{
  for (const id of ['ring-bit', 'ring-bit-168']) {
    const t = buildTool(THREE, ctx, id, { merge: false });
    const s = t.userData.spec;
    const ring = named(t, 'ring-bit'), pilot = named(t, 'pilot-bit');
    const rRing = mm(sweptRadius(ring)), rPilot = mm(sweptRadius(pilot));
    ok(Math.abs(s.cutDiaMm - rRing) <= 1, id + ': quoted cutDiaMm matches measured geometry',
      'spec ' + s.cutDiaMm + ' vs measured ' + rRing.toFixed(1));
    ok(s.cutDiaMm > s.casingOdMm, id + ': ring bit cuts over-gauge for the casing',
      s.cutDiaMm + ' mm > casing OD ' + s.casingOdMm + ' mm');
    ok(Math.abs(s.pilotDiaMm - rPilot) <= 1, id + ': quoted pilotDiaMm matches measured geometry',
      'spec ' + s.pilotDiaMm + ' vs measured ' + rPilot.toFixed(1));
    t.userData.dispose();
  }
}

/* ══ 4. THE TWO FAMILIES ARE NOT THE SAME OBJECT ══════════════════════════ */
h('4. THE FAMILIES ARE DISTINCT  (finding 4 regression guard)');
{
  const sig = (id) => {
    const t = buildTool(THREE, ctx, id, { merge: false });
    const names = [];
    t.traverse((o) => names.push(o.name));
    let verts = 0;
    t.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.attributes.position) verts += o.geometry.attributes.position.count; });
    const s = { nodes: names.length, verts: verts, movers: movers(t).length, spec: t.userData.spec.family };
    t.userData.dispose();
    return s;
  };
  const cs = sig('concentric-system'), ws = sig('wing-bit-system'), es = sig('eccentric-system');
  console.log('        concentric:', JSON.stringify(cs));
  console.log('        wing-bit  :', JSON.stringify(ws));
  console.log('        eccentric :', JSON.stringify(es));
  ok(cs.verts !== ws.verts, 'concentric and wing-bit are different geometry, not a relabel',
    cs.verts + ' vs ' + ws.verts + ' vertices');
  ok(cs.movers === 0 && ws.movers > 0, 'only the wing family has moving parts',
    'concentric ' + cs.movers + ', wing ' + ws.movers);
  ok(cs.spec !== ws.spec && ws.spec !== es.spec, 'three distinct taxonomy families');
}

/* ══ 5. DRAW CALLS ════════════════════════════════════════════════════════ */
h('5. DRAW CALLS  (merged, as shipped)');
{
  for (const id of ['concentric-system', 'wing-bit-system', 'eccentric-system', 'ring-bit', 'casing-shoe', 'casing-crown']) {
    for (const lod of ['high', 'low']) {
      const t = buildTool(THREE, ctx, id, { lod });
      if (lod === 'high') console.log('        ' + id.padEnd(20) + ' high=' + String(draws(t)).padStart(3) + '   ' + drawBreakdown(t).join(' '));
      else console.log('        ' + ''.padEnd(20) + ' low =' + String(draws(t)).padStart(3));
      t.userData.dispose();
    }
  }
  const one = (id) => { const t = buildTool(THREE, ctx, id, {}); const d = draws(t); t.userData.dispose(); return d; };
  const after = one('concentric-system') + one('wing-bit-system');
  // BEFORE is a reconstruction, not a direct measurement: the tree is not under
  // version control and the old builder is gone. What is known exactly is its
  // shape — buildWingBitSystem() returned buildConcentricSystem() with four
  // spec fields overwritten, so BOTH ids rendered one geometry and the pair
  // cost exactly 2x that one build. The audit describes that build as "pilot
  // bit with hinged reamer wings that open on rotation and fold in for
  // retrieval", i.e. the wing topology, whose nearest surviving measurement is
  // today's wing build.
  const before = one('wing-bit-system') * 2;
  console.log('\n        BEFORE (reconstructed: one builder serving both ids) : ' + before + ' draw calls');
  console.log('        AFTER  (two real topologies)                          : ' + after + ' draw calls');
  ok(after <= before, 'two topologies cost no more than the one they replace',
    after + ' <= ' + before);
}

/* ══ 6. EVERY ID, EVERY WEAR LEVEL ════════════════════════════════════════ */
h('6. FULL CATALOGUE  (all ids x 3 wear levels x 2 LODs)');
{
  const ids = listTools();
  let fails = 0, maxDraw = 0, worst = '';
  for (const id of ids) {
    for (const wear of [0, 0.5, 1]) {
      for (const lod of ['high', 'low']) {
        let t;
        try { t = buildTool(THREE, ctx, id, { wear, lod }); }
        catch (e) { console.log('        THREW', id, wear, lod, e.message); fails++; continue; }
        const sp = t.userData.spec || {};
        if (sp.id === 'billet' && id !== 'billet') { console.log('        FELL BACK TO BILLET:', id); fails++; }
        if (!isFinite(t.userData.fitRadius) || t.userData.fitRadius <= 0) { console.log('        BAD fitRadius', id, wear, lod); fails++; }
        const d = draws(t);
        if (lod === 'high' && wear === 0 && d > maxDraw) { maxDraw = d; worst = id; }
        t.userData.dispose();
      }
    }
  }
  ok(fails === 0, ids.length + ' ids built at 3 wear levels x 2 LODs', fails ? fails + ' failures' : 'no failures');
  console.log('        heaviest single tool: ' + worst + ' at ' + maxDraw + ' draw calls');
}

console.log('\n' + '='.repeat(74));
console.log(bad ? ('TOPOLOGY PROOF FAILED — ' + bad + ' assertion(s)') : 'TOPOLOGY PROOF PASSED — all assertions hold');
process.exit(bad ? 1 : 0);
