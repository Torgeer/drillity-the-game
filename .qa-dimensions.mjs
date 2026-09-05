/**
 * Dimension proof for src/rig/tools.js — the companion to .qa-topology.mjs.
 *
 * `.qa-topology.mjs` proves the three overburden families are the objects
 * their names claim. This proves the same thing about NUMBERS, for the rest
 * of the catalogue: that every diameter and travel a spec quotes can be
 * measured off the mesh that ships.
 *
 * The precedent is AUDIT_ACCURACY.md:86-95 — an eccentric system quoting a
 * 121 mm ream while sweeping 179.1 mm, a ring-bit system advertised as
 * cutting 0.146 mm, and a casing crown quoting its shoulder while its gauge
 * buttons cut 9 mm wider. Each was a number authored beside the geometry
 * instead of read off it, and each shipped in a green build.
 *
 * WHY THIS IS NOT A BLANKET SWEEP OVER EVERY `…Mm` FIELD. A first version of
 * this file was, and it produced 201 "mismatches" of which almost all were
 * noise: `boreMm` is an internal bore and is SUPPOSED to be smaller than the
 * sweep; `idMm` likewise; a friction bolt's `odMm` is the tube, not the
 * 150 mm plate that ships on it; `heightMm` on a bucket is the barrel, not
 * the kelly head above it. A guard that cries wolf 200 times is a guard
 * nobody runs. So each family states what it means, the way the topology
 * proof does.
 *
 *   node .qa-dimensions.mjs           run the proof
 *   node .qa-dimensions.mjs --table   plus a draw/triangle table for the fleet
 */
import * as THREE from 'three';
import { buildTool, listTools } from './src/rig/tools.js';

const ctx = { THREE };
const mm = (m) => Math.round(m * 20000) / 10;    // radius (m) -> diameter (mm)

let bad = 0;
const ok = (cond, label, detail) => {
  if (!cond) bad++;
  console.log((cond ? '  PASS  ' : '  FAIL  ') + label.padEnd(56) + (detail === undefined ? '' : detail));
};
const h = (s) => console.log('\n' + s + '\n' + '-'.repeat(78));

function metrics(root) {
  root.updateWorldMatrix(true, true);
  const v = new THREE.Vector3();
  let r = 0, lo = Infinity, hi = -Infinity, tris = 0, draws = 0;
  root.traverse((o) => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
    draws++;
    const gm = o.geometry;
    const c = gm.index ? gm.index.count : gm.attributes.position.count;
    tris += (c / 3) * (o.isInstancedMesh ? o.count : 1);
    if (o.isInstancedMesh) return;
    const p = gm.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
      const q = Math.hypot(v.x, v.z);
      if (q > r) r = q;
      if (v.y < lo) lo = v.y;
      if (v.y > hi) hi = v.y;
    }
  });
  return { dia: mm(r), lenMm: (hi - lo) * 1000, top: hi, bottom: lo, tris: Math.round(tris), draws };
}
const build = (id, o) => buildTool(THREE, ctx, id, o || {});

