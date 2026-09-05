/**
 * DRILLITY I THE GAME — src/core/assets.js
 * ═══════════════════════════════════════════════════════════════════════════
 * THE MATERIAL & TEXTURE FOUNDRY.
 *
 * Nothing in this game ships an image file. Every albedo, normal, roughness,
 * occlusion, gradient and decal in the build is synthesised here at runtime
 * from seeded noise and 2D canvas drawing, then handed to three.js as PBR
 * material sets.
 *
 * ── DESIGN NOTES (read before editing) ────────────────────────────────────
 *
 * 1. ORM PACKING.  Every material set is exactly three textures:
 *        map      — albedo, sRGB
 *        normal   — tangent-space normal, linear
 *        orm      — R = ambient occlusion, G = roughness, B = metalness
 *    three.js reads .r/.g/.b for aoMap/roughnessMap/metalnessMap respectively
 *    (glTF convention), so one texture fills three slots. `texture.channel`
 *    is pinned to 0 so aoMap uses `uv`, never the absent `uv1`.
 *
 * 2. NO SHADER RECOMPILE POP.  A material is returned from material() fully
 *    wired: its canvases already exist at their FINAL pixel dimensions,
 *    pre-primed with the correct base colour / roughness / metalness plus a
 *    soft mottle. The async pass paints detail into those same canvases and
 *    flips needsUpdate. Because the dimensions never change, three re-uploads
 *    through texSubImage2D into the existing allocation — no reallocation,
 *    no program rebuild, no white or magenta frame, ever.
 *
 * 3. TILEABILITY.  Every noise primitive takes an explicit integer lattice
 *    period per axis and wraps its lattice coordinates, so all fields are
 *    exactly periodic over [0,1)². Anisotropy is expressed as a period pair
 *    (px, py) rather than a coordinate scale, which keeps streaked/brushed
 *    surfaces seamless. Domain warping preserves periodicity because the
 *    warp offsets are themselves periodic.
 *
 * 4. BUDGET.  A byte ledger tracks every texel allocated. Requested
 *    resolutions are halved as the ledger approaches the tier cap
 *    (~88 MB HIGH / ~60 MB MEDIUM / ~34 MB LOW), so the foundry degrades
 *    gracefully instead of blowing the GPU budget. Texture SETS are shared by
 *    family with a per-kind variant cap; when the cap is hit the nearest
 *    existing variant is reused and the residual colour difference is applied
 *    through material.color, which costs nothing.
 *
 * 5. COOPERATIVE GENERATION.  Heavy pixel work runs through a priority queue
 *    that yields whenever it has held the thread for ~7 ms, alternating
 *    between a MessageChannel macrotask (fast drain) and rAF (guarantees the
 *    renderer a frame). Nothing here blocks a frame.
 *
 * 6. STRATA.  stratumMaterial() does NOT bake a texture per layer. Each of
 *    the eight `pattern` families gets one neutral, linear-space detail set;
 *    per-layer identity (colour gradient, bedding, joints, mica, wetness,
 *    clast contrast, seed offset, detail repeat) lives in uniforms consumed by
 *    an onBeforeCompile patch. Two granites never look alike, and a 40 m band
 *    shows no repetition because albedo/roughness/normal are sampled at two
 *    decorrelated scales and cross-faded by a low-frequency procedural mask.
 *
 *    drillCore() rides the same machinery: a core stick is the SAME rock, so
 *    it reuses the same pattern set and the same feature uniforms and adds
 *    only what the core barrel did to it (breaks/RQD, lost core, the cut
 *    barrel, flush water and mud). A new lithology on a core tray therefore
 *    costs no texture memory at all — see CORE_MAP.
 *
 * 7. TWO GROUND PALETTES, AND THE ONE THAT IS NOT A COLOUR.
 *    contract.js publishes `GROUND[].colors` (ALBEDOS solved against the
 *    cross-section's own lighting — roughly 1.35 stops above the rock the
 *    player sees) and `GROUND_DISPLAY` / `groundSwatch()` (the MEASURED
 *    displayed values). They are not interchangeable, and feeding the first
 *    set to a material lit by anything other than the section reads blown.
 *    stratumMaterial() therefore takes a `space`, defaulting to 'lit'. The
 *    full argument is over the function.
 *
 * 8. CUTOUTS.  A kind may declare `alpha: true`, which routes its albedo
 *    through a DataTexture carrying a hand-built, coverage-preserving mip
 *    chain instead of a CanvasTexture. `mesh` is the one that needs it: a
 *    box-filtered wire grid drifts, and at 37 % coverage against a 0.45
 *    alphaTest it drifts DOWNWARD — measured, the panel vanishes completely
 *    below the 8x8 level, which is a surface support sheet disappearing as
 *    the camera pulls back up the drive. See §2.
 *
 * Contract: createAssets(ctx) -> { init, update, resize, dispose, material,
 * texSet, noiseTexture, gradientTexture, stratumMaterial, drillCore,
 * stratumColors, decal, key, stats }
 */

import * as THREE from 'three';
import {
  BRAND as BRAND_FALLBACK,
  GROUND, GROUND_DISPLAY,
  clamp, lerp, makeRandom, TAU,
} from './contract.js';

/* ═══════════════════════════════════════════════════════════════════════════
   §0  SMALL UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const frac = (v) => v - Math.floor(v);
const tri = (v) => { const f = frac(v); return f < 0.5 ? f * 2 : 2 - f * 2; };
const mixv = (a, b, t) => a + (b - a) * t;
const sstep = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0 || 1e-6)); return t * t * (3 - 2 * t); };
const nowMs = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

/* ── THE TWO ANTI-ALIAS PRIMITIVES ──────────────────────────────────────────
 * The rule documented in terrain.js's header — and restated over the KIND
 * TABLE below — is that a feature's size comes from the noise CELL, never from
 * a threshold. Every pit, pore, bug hole, blow hole, spall, aggregate stone,
 * rebound grain and blast-hole half-barrel added for the six new industries is
 * built from one of these two, so "how many texels across is this feature?"
 * always has the same answer: `radius x (canvas edge / lattice period)` — and
 * it is never under ~1.8 texels even at the LOW tier's authoring size.
 */

/** Soft round blob from a Worley F1 distance. `r` is the radius IN CELLS and
 *  the edge ramp is a fixed FRACTION of it, so halving the frequency doubles
 *  the feature and its edge together. There is no threshold to sharpen. */
const blob = (f1, r, soft = 0.6) => clamp01((r - f1) / (r * soft));

/** Semicircular dish, for grooves whose width is authored in uv rather than
 *  drawn out of noise: half-barrels, mould chamfers, hose ribs, weave tapes.
 *  `t` is a signed offset in the groove's own half-width units. */
const dish = (t) => { const a = 1 - t * t; return a <= 0 ? 0 : Math.sqrt(a); };

/* ── colour space ───────────────────────────────────────────────────────────
 * hexRGB() keeps canvas pixels sRGB-ENCODED. The stratum colour retarget
 * (§ stratumMaterial) has to reason about light, so it needs the linear pair.
 */
const srgbToLinear = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const linearToSrgb = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

/** Parse '#rrggbb' | 0xrrggbb | THREE.Color into sRGB-encoded 0..1 triples.
 *  NOTE: deliberately NOT THREE.Color — that would linearise, and canvas
 *  pixels must stay sRGB-encoded. */
const _hexCache = new Map();
function hexRGB(c) {
  if (Array.isArray(c)) return c;
  // THREE.Color lives in the linear working space; round-trip through its sRGB
  // hex so canvas pixels stay sRGB-encoded.
  if (c && c.isColor) c = '#' + c.getHexString();
  const kk = String(c);
  const hit = _hexCache.get(kk);
  if (hit) return hit;
  let n;
  if (typeof c === 'number') n = c | 0;
  else {
    let s = kk.trim().replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    n = parseInt(s, 16);
    if (!Number.isFinite(n)) n = 0x808080;
  }
  const out = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  _hexCache.set(kk, out);
  return out;
}

/** sRGB triple -> '#rrggbb' */
function rgbHex(rgb) {
  const q = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
  return '#' + ((1 << 24) | (q(rgb[0]) << 16) | (q(rgb[1]) << 8) | q(rgb[2])).toString(16).slice(1);
}

/** 32-bit integer hash of a string — deterministic seeding from ids. */
function hashStr(s) {
  let h = 2166136261 >>> 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ═══════════════════════════════════════════════════════════════════════════
   §1  NOISE TOOLKIT — every primitive is exactly tileable.

   All functions take an integer lattice period per axis (px, py). Sampling a
   field at (u*px, v*py) for u,v ∈ [0,1) therefore wraps seamlessly, and an
   anisotropic period pair (e.g. px=6, py=192) yields streaks that are still
   seam-free. fbm doubles the period alongside the frequency so every octave
   stays periodic.
   ═══════════════════════════════════════════════════════════════════════════ */

/** integer wrap that is correct for negatives */
function wrapi(n, p) { const m = n % p; return m < 0 ? m + p : m; }

/** 2D integer hash -> 0..1. Three rounds of mixing; cheap and well distributed. */
function ihash(x, y, seed) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x85ebca6b) ^ Math.imul(seed | 0, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** 32 unit gradient vectors — avoids trig in the inner loop. */
const GRAD = (() => {
  const g = new Float32Array(64);
  for (let i = 0; i < 32; i++) { const a = (i / 32) * TAU; g[i * 2] = Math.cos(a); g[i * 2 + 1] = Math.sin(a); }
  return g;
})();

const quintic = (t) => t * t * t * (t * (t * 6 - 15) + 10);

/** Periodic value noise -> 0..1 */
function valueNoise(x, y, px, py, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = quintic(x - xi), v = quintic(y - yi);
  const x0 = wrapi(xi, px), x1 = wrapi(xi + 1, px);
  const y0 = wrapi(yi, py), y1 = wrapi(yi + 1, py);
  const a = ihash(x0, y0, seed), b = ihash(x1, y0, seed);
  const c = ihash(x0, y1, seed), d = ihash(x1, y1, seed);
  const t = a + (b - a) * u;
  return t + ((c + (d - c) * u) - t) * v;
}

/** Periodic gradient (Perlin-class, "simplex-ish" smoothness) -> about -1..1 */
function gradNoise(x, y, px, py, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const u = quintic(fx), v = quintic(fy);
  const x0 = wrapi(xi, px), x1 = wrapi(xi + 1, px);
  const y0 = wrapi(yi, py), y1 = wrapi(yi + 1, py);
  let i;
  i = ((ihash(x0, y0, seed) * 32) | 0) * 2; const n00 = GRAD[i] * fx + GRAD[i + 1] * fy;
  i = ((ihash(x1, y0, seed) * 32) | 0) * 2; const n10 = GRAD[i] * (fx - 1) + GRAD[i + 1] * fy;
  i = ((ihash(x0, y1, seed) * 32) | 0) * 2; const n01 = GRAD[i] * fx + GRAD[i + 1] * (fy - 1);
  i = ((ihash(x1, y1, seed) * 32) | 0) * 2; const n11 = GRAD[i] * (fx - 1) + GRAD[i + 1] * (fy - 1);
  const a = n00 + (n10 - n00) * u;
  const b = n01 + (n11 - n01) * u;
  return (a + (b - a) * v) * 1.4142;
}

/** Fractal Brownian motion over gradient noise -> about -1..1 */
function fbm(x, y, px, py, seed, oct = 4, gain = 0.5) {
  let s = 0, amp = 1, norm = 0, f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * gradNoise(x * f, y * f, px * f, py * f, seed + i * 1013);
    norm += amp; amp *= gain; f *= 2;
  }
  return s / norm;
}
/** fbm mapped to 0..1 */
const fbm01 = (x, y, px, py, seed, oct, gain) => fbm(x, y, px, py, seed, oct, gain) * 0.5 + 0.5;

/** Cheap value-noise fbm — used for high-frequency grain where smoothness
 *  does not matter and speed does. -> 0..1 */
function vfbm(x, y, px, py, seed, oct = 3, gain = 0.5) {
  let s = 0, amp = 1, norm = 0, f = 1;
  for (let i = 0; i < oct; i++) {
    s += amp * valueNoise(x * f, y * f, px * f, py * f, seed + i * 733);
    norm += amp; amp *= gain; f *= 2;
  }
  return s / norm;
}

/** Ridged multifractal -> 0..1. Sharp crests: cliffs, ripples, scratches. */
function ridged(x, y, px, py, seed, oct = 4, gain = 0.5) {
  let s = 0, amp = 1, norm = 0, f = 1, prev = 1;
  for (let i = 0; i < oct; i++) {
    let n = 1 - Math.abs(gradNoise(x * f, y * f, px * f, py * f, seed + i * 577));
    n *= n;
    s += n * amp * prev;
    prev = 0.5 + 0.5 * n;
    norm += amp; amp *= gain; f *= 2;
  }
  return clamp01(s / norm);
}

/** Periodic Worley / Voronoi. Feature point stays inside its cell so the 3×3
 *  neighbourhood search is exact. Fills the shared scratch record. */
const _W = { f1: 0, f2: 0, id: 0, cx: 0, cy: 0, dx: 0, dy: 0 };
function worley(x, y, px, py, seed, jitter = 0.78) {
  const xi = Math.floor(x), yi = Math.floor(y);
  let f1 = 9, f2 = 9, id = 0, cx = 0, cy = 0, bx = 0, by = 0;
  const half = (1 - jitter) * 0.5;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const gx = xi + i, gy = yi + j;
      const wx = wrapi(gx, px), wy = wrapi(gy, py);
      const fx = gx + half + ihash(wx, wy, seed) * jitter;
      const fy = gy + half + ihash(wx, wy, seed ^ 0x9e3779b9) * jitter;
      const dx = fx - x, dy = fy - y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < f1) {
        f2 = f1; f1 = d;
        id = ihash(wx, wy, seed ^ 0x51ed270b);
        cx = wx; cy = wy; bx = dx; by = dy;
      } else if (d < f2) f2 = d;
    }
  }
  _W.f1 = f1; _W.f2 = f2; _W.id = id; _W.cx = cx; _W.cy = cy; _W.dx = bx; _W.dy = by;
  return f1;
}

/** Angular / blocky Worley (Chebyshev-ish metric) — fractured rock, cast
 *  crystal facets, chipped paint flakes. */
function worleyBlock(x, y, px, py, seed, jitter = 0.9) {
  const xi = Math.floor(x), yi = Math.floor(y);
  let f1 = 9, f2 = 9, id = 0;
  const half = (1 - jitter) * 0.5;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const gx = xi + i, gy = yi + j;
      const wx = wrapi(gx, px), wy = wrapi(gy, py);
      const fx = gx + half + ihash(wx, wy, seed) * jitter;
      const fy = gy + half + ihash(wx, wy, seed ^ 0x7f4a7c15) * jitter;
      const dx = Math.abs(fx - x), dy = Math.abs(fy - y);
      const d = Math.max(dx, dy) * 0.72 + (dx + dy) * 0.19;
      if (d < f1) { f2 = f1; f1 = d; id = ihash(wx, wy, seed ^ 0x1b873593); }
      else if (d < f2) f2 = d;
    }
  }
  _W.f1 = f1; _W.f2 = f2; _W.id = id;
  return f1;
}

/** Domain warp: returns warped coordinates in the shared record. Periodic in,
 *  periodic out. */
const _WARP = { x: 0, y: 0 };
function warp(x, y, px, py, seed, amp, oct = 3) {
  _WARP.x = x + amp * fbm(x, y, px, py, seed + 71, oct);
  _WARP.y = y + amp * fbm(x, y, px, py, seed + 913, oct);
  return _WARP;
}

/** Directional / anisotropic streak field -> 0..1. `px`,`py` set the streak
 *  aspect; a low px with a high py gives long horizontal marks. */
function streaks(x, y, px, py, seed, oct = 3, warpAmp = 0.35) {
  const w = warp(x, y, px, py, seed + 5, warpAmp, 2);
  return ridged(w.x, w.y, px, py, seed, oct, 0.55);
}

/** Thin scratch field: near-zero almost everywhere, 1 on hairline strikes. */
function scratches(x, y, px, py, seed, sharp = 0.965) {
  const r = streaks(x, y, px, py, seed, 3, 0.5);
  return sstep(sharp, 1.0, r);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §2  CANVAS + PIXEL PLUMBING
   ═══════════════════════════════════════════════════════════════════════════ */

const HAS_OFFSCREEN = (() => {
  try {
    return typeof OffscreenCanvas !== 'undefined' &&
      new OffscreenCanvas(1, 1).getContext('2d') !== null;
  } catch (e) { return false; }
})();

/** OffscreenCanvas where available; DOM canvas when we need document fonts. */
function makeCanvas(w, h, preferDom = false) {
  if (!preferDom && HAS_OFFSCREEN) return new OffscreenCanvas(w, h);
  if (typeof document !== 'undefined') {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    return cv;
  }
  return new OffscreenCanvas(w, h);
}

function ctx2d(cv, alpha = true) {
  return cv.getContext('2d', { willReadFrequently: true, alpha });
}

/** Write an RGBA byte buffer straight into a canvas of matching size. */
function blit(cv, data, w, h) {
  const c = ctx2d(cv);
  const img = c.createImageData(w, h);
  img.data.set(data);
  c.putImageData(img, 0, 0);
  return cv;
}

/** Box-halve an RGBA buffer. */
function halveRGBA(src, w, h) {
  const w2 = w >> 1, h2 = h >> 1;
  const out = new Uint8ClampedArray(w2 * h2 * 4);
  for (let y = 0; y < h2; y++) {
    const r0 = (y * 2) * w, r1 = (y * 2 + 1) * w;
    for (let x = 0; x < w2; x++) {
      const x2 = x * 2;
      const a = (r0 + x2) * 4, b = (r0 + x2 + 1) * 4, c = (r1 + x2) * 4, d = (r1 + x2 + 1) * 4;
      const o = (y * w2 + x) * 4;
      out[o] = (src[a] + src[b] + src[c] + src[d] + 2) >> 2;
      out[o + 1] = (src[a + 1] + src[b + 1] + src[c + 1] + src[d + 1] + 2) >> 2;
      out[o + 2] = (src[a + 2] + src[b + 2] + src[c + 2] + src[d + 2] + 2) >> 2;
      out[o + 3] = (src[a + 3] + src[b + 3] + src[c + 3] + src[d + 3] + 2) >> 2;
    }
  }
  return out;
}

/** Re-unitise an averaged normal buffer. */
function renormalize(data) {
  for (let i = 0; i < data.length; i += 4) {
    const x = data[i] / 127.5 - 1, y = data[i + 1] / 127.5 - 1, z = data[i + 2] / 127.5 - 1;
    const l = Math.sqrt(x * x + y * y + z * z) || 1;
    data[i] = (x / l * 0.5 + 0.5) * 255;
    data[i + 1] = (y / l * 0.5 + 0.5) * 255;
    data[i + 2] = (z / l * 0.5 + 0.5) * 255;
  }
}

/* ── ALPHA-CUTOUT ALBEDOS (the `mesh` card) ─────────────────────────────────
 *
 * A CanvasTexture cannot carry a hand-built mip chain, and a box-filtered
 * cutout is a trap that terrain.js already documents at length: averaging
 * ALPHA flattens the sheet toward its own mean coverage, and whether that
 * reads as "fills the quad" or "vanishes" is decided by where that mean sits
 * relative to alphaTest. Terrain's foliage is dense and fills. `mesh` is 37 %
 * covered against a 0.45 alphaTest, so it does the other thing: measured on
 * the real program, the plain chain holds 0.377 -> 0.484 for four levels and
 * then drops to ZERO from 4x4 down, because the mean alpha of a 37 %-covered
 * sheet is 94/255 and no texel survives the test. A surface support panel
 * that evaporates as the camera pulls back up the drive.
 *
 * So kinds that declare `alpha: true` get a DataTexture albedo with the chain
 * baked by hand, every level held to level 0's coverage.
 *
 * Only two of terrain's three steps are needed. Its first — flooding colour
 * out from under the alpha — exists because Canvas 2D leaves black in texels
 * the brush never touched. A pixel program has no untouched texels: `mesh`
 * authors the full wire colour in every texel and varies ONLY alpha, so the
 * albedo is already dilated by construction and can never bleed black.
 */

/** One level down, averaging colour weighted by alpha (in gamma-2 linear) so a
 *  transparent texel contributes no colour at any level. */
function halveAlphaWeighted(src, w, h) {
  const w2 = Math.max(1, w >> 1), h2 = Math.max(1, h >> 1);
  const out = new Uint8Array(w2 * h2 * 4);
  for (let y = 0; y < h2; y++) {
    for (let x = 0; x < w2; x++) {
      let ar = 0, ag = 0, ab = 0, wsum = 0, asum = 0;
      for (let dy = 0; dy < 2; dy++) {
        const sy = Math.min(h - 1, y * 2 + dy);
        for (let dx = 0; dx < 2; dx++) {
          const j = (sy * w + Math.min(w - 1, x * 2 + dx)) * 4;
          const a = src[j + 3], wt = a / 255;
          const r = src[j] / 255, g = src[j + 1] / 255, b = src[j + 2] / 255;
          ar += r * r * wt; ag += g * g * wt; ab += b * b * wt;
          wsum += wt; asum += a;
        }
      }
      const o = (y * w2 + x) * 4;
      if (wsum > 1e-4) {
        out[o] = Math.sqrt(ar / wsum) * 255;
        out[o + 1] = Math.sqrt(ag / wsum) * 255;
        out[o + 2] = Math.sqrt(ab / wsum) * 255;
      }
      out[o + 3] = asum * 0.25;
    }
  }
  return out;
}

/** Fraction of texels that survive `aRef`. */
function alphaCoverage(data, n, aRef) {
  let c = 0;
  for (let i = 0; i < n; i++) if (data[i * 4 + 3] >= aRef) c++;
  return c / n;
}

/** Castaño coverage preservation: scale this level's alpha until the same
 *  fraction of texels survives `aRef` as at level 0. Without it the panel
 *  dissolves or fills with distance — (a) alone fixes colour, only this fixes
 *  the silhouette. */
function fitCoverage(data, n, aRef, want) {
  if (n < 4) return data;
  let lo = 0.02, hi = 8, mid = 1;
  for (let it = 0; it < 14; it++) {
    mid = (lo + hi) * 0.5;
    let c = 0;
    for (let i = 0; i < n; i++) if (data[i * 4 + 3] * mid >= aRef) c++;
    if (c / n < want) lo = mid; else hi = mid;
  }
  mid = (lo + hi) * 0.5;
  if (Math.abs(mid - 1) < 0.03) return data;
  for (let i = 0; i < n; i++) data[i * 4 + 3] = Math.min(255, data[i * 4 + 3] * mid);
  return data;
}

/**
 * Full chain for an n×n RGBA level 0, every level held to level 0's coverage
 * at `alphaTest`. Returns the three.js `mipmaps` array.
 *
 * `fit` is off for the prime chain: coverage fitting is a 14-step bisection
 * per level and the prime runs SYNCHRONOUSLY inside material(), which must
 * return in well under a frame. The prime is replaced by the fitted chain a
 * few frames later anyway — see acquireSet.
 * `gate` is passed on the real build so the chain cannot land as one slice.
 */
async function buildAlphaMips(level0, n, alphaTest, fit = true, gate = null) {
  const aRef = Math.round(clamp01(alphaTest) * 255) || 1;
  const cov = fit ? alphaCoverage(level0, n * n, aRef) : 0;
  const mipmaps = [{ data: level0, width: n, height: n }];
  let d = level0, w = n, h = n;
  while (w > 1 || h > 1) {
    d = halveAlphaWeighted(d, w, h);
    w = Math.max(1, w >> 1); h = Math.max(1, h >> 1);
    if (fit) fitCoverage(d, w * h, aRef, cov);
    mipmaps.push({ data: d, width: w, height: h });
    if (gate) await gate();
  }
  return mipmaps;
}

/** The synchronous prime chain — no fitting, no gate, no await. */
function buildAlphaMipsSync(level0, n) {
  const mipmaps = [{ data: level0, width: n, height: n }];
  let d = level0, w = n, h = n;
  while (w > 1 || h > 1) {
    d = halveAlphaWeighted(d, w, h);
    w = Math.max(1, w >> 1); h = Math.max(1, h >> 1);
    mipmaps.push({ data: d, width: w, height: h });
  }
  return mipmaps;
}

/**
 * Downsample to `target` then blit into `cv` (already sized `target`).
 * Each halving of a 1024² buffer is a million texel reads, so the gate gets a
 * look-in between steps — otherwise the tail of a build lands as one long
 * uninterrupted slice however carefully the pixel loop was paced.
 */
async function blitScaled(cv, data, n, target, isNormal, gate) {
  let d = data, w = n;
  while (w > target && w > 1) {
    d = halveRGBA(d, w, w);
    w >>= 1;
    if (gate) await gate();
  }
  if (isNormal && w !== n) renormalize(d);
  return blit(cv, d, w, w);
}

/**
 * Tangent-space normal from a wrapped height field via a Sobel kernel.
 *
 * three uploads canvases with flipY = true, so image row r becomes
 * v = 1 - (r + 0.5)/H, i.e. dv = -dr. The OpenGL-convention normal
 * (-dh/du, -dh/dv, 1) therefore becomes (-dh/dcol, +dh/drow, 1).
 */
async function normalFromHeight(hf, n, strength, gate, reuse) {
  const out = reuse && reuse.length >= n * n * 4
    ? reuse.subarray(0, n * n * 4)
    : new Uint8ClampedArray(n * n * 4);
  const m = n - 1;
  const s = strength * n * 0.0055;
  for (let y = 0; y < n; y++) {
    const ym = ((y - 1) & m) * n, yp = ((y + 1) & m) * n, y0 = y * n;
    for (let x = 0; x < n; x++) {
      const xm = (x - 1) & m, xp = (x + 1) & m;
      const h00 = hf[ym + xm], h10 = hf[ym + x], h20 = hf[ym + xp];
      const h01 = hf[y0 + xm], h21 = hf[y0 + xp];
      const h02 = hf[yp + xm], h12 = hf[yp + x], h22 = hf[yp + xp];
      const gx = (h20 + 2 * h21 + h22) - (h00 + 2 * h01 + h02);
      const gy = (h02 + 2 * h12 + h22) - (h00 + 2 * h10 + h20);
      let nx = -gx * s, ny = gy * s, nz = 1;
      const l = Math.sqrt(nx * nx + ny * ny + 1) || 1;
      nx /= l; ny /= l; nz /= l;
      const o = (y0 + x) * 4;
      out[o] = (nx * 0.5 + 0.5) * 255;
      out[o + 1] = (ny * 0.5 + 0.5) * 255;
      out[o + 2] = (nz * 0.5 + 0.5) * 255;
      out[o + 3] = 255;
    }
    if ((y & 7) === 7 && gate) await gate();
  }
  return out;
}

/**
 * NOTE: normalFromHeight indexes neighbours with `& (n-1)`, which is a correct
 * wrap only for power-of-two n. Every resolution this module allocates is a
 * power of two — see RES_CLASS — so the fast path is always valid.
 */

/** Prime a canvas with a flat base colour plus a soft low-frequency mottle so
 *  the pre-generation frame already reads as a real surface. ~0.2 ms. */
function primeCanvas(cv, rgb, mottle, seed) {
  const c = ctx2d(cv, false);
  const w = cv.width, h = cv.height;
  c.fillStyle = rgbHex(rgb);
  c.fillRect(0, 0, w, h);
  if (mottle > 0.001) {
    const t = 16;
    const tiny = makeCanvas(t, t);
    const tc = ctx2d(tiny);
    const img = tc.createImageData(t, t);
    for (let y = 0; y < t; y++) {
      for (let x = 0; x < t; x++) {
        const v = valueNoise(x * 0.5, y * 0.5, 8, 8, seed) - 0.5;
        const o = (y * t + x) * 4;
        img.data[o] = (rgb[0] + v * mottle) * 255;
        img.data[o + 1] = (rgb[1] + v * mottle) * 255;
        img.data[o + 2] = (rgb[2] + v * mottle) * 255;
        img.data[o + 3] = 255;
      }
    }
    tc.putImageData(img, 0, 0);
    c.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in c) c.imageSmoothingQuality = 'high';
    c.drawImage(tiny, 0, 0, w, h);
  }
  return cv;
}

/* ═══════════════════════════════════════════════════════════════════════════
   §3  COOPERATIVE SCHEDULER
   ═══════════════════════════════════════════════════════════════════════════ */

const HAS_YIELD = typeof globalThis !== 'undefined' && globalThis.scheduler &&
  typeof globalThis.scheduler.yield === 'function';
const HAS_RAF = typeof requestAnimationFrame === 'function';

let _mc = null;
const _mcQueue = [];
function macroYield() {
  if (HAS_YIELD) { try { return globalThis.scheduler.yield(); } catch (e) { /* fall through */ } }
  if (typeof MessageChannel !== 'function') return new Promise((r) => setTimeout(r, 0));
  if (!_mc) {
    _mc = new MessageChannel();
    _mc.port1.onmessage = () => { const r = _mcQueue.shift(); if (r) r(); };
    _mc.port1.start();
  }
  return new Promise((r) => { _mcQueue.push(r); _mc.port2.postMessage(0); });
}
/**
 * The "let everything else run" yield. A MessageChannel macrotask drains the
 * queue fast but, chained back to back, it will happily starve rendering and
 * timers — so every fourth slice takes the slow road instead: a real frame
 * where rAF exists, and a timer task where it does not (workers, SSR, tests).
 */
function frameYield() {
  if (HAS_RAF) return new Promise((r) => requestAnimationFrame(() => r()));
  return new Promise((r) => setTimeout(r, 0));
}

/**
 * A gate closes over its own slice clock; call it liberally in hot loops. It
 * records how long each uninterrupted slice actually ran, which is the number
 * that matters for frame health — stats().slices exposes it.
 */
function makeGate(budgetMs, meter) {
  let t0 = nowMs(), slices = 0;
  const gate = async (force) => {
    const held = nowMs() - t0;
    if (!force && held < budgetMs) return;
    slices++;
    if (meter) meter(held);
    await ((slices & 3) === 0 ? frameYield() : macroYield());
    t0 = nowMs();
  };
  gate.reset = () => { t0 = nowMs(); };
  return gate;
}

/* ═══════════════════════════════════════════════════════════════════════════
   §4  RESOLUTION POLICY + BYTE LEDGER
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * [albedo, normal, orm] edge lengths — all powers of two (normalFromHeight
 * wraps with `& (n-1)`, which is only a correct wrap for POT).
 *
 * The sizing here encodes a deliberate art call. The rig is the hero of the
 * surface band and is seen closest, so `hero` keeps a 1024 albedo. Grounds and
 * strata are read at a distance or through shaders that add their own detail
 * — the stratum program alone contributes bedding, joints, mica, grain,
 * wetness and two-scale de-tiling — so they hold 512 and spend the saved
 * memory on keeping EVERY biome and EVERY pattern at 512, rather than a
 * couple at 1024 and the remainder starved down to thumbnails.
 */
const RES_CLASS = {
  hero:    { low: [512, 256, 128], medium: [1024, 512, 256], high: [1024, 512, 256] },
  std:     { low: [256, 256, 128], medium: [512, 256, 128], high: [512, 512, 256] },
  ground:  { low: [256, 256, 128], medium: [512, 256, 128], high: [512, 512, 256] },
  stratum: { low: [256, 256, 128], medium: [512, 256, 128], high: [512, 512, 256] },
  fine:    { low: [128, 128, 64], medium: [256, 256, 128], high: [256, 256, 128] },
};
/*
 * Why MEDIUM halves the normal/ORM rather than the albedo: a full contract
 * touches roughly twenty distinct sets, and twenty full 512/512/256 sets do
 * not fit a 60 MB budget. Something has to give, and a 256 normal under a 512
 * albedo costs far less perceptually than letting four whole materials
 * collapse to 128 — which is exactly what the budget guard did before this
 * line was tuned.
 */

/**
 * Budget reservations, as guaranteed FLOORS rather than hard partitions.
 *
 * Without any reservation the winner is simply whoever asked first: a session
 * that walks the whole shop before drilling would spend the entire budget on
 * rig parts and leave the cross-section — 46% of the screen — at 64x64. But
 * hard partitions are just as wrong, because a Nordic contract touches three
 * stratum patterns, not eight, and that idle reservation should be spendable
 * on the rig instead.
 *
 * So each family is guaranteed its floor and may additionally draw on
 * whatever is genuinely free — everything except the floors other families
 * have not yet claimed. The fractions deliberately sum to well under 1; the
 * remainder is a commons that goes to whoever needs it first.
 */
const POOL_FRAC = { hero: 0.12, stratum: 0.20, ground: 0.12, general: 0.13 };

/** Never degrade an albedo below this; past it the surface stops reading. */
const RES_FLOOR = 128;

/**
 * Reservations only start biting once this much of the planning budget is
 * committed. Below it there is plenty for everyone, and enforcing floors
 * early would throttle the first requests — which are the rig and the drill
 * string, the assets that most deserve full resolution — to protect memory
 * nobody is competing for yet.
 */
