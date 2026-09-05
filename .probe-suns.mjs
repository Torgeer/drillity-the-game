/**
 * WHICH SIDE OF THE FRAME IS EACH BAND LIT FROM?
 *
 *   node .probe-suns.mjs
 *
 * The seam note in core/renderer.js reports the two bands' key lights as
 * "47-71 deg apart in azimuth ... projected into each band's own screen
 * space". Two of those three things are true and the third is not: the
 * surface figure (79.9-103.9) IS a screen-space azimuth, but the section
 * figure (150.8) is the WORLD azimuth of `sectionKey`, which is a different
 * quantity measured against a camera pointing somewhere else entirely. The
 * live rig reads the section key at screen azimuth 22.8 (.qa-collar.mjs,
 * `lights.sectionKey`), not 150.8, so the two bands are 53 deg apart in the
 * only frame the player has — and BOTH are lit from the right.
 *
 * That is HANDOFF §8C: an instrument that compares the wrong quantity
 * produces a confident wrong answer. So this measures the right one, over
 * the whole content set rather than the one region a screenshot happened to
 * be in: for each of env.js's eight sky recipes, across the day, where does
 * the key sun sit in the SURFACE band's own screen space, and does it ever
 * cross to the other side from the section's fixed key?
 *
 * Pure arithmetic — env.js's own sun solve and renderer.js's own hero rig,
 * no browser. Anything it claims can be checked against .qa-collar.mjs's
 * `lights` block on the live page, and the two agree to 0.1 deg where they
 * overlap (nordic 76.3, alpine 75.1).
 */

/* ── renderer.js CAMERA_MODES.hero ──────────────────────────────────────── */
const HERO = { pos: [8.40, 2.25, 10.94], look: [-1.55, 2.60, 0.00] };

/* ── env.js REGIONS: [id, azimuth, sunPeak], ids read back off the file ──── */
const SKIES = [
  ['nordic', 118, 40], ['german-site', 142, 46], ['alpine', 96, 52],
  ['iberian-quarry', 205, 62], ['north-sea', 250, 34], ['sahara', 165, 74],
  ['andes', 300, 68], ['arctic', 20, 18],
];

/* ── env.js solve(): the sun geometry, verbatim ─────────────────────────── */
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
function sunDirFor(azimuthDeg, sunPeak, tod) {
  const s = Math.sin(Math.PI * (tod - 0.25) / 0.5);
  const sign = s < 0 ? -1 : 1;
  const elevation = Math.max(-16, sunPeak * sign * Math.pow(Math.abs(s), 1.8));
  const azimuth = azimuthDeg + (tod - 0.34) * 165;
  const phi = (90 - elevation) * D2R, theta = azimuth * D2R;
  // THREE.Vector3.setFromSphericalCoords(1, phi, theta)
  const sinPhi = Math.sin(phi);
  return { v: [sinPhi * Math.sin(theta), Math.cos(phi), sinPhi * Math.cos(theta)], elevation };
}

/* ── the hero camera's basis, as THREE.Object3D.lookAt builds it ────────── */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// a camera looks down its own -Z, so basis Z points BACK from the target
const zAx = norm(sub(HERO.pos, HERO.look));
const xAx = norm(cross([0, 1, 0], zAx));
const yAx = cross(zAx, xAx);

/** A world direction in the camera's own screen basis. */
function toScreen(v) {
  const q = [dot(v, xAx), dot(v, yAx), dot(v, zAx)];
  return {
    az: ((Math.atan2(q[0], q[1]) * R2D) + 360) % 360,   // clockwise from screen-up
    towardCam: Math.asin(Math.max(-1, Math.min(1, q[2]))) * R2D,
  };
}

/* ── the section key, env.js:1434 — its camera is axis-aligned, so its own
      screen basis is the identity and world == screen there ─────────────── */
const SECT = norm([0.42, 1.0, 0.75]);
const sectAz = ((Math.atan2(SECT[0], SECT[1]) * R2D) + 360) % 360;
const sectToward = Math.asin(SECT[2]) * R2D;

const wrap = (d) => ((d + 540) % 360) - 180;   // to (-180, 180]
const side = (az) => (Math.sin(az * D2R) >= 0 ? 'RIGHT' : 'LEFT ');

/* env.js `aimSectionLight()` / SEC_SIDE_KNEE, modelled so this stays a gate
   rather than a snapshot: the cut's key keeps its authored angle from
   screen-up and only chooses a side, easing through centre inside 25 deg. */
const KNEE = Math.sin(25 * D2R);
const clamp1 = (x) => Math.max(-1, Math.min(1, x));
const mirrored = (surfAz) => {
  const u = clamp1(Math.sin(surfAz * D2R) / KNEE);
  const h = Math.hypot(SECT[0], SECT[1]);
  const x = SECT[0] * u;
  return ((Math.atan2(x, Math.sqrt(Math.max(h * h - x * x, 0))) * R2D) + 360) % 360;
};

console.log(`section key AS AUTHORED  screenAz ${sectAz.toFixed(1)} (${side(sectAz)})  `
  + `towardCamera ${sectToward.toFixed(1)}  — a constant, every region, every hour\n`);
console.log('region             tod   sunEl   surfAz   side    was    now   gap was  gap now');

let wasCross = 0, nowCross = 0, total = 0, wasMax = 0, nowMax = 0;
for (const [id, az, peak] of SKIES) {
  for (const tod of [0.34, 0.45, 0.55, 0.70]) {
    const { v, elevation } = sunDirFor(az, peak, tod);
    if (elevation < 1) continue;                 // sun down: no key to speak of
    const s = toScreen(v);
    const now = mirrored(s.az);
    const gapWas = Math.abs(wrap(s.az - sectAz));
    const gapNow = Math.abs(wrap(s.az - now));
    total++;
    if (side(s.az) !== side(sectAz)) wasCross++;
    if (side(s.az) !== side(now)) nowCross++;
    wasMax = Math.max(wasMax, gapWas);
    nowMax = Math.max(nowMax, gapNow);
    console.log(`${id.padEnd(16)} ${tod.toFixed(2)}  ${elevation.toFixed(1).padStart(5)}   `
      + `${s.az.toFixed(1).padStart(6)}   ${side(s.az)}  ${sectAz.toFixed(1).padStart(5)}  `
      + `${now.toFixed(1).padStart(5)}   ${gapWas.toFixed(1).padStart(6)}   ${gapNow.toFixed(1).padStart(6)}`);
  }
}
console.log(`\nhours lighting the two bands from OPPOSITE sides of frame:`
  + `  was ${wasCross}/${total}   now ${nowCross}/${total}`);
console.log(`worst screen-azimuth gap:                              `
  + `  was ${wasMax.toFixed(1)} deg   now ${nowMax.toFixed(1)} deg`);
console.log(`\nThe residual gap is the cut's own PITCH, and it is deliberate — see the`);
console.log(`block above updateSectionLights() in core/env.js before "finishing" it.`);
if (nowCross > 0) { console.log('\nFAIL — the mirror is not holding.'); process.exitCode = 1; }