/* ══ 1. BELLING TOOL — it must reach the bell it advertises ═══════════════ */
h('1. BELLING TOOL  (belling-tool, 800 mm shaft / 1600 mm bell)');
{
  const t = build('belling-tool', { merge: false });
  const s = t.userData.spec;
  ok(typeof t.userData.setOpen === 'function', 'exposes setOpen() — the arms are driven');
  ok(!!t.userData.armTravel, 'declares an arm travel');

  const at = (v) => { t.userData.setOpen(v); return metrics(t).dia; };
  const shut = at(0), open = at(1);

  /* THE DEFINING CLAIM, and the one that used to be false. It quoted
     bellDiaMm 1600 while sweeping 1222.1 mm fully open — 378 mm short — and
     the arms swung the wrong way, across the centreline instead of away from
     it, so the "envelope" was how far they overshot the axis. */
  ok(Math.abs(open - s.bellDiaMm) <= 2, 'quoted bellDiaMm matches the fully open sweep',
    'spec ' + s.bellDiaMm + ' vs measured ' + open.toFixed(1) + ' mm');
  ok(Math.abs(shut - s.foldedDiaMm) <= 2, 'quoted foldedDiaMm matches the folded sweep',
    'spec ' + s.foldedDiaMm + ' vs measured ' + shut.toFixed(1) + ' mm');
  /* And the claim that lets it get to the bottom at all: it goes down a
     bored shaft, so folded it has to fit inside one. */
  ok(shut < s.shaftDiaMm, 'folded, the tool fits back up the shaft bore',
    'folded ' + shut.toFixed(1) + ' mm < shaft ' + s.shaftDiaMm + ' mm');
  ok(open > s.shaftDiaMm, 'open, it under-reams wider than the shaft it came down',
    'bell ' + open.toFixed(1) + ' mm > shaft ' + s.shaftDiaMm + ' mm');

  const sweep = [0, 0.25, 0.5, 0.75, 1].map(at);
  let monotone = true;
  for (let i = 1; i < sweep.length; i++) if (sweep[i] < sweep[i - 1] - 0.01) monotone = false;
  ok(monotone, 'the envelope grows monotonically through the travel',
    sweep.map((x) => x.toFixed(0)).join(' -> ') + ' mm');
  t.userData.dispose();
}

/* ══ 2. DRILLING JARS — a jar that cannot jar is not a jar ════════════════ */
h('2. DRILLING JARS  (drilling-jars, 500 mm stroke)');
{
  const t = build('drilling-jars', { merge: false });
  const s = t.userData.spec;
  ok(typeof t.userData.setStroke === 'function', 'exposes setStroke() — the links really slide');
  const at = (v) => { t.userData.setStroke(v); return metrics(t).lenMm; };
  const closed = at(0), open = at(1);
  ok(Math.abs(open - closed - s.strokeMm) <= 2, 'the mesh moves through the whole quoted stroke',
    'closed ' + closed.toFixed(0) + ' -> open ' + open.toFixed(0) + ' mm = ' + (open - closed).toFixed(0)
    + ' mm vs spec ' + s.strokeMm);
  /* The old spec quoted lengthMm 2295 on a tool that measured 1543 — the
     expression that built it counted the link length twice. */
  ok(Math.abs(closed - s.lengthMm) <= 3, 'quoted lengthMm is the measured closed length',
    'spec ' + s.lengthMm + ' vs measured ' + closed.toFixed(0));
  ok(Math.abs(open - s.extendedLengthMm) <= 3, 'quoted extendedLengthMm is the measured open length',
    'spec ' + s.extendedLengthMm + ' vs measured ' + open.toFixed(0));
  t.userData.dispose();
}

/* ══ 3. FOUNDATION CORE BARREL — the teeth cut the hole, not the shell ════ */
h('3. FOUNDATION CORE BARREL  (foundation-core-barrel)');
{
  const t = build('foundation-core-barrel', { merge: false });
  const s = t.userData.spec;
  const m = metrics(t);
  ok(Math.abs(m.dia - s.diameterMm) <= 2, 'quoted diameterMm is the measured pick-tip sweep',
    'spec ' + s.diameterMm + ' vs measured ' + m.dia.toFixed(1) + ' mm');
  ok(s.diameterMm > s.barrelOdMm, 'the teeth cut over-gauge, so the shell has clearance',
    'cut ' + s.diameterMm + ' mm > barrel OD ' + s.barrelOdMm + ' mm');
  ok(s.overGaugeMm > 5 && s.overGaugeMm < 60, 'the over-gauge is a clearance, not an undeclared 94 mm',
    s.overGaugeMm + ' mm');
  t.userData.dispose();
}

