/**
 * BOOT — the loading screen.
 * Wordmark, an amber progress rule that fills as systems init, and a rotating
 * authentic drilling fact from the domain brief.
 *
 * COMPOSITION. The lockup used to sit dead centre with the fact block pinned to
 * the bottom edge, which left the top 40 % of the frame as empty black and a
 * 26 %-tall hole between the two — a weak first frame, and the first frame is
 * the one a stranger judges. The screen is now laid out on three flex spacers
 * (39 : 24 : 37 of the free height) so the lockup group's optical centre lands
 * at ~38 % of the stage and the "from the field" block follows close under it
 * instead of drifting to the floor. The ratios, rather than fixed offsets, keep
 * that composition on any stage height.
 *
 * The wordmark is drawn at the same 50 px cap height as MENU. It used to be
 * 44 px here, so the lockup grew 14 % across the boot→menu cross-fade — the
 * one moment in the game where the brand mark must not move.
 *
 * FACTS. Every line in `FACTS` traces to a source in `FACTS_VERIFIED.md`
 * (DOMAIN.md §10, PLATFORM_TRUTH Part C). This screen only ever renders that
 * array; it never edits, reorders or appends to it. Two claims — ring-bit vs
 * wing-bit recovery, and Odex/Symmetrix eccentric-vs-concentric — were removed
 * for being wrong and must not come back.
 *
 * ── AND WHEN THERE IS A TITLE BEHIND IT ────────────────────────────────────
 * `.boot` in styles.css paints an OPAQUE gradient, which was right while
 * there was nothing behind it: main.js did not start the frame loop until
 * every system was up, so for the whole of boot the 3D drew nothing at all.
 * It draws now — a title composition on the renderer's own private stage,
 * while the GPU compiles the game's shaders behind it — so this screen has
 * to get out of its way.
 *
 * Two things change, and only while a title is actually live (`ctx.renderer
 * .titleActive`); with no title the composition above is untouched:
 *
 *   • the opaque fill becomes a SCRIM — dark at the top and the bottom where
 *     the type is, clear through the middle where the machine is. The same
 *     shape and the same reasoning as `.menu`'s hero scrim, which exists
 *     because a wordmark over a lit tree trunk measured 3.08:1 and that is
 *     not a legible title.
 *   • the three flex spacers go 39:24:37 -> 8:52:6, which lifts the lockup
 *     and the rule to the top of the stage and opens the middle for the
 *     machine. main.js frames the camera to the space this leaves.
 */
import { FACTS } from './catalog.js';

/**
 * WHAT THE CAPTION UNDER THE BAR SAYS — and why it used to be a lie.
 *
 * This was an array of eleven names indexed by the progress fraction:
 *
 *     const idx = Math.floor(p * SYSTEMS.length);
 *
 * so the caption was a restatement of the percentage wearing a report's
 * clothes. At 82 % it read "Audio" whatever was actually happening — and what
 * was actually happening, for 90 % of boot, was the GPU compiling shaders, a
 * phase that had no name in that list at all. `ctx.bootPhase`, written by
 * main.js beside the number, is the real one; these are only its display
 * spellings, and a phase with no entry here shows its own id rather than
 * borrowing a neighbour's name.
 */
const PHASE_LABEL = {
  renderer: 'Renderer',
  assets: 'Materials',
  gltfRigs: 'Machines',
  models: 'Machine model',
  env: 'Environment',
  geology: 'Geology',
  terrain: 'Site',
  rig: 'Rig assembly',
  sim: 'Drill model',
  vfx: 'Particles',
  progression: 'Career',
  shopPreview: 'Catalogue',
  audio: 'Audio',
  ui: 'Interface',
  shaders: 'Shaders',
  ready: 'Ready',
};

const FACT_PERIOD = 4.6;

/** Cap height of the Drillity lockup. MUST match MENU's — see the note above. */
const LOCKUP_SIZE = 50;

