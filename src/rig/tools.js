/**
 * DRILLITY I THE GAME — down-hole tool library.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Procedural, fully-disposable geometry for every consumable and down-hole tool
 * in the Drillity taxonomy (DOMAIN.md §3 B, §4). Used in two places:
 *
 *   1. on the rig      — rig/rigFactory.js hangs the working tool off the head
 *   2. in the shop     — iMarket item previews spin one of these in a small
 *                        scene; every builder therefore works standalone with
 *                        nothing but a THREE namespace.
 *
 * ── AXIS CONVENTION (obeyed by every builder) ──────────────────────────────
 *   +Y is the tool axis. The origin sits on the CONNECTION face (the pin
 *   shoulder / box mouth / top of the shank) and the tool hangs DOWN the -Y
 *   axis, exactly as it does on a rig. `userData.spec.lengthMm` is the extent
 *   below the origin. Radial features are laid out in the XZ plane.
 *
 * ── WEAR ───────────────────────────────────────────────────────────────────
 *   Every builder accepts `{ wear: 0..1 }`. Wear is gameplay-critical: the
 *   player must be able to SEE a finished bit. It drives, in this order,
 *     0.0-0.3  buttons lose their crown radius, body loses its paint
 *     0.3-0.6  gauge row flattens, straw heat colour on the head
 *     0.6-0.85 wear flats on the face buttons, blued heat colour, gauge under-
 *              size (the head visibly narrows), polished mirror body
 *     0.85-1.0 buttons snapped out — open sockets with a chipped crater lip
 *
 * ── DISPOSAL ───────────────────────────────────────────────────────────────
 *   Every returned Group carries `userData.dispose()`. It frees all geometry
 *   in the subtree plus any material uniquely created for that object.
 *   Shared library materials live in a module cache freed by
 *   `disposeToolLibrary()` (called by rigFactory.dispose(); the cache rebuilds
 *   lazily, so calling it is safe as long as nothing live is still drawn).
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* ═══════════════════════════════════════════════════════════════════════════
   UNITS & MATH
   ═══════════════════════════════════════════════════════════════════════════ */
/** millimetres to world units (the game world is metres). */
export const mm = (v) => v * 0.001;
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clampv = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

/* ═══════════════════════════════════════════════════════════════════════════
   MATERIALS
   ctx.assets.material(kind, params) is the authority. Everything below is the
   standalone fallback so a shop preview works before assets.js exists.
   ═══════════════════════════════════════════════════════════════════════════ */
const FALLBACK_MATS = {
  paintedSteel: { color: 0xC8A13C, roughness: 0.54, metalness: 0.28 },
  rawSteel:     { color: 0x8C9298, roughness: 0.40, metalness: 0.90 },
  wornSteel:    { color: 0x6B7076, roughness: 0.62, metalness: 0.82 },
  carbide:      { color: 0xC9CFD4, roughness: 0.20, metalness: 0.60 },
  castIron:     { color: 0x4A4E53, roughness: 0.76, metalness: 0.42 },
  chrome:       { color: 0xE8ECF0, roughness: 0.07, metalness: 1.00 },
  rubber:       { color: 0x15181B, roughness: 0.94, metalness: 0.02 },
  hose:         { color: 0x1B1E22, roughness: 0.82, metalness: 0.06 },
  plastic:      { color: 0x2B3038, roughness: 0.52, metalness: 0.02 },
  glass:        { color: 0xA8BECB, roughness: 0.06, metalness: 0.10, transparent: true, opacity: 0.30 },
  safetyStripe: { color: 0xF0B319, roughness: 0.58, metalness: 0.12 },
  brandedPanel: { color: 0x161C26, roughness: 0.44, metalness: 0.22 },
  // library-private extras (never requested from ctx.assets)
  __mud:        { color: 0x3A2E20, roughness: 0.96, metalness: 0.02 },
  __diamond:    { color: 0x2A2C30, roughness: 0.35, metalness: 0.20 },
  __pdc:        { color: 0x131519, roughness: 0.16, metalness: 0.30 },
  __brass:      { color: 0xB08A3E, roughness: 0.32, metalness: 0.95 },
  // Hue belongs to the machine, not next to it. The old 0xDFB552 sat at 42.1
  // deg against painted steel landing at ~36-37 deg — the most chromatically
  // discordant element on the rig. 0xE0A85A is 34.9 deg / sat 0.598, same value.
  __glow:       { color: 0xE0A85A, roughness: 0.44, metalness: 0.0, emissive: 0xE0A85A },
  // Cover lens over an operator display. Nearly black and very smooth: at the
  // ~18 CSS px a console subtends, it is the SPECULAR that says "screen" — the
  // pixels behind it are far below the resolution of the shot.
  __screenGlass: { color: 0x0B0F15, roughness: 0.045, metalness: 0.08, transparent: true, opacity: 0.30 },
  /* The inside of a bore, seen down the mouth of a pipe, a pick-up hole or a
     pitching hole. Twelve builders ask for `__hole` and it was never in this
     table, so every one of them was silently landing on `rawSteel` and only
     looking right because each call happened to pass a full colour/roughness/
     metalness/side override. That is the "silent fallback" shape HANDOFF.md
     spends a section on: it works until someone writes the thirteenth call
     and omits an override, at which point a borehole renders as bright steel.
     Declaring it makes the default the correct one. */
  __hole:       { color: 0x0A0C0F, roughness: 0.94, metalness: 0.15 },
  __paintRed:   { color: 0x8E2B22, roughness: 0.55, metalness: 0.25 },
  __paintDark:  { color: 0x22272E, roughness: 0.58, metalness: 0.30 },
  __copper:     { color: 0x9A5B32, roughness: 0.38, metalness: 0.92 },
  /* ── §14-§19 vocabularies ────────────────────────────────────────────────
     Hot-dip galvanising is not "shiny steel": it is a matt, slightly blue-grey
     zinc skin. Every friction bolt, plate and mesh sheet underground is this
     colour, and the contrast against the black-oxide drilling tools hanging
     next to them in the shop is what separates ground support from drilling. */
  __galv:       { color: 0x9FA8AE, roughness: 0.58, metalness: 0.72 },
  // Alumina ceramic wear tile — the lining of every wetted surface in an RC
  // sample system. Pale, chalky and NOT metallic; that is what makes it read
  // as a wear part rather than as more of the same painted shell.
  __ceramic:    { color: 0xD6D2C8, roughness: 0.42, metalness: 0.03 },
  // 60-shore polyurethane: the cyclone's base-cone lining.
  __urethane:   { color: 0x5A4632, roughness: 0.78, metalness: 0.02 },
  // Precast concrete, C35/45 upward — grey with a warm cast off the aggregate
  // and rough enough that it can never be mistaken for painted steel.
  __concrete:   { color: 0x9A968D, roughness: 0.92, metalness: 0.02 },
  __calico:     { color: 0xC6B896, roughness: 0.95, metalness: 0.0 },
  // Two-component resin cartridges are colour-coded by set time in every mine
  // that runs them, and the crew reads the colour, not the label.
  __resinFast:  { color: 0x8C3524, roughness: 0.62, metalness: 0.04 },
  __resinSlow:  { color: 0x2C4A6B, roughness: 0.62, metalness: 0.04 },
  // Trailing power cable on a jumbo reel, and the semi-conductive charging
  // hose. Both are deliberately loud so they stay legible against wet rock.
  __cableOrange: { color: 0xB4571C, roughness: 0.80, metalness: 0.03 },
  __shockTube:  { color: 0xC8B23A, roughness: 0.70, metalness: 0.02 },
  // Sintered porous element: the u2 filter ring on a piezocone and the filter
  // sock on a standpipe screen. Dry, matt, paler than the steel around it.
  __porous:     { color: 0xB9BDB6, roughness: 0.88, metalness: 0.05 },
  __hdpe:       { color: 0x6E7C86, roughness: 0.55, metalness: 0.02 },
};

const _matCache = new Map();
const _texCache = new Map();

function makeCanvas(w, h) {
  if (typeof document === 'undefined' || !document.createElement) return null;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

/** Diagonal hazard striping, generated so we never ship a texture file. */
function stripeTexture(T) {
  if (_texCache.has('stripe')) return _texCache.get('stripe');
  const c = makeCanvas(128, 128);
  if (!c) { _texCache.set('stripe', null); return null; }
  const g = c.getContext('2d');
  g.fillStyle = '#F0B319';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#15181B';
  g.lineWidth = 26;
  for (let i = -160; i < 300; i += 52) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 140, 140); g.stroke();
  }
  const t = new T.CanvasTexture(c);
  t.wrapS = T.RepeatWrapping;
  t.wrapT = T.RepeatWrapping;
  t.anisotropy = 4;
  _texCache.set('stripe', t);
  return t;
}

/** The Drillity plate riveted to every machine. */
/**
 * A blank painted data plate — the fallback for `brandedPanel` when
 * `core/assets.js` has not finished baking.
 *
 * It used to set the word DRILLITY in `bold 62px Oswald, Impact` over the
 * tagline "GROUND ENGINEERING SYSTEMS", in `#DFB552`. Four things wrong with
 * that, and `DOMAIN.md` §10 names three of them:
 *
 *   1. It **re-letters the wordmark** in a substitute typeface. The logo is
 *      artwork (`src/ui/assets/logo-*.png`), never text set in a canvas font.
 *   2. `#DFB552` is **not brand amber**, which is `#F59E0B`.
 *   3. "GROUND ENGINEERING SYSTEMS" is **an invented tagline**. The real one
 *      is `REPRESENTING PROFESSIONALS`.
 *   4. It puts Drillity on tooling as if it made it. **Drillity is the
 *      marketplace, not an OEM** — that is why the rigs carry invented marques.
 *
 * All fifteen callers take the default, so this was stamping a fabricated
 * wordmark onto fourteen tools and every rig. A plate and its rule line is
 * what the object actually is; at the size these render, lettering was never
 * legible anyway.
 */
function brandTexture(T) {
  if (_texCache.has('brand')) return _texCache.get('brand');
  const c = makeCanvas(512, 128);
  if (!c) { _texCache.set('brand', null); return null; }
  const g = c.getContext('2d');
  g.fillStyle = '#0F141C';
  g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#F59E0B';          // brand amber, exact — the rule line only
  g.fillRect(22, 94, 174, 6);
  const t = new T.CanvasTexture(c);
  t.anisotropy = 4;
  _texCache.set('brand', t);
  return t;
}

/** Stencilled warning decal — abstract, legible at thumbnail size. */
function warningTexture(T) {
  if (_texCache.has('warn')) return _texCache.get('warn');
  const c = makeCanvas(256, 256);
  if (!c) { _texCache.set('warn', null); return null; }
  const g = c.getContext('2d');
  g.fillStyle = '#F0B319'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#15181B';
  g.beginPath(); g.moveTo(128, 34); g.lineTo(226, 206); g.lineTo(30, 206); g.closePath(); g.fill();
  g.fillStyle = '#F0B319';
  g.beginPath(); g.moveTo(128, 66); g.lineTo(200, 190); g.lineTo(56, 190); g.closePath(); g.fill();
  g.fillStyle = '#15181B';
  g.fillRect(120, 96, 16, 56);
  g.beginPath(); g.arc(128, 168, 9, 0, TAU); g.fill();
  const t = new T.CanvasTexture(c);
  t.anisotropy = 4;
  _texCache.set('warn', t);
  return t;
}

/**
 * The face of an operator display, as an EMISSIVE MASK.
 *
 * Every value here is a straight multiplier on the panel's emissive colour —
 * the texture is deliberately left at NoColorSpace so 0.06 means 0.06 of the
 * lamp, not 0.06 sRGB-decoded to 0.005. That makes the display monochrome the
 * way a real sunlight-readable HMI is, and it means the dark field CANNOT
 * bloom while the readout blocks can: the high-pass sees them at wildly
 * different luminances even though they share one material.
 *
 * Content is sized for the worst case, not the best: a driller's screen is
 * ~18 x 12 CSS px in the hero shot, so the layout is one big number, two bar
 * gauges and a header — three blobs that survive that, drawn crisply enough to
 * still be a console in a garage close-up.
 */
function consoleTexture(T) {
  if (_texCache.has('console')) return _texCache.get('console');
  const W = 256, H = 160;
  const c = makeCanvas(W, H);
  if (!c) { _texCache.set('console', null); return null; }
  const g = c.getContext('2d');
  const L = (v) => { const k = Math.round(clamp01(v) * 255); return 'rgb(' + k + ',' + k + ',' + k + ')'; };

  g.fillStyle = '#000000'; g.fillRect(0, 0, W, H);           // dead bezel border
  g.fillStyle = L(0.06); g.fillRect(7, 7, W - 14, H - 14);   // glass, lit but dark

  // header: mode block on the left, three status ticks on the right
  g.fillStyle = L(0.26); g.fillRect(7, 7, W - 14, 22);
  g.fillStyle = L(1.00); g.fillRect(13, 12, 46, 12);
  for (let i = 0; i < 3; i++) { g.fillStyle = L(i === 0 ? 0.95 : 0.42); g.fillRect(W - 24 - i * 17, 12, 11, 12); }

  // the depth readout — the one element that has to survive at thumbnail size
  g.textBaseline = 'alphabetic';
  g.fillStyle = L(1.00);
  g.font = 'bold 58px Inter, Helvetica, system-ui, sans-serif';
  g.fillText('28.1', 14, 94);
  g.fillStyle = L(0.50);
  g.font = 'bold 19px Inter, Helvetica, system-ui, sans-serif';
  g.fillText('m', 118, 94);

  // two bar gauges (weight-on-bit and flush) on the right
  const bars = [[0.80, 0.95], [0.44, 0.72]];
  for (let i = 0; i < bars.length; i++) {
    const y = 44 + i * 28;
    g.fillStyle = L(0.13); g.fillRect(148, y, 96, 17);
    g.fillStyle = L(bars[i][1]); g.fillRect(148, y, Math.round(96 * bars[i][0]), 17);
  }

  // divider + soft keys along the bottom
  g.fillStyle = L(0.85); g.fillRect(13, 106, W - 26, 2);
  for (let i = 0; i < 4; i++) {
    g.fillStyle = L(i === 1 ? 0.92 : 0.34);
    g.fillRect(14 + i * 58, 116, 48, 27);
  }

  // scanlines: it must never be a flat rectangle when the garage camera is close
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = 'rgba(0,0,0,0.20)';
  for (let y = 8; y < H - 8; y += 3) g.fillRect(7, y, W - 14, 1);
  g.globalCompositeOperation = 'source-over';

  const t = new T.CanvasTexture(c);
  t.anisotropy = 4;
  t.generateMipmaps = true;
  _texCache.set('console', t);
  return t;
}

export const TEXTURES = { stripeTexture, brandTexture, warningTexture, consoleTexture };

/* ═══════════════════════════════════════════════════════════════════════════
   BLOOM — why every lamp in this game is a computed number, not a guess.

   The post chain blooms with three's UnrealBloomPass, which is a LUMINANCE
   high-pass over the linear frame: it keeps dot(rgb, [0.2126, 0.7152, 0.0722])
   above `threshold`, and src/core/renderer.js runs that threshold at 3.0.

   A MeshStandardMaterial delivers `linear(emissive) * emissiveIntensity` into
   that buffer, so a lamp only glows at all when

       emissiveIntensity  >=  BLOOM_THRESHOLD / luminance(linear(colour))

   Amber is expensive (0xE0A85A -> luminance 0.446 -> 6.73) and a saturated red
   is brutal (0xF2604E -> 0.278 -> 10.79). Authored-by-eye values of 1.2-1.4
   land at a fifth of the knee, which is exactly why they used to render as
   painted rectangles. Nothing in this library sets emissiveIntensity directly;
   it all goes through glowIntensity(), and `over` says how far past the knee a
   lamp sits — 1.0 is exactly at the knee and contributes nothing, so nothing
   ships below ~1.15.
   ═══════════════════════════════════════════════════════════════════════════ */
export const BLOOM_THRESHOLD = 3.0;

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/** Rec.709 luminance of a hex sRGB colour after conversion to linear. */
export function linearLuminance(hex) {
  const r = srgbToLinear(((hex >> 16) & 255) / 255);
  const g = srgbToLinear(((hex >> 8) & 255) / 255);
  const b = srgbToLinear((hex & 255) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** emissiveIntensity that puts `hex` `over` times past the bloom knee. */
export function glowIntensity(hex, over) {
  return (BLOOM_THRESHOLD * (over === undefined ? 1.35 : over)) / Math.max(1e-4, linearLuminance(hex));
}

/** Brightness tiers, so two lamps doing the same job match across the fleet. */
export const GLOW = { panel: 1.20, screen: 1.35, lamp: 1.65, beacon: 2.0 };

/**
 * Resolve a material. Prefers ctx.assets.material(kind, params); falls back to
 * a cached library material so every builder works headless.
 */
export function material(ctx, kind, params) {
  const fn = ctx && ctx.assets && ctx.assets.material;
  if (typeof fn === 'function' && kind.charAt(0) !== '_') {
    try {
      const m = params ? fn.call(ctx.assets, kind, params) : fn.call(ctx.assets, kind);
      if (m && m.isMaterial) return m;
    } catch (e) { /* assets not ready — fall through to the library */ }
  }
  const key = kind + (params ? '|' + JSON.stringify(params) : '');
  const hit = _matCache.get(key);
  if (hit) return hit;

  const T = (ctx && ctx.THREE) || THREE;
  const base = FALLBACK_MATS[kind] || FALLBACK_MATS.rawSteel;
  const def = Object.assign({}, base, params || {});
  const m = new T.MeshStandardMaterial(def);
  if (kind === 'safetyStripe') {
    const t = stripeTexture(T);
    if (t) { m.map = t; m.color.set(0xffffff); }
  } else if (kind === 'brandedPanel') {
    const t = brandTexture(T);
    if (t) { m.map = t; m.color.set(0xffffff); }
  }
  m.name = 'lib:' + key;
  m.userData.__lib = true;
  _matCache.set(key, m);
  return m;
}

/** Heat-tint + polish a base material for a given wear level (quantised). */
export function wearMaterial(ctx, kind, wear, params) {
  const w = clamp01(wear || 0);
  if (w < 0.12) return material(ctx, kind, params);
  const step = Math.min(4, Math.round(w * 4)); // 5 buckets → at most 5 clones
  const key = 'wear:' + kind + ':' + step + (params ? '|' + JSON.stringify(params) : '');
  const hit = _matCache.get(key);
  if (hit) return hit;

  const T = (ctx && ctx.THREE) || THREE;
  const src = material(ctx, kind, params);
  const m = src.clone();
  const k = step / 4;
  // Temper colours: straw at moderate heat, blue-grey once it has been cooked.
  const straw = new T.Color(0xB08A48);
  const blued = new T.Color(0x555F78);
  if (m.color) {
    const c = m.color.clone();
    c.lerp(straw, k * 0.55);
    if (k > 0.5) c.lerp(blued, (k - 0.5) * 0.72);
    m.color.copy(c);
  }
  // Rubbed steel goes glossy where it has been in the hole.
  if ('roughness' in m) m.roughness = clampv(m.roughness * (1 - k * 0.55), 0.05, 1);
  if ('metalness' in m) m.metalness = clampv(m.metalness + k * 0.18, 0, 1);
  m.name = key;
  m.userData.__lib = true;
  _matCache.set(key, m);
  return m;
}

/**
 * The body colour of a drill bit.
 *
 * A bit head is not bright machined stock. It is forged 42CrMo4 that has been
 * through a furnace and then through a hole, so it carries a dark warm oxide,
 * and the only bright metal on it is the connection shoulder and whatever the
 * formation has polished. Plain `rawSteel` (#9DA2A8 — cool, pale, and within a
 * hair of the value of its own carbide) threw that contrast away, and in the
 * cross-section band the bit is 20-60 CSS px wide, where the contrast between
 * a dark body and bright buttons standing proud of it is the ONLY thing that
 * reads. Every bit head in this library asks for this instead of rawSteel.
 */
export function bitBodyMaterial(ctx, wear, params) {
  return wearMaterial(ctx, 'rawSteel', wear, Object.assign({ color: 0x6E6459 }, params || {}));
}

/** Free every shared library material and generated texture. */
export function disposeToolLibrary() {
  for (const m of _matCache.values()) { try { m.dispose(); } catch (e) { /* noop */ } }
  _matCache.clear();
  for (const t of _texCache.values()) { if (t) { try { t.dispose(); } catch (e) { /* noop */ } } }
  _texCache.clear();
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRIMITIVE HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Add a mesh to a parent.
 * o = { p:[x,y,z], r:[rx,ry,rz], q:Quaternion, s:number|[x,y,z], name,
 *       dynamic, cast, recv, renderOrder }
 */
export function part(T, parent, geo, mat, o) {
  o = o || {};
  const m = new T.Mesh(geo, mat);
  if (o.p) m.position.set(o.p[0] || 0, o.p[1] || 0, o.p[2] || 0);
  if (o.r) m.rotation.set(o.r[0] || 0, o.r[1] || 0, o.r[2] || 0);
  if (o.q) m.quaternion.copy(o.q);
  if (o.s !== undefined) {
    if (typeof o.s === 'number') m.scale.setScalar(o.s);
    else m.scale.set(o.s[0], o.s[1], o.s[2]);
  }
  if (o.name) m.name = o.name;
  if (o.dynamic || o.noMerge) m.userData.dynamic = true;
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.recv !== false;
  if (o.renderOrder !== undefined) m.renderOrder = o.renderOrder;
  if (parent) parent.add(m);
  return m;
}

/** A named group, optionally flagged dynamic so the merger leaves it alone. */
export function group(T, parent, name, o) {
  o = o || {};
  const g = new T.Group();
  g.name = name || '';
  if (o.p) g.position.set(o.p[0] || 0, o.p[1] || 0, o.p[2] || 0);
  if (o.r) g.rotation.set(o.r[0] || 0, o.r[1] || 0, o.r[2] || 0);
  if (o.s !== undefined) {
    if (typeof o.s === 'number') g.scale.setScalar(o.s);
    else g.scale.set(o.s[0], o.s[1], o.s[2]);
  }
  if (o.dynamic) g.userData.dynamic = true;
  if (parent) parent.add(g);
  return g;
}

/**
 * HARD EDGES ON A SOLID OF REVOLUTION.
 *
 * `computeVertexNormals()` averages the normals of every face meeting at a
 * vertex, so a lathe profile with a 90-degree corner in it comes back as a
 * smooth blend across that corner. On a drill bit that is fatal: the gauge
 * chamfer, the shoulder the chuck lands on, the relief behind the skirt and
 * the rim of a button's wear flat are ALL corners, and smoothing them turns a
 * machined part into a bar of soap. Duplicating the profile point at each
 * crease gives the surfaces either side their own vertices, and therefore
 * their own normals.
 *
 * Returns a new [r,y] list; a duplicated point costs one extra ring of
 * triangles and never an extra draw call.
 */
export function creaseRows(pairs, deg) {
  const lim = Math.cos((deg === undefined ? 34 : deg) * DEG);
  if (pairs.length < 3 || lim >= 1) return pairs;
  const out = [pairs[0]];
  for (let i = 1; i < pairs.length - 1; i++) {
    const a = pairs[i - 1], b = pairs[i], c = pairs[i + 1];
    let ax = b[0] - a[0], ay = b[1] - a[1];
    let cx = c[0] - b[0], cy = c[1] - b[1];
    const la = Math.hypot(ax, ay), lc = Math.hypot(cx, cy);
    out.push(b);
    if (la < 1e-9 || lc < 1e-9) continue;
    if ((ax * cx + ay * cy) / (la * lc) < lim) out.push([b[0], b[1]]);
  }
  out.push(pairs[pairs.length - 1]);
  return out;
}

export const G = {
  box: (T, w, h, d) => new T.BoxGeometry(w, h, d),
  cyl: (T, rt, rb, h, seg, open) => new T.CylinderGeometry(rt, rb, h, seg || 16, 1, !!open),
  cone: (T, r, h, seg) => new T.ConeGeometry(r, h, seg || 16, 1),
  sph: (T, r, seg) => new T.SphereGeometry(r, seg || 14, Math.max(6, (seg || 14) >> 1)),
  torus: (T, r, tube, seg, tSeg, arc) => new T.TorusGeometry(r, tube, seg || 8, tSeg || 20, arc === undefined ? TAU : arc),
  plane: (T, w, h) => new T.PlaneGeometry(w, h),
  ring: (T, ri, ro, seg) => new T.RingGeometry(ri, ro, seg || 24),
  capsule: (T, r, len, seg) => new T.CapsuleGeometry(r, len, Math.max(3, (seg || 10) >> 1), seg || 10),
  /**
   * Solid of revolution from [r,y] pairs, ordered bottom → top.
   *
   * `creaseDeg` (default 34) splits the surface wherever the profile turns
   * harder than that. Without it `computeVertexNormals` averages across every
   * corner in the profile, and a bit head — which is nothing BUT corners: the
   * gauge chamfer, the shoulder under the chuck, the rim of a wear flat —
   * renders as one smooth barrel with the whole silhouette washed out. Pass 0
   * to keep a profile fully smooth. Costs one duplicated ring per crease and
   * no draw call.
   */
  lathe: (T, pairs, seg, closed, creaseDeg) => {
    const src = creaseRows(pairs, creaseDeg === undefined ? 34 : creaseDeg);
    const pts = [];
    for (let i = 0; i < src.length; i++) pts.push(new T.Vector2(Math.max(1e-5, src[i][0]), src[i][1]));
    if (closed !== false) {
      const a = pts[0], b = pts[pts.length - 1];
      if (a.x !== b.x || a.y !== b.y) pts.push(a.clone());
    }
    return new T.LatheGeometry(pts, seg || 20);
  },
  /** Tube through a list of [x,y,z] or Vector3. */
  tube: (T, pts, radius, tubular, radial, closed) => {
    const v = pts.map((p) => (p.isVector3 ? p : new T.Vector3(p[0], p[1], p[2])));
    const curve = new T.CatmullRomCurve3(v, !!closed, 'centripetal', 0.5);
    return new T.TubeGeometry(curve, tubular || 24, radius, radial || 8, !!closed);
  },
  /** A rounded slab — the workhorse for gearbox housings and cover plates. */
  roundedBox: (T, w, h, d, r, seg) => {
    const rr = Math.min(r === undefined ? 0.02 : r, w * 0.49, h * 0.49);
    const shape = new T.Shape();
    shape.moveTo(-w / 2 + rr, -h / 2);
    shape.lineTo(w / 2 - rr, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rr);
    shape.lineTo(w / 2, h / 2 - rr);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2);
    shape.lineTo(-w / 2 + rr, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr);
    shape.lineTo(-w / 2, -h / 2 + rr);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rr, -h / 2);
    const g = new T.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: seg || 3 });
    g.translate(0, 0, -d / 2);
    return g;
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   THREADS — DOMAIN.md §4. Rope threads (R/T) are a genuine rounded helix, not
   a texture: a swept tube riding the pitch cylinder gives the correct crest
   radius and lead, which is exactly what a driller recognises.
   ═══════════════════════════════════════════════════════════════════════════ */
export const THREAD_SPECS = {
  R25:  { majorMm: 25,   pitchMm: 12.7,   depthMm: 1.8, family: 'rope' },
  R28:  { majorMm: 28,   pitchMm: 12.7,   depthMm: 1.9, family: 'rope' },
  R32:  { majorMm: 32,   pitchMm: 12.7,   depthMm: 2.0, family: 'rope' },
  R38:  { majorMm: 38,   pitchMm: 12.7,   depthMm: 2.2, family: 'rope' },
  R44:  { majorMm: 44,   pitchMm: 12.7,   depthMm: 2.3, family: 'rope' },
  R51:  { majorMm: 51,   pitchMm: 12.7,   depthMm: 2.4, family: 'rope' },
  T38:  { majorMm: 38,   pitchMm: 15.875, depthMm: 2.6, family: 'rope' },
  T45:  { majorMm: 45,   pitchMm: 15.875, depthMm: 2.8, family: 'rope' },
  T51:  { majorMm: 51,   pitchMm: 15.875, depthMm: 3.0, family: 'rope' },
  T60:  { majorMm: 60,   pitchMm: 19.05,  depthMm: 3.4, family: 'rope' },
  GT60: { majorMm: 60,   pitchMm: 19.05,  depthMm: 3.4, family: 'rope' },
  T76:  { majorMm: 76,   pitchMm: 22.0,   depthMm: 3.8, family: 'rope' },
  H90:  { majorMm: 90,   pitchMm: 25.4,   depthMm: 4.2, family: 'rope' },
  API238: { majorMm: 60,  pitchMm: 6.35, depthMm: 2.2, family: 'api' },
  API312: { majorMm: 89,  pitchMm: 6.35, depthMm: 2.6, family: 'api' },
  API412: { majorMm: 114, pitchMm: 8.47, depthMm: 3.0, family: 'api' },
  BQ:   { majorMm: 55.6, pitchMm: 5.1, depthMm: 1.4, family: 'wireline' },
  NQ:   { majorMm: 69.9, pitchMm: 5.1, depthMm: 1.5, family: 'wireline' },
  HQ:   { majorMm: 88.9, pitchMm: 5.1, depthMm: 1.6, family: 'wireline' },
  PQ:   { majorMm: 114,  pitchMm: 5.1, depthMm: 1.8, family: 'wireline' },
};

/**
 * A helical thread crest.
 * o = { major (crest RADIUS, m), pitch, length, depth, hand:'right'|'left',
 *       y0 (start y), down:bool (default true), quality:0..1 }
 */
export function threadGeometry(T, o) {
  o = o || {};
  const major = o.major !== undefined ? o.major : mm(22.5);
  const pitch = o.pitch !== undefined ? o.pitch : mm(15.875);
  const length = o.length !== undefined ? o.length : mm(60);
  const depth = o.depth !== undefined ? o.depth : mm(2.8);
  const hand = o.hand === 'left' ? -1 : 1;
  const y0 = o.y0 || 0;
  const dir = o.down === false ? 1 : -1;
  const q = o.quality === undefined ? 1 : clamp01(o.quality);
  let segsPerTurn = Math.max(5, Math.round(lerp(6, 16, q)));
  let radial = Math.max(4, Math.round(lerp(4, 7, q)));
  const turns = Math.max(0.6, length / pitch);
  // A full-length rolled thread (an SDA bar) is hundreds of turns: thin it out
  // so one anchor bar never costs more than a hero bit.
  if (turns > 30) {
    segsPerTurn = Math.max(4, Math.round(segsPerTurn * (turns > 120 ? 0.4 : 0.55)));
    radial = Math.max(3, radial - 2);
  }
  const n = Math.max(6, Math.ceil(turns * segsPerTurn));
  const r = Math.max(mm(0.5), major - depth * 0.5);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = u * turns * TAU * hand;
    pts.push(new T.Vector3(Math.cos(a) * r, y0 + dir * u * length, Math.sin(a) * r));
  }
  const curve = new T.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
  return new T.TubeGeometry(curve, n, depth * 0.62, radial, false);
}

/** Male (pin) rope thread plus the core it is cut into, on the -Y end. */
export function addPinThread(T, ctx, parent, threadId, o) {
  o = o || {};
  const s = THREAD_SPECS[threadId] || THREAD_SPECS.T45;
  const len = o.length !== undefined ? o.length : mm(s.pitchMm * 4.2);
  const mat = o.mat || material(ctx, 'rawSteel');
  const y0 = o.y0 || 0;
  const dir = o.down === false ? 1 : -1;
  const geo = threadGeometry(T, {
    major: mm(s.majorMm) * 0.5, pitch: mm(s.pitchMm), depth: mm(s.depthMm),
    length: len, y0: y0, down: o.down, quality: o.quality, hand: o.hand,
  });
  const m = part(T, parent, geo, mat, { name: 'thread:' + threadId });
  const coreR = mm(s.majorMm) * 0.5 - mm(s.depthMm) * 0.92;
  part(T, parent, G.cyl(T, coreR, coreR * 0.97, len * 1.02, o.quality === 0 ? 8 : 14), mat, {
    p: [0, y0 + dir * len * 0.5, 0],
  });
  return m;
}

/** Female (box) rope thread inside a bore — visible down the mouth. */
export function addBoxThread(T, ctx, parent, threadId, o) {
  o = o || {};
  const s = THREAD_SPECS[threadId] || THREAD_SPECS.T45;
  const len = o.length !== undefined ? o.length : mm(s.pitchMm * 4.2);
  const mat = o.mat || material(ctx, 'wornSteel');
  const geo = threadGeometry(T, {
    major: mm(s.majorMm) * 0.5 + mm(s.depthMm) * 0.35,
    pitch: mm(s.pitchMm), depth: mm(s.depthMm),
    length: len, y0: o.y0 || 0, down: o.down, quality: o.quality, hand: o.hand,
  });
  return part(T, parent, geo, mat, { name: 'boxthread:' + threadId, cast: false });
}

/* ═══════════════════════════════════════════════════════════════════════════
   AUGER / FLIGHT RIBBON — a real solid helicoid (top face, bottom face, outer
   wear rim, inner rim, end caps). Used by CFA flights, Kelly augers, HSA.
   ═══════════════════════════════════════════════════════════════════════════ */
export function flightGeometry(T, o) {
  o = o || {};
  const rIn = o.rInner !== undefined ? o.rInner : mm(90);
  const rOut = o.rOuter !== undefined ? o.rOuter : mm(400);
  const pitch = o.pitch !== undefined ? o.pitch : mm(600);
  const turns = o.turns !== undefined ? o.turns : 3;
  const th = o.thickness !== undefined ? o.thickness : mm(18);
  const hand = o.hand === 'left' ? -1 : 1;
  const y0 = o.y0 || 0;
  const dir = o.down === false ? 1 : -1;
  const segsPerTurn = Math.max(6, o.segsPerTurn || 20);
  const nU = Math.max(8, Math.ceil(turns * segsPerTurn));
  const nV = 2;

  const pos = [];
  const uvs = [];
  const idx = [];
  const dpdu = new T.Vector3();
  const dpdv = new T.Vector3();
  const nrm = new T.Vector3();
  const surf = (i, j, side) => {
    const u = i / nU;
    const v = j / nV;
    const a = u * turns * TAU * hand;
    const r = lerp(rIn, rOut, v);
    const y = y0 + dir * u * turns * pitch;
    dpdu.set(-Math.sin(a) * r * hand, dir * pitch / TAU, Math.cos(a) * r * hand);
    dpdv.set(Math.cos(a), 0, Math.sin(a));
    nrm.crossVectors(dpdu, dpdv).normalize().multiplyScalar(side * th * 0.5);
    return { x: Math.cos(a) * r + nrm.x, y: y + nrm.y, z: Math.sin(a) * r + nrm.z, u: u * turns, v: v };
  };
  const push = (p) => { pos.push(p.x, p.y, p.z); uvs.push(p.u, p.v); return (pos.length / 3) - 1; };

  const top = [];
  const bot = [];
  for (let i = 0; i <= nU; i++) {
    top[i] = []; bot[i] = [];
    for (let j = 0; j <= nV; j++) {
      top[i][j] = push(surf(i, j, 1));
      bot[i][j] = push(surf(i, j, -1));
    }
  }
  for (let i = 0; i < nU; i++) {
    for (let j = 0; j < nV; j++) {
      idx.push(top[i][j], top[i + 1][j], top[i + 1][j + 1]);
      idx.push(top[i][j], top[i + 1][j + 1], top[i][j + 1]);
      idx.push(bot[i][j], bot[i + 1][j + 1], bot[i + 1][j]);
      idx.push(bot[i][j], bot[i][j + 1], bot[i + 1][j + 1]);
    }
    idx.push(top[i][nV], bot[i][nV], bot[i + 1][nV]);
    idx.push(top[i][nV], bot[i + 1][nV], top[i + 1][nV]);
    idx.push(top[i][0], bot[i + 1][0], bot[i][0]);
    idx.push(top[i][0], top[i + 1][0], bot[i + 1][0]);
  }
  for (let j = 0; j < nV; j++) {
    idx.push(top[0][j], bot[0][j], bot[0][j + 1]);
    idx.push(top[0][j], bot[0][j + 1], top[0][j + 1]);
    idx.push(top[nU][j], bot[nU][j + 1], bot[nU][j]);
    idx.push(top[nU][j], top[nU][j + 1], bot[nU][j + 1]);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARBIDE — the single most important detail on any Drillity product.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * How far a button of each shape stands out of the steel, as a multiple of its
 * own RADIUS, and how much of that height is the profiled head rather than the
 * plain cylinder under it.
 *
 * THE ONE HARD NUMBER. Rockmore's *Carbide Sharpening Guide for Button Bits*
 * states it twice, as a floor and a ceiling: "at least 1/2 of the carbide
 * diameter should protrude" and "carbides should not protrude more than 3/4 of
 * the carbide diameter — removing excessive steel body will result in carbide
 * failure". Halco puts the same rule in millimetres (grind so carbide stands
 * no more than 9 mm proud in abrasive ground). So protrusion is 0.50-0.75 × d,
 * i.e. 1.00-1.50 × r, and nothing may sit outside that band.
 *
 * `head` is the height of the shaped crown above the cylindrical shank, from
 * BETEK's tungsten-carbide catalogue (pp. 20-21, the D / H / h1 columns):
 * hemispherical h1/D 0.33-0.43, semi-ballistic 0.46-0.53, ballistic 0.66-0.70,
 * conical 0.45-0.57. The difference between `stick` and `head` is the band of
 * bare cylinder that shows between the steel and the dome on a real button —
 * a small thing that is nonetheless the difference between carbide set into a
 * bit and beads glued onto one.
 *
 * The previous values (0.62 r spherical, 1.35 r ballistic) were under the
 * sourced floor; a first correction overshot to 2.15 r, above the ceiling.
 */
export const BUTTON_STICKOUT = {
  spherical: 1.00,
  semiballistic: 1.22,
  ballistic: 1.50,
  conical: 1.34,
  chisel: 1.25,
  flat: 0.34,
};
const BUTTON_HEAD = {
  spherical: 0.80, semiballistic: 1.00, ballistic: 1.36,
  conical: 1.04, chisel: 1.05, flat: 0.34,
};

/**
 * One carbide button/insert as a lathe solid.
 * kind: 'spherical' | 'semiballistic' | 'ballistic' | 'conical' | 'flat' | 'chisel'
 * wear: 0..1 — the crown collapses into a polished wear flat.
 *
 * WEAR. A button does not shrink evenly. It loses its crown to a FLAT, and the
 * flat has a hard rim where it meets what is left of the dome — that rim is the
 * whole read, because a flat catches the key light as a hard-edged highlight
 * while a fresh dome catches it as a soft one. So the flat is built as a real
 * disc with its own edge ring rather than as a truncation, and it is given a
 * shallow negative crown (a worn button dishes very slightly) so the rim stays
 * a rim from every angle.
 */
export function buttonGeometry(T, o) {
  o = o || {};
  const d = o.dia !== undefined ? o.dia : mm(11);
  const r = d * 0.5;
  const kind = o.kind || 'spherical';
  const wear = clamp01(o.wear || 0);
  const kStick = BUTTON_STICKOUT[kind] !== undefined ? BUTTON_STICKOUT[kind] : BUTTON_STICKOUT.spherical;
  const stick = (o.protrusion !== undefined ? o.protrusion : kStick) * r;
  const seg = o.seg || 10;
  // BETEK's H column: a button is 1.3-1.8 diameters long overall, so about two
  // thirds of it is down in the steel. That matters here only because the steel
  // washes away and exposes it — see studFace — so the shank must be long
  // enough to still be shank at the end of the bit's life.
  const bury = o.bury !== undefined ? o.bury : r * 1.3;
  // The exposed band of plain cylinder below the crown.
  const kHead = BUTTON_HEAD[kind] !== undefined ? BUTTON_HEAD[kind] : BUTTON_HEAD.spherical;
  const shank = clampv(stick - kHead * r * (o.protrusion !== undefined ? o.protrusion / kStick : 1), 0, stick * 0.5);
  const pts = [[0, -bury], [r, -bury], [r, shank]];
  const base = shank;
  if (kind === 'ballistic' || kind === 'semiballistic') {
    // A ballistic wears from the point back: the ogive is truncated and the
    // truncation opens into a flat, so the tip radius grows fast while the
    // height falls slowly. That is why a half-worn ballistic reads as a
    // *stubbier* ballistic rather than as a sphere.
    const h = stick * (1 - wear * 0.34);
    const yy = (f) => base + (h - base) * f;
    const tipR = lerp(r * 0.13, r * 0.66, Math.pow(wear, 0.8));
    pts.push([r * 0.99, yy(0.16)]);
    pts.push([r * 0.93, yy(0.36)]);
    pts.push([r * 0.80, yy(0.56)]);
    pts.push([r * 0.62, yy(0.74)]);
    pts.push([lerp(r * 0.38, r * 0.72, wear), yy(0.88)]);
    if (wear > 0.14) {
      pts.push([tipR * 1.04, yy(0.985)]);   // the rim of the wear flat
      pts.push([tipR, h]);
      pts.push([tipR * 0.45, h - r * 0.035 * wear]);  // dished centre
      pts.push([0, h - r * 0.04 * wear]);
    } else {
      pts.push([tipR, yy(0.96)]);
      pts.push([tipR * 0.5, h]);
      pts.push([0, h]);
    }
  } else if (kind === 'conical') {
    const h = stick * (1 - wear * 0.44);
    const yy = (f) => base + (h - base) * f;
    const tipR = lerp(r * 0.10, r * 0.58, Math.pow(wear, 0.8));
    pts.push([r * 0.94, yy(0.26)]);
    pts.push([r * 0.66, yy(0.66)]);
    if (wear > 0.14) { pts.push([tipR * 1.05, yy(0.98)]); pts.push([tipR, h]); pts.push([0, h - r * 0.03 * wear]); }
    else { pts.push([tipR, yy(0.94)]); pts.push([0, h]); }
  } else if (kind === 'flat') {
    // A flat-top insert (and a PDC cutter, which borrows this) is a right
    // cylinder with a chamfered rim, not a dome. It wears by losing that rim
    // to a scallop, so the chamfer opens up rather than the height falling.
    const h = stick;
    const ch = lerp(r * 0.10, r * 0.30, wear);
    pts.push([r, h - ch]); pts.push([r - ch * 0.8, h]); pts.push([0, h]);
  } else if (kind === 'chisel') {
    const h = stick * (1 - wear * 0.4);
    const yy = (f) => base + (h - base) * f;
    pts.push([r * 0.94, yy(0.34)]);
    pts.push([r * 0.72, yy(0.68)]);
    pts.push([lerp(r * 0.10, r * 0.58, wear), h]);
    pts.push([0, h]);
  } else {
    // Spherical. A fresh one is a hemisphere; a worn one is a hemisphere with
    // its crown taken off square. The rim between dome and flat is built
    // explicitly — that hard edge is what makes a worn button read as worn
    // instead of as a smaller button.
    //
    // The flat grows to 0.68 of the button DIAMETER at wear 1. Rockmore's four
    // stages are: no wear / slight, under 1/6 Ø / normal, under 1/3 Ø — "best
    // results if sharpening occurs before this point" / very worn, over 1/3 /
    // worn flat, over 2/3. Wear 1 in this game is a bit that should have come
    // out of the hole two shifts ago, so it sits at the top of that scale.
    const h = stick * (1 - wear * 0.42);
    const flat = lerp(0.0, 0.68, Math.pow(wear, 0.75));
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      const a = (i / steps) * (Math.PI * 0.5);
      const rr = r * Math.cos(a);
      const yv = base + (h - base) * Math.sin(a);
      if (rr < r * flat * 1.02) break;
      pts.push([rr, yv]);
    }
    if (flat > 0.02) {
      const fr = r * flat;
      pts.push([fr * 1.03, base + (h - base) * 0.992]);
      pts.push([fr, h]);
      pts.push([fr * 0.45, h - r * 0.03 * wear]);
      pts.push([0, h - r * 0.035 * wear]);
    } else {
      pts.push([Math.max(1e-4, r * 0.12), base + (h - base) * 0.995]);
      pts.push([0, h]);
    }
  }
  const g = G.lathe(T, pts, seg, false);
  // A chisel insert is a wedge, not a solid of revolution. Squashing the lathe
  // on one axis is the honest cross-section and costs nothing.
  if (kind === 'chisel') g.scale(1, 1, 0.44);
  return g;
}

/**
 * How far a seated button reaches past its own seat centre, measured off the
 * geometry that will actually ship.
 *
 * THE BIT DIAMETER IS THE CARBIDE, NOT THE STEEL. A bit body is deliberately
 * built under gauge and the gauge row cuts the hole; get the seat radius wrong
 * and you have quoted an 89 mm bit that sweeps 95.5 mm — a bit that could not
 * re-enter its own hole, which is the same defect AUDIT_ACCURACY.md found on
 * the Odex eccentric. Deriving the reach by hand needs a different formula per
 * button shape (a hemisphere reaches its own radius; a ballistic reaches most
 * of its stickout once tilted), so instead this builds the button, rotates it
 * by the seat tilt and reads the largest radial offset off the vertices.
 *
 * Seat the ring at `targetRadius - buttonReach(...)` and the outermost carbide
 * lands exactly on gauge, by construction.
 */
export function buttonReach(T, o) {
  const geo = buttonGeometry(T, o);
  const tilt = o.tilt || 0;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const p = geo.attributes.position;
  let m = 0;
  for (let i = 0; i < p.count; i++) {
    const v = Math.hypot(p.getX(i), p.getZ(i)) * ct + p.getY(i) * st;
    if (v > m) m = v;
  }
  try { geo.dispose(); } catch (e) { /* noop */ }
  return m;
}

/**
 * A snapped-out button: the empty socket with a chipped crater lip.
 *
 * The lip is deliberately kept INSIDE the diameter the button reached. A
 * socket that flared wider than its own button made the bit measure over gauge
 * at the very wear level where it should be measuring under — a lost button
 * cannot cut, so it must not set the cutting diameter either.
 */
export function socketGeometry(T, o) {
  o = o || {};
  const d = o.dia !== undefined ? o.dia : mm(11);
  const r = d * 0.5;
  return G.lathe(T, [
    [0, -r * 1.15], [r * 0.94, -r * 1.0], [r * 0.98, -r * 0.15],
    [r * 1.04, -r * 0.02], [r * 1.00, r * 0.06], [r * 0.86, r * 0.09], [0, r * 0.09],
  ], o.seg || 9, false);
}

/**
 * Scatter carbide over a face.
 * layout entries: { x, y, z, nx, ny, nz, dia, kind, gauge, protrusion }
 * Button loss is deterministic per slot, so a worn bit always reads as the
 * same specific tired object.
 *
 * o.lostGeo(b, i) overrides what a lost slot becomes. A carbide button leaves
 * an open socket; a milled steel tooth leaves a snapped stub; a PDC cutter
 * leaves a brazed pocket. Those must not look the same, so the caller decides.
 * o.lossStart moves the threshold and o.lossRate scales how many go.
 *
 * WASHOUT. Carbide outlasts the steel it is set in, so the second half of a
 * bit's life is the FACE receding, not the buttons shrinking: the flushing
 * scours the body away around each insert until the button stands on a little
 * pedestal, and once enough of the socket wall has gone the button falls out.
 * That is why a scrapped bit has short buttons AND empty holes, and why the
 * survivors look TALLER than they did new. Pass `o.bodyMat` — the bit's own
 * body material — and studFace models it. The pedestals land in the body's
 * existing material bucket, so they merge into the head and cost no draw call.
 */
export function studFace(T, ctx, parent, layout, o) {
  o = o || {};
  const wear = clamp01(o.wear || 0);
  const matC = o.mat || wearMaterial(ctx, 'carbide', wear * 0.8);
  const matS = o.lostMat || o.socketMat || material(ctx, 'wornSteel');
  const seg = o.seg || 10;
  const out = [];
  const lossStart = o.lossStart === undefined ? 0.82 : clamp01(o.lossStart);
  const lossRate = o.lossRate === undefined ? 0.6 : o.lossRate;
  // Steel starts to scour once the bit is over half worn, and the gauge — where
  // the flushing velocity is highest — goes first.
  const washStart = o.washStart === undefined ? 0.42 : o.washStart;
  const wash = clamp01((wear - washStart) / Math.max(1e-3, 1 - washStart));
  const up = new T.Vector3(0, 1, 0);
  for (let i = 0; i < layout.length; i++) {
    const b = layout[i];
    const h = ((i * 2654435761) % 1013) / 1013;
    const h2 = ((i * 40503 + 17) % 251) / 251;
    const lost = wear > lossStart
      && h < ((wear - lossStart) / Math.max(1e-3, 1 - lossStart)) * lossRate;
    const dir = new T.Vector3(b.nx || 0, b.ny === undefined ? 1 : b.ny, b.nz || 0);
    if (dir.lengthSq() < 1e-8) dir.set(0, 1, 0);
    dir.normalize();
    const quat = new T.Quaternion().setFromUnitVectors(up, dir);
    // Every slot wears at its own rate. A face where all thirty buttons are
    // identically blunt is a render; a real one has a couple that took the
    // punishment and a couple that were shielded. A gauge button is the
    // exception — every one of them tracks the same hole wall, they wear
    // together, and the row is what the bit's diameter is measured across, so
    // it is left even and predictable.
    const jit = b.even ? 1 : lerp(0.72, 1.22, h2);
    const bw = clamp01(wear * (b.gauge ? 1.25 : 1) * jit);
    const geo = lost
      ? (o.lostGeo ? o.lostGeo(b, i) : socketGeometry(T, { dia: b.dia, seg: Math.max(7, seg - 2) }))
      : buttonGeometry(T, {
        dia: b.dia, kind: b.kind || o.kind || 'spherical', seg: seg,
        wear: bw, protrusion: b.protrusion,
      });
    // Recess a lost socket into the eroded face, and stand a survivor on the
    // pedestal the scour has left it.
    const lift = wash > 0.02
      ? b.dia * (b.gauge ? 0.30 : 0.20) * wash * (b.even ? 1 : lerp(0.6, 1.3, h2)) : 0;
    const p = [b.x + dir.x * lift, b.y + dir.y * lift, b.z + dir.z * lift];
    out.push(part(T, parent, geo, lost ? matS : matC, { p: p, q: quat, recv: false }));
    if (lift > 1e-5 && !lost && o.bodyMat) {
      // The pedestal never grows wider than the button it carries. Steel that
      // stood proud of the carbide would be steel rubbing the hole wall, which
      // is the binding failure the gauge relief exists to prevent — and it
      // would silently set the bit's measured diameter.
      const pr = b.dia * 0.5;
      out.push(part(T, parent, G.lathe(T, [
        [pr * 1.08, -lift * 1.25], [pr * 1.05, -lift * 0.35], [pr * 1.00, lift * 0.06], [0, lift * 0.06],
      ], Math.max(6, seg - 3), false), o.bodyMat, { p: p, q: quat, recv: false, cast: false }));
    }
  }
  return out;
}

/** Ring of carbide positions on a cone/face — the usual gauge + face rows. */
export function ringLayout(o) {
  const count = o.count || 8;
  const r = o.radius;
  const y = o.y || 0;
  const tilt = o.tilt || 0;          // radians outward from +Y
  const phase = o.phase || 0;
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = phase + (i / count) * TAU;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const st = Math.sin(tilt);
    out.push({
      x: ca * r, y: y, z: sa * r,
      nx: ca * st, ny: Math.cos(tilt), nz: sa * st,
      dia: o.dia, kind: o.kind, gauge: !!o.gauge, protrusion: o.protrusion,
      a: a, r: r,
    });
  }
  return out;
}

/**
 * FLUSHING GROOVES — the waterways.
 *
 * After the buttons, the channels are what identify a percussive bit. Air or
 * water leaves the blow holes at the centre of the face and has to get the
 * cuttings out past the gauge; the route it takes is milled into the bit as a
 * set of grooves that cross the face radially and then run up the outside of
 * the gauge as flats. A bit without them is a mushroom.
 *
 * Returns { depthAt(theta), n, phase, half } where depthAt is 0 on the land
 * and 1 in the middle of a groove, with a cosine shoulder so the groove wall
 * is a real fillet rather than a step. Feed it to profiledLathe's `yFn` for
 * the face and `radiusFn` for the gauge, and to `clearOf()` so no button is
 * ever planted in the middle of a channel.
 */
export function grooveField(o) {
  o = o || {};
  const n = Math.max(1, o.count || 4);
  const phase = o.phase || 0;
  // Angular half-width of one groove. Real face waterways are wide — roughly a
  // fifth of the pitch circle each on a 4-groove bit — because they have to
  // pass the whole cuttings load of that quadrant.
  const half = (o.widthFrac === undefined ? 0.34 : o.widthFrac) * (Math.PI / n);
  const depthAt = (th) => {
    const a = ((th - phase) % (TAU / n) + (TAU / n)) % (TAU / n);
    const d = Math.min(a, (TAU / n) - a);
    if (d >= half) return 0;
    return 0.5 + 0.5 * Math.cos((d / half) * Math.PI);
  };
  return {
    n: n, phase: phase, half: half, depthAt: depthAt,
    /** Nudge a button off the centreline of the nearest groove. */
    clearOf: (th) => {
      const step = TAU / n;
      const a = ((th - phase) % step + step) % step;
      const d = Math.min(a, step - a);
      if (d >= half * 1.35) return th;
      const push = (half * 1.35 - d) * (a < step - a ? 1 : -1);
      return th + push;
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   MERGE / DISPOSE
   ═══════════════════════════════════════════════════════════════════════════ */
function normaliseForMerge(T, geo, matrix) {
  const g = geo.clone();
  if (matrix) g.applyMatrix4(matrix);
  const keep = ['position', 'normal', 'uv'];
  for (const name of Object.keys(g.attributes)) {
    if (keep.indexOf(name) === -1) g.deleteAttribute(name);
  }
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) {
    const n = g.attributes.position.count;
    g.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array(n * 2), 2));
  }
  g.morphAttributes = {};
  g.clearGroups();
  return g;
}

/**
 * Merge every static mesh in a subtree, per material, into one draw call each.
 * Descends into (but never merges across) nodes flagged userData.dynamic, so
 * anything that has to move keeps its own transform. InstancedMesh, Line,
 * Points, Sprite, lights and cameras are left untouched.
 */
export function mergeStatic(T, root) {
  if (!root) return root;
  const dynamicKids = [];
  const buckets = new Map();

  const walk = (node, worldOfNode) => {
    const kids = node.children.slice();
    for (const c of kids) {
      const local = new T.Matrix4().compose(c.position, c.quaternion, c.scale);
      const world = new T.Matrix4().multiplyMatrices(worldOfNode, local);
      if (c.userData && c.userData.dynamic) { dynamicKids.push(c); continue; }
      if (c.isInstancedMesh || c.isLine || c.isPoints || c.isSprite || c.isLight || c.isCamera) continue;
      if (c.isMesh && c.material && !Array.isArray(c.material) && c.geometry) {
        // One bucket per material. Shadow flags are OR-ed rather than split into
        // separate buckets: a decal casting a hairline shadow is invisible, and
        // halving the bucket count is what keeps a rig under its draw budget.
        const key = c.material.uuid;
        let b = buckets.get(key);
        if (!b) { b = { mat: c.material, cast: false, recv: false, items: [] }; buckets.set(key, b); }
        b.cast = b.cast || c.castShadow;
        b.recv = b.recv || c.receiveShadow;
        b.items.push({ mesh: c, world: world });
      }
      walk(c, world);
    }
  };
  walk(root, new T.Matrix4());

  for (const b of buckets.values()) {
    if (b.items.length < 2) continue;
    let list = [];
    let anyNonIndexed = false;
    for (const it of b.items) {
      const g = normaliseForMerge(T, it.mesh.geometry, it.world);
      if (!g.index) anyNonIndexed = true;
      list.push(g);
    }
    if (anyNonIndexed) {
      list = list.map((g) => {
        if (!g.index) return g;
        const n = g.toNonIndexed();
        g.dispose();
        return n;
      });
    }
    let merged = null;
    try { merged = mergeGeometries(list, false); } catch (e) { merged = null; }
    for (const g of list) { try { g.dispose(); } catch (e) { /* noop */ } }
    if (!merged) continue;
    merged.computeBoundingSphere();
    const mesh = new T.Mesh(merged, b.mat);
    mesh.castShadow = b.cast;
    mesh.receiveShadow = b.recv;
    mesh.name = 'merged';
    root.add(mesh);
    for (const it of b.items) {
      if (it.mesh.parent) it.mesh.parent.remove(it.mesh);
      try { it.mesh.geometry.dispose(); } catch (e) { /* noop */ }
    }
  }
  for (const d of dynamicKids) mergeStatic(T, d);
  return root;
}

/** Free every geometry in a subtree plus object-owned materials/textures. */
export function disposeObject(root) {
  if (!root) return;
  const seenGeo = new Set();
  const seenMat = new Set();
  root.traverse((o) => {
    if (o.geometry && !seenGeo.has(o.geometry)) {
      seenGeo.add(o.geometry);
      try { o.geometry.dispose(); } catch (e) { /* noop */ }
    }
    const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
    for (const m of mats) {
      if (!m || seenMat.has(m)) continue;
      seenMat.add(m);
      if (m.userData && m.userData.__own) {
        const keys = ['map', 'normalMap', 'roughnessMap', 'alphaMap', 'emissiveMap', 'metalnessMap'];
        for (const k of keys) {
          const t = m[k];
          if (t && t.dispose && t.userData && t.userData.__own) { try { t.dispose(); } catch (e) { /* noop */ } }
        }
        try { m.dispose(); } catch (e) { /* noop */ }
      }
    }
    if (o.isInstancedMesh && o.dispose) { try { o.dispose(); } catch (e) { /* noop */ } }
  });
  if (root.parent) root.parent.remove(root);
}

/** Finish a tool: merge, tag the spec, attach dispose(), compute framing. */
function finalise(T, g, spec, opts) {
  if (!opts || opts.merge !== false) mergeStatic(T, g);
  g.userData.spec = spec;
  g.userData.wear = clamp01((opts && opts.wear) || 0);
  g.userData.dispose = () => disposeObject(g);
  const box = new T.Box3().setFromObject(g);
  const size = box.getSize(new T.Vector3());
  g.userData.bounds = { min: box.min.toArray(), max: box.max.toArray() };
  g.userData.fitRadius = Math.max(size.x, size.y, size.z) * 0.5 || 0.25;
  return g;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROFILED LATHE — a solid of revolution whose radius is also a function of
   angle. This is what gives bits their real flushing flutes and DTH bits their
   blow-hole channels without CSG.

   `radiusFn` alone can only push the surface in and out radially, which is
   enough for a gauge flute but cannot cut the FACE. A real percussive bit is
   recognised by its face waterways — the channels running from the blow holes
   out to the periphery that the cuttings actually leave by — and those are an
   AXIAL cut, not a radial one. `yFn` supplies that second degree of freedom:
   it returns a y offset in metres, so a face row can be lifted up into the
   body wherever a groove passes. Same mesh, same material, no extra draw call.
   ═══════════════════════════════════════════════════════════════════════════ */
export function profiledLathe(T, pairs, o) {
  o = o || {};
  const cols = Math.max(6, o.segments || 24);
  const fn = o.radiusFn;
  const yfn = o.yFn;
  const pts = creaseRows(pairs, o.creaseDeg === undefined ? 34 : o.creaseDeg)
    .map((p) => [Math.max(1e-5, p[0]), p[1]]);
  if (o.closedProfile !== false) {
    const a = pts[0], b = pts[pts.length - 1];
    if (a[0] !== b[0] || a[1] !== b[1]) pts.push([a[0], a[1]]);
  }
  const rows = pts.length;
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i < rows; i++) {
    const r0 = pts[i][0];
    const y = pts[i][1];
    for (let j = 0; j <= cols; j++) {
      const th = (j / cols) * TAU;
      const r = fn ? r0 * fn(th, r0, y, i) : r0;
      pos.push(Math.cos(th) * r, y + (yfn ? yfn(th, r, y, i) : 0), Math.sin(th) * r);
      uv.push(j / cols, i / (rows - 1));
    }
  }
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = a + 1;
      const c = a + (cols + 1);
      const d = c + 1;
      idx.push(a, c, d, a, d, b);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // Auto-correct winding: the widest vertex must face outward.
  const p = g.attributes.position;
  const n = g.attributes.normal;
  let best = -1;
  let bestR = -1;
  for (let i = 0; i < p.count; i++) {
    const r = p.getX(i) * p.getX(i) + p.getZ(i) * p.getZ(i);
    if (r > bestR) { bestR = r; best = i; }
  }
  if (best >= 0 && bestR > 1e-9) {
    const dot = p.getX(best) * n.getX(best) + p.getZ(best) * n.getZ(best);
    if (dot < 0) {
      const arr = g.index.array;
      for (let i = 0; i < arr.length; i += 3) { const t = arr[i + 1]; arr[i + 1] = arr[i + 2]; arr[i + 2] = t; }
      g.index.needsUpdate = true;
      g.computeVertexNormals();
    }
  }
  return g;
}

/**
 * A flushing hole / nozzle port. An open back-faced cone gives genuine
 * perceived depth without booleans, and the chamfer ring sells the countersink.
 */
export function flushHole(T, ctx, parent, o) {
  o = o || {};
  const r = o.r || mm(5);
  const depth = o.depth || r * 2.6;
  const seg = o.seg || 10;
  const mat = material(ctx, '__hole', { color: 0x090B0D, roughness: 0.92, metalness: 0.15, side: T.BackSide });
  const cone = new T.ConeGeometry(r, depth, seg, 1, true);
  const up = new T.Vector3(0, 1, 0);
  const dir = o.dir ? new T.Vector3(o.dir[0], o.dir[1], o.dir[2]).normalize() : up.clone();
  const quat = new T.Quaternion().setFromUnitVectors(up, dir);
  const base = new T.Vector3(o.x || 0, o.y || 0, o.z || 0);
  const mid = base.clone().add(dir.clone().multiplyScalar(depth * 0.5));
  const m = part(T, parent, cone, mat, { p: mid.toArray(), q: quat, cast: false, recv: false });
  if (o.chamfer !== false) {
    const ring = G.lathe(T, [[r, 0], [r * 1.38, mm(1.6)]], seg, false);
    part(T, parent, ring, o.chamferMat || material(ctx, 'wornSteel'), { p: base.toArray(), q: quat, cast: false });
  }
  return m;
}

/** A weld bead ring — irregular, like a real hand-laid fillet. */
export function weldBead(T, r, tube, seg) {
  const g = new T.TorusGeometry(r, tube, 5, seg || 26);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const a = Math.atan2(y, x);
    const nse = Math.sin(a * 13.0) * 0.2 + Math.sin(a * 27.0 + 1.1) * 0.12;
    p.setXYZ(i, x * (1 + nse * 0.035), y * (1 + nse * 0.035), z * (1 + nse * 0.5));
  }
  g.computeVertexNormals();
  g.rotateX(Math.PI / 2);
  return g;
}

/**
 * Bolt circle as one InstancedMesh (hex heads, correct across-flats).
 *
 * `o.merge: true` emits plain meshes instead. An InstancedMesh is always its
 * own draw call — mergeStatic() steps over it deliberately — so below roughly
 * eight bolts instancing COSTS a draw call rather than saving one: the same
 * triangles would otherwise have folded into the parent's material bucket for
 * free. Anything with a small flange should ask for merge.
 */
export function boltRing(T, ctx, parent, o) {
  o = o || {};
  const count = o.count || 8;
  const r = o.radius || mm(60);
  const af = o.acrossFlats || mm(17);
  const h = o.height || mm(11);
  const geo = G.cyl(T, af * 0.577, af * 0.577, h, 6);
  const mat = o.mat || material(ctx, 'wornSteel');
  if (o.merge) {
    const d = new T.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (o.phase || 0) + (i / count) * TAU;
      d.position.set(Math.cos(a) * r, o.y || 0, Math.sin(a) * r);
      d.rotation.set(o.rx || 0, a, o.rz || 0);
      if (o.axis === 'z') { d.rotation.set(Math.PI / 2, 0, a); d.position.set(Math.cos(a) * r, Math.sin(a) * r, o.z || 0); }
      part(T, parent, geo.clone(), mat, {
        p: [d.position.x, d.position.y, d.position.z],
        r: [d.rotation.x, d.rotation.y, d.rotation.z],
        cast: false, name: 'bolt',
      });
    }
    geo.dispose();
    return null;
  }
  const inst = new T.InstancedMesh(geo, mat, count);
  const d = new T.Object3D();
  for (let i = 0; i < count; i++) {
    const a = (o.phase || 0) + (i / count) * TAU;
    d.position.set(Math.cos(a) * r, o.y || 0, Math.sin(a) * r);
    d.rotation.set(o.rx || 0, a, o.rz || 0);
    if (o.axis === 'z') { d.rotation.set(Math.PI / 2, 0, a); d.position.set(Math.cos(a) * r, Math.sin(a) * r, o.z || 0); }
    d.updateMatrix();
    inst.setMatrixAt(i, d.matrix);
  }
  inst.instanceMatrix.needsUpdate = true;
  inst.castShadow = true;
  inst.receiveShadow = true;
  if (parent) parent.add(inst);
  return inst;
}

/**
 * The lit face of an operator display, cached and shared.
 *
 * The base colour is nearly black on purpose: in daylight a screen is a dark
 * glass rectangle, and an amber DIFFUSE is what made the old consoles read as
 * a yellow paint chip. All of the yellow comes from the emissive, gated by the
 * mask, so the panel is dark where the readout is not.
 */
export function screenMaterial(ctx, o) {
  o = o || {};
  const col = o.color === undefined ? 0xE0A85A : o.color;
  const T = (ctx && ctx.THREE) || THREE;
  const tex = consoleTexture(T);
  // Without the mask the whole face would sit at the readout's brightness, so
  // an unmapped fallback (headless preview, no canvas) is pulled back to a
  // barely-blooming panel rather than a blazing rectangle.
  const over = tex ? (o.over === undefined ? GLOW.screen : o.over) : 1.15;
  const intensity = glowIntensity(col, over);
  const key = 'screen:' + col.toString(16) + ':' + intensity.toFixed(3);
  const hit = _matCache.get(key);
  if (hit) return hit;
  const m = new T.MeshStandardMaterial({
    color: 0x05070A, roughness: 0.36, metalness: 0.0,
    emissive: new T.Color(col), emissiveIntensity: intensity,
  });
  if (tex) m.emissiveMap = tex;
  m.name = 'lib:' + key;
  m.userData.__lib = true;
  m.userData.baseEmissive = intensity;
  _matCache.set(key, m);
  return m;
}

/**
 * A complete operator display: hooded bezel, lit face, cover lens.
 *
 * Local frame is the XY plane looking down +Z, so it drops straight into the
 * position/rotation an old flat screen quad used.
 *
 * o = { w, h, p, r, name, color, over, bezelMat, own }
 *   own — clone the material so the caller can pulse emissiveIntensity per rig
 *         (userData.baseEmissive carries the authored value to scale against).
 * Returns { group, screen, material, base }.
 */
export function buildScreenPanel(T, ctx, parent, o) {
  o = o || {};
  const w = o.w || 0.30;
  const h = o.h || 0.20;
  // Deliberately NOT flagged dynamic: the case and the lens want to fall into
  // the buckets the parent already owns. The lit face survives the merge on
  // its own because an `own` clone is a material of one, and mergeStatic
  // leaves single-item buckets exactly where they are.
  const g = group(T, parent, o.name || 'console', { p: o.p, r: o.r });
  const bez = o.bezelMat || material(ctx, 'plastic');

  // hooded case: the frame is what gives a 18 px display a silhouette at all
  part(T, g, G.roundedBox(T, w * 1.18, h * 1.32, 0.034, Math.min(w, h) * 0.07, 2), bez,
    { p: [0, 0, -0.017], name: 'bezel' });
  part(T, g, G.box(T, w * 1.18, 0.011, h * 0.30), bez,
    { p: [0, h * 0.68, h * 0.12], r: [0.42, 0, 0], cast: false, name: 'sun-hood' });

  let mat = screenMaterial(ctx, { color: o.color, over: o.over });
  const base = mat.userData.baseEmissive;
  if (o.own) {
    const c = mat.clone();
    // fresh userData object — never share it with the cached library material
    c.userData = { __own: true, baseEmissive: base };
    mat = c;
  }
  const screen = part(T, g, G.plane(T, w, h), mat,
    { p: [0, 0, 0.002], cast: false, recv: false, name: 'screen' });
  // The lens is a transparent draw of its own wherever no sibling already owns
  // that material, so LOW gives it up: on a phone at LOW the specular it
  // exists for is a single pixel.
  if (o.lens !== false) {
    part(T, g, G.plane(T, w * 1.04, h * 1.09), material(ctx, '__screenGlass'),
      { p: [0, 0, 0.007], cast: false, recv: false, name: 'screen-lens' });
  }

  return { group: g, screen: screen, material: mat, base: base };
}

export const TOOL_UTILS = {
  mm, part, group, G, material, wearMaterial, threadGeometry, addPinThread,
  addBoxThread, flightGeometry, buttonGeometry, socketGeometry, studFace,
  ringLayout, grooveField, BUTTON_STICKOUT, mergeStatic, disposeObject,
  THREAD_SPECS, TEXTURES,
  clamp01, lerp, DEG, TAU, finalise, profiledLathe, flushHole, weldBead,
  boltRing, buildScreenPanel, screenMaterial, glowIntensity, linearLuminance,
  GLOW, BLOOM_THRESHOLD, bitBodyMaterial,
  // §12d — the oil-well vocabulary (declarations below are hoisted)
  rotaryConnection, bitConnectionFor, addRotaryPin, addRotaryBox,
  taperedThreadGeometry, arcSector, pipeGeometry,
};

/* ═══════════════════════════════════════════════════════════════════════════
   §1 PERCUSSION — TOP HAMMER
   ═══════════════════════════════════════════════════════════════════════════ */

const BIT_DIA_FOR_THREAD = {
  R25: 41, R28: 45, R32: 64, R38: 76, R44: 89, R51: 89,
  T38: 76, T45: 89, T51: 102, T60: 127, GT60: 127, T76: 152, H90: 178,
};

/* ═══════════════════════════════════════════════════════════════════════════
   BUTTON POPULATIONS — off the catalogue tables, not off a curve fit.
   ═══════════════════════════════════════════════════════════════════════════
   How many buttons a bit carries, and how big they are, is published per
   diameter and it does NOT follow a smooth law: makers step the carbide size
   and jump the count at particular sizes. `round(diaMm / 12)` gave a 45 mm bit
   four gauge buttons where every catalogue says six, and a 127 mm bit eleven
   where they all say nine.

   Rows are [maxDiaMm, gaugeCount, gaugeButtonMm, faceCount, faceButtonMm].

   TOP HAMMER — Sandvik top-hammer brochure (front/gauge button tables, T38 to
   T51, 64-127 mm) and Epiroc's tophammer catalogue (centre/gauge split, 33-76
   mm); `Top_Hammer_Tools.pdf` for the 45-57 mm drifting sizes.

   DTH — Epiroc DTH product catalogue (Outer/Inner/Front columns, 70-254 mm),
   cross-checked against Rockmore's 2025 DTH section 2 (85-150 mm), which
   agrees within one button and one carbide step throughout. */
export const TH_BUTTONS = [
  [36, 5, 8, 2, 7], [43, 6, 9, 3, 8], [48, 6, 9, 3, 9], [57, 6, 10, 3, 10],
  [64, 6, 11, 4, 11], [70, 8, 11, 5, 10], [76, 8, 12, 5, 11], [89, 8, 13, 5, 12],
  [102, 9, 13, 9, 11], [115, 9, 14, 10, 12], [127, 9, 14, 10, 13],
  [152, 12, 13, 8, 13], [178, 12, 16, 10, 14],
];
export const DTH_BUTTONS = [
  [70, 6, 10, 5, 10], [80, 6, 12, 5, 10], [89, 6, 12, 5, 10],
  [100, 8, 12.7, 7, 11], [110, 8, 14.5, 7, 12.7], [125, 8, 14.5, 8, 12.7],
  [130, 8, 15.8, 8, 14.5], [152, 8, 16, 9, 16], [165, 10, 16, 10, 16],
  [203, 12, 19, 9, 19], [270, 12, 19, 11, 19],
];
/** Pick the catalogue row for a diameter; the last row covers everything over. */
export function bitButtonRow(table, diaMm) {
  for (let i = 0; i < table.length; i++) if (diaMm <= table[i][0]) return table[i];
  return table[table.length - 1];
}

/**
 * Top-hammer button bit. Drop-centre face, gauge row, face rows, four flushing
 * flutes, two face flushing holes, female rope thread up the bore.
 * opts: { thread:'R32'|'T38'|'T45'|'T51'|…, diameterMm, wear, buttonKind,
 *         flutes, lod:'low'|'high' }
 */
export function buildButtonBit(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const thread = String(opts.thread || 'T45').toUpperCase();
  const ts = THREAD_SPECS[thread] || THREAD_SPECS.T45;
  const diaMm = opts.diameterMm || BIT_DIA_FOR_THREAD[thread] || 89;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const btnSeg = low ? 7 : 10;
  const kind = opts.buttonKind || (diaMm >= 89 ? 'ballistic' : 'spherical');
  const flutes = opts.flutes === undefined ? 4 : opts.flutes;

  const R = mm(diaMm) * 0.5;
  const headLen = mm(Math.max(72, diaMm * 0.82));
  const faceY = -headLen;
  const boreR = mm(ts.majorMm) * 0.5 + mm(1.2);

  const g = new T.Group();
  g.name = 'button-bit';
  const steel = bitBodyMaterial(ctx, wear * 0.85);
  const worn = material(ctx, 'wornSteel');

  /* ── GAUGE: THE CARBIDE CUTS THE HOLE, THE STEEL DOES NOT ────────────────
     A bit body is deliberately built UNDER gauge and the gauge row stands proud
     of it, so that the buttons meet the rock and the steel never binds. Halco
     states the build tolerance directly — "the drill head diameter across
     buttons should be 0.80 mm greater than gauge diameter" — and Rockmore and
     Epiroc both state the other half: a button bit leaves the factory 0.5-2.5 mm
     OVER its catalogue size, because it loses that in the first few metres.

     Boart Longyear gives the scrap rule, and it closes the envelope: the bit is
     finished when "the diameter across the gauge is less than or equal to the
     diameter of the bit body", because at that point it binds. So wear 0 is
     nominal + oversize across the carbide, wear 1 is carbide back level with a
     body that has itself worn in, and the whole usable travel is about 2 mm on
     diameter.

     The steel loses it as a TAPER, not as a smaller cylinder — hardest scrub is
     at the corner that meets uncut rock — and that cone is why a worn bit has
     to be reamed into its own last hole. `steelR(y)` is the only place body
     radius is decided, so silhouette and button ring cannot disagree. */
  const overMm = clampv(diaMm * 0.010, 0.6, 2.5);     // factory oversize
  const underMm = clampv(diaMm * 0.009, 0.5, 2.0);    // body under gauge, new
  const bodyR = mm(diaMm - underMm) * 0.5;
  const cutR = mm(diaMm + overMm - (overMm + underMm * 1.7) * wear) * 0.5;
  const steelNose = bodyR - mm(underMm * 0.7) * wear;
  const skirtTop = faceY + mm(34);
  const steelR = (y) => bodyR - (bodyR - steelNose) * clamp01((skirtTop - y) / (skirtTop - faceY));
  const Rw = steelNose;

  /* The face. A top-hammer bit under about 64 mm is flat or lightly convex —
     one flushing hole, and the whole face cuts. Above that it is DROP-CENTRE:
     the middle is sunk below the gauge row so the outer ring bites first and
     the bit steers itself straight instead of walking. `drop` is the depth of
     that centre relative to the gauge corner. */
  const style = opts.face || (diaMm >= 64 ? 'drop' : 'flat');
  const drop = style === 'drop' ? mm(clampv(diaMm * 0.085, 4.5, 14))
    : (style === 'convex' ? -mm(clampv(diaMm * 0.055, 3, 8)) : mm(1.2));
  /* Profile of the face from centre out: sunk centre, a straight ramp out to
     the shoulder, then the gauge corner chamfer. */
  const faceAt = (r) => {
    const u = clamp01(r / (Rw * 0.90));
    return faceY + drop * (1 - Math.pow(u, 1.7)) + mm(0.6) * u;
  };

  // Four waterways, running from the blow holes across the face, over the
  // gauge corner and up the skirt as flushing grooves.
  const gr = grooveField({ count: flutes || 1, phase: 0.35, widthFrac: 0.40 });
  const grooveY = mm(clampv(diaMm * 0.075, 3.5, 11));
  const grooveR = clampv(diaMm * 0.0016, 0.10, 0.17);   // fraction of radius

  const faceRows = [];
  for (let i = 0; i <= 5; i++) {
    const rr = Rw * 0.92 * (i / 5);
    faceRows.push([Math.max(0.0001, rr), faceAt(rr)]);
  }
  const cornerY = faceY + mm(clampv(diaMm * 0.10, 6, 16));
  const profile = faceRows.concat([
    [Rw * 0.965, faceAt(Rw * 0.965)],        // shoulder before the corner
    [Rw, cornerY],                           // gauge corner chamfer
    [steelR(faceY + mm(24)), faceY + mm(24)],
    [steelR(skirtTop), skirtTop],
    [bodyR * 0.985, faceY + mm(44)],
    [bodyR * 0.985, -mm(16)],
    [bodyR * 0.94, -mm(5)],                  // relief behind the skirt
    [bodyR * 0.94, 0],
    [boreR, 0],
    [boreR, faceY + mm(30)],
    [boreR * 0.5, faceY + mm(35)],
    [0.0001, faceY + mm(35)],
  ]);
  // Row indices shift when profiledLathe splits creases, so every gate below
  // is geometric. `outside` separates the skin from the bore, which is the one
  // distinction a radius alone cannot make on a small bit, where the thread
  // bore is most of the diameter.
  const outside = (r) => r > boreR * 1.05;
  const body = profiledLathe(T, profile, {
    segments: seg,
    // The skirt flute: deep, and it runs from the gauge corner up past the
    // shoulder, because the cuttings have to keep moving after they leave the
    // face. Shallower right at the corner so the gauge row keeps its steel.
    radiusFn: (th, r, y) => {
      if (!outside(r)) return 1;
      // Wrench flats up at the back, where the crew breaks the bit off the rod.
      if (y > -mm(17) && y < -mm(3.5)) {
        const a = ((th * 4 + 0.6) % TAU + TAU) % TAU;
        const d = Math.min(a, TAU - a) / Math.PI;
        return d < 0.30 ? 1 - 0.048 * (1 - d / 0.30) : 1;
      }
      if (!flutes || y < cornerY) return 1;
      const t = clamp01((y - cornerY) / mm(26));
      return 1 - grooveR * gr.depthAt(th) * lerp(0.45, 1, t);
    },
    // The face waterway: an axial cut, deepest across the middle of the face
    // and running out over the corner chamfer.
    yFn: (th, r, y) => {
      if (!flutes || y > cornerY + 1e-6) return 0;
      const w = r <= Rw * 0.97 ? 1 : 0.62;
      return grooveY * gr.depthAt(th) * w * clamp01(0.30 + r / (Rw * 0.55));
    },
  });
  part(T, g, body, steel, { name: 'head' });

  // ── carbide ──────────────────────────────────────────────────────────────
  const row = bitButtonRow(TH_BUTTONS, diaMm);
  const gaugeCount = opts.gaugeButtons || row[1];
  const gaugeDia = mm(row[2]);
  const faceCount = opts.faceButtons || row[3];
  const faceDia = mm(row[4]);
  const onLand = (ring) => ring.map((b) => {
    const a = gr.clearOf(b.a);
    const st = Math.sin(b.tiltR || 0);
    return Object.assign({}, b, {
      x: Math.cos(a) * b.r, z: Math.sin(a) * b.r,
      nx: Math.cos(a) * st, nz: Math.sin(a) * st, a: a,
    });
  });
  /* GAUGE ROW. 35 degrees is the industry default — Epiroc lists it on every
     flat-front and concave DTH row from 70 to 254 mm, and `Top_Hammer_Tools`
     codes the three available angles as L/M/H = 30/35/40. The seat radius is
     then SOLVED, not chosen: buttonReach() measures how far this exact button
     at this exact tilt and wear stands out from its own seat, and the ring is
     placed so the outermost carbide lands on the cutting diameter. That is the
     only way the quoted figure can be read off the mesh at every wear level. */
  const gaugeTilt = (opts.gaugeAngle || 35) * DEG;
  const gaugeWear = clamp01(wear * 1.25);
  const gaugeLift = gaugeDia * 0.30 * clamp01((wear - 0.42) / 0.58);
  const reach = buttonReach(T, {
    dia: gaugeDia, kind: kind, tilt: gaugeTilt, wear: gaugeWear, seg: btnSeg,
  }) + gaugeLift * Math.sin(gaugeTilt);
  const layout = ringLayout({
    count: gaugeCount, radius: cutR - reach, y: faceY + mm(clampv(diaMm * 0.055, 3.2, 8)),
    tilt: gaugeTilt, dia: gaugeDia, kind: kind, gauge: true, phase: 0.3,
  }).map((b) => Object.assign(b, { tiltR: gaugeTilt, even: true }));
  /* Face rows. Epiroc publishes an explicit *Indexing* column: the front row is
     rotated off the gauge row so the two do not track the same groove in the
     rock. Inner rows run at 20 degrees, centre buttons close to axial. */
  const outerN = Math.max(2, Math.round(faceCount * 0.62));
  const innerN = Math.max(1, faceCount - outerN - (style !== 'drop' && diaMm >= 76 ? 1 : 0));
  const rOuter = Rw * 0.62;
  layout.push.apply(layout, onLand(ringLayout({
    count: outerN, radius: rOuter,
    y: faceAt(rOuter), tilt: 20 * DEG, dia: faceDia, kind: kind,
    phase: 0.3 + Math.PI / gaugeCount,
  }).map((b) => Object.assign(b, { tiltR: 20 * DEG }))));
  const rInner = Rw * 0.28;
  layout.push.apply(layout, onLand(ringLayout({
    count: innerN, radius: rInner, y: faceAt(rInner), tilt: 6 * DEG,
    dia: faceDia * 0.94, kind: kind, phase: 1.7,
  }).map((b) => Object.assign(b, { tiltR: 6 * DEG }))));
  // A drop-centre face is drop-centre precisely so that nothing sits in the
  // middle; a flat face carries a centre button, and on a bit this size it is
  // the first one to go.
  if (style !== 'drop' && diaMm >= 76) layout.push({ x: 0, y: faceAt(0), z: 0, dia: faceDia * 0.9, kind: kind });
  studFace(T, ctx, g, layout, { wear: wear, seg: btnSeg, bodyMat: steel });

  /* ── FLUSHING ────────────────────────────────────────────────────────────
     Sandvik lists 3-4 front holes of 8-14 mm across the 64-127 mm top-hammer
     range (T38 64 mm = 3 × 8, T45 89 mm = 4 × 9, T51 115 mm = 3 × 14), and
     Sandvik's own patent EP2902583 states the placement rule: the apertures sit
     "radially between front buttons and gauge buttons". They open into the
     FLOOR of a waterway — a hole discharging onto a land has nowhere to send
     the chips. Small drifting bits additionally carry one side hole through the
     skirt, which `Top_Hammer_Tools` codes as flushing style W. */
  const holes = opts.flushHoles || (diaMm >= 100 ? 3 : (diaMm >= 56 ? 4 : 3));
  const holeR = mm(clampv(diaMm * 0.105, 8, 14)) * 0.5;
  const rHole = Rw * 0.46;
  for (let i = 0; i < holes; i++) {
    const a = gr.phase + (i / holes) * TAU;
    flushHole(T, ctx, g, {
      x: Math.cos(a) * rHole, y: faceAt(rHole) + grooveY * gr.depthAt(a) * 0.85 - mm(0.4),
      z: Math.sin(a) * rHole,
      r: holeR, dir: [0, -1, 0], seg: low ? 8 : 11, chamferMat: worn,
    });
  }

  // ── connection ───────────────────────────────────────────────────────────
  addBoxThread(T, ctx, g, thread, {
    y0: -mm(4), length: mm(ts.pitchMm * 3.6), quality: low ? 0 : 0.7, down: true,
  });
  part(T, g, G.lathe(T, [[boreR, 0], [boreR * 1.18, mm(3)]], seg, false), worn, { p: [0, 0, 0], cast: false });

  return finalise(T, g, {
    id: 'button-bit', family: 'Drill Bits & Cutting Tools / Button Bits',
    name: 'Drillity ' + thread + ' Button Bit ' + diaMm + ' mm',
    thread: thread, diameterMm: diaMm, lengthMm: Math.round(headLen * 1000),
    buttons: layout.length, buttonKind: kind, gaugeButtons: gaugeCount,
    gaugeButtonMm: row[2], faceButtonMm: row[4], gaugeAngleDeg: Math.round(gaugeTilt / DEG),
    face: style, flutes: flutes, flushHoles: holes,
    // A button bit leaves the works over-size and is scrapped under it: the
    // carbide sweeps this, and it is measured off the mesh by .qa-dimensions.
    cutDiameterMm: Math.round(cutR * 2000 * 10) / 10,
    material: 'Carbide grade DP55 / body 42CrMo4(V)',
    method: 'top-hammer', priceEur: Math.round(120 + diaMm * 3.4),
  }, opts);
}

/**
 * DTH bit — splined shank (DHD/QL-style), retaining-ring groove, wear-sleeve
 * shoulder, flat front with a gauge row on the corner and two blow holes.
 * opts: { shank:'DHD3'|'DHD35'|'QL5'|'QL6'|'MISSION4', diameterMm, wear,
 *         face:'flat'|'concave'|'convex'|'drop' }
 *
 * The default face is FLAT FRONT, which is what Epiroc's catalogue carries on
 * every size from 70 to 165 mm and describes as "hard and abrasive formations,
 * all round" with "strong gauge rows with large spherical buttons which are
 * easy to regrind". Convex fronts are ballistic and for soft non-abrasive rock;
 * concave fronts carry cone buttons at −20°. A DTH bit is a hard-rock tool by
 * definition, so the flat front is the honest default and the previous
 * dome-fronted spherical face was the exception dressed as the rule.
 */
export function buildDTHBit(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const shank = String(opts.shank || 'QL5').toUpperCase();
  /* `len` is the OVERALL bit length for that shank family, off the Epiroc DTH
     catalogue's shank drawings: DHD 3.5 = 180.9 · DHD 340A/TD 40 = 209 ·
     QL 50 = 239.6 · QL 60 = 253.3 mm. It gives L/D ≈ 1.6-2.0, which is what
     the catalogue weights corroborate. The previous code derived length from
     bit diameter alone (2.4 D) and made every bit half a head too long. */
  const SH = {
    DHD3: { dia: 76, splines: 6, len: 165 }, DHD35: { dia: 89, splines: 6, len: 180.9 },
    QL5: { dia: 102, splines: 6, len: 239.6 }, QL6: { dia: 127, splines: 6, len: 253.3 },
    MISSION4: { dia: 89, splines: 6, len: 209 }, NUMA4: { dia: 89, splines: 6, len: 209 },
  };
  const sh = SH[shank] || SH.QL5;
  const diaMm = opts.diameterMm || Math.round(sh.dia * 1.45);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const btnSeg = low ? 7 : 10;

  const R = mm(diaMm) * 0.5;
  // Same sourced gauge envelope as the top-hammer bit: built over-size across
  // the carbide, under-size across the steel, scrapped when the two meet.
  const overMm = clampv(diaMm * 0.010, 0.6, 2.5);
  const underMm = clampv(diaMm * 0.009, 0.5, 2.0);
  const bodyR = mm(diaMm - underMm) * 0.5;
  const cutR = mm(diaMm + overMm - (overMm + underMm * 1.7) * wear) * 0.5;
  /* The shank cannot be fatter than the bit it is cut into. `ith-bit-89` asks
     for a DHD 3.5 shank — nominally 89 mm — on an 89 mm bit, and built
     literally that gave a bit whose drive collar swept 90.8 mm while its
     carbide swept 89.9: a bit that could not pass through the hole it had just
     drilled. In the real catalogue a DHD 3.5 starts at 90 mm and the 89 mm
     hole is a DHD 3 job, so the clamp both fixes the mesh and picks the right
     hammer. The shoulder under the chuck sits at 0.86 of the body, and the
     collar above the shank is 1.02 of the shank, so 0.84 is the ceiling. */
  const shankR = Math.min(mm(sh.dia) * 0.5, bodyR * 0.84);
  const totalLen = mm(Math.max(sh.len, diaMm * 1.55));
  const headLen = totalLen * 0.42;
  const shankLen = totalLen - headLen;
  const faceY = -totalLen;
  const noseR = bodyR - mm(underMm * 0.7) * wear;
  const skirtTop = faceY + headLen * 0.55;
  const steelR = (y) => bodyR - (bodyR - noseR) * clamp01((skirtTop - y) / (skirtTop - faceY));
  const Rw = noseR;
  const g = new T.Group();
  g.name = 'dth-bit';
  const steel = bitBodyMaterial(ctx, wear * 0.85);
  const worn = material(ctx, 'wornSteel');

  const style = opts.face || 'flat';
  const drop = style === 'concave' ? mm(clampv(diaMm * 0.06, 4, 12))
    : (style === 'convex' ? -mm(clampv(diaMm * 0.05, 3, 9))
      : (style === 'drop' ? mm(clampv(diaMm * 0.075, 4, 12)) : mm(1.5)));
  const faceAt = (r) => {
    const u = clamp01(r / (Rw * 0.90));
    return faceY + drop * (1 - Math.pow(u, style === 'concave' ? 2.4 : 1.7)) + mm(0.6) * u;
  };

  /* Waterways. Sandvik's EP2902583 describes a percussive bit with three
     flushing passageways and three grooves, and gauge buttons grouped two per
     collar segment BETWEEN them — the grooves interrupt the gauge row, which is
     the silhouette fact. It also gives the groove's own shape: about 55 degrees
     to the axis across the face, easing to about 15 up the gauge, and "a depth
     … increases generally from the front face towards the shank". */
  const flutes = opts.flutes === undefined ? 4 : opts.flutes;
  const gr = grooveField({ count: flutes || 1, phase: 0.25, widthFrac: 0.40 });
  const grooveY = mm(clampv(diaMm * 0.07, 4, 13));
  const grooveR = clampv(diaMm * 0.0014, 0.09, 0.16);

  const faceRows = [];
  for (let i = 0; i <= 5; i++) {
    const rr = Rw * 0.92 * (i / 5);
    faceRows.push([Math.max(0.0001, rr), faceAt(rr)]);
  }
  const cornerY = faceY + mm(clampv(diaMm * 0.085, 6, 18));
  const headTop = faceY + headLen;
  const profile = faceRows.concat([
    [Rw * 0.965, faceAt(Rw * 0.965)],
    [Rw, cornerY],
    [steelR(faceY + mm(24)), faceY + mm(24)],
    [steelR(skirtTop), skirtTop],
    [bodyR * 0.99, headTop - mm(8)],
    [bodyR * 0.86, headTop],                     // shoulder under the chuck
    [shankR * 1.02, headTop + mm(6)],
    [shankR, headTop + mm(16)],
    [shankR * 0.90, headTop + mm(26)],           // retaining-ring groove
    [shankR * 0.90, headTop + mm(40)],
    [shankR, headTop + mm(50)],
    [shankR, -mm(6)],
    [shankR * 0.88, 0],
    [mm(11), 0],
    [mm(11), headTop + mm(24)],                  // foot-valve bore
    [0.0001, headTop + mm(30)],
  ]);
  const splines = sh.splines;
  const outside = (r) => r > mm(11) * 1.4;
  const body = profiledLathe(T, profile, {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (!outside(r)) return 1;
      if (y > headTop + mm(4) && r > shankR * 0.7) {
        // external drive splines on the shank
        const a = ((th * splines) % TAU + TAU) % TAU;
        const d = Math.min(a, TAU - a) / Math.PI;
        return 1 - 0.085 * Math.max(0, 1 - d * 2.4);
      }
      if (!flutes || y < cornerY || y > headTop) return 1;
      const t = clamp01((y - cornerY) / (headTop - cornerY));
      return 1 - grooveR * gr.depthAt(th) * lerp(0.45, 1, t);
    },
    yFn: (th, r, y) => {
      if (!flutes || y > cornerY + 1e-6) return 0;
      const w = r <= Rw * 0.97 ? 1 : 0.62;
      return grooveY * gr.depthAt(th) * w * clamp01(0.30 + r / (Rw * 0.55));
    },
  });
  part(T, g, body, steel, { name: 'head' });

  const row = bitButtonRow(DTH_BUTTONS, diaMm);
  const gaugeCount = opts.gaugeButtons || row[1];
  const gaugeDia = mm(row[2]);
  const faceCount = opts.faceButtons || row[3];
  const faceDia = mm(row[4]);
  // Flat and concave fronts run spherical gauge buttons (Epiroc: "large
  // spherical buttons which are easy to regrind"); convex fronts are the
  // ballistic design. Gauge 35 degrees, inner row 20 — both straight off the
  // catalogue's own angle columns.
  const gKind = opts.buttonKind || (style === 'convex' ? 'ballistic' : 'spherical');
  const fKind = opts.faceButtonKind || (style === 'convex' ? 'ballistic' : 'spherical');
  const gaugeTilt = (opts.gaugeAngle || (style === 'convex' ? 40 : 35)) * DEG;
  const gaugeWear = clamp01(wear * 1.25);
  const gaugeLift = gaugeDia * 0.30 * clamp01((wear - 0.42) / 0.58);
  const reach = buttonReach(T, {
    dia: gaugeDia, kind: gKind, tilt: gaugeTilt, wear: gaugeWear, seg: btnSeg,
  }) + gaugeLift * Math.sin(gaugeTilt);
  const onLand = (ring) => ring.map((b) => {
    const a = gr.clearOf(b.a);
    const st = Math.sin(b.tiltR || 0);
    return Object.assign({}, b, {
      x: Math.cos(a) * b.r, z: Math.sin(a) * b.r,
      nx: Math.cos(a) * st, nz: Math.sin(a) * st, a: a,
    });
  });
  const layout = ringLayout({
    count: gaugeCount, radius: cutR - reach, y: faceY + mm(clampv(diaMm * 0.05, 3.5, 9)),
    tilt: gaugeTilt, dia: gaugeDia, kind: gKind, gauge: true, phase: 0.25,
  }).map((b) => Object.assign(b, { tiltR: gaugeTilt, even: true }));
  const rOut = Rw * 0.64;
  const outerN = Math.max(2, Math.round(faceCount * 0.6));
  layout.push.apply(layout, onLand(ringLayout({
    count: outerN, radius: rOut, y: faceAt(rOut),
    tilt: 20 * DEG, dia: faceDia, kind: fKind, phase: 0.25 + Math.PI / gaugeCount,
  }).map((b) => Object.assign(b, { tiltR: 20 * DEG }))));
  const rIn = Rw * 0.28;
  layout.push.apply(layout, onLand(ringLayout({
    count: Math.max(1, faceCount - outerN), radius: rIn, y: faceAt(rIn),
    // A concave front's cone buttons lean INWARD — Epiroc prints the angle as
    // −20 — because they are cutting the pilot cone the dish leaves standing.
    tilt: (style === 'concave' ? -20 : 8) * DEG,
    dia: faceDia, kind: style === 'concave' ? 'conical' : fKind, phase: 1.4,
  }).map((b) => Object.assign(b, { tiltR: (style === 'concave' ? -20 : 8) * DEG }))));
  studFace(T, ctx, g, layout, { wear: wear, seg: btnSeg, bodyMat: steel });

  // Two blow holes on every size Epiroc lists from 70 to 152 mm; three from
  // 165 up. They open into the floor of a waterway.
  const holes = opts.flushHoles || (diaMm >= 160 ? 3 : 2);
  const rHole = Rw * 0.44;
  for (let i = 0; i < holes; i++) {
    const a = gr.phase + (i / holes) * TAU;
    flushHole(T, ctx, g, {
      x: Math.cos(a) * rHole, y: faceAt(rHole) + grooveY * gr.depthAt(a) * 0.85 - mm(0.4),
      z: Math.sin(a) * rHole,
      r: mm(clampv(diaMm * 0.06, 4, 9)), dir: [0, -1, 0], seg: low ? 8 : 11, chamferMat: worn,
    });
  }
  // retaining-ring in the groove
  part(T, g, G.torus(T, shankR * 0.93, mm(3.4), 6, low ? 14 : 22), worn, {
    p: [0, headTop + mm(33), 0],
  });

  return finalise(T, g, {
    id: 'dth-bit', family: 'Drill Bits & Cutting Tools / DTH Bits',
    name: 'Drillity ' + shank + ' DTH Bit ' + diaMm + ' mm',
    shank: shank, diameterMm: diaMm,
    lengthMm: Math.round(totalLen * 1000),
    buttons: layout.length, buttonKind: gKind, gaugeButtons: gaugeCount,
    gaugeButtonMm: row[2], faceButtonMm: row[4], gaugeAngleDeg: Math.round(gaugeTilt / DEG),
    face: style, flushHoles: holes,
    cutDiameterMm: Math.round(cutR * 2000 * 10) / 10,
    material: 'Carbide grade DP62 / body 42CrMo4(V)',
    method: 'dth', priceEur: Math.round(260 + diaMm * 5.2),
  }, opts);
}

/**
 * DTH hammer — backhead with API pin, outer wear sleeve with lifting grooves,
 * chuck with the bit retained in it. `opts.withBit` (default true) fits a bit.
 */
export function buildDTHHammer(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const size = String(opts.size || '5in').toLowerCase();
  const SZ = {
    '3in': { od: 85, len: 900, thread: 'API238', shank: 'DHD3' },
    '4in': { od: 108, len: 1050, thread: 'API238', shank: 'DHD35' },
    '5in': { od: 133, len: 1180, thread: 'API312', shank: 'QL5' },
    '6in': { od: 159, len: 1320, thread: 'API312', shank: 'QL6' },
    '8in': { od: 210, len: 1600, thread: 'API412', shank: 'QL6' },
  };
  const s = SZ[size] || SZ['5in'];
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const R = mm(s.od) * 0.5;
  const L = mm(s.len);
  const g = new T.Group();
  g.name = 'dth-hammer';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.6);
  const worn = material(ctx, 'wornSteel');
  const cast = material(ctx, 'castIron');

  // backhead
  part(T, g, G.lathe(T, [
    [mm(14), -mm(6)], [R * 0.74, -mm(6)], [R * 0.74, -mm(52)],
    [R * 0.92, -mm(60)], [R * 0.92, -mm(96)], [R, -mm(104)],
    [R, -mm(112)], [mm(14), -mm(112)],
  ], seg, false), steel, { name: 'backhead' });
  addPinThread(T, ctx, g, s.thread, { length: mm(46), y0: -mm(6), down: false, quality: low ? 0 : 0.6, mat: steel });
  // wrench flats on the backhead
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(4), mm(34), R * 1.5), worn, {
      p: [Math.cos(i * Math.PI) * (R * 0.9), -mm(78), 0], r: [0, i * Math.PI, 0],
    });
  }
  // outer wear sleeve with lifting/wear grooves
  const sleeveTop = -mm(112);
  const sleeveLen = L - mm(112) - mm(150);
  const sleeve = profiledLathe(T, [
    [R, sleeveTop], [R, sleeveTop - sleeveLen],
    [R * 0.97, sleeveTop - sleeveLen - mm(4)],
    [mm(16), sleeveTop - sleeveLen - mm(4)],
    [mm(16), sleeveTop],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (r < R * 0.9) return 1;
      const band = Math.sin((sleeveTop - y) / mm(90) * TAU);
      return 1 - 0.012 * Math.max(0, band);
    },
  });
  part(T, g, sleeve, steel, { name: 'wear-sleeve' });
  part(T, g, weldBead(T, R * 1.002, mm(2.6), low ? 16 : 26), worn, { p: [0, sleeveTop - mm(2), 0], cast: false });

  // chuck
  const chuckY = sleeveTop - sleeveLen - mm(4);
  part(T, g, G.lathe(T, [
    [mm(20), chuckY], [R, chuckY], [R, chuckY - mm(120)],
    [R * 0.82, chuckY - mm(140)], [mm(20), chuckY - mm(140)],
  ], seg, false), cast, { name: 'chuck' });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    part(T, g, G.box(T, mm(6), mm(60), mm(3)), worn, {
      p: [Math.cos(a) * R * 1.001, chuckY - mm(60), Math.sin(a) * R * 1.001],
      r: [0, -a, 0], cast: false,
    });
  }
  part(T, g, G.torus(T, R * 0.99, mm(3), 5, low ? 14 : 22), worn, { p: [0, chuckY - mm(138), 0] });

  const bitNode = group(T, g, 'bit', { p: [0, chuckY - mm(140), 0] });
  if (opts.withBit !== false) {
    const bit = buildDTHBit(T, ctx, {
      shank: s.shank, wear: wear, lod: opts.lod,
      diameterMm: opts.bitDiameterMm, merge: false,
    });
    bitNode.add(bit);
  }

  const spec = {
    id: 'dth-hammer', family: 'DTH Tools / DTH Hammers',
    name: 'Drillity Stormhammer ' + size.toUpperCase(),
    size: size, odMm: s.od, lengthMm: s.len, thread: s.thread, shank: s.shank,
    workingPressureBar: size === '3in' ? 24 : 30,
    airLpm: { '3in': 6000, '4in': 9000, '5in': 12000, '6in': 17000, '8in': 26000 }[size] || 12000,
    material: 'Case-hardened 25CrMo4V piston, 42CrMo4 sleeve',
    method: 'dth', priceEur: Math.round(1800 + s.od * 22),
  };
  return finalise(T, g, spec, opts);
}

/** Shank adapter — the drifter-to-string interface. Splines, collar, thread. */
export function buildShankAdapter(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const thread = String(opts.thread || 'T45').toUpperCase();
  const ts = THREAD_SPECS[thread] || THREAD_SPECS.T45;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const R = mm(ts.majorMm) * 0.5 * 1.18;
  const L = mm(opts.lengthMm || 435);
  const g = new T.Group();
  g.name = 'shank-adapter';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.7);
  const worn = material(ctx, 'wornSteel');
  const splineLen = L * 0.42;

  const body = profiledLathe(T, [
    [mm(6), 0], [R * 0.86, 0], [R * 0.86, -splineLen],
    [R * 1.22, -splineLen - mm(6)], [R * 1.22, -splineLen - mm(34)],
    [R, -splineLen - mm(46)], [R, -L + mm(52)],
    [mm(ts.majorMm) * 0.5, -L + mm(46)], [mm(6), -L],
  ], {
    segments: seg,
    closedProfile: true,
    radiusFn: (th, r, y) => {
      if (y > -splineLen && r > R * 0.6) {
        const a = ((th * 12) % TAU + TAU) % TAU;
        const d = Math.min(a, TAU - a) / Math.PI;
        return 1 - 0.10 * Math.max(0, 1 - d * 2.2);
      }
      return 1;
    },
  });
  part(T, g, body, steel);
  // percussion striking face — always bruised
  part(T, g, G.cyl(T, R * 0.8, R * 0.8, mm(3), seg), material(ctx, 'wornSteel'), { p: [0, mm(1.4), 0] });
  addPinThread(T, ctx, g, thread, { y0: -L + mm(50), length: mm(46), quality: low ? 0 : 0.7, mat: steel });
  // flushing hole through the middle
  flushHole(T, ctx, g, { x: 0, y: -L, z: 0, r: mm(8), dir: [0, -1, 0], seg: low ? 8 : 12, chamferMat: worn });

  return finalise(T, g, {
    id: 'shank-adapter', family: 'Top Hammer Tools / Shank Adapters',
    name: 'Drillity Shank Adapter ' + thread,
    thread: thread, lengthMm: opts.lengthMm || 435, splines: 12,
    material: '34CrNiMo6, case hardened', method: 'top-hammer',
    priceEur: Math.round(180 + ts.majorMm * 4),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §2 ROTARY — TRICONE / PDC / DRAG
   ═══════════════════════════════════════════════════════════════════════════ */

function triconeCone(T, ctx, parent, o) {
  const len = o.len;
  const rBase = o.rBase;
  const rNose = o.rNose;
  const wear = clamp01(o.wear || 0);
  const seg = o.seg || 16;
  const btnSeg = o.btnSeg || 8;
  const tci = o.variant === 'tci';
  const low = !!o.low;
  const steel = bitBodyMaterial(ctx, wear * 0.7, { color: 0x8A7E70 });
  const worn = material(ctx, 'wornSteel');
  const spin = group(T, parent, 'cone-spin', { dynamic: true });

  // cone body: nose at +Y, base (back face) at 0. Once the cutting structure
  // stops protecting the shell, the shell itself erodes, so the cone loses a
  // little diameter as it is used up.
  const k = 1 - wear * 0.05;
  part(T, spin, G.lathe(T, [
    [mm(6), 0], [rBase, 0], [rBase, len * 0.14],
    [rBase * 0.82 * k, len * 0.42], [rBase * 0.6 * k, len * 0.66],
    [rNose * 1.25 * k, len * 0.86], [rNose * k, len * 0.97], [mm(3), len],
  ], seg, false), steel, { name: 'cone' });

  const rows = tci ? 4 : 3;
  const layout = [];
  for (let r = 0; r < rows; r++) {
    const t = (r + 0.6) / (rows + 0.4);
    const y = len * (0.10 + t * 0.72);
    const rad = lerp(rBase * 0.98, rNose * 1.1, t) * (1 - 0.05 * r);
    const count = Math.max(6, Math.round(rad / (tci ? mm(11) : mm(15))));
    const d = tci ? mm(9) : mm(13);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + r * 0.4;
      layout.push({
        x: Math.cos(a) * rad, y: y, z: Math.sin(a) * rad,
        nx: Math.cos(a) * 0.86, ny: 0.5, nz: Math.sin(a) * 0.86,
        dia: d, kind: tci ? 'conical' : 'chisel',
        protrusion: tci ? 0.85 : 1.5, gauge: r === 0,
      });
    }
  }
  // ── the cutting structure ──────────────────────────────────────────────
  // A tricone does not wear the way a percussion bit does. Steel teeth do not
  // fall out of their sockets; they blunt, then SNAP, and the stub stays in
  // the cone. TCI inserts do break out, but later and fewer.
  const toothWear = clamp01(wear * 1.15);
  if (!tci) {
    studFace(T, ctx, spin, layout, {
      wear: toothWear, seg: btnSeg,
      mat: wearMaterial(ctx, 'wornSteel', wear),
      lossStart: 0.58, lossRate: 0.75,
      lostMat: wearMaterial(ctx, 'wornSteel', wear),
      lostGeo: (b) => toothStubGeometry(T, {
        dia: b.dia, seg: Math.max(6, btnSeg - 1), height: 0.40,
      }),
    });
  } else {
    studFace(T, ctx, spin, layout, {
      wear: toothWear, seg: btnSeg, lossStart: 0.70, lossRate: 0.62,
    });
  }
  // gauge row on the heel — the row that decides whether the hole stays
  // in gauge, so it is flattened hardest
  studFace(T, ctx, spin, ringLayout({
    count: Math.max(8, Math.round(rBase / mm(9))), radius: rBase * 0.99 * k,
    y: len * 0.06, tilt: 88 * DEG, dia: mm(8), kind: 'flat', gauge: true,
  }), { wear: clamp01(wear * 1.25), seg: btnSeg, lossStart: 0.66, lossRate: 0.5 });

  // ── the seal ───────────────────────────────────────────────────────────
  // What actually ends a tricone's life is not the teeth, it is the bearing:
  // the seal hardens, grease leaves, mud gets in. A failed seal extrudes and
  // goes black, and the game has to be able to show that.
  const gone = wear > 0.60;
  part(T, spin, G.torus(T, rBase * 0.66, mm(3.2) * (1 + wear * 1.1), 5, low ? 10 : 16),
    gone ? material(ctx, '__mud') : material(ctx, 'rubber'), {
      p: [0, len * 0.03, 0], r: [Math.PI / 2, 0, 0], name: 'seal', cast: false,
    });
  if (gone) {
    // grease and cuttings smeared out of the failed seal onto the cone back
    part(T, spin, G.lathe(T, [
      [rBase * 0.70, len * 0.005], [rBase * 0.99, len * (0.03 + wear * 0.05)],
    ], low ? 10 : 16, false), material(ctx, '__mud'), { cast: false });
  }
  part(T, spin, G.cyl(T, rBase * 0.30, rBase * 0.30, mm(6), low ? 8 : 12), worn, {
    p: [0, mm(3), 0], name: 'ball-plug', cast: false,
  });
  return spin;
}

/**
 * Tricone rock bit — three legs, three cones on offset journals, three nozzles.
 * opts: { diameterMm, variant:'milled'|'tci', thread, wear }
 * The cones are dynamic children: userData.cones[] spin under load.
 */
export function buildTriconeBit(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 216;   // 8 1/2"
  const variant = opts.variant === 'milled' ? 'milled' : 'tci';
  // A rock bit is made up with an API rotary shouldered REG connection, not a
  // rope thread. `opts.thread` still routes to the legacy percussion pin so
  // the raise-bore pilot bit keeps the connection it was authored with.
  const legacy = opts.thread ? THREAD_SPECS[String(opts.thread).toUpperCase()] : null;
  const thread = legacy ? String(opts.thread).toUpperCase() : null;
  const connId = opts.connection || bitConnectionFor(diaMm);
  const c = rotaryConnection(connId);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const R = mm(diaMm) * 0.5;
  const g = new T.Group();
  g.name = 'tricone-bit';
  const steel = bitBodyMaterial(ctx, wear * 0.75);
  const worn = material(ctx, 'wornSteel');
  const bodyLen = mm(diaMm * 0.42);
  const legLen = mm(diaMm * 0.62);
  const shankR = legacy
    ? R * 0.42
    : clampv(mm(c.odMm) * 0.5, R * 0.30, R * 0.78);

  // shank + body
  part(T, g, G.lathe(T, [
    [mm(10), 0], [shankR, 0], [shankR, -mm(diaMm * 0.13)],
    [Math.max(shankR, R * 0.58), -mm(diaMm * 0.22)], [R * 0.66, -bodyLen],
    [mm(10), -bodyLen],
  ], seg, false), steel, { name: 'body' });
  if (legacy) {
    addPinThread(T, ctx, g, thread, { y0: 0, length: mm(70), down: false, quality: low ? 0 : 0.6, mat: steel });
  } else {
    // the pin points UP out of the bit: build it downward, then turn it over.
    // A rotation preserves the handedness of the helix, so the thread is still
    // right-hand when it gets there.
    const pinUp = group(T, g, 'pin-up', { r: [Math.PI, 0, 0] });
    addRotaryPin(T, ctx, pinUp, connId, { y0: 0, shoulderR: shankR, low: low, mat: steel, wornMat: worn });
  }

  const cones = [];
  const journal = 33 * DEG;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    const leg = group(T, g, 'leg' + i, { r: [0, -a, 0] });
    // Bearing wear, per leg. Deterministic and uneven: on a pulled bit one
    // cone is always the worst, and the driller grades it by that one.
    const legK = clamp01(wear * (0.72 + (i * 0.37 % 1) * 0.62));
    const gap = mm(4.5) * legK * legK;
    const tilt = 1.7 * DEG * legK * legK;
    // leg body — a shield running down to the journal boss
    part(T, leg, G.roundedBox(T, R * 0.62, legLen, R * 0.5, mm(14), 2), steel, {
      p: [R * 0.42, -bodyLen - legLen * 0.42, 0], r: [0, Math.PI / 2, 0.10],
    });
    // shirttail hardfacing — eroded away from the bottom up
    part(T, leg, G.box(T, R * 0.42 * (1 - legK * 0.22), mm(16) * (1 - legK * 0.62), R * 0.34), worn, {
      p: [R * 0.55, -bodyLen - legLen * 0.86 + mm(8) * legK, 0], r: [0, 0, 0.10],
    });
    studFace(T, ctx, leg, ringLayout({
      count: 3, radius: mm(6), y: 0, dia: mm(9), kind: 'flat',
    }).map((b, k) => ({
      x: R * 0.72 + (k - 1) * mm(11), y: -bodyLen - legLen * 0.84, z: 0,
      nx: 1, ny: 0.15, nz: 0, dia: mm(9), kind: 'flat', gauge: true,
    })), { wear: wear, seg: low ? 6 : 8 });

    const jr = group(T, leg, 'journal' + i, {
      p: [R * 0.30, -bodyLen - legLen * 0.62, 0],
      r: [0, 0, -(Math.PI / 2 - journal) + tilt],
    });
    // the journal boss the cone runs on — the gap opens up as the bearing goes
    part(T, jr, G.cyl(T, R * 0.33, R * 0.33, mm(26), low ? 10 : 16), worn, {
      p: [0, -mm(13), 0], name: 'journal', cast: false,
    });
    const coneNode = group(T, jr, 'cone-seat' + i, { p: [0, gap, 0] });
    const cone = triconeCone(T, ctx, coneNode, {
      len: R * 0.86, rBase: R * 0.40, rNose: R * 0.07, wear: wear,
      variant: variant, seg: low ? 12 : 18, btnSeg: low ? 6 : 9, low: low,
    });
    cones.push(cone);
    // bearing seal retainer + the ball-plug weld
    part(T, jr, G.cyl(T, R * 0.41, R * 0.41, mm(6), low ? 12 : 18), worn, { p: [0, -mm(3), 0] });
    part(T, leg, G.cyl(T, mm(9), mm(9), mm(18), 6), worn, {
      p: [R * 0.56, -bodyLen - legLen * 0.50, 0], r: [0, 0, Math.PI / 2 - 0.3], cast: false,
    });
  }

  // three nozzles in the crotch
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + Math.PI / 3;
    const r = R * 0.34;
    part(T, g, G.cyl(T, mm(15), mm(19), mm(26), low ? 8 : 12), steel, {
      p: [Math.cos(a) * r, -bodyLen - mm(6), Math.sin(a) * r], r: [0.16, 0, 0],
    });
    flushHole(T, ctx, g, {
      x: Math.cos(a) * r, y: -bodyLen - mm(19), z: Math.sin(a) * r,
      r: mm(7), dir: [0, -1, 0], seg: low ? 8 : 10, chamferMat: worn,
    });
  }

  const g2 = finalise(T, g, {
    id: 'tricone-bit', family: 'Drill Bits & Cutting Tools / Tricone Bits',
    name: 'Drillity Tricone ' + (variant === 'tci' ? 'TCI' : 'MT') + ' ' + diaMm + ' mm',
    diameterMm: diaMm, variant: variant,
    thread: legacy ? thread : undefined,
    connection: legacy ? thread : c.label,
    connectionFamily: legacy ? 'rope' : c.family,
    cones: 3, nozzles: 3,
    iadcCode: variant === 'tci' ? '537X' : '116',
    journalAngleDeg: 33, bearing: 'Sealed journal',
    dullGrading: 'Teeth, bearing and gauge — the three things that end a run',
    material: variant === 'tci' ? 'TC inserts in 8620 cones' : 'Milled steel teeth, hardfaced',
    method: opts.method || (diaMm >= 270 ? 'oil-rotary' : 'rotary-kelly'),
    priceEur: Math.round(900 + diaMm * 14),
  }, opts);
  g2.userData.cones = cones;
  g2.userData.animate = (t, rpm01) => {
    const w = (rpm01 || 0) * 14;
    for (const c of cones) c.rotation.y += w * 0.016;
  };
  return g2;
}

/**
 * PDC bit — spiral blades swept along real 3D curves, brazed cutters with a
 * back rake, junk slots, nozzles in the slots and a gauge pad per blade.
 *
 * PDC wear is not carbide-button wear. A diamond table does not round over:
 * it grinds a polished WEAR FLAT, it CHIPS, and — because the shoulder does
 * the most work per revolution — it RINGS OUT, losing a whole radial band of
 * cutters and letting the blade behind them erode. That failure signature is
 * modelled explicitly below.
 */
export function buildPDCBit(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 152;
  const blades = opts.blades || (diaMm > 280 ? 7 : diaMm > 200 ? 6 : 5);
  const legacy = opts.thread ? THREAD_SPECS[String(opts.thread).toUpperCase()] : null;
  const thread = legacy ? String(opts.thread).toUpperCase() : null;
  const connId = opts.connection || bitConnectionFor(diaMm);
  const c = rotaryConnection(connId);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const R = mm(diaMm) * 0.5;
  const g = new T.Group();
  g.name = 'pdc-bit';
  const matrix = wearMaterial(ctx, 'castIron', wear * 0.6);
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.7);
  const pdc = material(ctx, '__pdc');
  const carb = wearMaterial(ctx, 'carbide', wear);
  const flat = material(ctx, 'chrome', { roughness: 0.10, metalness: 1.0 });
  const pocket = material(ctx, '__hole', { color: 0x121418, roughness: 0.86, metalness: 0.30 });
  const bodyLen = mm(diaMm * 0.75);
  const crownDepth = mm(diaMm * 0.24);
  const shankR = legacy ? R * 0.44 : clampv(mm(c.odMm) * 0.5, R * 0.32, R * 0.76);

  // crown blank (the matrix body the blades stand on)
  part(T, g, G.lathe(T, [
    [mm(8), -bodyLen + crownDepth * 0.35],
    [R * 0.34, -bodyLen + crownDepth * 0.28],
    [R * 0.72, -bodyLen + crownDepth * 0.62],
    [R * 0.93, -bodyLen + crownDepth * 0.95],
    [R * 0.955, -bodyLen + crownDepth * 1.5],
    [R * 0.955, -mm(diaMm * 0.30)],
    [Math.max(shankR, R * 0.60), -mm(diaMm * 0.20)],
    [shankR, 0], [mm(8), 0],
  ], seg, false), matrix, { name: 'crown' });
  if (legacy) {
    addPinThread(T, ctx, g, thread, { y0: 0, length: mm(66), down: false, quality: low ? 0 : 0.6, mat: steel });
  } else {
    const pinUp = group(T, g, 'pin-up', { r: [Math.PI, 0, 0] });
    addRotaryPin(T, ctx, pinUp, connId, { y0: 0, shoulderR: shankR, low: low, mat: steel });
  }

  const bladeSteps = low ? 12 : 22;
  const cutterDia = mm(clampv(diaMm * 0.085, 11, 19));
  for (let b = 0; b < blades; b++) {
    const phase = (b / blades) * TAU;
    const pts = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const r = lerp(R * 0.10, R * 0.955, t);
      const a = phase + t * 0.85;                       // spiral wrap
      const y = -bodyLen + crownDepth * (0.30 + Math.pow(t, 1.5) * 1.35);
      pts.push(new T.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
    const path = new T.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const w = mm(clampv(diaMm * 0.075, 9, 17));
    const h = mm(clampv(diaMm * 0.10, 12, 24));
    const shape = new T.Shape();
    shape.moveTo(-w / 2, -h / 2); shape.lineTo(w / 2, -h / 2);
    shape.lineTo(w / 2 * 0.75, h / 2); shape.lineTo(-w / 2 * 0.75, h / 2);
    shape.closePath();
    const geo = new T.ExtrudeGeometry(shape, { extrudePath: path, steps: bladeSteps, bevelEnabled: false });
    part(T, g, geo, matrix, { name: 'blade' + b });

    // cutters along the blade leading edge
    const cn = Math.max(4, Math.round(diaMm / 26));
    const cut = [];
    for (let i = 0; i < cn; i++) {
      const t = (i + 0.55) / cn;
      const p = path.getPoint(t);
      const tan = path.getTangent(t);
      const out = new T.Vector3(-tan.z, 0, tan.x).normalize();  // leading face
      cut.push({ p: p, out: out, t: t });
    }
    for (let ci = 0; ci < cut.length; ci++) {
      const cu = cut[ci];
      const dir = cu.out.clone().multiplyScalar(-1);
      dir.y += 0.32; dir.normalize();                            // 20 deg back rake
      const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir);
      const pos = cu.p.clone().add(cu.out.clone().multiplyScalar(-w * 0.28));
      const fp = pos.clone().add(dir.clone().multiplyScalar(mm(6.4)));

      // The shoulder (t ~ 0.62-0.92) does the most work per revolution, so it
      // is where a PDC bit rings out. Wear there runs ~60 % faster.
      const shoulder = cu.t > 0.60 && cu.t < 0.93;
      const local = clamp01(wear * (shoulder ? 1.62 : 0.92));
      const h = (((b * 7919 + ci * 104729) % 1013) / 1013);
      const dead = local > 0.80 && h < (local - 0.80) / 0.20 * 0.85;

      if (dead) {
        // ring-out: the cutter is gone and only the brazed pocket is left
        part(T, g, G.cyl(T, cutterDia * 0.52, cutterDia * 0.52, mm(9), low ? 7 : 10), pocket, {
          p: pos.toArray(), q: q, cast: false,
        });
        part(T, g, G.torus(T, cutterDia * 0.52, mm(1.3), 4, low ? 8 : 12), carb, {
          p: pos.clone().add(dir.clone().multiplyScalar(mm(4.4))).toArray(), q: q, cast: false,
        });
        continue;
      }

      part(T, g, G.cyl(T, cutterDia * 0.5, cutterDia * 0.5, mm(13), low ? 8 : 12), carb, {
        p: pos.toArray(), q: q,
      });
      if (local > 0.46) {
        // chipped table: a bite is missing out of the diamond layer
        part(T, g, chippedCutterGeometry(T, {
          dia: cutterDia * 1.005, height: mm(2.4), seg: low ? 9 : 13,
          chip: (local - 0.46) / 0.34,
        }), pdc, { p: fp.toArray(), q: q });
        part(T, g, G.cyl(T, cutterDia * 0.5 * 0.99, cutterDia * 0.5 * 0.99, mm(1.1), low ? 8 : 12), carb, {
          p: fp.clone().add(dir.clone().multiplyScalar(-mm(1.9))).toArray(), q: q, cast: false,
        });
      } else {
        part(T, g, G.cyl(T, cutterDia * 0.5 * 1.005, cutterDia * 0.5 * 1.005, mm(2.4), low ? 8 : 12), pdc, {
          p: fp.toArray(), q: q,
        });
      }
      if (local > 0.16) {
        // the polished wear flat, ground square across the cutting edge
        const fl = cutterDia * (0.16 + local * 0.62);
        const edge = cu.out.clone().multiplyScalar(cutterDia * 0.5 - fl * 0.34);
        part(T, g, G.box(T, fl, mm(2.0), cutterDia * 0.88), flat, {
          p: fp.clone().add(edge).toArray(), q: q, cast: false,
        });
      }
    }
    // ── the eroded groove ringed out of the blade shoulder itself ──
    if (wear > 0.52) {
      const rp = path.getPoint(0.78);
      part(T, g, G.box(T, w * 0.9, h * (0.20 + wear * 0.45), mm(diaMm * 0.10)), pocket, {
        p: [rp.x, rp.y + h * 0.30, rp.z], r: [0, -Math.atan2(rp.z, rp.x), 0], cast: false,
      });
    }
    // gauge pad — undergauge once the shoulder has gone
    const gp = path.getPoint(1);
    const gk = 1 - wear * 0.045;
    part(T, g, G.box(T, mm(10), mm(diaMm * 0.16), mm(diaMm * 0.09)), steel, {
      p: [gp.x * gk, gp.y + mm(diaMm * 0.09), gp.z * gk],
      r: [0, -Math.atan2(gp.z, gp.x), 0],
    });
    // nozzle in the junk slot behind the blade
    const na = phase + 0.42;
    const nr = R * 0.44;
    part(T, g, G.cyl(T, mm(11), mm(14), mm(20), low ? 8 : 12), steel, {
      p: [Math.cos(na) * nr, -bodyLen + crownDepth * 0.7, Math.sin(na) * nr],
    });
    flushHole(T, ctx, g, {
      x: Math.cos(na) * nr, y: -bodyLen + crownDepth * 0.6, z: Math.sin(na) * nr,
      r: mm(6), dir: [0, -1, 0], seg: low ? 7 : 10,
    });
  }

  return finalise(T, g, {
    id: 'pdc-bit', family: 'Drill Bits & Cutting Tools / PDC Bits',
    name: 'Drillity PDC ' + blades + '-Blade ' + diaMm + ' mm',
    diameterMm: diaMm, blades: blades, cuttersPerBlade: Math.max(4, Math.round(diaMm / 26)),
    cutterDiaMm: Math.round(cutterDia * 1000),
    thread: legacy ? thread : undefined,
    connection: legacy ? thread : c.label,
    connectionFamily: legacy ? 'rope' : c.family,
    nozzles: blades, backRakeDeg: 20,
    dullGrading: 'Wear flat, chipping and shoulder ring-out',
    material: 'Tungsten-carbide matrix body, synthetic diamond tables',
    method: opts.method || (diaMm >= 270 ? 'oil-rotary' : 'rotary-kelly'),
    priceEur: Math.round(1600 + diaMm * 22),
  }, opts);
}

/**
 * Drag / wing bit — the cheap soft-ground workhorse. Steel wings faced with
 * brazed carbide strips and a chevron flushing arrangement.
 * opts: { wings:2|3|4, diameterMm, thread, wear }
 */
export function buildDragBit(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 150;
  const wings = opts.wings || 3;
  const thread = String(opts.thread || 'API238').toUpperCase();
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const R = mm(diaMm) * 0.5;
  const g = new T.Group();
  g.name = 'drag-bit';
  const steel = bitBodyMaterial(ctx, wear * 0.8);
  const carb = wearMaterial(ctx, 'carbide', wear);
  const bodyLen = mm(diaMm * 0.55);

  part(T, g, G.lathe(T, [
    [mm(8), 0], [R * 0.40, 0], [R * 0.40, -bodyLen * 0.55],
    [R * 0.30, -bodyLen], [mm(8), -bodyLen],
  ], seg, false), steel, { name: 'body' });
  addPinThread(T, ctx, g, thread, { y0: 0, length: mm(60), down: false, quality: low ? 0 : 0.6, mat: steel });

  for (let i = 0; i < wings; i++) {
    const a = (i / wings) * TAU;
    const wing = group(T, g, 'wing' + i, { r: [0, -a, 0] });
    const w = mm(diaMm * 0.10);
    const shape = new T.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(R * 0.97, bodyLen * 0.30);
    shape.lineTo(R * 0.97, bodyLen * 0.62);
    shape.lineTo(R * 0.24, bodyLen * 0.98);
    shape.lineTo(0, bodyLen * 0.98);
    shape.closePath();
    const geo = new T.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false, curveSegments: 2 });
    geo.translate(0, 0, -w / 2);
    geo.rotateX(-Math.PI / 2);
    part(T, wing, geo, steel, { p: [0, -bodyLen, 0] });
    // brazed carbide cutting strip along the leading edge
    const strips = Math.max(3, Math.round(diaMm / 34));
    for (let k = 0; k < strips; k++) {
      const t = (k + 0.5) / strips;
      const r = lerp(R * 0.12, R * 0.94, t);
      const y = -bodyLen + lerp(mm(2), bodyLen * 0.28, t);
      part(T, wing, G.box(T, mm(diaMm * 0.055), mm(11 - wear * 5), w * 1.12), carb, {
        p: [r, y, 0], r: [0, 0, -0.30],
      });
    }
    flushHole(T, ctx, g, {
      x: Math.cos(a + Math.PI / wings) * R * 0.28, y: -bodyLen + mm(4),
      z: Math.sin(a + Math.PI / wings) * R * 0.28,
      r: mm(7), dir: [0, -1, 0], seg: low ? 7 : 10,
    });
  }

  return finalise(T, g, {
    id: 'drag-bit', family: 'Drill Bits & Cutting Tools / Drag & Wing Bits',
    name: 'Drillity ' + wings + '-Wing Drag Bit ' + diaMm + ' mm',
    diameterMm: diaMm, wings: wings, thread: thread,
    material: 'S355J2 body, brazed carbide strips',
    method: 'auger', priceEur: Math.round(90 + diaMm * 1.9),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §3 SHARED SOLIDS — ring sectors and pipe
   ═══════════════════════════════════════════════════════════════════════════ */

/** A ring sector solid lying in XZ, extruded from y=0 to y=h. */
export function arcSector(T, o) {
  const rIn = o.rIn;
  const rOut = o.rOut;
  const a0 = o.a0 || 0;
  const a1 = o.a1 === undefined ? 0.6 : o.a1;
  const h = o.h || mm(12);
  const s = new T.Shape();
  s.absarc(0, 0, rOut, a0, a1, false);
  s.absarc(0, 0, rIn, a1, a0, true);
  s.closePath();
  const g = new T.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: o.seg || 6 });
  g.rotateX(-Math.PI / 2);
  return g;
}

/** A pipe with a real visible wall at both ends. Hangs from y=0 down to -len. */
export function pipeGeometry(T, o) {
  const ro = o.od * 0.5;
  const ri = o.id * 0.5;
  const len = o.length;
  const y0 = o.y0 || 0;
  return G.lathe(T, [
    [ro, y0], [ro, y0 - len], [ri, y0 - len], [ri, y0],
  ], o.seg || 24, true);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §4 CORE / EXPLORATION — DOMAIN.md §4 wireline sizes
   ═══════════════════════════════════════════════════════════════════════════ */
export const WIRELINE = {
  AQ: { holeMm: 48.0, coreMm: 27.0, rodOdMm: 44.5 },
  BQ: { holeMm: 60.0, coreMm: 36.5, rodOdMm: 55.6 },
  NQ: { holeMm: 75.7, coreMm: 47.6, rodOdMm: 69.9 },
  HQ: { holeMm: 96.0, coreMm: 63.5, rodOdMm: 88.9 },
  PQ: { holeMm: 122.6, coreMm: 85.0, rodOdMm: 114.3 },
};

/**
 * Impregnated diamond core bit — crown segments separated by waterways, an
 * inner and outer gauge, and the wireline thread up the blank.
 * opts: { size:'AQ'|'BQ'|'NQ'|'HQ'|'PQ', segments, wear }
 */
export function buildCoreBit(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const size = String(opts.size || 'HQ').toUpperCase();
  const w = WIRELINE[size] || WIRELINE.HQ;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 30;
  const nSeg = opts.segments || (size === 'PQ' ? 12 : size === 'HQ' ? 10 : 8);
  const rOut = mm(w.holeMm) * 0.5;
  const rIn = mm(w.coreMm) * 0.5;
  const crownH = mm(12) * (1 - wear * 0.72);      // the crown is CONSUMED by wear
  const blankH = mm(48);
  const g = new T.Group();
  g.name = 'core-bit';
  const steel = bitBodyMaterial(ctx, wear * 0.5);
  const dia = material(ctx, '__diamond');
  const carb = wearMaterial(ctx, 'carbide', wear);

  // blank body with the wireline thread at the top
  part(T, g, G.lathe(T, [
    [rOut * 0.985, 0], [rOut * 0.985, -blankH], [rOut, -blankH],
    [rOut, -blankH - mm(2)], [rIn, -blankH - mm(2)], [rIn, 0],
  ], seg, true), steel, { name: 'blank' });
  addBoxThread(T, ctx, g, size, { y0: -mm(3), length: mm(26), quality: low ? 0 : 0.6 });

  // crown segments with waterways
  const gap = 0.30 / nSeg * TAU;
  for (let i = 0; i < nSeg; i++) {
    const a0 = (i / nSeg) * TAU + gap * 0.5;
    const a1 = ((i + 1) / nSeg) * TAU - gap * 0.5;
    const geo = arcSector(T, { rIn: rIn * 0.97, rOut: rOut * 1.002, a0: a0, a1: a1, h: crownH, seg: low ? 3 : 6 });
    geo.translate(0, -blankH - mm(2) - crownH, 0);
    part(T, g, geo, dia, { name: 'crown' + i });
    // set diamonds on the outer and inner gauge of each segment
    if (!low) {
      const am = (a0 + a1) * 0.5;
      for (let k = -1; k <= 1; k++) {
        const aa = am + k * (a1 - a0) * 0.3;
        part(T, g, G.sph(T, mm(1.5), 6), carb, {
          p: [Math.cos(aa) * rOut, -blankH - mm(2) - crownH * 0.5, Math.sin(aa) * rOut], cast: false,
        });
        part(T, g, G.sph(T, mm(1.3), 6), carb, {
          p: [Math.cos(aa) * rIn * 0.97, -blankH - mm(2) - crownH * 0.5, Math.sin(aa) * rIn * 0.97], cast: false,
        });
      }
    }
  }

  return finalise(T, g, {
    id: 'core-bit', family: 'Drill Bits & Cutting Tools / Core Bits',
    name: 'Drillity Impreg Crown ' + size + ' ' + w.holeMm + '/' + w.coreMm,
    size: size, holeMm: w.holeMm, coreMm: w.coreMm, segments: nSeg,
    crownHeightMm: 12, matrixSeries: 'Series 6 (medium-hard)',
    material: 'Impregnated synthetic diamond in WC matrix',
    method: 'core', priceEur: Math.round(300 + w.holeMm * 5.6),
  }, opts);
}

/** Reaming shell — keeps the hole to gauge above the bit. */
export function buildReamingShell(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const size = String(opts.size || 'HQ').toUpperCase();
  const w = WIRELINE[size] || WIRELINE.HQ;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 28;
  const rOut = mm(w.holeMm) * 0.5;
  const rIn = mm(w.coreMm) * 0.5 * 1.06;
  const L = mm(190);
  const g = new T.Group();
  g.name = 'reaming-shell';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.6);
  const dia = material(ctx, '__diamond');

  part(T, g, profiledLathe(T, [
    [rOut * 0.97, 0], [rOut * 0.999, -mm(30)], [rOut * 0.999, -L + mm(30)],
    [rOut * 0.97, -L], [rIn, -L], [rIn, 0],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (r < rOut * 0.9) return 1;
      const a = ((th * 6) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.03 * Math.max(0, 1 - d * 2.6);
    },
  }), steel);
  const pads = 6;
  for (let i = 0; i < pads; i++) {
    const a = (i / pads) * TAU + 0.25;
    const geo = arcSector(T, { rIn: rOut * 0.94, rOut: rOut * 1.004, a0: a, a1: a + 0.36, h: mm(52), seg: low ? 3 : 5 });
    geo.translate(0, -L * 0.5 - mm(26), 0);
    part(T, g, geo, dia, { name: 'pad' + i });
  }
  addBoxThread(T, ctx, g, size, { y0: -mm(3), length: mm(24), quality: low ? 0 : 0.5 });
  addPinThread(T, ctx, g, size, { y0: -L + mm(26), length: mm(24), quality: low ? 0 : 0.5, mat: steel });

  return finalise(T, g, {
    id: 'reaming-shell', family: 'Exploration & Coring / Reaming Shells',
    name: 'Drillity Reaming Shell ' + size,
    size: size, holeMm: w.holeMm, lengthMm: 190, pads: pads,
    material: 'Surface-set diamond pads',
    method: 'core', priceEur: Math.round(240 + w.holeMm * 3.2),
  }, opts);
}

/**
 * Wireline core barrel — head assembly with latches, outer tube, inner tube,
 * core lifter case and the reaming shell / bit stack at the shoe.
 * opts: { size, lengthMm (default 1500 — a 3 m barrel is unreadable in a
 *         preview), withBit, wear, cutaway (shows the inner tube) }
 */
export function buildCoreBarrel(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const size = String(opts.size || 'HQ').toUpperCase();
  const w = WIRELINE[size] || WIRELINE.HQ;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const L = mm(opts.lengthMm || 1500);
  const rOut = mm(w.rodOdMm) * 0.5;
  const rIn = mm(w.coreMm) * 0.5 * 1.12;
  const g = new T.Group();
  g.name = 'core-barrel';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.5);
  const chrome = material(ctx, 'chrome');
  const worn = material(ctx, 'wornSteel');

  // ── head assembly ──
  const headL = mm(320);
  part(T, g, G.lathe(T, [
    [mm(9), 0], [rOut * 0.62, 0], [rOut * 0.62, -mm(40)],
    [rOut * 0.34, -mm(52)], [rOut * 0.34, -mm(88)],
    [rOut * 0.80, -mm(100)], [rOut * 0.80, -mm(150)],
    [rOut * 0.95, -mm(162)], [rOut * 0.95, -headL], [mm(9), -headL],
  ], seg, false), steel, { name: 'head' });
  // spearhead point
  part(T, g, G.lathe(T, [
    [mm(4), mm(52)], [mm(11), mm(40)], [mm(11), mm(12)], [mm(16), mm(4)], [mm(16), 0], [mm(4), 0],
  ], low ? 8 : 14, false), chrome, { name: 'spearhead' });
  // latches (they stand proud and catch the locking coupling)
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1;
    part(T, g, G.box(T, mm(9), mm(70), mm(16)), worn, {
      p: [s * rOut * 0.82, -mm(126), 0], r: [0, 0, s * 0.06],
    });
  }
  // landing shoulder + bearings
  part(T, g, G.cyl(T, rOut * 0.88, rOut * 0.88, mm(22), seg), chrome, { p: [0, -mm(196), 0] });

  // ── outer tube ──
  const tubeTop = -headL;
  const tubeLen = L - headL - mm(120);
  part(T, g, pipeGeometry(T, { od: rOut * 2, id: rIn * 2 * 1.12, length: tubeLen, y0: tubeTop, seg: seg }), steel, {
    name: 'outer-tube',
  });
  // ── inner tube (visible on a cutaway preview) ──
  const inner = group(T, g, 'inner-tube', { dynamic: true });
  part(T, inner, pipeGeometry(T, { od: rIn * 2, id: rIn * 2 * 0.86, length: tubeLen * 0.94, y0: tubeTop - mm(14), seg: low ? 10 : 18 }), chrome);
  inner.visible = opts.cutaway === true;

  // ── core lifter case + shoe ──
  const shoeY = tubeTop - tubeLen;
  part(T, g, G.lathe(T, [
    [rOut, shoeY], [rOut, shoeY - mm(70)], [rOut * 0.97, shoeY - mm(84)],
    [rIn * 0.92, shoeY - mm(84)], [rIn * 0.92, shoeY],
  ], seg, true), worn, { name: 'lifter-case' });
  // the core lifter itself — a split tapered ring
  part(T, g, G.lathe(T, [
    [rIn * 0.94, shoeY - mm(30)], [rIn * 0.94, shoeY - mm(52)],
    [rIn * 0.80, shoeY - mm(56)], [rIn * 0.80, shoeY - mm(34)],
  ], low ? 12 : 20, true), material(ctx, '__brass'), { name: 'core-lifter' });

  const bitNode = group(T, g, 'bit', { p: [0, shoeY - mm(84), 0] });
  if (opts.withBit !== false) {
    bitNode.add(buildCoreBit(T, ctx, { size: size, wear: wear, lod: opts.lod, merge: false }));
  }

  return finalise(T, g, {
    id: 'core-barrel', family: 'Exploration & Coring / Wireline Core Barrels',
    name: 'Drillity Wireline Core Barrel ' + size + '3',
    size: size, lengthMm: opts.lengthMm || 1500, coreMm: w.coreMm,
    innerTube: 'Split, chrome-lined', latch: 'Twin spring latch',
    material: 'Seamless 4140 tube', method: 'core',
    priceEur: Math.round(2400 + w.holeMm * 18),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §5 CASING & OVERBURDEN — the Drillity flagship range (DOMAIN.md §3 B)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Plain casing pipe with a machined joint at each end. */
export function buildCasingPipe(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.odMm || 139.7;
  const wallMm = opts.wallMm || 8.0;
  const L = mm(opts.lengthMm || 3000);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 28;
  const ro = mm(odMm) * 0.5;
  const ri = ro - mm(wallMm);
  const g = new T.Group();
  g.name = 'casing-pipe';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.55);
  const worn = material(ctx, 'wornSteel');

  part(T, g, pipeGeometry(T, { od: ro * 2, id: ri * 2, length: L, seg: seg }), steel, { name: 'pipe' });
  // cone-ring joint: a box socket at the top, pin at the bottom
  part(T, g, G.lathe(T, [
    [ro * 1.06, 0], [ro * 1.06, -mm(64)], [ro, -mm(76)], [ri, -mm(76)], [ri, 0],
  ], seg, true), worn, { name: 'box-joint' });
  part(T, g, G.lathe(T, [
    [ro * 0.985, -L + mm(70)], [ro * 0.985, -L], [ri * 0.94, -L], [ri * 0.94, -L + mm(70)],
  ], seg, true), worn, { name: 'pin-joint' });
  part(T, g, weldBead(T, ro * 1.002, mm(3), low ? 16 : 26), worn, { p: [0, -mm(78), 0], cast: false });

  return finalise(T, g, {
    id: 'casing-pipe', family: 'Casing & Overburden Tools / Casing Pipes',
    name: 'Drillity Casing ' + odMm + ' x ' + wallMm + ' mm',
    odMm: odMm, wallMm: wallMm, lengthMm: opts.lengthMm || 3000,
    joint: 'Cone-ring, RH', material: 'S355J2 / N80',
    method: 'overburden', priceEur: Math.round(odMm * 1.5 * ((opts.lengthMm || 3000) / 1000)),
  }, opts);
}

/**
 * CASING CROWN — the Drillity flagship product.
 * A carbide-studded crown ring welded on a casing shoe: segmented crown with
 * flushing slots between the segments, face buttons, an over-gauge OD row and
 * an ID row, hand-laid weld beads top and bottom.
 * opts: { casingOdMm, wallMm, buttons, wear, shoeLengthMm }
 */
export function buildCasingCrown(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.casingOdMm || 139.7;
  const wallMm = opts.wallMm || 8.0;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 18 : 34;
  const btnSeg = low ? 7 : 10;
  const shoeL = mm(opts.shoeLengthMm || 320);
  const ro = mm(odMm) * 0.5;
  const ri = ro - mm(wallMm);
  const crownOd = ro * 1.055;                    // cuts over-gauge for the casing
  const crownId = ri * 0.955;
  const crownH = mm(46) * (1 - wear * 0.42);
  const nSeg = opts.segments || 8;
  const g = new T.Group();
  g.name = 'casing-crown';
  const steel = bitBodyMaterial(ctx, wear * 0.6);
  const worn = material(ctx, 'wornSteel');
  const crownMat = wearMaterial(ctx, 'wornSteel', wear * 0.9);

  // ── casing shoe the crown is welded onto ──
  part(T, g, pipeGeometry(T, { od: ro * 2, id: ri * 2, length: shoeL, seg: seg }), steel, { name: 'shoe' });
  part(T, g, G.lathe(T, [
    [ro * 1.05, 0], [ro * 1.05, -mm(58)], [ro, -mm(70)], [ri, -mm(70)], [ri, 0],
  ], seg, true), worn, { name: 'shoe-box' });

  // ── the crown ring: segments with flushing slots between them ──
  const crownY = -shoeL;
  const slot = (opts.slotFrac || 0.16) / nSeg * TAU;
  const btnFace = mm(clampv(odMm * 0.085, 9, 16));
  const layout = [];
  for (let i = 0; i < nSeg; i++) {
    const a0 = (i / nSeg) * TAU + slot * 0.5;
    const a1 = ((i + 1) / nSeg) * TAU - slot * 0.5;
    const geo = arcSector(T, { rIn: crownId, rOut: crownOd, a0: a0, a1: a1, h: crownH, seg: low ? 4 : 7 });
    geo.translate(0, crownY - crownH, 0);
    part(T, g, geo, crownMat, { name: 'crown' + i });
    // leading chamfer block so the crown reads as a cutting shoe, not a tube
    const cham = arcSector(T, { rIn: crownId, rOut: crownOd * 0.999, a0: a0, a1: a1, h: mm(10), seg: low ? 4 : 7 });
    cham.translate(0, crownY - crownH - mm(9), 0);
    part(T, g, cham, crownMat, { name: 'cham' + i, s: [0.985, 1, 0.985] });

    const am = (a0 + a1) * 0.5;
    const spread = (a1 - a0) * 0.34;
    // face row
    for (let k = -1; k <= 1; k++) {
      const aa = am + k * spread;
      const rr = (crownOd + crownId) * 0.5;
      layout.push({
        x: Math.cos(aa) * rr, y: crownY - crownH - mm(8), z: Math.sin(aa) * rr,
        nx: 0, ny: -1, nz: 0, dia: btnFace, kind: 'ballistic',
      });
    }
    // OD gauge row — angled out, this is what makes the over-gauge hole
    for (let k = -1; k <= 1; k += 2) {
      const aa = am + k * spread * 0.7;
      layout.push({
        x: Math.cos(aa) * crownOd, y: crownY - crownH * 0.55, z: Math.sin(aa) * crownOd,
        nx: Math.cos(aa) * 0.82, ny: -0.57, nz: Math.sin(aa) * 0.82,
        dia: btnFace * 0.92, kind: 'spherical', gauge: true,
      });
    }
    // ID row — clears the pilot
    layout.push({
      x: Math.cos(am) * crownId, y: crownY - crownH * 0.5, z: Math.sin(am) * crownId,
      nx: -Math.cos(am) * 0.7, ny: -0.71, nz: -Math.sin(am) * 0.7,
      dia: btnFace * 0.8, kind: 'spherical',
    });
  }
  studFace(T, ctx, g, layout, { wear: wear, seg: btnSeg });

  // ── hand-laid weld beads, top and bottom of the crown ──
  part(T, g, weldBead(T, ro * 1.004, mm(4.2), low ? 18 : 30), worn, { p: [0, crownY + mm(2), 0], cast: false });
  part(T, g, weldBead(T, ri * 0.998, mm(3.4), low ? 16 : 26), worn, { p: [0, crownY + mm(2), 0], cast: false });

  // `crownOd` is the crown body's shoulder, not the hole it cuts: the gauge
  // buttons stand proud of it, and they are what touches the wall. Measured,
  // so the quoted figure cannot drift away from the model.
  const cutR = sweptRadius(T, g);
  return finalise(T, g, {
    id: 'casing-crown', family: 'Casing & Overburden Tools / Casing Crowns',
    name: 'Drillity Casing Crown ' + odMm + ' mm',
    casingOdMm: odMm, wallMm: wallMm, cutDiaMm: Math.round(cutR * 2000),
    segments: nSeg, buttons: layout.length, flushingSlots: nSeg,
    material: 'Carbide grade DP70 in 42CrMo4 crown, welded to S355J2 shoe',
    duty: 'Heavy-duty (HD)', method: 'overburden',
    priceEur: Math.round(420 + odMm * 6.4),
  }, opts);
}

/**
 * Ring-bit system — the pilot bit drives a ring bit that stays with the casing
 * shoe. opts.exploded (0..1) pulls the pilot out of the ring to show the drive.
 */
export function buildRingBitSystem(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.casingOdMm || 139.7;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 28;
  const btnSeg = low ? 7 : 10;
  const exploded = clamp01(opts.exploded || 0);
  const ro = mm(odMm) * 0.5;
  const ringId = ro * 0.70;
  const g = new T.Group();
  g.name = 'ring-bit-system';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.7);
  const worn = material(ctx, 'wornSteel');

  // ── ring bit ──
  const ring = group(T, g, 'ring-bit');
  const rH = mm(72);
  part(T, ring, profiledLathe(T, [
    [ro * 1.045, 0], [ro * 1.045, -rH * 0.62], [ro * 1.02, -rH * 0.9],
    [ro * 0.96, -rH], [ringId, -rH], [ringId, -rH * 0.55],
    [ringId * 1.05, 0],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (r > ringId * 1.2 || y < -rH * 0.6) return 1;
      const a = ((th * 6) % TAU + TAU) % TAU;   // internal drive lugs
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 + 0.10 * Math.max(0, 1 - d * 2.2);
    },
  }), steel, { name: 'ring' });
  const rl = [];
  const rn = Math.max(6, Math.round(odMm / 16));
  rl.push.apply(rl, ringLayout({ count: rn, radius: (ro * 1.03 + ringId) * 0.5, y: -rH - mm(1), tilt: Math.PI, dia: mm(11), kind: 'ballistic' }));
  rl.push.apply(rl, ringLayout({ count: rn, radius: ro * 1.045, y: -rH * 0.78, tilt: 118 * DEG, dia: mm(10), kind: 'spherical', gauge: true, phase: 0.4 }));
  studFace(T, ctx, ring, rl, { wear: wear, seg: btnSeg });

  // ── pilot bit that drives it ──
  const pilot = group(T, g, 'pilot-bit', { p: [0, exploded * mm(320), 0], dynamic: exploded > 0 });
  const pR = ringId * 0.985;
  const pH = mm(150);
  part(T, pilot, profiledLathe(T, [
    [mm(9), -pH], [pR * 0.5, -pH], [pR * 0.94, -pH + mm(12)],
    [pR, -pH + mm(30)], [pR, -mm(40)], [pR * 0.82, -mm(26)],
    [mm(38), -mm(26)], [mm(38), 0], [mm(9), 0],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (y > -mm(30) || r < pR * 0.8) return 1;
      const a = ((th * 6) % TAU + TAU) % TAU;   // matching drive lugs
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.055 * Math.max(0, 1 - d * 2.0);
    },
  }), steel, { name: 'pilot' });
  const pl = ringLayout({ count: 6, radius: pR * 0.72, y: -pH + mm(4), tilt: Math.PI - 0.25, dia: mm(11), kind: 'ballistic' });
  pl.push.apply(pl, ringLayout({ count: 3, radius: pR * 0.30, y: -pH + mm(2), tilt: Math.PI, dia: mm(10), kind: 'ballistic', phase: 0.6 }));
  studFace(T, ctx, pilot, pl, { wear: wear, seg: btnSeg });
  flushHole(T, ctx, pilot, { x: 0, y: -pH + mm(2), z: 0, r: mm(8), dir: [0, -1, 0], seg: low ? 8 : 11, chamferMat: worn });
  addBoxThread(T, ctx, pilot, opts.thread || 'T51', { y0: -mm(4), length: mm(50), quality: low ? 0 : 0.6 });

  // Read the quoted diameters off the built mesh, not off the parameters that
  // fed it. The authored form here was `Math.round(ro * 2.09 * 1000) / 1000`,
  // which quoted a 139.7 mm ring-bit system as cutting **0.146 mm** — a
  // thousandfold unit slip that a number standing beside the geometry is free
  // to make and the geometry can never contradict. It also ignored the gauge
  // buttons, which are the part that actually touches the wall: the ring body
  // is 146 mm over its shoulders, and the hole it cuts is 153 mm.
  const ringR = sweptRadius(T, ring);
  const pilotR = sweptRadius(T, pilot);
  const out = finalise(T, g, {
    id: 'ring-bit', family: 'Casing & Overburden Tools / Ring-Bit Systems',
    name: 'Drillity Ringcut ' + odMm + ' Ring-Bit System',
    casingOdMm: odMm, cutDiaMm: Math.round(ringR * 2000),
    pilotDiaMm: Math.round(pilotR * 2000),
    driveLugs: 6, parts: ['ring bit', 'pilot bit'],
    ringBit: 'On the casing shoe — left in the ground with the casing',
    pilotBit: 'Retrieved up through the casing',
    material: 'Carbide DP70, 42CrMo4 bodies', method: 'overburden',
    priceEur: Math.round(980 + odMm * 8.2),
  }, opts);
  out.userData.pilot = pilot;
  out.userData.ring = ring;
  return out;
}

/**
 * ECCENTRIC (Odex-type) overburden system — the third topology in this family,
 * and the one that is neither of the other two.
 *
 * A concentric system puts the pilot and the ring bit on ONE centreline and
 * leaves the ring in the ground. A wing bit folds its wings in. An eccentric
 * system does a third thing: a reamer swings OFF the centreline — that is what
 * eccentric means — to cut the over-gauge hole the casing follows, and then
 * reverse rotation swings it back inside the pilot's own gauge so the whole
 * system, reamer included, is withdrawn up through the casing. Nothing here is
 * sacrificial and nothing is left behind, which is what separates it from the
 * concentric family; and the reamer is off-axis rather than folded flat
 * against the body, which is what separates it from the wing family.
 *
 * Both halves of that are geometry, not prose, so the builder measures both:
 * open, the reamer must cut wider than the casing OD or the casing could not
 * follow; closed, the widest point of the WHOLE tool must clear the casing
 * BORE or the system could never come out of the hole. The quoted diameters
 * are read off the built mesh by sweptRadius(), for the same reason the
 * concentric and wing builders do it — a number authored beside the model is
 * free to disagree with it, and here it did: this builder used to quote a
 * 121 mm ream off a `tipR` constant that no vertex ever touched, while the arm
 * it actually built swept 179 mm on a 114.3 mm casing (57 % over-gauge), and
 * closed to 169 mm — nearly twice the bore it is supposed to retract through.
 *
 * opts: { casingOdMm, wallMm, thread, open (0..1), wear, lod }
 */
export function buildEccentricSystem(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.casingOdMm || 114.3;
  const wallMm = opts.wallMm || 7.0;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const btnSeg = low ? 7 : 10;
  const open = clamp01(opts.open === undefined ? 1 : opts.open);
  const ro = mm(odMm) * 0.5;                 // casing OD
  const ri = ro - mm(wallMm);                // casing bore — the whole tool comes back up this
  const pR = ri * 0.86;                      // pilot gauge: the closed reamer hides behind it
  const reamR = ro * 1.06;                   // target reamed radius — over-gauge for the casing
  const CLOSED = 1.32;                       // rad: reamer swung in behind the pilot gauge
  const OPEN = 0.0;                          // rad: reamer out on full gauge
  const ang = lerp(CLOSED, OPEN, open);
  const g = new T.Group();
  g.name = 'eccentric-system';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.55);
  const head = bitBodyMaterial(ctx, wear * 0.7);
  const worn = material(ctx, 'wornSteel');

  const guideL = mm(210);
  const pilotL = mm(120);
  // ── guide device: centralises the string inside the casing ──
  part(T, g, G.lathe(T, [
    [mm(10), 0], [pR, 0], [pR, -guideL * 0.55],
    [pR * 0.94, -guideL], [mm(10), -guideL],
  ], seg, false), steel, { name: 'guide' });
  addBoxThread(T, ctx, g, opts.thread || 'T45', { y0: -mm(4), length: mm(46), quality: low ? 0 : 0.6 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    part(T, g, G.box(T, mm(10), guideL * 0.6, mm(6)), worn, {
      p: [Math.cos(a) * pR * 0.96, -guideL * 0.45, Math.sin(a) * pR * 0.96], r: [0, -a, 0], name: 'guide-rib' + i,
    });
  }

  // ── pilot head, with the shoulder the reamer pivots on ──
  const pilot = group(T, g, 'pilot', { p: [0, -guideL, 0] });
  part(T, pilot, G.lathe(T, [
    [mm(10), -pilotL], [pR * 0.55, -pilotL], [pR * 0.92, -pilotL + mm(14)],
    [pR * 0.92, -mm(20)], [pR * 0.62, 0], [mm(10), 0],
  ], seg, false), head, { name: 'pilot-body' });
  studFace(T, ctx, pilot, ringLayout({
    count: 5, radius: pR * 0.62, y: -pilotL + mm(3), tilt: Math.PI - 0.3, dia: mm(11), kind: 'ballistic',
  }).concat(ringLayout({
    count: 2, radius: pR * 0.24, y: -pilotL + mm(1), tilt: Math.PI, dia: mm(10), kind: 'ballistic', phase: 0.8,
  })), { wear: wear, seg: btnSeg });
  // Measured before the reamer is hung on it, so this is the pilot's own gauge.
  const pilotR = sweptRadius(T, pilot);

  // ── the eccentric reamer ──
  // The hinge pin is bolted through the pilot's shoulder and does NOT turn, so
  // it lives in a static seat and merges into the body. Only the arm gets its
  // own bucket, because only the arm moves.
  const pinR = pR * 0.45;                    // hinge offset from the centreline
  const pinY = -pilotL * 0.55;
  const armL = reamR - pinR;                 // hinge to cutting tip -> open sweep lands on reamR
  // The plate's axial height and tangential width are what decide whether the
  // tool comes out of the hole: swung in, they rotate into the radius, so a
  // fat plate that reams correctly can still be too wide to retract. Both are
  // sized against the bore, and the QA walk measures the result.
  const armH = mm(26);                       // axial height of the reamer plate
  const armT = mm(32);                       // tangential width
  // The pin takes the body's own worn-steel rather than chrome: it shares the
  // guide ribs' bucket that way, and a 10 mm pin is not worth a draw call of
  // its own at the size this renders.
  const seat = group(T, pilot, 'reamer-seat', { p: [pinR, pinY, 0] });
  part(T, seat, G.cyl(T, mm(10), mm(10), armT + mm(12), low ? 8 : 12), worn, {
    r: [Math.PI / 2, 0, 0], name: 'hinge-pin',
  });
  const pivot = group(T, pilot, 'reamer-pivot', { p: [pinR, pinY, 0], r: [0, 0, ang], dynamic: true });
  part(T, pivot, G.roundedBox(T, armL, armH, armT, mm(7), 2), head, { p: [armL * 0.5, 0, 0], name: 'reamer' });
  const rl = [];
  for (let i = 0; i < 4; i++) {
    rl.push({
      x: armL * (0.38 + (i % 2) * 0.26), y: -armH * 0.5 - mm(1), z: (i < 2 ? -1 : 1) * mm(11),
      nx: 0.18, ny: -0.98, nz: 0, dia: mm(11), kind: 'ballistic',
    });
  }
  // Gauge row on the outer flank — these are the buttons that set the reamed
  // hole, so they are what sweptRadius() picks up below.
  rl.push({ x: armL - mm(3), y: -armH * 0.22, z: -mm(9), nx: 1, ny: -0.28, nz: 0, dia: mm(11), kind: 'spherical', gauge: true });
  rl.push({ x: armL - mm(3), y: -armH * 0.22, z: mm(9), nx: 1, ny: -0.28, nz: 0, dia: mm(11), kind: 'spherical', gauge: true });
  studFace(T, ctx, pivot, rl, { wear: wear, seg: btnSeg });

  // Swing the reamer through its travel and measure both ends of it.
  const sweepAt = (a) => { pivot.rotation.z = a; return sweptRadius(T, g); };
  const openR = sweepAt(OPEN);
  const shutR = sweepAt(CLOSED);
  pivot.rotation.z = ang;

  const out = finalise(T, g, {
    id: 'eccentric-system', family: 'Casing & Overburden Tools / Eccentric Systems',
    name: 'Drillity Excentra ' + odMm + ' Eccentric System',
    casingOdMm: odMm, wallMm: wallMm, casingBoreMm: Math.round(ri * 2000),
    pilotDiaMm: Math.round(pilotR * 2000),
    reamDiaMm: Math.round(openR * 2000), retractedDiaMm: Math.round(shutR * 2000),
    hinges: 1, movingParts: 1, parts: ['pilot bit', 'eccentric reamer', 'guide device'],
    reamerAction: 'Swings off-centre under forward rotation to ream clearance for the casing; reverse rotation swings it in behind the pilot gauge to withdraw',
    retrievable: true, sacrificial: false,
    style: 'Odex-type eccentric reamer', material: 'Carbide DP70, 42CrMo4', method: 'overburden',
    priceEur: Math.round(1250 + odMm * 9),
  }, opts);
  out.userData.reamerPivot = pivot;
  out.userData.reamerTravel = { closed: CLOSED, open: OPEN };
  out.userData.setOpen = (v) => { pivot.rotation.z = lerp(CLOSED, OPEN, clamp01(v)); };
  return out;
}

/**
 * Widest cylindrical radius of a subtree, in the tool's own frame.
 *
 * The overburden specs quote diameters a driller would put a tape across —
 * the hole a ring bit actually cuts, the envelope a folded wing actually
 * retracts inside. Reading them off the geometry instead of authoring them
 * beside it is what stops the number and the model from disagreeing, which is
 * the failure this whole section was rebuilt to end.
 */
function sweptRadius(T, node) {
  node.updateWorldMatrix(true, true);
  const v = new T.Vector3();
  let r = 0;
  node.traverse((o) => {
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
      const q = Math.sqrt(v.x * v.x + v.z * v.z);
      if (q > r) r = q;
    }
  });
  return r;
}

/**
 * CONCENTRIC overburden system — a pilot bit and a RING BIT on the same
 * centreline. That is what "concentric" means, and it is the whole difference
 * from the family below.
 *
 * The ring bit is carried on the casing shoe, cuts the over-gauge hole the
 * casing follows into, and is LEFT IN THE GROUND with the casing — a genuine
 * sacrificial part. The pilot drills the centre, drives the ring through six
 * axial lugs, and comes home up the inside of the casing: every retrieved
 * diameter here is smaller than the casing bore, which is what makes that
 * claim true rather than decorative.
 *
 * There is no hinge in this system and nothing retracts. A pivot in this
 * geometry would be a wing-bit system wearing the wrong label, which is what
 * this builder used to be (AUDIT_ACCURACY.md finding 4). The drive is a
 * spline, not a bayonet — the ring's lugs stand in the pilot's flutes, so the
 * pilot lifts straight out without being rotated to release, exactly as the
 * `conc-114` listing says.
 *
 * opts: { casingOdMm, wallMm, thread, exploded (0..1), wear, lod }
 */
export function buildConcentricSystem(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.casingOdMm || 139.7;
  const wallMm = opts.wallMm || 8.0;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const btnSeg = low ? 7 : 10;
  const exploded = clamp01(opts.exploded || 0);
  const lugs = opts.lugs || 6;
  const ro = mm(odMm) * 0.5;                 // casing OD
  const ri = ro - mm(wallMm);                // casing bore — everything retrieved comes up through here
  const pR = ri * 0.92;                      // pilot head
  const ringId = pR * 1.035;                 // …passes through the ring bit on the way out
  const ringOd = ro * 1.075;                 // …and the ring cuts over-gauge for the casing
  const g = new T.Group();
  g.name = 'concentric-system';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.55);
  const head = bitBodyMaterial(ctx, wear * 0.7);
  const worn = material(ctx, 'wornSteel');

  const casY = -mm(60);
  const casL = mm(200);
  const shoeY = casY - casL;
  const shoeL = mm(112);
  const ringY = shoeY - shoeL;
  const rH = mm(76) * (1 - wear * 0.16);     // the ring is consumable: it wears down and stays down
  const ringBase = ringY - rH;
  const pFace = ringBase - mm(16);           // the pilot leads the ring
  const shankR = pR * 0.58;

  /** Six axial drive lugs — the ring's stand in the pilot's flutes. */
  const lug = (th, sharp) => {
    const a = ((th * lugs) % TAU + TAU) % TAU;
    const d = Math.min(a, TAU - a) / Math.PI;
    return Math.max(0, 1 - d * sharp);
  };

  // ── casing joint and shoe: what the ring bit is carried on ──
  part(T, g, pipeGeometry(T, { od: ro * 2, id: ri * 2, length: casL, y0: casY, seg: seg }), steel, { name: 'casing' });
  part(T, g, G.lathe(T, [
    [ro * 1.06, casY], [ro * 1.06, casY - mm(64)], [ro, casY - mm(76)], [ri, casY - mm(76)], [ri, casY],
  ], seg, true), worn, { name: 'casing-box' });
  part(T, g, G.lathe(T, [
    [ro * 1.015, shoeY], [ro * 1.015, shoeY - shoeL], [ringId * 1.05, shoeY - shoeL],
    [ri, shoeY - mm(34)], [ri, shoeY],
  ], seg, true), steel, { name: 'casing-shoe' });
  part(T, g, weldBead(T, ro * 1.006, mm(4.0), low ? 18 : 30), worn, { p: [0, shoeY - mm(3), 0], cast: false });

  // ── the ring bit: welded on the shoe, and it stays in the ground with it ──
  const ring = group(T, g, 'ring-bit');
  part(T, ring, profiledLathe(T, [
    [ringOd, ringY], [ringOd, ringBase + rH * 0.36], [ringOd * 0.985, ringBase + mm(9)],
    [ringOd * 0.93, ringBase], [ringId, ringBase], [ringId, ringBase + rH * 0.62],
    [ringId * 1.04, ringY],
  ], {
    segments: seg,
    radiusFn: (th, r) => (r > ringId * 1.06 ? 1 : 1 - 0.09 * lug(th, 3.0)),
  }), head, { name: 'ring' });
  part(T, ring, weldBead(T, ringOd * 0.995, mm(3.6), low ? 16 : 26), worn, { p: [0, ringY - mm(2), 0], cast: false });
  const rl = [];
  const rn = Math.max(8, Math.round(odMm / 14));
  rl.push.apply(rl, ringLayout({ count: rn, radius: (ringOd * 0.965 + ringId) * 0.5, y: ringBase - mm(1), tilt: Math.PI, dia: mm(11), kind: 'ballistic' }));
  rl.push.apply(rl, ringLayout({ count: rn, radius: ringOd, y: ringBase + rH * 0.20, tilt: 118 * DEG, dia: mm(10), kind: 'spherical', gauge: true, phase: 0.4 }));
  rl.push.apply(rl, ringLayout({ count: Math.max(4, rn >> 1), radius: ringId, y: ringBase + mm(9), tilt: 236 * DEG, dia: mm(9), kind: 'spherical', phase: 0.25 }));
  studFace(T, ctx, ring, rl, { wear: wear, seg: btnSeg });

  // ── the pilot bit: same centreline, and it comes back up the casing ──
  const pilot = group(T, g, 'pilot-bit', { p: [0, exploded * mm(420), 0], dynamic: exploded > 0 });
  part(T, pilot, profiledLathe(T, [
    [mm(9), pFace], [pR * 0.52, pFace], [pR * 0.90, pFace + mm(13)],
    [pR, pFace + mm(30)], [pR, ringY - mm(10)], [pR * 0.985, ringY + mm(4)],
    [pR * 0.74, ringY + mm(22)], [shankR, ringY + mm(40)], [shankR, -mm(40)],
    [mm(40), -mm(30)], [mm(40), 0], [mm(9), 0],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      // Flutes down the head: the ring's lugs run in these, so torque goes
      // through the drive and the pilot still lifts straight out.
      if (r < pR * 0.7 || y < pFace + mm(29) || y > ringY + mm(5)) return 1;
      return 1 - 0.12 * lug(th, 2.4);
    },
  }), head, { name: 'pilot' });
  const pl = ringLayout({ count: 6, radius: pR * 0.64, y: pFace + mm(3), tilt: Math.PI - 0.28, dia: mm(11), kind: 'ballistic' });
  pl.push.apply(pl, ringLayout({ count: 3, radius: pR * 0.26, y: pFace + mm(1), tilt: Math.PI, dia: mm(10), kind: 'ballistic', phase: 0.6 }));
  pl.push.apply(pl, ringLayout({ count: lugs, radius: pR * 0.97, y: pFace + mm(20), tilt: 118 * DEG, dia: mm(9), kind: 'spherical', gauge: true, phase: Math.PI / lugs }));
  studFace(T, ctx, pilot, pl, { wear: wear, seg: btnSeg });
  flushHole(T, ctx, pilot, { x: 0, y: pFace + mm(2), z: 0, r: mm(8), dir: [0, -1, 0], seg: low ? 8 : 11, chamferMat: worn });
  addBoxThread(T, ctx, pilot, opts.thread || 'T51', { y0: -mm(4), length: mm(50), quality: low ? 0 : 0.6 });
  // Guide ribs inside the casing. This is the straight-hole claim in steel:
  // the pilot is centred in the casing, not swung off it.
  const guideOut = ri * 0.955;
  const guideR = (shankR + guideOut) * 0.5;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    part(T, pilot, G.box(T, guideOut - shankR, mm(120), mm(16)), worn, {
      p: [Math.cos(a) * guideR, casY - casL * 0.42, Math.sin(a) * guideR], r: [0, -a, 0], name: 'guide' + i,
    });
  }

  const ringR = sweptRadius(T, ring);
  const pilotR = sweptRadius(T, pilot);
  const out = finalise(T, g, {
    id: 'concentric-system', family: 'Casing & Overburden Tools / Concentric Systems',
    name: 'Drillity Concentra ' + odMm + ' Concentric System',
    casingOdMm: odMm, wallMm: wallMm, casingBoreMm: Math.round(ri * 2000),
    pilotDiaMm: Math.round(pilotR * 2000), ringBitOdMm: Math.round(ringOd * 2000),
    ringBitBoreMm: Math.round(ringId * 2000), cutDiaMm: Math.round(ringR * 2000),
    driveLugs: lugs, hinges: 0, movingParts: 0,
    parts: ['pilot bit', 'ring bit', 'casing shoe'],
    ringBit: 'On the casing shoe — left in the ground with the casing',
    pilotBit: 'Retrieved up through the casing',
    style: 'Concentric ring bit, axial-lug drive (Symmetrix type)',
    material: 'Carbide DP70, 42CrMo4 bodies', method: 'overburden',
    priceEur: Math.round(1650 + odMm * 10),
  }, opts);
  out.userData.pilot = pilot;
  out.userData.ring = ring;
  // Deliberately no setOpen(): nothing on a concentric system opens or folds.
  // The pilot only separates, and only when the caller asked for that at build
  // time — a merged static node cannot be moved afterwards.
  if (exploded > 0) out.userData.setExploded = (v) => { pilot.position.y = clamp01(v) * mm(420); };
  return out;
}

/**
 * WING-BIT system — folding wings that swing out to cut the clearance the
 * casing needs, and fold back in so the whole bit is pulled up through the
 * casing and used again.
 *
 * A wing bit is NOT a lost bit, and the hinge is the entire point of the
 * family: it is the one thing a concentric system does not have. So the
 * numbers have to hold. Folded, the widest point of the assembly is inside the
 * casing bore — that is what "comes back up" means; open, the wings cut wider
 * than the casing OD — that is what "clearance for the casing" means. Both are
 * measured by the QA walk, not asserted here.
 *
 * The wings fold into milled pockets in the body, so the folded envelope is
 * the body's own, and the hinge pins belong to the body: they do not move, so
 * they merge with it and only the wings keep their own draw call.
 *
 * opts: { casingOdMm, wallMm, wings, thread, open (0..1), wear, lod }
 */
export function buildWingBitSystem(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.casingOdMm || 139.7;
  const wallMm = opts.wallMm || 8.0;
  const wings = clampv(Math.round(opts.wings || 2), 2, 4);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const btnSeg = low ? 7 : 10;
  const open = clamp01(opts.open === undefined ? 1 : opts.open);
  const ro = mm(odMm) * 0.5;
  const ri = ro - mm(wallMm);                // the bore the folded bit comes back up
  const bR = ri * 0.80;                      // body
  const L = mm(250);
  const hingeY = -mm(200);
  const pinR = bR * 0.68;
  const armW = mm(28);                       // radial thickness of a wing plate
  const armL = mm(35);                       // hinge to cutting tip
  const armT = mm(34);                       // tangential width
  const CLOSED = 0.03;
  const OPEN = 1.30;
  const ang = lerp(CLOSED, OPEN, open);
  const g = new T.Group();
  g.name = 'wing-bit-system';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.55);
  const head = bitBodyMaterial(ctx, wear * 0.7);
  const worn = material(ctx, 'wornSteel');

  // ── body, with a milled pocket per wing so the folded wing tucks inside ──
  const pocket = (th) => {
    const a = ((th * wings) % TAU + TAU) % TAU;
    const d = Math.min(a, TAU - a) / Math.PI;
    return Math.max(0, 1 - d * 2.7);
  };
  part(T, g, profiledLathe(T, [
    [mm(9), -L], [bR * 0.58, -L], [bR * 0.90, -L + mm(6)], [bR, -L + mm(26)],
    [bR, hingeY + mm(24)], [bR, hingeY + mm(30)], [bR, -mm(54)],
    [mm(42), -mm(36)], [mm(42), 0], [mm(9), 0],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (y < -L + mm(5) || y > hingeY + mm(25) || r < bR * 0.5) return 1;
      return 1 - 0.66 * pocket(th);
    },
  }), head, { name: 'body' });
  addBoxThread(T, ctx, g, opts.thread || 'T51', { y0: -mm(4), length: mm(50), quality: low ? 0 : 0.6 });
  studFace(T, ctx, g, ringLayout({
    count: 6, radius: bR * 0.62, y: -L + mm(5), tilt: Math.PI - 0.32, dia: mm(11), kind: 'ballistic',
  }).concat(ringLayout({
    count: 3, radius: bR * 0.24, y: -L + mm(2), tilt: Math.PI, dia: mm(10), kind: 'ballistic', phase: 0.7,
  })).concat(ringLayout({
    count: 6, radius: bR * 0.95, y: -L + mm(24), tilt: 124 * DEG, dia: mm(9), kind: 'spherical', gauge: true, phase: 0.5,
  })), { wear: wear, seg: btnSeg });
  flushHole(T, ctx, g, { x: 0, y: -L + mm(2), z: 0, r: mm(8), dir: [0, -1, 0], seg: low ? 8 : 11, chamferMat: worn });

  // ── the wings ──
  // The hinge group IS the moving node: mergeStatic() bakes a static child's
  // transform into its dynamic parent, so a wing parked one group deeper would
  // merge solid and setOpen() would silently move nothing.
  const pivots = [];
  for (let i = 0; i < wings; i++) {
    const a = (i / wings) * TAU;
    const seat = group(T, g, 'wing-seat' + i, { p: [Math.cos(a) * pinR, hingeY, Math.sin(a) * pinR], r: [0, -a, 0] });
    part(T, seat, G.cyl(T, mm(9), mm(9), armT + mm(14), low ? 8 : 12), material(ctx, 'chrome'), { r: [Math.PI / 2, 0, 0], name: 'hinge-pin' });
    const hinge = group(T, g, 'wing-pivot' + i, {
      p: [Math.cos(a) * pinR, hingeY, Math.sin(a) * pinR], r: [0, -a, ang], dynamic: true,
    });
    part(T, hinge, G.roundedBox(T, armW, armL + mm(9), armT, mm(6), 2), head, {
      p: [mm(6), (mm(9) - armL) * 0.5, 0], name: 'wing',
    });
    // Cutting face is the plate's -X flank: it swings down to sweep the
    // annulus when open, and turns inward into the pocket when folded.
    const wl = [
      { x: -armW * 0.5 + mm(6), y: -mm(10), z: -mm(10), nx: -1, ny: 0, nz: 0, dia: mm(10), kind: 'ballistic' },
      { x: -armW * 0.5 + mm(6), y: -mm(10), z: mm(10), nx: -1, ny: 0, nz: 0, dia: mm(10), kind: 'ballistic' },
      { x: -armW * 0.5 + mm(6), y: -mm(25), z: -mm(6), nx: -1, ny: 0, nz: 0, dia: mm(10), kind: 'ballistic' },
      { x: -armW * 0.5 + mm(6), y: -mm(25), z: mm(6), nx: -1, ny: 0, nz: 0, dia: mm(10), kind: 'ballistic' },
      { x: mm(8), y: -armL - mm(1), z: -mm(9), nx: -0.28, ny: -0.96, nz: 0, dia: mm(10), kind: 'spherical', gauge: true },
      { x: mm(8), y: -armL - mm(1), z: mm(9), nx: -0.28, ny: -0.96, nz: 0, dia: mm(10), kind: 'spherical', gauge: true },
    ];
    studFace(T, ctx, hinge, wl, { wear: wear, seg: btnSeg });
    pivots.push(hinge);
  }

  // ── the casing shoe the wings ream for, and retract back up inside ──
  const shoe = group(T, g, 'casing-shoe', { p: [0, -mm(6), 0] });
  const shoeL = mm(160);
  part(T, shoe, pipeGeometry(T, { od: ro * 2, id: ri * 2, length: shoeL, seg: seg }), steel, { name: 'shoe' });
  part(T, shoe, G.lathe(T, [
    [ro * 1.018, -shoeL + mm(56)], [ro * 1.018, -shoeL], [ri * 0.995, -shoeL], [ri * 0.995, -shoeL + mm(56)],
  ], seg, true), worn, { name: 'shoe-ring' });
  studFace(T, ctx, shoe, ringLayout({
    count: Math.max(6, Math.round(odMm / 18)), radius: (ro * 1.01 + ri) * 0.5,
    y: -shoeL - mm(1), tilt: Math.PI, dia: mm(9), kind: 'spherical', gauge: true,
  }), { wear: wear, seg: btnSeg });
  part(T, shoe, weldBead(T, ro * 1.004, mm(3.4), low ? 16 : 26), worn, { p: [0, -shoeL + mm(54), 0], cast: false });

  // Swing the wings through their travel and measure both ends of it.
  const sweep = (a) => {
    let r = 0;
    for (const p of pivots) { p.rotation.z = a; r = Math.max(r, sweptRadius(T, p)); }
    return r;
  };
  const reamR = sweep(OPEN);
  const foldR = sweep(CLOSED);
  sweep(ang);
  const out = finalise(T, g, {
    id: 'wing-bit-system', family: 'Casing & Overburden Tools / Wing-Bit Systems',
    name: 'Drillity Wingcut ' + odMm + ' Wing-Bit System',
    casingOdMm: odMm, wallMm: wallMm, casingBoreMm: Math.round(ri * 2000),
    wings: wings, hinges: wings, pilotDiaMm: Math.round(bR * 2000),
    reamDiaMm: Math.round(reamR * 2000), retractedDiaMm: Math.round(foldR * 2000),
    parts: ['wing bit', 'casing shoe'],
    wingAction: 'Swing out under rotation to ream clearance for the casing, fold in to come back up through it',
    retrievable: true, sacrificial: false,
    material: 'Carbide DP70, 42CrMo4', method: 'overburden',
    priceEur: Math.round(1180 + odMm * 10.2),
  }, opts);
  out.userData.wingPivots = pivots;
  out.userData.wingTravel = { closed: CLOSED, open: OPEN };
  out.userData.setOpen = (v) => {
    const k = lerp(CLOSED, OPEN, clamp01(v));
    for (const p of pivots) p.rotation.z = k;
  };
  return out;
}

/** Casing shoe / drive cap — the plain welded end without a full crown. */
export function buildCasingShoe(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.odMm || 168.3;
  const wallMm = opts.wallMm || 10;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 28;
  const ro = mm(odMm) * 0.5;
  const ri = ro - mm(wallMm);
  const L = mm(240);
  const g = new T.Group();
  g.name = 'casing-shoe';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.6);
  const worn = material(ctx, 'wornSteel');
  part(T, g, pipeGeometry(T, { od: ro * 2, id: ri * 2, length: L, seg: seg }), steel);
  part(T, g, G.lathe(T, [
    [ro * 1.02, -L + mm(70)], [ro * 1.02, -L], [ri * 0.97, -L], [ri * 0.97, -L + mm(70)],
  ], seg, true), worn, { name: 'shoe-ring' });
  studFace(T, ctx, g, ringLayout({
    count: Math.max(8, Math.round(odMm / 16)), radius: (ro * 1.01 + ri) * 0.5,
    y: -L - mm(1), tilt: Math.PI, dia: mm(10), kind: 'spherical',
  }), { wear: wear, seg: low ? 7 : 10 });
  part(T, g, weldBead(T, ro * 1.004, mm(3.6), low ? 18 : 30), worn, { p: [0, -L + mm(68), 0], cast: false });
  return finalise(T, g, {
    id: 'casing-shoe', family: 'Casing & Overburden Tools / Casing Shoes & Drive Caps',
    name: 'Drillity Casing Shoe ' + odMm + ' mm',
    odMm: odMm, wallMm: wallMm, lengthMm: 240, material: 'S355J2, carbide-faced',
    method: 'overburden', priceEur: Math.round(210 + odMm * 2.4),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §6 DRILL STRING — rods, couplings
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Threaded drill rod. Male thread at the bottom, box (or male + coupling) at
 * the top, a polished mid-band where the rod holder and centraliser rub, and
 * real thread crests at both ends.
 * opts: { thread, lengthMm, type:'MF'|'MM', wear, lod }
 */
export function buildDrillRod(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const thread = String(opts.thread || 'T45').toUpperCase();
  const ts = THREAD_SPECS[thread] || THREAD_SPECS.T45;
  const L = mm(opts.lengthMm || 3660);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 18;
  const type = opts.type === 'MM' ? 'MM' : 'MF';
  const R = mm(ts.majorMm) * 0.5 * (type === 'MF' ? 1.24 : 1.02);
  const g = new T.Group();
  g.name = 'drill-rod';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.5);
  const polished = material(ctx, 'chrome', { roughness: 0.18, metalness: 0.95 });
  const worn = material(ctx, 'wornSteel');
  const thrL = mm(ts.pitchMm * 3.6);

  if (type === 'MF') {
    // box (female) end at the top — an upset section with wrench flats
    part(T, g, G.lathe(T, [
      [R, 0], [R, -mm(120)], [R * 0.86, -mm(150)],
      [R * 0.80, -L + mm(150)], [R * 0.94, -L + mm(120)], [R * 0.94, -L],
      [mm(ts.majorMm) * 0.42, -L], [mm(ts.majorMm) * 0.42, 0],
    ], seg, true), steel, { name: 'body' });
    addBoxThread(T, ctx, g, thread, { y0: -mm(6), length: thrL, quality: low ? 0 : 0.6 });
    addPinThread(T, ctx, g, thread, { y0: -L + thrL, length: thrL, quality: low ? 0 : 0.6, mat: steel });
    for (let i = 0; i < 2; i++) {
      part(T, g, G.box(T, mm(4), mm(80), R * 1.5), worn, {
        p: [Math.cos(i * Math.PI) * R * 0.92, -mm(70), 0], r: [0, i * Math.PI, 0],
      });
    }
  } else {
    part(T, g, G.lathe(T, [
      [R, -mm(30)], [R, -L + mm(30)],
      [mm(ts.majorMm) * 0.40, -L + mm(30)], [mm(ts.majorMm) * 0.40, -mm(30)],
    ], seg, true), steel, { name: 'body' });
    addPinThread(T, ctx, g, thread, { y0: -mm(30), length: thrL, down: false, quality: low ? 0 : 0.6, mat: steel });
    addPinThread(T, ctx, g, thread, { y0: -L + mm(30), length: thrL, quality: low ? 0 : 0.6, mat: steel });
  }

  // the polished mid-band — every rod on a working rig has one
  part(T, g, G.cyl(T, R * 0.805, R * 0.805, L * 0.30, seg), polished, { p: [0, -L * 0.5, 0] });
  if (wear > 0.4) {
    // rod-holder jaw scars
    for (let i = 0; i < 3; i++) {
      part(T, g, G.box(T, R * 0.5, mm(26), R * 0.22), worn, {
        p: [Math.cos(i * 2.1) * R * 0.78, -L * (0.34 + i * 0.06), Math.sin(i * 2.1) * R * 0.78],
        r: [0, -i * 2.1, 0], cast: false,
      });
    }
  }

  return finalise(T, g, {
    id: 'drill-rod', family: 'Drill String & Rods / Drill Rods (Threaded)',
    name: 'Drillity ' + thread + ' Drill Rod ' + Math.round(L * 1000) + ' mm ' + type,
    thread: thread, type: type, lengthMm: opts.lengthMm || 3660,
    odMm: Math.round(R * 2000), material: '34CrNiMo6, induction hardened ends',
    method: 'top-hammer', priceEur: Math.round(70 + ts.majorMm * 2.6 * ((opts.lengthMm || 3660) / 3660)),
  }, opts);
}

/** Coupling sleeve — female both ends with a centre stop and wrench flats. */
export function buildCouplingSleeve(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const thread = String(opts.thread || 'T45').toUpperCase();
  const ts = THREAD_SPECS[thread] || THREAD_SPECS.T45;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const R = mm(ts.majorMm) * 0.5 * 1.42;
  const L = mm(ts.pitchMm * 11);
  const g = new T.Group();
  g.name = 'coupling-sleeve';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.6);
  const worn = material(ctx, 'wornSteel');

  part(T, g, profiledLathe(T, [
    [R * 0.92, 0], [R, -mm(14)], [R, -L + mm(14)], [R * 0.92, -L],
    [mm(ts.majorMm) * 0.5 * 0.86, -L], [mm(ts.majorMm) * 0.5 * 0.86, -L * 0.54],
    [mm(ts.majorMm) * 0.42, -L * 0.5], [mm(ts.majorMm) * 0.5 * 0.86, -L * 0.46],
    [mm(ts.majorMm) * 0.5 * 0.86, 0],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (r < R * 0.85 || y < -L * 0.66 || y > -L * 0.34) return 1;
      const a = ((th * 6) % TAU + TAU) % TAU;   // hex wrench band
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.05 * Math.max(0, 1 - d * 2.6);
    },
  }), steel, { name: 'sleeve' });
  addBoxThread(T, ctx, g, thread, { y0: -mm(4), length: mm(ts.pitchMm * 4.2), quality: low ? 0 : 0.6 });
  addBoxThread(T, ctx, g, thread, { y0: -L + mm(4), length: mm(ts.pitchMm * 4.2), down: false, quality: low ? 0 : 0.6 });
  part(T, g, weldBead(T, R * 0.999, mm(1.6), low ? 12 : 20), worn, { p: [0, -L * 0.5, 0], cast: false });

  return finalise(T, g, {
    id: 'coupling-sleeve', family: 'Top Hammer Tools / Coupling Sleeves',
    name: 'Drillity Coupling ' + thread,
    thread: thread, odMm: Math.round(R * 2000), lengthMm: Math.round(L * 1000),
    stop: 'Semi-bridged', material: '34CrNiMo6', method: 'top-hammer',
    priceEur: Math.round(45 + ts.majorMm * 1.8),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §7 GROUND-ENGAGING WEAR TOOLS — picks and holders
   ═══════════════════════════════════════════════════════════════════════════ */

/** Round-shank (point-attack) pick: shank, retainer, washer, conical carbide. */
export function buildRoundShankPick(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const shankMm = opts.shankMm || 22;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const sR = mm(shankMm) * 0.5;
  const g = new T.Group();
  g.name = 'round-shank-pick';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.8);
  const carb = wearMaterial(ctx, 'carbide', wear);
  const rub = material(ctx, 'rubber');

  // origin at the top of the shank; the tip points down
  part(T, g, G.cyl(T, sR, sR, mm(52), seg), steel, { p: [0, -mm(26), 0] });
  part(T, g, G.cyl(T, sR * 1.06, sR * 1.06, mm(9), seg), low ? steel : rub, { p: [0, -mm(12), 0] }); // retaining sleeve
  part(T, g, G.lathe(T, [
    [sR, -mm(52)], [mm(shankMm * 0.92), -mm(56)], [mm(shankMm * 0.92), -mm(66)],
    [mm(shankMm * 0.70), -mm(74)], [mm(shankMm * 0.52), -mm(104)],
    [mm(shankMm * 0.34), -mm(120)], [mm(4), -mm(126)],
  ], seg, false), steel, { name: 'body' });
  // the carbide tip — this is what the player watches go blunt
  const tipGeo = buttonGeometry(T, {
    dia: mm(shankMm * 0.62), kind: 'conical', wear: wear, seg: seg,
    protrusion: 1.9, bury: mm(6),
  });
  tipGeo.rotateX(Math.PI);
  part(T, g, tipGeo, carb, { p: [0, -mm(124), 0] });

  return finalise(T, g, {
    id: 'round-shank-pick', family: 'Ground-Engaging & Cutting Wear Tools / Round-Shank Picks',
    name: 'Drillity Point-Attack Pick ' + shankMm + ' mm',
    shankMm: shankMm, lengthMm: 138, tipCarbideMm: Math.round(shankMm * 0.62),
    material: 'Carbide tip, forged 30CrNiMo8 body', method: 'soil-mixing',
    priceEur: Math.round(9 + shankMm * 0.5),
  }, opts);
}

/** Flat / chisel pick — weld-on flat tooth with a brazed carbide plate. */
export function buildChiselPick(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const wMm = opts.widthMm || 42;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const g = new T.Group();
  g.name = 'chisel-pick';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.8);
  const carb = wearMaterial(ctx, 'carbide', wear);
  const w = mm(wMm);
  const shape = new T.Shape();
  shape.moveTo(-w * 0.5, 0);
  shape.lineTo(w * 0.5, 0);
  shape.lineTo(w * 0.5, -mm(66));
  shape.lineTo(w * 0.24, -mm(96));
  shape.lineTo(-w * 0.24, -mm(96));
  shape.lineTo(-w * 0.5, -mm(66));
  shape.closePath();
  const geo = new T.ExtrudeGeometry(shape, { depth: mm(20), bevelEnabled: false, curveSegments: 1 });
  geo.translate(0, 0, -mm(10));
  part(T, g, geo, steel, { name: 'body' });
  part(T, g, G.box(T, w * 0.5, mm(14 - wear * 7), mm(22)), carb, { p: [0, -mm(94), 0], r: [0.22, 0, 0] });
  part(T, g, weldBead(T, w * 0.42, mm(2.4), low ? 10 : 16), material(ctx, 'wornSteel'), {
    p: [0, -mm(2), 0], s: [1, 1, 0.5], cast: false,
  });
  return finalise(T, g, {
    id: 'chisel-pick', family: 'Ground-Engaging & Cutting Wear Tools / Flat & Chisel Picks',
    name: 'Drillity Chisel Pick ' + wMm + ' mm',
    widthMm: wMm, lengthMm: 96, material: 'Hardox body, brazed carbide plate',
    method: 'auger', priceEur: Math.round(14 + wMm * 0.4),
  }, opts);
}

/** Tool holder / pick box — the weld-on block a round-shank pick lives in. */
export function buildToolHolder(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const shankMm = opts.shankMm || 22;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const g = new T.Group();
  g.name = 'tool-holder';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.6);
  const worn = material(ctx, 'wornSteel');
  part(T, g, G.roundedBox(T, mm(58), mm(86), mm(52), mm(9), 2), steel, { p: [0, -mm(43), 0] });
  part(T, g, G.cyl(T, mm(shankMm) * 0.62, mm(shankMm) * 0.62, mm(96), seg), steel, {
    p: [0, -mm(46), 0], r: [0.42, 0, 0],
  });
  flushHole(T, ctx, g, { x: 0, y: -mm(88), z: mm(20), r: mm(shankMm) * 0.52, dir: [0, -0.91, 0.42], seg: seg });
  part(T, g, weldBead(T, mm(30), mm(3), low ? 12 : 20), worn, { p: [0, -mm(84), 0], cast: false });
  return finalise(T, g, {
    id: 'tool-holder', family: 'Ground-Engaging & Cutting Wear Tools / Tool Holders & Pick Boxes',
    name: 'Drillity Pick Box ' + shankMm + ' mm',
    shankMm: shankMm, material: 'Cast 42CrMo4, weld-on', method: 'auger',
    priceEur: Math.round(28 + shankMm * 0.9),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §8 ROTARY & KELLY FOUNDATION TOOLS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Kelly box adapter (the square/keyed head every foundation tool hangs from). */
function kellyHead(T, ctx, parent, o) {
  const boxMm = o.boxMm || 150;
  const steel = o.mat;
  const s = mm(boxMm);
  part(T, parent, G.box(T, s * 1.34, mm(150), s * 1.34), steel, { p: [0, -mm(75), 0] });
  part(T, parent, G.box(T, s, mm(120), s), steel, { p: [0, mm(60), 0] });
  // U-pin through the box
  part(T, parent, G.cyl(T, mm(20), mm(20), s * 1.8, 10), material(ctx, 'chrome'), {
    p: [0, mm(60), 0], r: [0, 0, Math.PI / 2],
  });
  return parent;
}

/**
 * Kelly auger — central stem, twin helical flights, bolt-on cutting head with
 * round-shank picks and a pilot stinger.
 * opts: { diameterMm, turns, wear, boxMm }
 */
export function buildKellyAuger(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 800;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const R = mm(diaMm) * 0.5;
  const stemR = mm(clampv(diaMm * 0.28, 90, 190)) * 0.5;
  const turns = opts.turns || 1.6;
  const pitch = mm(diaMm * 0.72);
  const g = new T.Group();
  g.name = 'kelly-auger';
  const steel = wearMaterial(ctx, 'paintedSteel', wear * 0.5);
  const worn = wearMaterial(ctx, 'wornSteel', wear);
  const headY = -mm(300) - turns * pitch;

  kellyHead(T, ctx, group(T, g, 'kelly-head'), { boxMm: opts.boxMm || 150, mat: steel });
  part(T, g, G.cyl(T, stemR, stemR, mm(300) + turns * pitch + mm(120), seg), steel, {
    p: [0, -(mm(300) + turns * pitch + mm(120)) * 0.5, 0],
  });

  const starts = opts.starts || 2;
  for (let s = 0; s < starts; s++) {
    const fg = flightGeometry(T, {
      rInner: stemR * 0.96, rOuter: R, pitch: pitch, turns: turns,
      thickness: mm(20), y0: -mm(300), segsPerTurn: low ? 12 : 22,
    });
    part(T, g, fg, steel, { r: [0, (s / starts) * TAU, 0], name: 'flight' + s });
    // wear strip on the outer edge of each flight
    const wg = flightGeometry(T, {
      rInner: R * 0.94, rOuter: R * 1.004, pitch: pitch, turns: turns,
      thickness: mm(24), y0: -mm(300), segsPerTurn: low ? 12 : 22,
    });
    part(T, g, wg, worn, { r: [0, (s / starts) * TAU, 0], name: 'wearstrip' + s, cast: false });
  }

  // bolt-on cutting head
  const head = group(T, g, 'cutting-head', { p: [0, headY, 0] });
  part(T, head, G.cyl(T, stemR * 1.3, stemR * 1.3, mm(70), seg), worn, { p: [0, -mm(35), 0] });
  for (let i = 0; i < 2; i++) {
    const a = (i / 2) * TAU;
    const arm = group(T, head, 'arm' + i, { r: [0, -a, 0] });
    part(T, arm, G.box(T, R * 0.94, mm(70), mm(46)), worn, { p: [R * 0.47, -mm(70), 0], r: [0, 0, -0.10] });
    const nPick = Math.max(3, Math.round(diaMm / 190));
    for (let k = 0; k < nPick; k++) {
      const t = (k + 0.5) / nPick;
      const pk = buildRoundShankPick(T, ctx, { shankMm: 25, wear: wear, lod: opts.lod, merge: false });
      pk.position.set(lerp(stemR * 1.2, R * 0.96, t), -mm(96), 0);
      pk.rotation.z = -0.34;
      pk.scale.setScalar(1.35);
      arm.add(pk);
    }
  }
  // pilot stinger
  part(T, head, G.cyl(T, mm(34), mm(34), mm(180), low ? 8 : 14), worn, { p: [0, -mm(150), 0] });
  const st = buildRoundShankPick(T, ctx, { shankMm: 30, wear: wear, lod: opts.lod, merge: false });
  st.position.set(0, -mm(230), 0);
  st.scale.setScalar(1.5);
  head.add(st);

  return finalise(T, g, {
    id: 'kelly-auger', family: 'Rotary & Kelly Foundation Tools / Kelly Augers',
    name: 'Drillity Kelly Auger ' + diaMm + ' mm',
    diameterMm: diaMm, flights: starts, turns: turns,
    pitchMm: Math.round(pitch * 1000), kellyBoxMm: opts.boxMm || 150,
    teeth: 'Round-shank picks, 25 mm shank', material: 'S355J2 / Hardox wear edge',
    method: 'rotary-kelly', priceEur: Math.round(2600 + diaMm * 9),
  }, opts);
}

/** CFA / hollow-stem auger section — continuous flight on a hollow stem. */
export function buildCFAFlight(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 600;
  const lenMm = opts.lengthMm || 3000;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const R = mm(diaMm) * 0.5;
  const stemR = mm(clampv(diaMm * 0.32, 114, 273)) * 0.5;
  const pitch = mm(diaMm * 0.78);
  const L = mm(lenMm);
  const turns = L / pitch;
  const g = new T.Group();
  g.name = 'cfa-flight';
  const steel = wearMaterial(ctx, 'paintedSteel', wear * 0.5);
  const worn = wearMaterial(ctx, 'wornSteel', wear);

  part(T, g, pipeGeometry(T, { od: stemR * 2, id: stemR * 2 - mm(24), length: L, seg: seg }), steel, { name: 'stem' });
  const fg = flightGeometry(T, {
    rInner: stemR * 0.96, rOuter: R, pitch: pitch, turns: turns,
    thickness: mm(18), y0: -mm(40), segsPerTurn: low ? 10 : 18,
  });
  part(T, g, fg, steel, { name: 'flight' });
  const wg = flightGeometry(T, {
    rInner: R * 0.95, rOuter: R * 1.004, pitch: pitch, turns: turns,
    thickness: mm(22), y0: -mm(40), segsPerTurn: low ? 10 : 18,
  });
  part(T, g, wg, worn, { name: 'wear-edge', cast: false });
  // top drive connection flange
  part(T, g, G.cyl(T, stemR * 1.3, stemR * 1.3, mm(40), seg), worn, { p: [0, -mm(20), 0] });
  boltRing(T, ctx, g, { count: 8, radius: stemR * 1.12, y: -mm(2), acrossFlats: mm(24), height: mm(16) });

  if (opts.withHead !== false) {
    const head = group(T, g, 'auger-head', { p: [0, -L, 0] });
    part(T, head, G.cyl(T, stemR * 1.2, stemR * 0.9, mm(120), seg), worn, { p: [0, -mm(60), 0] });
    const nPick = Math.max(3, Math.round(diaMm / 150));
    for (let i = 0; i < 2; i++) {
      const arm = group(T, head, 'arm' + i, { r: [0, (i / 2) * TAU, 0] });
      part(T, arm, G.box(T, R * 0.9, mm(60), mm(40)), worn, { p: [R * 0.45, -mm(110), 0], r: [0, 0, -0.12] });
      for (let k = 0; k < nPick; k++) {
        const pk = buildRoundShankPick(T, ctx, { shankMm: 25, wear: wear, lod: opts.lod, merge: false });
        pk.position.set(lerp(stemR * 1.2, R * 0.96, (k + 0.5) / nPick), -mm(134), 0);
        pk.rotation.z = -0.32;
        pk.scale.setScalar(1.3);
        arm.add(pk);
      }
    }
    // sacrificial concrete cap on the tip
    part(T, head, G.cone(T, stemR * 0.86, mm(150), low ? 8 : 14), material(ctx, '__paintDark'), {
      p: [0, -mm(200), 0], r: [Math.PI, 0, 0],
    });
  }

  return finalise(T, g, {
    id: 'cfa-flight', family: 'Rotary & Kelly Foundation Tools / CFA & Hollow-Stem Augers',
    name: 'Drillity CFA Flight ' + diaMm + ' mm',
    diameterMm: diaMm, lengthMm: lenMm, stemOdMm: Math.round(stemR * 2000),
    pitchMm: Math.round(pitch * 1000), material: 'S355J2 flight, Hardox wear edge',
    method: 'cfa', priceEur: Math.round(1800 + diaMm * 6 * (lenMm / 3000)),
  }, opts);
}

/**
 * Drilling bucket — cylindrical body, hinged bottom doors, twin cutting arms
 * with teeth, bail frame and Kelly box. opts.open (0..1) swings the doors.
 */
export function buildDrillingBucket(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 1000;
  const cleaning = opts.cleaning === true;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const R = mm(diaMm) * 0.5;
  const H = mm(diaMm * (cleaning ? 0.85 : 1.15));
  const open = clamp01(opts.open || 0);
  const animated = opts.animated !== false;   // false → merge the doors in
  const g = new T.Group();
  g.name = cleaning ? 'cleaning-bucket' : 'drilling-bucket';
  const steel = wearMaterial(ctx, 'paintedSteel', wear * 0.5);
  const worn = wearMaterial(ctx, 'wornSteel', wear);

  // bail / head frame
  const bail = group(T, g, 'bail');
  kellyHead(T, ctx, bail, { boxMm: opts.boxMm || 150, mat: steel });
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1;
    part(T, bail, G.box(T, mm(40), mm(340), mm(90)), steel, {
      p: [s * R * 0.5, -mm(260), 0], r: [0, 0, s * 0.28],
    });
  }
  // barrel
  const bodyTop = -mm(420);
  part(T, g, pipeGeometry(T, { od: R * 2, id: R * 2 - mm(20), length: H, y0: bodyTop, seg: seg }), steel, { name: 'barrel' });
  part(T, g, G.torus(T, R * 0.995, mm(14), 5, low ? 16 : 28), worn, { p: [0, bodyTop - mm(20), 0] });
  part(T, g, G.torus(T, R * 0.995, mm(12), 5, low ? 16 : 28), worn, { p: [0, bodyTop - H + mm(40), 0] });
  // side discharge opening frame
  part(T, g, G.box(T, mm(20), H * 0.62, mm(24)), worn, { p: [R * 0.99, bodyTop - H * 0.5, -R * 0.42] });
  part(T, g, G.box(T, mm(20), H * 0.62, mm(24)), worn, { p: [R * 0.99, bodyTop - H * 0.5, R * 0.42] });

  // hinged bottom doors + cutting arms
  const baseY = bodyTop - H;
  const doors = [];
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1;
    const hinge = group(T, g, 'door' + i, {
      p: [0, baseY + mm(20), s * R * 0.92], r: [s * open * 1.15, 0, 0], dynamic: animated,
    });
    const shape = new T.Shape();
    shape.absarc(0, 0, R * 0.94, s > 0 ? Math.PI : 0, s > 0 ? TAU : Math.PI, false);
    shape.closePath();
    const geo = new T.ExtrudeGeometry(shape, { depth: mm(22), bevelEnabled: false, curveSegments: low ? 6 : 12 });
    geo.rotateX(-Math.PI / 2);
    part(T, hinge, geo, steel, { p: [0, -mm(22), -s * R * 0.92], name: 'flap' });
    // cutting arm with teeth on the leading edge of each door
    part(T, hinge, G.box(T, R * 1.7, mm(70), mm(44)), worn, {
      p: [0, -mm(56), -s * R * 0.92 + s * R * 0.30], r: [0, 0, 0],
    });
    const nT = Math.max(4, Math.round(diaMm / 170));
    for (let k = 0; k < nT; k++) {
      const x = lerp(-R * 0.82, R * 0.82, (k + 0.5) / nT);
      const pk = buildRoundShankPick(T, ctx, { shankMm: 25, wear: wear, lod: opts.lod, merge: false });
      pk.position.set(x, -mm(84), -s * R * 0.92 + s * R * 0.30);
      pk.rotation.x = s * 0.30;
      pk.scale.setScalar(1.4);
      hinge.add(pk);
    }
    doors.push(hinge);
  }
  // pilot stinger through the centre
  part(T, g, G.cyl(T, mm(36), mm(30), mm(220), low ? 8 : 14), worn, { p: [0, baseY - mm(70), 0] });

  const out = finalise(T, g, {
    id: cleaning ? 'cleaning-bucket' : 'drilling-bucket',
    family: 'Rotary & Kelly Foundation Tools / ' + (cleaning ? 'Clean-Out Buckets' : 'Drilling Buckets'),
    name: 'Drillity ' + (cleaning ? 'Clean-Out' : 'Drilling') + ' Bucket ' + diaMm + ' mm',
    diameterMm: diaMm, heightMm: Math.round(H * 1000), doors: 2,
    kellyBoxMm: opts.boxMm || 150, teeth: 'Round-shank picks',
    capacityL: Math.round(Math.PI * R * R * H * 1000 * 0.8),
    material: 'S355J2 body, Hardox cutting arms', method: 'rotary-kelly',
    priceEur: Math.round(3200 + diaMm * 7),
  }, opts);
  out.userData.setOpen = animated ? (v) => {
    const k = clamp01(v);
    for (let i = 0; i < doors.length; i++) doors[i].rotation.x = (i ? 1 : -1) * k * 1.15;
  } : () => { /* built merged: the doors are part of the body */ };
  return out;
}

/** Foundation core barrel — big rock barrel with roller/bullet teeth on the rim. */
export function buildFoundationCoreBarrel(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 900;
  const lenMm = opts.lengthMm || 1500;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 28;
  const R = mm(diaMm) * 0.5;
  const L = mm(lenMm);
  const g = new T.Group();
  g.name = 'foundation-core-barrel';
  const steel = wearMaterial(ctx, 'paintedSteel', wear * 0.5);
  const worn = wearMaterial(ctx, 'wornSteel', wear);

  kellyHead(T, ctx, group(T, g, 'kelly-head'), { boxMm: opts.boxMm || 150, mat: steel });
  part(T, g, G.cyl(T, R * 0.5, R * 0.94, mm(240), seg), steel, { p: [0, -mm(240), 0] });
  for (let i = 0; i < 4; i++) {
    part(T, g, G.box(T, R * 0.9, mm(24), mm(30)), steel, {
      p: [0, -mm(300), 0], r: [0, (i / 4) * TAU, 0],
    });
  }
  part(T, g, pipeGeometry(T, { od: R * 2, id: R * 2 - mm(30), length: L, y0: -mm(360), seg: seg }), steel, { name: 'barrel' });
  // toothed shoe
  const shoeY = -mm(360) - L;
  part(T, g, G.lathe(T, [
    [R, shoeY + mm(140)], [R, shoeY], [R - mm(34), shoeY], [R - mm(34), shoeY + mm(140)],
  ], seg, true), worn, { name: 'shoe' });
  /* THE TEETH CUT THE HOLE, NOT THE BARREL. This is the same defect the audit
     found on buildCasingCrown, which "quoted the crown body's shoulder,
     ignoring the gauge buttons that actually touch the wall". The picks stood
     at R - 17 mm and, at 1.5x scale, reached 993.5 mm on a barrel quoted as
     900 — a 93.5 mm over-gauge nobody declared. A rock barrel really does cut
     over its own OD so the shell has clearance, but that is a ~30 mm story,
     not a 94 mm one; the picks are pulled in to give it, and the number that
     ships is then read off the mesh. */
  const nT = Math.max(8, Math.round(diaMm / 90));
  const pickR = R - mm(50);
  for (let i = 0; i < nT; i++) {
    const a = (i / nT) * TAU;
    const pk = buildRoundShankPick(T, ctx, { shankMm: 30, wear: wear, lod: opts.lod, merge: false });
    pk.position.set(Math.cos(a) * pickR, shoeY + mm(10), Math.sin(a) * pickR);
    pk.rotation.set(Math.sin(a) * 0.24, -a, -Math.cos(a) * 0.24);
    pk.scale.setScalar(1.5);
    g.add(pk);
  }
  // core catcher and the two lifting lugs the barrel is broken out by — free,
  // they share `worn` and `steel`, which are both already on the object
  for (let i = 0; i < (low ? 2 : 3); i++) {
    const a = (i / (low ? 2 : 3)) * TAU + 0.4;
    part(T, g, G.box(T, mm(60), mm(90), mm(16)), worn, {
      p: [Math.cos(a) * (R - mm(30)), shoeY + mm(200), Math.sin(a) * (R - mm(30))],
      r: [0.34, -a, 0], cast: false, name: 'core-catcher',
    });
  }
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(24), mm(150), mm(90)), steel, {
      p: [Math.cos(i * Math.PI) * R, -mm(520), 0], name: 'lifting-lug',
    });
  }
  const cutR = sweptRadius(T, g);
  return finalise(T, g, {
    id: 'foundation-core-barrel', family: 'Rotary & Kelly Foundation Tools / Foundation Core Barrels',
    name: 'Drillity Rock Barrel ' + diaMm + ' mm',
    diameterMm: Math.round(cutR * 2000),        // measured off the pick tips
    barrelOdMm: diaMm, lengthMm: lenMm, teeth: nT,
    overGaugeMm: Math.round(cutR * 2000) - diaMm,
    material: 'S355J2 barrel, round-shank picks', method: 'rotary-kelly',
    priceEur: Math.round(4200 + diaMm * 8),
  }, opts);
}

/**
 * Belling / under-reaming tool — two arms that swing out to form the bell.
 *
 * THE SAME BUG buildEccentricSystem() had, and it survived that audit because
 * nothing walked this family. It quoted `bellDiaMm: 1600` on an 800 mm shaft
 * while the arms it built swept **1222.1 mm fully open** — 378 mm short of
 * the bell it advertises. A belling tool that cannot reach its own quoted bell
 * is the foundation-side twin of an Odex system that cannot come out of its
 * own hole, and both are the same failure: a number authored beside the
 * geometry instead of read off it.
 *
 * Rebuilt from the shaft bore, which is the one dimension that is not
 * negotiable — the tool goes down a bored shaft and has to come back up it:
 *
 *   1. `bellR` and `shaftR` are the inputs. `OPEN` is SOLVED so the pick tips
 *      land exactly on `bellR`, rather than being a hand-picked 1.02 rad that
 *      happened to fall short.
 *   2. `CLOSED` is checked against the shaft: folded, the whole tool must fit
 *      inside `shaftR` with clearance, or it never got to the bottom.
 *   3. Both numbers in the spec are then MEASURED off the built mesh with
 *      sweptRadius(), the same way the concentric and wing systems do it, so
 *      the label cannot drift from the model again.
 *
 * The 2:1 bell-to-shaft ratio the ids use is left exactly as it was; what
 * changes is that the steel now delivers it.
 */
export function buildBellingTool(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const shaftMm = opts.shaftMm || 800;
  const bellMm = Math.max(shaftMm * 1.25, opts.bellMm || 1600);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const open = clamp01(opts.open === undefined ? 0.7 : opts.open);
  const R = mm(shaftMm) * 0.5;
  const bellR = mm(bellMm) * 0.5;
  const g = new T.Group();
  g.name = 'belling-tool';
  const steel = wearMaterial(ctx, 'paintedSteel', wear * 0.5);
  const worn = wearMaterial(ctx, 'wornSteel', wear);
  const chrome = material(ctx, 'chrome');

  /* ── SIZE THE ARM ──────────────────────────────────────────────────────
     An arm hinged at radius `hR` and swung out by θ puts its outermost
     cutting point — the gauge pick at the toe, standing `pOff` proud of the
     arm's outer face and `aL` down from the pin — at

         r(θ) = hR + sin(θ) * aL + cos(θ) * pOff

     which sizes the arm for the bell. THE ANGLES THEMSELVES ARE THEN SOLVED
     AGAINST THE BUILT MESH further down, because this closed form does not
     know how far a 1.5x round-shank pick stands off its own mount and that
     error is exactly what a decorative number is made of.

     Note the swing sign. The old build rotated each arm by `-s * angle`,
     which swings the +x arm towards -x: the two arms crossed the centreline
     instead of opening away from it, and the envelope it produced was the
     distance they overshot the axis by, not a bell. That is most of why it
     came up 378 mm short. */
  const hR = R * 0.28;                     // pin circle on the body
  const pOff = mm(96) * 1.5 + mm(52);      // pick stand-off at 1.5x scale, tip included
  const armW = mm(80);
  const OPEN_NOMINAL = 1.02;               // rad — a ~58 deg swing, as before
  let aL = (bellR - hR - Math.cos(OPEN_NOMINAL) * pOff) / Math.sin(OPEN_NOMINAL);
  aL = clampv(aL, mm(400), mm(2600));
  let OPEN = OPEN_NOMINAL;
  let CLOSED = 0.04;
  const ang = (k) => lerp(CLOSED, OPEN, clamp01(k));

  kellyHead(T, ctx, group(T, g, 'kelly-head'), { boxMm: opts.boxMm || 150, mat: steel });
  const bodyL = mm(900) + aL * 0.22;
  part(T, g, G.box(T, R * 0.7, bodyL, R * 0.7), steel, { p: [0, -bodyL * 0.5 - mm(150), 0], name: 'body' });
  // actuating cylinder up the middle — the rod retracts as the arms open
  part(T, g, G.cyl(T, mm(70), mm(70), mm(520), seg), steel, { p: [0, -mm(420), 0], name: 'cylinder' });
  part(T, g, G.cyl(T, mm(44), mm(44), mm(400) * (1 - open * 0.6), seg), chrome, { p: [0, -mm(760), 0], name: 'ram' });
  /* Spoil ports: a belling tool has to let the cuttings out of the bell.
     Deliberately in `steel`, not `worn` — `worn` only exists inside the arm
     groups, which mergeStatic() keeps separate because they move, so asking
     for it out here would open a second root bucket and cost a draw call for
     a colour nobody can resolve. Recessing them reads instead. */
  for (let i = 0; i < (low ? 2 : 4); i++) {
    const a = (i / (low ? 2 : 4)) * TAU + 0.6;
    part(T, g, G.box(T, R * 0.20, mm(210), mm(14)), steel, {
      p: [Math.cos(a) * R * 0.30, -mm(520), Math.sin(a) * R * 0.30], r: [0, -a, 0],
      cast: false, name: 'spoil-port',
    });
  }

  const hingeY = -(mm(1080) + aL * 0.22);
  const arms = [];
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1;
    const hinge = group(T, g, 'arm' + i, { p: [s * hR, hingeY, 0], dynamic: opts.animated !== false });
    const arm = group(T, hinge, 'swing', { r: [0, 0, s * ang(open)] });
    part(T, arm, G.box(T, armW, aL, mm(120)), steel, { p: [s * armW * 0.5, -aL * 0.5, 0], name: 'arm-web' });
    // a real belling arm is a tapered plate, not a bar: it is deepest at the
    // pin where the moment is, and it carries a wear strip on its back
    part(T, arm, G.box(T, armW * 0.55, aL * 0.44, mm(150)), steel, {
      p: [s * armW * 0.28, -aL * 0.22, 0], cast: false, name: 'arm-root',
    });
    part(T, arm, G.box(T, mm(18), aL * 0.92, mm(96)), worn, {
      p: [-s * armW * 0.46, -aL * 0.5, 0], cast: false, name: 'wear-strip',
    });
    // Picks along the cutting edge, spaced to the arm rather than to a fixed
    // 150 mm that stopped covering the edge as soon as the arm got longer.
    const nT = Math.max(5, Math.round(aL / mm(150)));
    for (let k = 0; k < nT; k++) {
      const pk = buildRoundShankPick(T, ctx, { shankMm: 30, wear: wear, lod: opts.lod, merge: false });
      pk.position.set(s * mm(96), -mm(90) - k * (aL - mm(160)) / Math.max(1, nT - 1), 0);
      pk.rotation.z = -s * (Math.PI / 2 - 0.3);
      pk.scale.setScalar(1.5);
      arm.add(pk);
    }
    part(T, hinge, G.cyl(T, mm(26), mm(26), mm(150), low ? 8 : 12), chrome, { r: [Math.PI / 2, 0, 0], name: 'pin' });
    // link back to the actuating rod
    part(T, arm, G.box(T, mm(30), mm(300), mm(50)), worn, { p: [s * mm(10), -mm(150), mm(90)], r: [0, 0, s * 0.4], name: 'link' });
    arms.push(arm);
  }

  const setAngle = (a) => { for (let i = 0; i < arms.length; i++) arms[i].rotation.z = (i ? 1 : -1) * a; };
  const setAll = (k) => setAngle(ang(k));

  /* ── SOLVE THE TRAVEL AGAINST THE STEEL ────────────────────────────────
     Bisect the swing until the mesh itself sweeps the bell, and until the
     folded mesh itself fits back up the shaft. Twenty-two iterations on two
     angles is nothing at build time and it is the only way the two claims on
     the label — "cuts a 1600 mm bell", "goes down an 800 mm shaft" — can be
     true of the object rather than true of a comment. */
  const radiusAt = (a) => { setAngle(a); return sweptRadius(T, g); };
  let lo = 0.10, hi = 1.45;
  if (radiusAt(hi) > bellR) {
    for (let i = 0; i < 22; i++) { const m2 = (lo + hi) * 0.5; if (radiusAt(m2) < bellR) lo = m2; else hi = m2; }
    OPEN = (lo + hi) * 0.5;
  } else { OPEN = hi; }                      // arm cannot reach: report what it does
  // Folded: shrink the swing until the whole tool clears the shaft bore.
  CLOSED = Math.min(OPEN - 0.05, 0.04);
  for (let i = 0; i < 30 && radiusAt(CLOSED) > R * 0.96; i++) CLOSED -= 0.014;

  /* Read both numbers off the mesh, at the two ends of the real travel. */
  const rOpen = radiusAt(OPEN);
  const rShut = radiusAt(CLOSED);
  setAll(open);

  const out = finalise(T, g, {
    id: 'belling-tool', family: 'Rotary & Kelly Foundation Tools / Belling & Under-Reaming Tools',
    name: 'Drillity Belling Tool ' + Math.round(shaftMm) + '/' + Math.round(rOpen * 2000) + ' mm',
    shaftDiaMm: Math.round(shaftMm),
    bellDiaMm: Math.round(rOpen * 2000),            // measured, arms fully open
    foldedDiaMm: Math.round(rShut * 2000),          // measured, arms folded
    arms: 2, picksPerArm: Math.max(5, Math.round(aL / mm(150))),
    retrieval: 'Folds inside the shaft bore; the bell is cut on the way up',
    material: 'S355J2, round-shank picks', method: 'rotary-kelly',
    priceEur: Math.round(9000 + rOpen * 2000 * 5),
  }, opts);
  out.userData.armTravel = { closed: CLOSED, open: OPEN };
  out.userData.setOpen = (v) => setAll(v);
  return out;
}

/** Cross cutter / boulder breaker — heavy cross frame studded with picks. */
export function buildCrossCutter(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 900;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const R = mm(diaMm) * 0.5;
  const g = new T.Group();
  g.name = 'cross-cutter';
  const steel = wearMaterial(ctx, 'paintedSteel', wear * 0.5);
  const worn = wearMaterial(ctx, 'wornSteel', wear);
  kellyHead(T, ctx, group(T, g, 'kelly-head'), { boxMm: opts.boxMm || 150, mat: steel });
  part(T, g, G.cyl(T, mm(150), mm(150), mm(300), low ? 10 : 18), steel, { p: [0, -mm(260), 0] });
  for (let i = 0; i < 2; i++) {
    const blade = group(T, g, 'blade' + i, { r: [0, (i / 2) * Math.PI, 0] });
    part(T, blade, G.box(T, R * 2 * 0.98, mm(340), mm(70)), steel, { p: [0, -mm(560), 0] });
    part(T, blade, G.box(T, R * 2 * 0.98, mm(60), mm(84)), worn, { p: [0, -mm(714), 0] });
    const nT = Math.max(6, Math.round(diaMm / 110));
    for (let k = 0; k < nT; k++) {
      const x = lerp(-R * 0.94, R * 0.94, (k + 0.5) / nT);
      const pk = buildRoundShankPick(T, ctx, { shankMm: 30, wear: wear, lod: opts.lod, merge: false });
      pk.position.set(x, -mm(742), 0);
      pk.rotation.x = (k % 2 ? 1 : -1) * 0.34;
      pk.scale.setScalar(1.5);
      blade.add(pk);
    }
  }
  return finalise(T, g, {
    id: 'cross-cutter', family: 'Rotary & Kelly Foundation Tools / Cross Cutters & Boulder Extractors',
    name: 'Drillity Cross Cutter ' + diaMm + ' mm',
    diameterMm: diaMm, blades: 4, material: 'S355J2 / Hardox, round-shank picks',
    method: 'rotary-kelly', priceEur: Math.round(5400 + diaMm * 6),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §9 DRIVES, SWIVELS, SUBS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Rotary drive head (KDK) — gearbox housing, output flange, Kelly guide
 * rollers, twin hydraulic motors and the leader guide shoes.
 * Also used directly by rigFactory on the foundation and CFA rigs.
 */
export function buildRotaryDriveHead(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const torqueKNm = opts.torqueKNm || 200;
  const scale = clampv(Math.pow(torqueKNm / 200, 0.34), 0.6, 1.8);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 18;
  const g = new T.Group();
  g.name = 'rotary-drive-head';
  const paint = material(ctx, 'paintedSteel');
  const dark = material(ctx, '__paintDark');
  const steel = material(ctx, 'rawSteel');
  const chrome = material(ctx, 'chrome');
  const W = mm(1500) * scale;
  const H = mm(900) * scale;
  const D = mm(1100) * scale;

  part(T, g, G.roundedBox(T, W, H, D, mm(60), 2), paint, { p: [0, -H * 0.5, 0] });
  part(T, g, G.roundedBox(T, W * 0.86, mm(90), D * 0.9, mm(30), 2), dark, { p: [0, -H - mm(40), 0] });
  // gear cover with a bolt ring
  part(T, g, G.cyl(T, W * 0.30, W * 0.30, mm(80), seg), dark, { p: [0, mm(30), 0] });
  boltRing(T, ctx, g, { count: 12, radius: W * 0.26, y: mm(70), acrossFlats: mm(30), height: mm(22) });
  // hydraulic motors
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1;
    part(T, g, G.cyl(T, mm(150) * scale, mm(150) * scale, mm(420) * scale, seg), steel, {
      p: [s * W * 0.30, mm(230) * scale, D * 0.16],
    });
    part(T, g, G.box(T, mm(220) * scale, mm(120) * scale, mm(220) * scale), dark, {
      p: [s * W * 0.30, mm(450) * scale, D * 0.16],
    });
  }
  // output spindle with the Kelly guide rollers
  const spindle = group(T, g, 'spindle', { p: [0, -H - mm(80), 0], dynamic: true });
  part(T, spindle, G.cyl(T, mm(230) * scale, mm(230) * scale, mm(220) * scale, seg), steel, { p: [0, -mm(110) * scale, 0] });
  part(T, spindle, G.box(T, mm(420) * scale, mm(60), mm(420) * scale), steel, { p: [0, -mm(230) * scale, 0] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU;
    part(T, spindle, G.cyl(T, mm(60) * scale, mm(60) * scale, mm(180) * scale, low ? 8 : 12), chrome, {
      p: [Math.cos(a) * mm(180) * scale, -mm(140) * scale, Math.sin(a) * mm(180) * scale],
      r: [Math.PI / 2, 0, -a],
    });
  }
  // leader guide shoes on the back
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(220) * scale, mm(300) * scale, mm(120) * scale), steel, {
      p: [(i ? 1 : -1) * W * 0.34, -H * 0.5, -D * 0.56],
    });
  }
  const out = finalise(T, g, {
    id: 'rotary-drive-head', family: 'Casing & Foundation Attachments / Rotary Drive Heads (KDK)',
    name: 'Drillity KDK ' + torqueKNm,
    torqueKNm: torqueKNm, rpmMax: Math.round(38 - torqueKNm * 0.03),
    motors: 2, kellyBoxMm: torqueKNm > 250 ? 200 : 150,
    material: 'Cast + fabricated housing, hardened gear train',
    method: 'rotary-kelly', priceEur: Math.round(48000 + torqueKNm * 260),
  }, opts);
  out.userData.spindle = spindle;
  return out;
}

/**
 * Flushing swivel — the rotating water/air joint above the string.
 *
 * TWO MATERIALS, AND THAT IS THE WHOLE BUDGET. This part is 36 cm end to end
 * and it used to cost SIX draw calls: a painted housing, a steel gooseneck, an
 * InstancedMesh of four bolts, two brass grease nipples, and two more inside
 * the spindle. `__paintDark` and `__brass` were each carrying a single mesh —
 * a whole draw call spent on a 5 mm nipple whose colour cannot resolve at any
 * size this renders. Everything static is now one painted body, the four
 * flange bolts merge into it (boltRing `merge: true`), and the spindle group
 * is one chromed piece; the nipples are still there, still the right shape,
 * and now cost triangles instead of draws.
 *
 * What survived the cut is what actually reads: a DARK PAINTED BODY against a
 * BRIGHT CHROME SPINDLE. That value break is the only thing legible on a
 * 36 cm object in the surface band, and the triangles freed by the merge went
 * back into the things that make it read as a swivel rather than a can — the
 * gooseneck and its hose tail, the seal-gland cap, the bail, and a real open
 * bore at both ends.
 */
export function buildFlushingSwivel(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const boreMm = opts.boreMm || 50;
  const low = opts.lod === 'low';
  const seg = low ? 10 : 18;
  const wear = clamp01(opts.wear || 0);
  const g = new T.Group();
  g.name = 'flushing-swivel';
  // ONE static material. Wear tints it, so a swivel that has been on a rig
  // for a season is not the same colour as one in the shop window.
  const body = wearMaterial(ctx, '__paintDark', wear * 0.7);
  const chrome = wearMaterial(ctx, 'chrome', wear * 0.35);
  const R = mm(boreMm * 1.9) * 0.5;
  const rb = mm(boreMm) * 0.5;                 // the actual through bore

  // ── housing, with a real bore down the middle ─────────────────────────
  // `closed: false` on the lathe leaves the inner wall standing, so the top
  // mouth is an open hole you can see into rather than a capped cylinder.
  part(T, g, G.lathe(T, [
    [rb, 0], [R * 0.7, 0], [R * 0.7, -mm(40)], [R, -mm(56)],
    [R, -mm(190)], [R * 0.78, -mm(206)], [rb, -mm(206)],
  ], seg, false), body, { name: 'housing' });
  // cast cooling/stiffening ribs down the barrel — free, they share `body`
  for (let i = 0; i < (low ? 3 : 6); i++) {
    const a = (i / (low ? 3 : 6)) * TAU;
    part(T, g, G.box(T, mm(7), mm(120), R * 0.34), body, {
      p: [Math.cos(a) * R * 0.98, -mm(124), Math.sin(a) * R * 0.98], r: [0, -a, 0],
      cast: false, name: 'rib',
    });
  }
  // ── seal-gland cap: the packing nut every swivel is rebuilt through ────
  part(T, g, G.lathe(T, [
    [rb * 1.10, -mm(186)], [R * 1.06, -mm(186)], [R * 1.06, -mm(210)],
    [R * 0.92, -mm(216)], [rb * 1.10, -mm(216)],
  ], seg, true), body, { name: 'gland-cap', cast: false });
  boltRing(T, ctx, g, {
    count: 6, radius: R * 0.86, y: -mm(184), acrossFlats: mm(13), height: mm(9),
    mat: body, merge: true,
  });

  // ── gooseneck inlet, hose tail and the union nut ──────────────────────
  const gn = G.tube(T, [
    [R * 0.8, -mm(120), 0], [R * 2.0, -mm(96), 0], [R * 2.7, -mm(40), 0], [R * 2.8, mm(30), 0],
  ], mm(boreMm * 0.42), low ? 10 : 18, low ? 6 : 10);
  part(T, g, gn, body, { name: 'gooseneck' });
  part(T, g, G.cyl(T, mm(boreMm * 0.62), mm(boreMm * 0.62), mm(26), seg), body, { p: [R * 2.8, mm(44), 0], name: 'union-nut' });
  // the hose tail proper: three barbs, so it is visibly something a hose
  // clamps onto and not a plain stub
  for (let i = 0; i < 3; i++) {
    part(T, g, G.cyl(T, mm(boreMm * 0.50), mm(boreMm * 0.58), mm(9), seg), body, {
      p: [R * 2.8, mm(62) + i * mm(11), 0], cast: false, name: 'hose-barb',
    });
  }
  // gusset where the gooseneck lands on the housing — a real casting has one
  part(T, g, G.box(T, R * 1.3, mm(70), mm(9)), body, {
    p: [R * 1.5, -mm(104), 0], r: [0, 0, -0.42], cast: false, name: 'gusset',
  });
  // ── lifting bail: how the swivel gets hung off the head ────────────────
  part(T, g, G.torus(T, R * 0.86, mm(9), low ? 5 : 8, low ? 10 : 16, Math.PI), body, {
    p: [0, -mm(18), 0], r: [0, Math.PI / 2, 0], name: 'bail',
  });
  // ── grease nipples — still here, now free ─────────────────────────────
  for (let i = 0; i < 2; i++) {
    part(T, g, G.cyl(T, mm(5), mm(5), mm(22), 6), body, {
      p: [Math.cos(i * Math.PI) * R, -mm(80 + i * 60), 0], r: [0, 0, Math.PI / 2],
      cast: false, name: 'grease-nipple',
    });
  }

  // ── rotating spindle below: one chromed piece, one draw call ──────────
  const spindle = group(T, g, 'spindle', { p: [0, -mm(206), 0], dynamic: true });
  part(T, spindle, G.cyl(T, R * 0.62, R * 0.62, mm(150), seg, true), chrome, { p: [0, -mm(75), 0], name: 'spindle-shaft' });
  // the shaft is a tube, so the bore runs right through the tool
  part(T, spindle, G.lathe(T, [
    [rb, mm(2)], [R * 0.62, mm(2)], [R * 0.62, -mm(150)], [rb, -mm(150)],
  ], seg, false), chrome, { cast: false, name: 'spindle-bore' });
  // drive collar with wrench flats — where the string screws on
  part(T, spindle, G.cyl(T, R * 0.82, R * 0.82, mm(30), 6), chrome, { p: [0, -mm(150), 0], name: 'drive-collar' });

  const out = finalise(T, g, {
    id: 'flushing-swivel', family: 'Flushing, Swivels & Water / Flushing Swivels',
    name: 'Drillity Flushing Swivel ' + boreMm + ' mm',
    boreMm: boreMm, maxPressureBar: 40, maxRpm: 250,
    material: 'Hardened spindle, PTFE + rubber seal pack',
    method: 'dth', priceEur: Math.round(700 + boreMm * 14),
  }, opts);
  out.userData.spindle = spindle;
  return out;
}

/** Shock absorber sub — protects the drifter and the string. */
export function buildShockAbsorber(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const thread = String(opts.thread || 'T51').toUpperCase();
  const ts = THREAD_SPECS[thread] || THREAD_SPECS.T51;
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const wear = clamp01(opts.wear || 0);
  const R = mm(ts.majorMm) * 0.5 * 1.6;
  const L = mm(520);
  const g = new T.Group();
  g.name = 'shock-absorber';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.5);
  const rub = material(ctx, 'rubber');
  const chrome = material(ctx, 'chrome');

  part(T, g, G.lathe(T, [
    [mm(12), 0], [R * 0.8, 0], [R, -mm(40)], [R, -L * 0.62],
    [R * 0.82, -L * 0.68], [R * 0.82, -L + mm(40)], [mm(12), -L + mm(40)],
  ], seg, false), steel, { name: 'housing' });
  for (let i = 0; i < 5; i++) {
    part(T, g, G.torus(T, R * 0.83, mm(7), 5, low ? 12 : 20), rub, { p: [0, -L * 0.70 - i * mm(24), 0] });
  }
  part(T, g, G.cyl(T, R * 0.55, R * 0.55, mm(120), seg), chrome, { p: [0, -L + mm(30), 0] });
  addBoxThread(T, ctx, g, thread, { y0: -mm(4), length: mm(48), quality: low ? 0 : 0.6 });
  addPinThread(T, ctx, g, thread, { y0: -L + mm(50), length: mm(48), quality: low ? 0 : 0.6, mat: steel });
  return finalise(T, g, {
    id: 'shock-absorber', family: 'Adapters, Couplings & Subs / Shock Absorbers',
    name: 'Drillity Shock Sub ' + thread,
    thread: thread, lengthMm: 520, travelMm: 40,
    material: 'Polyurethane element stack in 42CrMo4 housing',
    method: 'top-hammer', priceEur: Math.round(620 + ts.majorMm * 6),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §10 SELF-DRILLING ANCHORS (SDA)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Hollow self-drilling anchor bar — continuous rolled rope thread, R/T sizes. */
export function buildAnchorBar(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const thread = String(opts.thread || 'R32').toUpperCase();
  const ts = THREAD_SPECS[thread] || THREAD_SPECS.R32;
  const L = mm(opts.lengthMm || 3000);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const g = new T.Group();
  g.name = 'anchor-bar';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.4);
  const ro = mm(ts.majorMm) * 0.5;
  const ri = ro * 0.52;

  part(T, g, pipeGeometry(T, { od: ro * 2 * 0.9, id: ri * 2, length: L, seg: seg }), steel, { name: 'bar' });
  // the rolled thread runs the WHOLE length — the defining feature of an SDA
  const q = low ? 0 : 0.35;
  part(T, g, threadGeometry(T, {
    major: ro, pitch: mm(ts.pitchMm), depth: mm(ts.depthMm), length: L, y0: 0, quality: q,
  }), steel, { name: 'rolled-thread' });

  return finalise(T, g, {
    id: 'sda-bar', family: 'Self-Drilling Anchors (SDA) / Hollow Anchor Bars',
    name: 'Drillity SDA Bar ' + thread + ' x ' + Math.round(L * 1000) + ' mm',
    thread: thread, lengthMm: opts.lengthMm || 3000,
    odMm: ts.majorMm, idMm: Math.round(ri * 2000),
    ultimateLoadKN: { R25: 200, R32: 280, R38: 400, R51: 800, T76: 1900 }[thread] || 280,
    material: 'Seamless hollow bar, cold-rolled thread',
    method: 'anchor', priceEur: Math.round(ts.majorMm * 0.9 * ((opts.lengthMm || 3000) / 1000)),
  }, opts);
}

/** Sacrificial (lost) drill bit for a self-drilling anchor. */
export function buildSacrificialBit(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const thread = String(opts.thread || 'R32').toUpperCase();
  const ts = THREAD_SPECS[thread] || THREAD_SPECS.R32;
  const style = opts.style || 'cross';    // 'cross' | 'button' | 'clay'
  const diaMm = opts.diameterMm || Math.round(ts.majorMm * 1.6);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const R = mm(diaMm) * 0.5;
  const L = mm(diaMm * 1.05);
  const g = new T.Group();
  g.name = 'sda-bit';
  const steel = bitBodyMaterial(ctx, wear * 0.8);
  const carb = wearMaterial(ctx, 'carbide', wear);

  part(T, g, G.lathe(T, [
    [mm(6), -L], [R * 0.72, -L], [R, -L + mm(16)], [R, -mm(24)],
    [R * 0.86, 0], [mm(6), 0],
  ], seg, false), steel, { name: 'body' });
  addBoxThread(T, ctx, g, thread, { y0: -mm(3), length: mm(ts.pitchMm * 3.4), quality: low ? 0 : 0.6 });
  if (style === 'clay') {
    for (let i = 0; i < 3; i++) {
      part(T, g, G.box(T, R * 1.9, mm(40), mm(16)), steel, { p: [0, -L - mm(20), 0], r: [0, (i / 3) * Math.PI, 0.14] });
    }
  } else if (style === 'button') {
    studFace(T, ctx, g, ringLayout({
      count: 4, radius: R * 0.6, y: -L - mm(2), tilt: Math.PI - 0.3, dia: mm(9), kind: 'ballistic',
    }).concat([{ x: 0, y: -L - mm(2), z: 0, nx: 0, ny: -1, nz: 0, dia: mm(9), kind: 'ballistic' }]),
    { wear: wear, seg: low ? 7 : 10 });
  } else {
    for (let i = 0; i < 2; i++) {
      part(T, g, G.box(T, R * 1.94, mm(30), mm(13)), carb, {
        p: [0, -L - mm(10), 0], r: [0, (i / 2) * Math.PI, 0],
      });
    }
  }
  for (let i = 0; i < 2; i++) {
    flushHole(T, ctx, g, {
      x: Math.cos(i * Math.PI + 0.8) * R * 0.5, y: -L + mm(2), z: Math.sin(i * Math.PI + 0.8) * R * 0.5,
      r: mm(5), dir: [0, -1, 0], seg: low ? 7 : 9,
    });
  }
  return finalise(T, g, {
    id: 'sda-bit', family: 'Drill Bits & Cutting Tools / Sacrificial (Lost) Bits',
    name: 'Drillity Sacrificial Bit ' + thread + ' ' + diaMm + ' mm (' + style + ')',
    thread: thread, diameterMm: diaMm, style: style,
    material: 'Carbide-faced, single use', method: 'anchor',
    priceEur: Math.round(18 + diaMm * 0.9),
  }, opts);
}

/** SDA coupler — a plain full-length female sleeve. */
export function buildAnchorCoupler(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const thread = String(opts.thread || 'R32').toUpperCase();
  const ts = THREAD_SPECS[thread] || THREAD_SPECS.R32;
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const L = mm(ts.majorMm * 5);
  const R = mm(ts.majorMm) * 0.5 * 1.36;
  const g = new T.Group();
  g.name = 'sda-coupler';
  const steel = material(ctx, 'rawSteel');
  part(T, g, pipeGeometry(T, { od: R * 2, id: mm(ts.majorMm) * 0.94, length: L, seg: seg }), steel);
  addBoxThread(T, ctx, g, thread, { y0: -mm(2), length: L * 0.92, quality: low ? 0 : 0.35 });
  return finalise(T, g, {
    id: 'sda-coupler', family: 'Self-Drilling Anchors (SDA) / Couplers',
    name: 'Drillity SDA Coupler ' + thread,
    thread: thread, lengthMm: Math.round(L * 1000), odMm: Math.round(R * 2000),
    material: 'Seamless tube, rolled thread', method: 'anchor',
    priceEur: Math.round(9 + ts.majorMm * 0.5),
  }, opts);
}

/** Domed bearing plate + hex nut + spherical seat. */
export function buildBearingPlate(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const thread = String(opts.thread || 'R32').toUpperCase();
  const ts = THREAD_SPECS[thread] || THREAD_SPECS.R32;
  const sideMm = opts.sideMm || 200;
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const g = new T.Group();
  g.name = 'bearing-plate';
  const steel = material(ctx, 'rawSteel');
  const galv = material(ctx, 'wornSteel');
  const s = mm(sideMm);
  part(T, g, G.box(T, s, mm(20), s), galv, { p: [0, -mm(10), 0] });
  part(T, g, G.lathe(T, [
    [mm(ts.majorMm) * 0.62, -mm(20)], [s * 0.30, -mm(20)],
    [s * 0.26, -mm(58)], [mm(ts.majorMm) * 0.62, -mm(62)],
  ], seg, true), galv, { name: 'dome' });
  // spherical seat washer + hex nut
  part(T, g, G.lathe(T, [
    [mm(ts.majorMm) * 0.6, -mm(62)], [s * 0.24, -mm(66)], [s * 0.24, -mm(84)], [mm(ts.majorMm) * 0.6, -mm(84)],
  ], seg, true), steel, { name: 'seat' });
  part(T, g, G.cyl(T, s * 0.19, s * 0.19, mm(46), 6), steel, { p: [0, -mm(108), 0] });
  return finalise(T, g, {
    id: 'bearing-plate', family: 'Self-Drilling Anchors (SDA) / Bearing & Domed Plates',
    name: 'Drillity Domed Plate ' + sideMm + ' mm ' + thread,
    thread: thread, sideMm: sideMm, thicknessMm: 20, finish: 'Hot-dip galvanised',
    method: 'anchor', priceEur: Math.round(22 + sideMm * 0.16),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §11 HDD & TRENCHLESS
   ═══════════════════════════════════════════════════════════════════════════ */

/** HDD pilot / steering head — slanted face, carbide, jets, bent sub. */
export function buildHDDPilotHead(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 90;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const R = mm(diaMm) * 0.5;
  const L = mm(diaMm * 3.2);
  const g = new T.Group();
  g.name = 'hdd-pilot-head';
  const steel = bitBodyMaterial(ctx, wear * 0.8);
  const carb = wearMaterial(ctx, 'carbide', wear);
  const worn = material(ctx, 'wornSteel');

  part(T, g, G.lathe(T, [
    [mm(8), 0], [R * 0.82, 0], [R * 0.82, -L * 0.42], [R * 0.6, -L * 0.55], [mm(8), -L * 0.55],
  ], seg, false), steel, { name: 'sub' });
  addBoxThread(T, ctx, g, opts.thread || 'API238', { y0: -mm(4), length: mm(50), quality: low ? 0 : 0.6 });
  // the slanted steering face — the whole point of a pilot head
  const shape = new T.Shape();
  shape.moveTo(-R * 0.9, 0);
  shape.lineTo(R * 0.9, 0);
  shape.lineTo(R * 0.9, -L * 0.30);
  shape.lineTo(-R * 0.9, -L * 0.62);
  shape.closePath();
  const geo = new T.ExtrudeGeometry(shape, { depth: mm(diaMm * 0.42), bevelEnabled: false, curveSegments: 1 });
  geo.translate(0, 0, -mm(diaMm * 0.21));
  part(T, g, geo, steel, { p: [0, -L * 0.42, 0], name: 'face' });
  // carbide on the leading edge of the slant
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5;
    part(T, g, G.box(T, mm(diaMm * 0.16), mm(11 - wear * 5), mm(diaMm * 0.34)), carb, {
      p: [lerp(-R * 0.78, R * 0.78, t), -L * 0.42 - lerp(L * 0.60, L * 0.28, t), 0], r: [0, 0, 0.5],
    });
  }
  // jet nozzles
  for (let i = 0; i < 2; i++) {
    flushHole(T, ctx, g, {
      x: (i ? 1 : -1) * R * 0.4, y: -L * 0.42 - L * 0.34, z: mm(diaMm * 0.20),
      r: mm(4.5), dir: [0, -0.7, 0.72], seg: low ? 7 : 9, chamferMat: worn,
    });
  }
  return finalise(T, g, {
    id: 'hdd-pilot-head', family: 'HDD & Trenchless / Pilot & Steering Heads',
    name: 'Drillity HDD Steering Head ' + diaMm + ' mm',
    diameterMm: diaMm, thread: opts.thread || 'API238', jets: 2, slantDeg: 15,
    material: 'Carbide-faced Hardox slant', method: 'hdd',
    priceEur: Math.round(340 + diaMm * 4.5),
  }, opts);
}

/** HDD sonde housing — milled window, bolted cover, bent-sub body. */
export function buildSondeHousing(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 90;
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const R = mm(diaMm) * 0.5;
  const L = mm(diaMm * 6);
  const g = new T.Group();
  g.name = 'sonde-housing';
  const steel = material(ctx, 'rawSteel');
  const dark = material(ctx, '__paintDark');
  part(T, g, G.lathe(T, [
    [mm(8), 0], [R, 0], [R, -L], [mm(8), -L],
  ], seg, false), steel, { name: 'body' });
  addBoxThread(T, ctx, g, opts.thread || 'API238', { y0: -mm(4), length: mm(50), quality: low ? 0 : 0.5 });
  addPinThread(T, ctx, g, opts.thread || 'API238', { y0: -L + mm(50), length: mm(50), quality: low ? 0 : 0.5, mat: steel });
  // window + cover
  part(T, g, G.box(T, mm(diaMm * 0.5), L * 0.42, mm(diaMm * 0.16)), dark, { p: [0, -L * 0.5, R * 0.92] });
  const bolts = 6;
  const inst = boltRing(T, ctx, g, { count: bolts, radius: L * 0.18, acrossFlats: mm(11), height: mm(8) });
  inst.position.set(0, -L * 0.5, R * 1.0);
  inst.rotation.x = Math.PI / 2;
  return finalise(T, g, {
    id: 'sonde-housing', family: 'HDD & Trenchless / Sonde & Bent Housings',
    name: 'Drillity Sonde Housing ' + diaMm + ' mm',
    diameterMm: diaMm, lengthMm: Math.round(L * 1000), window: 'Slotted, bolted cover',
    method: 'hdd', priceEur: Math.round(520 + diaMm * 6),
  }, opts);
}

/** HDD backreamer — fly-cutter body, teeth, fluid ports, pulling swivel eye. */
export function buildBackreamer(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 300;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const R = mm(diaMm) * 0.5;
  const L = mm(diaMm * 1.5);
  const g = new T.Group();
  g.name = 'backreamer';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.7);
  const worn = wearMaterial(ctx, 'wornSteel', wear);
  const chrome = material(ctx, 'chrome');

  part(T, g, G.lathe(T, [
    [mm(10), 0], [R * 0.34, 0], [R * 0.34, -L * 0.2],
    [R * 0.30, -L * 0.86], [R * 0.30, -L], [mm(10), -L],
  ], seg, false), steel, { name: 'mandrel' });
  addBoxThread(T, ctx, g, opts.thread || 'API238', { y0: -mm(4), length: mm(56), quality: low ? 0 : 0.6 });
  // fly-cutter blades on a helix
  const blades = opts.blades || 4;
  for (let b = 0; b < blades; b++) {
    const phase = (b / blades) * TAU;
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const r = R * (0.34 + 0.64 * Math.sin(Math.PI * clampv(t * 1.15, 0, 1)));
      const a = phase + t * 0.6;
      pts.push(new T.Vector3(Math.cos(a) * r, -L * 0.16 - t * L * 0.68, Math.sin(a) * r));
    }
    const path = new T.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const shape = new T.Shape();
    const w = mm(diaMm * 0.10);
    const h = mm(diaMm * 0.13);
    shape.moveTo(-w / 2, -h / 2); shape.lineTo(w / 2, -h / 2);
    shape.lineTo(w / 2 * 0.7, h / 2); shape.lineTo(-w / 2 * 0.7, h / 2); shape.closePath();
    part(T, g, new T.ExtrudeGeometry(shape, { extrudePath: path, steps: low ? 8 : 16, bevelEnabled: false }), steel, {
      name: 'blade' + b,
    });
    const nT = Math.max(3, Math.round(diaMm / 80));
    for (let k = 0; k < nT; k++) {
      const t = (k + 0.4) / nT;
      const p = path.getPoint(t);
      const pk = buildRoundShankPick(T, ctx, { shankMm: 22, wear: wear, lod: opts.lod, merge: false });
      pk.position.copy(p);
      pk.rotation.set(0, -Math.atan2(p.z, p.x), Math.PI / 2 - 0.5);
      pk.scale.setScalar(1.2);
      g.add(pk);
    }
    flushHole(T, ctx, g, {
      x: Math.cos(phase + 0.3) * R * 0.32, y: -L * 0.3, z: Math.sin(phase + 0.3) * R * 0.32,
      r: mm(6), dir: [Math.cos(phase + 0.3), 0, Math.sin(phase + 0.3)], seg: low ? 7 : 9,
    });
  }
  // pulling swivel + eye
  const sw = group(T, g, 'swivel', { p: [0, -L, 0], dynamic: true });
  part(T, sw, G.cyl(T, R * 0.26, R * 0.26, mm(140), seg), chrome, { p: [0, -mm(70), 0] });
  part(T, sw, G.torus(T, R * 0.20, mm(22), 7, low ? 12 : 20), worn, { p: [0, -mm(180), 0], r: [Math.PI / 2, 0, 0] });

  return finalise(T, g, {
    id: 'backreamer', family: 'HDD & Trenchless / Backreamers & Hole Openers',
    name: 'Drillity Fly-Cut Backreamer ' + diaMm + ' mm',
    diameterMm: diaMm, blades: blades, teeth: 'Round-shank picks, 22 mm',
    thread: opts.thread || 'API238', material: 'S355J2 body, Hardox blades',
    method: 'hdd', priceEur: Math.round(1400 + diaMm * 11),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §12 RAISE BORING
   ═══════════════════════════════════════════════════════════════════════════ */

/** Raise-bore reamer head — hub, arms and rolling cutters. */
export function buildRaiseboreReamer(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = opts.diameterMm || 1800;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const R = mm(diaMm) * 0.5;
  const g = new T.Group();
  g.name = 'raisebore-reamer';
  const steel = wearMaterial(ctx, 'paintedSteel', wear * 0.5);
  const worn = wearMaterial(ctx, 'wornSteel', wear);
  const carb = wearMaterial(ctx, 'carbide', wear);

  // stem connection on top, dome below
  part(T, g, G.lathe(T, [
    [mm(60), 0], [mm(180), 0], [mm(180), -mm(200)],
    [R * 0.55, -mm(320)], [R * 0.95, -mm(520)], [R * 0.95, -mm(600)],
    [mm(60), -mm(600)],
  ], seg, false), steel, { name: 'hub' });
  boltRing(T, ctx, g, { count: 12, radius: mm(150), y: mm(20), acrossFlats: mm(46), height: mm(34) });

  /* THE HEAVIEST TOOL IN THE CATALOGUE, AND MOST OF IT WAS BOUGHT BY A FLAG.
     Every rolling cutter was its own `dynamic: true` group, which is an
     instruction to mergeStatic() to leave it alone so it can be animated
     independently. Nothing in the repo animates them — there was no handle to
     animate them WITH — so the flag bought no motion and cost one draw call
     per material per cutter: 17 at wear 0, and 24 once wear splits the
     carbide into whole buttons plus broken sockets. A 24-call reamer is a
     third of the entire 70-call rig budget on one tool.
     `animated: true` still gets independently rollable cutters, and now gets
     a handle to roll them with; the default merges them into the head, which
     is what a 1.8 m reamer looks like at the size it renders anyway. */
  const rollers = [];
  const cutters = opts.cutters || Math.max(6, Math.round(diaMm / 260));
  for (let i = 0; i < cutters; i++) {
    const a = (i / cutters) * TAU;
    const ring = i % 2;
    const r = R * (ring ? 0.86 : 0.55);
    const y = -mm(520) + (ring ? 0 : mm(120));
    const saddle = group(T, g, 'saddle' + i, { p: [Math.cos(a) * r, y, Math.sin(a) * r], r: [0, -a, 0] });
    part(T, saddle, G.box(T, mm(240), mm(200), mm(300)), worn, { p: [0, mm(60), 0] });
    const roll = group(T, saddle, 'cutter' + i, {
      r: [0, 0, Math.PI / 2 - (ring ? 0.35 : 0.9)], dynamic: opts.animated === true,
    });
    rollers.push(roll);
    part(T, roll, G.lathe(T, [
      [mm(40), -mm(130)], [mm(120), -mm(120)], [mm(160), -mm(60)],
      [mm(160), mm(60)], [mm(120), mm(120)], [mm(40), mm(130)],
    ], low ? 10 : 16, true), steel, { name: 'roller' });
    // carbide inserts in rows
    for (let row = -1; row <= 1; row++) {
      const layout = ringLayout({
        count: low ? 6 : 10, radius: mm(row === 0 ? 160 : 140), y: row * mm(72),
        tilt: Math.PI / 2, dia: mm(20), kind: 'conical', phase: row * 0.3,
      });
      studFace(T, ctx, roll, layout, { wear: wear, seg: low ? 6 : 8, mat: carb });
    }
  }
  const out = finalise(T, g, {
    id: 'raisebore-reamer', family: 'Tunneling & Underground / Raise Bore Reamer Heads',
    name: 'Drillity Raise Reamer ' + (diaMm / 1000).toFixed(1) + ' m',
    diameterMm: diaMm, cutters: cutters, stemConnection: 'Bolted flange',
    material: 'Fabricated S355J2 hub, TCI rolling cutters',
    method: 'raise-boring', priceEur: Math.round(38000 + diaMm * 40),
  }, opts);
  // Only meaningful when built with `animated: true`; otherwise the rollers
  // have been merged into the head and this is a no-op, which is the honest
  // answer rather than a setter that silently moves nothing.
  out.userData.rollers = rollers;
  out.userData.setRoll = (rad) => { for (const r of rollers) r.rotation.x = rad; };
  return out;
}

/** Raise-bore pilot bit — the small tricone-style bit that drills the pilot. */
export function buildRaiseborePilotBit(THREE_, ctx, opts) {
  const o = Object.assign({ diameterMm: 311, variant: 'tci', thread: 'API412' }, opts || {});
  const g = buildTriconeBit(THREE_, ctx, o);
  const spec = g.userData.spec;
  spec.id = 'raisebore-pilot-bit';
  spec.family = 'Tunneling & Underground / Raise Bore Pilot Bits';
  spec.name = 'Drillity Raise Pilot Bit ' + o.diameterMm + ' mm';
  spec.method = 'raise-boring';
  return g;
}

/** Raise-bore / rotary drill stem section — heavy flanged pipe. */
export function buildDrillStem(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.odMm || 254;
  const lenMm = opts.lengthMm || 1500;
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const wear = clamp01(opts.wear || 0);
  const ro = mm(odMm) * 0.5;
  const L = mm(lenMm);
  const g = new T.Group();
  g.name = 'drill-stem';
  const steel = bitBodyMaterial(ctx, wear * 0.5);
  const worn = material(ctx, 'wornSteel');
  part(T, g, pipeGeometry(T, { od: ro * 2, id: ro * 2 - mm(50), length: L, seg: seg }), steel, { name: 'pipe' });
  for (const y of [0, -L]) {
    part(T, g, G.cyl(T, ro * 1.28, ro * 1.28, mm(70), seg), worn, { p: [0, y - (y ? -mm(35) : mm(35)), 0] });
    boltRing(T, ctx, g, { count: 8, radius: ro * 1.1, y: y - (y ? -mm(35) : mm(35)), acrossFlats: mm(36), height: mm(28) });
  }
  return finalise(T, g, {
    id: 'drill-stem', family: 'Tunneling & Underground / Raise Bore Drill Stems',
    name: 'Drillity Raise Stem ' + odMm + ' x ' + lenMm + ' mm',
    odMm: odMm, lengthMm: lenMm, connection: 'Bolted flange, 8 x M36',
    material: '42CrMo4 forged', method: 'raise-boring',
    priceEur: Math.round(2200 + odMm * 12 * (lenMm / 1500)),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §12b DTH SHANK — the splined driver between the hammer chuck and the bit
   ═══════════════════════════════════════════════════════════════════════════ */
export function buildDTHShank(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const shank = String(opts.shank || 'QL5').toUpperCase();
  const SH = { DHD3: 76, DHD35: 89, QL5: 102, QL6: 127, MISSION4: 89, NUMA4: 89 };
  const dia = SH[shank] || 102;
  const thread = String(opts.thread || (dia > 100 ? 'API312' : 'API238')).toUpperCase();
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const R = mm(dia) * 0.5;
  const L = mm(dia * 3.1);
  const g = new T.Group();
  g.name = 'dth-shank';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.8);
  const worn = material(ctx, 'wornSteel');

  part(T, g, profiledLathe(T, [
    [mm(13), 0], [R * 0.78, 0], [R * 0.78, -mm(60)],
    [R, -mm(74)], [R, -L * 0.60],
    [R * 0.92, -L * 0.62], [R * 0.92, -L + mm(26)],
    [R * 0.76, -L], [mm(13), -L],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (y > -L * 0.62 || r < R * 0.6) return 1;
      const a = ((th * 6) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.085 * Math.max(0, 1 - d * 2.4);
    },
  }), steel, { name: 'shank' });
  addPinThread(T, ctx, g, thread, { y0: 0, length: mm(52), down: false, quality: low ? 0 : 0.6, mat: steel });
  part(T, g, G.torus(T, R * 0.94, mm(3.4), 5, low ? 14 : 22), worn, { p: [0, -L + mm(34), 0] });
  flushHole(T, ctx, g, { x: 0, y: -L, z: 0, r: mm(11), dir: [0, -1, 0], seg: low ? 8 : 12, chamferMat: worn });

  return finalise(T, g, {
    id: 'dth-shank', family: 'DTH Tools / DTH Shanks',
    name: 'Drillity DTH Shank ' + shank,
    shank: shank, odMm: dia, lengthMm: Math.round(L * 1000), thread: thread, splines: 6,
    material: 'Case-hardened 25CrMo4V', method: 'dth',
    priceEur: Math.round(280 + dia * 3.4),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §12c PLANT — the skid-mounted kit the shop sells alongside the tooling
   (DOMAIN.md §3 C: Fluids, Air & Power). Modelled at machine scale, in metres.
   ═══════════════════════════════════════════════════════════════════════════ */
function skidFrame(T, ctx, g, w, d, h) {
  const dark = material(ctx, 'paintedSteel', { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const worn = material(ctx, 'wornSteel');
  part(T, g, G.box(T, w, 0.10, d), dark, { p: [0, -h + 0.05, 0] });
  for (let s = -1; s <= 1; s += 2) {
    part(T, g, G.box(T, 0.09, 0.16, d * 1.02), dark, { p: [s * (w / 2 - 0.05), -h + 0.14, 0] });
  }
  for (let i = 0; i < 4; i++) {
    const c = [[-1, -1], [1, -1], [-1, 1], [1, 1]][i];
    part(T, g, G.torus(T, 0.05, 0.014, 5, 12), worn, {
      p: [c[0] * (w / 2 - 0.10), 0.05, c[1] * (d / 2 - 0.10)], r: [Math.PI / 2, 0, 0],
    });
  }
}

/** Portable screw compressor on a skid — the air supply for DTH work. */
export function buildCompressorSkid(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const lpm = opts.lpm || 18000;
  const bar = opts.bar || 25;
  const k = clampv(Math.pow(lpm / 18000, 0.3), 0.65, 1.5);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const w = 2.4 * k;
  const d = 1.35 * k;
  const h = 1.55 * k;
  const g = new T.Group();
  g.name = 'compressor-skid';
  const paint = material(ctx, 'paintedSteel');
  const dark = material(ctx, 'paintedSteel', { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const worn = material(ctx, 'wornSteel');

  part(T, g, G.roundedBox(T, w, h, d, 0.07, 2), paint, { p: [0, -h * 0.5, 0] });
  part(T, g, G.box(T, w * 1.02, 0.06, d * 1.02), dark, { p: [0, -0.03, 0] });
  const louvres = low ? 4 : 11;
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < louvres; i++) {
      part(T, g, G.box(T, 0.02, 0.05, d * 0.70), material(ctx, 'paintedSteel', { color: 0x14181D, roughness: 0.68, metalness: 0.28 }), {
        p: [s * (w / 2 + 0.005), -h * 0.22 - i * (h * 0.055), 0], r: [0.4, 0, 0], cast: false,
      });
    }
  }
  part(T, g, G.box(T, w * 0.44, h * 0.62, 0.02), dark, { p: [0, -h * 0.5, d / 2 + 0.012] });
  part(T, g, G.box(T, 0.05, 0.12, 0.05), worn, { p: [w * 0.20, -h * 0.5, d / 2 + 0.03] });
  part(T, g, G.cyl(T, 0.24 * k, 0.24 * k, w * 0.55, seg), material(ctx, 'paintedSteel', { color: 0x3F92A6 }), {
    p: [-w * 0.16, 0.24 * k, -d * 0.18], r: [0, 0, Math.PI / 2],
  });
  part(T, g, G.box(T, w * 0.34, 0.30 * k, d * 0.5), dark, { p: [w * 0.28, 0.18 * k, 0] });
  part(T, g, G.cyl(T, 0.055, 0.06, 0.55 * k, seg), worn, { p: [w * 0.40, 0.30 * k, -d * 0.30] });
  for (let i = 0; i < 3; i++) {
    part(T, g, G.cyl(T, 0.045, 0.045, 0.16, seg), material(ctx, '__brass'), {
      p: [-w * 0.30 + i * 0.20, -h * 0.78, d / 2 + 0.08], r: [Math.PI / 2, 0, 0],
    });
  }
  part(T, g, G.box(T, 0.42, 0.30, 0.10), dark, { p: [w * 0.30, -h * 0.34, d / 2 + 0.05], r: [-0.3, 0, 0] });
  buildScreenPanel(T, ctx, g, {
    w: 0.26, h: 0.16, over: GLOW.panel, bezelMat: dark,
    p: [w * 0.30, -h * 0.32, d / 2 + 0.105], r: [-0.3, 0, 0], name: 'pump-hmi', lens: !low,
  });
  skidFrame(T, ctx, g, w, d, h);
  part(T, g, G.box(T, w * 0.5, 0.16, 0.012), material(ctx, 'brandedPanel'), { p: [0, -h * 0.22, d / 2 + 0.014], cast: false });

  return finalise(T, g, {
    id: 'compressor-skid', family: 'Pneumatics & Compressors / Portable Compressors',
    name: 'Drillity Airline ' + Math.round(lpm / 1000) + 'k',
    freeAirLpm: lpm, pressureBar: bar, powerKw: Math.round(lpm * 0.0115),
    fuelLph: Math.round(lpm * 0.0028), lengthMm: Math.round(w * 1000),
    material: 'Sound-attenuated canopy on a lifting skid',
    method: 'dth', priceEur: Math.round(14000 + lpm * 2.6),
  }, opts);
}

/** Triplex mud / grout pump on a skid. */
export function buildPumpSkid(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const lpm = opts.lpm || 340;
  const bar = opts.bar || 60;
  const k = clampv(Math.pow(lpm / 340, 0.3), 0.7, 1.5);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const w = 1.9 * k;
  const d = 1.0 * k;
  const h = 1.05 * k;
  const g = new T.Group();
  g.name = 'pump-skid';
  const paint = material(ctx, 'paintedSteel');
  const dark = material(ctx, 'paintedSteel', { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const steel = material(ctx, 'rawSteel');
  const worn = material(ctx, 'wornSteel');

  part(T, g, G.roundedBox(T, w * 0.52, h * 0.62, d * 0.78, 0.05, 2), paint, { p: [-w * 0.22, -h * 0.55, 0] });
  part(T, g, G.roundedBox(T, w * 0.34, h * 0.52, d * 0.86, 0.04, 2), dark, { p: [w * 0.24, -h * 0.55, 0] });
  for (let i = 0; i < 3; i++) {
    const z = (i - 1) * d * 0.27;
    part(T, g, G.cyl(T, 0.085 * k, 0.085 * k, 0.20 * k, seg), worn, { p: [w * 0.24, -h * 0.24, z] });
    part(T, g, G.cyl(T, 0.055 * k, 0.055 * k, 0.14 * k, 6), steel, { p: [w * 0.24, -h * 0.88, z] });
    part(T, g, G.cyl(T, 0.05 * k, 0.05 * k, 0.30 * k, seg), steel, { p: [w * 0.40, -h * 0.55, z], r: [0, 0, Math.PI / 2] });
  }
  part(T, g, G.cyl(T, 0.09 * k, 0.09 * k, d * 0.92, seg), steel, { p: [w * 0.24, -h * 1.02, 0], r: [Math.PI / 2, 0, 0] });
  part(T, g, G.cyl(T, 0.06 * k, 0.06 * k, d * 0.92, seg), steel, { p: [w * 0.46, -h * 0.55, 0], r: [Math.PI / 2, 0, 0] });
  part(T, g, G.lathe(T, [
    [0.02, 0], [0.13 * k, 0.06], [0.13 * k, 0.34 * k], [0.02, 0.40 * k],
  ], seg, true), material(ctx, 'paintedSteel', { color: 0x3F92A6, roughness: 0.5, metalness: 0.34 }), { p: [w * 0.40, -h * 0.30, d * 0.30] });
  part(T, g, G.cyl(T, 0.16 * k, 0.16 * k, 0.42 * k, seg), steel, { p: [-w * 0.42, -h * 0.55, 0], r: [0, 0, Math.PI / 2] });
  part(T, g, G.box(T, 0.10, h * 0.66, d * 0.55), dark, { p: [-w * 0.08, -h * 0.52, 0] });
  part(T, g, G.cyl(T, 0.22 * k, 0.22 * k, 0.05, seg), worn, { p: [-w * 0.05, -h * 0.52, 0], r: [0, 0, Math.PI / 2] });
  part(T, g, G.cyl(T, 0.075, 0.075, 0.03, seg), material(ctx, 'chrome'), { p: [w * 0.30, -h * 0.10, d * 0.42], r: [Math.PI / 2, 0, 0] });
  part(T, g, G.box(T, 0.34, 0.26, 0.09), dark, { p: [-w * 0.30, -h * 0.18, d * 0.44], r: [-0.32, 0, 0] });
  skidFrame(T, ctx, g, w, d, h);
  part(T, g, G.box(T, w * 0.42, 0.14, 0.012), material(ctx, 'brandedPanel'), { p: [-w * 0.05, -h * 1.18, d / 2 + 0.012], cast: false });

  return finalise(T, g, {
    id: 'pump-skid', family: 'Mud & Fluid Systems / Mud Pumps',
    name: 'Drillity Triplex ' + lpm,
    flowLpm: lpm, pressureBar: bar, powerKw: Math.round(lpm * bar / 480),
    fluidEnd: 'Triplex, 3 x replaceable liners',
    material: 'Forged fluid end, cast power end',
    method: 'core', priceEur: Math.round(6500 + lpm * 34),
  }, opts);
}

/** Diesel power unit / genset. */
export function buildPowerUnit(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const kw = opts.kw || 120;
  const k = clampv(Math.pow(kw / 120, 0.3), 0.65, 1.6);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const w = 2.1 * k;
  const d = 1.1 * k;
  const h = 1.35 * k;
  const g = new T.Group();
  g.name = 'power-unit';
  const paint = material(ctx, 'paintedSteel');
  const dark = material(ctx, 'paintedSteel', { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const black = material(ctx, 'paintedSteel', { color: 0x14181D, roughness: 0.68, metalness: 0.28 });
  const worn = material(ctx, 'wornSteel');

  part(T, g, G.roundedBox(T, w, h, d, 0.06, 2), paint, { p: [0, -h * 0.5, 0] });
  part(T, g, G.box(T, w * 1.02, 0.05, d * 1.02), dark, { p: [0, -0.025, 0] });
  part(T, g, G.box(T, 0.05, h * 0.72, d * 0.80), black, { p: [-w / 2 - 0.03, -h * 0.5, 0] });
  part(T, g, G.box(T, 0.02, h * 0.66, d * 0.74), worn, { p: [-w / 2 - 0.06, -h * 0.5, 0] });
  for (let i = 0; i < 6; i++) {
    part(T, g, G.box(T, 0.02, 0.30 * k, 0.09), black, {
      p: [-w / 2 + 0.10, -h * 0.5, 0], r: [(i / 6) * TAU, 0, 0], cast: false,
    });
  }
  const louvres = low ? 4 : 10;
  for (let i = 0; i < louvres; i++) {
    part(T, g, G.box(T, w * 0.62, 0.045, 0.02), black, {
      p: [w * 0.06, -h * 0.26 - i * (h * 0.055), d / 2 + 0.005], r: [0.4, 0, 0], cast: false,
    });
  }
  part(T, g, G.box(T, w * 0.30, h * 0.56, 0.02), dark, { p: [-w * 0.30, -h * 0.5, d / 2 + 0.012] });
  part(T, g, G.cyl(T, 0.10 * k, 0.10 * k, 0.75 * k, seg), worn, { p: [w * 0.30, 0.16 * k, -d * 0.24], r: [0, 0, Math.PI / 2] });
  part(T, g, G.cyl(T, 0.055, 0.06, 0.42 * k, seg), worn, { p: [w * 0.30 + 0.30, 0.40 * k, -d * 0.24] });
  part(T, g, G.box(T, w * 0.26, h * 0.40, d * 0.42), dark, { p: [w * 0.30, -h * 0.34, d * 0.10] });
  part(T, g, G.box(T, w * 0.34, 0.30, 0.10), dark, { p: [-w * 0.14, -h * 0.20, d / 2 + 0.05], r: [-0.3, 0, 0] });
  buildScreenPanel(T, ctx, g, {
    w: 0.28, h: 0.18, over: GLOW.panel, bezelMat: black,
    p: [-w * 0.14, -h * 0.18, d / 2 + 0.105], r: [-0.3, 0, 0], name: 'genset-hmi', lens: !low,
  });
  part(T, g, G.roundedBox(T, w * 0.9, 0.22 * k, d * 0.8, 0.03, 2), black, { p: [0, -h - 0.11 * k, 0] });
  skidFrame(T, ctx, g, w, d, h + 0.22 * k);
  part(T, g, G.box(T, w * 0.45, 0.15, 0.012), material(ctx, 'brandedPanel'), { p: [w * 0.18, -h * 0.70, d / 2 + 0.014], cast: false });

  return finalise(T, g, {
    id: 'power-unit', family: 'Power Units & Engines / Diesel Engines',
    name: 'Drillity Powerpack ' + kw + ' kW',
    powerKw: kw, rpm: 1800, fuelLph: Math.round(kw * 0.24),
    tankL: Math.round(kw * 2.2), noiseDbA: 72,
    material: 'Sound-attenuated canopy, skid base tank',
    method: 'dth', priceEur: Math.round(9000 + kw * 210),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §12d OIL & GAS WELL DRILLING — the rotary string, the BHA, well control.

   A different vocabulary from everything above it. Percussion tooling is held
   together by rope threads (R/T, DOMAIN.md §4); an oil-well string is held
   together by API ROTARY SHOULDERED connections, which are a tapered thread
   that does NOT carry the load — the load is carried by the machined SHOULDER
   the pin drives against. That shoulder is the thing a driller looks at, so
   every connection below is modelled as taper + helix + shoulder face, never
   as a straight rope thread.

   Names: NC = numbered connection, REG = API Regular, FH = Full Hole,
   IF = Internal Flush. The bracketed equivalences are the standard
   interchange names (NC50 and 4 1/2 IF are the same connection).
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * API rotary shouldered connections.
 *   odMm   nominal tool-joint / box OD the connection is cut in
 *   boreMm through bore
 *   pinMm  pin length (shoulder to nose)
 *   taper  diameter change per unit of length (1/6 = 2 in/ft, 1/4 = 3 in/ft)
 *   tpi    threads per inch — sets the helix lead
 */
export const OILFIELD_CONNECTIONS = {
  NC26:   { label: 'NC26 (2 3/8 IF)',   family: 'NC',  odMm: 85.7,  boreMm: 44.5,  pinMm: 89,  taper: 1 / 6, tpi: 4 },
  NC31:   { label: 'NC31 (2 7/8 IF)',   family: 'NC',  odMm: 104.8, boreMm: 54.0,  pinMm: 95,  taper: 1 / 6, tpi: 4 },
  NC38:   { label: 'NC38 (3 1/2 IF)',   family: 'NC',  odMm: 120.7, boreMm: 71.4,  pinMm: 102, taper: 1 / 6, tpi: 4 },
  NC40:   { label: 'NC40 (4 FH)',       family: 'NC',  odMm: 133.4, boreMm: 71.4,  pinMm: 108, taper: 1 / 6, tpi: 4 },
  NC46:   { label: 'NC46 (4 IF)',       family: 'NC',  odMm: 158.8, boreMm: 82.6,  pinMm: 114, taper: 1 / 6, tpi: 4 },
  NC50:   { label: 'NC50 (4 1/2 IF)',   family: 'NC',  odMm: 171.4, boreMm: 95.3,  pinMm: 121, taper: 1 / 6, tpi: 4 },
  NC56:   { label: 'NC56',              family: 'NC',  odMm: 190.5, boreMm: 107.9, pinMm: 127, taper: 1 / 4, tpi: 4 },
  NC61:   { label: 'NC61',              family: 'NC',  odMm: 209.6, boreMm: 127.0, pinMm: 133, taper: 1 / 4, tpi: 4 },
  FH400:  { label: '4 FH',              family: 'FH',  odMm: 133.4, boreMm: 71.4,  pinMm: 108, taper: 1 / 6, tpi: 4 },
  FH412:  { label: '4 1/2 FH',          family: 'FH',  odMm: 152.4, boreMm: 82.6,  pinMm: 114, taper: 1 / 6, tpi: 4 },
  FH512:  { label: '5 1/2 FH',          family: 'FH',  odMm: 187.3, boreMm: 95.3,  pinMm: 121, taper: 1 / 6, tpi: 4 },
  REG238: { label: '2 3/8 API REG',     family: 'REG', odMm: 82.6,  boreMm: 31.8,  pinMm: 73,  taper: 1 / 4, tpi: 5 },
  REG312: { label: '3 1/2 API REG',     family: 'REG', odMm: 117.5, boreMm: 44.5,  pinMm: 86,  taper: 1 / 4, tpi: 5 },
  REG412: { label: '4 1/2 API REG',     family: 'REG', odMm: 152.4, boreMm: 57.2,  pinMm: 102, taper: 1 / 4, tpi: 4 },
  REG658: { label: '6 5/8 API REG',     family: 'REG', odMm: 203.2, boreMm: 76.2,  pinMm: 127, taper: 1 / 4, tpi: 4 },
  REG758: { label: '7 5/8 API REG',     family: 'REG', odMm: 234.9, boreMm: 76.2,  pinMm: 140, taper: 1 / 4, tpi: 4 },
  REG858: { label: '8 5/8 API REG',     family: 'REG', odMm: 266.7, boreMm: 101.6, pinMm: 152, taper: 1 / 4, tpi: 4 },
};

/** Resolve a connection id, tolerating '4 1/2 REG', 'nc-50', 'NC50' … */
export function rotaryConnection(id) {
  const k = String(id === undefined || id === null ? '' : id).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return OILFIELD_CONNECTIONS[k] || OILFIELD_CONNECTIONS.NC50;
}

/** The bit connection a given hole size is actually cut with. */
export function bitConnectionFor(diaMm) {
  if (diaMm >= 419) return 'REG758';
  if (diaMm >= 270) return 'REG658';
  if (diaMm >= 200) return 'REG412';
  if (diaMm >= 149) return 'REG312';
  return 'REG238';
}

/**
 * A tapered helix. Unlike threadGeometry() (rope threads, constant radius) the
 * crest radius shrinks along the run, which is what makes a rotary shouldered
 * connection read as one. Always runs from y0 in -Y.
 * o = { rCrest, taper, pitch, length, depth, y0, hand, quality }
 */
export function taperedThreadGeometry(T, o) {
  o = o || {};
  const rCrest = o.rCrest !== undefined ? o.rCrest : mm(70);
  const taper = o.taper === undefined ? 1 / 6 : o.taper;
  const pitch = o.pitch !== undefined ? o.pitch : mm(6.35);
  const length = o.length !== undefined ? o.length : mm(100);
  const depth = o.depth !== undefined ? o.depth : mm(3.1);
  const hand = o.hand === 'left' ? -1 : 1;
  const y0 = o.y0 || 0;
  const q = o.quality === undefined ? 1 : clamp01(o.quality);
  const segsPerTurn = Math.max(5, Math.round(lerp(7, 15, q)));
  const radial = Math.max(4, Math.round(lerp(4, 6, q)));
  const turns = Math.max(0.8, length / pitch);
  const n = Math.max(8, Math.ceil(turns * segsPerTurn));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = u * turns * TAU * hand;
    const r = Math.max(mm(1), rCrest - depth * 0.5 - taper * 0.5 * u * length);
    pts.push(new T.Vector3(Math.cos(a) * r, y0 - u * length, Math.sin(a) * r));
  }
  const curve = new T.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
  return new T.TubeGeometry(curve, n, depth * 0.6, radial, false);
}

/**
 * A male rotary shouldered PIN on the -Y end of a tool: the flat load-bearing
 * shoulder, the 18-degree bevel, the tapered thread and the nose bore.
 * o = { y0 (shoulder face), shoulderR (tool-joint radius), mat, lod }
 * Returns the y of the pin nose.
 */
export function addRotaryPin(T, ctx, parent, connId, o) {
  o = o || {};
  const c = rotaryConnection(connId);
  const low = !!o.low;
  const seg = low ? 12 : 22;
  const y0 = o.y0 || 0;
  const len = o.length !== undefined ? o.length : mm(c.pinMm);
  const mat = o.mat || material(ctx, 'rawSteel');
  const worn = o.wornMat || material(ctx, 'wornSteel');
  const shR = o.shoulderR !== undefined ? o.shoulderR : mm(c.odMm) * 0.5;
  const rBase = mm(c.odMm) * 0.5 * 0.865;
  const rNose = Math.max(mm(6), rBase - c.taper * 0.5 * len);
  const bore = mm(c.boreMm) * 0.5;
  const pitch = mm(25.4 / c.tpi);
  const depth = mm(25.4 / c.tpi) * 0.44;

  // the shoulder + 18 deg bevel down onto the thread root cone
  part(T, parent, G.lathe(T, [
    [bore, y0 - len], [rNose * 0.92, y0 - len], [rNose * 0.97, y0 - len + mm(9)],
    [rBase - depth * 0.9, y0 - mm(6)], [shR * 0.98, y0 - mm(4)], [shR, y0],
    [bore, y0],
  ], seg, true), mat, { name: 'pin:' + c.family });
  part(T, parent, taperedThreadGeometry(T, {
    rCrest: rBase, taper: c.taper, pitch: pitch, depth: depth,
    length: len - mm(12), y0: y0 - mm(8), quality: low ? 0.15 : 0.75,
  }), mat, { name: 'pinthread' });
  // the shoulder itself is lapped bright on a connection that has been run
  part(T, parent, G.lathe(T, [[rBase * 0.99, y0 + mm(0.4)], [shR * 0.999, y0 + mm(0.4)]], seg, false), worn, {
    name: 'shoulder', cast: false,
  });
  return y0 - len;
}

/**
 * A female rotary shouldered BOX in the +Y end of a tool: the counterbore, the
 * internal tapered thread you can see down the mouth, and the shoulder face.
 * o = { y0 (mouth face), outerR, mat, lod }
 */
export function addRotaryBox(T, ctx, parent, connId, o) {
  o = o || {};
  const c = rotaryConnection(connId);
  const low = !!o.low;
  const seg = low ? 12 : 22;
  const y0 = o.y0 || 0;
  const len = o.length !== undefined ? o.length : mm(c.pinMm) + mm(10);
  const mat = o.mat || material(ctx, 'wornSteel');
  const rMouth = mm(c.odMm) * 0.5 * 0.885;
  const bore = mm(c.boreMm) * 0.5;

  // counterbore wall, then the shoulder face at the bottom of the box
  part(T, parent, G.lathe(T, [
    [bore, y0 - len - mm(30)], [rMouth * 0.86, y0 - len - mm(26)],
    [rMouth * 0.86, y0 - len], [rMouth, y0 - len + mm(6)],
    [rMouth, y0 - mm(3)], [rMouth * 1.02, y0],
  ], seg, false), mat, { name: 'box:' + c.family, cast: false });
  part(T, parent, taperedThreadGeometry(T, {
    rCrest: rMouth + mm(25.4 / c.tpi) * 0.16, taper: c.taper,
    pitch: mm(25.4 / c.tpi), depth: mm(25.4 / c.tpi) * 0.44,
    length: len - mm(14), y0: y0 - mm(5), quality: low ? 0.15 : 0.7,
  }), mat, { name: 'boxthread', cast: false });
  // the dark down the hole — one back-faced cone, the trick used by flushHole
  const dark = material(ctx, '__hole', { color: 0x090B0D, roughness: 0.92, metalness: 0.15, side: T.BackSide });
  part(T, parent, G.cyl(T, bore, bore, len + mm(40), seg, true), dark, {
    p: [0, y0 - (len + mm(40)) * 0.5, 0], cast: false, recv: false,
  });
  return y0 - len;
}

/**
 * Re-aim a +Y-axis geometry along the radius at angle `a` in the XZ plane.
 * Side outlets, lockdown screws and ram cylinders all point outward, and
 * getting that wrong is instantly visible on a wellhead.
 */
function radialAxis(geo, a) {
  geo.rotateZ(-Math.PI / 2);
  geo.rotateY(-a);
  return geo;
}

/** A snapped-off milled tooth: a low stub with one side broken away. */
export function toothStubGeometry(T, o) {
  o = o || {};
  const r = (o.dia !== undefined ? o.dia : mm(13)) * 0.5;
  const h = r * (o.height === undefined ? 0.55 : o.height);
  return profiledLathe(T, [
    [r * 0.04, -r], [r * 1.03, -r * 0.92], [r * 1.0, h * 0.2],
    [r * 0.92, h * 0.62], [r * 0.55, h], [r * 0.04, h * 0.92],
  ], {
    segments: o.seg || 9,
    radiusFn: (th, rr, y) => (y > 0 ? 1 - 0.46 * Math.max(0, Math.cos(th - 1.15)) : 1),
  });
}

/** A PDC cutter whose diamond table has chipped: a disc with a bite out of it. */
export function chippedCutterGeometry(T, o) {
  o = o || {};
  const r = (o.dia !== undefined ? o.dia : mm(16)) * 0.5;
  const h = o.height !== undefined ? o.height : mm(2.4);
  const chip = clamp01(o.chip === undefined ? 0.5 : o.chip);
  const seg = o.seg || 12;
  const arc = TAU * (1 - 0.16 - chip * 0.30);
  const g = new T.CylinderGeometry(r, r, h, seg, 1, false, 0.4, arc);
  return g;
}

/* ── DRILL COLLARS ────────────────────────────────────────────────────────
   Thick-walled, and the thing that actually puts weight on the bit. Slick and
   spiral variants; the spiral grooves cut the contact area with the wall so
   the collar is far less likely to differentially stick.
   ───────────────────────────────────────────────────────────────────────── */
export function buildDrillCollar(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.odMm || 203.2;
  const idMm = opts.idMm || 71.4;
  const lenMm = opts.lengthMm || 9450;
  const spiral = opts.variant === 'spiral';
  const connId = opts.connection || (odMm >= 228 ? 'NC56' : odMm >= 184 ? 'NC50' : odMm >= 152 ? 'NC46' : 'NC38');
  const c = rotaryConnection(connId);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const L = mm(lenMm);
  const R = mm(odMm) * 0.5 - mm(2.4) * wear;      // collars wear undergauge
  const Ri = mm(idMm) * 0.5;

  const g = new T.Group();
  g.name = 'drill-collar';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.55);
  const worn = material(ctx, 'wornSteel');
  const polished = material(ctx, 'chrome', { roughness: 0.22, metalness: 0.94 });

  // ── the body cross-section, top (y=0) to bottom (y=-L) then back up the bore
  const boxLen = mm(c.pinMm) + mm(10);
  const pinLen = mm(c.pinMm);
  const yElev = -boxLen - mm(120);                 // elevator recess
  const ySlip = yElev - mm(180);                   // slip recess just below it
  const prof = [];
  prof.push([Ri, 0]);
  prof.push([R * 0.985, 0]);
  prof.push([R, -mm(26)]);
  prof.push([R, yElev + mm(60)]);
  // elevator recess: 18 deg load shoulder above, 35 deg ramp below
  prof.push([R * 0.925, yElev + mm(26)]);
  prof.push([R * 0.925, yElev - mm(64)]);
  prof.push([R, yElev - mm(104)]);
  prof.push([R, ySlip + mm(40)]);
  // slip recess: a long shallow band the slips bite into
  prof.push([R * 0.962, ySlip - mm(10)]);
  prof.push([R * 0.962, ySlip - mm(420)]);
  prof.push([R, ySlip - mm(470)]);
  // the plain body — subdivided so the spiral grooves have rows to ride on
  const yBodyTop = ySlip - mm(470);
  const yBodyBot = -L + pinLen + mm(150);
  const rows = spiral ? (low ? 26 : 64) : 2;
  for (let i = 1; i <= rows; i++) prof.push([R, lerp(yBodyTop, yBodyBot, i / rows)]);
  prof.push([R * 0.99, -L + pinLen + mm(30)]);
  prof.push([R * 0.90, -L + pinLen]);
  prof.push([Ri, -L + pinLen]);
  prof.push([Ri, 0]);

  const grooveK = 3.0;                              // three starts
  const body = profiledLathe(T, prof, {
    segments: seg,
    radiusFn: !spiral ? null : (th, r, y) => {
      if (r < R * 0.9 || y > yBodyTop || y < yBodyBot) return 1;
      const a = ((th * grooveK - y * 1.55) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.085 * Math.max(0, 1 - d * 2.7);
    },
  });
  part(T, g, body, steel, { name: 'body' });

  // ── connections: box up, pin down ──
  addRotaryBox(T, ctx, g, connId, { y0: 0, outerR: R, low: low, mat: worn });
  addRotaryPin(T, ctx, g, connId, { y0: -L + pinLen, shoulderR: R * 0.90, low: low, mat: steel, wornMat: worn });

  // ── the bright band where the elevators and slips have polished it ──
  part(T, g, G.cyl(T, R * 0.927, R * 0.927, mm(86), seg), polished, { p: [0, yElev - mm(19), 0], cast: false });
  part(T, g, G.cyl(T, R * 0.964, R * 0.964, mm(300), seg), polished, { p: [0, ySlip - mm(200), 0], cast: false });
  // stencilled band + a stamped identification collar below the box
  part(T, g, G.cyl(T, R * 1.004, R * 1.004, mm(60), seg), material(ctx, 'safetyStripe'), {
    p: [0, -boxLen - mm(40), 0], cast: false,
  });
  // ── wear story: slip cuts and tong marks ──
  if (wear > 0.35) {
    const n = low ? 3 : 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + 0.4;
      part(T, g, G.box(T, R * 0.30, mm(150), mm(5)), worn, {
        p: [Math.cos(a) * R * 0.94, ySlip - mm(120 + i * 40), Math.sin(a) * R * 0.94],
        r: [0, -a, 0.08], cast: false,
      });
    }
  }

  return finalise(T, g, {
    id: 'drill-collar', family: 'Drill String & Rods / Drill Collars',
    name: 'Drillity ' + (spiral ? 'Spiral' : 'Slick') + ' Drill Collar ' + odMm.toFixed(1) + ' mm',
    odMm: odMm, idMm: idMm, lengthMm: lenMm, variant: spiral ? 'spiral' : 'slick',
    connection: c.label, connectionFamily: c.family,
    recesses: 'Elevator + slip recess', weightKgPerM: Math.round(0.00617 * (odMm * odMm - idMm * idMm)),
    material: 'AISI 4145H mod, quenched and tempered',
    method: 'oil-rotary', priceEur: Math.round(1400 + odMm * 26 * (lenMm / 9450)),
  }, opts);
}

/* ── DRILL PIPE (oil well) ────────────────────────────────────────────────
   Not a rod. A thin-wall tube with UPSET ends, friction-welded to tool joints
   of a much larger OD, hardbanded so the joint wears instead of the casing.
   ───────────────────────────────────────────────────────────────────────── */
export function buildOilDrillPipe(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const hwdp = opts.variant === 'hwdp';
  const odMm = opts.odMm || 127;
  const wallMm = opts.wallMm || (hwdp ? 25.4 : odMm >= 127 ? 9.19 : 8.56);
  const lenMm = opts.lengthMm || 9450;
  const grade = String(opts.grade || (hwdp ? 'HW' : 'S-135'));
  const connId = opts.connection || (odMm >= 139 ? 'NC56' : odMm >= 121 ? 'NC50' : odMm >= 108 ? 'NC46' : 'NC38');
  const c = rotaryConnection(connId);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;

  const L = mm(lenMm);
  const Rt = mm(odMm) * 0.5;                       // tube OD
  const Ri = Rt - mm(wallMm);                      // bore
  const Rj = mm(c.odMm) * 0.5 - mm(3.0) * wear;    // tool joint OD, wears down
  const boxLen = mm(c.pinMm) + mm(52);
  const pinLen = mm(c.pinMm);
  const jointLen = boxLen + mm(120);

  const g = new T.Group();
  g.name = 'drill-pipe';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.42);
  const joint = wearMaterial(ctx, 'wornSteel', wear * 0.6);
  const worn = material(ctx, 'wornSteel');
  const hard = wearMaterial(ctx, 'carbide', wear * 0.9, { roughness: 0.42 });
  const polished = material(ctx, 'chrome', { roughness: 0.20, metalness: 0.95 });

  // ── box tool joint (top) : OD, 18 deg elevator shoulder, tong space ──
  part(T, g, G.lathe(T, [
    [Ri, 0], [Rj * 0.99, 0], [Rj, -mm(14)],
    [Rj, -jointLen + mm(70)],
    [Rj * 0.92, -jointLen + mm(24)],               // 18 deg elevator shoulder
    [Rt * 1.14, -jointLen],                        // friction weld upset
    [Rt * 1.05, -jointLen - mm(70)],
    [Rt, -jointLen - mm(220)],
    [Rt, -L + jointLen + mm(220)],
    [Rt * 1.05, -L + jointLen + mm(70)],
    [Rt * 1.14, -L + jointLen],
    [Rj * 0.92, -L + jointLen - mm(30)],
    [Rj, -L + pinLen + mm(40)],
    [Rj * 0.90, -L + pinLen],
    [Ri, -L + pinLen],
    [Ri, 0],
  ], seg, true), steel, { name: 'body' });
  // the friction-weld beads that hold the tool joints on
  for (const y of [-jointLen, -L + jointLen]) {
    part(T, g, weldBead(T, Rt * 1.15, mm(4.5), low ? 14 : 24), worn, { p: [0, y, 0], cast: false });
  }

  addRotaryBox(T, ctx, g, connId, { y0: 0, outerR: Rj, low: low, mat: joint });
  addRotaryPin(T, ctx, g, connId, { y0: -L + pinLen, shoulderR: Rj * 0.90, low: low, mat: joint, wornMat: worn });

  // ── hardbanding: two proud tungsten-carbide bands on the box tool joint ──
  if (opts.hardbanding !== false) {
    const hb = mm(6.4) * (1 - wear * 0.72);        // it is a sacrificial band
    for (let i = 0; i < 2; i++) {
      part(T, g, G.cyl(T, Rj + hb, Rj + hb, mm(46), seg), hard, {
        p: [0, -mm(70) - i * mm(96), 0], name: 'hardband' + i,
      });
      part(T, g, G.lathe(T, [
        [Rj, -mm(70) - i * mm(96) - mm(34)], [Rj + hb, -mm(70) - i * mm(96) - mm(23)],
      ], seg, false), hard, { cast: false });
    }
  }
  // tong space on the pin joint is left bare and gets chewed
  part(T, g, G.cyl(T, Rj * 1.002, Rj * 1.002, mm(230), seg), polished, {
    p: [0, -L + pinLen + mm(230), 0], cast: false,
  });

  // ── HWDP: the integral centre wear pad that makes it unmistakable ──
  if (hwdp) {
    part(T, g, G.lathe(T, [
      [Rt, -L * 0.5 + mm(340)], [Rj * 0.93, -L * 0.5 + mm(250)],
      [Rj * 0.93, -L * 0.5 - mm(250)], [Rt, -L * 0.5 - mm(340)],
    ], seg, false), joint, { name: 'wear-pad' });
    for (let i = 0; i < 2; i++) {
      part(T, g, G.cyl(T, Rj * 0.94 + mm(5) * (1 - wear * 0.7), Rj * 0.94 + mm(5) * (1 - wear * 0.7), mm(60), seg), hard, {
        p: [0, -L * 0.5 + (i ? 1 : -1) * mm(150), 0],
      });
    }
  }

  // ── the painted grade band every pipe carries ──
  part(T, g, G.cyl(T, Rt * 1.008, Rt * 1.008, mm(120), seg), material(ctx, 'safetyStripe'), {
    p: [0, -jointLen - mm(420), 0], cast: false,
  });
  if (wear > 0.55) {
    // slip-cut scoring in the pipe body below the box
    for (let i = 0; i < (low ? 2 : 4); i++) {
      const a = i * 1.9;
      part(T, g, G.box(T, Rt * 0.34, mm(200), mm(4)), worn, {
        p: [Math.cos(a) * Rt * 0.96, -jointLen - mm(700) - i * mm(90), Math.sin(a) * Rt * 0.96],
        r: [0, -a, 0.05], cast: false,
      });
    }
  }

  return finalise(T, g, {
    id: 'drill-pipe', family: 'Drill String & Rods / Drill Pipes',
    name: 'Drillity ' + (hwdp ? 'Heavy-Weight Drill Pipe ' : 'Drill Pipe ') + odMm + ' mm ' + c.label.split(' (')[0],
    odMm: odMm, wallMm: wallMm, idMm: Math.round((odMm - 2 * wallMm) * 10) / 10,
    lengthMm: lenMm, range: 'Range 2', grade: grade,
    connection: c.label, connectionFamily: c.family,
    toolJointOdMm: c.odMm, upset: 'Internal-external (IEU)',
    hardbanding: opts.hardbanding === false ? 'None' : 'Tungsten-carbide, flush-applied',
    variant: hwdp ? 'HWDP' : 'Standard',
    material: hwdp ? 'Integral 4145H mod body' : 'Grade ' + grade + ' tube, 4137H tool joints',
    method: 'oil-rotary',
    priceEur: Math.round((hwdp ? 2400 : 900) + odMm * (hwdp ? 14 : 6.2) * (lenMm / 9450)),
  }, opts);
}

/* ── STABILISERS ──────────────────────────────────────────────────────────
   What holds the hole straight (or builds angle). Integral-blade is machined
   from one forging; the sleeve type carries a replaceable wear sleeve on a
   splined mandrel, so only the sleeve is scrapped.
   ───────────────────────────────────────────────────────────────────────── */
export function buildStabiliser(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const bladeMm = opts.odMm || 215.9;
  const sleeve = opts.type === 'sleeve';
  const blades = opts.blades || 3;
  const bodyMm = opts.bodyOdMm || Math.round(bladeMm * 0.56);
  const connId = opts.connection || (bladeMm >= 300 ? 'NC56' : bladeMm >= 200 ? 'NC50' : 'NC38');
  const c = rotaryConnection(connId);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;

  const Rb = mm(bladeMm) * 0.5 - mm(4.5) * wear;   // gauge is what wears
  const Rm = mm(bodyMm) * 0.5;
  const L = mm(opts.lengthMm || Math.round(bladeMm * 8.4));
  const bladeTop = -L * 0.30;
  const bladeBot = -L * 0.70;

  const g = new T.Group();
  g.name = 'stabiliser';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.5);
  const sleeveMat = wearMaterial(ctx, 'wornSteel', wear * 0.7);
  const worn = material(ctx, 'wornSteel');
  const hard = wearMaterial(ctx, 'carbide', wear);

  // ── mandrel: box up, pin down, fishing neck under the box ──
  const boxLen = mm(c.pinMm) + mm(20);
  const pinLen = mm(c.pinMm);
  part(T, g, G.lathe(T, [
    [mm(c.boreMm) * 0.5, 0], [mm(c.odMm) * 0.5 * 0.99, 0], [mm(c.odMm) * 0.5, -mm(16)],
    [mm(c.odMm) * 0.5, -boxLen], [Rm * 1.02, -boxLen - mm(50)],
    [Rm, -boxLen - mm(120)],
    [Rm, -L + pinLen + mm(90)], [Rm * 0.94, -L + pinLen + mm(40)],
    [mm(c.odMm) * 0.5 * 0.90, -L + pinLen],
    [mm(c.boreMm) * 0.5, -L + pinLen], [mm(c.boreMm) * 0.5, 0],
  ], seg, true), steel, { name: 'mandrel' });
  addRotaryBox(T, ctx, g, connId, { y0: 0, low: low, mat: worn });
  addRotaryPin(T, ctx, g, connId, { y0: -L + pinLen, shoulderR: mm(c.odMm) * 0.5 * 0.90, low: low, mat: steel, wornMat: worn });

  // ── the blade section (on a sleeve, or integral) ──
  const host = sleeve ? group(T, g, 'sleeve') : g;
  if (sleeve) {
    // splined seat + retaining shoulders, then the sleeve itself over it
    part(T, g, profiledLathe(T, [
      [Rm * 1.06, bladeTop + mm(30)], [Rm * 1.06, bladeBot - mm(30)],
    ], {
      segments: seg,
      radiusFn: (th) => {
        const a = ((th * 12) % TAU + TAU) % TAU;
        const d = Math.min(a, TAU - a) / Math.PI;
        return 1 - 0.045 * Math.max(0, 1 - d * 2.2);
      },
      closedProfile: false,
    }), worn, { name: 'spline-seat' });
    part(T, host, G.lathe(T, [
      [Rm * 1.07, bladeTop + mm(26)], [Rm * 1.34, bladeTop + mm(4)],
      [Rm * 1.34, bladeBot - mm(4)], [Rm * 1.07, bladeBot - mm(26)],
    ], seg, false), sleeveMat, { name: 'sleeve-body' });
    // retaining nut above the sleeve
    part(T, g, profiledLathe(T, [
      [Rm * 1.05, bladeTop + mm(30)], [Rm * 1.30, bladeTop + mm(34)],
      [Rm * 1.30, bladeTop + mm(96)], [Rm * 1.05, bladeTop + mm(100)],
    ], {
      segments: seg,
      radiusFn: (th) => {
        const a = ((th * 6) % TAU + TAU) % TAU;
        const d = Math.min(a, TAU - a) / Math.PI;
        return 1 - 0.06 * Math.max(0, 1 - d * 2.4);
      },
    }), worn, { name: 'retaining-nut' });
  }

  const wrapDeg = opts.spiral === false ? 0 : 120;
  const bladeSteps = low ? 8 : 16;
  const inserts = [];
  for (let b = 0; b < blades; b++) {
    const phase = (b / blades) * TAU;
    const pts = [];
    const n = 8;
    const rBlade = sleeve ? Rm * 1.30 : Rm;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const y = lerp(bladeTop, bladeBot, t);
      const a = phase + t * wrapDeg * DEG;
      const rr = rBlade + (Rb - rBlade) * 0.5;
      pts.push(new T.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr));
    }
    const path = new T.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const bw = mm(bladeMm) * 0.16;
    const bh = (Rb - (sleeve ? Rm * 1.30 : Rm)) * 2;
    const shape = new T.Shape();
    shape.moveTo(-bw / 2, -bh / 2);
    shape.lineTo(bw / 2, -bh / 2);
    shape.lineTo(bw / 2 * 0.72, bh / 2);
    shape.lineTo(-bw / 2 * 0.72, bh / 2);
    shape.closePath();
    const geo = new T.ExtrudeGeometry(shape, { extrudePath: path, steps: bladeSteps, bevelEnabled: false });
    part(T, host, geo, sleeve ? sleeveMat : steel, { name: 'blade' + b });

    // hardfacing inserts pressed into the gauge face of each blade
    const nIns = low ? 4 : Math.max(5, Math.round(bladeMm / 26));
    for (let i = 0; i < nIns; i++) {
      const t = (i + 0.5) / nIns;
      const p = path.getPoint(t);
      const rad = Math.hypot(p.x, p.z) || 1;
      inserts.push({
        x: p.x / rad * Rb * 0.985, y: p.y, z: p.z / rad * Rb * 0.985,
        nx: p.x / rad, ny: 0, nz: p.z / rad,
        dia: mm(bladeMm * 0.055), kind: 'flat', gauge: true, protrusion: 0.45,
      });
    }
    // the tapered lead-in each end of the blade, so it does not hang up
    for (const [yy, sgn] of [[bladeTop, 1], [bladeBot, -1]]) {
      const a = phase + (sgn > 0 ? 0 : wrapDeg * DEG);
      part(T, host, G.box(T, mm(bladeMm) * 0.15, mm(bladeMm) * 0.20, (Rb - Rm)), sleeve ? sleeveMat : steel, {
        p: [Math.cos(a) * (Rm + Rb) * 0.5, yy + sgn * mm(bladeMm) * 0.09, Math.sin(a) * (Rm + Rb) * 0.5],
        r: [0, -a, sgn * 0.42], cast: false,
      });
    }
  }
  studFace(T, ctx, host, inserts, {
    wear: wear, seg: low ? 6 : 8, mat: hard,
    lostGeo: (b) => socketGeometry(T, { dia: b.dia, seg: low ? 6 : 8 }),
  });

  return finalise(T, g, {
    id: 'stabiliser', family: 'Drill String & Rods / Accessories',
    name: 'Drillity ' + (sleeve ? 'Sleeve' : 'Integral-Blade') + ' Stabiliser ' + bladeMm.toFixed(1) + ' mm',
    gaugeMm: bladeMm, bodyOdMm: bodyMm, lengthMm: Math.round(L * 1000),
    blades: blades, bladeWrapDeg: wrapDeg, type: sleeve ? 'Replaceable sleeve' : 'Integral blade',
    connection: c.label, connectionFamily: c.family,
    hardfacing: 'Pressed tungsten-carbide inserts on gauge',
    material: sleeve ? '4145H mandrel, replaceable 4145H sleeve' : 'One-piece 4145H mod forging',
    method: 'oil-rotary', priceEur: Math.round((sleeve ? 3200 : 4600) + bladeMm * 15),
  }, opts);
}

/* ── BOP STACK ────────────────────────────────────────────────────────────
   Well control. Annular on top (seals on anything, including open hole),
   then ram preventers: pipe rams that close on the pipe, blind-shear rams at
   the bottom that cut it. Modelled at machine scale, hanging from its top
   flange face so it lands under a rig floor the way the real stack does.
   ───────────────────────────────────────────────────────────────────────── */
/**
 * A ring of hex nuts as ordinary merged geometry. boltRing() makes an
 * InstancedMesh, which is right for a bit but wrong here: a BOP stack has six
 * studded flanges, and six InstancedMeshes is six draw calls the rig it is
 * bolted under cannot spare.
 */
function flangeNuts(T, ctx, g, o) {
  const count = o.count || 12;
  const r = o.radius;
  const af = o.acrossFlats || mm(58);
  const h = o.height || mm(70);
  const mat = o.mat || material(ctx, 'wornSteel');
  for (let i = 0; i < count; i++) {
    const a = (o.phase || 0) + (i / count) * TAU;
    part(T, g, G.cyl(T, af * 0.577, af * 0.577, h, 6), mat, {
      p: [Math.cos(a) * r, o.y || 0, Math.sin(a) * r], r: [0, a, 0], cast: false,
    });
  }
  return g;
}

function studdedFlange(T, ctx, g, o) {
  const R = o.r;
  const y = o.y;
  const h = o.h === undefined ? 0.13 : o.h;
  const seg = o.seg || 20;
  part(T, g, G.cyl(T, R, R, h, seg), o.mat, { p: [0, y, 0] });
  flangeNuts(T, ctx, g, {
    count: o.bolts || 12, radius: R * 0.84, y: y + h * 0.5 + 0.035,
    acrossFlats: 0.058, height: 0.07, mat: o.boltMat,
  });
  return g;
}

export function buildBOPStack(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const boreMm = opts.boreMm || 346.1;             // 13 5/8 in nominal bore
  const bar = opts.pressureBar || 345;             // 5 000 psi
  const rams = clampv(Math.round(opts.rams === undefined ? 3 : opts.rams), 1, 4);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const wear = clamp01(opts.wear || 0);
  const k = clampv(Math.pow(boreMm / 346.1, 0.9), 0.6, 1.6);

  const g = new T.Group();
  g.name = 'bop-stack';
  const paint = wearMaterial(ctx, 'paintedSteel', wear * 0.45,
    { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const cast = material(ctx, 'wornSteel');
  const steel = material(ctx, 'rawSteel');
  const worn = material(ctx, 'wornSteel');
  const chrome = material(ctx, 'chrome');
  const accent = material(ctx, 'paintedSteel', { color: 0x3F92A6, roughness: 0.5, metalness: 0.34 });
  const R = 0.62 * k;                               // body radius
  const Rf = 0.80 * k;                              // flange radius
  const bore = mm(boreMm) * 0.5;

  let y = 0;
  // ── top flange onto the bell nipple / flow spool ──
  studdedFlange(T, ctx, g, { r: Rf, y: y - 0.07, h: 0.14, seg: seg, mat: worn, boltMat: worn, bolts: low ? 8 : 16 });
  y -= 0.14;

  // ── annular preventer: the domed head is its signature ──
  const annH = 1.28 * k;
  part(T, g, G.lathe(T, [
    [bore, y], [R * 0.72, y], [R * 1.02, y - 0.16],
    [R * 1.10, y - annH * 0.42], [R * 1.05, y - annH * 0.74],
    [R * 1.14, y - annH * 0.80], [R * 1.14, y - annH],
    [bore, y - annH],
  ], seg, true), paint, { name: 'annular' });
  // the head clamp bolts that hold the piston head down
  flangeNuts(T, ctx, g, {
    count: low ? 8 : 14, radius: R * 0.95, y: y - 0.14, acrossFlats: 0.062, height: 0.075, mat: worn,
  });
  // closing-line ports
  for (let i = 0; i < 2; i++) {
    const a = i * Math.PI + 0.6;
    part(T, g, radialAxis(G.cyl(T, 0.055, 0.055, 0.16, low ? 8 : 12), a), steel, {
      p: [Math.cos(a) * R * 1.12, y - annH * 0.55, Math.sin(a) * R * 1.12],
    });
  }
  y -= annH;
  studdedFlange(T, ctx, g, { r: Rf, y: y - 0.08, h: 0.16, seg: seg, mat: worn, boltMat: worn, bolts: low ? 8 : 16 });
  y -= 0.16;
  const annularBottom = y;

  // ── ram preventers ──
  const ramH = 0.92 * k;
  const bodyW = R * 1.16;
  for (let r = 0; r < rams; r++) {
    const dbl = r === 0 && rams >= 3;               // top one is a double
    const h = dbl ? ramH * 1.85 : ramH;
    part(T, g, G.lathe(T, [
      [bore, y], [bodyW, y], [bodyW, y - h], [bore, y - h],
    ], seg, true), paint, { name: 'ram-body' + r });
    // bonnets + operating cylinders each side (this is what says "ram BOP")
    const cavities = dbl ? 2 : 1;
    for (let cIdx = 0; cIdx < cavities; cIdx++) {
      const cy = y - h * (cavities === 2 ? (0.30 + cIdx * 0.42) : 0.5);
      for (let s = -1; s <= 1; s += 2) {
        const bx = s * bodyW;
        part(T, g, G.box(T, 0.30 * k, 0.52 * k, 0.62 * k), cast, { p: [bx + s * 0.15 * k, cy, 0] });
        part(T, g, G.cyl(T, 0.20 * k, 0.20 * k, 0.56 * k, seg), paint, {
          p: [bx + s * 0.58 * k, cy, 0], r: [0, 0, Math.PI / 2],
        });
        part(T, g, G.cyl(T, 0.225 * k, 0.225 * k, 0.06, seg), worn, {
          p: [bx + s * 0.87 * k, cy, 0], r: [0, 0, Math.PI / 2],
        });
        // the locking screw sticking out the back of every ram bonnet
        part(T, g, G.cyl(T, 0.045, 0.045, 0.30 * k, low ? 6 : 10), chrome, {
          p: [bx + s * 1.05 * k, cy, 0], r: [0, 0, Math.PI / 2],
        });
        part(T, g, G.cyl(T, 0.09, 0.09, 0.07, 6), worn, {
          p: [bx + s * 1.22 * k, cy, 0], r: [0, 0, Math.PI / 2],
        });
        // hinge bolts on the bonnet flange
        for (let b = 0; b < 4; b++) {
          part(T, g, G.cyl(T, 0.026, 0.026, 0.10, 6), worn, {
            p: [bx + s * 0.06, cy + (b < 2 ? 1 : -1) * 0.20 * k, (b % 2 ? 1 : -1) * 0.24 * k],
            r: [0, 0, Math.PI / 2], cast: false,
          });
        }
      }
    }
    // ram-position indicator plate
    part(T, g, G.box(T, 0.24, 0.16, 0.02), accent, { p: [0, y - h * 0.5, bodyW + 0.012], cast: false });
    y -= h;
    studdedFlange(T, ctx, g, { r: Rf * 0.96, y: y - 0.07, h: 0.14, seg: seg, mat: worn, boltMat: worn, bolts: low ? 8 : 14 });
    y -= 0.14;

    // ── drilling spool with choke and kill outlets, under the first ram ──
    if (r === 0) {
      const spH = 0.66 * k;
      part(T, g, G.lathe(T, [
        [bore, y], [R * 0.96, y], [R * 0.96, y - spH], [bore, y - spH],
      ], seg, true), paint, { name: 'drilling-spool' });
      for (let s = -1; s <= 1; s += 2) {
        const outY = y - spH * 0.5;
        part(T, g, G.cyl(T, 0.16 * k, 0.16 * k, 0.70 * k, seg), steel, {
          p: [s * (R * 0.96 + 0.34 * k), outY, 0], r: [0, 0, Math.PI / 2],
        });
        part(T, g, G.cyl(T, 0.24 * k, 0.24 * k, 0.10, seg), worn, {
          p: [s * (R * 0.96 + 0.69 * k), outY, 0], r: [0, 0, Math.PI / 2],
        });
        // gate valve with its handwheel — choke side and kill side
        part(T, g, G.roundedBox(T, 0.30 * k, 0.44 * k, 0.34 * k, 0.03, 2), cast, {
          p: [s * (R * 0.96 + 0.90 * k), outY, 0],
        });
        part(T, g, G.cyl(T, 0.04, 0.04, 0.34 * k, low ? 6 : 10), chrome, {
          p: [s * (R * 0.96 + 0.90 * k), outY + 0.38 * k, 0],
        });
        part(T, g, G.torus(T, 0.15 * k, 0.022, 5, low ? 12 : 18), worn, {
          p: [s * (R * 0.96 + 0.90 * k), outY + 0.55 * k, 0],
        });
        for (let sp = 0; sp < 4; sp++) {
          part(T, g, G.cyl(T, 0.011, 0.011, 0.30 * k, 5), worn, {
            p: [s * (R * 0.96 + 0.90 * k), outY + 0.55 * k, 0],
            r: [0, 0, Math.PI / 2 + (sp / 4) * Math.PI], cast: false,
          });
        }
      }
      y -= spH;
      studdedFlange(T, ctx, g, { r: Rf * 0.96, y: y - 0.07, h: 0.14, seg: seg, mat: worn, boltMat: worn, bolts: low ? 8 : 14 });
      y -= 0.14;
    }
  }

  // ── hydraulic control lines down the back of the stack ──
  const lines = [];
  for (let i = 0; i < (low ? 2 : 4); i++) {
    lines.push([
      [-R * 1.20 - i * 0.05, annularBottom + 0.10, -R * 0.55],
      [-R * 1.26 - i * 0.05, annularBottom - 0.9, -R * 0.66],
      [-R * 1.22 - i * 0.05, y + 0.7, -R * 0.60],
      [-R * 1.10 - i * 0.05, y + 0.12, -R * 0.40],
    ]);
  }
  for (const pts of lines) {
    part(T, g, G.tube(T, pts, 0.020, low ? 10 : 16, low ? 5 : 7), material(ctx, 'hose'), { cast: false });
  }
  // hazard striping and the Drillity plate on the annular
  part(T, g, G.box(T, 0.52, 0.13, 0.012), material(ctx, 'brandedPanel'), {
    p: [0, annularBottom + annH * 0.62, R * 1.12], cast: false,
  });
  part(T, g, G.box(T, 0.60, 0.10, 0.012), material(ctx, 'safetyStripe'), {
    p: [0, annularBottom + annH * 0.42, R * 1.11], cast: false,
  });

  return finalise(T, g, {
    id: 'bop-stack', family: 'Downhole & Well / BOP & Well Control',
    name: 'Drillity Wellguard ' + Math.round(bar / 68.95) + 'K ' + boreMm.toFixed(1) + ' mm',
    boreMm: boreMm, workingPressureBar: bar,
    stack: 'Annular + ' + rams + ' ram preventers + drilling spool',
    rams: 'Pipe rams, variable-bore rams, blind-shear rams',
    outlets: 'Choke and kill, flanged and valved',
    control: 'Accumulator-driven hydraulic, remote and driller panels',
    heightM: Math.round(-y * 100) / 100,
    material: 'Forged low-alloy steel bodies, ring-joint flanges',
    method: 'oil-rotary', priceEur: Math.round(280000 + bar * 900),
  }, opts);
}

/* ── WELLHEAD / CASING HEAD ───────────────────────────────────────────────
   What the BOP bolts onto and what the casing hangs in. Compact on purpose:
   the interesting part of a wellhead is the bowl, the lockdown screws and the
   valved side outlets.
   ───────────────────────────────────────────────────────────────────────── */
export function buildWellhead(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const casingMm = opts.casingOdMm || 339.7;       // 13 3/8 in surface casing
  const bar = opts.pressureBar || 345;
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const wear = clamp01(opts.wear || 0);
  const k = clampv(Math.pow(casingMm / 339.7, 0.85), 0.6, 1.5);

  const g = new T.Group();
  g.name = 'wellhead';
  const cast = material(ctx, 'wornSteel');
  const paint = wearMaterial(ctx, 'paintedSteel', wear * 0.45,
    { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const steel = material(ctx, 'rawSteel');
  const worn = material(ctx, 'wornSteel');
  const chrome = material(ctx, 'chrome');
  const R = 0.44 * k;
  const Rf = 0.56 * k;
  const bore = mm(casingMm) * 0.5 * 0.86;

  // ── top flange (the BOP lands here) ──
  studdedFlange(T, ctx, g, { r: Rf, y: -0.08, h: 0.16, seg: seg, mat: worn, boltMat: worn, bolts: low ? 8 : 16 });
  // ── casing head spool ──
  part(T, g, G.lathe(T, [
    [bore, -0.16], [R, -0.16], [R, -0.72 * k], [R * 1.08, -0.78 * k],
    [R * 1.08, -0.90 * k], [bore * 1.06, -0.90 * k],
  ], seg, true), paint, { name: 'casing-head' });
  // lockdown / landing screws around the bowl, each on its own radius
  const nScrew = low ? 4 : 8;
  for (let i = 0; i < nScrew; i++) {
    const a = (i / nScrew) * TAU;
    part(T, g, radialAxis(G.cyl(T, 0.036, 0.036, 0.20 * k, low ? 6 : 10), a), chrome, {
      p: [Math.cos(a) * (R + 0.10 * k), -0.34 * k, Math.sin(a) * (R + 0.10 * k)],
    });
    part(T, g, radialAxis(G.cyl(T, 0.062, 0.062, 0.06, 6), a), worn, {
      p: [Math.cos(a) * (R + 0.21 * k), -0.34 * k, Math.sin(a) * (R + 0.21 * k)],
    });
  }

  // ── two valved side outlets ──
  for (let s = -1; s <= 1; s += 2) {
    const outY = -0.56 * k;
    part(T, g, G.cyl(T, 0.085 * k, 0.085 * k, 0.52 * k, seg), steel, {
      p: [s * (R + 0.26 * k), outY, 0], r: [0, 0, Math.PI / 2],
    });
    part(T, g, G.roundedBox(T, 0.22 * k, 0.30 * k, 0.24 * k, 0.02, 2), cast, {
      p: [s * (R + 0.60 * k), outY, 0],
    });
    part(T, g, G.cyl(T, 0.028, 0.028, 0.24 * k, low ? 6 : 8), chrome, {
      p: [s * (R + 0.60 * k), outY + 0.26 * k, 0],
    });
    part(T, g, G.torus(T, 0.105 * k, 0.017, 5, low ? 10 : 16), worn, {
      p: [s * (R + 0.60 * k), outY + 0.38 * k, 0],
    });
  }
  // ── the conductor / surface casing stub it sits on ──
  part(T, g, G.lathe(T, [
    [bore * 1.06, -0.90 * k], [mm(casingMm) * 0.5, -0.90 * k],
    [mm(casingMm) * 0.5, -1.35 * k], [bore * 1.06, -1.35 * k],
  ], seg, true), worn, { name: 'casing-stub' });
  part(T, g, weldBead(T, mm(casingMm) * 0.5 * 1.004, mm(9), low ? 16 : 26), worn, { p: [0, -0.90 * k, 0], cast: false });
  part(T, g, G.box(T, 0.40, 0.10, 0.012), material(ctx, 'brandedPanel'), { p: [0, -0.24 * k, R * 1.02], cast: false });

  return finalise(T, g, {
    id: 'wellhead', family: 'Downhole & Well / Wellhead & Completion',
    name: 'Drillity Wellhead ' + casingMm.toFixed(1) + ' mm Casing Head',
    casingOdMm: casingMm, workingPressureBar: bar,
    bowl: 'Landing bowl with lockdown screws',
    outlets: '2 x flanged and valved side outlets',
    sealing: 'Metal-to-metal ring joint, secondary elastomer',
    material: 'Forged low-alloy steel body',
    method: 'oil-rotary', priceEur: Math.round(24000 + casingMm * 90),
  }, opts);
}

/* ── MUD MOTOR ────────────────────────────────────────────────────────────
   A positive-displacement motor. Mud through the lobed power section turns
   the rotor; the transmission takes the eccentric motion out, the ADJUSTABLE
   BENT HOUSING sets the build rate, and the bearing pack carries the bit.
   ───────────────────────────────────────────────────────────────────────── */
export function buildMudMotor(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.odMm || 171.5;                 // 6 3/4 in
  const lobes = opts.lobes || '7:8';
  const stages = opts.stages || 5;
  const bendDeg = opts.bendDeg === undefined ? 1.5 : opts.bendDeg;
  const connId = opts.connection || (odMm >= 200 ? 'NC56' : odMm >= 160 ? 'NC50' : 'NC38');
  const bitConn = opts.bitConnection || (odMm >= 200 ? 'REG658' : odMm >= 160 ? 'REG412' : 'REG312');
  const c = rotaryConnection(connId);
  const cb = rotaryConnection(bitConn);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 22;
  const R = mm(odMm) * 0.5;
  const L = mm(opts.lengthMm || Math.round(odMm * 48));

  const g = new T.Group();
  g.name = 'mud-motor';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.5);
  const paint = material(ctx, 'paintedSteel', { color: 0x2E3742, roughness: 0.58, metalness: 0.36 });
  const worn = material(ctx, 'wornSteel');
  const rub = material(ctx, 'rubber');
  const chrome = material(ctx, 'chrome');
  const hard = wearMaterial(ctx, 'carbide', wear);

  const boxLen = mm(c.pinMm) + mm(20);
  // ── top sub with the dump valve ──
  part(T, g, G.lathe(T, [
    [mm(c.boreMm) * 0.5, 0], [mm(c.odMm) * 0.5 * 0.99, 0], [mm(c.odMm) * 0.5, -mm(18)],
    [mm(c.odMm) * 0.5, -boxLen], [R, -boxLen - mm(60)], [R, -mm(760)],
    [mm(c.boreMm) * 0.5, -mm(760)], [mm(c.boreMm) * 0.5, 0],
  ], seg, true), steel, { name: 'top-sub' });
  addRotaryBox(T, ctx, g, connId, { y0: 0, low: low, mat: worn });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    flushHole(T, ctx, g, {
      x: Math.cos(a) * R, y: -mm(520), z: Math.sin(a) * R, r: mm(11),
      dir: [Math.cos(a), 0, Math.sin(a)], seg: low ? 7 : 10, chamferMat: worn,
    });
  }

  // ── power section: the long housing, with the lobe count stencilled on ──
  const powTop = -mm(760);
  const powLen = L * 0.46;
  part(T, g, G.lathe(T, [
    [R * 0.62, powTop], [R, powTop], [R, powTop - powLen], [R * 0.62, powTop - powLen],
  ], seg, true), paint, { name: 'power-section' });
  // the elastomer stator shows at the ends of the housing
  part(T, g, G.cyl(T, R * 0.68, R * 0.68, mm(70), seg), rub, { p: [0, powTop - mm(40), 0], cast: false });
  part(T, g, G.cyl(T, R * 0.68, R * 0.68, mm(70), seg), rub, { p: [0, powTop - powLen + mm(40), 0], cast: false });
  for (let i = 0; i < (low ? 2 : 4); i++) {
    part(T, g, G.cyl(T, R * 1.004, R * 1.004, mm(70), seg), material(ctx, 'safetyStripe'), {
      p: [0, powTop - powLen * (0.16 + i * 0.22), 0], cast: false,
    });
  }
  // housing wrench flats where it is broken out
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(6), mm(220), R * 1.4), worn, {
      p: [Math.cos(i * Math.PI) * R * 0.94, powTop - powLen + mm(180), 0], r: [0, i * Math.PI, 0], cast: false,
    });
  }

  // ── transmission housing ──
  const trTop = powTop - powLen;
  const trLen = L * 0.16;
  part(T, g, G.lathe(T, [
    [R * 0.60, trTop], [R * 0.96, trTop], [R * 0.96, trTop - trLen], [R * 0.60, trTop - trLen],
  ], seg, true), steel, { name: 'transmission' });

  // ── the adjustable bent housing: everything below it kicks over ──
  const bendY = trTop - trLen;
  part(T, g, profiledLathe(T, [
    [R * 0.62, bendY + mm(10)], [R * 1.02, bendY], [R * 1.02, bendY - mm(150)], [R * 0.62, bendY - mm(160)],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (r < R * 0.8) return 1;
      const a = ((th * 24) % TAU + TAU) % TAU;      // the adjustment serrations
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.022 * Math.max(0, 1 - d * 2.0);
    },
  }), worn, { name: 'bend-ring' });
  part(T, g, G.box(T, mm(26), mm(60), mm(10)), material(ctx, 'safetyStripe'), {
    p: [0, bendY - mm(74), R * 1.02], cast: false,
  });

  const lower = group(T, g, 'below-bend', { p: [0, bendY - mm(160), 0], r: [0, 0, bendDeg * DEG] });
  // ── bearing housing ──
  const brLen = L * 0.24;
  part(T, lower, G.lathe(T, [
    [R * 0.58, 0], [R * 0.96, 0], [R * 0.96, -brLen * 0.62],
    [R * 0.90, -brLen * 0.66], [R * 0.90, -brLen], [R * 0.58, -brLen],
  ], seg, true), steel, { name: 'bearing-housing' });
  // integral sleeve stabiliser on the bearing housing (the near-bit gauge)
  const stabY = -brLen * 0.30;
  const gaugeR = mm(opts.stabGaugeMm || odMm * 1.22) * 0.5 - mm(3) * wear;
  const pads = [];
  for (let b = 0; b < 3; b++) {
    const phase = (b / 3) * TAU;
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const a = phase + t * 0.9;
      const rr = (R * 0.96 + gaugeR) * 0.5;
      pts.push(new T.Vector3(Math.cos(a) * rr, stabY - t * brLen * 0.34, Math.sin(a) * rr));
    }
    const path = new T.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const shape = new T.Shape();
    const bw = mm(odMm) * 0.17;
    const bh = (gaugeR - R * 0.96) * 2;
    shape.moveTo(-bw / 2, -bh / 2); shape.lineTo(bw / 2, -bh / 2);
    shape.lineTo(bw / 2 * 0.7, bh / 2); shape.lineTo(-bw / 2 * 0.7, bh / 2);
    shape.closePath();
    part(T, lower, new T.ExtrudeGeometry(shape, { extrudePath: path, steps: low ? 6 : 12, bevelEnabled: false }), steel, {
      name: 'stab-blade' + b,
    });
    for (let i = 0; i < (low ? 3 : 5); i++) {
      const p = path.getPoint((i + 0.5) / (low ? 3 : 5));
      const rad = Math.hypot(p.x, p.z) || 1;
      pads.push({
        x: p.x / rad * gaugeR * 0.98, y: p.y, z: p.z / rad * gaugeR * 0.98,
        nx: p.x / rad, ny: 0, nz: p.z / rad, dia: mm(odMm * 0.06), kind: 'flat', gauge: true, protrusion: 0.42,
      });
    }
  }
  studFace(T, ctx, lower, pads, { wear: wear, seg: low ? 6 : 8, mat: hard });

  // ── drive sub with the bit box ──
  const pinY = -brLen - mm(300);
  part(T, lower, G.lathe(T, [
    [mm(cb.boreMm) * 0.5, -brLen], [mm(cb.odMm) * 0.5 * 0.92, -brLen],
    [mm(cb.odMm) * 0.5, -brLen - mm(60)], [mm(cb.odMm) * 0.5, pinY],
    [mm(cb.boreMm) * 0.5, pinY], [mm(cb.boreMm) * 0.5, -brLen],
  ], seg, true), steel, { name: 'drive-sub' });
  addRotaryPin(T, ctx, lower, bitConn, {
    y0: pinY, shoulderR: mm(cb.odMm) * 0.5, low: low, mat: steel, wornMat: worn,
  });
  part(T, lower, G.cyl(T, R * 0.30, R * 0.30, mm(120), low ? 8 : 14), chrome, { p: [0, -brLen * 0.5, 0], cast: false });

  return finalise(T, g, {
    id: 'mud-motor', family: 'Downhole & Well / Directional Drilling / Mud Motors',
    name: 'Drillity Torqueline PDM ' + odMm.toFixed(1) + ' mm ' + lobes,
    odMm: odMm, lobes: lobes, stages: stages,
    bendDeg: bendDeg, bendType: 'Surface-adjustable, 0-3 deg',
    lengthMm: Math.round(L * 1000),
    connection: c.label, bitConnection: cb.label,
    flowRangeLpm: Math.round(odMm * 3.4) + '-' + Math.round(odMm * 9.2),
    material: 'Chrome-plated rotor, nitrile stator, 4145H housings',
    method: 'oil-rotary', priceEur: Math.round(38000 + odMm * 340),
  }, opts);
}

/* ── MWD COLLAR ───────────────────────────────────────────────────────────
   A non-magnetic collar carrying the survey and telemetry tools. The side
   pocket with its screwed access door is the giveaway; the mud pulser is in
   the bore at the bottom end.
   ───────────────────────────────────────────────────────────────────────── */
export function buildMWDCollar(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const odMm = opts.odMm || 171.5;
  const idMm = opts.idMm || 71.4;
  const lenMm = opts.lengthMm || 9140;
  const connId = opts.connection || (odMm >= 200 ? 'NC56' : odMm >= 160 ? 'NC50' : 'NC38');
  const c = rotaryConnection(connId);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const L = mm(lenMm);
  const R = mm(odMm) * 0.5 - mm(1.8) * wear;
  const Ri = mm(idMm) * 0.5;

  const g = new T.Group();
  g.name = 'mwd-collar';
  // non-magnetic drill collar steel reads brighter and less "blue" than 4145H
  const nonmag = wearMaterial(ctx, 'rawSteel', wear * 0.35, { color: 0xA6ADB4, roughness: 0.36, metalness: 0.88 });
  const worn = material(ctx, 'wornSteel');
  const dark = material(ctx, '__paintDark');
  const chrome = material(ctx, 'chrome');
  const glass = material(ctx, 'plastic');

  const boxLen = mm(c.pinMm) + mm(16);
  const pinLen = mm(c.pinMm);
  part(T, g, G.lathe(T, [
    [Ri, 0], [mm(c.odMm) * 0.5 * 0.99, 0], [R, -mm(26)],
    [R, -L + pinLen + mm(120)], [R * 0.93, -L + pinLen + mm(50)],
    [mm(c.odMm) * 0.5 * 0.90, -L + pinLen],
    [Ri, -L + pinLen], [Ri, 0],
  ], seg, true), nonmag, { name: 'collar' });
  addRotaryBox(T, ctx, g, connId, { y0: 0, low: low, mat: worn });
  addRotaryPin(T, ctx, g, connId, { y0: -L + pinLen, shoulderR: mm(c.odMm) * 0.5 * 0.90, low: low, mat: nonmag, wornMat: worn });

  // ── the instrument side pocket and its screwed-down door ──
  const pockY = -L * 0.40;
  const pockH = L * 0.22;
  part(T, g, G.box(T, R * 0.72, pockH, mm(24)), dark, { p: [0, pockY, R * 0.92], cast: false });
  part(T, g, G.box(T, R * 0.62, pockH * 0.94, mm(18)), worn, { p: [0, pockY, R * 0.97] });
  const screws = low ? 6 : 12;
  for (let i = 0; i < screws; i++) {
    const s = i < screws / 2 ? -1 : 1;
    const t = (i % (screws / 2)) / (screws / 2 - 1);
    part(T, g, G.cyl(T, mm(9), mm(9), mm(8), 6), chrome, {
      p: [s * R * 0.27, pockY + lerp(-pockH * 0.44, pockH * 0.44, t), R * 1.03],
      r: [Math.PI / 2, 0, 0], cast: false,
    });
  }
  // pressure ports + the two window slots the sensors look through
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(28), mm(130), mm(8)), glass, {
      p: [(i ? 1 : -1) * R * 0.52, pockY - pockH * 0.62, R * 0.82], r: [0, (i ? 1 : -1) * -0.5, 0], cast: false,
    });
  }
  // stencilled band + serial plate
  part(T, g, G.cyl(T, R * 1.005, R * 1.005, mm(90), seg), material(ctx, 'safetyStripe'), {
    p: [0, -boxLen - mm(60), 0], cast: false,
  });
  part(T, g, G.box(T, R * 0.9, mm(90), mm(6)), material(ctx, 'brandedPanel'), {
    p: [0, -boxLen - mm(230), R * 0.97], cast: false,
  });

  // ── integral sleeve stabiliser so the tool runs on gauge ──
  const gaugeR = mm(opts.stabGaugeMm || odMm * 1.20) * 0.5 - mm(3) * wear;
  const stabY = -L * 0.70;
  for (let b = 0; b < 3; b++) {
    const a = (b / 3) * TAU;
    const pts = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      const aa = a + t * 0.75;
      const rr = (R + gaugeR) * 0.5;
      pts.push(new T.Vector3(Math.cos(aa) * rr, stabY - t * L * 0.06, Math.sin(aa) * rr));
    }
    const path = new T.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const shape = new T.Shape();
    const bw = mm(odMm) * 0.16;
    const bh = (gaugeR - R) * 2;
    shape.moveTo(-bw / 2, -bh / 2); shape.lineTo(bw / 2, -bh / 2);
    shape.lineTo(bw / 2 * 0.7, bh / 2); shape.lineTo(-bw / 2 * 0.7, bh / 2);
    shape.closePath();
    part(T, g, new T.ExtrudeGeometry(shape, { extrudePath: path, steps: low ? 5 : 10, bevelEnabled: false }), nonmag, {
      name: 'stab' + b,
    });
  }

  // ── the mud pulser, sitting in the bore at the bottom of the tool ──
  const pulseY = -L + pinLen + mm(420);
  part(T, g, G.lathe(T, [
    [mm(8), pulseY + mm(260)], [Ri * 0.72, pulseY + mm(230)],
    [Ri * 0.72, pulseY - mm(180)], [Ri * 0.42, pulseY - mm(250)], [mm(8), pulseY - mm(255)],
  ], low ? 10 : 16, true), dark, { name: 'pulser' });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    part(T, g, G.box(T, mm(16), mm(120), mm(30)), chrome, {
      p: [Math.cos(a) * Ri * 0.66, pulseY + mm(40), Math.sin(a) * Ri * 0.66], r: [0, -a, 0], cast: false,
    });
  }

  return finalise(T, g, {
    id: 'mwd-collar', family: 'Downhole & Well / Directional Drilling / MWD-LWD',
    name: 'Drillity Signal MWD Collar ' + odMm.toFixed(1) + ' mm',
    odMm: odMm, idMm: idMm, lengthMm: lenMm,
    connection: c.label, connectionFamily: c.family,
    telemetry: 'Positive mud-pulse',
    measurements: 'Inclination, azimuth, tool face, gamma, downhole WOB and torque',
    housing: 'Non-magnetic collar, screwed side-pocket access',
    maxTempC: 150, maxPressureBar: 1380,
    material: 'Non-magnetic chrome-manganese steel',
    method: 'oil-rotary', priceEur: Math.round(96000 + odMm * 210),
  }, opts);
}

/* ── SHALE SHAKER ─────────────────────────────────────────────────────────
   The first thing the returns hit. Linear-motion basket on springs, screen
   decks in a cascade, cuttings off the end, mud through into the pit.
   Machine scale in metres, hung from y=0 like the rest of the plant.
   ───────────────────────────────────────────────────────────────────────── */
export function buildShaleShaker(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const decks = clampv(Math.round(opts.decks === undefined ? 3 : opts.decks), 1, 4);
  const lpm = opts.capacityLpm || 4500;
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const k = clampv(Math.pow(lpm / 4500, 0.28), 0.75, 1.35);
  const W = 1.72 * k;
  const D = 3.30 * k;
  const H = 1.55 * k;
  const slope = 3.5 * DEG;

  const g = new T.Group();
  g.name = 'shale-shaker';
  const paint = material(ctx, 'paintedSteel');
  const dark = material(ctx, 'paintedSteel', { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const black = material(ctx, 'paintedSteel', { color: 0x14181D, roughness: 0.68, metalness: 0.28 });
  const steel = material(ctx, 'wornSteel');
  const worn = material(ctx, 'wornSteel');
  const rub = black;
  const mud = material(ctx, '__mud');

  // ── skid + collection pan under the basket ──
  part(T, g, G.box(T, W * 1.10, 0.10, D * 1.02), dark, { p: [0, -H + 0.05, 0] });
  for (let s = -1; s <= 1; s += 2) {
    part(T, g, G.box(T, 0.09, 0.20, D * 1.02), dark, { p: [s * (W * 0.55 - 0.05), -H + 0.18, 0] });
  }
  part(T, g, G.box(T, W * 0.98, 0.42, D * 0.70), dark, { p: [0, -H + 0.36, -D * 0.10] });
  part(T, g, G.box(T, W * 0.90, 0.03, D * 0.62), mud, { p: [0, -H + 0.56, -D * 0.10], cast: false });
  // discharge chute off the front
  part(T, g, G.box(T, W * 0.86, 0.05, 0.62), worn, { p: [0, -H + 0.30, D * 0.52], r: [-0.45, 0, 0] });
  for (let s = -1; s <= 1; s += 2) {
    part(T, g, G.box(T, 0.04, 0.26, 0.62), worn, { p: [s * W * 0.43, -H + 0.40, D * 0.52], r: [-0.45, 0, 0], cast: false });
  }

  // ── the vibrating basket (dynamic: the rig shakes it) ──
  const basket = group(T, g, 'basket', { p: [0, -H * 0.42, 0], r: [slope, 0, 0], dynamic: true });
  part(T, basket, G.box(T, W, 0.10, D * 0.94), dark, { p: [0, -0.30, 0] });
  for (let s = -1; s <= 1; s += 2) {
    part(T, basket, G.box(T, 0.07, 0.60, D * 0.94), paint, { p: [s * (W * 0.5 - 0.03), 0, 0] });
    part(T, basket, G.box(T, 0.05, 0.16, D * 0.94), dark, {
      p: [s * (W * 0.5 + 0.02), 0.24, 0], cast: false,
    });
  }
  part(T, basket, G.box(T, W, 0.60, 0.07), paint, { p: [0, 0, -D * 0.47] });
  // screen decks: tensioned panels in a cascade
  for (let d = 0; d < decks; d++) {
    const yy = 0.20 - d * (0.34 / Math.max(1, decks - 1 || 1));
    const zz = -D * 0.28 + d * (D * 0.24);
    part(T, basket, G.box(T, W * 0.90, 0.018, D * 0.30), worn, { p: [0, yy, zz], recv: true });
    if (!low) {
      // the screen cloth itself — fine cross-battens, one instanced batch
      const nb = 11;
      const bat = G.box(T, W * 0.88, 0.008, 0.012);
      const inst = new T.InstancedMesh(bat, steel, nb);
      const dm = new T.Object3D();
      for (let i = 0; i < nb; i++) {
        dm.position.set(0, yy + 0.014, zz + lerp(-D * 0.14, D * 0.14, i / (nb - 1)));
        dm.rotation.set(0, 0, 0); dm.scale.setScalar(1); dm.updateMatrix();
        inst.setMatrixAt(i, dm.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      inst.castShadow = false;
      basket.add(inst);
    }
    // screen tension bolts down each side
    for (let s = -1; s <= 1; s += 2) {
      for (let i = 0; i < 2; i++) {
        part(T, basket, G.cyl(T, 0.022, 0.022, 0.14, 6), worn, {
          p: [s * (W * 0.5 + 0.06), yy + 0.02, zz + (i ? 0.4 : -0.4) * D * 0.14],
          r: [0, 0, Math.PI / 2], cast: false,
        });
      }
    }
    // cuttings riding down the deck
    if (!low && d === decks - 1) {
      for (let i = 0; i < 5; i++) {
        part(T, basket, G.sph(T, 0.035 + (i % 3) * 0.012, 6), mud, {
          p: [lerp(-W * 0.34, W * 0.34, (i * 0.618) % 1), yy + 0.04, zz + lerp(-0.2, 0.2, (i * 0.37) % 1)],
          s: [1, 0.55, 1.2], cast: false,
        });
      }
    }
  }
  // twin vibrator motors bolted to the basket beam
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1;
    part(T, basket, G.box(T, W * 0.34, 0.30, 0.42), paint, { p: [s * W * 0.24, 0.42, -D * 0.12] });
    part(T, basket, G.cyl(T, 0.155, 0.155, W * 0.30, seg), dark, {
      p: [s * W * 0.24, 0.42, -D * 0.12], r: [0, 0, Math.PI / 2],
    });
    part(T, basket, G.cyl(T, 0.09, 0.09, 0.10, seg), worn, {
      p: [s * W * 0.42, 0.42, -D * 0.12], r: [0, 0, Math.PI / 2],
    });
  }
  // possum belly (feeder box) with its weir and overflow
  part(T, basket, G.roundedBox(T, W * 1.02, 0.62, 0.60, 0.04, 2), paint, { p: [0, 0.06, -D * 0.60] });
  part(T, basket, G.box(T, W * 0.86, 0.05, 0.34), worn, { p: [0, 0.34, -D * 0.52], r: [0.35, 0, 0], cast: false });
  part(T, basket, G.cyl(T, 0.115, 0.115, 0.42, seg), steel, { p: [0, 0.10, -D * 0.72], r: [Math.PI / 2, 0, 0] });
  part(T, basket, G.cyl(T, 0.15, 0.15, 0.05, seg), worn, { p: [0, 0.10, -D * 0.90], r: [Math.PI / 2, 0, 0] });

  // ── isolation springs under the basket ──
  for (let i = 0; i < 4; i++) {
    const cx = (i % 2 ? 1 : -1) * W * 0.44;
    const cz = (i < 2 ? -1 : 1) * D * 0.34;
    const pts = [];
    for (let t = 0; t <= 26; t++) {
      const u = t / 26;
      pts.push([Math.cos(u * TAU * 4) * 0.075, -H * 0.42 - 0.30 + u * 0.34, Math.sin(u * TAU * 4) * 0.075]);
    }
    part(T, g, G.tube(T, pts, 0.016, low ? 16 : 28, low ? 4 : 6), steel, {
      p: [cx, 0, cz], name: 'spring' + i, cast: false,
    });
    part(T, g, G.cyl(T, 0.10, 0.10, 0.05, low ? 8 : 12), rub, { p: [cx, -H * 0.42 - 0.31, cz] });
  }

  // ── control panel + handrail on the walk side ──
  part(T, g, G.box(T, 0.36, 0.44, 0.12), dark, { p: [-W * 0.60, -H * 0.45, D * 0.16], r: [0, 0.35, 0] });
  buildScreenPanel(T, ctx, g, {
    // seated on the housing face: centre + outward normal of the 0.35 rad yaw
    w: 0.26, h: 0.18, over: GLOW.panel, bezelMat: black,
    p: [-W * 0.60 + Math.sin(0.35) * 0.066, -H * 0.42, D * 0.16 + Math.cos(0.35) * 0.066],
    r: [0, 0.35, 0], name: 'shaker-hmi', lens: !low,
  });
  part(T, g, G.box(T, W * 0.5, 0.14, 0.012), material(ctx, 'brandedPanel'), {
    p: [0, -H + 0.62, D * 0.52], r: [-0.45, 0, 0], cast: false,
  });

  const out = finalise(T, g, {
    id: 'shale-shaker', family: 'Fluids, Air & Power / Mud & Fluid Systems / Shale Shakers',
    name: 'Drillity Sieveline ' + decks + '-Deck',
    decks: decks, capacityLpm: lpm, motion: 'Linear', gForce: 7.5,
    screenAreaM2: Math.round(W * D * 0.62 * decks * 100) / 100,
    motors: 2, motorKw: Math.round(2.2 * k * 10) / 10,
    material: 'Painted steel basket, pre-tensioned composite screen panels',
    method: 'oil-rotary', priceEur: Math.round(38000 + lpm * 5.4),
  }, opts);
  out.userData.basket = basket;
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   §14 REVERSE CIRCULATION — the sample chain

   RC is the one method where the *sample*, not the hole, is the product. Air
   goes DOWN the annulus between two concentric tubes, crosses at the bit face,
   and the cuttings come back UP the inner tube, sealed from the borehole wall
   the whole way. Everything in this section exists to keep that seal: the
   dual-wall pipe, the shrouded hammer, the centre-ported bit, and then the
   cyclone and splitter that turn a 25 m3/min air stream into a 3 kg bag.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Standard RC dual-wall pipe sizes: outer OD -> inner tube OD, wall. */
const RC_PIPE = {
  89:    { odMm: 88.9,  innerMm: 50.8, wallMm: 8.0,  label: '3 1/2 in' },
  102:   { odMm: 101.6, innerMm: 57.2, wallMm: 8.5,  label: '4 in' },
  114:   { odMm: 114.3, innerMm: 63.5, wallMm: 9.0,  label: '4 1/2 in' },
};

function rcPipeSpec(odMm) {
  let best = RC_PIPE[114];
  let bd = Infinity;
  for (const k of Object.keys(RC_PIPE)) {
    const d = Math.abs(RC_PIPE[k].odMm - odMm);
    if (d < bd) { bd = d; best = RC_PIPE[k]; }
  }
  return best;
}

/**
 * RC dual-wall drill pipe. The whole point of the part is that you can see
 * TWO tubes: the outer pressure tube and the inner sample tube standing proud
 * of it at the pin end, held on circlips and sealed with O-rings.
 * opts: { odMm, lengthMm, wear, lod }
 */
export function buildRCDualWallPipe(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const ps = rcPipeSpec(opts.odMm || 114.3);
  const L = mm(opts.lengthMm || 3000);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const g = new T.Group();
  g.name = 'rc-dual-wall-pipe';

  const ro = mm(ps.odMm) * 0.5;
  const ri = ro - mm(ps.wallMm);
  const inR = mm(ps.innerMm) * 0.5;
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.7);
  const bright = wearMaterial(ctx, 'rawSteel', wear * 0.4);
  const rubber = material(ctx, 'rubber');
  const upset = ro * 1.16;

  // ── outer tube: the pressure member, upset at both tool joints ──────────
  part(T, g, G.lathe(T, [
    [upset, 0], [upset, -mm(150)], [ro, -mm(198)],
    [ro, -L + mm(210)], [upset, -L + mm(160)], [upset, -L],
    [ri, -L], [ri, 0],
  ], seg, true), steel, { name: 'outer-tube' });

  // Box at the top, pin at the bottom. RC joints are coarse, deep and quick
  // to make up — a driller breaks 100 of them a shift.
  const jointDepth = mm(78);
  part(T, g, G.lathe(T, [
    [upset * 0.995, -mm(6)], [upset * 0.995, -mm(150)],
  ], seg, false), bright, { name: 'box-shoulder', cast: false });
  addBoxThread(T, ctx, g, 'API312', { y0: -mm(12), length: jointDepth, quality: low ? 0 : 0.4 });
  addPinThread(T, ctx, g, 'API312', {
    y0: -L + mm(6), length: jointDepth, quality: low ? 0 : 0.4, down: true, mat: bright,
  });

  // ── inner sample tube, standing proud at the pin so the crew can stab it ─
  part(T, g, pipeGeometry(T, {
    od: inR * 2, id: inR * 2 - mm(6), length: L + mm(44), y0: mm(22), seg: low ? 10 : 16,
  }), bright, { name: 'inner-tube' });
  // circlips holding the inner tube, and the O-rings that seal it
  for (const y of [-mm(58), -L + mm(58)]) {
    part(T, g, G.torus(T, inR + mm(3.5), mm(2.6), 4, low ? 10 : 16), bright, {
      p: [0, y, 0], r: [Math.PI / 2, 0, 0], name: 'circlip', cast: false,
    });
    part(T, g, G.torus(T, inR + mm(2.0), mm(3.4), 5, low ? 10 : 18),
      wearMaterial(ctx, 'rubber', wear), {
        p: [0, y - mm(24), 0], r: [Math.PI / 2, 0, 0], name: 'o-ring', cast: false,
      });
  }
  // centralising ribs between the tubes — the annulus is the air path and it
  // has to stay open, so the ribs are three, thin and spiralled.
  const ribs = low ? 3 : 6;
  for (let i = 0; i < ribs; i++) {
    const y = -mm(320) - i * (L - mm(640)) / Math.max(1, ribs - 1);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + i * 0.55;
      part(T, g, G.box(T, (ri - inR) * 0.92, mm(26), mm(9)), steel, {
        p: [Math.cos(a) * (inR + ri) * 0.5, y, Math.sin(a) * (inR + ri) * 0.5],
        r: [0, -a, 0], cast: false,
      });
    }
  }
  // stencilled length band and the wear scar where the rod holder grips it
  part(T, g, G.cyl(T, upset * 1.004, upset * 1.004, mm(52), seg), material(ctx, 'safetyStripe'), {
    p: [0, -mm(232), 0], cast: false, name: 'band',
  });
  if (wear > 0.45) {
    part(T, g, G.cyl(T, ro * 1.002, ro * 1.002, mm(120), seg),
      wearMaterial(ctx, 'rawSteel', wear), { p: [0, -L * 0.5, 0], cast: false, name: 'grip-scar' });
  }

  return finalise(T, g, {
    id: 'rc-dual-wall-pipe',
    family: 'Drill String & Rods / RC & Dual-Wall',
    name: 'Drillity RC Dual-Wall Pipe ' + ps.label + ' x ' + Math.round(L * 1000) + ' mm',
    odMm: ps.odMm, innerTubeOdMm: ps.innerMm, wallMm: ps.wallMm,
    lengthMm: opts.lengthMm || 3000,
    connection: 'Heavy-duty RC box x pin', connectionFamily: 'rotary',
    flowPath: 'Air down the annulus, sample up the inner tube',
    material: 'Outer 42CrMo4(V), inner tube seamless, O-ring sealed',
    method: 'rc', priceEur: Math.round(310 + ps.odMm * 4.6 * ((opts.lengthMm || 3000) / 3000)),
  }, opts);
}

/**
 * RC hammer. A DTH hammer rebuilt around sample transport: the same piston and
 * the same air, but with a sample tube straight up the middle and a SHROUD at
 * the foot that traps the cuttings at the face and forces them inboard instead
 * of letting them up the annulus.
 * opts: { odMm: 82|92|109|116|120|132, wear, lod }
 */
const RC_HAMMER = {
  82:  { lenMm: 1063, kg: 27.0, piston: 5.4,  minBit: 86,  maxBit: 102, airM3: 8.5,  airBar: 13.8 },
  92:  { lenMm: 1146, kg: 40.0, piston: 7.5,  minBit: 102, maxBit: 114, airM3: 25.5, airBar: 24.1 },
  109: { lenMm: 1268, kg: 58.1, piston: 12.0, minBit: 115, maxBit: 127, airM3: 25.5, airBar: 24.1 },
  116: { lenMm: 1185, kg: 66.0, piston: 13.9, minBit: 124, maxBit: 133, airM3: 25.5, airBar: 24.1 },
  120: { lenMm: 1363, kg: 75.2, piston: 17.0, minBit: 127, maxBit: 146, airM3: 25.5, airBar: 24.1 },
  132: { lenMm: 1363, kg: 87.4, piston: 19.2, minBit: 140, maxBit: 146, airM3: 25.5, airBar: 24.1 },
};

export function buildRCHammer(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const keys = Object.keys(RC_HAMMER).map(Number);
  let odMm = opts.odMm || 116;
  odMm = keys.reduce((a, b) => (Math.abs(b - odMm) < Math.abs(a - odMm) ? b : a), keys[0]);
  const h = RC_HAMMER[odMm];
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const R = mm(odMm) * 0.5;
  const L = mm(h.lenMm);
  const sampleR = mm(odMm * 0.24);
  const g = new T.Group();
  g.name = 'rc-hammer';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.8);
  const bright = wearMaterial(ctx, 'rawSteel', wear * 0.5);
  const bore = material(ctx, '__hole', { color: 0x090B0D, roughness: 0.92, metalness: 0.15, side: T.BackSide });

  // ── backhead: check-valve housing, wrench flats, the top sub ────────────
  part(T, g, profiledLathe(T, [
    [sampleR, 0], [R * 0.86, 0], [R * 0.86, -mm(96)], [R * 0.97, -mm(112)],
    [R, -mm(150)], [R, -L + mm(190)], [R * 0.98, -L + mm(150)],
    [R * 0.98, -L + mm(46)], [R * 0.90, -L + mm(30)], [sampleR * 1.5, -L + mm(30)],
    [sampleR * 1.5, -L], [sampleR, -L],
  ], {
    segments: seg,
    // Six wrench flats on the backhead. A hammer is broken out with a chain
    // wrench on these; without them it reads as a plain pipe.
    radiusFn: (th, r, y) => {
      if (y > -mm(4) || y < -mm(100) || r < R * 0.5) return 1;
      const a = ((th * 6) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.055 * Math.max(0, 1 - d * 2.2);
    },
  }), steel, { name: 'case' });
  addPinThread(T, ctx, g, 'API312', { y0: 0, length: mm(84), quality: low ? 0 : 0.5, mat: bright });

  // ── the sample tube, visible straight through the hammer ────────────────
  part(T, g, G.cyl(T, sampleR, sampleR, L, low ? 10 : 16, true), bore, {
    p: [0, -L * 0.5, 0], cast: false, recv: false, name: 'sample-bore',
  });
  part(T, g, G.lathe(T, [
    [sampleR, mm(4)], [sampleR * 1.22, mm(4)], [sampleR * 1.22, -mm(10)], [sampleR, -mm(10)],
  ], low ? 10 : 16, true), bright, { name: 'sample-tube-mouth', cast: false });

  // ── air ports into the annulus, and the porting band ────────────────────
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    flushHole(T, ctx, g, {
      x: Math.cos(a) * R * 0.99, y: -mm(178), z: Math.sin(a) * R * 0.99,
      r: mm(odMm * 0.055), dir: [Math.cos(a), 0, Math.sin(a)], seg: low ? 7 : 10, chamferMat: bright,
    });
  }

  // ── drive chuck + splined bit retention at the foot ─────────────────────
  const chuckY = -L + mm(30);
  part(T, g, profiledLathe(T, [
    [sampleR * 1.5, chuckY], [R * 0.94, chuckY], [R * 0.94, chuckY - mm(96)],
    [R * 0.80, chuckY - mm(112)], [sampleR * 1.5, chuckY - mm(112)],
  ], {
    segments: seg,
    radiusFn: (th, r) => {
      if (r < R * 0.7) return 1;
      const a = ((th * 6) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.10 * Math.max(0, 1 - d * 2.6);
    },
  }), bright, { name: 'chuck' });

  // ── the shroud: the part that makes it an RC hammer and not a DTH hammer ─
  const shroudR = mm(h.maxBit * 0.5 + 2);
  part(T, g, G.lathe(T, [
    [R * 0.99, chuckY - mm(70)], [shroudR, chuckY - mm(120)],
    [shroudR, chuckY - mm(196)], [shroudR - mm(9), chuckY - mm(196)],
    [shroudR - mm(9), chuckY - mm(126)], [R * 0.90, chuckY - mm(74)],
  ], seg, true), wearMaterial(ctx, 'wornSteel', wear), { name: 'shroud' });
  if (wear > 0.5) {
    // the shroud is the first thing the formation eats
    part(T, g, G.torus(T, shroudR - mm(4), mm(5) * wear, 4, low ? 10 : 18),
      material(ctx, '__mud'), { p: [0, chuckY - mm(192), 0], r: [Math.PI / 2, 0, 0], cast: false });
  }

  return finalise(T, g, {
    id: 'rc-hammer', family: 'DTH Tools / DTH Hammers (RC)',
    name: 'Drillity Chipline RC Hammer ' + odMm + ' mm',
    odMm: odMm, lengthMm: h.lenMm, massKg: h.kg, pistonKg: h.piston,
    minBitMm: h.minBit, maxBitMm: h.maxBit,
    minAirM3Min: h.airM3, minAirBar: h.airBar,
    connection: 'API 3 1/2 REG pin', connectionFamily: 'percussion-dth',
    shroud: true, sampleTransport: 'Centre tube, face-sampled',
    material: 'Case 34CrNiMo6, piston 42CrMo4(V)',
    method: 'rc', priceEur: Math.round(2400 + odMm * 46),
  }, opts);
}

/**
 * RC bit. Drop-centre face, hemispherical gauge and face carbide, and — the
 * feature nothing else in the library has — SAMPLE PORTS through the face
 * feeding a centre bore, so the cuttings leave through the bit rather than
 * around it. 16 carbides on the small sizes, 19 on the large ones.
 * opts: { diameterMm, wear, lod }
 */
export function buildRCBit(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = clampv(opts.diameterMm || 124, 86, 165);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 15 : 28;
  const btnSeg = low ? 7 : 10;
  const R = mm(diaMm) * 0.5;
  const Rw = R - mm(2.4) * wear;
  const headLen = mm(diaMm * 1.15);
  const faceY = -headLen;
  const sampleR = mm(clampv(diaMm * 0.20, 10, 24));   // 20-28 mm sample holes
  const g = new T.Group();
  g.name = 'rc-bit';
  const steel = bitBodyMaterial(ctx, wear * 0.85);
  const bright = material(ctx, 'wornSteel');
  const bore = material(ctx, '__hole', { color: 0x090B0D, roughness: 0.92, metalness: 0.15, side: T.BackSide });

  // drop centre: the face dishes IN toward the sample ports
  const domeAt = (r) => faceY + mm(3) + mm(11) * Math.pow(clamp01(1 - r / (Rw * 0.95)), 1.7);

  part(T, g, profiledLathe(T, [
    [sampleR * 1.05, faceY + mm(14)],
    [Rw * 0.40, faceY + mm(11)],
    [Rw * 0.80, faceY + mm(2.4)],
    [Rw, faceY + mm(7)],
    [Rw, faceY + mm(22)],
    [R * 0.985, faceY + mm(40)],
    [R * 0.90, -mm(126)],
    [R * 0.90, -mm(96)],
    [R * 0.62, -mm(84)],
    [R * 0.62, 0],
    [sampleR * 1.30, 0],
    [sampleR * 1.30, faceY + mm(20)],
    [sampleR * 1.05, faceY + mm(14)],
  ], {
    segments: seg,
    // four wide flushing/return flutes up the gauge
    radiusFn: (th, r, y) => {
      if (r < Rw * 0.62 || y < faceY + mm(6)) return 1;
      const a = ((th * 4) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.115 * Math.max(0, 1 - d * 3.2);
    },
  }), steel, { name: 'head' });

  // splined shank into the hammer chuck
  part(T, g, profiledLathe(T, [
    [sampleR * 1.3, 0], [R * 0.62, 0], [R * 0.62, mm(96)], [sampleR * 1.3, mm(96)],
  ], {
    segments: seg,
    radiusFn: (th, r) => {
      if (r < R * 0.5) return 1;
      const a = ((th * 6) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.085 * Math.max(0, 1 - d * 2.6);
    },
  }), bright, { name: 'shank' });
  part(T, g, G.torus(T, R * 0.60, mm(5), 4, low ? 12 : 20), bright, {
    p: [0, mm(30), 0], r: [Math.PI / 2, 0, 0], name: 'retaining-groove', cast: false,
  });

  // the sample bore, open right through the bit
  part(T, g, G.cyl(T, sampleR, sampleR, headLen + mm(96), low ? 10 : 16, true), bore, {
    p: [0, faceY + (headLen + mm(96)) * 0.5, 0], cast: false, recv: false, name: 'sample-bore',
  });

  // ── carbide: 16 on the small sizes, 19 on the large ─────────────────────
  const total = diaMm >= 115 ? 19 : 16;
  const gaugeCount = Math.round(total * 0.55);
  const gaugeDia = mm(clampv(diaMm * 0.105, 9, 16));
  const faceDia = mm(clampv(diaMm * 0.095, 8, 14));
  const layout = ringLayout({
    count: gaugeCount, radius: Rw - gaugeDia * 0.60, y: faceY + mm(7),
    tilt: 40 * DEG, dia: gaugeDia, kind: 'spherical', gauge: true, phase: 0.25,
  });
  const rMid = Rw * 0.62;
  layout.push.apply(layout, ringLayout({
    count: total - gaugeCount, radius: rMid, y: domeAt(rMid), tilt: 14 * DEG,
    dia: faceDia, kind: 'spherical', phase: 1.1,
  }));
  studFace(T, ctx, g, layout, { wear: wear, seg: btnSeg });

  // ── sample ports: the cuttings' only way in ─────────────────────────────
  const ports = diaMm >= 115 ? 4 : 3;
  for (let i = 0; i < ports; i++) {
    const a = (i / ports) * TAU + 0.75;
    const r = Rw * 0.30;
    flushHole(T, ctx, g, {
      x: Math.cos(a) * r, y: domeAt(r) - mm(1), z: Math.sin(a) * r,
      r: mm(clampv(diaMm * 0.062, 5, 9)), dir: [0, -1, 0], seg: low ? 8 : 11, chamferMat: bright,
    });
  }

  return finalise(T, g, {
    id: 'rc-bit', family: 'Drill Bits & Cutting Tools / DTH Bits (RC)',
    name: 'Drillity Chipline RC Bit ' + Math.round(diaMm) + ' mm',
    diameterMm: Math.round(diaMm), lengthMm: Math.round(headLen * 1000),
    buttons: layout.length, buttonKind: 'spherical', face: 'Drop centre',
    samplePorts: ports, samplePortMm: Math.round(clampv(diaMm * 0.124, 20, 28)),
    connection: 'Splined RC shank + retaining ring', connectionFamily: 'percussion-dth',
    material: 'Carbide grade DP55 / body 42CrMo4(V)',
    method: 'rc', priceEur: Math.round(420 + diaMm * 7.2),
  }, opts);
}

/**
 * The cyclone. Sample-laden air comes in tangentially through a ceramic-tiled
 * wear bend, spins down the vortex scroll, drops its solids into the base cone
 * and leaves clean through the vortex finder on top. Every wetted surface is a
 * consumable, and the model says so: alumina tiles on the bend and barrel,
 * polyurethane in the cone, and both of them thin out with wear.
 * opts: { inletMm, wear, lod }
 */
export function buildCyclone(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const inletMm = clampv(opts.inletMm || 100, 60, 140);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 30;
  const g = new T.Group();
  g.name = 'rc-cyclone';
  const paint = material(ctx, 'paintedSteel');
  const steel = material(ctx, 'wornSteel');
  const cer = wearMaterial(ctx, '__ceramic', wear);
  const ure = wearMaterial(ctx, '__urethane', wear);

  const Rb = mm(inletMm * 3.2);      // barrel radius
  const barrelH = Rb * 2.5;
  const coneH = Rb * 4.2;
  const inR = mm(inletMm) * 0.5;

  // vortex finder / overflow stack (origin sits on its flange)
  part(T, g, pipeGeometry(T, { od: inR * 2.3, id: inR * 2.0, length: Rb * 1.5, y0: 0, seg: seg }), paint,
    { name: 'overflow' });
  part(T, g, G.lathe(T, [
    [inR * 1.15, 0], [inR * 1.85, 0], [inR * 1.85, -mm(18)], [inR * 1.15, -mm(18)],
  ], seg, true), steel, { name: 'overflow-flange' });
  boltRing(T, ctx, g, { count: low ? 4 : 8, radius: inR * 1.55, y: -mm(9), acrossFlats: mm(15), height: mm(11), mat: steel });

  // ── barrel with the vortex scroll ──────────────────────────────────────
  const top = -Rb * 1.5;
  part(T, g, G.lathe(T, [
    [Rb, top], [Rb, top - barrelH], [Rb - mm(11), top - barrelH], [Rb - mm(11), top],
  ], seg, true), paint, { name: 'barrel' });
  part(T, g, G.lathe(T, [
    [inR * 1.2, top], [Rb, top], [Rb, top + mm(12)], [inR * 1.2, top + mm(12)],
  ], seg, true), paint, { name: 'barrel-lid' });
  // the alumina-tiled scroll, a helical band down the inside of the barrel
  const scrollPts = [];
  const turns = 1.35;
  for (let i = 0; i <= (low ? 14 : 28); i++) {
    const u = i / (low ? 14 : 28);
    const a = u * turns * TAU;
    scrollPts.push([Math.cos(a) * (Rb - mm(20)), top - mm(20) - u * barrelH * 0.82, Math.sin(a) * (Rb - mm(20))]);
  }
  part(T, g, G.tube(T, scrollPts, mm(11) * lerp(1, 0.42, wear), low ? 16 : 34, low ? 5 : 8), cer,
    { name: 'vortex-scroll' });

  // ── tangential inlet + ceramic-tiled wear bend ─────────────────────────
  const bendPts = [
    [Rb + mm(280), top - mm(46), -mm(210)],
    [Rb + mm(150), top - mm(52), -mm(120)],
    [Rb + mm(60), top - mm(64), -mm(20)],
    [Rb - mm(14), top - mm(84), inR * 0.9],
  ];
  part(T, g, G.tube(T, bendPts, inR * 1.18, low ? 10 : 18, low ? 7 : 12), paint, { name: 'wear-bend' });
  part(T, g, G.tube(T, bendPts, inR * 1.02 * lerp(1, 0.86, wear), low ? 10 : 18, low ? 6 : 10), cer,
    { name: 'bend-tiles', cast: false });
  // hose spigot with a camlock
  part(T, g, G.lathe(T, [
    [inR * 1.05, 0], [inR * 1.34, 0], [inR * 1.34, -mm(30)], [inR * 1.05, -mm(30)],
  ], low ? 10 : 18, true), steel, {
    p: [Rb + mm(288), top - mm(46), -mm(216)], r: [0, 0, Math.PI / 2], name: 'camlock',
  });
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(20), mm(58), mm(16)), steel, {
      p: [Rb + mm(288), top - mm(46) + (i ? 1 : -1) * inR * 1.30, -mm(216)],
      r: [0, 0, (i ? -1 : 1) * 0.55], cast: false,
    });
  }

  // ── base cone, polyurethane lined ──────────────────────────────────────
  const coneTop = top - barrelH;
  part(T, g, G.lathe(T, [
    [Rb, coneTop], [Rb * 0.20, coneTop - coneH],
    [Rb * 0.20 - mm(9), coneTop - coneH], [Rb - mm(9), coneTop],
  ], seg, true), paint, { name: 'cone' });
  part(T, g, G.lathe(T, [
    [Rb - mm(11), coneTop], [Rb * 0.20 - mm(11), coneTop - coneH + mm(6)],
    [Rb * 0.20 - mm(11) - mm(8) * (1 - wear * 0.6), coneTop - coneH + mm(6)],
    [Rb - mm(11) - mm(8) * (1 - wear * 0.6), coneTop],
  ], seg, true), ure, { name: 'cone-liner', cast: false });
  // reinforcing hoops
  for (let i = 0; i < (low ? 2 : 4); i++) {
    const u = (i + 0.5) / (low ? 2 : 4);
    part(T, g, G.torus(T, lerp(Rb, Rb * 0.20, u) + mm(6), mm(9), 4, seg), steel, {
      p: [0, coneTop - u * coneH, 0], r: [Math.PI / 2, 0, 0], cast: false,
    });
  }

  // ── underflow: the discharge cone with a quick-release clamp ────────────
  const uy = coneTop - coneH;
  part(T, g, pipeGeometry(T, { od: Rb * 0.42, id: Rb * 0.30, length: Rb * 0.9, y0: uy, seg: seg }), steel,
    { name: 'underflow' });
  part(T, g, G.torus(T, Rb * 0.24, mm(13), 5, seg), steel, { p: [0, uy - Rb * 0.9, 0], r: [Math.PI / 2, 0, 0] });
  part(T, g, G.box(T, mm(34), mm(80), mm(22)), steel, { p: [Rb * 0.26, uy - Rb * 0.86, 0], r: [0, 0, 0.4] });

  // lifting lugs + a Drillity plate on the barrel
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(16), mm(70), mm(46)), steel, {
      p: [(i ? 1 : -1) * Rb * 0.86, top + mm(34), 0], name: 'lug',
    });
    part(T, g, G.torus(T, mm(18), mm(7), 4, low ? 8 : 14), steel, {
      p: [(i ? 1 : -1) * Rb * 0.86, top + mm(54), 0], r: [0, Math.PI / 2, 0], cast: false,
    });
  }
  part(T, g, G.box(T, Rb * 1.1, Rb * 0.28, mm(4)), material(ctx, 'brandedPanel'), {
    p: [0, top - barrelH * 0.42, Rb - mm(4)], cast: false, name: 'plate',
  });

  return finalise(T, g, {
    id: 'rc-cyclone', family: 'RC Sample Systems / Cyclones',
    name: 'Drillity Chipline Cyclone ' + Math.round(inletMm) + ' mm',
    inletMm: Math.round(inletMm), barrelMm: Math.round(Rb * 2000),
    heightMm: Math.round((Rb * 1.5 + barrelH + coneH + Rb * 0.9) * 1000),
    bendLining: 'Alumina ceramic tiles', barrelLining: 'Alumina ceramic vortex scroll',
    coneLining: 'Polyurethane 60 shore',
    connection: 'Camlock hose coupling', connectionFamily: 'hose',
    material: 'Painted steel shell, ceramic and urethane wear liners',
    method: 'rc', priceEur: Math.round(3200 + inletMm * 44),
  }, opts);
}

/**
 * The splitter under the cyclone. A riffle box that halves (or quarters) the
 * falling stream so the 2-3 kg that goes in the assay bag is representative of
 * the whole metre; the rest goes down the reject chute to the pile.
 * opts: { splits: 2|4, wear, lod }
 */
export function buildSampleSplitter(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const splits = opts.splits === 4 ? 4 : 2;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const g = new T.Group();
  g.name = 'rc-splitter';
  const paint = material(ctx, 'paintedSteel');
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.8);
  const ure = wearMaterial(ctx, '__urethane', wear);

  const W = mm(420);
  const D = mm(300);

  // hopper mouth under the cyclone underflow
  part(T, g, G.lathe(T, [
    [mm(78), 0], [mm(90), 0], [W * 0.62, -mm(150)], [W * 0.62 - mm(6), -mm(150)],
  ], seg, true), paint, { name: 'hopper' });
  // riffle box: a rectangular case with alternating chutes
  part(T, g, G.roundedBox(T, W, mm(240), D, mm(10), 2), paint, { p: [0, -mm(272), 0], name: 'riffle-box' });
  const riffles = low ? 6 : 12;
  for (let i = 0; i < riffles; i++) {
    const x = lerp(-W * 0.44, W * 0.44, (i + 0.5) / riffles);
    part(T, g, G.box(T, mm(7), mm(190), D * 0.92), steel, {
      p: [x, -mm(268), 0], r: [0, 0, (i % 2 ? 1 : -1) * 0.42], cast: false, name: 'riffle',
    });
  }
  // wear liner in the throat
  part(T, g, G.box(T, W * 0.94, mm(6), D * 0.94), ure, { p: [0, -mm(392) + mm(4), 0], cast: false });

  // the chutes: one assay chute per split, plus the reject chute
  const chuteY = -mm(392);
  for (let i = 0; i < splits; i++) {
    const t = splits === 2 ? (i ? 1 : -1) : (i - 1.5) / 1.5;
    part(T, g, G.lathe(T, [
      [mm(58), chuteY], [mm(74), chuteY], [mm(74), chuteY - mm(170)], [mm(58), chuteY - mm(170)],
    ], seg, true), paint, { p: [t * W * 0.30, 0, 0], r: [0, 0, -t * 0.22], name: 'assay-chute' });
    // bag hook and a clamp ring the crew slips the calico bag over
    part(T, g, G.torus(T, mm(80), mm(7), 4, seg), steel, {
      p: [t * W * 0.30 - Math.sin(-t * 0.22) * mm(170), chuteY - mm(168), 0],
      r: [Math.PI / 2, 0, -t * 0.22], cast: false, name: 'bag-ring',
    });
    part(T, g, G.box(T, mm(14), mm(52), mm(12)), steel, {
      p: [t * W * 0.30 + mm(74), chuteY - mm(110), D * 0.22], r: [0.3, 0, -t * 0.22], cast: false,
    });
  }
  // reject chute, larger, straight out the back to the bulk pile
  part(T, g, G.lathe(T, [
    [mm(96), chuteY], [mm(116), chuteY], [mm(116), chuteY - mm(230)], [mm(96), chuteY - mm(230)],
  ], seg, true), paint, { p: [0, 0, -D * 0.52], r: [-0.42, 0, 0], name: 'reject-chute' });

  // split-ratio lever with a detent quadrant — the operator's one control
  part(T, g, G.box(T, mm(18), mm(200), mm(18)), steel, {
    p: [W * 0.52, -mm(210), D * 0.36], r: [0, 0, 0.3], name: 'lever',
  });
  part(T, g, G.sph(T, mm(24), low ? 7 : 10), material(ctx, 'rubber'), { p: [W * 0.58, -mm(112), D * 0.36] });
  part(T, g, G.lathe(T, [
    [mm(40), 0], [mm(96), 0], [mm(96), mm(8)], [mm(40), mm(8)],
  ], low ? 8 : 14, true), steel, { p: [W * 0.52, -mm(300), D * 0.30], r: [Math.PI / 2, 0, 0], cast: false });

  // support legs + frame feet
  for (let i = 0; i < 4; i++) {
    const c = [[-1, -1], [1, -1], [-1, 1], [1, 1]][i];
    part(T, g, G.box(T, mm(30), mm(560), mm(30)), paint, {
      p: [c[0] * W * 0.44, -mm(430), c[1] * D * 0.42], r: [c[1] * 0.06, 0, -c[0] * 0.06], name: 'leg',
    });
    part(T, g, G.box(T, mm(90), mm(14), mm(90)), steel, {
      p: [c[0] * W * 0.47, -mm(708), c[1] * D * 0.45], cast: false,
    });
  }

  return finalise(T, g, {
    id: 'rc-splitter', family: 'RC Sample Systems / Sample Splitters',
    name: 'Drillity Chipline Riffle Splitter ' + splits + '-Way',
    splits: splits, riffles: riffles,
    splitKgPerMetre: '2-3', sampleIntervalM: 1,
    lining: 'Polyurethane throat, hardened riffles',
    connection: 'Bolted under the cyclone underflow', connectionFamily: 'flanged',
    material: 'Painted steel, urethane wear liners',
    method: 'rc', priceEur: 2400 + splits * 260,
  }, opts);
}

/**
 * A sample bag. One metre of hole, 2-3 kg of chips, a written depth interval
 * and a tie. It is the product the whole RC spread exists to make, so it is
 * modelled as a real filled sack — slumped, creased and dusty — not a box.
 * opts: { fill: 0..1, wear, lod }
 */
export function buildSampleBag(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const fill = clamp01(opts.fill === undefined ? 0.82 : opts.fill);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const g = new T.Group();
  g.name = 'sample-bag';
  const cloth = wearMaterial(ctx, '__calico', wear * 0.7);
  const dust = material(ctx, '__mud');

  const W = mm(200);
  const H = mm(340) * lerp(0.42, 1, fill);
  // The sack profile: a gathered neck, a belly that bulges with the fill, and
  // a flat base where it stands on the ground. A lathe with an angular term
  // gives the creases without a texture.
  const belly = W * lerp(0.52, 1.0, fill);
  part(T, g, profiledLathe(T, [
    [mm(16), 0],
    [mm(34), -mm(18)],
    [belly * 0.62, -H * 0.26],
    [belly, -H * 0.62],
    [belly * 0.94, -H * 0.92],
    [belly * 0.72, -H],
    [mm(10), -H],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => 1 + 0.035 * Math.sin(th * 7 + y * 26) + 0.02 * Math.sin(th * 3.0 - y * 11),
  }), cloth, { name: 'sack' });
  // gathered neck + tie
  part(T, g, G.lathe(T, [
    [mm(16), 0], [mm(30), mm(26)], [mm(46), mm(58)], [mm(12), mm(62)],
  ], seg, true), cloth, { name: 'neck', cast: false });
  part(T, g, G.torus(T, mm(19), mm(5), 4, low ? 10 : 16), material(ctx, 'safetyStripe'), {
    p: [0, mm(8), 0], r: [Math.PI / 2, 0, 0], name: 'tie', cast: false,
  });
  // the written interval — a stencil panel, legible at thumbnail size
  part(T, g, G.plane(T, W * 0.86, W * 0.30), material(ctx, 'brandedPanel'), {
    p: [0, -H * 0.46, belly * 1.005], cast: false, recv: false, name: 'label',
  });
  // dust on the shoulders and a spill at the foot
  if (!low) {
    for (let i = 0; i < 5; i++) {
      const a = (i * 2.399);
      part(T, g, G.sph(T, mm(22) + (i % 3) * mm(9), 6), dust, {
        p: [Math.cos(a) * belly * 0.85, -H - mm(6), Math.sin(a) * belly * 0.85],
        s: [1, 0.28, 1], cast: false,
      });
    }
  }

  return finalise(T, g, {
    id: 'sample-bag', family: 'RC Sample Systems / Sample Bags',
    name: 'Drillity Calico Sample Bag 200 x 340 mm',
    widthMm: 200, heightMm: 340, fill: Math.round(fill * 100) / 100,
    massKg: Math.round(fill * 3 * 10) / 10, intervalM: 1,
    material: 'Calico / woven polypropylene, drawstring tie',
    connection: 'Slips over the splitter bag ring', connectionFamily: 'none',
    method: 'rc', priceEur: 1,
  }, opts);
}


/* ═══════════════════════════════════════════════════════════════════════════
   §15 TUNNELLING — the face round

   A development round is drilled with a jumbo feed, charged through a
   semi-conductive hose, and initiated off a reel of shock tube. Three objects,
   three completely different material vocabularies: extruded aluminium, orange
   anti-static rubber, and a spool of yellow tube nobody is allowed to drop.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A jumbo drifter feed: the beam, the rock drill that slides on it, the chain,
 * the front centraliser and the rod support. Hangs from y=0 like every other
 * tool, so the shop spins it the same way as a bit.
 * opts: { lengthMm, rodMm, drifterKw, wear, lod }
 */
/** Rod length the shank and chuck swallow, so hole = rod - this. */
const CHUCK_LOSS_MM = 303;

export function buildJumboFeed(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const rodMm = opts.rodMm || 2435;
  const L = mm(opts.lengthMm || Math.round(rodMm * 1.62));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 8 : 14;
  const g = new T.Group();
  g.name = 'jumbo-feed';
  const paint = material(ctx, 'paintedSteel');
  const dark = material(ctx, 'paintedSteel', { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.7);
  const chrome = material(ctx, 'chrome');
  const rail = wearMaterial(ctx, 'rawSteel', wear);

  const W = mm(300);
  const D = mm(200);

  // ── the beam: an extruded profile, not a box. Two rails on top, a chain
  //    channel underneath, and a lightening web between them. ──────────────
  part(T, g, G.roundedBox(T, W, L, D * 0.62, mm(14), 2), paint, { p: [0, -L * 0.5, -D * 0.20], name: 'beam' });
  for (let s = -1; s <= 1; s += 2) {
    part(T, g, G.box(T, mm(34), L, mm(44)), rail, { p: [s * (W * 0.5 - mm(20)), -L * 0.5, mm(6)], name: 'rail' });
    part(T, g, G.box(T, mm(12), L * 0.98, mm(70)), dark, { p: [s * (W * 0.5 - mm(2)), -L * 0.5, -D * 0.34], cast: false });
  }
  // chain in its channel, drawn as real links so it never reads as a stripe
  part(T, g, G.box(T, mm(30), L * 0.99, mm(20)), steel, { p: [0, -L * 0.5, -D * 0.60], name: 'chain-rail' });
  const links = low ? 14 : Math.round(L / mm(74));
  for (let i = 0; i < links; i++) {
    part(T, g, G.box(T, mm(26), mm(44), mm(15)), chrome, {
      p: [0, -mm(40) - i * (L - mm(80)) / Math.max(1, links - 1), -D * 0.60 - mm(17)],
      r: [0, (i % 2) * Math.PI / 2, 0], cast: false, name: 'link',
    });
  }
  // feed motor and idler sprocket, one at each end
  for (const y of [-mm(120), -L + mm(120)]) {
    part(T, g, G.cyl(T, mm(90), mm(90), mm(120), low ? 10 : 16), dark, {
      p: [0, y, -D * 0.60], r: [0, 0, Math.PI / 2], name: 'sprocket',
    });
    part(T, g, G.cyl(T, mm(66), mm(66), mm(56), low ? 8 : 12), steel, {
      p: [W * 0.34, y, -D * 0.60], r: [0, 0, Math.PI / 2], cast: false,
    });
  }

  // ── the rock drill riding the beam ─────────────────────────────────────
  const dy = -L * 0.34;
  const cradle = group(T, g, 'drifter-cradle', { p: [0, dy, 0] });
  part(T, cradle, G.roundedBox(T, W * 1.08, mm(150), D * 0.5, mm(10), 2), dark, { p: [0, 0, -mm(20)] });
  // percussion body with cooling fins and an accumulator bottle
  part(T, cradle, G.roundedBox(T, mm(210), mm(560), mm(230), mm(16), 2), dark, { p: [0, -mm(300), mm(30)] });
  const fins = low ? 3 : 7;
  for (let i = 0; i < fins; i++) {
    part(T, cradle, G.box(T, mm(228), mm(11), mm(248)), dark, {
      p: [0, -mm(150) - i * mm(66), mm(30)], cast: false,
    });
  }
  part(T, cradle, G.capsule(T, mm(52), mm(150), low ? 8 : 12),
    material(ctx, 'paintedSteel', { color: 0x3F92A6, roughness: 0.5, metalness: 0.34 }),
    { p: [mm(140), -mm(250), mm(30)] });
  // rotation motor + gearbox on top
  part(T, cradle, G.roundedBox(T, mm(260), mm(140), mm(220), mm(12), 2), paint, { p: [0, mm(60), mm(30)] });
  part(T, cradle, G.cyl(T, mm(70), mm(70), mm(190), low ? 10 : 14), steel, {
    p: [-mm(160), mm(80), mm(30)], r: [0, 0, 0.2],
  });
  // the shank end and the chuck, with the water/flushing head behind
  part(T, cradle, profiledLathe(T, [
    [mm(16), -mm(580)], [mm(76), -mm(580)], [mm(76), -mm(660)],
    [mm(58), -mm(700)], [mm(16), -mm(700)],
  ], { segments: low ? 10 : 16 }), steel, { p: [0, 0, mm(30)], name: 'chuck' });
  part(T, cradle, G.cyl(T, mm(44), mm(44), mm(120), low ? 8 : 12), steel, {
    p: [0, -mm(600), -mm(92)], r: [Math.PI / 2, 0, 0], name: 'flushing-head',
  });
  boltRing(T, ctx, cradle, { count: low ? 4 : 6, radius: mm(96), y: -mm(566), acrossFlats: mm(19), height: mm(14), mat: steel });

  // ── front centraliser and rod support at the face end ──────────────────
  const fy = -L + mm(70);
  part(T, g, G.box(T, W * 1.30, mm(90), mm(230)), dark, { p: [0, fy, mm(20)], name: 'centraliser' });
  part(T, g, G.torus(T, mm(46), mm(20), 5, low ? 12 : 20), steel, { p: [0, fy - mm(30), mm(20)] });
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(120), mm(60), mm(40)), steel, {
      p: [(i ? 1 : -1) * mm(96), fy - mm(28), mm(20)], r: [0, 0, (i ? -1 : 1) * 0.30], cast: false, name: 'jaw',
    });
  }
  // rod support half way along, so a 2.4 m rod cannot whip
  part(T, g, G.box(T, W * 1.10, mm(70), mm(150)), dark, { p: [0, -L * 0.68, mm(14)], cast: false });
  part(T, g, G.torus(T, mm(40), mm(14), 4, low ? 10 : 16), steel, { p: [0, -L * 0.68 - mm(22), mm(14)], cast: false });

  // ── telescopic feed extension + hose carrier + the laser bracket ───────
  part(T, g, G.box(T, mm(150), L * 0.42, mm(120)), steel, { p: [0, -L * 0.80, -D * 0.86], name: 'telescope' });
  part(T, g, G.cyl(T, mm(36), mm(36), L * 0.36, low ? 8 : 12), chrome, { p: [0, -L * 0.40, -D * 0.86] });
  const carrier = low ? 6 : 14;
  for (let i = 0; i < carrier; i++) {
    part(T, g, G.box(T, mm(94), (L / carrier) * 0.8, mm(66)), dark, {
      p: [-W * 0.62, -(i + 0.5) * (L / carrier), -D * 0.70], cast: false, name: 'cable-carrier',
    });
  }
  part(T, g, G.box(T, mm(120), mm(80), mm(60)), material(ctx, 'safetyStripe'), {
    p: [W * 0.62, -L * 0.18, -D * 0.30], name: 'laser-bracket', cast: false,
  });
  // boom pivot bracket at the top — this is where it bolts to the jumbo
  part(T, g, G.box(T, W * 1.2, mm(120), D * 0.9), dark, { p: [0, -mm(50), -D * 0.30], name: 'boom-bracket' });
  for (let i = 0; i < 2; i++) {
    part(T, g, G.cyl(T, mm(52), mm(52), mm(150), low ? 10 : 14), steel, {
      p: [(i ? 1 : -1) * W * 0.5, -mm(50), -D * 0.30], r: [0, 0, Math.PI / 2], cast: false,
    });
  }
  part(T, g, G.box(T, W * 0.7, mm(120), mm(6)), material(ctx, 'safetyStripe'), {
    p: [0, -L + mm(180), D * 0.14], cast: false,
  });

  return finalise(T, g, {
    id: 'jumbo-feed', family: 'Tunneling & Underground / Jumbos / Feeds',
    name: 'Drillity Faceline Jumbo Feed ' + Math.round(L * 1000) + ' mm',
    lengthMm: Math.round(L * 1000), rodMm: rodMm,
    /* HOLE LENGTH FOLLOWS THE ROD. This was a hard 2132 on every feed in the
       family, so a 3100 mm feed carrying an 1830 mm rod and a 3900 mm feed
       carrying a 2435 mm rod both claimed the same 2132 mm hole — 605 mm of
       rod that made no difference to anything. The hole is the rod minus what
       the shank and chuck swallow, and that loss belongs to the drifter, not
       to the rod: 2435 - 2132 = 303 mm, which now applies to every size.
       1830 mm rod therefore drills 1527 mm, the short face round it should. */
    holeLenMm: Math.max(0, rodMm - CHUCK_LOSS_MM),
    holeMm: '38-51', drifterKw: opts.drifterKw || 14,
    percussionBar: 140, blowHz: 110, rotationRpm: 530, rotationNm: 340,
    feedKn: 31, feedRate: 'up to 3 m/min',
    flushing: 'Water, 33 l/min at 15 bar', shankLube: 'Air/oil mist',
    connection: 'Boom pivot bracket, twin pin', connectionFamily: 'pinned',
    material: 'Extruded feed beam, hardened rails, 42CrMo4(V) chuck',
    method: 'tunnel-jumbo', priceEur: Math.round(24000 + L * 4200),
  }, opts);
}

/**
 * Charging hose for bulk ANFO or site-sensitised emulsion. A coil of
 * semi-conductive hose — it MUST bleed static, which is why it is not ordinary
 * black rubber — with a loading nozzle at the working end, a camlock at the
 * pump end and an earthing clip that a shot firer clips to the steel before
 * anything is pumped.
 * opts: { boreMm, lengthM, product:'anfo'|'emulsion', wear, lod }
 */
export function buildChargingHose(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const boreMm = clampv(opts.boreMm || 32, 19, 50);
  const lengthM = opts.lengthM || 30;
  const product = opts.product === 'emulsion' ? 'emulsion' : 'anfo';
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const g = new T.Group();
  g.name = 'charging-hose';
  const hoseMat = wearMaterial(ctx, '__cableOrange', wear * 0.8);
  const steel = material(ctx, 'wornSteel');
  const brass = material(ctx, '__brass');
  const black = material(ctx, 'rubber');

  const r = mm(boreMm) * 0.5 + mm(6);
  const coilR = mm(300);
  const turns = 6;
  const pitch = r * 2.25;
  const pts = [];
  const n = low ? turns * 7 : turns * 14;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = u * turns * TAU;
    // the coil sags: the lower turns carry the ones above them
    pts.push([Math.cos(a) * coilR, -mm(120) - u * turns * pitch, Math.sin(a) * coilR * 0.92]);
  }
  // the working tail leaves the coil and lies out toward the collar
  pts.push([coilR * 1.5, -mm(120) - turns * pitch - mm(90), coilR * 0.4]);
  pts.push([coilR * 2.6, -mm(120) - turns * pitch - mm(150), -coilR * 0.2]);
  part(T, g, G.tube(T, pts, r, low ? 40 : 96, low ? 6 : 9), hoseMat, { name: 'hose' });
  // the conductive tracer stripe braided into the cover
  part(T, g, G.tube(T, pts, r * 0.99, low ? 40 : 96, 4), black, { name: 'tracer', cast: false });

  // ── loading nozzle / charging lance at the working end ─────────────────
  const tipP = pts[pts.length - 1];
  const nz = group(T, g, 'nozzle', { p: tipP, r: [0, 0, -0.42] });
  part(T, nz, G.lathe(T, [
    [r * 1.15, 0], [r * 1.45, 0], [r * 1.45, -mm(46)], [r * 1.02, -mm(60)],
    [r * 0.72, -mm(230)], [r * 0.60, -mm(250)],
  ], low ? 10 : 18, true), steel, { name: 'lance' });
  // the anti-static insert and the delivery slot
  part(T, nz, G.cyl(T, r * 0.48, r * 0.40, mm(120), low ? 8 : 12), material(ctx, '__hdpe'), { p: [0, -mm(200), 0], cast: false });
  part(T, nz, G.box(T, r * 0.9, mm(70), mm(6)), material(ctx, 'safetyStripe'), { p: [0, -mm(110), r * 0.6], cast: false });

  // ── camlock at the pump end ────────────────────────────────────────────
  const endP = pts[0];
  part(T, g, G.lathe(T, [
    [r * 1.02, 0], [r * 1.46, 0], [r * 1.46, mm(56)], [r * 1.18, mm(72)], [r * 1.02, mm(72)],
  ], low ? 10 : 18, true), brass, { p: endP, name: 'camlock' });
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(15), mm(58), mm(12)), brass, {
      p: [endP[0] + (i ? 1 : -1) * r * 1.5, endP[1] + mm(34), endP[2]],
      r: [0, 0, (i ? -1 : 1) * 0.5], cast: false,
    });
  }
  // ── earthing lead and clip ─────────────────────────────────────────────
  const earth = [
    [endP[0], endP[1] + mm(20), endP[2] + r * 1.3],
    [endP[0] + mm(150), endP[1] - mm(120), endP[2] + mm(260)],
    [endP[0] + mm(70), endP[1] - mm(320), endP[2] + mm(420)],
  ];
  part(T, g, G.tube(T, earth, mm(5), low ? 8 : 16, 5), material(ctx, '__copper'), { name: 'earth-lead' });
  const clipP = earth[earth.length - 1];
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(14), mm(90), mm(9)), steel, {
      p: [clipP[0], clipP[1] - mm(40), clipP[2] + (i ? 1 : -1) * mm(11)],
      r: [(i ? 1 : -1) * 0.26, 0, 0], cast: false, name: 'earth-clip',
    });
  }

  return finalise(T, g, {
    id: 'charging-hose', family: 'Tunneling & Underground / ANFO Loaders / Charging Hose',
    name: 'Drillity Faceline ' + (product === 'emulsion' ? 'Emulsion' : 'ANFO')
      + ' Charging Hose ' + Math.round(boreMm) + ' mm x ' + lengthM + ' m',
    boreMm: Math.round(boreMm), lengthM: lengthM, product: product,
    cover: 'Semi-conductive, static-dissipating',
    ends: 'Camlock at the pump, loading lance at the collar',
    earthing: 'Bonded earth lead and clip',
    connection: 'Camlock hose coupling', connectionFamily: 'hose',
    material: 'Semi-conductive rubber cover, textile braid',
    method: 'tunnel-jumbo', priceEur: Math.round(30 * lengthM + boreMm * 9),
  }, opts);
}

/**
 * A reel of non-electric shock tube with the detonators made up on it. The
 * spool, the wound tube, the connector block and the delay tags: this is the
 * object the shot firer carries to the face and the object that decides
 * whether the round pulls or freezes.
 * opts: { lengthM, delayMs, wear, lod }
 */
export function buildDetonatorReel(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const lengthM = opts.lengthM || 500;
  const delayMs = opts.delayMs || 500;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const g = new T.Group();
  g.name = 'detonator-reel';
  const paint = material(ctx, 'paintedSteel');
  const steel = material(ctx, 'wornSteel');
  const tube = wearMaterial(ctx, '__shockTube', wear * 0.5);
  const plastic = material(ctx, 'plastic');

  const R = mm(190);
  const hubR = mm(70);
  const W = mm(150);

  // ── the spool: two flanges, a hub, and a carrying handle across the top ─
  const cy = -R - mm(20);
  for (let s = -1; s <= 1; s += 2) {
    part(T, g, profiledLathe(T, [
      [hubR * 0.4, s * W * 0.5], [R, s * W * 0.5], [R, s * (W * 0.5 - mm(12))],
      [hubR * 0.4, s * (W * 0.5 - mm(12))],
    ], {
      segments: seg,
      // pressed stiffening ribs radiating out of the flange
      radiusFn: (th, r) => (r > hubR ? 1 + 0.012 * Math.cos(th * 8) : 1),
    }), paint, { p: [0, cy, 0], r: [0, 0, Math.PI / 2], name: 'flange' });
  }
  part(T, g, G.cyl(T, hubR, hubR, W * 0.98, seg), paint, { p: [0, cy, 0], r: [0, 0, Math.PI / 2], name: 'hub' });
  part(T, g, G.cyl(T, mm(16), mm(16), W * 1.5, low ? 8 : 12), steel, { p: [0, cy, 0], r: [0, 0, Math.PI / 2], name: 'axle' });
  // handle
  part(T, g, G.tube(T, [
    [-W * 0.70, cy + R * 0.10, 0], [-W * 0.62, cy + R * 1.16, 0],
    [W * 0.62, cy + R * 1.16, 0], [W * 0.70, cy + R * 0.10, 0],
  ], mm(11), low ? 12 : 22, 6), steel, { name: 'handle' });
  part(T, g, G.cyl(T, mm(18), mm(18), mm(120), low ? 8 : 12), material(ctx, 'rubber'), {
    p: [0, cy + R * 1.16, 0], r: [0, 0, Math.PI / 2], cast: false,
  });

  // ── the wound tube: real turns, layered, not a painted band ────────────
  const layers = low ? 2 : 4;
  for (let l = 0; l < layers; l++) {
    const rr = hubR + mm(8) + l * mm(17);
    const wraps = low ? 4 : 7;
    for (let i = 0; i < wraps; i++) {
      part(T, g, G.torus(T, rr, mm(3.0), 4, low ? 14 : 26), tube, {
        p: [lerp(-W * 0.40, W * 0.40, wraps === 1 ? 0.5 : i / (wraps - 1)) + (l % 2) * mm(4), cy, 0],
        r: [0, Math.PI / 2, 0], cast: false, name: 'wrap',
      });
    }
  }

  // ── the lead-out, the connector block and the delay tag ────────────────
  const lead = [
    [W * 0.30, cy - R + mm(6), 0],
    [W * 0.50, cy - R - mm(160), mm(80)],
    [W * 0.10, cy - R - mm(320), mm(30)],
    [-W * 0.30, cy - R - mm(400), -mm(60)],
  ];
  part(T, g, G.tube(T, lead, mm(3.0), low ? 12 : 24, 6), tube, { name: 'lead-out' });
  const tip = lead[lead.length - 1];
  // the detonator itself: an aluminium shell crimped onto the tube
  part(T, g, G.lathe(T, [
    [mm(3.6), 0], [mm(3.6), -mm(6)], [mm(4.2), -mm(10)],
    [mm(4.2), -mm(86)], [mm(3.4), -mm(92)], [0, -mm(92)],
  ], low ? 8 : 14, true), material(ctx, 'rawSteel'), { p: tip, name: 'detonator' });
  // connector block, the plastic clip that ties a hole into the trunkline
  part(T, g, G.roundedBox(T, mm(46), mm(30), mm(22), mm(5), 2), plastic, {
    p: [tip[0] + mm(60), tip[1] + mm(50), tip[2]], r: [0, 0, 0.3], name: 'connector-block',
  });
  part(T, g, G.box(T, mm(34), mm(24), mm(1.6)), material(ctx, 'safetyStripe'), {
    p: [tip[0] + mm(60), tip[1] + mm(50), tip[2] + mm(12)], r: [0, 0, 0.3], cast: false, name: 'delay-tag',
  });
  // the colour-coded delay band on the reel flange
  part(T, g, G.torus(T, R * 0.72, mm(9), 4, seg), material(ctx, 'safetyStripe'), {
    p: [W * 0.5 + mm(3), cy, 0], r: [0, Math.PI / 2, 0], cast: false, name: 'delay-band',
  });
  part(T, g, G.plane(T, R * 0.9, R * 0.34), material(ctx, 'brandedPanel'), {
    p: [W * 0.5 + mm(7), cy, 0], r: [0, Math.PI / 2, 0], cast: false, recv: false, name: 'label',
  });

  return finalise(T, g, {
    id: 'detonator-reel', family: 'Tunneling & Underground / Initiation / Detonator Reels',
    name: 'Drillity Faceline Shock-Tube Reel ' + lengthM + ' m / ' + delayMs + ' ms',
    lengthM: lengthM, delayMs: delayMs, initiation: 'Non-electric shock tube',
    connector: 'Surface connector block, colour-coded delay tag',
    connection: 'Shock-tube connector block', connectionFamily: 'none',
    material: 'Laminated shock tube, aluminium detonator shell',
    method: 'tunnel-jumbo', priceEur: Math.round(6 + lengthM * 0.9),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §16 LONGHOLE PRODUCTION — the guide tube

   In a stope the driller cannot see the hole and cannot see the ore. Deviation
   is the whole game: over 25 m of longhole, more than 2 % off line gives
   dilution, ore loss or a frozen stope. A guide tube is the cheapest thing
   that fixes it — a heavy-wall tube run directly above the hammer, the same
   diameter as the hole, so the string cannot wander.
   ═══════════════════════════════════════════════════════════════════════════ */

export function buildGuideTube(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const holeMm = clampv(opts.holeMm || 115, 76, 216);
  const odMm = opts.odMm || Math.round(holeMm - 6);
  const L = mm(opts.lengthMm || 1000);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const g = new T.Group();
  g.name = 'guide-tube';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const bright = wearMaterial(ctx, 'rawSteel', wear * 0.4);
  const hard = wearMaterial(ctx, 'carbide', wear);

  const R = mm(odMm) * 0.5;
  const bore = R * 0.56;

  // heavy-wall body with a spiral flushing groove — the cuttings have to get
  // past it, and a plain tube would pack the annulus solid
  part(T, g, profiledLathe(T, [
    [bore, -mm(4)], [R * 0.90, -mm(4)], [R * 0.90, -mm(64)],
    [R, -mm(96)], [R, -L + mm(96)], [R * 0.90, -L + mm(64)],
    [R * 0.90, -L + mm(4)], [bore, -L + mm(4)],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (r < R * 0.8) return 1;
      const a = ((th * 3 + y * 9.0) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.085 * Math.max(0, 1 - d * 3.0);
    },
  }), steel, { name: 'body' });

  // hardfaced wear pads on the three lands — this is what touches the hole
  const pads = low ? 3 : 6;
  for (let i = 0; i < pads; i++) {
    const u = (i + 0.5) / pads;
    const a = (i % 3) * (TAU / 3) + u * 1.9;
    part(T, g, G.box(T, mm(odMm * 0.20), mm(90), mm(9)), hard, {
      p: [Math.cos(a) * R * 0.99, -mm(140) - u * (L - mm(280)), Math.sin(a) * R * 0.99],
      r: [0, -a, 0], cast: false, name: 'wear-pad',
    });
  }
  // box up, pin down, both in a percussion-DTH rotary family
  part(T, g, G.lathe(T, [
    [bore, 0], [R * 0.88, 0], [R * 0.88, -mm(10)], [bore, -mm(10)],
  ], seg, true), bright, { cast: false });
  addBoxThread(T, ctx, g, 'API312', { y0: -mm(8), length: mm(76), quality: low ? 0 : 0.45 });
  addPinThread(T, ctx, g, 'API312', {
    y0: -L + mm(8), length: mm(76), quality: low ? 0 : 0.45, down: true, mat: bright,
  });
  // stencil band so a stack of them on the deck is readable
  part(T, g, G.cyl(T, R * 1.004, R * 1.004, mm(56), seg), material(ctx, 'safetyStripe'), {
    p: [0, -mm(150), 0], cast: false,
  });

  return finalise(T, g, {
    id: 'guide-tube', family: 'Drill String & Rods / Guide Tubes & Stabilisers',
    name: 'Drillity Fanline Guide Tube ' + Math.round(odMm) + ' mm x ' + Math.round(L * 1000) + ' mm',
    odMm: Math.round(odMm), holeMm: Math.round(holeMm), lengthMm: Math.round(L * 1000),
    wearPads: pads, purpose: 'Deviation control in long production holes',
    deviationTarget: 'under 2 % over 25 m',
    connection: 'API 3 1/2 REG box x pin', connectionFamily: 'percussion-dth',
    material: 'Heavy-wall 34CrNiMo6, hardfaced pads',
    method: 'longhole', priceEur: Math.round(680 + odMm * 9.5),
  }, opts);
}


/* ═══════════════════════════════════════════════════════════════════════════
   §17 GROUND SUPPORT — bolts, resin, cable, mesh, plates, nuts

   The one family in the library that is NOT cut with carbide. A friction bolt
   is hammered, a rebar bolt is spun through resin, a cable bolt is pushed up a
   hole longer than the drive is high. None of them has a percussion thread,
   because none of them is a drilling tool — and the shop must not imply
   otherwise. Every item here carries `connectionFamily: 'ground-support'` or
   'none', never 'percussion'.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Split-tube friction bolt sizes, from over 450 recorded pull tests. */
const FRICTION_BOLT = {
  33: { minLenM: 0.9, maxLenM: 2.4, avgT: 10.9, minT: 7.3,  bitMm: 33.0, bitIn: '1.30' },
  39: { minLenM: 0.9, maxLenM: 3.0, avgT: 12.7, minT: 9.1,  bitMm: 38.1, bitIn: '1.50' },
  46: { minLenM: 0.9, maxLenM: 3.6, avgT: 16.3, minT: 13.6, bitMm: 45.0, bitIn: '1.77' },
};

/**
 * Split-tube friction bolt. A slotted tube of LARGER diameter than the hole,
 * hammered in; the slot closes, the tube springs against the wall and holds by
 * friction over its whole length. The slot is the entire product, so it is cut
 * for real rather than painted on — and a driller judges anchorage by looking
 * down the tube at how far it has closed.
 * opts: { odMm: 33|39|46, lengthMm, wear, lod }
 */
export function buildFrictionBolt(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const keys = [33, 39, 46];
  let odMm = opts.odMm || 39;
  odMm = keys.reduce((a, b) => (Math.abs(b - odMm) < Math.abs(a - odMm) ? b : a), keys[0]);
  const fb = FRICTION_BOLT[odMm];
  const L = mm(clampv(opts.lengthMm || 2400, fb.minLenM * 1000, fb.maxLenM * 1000));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 30;
  const g = new T.Group();
  g.name = 'friction-bolt';
  const galv = wearMaterial(ctx, '__galv', wear * 0.9);
  const steel = wearMaterial(ctx, 'wornSteel', wear);

  const ro = mm(odMm) * 0.5;
  const wall = mm(odMm >= 46 ? 3.0 : 2.3);
  const ri = ro - wall;
  // The slot narrows as the bolt is driven — a slot closed to about 1.6 mm
  // means full rock-to-metal contact, and that is what `wear` shows here:
  // an installed bolt is a bolt whose slot has shut.
  const slotW = mm(lerp(14, 3.5, wear));
  const half = Math.asin(clampv(slotW * 0.5 / ro, 0, 0.6));

  // ── the slotted barrel ─────────────────────────────────────────────────
  const barrelL = L - mm(150);
  part(T, g, arcSector(T, {
    rIn: ri, rOut: ro, a0: half, a1: TAU - half, h: barrelL, seg: seg,
  }), galv, { p: [0, -barrelL - mm(110), 0], name: 'barrel' });

  // ── swaged nose: the leading end is tapered so it starts in the hole ────
  const noseL = mm(110);
  part(T, g, arcSector(T, {
    rIn: ri * 0.72, rOut: ro * 0.80, a0: half * 1.6, a1: TAU - half * 1.6, h: noseL, seg: seg,
  }), galv, { p: [0, -L, 0], name: 'nose' });
  part(T, g, G.lathe(T, [
    [ri, 0], [ro, 0], [ro * 0.80, -noseL], [ri * 0.72, -noseL],
  ], seg, true), galv, { p: [0, -L + noseL, 0], name: 'nose-taper', cast: false });

  // ── collar: the welded ring flange the plate bears on ──────────────────
  part(T, g, G.lathe(T, [
    [ri, 0], [ro * 1.44, 0], [ro * 1.44, -mm(12)], [ro, -mm(20)], [ri, -mm(20)],
  ], seg, true), galv, { p: [0, -mm(96), 0], name: 'collar-ring' });
  part(T, g, weldBead(T, ro * 1.05, mm(3.4), low ? 14 : 26), steel, { p: [0, -mm(118), 0], cast: false });
  // driven end: the tube mushrooms under the drifter, and the galvanising is
  // knocked off it first. That bright ring is how an installed bolt reads.
  part(T, g, arcSector(T, {
    rIn: ri, rOut: ro * lerp(1.0, 1.09, wear), a0: half, a1: TAU - half, h: mm(96), seg: seg,
  }), steel, { p: [0, -mm(96), 0], name: 'driven-end' });
  part(T, g, G.lathe(T, [
    [ri, 0], [ro * lerp(1.0, 1.10, wear), 0], [ro * 0.98, mm(7)], [ri, mm(7)],
  ], seg, true), steel, { p: [0, 0, 0], cast: false, name: 'anvil-face' });

  // ── the domed plate that comes on the bolt ─────────────────────────────
  const plateS = mm(150);
  part(T, g, G.lathe(T, [
    [ro * 1.02, -mm(20)], [plateS * 0.46, -mm(42)], [plateS * 0.46, -mm(50)], [ro * 1.02, -mm(30)],
  ], low ? 12 : 20, true), galv, { name: 'plate-dome' });
  part(T, g, G.box(T, plateS, mm(6), plateS), galv, { p: [0, -mm(48), 0], name: 'plate' });

  return finalise(T, g, {
    id: 'friction-bolt',
    family: 'Rock Bolts, Soil Nails & Cable Bolts / Friction Bolts',
    name: 'Drillity Boltline Friction Bolt ' + odMm + ' mm x ' + Math.round(L * 1000) + ' mm',
    odMm: odMm, lengthMm: Math.round(L * 1000),
    lengthRangeM: fb.minLenM + '-' + fb.maxLenM,
    steelCapacityAvgT: fb.avgT, steelCapacityMinT: fb.minT,
    drillBitMm: fb.bitMm, drillBitIn: fb.bitIn,
    holeRule: 'Hole smaller than the bolt; hole at least 50 mm longer than the bolt',
    anchorage: 'Friction over the full length; judged by drive time and slot closure',
    finish: 'Hot-dip galvanised', standard: 'ASTM F432 (bolts and accessories)',
    connection: 'Driven — no thread', connectionFamily: 'ground-support',
    material: 'Slotted high-tensile tube',
    method: 'rockbolt', priceEur: Math.round(6 + odMm * 0.22 * (L * 1000 / 1000) * 1.4),
  }, opts);
}

/**
 * Resin-grouted rebar bolt. Deformed bar, a paddle at the toe that shreds and
 * mixes the resin cartridges as the bolt is spun through them, a rolled thread
 * and a dome nut at the collar. Fully bonded once it cures, and — per the
 * Norwegian practice — the optimal bolt in hard rock under shear.
 * opts: { diaMm, lengthMm, wear, lod }
 */
export function buildRebarBolt(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = clampv(opts.diaMm || 20, 16, 32);
  const L = mm(clampv(opts.lengthMm || 2400, 1200, 6000));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const g = new T.Group();
  g.name = 'rebar-bolt';
  const galv = wearMaterial(ctx, '__galv', wear * 0.8);
  const steel = wearMaterial(ctx, 'wornSteel', wear);

  const R = mm(diaMm) * 0.5;
  const threadL = mm(180);

  // core bar
  part(T, g, G.cyl(T, R * 0.92, R * 0.92, L - threadL - mm(120), seg), galv, {
    p: [0, -threadL - (L - threadL - mm(120)) * 0.5, 0], name: 'bar',
  });
  // two longitudinal ribs and the transverse crescents between them: that is
  // what makes deformed bar read as deformed bar rather than as round stock
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(2.6), L - threadL - mm(140), R * 0.44), galv, {
      p: [(i ? 1 : -1) * R * 0.92, -threadL - (L - threadL - mm(140)) * 0.5, 0], cast: false, name: 'longitudinal-rib',
    });
  }
  const ribs = Math.max(6, Math.round((L - threadL) / mm(low ? 190 : 100)));
  for (let i = 0; i < ribs; i++) {
    const y = -threadL - mm(60) - i * (L - threadL - mm(180)) / Math.max(1, ribs - 1);
    part(T, g, G.torus(T, R * 0.90, mm(1.9), 3, low ? 8 : 12), galv, {
      p: [0, y, 0], r: [Math.PI / 2, 0.28, 0], cast: false, name: 'rib',
    });
  }
  // the resin paddle at the toe — a flattened, chisel-cut end
  part(T, g, G.box(T, R * 2.3, mm(150), mm(6)), steel, { p: [0, -L + mm(75), 0], r: [0, 0.4, 0], name: 'paddle' });
  part(T, g, G.box(T, R * 1.6, mm(46), mm(6)), steel, { p: [0, -L + mm(20), 0], r: [0, 0.4, 0.5], cast: false });

  // ── rolled thread, dome nut and plate at the collar ────────────────────
  part(T, g, threadGeometry(T, {
    major: R, pitch: mm(2.5), depth: mm(1.6), length: threadL, y0: 0, quality: low ? 0 : 0.5,
  }), galv, { name: 'thread' });
  part(T, g, G.cyl(T, R * 0.80, R * 0.80, threadL * 1.02, seg), galv, { p: [0, -threadL * 0.5, 0] });
  const plateS = mm(150);
  part(T, g, G.box(T, plateS, mm(8), plateS), galv, { p: [0, -mm(96), 0], name: 'plate' });
  part(T, g, G.lathe(T, [
    [R * 1.1, -mm(92)], [plateS * 0.44, -mm(70)], [plateS * 0.44, -mm(62)], [R * 1.1, -mm(84)],
  ], low ? 12 : 20, true), galv, { name: 'plate-dome', cast: false });
  part(T, g, G.cyl(T, R * 1.55, R * 1.55, mm(28), 6), steel, { p: [0, -mm(74), 0], name: 'nut' });
  part(T, g, G.lathe(T, [
    [0, -mm(38)], [R * 1.30, -mm(52)], [R * 1.45, -mm(60)],
  ], low ? 10 : 16, true), steel, { name: 'dome', cast: false });

  return finalise(T, g, {
    id: 'rebar-bolt', family: 'Rock Bolts, Soil Nails & Cable Bolts / Rock Bolts',
    name: 'Drillity Boltline Resin Rebar Bolt ' + Math.round(diaMm) + ' mm x ' + Math.round(L * 1000) + ' mm',
    diaMm: Math.round(diaMm), lengthMm: Math.round(L * 1000),
    anchorage: 'Fully bonded resin column', toe: 'Chisel paddle for resin mixing',
    installQuality: 'Cartridge count, spin time, and no spinning after gel',
    finish: 'Hot-dip galvanised', standard: 'ASTM F432 (bolts and accessories)',
    torqueRule: 'Where torque-tensioned: at least 50 % of the lesser of bolt yield or rock anchorage',
    connection: 'Rolled thread and dome nut', connectionFamily: 'ground-support',
    material: 'Ribbed reinforcement steel',
    method: 'rockbolt', priceEur: Math.round(4 + diaMm * 0.5 * (L * 1000 / 1000)),
  }, opts);
}

/**
 * A two-component resin cartridge. A film sausage with the catalyst held in a
 * separate strand down the middle, clipped at both ends, colour-coded by set
 * time: the crew reads the colour, never the label. Wear here is age — an old
 * cartridge slumps, weeps and will gel before the bolt is home.
 * opts: { diaMm, lengthMm, speed:'fast'|'slow', wear, lod }
 */
export function buildResinCartridge(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = clampv(opts.diaMm || 25, 18, 40);
  const L = mm(clampv(opts.lengthMm || 600, 200, 1500));
  const speed = opts.speed === 'slow' ? 'slow' : 'fast';
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const g = new T.Group();
  g.name = 'resin-cartridge';
  const film = wearMaterial(ctx, speed === 'slow' ? '__resinSlow' : '__resinFast', wear * 0.6);
  const clip = material(ctx, 'rawSteel');
  const cat = material(ctx, '__calico');

  const R = mm(diaMm) * 0.5;
  // The sausage: gathered at both ends, slumped where it has been lying in a
  // box, and dimpled along one side where the next cartridge pressed into it.
  part(T, g, profiledLathe(T, [
    [mm(2), -mm(6)],
    [R * 0.42, -mm(16)],
    [R * 0.96, -mm(46)],
    [R, -L * 0.5],
    [R * 0.98, -L + mm(46)],
    [R * 0.42, -L + mm(16)],
    [mm(2), -L + mm(6)],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => 1
      + 0.030 * Math.sin(th * 5 + y * 14)
      - 0.055 * wear * Math.max(0, Math.cos(th - 1.2))
      + 0.018 * Math.sin(y * 40),
  }), film, { name: 'cartridge' });
  // the catalyst strand, visible through the film as a paler core line
  part(T, g, G.cyl(T, R * 0.20, R * 0.20, L - mm(70), low ? 7 : 10), cat, {
    p: [R * 0.42, -L * 0.5, 0], name: 'catalyst', cast: false,
  });
  // metal clips at both ends
  for (const y of [-mm(10), -L + mm(10)]) {
    part(T, g, G.box(T, R * 0.9, mm(9), R * 0.28), clip, { p: [0, y, 0], cast: false, name: 'clip' });
  }
  // the set-time band and a length stencil
  part(T, g, G.cyl(T, R * 1.012, R * 1.012, mm(34), seg), material(ctx, 'safetyStripe'), {
    p: [0, -mm(70), 0], cast: false, name: 'speed-band',
  });
  if (wear > 0.55) {
    // a weeping cartridge: resin has crept out of the clip and set on the film
    part(T, g, G.sph(T, R * 0.42, low ? 6 : 9), film, {
      p: [R * 0.5, -mm(26), 0], s: [1, 0.5, 0.8], cast: false, name: 'weep',
    });
  }

  return finalise(T, g, {
    id: 'resin-cartridge', family: 'Rock Bolts, Soil Nails & Cable Bolts / Resin Cartridges',
    name: 'Drillity Boltline Resin Cartridge ' + Math.round(diaMm) + ' x '
      + Math.round(L * 1000) + ' mm (' + speed + ')',
    diaMm: Math.round(diaMm), lengthMm: Math.round(L * 1000), speed: speed,
    system: 'Two-component polyester, catalyst in a separate strand',
    install: 'Pushed to the back of the hole, then the bolt is spun through it',
    failureModes: 'Wrong cartridge count, too little spin, spinning after gel, oversize hole',
    connection: 'None — consumable', connectionFamily: 'none',
    material: 'Filled polyester resin in a laminate film',
    method: 'rockbolt', priceEur: Math.round(2 + diaMm * 0.06 * (L * 1000 / 100)),
  }, opts);
}

/**
 * Cable bolt. Seven-wire prestressing strand, bulbed at intervals so the grout
 * column can grip it, with a barrel-and-wedge anchor and a breather tube taped
 * alongside. Cable bolts exist because the hole is longer than the drive is
 * high: the rig drills it with short rods and then pushes flexible strand up.
 *
 * The strand is a single twisted six-lobe solid rather than six swept tubes —
 * same silhouette, same lay, a fifth of the triangles, and it can be six
 * metres long without costing more than a bit.
 * opts: { lengthMm, strandMm, bulbs, wear, lod }
 */
export function buildCableBolt(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const strandMm = clampv(opts.strandMm || 15.2, 12, 18);
  const L = mm(clampv(opts.lengthMm || 6000, 2000, 20000));
  const bulbs = opts.bulbs === undefined ? Math.max(2, Math.round(L / mm(1500))) : opts.bulbs;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const g = new T.Group();
  g.name = 'cable-bolt';
  const strand = wearMaterial(ctx, 'wornSteel', wear * 0.7);
  const bright = material(ctx, 'rawSteel');
  const galv = material(ctx, '__galv');
  const tubeMat = material(ctx, '__hdpe');

  const R = mm(strandMm) * 0.5;
  const lay = mm(strandMm * 14);       // lay length of a seven-wire strand

  // ── adaptive row spacing: dense where the eye goes (the ends and every
  //    bulb), coarse down the plain middle. 6 m of strand for the price of a
  //    600 mm one. ─────────────────────────────────────────────────────────
  const bulbAt = [];
  for (let i = 0; i < bulbs; i++) bulbAt.push(-L * (i + 1) / (bulbs + 1));
  const near = (y) => {
    let d = Math.min(Math.abs(y), Math.abs(y + L));
    for (const b of bulbAt) d = Math.min(d, Math.abs(y - b));
    return d;
  };
  const fine = low ? lay / 5 : lay / 9;
  const coarse = low ? lay * 1.4 : lay * 0.75;
  const rows = [];
  let y = 0;
  while (y > -L) {
    rows.push(y);
    const d = near(y);
    y -= d < mm(260) ? fine : (d < mm(700) ? fine * 2.2 : coarse);
  }
  rows.push(-L);
  // the bulb envelope: the wires flare apart and close again
  const env = (yy) => {
    let k = 1;
    for (const b of bulbAt) {
      const d = Math.abs(yy - b) / mm(110);
      if (d < 1) k = Math.max(k, 1 + 0.72 * Math.cos(d * Math.PI * 0.5));
    }
    return k;
  };
  const pairs = rows.map((yy) => [R * env(yy), yy]);
  const cols = low ? 14 : 24;
  part(T, g, profiledLathe(T, pairs, {
    segments: cols,
    closedProfile: false,
    // six outer wires laid right-hand around a king wire
    radiusFn: (th, r, yy) => 1 + 0.185 * Math.cos(th * 6 - (yy / lay) * TAU),
  }), strand, { name: 'strand' });
  // caps so the strand is a solid, not a tube
  part(T, g, G.cyl(T, R * 1.18, R * 1.18, mm(4), low ? 10 : 16), strand, { p: [0, -mm(2), 0], cast: false });
  part(T, g, G.cyl(T, R * 1.18, R * 1.18, mm(4), low ? 10 : 16), strand, { p: [0, -L + mm(2), 0], cast: false });

  // ── barrel and wedge anchor at the collar ──────────────────────────────
  part(T, g, G.lathe(T, [
    [R * 1.15, mm(6)], [R * 3.0, mm(6)], [R * 3.0, -mm(24)],
    [R * 2.3, -mm(74)], [R * 1.15, -mm(74)],
  ], low ? 12 : 20, true), bright, { name: 'barrel' });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    part(T, g, G.box(T, R * 1.05, mm(56), R * 0.8), bright, {
      p: [Math.cos(a) * R * 1.28, -mm(30), Math.sin(a) * R * 1.28], r: [0, -a, 0.03], cast: false, name: 'wedge',
    });
  }
  // plate + spherical seat under the barrel
  const plateS = mm(200);
  part(T, g, G.box(T, plateS, mm(10), plateS), galv, { p: [0, -mm(84), 0], name: 'plate' });
  part(T, g, G.lathe(T, [
    [R * 1.2, -mm(76)], [plateS * 0.28, -mm(60)], [plateS * 0.28, -mm(52)], [R * 1.2, -mm(68)],
  ], low ? 10 : 18, true), galv, { cast: false });

  // ── grout and breather tubes taped along the strand ────────────────────
  const gy = [];
  for (let i = 0; i <= (low ? 6 : 16); i++) {
    const u = i / (low ? 6 : 16);
    gy.push([R * 2.1 + Math.sin(u * 9) * R * 0.35, -u * L, Math.cos(u * 7) * R * 0.35]);
  }
  part(T, g, G.tube(T, gy, mm(5), low ? 14 : 34, 5), tubeMat, { name: 'breather-tube' });
  for (let i = 0; i < (low ? 3 : 7); i++) {
    const u = (i + 0.5) / (low ? 3 : 7);
    part(T, g, G.torus(T, R * 1.5, mm(3), 4, low ? 8 : 12), material(ctx, 'safetyStripe'), {
      p: [0, -u * L, 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'tape',
    });
  }

  return finalise(T, g, {
    id: 'cable-bolt', family: 'Rock Bolts, Soil Nails & Cable Bolts / Cable Bolts',
    name: 'Drillity Boltline Bulbed Cable Bolt ' + strandMm + ' mm x '
      + (Math.round(L * 100) / 100).toFixed(1) + ' m',
    strandMm: strandMm, wires: 7, lengthMm: Math.round(L * 1000), bulbs: bulbs,
    pattern: 'Bulbed (birdcaged) strand, grout-encapsulated',
    anchorHead: 'Barrel and three-piece wedge on a domed plate',
    install: 'Pushed up a hole longer than the drive is high, then grouted',
    connection: 'Barrel and wedge', connectionFamily: 'ground-support',
    material: 'Seven-wire prestressing strand',
    method: 'rockbolt', priceEur: Math.round(9 + (L * 1000 / 1000) * 6.2 + bulbs * 2),
  }, opts);
}

/**
 * Weldmesh surface support. The sheet the bolt plate pins to the back, and the
 * thing that tells you the ground is moving: broken or bagged mesh is the
 * first sign of a fall of ground. Modelled as real crossed wires so it reads
 * at a distance and casts the right shadow.
 * opts: { widthMm, heightMm, wireMm, apertureMm, wear, lod }
 */
export function buildMeshSheet(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const W = mm(clampv(opts.widthMm || 2400, 600, 4000));
  const H = mm(clampv(opts.heightMm || 1200, 600, 3000));
  const wire = mm(clampv(opts.wireMm || 5.6, 3, 10));
  const ap = mm(clampv(opts.apertureMm || 100, 50, 200));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 4 : 6;
  const g = new T.Group();
  g.name = 'mesh-sheet';
  const galv = wearMaterial(ctx, '__galv', wear * 0.9);
  const rust = material(ctx, '__mud');

  const nx = Math.max(3, Math.round(W / ap) + 1);
  const ny = Math.max(3, Math.round(H / ap) + 1);
  // A sheet on the back is never flat: it sags between bolts, and where the
  // ground has loaded it, it bags. Both are one displacement function.
  const sag = (x, y) => {
    const u = x / (W * 0.5);
    const v = (y + H * 0.5) / (H * 0.5);
    return -(1 - u * u) * (1 - v * v) * (mm(45) + mm(140) * wear);
  };
  // longitudinal wires
  for (let i = 0; i < nx; i++) {
    const x = lerp(-W * 0.5, W * 0.5, i / (nx - 1));
    const pts = [];
    for (let k = 0; k <= (low ? 3 : 6); k++) {
      const y = -k / (low ? 3 : 6) * H;
      pts.push([x, y, sag(x, y + H * 0.5)]);
    }
    part(T, g, G.tube(T, pts, wire * 0.5, low ? 4 : 8, seg), galv, { name: 'warp', recv: false });
  }
  // transverse wires, welded on the near face so the crossings stand proud
  for (let j = 0; j < ny; j++) {
    const y = -lerp(0, H, j / (ny - 1));
    const pts = [];
    for (let k = 0; k <= (low ? 3 : 6); k++) {
      const x = lerp(-W * 0.5, W * 0.5, k / (low ? 3 : 6));
      pts.push([x, y, sag(x, y + H * 0.5) + wire]);
    }
    part(T, g, G.tube(T, pts, wire * 0.5, low ? 4 : 8, seg), galv, { name: 'weft', recv: false });
  }
  // hemmed edge wire — the sheet is folded over a heavier rod on all four sides
  part(T, g, G.tube(T, [
    [-W * 0.5, 0, sag(-W * 0.5, H * 0.5)], [W * 0.5, 0, sag(W * 0.5, H * 0.5)],
    [W * 0.5, -H, sag(W * 0.5, 0)], [-W * 0.5, -H, sag(-W * 0.5, 0)],
    [-W * 0.5, 0, sag(-W * 0.5, H * 0.5)],
  ], wire * 0.8, low ? 8 : 16, seg, true), galv, { name: 'edge-wire' });

  if (wear > 0.6) {
    // a broken strand and the rock dust caught in the bag: this is the sheet
    // the shift boss stops the crew for
    for (let i = 0; i < 4; i++) {
      part(T, g, G.sph(T, mm(60) + i * mm(18), low ? 5 : 7), rust, {
        p: [lerp(-W * 0.2, W * 0.28, i / 3), -H * 0.55, sag(0, H * 0.1) + mm(70)],
        s: [1, 0.7, 0.6], cast: false, name: 'bagged-fines',
      });
    }
  }

  return finalise(T, g, {
    id: 'mesh-sheet', family: 'Mesh, Surface Support & Grout / Weldmesh',
    name: 'Drillity Boltline Weldmesh ' + Math.round(W * 1000) + ' x ' + Math.round(H * 1000) + ' mm',
    widthMm: Math.round(W * 1000), heightMm: Math.round(H * 1000),
    wireMm: Math.round(wire * 10000) / 10, apertureMm: Math.round(ap * 1000),
    purpose: 'Surface support between bolts; broken or bagged mesh is a ground-fall warning',
    finish: 'Hot-dip galvanised', wires: nx + ny,
    connection: 'Pinned under the bolt plate', connectionFamily: 'ground-support',
    material: 'Welded steel wire mesh',
    method: 'rockbolt', priceEur: Math.round(14 + (W * H) * 1000 * 0.006),
  }, opts);
}

/**
 * A mine bolt plate. Not the SDA domed plate: this is a pressed dish with a
 * square hole and a formed rim, the cheapest part of the system and the one
 * that tells you at a glance whether the bolt is still tight — a plate that
 * has gone slack has moved off the rock.
 * opts: { sideMm, boreMm, wear, lod }
 */
export function buildBoltPlate(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const S = mm(clampv(opts.sideMm || 150, 100, 300));
  const bore = mm(clampv(opts.boreMm || 36, 20, 60)) * 0.5;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  // a multiple of 8 so the stamped corners land on real vertices
  const seg = low ? 16 : 32;
  const g = new T.Group();
  g.name = 'bolt-plate';
  const galv = wearMaterial(ctx, '__galv', wear * 0.9);
  const th = mm(6);
  const rSeat = bore * 1.4;

  // the dish: a square blank pressed into a shallow cone, rim turned down
  const rows = [];
  const steps = low ? 4 : 7;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    rows.push([lerp(bore, S * 0.5, u), -mm(4) - u * mm(30)]);
  }
  for (let i = steps; i >= 0; i--) {
    const u = i / steps;
    rows.push([lerp(bore, S * 0.5, u), -mm(4) - u * mm(30) - th]);
  }
  part(T, g, profiledLathe(T, rows, {
    segments: seg,
    // Squares the dish off. A plate is stamped from square stock: r(a) for a
    // square is h / max(|cos a|, |sin a|), blended in from the round seat so
    // the pressing has the softened corners a real one has.
    radiusFn: (a, r) => {
      if (r <= rSeat) return 1;
      const k = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
      return lerp(1, k, clamp01((r - rSeat) / Math.max(1e-4, S * 0.5 - rSeat)));
    },
  }), galv, { name: 'plate' });
  // the turned rim that stiffens it
  part(T, g, G.torus(T, S * 0.5 * 1.16, mm(5), 4, seg), galv, {
    p: [0, -mm(38), 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'rim',
  });
  // spherical seat washer, so the plate can sit on rock that is not flat
  part(T, g, G.lathe(T, [
    [bore, 0], [bore * 1.9, 0], [bore * 1.75, -mm(16)], [bore, -mm(16)],
  ], seg, true), galv, { name: 'seat', cast: false });
  if (wear > 0.7) {
    part(T, g, G.torus(T, bore * 1.5, mm(4), 4, seg), material(ctx, '__mud'), {
      p: [0, -mm(4), 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'pull-through',
    });
  }

  return finalise(T, g, {
    id: 'bolt-plate', family: 'Rock Bolts, Soil Nails & Cable Bolts / Bolt Plates & Nuts',
    name: 'Drillity Boltline Dished Bolt Plate ' + Math.round(S * 1000) + ' mm',
    sideMm: Math.round(S * 1000), thicknessMm: 6, boreMm: Math.round(bore * 2000),
    form: 'Pressed dish with a turned rim and a spherical seat',
    finish: 'Hot-dip galvanised', standard: 'ASTM F432 (bolts and accessories)',
    connection: 'Under the nut or the friction-bolt collar', connectionFamily: 'ground-support',
    material: 'Pressed steel plate',
    method: 'rockbolt', priceEur: Math.round(3 + S * 1000 * 0.03),
  }, opts);
}

/**
 * The dome nut, with the shear collar that makes a torque wrench unnecessary:
 * the collar turns the bolt until the design tension is reached and then
 * shears off, leaving the nut behind. On a torqued system the first bolt,
 * every tenth bolt and the last bolt of a shift must still be checked.
 * opts: { threadMm, sheared, wear, lod }
 */
export function buildBoltNut(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const threadMm = clampv(opts.threadMm || 24, 16, 40);
  const sheared = !!opts.sheared;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const g = new T.Group();
  g.name = 'bolt-nut';
  const galv = wearMaterial(ctx, '__galv', wear * 0.8);
  const steel = wearMaterial(ctx, 'wornSteel', wear);
  const R = mm(threadMm) * 0.5;
  const af = R * 3.0;

  // the nut body: hex, chamfered top and bottom
  part(T, g, G.lathe(T, [
    [R * 1.02, -mm(3)], [af * 0.577 * 0.92, -mm(3)], [af * 0.577, -mm(9)],
    [af * 0.577, -mm(34)], [af * 0.577 * 0.92, -mm(40)], [R * 1.02, -mm(40)],
  ], 6, true), galv, { name: 'nut' });
  // the dome: this is what makes it a mine nut and not a hardware-shop nut
  part(T, g, G.lathe(T, [
    [0, mm(16)], [R * 1.4, mm(9)], [af * 0.52, -mm(2)], [af * 0.52, -mm(4)], [R * 1.4, mm(3)],
  ], seg, true), galv, { name: 'dome' });
  // female thread visible in the mouth
  part(T, g, threadGeometry(T, {
    major: R, pitch: mm(2.5), depth: mm(1.5), length: mm(36), y0: -mm(3), quality: low ? 0 : 0.4,
  }), steel, { name: 'thread', cast: false });

  if (!sheared) {
    // the shear collar, with the flats the installation socket drives
    part(T, g, G.lathe(T, [
      [R * 1.05, -mm(40)], [af * 0.577 * 0.62, -mm(40)],
      [af * 0.577 * 0.62, -mm(78)], [R * 1.05, -mm(78)],
    ], 6, true), steel, { name: 'shear-collar' });
    // the machined shear groove — the whole design lives in this notch
    part(T, g, G.torus(T, af * 0.577 * 0.56, mm(2.4), 4, seg), steel, {
      p: [0, -mm(42), 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'shear-groove',
    });
  } else {
    part(T, g, G.lathe(T, [
      [R * 1.05, -mm(40)], [af * 0.577 * 0.58, -mm(41)], [af * 0.577 * 0.50, -mm(44)], [R * 1.05, -mm(44)],
    ], seg, true), material(ctx, 'rawSteel'), { name: 'shear-face', cast: false });
  }

  return finalise(T, g, {
    id: 'bolt-nut', family: 'Rock Bolts, Soil Nails & Cable Bolts / Bolt Plates & Nuts',
    name: 'Drillity Boltline Dome Nut M' + Math.round(threadMm) + (sheared ? ' (sheared)' : ' with shear collar'),
    threadMm: Math.round(threadMm), acrossFlatsMm: Math.round(af * 2000),
    shearCollar: !sheared,
    tensionRule: 'Collar shears at the design tension; first, every tenth and last bolt still torque-checked',
    finish: 'Hot-dip galvanised', standard: 'ASTM F432 (bolts and accessories)',
    connection: 'Rolled bolt thread', connectionFamily: 'ground-support',
    material: 'Cold-formed steel nut',
    method: 'rockbolt', priceEur: Math.round(1 + threadMm * 0.14),
  }, opts);
}


/* ═══════════════════════════════════════════════════════════════════════════
   §18 DRIVEN PILING — piles, hammers, helmets

   Nothing in this section has a thread, and that is the point: a pile is
   spliced by welding, a helmet is a loose fit on purpose so the pile can
   rotate off an obstruction, and a hammer connects to nothing but the leader
   guides. Every builder below therefore reports `connectionFamily: 'welded'`,
   'guided' or 'none', and the shop must never file one of them behind a
   percussion thread filter.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A structural section, extruded DOWN the -Y axis from y=0.
 * Feeding it a closed outline in the shape's XY plane gives a pile whose
 * cross-section is the real rolled section, not a box with a nick in it.
 */
function extrudeSectionDown(T, shape, len, seg) {
  const g = new T.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false, curveSegments: seg || 4 });
  g.rotateX(Math.PI / 2);      // extrude axis +Z -> -Y, section lands in XZ
  return g;
}

/**
 * Offset a centreline polyline into a closed constant-thickness outline. This
 * is how a sheet-pile Z profile and its clutch hooks get real wall thickness
 * without hand-listing forty vertices.
 */
function thickPolyShape(T, pts, t) {
  const n = pts.length;
  const nx = [];
  const ny = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l; dy /= l;
    nx.push(-dy);
    ny.push(dx);
  }
  const s = new T.Shape();
  s.moveTo(pts[0][0] + nx[0] * t * 0.5, pts[0][1] + ny[0] * t * 0.5);
  for (let i = 1; i < n; i++) s.lineTo(pts[i][0] + nx[i] * t * 0.5, pts[i][1] + ny[i] * t * 0.5);
  for (let i = n - 1; i >= 0; i--) s.lineTo(pts[i][0] - nx[i] * t * 0.5, pts[i][1] - ny[i] * t * 0.5);
  s.closePath();
  return s;
}

/**
 * Precast reinforced concrete pile. Square with chamfered corners, cast-in
 * lifting loops at the pick-up points, a cast steel driving shoe at the toe,
 * and — this is the wear story — a head that spalls, cracks and finally
 * exposes its links when it has been driven too hard for too long.
 * opts: { sideMm, lengthMm, wear, lod }
 */
export function buildPrecastPile(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const side = mm(clampv(opts.sideMm || 350, 250, 500));
  const L = mm(clampv(opts.lengthMm || 12000, 1500, 30000));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const g = new T.Group();
  g.name = 'precast-pile';
  const conc = wearMaterial(ctx, '__concrete', wear * 0.5);
  const rebar = wearMaterial(ctx, 'wornSteel', wear);
  const cast = material(ctx, 'castIron');

  const h = side * 0.5;
  const ch = side * 0.09;                    // chamfer, on every real pile
  const shoeL = side * 1.1;
  const bodyL = L - shoeL;

  // ── the shaft: an octagon, not a box. The chamfer is what stops a precast
  //    pile reading as a primitive, and it is on the drawing for a reason —
  //    a sharp arris spalls on the first hard blow. ───────────────────────
  const sh = new T.Shape();
  const pts = [
    [-h + ch, -h], [h - ch, -h], [h, -h + ch], [h, h - ch],
    [h - ch, h], [-h + ch, h], [-h, h - ch], [-h, -h + ch],
  ];
  sh.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
  sh.closePath();
  part(T, g, extrudeSectionDown(T, sh, bodyL, 2), conc, { name: 'shaft' });

  /* ── head detail: the spiral links are close-pitched under the helmet ────
     `research/05:132` sources "4 x Ø20-40 mm main bars, links 6-10 mm, cover
     >= 40 mm", and close-pitched links go at BOTH ends of a precast pile, not
     just the head — the toe takes the same concentrated bearing off the shoe
     that the head takes off the dolly. Only the head had them. Both ends now
     do, in the `rebar` bucket that was already open. */
  const links = low ? 4 : 8;
  for (let i = 0; i < links; i++) {
    part(T, g, G.torus(T, h * 0.86, mm(4), 3, low ? 8 : 12), rebar, {
      p: [0, -mm(30) - i * mm(45), 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'link',
    });
  }
  for (let i = 0; i < links; i++) {
    part(T, g, G.torus(T, h * 0.86, mm(4), 3, low ? 8 : 12), rebar, {
      p: [0, -L + side * 1.1 + mm(40) + i * mm(45), 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'toe-link',
    });
  }
  /* Mould seams. With 40 mm of cover the four main bars are buried and would
     be pure hidden geometry — they only ever show at a cropped head, which
     the `exposed-bar` wear case already draws. What IS on the surface of
     every precast pile is the line left by the casting bed, down two opposite
     faces, and it is the one thing that stops a 12 m shaft reading as an
     untextured extrusion at section-band height. In `conc`, so it is free. */
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(9), L * 0.99, mm(5)), conc, {
      p: [(i ? 1 : -1) * (h + mm(1)), -L * 0.5, 0], cast: false, name: 'mould-seam',
    });
  }
  // pile mark band near the head — cast piles are numbered on the bed
  part(T, g, G.box(T, side * 1.005, mm(120), side * 1.005), conc, {
    p: [0, -mm(560), 0], cast: false, name: 'mark-band',
  });
  // driving-face plate cast into the head
  part(T, g, G.box(T, side * 0.94, mm(10), side * 0.94), rebar, { p: [0, -mm(5), 0], name: 'head-plate' });

  // ── lifting loops at the pick-up points ────────────────────────────────
  for (const u of [0.2, 0.8]) {
    const y = -L * u;
    part(T, g, G.torus(T, side * 0.20, mm(11), 4, low ? 8 : 14, Math.PI), rebar, {
      p: [0, y, 0], r: [0, Math.PI / 2, 0], name: 'lifting-loop',
    });
  }
  // splice plate at the head — precast piles are spliced, never threaded
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4;
    part(T, g, G.box(T, mm(60), mm(120), mm(9)), rebar, {
      p: [Math.cos(a) * h * 0.92, -mm(90), Math.sin(a) * h * 0.92], r: [0, -a, 0], cast: false, name: 'splice-plate',
    });
  }

  // ── cast steel driving shoe at the toe ─────────────────────────────────
  const ty = -bodyL;
  const shoe = new T.Shape();
  const sp = pts.map((q) => [q[0] * 1.02, q[1] * 1.02]);
  shoe.moveTo(sp[0][0], sp[0][1]);
  for (let i = 1; i < sp.length; i++) shoe.lineTo(sp[i][0], sp[i][1]);
  shoe.closePath();
  part(T, g, extrudeSectionDown(T, shoe, shoeL * 0.42, 2), cast, { p: [0, ty, 0], name: 'shoe-collar' });
  part(T, g, G.cyl(T, h * 1.0, mm(28), shoeL * 0.62, 4), cast, {
    p: [0, ty - shoeL * 0.42 - shoeL * 0.31, 0], r: [0, Math.PI / 4, 0], name: 'shoe-point',
  });
  part(T, g, G.cyl(T, mm(30), mm(16), shoeL * 0.22, low ? 8 : 12), cast, {
    p: [0, ty - shoeL * 0.94, 0], cast: false, name: 'rock-point',
  });

  // ── wear: a head that has taken 3,000 blows ────────────────────────────
  if (wear > 0.3) {
    for (let i = 0; i < Math.round(wear * 8); i++) {
      const a = (i * 2.399);
      part(T, g, G.sph(T, side * (0.05 + (i % 3) * 0.02), 5), conc, {
        p: [Math.cos(a) * h * 0.92, -mm(40) - (i % 4) * mm(60), Math.sin(a) * h * 0.92],
        s: [1, 1.4, 0.5], cast: false, name: 'spall',
      });
    }
  }
  if (wear > 0.72) {
    // exposed main bars — at this point the pile head has to be cropped
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + Math.PI / 4;
      part(T, g, G.cyl(T, mm(12), mm(12), mm(320), low ? 6 : 9), rebar, {
        p: [Math.cos(a) * h * 0.70, mm(90), Math.sin(a) * h * 0.70], r: [0.05, 0, 0.05], name: 'exposed-bar',
      });
    }
  }

  return finalise(T, g, {
    id: 'precast-pile', family: 'Piling Equipment / Sheet & Bearing Piles / Precast Concrete',
    name: 'Drillity Leaderline Precast Pile ' + Math.round(side * 1000) + ' mm x '
      + (Math.round(L * 10) / 10).toFixed(1) + ' m',
    sideMm: Math.round(side * 1000), lengthMm: Math.round(L * 1000),
    concrete: 'C35/45 to C60/70', mainBars: '4 x 20-40 mm', links: '6-10 mm', coverMm: 40,
    toe: 'Cast steel driving shoe with a rock point',
    pickUpPoints: '0.2 L from head and toe',
    standard: 'EN 12794 (precast concrete piles)',
    connection: 'Welded splice plates — no thread', connectionFamily: 'welded',
    material: 'Precast reinforced concrete, cast steel shoe',
    method: 'driven-pile', priceEur: Math.round((side * 1000) * 0.34 * (L * 1000 / 1000)),
  }, opts);
}

/**
 * Steel tube pile. Open-ended, with a stiffener ring at the toe so the wall
 * does not curl on an obstruction, a longitudinal weld seam and a bevelled top
 * ready for the splice weld. Open end drives easily; the plug then has to come
 * out if the pile is to be concreted.
 * opts: { odMm, wallMm, lengthMm, closed, wear, lod }
 */
export function buildTubePile(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const od = mm(clampv(opts.odMm || 914.4, 168, 1600));
  const wall = mm(clampv(opts.wallMm || 12.5, 6, 30));
  const L = mm(clampv(opts.lengthMm || 12000, 1500, 30000));
  const closed = !!opts.closed;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 18 : 34;
  const g = new T.Group();
  g.name = 'tube-pile';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const bright = wearMaterial(ctx, 'rawSteel', wear * 0.5);
  const bore = material(ctx, '__hole', { color: 0x0A0C0F, roughness: 0.94, metalness: 0.15, side: T.BackSide });

  const ro = od * 0.5;
  const ri = ro - wall;

  part(T, g, pipeGeometry(T, { od: od, id: ri * 2, length: L, seg: seg }), steel, { name: 'tube' });
  // the inside of an open pile is a real hole, and it reads as one
  part(T, g, G.cyl(T, ri, ri, L * 0.98, seg, true), bore, { p: [0, -L * 0.5, 0], cast: false, recv: false });
  // bevelled top for the splice weld
  part(T, g, G.lathe(T, [
    [ri, mm(2)], [ro - wall * 0.25, mm(2)], [ro, -mm(22)], [ri, -mm(22)],
  ], seg, true), bright, { name: 'weld-prep', cast: false });
  // longitudinal seam weld, and the spiral weld on a spirally-formed pile
  part(T, g, G.box(T, mm(16), L * 0.99, mm(5)), bright, { p: [ro, -L * 0.5, 0], cast: false, name: 'seam' });

  // ── toe: stiffener ring (open) or a flat closing plate with a stub ──────
  if (closed) {
    part(T, g, G.cyl(T, ro, ro, wall * 2.2, seg), steel, { p: [0, -L - wall * 1.1, 0], name: 'toe-plate' });
    part(T, g, G.cyl(T, ro * 0.24, ro * 0.10, ro * 0.5, low ? 10 : 16), material(ctx, 'castIron'), {
      p: [0, -L - wall * 2.2 - ro * 0.25, 0], name: 'rock-shoe',
    });
  } else {
    part(T, g, G.lathe(T, [
      [ri - wall * 0.9, -L], [ro, -L], [ro, -L + wall * 6], [ri, -L + wall * 6.6], [ri - wall * 0.9, -L + wall * 1.2],
    ], seg, true), bright, { name: 'stiffener-ring' });
  }
  part(T, g, weldBead(T, ro * 0.998, wall * 0.32, low ? 16 : 28), bright, { p: [0, -L + wall * 6.4, 0], cast: false });

  // driving band: the top 600 mm gets bright and slightly belled under the cap
  part(T, g, G.lathe(T, [
    [ro, -mm(4)], [ro * lerp(1.0, 1.02, wear), -mm(4)],
    [ro * lerp(1.0, 1.02, wear), -mm(600)], [ro, -mm(600)],
  ], seg, true), bright, { cast: false, name: 'driving-band' });
  // lifting eyes, burned out of plate and welded on
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(24), mm(240), mm(140)), bright, {
      p: [(i ? 1 : -1) * ro * 0.99, -mm(900), 0], name: 'lifting-eye',
    });
    part(T, g, G.torus(T, mm(46), mm(16), 4, low ? 10 : 16), bright, {
      p: [(i ? 1 : -1) * ro * 0.99, -mm(820), 0], r: [0, Math.PI / 2, 0], cast: false,
    });
  }

  return finalise(T, g, {
    id: 'tube-pile', family: 'Piling Equipment / Sheet & Bearing Piles / Steel Tube Piles',
    name: 'Drillity Leaderline Tube Pile ' + (Math.round(od * 10000) / 10) + ' x '
      + (Math.round(wall * 10000) / 10) + ' mm',
    odMm: Math.round(od * 10000) / 10, wallMm: Math.round(wall * 10000) / 10,
    lengthMm: Math.round(L * 1000), toe: closed ? 'Closed with a rock shoe' : 'Open with a stiffener ring',
    note: closed ? 'Full end bearing, harder driving'
      : 'Easier driving; the plug must be drilled out if the pile is to be concreted',
    grade: 'S355J2 / S460MH',
    connection: 'Butt-welded splice', connectionFamily: 'welded',
    material: 'Longitudinally or spirally welded steel tube',
    method: 'driven-pile', priceEur: Math.round((od * 1000) * (wall * 1000) * 0.055 * (L * 1000 / 1000) * 0.1),
  }, opts);
}

/**
 * H-pile. Low displacement, the section a vibratory hammer likes best, and the
 * one pile whose real rolled shape — root fillets and tapered flanges — is the
 * entire silhouette.
 * opts: { depthMm, widthMm, flangeMm, webMm, lengthMm, wear, lod }
 */
export function buildHPile(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const d = mm(clampv(opts.depthMm || 310, 150, 400));
  const b = mm(clampv(opts.widthMm || 305, 150, 400));
  const tf = mm(clampv(opts.flangeMm || 20, 8, 40));
  const tw = mm(clampv(opts.webMm || 15, 6, 30));
  const L = mm(clampv(opts.lengthMm || 12000, 1500, 30000));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const g = new T.Group();
  g.name = 'h-pile';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const bright = wearMaterial(ctx, 'rawSteel', wear * 0.4);
  const cast = material(ctx, 'castIron');

  const hd = d * 0.5;
  const hb = b * 0.5;
  const r = tw * 0.85;                 // root fillet
  const s = new T.Shape();
  s.moveTo(-hb, -hd);
  s.lineTo(hb, -hd);
  s.lineTo(hb, -hd + tf);
  s.lineTo(tw * 0.5 + r, -hd + tf);
  s.quadraticCurveTo(tw * 0.5, -hd + tf, tw * 0.5, -hd + tf + r);
  s.lineTo(tw * 0.5, hd - tf - r);
  s.quadraticCurveTo(tw * 0.5, hd - tf, tw * 0.5 + r, hd - tf);
  s.lineTo(hb, hd - tf);
  s.lineTo(hb, hd);
  s.lineTo(-hb, hd);
  s.lineTo(-hb, hd - tf);
  s.lineTo(-tw * 0.5 - r, hd - tf);
  s.quadraticCurveTo(-tw * 0.5, hd - tf, -tw * 0.5, hd - tf - r);
  s.lineTo(-tw * 0.5, -hd + tf + r);
  s.quadraticCurveTo(-tw * 0.5, -hd + tf, -tw * 0.5 - r, -hd + tf);
  s.lineTo(-hb, -hd + tf);
  s.closePath();
  // The root fillets ARE the silhouette of a rolled section, so they get real
  // curve segments at high LOD. Faceted roots read as an extruded box.
  part(T, g, extrudeSectionDown(T, s, L, low ? 2 : 6), steel, { name: 'section' });

  // toe protection: a cast point welded across the flanges
  part(T, g, G.box(T, b * 0.98, mm(28), d * 0.98), cast, { p: [0, -L - mm(14), 0], name: 'toe-plate' });
  part(T, g, G.cyl(T, Math.min(hb, hd) * 0.9, mm(22), d * 0.7, 4), cast, {
    p: [0, -L - mm(28) - d * 0.35, 0], r: [0, Math.PI / 4, 0], name: 'toe-point',
  });
  // head: burned bevel for the splice, and the bright band the cap sits on
  part(T, g, extrudeSectionDown(T, s, mm(420), 2), bright, { p: [0, mm(0.5), 0], s: 0.999, cast: false, name: 'driving-band' });
  // rolling marks and the pick-up hole burned through the web
  for (const u of [0.22, 0.78]) {
    part(T, g, G.cyl(T, mm(38), mm(38), tw * 1.4, low ? 10 : 16),
      material(ctx, '__hole', { color: 0x0A0C0F, roughness: 0.94, metalness: 0.15, side: T.BackSide }),
      { p: [0, -L * u, 0], r: [0, 0, Math.PI / 2], cast: false, recv: false, name: 'pick-up-hole' });
  }

  /* ── EVERYTHING BELOW SHARES A MATERIAL ALREADY ON THE OBJECT ──────────
     A 12 m pile that cost 340 triangles was a bare I-beam extrusion, and at
     the height it spans in the section band that is exactly the "primitive
     left visible as a primitive" the review rubric fails a shot for. The four
     buckets — `steel`, `bright`, `cast`, `__hole` — are fixed; what follows
     buys the three scales of detail the rubric asks for inside them, so it
     costs triangles and not one extra draw call.

     What an H-pile on a real job actually carries:
       - web stiffeners under the cap, or the web buckles on the first hard
         blow. It is the first thing a piling hand looks at.
       - splice plates and their weld runs. `connectionFamily: 'welded'`
         already said so in the spec; now the steel says it too.
       - a bead where the cast toe is welded on.
       - flange curl and a mushroomed head once it has been driven into rock —
         the wear story this pile did not have at all. */

  // web stiffeners each side of the web, under the driving band
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      part(T, g, G.box(T, (b - tw) * 0.44, mm(220), mm(12)), bright, {
        p: [(i ? 1 : -1) * (tw * 0.5 + (b - tw) * 0.24), -mm(240), (j ? 1 : -1) * (hd - tf - mm(60))],
        cast: false, name: 'web-stiffener',
      });
    }
  }
  // splice plates across both flanges plus the web strap, with their weld runs
  for (let j = 0; j < 2; j++) {
    const zf = (j ? 1 : -1) * (hd - tf * 0.5);
    part(T, g, G.box(T, b * 0.86, mm(300), mm(12)), bright, {
      p: [0, -mm(560), zf + (j ? 1 : -1) * (tf * 0.5 + mm(6))], name: 'splice-plate',
    });
    for (const y of [-mm(414), -mm(706)]) {
      part(T, g, G.box(T, b * 0.86, mm(9), mm(15)), bright, {
        p: [0, y, zf + (j ? 1 : -1) * (tf * 0.5 + mm(5))], cast: false, name: 'splice-weld',
      });
    }
  }
  part(T, g, G.box(T, mm(12), mm(260), (d - tf * 2) * 0.62), bright, {
    p: [tw * 0.5 + mm(6), -mm(560), 0], cast: false, name: 'web-strap',
  });
  // the bead that holds the cast toe on
  part(T, g, G.box(T, b * 0.99, mm(16), d * 0.99), cast, {
    p: [0, -L - mm(1), 0], cast: false, name: 'toe-weld',
  });
  // rolled mill marks on the flange faces — the fine scale
  const marks = low ? 0 : 6;
  for (let i = 0; i < marks; i++) {
    part(T, g, G.box(T, b * 0.30, mm(60), mm(4)), steel, {
      p: [(i % 2 ? 1 : -1) * b * 0.24, -L * (0.14 + i * 0.13), (i % 3 ? 1 : -1) * (hd + mm(1))],
      cast: false, name: 'mill-mark',
    });
  }
  // wear: driven into rock, the flange tips curl and the head mushrooms
  if (wear > 0.35) {
    for (let i = 0; i < 4; i++) {
      const sx = i < 2 ? -1 : 1, sz = i % 2 ? 1 : -1;
      part(T, g, G.box(T, b * 0.22, mm(260), tf * 1.5), steel, {
        p: [sx * (hb - b * 0.11), -L + mm(130), sz * (hd - tf * 0.4)],
        r: [0, 0, sx * lerp(0, 0.30, wear)], cast: false, name: 'flange-curl',
      });
    }
    part(T, g, extrudeSectionDown(T, s, mm(70), 2), bright, {
      p: [0, mm(4), 0], s: 1 + wear * 0.04, cast: false, name: 'mushroomed-head',
    });
  }

  return finalise(T, g, {
    id: 'h-pile', family: 'Piling Equipment / Sheet & Bearing Piles / H-Piles',
    name: 'Drillity Leaderline H-Pile ' + Math.round(d * 1000) + ' x ' + Math.round(b * 1000) + ' mm',
    depthMm: Math.round(d * 1000), widthMm: Math.round(b * 1000),
    flangeMm: Math.round(tf * 1000), webMm: Math.round(tw * 1000),
    lengthMm: Math.round(L * 1000),
    displacement: 'Low displacement', note: 'The section a vibratory hammer drives best',
    toe: 'Cast toe point welded across the flanges', grade: 'S355J2',
    connection: 'Butt-welded splice', connectionFamily: 'welded',
    material: 'Hot-rolled H-section',
    method: 'driven-pile', priceEur: Math.round((d * 1000) * 0.42 * (L * 1000 / 1000)),
  }, opts);
}

/**
 * A pair of interlocked Z sheet piles — the way they are delivered, crimped or
 * welded at the clutch. The interlock is the whole product: a sheet-pile wall
 * is only a wall because the clutches thread into one another, and a burst
 * clutch is the failure everyone on site is watching for.
 * opts: { systemWidthMm, heightMm, thicknessMm, lengthMm, wear, lod }
 */
export function buildSheetPilePair(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const b = mm(clampv(opts.systemWidthMm || 630, 400, 800));
  const hgt = mm(clampv(opts.heightMm || 450, 200, 700));
  const t = mm(clampv(opts.thicknessMm || 10, 6, 20));
  const L = mm(clampv(opts.lengthMm || 12000, 2000, 30000));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const g = new T.Group();
  g.name = 'sheet-pile-pair';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const bright = wearMaterial(ctx, 'rawSteel', wear * 0.5);

  const fw = b * 0.24;
  // Centreline of one Z, with a curled hook at each end. Offsetting it gives
  // real wall thickness and a clutch that can be seen to engage.
  const line = [
    [-b * 0.5 + fw * 0.24, hgt * 0.5 - hgt * 0.14],
    [-b * 0.5 + fw * 0.10, hgt * 0.5 - hgt * 0.04],
    [-b * 0.5 + fw * 0.34, hgt * 0.5],
    [-b * 0.5 + fw, hgt * 0.5],
    [b * 0.5 - fw, -hgt * 0.5],
    [b * 0.5 - fw * 0.34, -hgt * 0.5],
    [b * 0.5 - fw * 0.10, -hgt * 0.5 + hgt * 0.04],
    [b * 0.5 - fw * 0.24, -hgt * 0.5 + hgt * 0.14],
  ];
  const shape = thickPolyShape(T, line, t);
  const geo = extrudeSectionDown(T, shape, L, low ? 2 : 3);

  // sheet A, and sheet B rotated 180 deg about Y so their clutches thread
  part(T, g, geo, steel, { p: [0, 0, 0], name: 'sheet-a' });
  part(T, g, geo.clone(), steel, {
    p: [b - fw * 0.30, 0, 0], r: [0, Math.PI, 0], name: 'sheet-b',
  });

  /* ── THE INTERLOCK IS THE PRODUCT, SO IT GETS THE TRIANGLES ────────────
     `research/05` §A4: interlock processing is "pairing, welding or crimping",
     and the failure state everyone on site watches for is a DECLUTCHED
     interlock — "the wall is no longer a wall". A pair whose only interlock
     detail was three dimples could not show either. Everything here is in
     `bright` or `steel`, both already on the object, so the clutch story
     costs triangles and no draw call. */
  // the crimped clutch: dimples that stop the pair sliding apart in the
  // guides while it is pitched
  for (const u of [0.12, 0.5, 0.88]) {
    part(T, g, G.sph(T, t * 1.9, low ? 6 : 9), bright, {
      p: [b * 0.5 - fw * 0.20, -L * u, -hgt * 0.5 + hgt * 0.08], s: [0.5, 1.4, 1], cast: false, name: 'crimp',
    });
  }
  // the clutch seam itself, running the full length: a continuous bright
  // land where the two hooks bear on each other, which is what makes the pair
  // read as threaded together rather than as two sheets standing side by side
  part(T, g, G.box(T, t * 2.4, L * 0.995, t * 3.2), bright, {
    p: [b * 0.5 - fw * 0.24, -L * 0.5, -hgt * 0.5 + hgt * 0.09], cast: false, name: 'clutch-seam',
  });
  // stitch welds along the clutch — how a paired section is actually delivered
  const stitches = low ? 4 : 10;
  for (let i = 0; i < stitches; i++) {
    part(T, g, G.box(T, t * 2.8, mm(90), t * 1.4), bright, {
      p: [b * 0.5 - fw * 0.24, -L * (0.06 + i * 0.92 / Math.max(1, stitches - 1)), -hgt * 0.5 + hgt * 0.13],
      cast: false, name: 'stitch-weld',
    });
  }
  /* WEAR IS A DECLUTCH. Driven out of plumb in hard ground, the hooks spread
     and the pair opens along its length — the one failure the research names
     by name, and it belongs on the object, not in a tooltip. */
  if (wear > 0.45) {
    const spread = t * lerp(0, 5.0, wear);
    part(T, g, G.box(T, t * 1.6, L * 0.42, t * 2.2), steel, {
      p: [b * 0.5 - fw * 0.24 + spread, -L * 0.74, -hgt * 0.5 + hgt * 0.09],
      r: [0, 0, lerp(0, 0.05, wear)], cast: false, name: 'declutch',
    });
    // and the head takes the beating that got it there
    part(T, g, extrudeSectionDown(T, shape, mm(90), 2), steel, {
      p: [0, mm(5), 0], s: 1 + wear * 0.03, cast: false, name: 'battered-head',
    });
  }
  // driving band and the pitching holes burned near the head
  part(T, g, extrudeSectionDown(T, shape, mm(500), 2), bright, { p: [0, mm(0.5), 0], s: 0.998, cast: false });
  part(T, g, extrudeSectionDown(T, shape, mm(500), 2), bright, {
    p: [b - fw * 0.30, mm(0.5), 0], r: [0, Math.PI, 0], s: 0.998, cast: false,
  });
  for (let i = 0; i < 2; i++) {
    part(T, g, G.cyl(T, mm(30), mm(30), t * 3, low ? 8 : 14),
      material(ctx, '__hole', { color: 0x0A0C0F, roughness: 0.94, metalness: 0.15, side: T.BackSide }), {
        p: [i ? b - fw * 0.30 : 0, -mm(180), i ? hgt * 0.32 : -hgt * 0.32],
        r: [Math.PI / 2, 0, 0], cast: false, recv: false, name: 'pitching-hole',
      });
  }
  // toe: sheets are cut square and driven as rolled
  part(T, g, extrudeSectionDown(T, shape, mm(60), 2), bright, { p: [0, -L + mm(60), 0], s: 1.001, cast: false });
  part(T, g, extrudeSectionDown(T, shape, mm(60), 2), bright, {
    p: [b - fw * 0.30, -L + mm(60), 0], r: [0, Math.PI, 0], s: 1.001, cast: false,
  });

  return finalise(T, g, {
    id: 'sheet-pile-pair', family: 'Piling Equipment / Sheet Piles / Z-Profile Pairs',
    name: 'Drillity Leaderline Z Sheet Pile Pair ' + Math.round(b * 1000) + ' mm',
    systemWidthMm: Math.round(b * 1000), sectionHeightMm: Math.round(hgt * 1000),
    thicknessMm: Math.round(t * 1000), lengthMm: Math.round(L * 1000),
    pairWidthMm: Math.round(b * 2000), profile: 'Z',
    interlock: 'Crimped clutch pair, threaded and driven as one unit',
    install: 'Panel-driven from guide frames, or pitch and drive',
    grade: 'S355GP / S430GP',
    connection: 'Rolled clutch interlock', connectionFamily: 'interlock',
    material: 'Hot-rolled steel sheet pile',
    method: 'driven-pile', priceEur: Math.round((b * 1000) * 0.5 * (L * 1000 / 1000)),
  }, opts);
}

/** Hydraulic impact hammer classes, ram block to energy. */
const IMPACT_HAMMER = {
  3000:  { kNm: 35,  strokeMm: 1200, bpm: '40-100', lenMm: 5400,  massKg: 6900 },
  9000:  { kNm: 106, strokeMm: 1200, bpm: '40-100', lenMm: 7100,  massKg: 17800 },
  16000: { kNm: 235, strokeMm: 1500, bpm: '30-100', lenMm: 8800,  massKg: 30500 },
  30000: { kNm: 441, strokeMm: 1500, bpm: '30-100', lenMm: 10400, massKg: 46700 },
};

/**
 * Hydraulic impact pile hammer. A steel box longer than it is wide, sliding on
 * the leader guides, with the ram block visible through the inspection slot,
 * the accumulator and cylinder on top, and a drive cap at the foot.
 *
 * The ram is left as its own node (`userData.ram`, flagged dynamic so the
 * merger keeps it) because the rig factory drives it: the strike is the single
 * most important motion in the whole piling vertical.
 * opts: { ramKg, wear, lod }
 */
export function buildImpactHammer(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const keys = [3000, 9000, 16000, 30000];
  let ramKg = opts.ramKg || 9000;
  ramKg = keys.reduce((a, b) => (Math.abs(b - ramKg) < Math.abs(a - ramKg) ? b : a), keys[0]);
  const hm = IMPACT_HAMMER[ramKg];
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 10 : 16;
  const g = new T.Group();
  g.name = 'impact-hammer';
  const paint = material(ctx, 'paintedSteel');
  const dark = material(ctx, 'paintedSteel', { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const chrome = material(ctx, 'chrome');
  const hose = material(ctx, 'hose');

  const L = mm(hm.lenMm);
  const W = mm(Math.round(520 + ramKg * 0.026));
  const D = W * 0.86;

  // ── housing ────────────────────────────────────────────────────────────
  part(T, g, G.roundedBox(T, W, L * 0.86, D, W * 0.06, 2), paint, { p: [0, -L * 0.43 - mm(120), 0], name: 'housing' });
  part(T, g, G.roundedBox(T, W * 1.04, mm(160), D * 1.04, W * 0.05, 2), dark, { p: [0, -mm(80), 0], name: 'top-cap' });
  // bolted side plates — a hammer is a bolted assembly and it looks like one
  for (let s = -1; s <= 1; s += 2) {
    part(T, g, G.box(T, mm(22), L * 0.80, D * 0.90), dark, { p: [s * W * 0.5, -L * 0.44 - mm(120), 0], cast: false });
    const nb = low ? 5 : 11;
    for (let i = 0; i < nb; i++) {
      part(T, g, G.cyl(T, mm(24), mm(24), mm(26), 6), steel, {
        p: [s * (W * 0.5 + mm(12)), -mm(280) - i * (L * 0.74) / nb, D * 0.30],
        r: [0, 0, Math.PI / 2], cast: false, name: 'bolt',
      });
      part(T, g, G.cyl(T, mm(24), mm(24), mm(26), 6), steel, {
        p: [s * (W * 0.5 + mm(12)), -mm(280) - i * (L * 0.74) / nb, -D * 0.30],
        r: [0, 0, Math.PI / 2], cast: false,
      });
    }
  }
  // ── the guide jaws that ride the leader ────────────────────────────────
  for (let i = 0; i < 2; i++) {
    const y = -mm(420) - i * L * 0.52;
    part(T, g, G.box(T, W * 0.5, mm(320), mm(150)), dark, { p: [0, y, -D * 0.62], name: 'guide-jaw' });
    for (let s = -1; s <= 1; s += 2) {
      part(T, g, G.box(T, mm(70), mm(300), mm(190)), steel, {
        p: [s * W * 0.24, y, -D * 0.74], cast: false, name: 'guide-shoe',
      });
    }
  }
  // ── inspection slot with the ram visible behind it ─────────────────────
  const slotY = -L * 0.40;
  part(T, g, G.box(T, W * 0.30, L * 0.34, mm(20)), material(ctx, '__hole', {
    color: 0x0A0C0F, roughness: 0.94, metalness: 0.15, side: T.BackSide,
  }), { p: [0, slotY, D * 0.5], cast: false, recv: false, name: 'slot' });
  const ram = group(T, g, 'ram', { p: [0, slotY + L * 0.10, 0], dynamic: true });
  part(T, ram, G.box(T, W * 0.62, L * 0.30, D * 0.58), steel, { name: 'ram-block' });
  part(T, ram, G.box(T, W * 0.66, mm(40), D * 0.62), material(ctx, 'safetyStripe'), {
    p: [0, L * 0.155, 0], cast: false, name: 'ram-marker',
  });
  part(T, ram, G.cyl(T, W * 0.13, W * 0.13, L * 0.16, seg), chrome, { p: [0, L * 0.21, 0], name: 'ram-rod' });

  // ── cylinder, accumulator and the hose block on top ────────────────────
  part(T, g, G.cyl(T, W * 0.26, W * 0.26, mm(760), seg), dark, { p: [0, mm(300), 0], name: 'cylinder' });
  part(T, g, G.capsule(T, W * 0.16, mm(420), seg), material(ctx, 'paintedSteel', {
    color: 0x3F92A6, roughness: 0.5, metalness: 0.34,
  }), { p: [W * 0.44, mm(280), D * 0.18], name: 'accumulator' });
  part(T, g, G.roundedBox(T, W * 0.5, mm(220), D * 0.4, mm(20), 2), dark, { p: [-W * 0.34, mm(180), -D * 0.20] });
  for (let i = 0; i < 2; i++) {
    part(T, g, G.tube(T, [
      [-W * 0.34 + (i ? 1 : -1) * mm(70), mm(280), -D * 0.20],
      [-W * 0.60, mm(620), -D * 0.60],
      [-W * 0.30, mm(980), -D * 1.30],
    ], mm(34), low ? 8 : 14, low ? 5 : 7), hose, { name: 'hose' });
  }
  // lifting eye — the hammer winch picks it up here
  part(T, g, G.box(T, mm(40), mm(220), mm(160)), steel, { p: [0, mm(700), 0], name: 'lifting-eye' });
  part(T, g, G.torus(T, mm(72), mm(24), 4, seg), steel, { p: [0, mm(790), 0], r: [0, Math.PI / 2, 0] });
  part(T, g, G.box(T, W * 0.7, mm(220), mm(8)), material(ctx, 'brandedPanel'), {
    p: [0, -mm(420), D * 0.5 + mm(4)], cast: false, name: 'plate',
  });
  part(T, g, G.box(T, W * 1.02, mm(180), mm(10)), material(ctx, 'safetyStripe'), {
    p: [0, -L * 0.86 - mm(60), D * 0.5], cast: false,
  });

  // ── drive cap at the foot ──────────────────────────────────────────────
  const capY = -L * 0.86 - mm(120);
  part(T, g, G.box(T, W * 1.12, mm(220), D * 1.12), steel, { p: [0, capY, 0], name: 'anvil' });
  part(T, g, G.box(T, W * 0.94, mm(160), D * 0.94), material(ctx, 'castIron'), { p: [0, capY - mm(190), 0], name: 'drive-cap' });

  const out = finalise(T, g, {
    id: 'impact-hammer', family: 'Piling Equipment / Impact Hammers',
    name: 'Drillity Leaderline Hydraulic Hammer ' + (ramKg / 1000) + ' t',
    ramKg: ramKg, maxEnergyKNm: hm.kNm, strokeMm: hm.strokeMm, blowRateMin: hm.bpm,
    lengthMm: hm.lenMm, massKg: hm.massKg,
    energyRange: 'Energy is adjustable across the full blow-rate band; start soft, finish hard',
    energyTransfer: 'Over 95 % through a drive cap that concentrates the blow on the pile centre',
    systemEfficiency: 'Hydraulic 65-90 %, winch drop 40-55 %, diesel 20-80 %',
    ramModular: true,
    connection: 'Rides the leader guides; drive cap to the pile', connectionFamily: 'guided',
    material: 'Fabricated steel housing, forged ram block',
    method: 'driven-pile', priceEur: Math.round(48000 + ramKg * 19),
  }, opts);
  out.userData.ram = ram;
  return out;
}

/**
 * Vibratory hammer. Counter-rotating eccentrics in a case, a suppressor of
 * rubber elements above them so the crane or the leader does not shake itself
 * apart, and a hydraulic clamp at the bottom that grips the pile head. It is
 * also the best extraction tool there is.
 * opts: { forceKn, rpm, massKg, wear, lod }
 */
export function buildVibratoryHammer(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const forceKn = clampv(opts.forceKn || 1500, 200, 3000);
  const rpm = opts.rpm || 2500;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const g = new T.Group();
  g.name = 'vibratory-hammer';
  const paint = material(ctx, 'paintedSteel');
  const dark = material(ctx, 'paintedSteel', { color: 0x232A33, roughness: 0.62, metalness: 0.34 });
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const rubber = material(ctx, 'rubber');
  const chrome = material(ctx, 'chrome');

  const k = Math.pow(forceKn / 1500, 0.34);
  const W = mm(1050) * k;
  const H = mm(1150) * k;
  const D = mm(620) * k;

  // ── suppressor: rubber elements between the head and the exciter ───────
  part(T, g, G.roundedBox(T, W * 0.86, mm(180) * k, D * 0.9, mm(24), 2), paint, { p: [0, -mm(90) * k, 0], name: 'suspension-head' });
  part(T, g, G.box(T, mm(70) * k, mm(260) * k, mm(180) * k), steel, { p: [0, mm(120) * k, 0], name: 'suspension-eye' });
  part(T, g, G.torus(T, mm(90) * k, mm(30) * k, 4, seg), steel, { p: [0, mm(230) * k, 0], r: [0, Math.PI / 2, 0] });
  for (let i = 0; i < 4; i++) {
    const c = [[-1, -1], [1, -1], [-1, 1], [1, 1]][i];
    part(T, g, G.cyl(T, mm(90) * k, mm(90) * k, mm(210) * k, seg), rubber, {
      p: [c[0] * W * 0.32, -mm(290) * k, c[1] * D * 0.30], name: 'suppressor-element',
    });
    part(T, g, G.cyl(T, mm(28) * k, mm(28) * k, mm(300) * k, low ? 8 : 12), chrome, {
      p: [c[0] * W * 0.32, -mm(290) * k, c[1] * D * 0.30], cast: false,
    });
  }

  // ── exciter case with the eccentric housings showing through ───────────
  const ey = -mm(560) * k - H * 0.5;
  part(T, g, G.roundedBox(T, W, H, D, mm(30), 2), paint, { p: [0, ey, 0], name: 'exciter-case' });
  const pairs = forceKn >= 1200 ? 3 : 2;
  for (let i = 0; i < pairs * 2; i++) {
    const x = lerp(-W * 0.36, W * 0.36, (i + 0.5) / (pairs * 2));
    part(T, g, G.cyl(T, H * 0.30, H * 0.30, D * 1.02, seg), dark, {
      p: [x, ey, 0], r: [Math.PI / 2, 0, 0], name: 'eccentric-housing',
    });
    // Cover bolts on the case face. Merged rather than instanced on purpose:
    // six InstancedMeshes would be six draw calls for a shop item, while six
    // merged hex heads fall into a bucket the case already owns.
    const nb = low ? 4 : 8;
    for (let j = 0; j < nb; j++) {
      const a = (j / nb) * TAU + i * 0.4;
      part(T, g, G.cyl(T, mm(15) * k, mm(15) * k, mm(18) * k, 6), steel, {
        p: [x + Math.cos(a) * H * 0.24, ey + Math.sin(a) * H * 0.24, D * 0.52],
        r: [Math.PI / 2, 0, a], cast: false, name: 'cover-bolt',
      });
    }
  }
  // hydraulic motors and the hose block
  for (let i = 0; i < 2; i++) {
    part(T, g, G.cyl(T, mm(130) * k, mm(130) * k, mm(300) * k, seg), dark, {
      p: [(i ? 1 : -1) * W * 0.36, ey + H * 0.34, -D * 0.62], r: [Math.PI / 2, 0, 0], name: 'motor',
    });
  }
  part(T, g, G.roundedBox(T, W * 0.4, mm(220) * k, D * 0.34, mm(18), 2), dark, { p: [0, ey + H * 0.42, -D * 0.66] });
  for (let i = 0; i < 3; i++) {
    part(T, g, G.tube(T, [
      [(i - 1) * mm(130) * k, ey + H * 0.5, -D * 0.70],
      [(i - 1) * mm(190) * k, ey + H * 1.15, -D * 1.30],
      [(i - 1) * mm(120) * k, ey + H * 1.9, -D * 1.70],
    ], mm(30) * k, low ? 8 : 14, low ? 5 : 7), material(ctx, 'hose'), { name: 'hose' });
  }

  // ── the clamp: what actually grips the pile ────────────────────────────
  const cy = ey - H * 0.5;
  part(T, g, G.roundedBox(T, W * 0.86, mm(300) * k, D * 0.92, mm(20), 2), dark, { p: [0, cy - mm(150) * k, 0], name: 'clamp-body' });
  part(T, g, G.cyl(T, mm(120) * k, mm(120) * k, W * 0.86, seg), chrome, {
    p: [0, cy - mm(150) * k, D * 0.28], r: [0, 0, Math.PI / 2], name: 'clamp-cylinder',
  });
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(160) * k, mm(380) * k, mm(120) * k), steel, {
      p: [(i ? 1 : -1) * W * 0.20, cy - mm(430) * k, 0], name: 'clamp-jaw',
    });
    // the serrated grip face — a smooth jaw would drop the pile
    for (let j = 0; j < (low ? 3 : 7); j++) {
      part(T, g, G.box(T, mm(24) * k, mm(300) * k, mm(24) * k), steel, {
        p: [(i ? 1 : -1) * (W * 0.20 - mm(80) * k), cy - mm(430) * k, lerp(-mm(48) * k, mm(48) * k, j / Math.max(1, (low ? 3 : 7) - 1))],
        r: [0, 0, 0.5], cast: false, name: 'grip-tooth',
      });
    }
  }
  part(T, g, G.box(T, W * 0.7, mm(200) * k, mm(8)), material(ctx, 'brandedPanel'), {
    p: [0, ey + H * 0.2, D * 0.5 + mm(4)], cast: false, name: 'plate',
  });

  return finalise(T, g, {
    id: 'vibratory-hammer', family: 'Piling Equipment / Vibratory Hammers',
    name: 'Drillity Leaderline Vibrator ' + Math.round(forceKn) + ' kN',
    centrifugalForceKn: Math.round(forceKn), rpm: rpm,
    massKg: opts.massKg || Math.round(forceKn * 3.4),
    eccentricPairs: pairs, clamp: 'Hydraulic, automatic clamp-coupling system',
    suppressor: 'Rubber element pack between the exciter and the suspension',
    bestIn: 'Granular soils and low-displacement sections; poor in stiff clay',
    alsoExtracts: true,
    connection: 'Leader-mounted or free-hanging; clamps the pile head', connectionFamily: 'guided',
    material: 'Cast and fabricated steel, elastomer suppressor elements',
    method: 'driven-pile', priceEur: Math.round(52000 + forceKn * 84),
  }, opts);
}

/**
 * The pile helmet, its dolly and the packing. Three consumables in one
 * assembly, and the rule a driller will check you know: the helmet must NOT be
 * a tight fit on the pile head — it has to let the pile rotate when it hits an
 * obstruction. The dolly crushes and chars as it works, which changes the
 * energy that reaches the pile, so `wear` here is a real performance curve.
 * opts: { pileMm, square, wear, lod }
 */
export function buildPileHelmet(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const pileMm = clampv(opts.pileMm || 350, 200, 900);
  const square = opts.square !== false;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const g = new T.Group();
  g.name = 'pile-helmet';
  const cast = material(ctx, 'castIron');
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.8);
  const dollyMat = wearMaterial(ctx, '__urethane', wear);
  const packing = wearMaterial(ctx, '__calico', wear);

  const p = mm(pileMm);
  const clear = mm(pileMm * 0.06);          // the deliberate slack fit
  const outer = p + clear * 2 + mm(70);
  const skirtH = mm(pileMm * 0.72);

  const box = (w, h, d, y, mat, o) => part(T, g, G.roundedBox(T, w, h, d, mm(14), 2), mat,
    Object.assign({ p: [0, y, 0] }, o || {}));
  const cyl = (r, h, y, mat, o) => part(T, g, G.cyl(T, r, r, h, seg), mat,
    Object.assign({ p: [0, y, 0] }, o || {}));

  // ── top plate the hammer strikes ───────────────────────────────────────
  if (square) box(outer, mm(90), outer, -mm(45), steel, { name: 'top-plate' });
  else cyl(outer * 0.5, mm(90), -mm(45), steel, { name: 'top-plate' });

  // ── the dolly, sitting in a recess, coloured so it is obviously not steel ─
  const dollyH = mm(pileMm * 0.30) * lerp(1, 0.55, wear);
  if (square) box(p * 0.86, dollyH, p * 0.86, -mm(90) - dollyH * 0.5, dollyMat, { name: 'dolly' });
  else cyl(p * 0.43, dollyH, -mm(90) - dollyH * 0.5, dollyMat, { name: 'dolly' });
  // the retaining ring that stops the dolly walking out
  part(T, g, G.torus(T, p * 0.50, mm(16), 4, seg), steel, { p: [0, -mm(96), 0], r: [Math.PI / 2, 0, 0], cast: false });

  // ── the skirt, with the clearance visible ──────────────────────────────
  const sy = -mm(90) - dollyH;
  const wall = mm(46);
  if (square) {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU;
      part(T, g, G.box(T, p + clear * 2 + wall * 2, skirtH, wall), cast, {
        p: [Math.sin(a) * (p * 0.5 + clear + wall * 0.5), sy - skirtH * 0.5, Math.cos(a) * (p * 0.5 + clear + wall * 0.5)],
        r: [0, a, 0], name: 'skirt',
      });
    }
  } else {
    part(T, g, pipeGeometry(T, { od: p + clear * 2 + wall * 2, id: p + clear * 2, length: skirtH, y0: sy, seg: seg }),
      cast, { name: 'skirt' });
  }
  // packing between the helmet and the pile head
  if (square) box(p * 0.98, mm(34), p * 0.98, sy - mm(17), packing, { name: 'packing', cast: false });
  else cyl(p * 0.49, mm(34), sy - mm(17), packing, { name: 'packing', cast: false });

  // ── lifting lugs and a pair of guide horns for the leader ──────────────
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(28), mm(190), mm(120)), steel, {
      p: [(i ? 1 : -1) * outer * 0.5, -mm(20), 0], name: 'lug',
    });
    part(T, g, G.torus(T, mm(46), mm(15), 4, low ? 10 : 16), steel, {
      p: [(i ? 1 : -1) * outer * 0.5, mm(50), 0], r: [0, Math.PI / 2, 0], cast: false,
    });
    part(T, g, G.box(T, mm(140), skirtH * 0.7, mm(60)), cast, {
      p: [(i ? 1 : -1) * (p * 0.5 + clear + wall + mm(60)), sy - skirtH * 0.4, -outer * 0.4],
      cast: false, name: 'guide-horn',
    });
  }
  if (wear > 0.55) {
    // a charred, extruded dolly: the driller's cue that the set is a lie
    part(T, g, G.torus(T, p * 0.46, mm(22) * wear, 4, seg), dollyMat, {
      p: [0, -mm(90) - dollyH, 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'extruded-dolly',
    });
  }

  return finalise(T, g, {
    id: 'pile-helmet', family: 'Piling Equipment / Helmets & Drive Caps',
    name: 'Drillity Leaderline Pile Helmet ' + Math.round(pileMm) + ' mm '
      + (square ? 'square' : 'round'),
    pileMm: Math.round(pileMm), form: square ? 'square' : 'round',
    clearanceMm: Math.round(clear * 1000),
    fitRule: 'Must NOT be tight on the pile head — the pile has to rotate off an obstruction',
    dolly: 'Plastic or hardwood cap block, end-on to the grain',
    packing: 'Coiled rope, hessian, thin timber or coconut matting',
    consumable: 'Dolly resilience changes with use, and with it the energy reaching the pile',
    connection: 'Slip fit over the pile head', connectionFamily: 'none',
    material: 'Cast steel helmet, resilient dolly, soft packing',
    method: 'driven-pile', priceEur: Math.round(1800 + pileMm * 12),
  }, opts);
}

/**
 * Driving cap for a steel section. Unlike a concrete helmet there is no dolly:
 * the cap registers on the pile with a spigot (a tube) or a slot (an H-pile)
 * and takes the blow straight through steel to steel.
 * opts: { pileMm, kind:'tube'|'h', wear, lod }
 */
export function buildDriveCap(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const kind = opts.kind === 'h' ? 'h' : 'tube';
  const pileMm = clampv(opts.pileMm || (kind === 'h' ? 310 : 610), 150, 1500);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 30;
  const g = new T.Group();
  g.name = 'drive-cap';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const cast = material(ctx, 'castIron');
  const bright = material(ctx, 'rawSteel');

  const p = mm(pileMm);
  const outer = p * 1.30;

  // hammer face: a thick forged plate, upset and bright where it is struck
  part(T, g, G.cyl(T, outer * 0.5, outer * 0.5, mm(150), seg), steel, { p: [0, -mm(75), 0], name: 'body' });
  part(T, g, G.cyl(T, outer * 0.46, outer * 0.46, mm(26), seg), bright, { p: [0, -mm(6), 0], cast: false, name: 'strike-face' });
  part(T, g, G.torus(T, outer * 0.5, mm(16), 4, seg), steel, { p: [0, -mm(150), 0], r: [Math.PI / 2, 0, 0], cast: false });

  if (kind === 'tube') {
    // an internal register that drops inside the tube, and an outer skirt
    part(T, g, pipeGeometry(T, { od: outer, id: p * 1.03, length: mm(320), y0: -mm(150), seg: seg }), cast, { name: 'skirt' });
    part(T, g, pipeGeometry(T, { od: p * 0.94, id: p * 0.78, length: mm(260), y0: -mm(150), seg: seg }), cast, { name: 'register' });
    part(T, g, G.lathe(T, [
      [p * 0.39, -mm(410)], [p * 0.47, -mm(380)], [p * 0.47, -mm(410)],
    ], seg, true), bright, { cast: false });
  } else {
    // an H-pile cap is a slot, and it only fits one section
    const d = p;
    const b = p * 0.98;
    for (let i = 0; i < 2; i++) {
      part(T, g, G.box(T, b * 1.22, mm(300), mm(60)), cast, {
        p: [0, -mm(300), (i ? 1 : -1) * (d * 0.5 + mm(30))], name: 'slot-wall',
      });
      part(T, g, G.box(T, mm(60), mm(300), d * 1.1), cast, {
        p: [(i ? 1 : -1) * (b * 0.5 + mm(30)), -mm(300), 0], name: 'slot-end',
      });
    }
    part(T, g, G.box(T, b * 0.44, mm(240), mm(40)), cast, { p: [0, -mm(290), 0], cast: false, name: 'web-register' });
  }
  // lifting lugs
  for (let i = 0; i < 2; i++) {
    part(T, g, G.box(T, mm(24), mm(150), mm(100)), steel, {
      p: [(i ? 1 : -1) * outer * 0.5, -mm(60), 0], name: 'lug',
    });
    part(T, g, G.torus(T, mm(38), mm(13), 4, low ? 10 : 16), steel, {
      p: [(i ? 1 : -1) * outer * 0.5, mm(10), 0], r: [0, Math.PI / 2, 0], cast: false,
    });
  }

  return finalise(T, g, {
    id: 'drive-cap', family: 'Piling Equipment / Helmets & Drive Caps',
    name: 'Drillity Leaderline Drive Cap ' + Math.round(pileMm) + ' mm '
      + (kind === 'h' ? 'H-pile' : 'tube'),
    pileMm: Math.round(pileMm), kind: kind,
    register: kind === 'h' ? 'Machined slot to the section' : 'Internal spigot and outer skirt',
    energyTransfer: 'Steel to steel; concentrates the blow on the pile centre',
    connection: 'Slip fit over the pile head', connectionFamily: 'none',
    material: 'Cast and forged steel',
    method: 'driven-pile', priceEur: Math.round(1400 + pileMm * 9),
  }, opts);
}


/* ═══════════════════════════════════════════════════════════════════════════
   §19 SITE INVESTIGATION — driven, pushed, and never cut

   The taxonomy trap this section exists to close: an SPT split-spoon and a CPT
   cone are NOT drill bits. One is DRIVEN by a 63.5 kg hammer falling 760 mm and
   the number of blows is the test; the other is PUSHED at a constant 20 mm/s
   and never sees a rotation. Nothing here cuts rock, nothing here carries a
   percussion thread, and every builder reports its `action` so the shop can
   file it under Site Investigation & Testing rather than behind a bit filter.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * SPT split-barrel sampler. Two half-barrels held between a hardened drive
 * shoe and a vented head with a ball check: unscrew the shoe and the barrel
 * opens along its length so the sample can be logged. 50.8 mm OD recovering a
 * 34.9 mm sample — an area ratio of about 110 %, which is why every
 * split-spoon sample is a disturbed one.
 * opts: { odMm, barrelMm, wear, lod }
 */
export function buildSPTSplitSpoon(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const od = mm(opts.odMm || 50.8);
  const id = mm(34.9);
  const barrelL = mm(clampv(opts.barrelMm || 457, 300, 760));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const g = new T.Group();
  g.name = 'spt-split-spoon';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const hard = wearMaterial(ctx, 'rawSteel', wear);
  const bore = material(ctx, '__hole', { color: 0x0A0C0F, roughness: 0.94, metalness: 0.15, side: T.BackSide });
  const ball = material(ctx, 'chrome');

  const ro = od * 0.5;
  const ri = id * 0.5;

  // ── head: rod coupling, vent ports and the ball check ──────────────────
  const headL = mm(120);
  part(T, g, profiledLathe(T, [
    [ri * 0.7, 0], [ro * 1.10, 0], [ro * 1.10, -mm(52)],
    [ro, -mm(66)], [ro, -headL], [ri * 0.7, -headL],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (y < -mm(50) || r < ro) return 1;
      const a = ((th * 2) % TAU + TAU) % TAU;      // two wrench flats
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.075 * Math.max(0, 1 - d * 2.4);
    },
  }), steel, { name: 'head' });
  addBoxThread(T, ctx, g, 'API238', { y0: -mm(4), length: mm(44), quality: low ? 0 : 0.4 });
  // four vent ports — water and air have to leave as the sample comes in, or
  // the spoon rides on a trapped column and the blow count lies
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    flushHole(T, ctx, g, {
      x: Math.cos(a) * ro * 0.99, y: -mm(88), z: Math.sin(a) * ro * 0.99,
      r: mm(5), dir: [Math.cos(a), 0.15, Math.sin(a)], seg: low ? 7 : 10, chamferMat: hard,
    });
  }
  part(T, g, G.sph(T, mm(11), low ? 8 : 12), ball, { p: [0, -mm(72), 0], name: 'ball-check' });

  // ── the split barrel: two halves with a visible parting line ───────────
  const by = -headL;
  const gap = mm(1.6);
  for (let s = -1; s <= 1; s += 2) {
    part(T, g, arcSector(T, {
      rIn: ri, rOut: ro, a0: (s < 0 ? gap / ro : Math.PI + gap / ro),
      a1: (s < 0 ? Math.PI - gap / ro : TAU - gap / ro), h: barrelL, seg: seg,
    }), steel, { p: [0, by - barrelL, 0], name: 'half-barrel' });
  }
  part(T, g, G.cyl(T, ri, ri, barrelL, seg, true), bore, {
    p: [0, by - barrelL * 0.5, 0], cast: false, recv: false, name: 'sample-bore',
  });
  // the retaining bands that hold the halves together in the hole
  for (const u of [0.12, 0.88]) {
    part(T, g, G.torus(T, ro * 1.03, mm(4), 4, low ? 12 : 20), hard, {
      p: [0, by - barrelL * u, 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'band',
    });
  }

  // ── drive shoe: hardened, bevelled, and the first thing to blunt ───────
  const sy = by - barrelL;
  const shoeL = mm(76);
  const edge = lerp(mm(1.2), mm(4.0), wear);        // a blunt shoe reads high
  part(T, g, G.lathe(T, [
    [ri, 0], [ro, 0], [ro, -shoeL * 0.42],
    [ri + edge, -shoeL], [ri, -shoeL],
  ], seg, true), hard, { p: [0, sy, 0], name: 'drive-shoe' });
  part(T, g, G.torus(T, ro * 1.005, mm(3), 4, low ? 12 : 20), hard, {
    p: [0, sy - mm(4), 0], r: [Math.PI / 2, 0, 0], cast: false,
  });
  // the basket core catcher some spoons run in sand
  for (let i = 0; i < (low ? 5 : 9); i++) {
    const a = (i / (low ? 5 : 9)) * TAU;
    part(T, g, G.box(T, mm(4), mm(34), mm(1.4)), hard, {
      p: [Math.cos(a) * ri * 0.86, sy - mm(20), Math.sin(a) * ri * 0.86],
      r: [0.32, -a, 0], cast: false, name: 'catcher-finger',
    });
  }
  // the 150 mm drive marks a driller reads off the rods
  for (let i = 1; i <= 3; i++) {
    part(T, g, G.torus(T, ro * 1.01, mm(1.6), 3, low ? 10 : 16), material(ctx, 'safetyStripe'), {
      p: [0, by - barrelL * (i / 3.4), 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'drive-mark',
    });
  }

  return finalise(T, g, {
    id: 'spt-split-spoon', family: 'Site Investigation & Testing / SPT Samplers & Hammers',
    name: 'Drillity Probeline SPT Split-Spoon ' + (Math.round(od * 10000) / 10) + ' mm',
    action: 'driven', odMm: Math.round(od * 10000) / 10, idMm: 34.9,
    barrelMm: Math.round(barrelL * 1000), areaRatioPct: 110,
    driveMm: 450, seatingMm: 150, testMm: 300,
    hammerKg: 63.5, dropMm: 760,
    counting: 'ASTM: three 150 mm increments, N is the sum of the second and third',
    sampleQuality: 'Sampling category B, quality class 4 — disturbed',
    standard: 'ASTM D1586 / EN ISO 22476-3',
    connection: 'A-rod / N-rod drive coupling', connectionFamily: 'drive-rod',
    material: 'Case-hardened split barrel, hardened drive shoe',
    method: 'site-investigation', priceEur: 420,
  }, opts);
}

/**
 * The 63.5 kg automatic trip hammer. On a real SPT the hammer IS the
 * instrument: the blow count only means anything if 63.5 kg fell 760 mm in
 * free fall, which is why the automatic trip exists and why energy ratio is
 * reported alongside N.
 *
 * The falling mass is left as `userData.hammer` (flagged dynamic) so the rig
 * can lift and drop it: on the si-rig that is the whole animation.
 * opts: { massKg, dropMm, wear, lod }
 */
export function buildSPTHammer(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const massKg = opts.massKg || 63.5;
  const drop = mm(opts.dropMm || 760);
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 24;
  const g = new T.Group();
  g.name = 'spt-hammer';
  const paint = material(ctx, 'paintedSteel');
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const bright = wearMaterial(ctx, 'rawSteel', wear * 0.4);
  const dark = material(ctx, 'paintedSteel', { color: 0x232A33, roughness: 0.62, metalness: 0.34 });

  const guideR = mm(30);
  const massR = mm(110);
  const massH = mm(190);
  const frameH = drop + massH + mm(420);

  // ── guide rod and the outer cage ───────────────────────────────────────
  part(T, g, G.cyl(T, guideR, guideR, frameH, seg), bright, { p: [0, -frameH * 0.5, 0], name: 'guide-rod' });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    part(T, g, G.box(T, mm(26), frameH * 0.96, mm(26)), paint, {
      p: [Math.cos(a) * massR * 1.32, -frameH * 0.5, Math.sin(a) * massR * 1.32], name: 'cage-bar',
    });
  }
  for (const y of [-mm(60), -frameH * 0.5, -frameH + mm(180)]) {
    part(T, g, G.torus(T, massR * 1.32, mm(12), 4, seg), paint, {
      p: [0, y, 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'cage-ring',
    });
  }
  // the lift head: cam, chain sprocket and the hydraulic motor that trips it
  part(T, g, G.roundedBox(T, massR * 2.2, mm(220), massR * 1.5, mm(16), 2), dark, { p: [0, -mm(110), 0], name: 'lift-head' });
  part(T, g, G.cyl(T, mm(76), mm(76), mm(150), seg), steel, { p: [0, -mm(110), massR * 0.62], r: [Math.PI / 2, 0, 0], name: 'cam' });
  part(T, g, G.cyl(T, mm(58), mm(58), mm(190), low ? 10 : 14), dark, {
    p: [massR * 1.0, -mm(110), massR * 0.62], r: [0, 0, Math.PI / 2], name: 'trip-motor',
  });
  for (let i = 0; i < 2; i++) {
    part(T, g, G.tube(T, [
      [massR * 1.0, -mm(70) + i * mm(40), massR * 0.62],
      [massR * 1.6, mm(180), massR * 0.2],
      [massR * 1.2, mm(520), -massR * 0.6],
    ], mm(14), low ? 8 : 14, low ? 5 : 7), material(ctx, 'hose'), { name: 'hose' });
  }
  part(T, g, G.box(T, massR * 1.4, mm(120), mm(6)), material(ctx, 'safetyStripe'), {
    p: [0, -mm(110), massR * 0.78], cast: false,
  });

  // ── the falling mass: a doughnut around the guide rod ──────────────────
  const hammer = group(T, g, 'hammer', { p: [0, -mm(300) - drop * 0.0, 0], dynamic: true });
  part(T, hammer, profiledLathe(T, [
    [guideR * 1.12, 0], [massR, -mm(18)], [massR, -massH + mm(18)],
    [guideR * 1.12, -massH],
  ], {
    segments: seg,
    // cast lifting lugs around the body, so it never reads as a plain disc
    radiusFn: (th, r) => (r > massR * 0.9 ? 1 + 0.045 * Math.max(0, Math.cos(th * 4)) : 1),
  }), steel, { name: 'mass' });
  part(T, hammer, G.torus(T, massR * 0.86, mm(14), 4, seg), bright, {
    p: [0, -massH * 0.5, 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'lift-collar',
  });
  part(T, hammer, G.cyl(T, massR * 0.62, massR * 0.62, mm(26), seg), bright, {
    p: [0, -massH - mm(13), 0], name: 'striking-face',
  });

  // ── anvil and the rod coupling underneath it ───────────────────────────
  const ay = -frameH + mm(180);
  part(T, g, profiledLathe(T, [
    [guideR * 1.05, ay], [massR * 0.86, ay], [massR * 0.86, ay - mm(70)],
    [mm(54), ay - mm(96)], [mm(54), ay - mm(210)], [mm(22), ay - mm(210)],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (y > ay - mm(100) || r < mm(50)) return 1;
      const a = ((th * 2) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.10 * Math.max(0, 1 - d * 2.4);
    },
  }), steel, { name: 'anvil' });
  part(T, g, G.cyl(T, massR * 0.62, massR * 0.62, mm(22), seg), bright, { p: [0, ay + mm(11), 0], cast: false, name: 'anvil-face' });
  addPinThread(T, ctx, g, 'API238', { y0: ay - mm(196), length: mm(46), quality: low ? 0 : 0.4, mat: bright });
  // the drop scale a driller reads to confirm the fall height
  part(T, g, G.box(T, mm(52), drop, mm(4)), material(ctx, 'safetyStripe'), {
    p: [massR * 1.34, -mm(300) - drop * 0.5, 0], cast: false, name: 'drop-scale',
  });

  const energyJ = Math.round(massKg * 9.81 * (drop) * 10) / 10;
  const out = finalise(T, g, {
    id: 'spt-hammer', family: 'Site Investigation & Testing / SPT Samplers & Hammers',
    name: 'Drillity Probeline SPT Trip Hammer ' + massKg + ' kg',
    action: 'driven', massKg: massKg, dropMm: Math.round(drop * 1000),
    theoreticalEnergyJ: energyJ, type: 'Automatic trip, free fall',
    energyRatio: 'Reported with N; N60 corrects the measured ratio to 60 %',
    tolerance: 'ISO 22476-3: 63.5 +/- 0.5 kg, 760 +/- 10 mm',
    standard: 'ASTM D1586 / EN ISO 22476-3',
    connection: 'Anvil to A-rod / N-rod', connectionFamily: 'drive-rod',
    material: 'Forged steel mass, hardened anvil',
    method: 'site-investigation', priceEur: 7400,
  }, opts);
  out.userData.hammer = hammer;
  out.userData.dropM = drop;
  return out;
}

/**
 * CPT cone, and its piezocone variant. A 60 degree apex on a 35.7 mm base
 * (10 cm2) or a 43.7 mm base (15 cm2), a friction sleeve of 150 cm2 behind it,
 * and — this is what makes it a CPTu — a sintered porous filter in the
 * cylindrical extension at the SHOULDER, the u2 position.
 *
 * Nothing on it cuts. It is pushed at 20 +/- 5 mm/s and the whole test is the
 * three numbers coming back up the cable.
 * opts: { areaCm2: 10|15, piezo, wear, lod }
 */
export function buildCPTCone(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const areaCm2 = opts.areaCm2 === 15 ? 15 : 10;
  const coneMm = areaCm2 === 15 ? 43.7 : 35.7;
  const sleeveCm2 = areaCm2 === 15 ? 225 : 150;
  const piezo = opts.piezo !== false;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 16 : 30;
  const g = new T.Group();
  g.name = piezo ? 'cpt-piezocone' : 'cpt-cone';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.5);
  const sleeveMat = wearMaterial(ctx, 'wornSteel', wear);
  const porous = material(ctx, '__porous');
  const seal = material(ctx, 'rubber');

  const R = mm(coneMm) * 0.5;
  // a 60 degree apex: half-angle 30 deg, so the tip is R / tan(30) below the base
  const apexH = R / Math.tan(30 * DEG);
  // The sleeve is sized from its own area: 150 cm2 on a 35.7 mm cone is
  // 133.7 mm long. Working it out rather than guessing is the difference
  // between a cone and a pointy stick.
  const sleeveL = (sleeveCm2 * 1e-4) / (Math.PI * mm(coneMm));

  // ── push-rod coupling and the cable gland ──────────────────────────────
  part(T, g, G.lathe(T, [
    [mm(6), 0], [R * 0.92, 0], [R * 0.92, -mm(46)], [R, -mm(58)], [R, -mm(96)], [mm(6), -mm(96)],
  ], seg, true), steel, { name: 'coupling' });
  addBoxThread(T, ctx, g, 'API238', { y0: -mm(4), length: mm(40), quality: low ? 0 : 0.35 });
  part(T, g, G.cyl(T, mm(4.4), mm(4.4), mm(420), low ? 7 : 10), material(ctx, '__hdpe'), {
    p: [0, mm(210), 0], name: 'cable', cast: false,
  });

  // ── body: the load cell housing ────────────────────────────────────────
  const bodyL = mm(210);
  part(T, g, G.cyl(T, R, R, bodyL, seg), steel, { p: [0, -mm(96) - bodyL * 0.5, 0], name: 'body' });
  // strain-gauge access plugs, sealed
  for (let i = 0; i < 2; i++) {
    part(T, g, G.cyl(T, mm(5), mm(5), mm(4), 6), sleeveMat, {
      p: [Math.cos(i * Math.PI) * R * 0.99, -mm(180), Math.sin(i * Math.PI) * R * 0.99],
      r: [0, 0, Math.PI / 2], cast: false, name: 'plug',
    });
  }

  // ── friction sleeve, isolated top and bottom by a gap of 5 mm or less ──
  const sy = -mm(96) - bodyL;
  const gapMm = mm(3.5);
  part(T, g, G.cyl(T, R * 0.986, R * 0.986, gapMm, seg), seal, { p: [0, sy - gapMm * 0.5, 0], cast: false, name: 'gap-seal' });
  part(T, g, G.lathe(T, [
    [R * 0.90, sy - gapMm], [R, sy - gapMm], [R, sy - gapMm - sleeveL], [R * 0.90, sy - gapMm - sleeveL],
  ], seg, true), sleeveMat, { name: 'friction-sleeve' });
  const fy = sy - gapMm - sleeveL;
  part(T, g, G.cyl(T, R * 0.986, R * 0.986, gapMm, seg), seal, { p: [0, fy - gapMm * 0.5, 0], cast: false, name: 'gap-seal' });

  // ── the shoulder: cylindrical extension, then the u2 filter, then the cone
  const shy = fy - gapMm;
  part(T, g, G.cyl(T, R, R, mm(6), seg), steel, { p: [0, shy - mm(3), 0], name: 'extension' });
  let coneTop = shy - mm(6);
  if (piezo) {
    part(T, g, G.cyl(T, R, R, mm(5), seg), porous, { p: [0, coneTop - mm(2.5), 0], name: 'u2-filter' });
    part(T, g, G.torus(T, R * 0.86, mm(1.6), 3, low ? 12 : 20), seal, {
      p: [0, coneTop - mm(5.6), 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'filter-o-ring',
    });
    coneTop -= mm(5);
  }

  // ── the cone itself: worn, it goes UNDERSIZE and blunt at the apex ─────
  const rw = R * lerp(1, 0.988, wear);
  const tipR = mm(lerp(0.4, 2.6, wear));
  part(T, g, G.lathe(T, [
    [rw, coneTop], [rw, coneTop - mm(4)],
    [rw * 0.62, coneTop - apexH * 0.42],
    [tipR, coneTop - apexH + mm(1)], [0, coneTop - apexH],
  ], seg, true), wearMaterial(ctx, 'rawSteel', wear), { name: 'cone' });
  // the inclinometer band — D5778 strongly recommends one, and it is what
  // tells the operator the string is bending before the cone is destroyed
  part(T, g, G.cyl(T, R * 1.002, R * 1.002, mm(9), seg), material(ctx, 'safetyStripe'), {
    p: [0, -mm(140), 0], cast: false, name: 'inclinometer-band',
  });

  return finalise(T, g, {
    id: piezo ? 'cpt-piezocone' : 'cpt-cone',
    family: 'Site Investigation & Testing / CPT',
    name: 'Drillity Probeline ' + (piezo ? 'Piezocone CPTu ' : 'Cone CPT ') + areaCm2 + ' cm2',
    action: 'pushed', areaCm2: areaCm2, coneMm: coneMm,
    coneMaxWornMm: areaCm2 === 15 ? 44.2 : 36.1, apexDeg: 60,
    frictionSleeveCm2: sleeveCm2, sleeveLengthMm: Math.round(sleeveL * 1000),
    porePressurePosition: piezo ? 'u2 (shoulder)' : null,
    measures: piezo ? 'qc, fs, u2' : 'qc, fs',
    rateMmS: 20, rateToleranceMmS: 5, readingIntervalMm: 50,
    gapMaxMm: 5, pushRodOdMm: 44.5, inclinometer: true,
    thrustKn: '100-200 for a full-capacity sounding',
    resolution: 'Smaller cones resolve thinner layers',
    standard: 'ASTM D5778',
    connection: 'CPT push-rod thread', connectionFamily: 'push-rod',
    material: 'Hardened stainless cone and sleeve, sintered filter element',
    method: 'site-investigation', priceEur: piezo ? 9400 : 6800,
  }, opts);
}

/**
 * CPT push rod. One metre, 44.5 mm, with the signal cable running down the
 * bore and a friction reducer behind the cone string. The rod break every
 * metre is the beat of the whole method — and on a seismic CPT it is where the
 * geophone reading is taken.
 * opts: { odMm, lengthMm, reducer, wear, lod }
 */
export function buildPushRod(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const od = mm(opts.odMm || 44.5);
  const L = mm(opts.lengthMm || 1000);
  const reducer = !!opts.reducer;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const g = new T.Group();
  g.name = 'push-rod';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.8);
  const bright = wearMaterial(ctx, 'rawSteel', wear * 0.4);
  const ro = od * 0.5;
  const ri = ro * 0.42;

  part(T, g, pipeGeometry(T, { od: od, id: ri * 2, length: L, seg: seg }), steel, { name: 'rod' });
  part(T, g, G.lathe(T, [
    [ri, -mm(2)], [ro * 1.02, -mm(2)], [ro * 1.02, -mm(56)], [ro, -mm(64)], [ri, -mm(64)],
  ], seg, true), bright, { name: 'box-end' });
  addBoxThread(T, ctx, g, 'API238', { y0: -mm(6), length: mm(44), quality: low ? 0 : 0.35 });
  addPinThread(T, ctx, g, 'API238', { y0: -L + mm(6), length: mm(44), quality: low ? 0 : 0.35, down: true, mat: bright });
  // the signal cable, visible down the bore at both ends
  part(T, g, G.cyl(T, mm(4.4), mm(4.4), L * 0.96, low ? 7 : 10), material(ctx, '__hdpe'), {
    p: [0, -L * 0.5, 0], cast: false, name: 'cable',
  });
  if (reducer) {
    // an oversize band that opens the hole so the rods above it stop dragging
    part(T, g, G.lathe(T, [
      [ro, -mm(140)], [ro * 1.22, -mm(170)], [ro * 1.22, -mm(210)], [ro, -mm(240)],
    ], seg, true), bright, { name: 'friction-reducer' });
  }
  part(T, g, G.cyl(T, ro * 1.004, ro * 1.004, mm(26), seg), material(ctx, 'safetyStripe'), {
    p: [0, -L * 0.5, 0], cast: false, name: 'depth-mark',
  });

  return finalise(T, g, {
    id: 'push-rod', family: 'Site Investigation & Testing / CPT',
    name: 'Drillity Probeline CPT Push Rod ' + (Math.round(od * 10000) / 10) + ' mm x '
      + Math.round(L * 1000) + ' mm',
    action: 'pushed', odMm: Math.round(od * 10000) / 10, lengthMm: Math.round(L * 1000),
    frictionReducer: reducer, cable: 'Signal cable through the bore',
    beat: 'The push pauses at every rod break; on SCPT the geophone is read there',
    standard: 'ASTM D5778',
    connection: 'CPT push-rod thread', connectionFamily: 'push-rod',
    material: 'Seamless high-tensile tube',
    method: 'site-investigation', priceEur: 190,
  }, opts);
}

/**
 * Window sampler. A driven tube with a long window cut in the side so the
 * sample can be logged and photographed without extruding it: the cheapest
 * continuous profile in shallow ground, and the one the puller — not the
 * hammer — sets the depth limit on.
 * opts: { odMm, lengthMm, windowless, wear, lod }
 */
export function buildWindowSampler(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const od = mm(clampv(opts.odMm || 60, 38, 90));
  const L = mm(clampv(opts.lengthMm || 1000, 500, 2000));
  const windowless = !!opts.windowless;
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const g = new T.Group();
  g.name = 'window-sampler';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const hard = wearMaterial(ctx, 'rawSteel', wear);
  const liner = material(ctx, '__hdpe');
  const soil = material(ctx, '__mud');

  const ro = od * 0.5;
  const ri = ro - mm(3.6);

  // ── drive head: hardened striking face and the puller groove ───────────
  part(T, g, profiledLathe(T, [
    [ri * 0.6, 0], [ro * 1.30, 0], [ro * 1.30, -mm(40)],
    [ro * 1.06, -mm(58)], [ro * 1.06, -mm(96)], [ro * 1.34, -mm(112)],
    [ro * 1.34, -mm(140)], [ro, -mm(158)], [ri * 0.6, -mm(158)],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (y < -mm(44) || r < ro) return 1;
      const a = ((th * 2) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.10 * Math.max(0, 1 - d * 2.4);
    },
  }), hard, { name: 'drive-head' });
  part(T, g, G.cyl(T, ro * 1.24, ro * 1.24, mm(18), seg), material(ctx, 'rawSteel'), {
    p: [0, -mm(9), 0], cast: false, name: 'striking-face',
  });

  // ── the barrel, with the window ────────────────────────────────────────
  const by = -mm(158);
  const barrelL = L - mm(158) - mm(70);
  if (windowless) {
    part(T, g, pipeGeometry(T, { od: od, id: ri * 2, length: barrelL, y0: by, seg: seg }), steel, { name: 'barrel' });
  } else {
    const halfA = Math.asin(clampv(od * 0.34 / od, 0, 0.9));
    part(T, g, arcSector(T, { rIn: ri, rOut: ro, a0: halfA, a1: TAU - halfA, h: barrelL, seg: seg }), steel,
      { p: [0, by - barrelL, 0], name: 'barrel' });
    // the window edges are rolled so they do not cut the liner
    for (let s = -1; s <= 1; s += 2) {
      part(T, g, G.box(T, mm(4), barrelL * 0.98, mm(5)), hard, {
        p: [Math.cos(s * halfA + Math.PI * 0) * ro, by - barrelL * 0.5, Math.sin(s * halfA) * ro],
        r: [0, -s * halfA, 0], cast: false, name: 'window-edge',
      });
    }
    // the plastic liner and the soil in it, seen through the window
    part(T, g, pipeGeometry(T, { od: ri * 2, id: ri * 2 - mm(3), length: barrelL * 0.98, y0: by, seg: seg }),
      liner, { name: 'liner' });
    part(T, g, G.cyl(T, ri - mm(2.2), ri - mm(2.2), barrelL * 0.86, low ? 10 : 16), soil, {
      p: [0, by - barrelL * 0.5, 0], cast: false, name: 'sample',
    });
  }
  // depth rings every 100 mm — this is how the log gets its intervals
  const rings = low ? 4 : Math.round(barrelL / mm(200));
  for (let i = 1; i <= rings; i++) {
    part(T, g, G.torus(T, ro * 1.006, mm(1.8), 3, low ? 10 : 16), material(ctx, 'safetyStripe'), {
      p: [0, by - (i / (rings + 1)) * barrelL, 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'depth-ring',
    });
  }

  // ── cutting shoe ───────────────────────────────────────────────────────
  const sy = by - barrelL;
  const edge = lerp(mm(1.0), mm(3.6), wear);
  part(T, g, G.lathe(T, [
    [ri, 0], [ro, 0], [ro, -mm(38)], [ri + edge, -mm(70)], [ri - mm(2), -mm(70)],
  ], seg, true), hard, { p: [0, sy, 0], name: 'cutting-shoe' });

  return finalise(T, g, {
    id: 'window-sampler', family: 'Site Investigation & Testing / Drive & Liner Samplers',
    name: 'Drillity Probeline ' + (windowless ? 'Windowless' : 'Window') + ' Sampler '
      + Math.round(od * 1000) + ' mm x ' + Math.round(L * 1000) + ' mm',
    action: 'driven', odMm: Math.round(od * 1000), lengthMm: Math.round(L * 1000),
    window: !windowless, liner: 'Split plastic liner',
    driver: 'Hand-held percussion hammer of the road-breaker class',
    depthLimit: 'About 10 m — set by the pull, not the drive',
    sampleQuality: 'Category B, quality class 4 (3 at best)',
    connection: 'Drive head striking face and puller groove', connectionFamily: 'drive-rod',
    material: 'Case-hardened tube, hardened shoe',
    method: 'site-investigation', priceEur: Math.round(280 + od * 1000 * 3.4),
  }, opts);
}

/**
 * The U100. A thick-walled open-drive tube, the British site-investigation
 * workhorse, with a screwed cutting shoe, a vented head carrying a ball valve
 * and a basket core catcher. Its area ratio is around 30 %, which is why it is
 * a category B sampler and not an undisturbed one, and the whole reason a
 * Shelby tube exists next to it in the shop.
 * opts: { idMm, lengthMm, wear, lod }
 */
export function buildU100Tube(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const id = mm(clampv(opts.idMm || 100, 70, 150));
  const L = mm(clampv(opts.lengthMm || 450, 300, 1000));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 28;
  const g = new T.Group();
  g.name = 'u100-tube';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const hard = wearMaterial(ctx, 'rawSteel', wear);
  const soil = material(ctx, '__mud');
  const ball = material(ctx, 'chrome');

  const ri = id * 0.5;
  const ro = ri + mm(6.5);      // thick wall: that is the U100's problem

  // ── head: coupling, four vents, ball valve ─────────────────────────────
  part(T, g, profiledLathe(T, [
    [mm(14), 0], [ro * 1.06, 0], [ro * 1.06, -mm(58)], [ro, -mm(74)], [ro, -mm(130)], [ri, -mm(130)],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      if (y < -mm(60) || r < ro) return 1;
      const a = ((th * 2) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.075 * Math.max(0, 1 - d * 2.4);
    },
  }), steel, { name: 'head' });
  addBoxThread(T, ctx, g, 'API238', { y0: -mm(4), length: mm(48), quality: low ? 0 : 0.4 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.5;
    flushHole(T, ctx, g, {
      x: Math.cos(a) * ro * 0.99, y: -mm(102), z: Math.sin(a) * ro * 0.99,
      r: mm(6), dir: [Math.cos(a), 0.2, Math.sin(a)], seg: low ? 7 : 10, chamferMat: hard,
    });
  }
  part(T, g, G.sph(T, mm(16), low ? 8 : 12), ball, { p: [0, -mm(96), 0], name: 'ball-valve' });

  // ── the tube ───────────────────────────────────────────────────────────
  const by = -mm(130);
  const tubeL = L - mm(130) - mm(80);
  part(T, g, pipeGeometry(T, { od: ro * 2, id: ri * 2, length: tubeL, y0: by, seg: seg }), steel, { name: 'tube' });
  part(T, g, G.cyl(T, ri * 0.985, ri * 0.985, tubeL * 0.9, low ? 12 : 18), soil, {
    p: [0, by - tubeL * 0.5, 0], cast: false, name: 'sample',
  });
  // screwed joint between the tube and the shoe — the shoe is the consumable
  part(T, g, G.torus(T, ro * 1.01, mm(5), 4, seg), hard, {
    p: [0, by - tubeL, 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'shoe-joint',
  });

  // ── cutting shoe with a basket core catcher ────────────────────────────
  const sy = by - tubeL;
  const edge = lerp(mm(1.4), mm(4.5), wear);
  part(T, g, G.lathe(T, [
    [ri * 0.97, 0], [ro, 0], [ro, -mm(44)], [ri * 0.97 + edge, -mm(80)], [ri * 0.94, -mm(80)],
  ], seg, true), hard, { p: [0, sy, 0], name: 'cutting-shoe' });
  for (let i = 0; i < (low ? 6 : 11); i++) {
    const a = (i / (low ? 6 : 11)) * TAU;
    part(T, g, G.box(T, mm(6), mm(46), mm(1.6)), hard, {
      p: [Math.cos(a) * ri * 0.88, sy - mm(30), Math.sin(a) * ri * 0.88],
      r: [0.34, -a, 0], cast: false, name: 'catcher-finger',
    });
  }

  return finalise(T, g, {
    id: 'u100-tube', family: 'Site Investigation & Testing / Drive & Liner Samplers',
    name: 'Drillity Probeline U100 Open-Drive Tube ' + Math.round(id * 1000) + ' mm',
    action: 'driven', idMm: Math.round(id * 1000), odMm: Math.round(ro * 2000),
    lengthMm: Math.round(L * 1000), wallMm: 6.5,
    areaRatioPct: 30, areaRatioLimit: 'BS 5930 presupposes not exceeding 30 %',
    sampleQuality: 'Category B, quality class 2 at best',
    shoe: 'Screwed cutting shoe with a basket core catcher',
    connection: 'Drive-rod coupling', connectionFamily: 'drive-rod',
    material: 'Thick-wall steel tube, hardened shoe',
    method: 'site-investigation', priceEur: 340,
  }, opts);
}

/**
 * The Shelby tube. Thin-wall, rolled cutting edge, pushed rather than driven:
 * an area ratio of about 13.7 % against the U100's 30 %, which is the whole
 * argument. Anything above 10 % is not truly undisturbed, and this is as close
 * as routine site investigation gets.
 * opts: { odMm, lengthMm, wear, lod }
 */
export function buildShelbyTube(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const od = mm(clampv(opts.odMm || 76.2, 50, 130));
  const wall = mm(1.65);                 // 16 gauge
  const L = mm(clampv(opts.lengthMm || 762, 450, 1200));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 28;
  const g = new T.Group();
  g.name = 'shelby-tube';
  const steel = wearMaterial(ctx, 'rawSteel', wear * 0.7);
  const head = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const soil = material(ctx, '__mud');
  const ball = material(ctx, 'chrome');

  const ro = od * 0.5;
  const ri = ro - wall;

  // ── sampler head: ball check, vents, and the set screws that hold the tube
  part(T, g, G.lathe(T, [
    [mm(10), 0], [ro * 0.9, 0], [ro * 0.9, -mm(52)], [ro, -mm(62)], [ro, -mm(96)], [ri, -mm(96)],
  ], seg, true), head, { name: 'head' });
  addBoxThread(T, ctx, g, 'API238', { y0: -mm(4), length: mm(42), quality: low ? 0 : 0.35 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.6;
    flushHole(T, ctx, g, {
      x: Math.cos(a) * ro * 0.92, y: -mm(74), z: Math.sin(a) * ro * 0.92,
      r: mm(4.5), dir: [Math.cos(a), 0.2, Math.sin(a)], seg: low ? 7 : 10, chamferMat: steel,
    });
  }
  part(T, g, G.sph(T, mm(12), low ? 8 : 12), ball, { p: [0, -mm(66), 0], name: 'ball-check' });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    part(T, g, G.cyl(T, mm(5), mm(5), mm(8), 6), head, {
      p: [Math.cos(a) * ro * 0.99, -mm(112), Math.sin(a) * ro * 0.99],
      r: [0, 0, Math.PI / 2], cast: false, name: 'set-screw',
    });
  }

  // ── the tube: thin enough that the wall itself is the cutting edge ─────
  const by = -mm(96);
  const tubeL = L - mm(96);
  part(T, g, pipeGeometry(T, { od: od, id: ri * 2, length: tubeL, y0: by, seg: seg }), steel, { name: 'tube' });
  part(T, g, G.cyl(T, ri * 0.99, ri * 0.99, tubeL * 0.88, low ? 12 : 18), soil, {
    p: [0, by - tubeL * 0.5, 0], cast: false, name: 'sample',
  });
  // the rolled edge: swaged slightly inside the tube so the sample can expand
  const edgeR = ri * lerp(0.985, 0.97, 1) - mm(0.2);
  part(T, g, G.lathe(T, [
    [ri, 0], [ro, 0], [ro * 0.995, -mm(16)], [edgeR + mm(0.3) + mm(1.6) * wear, -mm(26)], [edgeR, -mm(26)],
  ], seg, true), wearMaterial(ctx, 'rawSteel', wear), { p: [0, by - tubeL + mm(26), 0], name: 'rolled-edge' });
  if (wear > 0.6) {
    // a dented tube is a rejected sample, and the driller can see it
    part(T, g, G.sph(T, ro * 0.5, low ? 6 : 9), steel, {
      p: [ro * 0.9, by - tubeL * 0.4, 0], s: [0.35, 1.5, 1.0], cast: false, name: 'dent',
    });
  }
  part(T, g, G.plane(T, ro * 1.4, ro * 0.8), material(ctx, 'brandedPanel'), {
    p: [0, by - mm(120), ro * 1.004], cast: false, recv: false, name: 'label',
  });

  return finalise(T, g, {
    id: 'shelby-tube', family: 'Site Investigation & Testing / Drive & Liner Samplers',
    name: 'Drillity Probeline Shelby Thin-Wall Tube ' + (Math.round(od * 10000) / 10) + ' mm',
    action: 'pushed', odMm: Math.round(od * 10000) / 10,
    wallGauge: '16 gauge (1.65 mm)', lengthMm: Math.round(L * 1000),
    areaRatioPct: 13.7, undisturbedThreshold: 'Area ratio 10 % or less',
    edge: 'Rolled cutting edge swaged inside the tube',
    sampleQuality: 'Category A where it is pushed cleanly in one stroke',
    connection: 'Sampler head with set screws to the drive rod', connectionFamily: 'drive-rod',
    material: 'Cold-drawn thin-wall steel tube',
    method: 'site-investigation', priceEur: 96,
  }, opts);
}

/**
 * Standpipe piezometer. The instrument left behind when the hole is finished:
 * a slotted response zone in a filter sock, plain riser above it, a bentonite
 * seal and a lockable cover at the surface. The one piece of kit on site that
 * is still working a year later.
 * opts: { odMm, screenMm, riserMm, wear, lod }
 */
export function buildStandpipePiezometer(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const od = mm(clampv(opts.odMm || 50, 19, 100));
  const screenL = mm(clampv(opts.screenMm || 1000, 300, 3000));
  const riserL = mm(clampv(opts.riserMm || 2000, 500, 6000));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const g = new T.Group();
  g.name = 'standpipe-piezometer';
  const hdpe = wearMaterial(ctx, '__hdpe', wear * 0.5);
  const sock = material(ctx, '__porous');
  const steel = wearMaterial(ctx, 'wornSteel', wear);
  const bent = material(ctx, '__mud');

  const ro = od * 0.5;
  const ri = ro - mm(3.6);

  // ── lockable surface cover ─────────────────────────────────────────────
  part(T, g, G.lathe(T, [
    [0, mm(30)], [ro * 2.0, mm(22)], [ro * 2.0, -mm(150)], [ro * 1.7, -mm(150)],
    [ro * 1.7, mm(16)], [0, mm(24)],
  ], seg, true), steel, { name: 'cover' });
  part(T, g, G.box(T, mm(38), mm(56), mm(18)), steel, { p: [ro * 2.0, -mm(60), 0], r: [0, 0, 0.1], name: 'hasp' });
  part(T, g, G.torus(T, mm(15), mm(5), 4, low ? 8 : 12), material(ctx, 'chrome'), {
    p: [ro * 2.1, -mm(74), 0], r: [0, Math.PI / 2, 0], cast: false, name: 'padlock',
  });
  part(T, g, G.cyl(T, ro * 2.4, ro * 2.6, mm(70), seg), material(ctx, '__concrete'), {
    p: [0, -mm(190), 0], name: 'surface-collar',
  });

  // ── plain riser ────────────────────────────────────────────────────────
  const ry = -mm(140);
  part(T, g, pipeGeometry(T, { od: od, id: ri * 2, length: riserL, y0: ry, seg: seg }), hdpe, { name: 'riser' });
  // flush-threaded joint half way down — risers come in lengths
  part(T, g, G.lathe(T, [
    [ri, 0], [ro * 1.07, 0], [ro * 1.07, -mm(60)], [ri, -mm(60)],
  ], seg, true), hdpe, { p: [0, ry - riserL * 0.5, 0], cast: false, name: 'riser-joint' });
  // bentonite seal above the response zone
  part(T, g, G.cyl(T, ro * 2.1, ro * 2.1, mm(500), seg), bent, {
    p: [0, ry - riserL + mm(250), 0], cast: false, name: 'bentonite-seal',
  });

  // ── the response zone: real machined slots, then the filter sock ───────
  const sy = ry - riserL;
  part(T, g, pipeGeometry(T, { od: od, id: ri * 2, length: screenL, y0: sy, seg: seg }), hdpe, { name: 'screen' });
  const rowsN = low ? 6 : 14;
  const cols = low ? 4 : 6;
  for (let r = 0; r < rowsN; r++) {
    for (let c = 0; c < cols; c++) {
      const a = (c / cols) * TAU + (r % 2) * (Math.PI / cols);
      part(T, g, G.box(T, mm(2.0), mm(24), (ro - ri) * 2.4), material(ctx, '__hole', {
        color: 0x0A0C0F, roughness: 0.94, metalness: 0.15, side: T.BackSide,
      }), {
        p: [Math.cos(a) * (ro - mm(1)), sy - mm(40) - r * (screenL - mm(80)) / rowsN, Math.sin(a) * (ro - mm(1))],
        r: [0, -a, 0], cast: false, recv: false, name: 'slot',
      });
    }
  }
  part(T, g, G.cyl(T, ro * 1.16, ro * 1.16, screenL * 0.98, seg, true), sock, {
    p: [0, sy - screenL * 0.5, 0], cast: false, name: 'filter-sock',
  });
  for (const u of [0.03, 0.97]) {
    part(T, g, G.torus(T, ro * 1.16, mm(3), 3, low ? 10 : 16), material(ctx, 'safetyStripe'), {
      p: [0, sy - screenL * u, 0], r: [Math.PI / 2, 0, 0], cast: false, name: 'sock-tie',
    });
  }
  // base plug
  part(T, g, G.lathe(T, [
    [0, 0], [ri, 0], [ro, -mm(20)], [ro * 0.6, -mm(56)], [0, -mm(60)],
  ], seg, true), hdpe, { p: [0, sy - screenL, 0], name: 'base-plug' });

  return finalise(T, g, {
    id: 'standpipe-piezometer', family: 'Site Investigation & Testing / Monitoring Well Risers & Screens',
    name: 'Drillity Probeline Standpipe Piezometer ' + Math.round(od * 1000) + ' mm',
    action: 'installed', odMm: Math.round(od * 1000), idMm: Math.round(ri * 2000),
    screenMm: Math.round(screenL * 1000), riserMm: Math.round(riserL * 1000),
    slotMm: 0.5, filter: 'Geotextile sock over a sand pack',
    seal: 'Bentonite above the response zone', cover: 'Lockable flush cover in a concrete collar',
    reads: 'Standing water level; a dipmeter down the riser',
    connection: 'Flush-threaded riser joints', connectionFamily: 'flush-thread',
    material: 'HDPE riser and screen, geotextile sock',
    method: 'site-investigation', priceEur: Math.round(120 + (screenL + riserL) * 1000 * 0.02),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════

   §19b CABLE-TOOL TOOLS

   The taxonomy has a node for these and the game had nothing in it. Cable
   percussion is not drilling in the modern sense: nothing rotates, there is no
   circulation and there is no drill string. A heavy chisel on a wire rope is
   dropped on the bottom of the hole, the cuttings are stirred into a slurry,
   and every few feet the whole string comes out so a BAILER can go down and
   fetch the slurry back. The jars in between exist for the one thing that goes
   wrong: when the bit sticks, you jar it loose.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The chisel bit. Forged in one piece, with water courses up its sides so the
 * slurry can pass, a flared cutting edge, and a tapered tool joint at the top.
 * Wear here is the thing the driller measures with a gauge: the edge loses its
 * width, the hole goes undersize, and the bit has to come out and be dressed.
 * opts: { diameterMm, lengthMm, wear, lod }
 */
export function buildCableToolChisel(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const diaMm = clampv(opts.diameterMm || 165, 100, 460);
  const L = mm(clampv(opts.lengthMm || 2200, 1200, 4000));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 22;
  const g = new T.Group();
  g.name = 'cable-tool-chisel';
  const steel = bitBodyMaterial(ctx, wear * 0.8);
  const bright = wearMaterial(ctx, 'rawSteel', wear);

  const R = mm(diaMm) * 0.5;
  const bodyR = R * 0.62;
  // the edge wears IN, so the hole goes undersize and the driller gauges it
  const edgeW = R * lerp(1.0, 0.90, wear);
  const edgeT = mm(diaMm * 0.10) * lerp(1, 2.4, wear);

  // tapered tool joint: cable-tool strings screw together on coarse tapers
  part(T, g, G.lathe(T, [
    [bodyR * 0.55, 0], [bodyR * 0.86, 0], [bodyR * 0.86, -mm(60)],
    [bodyR, -mm(90)], [bodyR, -mm(150)], [bodyR * 0.55, -mm(150)],
  ], seg, true), bright, { name: 'box-joint' });
  addBoxThread(T, ctx, g, 'API312', { y0: -mm(6), length: mm(96), quality: low ? 0 : 0.4 });

  // the shank, with two flats for the wrench and the water courses down it
  part(T, g, profiledLathe(T, [
    [bodyR * 0.55, -mm(150)], [bodyR, -mm(150)], [bodyR, -mm(320)],
    [R * 0.86, -L + edgeT * 3.4], [edgeW, -L + edgeT * 1.6],
    [edgeW * 0.55, -L], [0.0001, -L],
  ], {
    segments: seg,
    radiusFn: (th, r, y) => {
      // four water courses: without them the slurry cannot get past the bit
      if (y > -mm(200)) {
        const a2 = ((th * 2) % TAU + TAU) % TAU;
        const d2 = Math.min(a2, TAU - a2) / Math.PI;
        return 1 - 0.10 * Math.max(0, 1 - d2 * 2.2);
      }
      const a = ((th * 4) % TAU + TAU) % TAU;
      const d = Math.min(a, TAU - a) / Math.PI;
      return 1 - 0.14 * Math.max(0, 1 - d * 3.2);
    },
  }), steel, { name: 'body' });

  // the cutting edge itself: a chisel, flared to gauge, not a cone
  part(T, g, G.box(T, edgeW * 2, edgeT * 4.6, R * 0.30), wearMaterial(ctx, 'rawSteel', wear), {
    p: [0, -L + edgeT * 2.3, 0], name: 'cutting-edge',
  });
  part(T, g, G.box(T, edgeW * 2 * 0.86, edgeT * 1.6, R * 0.22), bright, {
    p: [0, -L + edgeT * 0.8, 0], name: 'edge-land', cast: false,
  });
  if (wear > 0.55) {
    // a chipped corner: this bit is coming out to be dressed
    part(T, g, G.box(T, edgeW * 0.5, edgeT * 1.4, R * 0.26), bright, {
      p: [edgeW * 0.72, -L + edgeT * 1.4, 0], r: [0, 0, 0.5], cast: false, name: 'chip',
    });
  }

  return finalise(T, g, {
    id: 'cable-tool-chisel', family: 'Site Investigation & Testing / Cable-Tool Tools',
    name: 'Drillity Shellhand Chisel Bit ' + Math.round(diaMm) + ' mm',
    action: 'dropped', diameterMm: Math.round(diaMm), lengthMm: Math.round(L * 1000),
    massKg: Math.round(diaMm * L * 1000 * 0.0022),
    waterCourses: 4, dressing: 'Forged edge, re-dressed when it gauges undersize',
    connection: 'Tapered cable-tool joint', connectionFamily: 'cable-tool',
    note: 'Nothing rotates: the string is dropped, and the cuttings are bailed',
    material: 'Forged alloy steel',
    method: 'cable-tool', priceEur: Math.round(340 + diaMm * 6.2),
  }, opts);
}

/**
 * Cable-tool drilling jars. Two long interlocking links with a stroke between
 * them: on the downstroke they close and the blow lands on the bit; when the
 * bit sticks, the driller lifts on the rope and the links snap open against
 * the shoulders and jar it free. It is the whole reason a cable-tool string
 * survives a boulder.
 * opts: { strokeMm, wear, lod }
 */
export function buildDrillingJars(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const stroke = mm(clampv(opts.strokeMm || 500, 200, 900));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 12 : 20;
  const g = new T.Group();
  g.name = 'drilling-jars';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.8);
  const bright = wearMaterial(ctx, 'rawSteel', wear);

  const R = mm(60);
  const linkL = stroke + mm(340);
  const barW = mm(46);
  const barT = mm(34);

  // upper link: the pin joint up to the rope socket, then two side bars
  part(T, g, G.lathe(T, [
    [R * 0.5, 0], [R, 0], [R, -mm(120)], [R * 0.62, -mm(160)], [R * 0.5, -mm(160)],
  ], seg, true), bright, { name: 'upper-neck' });
  addPinThread(T, ctx, g, 'API312', { y0: 0, length: mm(86), quality: low ? 0 : 0.4, down: false, mat: bright });
  for (let s = -1; s <= 1; s += 2) {
    part(T, g, G.box(T, barT, linkL, barW), steel, { p: [s * R * 0.62, -mm(160) - linkL * 0.5, 0], name: 'upper-bar' });
    part(T, g, G.box(T, barT * 1.4, mm(70), barW * 1.2), bright, {
      p: [s * R * 0.62, -mm(160) - linkL, 0], name: 'upper-shoulder',
    });
  }
  /* ── LOWER LINK — AND IT ACTUALLY STROKES ──────────────────────────────
     The gap IS the product, so the gap has to be able to change. Before, the
     lower link was welded into the same static bucket as the upper one and
     `strokeMm: 500` described a motion nothing in the object could perform —
     a jar that cannot jar. It now hangs in a `dynamic` group that mergeStatic
     leaves alone, with setStroke(0..1) driving it through the whole travel:
     0 is closed, which is how the jars ride on the downstroke and where the
     blow is delivered, and 1 is open against the shoulders, which is the
     instant the stuck bit comes free. */
  const closedY = -mm(160) - stroke * 0.08;      // links nested, shoulders met
  const linkGrp = group(T, g, 'lower-link', { p: [0, 0, 0], dynamic: opts.animated !== false });
  const ly = closedY;
  for (let s = -1; s <= 1; s += 2) {
    part(T, linkGrp, G.box(T, barT * 0.86, linkL, barW * 0.72), bright, {
      p: [s * R * 0.20, ly - linkL * 0.5, 0], name: 'lower-bar',
    });
    /* The whole lower link is one material on purpose. It is a dynamic
       group, so mergeStatic() cannot fold it into the root buckets, and a
       second material in here is a second draw call for a value break that
       is 34 mm wide. The shoulder stays legible by being a raised,
       chamfered block instead of a different colour. */
    part(T, linkGrp, G.box(T, barT * 1.2, mm(70), barW * 1.0), bright, {
      p: [s * R * 0.20, ly, 0], name: 'lower-shoulder',
    });
    part(T, linkGrp, G.box(T, barT * 1.34, mm(22), barW * 1.12), bright, {
      p: [s * R * 0.20, ly - mm(30), 0], cast: false, name: 'shoulder-land',
    });
  }
  part(T, linkGrp, G.lathe(T, [
    [R * 0.5, ly - linkL], [R, ly - linkL], [R, ly - linkL - mm(140)],
    [R * 0.62, ly - linkL - mm(180)], [R * 0.5, ly - linkL - mm(180)],
  ], seg, true), bright, { name: 'lower-neck' });
  // `mat` is not optional here: addBoxThread defaults to plain wornSteel,
  // which inside a dynamic group is a second bucket and a second draw call.
  addBoxThread(T, ctx, linkGrp, 'API312', {
    y0: ly - linkL - mm(50), length: mm(86), quality: low ? 0 : 0.4, mat: bright,
  });
  /* The wear scars on the shoulders, where the jarring actually happens.
     They used to ask for `chrome`, which existed on this tool for two 10 mm
     slivers and cost a whole third draw call for a colour that cannot resolve
     at 10 mm. A hammered contact face goes dark and battered, not bright, so
     `steel` is both cheaper and more correct — and it reads, because the
     shoulder it sits on is `bright`. */
  if (wear > 0.4) {
    for (let s = -1; s <= 1; s += 2) {
      part(T, g, G.box(T, barT * 1.42, mm(10), barW * 1.22), steel, {
        p: [s * R * 0.62, -mm(160) - linkL + mm(36), 0], cast: false, name: 'jar-scar',
      });
    }
  }

  const setStroke = (v) => { linkGrp.position.y = -stroke * clamp01(v); };
  setStroke(0);
  /* Quoted length is the CLOSED length, read off the mesh at stroke 0 rather
     than assembled from the same arithmetic that built it. The old expression
     counted `linkL` twice and quoted 2295 mm on a tool that measured 1543. */
  const box = new T.Box3().setFromObject(g);
  const closedLenMm = Math.round((box.max.y - box.min.y) * 1000);

  const out = finalise(T, g, {
    id: 'drilling-jars', family: 'Site Investigation & Testing / Cable-Tool Tools',
    name: 'Drillity Shellhand Drilling Jars ' + Math.round(stroke * 1000) + ' mm stroke',
    action: 'jarred', strokeMm: Math.round(stroke * 1000),
    lengthMm: closedLenMm,
    extendedLengthMm: closedLenMm + Math.round(stroke * 1000),
    purpose: 'Closes on the blow; opens to jar a stuck bit free',
    connection: 'Tapered cable-tool joint, pin up and box down', connectionFamily: 'cable-tool',
    material: 'Forged alloy steel links',
    method: 'cable-tool', priceEur: 2600,
  }, opts);
  out.userData.strokeTravel = { closed: 0, open: stroke };
  out.userData.setStroke = setStroke;
  return out;
}

/**
 * A dart-valve bailer. Every few feet of hole the whole string comes out and
 * this goes down on the sand line: the dart lifts off its seat as the bailer
 * is dropped into the slurry, the tube fills, and the dart seats again on the
 * pull so the cuttings come up with it. Emptying it is done by standing it on
 * the dart, which is why the stem sticks out of the bottom.
 * opts: { odMm, lengthMm, wear, lod }
 */
export function buildBailer(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const od = mm(clampv(opts.odMm || 140, 80, 300));
  const L = mm(clampv(opts.lengthMm || 3000, 1000, 6000));
  const wear = clamp01(opts.wear || 0);
  const low = opts.lod === 'low';
  const seg = low ? 14 : 26;
  const g = new T.Group();
  g.name = 'bailer';
  const steel = wearMaterial(ctx, 'wornSteel', wear * 0.9);
  const bright = wearMaterial(ctx, 'rawSteel', wear * 0.5);
  const slurry = material(ctx, '__mud');

  const ro = od * 0.5;
  const ri = ro - mm(5);

  // the bail: a forged loop the sand line shackles onto
  part(T, g, G.torus(T, ro * 0.52, mm(9), 4, low ? 12 : 20, Math.PI), bright, {
    p: [0, 0, 0], r: [0, Math.PI / 2, 0], name: 'bail',
  });
  part(T, g, G.lathe(T, [
    [mm(10), 0], [ro * 0.9, -mm(30)], [ro, -mm(70)], [ri, -mm(70)], [mm(10), -mm(34)],
  ], seg, true), bright, { name: 'head' });
  // vent slots in the head, or the tube airlocks and will not fill
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    part(T, g, G.box(T, mm(12), mm(34), mm(8)), material(ctx, '__hole', {
      color: 0x0A0C0F, roughness: 0.94, metalness: 0.15, side: T.BackSide,
    }), {
      p: [Math.cos(a) * ro * 0.94, -mm(46), Math.sin(a) * ro * 0.94],
      r: [0, -a, 0], cast: false, recv: false, name: 'vent',
    });
  }

  // the tube, with the slurry standing in it
  part(T, g, pipeGeometry(T, { od: od, id: ri * 2, length: L - mm(70) - mm(150), y0: -mm(70), seg: seg }), steel,
    { name: 'tube' });
  part(T, g, G.cyl(T, ri * 0.98, ri * 0.98, (L - mm(320)) * 0.62, low ? 10 : 16), slurry, {
    p: [0, -L + mm(150) + (L - mm(320)) * 0.31, 0], cast: false, name: 'slurry',
  });
  // depth bands so a driller can read how full it came back
  for (let i = 1; i <= (low ? 2 : 4); i++) {
    part(T, g, G.torus(T, ro * 1.006, mm(3), 3, low ? 12 : 18), material(ctx, 'safetyStripe'), {
      p: [0, -mm(70) - (i / ((low ? 2 : 4) + 1)) * (L - mm(220)), 0], r: [Math.PI / 2, 0, 0], cast: false,
    });
  }

  // the dart valve and its seat, and the stem that sticks out to open it
  const vy = -L + mm(150);
  part(T, g, G.lathe(T, [
    [ri, vy], [ro, vy], [ro, vy - mm(60)], [ri * 0.72, vy - mm(96)], [ri * 0.62, vy - mm(96)],
  ], seg, true), bright, { name: 'valve-shoe' });
  part(T, g, G.lathe(T, [
    [mm(8), vy + mm(80)], [ri * 0.80, vy + mm(10)], [ri * 0.80, vy - mm(6)], [mm(8), vy - mm(40)],
  ], seg, true), bright, { name: 'dart' });
  part(T, g, G.cyl(T, mm(9), mm(9), mm(150), low ? 8 : 12), bright, { p: [0, vy - mm(80), 0], name: 'dart-stem' });
  part(T, g, G.cyl(T, mm(18), mm(14), mm(24), low ? 8 : 12), steel, { p: [0, vy - mm(160), 0], cast: false });

  return finalise(T, g, {
    id: 'bailer', family: 'Site Investigation & Testing / Cable-Tool Tools',
    name: 'Drillity Shellhand Dart Bailer ' + Math.round(od * 1000) + ' mm',
    action: 'bailed', odMm: Math.round(od * 1000), lengthMm: Math.round(L * 1000),
    capacityL: Math.round(Math.PI * ri * ri * (L - mm(320)) * 1000),
    valve: 'Dart valve, seated on the pull',
    cycle: 'The whole string comes out every few feet so this can go down',
    connection: 'Bail to the sand line', connectionFamily: 'cable-tool',
    material: 'Seamless tube, forged head and dart',
    method: 'cable-tool', priceEur: Math.round(280 + od * 1000 * 4.4),
  }, opts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §20 REGISTRY
   ═══════════════════════════════════════════════════════════════════════════ */

/** Last-resort object so a bad id in the shop shows a blank, never a crash. */
function buildBillet(THREE_, ctx, opts) {
  const T = THREE_ || THREE; ctx = ctx || {}; opts = opts || {};
  const g = new T.Group();
  g.name = 'billet';
  const steel = material(ctx, 'rawSteel');
  part(T, g, G.cyl(T, mm(45), mm(45), mm(220), 18), steel, { p: [0, -mm(110), 0] });
  part(T, g, G.cyl(T, mm(52), mm(52), mm(16), 18), material(ctx, 'wornSteel'), { p: [0, -mm(8), 0] });
  return finalise(T, g, {
    id: 'billet', family: 'General Spares & Consumables',
    name: 'Unmachined Billet', lengthMm: 220,
    material: '42CrMo4 bar stock', priceEur: 40,
    note: 'placeholder for an unknown tool id: ' + (opts.requestedId || '?'),
  }, opts);
}

/** id → builder. Every builder has the signature (THREE, ctx, opts). */
export const TOOL_BUILDERS = {
  // percussion
  'button-bit': buildButtonBit,
  'dth-bit': buildDTHBit,
  'dth-hammer': buildDTHHammer,
  'dth-shank': buildDTHShank,
  'shank-adapter': buildShankAdapter,
  // rotary
  'tricone-bit': buildTriconeBit,
  'pdc-bit': buildPDCBit,
  'drag-bit': buildDragBit,
  // core / exploration
  'core-bit': buildCoreBit,
  'reaming-shell': buildReamingShell,
  'core-barrel': buildCoreBarrel,
  // casing & overburden
  'casing-crown': buildCasingCrown,
  'casing-pipe': buildCasingPipe,
  'casing-shoe': buildCasingShoe,
  'ring-bit': buildRingBitSystem,
  'wing-bit-system': buildWingBitSystem,
  'eccentric-system': buildEccentricSystem,
  'concentric-system': buildConcentricSystem,
  // string
  'drill-rod': buildDrillRod,
  'coupling-sleeve': buildCouplingSleeve,
  // oil & gas well drilling
  'drill-pipe': buildOilDrillPipe,
  'drill-collar': buildDrillCollar,
  'stabiliser': buildStabiliser,
  'mud-motor': buildMudMotor,
  'mwd-collar': buildMWDCollar,
  'bop-stack': buildBOPStack,
  'wellhead': buildWellhead,
  'shale-shaker': buildShaleShaker,
  // wear tools
  'round-shank-pick': buildRoundShankPick,
  'chisel-pick': buildChiselPick,
  'tool-holder': buildToolHolder,
  // foundation
  'kelly-auger': buildKellyAuger,
  'cfa-flight': buildCFAFlight,
  'drilling-bucket': buildDrillingBucket,
  'cleaning-bucket': (T, c, o) => buildDrillingBucket(T, c, Object.assign({}, o, { cleaning: true })),
  'foundation-core-barrel': buildFoundationCoreBarrel,
  'belling-tool': buildBellingTool,
  'cross-cutter': buildCrossCutter,
  // drives & subs
  'rotary-drive-head': buildRotaryDriveHead,
  'flushing-swivel': buildFlushingSwivel,
  'shock-absorber': buildShockAbsorber,
  // anchoring
  'sda-bar': buildAnchorBar,
  'sda-bit': buildSacrificialBit,
  'sda-coupler': buildAnchorCoupler,
  'bearing-plate': buildBearingPlate,
  // hdd
  'hdd-pilot-head': buildHDDPilotHead,
  'sonde-housing': buildSondeHousing,
  'backreamer': buildBackreamer,
  // raise boring
  'raisebore-reamer': buildRaiseboreReamer,
  'raisebore-pilot-bit': buildRaiseborePilotBit,
  'drill-stem': buildDrillStem,
  // plant (Fluids, Air & Power) — the shop previews route these here too
  'compressor-skid': buildCompressorSkid,
  'pump-skid': buildPumpSkid,
  'power-unit': buildPowerUnit,
  // reverse circulation (§14)
  'rc-dual-wall-pipe': buildRCDualWallPipe,
  'rc-hammer': buildRCHammer,
  'rc-bit': buildRCBit,
  'rc-cyclone': buildCyclone,
  'rc-splitter': buildSampleSplitter,
  'sample-bag': buildSampleBag,
  // tunnelling (§15)
  'jumbo-feed': buildJumboFeed,
  'charging-hose': buildChargingHose,
  'detonator-reel': buildDetonatorReel,
  // longhole production (§16)
  'guide-tube': buildGuideTube,
  // ground support (§17)
  'friction-bolt': buildFrictionBolt,
  'rebar-bolt': buildRebarBolt,
  'resin-cartridge': buildResinCartridge,
  'cable-bolt': buildCableBolt,
  'mesh-sheet': buildMeshSheet,
  'bolt-plate': buildBoltPlate,
  'bolt-nut': buildBoltNut,
  // driven piling (§18)
  'precast-pile': buildPrecastPile,
  'tube-pile': buildTubePile,
  'h-pile': buildHPile,
  'sheet-pile-pair': buildSheetPilePair,
  'impact-hammer': buildImpactHammer,
  'vibratory-hammer': buildVibratoryHammer,
  'pile-helmet': buildPileHelmet,
  'drive-cap': buildDriveCap,
  // site investigation (§19)
  'spt-split-spoon': buildSPTSplitSpoon,
  'spt-hammer': buildSPTHammer,
  'cpt-cone': (T, c, o) => buildCPTCone(T, c, Object.assign({ piezo: false }, o)),
  'cpt-piezocone': (T, c, o) => buildCPTCone(T, c, Object.assign({ piezo: true }, o)),
  'push-rod': buildPushRod,
  'window-sampler': buildWindowSampler,
  'u100-tube': buildU100Tube,
  'shelby-tube': buildShelbyTube,
  'standpipe-piezometer': buildStandpipePiezometer,
  // cable tool (§19b)
  'cable-tool-chisel': buildCableToolChisel,
  'drilling-jars': buildDrillingJars,
  'bailer': buildBailer,
  // fallback
  'billet': buildBillet,
};

/**
 * Shop / loadout ids → a builder plus its default options. This is where the
 * game's item ids (including the starter loadout in contract.js) resolve.
 */
export const TOOL_ALIASES = {
  'auger-flight-std':  { id: 'cfa-flight', opts: { diameterMm: 300, lengthMm: 1500, withHead: true } },
  'auger-flight-hd':   { id: 'cfa-flight', opts: { diameterMm: 450, lengthMm: 1500, withHead: true } },
  'rod-r32':           { id: 'drill-rod', opts: { thread: 'R32', lengthMm: 3050 } },
  'rod-r38':           { id: 'drill-rod', opts: { thread: 'R38', lengthMm: 3660 } },
  'rod-t38':           { id: 'drill-rod', opts: { thread: 'T38', lengthMm: 3660 } },
  'rod-t45':           { id: 'drill-rod', opts: { thread: 'T45', lengthMm: 3660 } },
  'rod-t51':           { id: 'drill-rod', opts: { thread: 'T51', lengthMm: 3660 } },
  'rod-hq':            { id: 'drill-rod', opts: { thread: 'HQ', lengthMm: 3000, type: 'MM' } },
  'button-bit-r32':    { id: 'button-bit', opts: { thread: 'R32' } },
  'button-bit-t38':    { id: 'button-bit', opts: { thread: 'T38' } },
  'button-bit-t45':    { id: 'button-bit', opts: { thread: 'T45' } },
  'button-bit-t51':    { id: 'button-bit', opts: { thread: 'T51' } },
  'button-bit-t51-hd': { id: 'button-bit', opts: { thread: 'T51', diameterMm: 115, buttonKind: 'ballistic' } },
  'dth-hammer-4':      { id: 'dth-hammer', opts: { size: '4in' } },
  'dth-hammer-5':      { id: 'dth-hammer', opts: { size: '5in' } },
  'dth-hammer-6':      { id: 'dth-hammer', opts: { size: '6in' } },
  'dth-bit-4':         { id: 'dth-bit', opts: { shank: 'DHD35' } },
  'dth-bit-5':         { id: 'dth-bit', opts: { shank: 'QL5' } },
  'dth-bit-6':         { id: 'dth-bit', opts: { shank: 'QL6' } },
  'tricone-milled':    { id: 'tricone-bit', opts: { variant: 'milled' } },
  'tricone-tci':       { id: 'tricone-bit', opts: { variant: 'tci' } },
  'wing-bit':          { id: 'drag-bit', opts: { wings: 2 } },
  'core-bit-bq':       { id: 'core-bit', opts: { size: 'BQ' } },
  'core-bit-nq':       { id: 'core-bit', opts: { size: 'NQ' } },
  'core-bit-hq':       { id: 'core-bit', opts: { size: 'HQ' } },
  'core-bit-pq':       { id: 'core-bit', opts: { size: 'PQ' } },
  'core-barrel-nq':    { id: 'core-barrel', opts: { size: 'NQ' } },
  'core-barrel-hq':    { id: 'core-barrel', opts: { size: 'HQ' } },
  'casing-crown-114':  { id: 'casing-crown', opts: { casingOdMm: 114.3, wallMm: 7 } },
  'casing-crown-140':  { id: 'casing-crown', opts: { casingOdMm: 139.7, wallMm: 8 } },
  'casing-crown-168':  { id: 'casing-crown', opts: { casingOdMm: 168.3, wallMm: 10 } },
  'casing-crown-193':  { id: 'casing-crown', opts: { casingOdMm: 193.7, wallMm: 12 } },
  'ring-bit-system':   { id: 'ring-bit', opts: {} },
  'ring-bit-140':      { id: 'ring-bit', opts: { casingOdMm: 139.7 } },
  'ring-bit-168':      { id: 'ring-bit', opts: { casingOdMm: 168.3 } },
  'kelly-auger-620':   { id: 'kelly-auger', opts: { diameterMm: 620 } },
  'kelly-auger-800':   { id: 'kelly-auger', opts: { diameterMm: 800 } },
  'kelly-auger-1200':  { id: 'kelly-auger', opts: { diameterMm: 1200 } },
  'cfa-flight-450':    { id: 'cfa-flight', opts: { diameterMm: 450 } },
  'cfa-flight-600':    { id: 'cfa-flight', opts: { diameterMm: 600 } },
  'bucket-800':        { id: 'drilling-bucket', opts: { diameterMm: 800 } },
  'bucket-1000':       { id: 'drilling-bucket', opts: { diameterMm: 1000 } },
  'pdc-bit-152':       { id: 'pdc-bit', opts: { diameterMm: 152 } },
  'pdc-bit-216':       { id: 'pdc-bit', opts: { diameterMm: 216, blades: 6 } },
  'sda-r32':           { id: 'sda-bar', opts: { thread: 'R32' } },
  'sda-r51':           { id: 'sda-bar', opts: { thread: 'R51' } },
  'sda-bit-cross':     { id: 'sda-bit', opts: { style: 'cross' } },
  'sda-bit-button':    { id: 'sda-bit', opts: { style: 'button' } },
  'backreamer-300':    { id: 'backreamer', opts: { diameterMm: 300 } },
  'backreamer-450':    { id: 'backreamer', opts: { diameterMm: 450 } },
  'compressor-12k':    { id: 'compressor-skid', opts: { lpm: 12000, bar: 24 } },
  'compressor-18k':    { id: 'compressor-skid', opts: { lpm: 18000, bar: 25 } },
  'compressor-26k':    { id: 'compressor-skid', opts: { lpm: 26000, bar: 30 } },
  'mud-pump-340':      { id: 'pump-skid', opts: { lpm: 340, bar: 60 } },
  'mud-pump-700':      { id: 'pump-skid', opts: { lpm: 700, bar: 45 } },
  'power-unit-120':    { id: 'power-unit', opts: { kw: 120 } },
  'power-unit-250':    { id: 'power-unit', opts: { kw: 250 } },

  /* ── oil & gas well drilling ─────────────────────────────────────────── */
  'drill-pipe-114':      { id: 'drill-pipe', opts: { odMm: 114.3, wallMm: 8.56, connection: 'NC46', grade: 'G-105' } },
  'drill-pipe-127':      { id: 'drill-pipe', opts: { odMm: 127, wallMm: 9.19, connection: 'NC50', grade: 'S-135' } },
  'drill-pipe-140':      { id: 'drill-pipe', opts: { odMm: 139.7, wallMm: 10.54, connection: 'NC56', grade: 'S-135' } },
  'hwdp-127':            { id: 'drill-pipe', opts: { odMm: 127, wallMm: 25.4, variant: 'hwdp', connection: 'NC50' } },
  'drill-collar-165':    { id: 'drill-collar', opts: { odMm: 165.1, idMm: 57.2, variant: 'slick', connection: 'NC46' } },
  'drill-collar-203':    { id: 'drill-collar', opts: { odMm: 203.2, idMm: 71.4, variant: 'spiral', connection: 'NC50' } },
  'drill-collar-241':    { id: 'drill-collar', opts: { odMm: 241.3, idMm: 76.2, variant: 'spiral', connection: 'NC56' } },
  'stabiliser-216':      { id: 'stabiliser', opts: { odMm: 215.9, bodyOdMm: 165, type: 'integral', connection: 'NC50' } },
  'stabiliser-311':      { id: 'stabiliser', opts: { odMm: 311.2, bodyOdMm: 203, type: 'integral', connection: 'NC56' } },
  'stabiliser-sleeve-216': { id: 'stabiliser', opts: { odMm: 215.9, bodyOdMm: 165, type: 'sleeve', connection: 'NC50' } },
  'mud-motor-172':       { id: 'mud-motor', opts: { odMm: 171.5, lobes: '7:8', bendDeg: 1.5, connection: 'NC50', bitConnection: 'REG412' } },
  'mud-motor-241':       { id: 'mud-motor', opts: { odMm: 241.3, lobes: '5:6', bendDeg: 1.15, connection: 'NC56', bitConnection: 'REG658' } },
  'mwd-collar-172':      { id: 'mwd-collar', opts: { odMm: 171.5, connection: 'NC50' } },
  'bop-stack-5k':        { id: 'bop-stack', opts: { boreMm: 346.1, pressureBar: 345, rams: 3 } },
  'bop-stack-10k':       { id: 'bop-stack', opts: { boreMm: 279.4, pressureBar: 690, rams: 4 } },
  'wellhead-340':        { id: 'wellhead', opts: { casingOdMm: 339.7, pressureBar: 345 } },
  'shale-shaker-3':      { id: 'shale-shaker', opts: { decks: 3, capacityLpm: 4500 } },
  'shale-shaker-4':      { id: 'shale-shaker', opts: { decks: 4, capacityLpm: 6200 } },
  'mud-pump-2200':       { id: 'pump-skid', opts: { lpm: 2200, bar: 350 } },
  'tricone-tci-216':     { id: 'tricone-bit', opts: { variant: 'tci', diameterMm: 215.9, connection: 'REG412' } },
  'tricone-tci-311':     { id: 'tricone-bit', opts: { variant: 'tci', diameterMm: 311.2, connection: 'REG658' } },
  'tricone-milled-445':  { id: 'tricone-bit', opts: { variant: 'milled', diameterMm: 444.5, connection: 'REG758' } },
  'pdc-bit-216-oil':     { id: 'pdc-bit', opts: { diameterMm: 215.9, blades: 6, connection: 'REG412', method: 'oil-rotary' } },
  'pdc-bit-311':         { id: 'pdc-bit', opts: { diameterMm: 311.2, blades: 7, connection: 'REG658' } },

  /* ── reverse circulation ─────────────────────────────────────────────── */
  'rc-pipe-89':        { id: 'rc-dual-wall-pipe', opts: { odMm: 88.9, lengthMm: 3000 } },
  'rc-pipe-102':       { id: 'rc-dual-wall-pipe', opts: { odMm: 101.6, lengthMm: 3000 } },
  'rc-pipe-114':       { id: 'rc-dual-wall-pipe', opts: { odMm: 114.3, lengthMm: 3000 } },
  'rc-pipe-114-6m':    { id: 'rc-dual-wall-pipe', opts: { odMm: 114.3, lengthMm: 6000 } },
  'rc-hammer-92':      { id: 'rc-hammer', opts: { odMm: 92 } },
  'rc-hammer-109':     { id: 'rc-hammer', opts: { odMm: 109 } },
  'rc-hammer-116':     { id: 'rc-hammer', opts: { odMm: 116 } },
  'rc-hammer-132':     { id: 'rc-hammer', opts: { odMm: 132 } },
  'rc-bit-102':        { id: 'rc-bit', opts: { diameterMm: 102 } },
  'rc-bit-124':        { id: 'rc-bit', opts: { diameterMm: 124 } },
  'rc-bit-146':        { id: 'rc-bit', opts: { diameterMm: 146 } },
  'rc-cyclone-100':    { id: 'rc-cyclone', opts: { inletMm: 100 } },
  'rc-cyclone-75':     { id: 'rc-cyclone', opts: { inletMm: 75 } },
  'rc-splitter-2':     { id: 'rc-splitter', opts: { splits: 2 } },
  'rc-splitter-4':     { id: 'rc-splitter', opts: { splits: 4 } },
  'sample-bag-calico': { id: 'sample-bag', opts: { fill: 0.82 } },

  /* ── tunnelling: the face round ──────────────────────────────────────── */
  // Face rods are SHORT: the round is 2.1 m, so 2,435 and 1,830 mm are the
  // two lengths on the jumbo, not the 3,050-6,095 mm of a surface bench.
  'rod-t38-face-2435':  { id: 'drill-rod', opts: { thread: 'T38', lengthMm: 2435 } },
  'rod-t38-face-1830':  { id: 'drill-rod', opts: { thread: 'T38', lengthMm: 1830 } },
  'rod-r32-face-1830':  { id: 'drill-rod', opts: { thread: 'R32', lengthMm: 1830 } },
  'button-bit-face-45': { id: 'button-bit', opts: { thread: 'R32', diameterMm: 45, buttonKind: 'spherical' } },
  'button-bit-face-48': { id: 'button-bit', opts: { thread: 'T38', diameterMm: 48, buttonKind: 'spherical' } },
  'button-bit-face-51': { id: 'button-bit', opts: { thread: 'T38', diameterMm: 51, buttonKind: 'ballistic' } },
  'jumbo-feed-3900':    { id: 'jumbo-feed', opts: { lengthMm: 3900, rodMm: 2435 } },
  'jumbo-feed-3100':    { id: 'jumbo-feed', opts: { lengthMm: 3100, rodMm: 1830 } },
  'charging-hose-anfo':     { id: 'charging-hose', opts: { product: 'anfo', boreMm: 32, lengthM: 30 } },
  'charging-hose-emulsion': { id: 'charging-hose', opts: { product: 'emulsion', boreMm: 38, lengthM: 30 } },
  'detonator-reel-500': { id: 'detonator-reel', opts: { lengthM: 500, delayMs: 500 } },
  'detonator-reel-1000': { id: 'detonator-reel', opts: { lengthM: 1000, delayMs: 1000 } },

  /* ── longhole production ─────────────────────────────────────────────── */
  // Longhole rods are short for the same reason the jumbo's are: the drill
  // drive is small and there is no room for a long feed.
  'rod-t51-longhole-1525': { id: 'drill-rod', opts: { thread: 'T51', lengthMm: 1525 } },
  'rod-t45-longhole-1220': { id: 'drill-rod', opts: { thread: 'T45', lengthMm: 1220 } },
  'rod-t38-longhole-915':  { id: 'drill-rod', opts: { thread: 'T38', lengthMm: 915 } },
  'button-bit-longhole-64':  { id: 'button-bit', opts: { thread: 'T38', diameterMm: 64 } },
  'button-bit-longhole-89':  { id: 'button-bit', opts: { thread: 'T51', diameterMm: 89 } },
  'button-bit-longhole-102': { id: 'button-bit', opts: { thread: 'T51', diameterMm: 102 } },
  'button-bit-longhole-127': { id: 'button-bit', opts: { thread: 'T60', diameterMm: 127 } },
  // ITH is a DTH hammer taken underground: 3"-8" hammers, Ø89-216 mm holes.
  'ith-hammer-3':   { id: 'dth-hammer', opts: { size: '3in' } },
  'ith-hammer-4':   { id: 'dth-hammer', opts: { size: '4in' } },
  'ith-hammer-5':   { id: 'dth-hammer', opts: { size: '5in' } },
  'ith-hammer-6':   { id: 'dth-hammer', opts: { size: '6in' } },
  'ith-hammer-8':   { id: 'dth-hammer', opts: { size: '8in' } },
  'ith-bit-89':     { id: 'dth-bit', opts: { shank: 'DHD35', diameterMm: 89 } },
  'ith-bit-115':    { id: 'dth-bit', opts: { shank: 'QL5', diameterMm: 115 } },
  'ith-bit-140':    { id: 'dth-bit', opts: { shank: 'QL5', diameterMm: 140 } },
  'ith-bit-165':    { id: 'dth-bit', opts: { shank: 'QL6', diameterMm: 165 } },
  'ith-bit-216':    { id: 'dth-bit', opts: { shank: 'QL6', diameterMm: 216 } },
  'guide-tube-102': { id: 'guide-tube', opts: { holeMm: 115, odMm: 102, lengthMm: 1000 } },
  'guide-tube-152': { id: 'guide-tube', opts: { holeMm: 165, odMm: 152, lengthMm: 1000 } },

  /* ── ground support ──────────────────────────────────────────────────── */
  'friction-bolt-33': { id: 'friction-bolt', opts: { odMm: 33, lengthMm: 1800 } },
  'friction-bolt-39': { id: 'friction-bolt', opts: { odMm: 39, lengthMm: 2400 } },
  'friction-bolt-46': { id: 'friction-bolt', opts: { odMm: 46, lengthMm: 3000 } },
  'rebar-bolt-20':    { id: 'rebar-bolt', opts: { diaMm: 20, lengthMm: 2400 } },
  'rebar-bolt-25':    { id: 'rebar-bolt', opts: { diaMm: 25, lengthMm: 3000 } },
  'resin-fast':       { id: 'resin-cartridge', opts: { speed: 'fast', diaMm: 25, lengthMm: 600 } },
  'resin-slow':       { id: 'resin-cartridge', opts: { speed: 'slow', diaMm: 25, lengthMm: 900 } },
  'cable-bolt-6m':    { id: 'cable-bolt', opts: { lengthMm: 6000 } },
  'cable-bolt-9m':    { id: 'cable-bolt', opts: { lengthMm: 9000 } },
  'mesh-2400':        { id: 'mesh-sheet', opts: { widthMm: 2400, heightMm: 1200 } },
  'mesh-3000':        { id: 'mesh-sheet', opts: { widthMm: 3000, heightMm: 1800, wireMm: 6.0 } },
  'bolt-plate-150':   { id: 'bolt-plate', opts: { sideMm: 150 } },
  'bolt-plate-200':   { id: 'bolt-plate', opts: { sideMm: 200, boreMm: 46 } },
  'bolt-nut-m24':     { id: 'bolt-nut', opts: { threadMm: 24 } },

  /* ── driven piling ───────────────────────────────────────────────────── */
  'precast-pile-300': { id: 'precast-pile', opts: { sideMm: 300, lengthMm: 11000 } },
  'precast-pile-350': { id: 'precast-pile', opts: { sideMm: 350, lengthMm: 14000 } },
  'precast-pile-450': { id: 'precast-pile', opts: { sideMm: 450, lengthMm: 20000 } },
  'tube-pile-610':    { id: 'tube-pile', opts: { odMm: 610, wallMm: 12.5, lengthMm: 14000 } },
  'tube-pile-914':    { id: 'tube-pile', opts: { odMm: 914.4, wallMm: 12.5, lengthMm: 18000 } },
  'tube-pile-1422':   { id: 'tube-pile', opts: { odMm: 1422.4, wallMm: 25.0, lengthMm: 22000 } },
  'h-pile-305':       { id: 'h-pile', opts: { depthMm: 310, widthMm: 305, lengthMm: 14000 } },
  'sheet-pile-z-630': { id: 'sheet-pile-pair', opts: { systemWidthMm: 630, heightMm: 450 } },
  'impact-hammer-3t':  { id: 'impact-hammer', opts: { ramKg: 3000 } },
  'impact-hammer-9t':  { id: 'impact-hammer', opts: { ramKg: 9000 } },
  'impact-hammer-16t': { id: 'impact-hammer', opts: { ramKg: 16000 } },
  'impact-hammer-30t': { id: 'impact-hammer', opts: { ramKg: 30000 } },
  'vibro-hammer-1500': { id: 'vibratory-hammer', opts: { forceKn: 1500, rpm: 2500, massKg: 5070 } },
  'vibro-hammer-700':  { id: 'vibratory-hammer', opts: { forceKn: 700, rpm: 2300, massKg: 2400 } },
  'pile-helmet-350':  { id: 'pile-helmet', opts: { pileMm: 350, square: true } },
  'pile-helmet-450':  { id: 'pile-helmet', opts: { pileMm: 450, square: true } },
  'drive-cap-tube-610': { id: 'drive-cap', opts: { pileMm: 610, kind: 'tube' } },
  'drive-cap-h-305':    { id: 'drive-cap', opts: { pileMm: 310, kind: 'h' } },

  /* ── site investigation ──────────────────────────────────────────────── */
  'spt-sampler-51':   { id: 'spt-split-spoon', opts: { odMm: 50.8 } },
  'spt-hammer-auto':  { id: 'spt-hammer', opts: { massKg: 63.5, dropMm: 760 } },
  'cpt-cone-10':      { id: 'cpt-cone', opts: { areaCm2: 10 } },
  'cpt-cone-15':      { id: 'cpt-cone', opts: { areaCm2: 15 } },
  'cpt-piezo-10':     { id: 'cpt-piezocone', opts: { areaCm2: 10 } },
  'cpt-piezo-15':     { id: 'cpt-piezocone', opts: { areaCm2: 15 } },
  'push-rod-1m':      { id: 'push-rod', opts: { odMm: 44.5, lengthMm: 1000 } },
  'push-rod-reducer': { id: 'push-rod', opts: { odMm: 44.5, lengthMm: 1000, reducer: true } },
  'window-sampler-60': { id: 'window-sampler', opts: { odMm: 60, lengthMm: 1000 } },
  'window-sampler-80': { id: 'window-sampler', opts: { odMm: 80, lengthMm: 1000 } },
  'u100':             { id: 'u100-tube', opts: { idMm: 100, lengthMm: 450 } },
  'shelby-76':        { id: 'shelby-tube', opts: { odMm: 76.2, lengthMm: 762 } },
  'piezometer-50':    { id: 'standpipe-piezometer', opts: { odMm: 50, screenMm: 1000, riserMm: 2000 } },

  /* ── cable percussion ────────────────────────────────────────────────── */
  'chisel-bit-165':    { id: 'cable-tool-chisel', opts: { diameterMm: 165, lengthMm: 2200 } },
  'chisel-bit-250':    { id: 'cable-tool-chisel', opts: { diameterMm: 250, lengthMm: 2600 } },
  'drilling-jars-500': { id: 'drilling-jars', opts: { strokeMm: 500 } },
  'bailer-140':        { id: 'bailer', opts: { odMm: 140, lengthMm: 3000 } },
  'bailer-200':        { id: 'bailer', opts: { odMm: 200, lengthMm: 3600 } },
};

/**
 * Static catalogue — lets the shop list items without building geometry.
 * (Prices are order-of-magnitude realistic per GAMEDESIGN §5.)
 */
export const TOOL_CATALOG = [
  { id: 'button-bit-r32', name: 'Drillity R32 Button Bit 64 mm', family: 'Button Bits', method: 'top-hammer', priceEur: 338, consumable: true },
  { id: 'button-bit-t45', name: 'Drillity T45 Button Bit 89 mm', family: 'Button Bits', method: 'top-hammer', priceEur: 423, consumable: true },
  { id: 'button-bit-t51', name: 'Drillity T51 Button Bit 102 mm', family: 'Button Bits', method: 'top-hammer', priceEur: 467, consumable: true },
  { id: 'dth-bit-5', name: 'Drillity QL5 DTH Bit 148 mm', family: 'DTH Bits', method: 'dth', priceEur: 1030, consumable: true },
  { id: 'dth-hammer-5', name: 'Drillity Stormhammer 5IN', family: 'DTH Hammers', method: 'dth', priceEur: 4726, consumable: false },
  { id: 'shank-adapter', name: 'Drillity Shank Adapter T45', family: 'Shank Adapters', method: 'top-hammer', priceEur: 360, consumable: true },
  { id: 'tricone-tci', name: 'Drillity Tricone TCI 216 mm', family: 'Tricone Bits', method: 'rotary-kelly', priceEur: 3924, consumable: true },
  { id: 'pdc-bit-152', name: 'Drillity PDC 5-Blade 152 mm', family: 'PDC Bits', method: 'rotary-kelly', priceEur: 4944, consumable: true },
  { id: 'drag-bit', name: 'Drillity 3-Wing Drag Bit 150 mm', family: 'Drag & Wing Bits', method: 'auger', priceEur: 375, consumable: true },
  { id: 'core-bit-hq', name: 'Drillity Impreg Crown HQ', family: 'Core Bits', method: 'core', priceEur: 838, consumable: true },
  { id: 'reaming-shell', name: 'Drillity Reaming Shell HQ', family: 'Reaming Shells', method: 'core', priceEur: 547, consumable: true },
  { id: 'core-barrel-hq', name: 'Drillity Wireline Core Barrel HQ3', family: 'Wireline Core Barrels', method: 'core', priceEur: 4128, consumable: false },
  { id: 'casing-crown-140', name: 'Drillity Casing Crown 139.7 mm', family: 'Casing Crowns', method: 'overburden', priceEur: 1314, consumable: true },
  { id: 'ring-bit-140', name: 'Drillity Ringcut 139.7 Ring-Bit System', family: 'Ring-Bit Systems', method: 'overburden', priceEur: 2126, consumable: true },
  { id: 'eccentric-system', name: 'Drillity Excentra 114.3 Eccentric System', family: 'Eccentric Systems', method: 'overburden', priceEur: 2279, consumable: false },
  { id: 'concentric-system', name: 'Drillity Concentra 139.7 Concentric System', family: 'Concentric Systems', method: 'overburden', priceEur: 3047, consumable: false },
  { id: 'rod-r32', name: 'Drillity R32 Drill Rod 3050 mm MF', family: 'Drill Rods', method: 'top-hammer', priceEur: 139, consumable: true },
  { id: 'rod-t45', name: 'Drillity T45 Drill Rod 3660 mm MF', family: 'Drill Rods', method: 'top-hammer', priceEur: 187, consumable: true },
  { id: 'coupling-sleeve', name: 'Drillity Coupling T45', family: 'Coupling Sleeves', method: 'top-hammer', priceEur: 126, consumable: true },
  { id: 'auger-flight-std', name: 'Drillity CFA Flight 300 mm', family: 'Hollow-Stem Augers', method: 'auger', priceEur: 1900, consumable: false },
  { id: 'kelly-auger-800', name: 'Drillity Kelly Auger 800 mm', family: 'Kelly Augers', method: 'rotary-kelly', priceEur: 9800, consumable: false },
  { id: 'bucket-1000', name: 'Drillity Drilling Bucket 1000 mm', family: 'Drilling Buckets', method: 'rotary-kelly', priceEur: 10200, consumable: false },
  { id: 'cleaning-bucket', name: 'Drillity Clean-Out Bucket 1000 mm', family: 'Clean-Out Buckets', method: 'rotary-kelly', priceEur: 10200, consumable: false },
  { id: 'belling-tool', name: 'Drillity Belling Tool 800/1600 mm', family: 'Belling Tools', method: 'rotary-kelly', priceEur: 17000, consumable: false },
  { id: 'cross-cutter', name: 'Drillity Cross Cutter 900 mm', family: 'Cross Cutters', method: 'rotary-kelly', priceEur: 10800, consumable: false },
  { id: 'foundation-core-barrel', name: 'Drillity Rock Barrel 900 mm', family: 'Foundation Core Barrels', method: 'rotary-kelly', priceEur: 11400, consumable: false },
  { id: 'rotary-drive-head', name: 'Drillity KDK 200', family: 'Rotary Drive Heads (KDK)', method: 'rotary-kelly', priceEur: 100000, consumable: false },
  { id: 'flushing-swivel', name: 'Drillity Flushing Swivel 50 mm', family: 'Flushing Swivels', method: 'dth', priceEur: 1400, consumable: false },
  { id: 'shock-absorber', name: 'Drillity Shock Sub T51', family: 'Shock Absorbers', method: 'top-hammer', priceEur: 926, consumable: false },
  { id: 'round-shank-pick', name: 'Drillity Point-Attack Pick 22 mm', family: 'Round-Shank Picks', method: 'soil-mixing', priceEur: 20, consumable: true },
  { id: 'chisel-pick', name: 'Drillity Chisel Pick 42 mm', family: 'Flat & Chisel Picks', method: 'auger', priceEur: 31, consumable: true },
  { id: 'tool-holder', name: 'Drillity Pick Box 22 mm', family: 'Tool Holders', method: 'auger', priceEur: 48, consumable: true },
  { id: 'sda-r32', name: 'Drillity SDA Bar R32 x 3000 mm', family: 'Hollow Anchor Bars', method: 'anchor', priceEur: 86, consumable: true },
  { id: 'sda-bit-cross', name: 'Drillity Sacrificial Bit R32 51 mm', family: 'Sacrificial Bits', method: 'anchor', priceEur: 64, consumable: true },
  { id: 'sda-coupler', name: 'Drillity SDA Coupler R32', family: 'SDA Couplers', method: 'anchor', priceEur: 25, consumable: true },
  { id: 'bearing-plate', name: 'Drillity Domed Plate 200 mm R32', family: 'Bearing & Domed Plates', method: 'anchor', priceEur: 54, consumable: true },
  { id: 'hdd-pilot-head', name: 'Drillity HDD Steering Head 90 mm', family: 'Pilot & Steering Heads', method: 'hdd', priceEur: 745, consumable: true },
  { id: 'sonde-housing', name: 'Drillity Sonde Housing 90 mm', family: 'Sonde & Bent Housings', method: 'hdd', priceEur: 1060, consumable: false },
  { id: 'backreamer-300', name: 'Drillity Fly-Cut Backreamer 300 mm', family: 'Backreamers', method: 'hdd', priceEur: 4700, consumable: false },
  { id: 'raisebore-reamer', name: 'Drillity Raise Reamer 1.8 m', family: 'Raise Bore Reamer Heads', method: 'raise-boring', priceEur: 110000, consumable: false },
  { id: 'raisebore-pilot-bit', name: 'Drillity Raise Pilot Bit 311 mm', family: 'Raise Bore Pilot Bits', method: 'raise-boring', priceEur: 5254, consumable: true },
  { id: 'drill-stem', name: 'Drillity Raise Stem 254 x 1500 mm', family: 'Raise Bore Drill Stems', method: 'raise-boring', priceEur: 5248, consumable: false },
  { id: 'casing-pipe', name: 'Drillity Casing 139.7 x 8 mm', family: 'Casing Pipes', method: 'overburden', priceEur: 629, consumable: true },
  { id: 'casing-shoe', name: 'Drillity Casing Shoe 168.3 mm', family: 'Casing Shoes', method: 'overburden', priceEur: 614, consumable: true },
  /* ── oil & gas well drilling ──────────────────────────────────────────── */
  { id: 'drill-pipe-127', name: 'Drillity Drill Pipe 127 mm NC50', family: 'Drill Pipes', method: 'oil-rotary', priceEur: 1687, consumable: true },
  { id: 'drill-pipe-140', name: 'Drillity Drill Pipe 139.7 mm NC56', family: 'Drill Pipes', method: 'oil-rotary', priceEur: 1766, consumable: true },
  { id: 'hwdp-127', name: 'Drillity Heavy-Weight Drill Pipe 127 mm NC50', family: 'Drill Pipes', method: 'oil-rotary', priceEur: 4178, consumable: false },
  { id: 'drill-collar-165', name: 'Drillity Slick Drill Collar 165.1 mm', family: 'Drill Collars', method: 'oil-rotary', priceEur: 5693, consumable: false },
  { id: 'drill-collar-203', name: 'Drillity Spiral Drill Collar 203.2 mm', family: 'Drill Collars', method: 'oil-rotary', priceEur: 6683, consumable: false },
  { id: 'stabiliser-311', name: 'Drillity Integral-Blade Stabiliser 311.2 mm', family: 'Drill String Accessories', method: 'oil-rotary', priceEur: 9268, consumable: false },
  { id: 'stabiliser-sleeve-216', name: 'Drillity Sleeve Stabiliser 215.9 mm', family: 'Drill String Accessories', method: 'oil-rotary', priceEur: 6439, consumable: false },
  { id: 'tricone-tci-311', name: 'Drillity Tricone TCI 311.2 mm', family: 'Tricone Bits', method: 'oil-rotary', priceEur: 5257, consumable: true },
  { id: 'pdc-bit-311', name: 'Drillity PDC 7-Blade 311.2 mm', family: 'PDC Bits', method: 'oil-rotary', priceEur: 8446, consumable: true },
  { id: 'mud-motor-172', name: 'Drillity Torqueline PDM 171.5 mm 7:8', family: 'Mud Motors', method: 'oil-rotary', priceEur: 96310, consumable: false },
  { id: 'mwd-collar-172', name: 'Drillity Signal MWD Collar 171.5 mm', family: 'MWD-LWD', method: 'oil-rotary', priceEur: 132015, consumable: false },
  { id: 'bop-stack-5k', name: 'Drillity Wellguard 5K 346.1 mm', family: 'BOP & Well Control', method: 'oil-rotary', priceEur: 590500, consumable: false },
  { id: 'wellhead-340', name: 'Drillity Wellhead 339.7 mm Casing Head', family: 'Wellhead & Completion', method: 'oil-rotary', priceEur: 54573, consumable: false },
  { id: 'shale-shaker-3', name: 'Drillity Sieveline 3-Deck', family: 'Shale Shakers', method: 'oil-rotary', priceEur: 62300, consumable: false },
  { id: 'mud-pump-2200', name: 'Drillity Triplex 2200', family: 'Mud Pumps', method: 'oil-rotary', priceEur: 81300, consumable: false },
  /* ── reverse circulation ──────────────────────────────────────────────── */
  { id: 'rc-pipe-114', name: 'Drillity RC Dual-Wall Pipe 4 1/2 in x 3000 mm', family: 'RC & Dual-Wall', method: 'rc', priceEur: 836, consumable: false },
  { id: 'rc-hammer-116', name: 'Drillity Chipline RC Hammer 116 mm', family: 'DTH Hammers (RC)', method: 'rc', priceEur: 7736, consumable: false },
  { id: 'rc-bit-124', name: 'Drillity Chipline RC Bit 124 mm', family: 'DTH Bits (RC)', method: 'rc', priceEur: 1313, consumable: true },
  { id: 'rc-cyclone-100', name: 'Drillity Chipline Cyclone 100 mm', family: 'Cyclones', method: 'rc', priceEur: 7600, consumable: false },
  { id: 'rc-splitter-2', name: 'Drillity Chipline Riffle Splitter 2-Way', family: 'Sample Splitters', method: 'rc', priceEur: 2920, consumable: false },
  { id: 'sample-bag-calico', name: 'Drillity Calico Sample Bag 200 x 340 mm', family: 'Sample Bags', method: 'rc', priceEur: 1, consumable: true },
  /* ── tunnelling ───────────────────────────────────────────────────────── */
  { id: 'jumbo-feed-3900', name: 'Drillity Faceline Jumbo Feed 3900 mm', family: 'Jumbo Feeds', method: 'tunnel-jumbo', priceEur: 40380, consumable: false },
  { id: 'rod-t38-face-2435', name: 'Drillity T38 Face Extension Rod 2435 mm', family: 'Drill Rods', method: 'tunnel-jumbo', priceEur: 124, consumable: true },
  { id: 'button-bit-face-48', name: 'Drillity T38 Face Bit 48 mm', family: 'Button Bits', method: 'tunnel-jumbo', priceEur: 283, consumable: true },
  { id: 'charging-hose-anfo', name: 'Drillity Faceline ANFO Charging Hose 32 mm x 30 m', family: 'ANFO Loaders', method: 'tunnel-jumbo', priceEur: 1188, consumable: false },
  { id: 'detonator-reel-500', name: 'Drillity Faceline Shock-Tube Reel 500 m / 500 ms', family: 'Initiation', method: 'tunnel-jumbo', priceEur: 456, consumable: true },
  /* ── longhole production ──────────────────────────────────────────────── */
  { id: 'rod-t51-longhole-1525', name: 'Drillity T51 Longhole Rod 1525 mm', family: 'Drill Rods', method: 'longhole', priceEur: 142, consumable: true },
  { id: 'button-bit-longhole-89', name: 'Drillity T51 Longhole Bit 89 mm', family: 'Button Bits', method: 'longhole', priceEur: 423, consumable: true },
  { id: 'ith-hammer-5', name: 'Drillity Fanline ITH Hammer 5 in', family: 'DTH Hammers', method: 'longhole', priceEur: 5240, consumable: false },
  { id: 'ith-bit-140', name: 'Drillity Fanline ITH Bit 140 mm', family: 'DTH Bits', method: 'longhole', priceEur: 988, consumable: true },
  { id: 'guide-tube-102', name: 'Drillity Fanline Guide Tube 102 mm x 1000 mm', family: 'Guide Tubes & Stabilisers', method: 'longhole', priceEur: 1649, consumable: false },
  /* ── ground support ───────────────────────────────────────────────────── */
  { id: 'friction-bolt-39', name: 'Drillity Boltline Friction Bolt 39 mm x 2400 mm', family: 'Friction Bolts', method: 'rockbolt', priceEur: 29, consumable: true },
  { id: 'friction-bolt-46', name: 'Drillity Boltline Friction Bolt 46 mm x 3000 mm', family: 'Friction Bolts', method: 'rockbolt', priceEur: 42, consumable: true },
  { id: 'rebar-bolt-20', name: 'Drillity Boltline Resin Rebar Bolt 20 mm x 2400 mm', family: 'Rock Bolts', method: 'rockbolt', priceEur: 28, consumable: true },
  { id: 'resin-fast', name: 'Drillity Boltline Resin Cartridge 25 x 600 mm (fast)', family: 'Resin Cartridges', method: 'rockbolt', priceEur: 11, consumable: true },
  { id: 'cable-bolt-6m', name: 'Drillity Boltline Bulbed Cable Bolt 15.2 mm x 6.0 m', family: 'Cable Bolts', method: 'rockbolt', priceEur: 54, consumable: true },
  { id: 'mesh-2400', name: 'Drillity Boltline Weldmesh 2400 x 1200 mm', family: 'Mesh & Surface Support', method: 'rockbolt', priceEur: 31, consumable: true },
  { id: 'bolt-plate-150', name: 'Drillity Boltline Dished Bolt Plate 150 mm', family: 'Bolt Plates & Nuts', method: 'rockbolt', priceEur: 8, consumable: true },
  { id: 'bolt-nut-m24', name: 'Drillity Boltline Dome Nut M24 with shear collar', family: 'Bolt Plates & Nuts', method: 'rockbolt', priceEur: 4, consumable: true },
  /* ── driven piling ────────────────────────────────────────────────────── */
  { id: 'precast-pile-350', name: 'Drillity Leaderline Precast Pile 350 mm x 14.0 m', family: 'Precast Concrete Piles', method: 'driven-pile', priceEur: 1666, consumable: true },
  { id: 'tube-pile-914', name: 'Drillity Leaderline Tube Pile 914.4 x 12.5 mm', family: 'Steel Tube Piles', method: 'driven-pile', priceEur: 11314, consumable: true },
  { id: 'h-pile-305', name: 'Drillity Leaderline H-Pile 310 x 305 mm', family: 'H-Piles', method: 'driven-pile', priceEur: 1823, consumable: true },
  { id: 'sheet-pile-z-630', name: 'Drillity Leaderline Z Sheet Pile Pair 630 mm', family: 'Sheet Piles', method: 'driven-pile', priceEur: 3780, consumable: true },
  { id: 'impact-hammer-9t', name: 'Drillity Leaderline Hydraulic Hammer 9 t', family: 'Impact Hammers', method: 'driven-pile', priceEur: 219000, consumable: false },
  { id: 'vibro-hammer-1500', name: 'Drillity Leaderline Vibrator 1500 kN', family: 'Vibratory Hammers', method: 'driven-pile', priceEur: 178000, consumable: false },
  { id: 'pile-helmet-350', name: 'Drillity Leaderline Pile Helmet 350 mm square', family: 'Helmets & Drive Caps', method: 'driven-pile', priceEur: 6000, consumable: false },
  { id: 'drive-cap-tube-610', name: 'Drillity Leaderline Drive Cap 610 mm tube', family: 'Helmets & Drive Caps', method: 'driven-pile', priceEur: 6890, consumable: false },
  /* ── site investigation ───────────────────────────────────────────────── */
  { id: 'spt-sampler-51', name: 'Drillity Probeline SPT Split-Spoon 50.8 mm', family: 'SPT Samplers & Hammers', method: 'site-investigation', priceEur: 420, consumable: true },
  { id: 'spt-hammer-auto', name: 'Drillity Probeline SPT Trip Hammer 63.5 kg', family: 'SPT Samplers & Hammers', method: 'site-investigation', priceEur: 7400, consumable: false },
  { id: 'cpt-piezo-10', name: 'Drillity Probeline Piezocone CPTu 10 cm2', family: 'CPT', method: 'site-investigation', priceEur: 9400, consumable: false },
  { id: 'cpt-cone-15', name: 'Drillity Probeline Cone CPT 15 cm2', family: 'CPT', method: 'site-investigation', priceEur: 6800, consumable: false },
  { id: 'push-rod-1m', name: 'Drillity Probeline CPT Push Rod 44.5 mm x 1000 mm', family: 'CPT', method: 'site-investigation', priceEur: 190, consumable: true },
  { id: 'window-sampler-60', name: 'Drillity Probeline Window Sampler 60 mm x 1000 mm', family: 'Drive & Liner Samplers', method: 'site-investigation', priceEur: 484, consumable: true },
  { id: 'u100', name: 'Drillity Probeline U100 Open-Drive Tube 100 mm', family: 'Drive & Liner Samplers', method: 'site-investigation', priceEur: 340, consumable: true },
  { id: 'shelby-76', name: 'Drillity Probeline Shelby Thin-Wall Tube 76.2 mm', family: 'Drive & Liner Samplers', method: 'site-investigation', priceEur: 96, consumable: true },
  { id: 'piezometer-50', name: 'Drillity Probeline Standpipe Piezometer 50 mm', family: 'Monitoring Well Risers & Screens', method: 'site-investigation', priceEur: 180, consumable: true },
  /* ── cable percussion ─────────────────────────────────────────────────── */
  { id: 'chisel-bit-165', name: 'Drillity Shellhand Chisel Bit 165 mm', family: 'Cable-Tool Tools', method: 'cable-tool', priceEur: 1363, consumable: true },
  { id: 'drilling-jars-500', name: 'Drillity Shellhand Drilling Jars 500 mm stroke', family: 'Cable-Tool Tools', method: 'cable-tool', priceEur: 2600, consumable: false },
  { id: 'bailer-140', name: 'Drillity Shellhand Dart Bailer 140 mm', family: 'Cable-Tool Tools', method: 'cable-tool', priceEur: 896, consumable: false },
];

/** Every id buildTool() accepts. */
export function listTools() {
  return Object.keys(TOOL_BUILDERS).concat(Object.keys(TOOL_ALIASES)).sort();
}

/**
 * THE entry point.
 *   buildTool(THREE, ctx, 'casing-crown', { wear: 0.7, casingOdMm: 168.3 })
 * Returns a THREE.Group with userData.spec / .dispose() / .fitRadius.
 * Never throws: an unknown id yields a machined billet with a note in its spec.
 */
export function buildTool(THREE_, ctx, toolId, opts) {
  const T = THREE_ || THREE;
  const o = Object.assign({}, opts || {});
  const id = String(toolId === undefined || toolId === null ? '' : toolId).trim();
  const alias = TOOL_ALIASES[id];
  const key = alias ? alias.id : id;
  const fn = TOOL_BUILDERS[key];
  let g;
  if (typeof fn !== 'function') {
    o.requestedId = id;
    g = buildBillet(T, ctx, o);
  } else {
    const merged = alias ? Object.assign({}, alias.opts, o) : o;
    try {
      g = fn(T, ctx || {}, merged);
    } catch (e) {
      if (typeof console !== 'undefined') console.warn('[tools] "' + id + '" failed to build —', e && e.message);
      o.requestedId = id;
      g = buildBillet(T, ctx, o);
    }
  }
  g.userData.toolId = id || 'billet';
  return g;
}

export default buildTool;
