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

  /* ── Touch targets — HIT-TESTED, not inferred ─────────────────────────────
     This used to take the border box and add back any ::before/::after with a
     NEGATIVE inset. Two things were wrong with that.

     It could not see the hit area it was written for. `.railbtn::after` (a
     34px control that must reach 44) expands with
     `top:50%; height:44px; transform:translateY(-50%)` — every inset is 0 or
     50%, none negative, so the rule contributed nothing and the pad came out
     {0,0}. And styles.css said, in a comment beside that rule, that this file
     "verifies that by HIT-TESTING rather than by reading this rule". It did
     not. A claim like that is worse than the gap it describes, because the
     next person believes it.

     Worse, reading the CSS can only ever make a target look BIGGER. It cannot
     see a target made smaller — one covered by a scrim, an overlay, or a
     sibling with a higher z-index. A 60px button nobody can press passed.

     So this now asks the browser the question the rule is actually about:
     starting at the centre, step outward one pixel at a time and keep going
     while `elementFromPoint` still lands on the element or something inside
     it. Pseudo-element hit areas are attributed to their originating element,
     so they are counted; anything painted on top is not, so a stolen target
     measures small and is reported. That is the tappable box, measured. */
  const TAP = 'button, a[href], input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="slider"], [onclick], [data-tap]';
  const REACH = 40;                    // px probed each way: enough to clear 44
  const ownedAt = (el, x, y) => {
    if (x < 0 || y < 0 || x > window.innerWidth - 1 || y > window.innerHeight - 1) return false;
    const t = document.elementFromPoint(x, y);
    return !!t && (t === el || el.contains(t));
  };
  /* The owned distance from the exact centre along one direction.

     An earlier version stepped whole pixels from a ROUNDED centre and counted
     them, which quantises the answer to ±1 px: two rail buttons in the same
     row, with the same 44 px `::after`, measured 44 and 43. A gate that fails a
     compliant control one time in two sends the next reader hunting a defect
     that is not there, which is the same disease as passing a broken one.

     So: walk out in whole pixels to find the bracket, then bisect the last one
     to ~0.02 px. Probing is at the true fractional centre, and the extent is
     the sum of the two distances — no +1 for a centre pixel that does not
     exist in a continuous coordinate space. */
  const edge = (el, cx, cy, dx, dy) => {
    let lo = 0, hi = 1;
    while (hi <= REACH && ownedAt(el, cx + dx * hi, cy + dy * hi)) { lo = hi; hi += 1; }
    if (hi > REACH) return REACH;
    for (let i = 0; i < 6; i++) {
      const mid = (lo + hi) / 2;
      if (ownedAt(el, cx + dx * mid, cy + dy * mid)) lo = mid; else hi = mid;
    }
    return lo;
  };
  const targets = [];
  for (const el of live.querySelectorAll(TAP)) {
    const st = resolve(el);
    if (!st) continue;
    const cs = st.cs;
    if (cs.pointerEvents === 'none' || el.disabled) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const cx = (r.left + r.right) / 2;
    const cy = (r.top + r.bottom) / 2;
    const cls = (typeof el.className === 'string' && el.className.trim())
      ? el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase();

    /* Its own centre does not belong to it: something is on top. Whatever the
       box says, this control cannot be pressed. */
    if (!ownedAt(el, cx, cy)) {
      targets.push({ cls, w: 0, h: 0, box: `${Math.round(r.width)}x${Math.round(r.height)}`,
        ok: false, blocked: true });
      continue;
    }
    const w = +(edge(el, cx, cy, -1, 0) + edge(el, cx, cy, 1, 0)).toFixed(1);
    const h = +(edge(el, cx, cy, 0, -1) + edge(el, cx, cy, 0, 1)).toFixed(1);
    targets.push({
      cls, w, h, box: `${Math.round(r.width)}x${Math.round(r.height)}`,
      ok: w >= 43.5 && h >= 43.5, blocked: false,
    });
  }
  /* Both numbers are reported: the hit box is what the rule is about, the
     border box is what a reader will see in the stylesheet, and when they
     differ that difference is the expander doing its job. */
  const smallTargets = targets.filter((t) => !t.ok).map((t) => (t.blocked
    ? `${t.cls} BLOCKED (box ${t.box}, centre owned by something on top)`
    : `${t.cls} hit ${t.w}x${t.h} (box ${t.box})`));

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

  /* ── SAY IT ONCE ────────────────────────────────────────────────────────
     Rubric axis 7a, third clause: "State any value ONCE." The review that
     failed this screen found the resin mix on it three times at once — as a
     slider, a gauge bar and a text card — and torque stated four ways inside
     one 250x160 block. It was fixed by hand and came back, which is what
     happens to a rule that lives in a document.

     Two collections, because the rule breaks in two shapes:

       CAPTIONS   the same word labelling two different things. Any painted
                  element's own text, short enough to be a label and carrying
                  no digits. This is the shape "TORQUE ... TORQUE" takes.
       QUANTITIES a number WITH A UNIT. A bare numeral is deliberately not
                  collected: three sliders reading 60 are three different
                  quantities that happen to coincide, and gating on that would
                  teach the next reader to add an exception, which is how an
                  instrument learns to excuse things.

     Both are element-attributed so a failure names the two places, and both
     skip elements that contain each other — a value inside its own label is
     one statement, not two. */
  const ownText = (el) => {
    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue) t += n.nodeValue;
    return t.replace(/\s+/g, ' ').trim();
  };
  const captions = [];
  const quantities = [];
  const UNIT = /(-?\d+(?:[.,]\d+)?)\s*(%|m\/h|kNm|kN|kW|rpm|bar|mm|sg|l\/min|m)(?![A-Za-z])/gi;
  for (const p of painted) {
    const t = ownText(p.el);
    if (!t) continue;
    if (t.length <= 24 && /[A-Za-z]/.test(t) && !/\d/.test(t)) {
      captions.push({ cls: p.cls, text: t.toLowerCase().replace(/[.,:;·|]+$/, '') });
    }
    let m;
    UNIT.lastIndex = 0;
    while ((m = UNIT.exec(t))) {
      const v = parseFloat(m[1].replace(',', '.'));
      if (!Number.isFinite(v)) continue;
      quantities.push({ cls: p.cls, key: `${v.toFixed(2)} ${m[2].toLowerCase()}`, text: m[0] });
    }
  }

  /* ── DOM census: the growth check ────────────────────────────────────────
     `liveNodes` and `docNodes` are two document-wide scalars, and two scalars
     cannot answer the question they raise. When `docNodes` moved by +648
     across five navigations this instrument could say THAT 648 elements had
     appeared and nothing whatever about WHICH — and that ambiguity cost this
     project a whole investigation, twice, because "the DOM grew" reads like a
     leak and lazy instantiation reads exactly the same way.

     So the census is now per screen. `screen--garage: 533` appearing between
     visit 1 and visit 2 and never moving again is a screen being built the
     first time it is opened; the same row climbing on every visit is a leak.
     The reader does not have to guess which, and does not have to go and
     bisect the route to find out.

     `document.querySelectorAll('.screen')`, not `.screens > .screen`: the boot
     screen is retained outside that container and is 27.8 s of shader compile
     with a subtree of its own, so a census that could not see it would leave
     part of `docNodes` unexplained — and an unexplained remainder is the same
     ambiguity one level down. `elsewhere` closes the books for the rest:
     docNodes = Σ(1 + subtreeCount) over the top-level screens, plus elsewhere.
     Nested screens are counted once, under their outermost ancestor, or the
     sum would double-count them and `elsewhere` would go negative. */
  const allScreens = [...document.querySelectorAll('.screen')];
  const perScreen = allScreens.map((s) => ({
    className: s.className,
    subtreeCount: s.querySelectorAll('*').length,   // descendants, as liveNodes counts them
    hidden: !!s.hidden,
  }));
  const topScreens = allScreens.filter((s) => !s.parentElement || !s.parentElement.closest('.screen'));
  const inScreens = topScreens.reduce((a, s) => a + 1 + s.querySelectorAll('*').length, 0);

  const dom = {
    screens: screenNodes.length,
    liveNodes: live.querySelectorAll('*').length,
    docNodes: document.querySelectorAll('*').length,
    dockH: (() => { const d = live.querySelector('.sitedock'); return d ? Math.round(d.getBoundingClientRect().height) : null; })(),
    stripH: (() => { const s = live.querySelector('.sstrip'); return s ? Math.round(s.getBoundingClientRect().height) : null; })(),
    dockCount: document.querySelectorAll('.sitedock').length,
    hud: (window.__DRILLITY && window.__DRILLITY.hud) ? { ...window.__DRILLITY.hud } : null,
    /* One row per `.screen` in the document, in document order — which is
       stable across visits, so visit N and visit N+1 line up row for row.
       `className` is the raw list on purpose: `is-entering` / `is-leaving`
       are transient and a diff should key on the `screen--*` modifier, but
       stripping them here would be the instrument hiding state from its own
       report. */
    perScreen,
    /* Every element that is not inside a `.screen`: the boot host, the canvas,
       overlays, toasts, and main.js's `#model-error` banner. Named so that
       `docNodes` is fully accounted for and a move in it always lands
       somewhere a reader can point at. */
    elsewhere: document.querySelectorAll('*').length - inScreens,
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
    /* WHICH controls were actually on screen when the 44px gate ran. Without
       this the gate can pass because the control was not rendered at all —
       `.railbtn` only exists while `telemetry.actions` has an enabled entry,
       so a QA state with no actions passes a rule it never tested. A gate that
       cannot tell "compliant" from "absent" is the allowlist problem again,
       one level up. */
    targetList: targets.map((t) => `${t.cls} ${t.blocked ? 'BLOCKED' : t.w + 'x' + t.h}`),
    clipped: [...new Set(clipped)],
    captions, quantities,
    dom,
  };
}.toString();
