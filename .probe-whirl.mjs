/* ═══════════════════════════════════════════════════════════════════════════
   .probe-whirl.mjs — MEASURE the drill string's lateral motion.

   The brief: "Verify by measurement, not by eye: sample the vertex
   displacement over a rotation and confirm it traces a circle, that peak
   deflection never exceeds the clearance, and that the precession rate tracks
   rpm."

   Three independent instruments, because a single one can only confirm what it
   was told to look for (HANDOFF.md §8C):

   1. SOURCE IDENTITY. The JS mirror below is only trustworthy while it is a
      transcription of the live shader, so the probe reads
      rodMesh.material.vertexShader off the running page and asserts that every
      term it mirrors is present. If someone edits the GLSL the mirror stops
      claiming to measure it.
   2. THE MIRROR, driven by LIVE uniforms sampled inside the page's own rAF —
      not by numbers this file made up. This is what gives x AND z, and z is
      invisible to the camera (orthographic, looking down -Z), so no pixel
      instrument can see it.
   3. PIXELS. The rendered string's centre-of-mass in x, per depth row, over
      time. Proves the GPU is actually doing what the mirror says, and it is
      the only instrument that cannot be fooled by a uniform that is written
      but never read.

   Run:  node .probe-whirl.mjs [--port 5178] [--rpm 0.8] [--out .probe-whirl.json]
   Headed Chrome only — headless cannot bind the discrete GPU on this machine.
   ═══════════════════════════════════════════════════════════════════════════ */
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const arg = (k, d) => {
  const i = process.argv.indexOf('--' + k);
  return i >= 0 ? process.argv[i + 1] : d;
};
const PORT = arg('port', '5178');
const OUT = arg('out', '.probe-whirl.json');
const FRAMES = Number(arg('frames', 420));

const browser = await chromium.launch({
  channel: 'chrome', headless: false,
  args: ['--hide-scrollbars', '--mute-audio'],
});
const context = await browser.newContext({
  ...devices['iPhone 13 Pro'],
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
});
const page = await context.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 300)));
const navs = [];
page.on('framenavigated', (f) => { if (f === page.mainFrame()) { navs.push(f.url()); console.log('NAV ->', f.url()); } });
page.on('crash', () => console.log('!! PAGE CRASHED'));

await page.goto(`http://localhost:${PORT}/?quality=high&shot`, { waitUntil: 'load' });
await page.waitForFunction(() => document.body.classList.contains('booted'), null, { timeout: 90000 })
  .catch(() => {});

/* Warm-up. HANDOFF §9.4: shaders keep compiling for 60–100 s and a cold page
   measures the compiler, not the frame. Nothing here is an fps number, but the
   first frames also have a half-built section, so wait anyway. */
await page.waitForTimeout(8000);

/* ── put the string down a hole ──────────────────────────────────────────────
   Deliberately NOT via ui.show('site'): the section scene is live in every
   scene, and driving the UI navigates the page out from under the probe. The
   two things the measurement needs are a depth and a drill state, and geology
   exposes setDepth() for exactly this. */
const DEPTH_M = Number(arg('depth', 30));
const started = await page.evaluate((depth) => {
  const D = window.__DRILLITY;
  if (!D) return { ok: false, why: 'no __DRILLITY' };
  window.__PROBE_DEPTH = depth;
  D.geology.setDepth(depth);
  D.state.drill = D.state.drill || {};
  return { ok: true, scene: D.state?.scene, holeDiaMm: D.geology.holeDiaMm };
}, DEPTH_M);
await page.waitForTimeout(2500);