/* ══ 4. JUMBO FEED — the hole follows the rod ═════════════════════════════ */
h('4. JUMBO FEED  (hole length must depend on rod length)');
{
  const a = build('jumbo-feed-3100', {}), b = build('jumbo-feed-3900', {});
  const sa = a.userData.spec, sb = b.userData.spec;
  ok(sa.rodMm !== sb.rodMm, 'the two feeds carry different rods', sa.rodMm + ' vs ' + sb.rodMm + ' mm');
  ok(sa.holeLenMm !== sb.holeLenMm, 'and therefore drill different holes — this used to be one literal',
    sa.holeLenMm + ' vs ' + sb.holeLenMm + ' mm');
  ok(sb.rodMm - sb.holeLenMm === sa.rodMm - sa.holeLenMm,
    'the shank/chuck loss is a property of the drifter, constant across sizes',
    (sb.rodMm - sb.holeLenMm) + ' mm both');
  ok(sa.holeLenMm < sa.rodMm && sb.holeLenMm < sb.rodMm, 'a hole is never longer than the rod that drilled it');
  const ma = metrics(a), mbm = metrics(b);
  ok(Math.abs(ma.lenMm - sa.lengthMm) < sa.lengthMm * 0.03, 'the 3100 feed beam measures its quoted length',
    'spec ' + sa.lengthMm + ' vs measured ' + ma.lenMm.toFixed(0));
  ok(Math.abs(mbm.lenMm - sb.lengthMm) < sb.lengthMm * 0.03, 'the 3900 feed beam measures its quoted length',
    'spec ' + sb.lengthMm + ' vs measured ' + mbm.lenMm.toFixed(0));
  a.userData.dispose(); b.userData.dispose();
}

/* ══ 5. THE FOUR PILES ARE FOUR DIFFERENT OBJECTS ═════════════════════════ */
h('5. PILE FAMILY  (a precast, a tube, an H and a sheet pair are not each other)');
{
  const ids = ['precast-pile', 'tube-pile', 'h-pile', 'sheet-pile-pair'];
  const sig = {};
  for (const id of ids) {
    const t = build(id, { merge: false });
    const m = metrics(t);
    /* A cross-section fingerprint: bin the section outline by angle and
       record how far the solid reaches in each sector. A round tube, an
       octagon, an I and a Z give four different answers.
       SAMPLED AT THE HEAD, NOT MID-SHAFT. Extrusions and lathes carry
       vertices only at their ends, so a mid-height slab of a 12 m pile
       catches almost nothing — a first version of this check sampled there
       and reported every pile as ratio 0.00, which is a property of the
       tessellation and not of the pile. */
    const N = 72, bins = new Array(N).fill(0);
    const headY = m.top, slab = Math.max(0.02, (m.top - m.bottom) * 0.05);
    const v = new THREE.Vector3();
    t.updateWorldMatrix(true, true);
    t.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      const p = o.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
        if (v.y > headY + 0.001 || v.y < headY - slab) continue;   // the head slab, in metres
        const a = Math.atan2(v.z, v.x);
        const k = Math.min(N - 1, Math.max(0, Math.floor(((a + Math.PI) / (2 * Math.PI)) * N)));
        const q = Math.hypot(v.x, v.z);
        if (q > bins[k]) bins[k] = q;
      }
    });
    const filled = bins.filter((x) => x > 0).length;
    const mx = Math.max.apply(null, bins), mn = Math.min.apply(null, bins.filter((x) => x > 0).concat([mx]));
    sig[id] = { dia: m.dia, tris: m.tris, filled: filled, ratio: mx > 0 ? mn / mx : 0, spec: t.userData.spec };
    t.userData.dispose();
  }
  for (const id of ids) {
    const q = sig[id];
    console.log('        ' + id.padEnd(18) + 'sweep ' + q.dia.toFixed(0).padStart(5) + ' mm   tris '
      + String(q.tris).padStart(5) + '   section min/max ' + q.ratio.toFixed(2));
  }
  // A round tube is uniform about the axis; the other three are not.
  ok(sig['tube-pile'].ratio > 0.90, 'the tube pile really is round', sig['tube-pile'].ratio.toFixed(2));
  ok(sig['h-pile'].ratio < 0.80, 'the H-pile is not round — it has flanges and a web', sig['h-pile'].ratio.toFixed(2));
  ok(sig['sheet-pile-pair'].ratio < 0.80, 'the sheet pair is not round', sig['sheet-pile-pair'].ratio.toFixed(2));
  const set = new Set(ids.map((i) => sig[i].tris));
  ok(set.size === ids.length, 'four distinct geometries, not one builder with four labels',
    ids.map((i) => sig[i].tris).join(' / ') + ' triangles');
  // Each declares how it is joined, and none of them by a thread — DOMAIN.md
  // §"Driven piling": welded splice or sheet-pile interlock, never a thread.
  for (const id of ids) {
    const cf = sig[id].spec.connectionFamily;
    ok(cf === 'welded' || cf === 'interlock', id + ': joined by welding or interlock, never a thread', cf);
  }
}

