import { patch } from './apply.mjs';
const F = 'src/ui/styles.css';

patch(F, [

/* ── 1. UNITS. A stylesheet must not be able to state a false unit. ────── */
[
`.rigstat__k { font-size: var(--t-2xs); line-height: 1.1; font-weight: 800; letter-spacing: var(--tr-label); text-transform: uppercase; color: var(--c-fg-dim); }`,
`/* NO text-transform. These are SI unit symbols and their case IS the symbol:
   kW is a kilowatt and KW is nothing; PLATFORM_TRUTH.md:149-150 names kNm in
   that exact casing; m is metres, not "M". garage.js:273-275 emits all three
   correctly and this rule was destroying them — the same file already
   documents this exact trap 30 lines earlier at garage.js:247-248. */
.rigstat__k { font-size: var(--t-2xs); line-height: 1.1; font-weight: 800; letter-spacing: var(--tr-label); color: var(--c-fg-dim); }`,
],

/* ── 2. The two strip faces must never paint at the same time. ──────────
   `display: flex !important` kept the hidden face laid out and merely
   transparent, so `sstrip__at` sat on top of `sstrip__k` for the whole run
   and an enumerating harness counts that — correctly — as an overlap. Both
   faces are ABSOLUTELY POSITIONED, so `display: none` removes the hidden one
   from paint and hit-testing while changing no height and moving nothing,
   which was the entire point of the original rule. The incoming face fades
   in on its own instead of cross-fading against the outgoing one. */
[
`.sstrip__face[hidden] { display: flex !important; opacity: 0; pointer-events: none; }`,
`.sstrip__face[hidden] { display: none; }
.sstrip__face:not([hidden]) { animation: face-in var(--dur-2) var(--ease-out) both; }
@keyframes face-in { from { opacity: 0; } to { opacity: 1; } }`,
],

/* ── 3. A 30px control is not a 44px target. ───────────────────────────── */
[
`/* 30px inside a 52px strip: the strip's own padding carries the rest of the
   44px target, and the strip is the topmost thing on the screen. */
.sstrip__leave {
  position: relative; z-index: 1;
  flex: none; width: 30px; height: 30px; border-radius: var(--r-sm);`,
`/* The visible plate is 30px so it stays quiet in a 52px strip, but the TARGET
   is 44px: an ::after hit area centred on the plate, measured by hit-testing
   in .hudqa/enumerate.js rather than trusted from the CSS. The previous
   comment claimed the strip's padding carried the rest of the target — it
   does not, padding on the parent is not a hit area on the child, and the
   control measured 30x30 to a finger. */
.sstrip__leave {
  position: relative; z-index: 1;
  flex: none; width: 30px; height: 30px; border-radius: var(--r-sm);`,
],
[
`.sstrip__leave.is-pressed { transform: scale(.92); }`,
`.sstrip__leave::after {
  content: ''; position: absolute; top: 50%; left: 50%;
  width: var(--touch); height: var(--touch); transform: translate(-50%, -50%);
}
.sstrip__leave.is-pressed { transform: scale(.92); }`,
],

/* ── 4. THE SLIDERS — one value, stated once. ───────────────────────────
   The track carried FOUR painted layers stating the same number: the fill
   area, a tick overlay across the whole track, a white knob line, and a
   numeral pill floating over all of it. Rubric 7a: state any value once.

     · the ticks are a SCALE, not the value — they belong to the track, so
       they are now the track's own background layer and not an element;
     · the knob restated the fill's own top edge, so the fill HAS a top edge
       now (a real border) and the separate knob is gone;
     · the numeral moved out of the track into the head row, which already
       existed and had 12px of reserved space holding only the name.

   Nothing floats over the track any more, so nothing can overlap it. */
[
`.vsl__head { height: 12px; display: flex; align-items: center; justify-content: center; }`,
`.vsl__head {
  height: 12px; display: flex; align-items: center; justify-content: center; gap: 5px;
  min-width: 0;
}`,
],
[
`.vsl__val {
  position: absolute; top: 4px; left: 50%; transform: translateX(-50%); z-index: 2;
  padding: 1px 6px; border-radius: var(--r-full);
  background: rgb(var(--rgb-black) / .72);
  font-size: var(--t-2xs); font-weight: 800; line-height: 1.25;
  font-variant-numeric: tabular-nums; color: var(--c-fg);
  pointer-events: none;
}`,
`/* In the head row, in reserved space — not floating over the track it
   describes. It is the only numeral on the control. */
.vsl__val {
  flex: none;
  font-size: var(--t-2xs); font-weight: 800; line-height: 1;
  font-variant-numeric: tabular-nums; color: var(--c-fg);
  pointer-events: none;
}
.vsl.is-active .vsl__val { color: var(--accent); }`,
],
[
`  width: 100%; min-width: var(--touch); min-height: 56px;
  border-radius: var(--r); overflow: hidden;
  background: linear-gradient(180deg, rgb(var(--rgb-black) / .55), rgb(var(--rgb-black) / .34));`,
`  width: 100%; min-width: var(--touch); min-height: 56px;
  border-radius: var(--r); overflow: hidden;
  /* The tick scale is a property of the TRACK, so it is the track's own
     background and not a fourth stacked element over the fill. */
  background:
    repeating-linear-gradient(0deg, rgb(var(--rgb-fg) / .13) 0 1px, transparent 1px 10%),
    linear-gradient(180deg, rgb(var(--rgb-black) / .55), rgb(var(--rgb-black) / .34));`,
],
[
`.vsl__fill {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgb(var(--accent-rgb) / .95), rgb(var(--accent-rgb) / .45));
  -webkit-clip-path: inset(calc(100% - var(--v) * 100%) 0 0 0);
          clip-path: inset(calc(100% - var(--v) * 100%) 0 0 0);
}
.vsl__ticks {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, rgb(var(--rgb-fg) / .13) 0 1px, transparent 1px 10%);
}
.vsl__knob {
  position: absolute; left: 4px; right: 4px; height: 5px; border-radius: var(--r-full);
  bottom: calc(var(--v) * 100% - 2.5px);
  background: var(--c-fg);
  box-shadow: 0 0 10px rgb(var(--rgb-black) / .8), 0 0 0 1px rgb(var(--rgb-black) / .4);
}`,
`/* The fill is laid out AT the value rather than clipped to it, so its box IS
   its ink — nothing has to model a clip-path to measure it — and its top
   border is the knob. One element, one value, one edge to read. */
.vsl__fill {
  position: absolute; left: 0; right: 0; bottom: 0;
  top: calc(100% - var(--v) * 100%);
  background: linear-gradient(180deg, rgb(var(--accent-rgb) / .95), rgb(var(--accent-rgb) / .45));
  border-top: 2px solid var(--c-fg);
  box-shadow: 0 -4px 10px rgb(var(--rgb-black) / .55);
}`,
],
[
`.vsl.is-active .vsl__track { border-color: rgb(var(--accent-rgb) / .8); box-shadow: inset 0 2px 8px rgb(var(--rgb-black) / .7), 0 0 0 2px rgb(var(--accent-rgb) / .35); }
.vsl.is-active .vsl__knob { height: 7px; bottom: calc(var(--v) * 100% - 3.5px); }
.vsl.is-active .vsl__name { color: var(--accent); }`,
`.vsl.is-active .vsl__track { border-color: rgb(var(--accent-rgb) / .8); box-shadow: inset 0 2px 8px rgb(var(--rgb-black) / .7), 0 0 0 2px rgb(var(--accent-rgb) / .35); }
.vsl.is-active .vsl__fill { border-top-width: 3px; }
.vsl.is-active .vsl__name { color: var(--accent); }`,
],

/* ── 5. THE GAUGE CAPTION gets a row instead of the canvas's bottom. ───── */
[
`.gaugebox { position: relative; flex: none; width: 150px; height: 86px; }
.gaugebox canvas { width: 100%; height: 100%; display: block; }
.gaugebox__cap {
  position: absolute; left: 0; right: 0; bottom: 0; height: 11px;
  display: flex; align-items: center; justify-content: center;`,
`/* The caption used to be absolutely positioned over the bottom 11px of the
   dial. It now has its own row and the canvas is sized to the remainder
   (site.js resizeGauge subtracts it), so the label never sits on the needle. */
.gaugebox {
  position: relative; flex: none; width: 150px; height: 86px;
  display: flex; flex-direction: column;
}
.gaugebox canvas { flex: none; display: block; }
.gaugebox__cap {
  position: static; flex: none; height: 11px;
  display: flex; align-items: center; justify-content: center;`,
],

/* ── 6. THE RATE READOUT — the trend gets a row, not the numeral's back. ─
   `.rop__spark` was a half-opacity wash behind the number it belongs to.
   Two marks for one quantity, one on top of the other. It now sits under the
   line in reserved space: still the trend, no longer a backdrop. */
[
`.rop {
  display: flex; align-items: center; gap: var(--s-2);
  padding: 0 0 11px;
}
.rop__spark { position: absolute; inset: auto 0 12px 0; opacity: .5; }`,
`.rop {
  display: flex; flex-direction: column; justify-content: center; gap: var(--s-1);
  padding: 0 0 11px;
}
.rop__line { display: flex; align-items: center; gap: var(--s-2); min-width: 0; }
.rop__spark { position: static; flex: none; height: 30px; opacity: .75; }`,
],

/* ── 7. `.railbtn` was a 12px-tall touch target. ────────────────────────
   `.dock__aux` centres its children and the button declared no height, so it
   collapsed to its own 11px label — 110x12 measured. It now fills the 34px
   row it was documented as filling, and the ::after carries the 44px target. */
[
`.actrail { flex: 0 1 auto; min-width: 0; margin-left: auto; display: flex; gap: var(--s-1); align-items: stretch; }
.railbtn {
  flex: 0 1 auto; min-width: 0;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 var(--s-3);`,
`.actrail { flex: 0 1 auto; min-width: 0; margin-left: auto; align-self: stretch; display: flex; gap: var(--s-1); align-items: stretch; }
.railbtn {
  flex: 0 1 auto; min-width: 0; min-height: var(--dock-aux);
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 var(--s-3);`,
],
[
`/* A 34px control in a 34px row. The hit area is expanded to the 44px target
   inside the dock, where there is nothing behind it to steal. */
.railbtn::after { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: var(--touch); transform: translateY(-50%); }`,
`/* A 34px control in a 34px row — min-height: var(--dock-aux) is what makes
   that true; without it the button was its label's 12px. The hit area is
   expanded to the 44px target inside the dock, where there is nothing behind
   it to steal, and .hudqa/enumerate.js verifies that by HIT-TESTING rather
   than by reading this rule. */
.railbtn::after { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: var(--touch); transform: translateY(-50%); }`,
],

]);