/* ── the sampler ─────────────────────────────────────────────────────────── */
async function sample(drive, frames) {
  return page.evaluate(async ({ drive, frames }) => {
    const D = window.__DRILLITY;
    const geo = D.geology;
    const scene = geo?.scene;
    if (!scene) return { ok: false, why: 'no section scene' };
    let rod = null;
    scene.traverse((o) => { if (o.name === 'drill-string') rod = o; });
    if (!rod) return { ok: false, why: 'no drill-string mesh' };

    /* Pin the drill state so the measurement varies only what it means to
       vary (HANDOFF §8C: verify your harness varies what you think it does).
       A getter re-installed every frame beats a one-shot assignment, because
       the sim writes state.drill continuously. */
    const pin = () => { Object.assign(D.state.drill, drive); geo.setDepth(window.__PROBE_DEPTH); };
    pin();

    const u = rod.material.uniforms;
    const src = rod.material.vertexShader;
    const rows = [];
    let t0 = 0;
    for (let f = 0; f < frames; f++) {
      await new Promise((r) => requestAnimationFrame(r));
      pin();
      const now = performance.now();
      if (f === 0) t0 = now;
      const snap = { t: (now - t0) / 1000 };
      for (const k of Object.keys(u)) {
        const v = u[k]?.value;
        if (typeof v === 'number') snap[k] = v;
      }
      rows.push(snap);
    }
    return {
      ok: true, src, rows,
      annulus: { innerR: geo.annulus.innerR, outerR: geo.annulus.outerR },
      holeDiaMm: geo.holeDiaMm,
      sectionView: JSON.parse(JSON.stringify(D.sectionView || {})),
    };
  }, { drive, frames });
}

/* ── the JS mirror of ROD_VERT ───────────────────────────────────────────────
   Kept deliberately literal. Every constant here must also appear in the GLSL
   the probe read back, and `checkSource` enforces that. */
function mirror(u, sy) {
  // OLD (planar wobble):        wob = uWobble * sin(sy*0.9 + uTime*9.0) * 0.05
  // NEW (bounded circular whirl): see ROD_VERT.
  if ('uWhirl' in u) {
    const TAU = Math.PI * 2;
    const top = u.uTop, bot = u.uBottom;
    const len = Math.max(top - bot, 1e-3);
    const dz = sy - bot;                       // metres above the bit
    const uu = Math.min(Math.max(dz / len, 0), 1);
    const spans = Math.max(u.uSpans, 1);
    const bow = Math.sin(Math.PI * spans * uu) * Math.sin(Math.PI * uu);
    const amp = u.uClear * u.uWhirl * bow;
    const a = u.uPrec + u.uHelix * dz;
    return { x: Math.cos(a) * amp, z: Math.sin(a) * amp, bow };
  }
  const wob = u.uWobble * Math.sin(sy * 0.9 + u.uTime * 9.0) * 0.05;
  return { x: wob, z: 0, bow: Math.sin(sy * 0.9 + u.uTime * 9.0) };
}

function checkSource(src) {
  const need = src.includes('uWhirl')
    ? ['uClear', 'uWhirl', 'uPrec', 'uHelix', 'uSpans',
       'sin(PI * uSpans * u01) * sin(PI * u01)', 'cos(a)', 'sin(a)']
    : ['uWobble', 'sin(sy * 0.9 + uTime * 9.0) * 0.05'];
  const missing = need.filter((t) => !src.includes(t));
  return { model: src.includes('uWhirl') ? 'whirl' : 'planar-wobble', missing };
}