const CONTENTION_AT = 0.5;

const TIER_CFG = {
  low:    { author: 512, budgetMB: 34, gateMs: 6 },
  medium: { author: 1024, budgetMB: 60, gateMs: 7 },
  high:   { author: 2048, budgetMB: 88, gateMs: 7 },
};

const texBytes = (w, h) => Math.round(w * h * 4 * 4 / 3); // + mip chain

/* ═══════════════════════════════════════════════════════════════════════════
   §5  GLSL FOR THE STRATUM SHADER PATCH

   One program serves every layer. Features are uniform-weighted rather than
   #define-switched so there are no compile hitches when the geology changes.
   ═══════════════════════════════════════════════════════════════════════════ */

const STRAT_COMMON = /* glsl */`
#include <common>
uniform vec3  uColTop;
uniform vec3  uColBot;
uniform vec4  uUvXf;      // xy = detail repeat, zw = detail offset
uniform vec2  uGradRange; // x = uv.y at layer bottom, y = 1/(span)
uniform vec4  uFeatA;     // x bedding  y joints  z mica   w grain
uniform vec4  uFeatB;     // x wet      y void    z clast  w contrast
uniform vec3  uJointCfg;  // x angleA   y angleB  z freq
uniform vec2  uBedCfg;    // x bed count  y undulation
uniform float uSeedS;
uniform float uTimeS;

float dr_h21(vec2 p){
  p = fract(p * vec2(127.117, 311.7));
  p += dot(p, p.yx + 47.31);
  return fract(p.x * p.y);
}
float dr_vn(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = dr_h21(i);
  float b = dr_h21(i + vec2(1.0, 0.0));
  float c = dr_h21(i + vec2(0.0, 1.0));
  float d = dr_h21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float dr_fb(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * dr_vn(p); p *= 2.03; a *= 0.5; }
  return s * 1.0667;
}
vec2 dr_uvA(vec2 uv){ return uv * uUvXf.xy + uUvXf.zw; }
vec2 dr_uvB(vec2 uv){ return uv * uUvXf.xy * 0.3137 + uUvXf.zw * 0.71 + vec2(0.4137, 0.7231); }
float dr_joint(vec2 p, float ang, float freq){
  vec2 d = vec2(cos(ang), sin(ang));
  float t = dot(p, d) * freq + 2.4 * dr_fb(p * 1.7 + uSeedS);
  float f = abs(fract(t) - 0.5);
  return 1.0 - smoothstep(0.0, 0.085, f);
}
`;

/** Extra uniforms only the core program declares. Appended to STRAT_COMMON. */
const CORE_COMMON = /* glsl */`
uniform vec4 uCoreA;      // x rqd  y pieces  z wet  w mud
uniform vec4 uCoreB;      // x barrel scoring  y helix pitch  z recovery  w bit polish
`;

const STRAT_MAP_BODY = /* glsl */`
float dr_blend = 0.0;
float dr_roughMul = 1.0;
float dr_nrmMul = 1.0;
#ifdef USE_MAP
  vec2 dr_a = dr_uvA( vMapUv );
  vec2 dr_b = dr_uvB( vMapUv );
  dr_blend = smoothstep( 0.32, 0.68, dr_fb( dr_a * 0.09 + uSeedS * 0.37 ) );

  // two decorrelated scales cross-faded => no repetition inside a 40 m band
  float dr_l1 = texture2D( map, dr_a ).g;
  float dr_l2 = texture2D( map, dr_b ).g;
  float dr_lum = mix( dr_l1, dr_l2, dr_blend );

  // position inside the layer: 0 = bottom, 1 = top
  float dr_gt = clamp( ( vMapUv.y - uGradRange.x ) * uGradRange.y, 0.0, 1.0 );
  vec3 dr_col = mix( uColBot, uColTop, dr_gt );

  // detail as a linear multiplier centred on 1.0
  dr_col *= mix( 1.0, dr_lum * 2.0, uFeatB.w );

  // ── bedding planes: undulating, per-bed thickness + tone variance
  float dr_bedY = ( dr_gt + uBedCfg.y * ( dr_fb( vec2( vMapUv.x * 2.7, uSeedS ) ) - 0.5 ) ) * uBedCfg.x;
  float dr_bi = floor( dr_bedY );
  float dr_bf = fract( dr_bedY );
  float dr_bw = 0.020 + 0.030 * dr_h21( vec2( dr_bi, uSeedS + 3.1 ) );
  float dr_line = 1.0 - smoothstep( 0.0, dr_bw, min( dr_bf, 1.0 - dr_bf ) );
  float dr_tone = 0.90 + 0.20 * dr_h21( vec2( dr_bi, uSeedS + 9.7 ) );
  dr_col *= mix( 1.0, dr_tone * ( 1.0 - 0.55 * dr_line ), uFeatA.x );

  // ── joint sets: two crossing families with darker infill
  float dr_j = max( dr_joint( dr_a, uJointCfg.x, uJointCfg.z ),
                    dr_joint( dr_a, uJointCfg.y, uJointCfg.z * 0.83 ) );
  dr_j *= uFeatA.y;
  dr_col *= 1.0 - 0.62 * dr_j;

  // ── crystalline mica glints
  float dr_mica = smoothstep( 0.87, 0.99, dr_vn( dr_a * 37.0 ) ) * uFeatA.z;
  dr_col += dr_mica * 0.30;

  // ── granular sparkle (sand / till)
  float dr_grain = ( dr_vn( dr_a * 71.0 ) - 0.5 ) * uFeatA.w;
  dr_col *= 1.0 + dr_grain * 0.35;

  // ── clast rim darkening (gravel / till)
  dr_col *= 1.0 - uFeatB.z * 0.30 * smoothstep( 0.55, 0.16, dr_lum );

  // ── water: wetter toward the layer floor. darkens, gloss up.
  float dr_wet = uFeatB.x * smoothstep( 0.62, 0.02, dr_gt );
  dr_col *= mix( 1.0, 0.62, dr_wet );

  // ── void: near black with a faint damp rim under the roof
  float dr_rim = smoothstep( 0.80, 1.0, dr_gt );
  dr_col = mix( dr_col, dr_col * 0.10 + vec3( 0.012, 0.014, 0.018 ), uFeatB.y );
  dr_col += uFeatB.y * dr_rim * vec3( 0.030, 0.040, 0.052 ) * ( 0.75 + 0.25 * sin( uTimeS * 0.6 + vMapUv.x * 9.0 ) );

  dr_roughMul = ( 1.0 - 0.55 * dr_wet ) * ( 1.0 - 0.60 * dr_mica ) * ( 1.0 + 0.35 * dr_j );
  dr_nrmMul   = 1.0 - 0.45 * dr_wet - 0.55 * uFeatB.y;
`;

/**
 * THE CORE STICK. Everything above is the rock; this is what the CORE BARREL
 * did to it, and it is spliced between the body and the tail so it can still
 * move dr_col / dr_roughMul / dr_nrmMul.
 *
 * vMapUv.y runs ALONG the stick and vMapUv.x around it, which is why the
 * bedding term in the body already lands as traces circling the barrel: for a
 * vertical hole in flat-lying beds that is exactly right, and a dipping bed
 * becomes an ellipse the moment the caller tilts the uv.
 *
 * The one thing a driller actually reads off a tray is RQD — how long the
 * unbroken pieces are — so the break spacing is the parameter, not decoration.
 */
const CORE_MAP = /* glsl */`
  // ── the run is snapped into pieces. uCoreA.y is how many across the map.
  float dc_pt = vMapUv.y * uCoreA.y + dr_h21( vec2( uSeedS, 4.73 ) );
  float dc_pi = floor( dc_pt );
  float dc_pf = abs( fract( dc_pt ) - 0.5 );
  float dc_brk  = 1.0 - smoothstep( 0.010, 0.075, dc_pf );   // the break face
  float dc_halo = 1.0 - smoothstep( 0.060, 0.300, dc_pf );   // its stained rim

  // A break made by the bit today is pale and dusty; a natural joint the core
  // merely fell apart along carries iron staining and a slickenside sheen.
  float dc_old = dr_h21( vec2( dc_pi, uSeedS + 2.31 ) );
  vec3  dc_face = mix( vec3( 1.16, 1.13, 1.09 ), vec3( 0.86, 0.58, 0.36 ), dc_old );
  dr_col *= mix( vec3( 1.0 ), dc_face, dc_halo * 0.42 + dc_brk * 0.38 );
  dr_col *= 1.0 - 0.34 * dc_brk;

  // ── lost core: below full recovery whole pieces are simply absent, which on
  //    a solid stick reads as a darker, dustier gap rather than a hole.
  float dc_lost = 1.0 - smoothstep( uCoreB.z - 0.06, uCoreB.z + 0.06, dr_h21( vec2( dc_pi + 0.5, uSeedS + 7.7 ) ) );
  dr_col = mix( dr_col, dr_col * 0.42 + vec3( 0.028, 0.026, 0.023 ), dc_lost * 0.85 );

  // ── the cut barrel: a shallow helical score left by the core bit, plus the
  //    rubbed polish it leaves between the scores. Continuous, +-0.035 albedo.
  float dc_hel = sin( ( vMapUv.x + vMapUv.y * uCoreB.y ) * 6.2831853 * 9.0 );
  dr_col *= 1.0 + 0.035 * dc_hel * uCoreB.x;
  float dc_polish = uCoreB.w * ( 0.5 + 0.5 * dc_hel ) * ( 1.0 - dc_brk ) * ( 1.0 - dc_lost );

  // ── the tray is never dry: flush water darkens, drill mud films it over.
  float dc_wet = uCoreA.z;
  dr_col *= mix( 1.0, 0.66, dc_wet * ( 0.55 + 0.45 * dr_lum ) );
  float dc_mud = uCoreA.w * smoothstep( 0.42, 0.86, dr_fb( dr_a * 0.63 + 3.17 ) );
  dr_col = mix( dr_col, vec3( 0.150, 0.121, 0.088 ), dc_mud * 0.5 );

  dr_roughMul *= ( 1.0 - 0.42 * dc_wet ) * ( 1.0 - 0.30 * dc_polish )
               * ( 1.0 + 0.30 * dc_brk ) * ( 1.0 + 0.22 * dc_mud );
  dr_nrmMul   *= ( 1.0 - 0.30 * dc_wet ) + 0.75 * dc_brk + 0.35 * dc_lost;
`;

const STRAT_MAP_TAIL = /* glsl */`
  // Assign rather than multiply: uColTop/uColBot already carry the layer
  // colour, which leaves material.color free to advertise a representative
  // hue to other systems.
  diffuseColor.rgb = max( dr_col, vec3( 0.0 ) );
#endif
`;

const STRAT_MAP = STRAT_MAP_BODY + STRAT_MAP_TAIL;
const CORE_MAP_FULL = STRAT_MAP_BODY + CORE_MAP + STRAT_MAP_TAIL;

const STRAT_ROUGH = /* glsl */`
float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
  vec4 dr_orm1 = texture2D( roughnessMap, dr_uvA( vRoughnessMapUv ) );
  vec4 dr_orm2 = texture2D( roughnessMap, dr_uvB( vRoughnessMapUv ) );
  roughnessFactor *= mix( dr_orm1.g, dr_orm2.g, dr_blend );
#endif
roughnessFactor = clamp( roughnessFactor * dr_roughMul, 0.035, 1.0 );
`;

const STRAT_NORMAL = /* glsl */`
#ifdef USE_NORMALMAP_OBJECTSPACE
  normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
  #ifdef FLIP_SIDED
    normal = - normal;
  #endif
  #ifdef DOUBLE_SIDED
    normal = normal * faceDirection;
  #endif
  normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
  vec3 mapN = texture2D( normalMap, dr_uvA( vNormalMapUv ) ).xyz * 2.0 - 1.0;
  vec3 mapN2 = texture2D( normalMap, dr_uvB( vNormalMapUv ) ).xyz * 2.0 - 1.0;
  mapN = normalize( mix( mapN, mapN2, dr_blend ) );
  mapN.xy *= normalScale * dr_nrmMul;
  normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
  normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif
`;

/* ═══════════════════════════════════════════════════════════════════════════
   §6  THE FACTORY
   ═══════════════════════════════════════════════════════════════════════════ */

