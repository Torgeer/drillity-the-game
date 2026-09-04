/**
 * THE ENUMERATING MEASUREMENT — injected into the page as a string.
 *
 * ── WHY THIS EXISTS ────────────────────────────────────────────────────────
 * The previous harness measured a hand-written allowlist of ~19 class names.
 * Anything it had not been told about was invisible to it, so it reported
 * "0 overlaps" on a screen that had eight. A measurement instrument that can
 * only see what it was told to look for is worse than no instrument, because
 * it produces CONFIDENT FALSE NEGATIVES and the project stops looking.
 *
 * This one starts from `*` and subtracts. Nothing is named. A new element
 * added to any screen tomorrow is measured tomorrow, with no edit here.
 *
 * ── WHAT COUNTS AS A THING ON SCREEN ───────────────────────────────────────
 * Enumerating `*` naively is also wrong, in the other direction: it reports a
 * transparent flex wrapper as an object and every parent as overlapping its
 * own child. So the rule is INK, not elements:
 *
 *   An element is measured if it PAINTS — a non-transparent background, a
 *   visible border, a box-shadow, a background image, a replaced element
 *   (canvas / svg / img / video), or a text node of its own — AND it is
 *   actually visible: effective opacity through every ancestor above the
 *   threshold, no `display:none` / `visibility:hidden` anywhere in the chain,
 *   and a non-empty box after every ancestor clip is applied.
 *
 * Its rects are its border box (when the box itself paints) plus the real
 * per-line client rects of its own text, taken with a Range. A wide flex row
 * holding one short label therefore contributes the label's glyph box, not
 * the whole row — which is the difference between measuring what is drawn and
 * measuring what is declared.
 *
 * ── WHAT COUNTS AS AN OVERLAP ──────────────────────────────────────────────
 * Two painted elements whose rects intersect and which are NOT in an
 * ancestor/descendant relationship. Containment is nesting, not overlap: an
 * icon inside its own button is how buttons are built. Everything else that
 * intersects is reported, including the elements nobody wrote a selector for.
 *
 * A cross-fade is caught rather than excused: opacity is sampled live, so two
 * faces that are both painted mid-transition are both measured, and only a
 * face that is genuinely at zero drops out.
 */
