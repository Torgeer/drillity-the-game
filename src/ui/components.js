/**
 * DRILLITY I THE GAME — UI primitives.
 *
 * Vanilla DOM. No framework, no network, no innerHTML inside any update path.
 * Everything here is token-driven: colours come from CSS custom properties
 * defined in styles.css, which are themselves derived from BRAND.
 */
import { GROUND, groundSwatch } from '../core/contract.js';
// The real Drillity logo artwork. Vite inlines these as data URIs in the
// single-file build, so the game stays entirely network-free.
import LOGO_FULL from './assets/logo-full.png';
import LOGO_WORDMARK from './assets/logo-wordmark.png';

/* ═══════════════════════════════════════════════════════════════════════════
   Hyperscript
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * h('div.card#id', { attrs }, children)
 * Props: className/class, text, style {}, dataset {},
 * aria-*, on* handlers, everything else set as attribute.
 */
export function h(sel, props, ...kids) {
  let tag = 'div', cls = [], id = null;
  const m = String(sel).match(/^([a-zA-Z0-9-]*)((?:[.#][^.#]+)*)$/);
  if (m) {
    if (m[1]) tag = m[1];
    const rest = m[2] || '';
    rest.replace(/([.#])([^.#]+)/g, (_, k, v) => { if (k === '.') cls.push(v); else id = v; return ''; });
  } else tag = sel;

  const node = document.createElement(tag);
  if (id) node.id = id;
  if (cls.length) node.className = cls.join(' ');

  if (props && (Array.isArray(props) || props instanceof Node || typeof props === 'string' || typeof props === 'number')) {
    kids.unshift(props); props = null;
  }
  if (props) {
    for (const k in props) {
      const v = props[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class' || k === 'className') node.className = (node.className ? node.className + ' ' : '') + v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'style' && typeof v === 'object') { for (const s in v) node.style.setProperty(s, v[s]); }
      else if (k === 'dataset') { for (const s in v) node.dataset[s] = v[s]; }
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'ref' && typeof v === 'function') v(node);
      else if (v === true) node.setAttribute(k, '');
      else node.setAttribute(k, v);
    }
  }
  append(node, kids);
  return node;
}

export function append(node, kids) {
  for (const k of kids) {
    if (k === null || k === undefined || k === false || k === true) continue;
    if (Array.isArray(k)) append(node, k);
    else if (k instanceof Node) node.appendChild(k);
    else node.appendChild(document.createTextNode(String(k)));
  }
  return node;
}

export const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); return node; };

const SVGNS = 'http://www.w3.org/2000/svg';
/** Build an SVG element tree from a compact spec. Never used per-frame. */
export function s(tag, attrs, ...kids) {
  const n = document.createElementNS(SVGNS, tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') n.textContent = v;
    else if (k === 'style' && typeof v === 'object') { for (const p in v) n.style.setProperty(p, v[p]); }
    else if (k === 'ref' && typeof v === 'function') v(n);
    else n.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k) n.appendChild(k);
  return n;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Motion — tiny critically-damped spring + easing helpers
   ═══════════════════════════════════════════════════════════════════════════ */

export class Spring {
  constructor(value = 0, stiffness = 170, damping = 22) {
    this.value = value; this.target = value; this.v = 0;
    this.k = stiffness; this.d = damping;
  }
  set(v) { this.target = v; return this; }
  snap(v) { this.value = this.target = v; this.v = 0; return this; }
  step(dt) {
    const d = Math.min(dt, 1 / 30);
    const a = this.k * (this.target - this.value) - this.d * this.v;
    this.v += a * d;
    this.value += this.v * d;
    return this.value;
  }
}

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);

/** Staggered entrance. Sets --stagger-i; CSS does the rest. */
export function stagger(nodes, step = 1) {
  let i = 0;
  for (const n of nodes) { if (n && n.style) n.style.setProperty('--stagger-i', String(i)); i += step; }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Touch — pointer-based tap with 44px targets, no 300ms delay, haptics
   ═══════════════════════════════════════════════════════════════════════════ */

let hapticFn = null;
export function setHapticSink(fn) { hapticFn = fn; }
export function haptic(pattern = 'light') { if (hapticFn) hapticFn(pattern); }

/**
 * Attaches a pointer tap. Cancels if the pointer travels (so it never fights
 * a scroll). Returns a disposer.
 */
export function tap(node, fn, opts = {}) {
  const { pattern = 'light', slop = 12 } = opts;
  let id = null, sx = 0, sy = 0, moved = false;

  const down = (e) => {
    if (node.hasAttribute('disabled') || node.classList.contains('is-disabled')) return;
    if (id !== null) return;
    id = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
    node.classList.add('is-pressed');
  };
  const move = (e) => {
    if (e.pointerId !== id) return;
    if (Math.abs(e.clientX - sx) > slop || Math.abs(e.clientY - sy) > slop) {
      moved = true; node.classList.remove('is-pressed');
    }
  };
  const up = (e) => {
    if (e.pointerId !== id) return;
    node.classList.remove('is-pressed');
    id = null;
    if (moved) return;
    if (node.hasAttribute('disabled') || node.classList.contains('is-disabled')) return;
    haptic(pattern);
    fn(e);
  };
  const cancel = (e) => { if (e.pointerId === id) { id = null; node.classList.remove('is-pressed'); } };
  const key = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (node.hasAttribute('disabled') || node.classList.contains('is-disabled')) return;
      haptic(pattern); fn(e);
    }
  };

  node.addEventListener('pointerdown', down);
  node.addEventListener('pointermove', move, { passive: true });
  node.addEventListener('pointerup', up);
  node.addEventListener('pointercancel', cancel);
  node.addEventListener('lostpointercapture', cancel);
  node.addEventListener('keydown', key);
  if (!node.hasAttribute('tabindex') && node.tagName !== 'BUTTON') node.setAttribute('tabindex', '0');

  return () => {
    node.removeEventListener('pointerdown', down);
    node.removeEventListener('pointermove', move);
    node.removeEventListener('pointerup', up);
    node.removeEventListener('pointercancel', cancel);
    node.removeEventListener('lostpointercapture', cancel);
    node.removeEventListener('keydown', key);
  };
}

/* ════════════════════════════════════════════════════════════════════════════
   Brand marks — the real artwork only.

   DOMAIN.md §10: the Drillity mark is a WORDMARK and must never be redrawn,
   re-lettered in another typeface, recoloured or replaced by an invented icon.
   The previous hand-drawn glyph set that stood in for a failed image decode is
   gone; the fallback is now the plain word in the brand amber.
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * THE DRILLITY WORDMARK — the real brand artwork.
 *
 * This is the actual logo file, not a re-lettering of it. Drillity's mark is a
 * wordmark (heavy geometric caps, #F59E0B) with "REPRESENTING PROFESSIONALS"
 * beneath it — never an icon, never redrawn, never recoloured. See DOMAIN.md §10.
 *
 * `size` is the CAP HEIGHT of DRILLITY in CSS px, so callers keep the same
 * sizing intuition they had with the drawn version.
 *
 * @param {object} o { size:number, tagline:boolean, class:string }
 */
const LOGO_WORDMARK_AR = 900 / 127;   // trimmed wordmark artwork
const LOGO_FULL_AR = 1400 / 299;      // wordmark + tagline lockup
const LOGO_FULL_CAP = 0.661;          // cap height as a fraction of the lockup height

export function Wordmark(o = {}) {
  const size = o.size || 44;
  const tagline = !!o.tagline;
  const src = tagline ? LOGO_FULL : LOGO_WORDMARK;
  // NB: not `h` — that is the hyperscript helper exported from this module.
  const hgt = tagline ? size / LOGO_FULL_CAP : size;
  const wid = hgt * (tagline ? LOGO_FULL_AR : LOGO_WORDMARK_AR);

  const img = h('img', {
    class: 'wordmark wordmark--img' + (o.class ? ' ' + o.class : ''),
    src,
    alt: 'Drillity',
    width: Math.round(wid),
    height: Math.round(hgt),
    decoding: 'async',
    draggable: 'false',
  });
  img.style.width = wid.toFixed(1) + 'px';
  img.style.height = hgt.toFixed(1) + 'px';
  // If the artwork cannot decode, fall back to the plain word set in the brand
  // amber. Never a re-lettered substitute mark (DOMAIN.md §10).
  img.addEventListener('error', () => {
    const fb = h('span.wordmark.wordmark--text' + (o.class ? ' ' + o.class : ''), {
      text: 'DRILLITY',
      role: 'img',
      'aria-label': 'Drillity',
      style: {
        display: 'block',
        color: 'var(--c-amber)',
        'font-family': 'var(--font-display)',
        'font-weight': '700',
        'font-size': size + 'px',
        'line-height': '1',
        'letter-spacing': 'var(--tr-tight)',
      },
    });
    img.replaceWith(fb);
  }, { once: true });
  return img;
}

/* THERE IS DELIBERATELY NO BIT MARK HERE.
 *
 * `BitMark()` used to live at this point: an invented six-button amber roundel
 * described as "a DTH bit face seen head-on". DOMAIN.md §10 forbids exactly
 * that, by name — "do not invent a drill-bit roundel". The Drillity mark is a
 * WORDMARK, and the real artwork is bundled at src/ui/assets/logo-{full,small,
 * wordmark}.png; `Wordmark()` above is the only way to draw it.
 *
 * The equivalent was already removed from core/assets.js, where the decal
 * factory's `logo` case drew the same crown-seen-head-on. Nothing in src/
 * called this one, which is precisely why it went: an unused export is still a
 * live export, and the next screen that wants "a small brand mark" would have
 * found it and shipped it.
 *
 * If a screen needs the mark on a surface, composite the PNG the way
 * world/terrain.js `texSign()` does. Do not redraw it.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   Icons — authored 24×24 stroke paths
   ═══════════════════════════════════════════════════════════════════════════ */

const ICONS = {
  back:     'M15 5l-7 7 7 7',
  chevron:  'M9 5l7 7-7 7',
  chevronD: 'M5 9l7 7 7-7',
  close:    'M6 6l12 12M18 6L6 18',
  check:    'M4 12.5l5.5 5.5L20 6',
  lock:     'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13z',
  play:     'M8 5.5l11 6.5-11 6.5z',
  gauge:    'M4 18a8 8 0 1 1 16 0M12 18l4.5-6.5',
  wrench:   'M15.5 4a5 5 0 0 0-5.9 6.4L4 16v4h4l5.6-5.6A5 5 0 0 0 20 8.5L17 11l-3-3z',
  helmet:   'M4 17a8 8 0 0 1 16 0zM9 17V7a3 3 0 0 1 6 0v10M2 17h20',
  cart:     'M3 4h2.5l2.5 11h10l2-8H7M9 20h.01M17 20h.01',
  rig:      'M12 2v20M12 2L5 21M12 2l7 19M7.5 9h9M6 15h12M3 21h18',
  drop:     'M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z',
  flame:    'M12 3c3 4 6 5.5 6 9.5A6 6 0 0 1 6 12.5C6 9.5 8 8 9 5c1.5 1.5 1 3.5 3-2z',
  clock:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5.5l3.5 2',
  star:     'M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.3 6.4 20.3l1.2-6.3L3 9.6l6.3-.8z',
  plus:     'M12 5v14M5 12h14',
  minus:    'M5 12h14',
  filter:   'M3 5h18l-7 8v6l-4 2v-8z',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 15h-.3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.5 8.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5v-.3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z',
  depth:    'M12 3v14M8 13l4 4 4-4M4 21h16',
  bit:      'M12 3l4 4v6l-4 8-4-8V7z M8 7h8',
  rod:      'M9 3h6v18H9zM6 8h12M6 16h12',
  hammer:   'M4 20l8-8M11 6l3-3 7 7-3 3zM9 8l4 4',
  air:      'M3 8h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 18h9',
  alert:    'M12 4l9 16H3zM12 10v4M12 17.5h.01',
  money:    'M16 7.5A5 5 0 0 0 7.5 11H15M7.5 13H15M7.5 13a5 5 0 0 0 8.5 3.5',
  trend:    'M3 16l5.5-6 4 3.5L21 5M21 5h-5M21 5v5',
  region:   'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  cert:     'M6 3h12v13l-6 5-6-5zM9.5 10.5l2 2 3.5-4',
  skill:    'M12 3l2.4 5.6 6 .5-4.6 4 1.4 5.9L12 15.9 6.8 19l1.4-5.9-4.6-4 6-.5z',
  bolt:     'M13 2L4 14h6l-1 8 9-12h-6z',
  shield:   'M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z',
  garage:   'M3 21V9l9-5 9 5v12M7 21v-7h10v7M7 17h10',
  info:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 7.5h.01',
  layers:   'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',

  /* ── Equipment glyphs ───────────────────────────────────────────────────
     The iMarket front door is signposted with the tools themselves. A family
     of drilling equipment does not get a stock-chart arrow or a map pin: a
     driller has to recognise the aisle from the icon alone.

     Two of these exist only to keep two methods apart. A DRIFTER is the rock
     drill that sits on the feed beam and sends the blow down the rods; a DTH
     HAMMER puts the piston at the bit, down the hole. They are different
     methods driven by different machines, so they never share a glyph.     */

  /** Top-hammer drifter: rock drill on a feed beam, blow travelling down the rod. */
  drifter: [
    'M3 18.4h18',                                   // feed beam
    { d: 'M4.6 8.6h9.2v6.2H4.6z', fill: 0.2 },      // drifter body
    'M6.9 10.6v2.2M9.2 10.6v2.2M11.5 10.6v2.2',     // percussion cylinder ribs
    'M4.6 14.8v3.4M13.8 14.8v3.4',                  // cradle onto the beam
    'M13.8 11.7h7.4',                               // shank adapter + rod
    'M18.2 10.1v3.2',                               // coupling shoulder
    'M2.4 9.9l1.5 1.8-1.5 1.8',                     // blow energy, entering the string
  ],
  /** DTH hammer: case, piston, bit sub and a button face — percussion AT the bit. */
  dth: [
    'M8.4 2.8h7.2v12.1H8.4z',                       // hammer case
    { d: 'M10.2 5.4h3.6v5.4h-3.6z', fill: 0.34 },   // piston
    'M9.4 14.9h5.2v2.2H9.4z',                       // bit shank
    { d: 'M7.6 17.1h8.8l-1.3 2.7H8.9z', fill: 0.2 },// bit head
    { circle: [9.9, 20.6, 0.95], fill: 1 },
    { circle: [12, 21.1, 0.95], fill: 1 },
    { circle: [14.1, 20.6, 0.95], fill: 1 },
  ],
  /** HDD pilot head: bent shank, slanted duckbill face, steering the bore. */
  hdd: [
    'M2.2 20.4c4.1-1 7-3 9.2-6',                    // the curved pilot bore
    { d: 'M11 13.6l8.8-5.1 2.1 3.6-8.8 5.1z', fill: 0.22 }, // duckbill blade
    'M19.8 8.5l2.1 3.6',                            // carbide leading edge
    'M15.3 10.9l1.1 1.9M17.4 9.7l1.1 1.9',          // face inserts
  ],
  /** Tunnel arch with a jumbo boom working the face. */
  tunnel: [
    'M3 20.6v-8.1a9 9 0 0 1 18 0v8.1',              // portal arch
    'M1.8 20.6h20.4',                               // invert
    'M7.2 20.6v-3.6l5.4-3.1',                       // boom
    'M11.6 14.9l5-2.9',                             // feed beam
    'M14.4 10.5l2.6 4.5',                           // drill steel at the face
  ],
  /** Casing rotator: hydraulic drive clamped round a casing string. */
  rotator: [
    'M9.4 2.6v18.8M14.6 2.6v18.8',                  // casing
    { d: 'M3.6 9.6h16.8v4.8H3.6z', fill: 0.2 },     // rotator housing
    'M6.6 9.6v4.8M17.4 9.6v4.8',                    // jaw carriers
    'M8.6 6.6a5 5 0 0 1 6.8 0',                     // rotation
    'M8.6 6.6l.2-2M8.6 6.6l2 .3',
  ],
  /** Round-shank / point-attack pick: carbide tip, body, shank, retention ring. */
  pick: [
    { d: 'M12 22.4l-2.7-4.9h5.4z', fill: 1 },       // carbide tip
    { d: 'M9.3 17.5l1-4.6h3.4l1 4.6z', fill: 0.22 },// pick body
    'M10.5 12.9V4.2h3v8.7',                         // shank
    'M10.1 8.8h3.8',                                // retention ring
  ],
  /** Piling lead: mast, hammer and the pile going into the ground. */
  piling: [
    'M6.2 2.4v18.2',                                // lead / mast
    'M6.2 5.4l3.2 2.1M6.2 9.6l3.2 2.1M6.2 13.8l3.2 2.1',
    { d: 'M9.4 4.4h7.8v6.2H9.4z', fill: 0.22 },     // hammer
    'M13.3 10.6v9.9',                               // pile
    'M2 20.6h20',                                   // ground line
  ],
};

export function Icon(name, size = 20, opts = {}) {
  const spec = ICONS[name] || ICONS.info;
  // A glyph is either one stroked path (the compact form most icons use) or a
  // list of parts: a `d` string, `{ d, fill }` for a filled shape, or
  // `{ circle:[cx,cy,r], fill }` for a carbide button.
  const parts = (Array.isArray(spec) ? spec : [spec]).map((p) => {
    if (typeof p === 'string') return s('path', { d: p });
    if (p.circle) {
      return s('circle', {
        cx: p.circle[0], cy: p.circle[1], r: p.circle[2],
        fill: 'currentColor', stroke: 'none',
        'fill-opacity': p.fill === undefined ? 1 : p.fill,
      });
    }
    return s('path', {
      d: p.d,
      fill: p.fill ? 'currentColor' : 'none',
      'fill-opacity': typeof p.fill === 'number' ? p.fill : null,
    });
  });
  return s('svg', {
    class: 'icon' + (opts.class ? ' ' + opts.class : ''),
    viewBox: '0 0 24 24', width: size, height: size,
    fill: 'none', stroke: 'currentColor', 'stroke-width': opts.weight || 1.9,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'aria-hidden': 'true', focusable: 'false',
  }, parts);
}

/* ═══════════════════════════════════════════════════════════════════════════
   3D item previews — shared by the shop cards and the garage rig cards
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Paint one 3D preview bitmap into a card canvas.
 *
 * Two things this does that a plain drawImage does not:
 *
 *  1. **It does not crop the machine.** core/preview.js renders a SQUARE
 *     thumbnail; a rig card is a wide letterbox. Cover-fitting a square into a
 *     220 × 92 box throws away 60% of the frame height — which is exactly the
 *     mast and the tracks, the two things that tell one rig from another. This
 *     contain-fits and applies a small deliberate zoom instead: the preview
 *     frames on the bounding sphere with ~23% margin, so 9% of zoom is free.
 *
 *  2. **It gives the render a floor.** The preview's studio backdrop is a
 *     sphere of radius 12 and the camera is pushed outside it whenever the
 *     subject is large, so a rig comes back on an unlit black field. Painting
 *     the card's own studio ramp underneath and compositing the render over it
 *     with `screen` puts the machine back on a surface: black in the render
 *     leaves the ramp untouched, and lit metal wins wherever it exists.
 *
 *  3. **It refuses to deliver an empty frame.** `screen` is the right blend for
 *     an opaque, near-black render — measured mean luminance 4/255, peak 216 —
 *     but it is also the blend that makes a FAILED render invisible: an all
 *     black bitmap screens to exactly the ramp and the amber key, which is
 *     indistinguishable from having no thumbnail at all, and the card would
 *     never fall back to its authored art. A WebGL canvas hands back precisely
 *     that once its drawing buffer has been cleared, so this is a real failure
 *     mode and not a hypothetical one. `hasSignal` checks the frame actually
 *     carries something before it is trusted; when it does not, this returns
 *     false and the caller draws the placeholder instead of an empty square.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {ImageBitmap|HTMLCanvasElement} bmp
 * @param {object} o { dpr, zoom, ax, ay }  ax/ay = the studio key position 0..1
 */

/* One shared 24 x 24 scratch surface for the signal check, and a WeakMap so a
   bitmap is only ever measured once — preview.js caches its thumbnails, so the
   same bitmap comes back for every card that shows that item. */
let _sigCanvas = null;
const _sigCache = new WeakMap();

/**
 * Does this frame carry an image, or is it an empty buffer?
 *
 * Measured against real renders: an item thumbnail peaks at ~216/255 against a
 * near-black studio backdrop, so any genuine frame clears this by a wide
 * margin. The threshold only has to separate "something is lit here" from
 * "nothing was drawn". A frame that cannot be measured at all is trusted —
 * refusing to paint on an inconclusive reading would be worse than painting.
 */
function hasSignal(bmp) {
  if (!bmp) return false;
  const cached = _sigCache.get(bmp);
  if (cached !== undefined) return cached;
  let ok = true;
  try {
    if (!_sigCanvas) { _sigCanvas = document.createElement('canvas'); _sigCanvas.width = 24; _sigCanvas.height = 24; }
    const g = _sigCanvas.getContext('2d', { willReadFrequently: true });
    g.clearRect(0, 0, 24, 24);
    g.drawImage(bmp, 0, 0, 24, 24);
    const d = g.getImageData(0, 0, 24, 24).data;
    let max = 0;
    for (let i = 0; i < d.length; i += 4) {
      // Alpha matters as much as luminance: a transparent frame screens to
      // nothing just as surely as a black one.
      if (d[i + 3] < 8) continue;
      const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
      if (l > max) max = l;
    }
    ok = max >= 10;
  } catch (e) {
    ok = true;               // could not read it — trust it rather than blank it
  }
  _sigCache.set(bmp, ok);
  return ok;
}

export function paintPreview(canvas, bmp, o = {}) {
  if (!canvas || !bmp) return false;
  if (!hasSignal(bmp)) return false;
  const dpr = Math.min(o.dpr || window.devicePixelRatio || 1, 2);
  /* NO INVENTED BOX. `clientWidth || 92` used to fabricate a 92-square backing
     store for a canvas that had no layout at all — mounted inside a screen
     that is still `hidden`, which is `display: none` — and then LATCHED it,
     because `canvas.width` is only rewritten when the measured size changes
     and the measured size never came back. Refusing is what lets mountPreview
     re-arm on the next frame, and the thumbnail cache makes that free. */
  const w = canvas.clientWidth;
  const hh = canvas.clientHeight;
  if (!w || !hh) return false;
  const W = Math.max(1, Math.round(w * dpr));
  const H = Math.max(1, Math.round(hh * dpr));
  if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
  const c = canvas.getContext('2d');
  if (!c) return false;

  const cs = getComputedStyle(canvas);
  const tk = (n, f) => (cs.getPropertyValue(n) || f).trim();
  const card = tk('--rgb-card', '22 28 38');
  const deep = tk('--rgb-bg-deep', '13 18 25');
  const amber = tk('--rgb-amber', '245 158 11');
  const ax = (o.ax ?? 0.42) * W;
  const ay = (o.ay ?? 0.24) * H;

  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'source-over';
  c.clearRect(0, 0, W, H);

  const ramp = c.createLinearGradient(0, 0, 0, H);
  ramp.addColorStop(0, `rgb(${card} / 1)`);
  ramp.addColorStop(1, `rgb(${deep} / 1)`);
  c.fillStyle = ramp;
  c.fillRect(0, 0, W, H);

  const key = c.createRadialGradient(ax, ay, 0, ax, ay, Math.max(W, H) * 0.85);
  key.addColorStop(0, `rgb(${amber} / .16)`);
  key.addColorStop(1, `rgb(${amber} / 0)`);
  c.fillStyle = key;
  c.fillRect(0, 0, W, H);

  const sw = bmp.width || 256;
  const sh = bmp.height || 256;
  const s = Math.min(W / sw, H / sh) * (o.zoom || 1.18);
  const dw = sw * s, dh = sh * s;
  c.globalCompositeOperation = 'screen';
  c.drawImage(bmp, (W - dw) / 2, (H - dh) / 2, dw, dh);
  c.globalCompositeOperation = 'source-over';
  return true;
}

/**
 * Ask the preview system for `ref`'s thumbnail and paint it, falling back to
 * the caller's authored art whenever the 3D path is unavailable or declines.
 * Never leaves a blank canvas, and never throws into a render pass.
 *
 * @param {object} o { preview, canvas, ref, wear, dpr, zoom, ax, ay, fallback }
 */
export function mountPreview(o = {}) {
  const { preview: sp, canvas, ref } = o;
  const fallback = typeof o.fallback === 'function' ? o.fallback : () => {};
  if (!canvas || !sp) { fallback(); return; }
  const opts = { wear: o.wear || 0 };

  /* ── (a) GIVE THE CANVAS A REAL BOX ──────────────────────────────────
     `.icard__prev` and `.rigcard__art` are `display: grid; place-items:
     center`, and `place-items: center` does NOT stretch a grid item — so
     `height: 100%` on the canvas resolves against an indefinite row and falls
     back to the canvas's intrinsic 300x150. Measured: a rig-card canvas laid
     out 216x108 inside a 216x150 well, and a front-strip canvas 390x195
     inside a 124px well, with 36 % of it clipped away. paintPreview then read
     those numbers into the backing store and the wrong ratio was permanent.
     Both wells are already `position: relative`. */
  if (canvas.style.position !== 'absolute') {
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }

  /* ── (b) NEVER PAINT INTO NOWHERE, AND NEVER DROP THE FRAME ──────────
     Three conditions make a mount unpaintable, and every one of them used to
     end in silence: the canvas is off the DOM because a re-render replaced
     the card list underneath an in-flight promise; it has no layout because
     the screen is still hidden; or preview.js has not finished `init()` and
     `thumbnail()` is answering null. None of those mean "this item has no
     3D" — they mean "not yet". So: draw the authored art NOW, and re-arm.
     `preview.js` caches by item and wear, so the retry costs one map lookup.

     This is the whole bug. `mountPreview` had four separate silent bails —
     its own `!canvas.isConnected`, and the identical guard at the head of
     `drawPlaceholder` and `drawRig` — so a card that lost the race showed
     neither the render nor the fallback, and nothing ever tried again. */
  const paintable = () => canvas.isConnected && canvas.clientWidth > 0 && canvas.clientHeight > 0;
  if (!paintable() || sp.ready === false) {
    fallback();
    if (canvas.isConnected) requestAnimationFrame(() => mountPreview(o));
    return;
  }

  if (typeof sp.thumbnail === 'function') {
    let p;
    try { p = sp.thumbnail(ref, opts); } catch (e) {
      console.warn('[preview] thumbnail failed', e && e.message);
      fallback(); return;
    }
    Promise.resolve(p)
      .then((bmp) => {
        // The card really was replaced; the new one has its own mount.
        if (!canvas.isConnected) return;
        if (!bmp) { fallback(); return; }
        if (!paintPreview(canvas, bmp, o)) fallback();
      })
      .catch((e) => { console.warn('[preview] paint failed', e && e.message); fallback(); });
    return;
  }

  // Older preview surface: it owns the blit, so the letterbox fix cannot apply.
  if (typeof sp.render === 'function') {
    let res;
    try { res = sp.render(ref, canvas, opts); } catch (e) {
      console.warn('[preview] render failed', e && e.message);
      fallback(); return;
    }
    if (res && typeof res.then === 'function') res.then((ok) => { if (!ok) fallback(); }).catch(() => fallback());
    else if (res === false) fallback();
    return;
  }
  fallback();
}

/* ═══════════════════════════════════════════════════════════════════════════
   Buttons, chips, rows
   ═══════════════════════════════════════════════════════════════════════════ */

/** kind: amber | steel | ghost | danger | warning | success | quiet */
export function Button(o = {}) {
  const b = h(`button.btn.btn--${o.kind || 'ghost'}${o.size ? '.btn--' + o.size : ''}${o.block ? '.btn--block' : ''}`, {
    type: 'button',
    'aria-label': o.ariaLabel || o.label,
    disabled: o.disabled || null,
  });
  if (o.icon) b.appendChild(Icon(o.icon, o.size === 'sm' ? 16 : 19));
  if (o.label) b.appendChild(h('span.btn__label', { text: o.label }));
  if (o.badge) b.appendChild(h('span.btn__badge', { text: o.badge }));
  if (o.onTap) tap(b, o.onTap, { pattern: o.haptic || 'medium' });
  return b;
}

export function Chip(o = {}) {
  const c = h('button.chip', { type: 'button', 'aria-pressed': o.active ? 'true' : 'false' },
    o.icon ? Icon(o.icon, 14) : null,
    h('span', { text: o.label }),
    o.count !== undefined ? h('i.chip__count', { text: String(o.count) }) : null,
  );
  if (o.active) c.classList.add('is-active');
  if (o.onTap) tap(c, () => o.onTap(c));
  return c;
}

export function Pill(label, kind = 'neutral', icon = null) {
  return h(`span.pill.pill--${kind}`, icon ? Icon(icon, 12) : null, h('span', { text: label }));
}

export function Row(o = {}) {
  const r = h('div.row' + (o.onTap ? '.row--tappable' : ''), null,
    o.icon ? h('span.row__ico', Icon(o.icon, 18)) : null,
    h('div.row__body', h('div.row__label', { text: o.label }), o.sub ? h('div.row__sub', { text: o.sub }) : null),
    o.value !== undefined ? h('div.row__value', { text: String(o.value) }) : null,
    o.onTap ? h('span.row__chev', Icon('chevron', 16)) : null,
  );
  if (o.onTap) { tap(r, o.onTap); r.setAttribute('role', 'button'); }
  return r;
}

export function SpecRow(k, v) {
  return h('div.spec', h('dt.spec__k', { text: k }), h('dd.spec__v', { text: String(v) }));
}

export function SectionTitle(text, right) {
  return h('div.sect', h('h2.sect__t', { text }), right || null);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Meters
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Horizontal bar. Frame-safe: setValue writes only a CSS custom property.
 * pattern:true adds a diagonal hatch for colour-blind separation.
 */
export function Bar(o = {}) {
  const el = h(`div.bar.bar--${o.kind || 'amber'}${o.pattern ? '.bar--hatch' : ''}`, {
    role: 'progressbar', 'aria-label': o.label || 'meter',
    'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0',
  }, h('i.bar__fill'), o.marker !== undefined ? h('i.bar__mark') : null);
  const api = {
    el,
    setValue(v) {
      const c = clamp01(v);
      el.style.setProperty('--v', c.toFixed(4));
      el.setAttribute('aria-valuenow', String(Math.round(c * 100)));
    },
    setMarker(v) { el.style.setProperty('--m', clamp01(v).toFixed(4)); },
    setKind(k) { el.className = el.className.replace(/bar--(amber|steel|success|danger|warning|heat|flush)/, 'bar--' + k); },
  };
  api.setValue(o.value || 0);
  if (o.marker !== undefined) api.setMarker(o.marker);
  return api;
}

/** SVG progress ring. setValue writes stroke-dashoffset only. */
export function Ring(o = {}) {
  const size = o.size || 56, sw = o.stroke || 5;
  const r = (size - sw) / 2, C = 2 * Math.PI * r;
  let fill = null;
  const wrap = h('div.ring', { style: { '--ring-size': size + 'px' }, 'aria-label': o.label || null, role: o.label ? 'img' : null },
    s('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, 'aria-hidden': 'true', focusable: 'false' },
      s('circle', { class: 'ring__track', cx: size / 2, cy: size / 2, r, fill: 'none', 'stroke-width': sw }),
      s('circle', {
        class: 'ring__fill', cx: size / 2, cy: size / 2, r, fill: 'none', 'stroke-width': sw,
        'stroke-linecap': 'round', 'stroke-dasharray': C.toFixed(2),
        transform: `rotate(-90 ${size / 2} ${size / 2})`,
        ref: (n) => (fill = n),
      }),
    ),
    h('div.ring__center', o.center || null),
  );
  let kind = o.kind || null;
  if (kind) wrap.classList.add('ring--' + kind);
  const api = {
    el: wrap,
    setValue(v) { fill.setAttribute('stroke-dashoffset', (C * (1 - clamp01(v))).toFixed(2)); },
    setKind(k) { if (k === kind) return; kind = k; wrap.className = 'ring ring--' + k; },
    center: wrap.querySelector('.ring__center'),
  };
  api.setValue(o.value || 0);
  return api;
}

/** Canvas sparkline with a rolling window. Draw only — never touches layout. */
export function Sparkline(o = {}) {
  const cap = o.capacity || 64;
  const buf = new Float32Array(cap);
  let n = 0, head = 0, dirty = true;
  const cvs = h('canvas.spark', { 'aria-hidden': 'true' });
  const ctx2d = cvs.getContext('2d');
  let W = 0, H = 0, dpr = 1;

  function resize(w, hh, d) {
    dpr = d || 1; W = Math.max(2, Math.round(w)); H = Math.max(2, Math.round(hh));
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
    dirty = true;
  }
  function push(v) { buf[head] = v; head = (head + 1) % cap; if (n < cap) n++; dirty = true; }
  function draw(color) {
    if (!dirty || !W) return;
    dirty = false;
    const c = ctx2d;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    if (n < 2) return;
    let max = 0.0001;
    for (let i = 0; i < n; i++) max = Math.max(max, buf[i]);
    const pad = 2;
    const stepX = (W - pad * 2) / (cap - 1);
    const start = (head - n + cap) % cap;
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const v = buf[(start + i) % cap] / max;
      const x = pad + (cap - n + i) * stepX;
      const y = H - pad - v * (H - pad * 2);
      i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
    }
    const col = color || 'rgba(223,181,82,0.95)';
    c.lineWidth = 1.75; c.lineJoin = 'round'; c.lineCap = 'round';
    c.strokeStyle = col; c.stroke();
    c.lineTo(pad + (cap - 1) * stepX, H); c.lineTo(pad + (cap - n) * stepX, H); c.closePath();
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, col.replace(/[\d.]+\)$/, '0.24)'));
    g.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    c.fillStyle = g; c.fill();
  }
  return { el: cvs, resize, push, draw, reset() { n = 0; head = 0; dirty = true; } };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Stratum column — the tiny ground-profile preview, drawn from GROUND colours
   ═══════════════════════════════════════════════════════════════════════════ */

const FALLBACK_COLORS = ['#5A5A5A', '#3A3A3A'];
const PATTERN_CACHE = new Map();
function patternFor(c2d, kind, color) {
  const key = kind + color;
  if (PATTERN_CACHE.has(key)) return PATTERN_CACHE.get(key);
  const p = document.createElement('canvas');
  p.width = 8; p.height = 8;
  const g = p.getContext('2d');
  g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 1;
  switch (kind) {
    case 'clay': g.beginPath(); g.moveTo(0, 2); g.lineTo(8, 2); g.moveTo(0, 6); g.lineTo(8, 6); g.stroke(); break;
    case 'sand': for (let i = 0; i < 6; i++) g.fillRect((i * 3) % 8, (i * 5) % 8, 1, 1); break;
    case 'gravel': g.beginPath(); g.arc(2, 2, 1.4, 0, 7); g.arc(6, 5, 1.7, 0, 7); g.fill(); break;
    case 'till': g.beginPath(); g.arc(3, 3, 2, 0, 7); g.stroke(); g.fillRect(6, 6, 1.5, 1.5); break;
    case 'sedimentary': g.beginPath(); g.moveTo(0, 4); g.lineTo(8, 4); g.stroke(); break;
    case 'crystalline': g.beginPath(); g.moveTo(0, 8); g.lineTo(8, 0); g.moveTo(-2, 2); g.lineTo(2, -2); g.stroke(); break;
    case 'fractured': g.beginPath(); g.moveTo(0, 0); g.lineTo(8, 8); g.moveTo(8, 0); g.lineTo(0, 8); g.stroke(); break;
    case 'void': break;
    default: g.beginPath(); g.moveTo(0, 4); g.lineTo(8, 4); g.stroke();
  }
  const pat = c2d.createPattern(p, 'repeat');
  PATTERN_CACHE.set(key, pat);
  return pat;
}

/**
 * @param {object} o { width, height, strata:Stratum[], depth?:number, orientation:'v'|'h', labels:boolean }
 */
export function StratumColumn(o = {}) {
  const cvs = h('canvas.stratacol', { 'aria-hidden': 'true' });
  const c = cvs.getContext('2d');
  let W = o.width || 34, H = o.height || 110, dpr = 1;
  let strata = o.strata || [];
  let marker = o.depth ?? null;

  function resize(w, hh, d) {
    W = Math.max(2, Math.round(w)); H = Math.max(2, Math.round(hh)); dpr = d || (window.devicePixelRatio || 1);
    cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
    draw();
  }
  function setStrata(st) { strata = st || []; draw(); }
  function setDepth(d) { marker = d; draw(); }

  function draw() {
    if (!W || !H) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    const total = strata.length ? strata[strata.length - 1].bottom : 1;
    if (!total) return;
    for (const st of strata) {
      const y0 = (st.top / total) * H;
      const y1 = (st.bottom / total) * H;
      const hgt = Math.max(1, y1 - y0);
      // GROUND[].colors are albedos — use the displayed pair for DOM swatches.
      const cols = groundSwatch(st.id) || FALLBACK_COLORS;
      const g = c.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, cols[0]);
      g.addColorStop(1, cols[1]);
      c.fillStyle = g;
      c.fillRect(0, y0, W, hgt);
      c.save();
      c.globalAlpha = 0.22;
      c.fillStyle = patternFor(c, st.pattern || 'clay', 'rgba(255,255,255,0.9)');
      c.fillRect(0, y0, W, hgt);
      c.restore();
      c.fillStyle = 'rgba(0,0,0,0.34)';
      c.fillRect(0, y1 - 0.75, W, 0.75);
    }
    // Inner shading so it reads as a cut core, not a flat swatch.
    const sh = c.createLinearGradient(0, 0, W, 0);
    sh.addColorStop(0, 'rgba(0,0,0,0.34)');
    sh.addColorStop(0.35, 'rgba(255,255,255,0.06)');
    sh.addColorStop(1, 'rgba(0,0,0,0.4)');
    c.fillStyle = sh; c.fillRect(0, 0, W, H);
    if (marker !== null && marker !== undefined && total) {
      const y = Math.min(H - 1, (marker / total) * H);
      c.fillStyle = 'rgba(223,181,82,0.95)';
      c.fillRect(0, y - 1, W, 2);
    }
  }
  resize(W, H, o.dpr);
  return { el: cvs, resize, setStrata, setDepth, draw };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Vertical touch slider — Feed / Rotation / Flush
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {object} o
 *   label, short, value 0..1, kind ('feed'|'rot'|'flush'), detents:number,
 *   onChange(v), onCommit(v)
 */
export function VSlider(o = {}) {
  let value = clamp01(o.value ?? 0.5);
  const detents = o.detents || 10;
  let lastDetent = Math.round(value * detents);
  let pid = null;

  const fill = h('i.vsl__fill');
  const knob = h('i.vsl__knob');
  const readout = h('span.vsl__val', { text: Math.round(value * 100) + '' });
  const track = h('div.vsl__track', fill, h('i.vsl__ticks'), knob, readout);

  const el = h(`div.vsl.vsl--${o.kind || 'feed'}`, {
    role: 'slider', tabindex: '0',
    'aria-label': o.label, 'aria-valuemin': '0', 'aria-valuemax': '100',
    'aria-valuenow': String(Math.round(value * 100)),
    'aria-orientation': 'vertical',
  },
    h('div.vsl__head', h('span.vsl__name', { text: o.short || o.label })),
    track,
  );

  function paint() {
    el.style.setProperty('--v', value.toFixed(4));
    readout.textContent = String(Math.round(value * 100));
    el.setAttribute('aria-valuenow', String(Math.round(value * 100)));
  }
  function apply(v, fromUser) {
    const nv = clamp01(v);
    if (nv === value) return;
    value = nv;
    paint();
    if (fromUser) {
      const d = Math.round(value * detents);
      if (d !== lastDetent) { lastDetent = d; haptic('light'); }
      o.onChange && o.onChange(value);
    }
  }
  function fromEvent(e) {
    const r = track.getBoundingClientRect();
    if (!r.height) return value;
    return clamp01(1 - (e.clientY - r.top) / r.height);
  }

  const down = (e) => {
    if (pid !== null) return;
    pid = e.pointerId;
    track.setPointerCapture?.(pid);
    el.classList.add('is-active');
    haptic('medium');
    apply(fromEvent(e), true);
    e.preventDefault();
  };
  const move = (e) => { if (e.pointerId !== pid) return; apply(fromEvent(e), true); e.preventDefault(); };
  const up = (e) => {
    if (e.pointerId !== pid) return;
    try { track.releasePointerCapture(pid); } catch (_) { /* already released */ }
    pid = null;
    el.classList.remove('is-active');
    o.onCommit && o.onCommit(value);
  };

  track.addEventListener('pointerdown', down);
  track.addEventListener('pointermove', move);
  track.addEventListener('pointerup', up);
  track.addEventListener('pointercancel', up);

  el.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.2 : 0.05;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { apply(value + step, true); e.preventDefault(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { apply(value - step, true); e.preventDefault(); }
    else if (e.key === 'Home') { apply(0, true); e.preventDefault(); }
    else if (e.key === 'End') { apply(1, true); e.preventDefault(); }
  });

  paint();
  return {
    el,
    get value() { return value; },
    set(v) { apply(v, false); },
    dispose() {
      track.removeEventListener('pointerdown', down);
      track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', up);
      track.removeEventListener('pointercancel', up);
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Number roll-up — animated counter driven by the frame loop
   ═══════════════════════════════════════════════════════════════════════════ */

export function NumberRoll(node, o = {}) {
  let cur = o.value ?? 0, target = cur, t = 1, from = cur;
  const dur = o.duration ?? 0.9;
  const fmt = o.format || ((v) => String(Math.round(v)));
  let instant = !!o.instant;
  node.textContent = fmt(cur);
  return {
    to(v, opts) {
      if (instant || opts?.instant) { cur = target = from = v; node.textContent = fmt(v); return; }
      from = cur; target = v; t = 0;
    },
    setInstant(b) { instant = b; },
    step(dt) {
      if (t >= 1) return false;
      t = Math.min(1, t + dt / dur);
      cur = from + (target - from) * easeOutCubic(t);
      node.textContent = fmt(cur);
      return true;
    },
    get value() { return cur; },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Glass panel / card / sheet
   ═══════════════════════════════════════════════════════════════════════════ */

export function Panel(o = {}, ...kids) {
  return h(`div.panel${o.tone ? '.panel--' + o.tone : ''}${o.pad ? '.panel--pad' : ''}${o.class ? '.' + o.class : ''}`, null,
    o.title ? h('div.panel__head',
      h('h3.panel__title', { text: o.title }),
      o.action || null,
    ) : null,
    h('div.panel__body', ...kids),
  );
}

export function Card(o = {}, ...kids) {
  const c = h(`div.card${o.tone ? '.card--' + o.tone : ''}${o.onTap ? '.card--tappable' : ''}`, null, ...kids);
  if (o.onTap) { tap(c, o.onTap); c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); }
  if (o.locked) c.classList.add('is-locked');
  return c;
}

export function Empty(text, sub) {
  return h('div.empty', h('span.empty__ico', Icon('layers', 26)), h('p.empty__t', { text }), sub ? h('p.empty__s', { text: sub }) : null);
}

/** Header used by every full screen. */
export function ScreenHeader(o = {}) {
  return h('header.shead',
    o.onBack ? (() => { const b = h('button.shead__back', { type: 'button', 'aria-label': 'Back' }, Icon('back', 20)); tap(b, o.onBack); return b; })() : h('span.shead__spacer'),
    h('div.shead__mid', h('h1.shead__t', { text: o.title }), o.sub ? h('p.shead__s', { text: o.sub }) : null),
    o.right || h('span.shead__spacer'),
  );
}

/** A horizontally scrolling, snapping strip. */
export function Strip(...kids) {
  return h('div.strip', ...kids);
}

/** Difficulty as 1–5 filled bars (shape, not just colour). */
export function Difficulty(n) {
  const wrap = h('span.diff', { 'aria-label': `Difficulty ${n} of 5` });
  for (let i = 0; i < 5; i++) wrap.appendChild(h('i.diff__b' + (i < n ? '.is-on' : '')));
  return wrap;
}

export const fmtHours = (hh) => (hh >= 24 ? `${Math.floor(hh / 24)}d ${hh % 24}h` : `${hh}h`);
export const fmtPct = (v) => `${Math.round(clamp01(v) * 100)}%`;
