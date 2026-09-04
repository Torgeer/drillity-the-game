/**
 * probe.mjs — seam / speckle / variance probe for src/core/assets.js kinds.
 *
 *   node probe.mjs [--kinds a,b,c] [--tiers low,medium,high] [--json out.json]
 *                  [--params '{"kind":{...}}']
 *
 * Runs each kind's pixel program at the albedo resolution planRes() would
 * actually give it on that tier (RES_CLASS[cls][tier][0]) and measures:
 *
 *   seam      wrap continuity on each REPEAT axis: mean |edge0 - edgeN-1|
 *             divided by the mean interior adjacent-texel difference. 1.0 is
 *             invisible; >1.5 is a visible seam. Clamped axes are skipped.
 *   speckle   isolated single-texel spikes per Mtexel: a texel that differs
 *             from the mean of its 8 neighbours by > T while those neighbours
 *             agree among themselves (spread < 0.6 T). This is the "dead
 *             pixel / dust on the lens" failure the KIND TABLE forbids.
 *   crease    |dh| > 0.25 between horizontal neighbours per Mtexel — a
 *             one-texel step in height is a one-texel crease in the normal.
 *   variance  std of albedo luminance / roughness / metalness across the
 *             panel, roughness percentiles, correlation of roughness with v,
 *             and the fraction of texels reading as bare metal (me > 0.5).
 *             A uniform panel is the failure.
 */
import { createAssets } from 'file:///C:/Users/henri/Downloads/drillity-the-game/src/core/assets.js';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : d; };
const KINDS_ARG = flag('kinds', 'paintedSteel,rawSteel,wornSteel,carbide,rubber,castIron,castConcrete');
const TIERS = flag('tiers', 'low,medium,high').split(',');
const JSON_OUT = flag('json', null);
const PARAMS = JSON.parse(flag('params', '{}'));

const RES_CLASS = {
  hero:    { low: 512, medium: 1024, high: 1024 },
  std:     { low: 256, medium: 512, high: 512 },
  ground:  { low: 256, medium: 512, high: 512 },
  stratum: { low: 256, medium: 512, high: 512 },
  fine:    { low: 128, medium: 256, high: 256 },
};

const lumOf = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function stats(arr) {
  const n = arr.length;
  let s = 0, s2 = 0;
  for (let i = 0; i < n; i++) { s += arr[i]; s2 += arr[i] * arr[i]; }
  const mean = s / n;
  const sd = Math.sqrt(Math.max(0, s2 / n - mean * mean));
  const sorted = Float32Array.from(arr).sort();
  const q = (f) => sorted[Math.min(n - 1, Math.round(f * (n - 1)))];
  return { mean: +mean.toFixed(4), sd: +sd.toFixed(4), p05: +q(0.05).toFixed(3), p50: +q(0.5).toFixed(3), p95: +q(0.95).toFixed(3) };
}

function seam(ch, n, axis) {
  // axis 0: compare column 0 with column n-1 ; axis 1: row 0 with row n-1
  let edge = 0, inner = 0, cnt = 0;
  if (axis === 0) {
    for (let y = 0; y < n; y++) {
      edge += Math.abs(ch[y * n] - ch[y * n + n - 1]);
      const x = (y * 7919) % (n - 1);
      inner += Math.abs(ch[y * n + x] - ch[y * n + x + 1]);
      cnt++;
    }
  } else {
    for (let x = 0; x < n; x++) {
      edge += Math.abs(ch[x] - ch[(n - 1) * n + x]);
      const y = (x * 7919) % (n - 1);
      inner += Math.abs(ch[y * n + x] - ch[(y + 1) * n + x]);
      cnt++;
    }
  }
  edge /= cnt; inner /= cnt;
  return { edge: +edge.toFixed(5), inner: +inner.toFixed(5), ratio: +(edge / (inner || 1e-6)).toFixed(3) };
}

function speckle(ch, n, T) {
  let spikes = 0;
  const m = n - 1;
  for (let y = 0; y < n; y++) {
    const ym = ((y - 1) & m) * n, yp = ((y + 1) & m) * n, y0 = y * n;
    for (let x = 0; x < n; x++) {
      const xm = (x - 1) & m, xp = (x + 1) & m;
      const a = ch[ym + xm], b = ch[ym + x], c = ch[ym + xp];
      const d = ch[y0 + xm], e = ch[y0 + xp];
      const f = ch[yp + xm], g = ch[yp + x], h = ch[yp + xp];
      const mean = (a + b + c + d + e + f + g + h) / 8;
      const v = ch[y0 + x];
      if (Math.abs(v - mean) <= T) continue;
      const mn = Math.min(a, b, c, d, e, f, g, h), mx = Math.max(a, b, c, d, e, f, g, h);
      if (mx - mn < T * 0.6) spikes++;
    }
  }
  return +(spikes / (n * n) * 1e6).toFixed(1);
}

function crease(hf, n, T = 0.25) {
  let c = 0;
  const m = n - 1;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (Math.abs(hf[y * n + x] - hf[y * n + ((x + 1) & m)]) > T) c++;
  }
  return +(c / (n * n) * 1e6).toFixed(1);
}