export function createBootScreen(app) {
  const { C } = app;

  const rule = C.h('div.boot__rule', { role: 'progressbar', 'aria-label': 'Loading', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' },
    C.h('i.boot__rulefill'),
  );
  const pctEl = C.h('span.boot__pct', { text: '0%' });
  /* Empty until a phase is REPORTED. ui/shell.js self-drives the bar off a
     clock for the first fraction of a second, before main.js has anything to
     say; naming a system during that window would be inventing one. */
  const sysEl = C.h('span.boot__sys', { text: '' });
  const factEl = C.h('p.boot__fact', { text: FACTS[0] });

  /** A proportional gap. `flex-basis: 0` so only the grow factor decides. */
  const spacer = (grow) => C.h('i', {
    'aria-hidden': 'true',
    style: { flex: `${grow} 1 0`, 'min-height': '0', display: 'block' },
  });
  const spTop = spacer(39);
  const spMid = spacer(24);
  const spBot = spacer(37);

  /**
   * The two compositions, and the scrim that makes the second one legible.
   *
   * `over3d` is the same idea as `.menu`'s hero scrim: a shaped darkening
   * that peaks where the type is and is gone where the subject is, rather
   * than a flat wash that would put the machine back behind a curtain.
   */
  const LAYOUT_FLAT = [39, 24, 37];   // nothing behind: the composition as authored
  const LAYOUT_TITLE = [8, 52, 6];    // a machine behind: type to the edges
  const SCRIM_OVER_3D = [
    'linear-gradient(180deg, rgb(var(--rgb-bg-deep) / .92) 0%,'
      + ' rgb(var(--rgb-bg-deep) / .55) 22%,'
      + ' rgb(var(--rgb-bg-deep) / 0) 40%,'
      + ' rgb(var(--rgb-bg-deep) / 0) 58%,'
      + ' rgb(var(--rgb-bg-deep) / .72) 82%,'
      + ' rgb(var(--rgb-bg-deep) / .94) 100%)',
    'radial-gradient(78% 30% at 50% 12%, rgb(var(--rgb-amber) / .07), transparent 72%)',
  ].join(',');

  // The lockup, the sub-title and the progress rule read as one group, so they
  // are one element with their own internal rhythm.
  const group = C.h('div', {
    style: {
      flex: '0 0 auto', width: '100%',
      display: 'flex', 'flex-direction': 'column', 'align-items': 'center',
      gap: 'var(--s-5)',
    },
  },
    // The real Drillity lockup — wordmark + "REPRESENTING PROFESSIONALS".
    // No invented icon stands in front of it. See DOMAIN.md §10.
    C.h('div.boot__wm', C.Wordmark({ size: LOCKUP_SIZE, tagline: true })),
    // Matched to .menu__tag so the sub-title does not change weight or colour
    // across the cross-fade either.
    C.h('p.boot__tag', { style: { color: 'var(--c-fg)', opacity: '.82' }, text: 'The Game' }),
    C.h('div.boot__rulewrap',
      rule,
      C.h('div.boot__meta', sysEl, pctEl),
    ),
  );

  // Lifted out of its absolute bottom anchor and back into the flow, so the
  // spacers can hold it a fixed proportion below the group. The 92 px floor
  // from styles.css stays: it stops a one-line fact swapping to a two-line one
  // from shifting the composition mid-load.
  const factwrap = C.h('div.boot__factwrap', {
    style: { position: 'static', left: 'auto', right: 'auto', bottom: 'auto', width: '100%', flex: '0 0 auto' },
  },
    C.h('span.boot__factlabel', { text: 'From the field' }),
    factEl,
  );

  const el = C.h('div.boot', { style: { 'justify-content': 'flex-start', gap: '0' } },
    spTop,
    group,
    spMid,
    factwrap,
    spBot,
  );

  let p = 0;
  let factIdx = Math.floor(Math.random() * FACTS.length);
  let factT = 0;
  let swapping = false;
  /** null until the first check, so the first answer always applies itself. */
  let overTitle = null;

  /**
   * Re-lay the screen for whichever of the two situations is true right now.
   *
   * Polled from `update()` rather than pushed, because the renderer decides
   * when the title goes up and comes down and there is no event for it. It is
   * a boolean read and an early return on every frame but two.
   */
  function syncTitleLayout() {
    let live = false;
    try { live = !!(app.ctx && app.ctx.renderer && app.ctx.renderer.titleActive); }
    catch { live = false; }
    if (live === overTitle) return;
    overTitle = live;

    const [a, b, c] = live ? LAYOUT_TITLE : LAYOUT_FLAT;
    spTop.style.flex = `${a} 1 0`;
    spMid.style.flex = `${b} 1 0`;
    spBot.style.flex = `${c} 1 0`;
    // '' hands the background back to styles.css's opaque `.boot` rule.
    el.style.background = live ? SCRIM_OVER_3D : '';
  }

  /**
   * The caption for whatever main.js says is happening right now.
   *
   * The shader phase carries a count because it is the only phase long enough
   * for the player to wonder whether anything is happening — and because that
   * count is a real one: it is how many programs the GPU driver has reported
   * finished, out of how many it was handed. See core/renderer.js.
   */
  function phaseLabel() {
    const ph = app.ctx && app.ctx.bootPhase;
    if (!ph || !ph.name) return '';
    const base = PHASE_LABEL[ph.name] || ph.name;
    if (ph.total && ph.done != null && ph.done < ph.total) return `${base} ${ph.done}/${ph.total}`;
    return base;
  }

  function setProgress(v) {
    const c = Math.max(0, Math.min(1, v || 0));
    const label = phaseLabel();
    if (Math.abs(c - p) < 0.0005 && label === sysEl.textContent) return;
    p = c;
    rule.style.setProperty('--p', p.toFixed(4));
    const pct = Math.round(p * 100);
    pctEl.textContent = pct + '%';
    rule.setAttribute('aria-valuenow', String(pct));
    if (sysEl.textContent !== label) sysEl.textContent = label;
  }

  function rotateFact() {
    if (app.reducedMotion) {
      factIdx = (factIdx + 1) % FACTS.length;
      factEl.textContent = FACTS[factIdx];
      return;
    }
    swapping = true;
    factEl.classList.add('is-swap');
    setTimeout(() => {
      factIdx = (factIdx + 1) % FACTS.length;
      factEl.textContent = FACTS[factIdx];
      factEl.classList.remove('is-swap');
      swapping = false;
    }, 300);
  }

  return {
    el,
    mount() {
      factIdx = Math.floor(Math.random() * FACTS.length);
      factEl.textContent = FACTS[factIdx];
      factT = 0;
      rule.style.setProperty('--p', '0');
      overTitle = null;      // re-decide; a remount may be a different session
      syncTitleLayout();
    },
    update(dt) {
      syncTitleLayout();
      factT += dt;
      if (factT >= FACT_PERIOD && !swapping) { factT = 0; rotateFact(); }
    },
    setProgress,
    playOut() { el.classList.add('is-out'); },
    unmount() { el.classList.remove('is-out'); },
    resize() {},
  };
}