/* ══ 6. THE CARBIDE CUTS THE HOLE — every percussive bit, every wear level ═
   The defect this catches, found across the whole button-bit and DTH-bit
   family: an 89 mm bit whose gauge row swept 95.5 mm and a 127 mm one that
   swept 136.3, because the steel body was built ON gauge and the buttons were
   then planted on top of it. A bit like that cannot re-enter its own hole —
   the same failure AUDIT_ACCURACY.md records on the Odex eccentric.

   Three things have to hold together, and all three are read off the mesh:
     · the carbide sweeps the diameter the spec quotes, at EVERY wear level
     · new, the carbide stands PROUD of the steel — Halco's build tolerance is
       0.80 mm on diameter, and Rockmore and Epiroc both state that a bit
       leaves the works 0.5-2.5 mm over its catalogue size
     · worn out, it does not — Boart Longyear's scrap rule is that a bit is
       finished "when the diameter across the gauge is less than or equal to
       the diameter of the bit body", because past that point it binds.       */
h('6. PERCUSSIVE GAUGE  (the buttons cut the hole; the body must not)');
{
  const carbide = (o) => /carbide/.test((o.material && o.material.name) || '');
  const sweepIf = (root, pred) => {
    root.updateWorldMatrix(true, true);
    const v = new THREE.Vector3();
    let r = 0;
    root.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      if (o.isInstancedMesh || (pred && !pred(o))) return;
      const p = o.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
        const q = Math.hypot(v.x, v.z);
        if (q > r) r = q;
      }
    });
    return r * 2000;
  };
  const ids = listTools().filter((id) => {
    const t = buildTool(THREE, ctx, id, { wear: 0, lod: 'low' });
    const has = !!(t.userData.spec && t.userData.spec.cutDiameterMm !== undefined);
    t.userData.dispose();
    return has;
  });
  let offQuote = 0, notProud = 0, notOut = 0, worst = 0, worstId = '';
  for (const id of ids) {
    for (const wear of [0, 0.35, 0.7, 1]) {
      const t = buildTool(THREE, ctx, id, { wear, lod: 'high' });
      const sp = t.userData.spec;
      const c = sweepIf(t, carbide);
      const all = sweepIf(t, null);
      const d = c - sp.cutDiameterMm;
      if (Math.abs(d) > Math.abs(worst)) { worst = d; worstId = id + ' @wear ' + wear; }
      if (Math.abs(d) > 0.25) {
        offQuote++;
        console.log('        OFF QUOTE  ' + id + ' wear ' + wear + ': quoted '
          + sp.cutDiameterMm + ', carbide sweeps ' + c.toFixed(2));
      }
      if (wear === 0 && c <= all - 0.02) {
        notProud++;
        console.log('        NOT PROUD  ' + id + ': body ' + all.toFixed(2) + ' >= carbide ' + c.toFixed(2));
      }
      if (wear === 1 && c > all + 0.02) {
        notOut++;
        console.log('        STILL ON GAUGE  ' + id + ' at wear 1: carbide '
          + c.toFixed(2) + ' > body ' + all.toFixed(2));
      }
      t.userData.dispose();
    }
  }
  ok(ids.length >= 20, 'the percussive bit families declare a cut diameter', ids.length + ' ids');
  ok(offQuote === 0, 'carbide sweeps the quoted cut diameter at every wear level',
    'worst ' + worst.toFixed(2) + ' mm on ' + worstId);
  ok(notProud === 0, 'new, the gauge row stands proud of the body', 'Halco build tolerance');
  ok(notOut === 0, 'worn out, the body has caught the gauge — the bit is gauged out',
    'Boart Longyear scrap rule');
}