function corrWithV(ch, n) {
  // Pearson correlation between channel and v (row index / n)
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0; const N = n * n;
  for (let y = 0; y < n; y++) { const v = y / n; for (let x = 0; x < n; x++) { const c = ch[y * n + x]; sx += c; sy += v; sxx += c * c; syy += v * v; sxy += c * v; } }
  const cov = sxy / N - (sx / N) * (sy / N);
  const sdx = Math.sqrt(Math.max(1e-12, sxx / N - (sx / N) ** 2)), sdy = Math.sqrt(Math.max(1e-12, syy / N - (sy / N) ** 2));
  return +(cov / (sdx * sdy)).toFixed(3);
}

const report = {};
for (const tier of TIERS) {
  const A = createAssets({ quality: { id: tier } });
  const KINDS = A._kinds;
  const names = KINDS_ARG === 'all' ? Object.keys(KINDS) : KINDS_ARG.split(',');
  for (const kind of names) {
    const spec = KINDS[kind];
    if (!spec) { console.log(`?? unknown kind ${kind}`); continue; }
    const n = (RES_CLASS[spec.cls] || RES_CLASS.std)[tier];
    const d = spec.defaults(PARAMS[kind] || {});
    const fb = spec.fallback(d);
    const shade = spec.shade(d);
    const wrap = spec.wrap || 'repeat';
    const ws = typeof wrap === 'string' ? wrap : wrap.s;
    const wt = typeof wrap === 'string' ? wrap : wrap.t;

    const lum = new Float32Array(n * n), ro = new Float32Array(n * n), me = new Float32Array(n * n);
    const hf = new Float32Array(n * n), ao = new Float32Array(n * n);
    const o = { h: 0.5, r: 0.5, g: 0.5, b: 0.5, ro: 0.6, me: 0, ao: 1, al: 1 };
    const inv = 1 / n;
    const t0 = performance.now();
    for (let y = 0; y < n; y++) {
      const v = y * inv;
      for (let x = 0; x < n; x++) {
        o.h = 0.5; o.r = fb.albedo[0]; o.g = fb.albedo[1]; o.b = fb.albedo[2];
        o.ro = fb.rough; o.me = fb.metal; o.ao = 1; o.al = 1;
        shade(x * inv, v, o, x, y, n);
        const i = y * n + x;
        lum[i] = lumOf(Math.min(1, Math.max(0, o.r)), Math.min(1, Math.max(0, o.g)), Math.min(1, Math.max(0, o.b)));
        ro[i] = o.ro; me[i] = o.me; hf[i] = o.h; ao[i] = o.ao;
      }
    }
    const ms = performance.now() - t0;

    let bare = 0; for (let i = 0; i < n * n; i++) if (me[i] > 0.5) bare++;
    const r = {
      tier, n, ms: Math.round(ms), wrap: `${ws}/${wt}`,
      seam: {
        u: ws === 'repeat' ? { lum: seam(lum, n, 0), ro: seam(ro, n, 0), h: seam(hf, n, 0) } : 'clamped',
        v: wt === 'repeat' ? { lum: seam(lum, n, 1), ro: seam(ro, n, 1), h: seam(hf, n, 1) } : 'clamped',
      },
      speckle: { lum: speckle(lum, n, 0.10), ro: speckle(ro, n, 0.10), me: speckle(me, n, 0.12), h: speckle(hf, n, 0.12) },
      crease: crease(hf, n),
      lum: stats(lum), ro: stats(ro), me: stats(me), h: stats(hf), ao: stats(ao),
      roCorrV: corrWithV(ro, n), lumCorrV: corrWithV(lum, n),
      bareFrac: +(bare / (n * n)).toFixed(4),
    };
    report[`${kind}@${tier}`] = r;
    const sU = r.seam.u === 'clamped' ? 'clamp' : `${r.seam.u.lum.ratio}/${r.seam.u.ro.ratio}/${r.seam.u.h.ratio}`;
    const sV = r.seam.v === 'clamped' ? 'clamp' : `${r.seam.v.lum.ratio}/${r.seam.v.ro.ratio}/${r.seam.v.h.ratio}`;
    console.log(
      `${kind.padEnd(16)} ${tier.padEnd(6)} ${String(n).padStart(4)}  ${String(r.ms).padStart(6)}ms` +
      `  seamU ${sU.padEnd(18)} seamV ${sV.padEnd(18)}` +
      `  spk lum/ro/me/h ${r.speckle.lum}/${r.speckle.ro}/${r.speckle.me}/${r.speckle.h}  crease ${r.crease}` +
      `  | lum sd ${r.lum.sd} (${r.lum.p05}-${r.lum.p95})  ro sd ${r.ro.sd} (${r.ro.p05}-${r.ro.p95}) corrV ${r.roCorrV}` +
      `  me sd ${r.me.sd} bare ${r.bareFrac}`);
  }
}
if (JSON_OUT) { writeFileSync(JSON_OUT, JSON.stringify(report, null, 1)); console.log('wrote', JSON_OUT); }