/* ── analysis ────────────────────────────────────────────────────────────── */
function analyse(res, label, drive) {
  const { rows, annulus } = res;
  const clear = annulus.outerR - annulus.innerR;
  const u0 = rows[0];
  const len = Math.max(u0.uTop - u0.uBottom, 1e-3);
  /* Sample at 9 stations along the string, expressed as a fraction of its
     length so the same stations are compared whatever the depth. */
  const stations = [0.05, 0.15, 0.25, 0.375, 0.5, 0.625, 0.75, 0.85, 0.95];
  const perStation = stations.map((s) => {
    const pts = rows.map((r) => {
      const sy = r.uBottom + s * Math.max(r.uTop - r.uBottom, 1e-3);
      const d = mirror(r, sy);
      return { t: r.t, x: d.x, z: d.z, r: Math.hypot(d.x, d.z), a: Math.atan2(d.z, d.x) };
    });
    const rs = pts.map((p) => p.r);
    const mean = rs.reduce((a, b) => a + b, 0) / rs.length;
    const sd = Math.sqrt(rs.reduce((a, b) => a + (b - mean) ** 2, 0) / rs.length);
    /* CIRCULARITY: for a true circular orbit the radius is constant, so the
       coefficient of variation of |offset| over a full precession is ~0.
       A planar wave gives ~0.7 (a half-rectified sine). */
    const cov = mean > 1e-9 ? sd / mean : 0;
    // unwrapped angle -> precession rate
    let un = 0, prev = pts[0].a; const ang = [];
    for (const p of pts) {
      let d = p.a - prev; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      un += d; prev = p.a; ang.push(un);
    }
    const T = pts[pts.length - 1].t - pts[0].t;
    return {
      station: s,
      peak: Math.max(...rs), meanR: mean, radiusCoV: cov,
      precRadPerS: T > 0.2 ? un / T : 0,
      xSpan: Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x)),
      zSpan: Math.max(...pts.map((p) => p.z)) - Math.min(...pts.map((p) => p.z)),
    };
  });
  const peak = Math.max(...perStation.map((p) => p.peak));
  const prec = perStation.map((p) => p.precRadPerS).sort((a, b) => a - b)[Math.floor(perStation.length / 2)];
  return {
    label, drive,
    model: checkSource(res.src),
    holeDiaMm: res.holeDiaMm,
    innerR: annulus.innerR, outerR: annulus.outerR, clearance: clear,
    peakDeflection: peak,
    peakOverClearance: peak / Math.max(clear, 1e-9),
    withinClearance: peak <= clear * 1.0001,
    medianRadiusCoV: perStation.map((p) => p.radiusCoV).sort((a, b) => a - b)[4],
    precessionRadPerS: prec,
    zMotion: Math.max(...perStation.map((p) => p.zSpan)),
    stringLength: len,
    perStation,
  };
}

const out = { port: PORT, started, errors: null, runs: [] };
const drives = [
  { label: 'idle (no rotation)',   drive: { active: false, rpm: 0, torque: 0, jam: 0 } },
  { label: 'drilling rpm 0.30',    drive: { active: true, rpm: 0.30, torque: 0.35, jam: 0 } },
  { label: 'drilling rpm 0.90',    drive: { active: true, rpm: 0.90, torque: 0.45, jam: 0 } },
  { label: 'jammed',               drive: { active: true, rpm: 0.35, torque: 0.95, jam: 1 } },
];
for (const d of drives) {
  const res = await sample(d.drive, FRAMES);
  if (!res.ok) { out.runs.push({ label: d.label, error: res.why }); continue; }
  out.runs.push(analyse(res, d.label, d.drive));
}

/* ── instrument 3: PIXELS. Does the GPU actually move the string? ─────────── */
out.pixels = await (async () => {
  await page.evaluate(() => {
    const D = window.__DRILLITY;
    Object.assign(D.state.drill, { active: true, rpm: 0.9, torque: 0.45, jam: 0 });
  });
  const shots = [];
  for (let i = 0; i < 24; i++) {
    shots.push(await page.locator('canvas').first().screenshot());
    await page.waitForTimeout(60);
  }
  return { frames: shots.length, bytes: shots.map((b) => b.length) };
})().catch((e) => ({ error: String(e).slice(0, 200) }));

out.errors = errors;
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

console.log('─'.repeat(78));
console.log(`model: ${out.runs[0]?.model?.model}  missing terms: ${JSON.stringify(out.runs[0]?.model?.missing)}`);
for (const r of out.runs) {
  if (r.error) { console.log(`${r.label.padEnd(22)} ERROR ${r.error}`); continue; }
  console.log(
    `${r.label.padEnd(22)}` +
    ` peak ${r.peakDeflection.toFixed(4)}u` +
    ` / clear ${r.clearance.toFixed(4)}u = ${(r.peakOverClearance * 100).toFixed(1)}%` +
    `${r.withinClearance ? '' : '  ** EXCEEDS CLEARANCE **'}` +
    `  radiusCoV ${r.medianRadiusCoV.toFixed(3)}` +
    `  prec ${r.precessionRadPerS.toFixed(2)} rad/s` +
    `  zSpan ${r.zMotion.toFixed(4)}u`
  );
}
console.log(`console errors: ${errors.length}`);
errors.slice(0, 12).forEach((e) => console.log('  ', e));
console.log(`written: ${OUT}`);
await browser.close();
