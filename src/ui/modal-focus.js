/** Keyboard and background isolation for the shell's topmost modal layer. */
export function createModalFocus({ getStack, fallback, doc = document }) {
  const selector = 'button, [href], input, select, textarea, [tabindex], [contenteditable="true"], summary, iframe';
  const inerted = new Map();
  let listening = false, redirecting = false, disposed = false;
  const top = () => getStack().at(-1);

  function available(el) {
    if (!el?.isConnected || typeof el.focus !== 'function' || el.matches(':disabled')
      || el.closest('[inert], [hidden], [aria-hidden="true"], .is-out, .is-leaving, .is-leaving--back')) return false;
    const style = doc.defaultView.getComputedStyle(el);
    return style.visibility !== 'hidden' && style.visibility !== 'collapse' && el.getClientRects().length > 0;
  }

  function controls(box) {
    return [...box.querySelectorAll(selector)].filter(el => available(el) && el.tabIndex >= 0)
      .filter(el => {
        if (el.tagName !== 'INPUT' || el.type !== 'radio' || !el.name) return true;
        const group = [...box.querySelectorAll('input[type="radio"]')]
          .filter(other => other.name === el.name && other.form === el.form && available(other));
        return el === (group.find(other => other.checked) || group[0]);
      })
      // Positive tabindex precedes the normal DOM order, as native Tab does.
      .sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
  }

  function focus(el) {
    if (!available(el)) return false;
    el.focus({ preventScroll: true });
    return doc.activeElement === el;
  }

  function enter(rec, preferred) {
    if (!rec || redirecting || disposed) return;
    redirecting = true;
    try {
      if (preferred && rec.box.contains(preferred) && focus(preferred)) return;
      if (rec.box.contains(rec.lastFocus) && focus(rec.lastFocus)) return;
      if (focus(rec.initialFocus)) return;
      if (controls(rec.box).some(focus)) return;
      focus(rec.box);
    } finally { redirecting = false; }
  }

  function onFocus(event) {
    const rec = top();
    if (!rec) return;
    if (rec.box.contains(event.target) && available(event.target)) rec.lastFocus = event.target;
    else enter(rec);
  }

  function onKey(event) {
    const rec = top();
    if (!rec) return;
    if (event.key !== 'Tab') {
      if (!rec.box.contains(event.target) && ['Enter', ' '].includes(event.key)) {
        event.preventDefault(); event.stopImmediatePropagation(); enter(rec);
      }
      return;
    }
    event.preventDefault(); event.stopImmediatePropagation();
    const candidates = controls(rec.box), index = candidates.indexOf(doc.activeElement);
    if (!candidates.length) { enter(rec); return; }
    const next = index < 0 ? (event.shiftKey ? candidates.length - 1 : 0)
      : (index + (event.shiftKey ? -1 : 1) + candidates.length) % candidates.length;
    focus(candidates[next]);
  }

  function onActivate(event) {
    const rec = top();
    if (rec && !rec.el.contains(event.target)) {
      event.preventDefault(); event.stopImmediatePropagation(); enter(rec);
    }
  }

  // Native inert covers focus, pointer interaction and the accessibility tree.
  // Walk to body so the WebGL canvas and any sibling host are isolated too.
  function sync() {
    if (disposed) return;
    const rec = top(), wanted = new Set();
    if (rec?.el.isConnected) {
      for (let branch = rec.el; branch && branch !== doc.body; branch = branch.parentElement) {
        for (const sibling of branch.parentElement?.children || []) {
          if (sibling !== branch) wanted.add(sibling);
        }
      }
    }
    for (const [el, previous] of inerted) {
      if (!wanted.has(el)) {
        if (previous) el.setAttribute('inert', ''); else el.removeAttribute('inert');
        inerted.delete(el);
      }
    }
    for (const el of wanted) {
      if (!inerted.has(el)) inerted.set(el, el.hasAttribute('inert'));
      if (!el.hasAttribute('inert')) el.setAttribute('inert', '');
    }
    getStack().forEach((entry, index) => { entry.el.style.zIndex = String(90 + index); });
    if (rec && !listening) {
      listening = true;
      doc.addEventListener('keydown', onKey, true);
      doc.addEventListener('focusin', onFocus, true);
      doc.addEventListener('pointerdown', onActivate, true);
      doc.addEventListener('click', onActivate, true);
      observer.observe(doc.body, { childList: true, subtree: true, attributes: true,
        attributeFilter: ['disabled', 'hidden', 'inert', 'tabindex'] });
    } else if (!rec && listening) stopListening();
  }

  const observer = new doc.defaultView.MutationObserver(() => {
    sync();
    const rec = top();
    if (rec && (!rec.box.contains(doc.activeElement) || !available(doc.activeElement))) enter(rec);
  });

  function stopListening() {
    listening = false;
    observer.disconnect();
    doc.removeEventListener('keydown', onKey, true);
    doc.removeEventListener('focusin', onFocus, true);
    doc.removeEventListener('pointerdown', onActivate, true);
    doc.removeEventListener('click', onActivate, true);
  }

  function focusFallback() {
    const el = fallback?.();
    if (!available(el)) return;
    // Keep a non-native fallback focusable after focus(). Removing tabindex
    // while it owns focus makes Chrome blur it back to the document body.
    // -1 permits programmatic focus without adding a stop to native Tab order.
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    focus(el);
  }

  return {
    open(rec) {
      rec.box.setAttribute('tabindex', '-1');
      sync(); enter(rec, rec.initialFocus);
    },
    close(rec, { restore = true } = {}) {
      // A lower layer can be closed programmatically while its child stays up.
      // Preserve that child's route back to the original screen opener.
      for (const other of getStack()) {
        if (rec.el.contains(other.returnFocus)) other.returnFocus = rec.returnFocus;
      }
      sync();
      rec.el.setAttribute('inert', '');
      rec.el.setAttribute('aria-hidden', 'true');
      queueMicrotask(() => {
        if (disposed || !restore) return;
        const recTop = top();
        if (recTop) enter(recTop, rec.returnFocus);
        else if (!focus(rec.returnFocus)) focusFallback();
      });
    },
    focusFallback,
    dispose() {
      disposed = true; stopListening();
      for (const [el, previous] of inerted) {
        if (previous) el.setAttribute('inert', ''); else el.removeAttribute('inert');
      }
      inerted.clear();
    },
  };
}