export function createAssets(ctx = {}) {
  const BRAND = (ctx && ctx.BRAND) || BRAND_FALLBACK;
  const tierId = (ctx.quality && ctx.quality.id) || 'medium';
  const TIER = TIER_CFG[tierId] || TIER_CFG.medium;
  const AUTHOR = TIER.author;

  /* ── shared mutable state ──────────────────────────────────────────────── */
  let destroyed = false;
  let viewport = { w: 1, h: 1, dpr: 1 };
  const slice = { count: 0, maxMs: 0, sumMs: 0, overMs: 0 };
  const gate = makeGate(TIER.gateMs, (held) => {
    slice.count++;
    slice.sumMs += held;
    if (held > slice.maxMs) slice.maxMs = held;
    if (held > 16) slice.overMs++;    // slices that could have cost a frame
  });

  // `cap` is the hard ceiling reported by stats(); `planCap` holds back a
  // slice of it so incidental allocations made outside the set planner
  // (decals, noise/gradient data textures, UI plates) cannot push the running
  // total past `cap`.
  const ledger = {
    bytes: 0, peak: 0,
    cap: TIER.budgetMB * 1048576,
    planCap: TIER.budgetMB * 1048576 -
      Math.min(Math.round(TIER.budgetMB * 1048576 * 0.14), 10 * 1048576),
  };
  const pools = {};
  for (const k of Object.keys(POOL_FRAC)) {
    pools[k] = { floor: Math.round(ledger.planCap * POOL_FRAC[k]), used: 0 };
  }
  const poolFor = (cls) => (pools[cls] ? cls : 'general');

  /**
   * Bytes `name` may still allocate: everything unspent, minus the floors the
   * other families are still owed. A family that has already exceeded its own
   * floor keeps competing for the commons on equal terms.
   */
  function poolAvailable(name) {
    const free = Math.max(0, ledger.planCap - ledger.bytes);
    if (ledger.bytes < ledger.planCap * CONTENTION_AT) return free;
    let owedElsewhere = 0;
    for (const [k, p] of Object.entries(pools)) {
      if (k === name) continue;
      owedElsewhere += Math.max(0, p.floor - p.used);
    }
    return Math.max(0, free - owedElsewhere);
  }

  /**
   * Generation runs strictly one task at a time, so the pixel stages can share
   * one set of scratch buffers instead of throwing away ~12 MB of typed arrays
   * per texture set. Removing that churn is what keeps the occasional GC pause
   * from eating a frame in the middle of a build.
   */
  const scratch = { n: 0, albedo: null, orm: null, hf: null, nrm: null };
  function scratchFor(n) {
    if (scratch.n < n) {
      scratch.n = n;
      scratch.albedo = new Uint8ClampedArray(n * n * 4);
      scratch.orm = new Uint8ClampedArray(n * n * 4);
      scratch.nrm = new Uint8ClampedArray(n * n * 4);
      scratch.hf = new Float32Array(n * n);
    }
    return scratch;
  }

  const allTextures = new Set();
  const allMaterials = new Map();       // cacheKey -> material
  const setCache = new Map();           // family|setKey -> set
  const familyIndex = new Map();        // family -> Map(setKey -> set)
  const decalCache = new Map();
  const dataTexCache = new Map();
  const stratumCache = new Map();
  const animated = new Set();           // materials with live uniforms
  const wetGroup = new Set();           // ground materials that react to weather
  const warned = new Set();

  const uTime = { value: 0 };
  let wetness = 0.06, wetTarget = 0.06;

  /* ── task queue ────────────────────────────────────────────────────────── */
  const tasks = [];
  let taskSeq = 0;
  let pumping = false;
  let running = 0;                      // the in-flight task, if any
  let built = 0, failed = 0;

  function schedule(run, prio = 5) {
    if (destroyed) return Promise.resolve(null);
    return new Promise((resolve) => {
      tasks.push({ prio, seq: taskSeq++, run, resolve });
      pump();
    });
  }

  async function pump() {
    if (pumping) return;
    pumping = true;
    try {
      while (tasks.length && !destroyed) {
        tasks.sort((a, b) => (a.prio - b.prio) || (a.seq - b.seq));
        const t = tasks.shift();
        gate.reset();
        running = 1;
        try { t.resolve(await t.run(gate)); built++; }
        catch (e) { failed++; console.warn('[assets] generation failed —', e && e.message); t.resolve(null); }
        finally { running = 0; }
        await gate(true);
      }
    } finally { pumping = false; }
  }

  /* ── renderer / anisotropy resolution (renderer.js shape is not fixed) ─── */
  let anisoCap = (ctx.quality && ctx.quality.anisotropy) || 8;
  function resolveGL() {
    const cands = [ctx.renderer, ctx.renderer && ctx.renderer.renderer, ctx.renderer && ctx.renderer.gl,
      ctx.gl, ctx.webgl];
    for (const c of cands) if (c && c.capabilities && typeof c.capabilities.getMaxAnisotropy === 'function') return c;
    return null;
  }
  function refreshAniso() {
    const gl = resolveGL();
    const want = (ctx.quality && ctx.quality.anisotropy) || 8;
    anisoCap = gl ? Math.min(want, gl.capabilities.getMaxAnisotropy()) : want;
  }

  /* ── texture construction ──────────────────────────────────────────────── */
  /**
   * Wrap modes are per axis because several surfaces are genuinely finite in
   * one direction: bodywork carries a top-to-bottom dirt gradient, and a drill
   * rod has threads at its ends and continuity around its circumference.
   * Tiling those axes would be the seam, not the fix.
   */
  function resolveWrap(w) {
    const one = (v) => (v === 'clamp' ? THREE.ClampToEdgeWrapping
      : v === 'mirror' ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping);
    if (!w) return [THREE.RepeatWrapping, THREE.RepeatWrapping];
    if (typeof w === 'string') return [one(w), one(w)];
    return [one(w.s), one(w.t)];
  }

  /** Ledger + registry bookkeeping shared by every texture this module owns. */
  function registerTex(t, bytes, pool) {
    t.userData.bytes = bytes;
    t.userData.pool = pools[pool] ? pool : 'general';
    ledger.bytes += bytes;
    pools[t.userData.pool].used += bytes;
    ledger.peak = Math.max(ledger.peak, ledger.bytes);
    allTextures.add(t);
    return t;
  }

  function newTexture(canvas, { srgb = false, wrap = null, aniso = true, mips = true, pool = 'general' } = {}) {
    const t = new THREE.CanvasTexture(canvas);
    const [ws, wt] = resolveWrap(wrap);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.wrapS = ws; t.wrapT = wt;
    t.generateMipmaps = mips;
    t.minFilter = mips ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = aniso ? anisoCap : 1;
    t.channel = 0;                       // aoMap must read uv, never uv1
    t.needsUpdate = true;
    return registerTex(t, texBytes(canvas.width, canvas.height), pool);
  }

  /**
   * Albedo for a cutout kind. A DataTexture, because it is the only three.js
   * texture that will accept the hand-built chain buildAlphaMips() produces.
   *
   * Two consequences worth knowing:
   *   • flipY is a GL UNPACK flag that does nothing for an ArrayBufferView
   *     source, so rows are written bottom-up by hand. That keeps the albedo
   *     in the same orientation as the canvas-backed normal and ORM, which
   *     ARE flipped for us — mismatch there would mirror the lighting.
   *   • the prime chain has exactly as many levels as the finished one, so
   *     three's texStorage2D allocation is made once and the async pass
   *     re-uploads through texSubImage2D per level — design note 2 holds:
   *     no reallocation, no program rebuild, no white frame.
   */
  function newAlphaTexture(n, level0, alphaTest, wrap, pool) {
    const t = new THREE.DataTexture(level0, n, n, THREE.RGBAFormat, THREE.UnsignedByteType);
    const [ws, wt] = resolveWrap(wrap);
    t.mipmaps = buildAlphaMipsSync(level0, n);
    t.generateMipmaps = false;           // the chain above IS the chain
    t.flipY = false;                     // rows are written bottom-up
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = ws; t.wrapT = wt;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = anisoCap;
    t.channel = 0;
    t.needsUpdate = true;
    return registerTex(t, texBytes(n, n), pool);
  }

  /** Flip an RGBA buffer's rows in place-ish, into `dst`. */
  function flipRows(src, dst, n) {
    const row = n * 4;
    for (let y = 0; y < n; y++) dst.set(src.subarray((n - 1 - y) * row, (n - y) * row), y * row);
    return dst;
  }

  /** Clone for a per-material uv transform. three shares the GPU allocation
   *  between clones (same Source), so this is free memory-wise. */
  function cloneForRepeat(t, rx, ry) {
    const c = t.clone();
    c.repeat.set(rx, ry);
    c.wrapS = c.wrapT = t.wrapS;
    c.channel = 0;
    c.needsUpdate = true;
    c.userData.bytes = 0;                // shares the source allocation
    c.userData.cloneOf = t;
    allTextures.add(c);
    return c;
  }

  /* ── budget-aware resolution planning ──────────────────────────────────── */
  /**
   * Choose [albedo, normal, orm] sizes for a class, halving until the set fits
   * both its family's reserved pool and the global planning cap. Reservations
   * mean a late-arriving stratum still gets a real texture even if the shop
   * has already allocated every rig part in the game.
   */
  function planRes(cls) {
    const row = (RES_CLASS[cls] || RES_CLASS.std)[tierId] || RES_CLASS.std.medium;
    const avail = poolAvailable(poolFor(cls));
    const fits = (a, n, o) => texBytes(a, a) + texBytes(n, n) + texBytes(o, o) <= avail;
    let [a, n, o] = row;

    if (fits(a, n, o)) return { a, n, o };

    // Before sacrificing albedo detail, spend the cheapest currency there is:
    // a normal map at half the albedo resolution is very hard to fault, while
    // a half-resolution albedo is immediately visible. This rung sits between
    // "full" and "halve everything" and is usually enough on its own.
    const nHalf = Math.max(RES_FLOOR >> 1, n >> 1);
    const oHalf = Math.max(RES_FLOOR >> 2, o >> 1);
    if (fits(a, nHalf, oHalf)) return { a, n: nHalf, o: oHalf };

    n = nHalf; o = oHalf;
    let guard = 0;
    while (guard++ < 5 && a > RES_FLOOR && !fits(a, n, o)) {
      a = Math.max(RES_FLOOR, a >> 1);
      n = Math.max(RES_FLOOR >> 1, n >> 1);
      o = Math.max(RES_FLOOR >> 2, o >> 1);
    }
    return { a, n, o };
  }

  /* ── material set acquisition (family sharing + variant cap) ───────────── */
  function acquireSet(family, setKey, opts) {
    const full = family + '|' + setKey;
    const hit = setCache.get(full);
    if (hit) return hit;

    let fam = familyIndex.get(family);
    if (!fam) { fam = new Map(); familyIndex.set(family, fam); }

    const cap = opts.variants || 3;
    if (fam.size >= cap) {
      // reuse the perceptually nearest existing variant
      let best = null, bestD = Infinity;
      const want = opts.tag || [0.5, 0.5, 0.5];
      for (const s of fam.values()) {
        const t = s.tag || [0.5, 0.5, 0.5];
        const d = (t[0] - want[0]) ** 2 + (t[1] - want[1]) ** 2 + (t[2] - want[2]) ** 2;
        if (d < bestD) { bestD = d; best = s; }
      }
      if (best) { setCache.set(full, best); return best; }
    }

    const res = planRes(opts.cls || 'std');
    const fb = opts.fallback || { albedo: [0.5, 0.5, 0.5], rough: 0.65, metal: 0, ao: 1 };
    opts.fallback = fb;
    const seed = opts.seed | 0;

    const pool = poolFor(opts.cls || 'std');
    const nrmCv = primeCanvas(makeCanvas(res.n, res.n), [0.5, 0.5, 1.0], 0, seed + 2);
    const ormCv = primeCanvas(makeCanvas(res.o, res.o), [fb.ao, fb.rough, fb.metal], 0.02, seed + 3);

    // A cutout kind cannot be primed with a flat fill: a solid slab where a
    // wire panel belongs is worse than nothing, and a fully transparent prime
    // means the panel is simply missing until the queue reaches it. So the
    // prime runs the REAL pixel program on a 64² grid and point-scales it up.
    // ~4k shade calls, well under a millisecond, and the silhouette is right
    // from the first frame — it only gets sharper.
    let mapCv = null, mapTex;
    if (opts.alpha) {
      mapTex = newAlphaTexture(res.a, primeAlphaLevel0(res.a, opts.shade, fb),
        opts.alphaTest || 0.45, opts.wrap, pool);
    } else {
      mapCv = primeCanvas(makeCanvas(res.a, res.a, !!opts.dom), fb.albedo, 0.045, seed + 1);
      mapTex = newTexture(mapCv, { srgb: opts.linearAlbedo !== true, wrap: opts.wrap, pool });
    }

    const set = {
      family, setKey, res, tag: opts.tag || null, ready: false, pool,
      alpha: !!opts.alpha,
      map: mapTex,
      normal: newTexture(nrmCv, { srgb: false, wrap: opts.wrap, pool }),
      orm: newTexture(ormCv, { srgb: false, wrap: opts.wrap, pool }),
      mapCv, nrmCv, ormCv,
    };
    setCache.set(full, set);
    fam.set(setKey, set);

    schedule(async (g) => {
      if (destroyed) return null;
      await renderSet(set, opts, g);
      set.ready = true;
      return set;
    }, opts.prio || 5);

    return set;
  }

  /** Coarse, correct level 0 for a cutout albedo — see acquireSet. Rows are
   *  written bottom-up to match the DataTexture's ignored flipY. */
  function primeAlphaLevel0(n, shade, fb) {
    const q = Math.min(n, 64);
    const small = new Uint8Array(q * q * 4);
    const o = { h: 0.5, r: 0.5, g: 0.5, b: 0.5, ro: 0.6, me: 0, ao: 1, al: 1 };
    const qi = 1 / q;
    for (let y = 0; y < q; y++) {
      for (let x = 0; x < q; x++) {
        o.h = 0.5; o.r = fb.albedo[0]; o.g = fb.albedo[1]; o.b = fb.albedo[2];
        o.ro = fb.rough; o.me = fb.metal; o.ao = 1; o.al = 1;
        if (shade) shade(x * qi, y * qi, o, x, y, q);
        const p = (y * q + x) * 4;
        small[p] = clamp01(o.r) * 255; small[p + 1] = clamp01(o.g) * 255;
        small[p + 2] = clamp01(o.b) * 255; small[p + 3] = clamp01(o.al) * 255;
      }
    }
    const out = new Uint8Array(n * n * 4);
    const k = q / n;
    for (let y = 0; y < n; y++) {
      const sy = Math.min(q - 1, (y * k) | 0) * q;
      const dy = (n - 1 - y) * n;              // bottom-up
      for (let x = 0; x < n; x++) {
        const s = (sy + Math.min(q - 1, (x * k) | 0)) * 4;
        const d = (dy + x) * 4;
        out[d] = small[s]; out[d + 1] = small[s + 1];
        out[d + 2] = small[s + 2]; out[d + 3] = small[s + 3];
      }
    }
    return out;
  }

  /** The one pixel pass: albedo + ORM + height, then normal, then overlay. */
  async function renderSet(set, opts, g) {
    const n = set.res.a;
    const shade = opts.shade;
    if (!shade) return;
    const sc = scratchFor(n);
    const albedo = sc.albedo.subarray(0, n * n * 4);
    const orm = sc.orm.subarray(0, n * n * 4);
    const hf = sc.hf.subarray(0, n * n);
    const fb = opts.fallback;
    const o = { h: 0.5, r: 0.5, g: 0.5, b: 0.5, ro: 0.6, me: 0, ao: 1, al: 1 };
    const inv = 1 / n;

    for (let y = 0; y < n; y++) {
      const v = y * inv;
      let p = y * n * 4;
      const q0 = y * n;
      for (let x = 0; x < n; x++) {
        o.h = 0.5; o.r = fb.albedo[0]; o.g = fb.albedo[1]; o.b = fb.albedo[2];
        o.ro = fb.rough; o.me = fb.metal; o.ao = 1; o.al = 1;
        shade(x * inv, v, o, x, y, n);
        albedo[p] = o.r * 255; albedo[p + 1] = o.g * 255; albedo[p + 2] = o.b * 255; albedo[p + 3] = o.al * 255;
        orm[p] = o.ao * 255; orm[p + 1] = o.ro * 255; orm[p + 2] = o.me * 255; orm[p + 3] = 255;
        hf[q0 + x] = o.h;
        p += 4;
      }
      await g();          // the gate is a no-op until the slice budget is spent
    }
    if (destroyed) return;

    // Height-stage overlay: anything that must show up as real relief in the
    // normal map (paint film, printed wordmarks) stamps into hf here.
    if (opts.preNormal) {
      try { opts.preNormal(set, hf, n); }
      catch (e) { console.warn('[assets] preNormal', e && e.message); }
      await g();
    }

    if (set.alpha) {
      // Level 0 lands bottom-up; the chain is rebuilt against the alphaTest
      // the material actually cuts at, or the coverage fit is measured at the
      // wrong threshold and does nothing useful.
      const lvl0 = flipRows(albedo, new Uint8Array(n * n * 4), n);
      await g();
      const chain = await buildAlphaMips(lvl0, n, opts.alphaTest || 0.45, true, g);
      if (destroyed) return;
      set.map.image = { data: lvl0, width: n, height: n };
      set.map.mipmaps = chain;
      await g();
    } else {
      blit(set.mapCv, albedo, n, n);
    }
    await g();
    await blitScaled(set.ormCv, orm, n, set.res.o, false, g);
    await g();
    const nrm = await normalFromHeight(hf, n, opts.normalStrength || 1, g, sc.nrm);
    if (destroyed) return;
    await blitScaled(set.nrmCv, nrm, n, set.res.n, true, g);
    await g();

    // Colour-stage overlay: canvas 2D drawing composited over the finished
    // albedo (and ORM), after the pixel program has run.
    if (opts.overlay) { try { opts.overlay(set, BRAND); } catch (e) { console.warn('[assets] overlay', e && e.message); } }

    set.map.needsUpdate = true;
    set.normal.needsUpdate = true;
    set.orm.needsUpdate = true;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     §7  CACHE KEY
     ═════════════════════════════════════════════════════════════════════════ */

  function stable(v) {
    if (v === null || v === undefined) return 'o';
    const t = typeof v;
    if (t === 'number') return Number.isFinite(v) ? String(Math.round(v * 1e4) / 1e4) : '0';
    if (t === 'boolean') return v ? '1' : '0';
    if (t === 'string') return v;
    if (t === 'function') return 'fn';
    if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
    if (v.isColor) return '#' + v.getHexString();
    if (t === 'object') {
      const ks = Object.keys(v).filter((k) => v[k] !== undefined).sort();
      return '{' + ks.map((k) => k + ':' + stable(v[k])).join(',') + '}';
    }
    return String(v);
  }
  function key(kind, params = {}) { return kind + '|' + stable(params); }

  /* quantised colour for variant keys — 5 bits per channel */
  const qc = (c) => { const r = hexRGB(c); return ((r[0] * 31) | 0) + '_' + ((r[1] * 31) | 0) + '_' + ((r[2] * 31) | 0); };
  const q2 = (v) => String(Math.round(clamp01(v) * 4));

  return buildAPI();

  /* ═════════════════════════════════════════════════════════════════════════
     §8  KIND REGISTRY + PUBLIC API  (closure keeps BRAND/tier in scope)
     ═════════════════════════════════════════════════════════════════════════ */

  function buildAPI() {

    /* ── glyphs for the geometric DRILLITY wordmark fallback ────────────── */
    const GLYPHS = {
      D(c, w, h, t) {
        const i = t / 2;
        c.beginPath();
        c.moveTo(i, h - i); c.lineTo(i, i); c.lineTo(w * 0.48, i);
        c.quadraticCurveTo(w - i, i, w - i, h * 0.5);
        c.quadraticCurveTo(w - i, h - i, w * 0.48, h - i);
        c.closePath(); c.stroke();
      },
      R(c, w, h, t) {
        const i = t / 2;
        c.beginPath();
        c.moveTo(i, h - i); c.lineTo(i, i); c.lineTo(w * 0.46, i);
        c.quadraticCurveTo(w - i, i, w - i, h * 0.27);
        c.quadraticCurveTo(w - i, h * 0.53, w * 0.46, h * 0.53);
        c.lineTo(i, h * 0.53);
        c.stroke();
        c.beginPath(); c.moveTo(w * 0.44, h * 0.53); c.lineTo(w - i, h - i); c.stroke();
      },
      I(c, w, h, t) { const i = t / 2; c.beginPath(); c.moveTo(w * 0.5, i); c.lineTo(w * 0.5, h - i); c.stroke(); },
      L(c, w, h, t) { const i = t / 2; c.beginPath(); c.moveTo(i, i); c.lineTo(i, h - i); c.lineTo(w - i, h - i); c.stroke(); },
      T(c, w, h, t) {
        const i = t / 2;
        c.beginPath(); c.moveTo(i, i); c.lineTo(w - i, i); c.stroke();
        c.beginPath(); c.moveTo(w * 0.5, i); c.lineTo(w * 0.5, h - i); c.stroke();
      },
      Y(c, w, h, t) {
        const i = t / 2, mid = h * 0.5;
        c.beginPath(); c.moveTo(i, i); c.lineTo(w * 0.5, mid); c.lineTo(w - i, i); c.stroke();
        c.beginPath(); c.moveTo(w * 0.5, mid); c.lineTo(w * 0.5, h - i); c.stroke();
      },
    };

    let _logoFont = null;
    function logoFontAvailable() {
      if (_logoFont !== null) return _logoFont;
      _logoFont = false;
      try {
        if (typeof document !== 'undefined' && document.fonts && typeof document.fonts.check === 'function') {
          _logoFont = document.fonts.check('700 32px "Oswald"');
        }
        if (!_logoFont && typeof document !== 'undefined') {
          const cv = makeCanvas(8, 8, true);
          const c = ctx2d(cv);
          c.font = '700 64px monospace';
          const base = c.measureText('DRILLITY').width;
          c.font = '700 64px Oswald, monospace';
          _logoFont = Math.abs(c.measureText('DRILLITY').width - base) > 0.5;
        }
      } catch (e) { _logoFont = false; }
      return _logoFont;
    }

    /**
     * Draw condensed industrial caps. Prefers Oswald; falls back to a
     * hand-built geometric alphabet for the letters of DRILLITY; falls back
     * again to a horizontally squeezed system sans for anything else.
     */
    function drawWordmark(c, text, x, y, h, color, opts = {}) {
      const track = opts.track === undefined ? 0.1 : opts.track;
      const weight = opts.weight || 700;
      const str = String(text).toUpperCase();
      c.save();
      c.fillStyle = color; c.strokeStyle = color;
      if (logoFontAvailable()) {
        c.font = `${weight} ${h}px ${BRAND.fontLogo}`;
        c.textBaseline = 'top'; c.textAlign = 'left';
        let cx = x;
        for (const ch of str) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + h * track; }
        c.restore();
        return cx - x - h * track;
      }
      const allGeo = [...str].every((ch) => GLYPHS[ch] || ch === ' ');
      if (allGeo) {
        const gw = h * 0.56, t = h * 0.2, gap = h * (track + 0.06);
        c.lineWidth = t; c.lineCap = 'butt'; c.lineJoin = 'miter'; c.miterLimit = 3;
        let cx = x;
        for (const ch of str) {
          if (ch === ' ') { cx += gw * 0.6; continue; }
          c.save(); c.translate(cx, y);
          GLYPHS[ch](c, gw, h, t);
          c.restore();
          cx += gw + gap;
        }
        c.restore();
        return cx - x - gap;
      }
      c.font = `${weight} ${h}px ${BRAND.fontSans}`;
      c.textBaseline = 'top'; c.textAlign = 'left';
      c.save(); c.translate(x, y); c.scale(0.78, 1);
      c.fillText(str, 0, 0);
      const w = c.measureText(str).width * 0.78;
      c.restore(); c.restore();
      return w;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       KIND TABLE
       Each entry provides: cls, variants, prio, defaults(), setKey(),
       fallback(), base() (a fully-usable material), shade() (the pixel
       program), normalStrength, and an optional apply()/overlay().

       ── THE SAMPLING RULE FOR EVERY TERM BELOW ──────────────────────────────

       The mast is about 40 px wide in a portrait frame. A term that puts a
       feature narrower than a texel into the albedo or the ORM lands there as
       an isolated bright pixel that reads as a dead pixel or as dust on the
       lens — which is exactly what the metallic flake in paintedSteel was
       doing. Mipmapping does not save it, because the failure is at mip 0
       wherever the uv density is near 1:1, and a hard-thresholded feature is
       narrower than the noise cell it came from.

       So, for every authored term:

         1. The FEATURE SIZE must be set by the noise cell, never by the
            threshold. `sstep(a, b, valueNoise(f))` with (b - a) below ~0.25 is
            a sub-cell feature generator regardless of f, and `scratches()`
            with a high `sharp` is the same thing for hairlines. Widen the band
            or drop the frequency.
         2. A BASE frequency above ~120 is allowed only for a continuous term
            that moves albedo luminance by <= 0.08 and roughness/metalness by
            <= 0.06 — i.e. grain that averages to a tone rather than sparkle
            that survives the average. `vfbm` doubles per octave, so a 2-octave
            term at 120 already tops out at 240.

       Terms deliberately left above 120 after the audit, because they satisfy
       (2) — every one is continuous, and every one is at or under the ceiling
       on every channel it touches:

         chrome    `hone`   streaks 160 in u   h +-0.05, lum +-0.03
         concrete  `broom`  streaks 160 in v   h +-0.045, albedo untouched
         sand      `grain`  vfbm 145, 2 oct    lum +-0.055, h +-0.06
         paint     `micro`  vfbm 150, 2 oct    albedo untouched, ro +-0.035,
                                               h +-0.0008 (see paintedSteel)

       ── THE RULE THE AUDIT ABOVE DID NOT STATE, AND SHOULD HAVE ────────────

       Every clause above is about features TOO SMALL to survive resampling.
       There is a second failure at the other end and it cost more: a feature
       LARGE enough to resolve, laid out on a REGULAR LATTICE, reads as woven
       cloth however carefully its amplitude is tuned. The eye finds a
       repeating cell at 8-24 screen px and calls it fabric — it does not
       care that each cell is a plausible dimple.

       So, for any Worley/Voronoi term:

         3. A CELL FIELD IS A LATTICE. If one uv tile covers a whole panel,
            `worley(u * N, …)` puts a feature every 1/N of that panel on a
            grid, and the autocorrelation of the finished frame will say so.
            Before writing `N`, work out what 1/N is IN SCREEN PIXELS on the
            object the material lands on, and if that falls in 5-30 px the
            term must either be broken up (domain-warp the lookup, gate cells
            off individually) or be moved out of the albedo and the height
            into a channel the eye does not read as pattern.

       Everything else that was over the line now sits in the 104-138 band, and
       nothing in this file thresholds a per-texel noise into a feature
       narrower than the cell that generated it.

       ── THE SIX NEW INDUSTRIES, AGAINST THE SAME RULE ──────────────────────

       No term added for castConcrete, precastConcrete, shotcrete, resin,
       galvanised, mesh, blastedRock, anfoHose, detCord, sampleBag, coreTray,
       cyclone or timber has a base frequency ABOVE 120. The highest is
       coreTray's mould micro-grain at exactly 120, and every term in the
       104-120 band is a continuous vfbm moving albedo luminance by <= 0.055
       and roughness/metalness by <= 0.05.

       Nothing new thresholds noise into a feature either. Every pit, pore,
       bug hole, blow hole, spall, aggregate stone, rebound grain and prill
       goes through blob() on a Worley distance, whose radius is stated IN
       CELLS, so the feature is >= 1.8 texels across even at the LOW tier's
       authoring size and its edge scales with it. Every remaining sstep on a
       noise field is at least 0.26 wide on a base frequency of 26 or less.
       The authored geometry — mould chamfers, form lines, weave tapes, hose
       ribs, blast-hole half-barrels — is sized in uv, not in noise, and the
       narrowest of them (precastConcrete's grout fin, 1.4 % of a face) is
       still 3+ texels at 256.

       Three specific traps, and what was done about each:

         galvanised  a per-crystal facet ramp steps at the cell boundary, and
                     a one-texel step in a HEIGHT field is a one-texel crease
                     in the normal — the flake bug arriving through the normal
                     map instead of the albedo. The ramp is faded out by the
                     continuous F2-F1 edge distance and the boundary is drawn
                     as a groove a fixed fraction of a cell wide.
         mesh /      a weave modelled as "pick the nearer strand" is
         sampleBag   discontinuous at every crossing, by the whole over/under
                     ratio. Both now scale both profiles and take the max,
                     which is continuous because max of two continuous
                     functions is.
         shotcrete   a real steel fibre is 0.5 mm thick and is exactly the
                     feature this file may not author. It is a low-frequency
                     wide-band glitter carrying <= 0.05 albedo and a 0.21
                     roughness lift, not a wire.
       ═══════════════════════════════════════════════════════════════════════ */

    const PRIMER = hexRGB('#6B5F44');       // zinc-chromate primer
    const BARE = hexRGB('#8E9298');        // freshly exposed steel
    const RUST = hexRGB('#7E4423');
    const RUST2 = hexRGB('#A5673A');
    /* Steel exposed by a chip on a machine that is IN SERVICE — not the
       bright cut face `BARE` describes. It picks up an oxide film in days, so
       it sits between the two, and it is named rather than inlined because a
       chip core and a scrape core have to agree. */
    const EXPOSED = [
      BARE[0] + (RUST[0] - BARE[0]) * 0.45,
      BARE[1] + (RUST[1] - BARE[1]) * 0.45,
      BARE[2] + (RUST[2] - BARE[2]) * 0.45,
    ];

    /* Shared by the six new industries. Named rather than inlined because
       several kinds have to agree: the rock dust on a blasted face, on a
       sample bag and inside a cyclone is the SAME flour, and the game reads
       wrong the moment three agents pick three different greys for it. */
    const LAITANCE = hexRGB('#D6D2C7');     // bleed-water skin on fresh concrete
    const PASTE_GREEN = hexRGB('#6E7468');  // uncured concrete, still green
    const FRESH_BREAK = hexRGB('#C9C4B8');  // fractured concrete interior
    const AGG_DARK = hexRGB('#7C7369');     // coarse aggregate
    const SOIL_SMEAR = hexRGB('#5A4835');   // bore wall dragged into the pour
    const ZINC = hexRGB('#BCC3C6');         // bright hot-dip spelter
    const ZINC_DULL = hexRGB('#9DA19E');    // weathered zinc
    const WHITE_RUST = hexRGB('#D9DBD5');   // zinc oxide bloom
    const ROCK_DUST = hexRGB('#B9B2A4');    // blast fume + rock flour
    const SOOT = hexRGB('#2B2825');         // explosive residue
    const PRILL = hexRGB('#E4DCC6');        // ANFO prill / AN dust

    const KINDS = {

      /* ── rig bodywork ─────────────────────────────────────────────────── */
      paintedSteel: {
        // Panel-mapped vertically: the lower-half dirt build-up is an authored
        // gradient, so v is clamped and only u tiles around the bodywork.
        cls: 'hero', variants: 4, prio: 2, normalStrength: 1.35,
        wrap: { s: 'repeat', t: 'clamp' },
        defaults: (p) => ({
          /* BRAND.amberPlant, NOT BRAND.amber.
             `amber` (#F59E0B, S 0.955) is a UI accent sitting on dark slate.
             As a bodywork ALBEDO it is wrong by roughly the whole contribution
             of the light chain: measured off the build, the rig's lit panels
             came back at S 0.821 and its brightest faces at S 0.889 / hue
             41.7° — past amber, into school-bus yellow. The light chain adds
             +0.123 to min/max (albedo 11/245 = 0.045 renders at 33/197 =
             0.168), so the paint has to start 0.123 lower in saturation:
             #D9992E at S 0.788 lands at S 0.665 lit, which is the value the
             render was measured as needing. Hue is unchanged — (G-B)/(R-B) is
             0.626 for both — so this is a chroma correction only.

             The fix belongs HERE and nowhere else: not in the key light, not
             in grade.saturation. Hazard chevrons, safety stripes and livery
             keep BRAND.amber (see safetyStripe) because retroreflective tape
             genuinely is that saturated, and BRAND.amber itself is the
             wordmark colour and is fixed by DOMAIN.md §10. */
          color: p.color || BRAND.amberPlant || BRAND.amber,
          wear: clamp01(p.wear === undefined ? 0.32 : p.wear),
          dirt: clamp01(p.dirt === undefined ? 0.5 : p.dirt),
          seed: (p.seed === undefined ? 7 : p.seed) | 0,
          hero: p.hero !== false,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.wear)}~${q2(d.dirt)}~${d.seed & 7}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.34, metal: 0.04, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.34, metalness: 0.04,
          clearcoat: d.hero ? 0.85 - d.wear * 0.4 : 0.35,
          clearcoatRoughness: 0.08 + d.wear * 0.22,
          envMapIntensity: 1.0, sheen: 0.0,
        }),
        apply: (m, set) => {
          m.clearcoatNormalMap = set.normal;
          m.clearcoatNormalScale = new THREE.Vector2(0.35, 0.35);
        },
        shade: (d) => {
          const paint = hexRGB(d.color);
          const s = d.seed * 131 + 17;
          const wear = d.wear, dirt = d.dirt;
          const mud = hexRGB('#4A3E2C');
          const dust = hexRGB('#8B8272');
          return (u, v, o) => {
            const down = v;                              // canvas rows: 0 = top after flipY
            const lower = sstep(0.42, 1.0, down);

            /* ---- THE PAINT FILM ITSELF IS FLAT. ─────────────────────────
               This was `worley(u * 34, …)`, an F2-F1 dome per cell driving
               `h` at `(_W.f2 - cell) * 0.9`, sold as orange peel. Measured
               out of this very program (albedo/height/ORM rendered at the
               shipping 1024 and pushed through the same normalFromHeight()
               the bake uses), it was producing surface normals tilted a MEAN
               of 22.8 degrees, p99 39.6, max 62.7 — and doing it on a regular
               grid. A shading proxy over that normal put 18.3 % band-limited
               RMS luminance into the 5-30 screen-px band with the peak
               autocorrelation at 18.5 px on BOTH axes.

               Off the finished frames the same structure measures fleet-wide:
               19 px vertical on nine of eighteen rig captures, 7.26 % mean
               band RMS against a 0.4 % sky floor. It is the "woven fabric"
               finding, and it is one term.

               THE ARITHMETIC THAT KILLS IT. u tiles once around a panel, so
               34 cells span the whole panel. A 2.5 m engine cover at ~600
               screen px puts one cell at 18 px — and at 74 MILLIMETRES on the
               real machine. Orange peel is a millimetre-scale ripple in a
               film about a tenth of a millimetre thick; a 74 mm dimple
               tilting the normal 23 degrees is hail damage. There is no
               amplitude for this term that is both visible and correct,
               because the FEATURE SIZE is wrong by two orders of magnitude,
               and at 1024 texels per panel the right size is not authorable.

               What replaces it is what actually varies on a painted panel at
               this distance:

                 form   the panel's own gentle unflatness — press lines,
                        stiffeners behind the skin, oil-canning. Low
                        frequency by nature: fbm at 3 is a 340-texel feature,
                        ~200 screen px, an order of magnitude clear of the
                        band. +-0.020 in h = 1.3 degrees of normal.
                 micro  a whisper of film grain, an order of magnitude below
                        anything visible, whose real job is DITHER: with the
                        relief gone, `form` alone moves the packed normal by
                        only ~6 of 255 levels across 200 px, which quantises
                        into visible steps in the clearcoat highlight. This
                        breaks them up. It is also the peel, expressed where
                        peel actually lives — see `ro` below.

               Everything else that reads as structure on this material is
               authored downstream and is unchanged: chips, rust, the dirt
               gradient. Those are features, not a field.

               NOT SOURCED: the millimetre figures for film thickness and
               peel wavelength are general coatings knowledge, not a cited
               datasheet. The 74 mm / 23 degree numbers ARE measured, and
               they are the ones the argument rests on. */
            const form = fbm(u * 3, v * 3, 3, 3, s + 3, 3) * 0.020;
            const micro = vfbm(u * 150, v * 150, 150, 150, s + 8, 2);
            let h = 0.5 + form + (micro - 0.5) * 0.0016;

            /* ---- base paint: tonal drift, gloss variation, NO FLAKE
               The flake was `sstep(0.60, 0.94, valueNoise(u * 90, …))` at
               +0.05 albedo and +0.10 metalness. Two rounds had already been
               spent making it survive resampling — it started at 260 cycles
               with a 0.14-wide sstep, which kept only the tip of each cell
               and landed as one-texel mirror-bright specks; it was widened to
               a 0.34 band at 90 cycles so the feature size came from the cell
               rather than the threshold. That fixed the sparkle. It did not
               fix the PERIOD: 90 cells across a panel is 11.4 texels, and on
               the same 600-px panel as the peel arithmetic above that is a
               6.8 px cell. It is the "7 px, correlation 0.74" row of the
               fabric finding — the one at the phone's Nyquist limit — and it
               measures at h 6-7 px, r 0.42-0.66 on cfa-rig, oil-derrick and
               piling-leader in the shipped captures.

               It is deleted rather than retuned, because the honest reason to
               keep it was never strong: metallic flake is a passenger-car
               finish. Plant enamel is a SOLID colour — which is also why
               `me` is now a flat 0.03 (paint is a dielectric; the only
               metalness on this material should be where the paint is GONE,
               and the chip and rust blocks below still put it there).

               The gloss variation that flake was partly standing in for is
               real and stays, in the channel it belongs to. `micro` above
               rides roughness at +-0.035 — a 6.8-texel, ~4 screen-px ripple,
               BELOW the 5-30 px band by construction, so it averages to a
               sheen rather than resolving as a pattern. `chalk` is the slow
               one: gloss dies in patches long before colour does, so an old
               machine is matt where it has been rained on and polished where
               it is handled. fbm at 5 = a 200-texel feature, ~120 screen px,
               clear of the band on the far side.

               THE COLOUR IS NOT TOUCHED. Deleting the flake removes a mean
               +0.0074 of albedo (measured: mean flake 0.148 x 0.05), which is
               0.9 % of a paint[0] of 0.851 — three orders below the +0.123
               saturation correction the BRAND.amberPlant note above is about.
               Mean roughness moves 0.295 -> 0.309 before the base material's
               0.34 multiplier, i.e. 0.100 -> 0.105 effective. */
            const drift = fbm(u * 4, v * 4, 4, 4, s + 21, 3) * 0.045;
            const chalk = sstep(0.30, 0.92, fbm01(u * 5, v * 5, 5, 5, s + 33, 3)) * wear;
            let r = paint[0] * (1 + drift);
            let g = paint[1] * (1 + drift);
            let b = paint[2] * (1 + drift);
            let ro = 0.30 + (micro - 0.5) * 0.07 + chalk * 0.12;
            let me = 0.03;
            let ao = 1;

            /* ---- chipping. A wear field concentrates damage where a real rig
               takes it: leading faces, corners, the belly. That part was
               always right. Three things about the DISTRIBUTION were not:

               1. A BUG, and it was feeding the fabric. The old line read
                  `chipEdge = 0.30 + 0.22 * ihash(_W.cx | 0, _W.cy | 0, …)`.
                  `worleyBlock()` sets `_W.f1`, `_W.f2` and `_W.id` — it does
                  NOT set `_W.cx`/`_W.cy`. Those were left in the shared
                  scratch record by the LAST `worley()` call, which was the
                  34-cell orange peel three lines earlier. So every chip's
                  size was being drawn from the peel lattice's cell index:
                  the chips were locked to the same grid as the dimples and
                  reinforced its period instead of breaking it up. With the
                  peel gone the same line would have read whatever the
                  previously-shaded KIND happened to leave behind, which is
                  worse — a cross-material dependency through a module-level
                  scratch object. It now uses `_W.id`, which is the cell hash
                  `worleyBlock` does set.

               2. Every cell chipped. `bias` gates the region, but inside a
                  region each of the 46 cells got a chip of near-identical
                  size, which is a lattice of blobs — a checkerboard, not
                  damage. Cells are now gated INDIVIDUALLY on their own hash,
                  so a chipped cell has un-chipped neighbours.

               3. The lookup is domain-warped before the Worley, so the cells
                  themselves are not on a grid. `warp` is built from periodic
                  fbm, so the texture still tiles in u exactly.

               Relief is down from 0.06 to 0.025: a chip is a step in a film
               a tenth of a millimetre thick, and at 0.6 screen px per texel
               its rim is sub-pixel. What sells a chip at ten metres is the
               PRIMER AND BARE STEEL COLOUR.

               4. And that colour was wrong in a way the fabric was hiding.
                  `deep` ramps to 1 over the middle 45 % of every chip and
                  took the pixel to `BARE` (#8E9298) at roughness 0.33 and
                  metalness 0.95 — a bright, cool, GLOSSY grey. Against amber
                  that reads as water spots; against `paintedDark`'s chassis
                  grey (luminance ~0.25 against BARE's ~0.57) it reads as
                  white paint spatter, which is exactly what the swatches
                  showed once the weave stopped covering it. Steel exposed on
                  a working machine is dull and carries an oxide film within
                  days — so `deep` now lands on BARE blended 45 % into RUST,
                  at roughness 0.55 rather than 0.33, and only the LARGEST
                  chips reach it at all: a small chip takes the topcoat and
                  stops at primer, which is what a small chip does. */
            const wf = fbm01(u * 3, v * 3, 3, 3, s + 41, 4) * 0.6 +
                       sstep(0.55, 1.0, down) * 0.25 + sstep(0.35, 0.0, down) * 0.15;
            const bias = clamp01(wf * (0.35 + wear * 1.5));
            const cw = warp(u * 30, v * 30, 30, 30, s + 49, 0.55, 2);
            const chipCell = worleyBlock(cw.x, cw.y, 30, 30, s + 55, 0.92);
            const chipRad = 0.30 * clamp01((bias * (0.55 + _W.id * 0.9) - 0.30) * 2.6);
            const chipT = clamp01((chipRad - chipCell) * 9);
            if (chipT > 0.01) {
              const deep = clamp01((chipT - 0.55) * 3.2) * sstep(0.15, 0.27, chipRad);
              r = mixv(r, PRIMER[0], chipT); g = mixv(g, PRIMER[1], chipT); b = mixv(b, PRIMER[2], chipT);
              r = mixv(r, EXPOSED[0], deep); g = mixv(g, EXPOSED[1], deep); b = mixv(b, EXPOSED[2], deep);
              ro = mixv(ro, 0.68, chipT); ro = mixv(ro, 0.55, deep);
              me = mixv(me, 0.05, chipT); me = mixv(me, 0.70, deep);
              h -= chipT * 0.025;
              ao = 1 - chipT * 0.18;
            }

            // ---- rust weeping out of the deepest chips
            const rustMask = clamp01((bias - 0.62) * 3) * sstep(0.42, 0.75, fbm01(u * 9, v * 9, 9, 9, s + 77, 3)) * wear;
            if (rustMask > 0.01) {
              const rt = valueNoise(u * 40, v * 40, 40, 40, s + 83);
              const rr = mixv(RUST[0], RUST2[0], rt), rg = mixv(RUST[1], RUST2[1], rt), rb = mixv(RUST[2], RUST2[2], rt);
              r = mixv(r, rr, rustMask); g = mixv(g, rg, rustMask); b = mixv(b, rb, rustMask);
              ro = mixv(ro, 0.92, rustMask); me = mixv(me, 0.0, rustMask * 0.8);
            }

            // ---- site dirt: splatter low, vertical wash streaks above it
            const splat = sstep(0.40, 0.78, fbm01(u * 11, v * 11, 11, 11, s + 91, 4));
            const wash = streaks(u * 5, v * 30, 5, 30, s + 97, 3, 0.28);
            const dcov = clamp01((lower * 0.85 + 0.15) * dirt * (splat * 0.75 + wash * 0.45));
            if (dcov > 0.005) {
              const wetLook = sstep(0.55, 1.0, splat) * 0.4;
              const dr0 = mixv(dust[0], mud[0], wetLook), dg0 = mixv(dust[1], mud[1], wetLook), db0 = mixv(dust[2], mud[2], wetLook);
              r = mixv(r, dr0, dcov); g = mixv(g, dg0, dcov); b = mixv(b, db0, dcov);
              ro = mixv(ro, 0.90, dcov); me *= 1 - dcov * 0.9;
              ao = Math.min(ao, 1 - dcov * 0.22);
              h += dcov * 0.02;
            }

            o.h = h; o.r = r; o.g = g; o.b = b; o.ro = clamp01(ro); o.me = clamp01(me); o.ao = clamp01(ao);
          };
        },
      },

      /* ── machined / forged steel ──────────────────────────────────────── */
      rawSteel: {
        cls: 'std', variants: 2, prio: 3, normalStrength: 0.85,
        defaults: (p) => ({
          color: p.color || '#9DA2A8',
          seed: (p.seed === undefined ? 3 : p.seed) | 0,
          blue: clamp01(p.blue === undefined ? 0.35 : p.blue),
          feed: p.feed === undefined ? 64 : p.feed | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${d.blue.toFixed(1)}~${d.feed}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.36, metal: 1, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.36, metalness: 1.0, envMapIntensity: 1.15 }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 977 + 5;
          const blue = hexRGB('#5C6B84');
          const feed = Math.max(8, d.feed);
          return (u, v, o) => {
            // milling: parallel tool marks with a periodic feed ridge
            const mark = streaks(u * 6, v * 116, 6, 116, s + 11, 2, 0.22);
            const ridge = 0.5 + 0.5 * Math.sin(v * TAU * feed + fbm(u * 4, v * 4, 4, 4, s + 13, 2) * 1.4);
            const micro = vfbm(u * 132, v * 132, 132, 132, s + 17, 2);
            const h = 0.5 + (mark - 0.5) * 0.26 + (ridge - 0.5) * 0.10 + (micro - 0.5) * 0.06;

            const lum = 0.94 + mark * 0.14 + (micro - 0.5) * 0.08;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;

            // heat blueing in soft patches
            const bl = sstep(0.55, 0.92, fbm01(u * 5, v * 5, 5, 5, s + 23, 3)) * d.blue;
            r = mixv(r, blue[0], bl * 0.55); g = mixv(g, blue[1], bl * 0.5); b = mixv(b, blue[2], bl * 0.62);

            // fingerprint-scale roughness breakup: concentric smudges
            const wf = warp(u * 12, v * 12, 12, 12, s + 29, 0.6, 2);
            const print = 0.5 + 0.5 * Math.sin(ridgeDist(wf.x, wf.y) * 26);
            const smudge = sstep(0.5, 0.95, fbm01(u * 8, v * 8, 8, 8, s + 31, 3));
            const ro = 0.30 + mark * 0.10 + smudge * 0.14 * (0.4 + print * 0.6) + bl * 0.06;

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = 0.97 - bl * 0.05; o.ao = 1 - (1 - mark) * 0.08;
          };
        },
      },

      /* ── drill string / rods ──────────────────────────────────────────── */
      wornSteel: {
        // u runs along the rod (threaded at both ends, therefore finite);
        // v runs around the circumference, which is what actually wraps.
        cls: 'std', variants: 3, prio: 2, normalStrength: 1.1,
        wrap: { s: 'clamp', t: 'repeat' },
        defaults: (p) => ({
          color: p.color || '#7E7D79',
          rust: clamp01(p.rust === undefined ? 0.35 : p.rust),
          polish: clamp01(p.polish === undefined ? 0.55 : p.polish),
          thread: p.thread !== false,
          seed: (p.seed === undefined ? 13 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.rust)}~${q2(d.polish)}~${d.thread ? 1 : 0}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.48, metal: 0.95, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.48, metalness: 0.95, envMapIntensity: 1.05 }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 613 + 29;
          const polished = hexRGB('#B9BCC0');
          return (u, v, o) => {
            // The rod axis runs along U. v walks around the circumference.
            const band = sstep(0.35, 0.85, fbm01(u * 3, v * 14, 3, 14, s + 7, 3)) * d.polish;
            const scr = scratches(u * 2, v * 104, 2, 104, s + 11, 0.875);
            const grind = streaks(u * 4, v * 90, 4, 90, s + 15, 3, 0.2);

            let h = 0.5 + (grind - 0.5) * 0.18 + scr * 0.10;
            let r = base[0], g = base[1], b = base[2];
            let ro = 0.52 - band * 0.26 + (1 - grind) * 0.10;
            let me = 0.93;
            let ao = 1;

            // hole-polished bands: bright, smooth, slightly proud
            r = mixv(r, polished[0], band * 0.75); g = mixv(g, polished[1], band * 0.75); b = mixv(b, polished[2], band * 0.75);
            r += scr * 0.16; g += scr * 0.16; b += scr * 0.17;
            ro -= scr * 0.20;

            // rust blooms: worley cores feathered by fbm, suppressed on polish
            const bloom = worley(u * 7, v * 7, 7, 7, s + 21, 0.9);
            const bMask = clamp01((0.62 - bloom) * 2.1) * sstep(0.35, 0.8, fbm01(u * 16, v * 16, 16, 16, s + 25, 4));
            const rm = clamp01(bMask * d.rust * (1 - band * 0.85));
            if (rm > 0.01) {
              const t = valueNoise(u * 24, v * 24, 24, 24, s + 27);
              r = mixv(r, mixv(RUST[0], RUST2[0], t), rm);
              g = mixv(g, mixv(RUST[1], RUST2[1], t), rm);
              b = mixv(b, mixv(RUST[2], RUST2[2], t), rm);
              ro = mixv(ro, 0.94, rm); me = mixv(me, 0.25, rm * 0.7);
              h += rm * 0.05; ao = 1 - rm * 0.2;
            }

            // thread zones at both ends of the rod: dark, dirty, ridged
            if (d.thread) {
              const tz = Math.max(sstep(0.13, 0.02, u), sstep(0.87, 0.98, u));
              if (tz > 0.001) {
                const th = 0.5 + 0.5 * Math.sin(u * TAU * 130);
                h = mixv(h, 0.5 + (th - 0.5) * 0.62, tz);
                const dark = 0.62 + th * 0.16;
                r = mixv(r, base[0] * dark, tz); g = mixv(g, base[1] * dark, tz); b = mixv(b, base[2] * dark, tz);
                ro = mixv(ro, 0.72, tz); ao = mixv(ao, 0.74 + th * 0.2, tz);
              }
            }
            o.h = h; o.r = r; o.g = g; o.b = b; o.ro = clamp01(ro); o.me = clamp01(me); o.ao = clamp01(ao);
          };
        },
      },

      /* ── tungsten carbide buttons ─────────────────────────────────────── */
      carbide: {
        cls: 'fine', variants: 2, prio: 3, normalStrength: 0.55, normalOut: 0.6,
        defaults: (p) => ({ color: p.color || '#E4E6E8', seed: (p.seed === undefined ? 5 : p.seed) | 0, wear: clamp01(p.wear || 0) }),
        setKey: (d) => `${qc(d.color)}~${q2(d.wear)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.09, metal: 0.9, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.08 + d.wear * 0.14, metalness: 0.9,
          envMapIntensity: 1.9, clearcoat: 0.25, clearcoatRoughness: 0.05,
        }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 409 + 3;
          return (u, v, o) => {
            // sintered WC-Co mosaic: fine grains, faint tonal spread
            worley(u * 96, v * 96, 96, 96, s + 5, 0.95);
            const grainTone = 0.965 + _W.id * 0.05;
            const edge = clamp01((_W.f2 - _W.f1) * 5);
            // porosity: sparse deep micro-pits
            const pit = worley(u * 30, v * 30, 30, 30, s + 9, 0.95);
            const pitM = clamp01((0.13 - pit) * 9) * sstep(0.62, 0.9, ihash(_W.cx | 0, _W.cy | 0, s + 11));
            const h = 0.5 + (edge - 0.5) * 0.05 - pitM * 0.45;
            const lum = grainTone - pitM * 0.42 - (1 - edge) * 0.03;
            const scuff = scratches(u * 3, v * 110, 3, 110, s + 17, 0.955) * d.wear;
            o.h = h - scuff * 0.05;
            o.r = base[0] * lum; o.g = base[1] * lum; o.b = base[2] * lum;
            o.ro = clamp01(0.055 + pitM * 0.55 + (1 - edge) * 0.03 + scuff * 0.16 + d.wear * 0.08);
            o.me = 0.92 - pitM * 0.35;
            o.ao = 1 - pitM * 0.5 - (1 - edge) * 0.06;
          };
        },
      },

      /* ── sandcast iron ────────────────────────────────────────────────── */
      castIron: {
        cls: 'std', variants: 2, prio: 4, normalStrength: 1.5,
        defaults: (p) => ({ color: p.color || '#3B3D40', seed: (p.seed === undefined ? 23 : p.seed) | 0 }),
        setKey: (d) => `${qc(d.color)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.86, metal: 0.72, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.86, metalness: 0.72, envMapIntensity: 0.75 }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 271 + 11;
          return (u, v, o) => {
            // sand-mould grain across three scales + occasional blow holes
            // g1 drives the NORMAL by +-0.30 at what was a 300-cycle top
            // octave: sub-texel height is sub-texel specular. Dropped to 96
            // and the mid-scale grain picks up what it loses.
            const g1 = vfbm(u * 96, v * 96, 96, 96, s + 3, 2);
            const g2 = fbm01(u * 40, v * 40, 40, 40, s + 7, 3);
            const g3 = fbm01(u * 9, v * 9, 9, 9, s + 13, 3);
            const hole = worley(u * 22, v * 22, 22, 22, s + 19, 0.95);
            const hm = clamp01((0.11 - hole) * 10) * sstep(0.72, 0.95, ihash(_W.cx | 0, _W.cy | 0, s + 23));
            const h = 0.5 + (g1 - 0.5) * 0.30 + (g2 - 0.5) * 0.26 + (g3 - 0.5) * 0.16 - hm * 0.55;
            const lum = 0.86 + g2 * 0.24 + (g1 - 0.5) * 0.10 - hm * 0.5;
            o.h = h;
            o.r = base[0] * lum; o.g = base[1] * lum; o.b = base[2] * lum;
            o.ro = clamp01(0.80 + (1 - g2) * 0.14 + hm * 0.1);
            o.me = clamp01(0.74 - hm * 0.3 - (1 - g2) * 0.08);
            o.ao = clamp01(1 - hm * 0.6 - (1 - g3) * 0.10);
          };
        },
      },

      /* ── hydraulic cylinder rods ──────────────────────────────────────── */
      chrome: {
        cls: 'fine', variants: 2, prio: 3, normalStrength: 0.35, normalOut: 0.5,
        defaults: (p) => ({ color: p.color || '#EEF1F4', seed: (p.seed === undefined ? 31 : p.seed) | 0, wear: clamp01(p.wear || 0.12) }),
        setKey: (d) => `${qc(d.color)}~${q2(d.wear)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.045, metal: 1, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.045, metalness: 1.0, envMapIntensity: 1.55 }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 787 + 7;
          return (u, v, o) => {
            // vertical scoring: hairlines running along the stroke axis (V)
            // scratches() is sstep(sharp, 1) over a 3-octave ridged field, so
            // at 220 with sharp 0.945 every hairline was well under a texel
            // wide while carrying +0.30 roughness on a mirror. Fewer, softer,
            // wider strikes - a honed bore has visible scoring, not glitter.
            const score = scratches(u * 128, v * 3, 128, 3, s + 5, 0.905) * (0.35 + d.wear);
            const hone = streaks(u * 160, v * 4, 160, 4, s + 9, 2, 0.15);
            const sheen = fbm01(u * 6, v * 3, 6, 3, s + 15, 2);
            const h = 0.5 + (hone - 0.5) * 0.05 - score * 0.22;
            const lum = 0.985 + (hone - 0.5) * 0.03 - score * 0.10;
            o.h = h;
            o.r = base[0] * lum; o.g = base[1] * lum; o.b = base[2] * lum;
            o.ro = clamp01(0.030 + score * 0.20 + sheen * 0.028 + d.wear * 0.02);
            o.me = 1.0; o.ao = 1 - score * 0.15;
          };
        },
      },

      /* ── tracks, pads, hose jackets ───────────────────────────────────── */
      rubber: {
        cls: 'std', variants: 2, prio: 4, normalStrength: 1.25,
        defaults: (p) => ({
          color: p.color || '#1B1C1F',
          dust: clamp01(p.dust === undefined ? 0.35 : p.dust),
          seed: (p.seed === undefined ? 43 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.dust)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.9, metal: 0, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.0, envMapIntensity: 0.55 }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 353 + 19;
          const dustC = hexRGB('#8D8271');
          return (u, v, o) => {
            // pebble grain from a tight worley plus micro noise
            const peb = worley(u * 58, v * 58, 58, 58, s + 5, 0.85);
            const dome = clamp01(1 - peb * 1.9);
            const micro = vfbm(u * 132, v * 132, 132, 132, s + 9, 2);
            const h = 0.5 + dome * 0.22 + (micro - 0.5) * 0.10;
            const lum = 0.9 + dome * 0.22 + (micro - 0.5) * 0.08;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            let ro = 0.88 - dome * 0.05 + (1 - micro) * 0.06;
            // dust settling into the recesses, heavier low down
            // NB: no v-ramp here — track pads tile in both axes, so dust has
            // to come from periodic noise or it shows as a hard band.
            const dm = clamp01(d.dust * (1 - dome) * 1.15 *
              sstep(0.28, 0.82, fbm01(u * 10, v * 10, 10, 10, s + 13, 3)));
            r = mixv(r, dustC[0], dm * 0.7); g = mixv(g, dustC[1], dm * 0.7); b = mixv(b, dustC[2], dm * 0.7);
            ro = mixv(ro, 0.97, dm);
            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = 0; o.ao = clamp01(1 - (1 - dome) * 0.28);
          };
        },
      },

      /* ── hydraulic hose ───────────────────────────────────────────────── */
      hose: {
        cls: 'std', variants: 2, prio: 4, normalStrength: 1.6,
        defaults: (p) => ({
          color: p.color || '#141518',
          oil: clamp01(p.oil === undefined ? 0.45 : p.oil),
          weave: p.weave === undefined ? 26 : p.weave | 0,
          seed: (p.seed === undefined ? 61 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.oil)}~${d.weave}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.42, metal: 0.02, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.42, metalness: 0.02,
          clearcoat: 0.25 + d.oil * 0.35, clearcoatRoughness: 0.30, envMapIntensity: 0.85,
        }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 199 + 13;
          const F = Math.max(6, d.weave);
          return (u, v, o) => {
            // braided textile: two opposing helical strand families, woven
            const a = (u + v) * F, b2 = (u - v) * F;
            const sa = Math.sin(a * TAU), sb = Math.sin(b2 * TAU);
            const overA = (Math.floor(b2) & 1) === 0;
            const ha = 0.5 + 0.5 * sa, hb = 0.5 + 0.5 * sb;
            const strand = overA ? Math.max(ha, hb * 0.55) : Math.max(hb, ha * 0.55);
            const micro = vfbm(u * 128, v * 128, 128, 128, s + 7, 2);
            const h = 0.5 + (strand - 0.5) * 0.55 + (micro - 0.5) * 0.08;
            const lum = 0.82 + strand * 0.36 + (micro - 0.5) * 0.06;
            // oil film: darker, glossier smears
            const film = sstep(0.45, 0.85, fbm01(u * 7, v * 7, 7, 7, s + 11, 3)) * d.oil;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            r *= 1 - film * 0.22; g *= 1 - film * 0.20; b *= 1 - film * 0.14;
            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(0.52 - strand * 0.10 - film * 0.30);
            o.me = 0.02 + film * 0.05;
            o.ao = clamp01(0.80 + strand * 0.22);
          };
        },
      },

      /* ── cab trim / handles ───────────────────────────────────────────── */
      plastic: {
        cls: 'std', variants: 3, prio: 4, normalStrength: 0.8,
        defaults: (p) => ({
          color: p.color || '#262B33',
          seed: (p.seed === undefined ? 71 : p.seed) | 0,
          grain: clamp01(p.grain === undefined ? 0.6 : p.grain),
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.grain)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.45, metal: 0, ao: 1 }),
        base: (d) => {
          const m = new THREE.MeshPhysicalMaterial({
            color: 0xffffff, roughness: 0.45, metalness: 0.0,
            clearcoat: 0.12, clearcoatRoughness: 0.55,
            sheen: 0.35, sheenRoughness: 0.65, envMapIntensity: 0.8,
          });
          m.sheenColor.set('#C7A98A');   // warm rim: reads as thin subsurface
          return m;
        },
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 149 + 31;
          return (u, v, o) => {
            // moulded pebble/leather grain
            worley(u * 74, v * 74, 74, 74, s + 5, 0.9);
            const cellEdge = clamp01((_W.f2 - _W.f1) * 4.5);
            const micro = vfbm(u * 138, v * 138, 138, 138, s + 9, 2);
            const gAmt = d.grain;
            const h = 0.5 + (cellEdge - 0.5) * 0.30 * gAmt + (micro - 0.5) * 0.09;
            const lum = 0.94 + cellEdge * 0.12 * gAmt + (micro - 0.5) * 0.05;
            const wipe = sstep(0.55, 0.95, fbm01(u * 6, v * 6, 6, 6, s + 13, 3));
            o.h = h;
            o.r = base[0] * lum; o.g = base[1] * lum; o.b = base[2] * lum;
            o.ro = clamp01(0.50 - cellEdge * 0.08 * gAmt - wipe * 0.10);
            o.me = 0;
            o.ao = clamp01(0.88 + cellEdge * 0.14);
          };
        },
      },

      /* ── cab glazing ──────────────────────────────────────────────────── */
      glass: {
        cls: 'std', variants: 2, prio: 3, normalStrength: 0.3, wrap: 'clamp',
        defaults: (p) => ({
          color: p.color || '#E4EFEC',
          dirt: clamp01(p.dirt === undefined ? 0.45 : p.dirt),
          wiper: p.wiper !== false,
          seed: (p.seed === undefined ? 89 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.dirt)}~${d.wiper ? 1 : 0}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.06, metal: 0, ao: 1 }),
        base: (d) => {
          const m = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(d.color),
            roughness: 0.06, metalness: 0.0,
            transmission: 0.92, thickness: 0.012, ior: 1.52,
            transparent: true, opacity: 1.0,
            envMapIntensity: 1.25, clearcoat: 0.45, clearcoatRoughness: 0.06,
            side: THREE.DoubleSide,
          });
          m.attenuationColor.set('#9FC6BE');
          m.attenuationDistance = 0.9;
          return m;
        },
        normalOut: 0.35,
        // Keep map (grime tints both the diffuse and the transmitted light)
        // and roughnessMap; drop AO and metalness, which are meaningless here.
        apply: (m) => { m.aoMap = null; m.metalnessMap = null; },
        shade: (d) => {
          const s = d.seed * 61 + 3;
          return (u, v, o) => {
            // rain/dust runs, salt haze, then a swept wiper arc cutting through
            const run = streaks(u * 9, v * 34, 9, 34, s + 5, 3, 0.22);
            const haze = fbm01(u * 5, v * 5, 5, 5, s + 11, 3);
            const spot = sstep(0.72, 0.95, valueNoise(u * 70, v * 70, 70, 70, s + 17));
            let grime = clamp01((run * 0.6 + haze * 0.45 + spot * 0.4) * d.dirt);

            if (d.wiper) {
              const px = 0.5, py = 1.14;                  // pivot below the sill
              const dx = u - px, dy = v - py;
              const r = Math.sqrt(dx * dx + dy * dy);
              const ang = Math.atan2(dx, -dy);            // 0 = straight up
              const inR = sstep(0.30, 0.36, r) * (1 - sstep(0.94, 1.00, r));
              const inA = (1 - sstep(0.78, 0.94, Math.abs(ang)));
              const swept = inR * inA;
              const smear = 0.35 + 0.65 * sstep(0.35, 0.75, Math.abs(Math.sin(ang * 9 + r * 22)));
              grime *= 1 - swept * (0.88 - smear * 0.25);
            }

            const h = 0.5 + (run - 0.5) * 0.05 + grime * 0.03;
            o.h = h;
            o.r = 1 - grime * 0.35; o.g = 1 - grime * 0.34; o.b = 1 - grime * 0.30;
            o.ro = clamp01(0.028 + grime * 0.42);
            o.me = 0;
            o.ao = 1;
          };
        },
      },

      /* ── site ground ──────────────────────────────────────────────────── */
      dirt: {
        cls: 'ground', variants: 3, prio: 1, normalStrength: 1.8,
        defaults: (p) => ({
          color: p.color || '#4C3E2D',
          wet: clamp01(p.wet === undefined ? 0.3 : p.wet),
          ruts: clamp01(p.ruts === undefined ? 0.6 : p.ruts),
          seed: (p.seed === undefined ? 101 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.wet)}~${q2(d.ruts)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.92, metal: 0, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.7 }),
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const dark = hexRGB('#2C231A');
          const dry = hexRGB('#7A6A52');
          const s = d.seed * 89 + 5;
          return (u, v, o) => {
            const w = warp(u * 6, v * 6, 6, 6, s + 3, 0.45, 3);
            const macro = fbm01(w.x, w.y, 6, 6, s + 7, 4);
            const meso = fbm01(u * 24, v * 24, 24, 24, s + 11, 4);
            const micro = vfbm(u * 130, v * 130, 130, 130, s + 13, 2);

            // tyre ruts: parallel troughs with a chevron tread stamped in
            const rutPhase = frac(u * 3 + fbm(u * 2, v * 2, 2, 2, s + 17, 2) * 0.08);
            const rutBody = 1 - sstep(0.10, 0.30, Math.abs(rutPhase - 0.5));
            const tread = 0.5 + 0.5 * Math.sin((v * 26 + Math.abs(rutPhase - 0.5) * 12) * TAU);
            const rut = rutBody * d.ruts * sstep(0.25, 0.6, macro);

            // pebbles pushed to the surface
            const peb = worley(u * 34, v * 34, 34, 34, s + 23, 0.88);
            const pebble = clamp01((0.20 - peb) * 6) * sstep(0.4, 0.75, meso);

            let h = 0.5 + (macro - 0.5) * 0.36 + (meso - 0.5) * 0.22 + (micro - 0.5) * 0.08;
            h -= rut * 0.30; h += rut * tread * 0.12; h += pebble * 0.20;

            const dampness = clamp01(d.wet * (1 - sstep(0.45, 0.85, macro)) + rut * 0.35 * d.wet);
            const lum = 0.80 + meso * 0.30 + (micro - 0.5) * 0.14;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            r = mixv(r, dry[0], sstep(0.6, 0.95, macro) * 0.55);
            g = mixv(g, dry[1], sstep(0.6, 0.95, macro) * 0.55);
            b = mixv(b, dry[2], sstep(0.6, 0.95, macro) * 0.55);
            r = mixv(r, dark[0], dampness * 0.7); g = mixv(g, dark[1], dampness * 0.7); b = mixv(b, dark[2], dampness * 0.7);
            const pg = 0.55 + _W.id * 0.5;
            r = mixv(r, base[0] * pg + 0.16, pebble * 0.7);
            g = mixv(g, base[1] * pg + 0.15, pebble * 0.7);
            b = mixv(b, base[2] * pg + 0.13, pebble * 0.7);

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(0.95 - dampness * 0.62 - pebble * 0.10);
            o.me = 0;
            o.ao = clamp01(1 - rut * 0.30 - (1 - meso) * 0.18);
          };
        },
      },

      concrete: {
        cls: 'ground', variants: 2, prio: 3, normalStrength: 1.1,
        defaults: (p) => ({ color: p.color || '#918F8A', seed: (p.seed === undefined ? 113 : p.seed) | 0, wear: clamp01(p.wear === undefined ? 0.4 : p.wear) }),
        setKey: (d) => `${qc(d.color)}~${q2(d.wear)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.82, metal: 0, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82, metalness: 0.0, envMapIntensity: 0.7 }),
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 331 + 7;
          const stain = hexRGB('#5E5A52');
          return (u, v, o) => {
            const broom = streaks(u * 5, v * 160, 5, 160, s + 3, 2, 0.12);
            const macro = fbm01(u * 4, v * 4, 4, 4, s + 7, 3);
            const fines = vfbm(u * 134, v * 134, 134, 134, s + 11, 2);
            // exposed aggregate showing through where the surface is worn
            const agg = worley(u * 40, v * 40, 40, 40, s + 13, 0.9);
            const aggM = clamp01((0.22 - agg) * 5.5) * d.wear * sstep(0.4, 0.8, macro);
            const aggId = _W.id;   // capture before the next worley clobbers _W
            // air pores
            const pore = worley(u * 76, v * 76, 76, 76, s + 19, 0.95);
            const poreM = clamp01((0.09 - pore) * 12) * sstep(0.55, 0.85, ihash(_W.cx | 0, _W.cy | 0, s + 23));
            let h = 0.5 + (macro - 0.5) * 0.16 + (fines - 0.5) * 0.10 + (broom - 0.5) * 0.09 * (1 - d.wear);
            h += aggM * 0.14 - poreM * 0.5;
            const lum = 0.88 + macro * 0.20 + (fines - 0.5) * 0.12 + aggM * (0.2 + aggId * 0.3) - poreM * 0.45;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            const st = sstep(0.62, 0.95, fbm01(u * 3, v * 3, 3, 3, s + 29, 3)) * 0.45;
            r = mixv(r, stain[0], st); g = mixv(g, stain[1], st); b = mixv(b, stain[2], st);
            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(0.86 - aggM * 0.16 + poreM * 0.08 - st * 0.10);
            o.me = 0;
            o.ao = clamp01(1 - poreM * 0.55 - (1 - macro) * 0.12);
          };
        },
      },

      gravel: {
        cls: 'ground', variants: 2, prio: 2, normalStrength: 2.2,
        defaults: (p) => ({ color: p.color || '#8E8474', seed: (p.seed === undefined ? 127 : p.seed) | 0, wet: clamp01(p.wet || 0.1) }),
        setKey: (d) => `${qc(d.color)}~${q2(d.wet)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.88, metal: 0, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88, metalness: 0.0, envMapIntensity: 0.7 }),
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 577 + 11;
          return (u, v, o) => {
            // two clast populations over a fine matrix
            const wA = warp(u * 17, v * 17, 17, 17, s + 3, 0.28, 2);
            worley(wA.x, wA.y, 17, 17, s + 5, 0.9);
            const bigD = _W.f1, bigId = _W.id, bigEdge = _W.f2 - _W.f1;
            const domeBig = clamp01(1 - bigD * 2.0);
            const wB = warp(u * 44, v * 44, 44, 44, s + 9, 0.3, 2);
            worley(wB.x, wB.y, 44, 44, s + 13, 0.92);
            const smallId = _W.id;
            const domeSmall = clamp01(1 - _W.f1 * 2.4);
            const matrix = vfbm(u * 104, v * 104, 104, 104, s + 17, 3);

            const useBig = domeBig > 0.06;
            const id = useBig ? bigId : smallId;
            const dome = useBig ? domeBig : domeSmall * 0.7;
            const h = 0.5 + dome * 0.42 + (matrix - 0.5) * 0.10 - (1 - clamp01(bigEdge * 4)) * 0.05;

            // per-clast lithology tint: granite pinks, dark basalts, pale quartz
            const t = id;
            const tintR = 0.82 + t * 0.55, tintG = 0.84 + t * 0.42, tintB = 0.86 + t * 0.30;
            const lum = (0.62 + dome * 0.55) * (0.9 + matrix * 0.2);
            let r = base[0] * lum * tintR, g = base[1] * lum * tintG, b = base[2] * lum * tintB;
            const damp = d.wet * (1 - dome) * 0.9;
            r *= 1 - damp * 0.35; g *= 1 - damp * 0.35; b *= 1 - damp * 0.32;

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(0.92 - dome * 0.20 - damp * 0.45);
            o.me = 0;
            o.ao = clamp01(0.55 + dome * 0.48);
          };
        },
      },

      grass: {
        cls: 'ground', variants: 2, prio: 2, normalStrength: 1.4,
        defaults: (p) => ({
          color: p.color || '#4C6B2E',
          dry: clamp01(p.dry === undefined ? 0.3 : p.dry),
          seed: (p.seed === undefined ? 149 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.dry)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.85, metal: 0, ao: 1 }),
        base: (d) => {
          const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.0, envMapIntensity: 0.8 });
          return m;
        },
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 673 + 3;
          const deep = hexRGB('#2C4419');
          const straw = hexRGB('#93813F');
          const soil = hexRGB('#3B2F22');
          return (u, v, o) => {
            // blade streaks: strongly anisotropic ridges, heavily domain-warped
            // so the local blade direction varies while the field stays tileable
            const w = warp(u * 10, v * 10, 10, 10, s + 3, 1.15, 3);
            const blades = ridged(w.x * 2.4, w.y * 9, 24, 90, s + 7, 3, 0.55);
            const clump = fbm01(u * 7, v * 7, 7, 7, s + 11, 3);
            // +-15 % of the blade colour at 380 cycles across the top octave,
            // on the surface that covers the most screen. Halved and dropped
            // below the rule's ceiling.
            const micro = vfbm(u * 112, v * 112, 112, 112, s + 13, 2);

            const cover = clamp01(clump * 0.75 + blades * 0.5);
            const h = 0.5 + (blades - 0.5) * 0.34 * cover + (clump - 0.5) * 0.20;

            let r = base[0], g = base[1], b = base[2];
            const shade = 1 - clamp01((1 - blades) * 0.8) * 0.45;
            r = mixv(deep[0], r, clamp01(blades * 1.3)) * (0.92 + micro * 0.16);
            g = mixv(deep[1], g, clamp01(blades * 1.3)) * (0.92 + micro * 0.16);
            b = mixv(deep[2], b, clamp01(blades * 1.3)) * (0.92 + micro * 0.16);
            const dryM = clamp01(d.dry * sstep(0.35, 0.85, fbm01(u * 4, v * 4, 4, 4, s + 19, 3)));
            r = mixv(r, straw[0], dryM * 0.8); g = mixv(g, straw[1], dryM * 0.75); b = mixv(b, straw[2], dryM * 0.6);
            const bare = clamp01((0.30 - clump) * 3.6);
            r = mixv(r, soil[0], bare); g = mixv(g, soil[1], bare); b = mixv(b, soil[2], bare);

            o.h = h; o.r = r * shade + r * (1 - shade) * 0.55; o.g = g * shade + g * (1 - shade) * 0.55; o.b = b * shade + b * (1 - shade) * 0.55;
            o.ro = clamp01(0.78 + dryM * 0.14 + bare * 0.12 - blades * 0.10);
            o.me = 0;
            o.ao = clamp01(0.62 + cover * 0.4);
          };
        },
      },

      snow: {
        cls: 'ground', variants: 2, prio: 2, normalStrength: 1.5,
        defaults: (p) => ({ color: p.color || '#EAF0F6', seed: (p.seed === undefined ? 163 : p.seed) | 0, crust: clamp01(p.crust === undefined ? 0.45 : p.crust) }),
        setKey: (d) => `${qc(d.color)}~${q2(d.crust)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.6, metal: 0, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.0, envMapIntensity: 1.05 }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const shadow = hexRGB('#A8BDD2');
          const s = d.seed * 419 + 17;
          return (u, v, o) => {
            // wind drifts: long ridged crests plus sastrugi steps
            const w = warp(u * 5, v * 5, 5, 5, s + 3, 0.4, 2);
            const drift = ridged(w.x * 1.4, w.y * 5.6, 7, 28, s + 7, 4, 0.5);
            const soft = fbm01(u * 18, v * 18, 18, 18, s + 11, 3);
            // Sub-cell sparkle: a 0.07 band at 300 cycles put single-texel,
            // mirror-smooth (-0.50 roughness) white points across a surface
            // that fills half the frame. Larger cells, a wide band, and a
            // roughness delta that reads as sun on ice rather than fireflies.
            const spark = sstep(0.62, 0.95, valueNoise(u * 105, v * 105, 105, 105, s + 13));
            const crack = clamp01((0.05 - (worley(u * 12, v * 12, 12, 12, s + 19, 0.95), _W.f2 - _W.f1)) * 14) * d.crust;
            const h = 0.5 + (drift - 0.5) * 0.40 + (soft - 0.5) * 0.16 - crack * 0.25;
            const dip = clamp01(1 - drift * 1.2);
            let r = base[0], g = base[1], b = base[2];
            r = mixv(r, shadow[0], dip * 0.42); g = mixv(g, shadow[1], dip * 0.38); b = mixv(b, shadow[2], dip * 0.30);
            r += spark * 0.05; g += spark * 0.05; b += spark * 0.05;
            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(0.66 - drift * 0.14 - spark * 0.14 + crack * 0.1);
            o.me = 0;
            o.ao = clamp01(1 - dip * 0.24 - crack * 0.2);
          };
        },
      },

      sand: {
        cls: 'ground', variants: 2, prio: 2, normalStrength: 1.7,
        defaults: (p) => ({ color: p.color || '#C3A26A', seed: (p.seed === undefined ? 179 : p.seed) | 0, ripple: clamp01(p.ripple === undefined ? 0.7 : p.ripple) }),
        setKey: (d) => `${qc(d.color)}~${q2(d.ripple)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.92, metal: 0, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.72 }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const dk = hexRGB('#8E6E42');
          const s = d.seed * 233 + 5;
          return (u, v, o) => {
            const w = warp(u * 4, v * 4, 4, 4, s + 3, 0.55, 3);
            const ripple = ridged(w.x * 2, w.y * 12, 8, 48, s + 7, 3, 0.5) * d.ripple;
            const dune = fbm01(u * 3, v * 3, 3, 3, s + 11, 3);
            // grain was 300 (600 at the top octave) swinging lum by +-0.20;
            // coarse was a 0.14 band, i.e. single-texel bright grits.
            const grain = vfbm(u * 145, v * 145, 145, 145, s + 13, 2);
            const coarse = sstep(0.58, 0.92, valueNoise(u * 84, v * 84, 84, 84, s + 17));
            const h = 0.5 + (ripple - 0.5) * 0.34 + (dune - 0.5) * 0.22 + (grain - 0.5) * 0.12 + coarse * 0.10;
            const lum = 0.86 + ripple * 0.24 + (grain - 0.5) * 0.11 + dune * 0.10;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            const shade2 = clamp01(1 - ripple * 1.3) * 0.35;
            r = mixv(r, dk[0], shade2); g = mixv(g, dk[1], shade2); b = mixv(b, dk[2], shade2);
            r += coarse * 0.04; g += coarse * 0.034; b += coarse * 0.027;
            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(0.93 - coarse * 0.06);
            o.me = 0;
            o.ao = clamp01(0.82 + ripple * 0.20);
          };
        },
      },

      rockFace: {
        cls: 'ground', variants: 2, prio: 2, normalStrength: 2.6,
        defaults: (p) => ({ color: p.color || '#6E6A64', seed: (p.seed === undefined ? 191 : p.seed) | 0, joint: clamp01(p.joint === undefined ? 0.6 : p.joint) }),
        setKey: (d) => `${qc(d.color)}~${q2(d.joint)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.85, metal: 0, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0.02, envMapIntensity: 0.72 }),
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 811 + 13;
          const lichen = hexRGB('#6C7355');
          return (u, v, o) => {
            const w = warp(u * 5, v * 5, 5, 5, s + 3, 0.6, 3);
            const cliff = ridged(w.x, w.y, 5, 5, s + 7, 5, 0.52);
            worleyBlock(u * 9, v * 9, 9, 9, s + 11, 0.95);
            const seam = clamp01(1 - (_W.f2 - _W.f1) * 7) * d.joint;
            const blockTone = 0.85 + _W.id * 0.3;
            const grit = vfbm(u * 110, v * 110, 110, 110, s + 17, 3);
            const h = 0.5 + (cliff - 0.5) * 0.46 + (grit - 0.5) * 0.12 - seam * 0.34;
            const lum = (0.72 + cliff * 0.42) * blockTone * (0.92 + grit * 0.16);
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            r *= 1 - seam * 0.5; g *= 1 - seam * 0.5; b *= 1 - seam * 0.46;
            const li = sstep(0.66, 0.95, fbm01(u * 13, v * 13, 13, 13, s + 23, 3)) * clamp01(cliff * 1.4) * 0.5;
            r = mixv(r, lichen[0], li); g = mixv(g, lichen[1], li); b = mixv(b, lichen[2], li);
            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(0.88 - cliff * 0.10 + seam * 0.06 - li * 0.08);
            o.me = 0.02;
            o.ao = clamp01(0.62 + cliff * 0.42 - seam * 0.35);
          };
        },
      },

      /* ── drilling foam / mud return ───────────────────────────────────── */
      foam: {
        cls: 'std', variants: 2, prio: 4, normalStrength: 1.9,
        defaults: (p) => ({
          color: p.color || '#DFDCD2',
          tint: p.tint || '#A99878',
          load: clamp01(p.load === undefined ? 0.35 : p.load),
          seed: (p.seed === undefined ? 211 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${qc(d.tint)}~${q2(d.load)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.32, metal: 0, ao: 1 }),
        /* NO TRANSMISSION — the third instance of the same landmine, and the
           one most likely to fire. `foam` is a flush medium the game actually
           runs (data.js flushMedium 'foam') and it is on terrain.js's
           KIND_NAMES prop list, where only the `glass` class gets its
           transmission zeroed afterwards. A foam return around a collar would
           therefore have put the whole opaque list through a second render.
           Foam is a dense bubble raft: 0.22 transmission was buying a barely
           visible wash, so the sheen and a hair of blend carry it instead.
           A caller that really wants it back can now pass
           `{ transmission: 0.22, thickness: 0.06 }` and own the cost. */
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.30, metalness: 0.0,
          transmission: 0, thickness: 0, ior: 1.34,
          transparent: true, opacity: 0.92,
          sheen: 0.62, sheenRoughness: 0.4, envMapIntensity: 1.1,
        }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const cut = hexRGB(d.tint);
          const s = d.seed * 907 + 7;
          return (u, v, o) => {
            // three bubble populations packed together
            let dome = 0, hh = 0;
            const scales = [13, 29, 61];
            for (let i = 0; i < 3; i++) {
              const p = scales[i];
              worley(u * p, v * p, p, p, s + i * 97 + 3, 0.92);
              const dm = clamp01(1 - _W.f1 * (1.8 + i * 0.35));
              dome = Math.max(dome, dm * (1 - i * 0.18));
              hh += dm * (0.30 - i * 0.07);
            }
            const film = vfbm(u * 118, v * 118, 118, 118, s + 41, 2);
            const h = 0.5 + hh * 0.9 + (film - 0.5) * 0.06;
            const lum = 0.86 + dome * 0.28 + (film - 0.5) * 0.08;
            const load = d.load * sstep(0.35, 0.85, fbm01(u * 8, v * 8, 8, 8, s + 47, 3));
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            r = mixv(r, cut[0], load * 0.8); g = mixv(g, cut[1], load * 0.78); b = mixv(b, cut[2], load * 0.7);
            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(0.22 + (1 - dome) * 0.24 + load * 0.30);
            o.me = 0;
            o.ao = clamp01(0.68 + dome * 0.36);
          };
        },
      },

      /* ── hazard chevrons. BRAND.amber, exactly. ───────────────────────── */
      safetyStripe: {
        cls: 'std', variants: 3, prio: 2, normalStrength: 0.9,
        defaults: (p) => ({
          amber: BRAND.amber,                 // never overridable — brand rule
          dark: p.dark || '#12151A',
          stripes: p.stripes === undefined ? 6 : Math.max(2, p.stripes | 0),
          wear: clamp01(p.wear === undefined ? 0.35 : p.wear),
          chevron: p.chevron !== false,
          seed: (p.seed === undefined ? 227 : p.seed) | 0,
        }),
        setKey: (d) => `${d.stripes}~${q2(d.wear)}~${d.chevron ? 1 : 0}~${qc(d.dark)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.amber), rough: 0.38, metal: 0.03, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.38, metalness: 0.03,
          clearcoat: 0.5 - d.wear * 0.25, clearcoatRoughness: 0.14 + d.wear * 0.2,
          envMapIntensity: 0.95,
        }),
        shade: (d) => {
          const amber = hexRGB(d.amber);
          const dark = hexRGB(d.dark);
          const s = d.seed * 337 + 3;
          const N = d.stripes;
          return (u, v, o) => {
            // Chevrons that tile: the fold is a triangle wave with period 1/2
            // in v, and the stripe phase is an integer count in u.
            const fold = d.chevron ? tri(v * 2) * 0.5 : 0;
            const ph = frac((u + fold) * N);
            const edge = 0.012;
            const band = sstep(0.5 - edge, 0.5 + edge, ph) - sstep(1 - edge, 1, ph);
            const isAmber = band > 0.5 ? 1 : 0;
            const edgeSoft = Math.min(sstep(0, edge * 1.6, Math.abs(ph - 0.5)), sstep(0, edge * 1.6, Math.min(ph, 1 - ph)));

            /* Same correction as paintedSteel — see the long note there. The
               30-cell F2-F1 "peel" was a lattice at panel scale, and `micro`
               at 104 was carrying +-0.025 of HEIGHT on a 4.9-texel cell,
               which is a 21-degree normal on a 5-px feature: relief the mip
               chain cannot carry, so it aliases rather than shades. Height is
               now panel form plus dither; `micro` keeps its roughness job
               below, where a 5-px ripple reads as sheen. The tape edge is a
               real step and stays. */
            const form = fbm(u * 3, v * 3, 3, 3, s + 5, 3) * 0.020;
            const micro = vfbm(u * 104, v * 104, 104, 104, s + 9, 2);
            let h = 0.5 + form + (micro - 0.5) * 0.0020;
            h += (1 - edgeSoft) * 0.05 * isAmber;   // amber laid over the black

            const t = isAmber ? 1 : 0;
            let r = mixv(dark[0], amber[0], t), g = mixv(dark[1], amber[1], t), b = mixv(dark[2], amber[2], t);
            let ro = 0.34 + (1 - micro) * 0.08;
            let me = 0.03;

            // scuffing right through to bare metal on the leading edges
            const scuff = clamp01(scratches(u * 4, v * 90, 4, 90, s + 13, 0.93) * (0.5 + d.wear) +
              sstep(0.66, 1.0, fbm01(u * 9, v * 9, 9, 9, s + 17, 3)) * d.wear * 0.7);
            if (scuff > 0.01) {
              r = mixv(r, BARE[0], scuff * 0.85); g = mixv(g, BARE[1], scuff * 0.85); b = mixv(b, BARE[2], scuff * 0.85);
              ro = mixv(ro, 0.42, scuff); me = mixv(me, 0.9, scuff * 0.8); h -= scuff * 0.04;
            }
            const grime = sstep(0.5, 1.0, v) * d.wear * 0.35 * sstep(0.4, 0.85, fbm01(u * 7, v * 7, 7, 7, s + 23, 3));
            r *= 1 - grime * 0.35; g *= 1 - grime * 0.33; b *= 1 - grime * 0.28;
            ro = mixv(ro, 0.9, grime);

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = clamp01(me); o.ao = clamp01(1 - grime * 0.2);
          };
        },
      },

      /* ── painted panel carrying the wordmark ──────────────────────────── */
      brandedPanel: {
        cls: 'std', variants: 3, prio: 2, normalStrength: 1.2, dom: true,
        wrap: 'clamp',
        defaults: (p) => ({
          color: p.color || BRAND.card,
          ink: p.ink || BRAND.amber,
          /**
           * NO WORDMARK BY DEFAULT.
           *
           * This used to default to 'DRILLITY', and every one of the fifteen
           * callers takes the default — so the wordmark was being re-lettered
           * onto fourteen tools and every rig. Two rules broken at once:
           *
           *   - `DOMAIN.md` §10: the logo is artwork, not text. It is never
           *     redrawn, re-lettered in another typeface, or recoloured. The
           *     real files are `src/ui/assets/logo-*.png`; `terrain.js`
           *     composites `logo-full.png` for the site sign, which is how it
           *     is done when the mark genuinely belongs on something.
           *   - **Drillity is the marketplace, not the manufacturer.** The ten
           *     rigs carry invented marques for exactly this reason. Stamping
           *     DRILLITY on a drill bit makes it an OEM again.
           *
           * A blank painted plate with its rule line is what a data plate
           * actually looks like at this distance, and it costs nothing. Pass
           * `text` explicitly if a caller has a marque to put there — but note
           * `setKey` includes it, so each distinct string mints its own
           * texture set.
           */
          text: p.text || '',
          wear: clamp01(p.wear === undefined ? 0.22 : p.wear),
          rule: p.rule !== false,
          seed: (p.seed === undefined ? 251 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${qc(d.ink)}~${d.text}~${q2(d.wear)}~${d.rule ? 1 : 0}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.36, metal: 0.03, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.36, metalness: 0.03,
          clearcoat: 0.7 - d.wear * 0.3, clearcoatRoughness: 0.1 + d.wear * 0.2,
          envMapIntensity: 1.0,
        }),
        apply: (m, set) => {
          m.clearcoatNormalMap = set.normal;
          m.clearcoatNormalScale = new THREE.Vector2(0.3, 0.3);
        },
        shade: (d) => {
          const paint = hexRGB(d.color);
          const s = d.seed * 1039 + 7;
          return (u, v, o) => {
            // Peel lattice removed, height is panel form plus dither — see
            // paintedSteel. `micro` keeps its albedo and roughness jobs.
            const form = fbm(u * 3, v * 3, 3, 3, s + 3, 3) * 0.016;
            const micro = vfbm(u * 110, v * 110, 110, 110, s + 7, 2);
            const drift = fbm(u * 3, v * 3, 3, 3, s + 11, 3) * 0.035;
            const scuff = scratches(u * 5, v * 80, 5, 80, s + 13, 0.95) * d.wear;
            o.h = 0.5 + form + (micro - 0.5) * 0.0015 - scuff * 0.03;
            const lum = 1 + drift + (micro - 0.5) * 0.05;
            o.r = mixv(paint[0] * lum, BARE[0], scuff * 0.7);
            o.g = mixv(paint[1] * lum, BARE[1], scuff * 0.7);
            o.b = mixv(paint[2] * lum, BARE[2], scuff * 0.7);
            o.ro = clamp01(0.32 + (1 - micro) * 0.07 + scuff * 0.12);
            o.me = clamp01(0.03 + scuff * 0.7);
            o.ao = 1;
          };
        },
        /** Layout shared by the height stamp and the colour composite so the
         *  relief lands exactly under the ink. */
        layout: (n) => ({ x: n * 0.09, y: n * 0.42, h: n * 0.19 }),

        /** Stamp the wordmark into the height field: printed ink is a real,
         *  if thin, film, so the normal map gets a true edge rather than a
         *  constant tilt across the glyph interior. */
        preNormal: (set, hf, n, d) => {
          const L = KINDS.brandedPanel.layout(n);
          const mask = makeCanvas(n, n, true);
          const mc = ctx2d(mask);
          mc.clearRect(0, 0, n, n);
          if (d.rule) mc.fillStyle = '#ffffff';
          if (d.rule) mc.fillRect(L.x, L.y - L.h * 0.42, n * 0.34, Math.max(2, n * 0.014));
          if (d.text) drawWordmark(mc, String(d.text), L.x, L.y, L.h, '#ffffff', { track: 0.09, weight: 700 });
          const px = mc.getImageData(0, 0, n, n).data;
          for (let i = 0, j = 3; i < hf.length; i++, j += 4) hf[i] += (px[j] / 255) * 0.055;
        },

        overlay: (set, d) => {
          const cv = set.mapCv, n = cv.width;
          const c = ctx2d(cv, false);
          const L = KINDS.brandedPanel.layout(n);
          const txt = String(d.text || '');
          c.save();
          if (d.rule) {
            c.fillStyle = d.ink; c.globalAlpha = 0.9;
            c.fillRect(L.x, L.y - L.h * 0.42, n * 0.34, Math.max(2, n * 0.014));
          }
          c.globalAlpha = 0.94;
          if (txt) drawWordmark(c, txt, L.x, L.y, L.h, d.ink, { track: 0.09, weight: 700 });
          c.restore();

          // Fresh ink is glossier than the weathered panel around it.
          // ORM = (r: ao, g: roughness, b: metalness).
          const on = set.ormCv.width;
          const oc = ctx2d(set.ormCv, false);
          const k = on / n;
          oc.save();
          oc.scale(k, k);
          oc.globalAlpha = 0.8;
          if (d.rule) { oc.fillStyle = 'rgb(255,66,10)'; oc.fillRect(L.x, L.y - L.h * 0.42, n * 0.34, Math.max(2, n * 0.014)); }
          if (txt) drawWordmark(oc, txt, L.x, L.y, L.h, 'rgb(255,66,10)', { track: 0.09, weight: 700 });
          oc.restore();
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         THE CONCRETE FAMILY

         `concrete` above stays what it always was: a hardstanding slab, laid,
         broomed and driven over. It is the wrong surface for all three of the
         concretes the new methods need, because none of those was ever
         floated by a human being:

           castConcrete    poured down a tremie into a wet bore and shaped by
                           the ground it set against
           precastConcrete cast in a steel mould in a yard, then hit with a
                           hydraulic hammer several thousand times
           shotcrete       fired at a rock face out of a nozzle

         They differ in how the surface was FORMED, which is the only thing
         that ever makes concrete read as concrete.
         ═══════════════════════════════════════════════════════════════════ */

      /* ── a bored / CFA pile, as cast ─────────────────────────────────── */
      castConcrete: {
        // u wraps the shaft, v runs down it. Both tile: the bleed banding is
        // an integer-period term, not an authored gradient, so a 20 m pile is
        // one repeating set and not twenty.
        cls: 'std', variants: 3, prio: 3, normalStrength: 1.25,
        defaults: (p) => ({
          color: p.color || '#A8A49B',
          cure: clamp01(p.cure === undefined ? 0.75 : p.cure),
          soil: clamp01(p.soil === undefined ? 0.35 : p.soil),
          aggregate: clamp01(p.aggregate === undefined ? 0.55 : p.aggregate),
          bleed: clamp01(p.bleed === undefined ? 0.6 : p.bleed),
          seed: (p.seed === undefined ? 269 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.cure)}~${q2(d.soil)}~${q2(d.aggregate)}~${q2(d.bleed)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.80, metal: 0, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.82 - (1 - d.cure) * 0.34,
          metalness: 0.0,
          // Green concrete is still holding its mix water and reads wet.
          clearcoat: (1 - d.cure) * 0.45,
          clearcoatRoughness: 0.22 + d.cure * 0.4,
          envMapIntensity: 0.6 + (1 - d.cure) * 0.45,
        }),
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 461 + 7;
          return (u, v, o) => {
            /* THE POUR. Concrete comes up the bore around a tremie pipe, so
               the fabric is long vertical washes with a slow lateral drift —
               the record of a rising surface, not a placed one. */
            const w = warp(u * 5, v * 5, 5, 5, s + 3, 0.42, 3);
            const flow = fbm01(w.x * 0.8, w.y * 2.6, 4, 13, s + 7, 4);
            const wash = streaks(u * 6, v * 20, 6, 20, s + 11, 3, 0.30);

            /* BLEED BANDING. Mix water rises through the fresh pour and
               leaves pale laitance ribbons every half-metre or so. Built from
               a sine of integer period in v so a long shaft still tiles. */
            const bandPh = v * 9 + fbm(u * 3, v * 3, 3, 3, s + 13, 2) * 0.55;
            const band = sstep(0.30, 0.72, 0.5 + 0.5 * Math.sin(bandPh * TAU)) * d.bleed;

            // aggregate ghosting through a thin paste skin
            worley(u * 26, v * 26, 26, 26, s + 17, 0.88);
            const aggId = _W.id;
            const agg = blob(_W.f1, 0.30, 0.75) * d.aggregate * sstep(0.28, 0.74, flow);

            // air trapped against the bore wall
            worley(u * 34, v * 34, 34, 34, s + 23, 0.92);
            const air = blob(_W.f1, 0.24, 0.70) * sstep(0.40, 0.86, _W.id);

            const fines = vfbm(u * 116, v * 116, 116, 116, s + 29, 2);

            let h = 0.5 + (flow - 0.5) * 0.22 + (wash - 0.5) * 0.12 + band * 0.05
              + agg * 0.16 - air * 0.50 + (fines - 0.5) * 0.08;

            const lum = 0.86 + flow * 0.22 + (fines - 0.5) * 0.10
              + agg * (0.10 + aggId * 0.26) - air * 0.40;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;

            // laitance: paler, chalkier, and it kills the gloss
            r = mixv(r, LAITANCE[0], band * 0.50);
            g = mixv(g, LAITANCE[1], band * 0.50);
            b = mixv(b, LAITANCE[2], band * 0.46);

            // wet-to-cured: green concrete is darker and faintly olive
            const wetM = (1 - d.cure) * (0.55 + 0.45 * sstep(0.30, 0.80, flow));
            r = mixv(r, PASTE_GREEN[0], wetM * 0.60);
            g = mixv(g, PASTE_GREEN[1], wetM * 0.58);
            b = mixv(b, PASTE_GREEN[2], wetM * 0.52);

            // bore wall dragged into the skin as the concrete rose
            const sm = clamp01(d.soil * sstep(0.44, 0.86, fbm01(u * 7, v * 9, 7, 9, s + 31, 4)));
            r = mixv(r, SOIL_SMEAR[0], sm * 0.72);
            g = mixv(g, SOIL_SMEAR[1], sm * 0.70);
            b = mixv(b, SOIL_SMEAR[2], sm * 0.64);
            h -= sm * 0.06;

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(0.86 - band * 0.05 - wetM * 0.50 + air * 0.06 + sm * 0.08 - agg * 0.10);
            o.me = 0;
            o.ao = clamp01(1 - air * 0.55 - (1 - flow) * 0.12 - sm * 0.10);
          };
        },
      },

      /* ── a driven precast pile ───────────────────────────────────────── */
      precastConcrete: {
        // u wraps the pile (`faces` arrises land on integer quarters of it),
        // v runs from the HEAD at v=0 to the toe at v=1 — which is why v is
        // clamped: a pile has exactly one head and the damage lives on it.
        cls: 'std', variants: 3, prio: 2, normalStrength: 1.15,
        wrap: { s: 'repeat', t: 'clamp' },
        defaults: (p) => ({
          color: p.color || '#B0ADA6',
          faces: Math.max(3, Math.min(8, p.faces === undefined ? 4 : p.faces | 0)),
          wear: clamp01(p.wear === undefined ? 0.20 : p.wear),
          head: p.head === 'none' ? 'none' : (p.head === 'bottom' ? 'bottom' : 'top'),
          dirt: clamp01(p.dirt === undefined ? 0.30 : p.dirt),
          seed: (p.seed === undefined ? 277 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${d.faces}~${q2(d.wear)}~${d.head}~${q2(d.dirt)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.48, metal: 0, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.48, metalness: 0.0,
          // A steel mould leaves a skin with a faint sheen. It is the single
          // clearest difference between a precast pile and a cast-in-place
          // one, so it survives even at high wear — just not on the head.
          clearcoat: 0.30 - d.wear * 0.16, clearcoatRoughness: 0.30,
          envMapIntensity: 0.7,
        }),
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 599 + 13;
          const N = d.faces;
          return (u, v, o) => {
            // v is the canvas row: 0 = the top of the panel after flipY.
            const head = d.head === 'none' ? 0
              : d.head === 'bottom' ? sstep(0.84, 1.0, v) : sstep(0.16, 0.0, v);

            /* THE MOULD. Sharp arrises with a chamfer on each, and a form
               line where the mould halves meet halfway along every face.
               These are authored in uv, not thresholded out of noise: the
               chamfer is 8.5 % of a face and the fin ~1.4 % — 20 and 3 texels
               at the LOW tier — so neither can ever fall under a texel. */
            const fp = frac(u * N);
            const arris = Math.min(fp, 1 - fp) * 2;
            const cham = 1 - sstep(0.0, 0.085, arris);
            const chamEdge = 1 - sstep(0.055, 0.115, arris);
            const fin = 1 - sstep(0.006, 0.020, Math.abs(fp - 0.5));

            const skin = vfbm(u * 112, v * 112, 112, 112, s + 5, 2);
            const drift = fbm01(u * 4, v * 6, 4, 6, s + 9, 3);

            // bug holes — air trapped against a vertical mould face
            worley(u * 22, v * 30, 22, 30, s + 13, 0.92);
            const bug = blob(_W.f1, 0.26, 0.70) * sstep(0.34, 0.84, _W.id) * (1 - cham * 0.6);

            let h = 0.5 + (drift - 0.5) * 0.07 + (skin - 0.5) * 0.05 - bug * 0.55
              - cham * 0.30 + fin * 0.22;
            let lum = 0.94 + drift * 0.12 + (skin - 0.5) * 0.07 - bug * 0.35 + chamEdge * 0.05;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            let ro = 0.46 + (1 - drift) * 0.10 + bug * 0.18;
            let ao = 1 - bug * 0.55 - fin * 0.10 - cham * 0.08;

            /* THE HEAD.  A driven pile's head is not weathered, it is
               CRUSHED. Several thousand hammer blows burst the cover off in
               flakes, the aggregate stands out of the fractured paste and
               what is left is pale, sharp-edged and dusty. This is the one
               piece of pile damage the player is scored on — METHOD_IDS has
               `driven-pile` graded on set to bearing "without damaging the
               pile" — so it has to be readable at thumbnail size, which is
               why the spalls come off a 13x17 lattice (about 19 texels a cell
               at the LOW authoring size) rather than out of fine noise. */
            if (head > 0.002 && d.wear > 0.01) {
              const dmg = clamp01(head * (0.25 + d.wear * 1.65));

              worleyBlock(u * 13, v * 17, 13, 17, s + 19, 0.92);
              const flakeId = _W.id;
              const spall = blob(_W.f1, 0.40, 0.35) * clamp01((dmg - 0.20) * 2.2);

              worley(u * 30, v * 34, 30, 34, s + 23, 0.90);
              const stone = blob(_W.f1, 0.30, 0.55) * spall;
              const stoneId = _W.id;

              const crack = sstep(0.58, 0.86, ridged(u * 7, v * 9, 7, 9, s + 29, 3, 0.55)) * dmg;

              if (spall > 0.004) {
                const fl = 0.90 + flakeId * 0.20;
                r = mixv(r, FRESH_BREAK[0] * fl, spall * 0.92);
                g = mixv(g, FRESH_BREAK[1] * fl, spall * 0.92);
                b = mixv(b, FRESH_BREAK[2] * fl, spall * 0.92);
                const st = stone * 0.78;
                const sg = 0.85 + stoneId * 0.35;
                r = mixv(r, AGG_DARK[0] * sg, st);
                g = mixv(g, AGG_DARK[1] * sg, st);
                b = mixv(b, AGG_DARK[2] * sg, st);
                ro = mixv(ro, 0.90, spall);
                h -= spall * 0.42; h += stone * 0.30;
                ao = Math.min(ao, 1 - spall * 0.42 + stone * 0.14);
              }
              if (crack > 0.004) {
                const cf = 1 - crack * 0.42;
                r *= cf; g *= cf; b *= cf;
                h -= crack * 0.30; ro = mixv(ro, 0.94, crack * 0.7);
                ao = Math.min(ao, 1 - crack * 0.30);
              }
              // rust weeping out where the link steel is showing
              const weep = clamp01((dmg - 0.58) * 2.2) *
                sstep(0.50, 0.88, fbm01(u * 9, v * 11, 9, 11, s + 31, 3));
              if (weep > 0.01) {
                r = mixv(r, RUST[0], weep * 0.7); g = mixv(g, RUST[1], weep * 0.65); b = mixv(b, RUST[2], weep * 0.6);
                ro = mixv(ro, 0.94, weep);
              }
            }

            // site dirt, heavier toward the toe the pile was driven through
            const low = d.head === 'bottom' ? sstep(0.55, 0.0, v) : sstep(0.55, 1.0, v);
            const dm = clamp01(d.dirt * low * sstep(0.38, 0.82, fbm01(u * 8, v * 8, 8, 8, s + 37, 3)));
            if (dm > 0.005) {
              r = mixv(r, SOIL_SMEAR[0], dm * 0.62); g = mixv(g, SOIL_SMEAR[1], dm * 0.60); b = mixv(b, SOIL_SMEAR[2], dm * 0.54);
              ro = mixv(ro, 0.92, dm); ao = Math.min(ao, 1 - dm * 0.16);
            }

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = 0; o.ao = clamp01(ao);
          };
        },
      },

      /* ── sprayed concrete in a tunnel ────────────────────────────────── */
      shotcrete: {
        // u runs along the drive and tiles; v runs around the arch from
        // invert to invert and is clamped, because the springline over-spray
        // and the rebound piling up low down are POSITIONS on that arch.
        cls: 'ground', variants: 3, prio: 2, normalStrength: 2.2,
        wrap: { s: 'repeat', t: 'clamp' },
        defaults: (p) => ({
          color: p.color || '#9A9891',
          wet: clamp01(p.wet === undefined ? 0.35 : p.wet),
          springline: clamp01(p.springline === undefined ? 0.55 : p.springline),
          rebound: clamp01(p.rebound === undefined ? 0.5 : p.rebound),
          fibre: clamp01(p.fibre === undefined ? 0.4 : p.fibre),
          seed: (p.seed === undefined ? 283 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.wet)}~${q2(d.springline)}~${q2(d.rebound)}~${q2(d.fibre)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.84, metal: 0, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.86 - d.wet * 0.38, metalness: 0.0,
          clearcoat: d.wet * 0.55, clearcoatRoughness: 0.18 + (1 - d.wet) * 0.5,
          envMapIntensity: 0.55 + d.wet * 0.55,
        }),
        // Deliberately NOT in the weather group: this surface is inside a
        // tunnel. Its own `wet` is how fresh the spray is, not what the sky
        // is doing on the surface 200 m above it.
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 743 + 11;
          const sp = d.springline;
          return (u, v, o) => {
            // The gunner's arc lingers where the wall turns into the arch, so
            // that is where the section is thickest and lumpiest.
            const over = 1 - sstep(0.0, 0.24, Math.abs(v - sp));
            const lowWall = sstep(sp - 0.10, 1.0, v);

            // the nozzle sweep: overlapping passes, warped hard so the whorls
            // never read as a lattice while staying exactly periodic
            const w = warp(u * 4, v * 4, 4, 4, s + 3, 0.85, 3);
            const sweep = ridged(w.x * 1.5, w.y * 1.5, 6, 6, s + 7, 4, 0.55);

            // build-up: three passes of lumps, coarsest first
            let lump = 0;
            const P3 = [7, 16, 34];
            for (let i = 0; i < 3; i++) {
              const p = P3[i];
              worley(u * p, v * p, p, p, s + 41 + i * 97, 0.88);
              lump += blob(_W.f1, 0.46 - i * 0.06, 0.90) * (0.32 - i * 0.08);
            }
            lump *= 0.90 + over * 0.55;

            // rebound: aggregate that bounced off the face and stuck, which
            // is why there is more of it low down where it fell
            worleyBlock(u * 42, v * 42, 42, 42, s + 53, 0.92);
            const rebId = _W.id;
            const reb = blob(_W.f1, 0.26, 0.60) * d.rebound * (0.35 + 0.65 * lowWall);

            const skin = vfbm(u * 118, v * 118, 118, 118, s + 59, 2);

            let h = 0.5 + lump * 0.90 + (sweep - 0.5) * 0.20 + reb * 0.34 + (skin - 0.5) * 0.08;
            let lum = 0.80 + lump * 0.34 + sweep * 0.16 + (skin - 0.5) * 0.10 + reb * (0.06 + rebId * 0.18);
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            let ro = 0.90 - lump * 0.10 + reb * 0.04;
            let ao = clamp01(0.58 + lump * 0.45 - over * 0.06);

            /* Steel fibre standing proud of the surface. A real fibre is 0.5 mm
               thick, which is precisely the feature this file is not allowed
               to author: at any believable texel density it is sub-texel, and
               a sub-texel -0.45 roughness delta on a matte grey wall is the
               snow sparkle bug wearing a hard hat. So it is a low-frequency,
               wide-band field carrying a MODEST roughness lift — fibre-
               reinforced shotcrete reads as a wall with a slight glitter in
               it, not as a wall with visible wires, and that is also what it
               looks like from two metres away. */
            const fib = sstep(0.56, 0.90, streaks(u * 11, v * 11, 11, 11, s + 61, 2, 0.45)) * d.fibre;
            r += fib * 0.045; g += fib * 0.047; b += fib * 0.050;
            ro = mixv(ro, 0.62, fib * 0.55);
            h += fib * 0.05;

            // FRESH: still glossy, running, and noticeably darker
            const drip = streaks(u * 12, v * 4, 12, 4, s + 67, 3, 0.22);
            const wetM = d.wet * (0.55 + 0.45 * drip);
            r *= 1 - wetM * 0.30; g *= 1 - wetM * 0.29; b *= 1 - wetM * 0.25;
            ro = clamp01(ro - wetM * 0.52);

            // CURED: an accelerator bloom, chalky and very pale, in patches
            const bloom = (1 - d.wet) * sstep(0.52, 0.88, fbm01(u * 6, v * 6, 6, 6, s + 71, 3));
            r = mixv(r, LAITANCE[0], bloom * 0.35); g = mixv(g, LAITANCE[1], bloom * 0.34); b = mixv(b, LAITANCE[2], bloom * 0.30);
            ro = mixv(ro, 0.95, bloom * 0.6);

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = 0; o.ao = clamp01(ao);
          };
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         GROUND SUPPORT
         ═══════════════════════════════════════════════════════════════════ */

      /* ── resin cartridge and the cured annulus around a bolt ─────────── */
      resin: {
        cls: 'fine', variants: 3, prio: 3, normalStrength: 0.95, normalOut: 0.7,
        defaults: (p) => ({
          color: p.color || '#8C5A24',
          cure: clamp01(p.cure === undefined ? 0.5 : p.cure),
          // GAMEPLAY: METHOD_IDS scores `rockbolt` on "resin/grout mix + hold
          // time". A badly spun bolt leaves the catalyst in visible pale
          // streaks through the amber, so `mixed` is legible, not decorative.
          mixed: clamp01(p.mixed === undefined ? 0.8 : p.mixed),
          seed: (p.seed === undefined ? 293 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.cure)}~${q2(d.mixed)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.30, metal: 0, ao: 1 }),
        base: (d) => {
          /* NO TRANSMISSION. A resin cartridge is a translucent SOLID, not a
             lens: nothing behind it is meant to be legible through it, only
             the depth of the amber itself. Transmission bought that depth at
             a catastrophic price — three.js runs renderTransmissionPass() for
             any material with `transmission > 0` in the visible set, which
             re-renders the entire opaque list before the main pass, so the
             first cartridge the player sees at a rockbolt collar would have
             doubled the whole frame. The same trade was already taken twice:
             the `glass` prop class at terrain.js:1922 and the cab glazing at
             rigFactory.js:128 are both tinted and opacity-blended now.

             What replaces it, and why it looks the same at the size a
             cartridge actually subtends:
               - opacity carries the see-through. Wet resin is a fat amber
                 sausage you can just read the bolt through; a cured annulus
                 is solid. That is a straight lerp on `cure`, and below 1.0 it
                 goes in the blended pass — one extra sorted draw, not an
                 extra scene render.
               - the deep-amber core the attenuation used to give is baked in
                 shade() instead, where `dark` (#4A2A0C) is already mixed in
                 against the marbling. attenuationColor/attenuationDistance
                 are inert without transmission, so they are gone rather than
                 left lying as decoration.
               - ior, clearcoat and sheen stay. They are shading terms with no
                 extra pass behind them, and they are what makes wet resin
                 read wet: the specular is the whole tell. */
          const trans = 1 - d.cure;                    // 1 = fresh, 0 = set hard
          const op = 0.74 + d.cure * 0.26;             // 0.74 wet -> 1.00 cured
          const m = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.14 + d.cure * 0.46, metalness: 0.0,
            transmission: 0, thickness: 0, ior: 1.55,
            transparent: op < 0.999, opacity: op,
            clearcoat: 0.92 * (1 - d.cure * 0.78), clearcoatRoughness: 0.05 + d.cure * 0.32,
            sheen: 0.22 + trans * 0.16, sheenRoughness: 0.5, envMapIntensity: 1.15,
          });
          return m;
        },
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 811 + 19;
          const cat = hexRGB('#D8C69A');    // catalyst: pale, opaque, chalky
          const dark = hexRGB('#4A2A0C');
          return (u, v, o) => {
            /* THE MIX. Two components spun together by the bolt; where the
               spin was short they stay as marbled ribbons. A heavy domain
               warp on a LOW frequency is what makes a ribbon: the feature is
               the warped cell, so it can be as thin as it likes on screen and
               still be many texels across in the map. */
            const w = warp(u * 3, v * 3, 3, 3, s + 3, 1.55, 3);
            const marb = fbm01(w.x * 2, w.y * 2, 6, 6, s + 7, 4);
            const unmixed = (1 - d.mixed) * sstep(0.34, 0.72, marb);

            // limestone filler: the granularity that stops resin reading as
            // toffee. Cell-sized grains plus a continuous fine haze.
            worley(u * 40, v * 40, 40, 40, s + 11, 0.90);
            const grainId = _W.id;
            const grain = blob(_W.f1, 0.30, 0.85);
            const haze = vfbm(u * 108, v * 108, 108, 108, s + 13, 2);

            // gas bubbles trapped in the annulus
            worley(u * 20, v * 20, 20, 20, s + 17, 0.92);
            const bub = blob(_W.f1, 0.26, 0.55) * sstep(0.44, 0.88, _W.id);

            const h = 0.5 + grain * 0.20 + (marb - 0.5) * 0.14 - bub * 0.45 + (haze - 0.5) * 0.08;
            const lum = 0.82 + marb * 0.26 + grain * (0.08 + grainId * 0.18) + (haze - 0.5) * 0.10;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;

            // deep amber where the section is thick, pale where the catalyst
            // never went in
            r = mixv(r, dark[0], sstep(0.62, 0.18, marb) * 0.45);
            g = mixv(g, dark[1], sstep(0.62, 0.18, marb) * 0.45);
            b = mixv(b, dark[2], sstep(0.62, 0.18, marb) * 0.42);
            r = mixv(r, cat[0], unmixed * 0.85); g = mixv(g, cat[1], unmixed * 0.85); b = mixv(b, cat[2], unmixed * 0.80);

            o.h = h; o.r = r; o.g = g; o.b = b;
            // Wet resin is a wet-look gloss; cured resin is a granular matte
            // with the filler poking through it.
            o.ro = clamp01(0.10 + d.cure * 0.50 + grain * 0.16 + bub * 0.10 + unmixed * 0.12);
            o.me = 0;
            o.ao = clamp01(0.86 + grain * 0.14 - bub * 0.45);
          };
        },
      },

      /* ── hot-dip galvanised: friction bolts, plates, mesh, straps ────── */
      galvanised: {
        cls: 'std', variants: 3, prio: 3, normalStrength: 0.75, normalOut: 0.85,
        defaults: (p) => ({
          color: p.color || '#B2B9BD',
          age: clamp01(p.age === undefined ? 0.3 : p.age),
          spangle: clamp01(p.spangle === undefined ? 0.85 : p.spangle),
          seed: (p.seed === undefined ? 307 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.age)}~${q2(d.spangle)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.30, metal: 0.85, ao: 1 }),
        base: (d) => new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.26 + d.age * 0.46,
          // Weathered zinc is a carbonate FILM, not a metal, so metalness has
          // to fall with age or aged galv reads as dirty chrome.
          metalness: 0.88 - d.age * 0.56,
          envMapIntensity: 1.15 - d.age * 0.48,
        }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 877 + 23;
          return (u, v, o) => {
            /* THE SPANGLE. Zinc freezes as big flat dendritic crystals, and
               what you actually see is that each crystal is a FACET at its
               own tilt. So the height field carries a linear ramp per cell,
               oriented by the cell's own hash.

               A raw per-cell ramp would step at the cell boundary, and a
               one-texel step in a height field is a one-texel crease in the
               normal — the same failure as the old paintedSteel flake, just
               arriving through the normal map instead of the albedo. The ramp
               is therefore faded out toward the boundary by the F2-F1 edge
               distance, which is continuous, and the boundary itself is drawn
               as a groove whose width is a fixed fraction of the cell. */
            worley(u * 13, v * 13, 13, 13, s + 3, 0.86);
            const dx = _W.dx, dy = _W.dy, f1 = _W.f1, f2 = _W.f2;
            const cid = _W.id;
            const ha = ihash(_W.cx | 0, _W.cy | 0, s + 29);
            const ang = ha * TAU;
            const ax = Math.cos(ang), ay = Math.sin(ang);
            const tilt = 0.55 + ihash(_W.cx | 0, _W.cy | 0, s + 31) * 0.45;
            const inner = clamp01((f2 - f1) * 3.0);         // 0 at a boundary
            const facet = (dx * ax + dy * ay) * tilt * inner;
            const edge = 1 - clamp01((f2 - f1) * 4.0);      // 0.25 cells wide

            // dendrite feathering inside a crystal, along the facet direction
            const feather = 0.5 + 0.5 * Math.sin((dx * ax + dy * ay) * 22 +
              fbm(u * 9, v * 9, 9, 9, s + 37, 2) * 2.2);

            const micro = vfbm(u * 118, v * 118, 118, 118, s + 41, 2);

            const sp = d.spangle * (1 - d.age * 0.75);
            let h = 0.5 + facet * 0.24 * sp - edge * 0.18 + (feather - 0.5) * 0.05 * sp
              + (micro - 0.5) * 0.06;

            // Each crystal takes the light differently; that difference IS the
            // spangle, so it goes on albedo as well as on the normal.
            const lum = 0.90 + (0.10 + cid * 0.22) * sp + facet * 0.10 * sp
              + (feather - 0.5) * 0.07 * sp + (micro - 0.5) * 0.06 - edge * 0.10;
            let r = mixv(ZINC[0], base[0], 0.55) * lum;
            let g = mixv(ZINC[1], base[1], 0.55) * lum;
            let b = mixv(ZINC[2], base[2], 0.55) * lum;
            let ro = 0.22 + edge * 0.16 + (1 - feather) * 0.06 * sp;
            let me = 0.92;

            // AGE: the spangle dulls out under a carbonate film first, then
            // white rust blooms in the places that stay wet.
            const patina = d.age * (0.55 + 0.45 * fbm01(u * 5, v * 5, 5, 5, s + 43, 3));
            r = mixv(r, ZINC_DULL[0], patina * 0.85); g = mixv(g, ZINC_DULL[1], patina * 0.85); b = mixv(b, ZINC_DULL[2], patina * 0.82);
            ro = mixv(ro, 0.72, patina); me = mixv(me, 0.28, patina);

            const bloomM = clamp01((d.age - 0.45) * 2.0) *
              sstep(0.50, 0.86, fbm01(u * 11, v * 13, 11, 13, s + 47, 4));
            if (bloomM > 0.01) {
              r = mixv(r, WHITE_RUST[0], bloomM * 0.85); g = mixv(g, WHITE_RUST[1], bloomM * 0.85); b = mixv(b, WHITE_RUST[2], bloomM * 0.85);
              ro = mixv(ro, 0.94, bloomM); me = mixv(me, 0.05, bloomM);
              h += bloomM * 0.05;
            }

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = clamp01(me);
            o.ao = clamp01(1 - edge * 0.22 - bloomM * 0.10);
          };
        },
      },

      /* ── welded wire / chain-link surface support ────────────────────── */
      mesh: {
        /* THE CUTOUT KIND. `alpha: true` routes the albedo through a
           DataTexture with a hand-built, coverage-preserving mip chain — see
           §2. Two rules the shade below is written to:

             1. colour is authored in EVERY texel, openings included, so no
                filtered fetch can ever mix a transparent texel's colour into
                the wire. That is the black halo, gone by construction.
             2. the ORM is authored as if the panel were solid, because ORM
                carries no alpha and its mip chain would otherwise average the
                openings into the wire's roughness.

           Only alpha cuts, and the opening edge is a ~2.3 texel ramp so the
           0.5 crossing survives box filtering before coverage fitting even
           has to intervene. */
        cls: 'fine', variants: 3, prio: 2, normalStrength: 1.5, normalOut: 0.9,
        alpha: true, alphaTest: 0.45,
        defaults: (p) => ({
          color: p.color || '#A9AFB2',
          style: p.style === 'chain' ? 'chain' : 'weld',
          pitch: Math.max(3, Math.min(12, p.pitch === undefined ? 6 : p.pitch | 0)),
          wire: clamp(p.wire === undefined ? 0.11 : p.wire, 0.05, 0.24),
          age: clamp01(p.age === undefined ? 0.35 : p.age),
          dust: clamp01(p.dust === undefined ? 0.40 : p.dust),
          seed: (p.seed === undefined ? 311 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${d.style}~${d.pitch}~${Math.round(d.wire * 40)}~${q2(d.age)}~${q2(d.dust)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.34, metal: 0.8, ao: 1 }),
        base: (d) => {
          const m = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.30 + d.age * 0.44,
            metalness: 0.86 - d.age * 0.52,
            envMapIntensity: 1.05 - d.age * 0.35,
            side: THREE.DoubleSide,
          });
          m.alphaTest = 0.45;          // MUST match spec.alphaTest — the mip
          m.transparent = false;       // coverage is fitted at exactly this
          return m;
        },
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 953 + 29;
          const P = d.pitch, hw = d.wire;
          const chain = d.style === 'chain';
          return (u, v, o) => {
            /* Distance, in cell units, to each of the two strand families.
               Strand centres sit at frac = 0 so that everything derived from
               the lattice INDEX changes phase in the middle of an opening,
               where both profiles are zero, rather than on a wire crest. */
            const fA = frac(chain ? (u + v) * P : v * P);   // weld: along u
            const fB = frac(chain ? (u - v) * P : u * P);   // weld: along v
            const gA = Math.min(fA, 1 - fA);
            const gB = Math.min(fB, 1 - fB);
            const tA = gA / hw, tB = gB / hw;
            const tmin = Math.min(tA, tB);
            const pA = dish(Math.min(tA, 1));
            const pB = dish(Math.min(tB, 1));

            /* WHICH LAYER IS ON TOP.
               Welded mesh is welded, not woven: one layer is simply on top of
               the other everywhere. Chain-link IS woven, and each wire passes
               over and under alternately along its length — which is a cosine
               of u, continuous, and not a parity test.

               A parity test is what was here first, and it was wrong for a
               reason worth recording: `front = t1 <= t2` picks a DIFFERENT
               profile either side of every crossing, so the height jumped by
               the whole over/under ratio along the diagonals radiating from
               each knuckle. Scaling both profiles and taking the max instead
               is continuous everywhere — max of two continuous functions is
               continuous, and at a crossing both are equal. */
            const lw = chain ? 0.5 + 0.5 * Math.cos(TAU * u * P) : 1;
            const prof = Math.max(pA * (0.62 + 0.38 * lw), pB * (0.62 + 0.38 * (1 - lw)));

            const micro = vfbm(u * 116, v * 116, 116, 116, s + 5, 2);
            const h = 0.5 + prof * 0.42 + (micro - 0.5) * 0.06;

            // Zinc, dulling with age, with rust starting at the welds/knuckles
            const spangle = sstep(0.30, 0.80, valueNoise(u * 24, v * 24, 24, 24, s + 9));
            const lum = 0.78 + prof * 0.34 + spangle * 0.10 * (1 - d.age) + (micro - 0.5) * 0.07;
            let r = mixv(ZINC[0], base[0], 0.5) * lum;
            let gg = mixv(ZINC[1], base[1], 0.5) * lum;
            let b = mixv(ZINC[2], base[2], 0.5) * lum;
            let ro = 0.28 + (1 - prof) * 0.12;
            let me = 0.90;

            const patina = d.age * (0.5 + 0.5 * fbm01(u * 6, v * 6, 6, 6, s + 13, 3));
            r = mixv(r, ZINC_DULL[0], patina * 0.8); gg = mixv(gg, ZINC_DULL[1], patina * 0.8); b = mixv(b, ZINC_DULL[2], patina * 0.78);
            ro = mixv(ro, 0.74, patina); me = mixv(me, 0.30, patina);

            const rustM = clamp01((d.age - 0.5) * 2.2) *
              sstep(0.48, 0.86, fbm01(u * 9, v * 9, 9, 9, s + 17, 3));
            r = mixv(r, RUST[0], rustM * 0.8); gg = mixv(gg, RUST[1], rustM * 0.78); b = mixv(b, RUST[2], rustM * 0.72);
            ro = mixv(ro, 0.94, rustM); me = mixv(me, 0.18, rustM);

            // rock dust sitting on the upper side of every wire
            const dm = clamp01(d.dust * (0.35 + 0.65 * prof) *
              sstep(0.34, 0.80, fbm01(u * 14, v * 14, 14, 14, s + 21, 3)));
            r = mixv(r, ROCK_DUST[0], dm * 0.62); gg = mixv(gg, ROCK_DUST[1], dm * 0.60); b = mixv(b, ROCK_DUST[2], dm * 0.56);
            ro = mixv(ro, 0.95, dm); me *= 1 - dm * 0.85;

            o.h = h; o.r = r; o.g = gg; o.b = b;
            o.ro = clamp01(ro); o.me = clamp01(me);
            o.ao = clamp01(0.74 + prof * 0.30);
            // The only channel the opening touches.
            o.al = sstep(1.10, 0.86, tmin);
          };
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         UNDERGROUND AND BLASTING
         ═══════════════════════════════════════════════════════════════════ */

      /* ── a freshly blasted face, perimeter and muck pile ─────────────── */
      blastedRock: {
        /* THE HALF-BARRELS ARE THE POINT.
           A shift boss walks up to a new face and counts the half-barrels
           left on the perimeter — the remaining halves of the smooth-blasting
           holes. A round that pulled clean leaves most of them; a round that
           over-broke leaves scallops and rubble. METHOD_IDS scores
           `tunnel-jumbo` on exactly that (pull per round and overbreak), so
           `barrels` and `round` are gameplay state, and the grooves are
           authored in uv at a size that is countable at thumbnail scale
           rather than shaken out of noise at a size that is not.

           Barrels run along U (the holes were drilled parallel to the drive)
           and are spaced in V. `barrels` is an integer count, so V tiles. */
        cls: 'ground', variants: 3, prio: 2, normalStrength: 2.9,
        defaults: (p) => ({
          color: p.color || '#6E6A64',
          barrels: Math.max(0, Math.min(10, p.barrels === undefined ? 5 : p.barrels | 0)),
          round: clamp01(p.round === undefined ? 0.8 : p.round),
          dust: clamp01(p.dust === undefined ? 0.55 : p.dust),
          soot: clamp01(p.soot === undefined ? 0.35 : p.soot),
          muck: !!p.muck,
          seed: (p.seed === undefined ? 313 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${d.barrels}~${q2(d.round)}~${q2(d.dust)}~${q2(d.soot)}~${d.muck ? 1 : 0}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.88, metal: 0, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({
          color: 0xffffff, roughness: 0.88, metalness: 0.0, envMapIntensity: 0.55,
        }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 1097 + 31;
          const N = Math.max(1, d.barrels);
          const showBarrels = !d.muck && d.barrels > 0;
          const stain = hexRGB('#5E4A34');
          return (u, v, o) => {
            /* THE ROCK. Blasted rock breaks along its joints, so the fabric
               is ANGULAR at two scales — worleyBlock, not lumps — and every
               block face is a fresh, unweathered plane. */
            const wA = warp(u * 6, v * 6, 6, 6, s + 3, 0.35, 2);
            worleyBlock(wA.x, wA.y, 6, 6, s + 5, 0.94);
            const bigEdge = clamp01((_W.f2 - _W.f1) * 5.0);
            const bigTone = 0.82 + _W.id * 0.36;
            worleyBlock(u * 17, v * 17, 17, 17, s + 11, 0.94);
            const midEdge = clamp01((_W.f2 - _W.f1) * 6.5);
            const midTone = 0.88 + _W.id * 0.24;
            const rubble = ridged(u * 9, v * 9, 9, 9, s + 19, 4, 0.55);
            const grit = vfbm(u * 112, v * 112, 112, 112, s + 17, 3);

            const chaos = d.muck ? 1.45 : 1.0;
            let h = 0.5 + (rubble - 0.5) * 0.34 * chaos
              - (1 - bigEdge) * 0.26 * chaos - (1 - midEdge) * 0.16
              + (grit - 0.5) * 0.10;
            let lum = (0.70 + rubble * 0.40) * bigTone * midTone * (0.94 + grit * 0.12);
            let ro = 0.90 - rubble * 0.06;
            let ao = clamp01(0.52 + bigEdge * 0.32 + midEdge * 0.20);

            // fresh fracture is paler and cooler than a weathered joint face
            const fresh = sstep(0.35, 0.85, midEdge) * sstep(0.30, 0.80, bigEdge);
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            r = mixv(r, r * 1.10 + 0.02, fresh * 0.6);
            g = mixv(g, g * 1.11 + 0.02, fresh * 0.6);
            b = mixv(b, b * 1.14 + 0.03, fresh * 0.6);
            // the seams between blocks are old joint surfaces: iron-stained
            const seam = (1 - midEdge) * (1 - bigEdge * 0.4);
            r = mixv(r, stain[0], seam * 0.35); g = mixv(g, stain[1], seam * 0.33); b = mixv(b, stain[2], seam * 0.28);

            /* THE PERIMETER. One groove per surviving hole. Spacing is
               1/`barrels` of V, the groove is 34 % of a spacing wide (about
               17 texels at the LOW authoring size) and it is a genuine
               semicircular dish, so it holds its shape all the way down the
               mip chain and stays countable. */
            let barrel = 0, wall = 0, lip = 0, gone = 0;
            if (showBarrels) {
              const bt = v * N;
              // wrapi, not floor: at v = 1 the index would otherwise be N
              // rather than 0 and every per-hole hash would change across the
              // wrap — one wrong half-barrel on the seam, every tile.
              const bi = wrapi(Math.floor(bt), N);
              const bf = bt - Math.floor(bt);
              // did this hole survive as a half-barrel, and how far off line
              // was it collared?
              const alive = clamp01((d.round - ihash(bi, 7, s + 23)) * 4.5);
              const jit = (ihash(bi, 11, s + 29) - 0.5) * 0.16;
              const t = (bf - 0.5 - jit) / 0.17;
              const at = Math.abs(t);
              // a barrel is rarely continuous for the whole round: it fades
              // in and out along the drive
              const along = sstep(0.26, 0.64, fbm01(u * 6, bi + 0.5, 6, N, s + 31, 3));
              const live = alive * along;
              barrel = dish(Math.min(at, 1)) * live;
              wall = clamp01(dish(Math.min(at, 1)) * 1.35) * live;
              lip = sstep(0.62, 1.00, at) * (1 - sstep(1.00, 1.30, at)) * live;
              // where a hole did NOT hold, the perimeter plucked out instead
              gone = (1 - alive) * dish(Math.min(Math.abs((bf - 0.5) / 0.5), 1));
            }

            if (barrel > 0.002) {
              // the drilled wall: smooth rock, paler than the broken face,
              // carrying the transverse chatter the bit left in it
              const rifle = 0.5 + 0.5 * Math.sin(u * TAU * 34 +
                fbm(u * 5, v * 5, 5, 5, s + 37, 2) * 1.8);
              h -= barrel * 0.44;
              h += (rifle - 0.5) * 0.05 * wall;
              const bl = 1.16 + rifle * 0.06;
              r = mixv(r, r * bl + 0.030, wall * 0.85);
              g = mixv(g, g * bl + 0.030, wall * 0.85);
              b = mixv(b, b * bl + 0.032, wall * 0.85);
              ro -= wall * 0.24;
              ao = Math.min(ao, 1 - barrel * 0.46);
            }
            if (lip > 0.002) { r += lip * 0.055; g += lip * 0.055; b += lip * 0.058; h += lip * 0.10; }
            if (gone > 0.002) { h -= gone * 0.24; ao = Math.min(ao, 1 - gone * 0.20); ro += gone * 0.04; }

            /* FUME. The residue from the charge blows out of the collar and
               stains the rock around it sooty grey-black. It reads as
               "this was blasted an hour ago" more than anything else here. */
            const fume = d.soot * clamp01(barrel * 1.30 + 0.22) *
              sstep(0.38, 0.84, fbm01(u * 8, v * 8, 8, 8, s + 41, 3));
            r = mixv(r, SOOT[0], fume * 0.62); g = mixv(g, SOOT[1], fume * 0.60); b = mixv(b, SOOT[2], fume * 0.56);
            ro = mixv(ro, 0.96, fume * 0.7);

            // rock flour settling into everything, thickest in the recesses
            const dm = clamp01(d.dust * (0.40 + 0.60 * (1 - midEdge)) *
              sstep(0.24, 0.76, fbm01(u * 5, v * 5, 5, 5, s + 47, 3)));
            r = mixv(r, ROCK_DUST[0], dm * 0.60); g = mixv(g, ROCK_DUST[1], dm * 0.58); b = mixv(b, ROCK_DUST[2], dm * 0.54);
            ro = mixv(ro, 0.97, dm);

            // a muck pile has fines packed between the blocks
            if (d.muck) {
              const fines = fbm01(u * 26, v * 26, 26, 26, s + 53, 4);
              const fm = clamp01((1 - bigEdge) * 0.9) * sstep(0.30, 0.75, fines);
              r = mixv(r, ROCK_DUST[0] * 0.72, fm * 0.5); g = mixv(g, ROCK_DUST[1] * 0.72, fm * 0.5); b = mixv(b, ROCK_DUST[2] * 0.72, fm * 0.5);
              h -= fm * 0.10; ao = Math.min(ao, 1 - fm * 0.22);
            }

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = 0; o.ao = clamp01(ao);
          };
        },
      },

      /* ── charging kit: the ANFO loading hose ─────────────────────────── */
      anfoHose: {
        // u along the hose, v around it. The helical rib is periodic in both.
        cls: 'fine', variants: 2, prio: 4, normalStrength: 1.6,
        defaults: (p) => ({
          color: p.color || '#2A2C30',
          pitch: Math.max(4, Math.min(24, p.pitch === undefined ? 12 : p.pitch | 0)),
          prill: clamp01(p.prill === undefined ? 0.5 : p.prill),
          oil: clamp01(p.oil === undefined ? 0.4 : p.oil),
          wear: clamp01(p.wear === undefined ? 0.35 : p.wear),
          seed: (p.seed === undefined ? 317 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${d.pitch}~${q2(d.prill)}~${q2(d.oil)}~${q2(d.wear)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.52, metal: 0.02, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.52, metalness: 0.02,
          clearcoat: 0.30 + d.oil * 0.35, clearcoatRoughness: 0.28,
          envMapIntensity: 0.8,
        }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 1213 + 37;
          const P = d.pitch;
          return (u, v, o) => {
            // the extruded helical rib — `frac(u*P + v)` is exactly periodic
            // in u (P is an integer) and in v (one turn per wrap)
            const hx = frac(u * P + v);
            const rib = dish(Math.min(Math.abs(hx - 0.5) / 0.30, 1));
            const bore = vfbm(u * 110, v * 110, 110, 110, s + 5, 2);

            let h = 0.5 + rib * 0.40 + (bore - 0.5) * 0.07;
            let lum = 0.84 + rib * 0.26 + (bore - 0.5) * 0.08;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            let ro = 0.56 - rib * 0.10;

            /* ANFO is 94 % ammonium nitrate prill and 6 % fuel oil, and a
               loading hose carries the evidence of both: pale prill dust
               caught in the rib valleys, and an oily sheen where the diesel
               has wet the plastic. */
            worley(u * 28, v * 28, 28, 28, s + 11, 0.90);
            const pd = blob(_W.f1, 0.26, 0.8) * sstep(0.34, 0.82, _W.id);
            const haze = vfbm(u * 104, v * 104, 104, 104, s + 13, 2);
            const prillM = clamp01(d.prill * ((1 - rib) * 0.75 + 0.25) * (pd * 0.8 + haze * 0.35));
            r = mixv(r, PRILL[0], prillM * 0.80); g = mixv(g, PRILL[1], prillM * 0.78); b = mixv(b, PRILL[2], prillM * 0.72);
            ro = mixv(ro, 0.93, prillM);
            h += pd * 0.10 * d.prill;

            const film = sstep(0.40, 0.80, fbm01(u * 7, v * 7, 7, 7, s + 17, 3)) * d.oil;
            r *= 1 - film * 0.24; g *= 1 - film * 0.22; b *= 1 - film * 0.16;
            ro = clamp01(ro - film * 0.34);

            // rib crowns scuffed pale by being dragged down the hole
            const scuff = clamp01(d.wear * rib * sstep(0.42, 0.86, fbm01(u * 13, v * 5, 13, 5, s + 19, 3)));
            r += scuff * 0.10; g += scuff * 0.10; b += scuff * 0.10;
            ro = mixv(ro, 0.80, scuff);

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = 0.02;
            o.ao = clamp01(0.78 + rib * 0.26);
          };
        },
      },

      /* ── charging kit: detonating cord ───────────────────────────────── */
      detCord: {
        /* Signal red-orange, NOT BRAND.amber — the brand colour is reserved
           for hazard chevrons and CTAs (see safetyStripe), and a length of
           det cord lying on the floor must not read as a UI element. */
        cls: 'fine', variants: 2, prio: 4, normalStrength: 1.15,
        defaults: (p) => ({
          color: p.color || '#C4341C',
          twist: Math.max(8, Math.min(40, p.twist === undefined ? 20 : p.twist | 0)),
          dirt: clamp01(p.dirt === undefined ? 0.35 : p.dirt),
          seed: (p.seed === undefined ? 331 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${d.twist}~${q2(d.dirt)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.34, metal: 0, ao: 1 }),
        base: () => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.34, metalness: 0.0,
          clearcoat: 0.6, clearcoatRoughness: 0.18, envMapIntensity: 0.9,
        }),
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 1327 + 41;
          const P = d.twist;
          const trace = hexRGB('#F0E6D2');
          return (u, v, o) => {
            // The core is a spun yarn under an extruded plastic overcoat, so
            // the twist shows as a SOFT modulation, not as visible strands.
            const a = frac(u * P + v);
            const b2 = frac(u * P - v);
            const ridgeA = dish(Math.min(Math.abs(a - 0.5) / 0.42, 1));
            const ridgeB = dish(Math.min(Math.abs(b2 - 0.5) / 0.42, 1));
            const yarn = Math.max(ridgeA, ridgeB * 0.7);
            const skin = vfbm(u * 106, v * 106, 106, 106, s + 5, 2);

            let h = 0.5 + yarn * 0.22 + (skin - 0.5) * 0.06;
            const lum = 0.88 + yarn * 0.18 + (skin - 0.5) * 0.07;
            let r = base[0] * lum, g = base[1] * lum, bb = base[2] * lum;

            // the moulded tracer line running the length of the cord
            const tr = 1 - sstep(0.010, 0.026, Math.abs(frac(v + 0.25) - 0.5));
            r = mixv(r, trace[0], tr * 0.85); g = mixv(g, trace[1], tr * 0.85); bb = mixv(bb, trace[2], tr * 0.82);
            h += tr * 0.08;

            // floor grit picked up off the invert
            const dm = clamp01(d.dirt * sstep(0.42, 0.86, fbm01(u * 9, v * 9, 9, 9, s + 11, 3)) * (1 - yarn * 0.4));
            r = mixv(r, ROCK_DUST[0], dm * 0.55); g = mixv(g, ROCK_DUST[1], dm * 0.53); bb = mixv(bb, ROCK_DUST[2], dm * 0.50);

            o.h = h; o.r = r; o.g = g; o.b = bb;
            o.ro = clamp01(0.30 + (1 - yarn) * 0.10 + dm * 0.45);
            o.me = 0;
            o.ao = clamp01(0.84 + yarn * 0.18);
          };
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         SAMPLING AND EXPLORATION
         ═══════════════════════════════════════════════════════════════════ */

      /* ── woven polypropylene sample bag ──────────────────────────────── */
      sampleBag: {
        // u wraps the sack and tiles; v runs top to bottom and is clamped,
        // because a bag has one mouth, one base and one printed panel.
        cls: 'std', variants: 3, prio: 3, normalStrength: 1.6, dom: true,
        wrap: { s: 'repeat', t: 'clamp' },
        defaults: (p) => ({
          color: p.color || '#DCD8CC',
          ink: p.ink || '#1A2128',
          text: p.text === undefined ? 'SAMPLE' : String(p.text),
          sub: p.sub === undefined ? 'RC CHIP TRAY' : String(p.sub),
          fill: clamp01(p.fill === undefined ? 0.7 : p.fill),
          dust: clamp01(p.dust === undefined ? 0.55 : p.dust),
          // Forced EVEN: the over/under parity is `(iu + iv) & 1`, and an odd
          // tape count flips that parity across the wrap — a one-tape seam
          // running the full height of the sack.
          weave: Math.max(12, Math.min(48, (p.weave === undefined ? 26 : p.weave | 0) & ~1)),
          seed: (p.seed === undefined ? 337 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${qc(d.ink)}~${d.text}~${d.sub}~${q2(d.fill)}~${q2(d.dust)}~${d.weave}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.82, metal: 0, ao: 1 }),
        base: () => {
          const m = new THREE.MeshPhysicalMaterial({
            color: 0xffffff, roughness: 0.82, metalness: 0.0,
            sheen: 0.5, sheenRoughness: 0.55, envMapIntensity: 0.6,
          });
          // Polypropylene tape has a real fibre sheen; without it woven PP
          // reads as paper.
          m.sheenColor.set('#D9D2C2');
          return m;
        },
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 1451 + 43;
          const W = d.weave;
          return (u, v, o) => {
            /* THE WEAVE. Flat PP tapes, plain over-under. Each tape is a whole
               cell of the lattice — at 26 tapes across a 256 map that is ~10
               texels a tape, and nothing here is sub-texel.

               The over-under is a COSINE, not a parity test on the tape index.
               A parity test flips at the cell boundary, which is mid-gap for
               one family but the middle of a tape for the other, so the tape
               that is running THROUGH the boundary would step in height right
               where it is most visible. `cos(pi (u+v) W)` is +1 on the
               crossings where the warp is over, -1 where the weft is, and is
               continuous in between — which is also what a real plain weave
               does, because a tape rises and falls along its own length. */
            const fu = frac(u * W), fv = frac(v * W);
            const gu = Math.min(fu, 1 - fu), gv = Math.min(fv, 1 - fv);
            const pw = dish(Math.min(gu / 0.42, 1));     // warp, running in v
            const pf = dish(Math.min(gv / 0.42, 1));     // weft, running in u
            const lw = 0.5 + 0.5 * Math.cos(Math.PI * (u + v) * W);
            const tape = Math.max(pw * (0.58 + 0.42 * lw), pf * (0.58 + 0.42 * (1 - lw)));
            const gap = Math.min(1, Math.min(gu, gv) / 0.46);

            /* SLUMP. A full bag sags into soft folds; an empty one is all
               sharp creases. Both come from the same warped ridge field with
               the sharpness carried by the ridge exponent, not a threshold. */
            // The warp advances by its OWN period per wrap (3 in u, 4 in v),
            // so the rescale into the ridge lattice has to be an exact ratio
            // of periods or the fold field stops tiling: 3 x 4/3 = 4,
            // 4 x 7/4 = 7. Freehand multipliers here are how seams get in.
            const wq = warp(u * 3, v * 4, 3, 4, s + 3, 0.75, 3);
            const fold = ridged(wq.x * (4 / 3), wq.y * (7 / 4), 4, 7, s + 7, 3, 0.5);
            const creaseAmt = lerp(0.34, 0.16, d.fill);

            let h = 0.5 + tape * 0.30 + (fold - 0.5) * creaseAmt;
            let lum = 0.84 + tape * 0.24 + fold * 0.16;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            let ro = 0.80 - tape * 0.08;
            let ao = clamp01(0.68 + tape * 0.30 - (1 - gap) * 0.06 + fold * 0.10);

            // rock flour driven into the weave — heaviest in the interstices
            // and in the bottom of every fold
            const dm = clamp01(d.dust * (0.35 + 0.65 * (1 - tape)) *
              sstep(0.26, 0.78, fbm01(u * 8, v * 8, 8, 8, s + 11, 4)) *
              (0.55 + 0.45 * (1 - fold)));
            r = mixv(r, ROCK_DUST[0], dm * 0.72); g = mixv(g, ROCK_DUST[1], dm * 0.70); b = mixv(b, ROCK_DUST[2], dm * 0.66);
            ro = mixv(ro, 0.96, dm);

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = 0; o.ao = ao;
          };
        },
        layout: (n) => ({ x: n * 0.14, y: n * 0.34, h: n * 0.13, w: n * 0.72 }),
        /** Screen print sits ON the weave, so it goes into the height field
         *  as a thin film rather than being painted flat over the relief. */
        preNormal: (set, hf, n, d) => {
          const L = KINDS.sampleBag.layout(n);
          const mask = makeCanvas(n, n, true);
          const mc = ctx2d(mask);
          mc.clearRect(0, 0, n, n);
          mc.strokeStyle = '#ffffff';
          mc.lineWidth = Math.max(2, n * 0.010);
          mc.strokeRect(L.x, L.y - L.h * 0.55, L.w, L.h * 2.35);
          mc.fillStyle = '#ffffff';
          mc.font = `800 ${L.h}px ${BRAND.fontSans}`;
          mc.textBaseline = 'top';
          mc.fillText(String(d.text || 'SAMPLE'), L.x + L.h * 0.35, L.y);
          mc.font = `600 ${L.h * 0.52}px ${BRAND.fontMono}`;
          mc.fillText(String(d.sub || ''), L.x + L.h * 0.35, L.y + L.h * 1.20);
          const px = mc.getImageData(0, 0, n, n).data;
          for (let i = 0, j = 3; i < hf.length; i++, j += 4) hf[i] += (px[j] / 255) * 0.035;
        },
        overlay: (set, d) => {
          const cv = set.mapCv;
          if (!cv) return;
          const n = cv.width;
          const c = ctx2d(cv, false);
          const L = KINDS.sampleBag.layout(n);
          c.save();
          // Print on a sack is never solid: the weave shows straight through
          // it, which is what alpha buys here.
          c.globalAlpha = 0.80;
          c.strokeStyle = d.ink;
          c.lineWidth = Math.max(2, n * 0.010);
          c.strokeRect(L.x, L.y - L.h * 0.55, L.w, L.h * 2.35);
          c.fillStyle = d.ink;
          c.font = `800 ${L.h}px ${BRAND.fontSans}`;
          c.textBaseline = 'top';
          c.fillText(String(d.text || 'SAMPLE'), L.x + L.h * 0.35, L.y);
          c.globalAlpha = 0.66;
          c.font = `600 ${L.h * 0.52}px ${BRAND.fontMono}`;
          c.fillText(String(d.sub || ''), L.x + L.h * 0.35, L.y + L.h * 1.20);
          c.restore();
        },
      },

      /* ── the moulded core tray a driller fills ───────────────────────── */
      coreTray: {
        cls: 'std', variants: 2, prio: 4, normalStrength: 1.0,
        defaults: (p) => ({
          color: p.color || '#2E3236',
          chalk: clamp01(p.chalk === undefined ? 0.35 : p.chalk),
          mud: clamp01(p.mud === undefined ? 0.45 : p.mud),
          wear: clamp01(p.wear === undefined ? 0.4 : p.wear),
          seed: (p.seed === undefined ? 347 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.chalk)}~${q2(d.mud)}~${q2(d.wear)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.62, metal: 0, ao: 1 }),
        base: (d) => new THREE.MeshPhysicalMaterial({
          color: 0xffffff, roughness: 0.62 + d.chalk * 0.22, metalness: 0.0,
          clearcoat: 0.18 * (1 - d.chalk), clearcoatRoughness: 0.55,
          envMapIntensity: 0.6,
        }),
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 1567 + 47;
          const chalkC = hexRGB('#8E9295');
          const mudC = hexRGB('#4E4234');
          return (u, v, o) => {
            // injection-mould texture: a fine spark-eroded pebble, plus the
            // faint flow lines that radiate from the gate
            worley(u * 62, v * 62, 62, 62, s + 3, 0.90);
            const cell = clamp01((_W.f2 - _W.f1) * 4.2);
            const micro = vfbm(u * 120, v * 120, 120, 120, s + 7, 2);
            const flow = streaks(u * 5, v * 22, 5, 22, s + 11, 3, 0.25);

            let h = 0.5 + (cell - 0.5) * 0.22 + (micro - 0.5) * 0.07 + (flow - 0.5) * 0.06;
            let lum = 0.94 + cell * 0.12 + (micro - 0.5) * 0.06 + (flow - 0.5) * 0.05;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            let ro = 0.64 - cell * 0.06;

            // UV chalking: a tray lives in the sun on a rack for years and
            // the polymer goes matte and pale where the light reaches it
            const ch = clamp01(d.chalk * sstep(0.32, 0.80, fbm01(u * 4, v * 5, 4, 5, s + 13, 3)));
            r = mixv(r, chalkC[0], ch * 0.62); g = mixv(g, chalkC[1], ch * 0.60); b = mixv(b, chalkC[2], ch * 0.58);
            ro = mixv(ro, 0.92, ch);

            // core drag: the stick is slid in along the row, which polishes a
            // bright track and leaves the mud in the corners
            const drag = sstep(0.52, 0.86, streaks(u * 2, v * 34, 2, 34, s + 17, 3, 0.18)) * d.wear;
            r += drag * 0.07; g += drag * 0.07; b += drag * 0.07;
            ro = mixv(ro, 0.34, drag * 0.7);
            h -= drag * 0.05;

            const mm = clamp01(d.mud * (1 - cell * 0.5) *
              sstep(0.36, 0.84, fbm01(u * 9, v * 11, 9, 11, s + 19, 4)));
            r = mixv(r, mudC[0], mm * 0.78); g = mixv(g, mudC[1], mm * 0.76); b = mixv(b, mudC[2], mm * 0.70);
            ro = mixv(ro, 0.94, mm); h += mm * 0.05;

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = 0;
            o.ao = clamp01(0.86 + cell * 0.16 - mm * 0.14);
          };
        },
      },

      /* ── the painted steel of an RC cyclone ──────────────────────────── */
      cyclone: {
        /* Two faces of the same vessel, and they could not be less alike.
           OUTSIDE it is a painted pressure part caked in sample dust; INSIDE
           the cone the sample stream has been spiralling past at 30 m/s with
           rock chips in it for a thousand hours, and there is no paint left —
           only bright, grooved, work-hardened steel, worst at the top of the
           cone where the velocity is highest. `wear` is how far that has got,
           and METHOD_IDS scores `rc` on sample integrity, so a worn-through
           cyclone is a thing the player should be able to SEE. */
        cls: 'std', variants: 3, prio: 3, normalStrength: 1.3,
        wrap: { s: 'repeat', t: 'clamp' },
        defaults: (p) => ({
          color: p.color || '#C8811F',
          inside: !!p.inside,
          wear: clamp01(p.wear === undefined ? 0.45 : p.wear),
          dust: clamp01(p.dust === undefined ? 0.5 : p.dust),
          seed: (p.seed === undefined ? 349 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${d.inside ? 1 : 0}~${q2(d.wear)}~${q2(d.dust)}~${d.seed & 3}`,
        fallback: (d) => (d.inside
          ? { albedo: hexRGB('#9EA4A9'), rough: 0.30, metal: 0.92, ao: 1 }
          : { albedo: hexRGB(d.color), rough: 0.48, metal: 0.08, ao: 1 }),
        base: (d) => (d.inside
          ? new THREE.MeshStandardMaterial({
            color: 0xffffff, roughness: 0.28, metalness: 0.92, envMapIntensity: 1.2,
          })
          : new THREE.MeshPhysicalMaterial({
            color: 0xffffff, roughness: 0.46, metalness: 0.08,
            clearcoat: 0.5 - d.wear * 0.25, clearcoatRoughness: 0.16 + d.wear * 0.22,
            envMapIntensity: 0.95,
          })),
        wet: true,
        shade: (d) => {
          const paint = hexRGB(d.color);
          const s = d.seed * 1613 + 53;
          const steelC = hexRGB('#A6ACB2');
          const bright = hexRGB('#CBD2D8');
          const heat = hexRGB('#6E6478');
          if (d.inside) {
            return (u, v, o) => {
              // v = 0 at the cone's inlet, 1 at the spigot. The sample is
              // fastest at the top, so that is where the wall is eaten.
              const vel = sstep(0.95, 0.05, v);
              const cut = clamp01(d.wear * (0.35 + vel * 1.25));

              // the sample stream spirals: erosion grooves follow it
              const hx = frac(u * 1 + v * 2.5);
              const spiral = 0.5 + 0.5 * Math.sin(hx * TAU * 7 +
                fbm(u * 4, v * 4, 4, 4, s + 5, 2) * 2.4);
              const wash = streaks(u * 9, v * 26, 9, 26, s + 9, 3, 0.28);
              const micro = vfbm(u * 114, v * 114, 114, 114, s + 13, 2);

              // pitting where the chips hit hardest
              worley(u * 30, v * 34, 30, 34, s + 17, 0.92);
              const pit = blob(_W.f1, 0.24, 0.6) * sstep(0.40, 0.86, _W.id) * cut;

              const h = 0.5 - (spiral - 0.5) * 0.26 * cut + (wash - 0.5) * 0.12
                + (micro - 0.5) * 0.06 - pit * 0.5;
              const lum = 0.90 + spiral * 0.20 * cut + wash * 0.10 + (micro - 0.5) * 0.07 - pit * 0.35;
              let r = steelC[0] * lum, g = steelC[1] * lum, b = steelC[2] * lum;
              // polished bright where the stream actually runs
              r = mixv(r, bright[0], cut * spiral * 0.7);
              g = mixv(g, bright[1], cut * spiral * 0.7);
              b = mixv(b, bright[2], cut * spiral * 0.7);
              // work-hardened, faintly heat-tinted in the fastest band
              const ht = clamp01((cut - 0.55) * 2.0) * vel;
              r = mixv(r, heat[0], ht * 0.30); g = mixv(g, heat[1], ht * 0.28); b = mixv(b, heat[2], ht * 0.34);
              // paint still clinging on below the wear front
              const skin = clamp01(1 - cut * 1.6);
              r = mixv(r, paint[0] * 0.85, skin * 0.75); g = mixv(g, paint[1] * 0.85, skin * 0.75); b = mixv(b, paint[2] * 0.85, skin * 0.75);

              o.h = h; o.r = r; o.g = g; o.b = b;
              o.ro = clamp01(0.42 - cut * spiral * 0.22 + pit * 0.30 + skin * 0.14);
              o.me = clamp01(0.94 - skin * 0.80 - pit * 0.20);
              o.ao = clamp01(1 - pit * 0.5 - (1 - wash) * 0.08);
            };
          }
          return (u, v, o) => {
            const low = sstep(0.35, 1.0, v);
            // Peel lattice removed, height is panel form plus dither — see
            // paintedSteel. This is the OUTSIDE of the cyclone: it is painted
            // pressure vessel, and it had the same 30-cell weave as the rest
            // of the fleet. The INSIDE branch above is scoured steel, where a
            // cell field is what the surface genuinely is, and is untouched.
            const form = fbm(u * 3, v * 3, 3, 3, s + 3, 3) * 0.016;
            const micro = vfbm(u * 108, v * 108, 108, 108, s + 7, 2);
            const drift = fbm(u * 4, v * 4, 4, 4, s + 11, 3) * 0.045;

            let h = 0.5 + form + (micro - 0.5) * 0.0014;
            let r = paint[0] * (1 + drift), g = paint[1] * (1 + drift), b = paint[2] * (1 + drift);
            let ro = 0.44 + (1 - micro) * 0.08;
            let me = 0.06;
            let ao = 1;

            // paint knocked off around the clamp bands and the spigot.
            // Warped and gated per cell for the same reason as paintedSteel:
            // an ungated Worley puts a chip in EVERY cell of a 24-cell grid,
            // which is a checkerboard rather than damage.
            const cw = warp(u * 24, v * 24, 24, 24, s + 15, 0.55, 2);
            worleyBlock(cw.x, cw.y, 24, 24, s + 17, 0.92);
            const chip = blob(_W.f1, 0.28, 0.55) *
              clamp01((d.wear * (0.4 + low * 0.9) * (0.55 + _W.id * 0.9) - 0.22) * 2.4);
            if (chip > 0.005) {
              // Softer than paintedSteel's identical term (which ramps at 3.2)
              // because this is a `std` set at half the hero authoring size,
              // so the same edge would land on half as many texels.
              const deep = clamp01((chip - 0.58) * 1.8);
              r = mixv(r, PRIMER[0], chip); g = mixv(g, PRIMER[1], chip); b = mixv(b, PRIMER[2], chip);
              r = mixv(r, EXPOSED[0], deep); g = mixv(g, EXPOSED[1], deep); b = mixv(b, EXPOSED[2], deep);
              ro = mixv(ro, 0.62, chip); me = mixv(me, 0.7, deep);
              h -= chip * 0.03; ao = 1 - chip * 0.16;
            }
            // sample dust caked on, thickest around the outlet
            const dm = clamp01(d.dust * (0.30 + 0.70 * low) *
              sstep(0.28, 0.80, fbm01(u * 7, v * 9, 7, 9, s + 23, 4)));
            r = mixv(r, ROCK_DUST[0], dm * 0.80); g = mixv(g, ROCK_DUST[1], dm * 0.78); b = mixv(b, ROCK_DUST[2], dm * 0.72);
            ro = mixv(ro, 0.96, dm); me *= 1 - dm * 0.9;
            h += dm * 0.04; ao = Math.min(ao, 1 - dm * 0.18);

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = clamp01(me); o.ao = clamp01(ao);
          };
        },
      },

      /* ═══════════════════════════════════════════════════════════════════
         TIMBER — pile caps, cribbing, lagging, core boxes, packing
         ═══════════════════════════════════════════════════════════════════ */
      timber: {
        cls: 'std', variants: 3, prio: 3, normalStrength: 1.8,
        defaults: (p) => ({
          color: p.color || '#A9835A',
          age: clamp01(p.age === undefined ? 0.45 : p.age),
          wear: clamp01(p.wear === undefined ? 0.3 : p.wear),
          rings: Math.max(3, Math.min(24, p.rings === undefined ? 9 : p.rings | 0)),
          knots: clamp01(p.knots === undefined ? 0.6 : p.knots),
          mud: clamp01(p.mud === undefined ? 0.3 : p.mud),
          seed: (p.seed === undefined ? 353 : p.seed) | 0,
        }),
        setKey: (d) => `${qc(d.color)}~${q2(d.age)}~${q2(d.wear)}~${d.rings}~${q2(d.knots)}~${q2(d.mud)}~${d.seed & 3}`,
        fallback: (d) => ({ albedo: hexRGB(d.color), rough: 0.86, metal: 0, ao: 1 }),
        base: () => new THREE.MeshStandardMaterial({
          color: 0xffffff, roughness: 0.86, metalness: 0.0, envMapIntensity: 0.5,
        }),
        wet: true,
        shade: (d) => {
          const base = hexRGB(d.color);
          const s = d.seed * 1721 + 59;
          const late = hexRGB('#6B4B2C');    // dense latewood band
          const silver = hexRGB('#918C82');  // weathered surface
          const mudC = hexRGB('#4A3B2A');
          const R = d.rings;
          return (u, v, o) => {
            /* CATHEDRAL FIGURE. A flat-sawn board cuts the growth rings at a
               shallow angle, so the rings arrive on the face as nested arches.
               A hard domain warp on a coordinate that is mostly V, run through
               a triangle wave, is exactly that shape — and every part of it is
               low-frequency, so the figure is never smaller than the warp cell
               that made it. */
            const w = warp(u * 3, v * 3, 3, 3, s + 3, 1.25, 3);
            // tri() has period 1, and the warp advances by 3 per wrap, so both
            // coefficients are thirds — R rings down the board, one arch
            // across it, and no seam on either axis.
            const ring = tri(w.y * (R / 3) + w.x * (1 / 3));
            const lateM = sstep(0.52, 0.88, ring);      // band 0.36

            // the fibre itself: long, strongly anisotropic, along U
            const fibre = ridged(u * 3, v * 46, 3, 46, s + 7, 3, 0.55);
            const grainFine = vfbm(u * 6, v * 110, 6, 110, s + 11, 2);

            // circular-saw marks: shallow arcs cut across the grain. Period 22
            // in v and one full arc per wrap in u, so both axes still tile.
            const saw = 0.5 + 0.5 * Math.sin((v * 22 + Math.sin(u * TAU) * 1.2) * TAU);

            let h = 0.5 + (fibre - 0.5) * 0.26 + lateM * 0.10
              + (grainFine - 0.5) * 0.08 + (saw - 0.5) * 0.06;
            let lum = 0.86 + fibre * 0.22 + (grainFine - 0.5) * 0.10;
            let r = base[0] * lum, g = base[1] * lum, b = base[2] * lum;
            r = mixv(r, late[0], lateM * 0.55); g = mixv(g, late[1], lateM * 0.52); b = mixv(b, late[2], lateM * 0.48);
            let ro = 0.86 - fibre * 0.06;
            let ao = clamp01(0.82 + fibre * 0.20);

            /* KNOTS. A branch's rings run at right angles to the board's, so
               a knot is a bullseye — and the Worley cell gives both its
               centre and its radius for free. */
            worley(u * 5, v * 7, 5, 7, s + 17, 0.92);
            const kd = _W.f1, kid = _W.id;
            const knot = blob(kd, 0.30, 0.55) * clamp01((d.knots - kid) * 3.0);
            if (knot > 0.004) {
              const kr = tri(kd * 11);
              const kl = 0.52 + kr * 0.26;
              r = mixv(r, late[0] * kl * 1.5, knot * 0.9);
              g = mixv(g, late[1] * kl * 1.5, knot * 0.9);
              b = mixv(b, late[2] * kl * 1.5, knot * 0.9);
              h += knot * 0.10 - blob(kd, 0.09, 0.9) * 0.22;   // the pith dips
              ro = mixv(ro, 0.68, knot * 0.6);
              ao = Math.min(ao, 1 - knot * 0.18);
            }

            /* CHECKS. Drying splits open ALONG the grain. A wide band on a
               low-frequency ridged field: the crack's width is set by the
               ridge, never by the threshold, so it is always several texels. */
            const check = sstep(0.56, 0.86, ridged(u * 2, v * 26, 2, 26, s + 23, 3, 0.5)) *
              (0.35 + d.age * 0.9);
            if (check > 0.004) {
              const cf = 1 - check * 0.55;
              r *= cf; g *= cf; b *= cf;
              h -= check * 0.42; ao = Math.min(ao, 1 - check * 0.40);
              ro = mixv(ro, 0.95, check);
            }

            /* WEATHERING. Timber left outside goes silver-grey and the soft
               earlywood erodes away, leaving the latewood standing proud —
               which is why old boards feel ridged and new ones do not. */
            const ag = d.age * (0.55 + 0.45 * fbm01(u * 5, v * 5, 5, 5, s + 29, 3));
            r = mixv(r, silver[0], ag * 0.72); g = mixv(g, silver[1], ag * 0.70); b = mixv(b, silver[2], ag * 0.66);
            h += (lateM - 0.4) * 0.16 * ag;
            ro = mixv(ro, 0.95, ag);

            // bruising: crushed, dirty fibre where it has been hammered
            const bruise = clamp01(d.wear * sstep(0.48, 0.88, fbm01(u * 7, v * 9, 7, 9, s + 31, 4)));
            r *= 1 - bruise * 0.26; g *= 1 - bruise * 0.25; b *= 1 - bruise * 0.22;
            h -= bruise * 0.08; ro = mixv(ro, 0.96, bruise);

            const mm = clamp01(d.mud * sstep(0.42, 0.88, fbm01(u * 6, v * 8, 6, 8, s + 37, 4)));
            r = mixv(r, mudC[0], mm * 0.70); g = mixv(g, mudC[1], mm * 0.68); b = mixv(b, mudC[2], mm * 0.62);
            ro = mixv(ro, 0.96, mm);

            o.h = h; o.r = r; o.g = g; o.b = b;
            o.ro = clamp01(ro); o.me = 0; o.ao = clamp01(ao - mm * 0.12);
          };
        },
      },
    };

    /* ── paintedDark — the same painted steel, in chassis grey ──────────────
       `blender/lib/rig.py` has named this material `paintedDark` since the
       pipeline was written, for "chassis, frames, guarding". assets.js had no
       such kind, so `resolve()` fell through to its `rawSteel` default and
       every frame, track guard and walkway on every Blender machine rendered
       as BRIGHT BARE METAL where the real machine is dark paint. Fleet-wide,
       and invisible except for one warning line per model in the console.

       It is derived from `paintedSteel` rather than written afresh because
       that is what it physically IS: the same rolled steel, the same panel
       mapping, the same dirt gradient down the lower half, the same flake — a
       different albedo. 134 lines of authored surface behaviour that would
       otherwise be copied and then drift.

       Two deliberate differences from bodywork:
         - `wear` is higher. The undercarriage is where the machine touches the
           ground; it is chipped and mud-caked long before the bonnet is.
         - `variants` is halved. Chassis is seen at a distance and in shadow,
           and the texture budget (55 MB HIGH against a ~90 MB cap) is better
           spent on the parts the player looks at. */
    KINDS.paintedDark = {
      ...KINDS.paintedSteel,
      cls: 'plant', prio: 3, variants: 2,
      defaults: (p) => ({
        ...KINDS.paintedSteel.defaults(p),
        color: BRAND.plantDark,
        wear: 0.46,
      }),
    };

    /* ── generic map application ───────────────────────────────────────── */
    function applySet(kind, spec, mat, set, d) {
      const rep = d && d.repeat;
      let map = set.map, nrm = set.normal, orm = set.orm;
      if (rep) {
        const rx = Array.isArray(rep) ? rep[0] : rep;
        const ry = Array.isArray(rep) ? (rep[1] === undefined ? rep[0] : rep[1]) : rep;
        if (rx !== 1 || ry !== 1) {
          map = cloneForRepeat(map, rx, ry);
          nrm = cloneForRepeat(nrm, rx, ry);
          orm = cloneForRepeat(orm, rx, ry);
        }
      }
      mat.map = map;
      mat.normalMap = nrm;
      mat.normalScale = new THREE.Vector2(
        spec.normalOut === undefined ? 1 : spec.normalOut,
        spec.normalOut === undefined ? 1 : spec.normalOut);
      mat.roughnessMap = orm;
      mat.metalnessMap = orm;
      mat.aoMap = orm;
      mat.aoMapIntensity = 0.8;
      if (spec.apply) spec.apply(mat, { map, normal: nrm, orm }, d);
      mat.userData.assetSet = set;
      mat.userData.assetKind = kind;
    }

    /* ── texSet / material ─────────────────────────────────────────────── */

    function resolveKind(kind) {
      const spec = KINDS[kind];
      if (spec) return { kind, spec };
      if (!warned.has(kind)) {
        warned.add(kind);
        // drillCore has no baked set of its own by design, so texSet() cannot
        // serve it. Say so rather than silently handing back rawSteel maps.
        console.warn(kind === 'drillCore'
          ? '[assets] drillCore has no standalone texture set — it rides the stratum '
            + 'pattern sets. Use material(\'drillCore\', …) or assets.drillCore(…), '
            + 'or texSet on its pattern.'
          : `[assets] unknown material kind "${kind}" — substituting rawSteel`);
      }
      return { kind: 'rawSteel', spec: KINDS.rawSteel };
    }

    function getSet(kind, params) {
      const { kind: k, spec } = resolveKind(kind);
      const d = spec.defaults(params || {});
      const fb = spec.fallback(d);
      const set = acquireSet(k, spec.setKey(d), {
        cls: spec.cls, variants: spec.variants, prio: spec.prio,
        seed: (d.seed || 0) + hashStr(k),
        fallback: fb,
        shade: spec.shade(d),
        normalStrength: spec.normalStrength,
        wrap: spec.wrap || null,
        dom: !!spec.dom,
        alpha: !!spec.alpha,
        alphaTest: spec.alphaTest || 0.45,
        tag: fb.albedo,
        overlay: spec.overlay ? (st) => spec.overlay(st, d) : null,
        preNormal: spec.preNormal ? (st, hf, n) => spec.preNormal(st, hf, n, d) : null,
      });
      return { k, spec, d, set, fb };
    }

    function texSet(kind, params = {}) {
      const { set } = getSet(kind, params);
      return {
        map: set.map, normalMap: set.normal,
        roughnessMap: set.orm, metalnessMap: set.orm, aoMap: set.orm,
        resolution: set.res, ready: set.ready,
      };
    }

    function material(kind, params = {}) {
      /* `drillCore` is a kind by name and by contract — other modules ask for
         it through material() like anything else — but it is not a baked set:
         its lithology comes out of the stratum machinery, so it routes to the
         function that owns that rather than through the KIND TABLE. */
      if (kind === 'drillCore') return drillCore(params);

      const ck = key(kind, params);
      const hit = allMaterials.get(ck);
      if (hit) return hit;

      const { k, spec, d, set, fb } = getSet(kind, params);
      const mat = spec.base(d);
      mat.name = `drillity:${k}`;
      applySet(k, spec, mat, set, d);

      // If a variant was reused rather than baked, recover the colour
      // difference through material.color — free, and keeps the fidelity.
      if (set.tag && fb.albedo) {
        const t = set.tag, w = fb.albedo;
        const dr = t[0] > 0.02 ? w[0] / t[0] : 1;
        const dg = t[1] > 0.02 ? w[1] / t[1] : 1;
        const db = t[2] > 0.02 ? w[2] / t[2] : 1;
        if (Math.abs(dr - 1) > 0.02 || Math.abs(dg - 1) > 0.02 || Math.abs(db - 1) > 0.02) {
          mat.color.setRGB(
            clamp(dr, 0.25, 2.0), clamp(dg, 0.25, 2.0), clamp(db, 0.25, 2.0),
            THREE.LinearSRGBColorSpace);
        }
      }
      if (params.tint) mat.color.multiply(new THREE.Color(params.tint));
      if (params.side !== undefined) mat.side = params.side;
      if (params.transparent !== undefined) mat.transparent = params.transparent;
      if (params.opacity !== undefined) { mat.opacity = params.opacity; mat.transparent = mat.transparent || params.opacity < 1; }
      /* TRANSMISSION IS A PARAMETER, NOT SOMETHING A CALLER REACHES IN AND
         SETS AFTERWARDS.  three.js collects every material with
         `transmission > 0` onto a separate list and runs
         renderTransmissionPass() for it, which re-renders the WHOLE opaque
         list into a transmission target before the main pass. One such
         material anywhere in the visible set therefore doubles the scene's
         draw calls — that is what a single cab window was doing to the rig
         band. Both earlier fixes (rigFactory.js:128 for cab glazing,
         terrain.js:2197 for truck windows) had to assign `m.transmission = 0`
         after the call because there was no way to say it here. There is now:
         a caller that wants a tinted, opacity-blended pane asks for
         `{ transmission: 0, opacity: 0.34 }` and gets it in one call.
         It participates in the cache key like every other param — key() is
         `kind + '|' + stable(params)` — so a transmissive and a
         non-transmissive request can never collide on one material. */
      if (params.transmission !== undefined && 'transmission' in mat) {
        mat.transmission = params.transmission;
        if (params.transmission > 0) mat.transparent = true;
      }
      if (params.envMapIntensity !== undefined) mat.envMapIntensity = params.envMapIntensity;
      if (params.normalScale !== undefined && mat.normalScale) mat.normalScale.setScalar(params.normalScale);

      if (spec.wet) {
        mat.userData.baseRoughness = mat.roughness;
        wetGroup.add(mat);
      }
      allMaterials.set(ck, mat);
      return mat;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       DATA TEXTURES
       ═══════════════════════════════════════════════════════════════════════ */

    function noiseTexture(opts = {}) {
      const o = {
        size: opts.size || 128,
        type: opts.type || 'fbm',
        octaves: opts.octaves || 4,
        period: Math.max(1, (opts.period || 8) | 0),
        seed: (opts.seed === undefined ? 1 : opts.seed) | 0,
        gain: opts.gain === undefined ? 0.5 : opts.gain,
        channels: opts.channels === 4 ? 4 : (opts.channels === 1 ? 1 : 4),
        pack: opts.pack || 'mono',
        wrap: opts.wrap || 'repeat',
      };
      const ck = 'noise|' + stable(o);
      const hit = dataTexCache.get(ck);
      if (hit) return hit;

      const n = o.size, P = o.period, S = o.seed;
      const one = o.channels === 1;
      const data = new Uint8Array(n * n * (one ? 1 : 4));
      const inv = 1 / n;
      const sample = (x, y, seed) => {
        switch (o.type) {
          case 'value': return valueNoise(x, y, P, P, seed);
          case 'gradient': return gradNoise(x, y, P, P, seed) * 0.5 + 0.5;
          case 'ridged': return ridged(x, y, P, P, seed, o.octaves, o.gain);
          case 'worley': { worley(x, y, P, P, seed, 0.9); return clamp01(_W.f1); }
          case 'worleyEdge': { worley(x, y, P, P, seed, 0.9); return clamp01((_W.f2 - _W.f1) * 2); }
          default: return fbm01(x, y, P, P, seed, o.octaves, o.gain);
        }
      };
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const u = x * inv * P, v = y * inv * P;
          const a = sample(u, v, S) * 255;
          if (one) { data[y * n + x] = a; continue; }
          const i = (y * n + x) * 4;
          if (o.pack === 'multi') {
            data[i] = a;
            data[i + 1] = sample(u, v, S + 7717) * 255;
            data[i + 2] = sample(u, v, S + 15013) * 255;
            data[i + 3] = valueNoise(u * 2, v * 2, P * 2, P * 2, S + 991) * 255;
          } else {
            data[i] = data[i + 1] = data[i + 2] = a;
            data[i + 3] = 255;
          }
        }
      }
      const tex = new THREE.DataTexture(data, n, n,
        one ? THREE.RedFormat : THREE.RGBAFormat, THREE.UnsignedByteType);
      if (one) tex.unpackAlignment = 1;
      tex.colorSpace = THREE.NoColorSpace;
      tex.wrapS = tex.wrapT = o.wrap === 'clamp' ? THREE.ClampToEdgeWrapping :
        o.wrap === 'mirror' ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = 1;
      tex.needsUpdate = true;
      tex.userData.bytes = texBytes(n, n) / (one ? 4 : 1);
      tex.userData.pool = 'general';
      ledger.bytes += tex.userData.bytes;
      pools.general.used += tex.userData.bytes;
      allTextures.add(tex);
      dataTexCache.set(ck, tex);
      return tex;
    }

    function gradientTexture(stops, opts = {}) {
      const o = {
        size: opts.size || 256,
        vertical: !!opts.vertical,
        linear: !!opts.linear,
        srgb: opts.srgb !== false,
        wrap: opts.wrap || 'clamp',
        alpha: opts.alpha,
      };
      const norm = normStops(stops);
      const ck = 'grad|' + stable(o) + '|' + norm.map((s) => s.t.toFixed(4) + s.c).join(';');
      const hit = dataTexCache.get(ck);
      if (hit) return hit;

      const n = Math.max(2, o.size);
      const data = new Uint8Array(n * 4);
      const cols = norm.map((s) => hexRGB(s.c));
      const toLin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
      const toSrgb = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        let k = 0;
        while (k < norm.length - 2 && norm[k + 1].t < t) k++;
        const a = norm[k], b = norm[Math.min(k + 1, norm.length - 1)];
        const span = (b.t - a.t) || 1;
        const f = clamp01((t - a.t) / span);
        const ca = cols[k], cb = cols[Math.min(k + 1, cols.length - 1)];
        let r, g, bl;
        if (o.linear) {
          r = toSrgb(mixv(toLin(ca[0]), toLin(cb[0]), f));
          g = toSrgb(mixv(toLin(ca[1]), toLin(cb[1]), f));
          bl = toSrgb(mixv(toLin(ca[2]), toLin(cb[2]), f));
        } else {
          r = mixv(ca[0], cb[0], f); g = mixv(ca[1], cb[1], f); bl = mixv(ca[2], cb[2], f);
        }
        const al = a.a === undefined && b.a === undefined
          ? (o.alpha === undefined ? 1 : o.alpha)
          : mixv(a.a === undefined ? 1 : a.a, b.a === undefined ? 1 : b.a, f);
        const idx = i * 4;
        data[idx] = clamp01(r) * 255;
        data[idx + 1] = clamp01(g) * 255;
        data[idx + 2] = clamp01(bl) * 255;
        data[idx + 3] = clamp01(al) * 255;
      }
      const w = o.vertical ? 1 : n, h = o.vertical ? n : 1;
      const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
      tex.colorSpace = o.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      tex.wrapS = tex.wrapT = o.wrap === 'repeat' ? THREE.RepeatWrapping :
        o.wrap === 'mirror' ? THREE.MirroredRepeatWrapping : THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      tex.userData.bytes = w * h * 4;
      tex.userData.pool = 'general';
      ledger.bytes += tex.userData.bytes;
      pools.general.used += tex.userData.bytes;
      allTextures.add(tex);
      dataTexCache.set(ck, tex);
      return tex;
    }

    function normStops(stops) {
      if (!stops || !stops.length) return [{ t: 0, c: '#000000' }, { t: 1, c: '#ffffff' }];
      const out = stops.map((s, i) => {
        if (typeof s === 'string' || typeof s === 'number') return { t: i / Math.max(1, stops.length - 1), c: s };
        if (Array.isArray(s)) return { t: Number(s[0]) || 0, c: s[1], a: s[2] };
        return { t: s.t === undefined ? i / Math.max(1, stops.length - 1) : s.t, c: s.color || s.c || '#000', a: s.a };
      });
      out.sort((a, b) => a.t - b.t);
      if (out.length === 1) out.push({ t: 1, c: out[0].c, a: out[0].a });
      return out;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       DECALS
       ═══════════════════════════════════════════════════════════════════════ */

    function decalSize(long, ratio) {
      let L = Math.min(long, AUTHOR);
      let guard = 0;
      const avail = poolAvailable('general');
      while (guard++ < 5 && L > 64) {
        const need = texBytes(L, Math.round(L * ratio));
        if (need <= avail) break;
        L >>= 1;
      }
      return [L, Math.max(8, Math.round(L * ratio))];
    }

    function finishDecal(cv, ck) {
      const t = newTexture(cv, { srgb: true, wrap: 'clamp' });
      t.premultiplyAlpha = false;
      decalCache.set(ck, t);
      return t;
    }

    function decal(kind, params = {}) {
      const ck = key('decal:' + kind, params);
      const hit = decalCache.get(ck);
      if (hit) return hit;

      const amber = params.color || BRAND.amber;
      const dark = params.dark || '#0F1319';

      switch (kind) {
        case 'wordmark': {
          // Draws whatever text it is GIVEN — an invented marque, a size, a
          // thread designation. It must never default to the Drillity
          // wordmark: that is artwork (§10), not something to set in a canvas
          // font. With no text there is nothing to draw.
          if (!params.text) return null;
          const [w, h] = decalSize(params.size || 1024, 0.25);
          const cv = makeCanvas(w, h, true);
          const c = ctx2d(cv);
          c.clearRect(0, 0, w, h);
          drawWordmark(c, String(params.text), w * 0.04, h * 0.24, h * 0.54, amber, { track: params.track });
          return finishDecal(cv, ck);
        }
        /*
         * There is deliberately NO `logo` decal.
         *
         * This case used to draw "a drill crown seen head-on: hex body, six
         * carbide buttons, amber ring" — an invented roundel, and exactly the
         * thing `DOMAIN.md` §10 forbids by name: *"do not invent a drill-bit
         * roundel"*. The Drillity logo is a WORDMARK, and the real artwork is
         * bundled at `src/ui/assets/logo-{full,small,wordmark}.png`.
         *
         * If you need the mark on a surface, composite the PNG the way
         * `world/terrain.js` `texSign()` does. Do not draw a substitute here,
         * and do not re-letter the wordmark in a canvas font — the letterforms
         * are artwork, not a typeface we own.
         */
        case 'hazard': {
          const [w, h] = decalSize(params.size || 512, params.ratio || 0.25);
          const cv = makeCanvas(w, h);
          const c = ctx2d(cv);
          const n = Math.max(2, params.stripes || 8);
          c.fillStyle = dark; c.fillRect(0, 0, w, h);
          c.fillStyle = BRAND.amber;                       // brand rule: exact
          const p = w / n;
          c.save(); c.beginPath(); c.rect(0, 0, w, h); c.clip();
          for (let i = -1; i <= n + 1; i++) {
            c.beginPath();
            c.moveTo(i * p, 0); c.lineTo(i * p + p * 0.5, 0);
            c.lineTo(i * p + p * 0.5 - h, h); c.lineTo(i * p - h, h);
            c.closePath(); c.fill();
          }
          c.restore();
          return finishDecal(cv, ck);
        }
        case 'plate': {
          const [w, h] = decalSize(params.size || 512, params.ratio || 0.62);
          const cv = makeCanvas(w, h, true);
          const c = ctx2d(cv);
          const rows = params.rows || [
            ['MODEL', params.model || 'DR-140 CRAWLER'],
            ['SERIAL', params.serial || 'DRL-0041-EU'],
            ['POWER', params.power || '129 kW'],
            ['MASS', params.mass || '14 200 kg'],
            ['YEAR', params.year || '2026'],
          ];
          c.fillStyle = params.plate || '#2A2E34';
          c.fillRect(0, 0, w, h);
          c.strokeStyle = '#5A616B'; c.lineWidth = Math.max(1, w * 0.006);
          c.strokeRect(w * 0.03, h * 0.05, w * 0.94, h * 0.9);
          const th = h * 0.1;
          // The maker's name, supplied by the caller — a rig's invented marque
          // (Nordvik, Steinbach, Bergholt…). NOT 'DRILLITY': a data plate
          // names the manufacturer, and Drillity is the marketplace.
          if (params.maker) {
            drawWordmark(c, String(params.maker), w * 0.07, h * 0.12, th * 1.15, BRAND.amber, { track: 0.08 });
          }
          c.font = `600 ${th * 0.72}px ${BRAND.fontMono}`;
          c.textBaseline = 'top';
          let y = h * 0.34;
          for (const [k2, v2] of rows) {
            c.fillStyle = '#8E97A3'; c.fillText(String(k2), w * 0.07, y);
            c.fillStyle = '#E7EAEE'; c.fillText(String(v2), w * 0.42, y);
            y += th * 1.18;
          }
          return finishDecal(cv, ck);
        }
        case 'warning': {
          const [w] = decalSize(params.size || 512, 1);
          const cv = makeCanvas(w, w);
          const c = ctx2d(cv);
          c.clearRect(0, 0, w, w);
          const m = w * 0.08;
          c.fillStyle = BRAND.amber;
          c.beginPath();
          c.moveTo(w / 2, m); c.lineTo(w - m, w - m); c.lineTo(m, w - m); c.closePath(); c.fill();
          c.fillStyle = dark;
          c.beginPath();
          c.moveTo(w / 2, m + w * 0.09); c.lineTo(w - m - w * 0.075, w - m - w * 0.05);
          c.lineTo(m + w * 0.075, w - m - w * 0.05); c.closePath(); c.fill();
          c.fillStyle = BRAND.amber;
          c.fillRect(w * 0.465, w * 0.36, w * 0.07, w * 0.27);
          c.beginPath(); c.arc(w * 0.5, w * 0.71, w * 0.045, 0, TAU); c.fill();
          return finishDecal(cv, ck);
        }
        case 'arrow': {
          const [w, h] = decalSize(params.size || 512, params.ratio || 0.5);
          const cv = makeCanvas(w, h);
          const c = ctx2d(cv);
          c.clearRect(0, 0, w, h);
          c.fillStyle = amber;
          c.beginPath();
          c.moveTo(w * 0.06, h * 0.34); c.lineTo(w * 0.58, h * 0.34); c.lineTo(w * 0.58, h * 0.12);
          c.lineTo(w * 0.96, h * 0.5); c.lineTo(w * 0.58, h * 0.88); c.lineTo(w * 0.58, h * 0.66);
          c.lineTo(w * 0.06, h * 0.66); c.closePath(); c.fill();
          return finishDecal(cv, ck);
        }
        case 'text':
        default: {
          const txt = String(params.text === undefined ? '' : params.text);
          const [w, h] = decalSize(params.size || 512, params.ratio || 0.3);
          const cv = makeCanvas(w, h, true);
          const c = ctx2d(cv);
          c.clearRect(0, 0, w, h);
          if (params.bg) { c.fillStyle = params.bg; c.fillRect(0, 0, w, h); }
          c.fillStyle = params.color || BRAND.fg;
          c.font = `${params.weight || 700} ${h * (params.scale || 0.6)}px ${params.mono ? BRAND.fontMono : BRAND.fontSans}`;
          c.textBaseline = 'middle';
          c.textAlign = params.align || 'left';
          const tx = params.align === 'center' ? w / 2 : params.align === 'right' ? w * 0.96 : w * 0.04;
          c.fillText(txt, tx, h * 0.52);
          return finishDecal(cv, ck);
        }
      }
    }

    /* ═══════════════════════════════════════════════════════════════════════
       STRATA
       ═══════════════════════════════════════════════════════════════════════ */

    /** Neutral, LINEAR-space detail sets. Mean luminance sits at 0.5 so the
     *  shader can use `lum * 2` as a multiplier centred on 1.0 — which is why
     *  one set can serve every layer that shares a pattern. */
    const PATTERNS = {
      clay: { normalStrength: 0.7, rough: 0.72, shade: (s) => (u, v, o) => {
        // The warp must be authored in the SAME lattice the field is sampled
        // in: advancing u by 1 has to advance the sample coordinate by exactly
        // one declared period, or the result stops tiling.
        const w = warp(u * 4, v * 16, 4, 16, s + 3, 0.35, 3);
        const band = fbm01(w.x, w.y, 4, 16, s + 7, 4);
        const smear = streaks(u * 3, v * 22, 3, 22, s + 11, 3, 0.2);
        const crack = clamp01(1 - (worleyBlock(u * 14, v * 14, 14, 14, s + 17, 0.95), (_W.f2 - _W.f1)) * 9);
        const g = 0.46 + band * 0.20 + (smear - 0.5) * 0.10 - crack * 0.16;
        o.h = 0.5 + (band - 0.5) * 0.22 + (smear - 0.5) * 0.08 - crack * 0.30;
        o.r = o.g = o.b = clamp01(g);
        o.ro = clamp01(0.78 - band * 0.16 + crack * 0.08);
        o.me = 0; o.ao = clamp01(1 - crack * 0.35);
      } },
      sand: { normalStrength: 1.5, rough: 0.9, shade: (s) => (u, v, o) => {
        const grain = vfbm(u * 132, v * 132, 132, 132, s + 3, 2);
        const coarse = sstep(0.56, 0.90, valueNoise(u * 80, v * 80, 80, 80, s + 7));
        const beds = fbm01(u * 2, v * 14, 2, 14, s + 11, 3);
        const g = 0.42 + grain * 0.20 + coarse * 0.12 + (beds - 0.5) * 0.12;
        o.h = 0.5 + (grain - 0.5) * 0.26 + coarse * 0.22 + (beds - 0.5) * 0.14;
        o.r = o.g = o.b = clamp01(g);
        o.ro = clamp01(0.92 - coarse * 0.10);
        o.me = 0; o.ao = clamp01(0.86 + coarse * 0.14 - (1 - grain) * 0.1);
      } },
      gravel: { normalStrength: 2.4, rough: 0.86, shade: (s) => (u, v, o) => {
        const wA = warp(u * 15, v * 15, 15, 15, s + 3, 0.3, 2);
        worley(wA.x, wA.y, 15, 15, s + 5, 0.9);
        const dBig = clamp01(1 - _W.f1 * 2.0), idBig = _W.id;
        worley(u * 38, v * 38, 38, 38, s + 11, 0.92);
        const dSm = clamp01(1 - _W.f1 * 2.5), idSm = _W.id;
        const matrix = vfbm(u * 118, v * 118, 118, 118, s + 17, 3);
        const big = dBig > 0.06;
        const dome = big ? dBig : dSm * 0.72;
        const id = big ? idBig : idSm;
        const g = 0.30 + dome * 0.42 + id * 0.16 + (matrix - 0.5) * 0.08;
        o.h = 0.5 + dome * 0.44 + (matrix - 0.5) * 0.10;
        o.r = o.g = o.b = clamp01(g);
        o.ro = clamp01(0.90 - dome * 0.18);
        o.me = 0; o.ao = clamp01(0.50 + dome * 0.52);
      } },
      till: { normalStrength: 2.0, rough: 0.88, shade: (s) => (u, v, o) => {
        // poorly sorted: rare big clasts floating in a fine matrix
        const wA = warp(u * 8, v * 8, 8, 8, s + 3, 0.35, 2);
        worley(wA.x, wA.y, 8, 8, s + 5, 0.92);
        const boulder = clamp01(1 - _W.f1 * 2.2) * sstep(0.55, 0.85, _W.id);
        worley(u * 26, v * 26, 26, 26, s + 11, 0.9);
        const stone = clamp01(1 - _W.f1 * 2.6) * sstep(0.30, 0.7, _W.id);
        const matrix = fbm01(u * 30, v * 30, 30, 30, s + 17, 4);
        const fines = vfbm(u * 128, v * 128, 128, 128, s + 19, 2);
        const dome = Math.max(boulder, stone * 0.7);
        const g = 0.38 + dome * 0.34 + matrix * 0.16 + (fines - 0.5) * 0.10;
        o.h = 0.5 + dome * 0.40 + (matrix - 0.5) * 0.18 + (fines - 0.5) * 0.06;
        o.r = o.g = o.b = clamp01(g);
        o.ro = clamp01(0.90 - dome * 0.14);
        o.me = 0; o.ao = clamp01(0.58 + dome * 0.42 - (1 - matrix) * 0.1);
      } },
      sedimentary: { normalStrength: 1.1, rough: 0.76, shade: (s) => (u, v, o) => {
        // fine laminations; the crisp bedding planes are added in the shader
        const und = fbm(u * 3, v * 1, 3, 1, s + 3, 2) * 0.09;
        const lam = fbm01(u * 2, (v + und) * 26, 2, 26, s + 7, 4);
        const grit = vfbm(u * 134, v * 134, 134, 134, s + 11, 2);
        const nodule = clamp01(1 - (worley(u * 18, v * 9, 18, 9, s + 13, 0.9), _W.f1) * 3.4) *
          sstep(0.72, 0.95, _W.id);
        const g = 0.40 + lam * 0.24 + (grit - 0.5) * 0.10 + nodule * 0.18;
        o.h = 0.5 + (lam - 0.5) * 0.32 + (grit - 0.5) * 0.08 + nodule * 0.22;
        o.r = o.g = o.b = clamp01(g);
        o.ro = clamp01(0.80 - lam * 0.12 - nodule * 0.12);
        o.me = 0; o.ao = clamp01(0.80 + lam * 0.2 - nodule * 0.05);
      } },
      crystalline: { normalStrength: 1.3, rough: 0.62, shade: (s) => (u, v, o) => {
        // interlocking grain mosaic — granite / gneiss. Three feldspar tones.
        const w = warp(u * 20, v * 20, 20, 20, s + 3, 0.22, 2);
        worley(w.x, w.y, 20, 20, s + 5, 0.95);
        const edge = clamp01((_W.f2 - _W.f1) * 5.5);
        const id = _W.id;
        const tone = id < 0.42 ? 0.62 : id < 0.78 ? 0.50 : 0.30;   // quartz / feldspar / mafic
        worley(u * 52, v * 52, 52, 52, s + 11, 0.95);
        const sub = clamp01((_W.f2 - _W.f1) * 6);
        // The cross-section's version of the paintedSteel flake bug: a 0.10
        // band at 150 cycles, +0.34 on a greyscale albedo, roughness down half
        // a unit and metalness up to 0.25 - single-texel mirror-bright white
        // specks over the largest surface in the frame. Mica in granite is a
        // glint on a cleavage plane, not a starfield.
        const mica = sstep(0.58, 0.93, valueNoise(u * 88, v * 88, 88, 88, s + 17));
        const g = tone * (0.86 + sub * 0.22) + edge * 0.06 + mica * 0.13;
        o.h = 0.5 + (edge - 0.5) * 0.20 + (sub - 0.5) * 0.10 + mica * 0.07;
        o.r = o.g = o.b = clamp01(g);
        o.ro = clamp01(0.72 - mica * 0.20 - (id > 0.78 ? 0.1 : 0) + (1 - edge) * 0.08);
        o.me = mica * 0.10;
        o.ao = clamp01(0.82 + edge * 0.18);
      } },
      fractured: { normalStrength: 2.2, rough: 0.8, shade: (s) => (u, v, o) => {
        // blocky joints with dark infill and slickenside sheen on the faces
        worleyBlock(u * 10, v * 10, 10, 10, s + 3, 0.95);
        const seamA = clamp01(1 - (_W.f2 - _W.f1) * 7);
        const blockTone = 0.40 + _W.id * 0.26;
        worleyBlock(u * 24, v * 24, 24, 24, s + 11, 0.95);
        const seamB = clamp01(1 - (_W.f2 - _W.f1) * 9) * 0.6;
        const rough2 = fbm01(u * 40, v * 40, 40, 40, s + 17, 3);
        const seam = Math.max(seamA, seamB);
        const g = blockTone * (0.9 + rough2 * 0.22) * (1 - seam * 0.62);
        o.h = 0.5 + (rough2 - 0.5) * 0.20 - seam * 0.40;
        o.r = o.g = o.b = clamp01(g);
        o.ro = clamp01(0.82 + seam * 0.12 - rough2 * 0.10);
        o.me = 0; o.ao = clamp01(0.90 - seam * 0.55);
      } },
      void: { normalStrength: 0.6, rough: 0.5, shade: (s) => (u, v, o) => {
        const damp = fbm01(u * 7, v * 7, 7, 7, s + 3, 3);
        const drip = streaks(u * 26, v * 3, 26, 3, s + 7, 3, 0.15);
        const g = 0.14 + damp * 0.14 + drip * 0.10;
        o.h = 0.5 + (damp - 0.5) * 0.18 + (drip - 0.5) * 0.08;
        o.r = o.g = o.b = clamp01(g);
        o.ro = clamp01(0.62 - drip * 0.34);
        o.me = 0; o.ao = clamp01(0.5 + damp * 0.4);
      } },
    };

    /** Per-pattern uniform feature weights: [bedding, joints, mica, grain,
     *  clast, contrast, bedCount, undulation, jointFreq]. */
    const PATTERN_FEAT = {
      clay:        { bed: 0.30, joint: 0.00, mica: 0.00, grain: 0.10, clast: 0.05, contrast: 0.70, bedN: 5, und: 0.030, jf: 6 },
      sand:        { bed: 0.20, joint: 0.00, mica: 0.05, grain: 0.85, clast: 0.10, contrast: 0.85, bedN: 7, und: 0.045, jf: 6 },
      gravel:      { bed: 0.12, joint: 0.00, mica: 0.00, grain: 0.35, clast: 0.85, contrast: 1.00, bedN: 4, und: 0.060, jf: 6 },
      till:        { bed: 0.10, joint: 0.05, mica: 0.00, grain: 0.45, clast: 0.75, contrast: 0.95, bedN: 3, und: 0.070, jf: 6 },
      sedimentary: { bed: 1.00, joint: 0.06, mica: 0.05, grain: 0.15, clast: 0.10, contrast: 0.80, bedN: 11, und: 0.022, jf: 7 },
      crystalline: { bed: 0.05, joint: 0.22, mica: 0.85, grain: 0.20, clast: 0.25, contrast: 0.95, bedN: 3, und: 0.090, jf: 5 },
      fractured:   { bed: 0.18, joint: 1.00, mica: 0.18, grain: 0.20, clast: 0.35, contrast: 0.95, bedN: 5, und: 0.080, jf: 8 },
      void:        { bed: 0.00, joint: 0.00, mica: 0.00, grain: 0.00, clast: 0.00, contrast: 0.55, bedN: 2, und: 0.010, jf: 4 },
    };

    function patternSet(pattern) {
      const p = PATTERNS[pattern] ? pattern : 'sedimentary';
      const def = PATTERNS[p];
      const s = hashStr('strat:' + p) & 0xffff;
      return acquireSet('stratum', p, {
        cls: 'stratum', variants: 16, prio: 1, seed: s,
        fallback: { albedo: [0.5, 0.5, 0.5], rough: def.rough, metal: 0, ao: 1 },
        shade: def.shade(s),
        normalStrength: def.normalStrength,
        linearAlbedo: true,          // detail is a multiplier, not a colour
        tag: [0.5, 0.5, 0.5],
      });
    }

    /* ═══════════════════════════════════════════════════════════════════════
       TWO COLOUR SETS, AND WHICH ONE A CALLER WANTS
       ───────────────────────────────────────────────────────────────────────

       contract.js publishes the ground palette twice, and they are NOT
       interchangeable:

       • `GROUND[id].colors` — ALBEDOS, solved against the CROSS-SECTION's own
         lighting and its grade. That solve is where the ΔE and ΔL* guarantees
         between neighbouring beds live, and it is why sand's albedo is
         #FFD3AE. Read as a colour they are meaningless; read as reflectances
         under one specific, dim, section-only light they are exact. They sit
         roughly 1.35 stops above the rock the player actually sees.

       • `GROUND_DISPLAY[id]` / `groundSwatch(id)` — the MEASURED framebuffer
         values, grade included. This is what the rock looks like.

       This function used to feed the first set straight into uColTop/uColBot
       on an ordinary MeshStandardMaterial. Inside the section band that is
       right. Anywhere else — a tunnel wall, a muck pile, a core stick lying in
       a tray under the surface key light — it is 1.35 stops of free exposure
       and the rock renders blown.

       So `space` now decides, and it defaults to the general case:

         'lit'     (DEFAULT) an albedo that reproduces the DISPLAYED rock under
                   ordinary scene lighting. Use this for anything in the world.
         'section' the raw authored albedos. Use this ONLY inside the section's
                   own lighting rig, where the solve applies.

       'lit' does not simply substitute the display colour, because that would
       throw away the bed's internal gradient — which is the other half of the
       bug this function was carrying. GROUND_DISPLAY has one value per bed;
       the authored pair has two, differing by about 1.6 L* plus a chroma and
       temperature drift that is deliberate. So the LEVEL and HUE are taken
       from the measured display value and the SHAPE of the gradient from the
       authored pair, as a per-channel ratio about its own mean, in linear
       light. A bed keeps its gradient; it just stops being over-exposed.

       For an id that is not in GROUND_DISPLAY — a caller-invented lithology,
       a blend, a tunnel agent's own colours — there is nothing measured to
       retarget onto, so the pair is scaled by the stated 1.35-stop offset
       instead. That is an approximation and it is documented as one: the real
       ratio runs from about 0.25 on basalt to 0.80 on sand because the grade
       crushes shadows harder than highlights.
       ═══════════════════════════════════════════════════════════════════════ */

    /** The measured offset between an authored section albedo and the rock the
     *  player sees, applied in LINEAR light. Fallback only. */
    const SECTION_TO_LIT = Math.pow(2, -1.35);

    const _linCache = new Map();
    function linOf(hex) {
      const k = String(hex);
      let v = _linCache.get(k);
      if (!v) {
        const s = hexRGB(k);
        v = [srgbToLinear(s[0]), srgbToLinear(s[1]), srgbToLinear(s[2])];
        _linCache.set(k, v);
      }
      return v;
    }
    const hexOfLin = (l) => rgbHex([
      clamp01(linearToSrgb(Math.max(0, l[0]))),
      clamp01(linearToSrgb(Math.max(0, l[1]))),
      clamp01(linearToSrgb(Math.max(0, l[2]))),
    ]);

    /**
     * Both colour sets for a stratum, as sRGB hex pairs.
     * @returns {{ section: [string,string], lit: [string,string],
     *             display: string, measured: boolean }}
     */
    function stratumColors(idOrStratum, colorsIn) {
      const st = (idOrStratum && typeof idOrStratum === 'object') ? idOrStratum : { id: idOrStratum };
      const id = st.id || 'rock';
      const g = GROUND[id];
      const section = (Array.isArray(colorsIn || st.colors) && (colorsIn || st.colors).length >= 2)
        ? (colorsIn || st.colors).slice(0, 2)
        : (g && g.colors ? g.colors.slice(0, 2) : ['#8A8078', '#635B55']);

      const a0 = linOf(section[0]);
      const a1 = linOf(section[1]);
      const mid = [(a0[0] + a1[0]) * 0.5, (a0[1] + a1[1]) * 0.5, (a0[2] + a1[2]) * 0.5];

      const measured = !!GROUND_DISPLAY[id];
      const target = measured
        ? linOf(GROUND_DISPLAY[id])
        : [mid[0] * SECTION_TO_LIT, mid[1] * SECTION_TO_LIT, mid[2] * SECTION_TO_LIT];

      // per-channel ratio about the pair's own mean: level and hue from the
      // target, gradient shape (lightness AND the chroma/temperature drift)
      // from the authored pair. Guarded so a near-black channel cannot blow up.
      const k = (a, i) => (mid[i] > 1e-4 ? clamp(a[i] / mid[i], 0.35, 2.8) : 1);
      const lit0 = [target[0] * k(a0, 0), target[1] * k(a0, 1), target[2] * k(a0, 2)];
      const lit1 = [target[0] * k(a1, 0), target[1] * k(a1, 1), target[2] * k(a1, 2)];

      return {
        section: [section[0], section[1]],
        lit: [hexOfLin(lit0), hexOfLin(lit1)],
        display: measured ? GROUND_DISPLAY[id] : hexOfLin(target),
        measured,
      };
    }

    /**
     * A lit PBR material for one stratum.
     *
     * @param {object} stratum  id, pattern, colors, grain, ucs, water, seed…
     * @param {object} [opts]
     * @param {'lit'|'section'} [opts.space='lit']  see the block above
     * @param {object} [opts.core]  internal — see drillCore()
     */
    function stratumMaterial(stratum = {}, opts = {}) {
      const st = {
        id: stratum.id || 'rock',
        pattern: PATTERNS[stratum.pattern] ? stratum.pattern : 'sedimentary',
        colors: Array.isArray(stratum.colors) && stratum.colors.length >= 2
          ? stratum.colors : ((GROUND[stratum.id] && GROUND[stratum.id].colors) || ['#8A8078', '#635B55']),
        grain: stratum.grain === undefined ? 0.5 : clamp01(stratum.grain),
        ucs: stratum.ucs === undefined ? 60 : stratum.ucs,
        abrasivity: clamp01(stratum.abrasivity === undefined ? 0.5 : stratum.abrasivity),
        water: clamp01(stratum.water === undefined ? 0.3 : stratum.water),
        top: Number(stratum.top) || 0,
        bottom: Number(stratum.bottom) || 0,
        seed: stratum.seed === undefined ? null : stratum.seed | 0,
      };
      const space = opts.space === 'section' ? 'section' : 'lit';
      const core = opts.core || null;
      const seed = st.seed === null
        ? ((hashStr(st.id) ^ Math.round((st.top + st.bottom) * 137)) >>> 0)
        : st.seed >>> 0;

      const ck = 'stratum|' + space + '|' + st.id + '|' + st.pattern + '|' +
        st.colors[0] + st.colors[1] + '|' + seed + '|' +
        st.grain.toFixed(2) + '|' + st.water.toFixed(2) +
        (core ? '|core:' + stable(core) : '');
      const hit = stratumCache.get(ck);
      if (hit) return hit;

      const set = patternSet(st.pattern);
      const feat = PATTERN_FEAT[st.pattern] || PATTERN_FEAT.sedimentary;
      const rnd = makeRandom(seed || 1);
      const cols = stratumColors(st, st.colors);
      const used = space === 'section' ? cols.section : cols.lit;

      // scale detail with grain: coarse ground repeats less often
      const rep = lerp(5.5, 1.6, clamp01(st.grain)) * (0.85 + rnd.f() * 0.3);
      const isVoid = st.pattern === 'void';

      const U = {
        uColTop: { value: new THREE.Color(used[0]) },
        uColBot: { value: new THREE.Color(used[1]) },
        uUvXf: { value: new THREE.Vector4(rep, rep, rnd.f() * 10, rnd.f() * 10) },
        uGradRange: { value: new THREE.Vector2(0, 1) },
        uFeatA: { value: new THREE.Vector4(feat.bed, feat.joint, feat.mica * (0.6 + st.grain * 0.8), feat.grain * (0.5 + st.grain)) },
        uFeatB: { value: new THREE.Vector4(st.water * 0.75, isVoid ? 1 : 0, feat.clast, feat.contrast) },
        uJointCfg: { value: new THREE.Vector3(0.62 + rnd.f() * 0.35, -0.95 - rnd.f() * 0.4, feat.jf * (0.8 + rnd.f() * 0.5)) },
        uBedCfg: { value: new THREE.Vector2(Math.max(2, Math.round(feat.bedN * (0.7 + rnd.f() * 0.7))), feat.und) },
        uSeedS: { value: (seed % 1000) / 7.31 },
        uTimeS: uTime,
      };
      if (core) {
        // A core stick's bedding traces circle the barrel, so the bedding term
        // the section already owns is exactly what is wanted here — just more
        // of it, because on a 47 mm stick every parting is visible.
        U.uFeatA.value.x = Math.max(feat.bed, 0.55);
        U.uBedCfg.value.x = Math.max(3, Math.round(core.beds));
        U.uCoreA = { value: new THREE.Vector4(core.rqd, core.pieces, core.wet, core.mud) };
        U.uCoreB = { value: new THREE.Vector4(core.barrel, core.helix, core.recovery, core.polish) };
      }

      /* material.color is NOT read by the patched program — STRAT_MAP assigns
         diffuseColor.rgb outright — so it is free to carry metadata, and what
         it used to carry was a lie: the midpoint of the SECTION albedos, i.e.
         a colour ~1.35 stops brighter than the rock, handed to anyone who
         asked "what colour is this?". It now carries the DISPLAYED colour,
         which is the honest answer to that question in every space. */
      const cRep = new THREE.Color(cols.display);

      const mat = new THREE.MeshStandardMaterial({
        color: cRep,
        roughness: clamp(0.92 - clamp01(st.ucs / 300) * 0.30, 0.25, 0.98),
        metalness: 0.0,
        envMapIntensity: isVoid ? 0.25 : 0.65,
        map: set.map,
        normalMap: set.normal,
        roughnessMap: set.orm,
        aoMap: set.orm,
        aoMapIntensity: 0.9,
      });
      mat.name = core ? `drillity:core:${st.id}` : `drillity:stratum:${st.id}`;
      mat.normalScale = new THREE.Vector2(
        lerp(0.6, 1.6, clamp01(st.grain)) * (isVoid ? 0.3 : 1),
        lerp(0.6, 1.6, clamp01(st.grain)) * (isVoid ? 0.3 : 1));

      const mapChunk = core ? CORE_MAP_FULL : STRAT_MAP;
      const commonChunk = core ? (STRAT_COMMON + CORE_COMMON) : STRAT_COMMON;
      mat.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, U);
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', commonChunk)
          .replace('#include <map_fragment>', mapChunk)
          .replace('#include <roughnessmap_fragment>', STRAT_ROUGH)
          .replace('#include <normal_fragment_maps>', STRAT_NORMAL);
        mat.userData.shader = shader;
      };
      // Two programs, not two per lithology: every stratum shares one and
      // every core stick shares the other.
      mat.customProgramCacheKey = () => (core ? 'drillity-core-v1' : 'drillity-stratum-v1');

      mat.userData.uniforms = U;
      mat.userData.stratum = st;
      /** Which set this material's uniforms are actually carrying. */
      mat.userData.colorSpace = space;
      /** The authored albedos — correct ONLY under the section's lighting. */
      mat.userData.sectionColors = cols.section;
      /** Albedos that reproduce the displayed rock under scene lighting. */
      mat.userData.litColors = cols.lit;
      /** The measured on-screen colour. What a DOM swatch or a minimap wants;
       *  `groundSwatch(id)` in contract.js is the same value with a foot. */
      mat.userData.displayColor = cols.display;
      /** Back-compat: the pair this material is actually using. */
      mat.userData.colors = used.slice();
      /** The geology renderer calls this when a layer does not occupy the
       *  full 0..1 of uv.y (e.g. one shared plane for the whole column). */
      mat.userData.setGradientRange = (v0, v1) => {
        const span = (v1 - v0) || 1;
        U.uGradRange.value.set(v0, 1 / span);
      };
      mat.userData.setDetailRepeat = (r) => U.uUvXf.value.set(r, r, U.uUvXf.value.z, U.uUvXf.value.w);

      stratumCache.set(ck, mat);
      animated.add(mat);
      allMaterials.set(ck, mat);
      return mat;
    }

    /**
     * A CORE STICK, cut from a named stratum.
     *
     * Lithology is not re-authored here: the stick reuses the very same
     * neutral pattern detail set and the very same feature uniforms the
     * section uses, so granite core and granite bedrock are the same rock and
     * a new lithology costs no texture memory at all. What this adds is
     * everything the CORE BARREL did to it — see CORE_MAP.
     *
     * The parameter that matters is `rqd`. Rock Quality Designation is what a
     * driller reads off a tray at a glance and what `site-investigation` is
     * scored on ("sample quality and log fidelity"), so it drives the break
     * spacing directly: 1.0 is one long unbroken run, 0.0 is a tray of rubble.
     *
     * @param {object|string} p  a stratum object, a GROUND id, or
     *                           `{ ground:'granite', rqd, recovery, wet, mud }`
     */
    function drillCore(p = {}) {
      const src = typeof p === 'string' ? { ground: p } : p;
      const gid = src.ground || src.id;
      const g = GROUND[gid];
      const st = {
        id: gid || src.id || 'rock',
        pattern: src.pattern || (g && g.pattern) || 'sedimentary',
        colors: src.colors || (g && g.colors),
        grain: src.grain === undefined ? (g ? g.grain : 0.5) : src.grain,
        ucs: src.ucs === undefined ? (g ? g.ucs : 60) : src.ucs,
        abrasivity: src.abrasivity === undefined ? (g ? g.abrasivity : 0.5) : src.abrasivity,
        water: src.water === undefined ? (g ? g.water : 0.3) : src.water,
        seed: src.seed,
      };
      const rqd = clamp01(src.rqd === undefined ? 0.7 : src.rqd);
      const core = {
        rqd,
        // 2 breaks across the mapped run at RQD 1, 22 at RQD 0. Integers, so
        // the pieces land on whole spacings however the caller scales uv.
        pieces: Math.max(2, Math.round(lerp(22, 2, rqd))),
        beds: Math.max(3, Math.round(lerp(4, 14, clamp01(1 - (st.grain === undefined ? 0.5 : st.grain))))),
        wet: clamp01(src.wet === undefined ? Math.min(0.85, st.water + 0.25) : src.wet),
        mud: clamp01(src.mud === undefined ? 0.3 : src.mud),
        recovery: clamp01(src.recovery === undefined ? Math.max(rqd, 0.85) : src.recovery),
        barrel: clamp01(src.barrel === undefined ? 0.8 : src.barrel),
        helix: src.helix === undefined ? 2.5 : src.helix,
        polish: clamp01(src.polish === undefined ? 0.55 : src.polish),
      };
      const mat = stratumMaterial(st, { space: 'lit', core });
      mat.userData.core = core;
      /** Re-cut the run at a different RQD without rebuilding anything. */
      mat.userData.setRQD = (q) => {
        const r = clamp01(q);
        const u = mat.userData.uniforms;
        if (!u || !u.uCoreA) return;
        u.uCoreA.value.x = r;
        u.uCoreA.value.y = Math.max(2, Math.round(lerp(22, 2, r)));
      };
      mat.userData.setRecovery = (v) => {
        const u = mat.userData.uniforms;
        if (u && u.uCoreB) u.uCoreB.value.z = clamp01(v);
      };
      return mat;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       LIFECYCLE + STATS
       ═══════════════════════════════════════════════════════════════════════ */

    async function init() {
      refreshAniso();
      for (const t of allTextures) t.anisotropy = anisoCap;
      // Warm the assets the site scene is guaranteed to need, at low priority
      // so anything requested for real still jumps the queue.
      // Order matters: the first requests get the fattest slice of their
      // pool, so warm what is guaranteed to be on screen during a run —
      // bodywork, the drill string, the mast hazard bands and the pad.
      // The bodywork amber, not the wordmark amber — and it matters more here
      // than anywhere: this is the FIRST set allocated, so it takes the
      // fattest slice of the hero pool, and every later paintedSteel request
      // that hits the variant cap falls back to the perceptually nearest set,
      // which would be this one. Warm it in the colour the rig actually is.
      material('paintedSteel', { color: BRAND.amberPlant || BRAND.amber, wear: 0.32 });
      material('wornSteel', {});
      material('rawSteel', {});
      material('safetyStripe', {});
      material('dirt', {});
      return true;
    }

    function update(dt, state) {
      if (destroyed) return;
      uTime.value += dt;

      const weather = (state && state.world && state.world.weather) || 'clear';
      wetTarget = weather === 'rain' ? 1.0 : weather === 'fog' ? 0.42
        : weather === 'overcast' ? 0.26 : weather === 'snow' ? 0.18 : 0.06;
      wetness += (wetTarget - wetness) * (1 - Math.exp(-0.55 * dt));

      for (const m of wetGroup) {
        const b = m.userData.baseRoughness;
        if (b === undefined) continue;
        m.roughness = clamp(b * (1 - wetness * 0.5), 0.06, 1);
        m.envMapIntensity = 0.7 + wetness * 0.5;
      }
      if (state && state.drill) {
        // hole water shows in the strata as the bit passes a wet layer
        const w = clamp01((state.drill.jam > 0 ? 0.1 : 0) + wetness * 0.35);
        for (const m of animated) {
          const u = m.userData.uniforms;
          if (!u || !u.uFeatB) continue;
          const st = m.userData.stratum;
          if (!st) continue;
          u.uFeatB.value.x = clamp01(st.water * 0.75 + w * 0.25);
        }
      }
    }

    function resize(w, h, dpr) {
      viewport = { w, h, dpr };
      const prev = anisoCap;
      refreshAniso();
      if (anisoCap !== prev) for (const t of allTextures) t.anisotropy = anisoCap;
    }

    function dispose() {
      destroyed = true;
      tasks.length = 0;
      running = 0;
      for (const m of allMaterials.values()) {
        m.onBeforeCompile = () => {};
        m.userData.shader = null;
        m.dispose();
      }
      for (const t of allTextures) { try { t.dispose(); } catch (e) { /* already gone */ } }
      allTextures.clear();
      allMaterials.clear();
      setCache.clear();
      familyIndex.clear();
      decalCache.clear();
      dataTexCache.clear();
      stratumCache.clear();
      animated.clear();
      wetGroup.clear();
      ledger.bytes = 0;
      for (const k of Object.keys(pools)) pools[k].used = 0;
      scratch.n = 0;
      scratch.albedo = scratch.orm = scratch.nrm = scratch.hf = null;
    }

    function stats() {
      // setCache aliases a reused variant under several keys, so count the
      // distinct set objects rather than the map size.
      const distinct = new Set(setCache.values());
      let ready = 0;
      for (const s of distinct) if (s.ready) ready++;
      const poolMB = {};
      for (const [k, v] of Object.entries(pools)) {
        poolMB[k] = {
          usedMB: Math.round(v.used / 1048576 * 10) / 10,
          floorMB: Math.round(v.floor / 1048576 * 10) / 10,
          freeMB: Math.round(poolAvailable(k) / 1048576 * 10) / 10,
        };
      }
      return {
        materials: allMaterials.size,
        textures: allTextures.size,
        sets: distinct.size,
        setsReady: ready,
        pools: poolMB,
        decals: decalCache.size,
        dataTextures: dataTexCache.size,
        strata: stratumCache.size,
        bytesApprox: ledger.bytes,
        megabytes: Math.round(ledger.bytes / 1048576 * 10) / 10,
        budgetMB: TIER.budgetMB,
        peakMB: Math.round(ledger.peak / 1048576 * 10) / 10,
        pending: tasks.length + running,
        slices: {
          count: slice.count,
          maxMs: Math.round(slice.maxMs * 10) / 10,
          avgMs: slice.count ? Math.round(slice.sumMs / slice.count * 10) / 10 : 0,
          overFrameBudget: slice.overMs,
        },
        built, failed,
        tier: tierId,
        anisotropy: anisoCap,
        viewport,
      };
    }

    /* ── the public surface ────────────────────────────────────────────── */
    return {
      init, update, resize, dispose,
      material, texSet, noiseTexture, gradientTexture, stratumMaterial, decal,
      // Sampling / exploration extras. `drillCore` is also reachable as
      // material('drillCore', …); `stratumColors` answers "which of the two
      // colour sets do I want?" without having to build a material to find out.
      drillCore, stratumColors,
      key, stats,
      // extras used by tooling/QA, not part of the contract
      noise: { valueNoise, gradNoise, fbm, fbm01, vfbm, ridged, worley, worleyBlock, warp, streaks, scratches, blob, dish },
      _sets: setCache,
      // The pixel programs themselves, so the seam and speckle probes can run
      // a kind without allocating a texture for it. Not part of the contract.
      _kinds: KINDS,
      _patterns: PATTERNS,
    };
  }
}

/** Helper used by rawSteel's fingerprint smudges: radial distance to the
 *  nearest lattice centre, kept out of the hot closure for clarity. */
function ridgeDist(x, y) {
  const dx = x - Math.floor(x) - 0.5;
  const dy = y - Math.floor(y) - 0.5;
  return Math.sqrt(dx * dx + dy * dy);
}

export default createAssets;