/* ══ 7. NOTHING GAINED A DRAW CALL IT DID NOT EARN ════════════════════════ */
h('7. DRAW-CALL BUDGET  (every id, high LOD, three wear levels)');
{
  const ids = listTools();
  let worstDraw = 0, worstId = '', fails = 0, totalDraw = 0;
  const originOffenders = [];
  let coldWorst = 0, coldWorstId = '';
  const rows = [];
  for (const id of ids) {
    let peak = 0;
    for (const wear of [0, 0.5, 1]) {
      let t;
      try { t = build(id, { wear, lod: 'high' }); }
      catch (e) { console.log('        THREW ' + id + ' @wear ' + wear + ': ' + e.message); fails++; continue; }
      const m = metrics(t);
      if (m.draws > peak) peak = m.draws;
      if (wear === 0 && m.draws > coldWorst) { coldWorst = m.draws; coldWorstId = id; }
      if (!isFinite(t.userData.fitRadius) || t.userData.fitRadius <= 0) { console.log('        BAD fitRadius ' + id); fails++; }
      if ((t.userData.spec || {}).id === 'billet' && id !== 'billet') { console.log('        FELL BACK TO BILLET: ' + id); fails++; }
      /* Downhole tools hang from y=0 down -Y, because rigFactory.js
         updateSection() reads `trueLen = -bounds.min[1]` and would silently
         rescale the cross-section for anything reaching above the origin.
         Surface plant (skid-mounted compressors, power units, pumps) and
         leader-guided hammers legitimately stand up from y=0, so this is a
         report line and not a failure — it exists so that a DOWNHOLE builder
         that starts drifting upward gets noticed. */
      if (wear === 0 && m.top > 0.12) originOffenders.push(id + ' +' + m.top.toFixed(2) + ' m');
      if (wear === 0) rows.push({ id, draws: m.draws, tris: m.tris });
      t.userData.dispose();
    }
    totalDraw += peak;
    if (peak > worstDraw) { worstDraw = peak; worstId = id; }
  }
  ok(fails === 0, ids.length + ' ids build at 3 wear levels', fails ? fails + ' failures' : 'no failures');
  console.log('        standing above y=0 (surface plant + leader hammers, expected): ' + originOffenders.length);
  /* 17 was raisebore-reamer at wear 0, the agreed ceiling for the catalogue.
     Anything above it on a NEW tool is a regression. */
  ok(coldWorst <= 17, 'no tool exceeds the agreed ceiling of 17 draw calls (wear 0)',
    'heaviest: ' + coldWorstId + ' at ' + coldWorst);
  /* Wear can add materials — a snapped button is a socket, a chipped PDC
     cutter is a different geometry — so a worn tool can cost more than a new
     one. Reported, not asserted: it is a real budget fact and the tools that
     do it should be looked at, but it is not caused by anything here. */
  console.log('        worst across all wear levels: ' + worstId + ' at ' + worstDraw
    + (worstDraw > coldWorst ? '  (wear adds ' + (worstDraw - coldWorst) + ')' : ''));
  console.log('        median draws/tool: ' + rows.slice().sort((a, b) => a.draws - b.draws)[rows.length >> 1].draws
    + '   mean: ' + (totalDraw / ids.length).toFixed(2));
  if (process.argv.indexOf('--table') >= 0) {
    for (const r of rows.slice().sort((a, b) => b.draws - a.draws)) {
      console.log('        ' + r.id.padEnd(24) + 'draws=' + String(r.draws).padStart(3) + '  tris=' + String(r.tris).padStart(6));
    }
  }
}

console.log('\n' + '='.repeat(78));
console.log(bad ? ('DIMENSION PROOF FAILED — ' + bad + ' assertion(s)') : 'DIMENSION PROOF PASSED — all assertions hold');
process.exit(bad ? 1 : 0);
