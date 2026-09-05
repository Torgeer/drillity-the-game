/**
 * MENU — hero title over the live 3D scene. The UI layer is transparent here:
 * only scrims, never a fill.
 */
import { SCENES, EVENTS } from '../../core/contract.js';
import { roleAt, regionInfo, methodInfo } from './catalog.js';

export function createMenuScreen(app) {
  const { C, state, fmtMoney } = app;

  /* ── Player card ──────────────────────────────────────────────────────── */
  const lvlLabel = C.h('span.pcard__lvl', { text: '1' }, C.h('small', { text: 'LVL' }));
  const ring = C.Ring({ size: 52, stroke: 4, value: 0, label: 'Experience to next level', center: lvlLabel });
  ring.el.classList.add('ring--smooth');
  const nameEl = C.h('div.pcard__name', { text: 'Rookie' });
  /* 'Helper' is the level-1 rank's name in game/data.js ROLES, and therefore
     the only spelling of it. The seed read 'Drillers Helper' — a fourth
     spelling, and missing its possessive apostrophe. refresh() overwrites this
     on the first frame, but until it does the wrong name is in the DOM. */
  const roleEl = C.h('div.pcard__role', { text: 'Helper' });
  const moneyEl = C.h('b', { text: '€0' });
  const moneyRoll = C.NumberRoll(moneyEl, { value: 0, duration: 0.7, format: (v) => fmtMoney(v) });
  const statsEl = C.h('div.pcard__stats');

  const pcard = C.h('div.panel.pcard',
    ring.el,
    C.h('div.pcard__id', nameEl, roleEl, statsEl),
    C.h('div.pcard__money', moneyEl, C.h('span.label', { text: 'Balance' })),
  );

  /* ── Navigation ───────────────────────────────────────────────────────── */
  const playBtn = C.Button({
    label: 'Play', kind: 'amber', size: 'lg', icon: 'play', haptic: 'heavy',
    onTap: () => {
      if (state.drill && state.drill.active) app.nav(SCENES.SITE);
      else app.nav(SCENES.CONTRACTS);
    },
  });

  const nav = C.h('div.menu__nav',
    playBtn,
    C.Button({ label: 'Career', kind: 'ghost', icon: 'cert', onTap: () => app.nav(SCENES.CAREER) }),
    C.Button({ label: 'iMarket', kind: 'ghost', icon: 'cart', onTap: () => app.nav(SCENES.SHOP) }),
    C.Button({ label: 'Garage', kind: 'ghost', icon: 'garage', onTap: () => app.nav(SCENES.GARAGE) }),
    C.Button({ label: 'Settings', kind: 'ghost', icon: 'settings', onTap: openSettings }),
  );

  /* The hero sits on the live 3D, and the 3D moves. `.menu::before` alone is a
     linear top scrim: by the time it reaches "THE GAME" it has faded to about
     half strength, and in the Nordic Forest camera that line lands on a lit
     tree trunk — measured at 3.08:1, which is not a legible title.
     This is a second, shorter scrim shaped to the lockup itself: an ellipse
     that peaks behind the wordmark and is gone before the mountains, so the
     type gets its contrast without flattening the sky. Same z-index/paint
     pattern as `.menu::before`, so it stays behind the UI and over the 3D. */
  const heroScrim = C.h('i', {
    'aria-hidden': 'true',
    style: {
      position: 'absolute', left: '0', right: '0', top: '0', bottom: '-40px',
      'z-index': '-1', 'pointer-events': 'none',
      background: 'radial-gradient(115% 74% at 50% 42%, '
        + 'rgb(var(--rgb-bg-deep) / .62), '
        + 'rgb(var(--rgb-bg-deep) / .22) 62%, '
        + 'rgb(var(--rgb-bg-deep) / 0) 84%)',
    },
  });

  const el = C.h('div.menu',
    C.h('div.menu__hero', { style: { position: 'relative' } },
      heroScrim,
      C.Wordmark({ size: 50, tagline: true }),
      C.h('p.menu__tag', { text: 'The Game' }),
    ),
    C.h('div.menu__foot',
      pcard,
      nav,
      C.h('p.menu__ver', { text: 'v1.0' }),
    ),
  );

  /* ── Settings sheet ───────────────────────────────────────────────────── */
  function openSettings() {
    const s = state.settings || (state.settings = {});
    const body = C.h('div', { style: { display: 'flex', 'flex-direction': 'column', gap: '20px' } });

    body.appendChild(C.h('div',
      C.h('p.label', { text: 'Graphics quality' }),
      Segmented(['auto', 'low', 'medium', 'high'], s.quality || 'auto', (v) => {
        s.quality = v;
        app.bus.emit(EVENTS.QUALITY_CHANGE, { tier: v });
        app.toast(`Quality: ${v}`, 'info');
      }),
    ));

    body.appendChild(C.h('div',
      C.h('p.label', { text: 'Feel' }),
      Toggle('Haptics', s.haptics !== false, (v) => { s.haptics = v; if (v) app.haptic('medium'); }),
      Toggle('Reduced motion', !!s.reducedMotion, (v) => { s.reducedMotion = v; }),
    ));

    /* ── The two volume sliders ────────────────────────────────────────────
       These used to read

         (v) => { s.sfx = v; app.ctx.audio?.setSfxVolume?.(v); }

       and `setSfxVolume` / `setMusicVolume` DO NOT EXIST on audio.js — the
       `?.()` swallowed both calls, so the sliders were reported as dead
       controls (HANDOFF §8A). They were not dead: the state write beside the
       call is the entire mechanism. audio/audio.js `applyBusGains()` reads
       `ctx.state.settings.sfx` and `.music` on EVERY FRAME from update() and
       smooths the bus toward them, which is also why dragging one does not
       zipper. The defaults here (0.85 / 0.5) are the same two numbers as its
       `busSettings`.

       The dead calls are removed rather than implemented on purpose: adding
       setSfxVolume() would put a second path in front of the same state and
       give the mixer two masters to disagree about (HANDOFF §8B). One writer,
       one reader. */
    body.appendChild(C.h('div',
      C.h('p.label', { text: 'Audio' }),
      HSlider('Effects', s.sfx ?? 0.85, (v) => { s.sfx = v; }),
      HSlider('Music', s.music ?? 0.5, (v) => { s.music = v; }),
    ));

    const stats = state.player?.stats || {};
    body.appendChild(C.h('div',
      C.h('p.label', { text: 'Career record' }),
      C.h('dl.specs',
        C.SpecRow('Metres drilled', Math.round(stats.metresDrilled || 0).toLocaleString('en-US') + ' m'),
        C.SpecRow('Holes completed', stats.holesDone || 0),
        C.SpecRow('Bits burned', stats.bitsBurned || 0),
        C.SpecRow('Perfect runs', stats.perfectRuns || 0),
        C.SpecRow('Jams cleared', stats.jamsCleared || 0),
      ),
    ));

    const sh = app.sheet({ title: 'Settings', sub: 'Drillity I The Game', body });
    return sh;
  }

  function Segmented(values, active, onPick) {
    const wrap = C.h('div.tabs', { style: { margin: '8px 0 0' } });
    const btns = values.map((v) => {
      const b = C.h(`button.tabs__b${v === active ? '.is-active' : ''}`, { type: 'button', text: v[0].toUpperCase() + v.slice(1) });
      C.tap(b, () => {
        for (const x of btns) x.classList.remove('is-active');
        b.classList.add('is-active');
        onPick(v);
      });
      return b;
    });
    C.append(wrap, btns);
    return wrap;
  }

  function Toggle(label, value, onChange) {
    const knob = C.h('i.switch__k');
    const sw = C.h(`button.switch${value ? '.is-on' : ''}`, { type: 'button', role: 'switch', 'aria-checked': value ? 'true' : 'false', 'aria-label': label }, knob);
    C.tap(sw, () => {
      const nv = !sw.classList.contains('is-on');
      sw.classList.toggle('is-on', nv);
      sw.setAttribute('aria-checked', nv ? 'true' : 'false');
      onChange(nv);
    });
    return C.h('div.switchrow', C.h('span.switchrow__l', { text: label }), sw);
  }

  function HSlider(label, value, onChange) {
    const out = C.h('span.hsl__v', { text: Math.round(value * 100) + '%' });
    const input = C.h('input.hsl__i', {
      type: 'range', min: '0', max: '100', step: '1',
      value: String(Math.round(value * 100)), 'aria-label': label,
    });
    input.style.setProperty('--v', value.toFixed(3));
    input.addEventListener('input', () => {
      const v = Number(input.value) / 100;
      input.style.setProperty('--v', v.toFixed(3));
      out.textContent = Math.round(v * 100) + '%';
      onChange(v);
    });
    return C.h('div.hsl', C.h('span.hsl__l', { text: label }), input, out);
  }

  /* ── Live sync ────────────────────────────────────────────────────────── */
  function refresh() {
    const p = state.player || {};
    const lvl = p.level || 1;
    nameEl.textContent = p.name || 'Rookie';
    // No ladder means game/data.js is not mounted. Say so rather than
    // inventing a job title for the player.
    const role = roleAt(lvl);
    roleEl.textContent = role?.title || 'Content unavailable';
    lvlLabel.firstChild.textContent = String(lvl);
    /* Progress INSIDE the level, not lifetime XP over one level's increment —
       that ratio held this ring at a full circle from level 2 onward. */
    // `frac` is null when no system owns an XP curve: an empty ring, not a
    // full one drawn against a denominator the shell used to invent.
    ring.setValue(app.xpProgress(p.xp, lvl).frac ?? 0);
    moneyRoll.to(p.money || 0);

    const rig = state.garage?.rigId;
    const region = regionInfo(state.world?.regionId || 'nordic');
    const unlockedMethods = state.unlocked?.methods || ['auger'];
    const methodCount = unlockedMethods.length;
    const method = methodInfo(unlockedMethods[unlockedMethods.length - 1]);
    C.clear(statsEl);
    // A pill is dropped rather than filled with a guess when data.js cannot
    // name the region or the method. The explicit notice is only needed here
    // when the role line above is not already carrying it.
    C.append(statsEl, [
      region ? C.Pill(region.name, 'steel', 'region') : null,
      method ? C.Pill(method.name, 'amber', 'bit') : null,
      rig ? C.Pill(methodCount === 1 ? '1 method' : `${methodCount} methods`, 'neutral') : null,
      (role && !region && !method) ? C.Pill('Content unavailable', 'danger') : null,
    ]);

    playBtn.querySelector('.btn__label').textContent =
      state.drill && state.drill.active ? 'Resume Hole' : (state.contract ? 'Continue' : 'Play');
  }

  return {
    el,
    mount() {
      moneyRoll.setInstant(true);
      refresh();
      moneyRoll.setInstant(false);
      C.stagger(el.querySelectorAll('.menu__nav > *'));
      el.querySelector('.menu__nav').classList.add('stagger');
    },
    update(dt) { moneyRoll.step(dt); },
    unmount() { el.querySelector('.menu__nav').classList.remove('stagger'); },
    onMoney() { refresh(); },
    onXP() { refresh(); },
    onLevelUp() { refresh(); },
    onUnlock() { refresh(); },
    onRegion() { refresh(); },
    onRig() { refresh(); },
    resize() {},
  };
}