export const ENUMERATE = function measureScreen(opts) {
  const OPT = Object.assign({ minOverlap: 0.5, minArea: 2, opacityFloor: 0.02 }, opts || {});

  const stage = document.querySelector('.ui-stage') || document.body;
  const sr = stage.getBoundingClientRect();
  const W = Math.round(sr.width), H = Math.round(sr.height);

  /* The live screen — the one that is neither hidden nor mid-exit. Old screens
     that were left in the DOM are counted separately (see `dom`), because a
     screen that is retained but hidden is a leak worth naming even though it
     paints nothing. */
  const screenNodes = [...document.querySelectorAll('.screens > .screen')];
  const live = screenNodes.find((n) => !n.hidden && !n.classList.contains('is-leaving')
    && !n.classList.contains('is-leaving--back')) || document.body;

  const alpha = (col) => {
    if (!col || col === 'transparent') return 0;
    const m = /rgba?\(([^)]+)\)/.exec(col);
    if (!m) return 1;
    const p = m[1].split(/[,/]/).map((s) => parseFloat(s));
    return p.length > 3 ? (isNaN(p[3]) ? 1 : p[3]) : 1;
  };
  const REPLACED = new Set(['CANVAS', 'SVG', 'IMG', 'VIDEO', 'INPUT', 'SELECT', 'TEXTAREA']);

  /* ── Visibility, resolved through the whole ancestor chain ─────────────── */
  const state = new Map();   // el -> { vis, op, clip:{l,t,r,b} } | null when invisible
  function resolve(el) {
    if (state.has(el)) return state.get(el);
    let parentState = null;
    const par = el.parentElement;
    if (par && par !== document.documentElement) {
      parentState = resolve(par);
      if (!parentState) { state.set(el, null); return null; }
    }
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') {
      state.set(el, null); return null;
    }
    const op = (parentState ? parentState.op : 1) * (parseFloat(cs.opacity) || 0);
    if (op < OPT.opacityFloor) { state.set(el, null); return null; }

    // Inherit the ancestor clip, then add our own when we clip our children.
    let clip = parentState ? parentState.clip : { l: -1e6, t: -1e6, r: 1e6, b: 1e6 };
    const clips = cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible'
      || (cs.clipPath && cs.clipPath !== 'none') || cs.contain.includes('paint');
    if (clips) {
      const r = el.getBoundingClientRect();
      clip = {
        l: Math.max(clip.l, r.left), t: Math.max(clip.t, r.top),
        r: Math.min(clip.r, r.right), b: Math.min(clip.b, r.bottom),
      };
    }
    const st = { op, clip, cs };
    state.set(el, st);
    return st;
  }

  const clipRect = (r, c) => {
    const l = Math.max(r.left, c.l), t = Math.max(r.top, c.t);
    const rr = Math.min(r.right, c.r), b = Math.min(r.bottom, c.b);
    return (rr - l > 0.5 && b - t > 0.5) ? { l, t, r: rr, b } : null;
  };

  /* ── Does this element put ink on the screen? ──────────────────────────── */
  function boxPaints(el, cs) {
    if (REPLACED.has(el.tagName)) return true;
    if (alpha(cs.backgroundColor) > 0.02) return true;
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
    if (cs.boxShadow && cs.boxShadow !== 'none') return true;
    for (const s of ['Top', 'Right', 'Bottom', 'Left']) {
      if (parseFloat(cs['border' + s + 'Width']) > 0
        && cs['border' + s + 'Style'] !== 'none'
        && alpha(cs['border' + s + 'Color']) > 0.02) return true;
    }
    if (parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none') return true;
    return false;
  }

  /* The element's OWN text, as the lines the browser actually drew. */
  function textRects(el) {
    const out = [];
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.nodeValue || !n.nodeValue.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width > 0.5 && r.height > 0.5) out.push(r);
      rg.detach && rg.detach();
    }
    return out;
  }

  /* ── The enumeration ───────────────────────────────────────────────────── */
  const painted = [];
  const all = [live, ...live.querySelectorAll('*')];
  // The overlay layer sits outside the screen node; it paints over it, so it counts.
  for (const extra of document.querySelectorAll('.ui-stage > *:not(.screens)')) {
    all.push(extra, ...extra.querySelectorAll('*'));
  }

  for (const el of all) {
    const st = resolve(el);
    if (!st) continue;
    const cs = st.cs;
    const rects = [];
    if (boxPaints(el, cs)) {
      const c = clipRect(el.getBoundingClientRect(), st.clip);
      if (c) rects.push(c);
    }
    if (alpha(cs.color) > 0.02) {
      for (const t of textRects(el)) { const c = clipRect(t, st.clip); if (c) rects.push(c); }
    }
    if (!rects.length) continue;
    const bl = Math.min(...rects.map((r) => r.l)), bt = Math.min(...rects.map((r) => r.t));
    const br = Math.max(...rects.map((r) => r.r)), bb = Math.max(...rects.map((r) => r.b));
    painted.push({
      el, rects, op: +st.op.toFixed(2),
      tag: el.tagName.toLowerCase(),
      cls: (typeof el.className === 'string' && el.className.trim())
        ? el.className.trim().split(/\s+/)[0]
        : el.tagName.toLowerCase(),
      x: Math.round(bl - sr.left), y: Math.round(bt - sr.top),
      w: Math.round(br - bl), h: Math.round(bb - bt),
    });
  }

  const label = (p) => `${p.cls}(${p.w}x${p.h}@${p.x},${p.y})`;

  /* ── Overlaps: every pair, minus true nesting ──────────────────────────── */
  const overlaps = [];
  for (let i = 0; i < painted.length; i++) {
    for (let j = i + 1; j < painted.length; j++) {
      const a = painted[i], b = painted[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;   // nesting is not overlap
      let best = null;
      for (const ra of a.rects) for (const rb of b.rects) {
        const w = Math.min(ra.r, rb.r) - Math.max(ra.l, rb.l);
        const h = Math.min(ra.b, rb.b) - Math.max(ra.t, rb.t);
        if (w > OPT.minOverlap && h > OPT.minOverlap && w * h > OPT.minArea) {
          if (!best || w * h > best.w * best.h) best = { w, h };
        }
      }
      if (best) {
        overlaps.push({
          pair: `${a.cls} x ${b.cls}`,
          detail: `${label(a)} x ${label(b)} = ${Math.round(best.w)}x${Math.round(best.h)}`,
          area: Math.round(best.w * best.h),
        });
      }
    }
  }

  /* ── The 3D's share, and anything sitting on it ────────────────────────── */
  const bandEls = {
    surface: live.querySelector('.siteband--surface'),
    section: live.querySelector('.siteband--section'),
  };
  const bands = {};
  let onBand = [];
  for (const k of ['surface', 'section']) {
    const be = bandEls[k];
    if (!be) { bands[k] = null; continue; }
    const r = be.getBoundingClientRect();
    bands[k] = { y: Math.round(r.top - sr.top), h: Math.round(r.height) };
    for (const p of painted) {
      if (p.el === be || p.el.contains(be)) continue;
      for (const q of p.rects) {
        const w = Math.min(q.r, r.right) - Math.max(q.l, r.left);
        const h = Math.min(q.b, r.bottom) - Math.max(q.t, r.top);
        if (w > 1 && h > 1) { onBand.push(`${k}: ${label(p)} ${Math.round(w)}x${Math.round(h)}`); break; }
      }
    }
  }
  onBand = [...new Set(onBand)];

  const bandH = (bands.surface ? bands.surface.h : 0) + (bands.section ? bands.section.h : 0);
  const split = (bands.surface && bands.section && bandH)
    ? { surfPct: +(100 * bands.surface.h / bandH).toFixed(1),
        sectPct: +(100 * bands.section.h / bandH).toFixed(1),
        stagePct: +(100 * bandH / H).toFixed(1) }
    : null;

  /* ── Touch targets. Every interactive thing, not a list of class names. ── */
  const TAP = 'button, a[href], input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="slider"], [onclick], [data-tap]';
  const targets = [];
  for (const el of live.querySelectorAll(TAP)) {
    const st = resolve(el);
    if (!st) continue;
    const cs = st.cs;
    if (cs.pointerEvents === 'none' || el.disabled) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    // A target may be enlarged by a transparent ::before/::after hit area.
    const pseudoPad = ['::before', '::after'].reduce((acc, ps) => {
      const p = getComputedStyle(el, ps);
      if (!p || p.content === 'none' || p.position !== 'absolute') return acc;
      const ins = ['top', 'right', 'bottom', 'left'].map((s) => parseFloat(p[s]));
      if (ins.some((v) => v < 0)) {
        return {
          w: acc.w + Math.max(0, -Math.min(ins[1], 0)) + Math.max(0, -Math.min(ins[3], 0)),
          h: acc.h + Math.max(0, -Math.min(ins[0], 0)) + Math.max(0, -Math.min(ins[2], 0)),
        };
      }
      return acc;
    }, { w: 0, h: 0 });
    const w = r.width + pseudoPad.w, h = r.height + pseudoPad.h;
    targets.push({
      cls: (typeof el.className === 'string' && el.className.trim())
        ? el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase(),
      w: Math.round(w), h: Math.round(h), ok: w >= 43.5 && h >= 43.5,
    });
  }
  const smallTargets = targets.filter((t) => !t.ok)
    .map((t) => `${t.cls} ${t.w}x${t.h}`);

  /* ── Clipped text: a label the layout cut in half ──────────────────────── */
  const clipped = [];
  for (const p of painted) {
    const el = p.el;
    if (!el.firstChild || el.scrollWidth <= el.clientWidth + 1) continue;
    if (!textRects(el).length) continue;
    const cs = state.get(el).cs;
    if (cs.overflow === 'visible' && cs.overflowX === 'visible') continue;
    clipped.push(`${p.cls} "${(el.textContent || '').trim().slice(0, 24)}" ${el.scrollWidth}>${el.clientWidth}`);
  }

  /* ── DOM census: the growth check ──────────────────────────────────────── */
  const dom = {
    screens: screenNodes.length,
    liveNodes: live.querySelectorAll('*').length,
    docNodes: document.querySelectorAll('*').length,
    dockH: (() => { const d = live.querySelector('.sitedock'); return d ? Math.round(d.getBoundingClientRect().height) : null; })(),
    stripH: (() => { const s = live.querySelector('.sstrip'); return s ? Math.round(s.getBoundingClientRect().height) : null; })(),
    dockCount: document.querySelectorAll('.sitedock').length,
    hud: (window.__DRILLITY && window.__DRILLITY.hud) ? { ...window.__DRILLITY.hud } : null,
  };

  return {
    W, H,
    screen: live.className || '(body)',
    painted: painted.length,
    list: painted.map(label),
    overlaps: overlaps.length,
    overlapList: [...new Map(overlaps.map((o) => [o.detail, o])).values()]
      .sort((a, b) => b.area - a.area).map((o) => o.detail),
    overlapPairs: [...new Set(overlaps.map((o) => o.pair))],
    onBand3D: onBand,
    bands, split,
    targets: targets.length, smallTargets,
    clipped: [...new Set(clipped)],
    dom,
  };
}.toString();
