/**
 * DRILLITY I THE GAME — sky, atmosphere, lighting rigs and per-region look.
 *
 * Owns everything that decides what light falls on the rig and the cutaway:
 *   • a Preetham sky (three's Sky.js) driven by sun elevation
 *   • a procedural, drifting fbm cloud deck with a silver lining toward the sun
 *   • a runtime PMREM environment map generated FROM that sky, so metals
 *     reflect the actual weather
 *   • the surface light rig: key sun (+ shadows), hemisphere fill, cool rim,
 *     ground bounce, FogExp2 matched to the horizon
 *   • the cross-section light rig: a technical/diorama key so strata read,
 *     plus a warm amber down-hole glow that lives on the bit
 *   • weather: clear | overcast | rain | snow | fog, with GPU point-sprite
 *     precipitation anchored to the camera
 *
 * Signature look: timeOfDay 0.34 — a low, warm morning sun, long shadows and a
 * rich amber rim down the mast.
 *
 * Public API — see the `api` object near the bottom.
 */
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { BRAND, QUALITY, EVENTS, clamp, lerp, damp } from './contract.js';

/* ═══════════════════════════════════════════════════════════════════════════
   REGION RECIPES — one carefully art-directed lighting look per region.
   Angles in degrees, densities are FogExp2 densities, colours are sRGB hex.
   ═══════════════════════════════════════════════════════════════════════════ */
/*  ── key-dominance rebalance ───────────────────────────────────────────────
    Measured on the shipped build (surface band, y 295-903 of a 1688 px frame):
    darkest pixel L = 24.4, ZERO pixels below L 16, median L 110-129 with an
    IQR of 64-152 - half of every frame inside a 35 % value window - and no
    visible cast shadow anywhere despite shadows being correctly configured.
    At tod 0.34 the sun sits at 13 deg, so on horizontal ground the key
    delivered 3.05 x sin(13) ~ 0.69 while the fill stack (hemi 0.95 + rim 0.36
    + env 1.00 + ambient 0.14) delivered ~3x that: the fill was filling the
    shadows in faster than the key could draw them.

    The fix is one ratio, applied to every region so each keeps its character:
        sunIntensity  x 1.80   the key now leads the fill ~2.7 : 1
        hemi          x 0.34   sky fill stops erasing the shadow side
        rimIntensity  x 0.39   the rim is an edge again, not a second light
        bounce        x 0.55   ground bounce is a hint, not a third light
        envIntensity  x 0.45   IBL diffuse stops acting as a fourth fill
        exposure      x 0.885  (with the 1.05 -> 0.56 base in solve(); see it)
    Two deliberate exceptions, both character-preserving: 'north-sea' and
    'arctic' keep more hemi/env (x 0.37-0.48) because on an overcast platform
    and on snow the sky IS the key light and there is nothing else to lead.
    ────────────────────────────────────────────────────────────────────────── */
/*  ── round 2: the sky, the reflection and the hue ───────────────────────────
    Three measured regressions, all of them fallout from the round-1 stop cut
    landing on numbers that were never re-solved with it.

    1. THE SKY WENT COLOURLESS AND DARKER. 35-40 % of the surface band,
       luminance 170 -> 110 at the top of frame / 153 at the horizon,
       saturation 0.041-0.150. Every light and the exposure moved (1.1025 ->
       0.521) but `cloud` and `fog` did not, so a 92 %-opaque neutral deck
       absorbed the whole stop cut uncompensated and masked the Sky shader's
       Rayleigh blue underneath it. Four levers, per region:
         cloud.opacity   x ~0.5   the deck stops being a lid
         cloud.coverage  x ~0.6   it breaks into masses with shape, not a slab
         rayleigh        x ~1.2   chroma and a real value ramp in the top of
                                  frame; note the visible sky at fov 34 only
                                  spans 0-20 deg of elevation, so the zenith
                                  blue is never on screen and rayleigh is the
                                  only thing that gets chroma into that strip
         turbidity/mie   x ~0.82  less white haze washing it back out
       `fog` is warmed toward morning haze at the same time. It is both the
       FogExp2 colour AND cloudUniforms.uHorizonCol, so it sets the whole
       bottom of the sky: a warm horizon under a cooler upper sky is the value
       AND hue ramp the review asked for, in one number. 'north-sea' and
       'arctic' keep a cold, high-coverage lid - that is their character and
       the sky is still their key light.

    2. NO SPECULAR ANYWHERE ON THE MACHINE. envIntensity x 0.45 in round 1 cut
       over half the environment reflection, and assets.js authors paintedSteel
       with clearcoat 0.85 / clearcoatRoughness 0.08 - a clearcoat with no
       environment to reflect is matte enamel. envIntensity goes back to ~0.62
       (x 1.38, still 38 % under the original 1.00, so IBL stays a fill and not
       a fourth key). The rayleigh/turbidity changes above sharpen the sun disc
       in the PMREM bake as well, which is where the highlight actually comes
       from.

    3. THE MACHINE READ TERRACOTTA. Measured deck hue 31.4 deg against
       BRAND.amber's 37.7 deg, saturation 0.672 (correct - not touched). The
       cause is not the grade: the grade's warm tint is authored AT 37.8 deg
       and would pull hue up, and it never even engages, because the lit deck
       traces back to l = 0.139 against a 0.55 threshold. It is the key. At
       13 deg elevation SUN_RAMP delivered (255,196,136) = hue 30.3 deg, and a
       30.3 deg light on 37.7 deg paint lands at 31.4 deg - the key was
       stamping its own hue on the paint. See SUN_RAMP below.
       The ramp change costs ~0.06 of the deck's HSV saturation (it raises G
       and B), so every region's grade.saturation goes up x 1.06 to hold the
       measured 0.672. Do NOT read that as a general saturation lift.
    ────────────────────────────────────────────────────────────────────────── */
/*  ── round 3: fog DEPTH, not fog colour ────────────────────────────────────
    The sky rebuild above is untouched — colour, cloud, rayleigh, turbidity and
    SUN_RAMP all stay exactly as round 2 left them. One number moves, and only
    on the three regions where it was measurably preventing the horizon from
    working at all.

    FogExp2 is 1 - exp(-(d*rho)^2), so it reaches 99 % at d = 2.145/rho. At the
    shipped nordic 0.0060 that is 358 m, while world/terrain.js runs its far
    field out to 1160 m and puts its second range at 300-380 m. Beyond the
    saturation distance a surface renders as the fog colour EXACTLY, and the
    fog colour is also cloudUniforms.uHorizonCol, i.e. the sky's own colour at
    the horizon. So the second range was not "pale against the sky" as the far
    field's comments assumed; it was invisible. Measured on shots/r4-14: the
    whole 250 px of visible sky spans 174.8 to 177.1 L, and no separate range
    can be found anywhere in it.

    Measured effect of 0.0060 -> 0.0052 (saturation 358 m -> 413 m), taken from
    a synthetic render of the far field calibrated against r4-14 (it reproduces
    the shipped crest at 137.7 L and the 24 px skyline range exactly), swept
    over eight camera bearings:

        crest step below sky   26.3 L worst case -> 13.9 L worst case
        band value at +140 px  76 L -> 67 L   (the near flank gets its shading
                                               back instead of washing out)
        bearings with a visible second range   6/8 -> 8/8

    Near field is barely touched: fog at 30 m goes 0.032 -> 0.024, at 60 m
    0.122 -> 0.093. Sub-1-L on the instanced spruces the review passed.

    Applied to nordic, german-site and sahara — the temperate/dry regions whose
    far field has to carry two ranges. NOT applied to iberian-quarry (0.0090),
    arctic (0.0110) or north-sea (0.0150): dust, whiteout and offshore murk are
    those regions' character, their far field is deliberately near-invisible,
    and north-sea has no far field at all. alpine (0.0042) and andes (0.0035)
    already saturate past 500 m and need nothing.
    ────────────────────────────────────────────────────────────────────────── */
const REGIONS = {
  'nordic': {
    name: 'Nordic forest',
    azimuth: 118, sunPeak: 40, sunIntensity: 5.50,
    turbidity: 2.4, rayleigh: 3.20, mie: 0.0045, mieG: 0.800,
    skyTint: '#9FC4DC', ground: '#3C4630', hemi: 0.32,
    // rim chroma up (S 0.38 -> 0.50) at the SAME 0.35 intensity: round 1 cut
    // the cool separation light 0.90 -> 0.35 for key dominance and took its
    // colour contribution with it. Chroma is free; intensity is not.
    rim: '#6FA8DE', rimIntensity: 0.35, bounce: 0.17,
    // 0.0060 -> 0.0052: 99 % fog moves 358 m -> 413 m, which is what lets the
    // far field's second range at 300-380 m be seen at all. See round 3 above.
    fog: '#C9B49E', fogDensity: 0.0052,
    envIntensity: 0.62, exposure: 0.93,
    cloud: { coverage: 0.30, opacity: 0.48, scale: 0.00030, speed: 10, height: 900 },
    grade: { saturation: 1.14, split: 0.58, vignette: 0.42 },
  },
  'german-site': {
    name: 'German construction site',
    azimuth: 142, sunPeak: 46, sunIntensity: 4.85,
    turbidity: 3.8, rayleigh: 2.60, mie: 0.0062, mieG: 0.790,
    skyTint: '#A7B8C6', ground: '#4A463C', hemi: 0.35,
    rim: '#6E93B6', rimIntensity: 0.27, bounce: 0.19,
    // a working-morning haze: duller and greyer than nordic, but warm.
    // 0.0072 -> 0.0062 for the same reason as nordic (99 % at 298 m -> 346 m).
    fog: '#C6BBAA', fogDensity: 0.0062,
    envIntensity: 0.62, exposure: 0.91,
    cloud: { coverage: 0.36, opacity: 0.55, scale: 0.00026, speed: 14, height: 820 },
    grade: { saturation: 1.08, split: 0.50, vignette: 0.44 },
  },
  'alpine': {
    name: 'Alpine tunnel portal',
    azimuth: 96, sunPeak: 52, sunIntensity: 6.50,
    // thin clear air: the deepest blue in the set, and the least deck
    turbidity: 1.7, rayleigh: 3.60, mie: 0.0032, mieG: 0.840,
    skyTint: '#8FB6E0', ground: '#8C9AA4', hemi: 0.39,
    rim: '#84BCF4', rimIntensity: 0.41, bounce: 0.25,
    fog: '#D2CCC0', fogDensity: 0.0042,
    envIntensity: 0.64, exposure: 0.89,
    cloud: { coverage: 0.25, opacity: 0.44, scale: 0.00042, speed: 22, height: 1150 },
    grade: { saturation: 1.17, split: 0.60, vignette: 0.40 },
  },
  'iberian-quarry': {
    name: 'Iberian quarry',
    azimuth: 205, sunPeak: 62, sunIntensity: 7.00,
    turbidity: 5.2, rayleigh: 2.10, mie: 0.0082, mieG: 0.800,
    skyTint: '#BFC9C4', ground: '#8A6A44', hemi: 0.34,
    rim: '#D2A85E', rimIntensity: 0.21, bounce: 0.30,
    fog: '#D6C09A', fogDensity: 0.0090,
    envIntensity: 0.59, exposure: 0.87,
    cloud: { coverage: 0.16, opacity: 0.36, scale: 0.00034, speed: 9, height: 1000 },
    grade: { saturation: 1.10, split: 0.62, vignette: 0.46 },
  },
  'north-sea': {
    name: 'North Sea platform',
    azimuth: 250, sunPeak: 34, sunIntensity: 3.50,
    // character exception: the lid STAYS. On a platform the overcast sky is
    // the key light, so the deck only comes down enough to stop being flat.
    turbidity: 6.4, rayleigh: 1.60, mie: 0.0110, mieG: 0.760,
    skyTint: '#8E9AA4', ground: '#26333B', hemi: 0.46,
    rim: '#6C9CBA', rimIntensity: 0.35, bounce: 0.12,
    fog: '#A3A6A2', fogDensity: 0.0150,
    envIntensity: 0.70, exposure: 0.96,
    cloud: { coverage: 0.58, opacity: 0.78, scale: 0.00022, speed: 30, height: 700 },
    grade: { saturation: 0.98, split: 0.44, vignette: 0.50 },
  },
  'sahara': {
    name: 'Sahara water well',
    azimuth: 165, sunPeak: 74, sunIntensity: 7.90,
    turbidity: 6.6, rayleigh: 1.70, mie: 0.0100, mieG: 0.780,
    skyTint: '#D6D2C2', ground: '#B79A66', hemi: 0.35,
    rim: '#EDC478', rimIntensity: 0.19, bounce: 0.36,
    // 0.0072 -> 0.0062: a dune horizon still needs depth behind it.
    fog: '#E4CFA0', fogDensity: 0.0062,
    envIntensity: 0.56, exposure: 0.82,
    cloud: { coverage: 0.09, opacity: 0.30, scale: 0.00038, speed: 12, height: 1400 },
    grade: { saturation: 1.06, split: 0.66, vignette: 0.48 },
  },
  'andes': {
    name: 'Andean copper mine',
    azimuth: 300, sunPeak: 68, sunIntensity: 7.55,
    turbidity: 1.6, rayleigh: 4.00, mie: 0.0026, mieG: 0.860,
    skyTint: '#5F8FC8', ground: '#7A5340', hemi: 0.30,
    rim: '#79A6EC', rimIntensity: 0.39, bounce: 0.28,
    fog: '#BFBAAE', fogDensity: 0.0035,
    envIntensity: 0.62, exposure: 0.85,
    cloud: { coverage: 0.21, opacity: 0.40, scale: 0.00046, speed: 26, height: 1300 },
    grade: { saturation: 1.15, split: 0.64, vignette: 0.44 },
  },
  'arctic': {
    name: 'Arctic permafrost',
    azimuth: 20, sunPeak: 18, sunIntensity: 3.95,
    // character exception: still a milky lid and still COLD. The fog loses its
    // blue cast rather than gaining a warm one, so the snow stays snow.
    turbidity: 2.2, rayleigh: 4.10, mie: 0.0040, mieG: 0.820,
    skyTint: '#A9C6DC', ground: '#C8D6DE', hemi: 0.50,
    rim: '#A4CDF4', rimIntensity: 0.43, bounce: 0.40,
    fog: '#D2D5D2', fogDensity: 0.0110,
    envIntensity: 0.68, exposure: 0.94,
    cloud: { coverage: 0.38, opacity: 0.62, scale: 0.00028, speed: 18, height: 800 },
    grade: { saturation: 1.02, split: 0.52, vignette: 0.46 },
  },
};
const DEFAULT_REGION = 'nordic';

/* ═══════════════════════════════════════════════════════════════════════════
   UNDERGROUND — a MODE, not a ninth region.
   ═══════════════════════════════════════════════════════════════════════════
   `tunnel-jumbo`, `longhole` and `rockbolt` happen inside rock. Every input the
   eight recipes above are built out of — sun elevation and azimuth, turbidity,
   rayleigh, mie, cloud coverage, a sky-derived PMREM, a horizon-matched fog —
   describes light arriving from a sky. Underground there is none, so a ninth
   REGIONS entry would have to set six of its ten fields to zero and then be
   contradicted by three more that only exist to fake what the sky used to do.

   It is a mode for one further reason that settles it: the drive is ORTHOGONAL
   to the region. A jumbo heading in `alpine` and a longhole drive in `andes`
   are both black tubes; what the region still legitimately supplies is the ROCK
   — gneiss, limestone, andesite — and that is exactly one colour, taken from
   REGIONS[…].ground below. So: solve() branches once, at the top, into
   solveUnderground(); the eight recipes are never evaluated, never mutated, and
   the sky, the cloud deck, the key sun, the rim, the bounce, the sky PMREM and
   the precipitation are all switched off rather than dimmed.

   The drive frame is drive-local metres:
     +Z  back down the drive, away from the face (and past the camera)
     -Z  ahead, into the face
      Y  0 at the invert — so the rig, which anchors to terrain.collarPosition
         at y = 0, lands on the floor exactly as it does on the surface
      X  across the drive, 0 on the centreline

   YAW is not free. renderer.js owns the camera and its CAMERA_MODES.hero sits
   at [8.40, 2.25, 10.94] looking at [-1.55, 2.60, 0]. That bearing is
   atan2(9.95, 10.94) = 0.7379 rad off +Z, so the drive is rotated onto it: the
   player then stands INSIDE the tube at drive-local (-1.15, 2.25, 13.75) —
   1.15 m off the centreline, eye height 2.25 m, 13.7 m back from the machine
   and 20.7 m back from the face. research/04-tunnelling.md §E3 asks for
   "camera 15-25 m back from the face, at about 2 m eye height, offset from the
   centreline so the tunnel wall runs diagonally out of frame". It is the same
   shot, and it costs no change in a file this agent does not own.

   Dimensions are from the research packs, not invented:
     tunnel-jumbo  12.6 x 8.4 m horseshoe ~ 94 m2. research/04 §7.5 works a
                   "100 m2 cross-section"; research/03 C.2 gives face rigs for
                   "headings up to 12.9 m wide x 8.2 m high".
     longhole      5.0 x 5.0 m. research/03 §C: "a development drive might be
                   4-5 m high and 4-5 m wide".
     rockbolt      5.6 x 5.4 m — the same class of drive, one size up.
   `contour` is the half-barrel spacing: research/04 §7.4 caps contour hole
   spacing at 0.7 m. `round` is the round length, 4.5 m (research/04 §7.5).
   ═══════════════════════════════════════════════════════════════════════════ */
export const DRIVE_YAW = 0.73787;          // rad; see above — do not retune alone

/**
 * One entry per underground method. `lights` are in drive-local metres and are
 * read by BOTH sides: env.js makes the actual THREE lights and feeds the
 * participating media from them, and world/terrain.js hangs the fixtures on the
 * same coordinates, so a lamp housing can never drift off its own beam.
 *
 * `power` is candela — three r169 point/spot lights are physical, so the
 * irradiance a wall receives really is power / d^2 and the hard falloff the
 * brief asks for is the light model rather than a curve laid on top of it.
 *
 * ── `work` IS THE ONE NUMBER THE WHOLE RIG IS SOLVED AGAINST ────────────────
 *
 * The three drives differ in size by 3.4x on a side, and 1/d^2 turns that into
 * an 11x difference in the irradiance a fixed candela delivers. The rig used to
 * carry ONE candela table solved for the 12.6 m heading and then reused
 * unchanged in a 5.0 m drive, and that single fact is what the round-1
 * measurement found (band mean luma, 780x1688, quality high, hero camera):
 *
 *     tunnel-jumbo   mean  44   52.3 % of the band below L16, work cropped
 *     longhole       mean 148    0.0 % below L16 — a flat, evenly-lit corridor
 *     rockbolt       mean  84    a blown white sheet of medium over the machine
 *
 * One solver, three answers. `work` is the metres from the machine's own lamp
 * to the surface it is working on — the FACE for a jumbo, the collar of the
 * ring for a longhole cradle, the BACK overhead for a bolter feed — and every
 * light is now solved from it through `cd()` below. It is deliberately NOT the
 * drive length: the drive behind goes dark on its own, because 1/d^2 does it
 * for free, and a light solved against the length would have to be 25x the key
 * to reach the end of the tube and would obliterate the work on the way there.
 */
export const UNDERGROUND = {
  'tunnel-jumbo': {
    id: 'tunnel-jumbo', name: 'Tunnel heading (drill & blast)',
    width: 12.6, height: 8.4, wallH: 4.0,
    faceZ: -7.0, backZ: 62, hasFace: true,
    /* boom lamp at (-2.65, 4.62, 1.6) to the face target (0, 3.53, -7.0):
       hypot(2.65, 1.09, 8.60) = 9.1 m. */
    work: 9.1,
    round: 4.5, contour: 0.70, halfBarrel: 0.82,
    shotcreteFrom: 13, ditch: 1,
    vent: { r: 0.62, x: -4.5, y: 7.1, hang: 6.0 },
    services: { x: 5.5, y: 2.9 },
    festoon: { x: 5.75, y: 4.5, spacing: 8.0, n: 7 },
    muck: 1.0,
    /* A drill & blast heading is the dustiest place in the game — drill mist,
       blast fume and shotcrete rebound in a 94 m2 tube — and it is also the one
       drive long enough for a beam to have a path to be seen along. It gets the
       most airborne medium of the three, not the least. */
    dust: { base: 0.048, face: 2.4, sigma: 0.050 },
    // ambient/hemi are the radiance the bounce puts on rock - see solveUnderground
    fog: 0.0180, ambient: 0.028, hemi: 0.020, env: 0.16,
  },
  longhole: {
    id: 'longhole', name: 'Longhole production drive',
    width: 5.0, height: 5.0, wallH: 2.6,
    faceZ: -30.0, backZ: 48, hasFace: false,
    /* the cradle lamp rides the ring; the collar it is lighting is on the wall
       or the back, 3.5-4.5 m away wherever in the circle the boom has got to. */
    work: 4.2,
    round: 4.0, contour: 0.70, halfBarrel: 0.55,
    /* research/04 §E3-4 wants "the boundary between sprayed and unsprayed
       clearly visible as the player's own progress". The camera stands at
       drive-local z = +13.75 looking at -z, so a boundary at faceZ +
       shotcreteFrom = -24 was 37 m ahead and behind the fog: the player saw a
       uniformly lined tube and never one half-cast. 34 puts it at z = +4, nine
       metres ahead — wet grey lining behind the shoulder, raw blasted rock with
       half-barrels running away to the face. */
    shotcreteFrom: 34, ditch: 1,
    vent: { r: 0.50, x: -1.55, y: 4.25, hang: 5.0 },
    services: { x: 2.15, y: 1.9 },
    festoon: { x: 2.30, y: 3.1, spacing: 6.5, n: 7 },
    muck: 0.35,
    dust: { base: 0.052, face: 0.5, sigma: 0.070 },
    /* a 5 m tube bounces more than a 94 m2 heading: the walls are closer, they
       face each other, and more of the hemisphere above any point is rock. */
    fog: 0.0300, ambient: 0.038, hemi: 0.028, env: 0.14,
  },
  rockbolt: {
    id: 'rockbolt', name: 'Ground support drive',
    width: 5.6, height: 5.4, wallH: 2.8,
    faceZ: -13.0, backZ: 50, hasFace: true,
    /* the bolter feed points STRAIGHT UP at the back: the lamp is on the feed
       at ~2.0 m and the crown it is drilling into is at 5.4 m. */
    work: 3.5,
    round: 4.0, contour: 0.70, halfBarrel: 0.68,
    /* Boundary at z = +7, i.e. BEHIND the machine. A bolter installs support in
       freshly excavated ground and the lining follows it, so the machine has to
       stand in raw blasted rock with the grey lining running away over the
       player's shoulder — which is also the only arrangement that puts a
       half-barrel inside the reach of a lamp solved for 3.5 m. At the previous
       -2 the whole working zone was lined and the raw band sat 16-26 m ahead,
       unlit: no half-cast was visible in any measured frame. 16 rather than 20
       so the near three metres over the player's shoulder are still lined —
       that is where the wet-shotcrete-against-matte-blasted-rock contrast the
       regrade is built on actually lands in frame. */
    shotcreteFrom: 16, ditch: 1,
    vent: { r: 0.52, x: -1.75, y: 4.6, hang: 5.0 },
    services: { x: 2.45, y: 2.0 },
    festoon: { x: 2.60, y: 3.3, spacing: 6.5, n: 7 },
    muck: 0.5,
    mesh: 1,                                  // welded mesh sheeted on the arch
    dust: { base: 0.052, face: 0.9, sigma: 0.062 },
    fog: 0.0270, ambient: 0.038, hemi: 0.028, env: 0.15,
  },
};

/**
 * Candela, SOLVED - never picked.
 *
 * A diffuse surface returns  L = albedo/pi x NdotL x I/d^2 , so a light that
 * must put a given radiance on rock at a given distance has exactly one power:
 *
 *      I = L x pi x d^2 / ( albedo x NdotL )
 *
 * `cd(L, d)` is that line. Every underground light is authored as the pair
 * (what value it puts on the rock, how far away that rock is) and the candela
 * falls out - which is why ONE table now works in a 12.6 m heading and in a
 * 5.0 m production drive, where a fixed candela table could not. It also
 * reproduces the number the old table carried: cd(0.55, 9.5) = 1240.
 *
 * The VALUE TARGETS below are the whole design of the underground look, and
 * they are a ladder, not a level. Linear radiance, before the 0.62 exposure:
 *
 *      the work (face / collar / back)   0.62     held sRGB ~180
 *      near and mid walls, 4-12 m        0.11     sRGB ~85
 *      the drive beyond ~30 m          < 0.006    sRGB < 20, genuinely black
 *
 * ~6.5 stops with the subject at the top of it, which is the brief: darkness
 * is the surround, the work is the brightest thing in frame, and everything
 * falls away from it. Nothing here lights "the drive" - the far end is dark
 * because no light is aimed at it and 1/d^2 does the rest.
 */
/* MEASURED, not nominal. Dry gneiss is ~0.15, and that is the number the first
   solve used — but it is not what the renderer multiplies the irradiance by.
   world/terrain.js hands the drive shell an albedo of #7F7B75 (linear luma
   0.183), then an assets.js rockFace map on top of it, then rockPatch()'s own
   overbreak term mix(0.62, 1.14, ob) x mix(1.0, 0.86, raw) which averages 0.76.
   The product is ~0.09, and solving against 0.15 therefore under-lit every
   surface in the drive by 1.6x: measured on the round-2 rockbolt frame, the
   face came back at sRGB 102 where the ladder wanted 170-190, and only 0.8 % of
   the band was above L160 — i.e. the work was NOT the brightest thing in frame,
   which is the one thing the brief asks for. */
const ROCK_ALBEDO = 0.095;
const ROCK_NDOTL = 0.85;       // a raking work light on a faceted blasted wall
const cd = (L, d) => (L * Math.PI * d * d) / (ROCK_ALBEDO * ROCK_NDOTL);

/** What each light is FOR, as a radiance on rock. See the ladder above. */
const UG_TARGET = {
  key: 0.62,        // the work. The brightest thing in the frame, by design.
  fill: 0.26,       // the other side of the work, so it is not one flat lamp
  wash: 0.16,       // near walls and invert - the tube has to read AS a tube
  rear: 0.07,       // pointed at the camera: a shaft-maker, not a wall-lighter
  festoon: 0.34,    // the sodium string's own pool on the wall behind it
  cap: 0.45,        // a cap lamp is bright inside its own small circle
  beacon: 0.30,     // the amber rotator's pool on the canopy and the back
};

/**
 * The light rig, per variant, built from the drive's own dimensions AND its
 * `work` distance, so the three drives share one authored intent rather than
 * one authored brightness.
 *
 * Colour temperature is deliberately MIXED, because that is what underground
 * looks like and the rubric grades it explicitly: the machine's own floods are
 * warm white (rigFactory.js publishes colourHex 0xFFE9C0, ~4000 K, and that is
 * taken as read the same way coneDeg and rangeM already are), the site wash and
 * the cap lamp are cold 5500-6000 K LED, and the festoon down one wall is
 * 2200 K sodium. `media` marks the lights the participating medium integrates -
 * the ones that make visible shafts.
 *
 * `follow` is the NAME of a lamp published by ctx.rig.getWorkLights(), not an
 * index into it. Index binding broke the moment a one-lamp machine stood in a
 * drive whose own rig has two: `follow: 1` resolved to undefined in silence and
 * the fill sat at its authored fallback, aimed at a face the machine was not
 * working on. `followAt` is the ordinal fallback for when the machine on the
 * pad is a STAND-IN with differently named lamps - which the harness currently
 * produces for `rockbolt`, where data.js hands back `tunnel-jumbo`.
 */
/**
 * Where terrain.js hangs festoon bulb `i`. ONE definition, called by both
 * sides: env.js picks which bulbs get a real light, terrain.js draws the
 * holders and the emissive glass, and neither can drift off the other.
 */
export const festoonZ = (u, i) => u.faceZ + 6 + i * u.festoon.spacing;

/** The z of the bulb nearest a wanted depth, clamped to the string. */
function festoonNear(u, wantZ) {
  let best = 0, bd = Infinity;
  for (let i = 0; i < u.festoon.n; i++) {
    const d = Math.abs(festoonZ(u, i) - wantZ);
    if (d < bd) { bd = d; best = i; }
  }
  return festoonZ(u, best);
}

function undergroundRig(u, tier) {
  const W = u.width * 0.5, H = u.height;
  const lo = tier === 'low';
  const d = u.work;
  const faceTarget = [0, H * 0.42, u.faceZ];
  /* How far the wash has to reach. It is aimed ALONG the drive, so this is a
     depth, not a width — but it is deliberately short of the work: the wash is
     the floor of the value ladder, not a second key, and a wash solved for the
     whole corridor would be 20x the near-wall target at the near end. */
  const washD = clamp(Math.hypot(W, H * 0.5) * 0.95, 2.9, 7.6);
  /* The festoon fitting's own standoff, scaled with the drive: a 94 m2 heading
     is lit by a bigger fitting hung further off the rock than a 5 m drive is. */
  const festD = clamp(u.width * 0.18, 0.95, 2.4);

  /* The fallback aim of the key, per variant, used only when the machine on the
     pad publishes no lamp by that name. When one IS published the aim comes off
     the live `aim` node and the beam sweeps with the boom, which is the point. */
  const keyTarget = u.id === 'rockbolt'
    ? [0.35, H, -1.2]                       // a bolter drills the BACK, overhead
    : u.id === 'longhole'
      ? [W, H * 0.62, -2.0]                 // a longhole cradle drills the ring
      : faceTarget;                         // a jumbo drills the face

  const L = [
    /* THE KEY - the machine's own boom / feed / cradle lamp. rigFactory.js
       creates no THREE.Light at all; it publishes the housings as live nodes,
       and riding them is what makes the beam leave the housing instead of empty
       air. The authored coordinates below are only the fallback, and they are
       also what the lamp housings in world/terrain.js are hung on. */
    { name: 'ugFloodL', kind: 'spot', pos: [-W * 0.42, H * 0.55, 1.6], target: keyTarget,
      color: '#FFE9C0', power: cd(UG_TARGET.key, d), dist: Math.max(18, d * 3.4),
      angle: 0.47, penumbra: 0.52, media: 1.9, shadow: 1,
      follow: u.id === 'tunnel-jumbo' ? 'boom-1-work-light'
        : u.id === 'longhole' ? 'cradle-work-light' : 'feed-work-light',
      followAt: 0 },
    /* The second key. On a jumbo it is the second boom's lamp and really is a
       second machine light; on the one-lamp machines there is nothing to
       follow, so it becomes the carrier's platform light washing the far side
       of the work - which is what stops the key reading as one flat lamp. */
    { name: 'ugFloodR', kind: 'spot',
      pos: u.id === 'tunnel-jumbo' ? [W * 0.40, H * 0.52, 2.4] : [W * 0.55, H * 0.42, 4.2],
      /* Down the drive, not across it. Aimed at [-W*0.30, H*0.55, -1.5] this
         light raked the near-left rib 1-3 m from the eye and made a foreground
         wall the brightest thing in the frame; the work is 12 m away and this
         is the only lamp on it that does not swing with the boom. */
      target: u.id === 'tunnel-jumbo' ? [W * 0.22, H * 0.30, u.faceZ] : [-W * 0.12, H * 0.50, -5.0],
      color: u.id === 'tunnel-jumbo' ? '#FFE4B8' : '#CFE0FF',
      /* On the jumbo this is a real second boom lamp and a ratio to the key is
         the right authoring. On the one-lamp machines it is the carrier's
         platform light and it is the ONLY light on the work that does not
         swing away with the boom, so it carries more. */
      power: cd(u.id === 'tunnel-jumbo' ? UG_TARGET.fill : UG_TARGET.fill * 1.45, d),
      dist: Math.max(16, d * 3.0),
      angle: 0.56, penumbra: 0.62, media: 1.9, shadow: 0,
      follow: u.id === 'tunnel-jumbo' ? 'boom-2-work-light' : null,
      followAt: u.id === 'tunnel-jumbo' ? 1 : null },
    /* THE WASH - the carrier's own tramming and platform lights, wide and weak,
       thrown forward and down over the invert. This is the light that makes the
       tube read as a tube. Without it the near walls of a 12.6 m heading sit at
       linear 0.008 against a face at 0.55, the frame crushes to black either
       side of the machine (measured: 52 % of the jumbo band below L16) and the
       composition the rubric asks for - the eye travelling INTO a corridor -
       has nothing to travel along.

       A POINT, not a spot, and that is most of the trick. A spot has to choose
       between the invert and the crown and gets neither; a point on the canopy
       lights the arch, both ribs and the muck at once inside a few metres and
       then dies as 1/d^2 — which IS the near-bright / far-black gradient a
       drive has, for free and in the right shape. It is also closer to what the
       machine really carries: a jumbo has lamps all round its canopy, not one
       flood. `washD` is the drive's own half-diagonal from the canopy, i.e. the
       radius at which this light is supposed to hit its target value; inside
       that it is brighter and outside it is gone, and both are the picture. */
    { name: 'ugWash', kind: 'point', pos: [W * 0.06, H * 0.54, 5.2],
      target: [W * 0.06, 0, u.faceZ],
      color: '#CFE0FF', power: cd(UG_TARGET.wash, washD), dist: Math.max(13, washD * 2.6),
      /* A POINT light has no cone, so it seeds the medium in every direction
         from every sample: it is pure haze and it can never be a shaft. So the
         omnidirectional sources carry a FRACTION of the medium and the cone
         sources carry a multiple of it. Measured by toggling __qaMedia() row by
         row: with every light at media 1 the medium laid a near-uniform +70 L
         across the whole band — fog, not beams — and the wash, being both the
         brightest point source and the nearest, was most of it. */
      media: 0.22, shadow: 0 },
    /* The carrier's rear work light, thrown BACK down the drive and ACROSS it.
       This is the one that reads as a shaft — but only because it is aimed past
       the camera rather than at it.

       Aimed at the lens it was invisible, and not subtly: from (-1.89, 3.36,
       4.4) to (-2.14, 1.68, 30) the cone axis passes 0.97 m from an eye sitting
       inside a 1.9 m cone radius, so the player was INSIDE the beam, looking
       the other way, with the whole shaft behind the back of the camera. You
       cannot see a beam you are standing in. Raked down and across to the far
       rib it crosses the lower third of the frame diagonally, lands on the
       invert, and is seen from the side — which is also what a rear tramming
       light is for: the ground behind the machine, so it can back out. */
    { name: 'ugRear', kind: 'spot', pos: [-W * 0.30, H * 0.58, 4.4], target: [W * 0.55, 0.35, 24],
      color: '#FFE2B4', power: cd(UG_TARGET.rear, u.width), dist: Math.max(20, u.width * 3.2),
      /* A SHAFT IS AN EDGE, and it also has to be NARROWER THAN THE DRIVE.
         angle 0.40 rad puts a 4.0 m cone radius at the camera's 9.4 m standoff,
         which in a 5.0 m production drive is wider than the tube: the beam
         floods the whole near end, has no boundary anywhere inside the frame,
         and renders as an ambient glow. 0.20 gives a 1.9 m shaft that the rock
         is visibly outside of. penumbra 0.72 -> 0.34 for the same reason — the
         thing the eye reads as a beam is the line between lit air and unlit
         air, and a wide penumbra spreads that line over 20 degrees of cone. */
      angle: 0.20, penumbra: 0.34, media: 4.2, shadow: 0 },
    /* THE SODIUM FESTOON — and the corridor light.
       research/04 §E3 Light: "Warm sodium/LED string lighting along one wall
       receding into distance — THE PERSPECTIVE CUE". It is the only lighting in
       a drive that is distributed along the length, and that is not decoration:
       a single point source near the camera cannot wash a corridor, because
       1/d^2 across a 3-to-20 m read is 44:1 and there is no power that is
       neither a hole at the near end nor black at the far one. A string of
       modest sources at three depths is how a real drive solves it, and it is
       how this one does.

       Three real lights, at the z of three of the bulbs terrain.js actually
       hangs — see festoonZ(), which BOTH files call. The old pair sat at
       spacing x 1.5 and x 3.2, which in the longhole drive is z +9.8 and +20.8
       while terrain.js hung its bulbs at -24, -17.5, -11, -4.5, +2, +8.5, +15:
       the lights were not on the lamps, in the one file whose header promises
       that cannot happen.

       `inset` stands the LIGHT (not the housing) off the wall its housing hangs
       on, and scales with the drive because a big heading is lit by a bigger
       fitting. A festoon bulb is a large diffuse source ~0.2 m from the rock,
       and a point light at 0.2 m is a 20x hotspot that renders as a white hole:
       measured on the round-1 longhole frame, 0.0 % of the band was below L16
       and 47.7 % above L160, and this was most of it. Standing a point source
       back is the ordinary approximation for a big diffuse emitter. */
    ...[11, 1, -9].map((wantZ, i) => ({
      name: `ugFest${i}`, kind: 'point',
      pos: [u.festoon.x, u.festoon.y, festoonNear(u, wantZ)],
      inset: festD, color: i === 1 ? '#FFA338' : '#FF9B2E', inMedia: i === 0,
      power: cd(UG_TARGET.festoon, festD) * (1 - i * 0.09), dist: Math.max(11, festD * 9),
      media: 0.55, shadow: 0,
    })),
    /* a cap lamp on a crew member, panning. Small moving light sources are
       cheap and enormously effective - research/04 E3. Every worker underground
       must carry one: [OSHA-800] 1926.800(g)(4). */
    { name: 'ugCap', kind: 'spot', pos: [W * 0.55, 1.72, 8.5], target: [W * 0.2, 1.2, 2.0],
      color: '#F4F8FF', power: cd(UG_TARGET.cap, 2.2), dist: 16,
      angle: 0.34, penumbra: 0.5, media: 2.4, shadow: 0, cap: 1 },
    /* The canopy beacon. rigFactory.js draws the amber emissive dome for it and
       gates that on quality > LOW - so this light is gated the same way, or LOW
       would carry an orange pool of light with nothing making it. */
    { name: 'ugBeacon', kind: 'point', pos: [0, Math.min(3.4, H * 0.44), 3.2],
      color: '#F0B319', power: cd(UG_TARGET.beacon, 1.8), dist: 11, media: 0.6, shadow: 0, beacon: 1,
      inMedia: false },
  ];
  // LOW keeps the key, the wash, the shaft and one sodium bulb: four lights,
  // and no beacon, because the machine that would be making it has none at LOW.
  return lo ? [L[0], L[2], L[3], L[4]] : L;
}

/**
 * The static lamp HOUSINGS, drive-local, for world/terrain.js to hang boxes on.
 *
 * The following lights ride the machine and rigFactory.js draws their housings;
 * these are the ones bolted to the carrier deck or the drive itself, and
 * terrain.js used to carry a hardcoded pair of coordinates that had already
 * drifted off two of the three variants. ONE definition, read by both sides.
 */
export function driveFixtures(methodId, tier) {
  const u = UNDERGROUND[methodId];
  if (!u) return [];
  return undergroundRig(u, tier)
    .filter((s) => s.housing && !s.follow)
    .map((s) => ({ name: s.name, pos: s.pos.slice(), target: s.target.slice() }));
}
/* NOTE, and it is the point of the filter above: right now this returns NOTHING
   for all three variants, because every light in the rig except the festoon is
   carried by the MACHINE and rigFactory.js draws those housings. terrain.js
   used to hang two boxes at [-W*0.42, H*0.55, 1.6] and [W*0.40, H*0.52, 2.4] —
   coordinates that belong to the machine's boom lamps — and they rendered as
   two lamp housings floating unsupported in the middle of the drive, visible in
   every underground frame this project has shot. A fixture bolted to the rock
   would carry `housing: 1`; none of these are. */


/**
 * The grade's base exposure came down ~1.08 stops (see solve()), which the
 * surface band wants and the technical cutaway does not: the cross-section is
 * a readability surface, not a mood surface, and the same cut would have taken
 * the strata with it. This gain puts the section rig back roughly where it
 * was, minus ~0.28 stops so the cut still sits a touch under the sunlit
 * surface band instead of glowing next to it. The down-hole bit light is
 * deliberately NOT scaled - at the lower exposure it stops washing the band
 * amber, which is exactly what the review asked for.
 */
const SECTION_GAIN = 1.75;

/* ═══════════════════════════════════════════════════════════════════════════
   WEATHER MODIFIERS — multiplied onto the region recipe.
   ═══════════════════════════════════════════════════════════════════════════ */
const WEATHER = {
  // hemi is x ~2.35 on every sunless state (was 1.25-1.45). The regions' own
  // hemi came down 3x for key dominance, but under cloud there IS no key - the
  // sky is the light - so without this the overcast/rain/fog/snow looks would
  // have gone ~2.3 stops down and read as night. exposure is nudged with it.
  clear:    { sun: 1.00, fog: 1.00, hemi: 1.00, turbidity: 1.00, mie: 1.00, cloud: 1.00, sat: 1.00, exposure: 1.00, precip: null,   wind: 0.6 },
  overcast: { sun: 0.34, fog: 2.00, hemi: 3.20, turbidity: 1.55, mie: 1.60, cloud: 1.85, sat: 0.86, exposure: 1.18, precip: null,   wind: 1.4 },
  rain:     { sun: 0.20, fog: 2.60, hemi: 3.00, turbidity: 1.85, mie: 1.90, cloud: 2.20, sat: 0.72, exposure: 1.16, precip: 'rain', wind: 2.6 },
  snow:     { sun: 0.44, fog: 2.10, hemi: 3.40, turbidity: 1.40, mie: 1.45, cloud: 1.95, sat: 0.80, exposure: 1.22, precip: 'snow', wind: 1.1 },
  fog:      { sun: 0.28, fog: 5.20, hemi: 2.90, turbidity: 2.20, mie: 2.20, cloud: 1.40, sat: 0.74, exposure: 1.18, precip: null,   wind: 0.3 },
};

/**
 * Sun colour by elevation (deg) — deep ember on the horizon → clean daylight.
 *
 * The daylight half of this ramp is the reason the machine measured hue
 * 31.4 deg instead of BRAND.amber's 37.7 deg. At the signature tod 0.34 the
 * nordic sun sits at 13 deg, i.e. 3/4 of the way from the 7 deg entry to the
 * 15 deg entry, and #FFAE63 -> #FFCB92 interpolates (in linear) to
 * (255, 196, 136) — a light whose OWN hue is 30.3 deg. A 30.3 deg key on
 * 37.7 deg paint lands at 31.4 deg: the measured value, to a tenth. The paint
 * was never wrong and the grade was never the culprit; the key was too orange
 * for its own elevation. 3000 K is a 2-4 deg sun, not a 13 deg one.
 *
 * The three sub-horizon entries are untouched — that IS the ember look, and
 * nothing plays there. From 7 deg up the ramp moves toward a warm white at a
 * physically sane 3800-4300 K: 13 deg now interpolates to (255, 216, 156),
 * hue 36.4 deg, which should carry the lit deck to ~37 deg — inside the
 * 36-38 deg target and 1.3 deg off BRAND.amber itself.
 *
 * It also buys back part of the top end the review wants: the new key is
 * +24 % green and +35 % blue, so +16 % of luminance (+0.21 stops) on every
 * sunlit surface (measured lit deck 143, target 180-200) WITHOUT touching
 * exposure and without lifting a single shadow — the key is the one light
 * that only ever brightens what it can already see. It is why the bloom
 * threshold moved with it in renderer.js. Saturation falls as elevation
 * climbs (0.349 -> 0.153 -> 0.051 over the top three entries), which is what
 * actually reads as the sun climbing; the small hue wobble at the near-white
 * end is below perception. The golden hour survives in the warmed `fog` haze
 * and the sky's own horizon glow, which is where it belongs.
 *
 * env.sunColor is also read by sim/vfx.js to tint dust and spray, so those
 * follow the key automatically.
 *
 * ROUND 3 — DO NOT REACH FOR THIS RAMP AGAIN FOR A PAINT COMPLAINT.
 * The hue correction landed: measured on shots/r4-12, the machine's paint
 * moved from hue 30.4° to 36.2° over the whole machine and to 38.2° on the
 * large lit body panels, which is inside the 36-38° target. What it then read
 * as was school-bus yellow — the same panels measured S 0.821, and the
 * brightest lit faces S 0.889 at hue 41.7°. That is a PIGMENT problem, not a
 * light problem: assets.js was defaulting paintedSteel's albedo to BRAND.amber
 * (S 0.955), which is a UI accent on dark slate, not a painted machine.
 * Desaturating the key would have flattened every surface in the frame and
 * undone the hue work, so the fix went into the albedo instead — see
 * PLANT_AMBER in world/terrain.js and the NEEDS note for assets.js.
 *
 * One related observation, deliberately NOT acted on: the round-2 x1.06 on
 * every region's grade.saturation was applied to compensate a predicted -0.06
 * of paint saturation from this ramp. The measurement says that loss did not
 * occur at the lit end (the lit panels went 0.789 -> 0.889), so that x1.06 is
 * now an uncompensated global chroma lift. It is left in place because
 * grade.saturation is a whole-frame control and correcting the paint in the
 * paint is the smaller, truer change; revisit it only if a re-shoot shows the
 * frame reading over-chromatic AFTER the albedo fix.
 */
const SUN_RAMP = [
  [-10, '#C93F1C'], [-3, '#FF5E2A'], [2, '#FF9A50'], [7, '#FFBC77'],
  [15, '#FFE0A6'], [30, '#FFEFD8'], [55, '#FFF9F2'],
];

/* ═══════════════════════════════════════════════════════════════════════════
   Shared GLSL — value-noise fbm used by the cloud deck.
   ═══════════════════════════════════════════════════════════════════════════ */
const FBM_GLSL = /* glsl */`
  float hash12( vec2 p ) {
    vec3 p3 = fract( vec3( p.xyx ) * 0.1031 );
    p3 += dot( p3, p3.yzx + 33.33 );
    return fract( ( p3.x + p3.y ) * p3.z );
  }
  float vnoise( vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
    vec2 u = f * f * ( 3.0 - 2.0 * f );
    return mix( mix( hash12( i + vec2( 0.0, 0.0 ) ), hash12( i + vec2( 1.0, 0.0 ) ), u.x ),
                mix( hash12( i + vec2( 0.0, 1.0 ) ), hash12( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
  }
  float fbm( vec2 p ) {
    float a = 0.5;
    float s = 0.0;
    mat2 R = mat2( 0.80, 0.60, -0.60, 0.80 );
    for ( int i = 0; i < FBM_OCTAVES; i ++ ) {
      s += a * vnoise( p );
      p = R * p * 2.03;
      a *= 0.5;
    }
    return s;
  }
`;

const CLOUD_VERT = /* glsl */`
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4( position, 1.0 );
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const CLOUD_FRAG = /* glsl */`
  precision highp float;

  uniform vec2  uDrift;
  uniform float uScale;
  uniform float uHeight;
  uniform float uCoverage;
  uniform float uOpacity;
  uniform vec3  uSunDir;
  uniform vec3  uSunCol;
  uniform vec3  uLitCol;
  uniform vec3  uShadowCol;
  uniform vec3  uHorizonCol;
  uniform float uDay;

  varying vec3 vWorld;

  ${FBM_GLSL}

  void main() {

    vec3 dir = normalize( vWorld - cameraPosition );
    if ( dir.y <= 0.006 ) discard;

    /* project the view ray onto an infinite cloud plane — correct perspective
       all the way down to the horizon, no geometry to clip */
    vec2 cp = dir.xz / dir.y * uHeight;
    vec2 p = cp * uScale + uDrift;

    float w  = fbm( p * 0.5 );
    float d  = fbm( p + w * 1.4 );

    vec2 sunXZ = normalize( uSunDir.xz + vec2( 1e-4 ) );
    float dl = fbm( p + sunXZ * 0.55 + w * 1.4 );

    float cov = smoothstep( uCoverage, uCoverage + 0.26, d );
    if ( cov <= 0.001 ) discard;

    /* thinner toward the sun = lit; thicker = shadowed base */
    float lit = clamp( ( d - dl ) * 2.2 + 0.55, 0.0, 1.0 );

    float sunAmt = pow( clamp( dot( dir, uSunDir ), 0.0, 1.0 ), 6.0 );
    float rim = pow( clamp( 1.0 - abs( cov - 0.5 ) * 2.0, 0.0, 1.0 ), 3.0 );

    vec3 col = mix( uShadowCol, uLitCol, lit );
    col += uSunCol * ( rim * ( 0.30 + 1.70 * sunAmt ) + sunAmt * 0.45 ) * mix( 0.25, 1.0, lit ) * uDay;

    /* dissolve into the haze as the deck races away to the horizon */
    float far = 1.0 - smoothstep( 0.055, 0.48, dir.y );
    col = mix( col, uHorizonCol, far * 0.88 );

    float horizonFade = smoothstep( 0.006, 0.13, dir.y );
    gl_FragColor = vec4( col, cov * uOpacity * horizonFade );
  }
`;

const PRECIP_VERT = /* glsl */`
  uniform float uTime;
  uniform float uBoxH;
  uniform float uBoxR;
  uniform float uFall;
  uniform float uSize;
  uniform float uWind;
  uniform float uWobble;

  attribute float aRand;

  varying float vFade;
  varying float vRand;

  void main() {
    vec3 p = position;
    p.y = mod( p.y - uTime * uFall * ( 0.65 + aRand * 0.70 ), uBoxH );
    p.x = mod( p.x + uTime * uWind + sin( uTime * 0.70 + aRand * 31.0 ) * uWobble + uBoxR, uBoxR * 2.0 ) - uBoxR;
    p.z = mod( p.z + uTime * uWind * 0.35 + uBoxR, uBoxR * 2.0 ) - uBoxR;

    vec4 mv = modelViewMatrix * vec4( p, 1.0 );
    gl_Position = projectionMatrix * mv;

    float dist = max( -mv.z, 0.05 );
    gl_PointSize = clamp( uSize * ( 240.0 / dist ), 1.0, 72.0 );

    vFade = ( 1.0 - smoothstep( uBoxR * 0.35, uBoxR * 1.05, dist ) )
          * smoothstep( 0.6, 3.0, dist );
    vRand = aRand;
  }
`;

const PRECIP_FRAG = /* glsl */`
  precision mediump float;

  uniform vec3  uColor;
  uniform vec3  uTint;
  uniform float uOpacity;
  uniform float uSnow;

  varying float vFade;
  varying float vRand;

  void main() {
    vec2 c = gl_PointCoord - 0.5;

    float streak = ( 1.0 - smoothstep( 0.02, 0.15, abs( c.x ) ) )
                 * ( 1.0 - smoothstep( 0.18, 0.50, abs( c.y ) ) );
    float flake = 1.0 - smoothstep( 0.14, 0.50, length( c ) );

    float a = mix( streak, flake, uSnow ) * vFade * uOpacity * ( 0.65 + vRand * 0.45 );
    if ( a <= 0.004 ) discard;

    gl_FragColor = vec4( uColor * uTint, a );
  }
`;

const BACKDROP_VERT = /* glsl */`
  varying vec2 vUvB;
  void main() {
    vUvB = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const BACKDROP_FRAG = /* glsl */`
  precision mediump float;
  uniform vec3  uTop;
  uniform vec3  uBottom;
  uniform vec3  uGlow;
  uniform float uGlowAmount;
  uniform float uGlowY;
  varying vec2 vUvB;

  void main() {
    vec3 col = mix( uBottom, uTop, smoothstep( 0.0, 1.0, vUvB.y ) );
    vec2 d = vec2( ( vUvB.x - 0.5 ) * 2.6, ( vUvB.y - uGlowY ) * 1.0 );
    float g = exp( -dot( d, d ) * 26.0 );
    col += uGlow * g * uGlowAmount;
    gl_FragColor = vec4( col, 1.0 );
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   AIRBORNE DUST — the participating medium, and the single biggest line item
   in the underground render budget. This is where the brief says the budget
   should go, and it is one draw call.
   ═══════════════════════════════════════════════════════════════════════════
   WHY A RAYMARCH AND NOT CONES. The usual mobile answer to "visible light
   shafts" is additive cone geometry. It fails here for a reason specific to
   this scene: a cone that intersects the wall, the back or the muck pile draws
   a hard bright line along the intersection, and in a 12.6 x 8.4 m tube EVERY
   beam intersects something within 20 m. The alternatives to that artefact —
   soft-particle depth fade — need the depth texture, which lives in
   core/renderer.js and belongs to another agent.
   A raymarch does not have the problem at all: the drive is a CLOSED volume
   with an analytic envelope, so the integral is bounded by a box slab test in
   drive-local space and never has to know where the geometry is. It is also
   the physically right shape — in-scattering integrated along the view ray —
   so the falloff, the cone edges and the forward-scattering flare come out of
   the model instead of being drawn on.
   Cost is fixed and tier-scaled: UG_STEPS x UG_L light evaluations per pixel of
   the surface band, no overdraw, no depth write, no shadow pass, one draw call.
   The only thing it cannot do without a depth buffer is stop at the machine, so
   it stops at an analytic occluder box instead (uOccMin/uOccMax) — the machine
   correctly stops the dust behind it while beams still cross in front of it,
   which is the shot.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * A CLIP-SPACE quad, not a billboard held in front of the eye.
 *
 * The medium used to be a 1x1 plane scaled to 2*tan(fov/2)*dist by
 * 2*tan(fov/2)*dist*camera.aspect and parked a metre off the near plane. That
 * is only correct while camera.fov and camera.aspect are exactly what they will
 * be at draw time — and they are not: core/renderer.js draws the two bands as
 * scissored viewports and sets camera.aspect from the SURFACE band, while
 * systems update in registration order with env.js ahead of the renderer. The
 * measured result was a quad covering ~78 % of the band's width and ~89 % of
 * its height: AN AXIS-ALIGNED RECTANGLE OF DUST with two hard edges through the
 * middle of the frame, plainly visible in shots/q5-tunnel-jumbo-band.png once
 * the medium was dense enough to see at all.
 *
 * Drawing in clip space removes the whole class of failure — the quad IS the
 * viewport, whatever the camera does — and the world-space ray comes back by
 * unprojecting the far plane through uInvVP, the same reconstruction every
 * deferred pass uses.
 */
const MEDIA_VERT = /* glsl */`
  uniform mat4 uInvVP;
  varying vec3 vWP;
  void main() {
    vec2 ndc = position.xy * 2.0;          // a 1x1 plane: xy spans [-0.5, 0.5]
    vec4 far = uInvVP * vec4( ndc, 1.0, 1.0 );
    vWP = far.xyz / far.w;
    gl_Position = vec4( ndc, 0.0, 1.0 );
  }
`;

const MEDIA_FRAG = /* glsl */`
  precision highp float;

  uniform vec2  uYaw;          // (cos, sin) of the drive bearing
  uniform vec3  uBoxMin;       // drive envelope, drive-local metres
  uniform vec3  uBoxMax;
  uniform vec3  uOccMin;       // the machine, drive-local metres
  uniform vec3  uOccMax;
  uniform vec3  uLPos[ UG_L ]; // world
  uniform vec3  uLDir[ UG_L ]; // world, normalised, spot axis
  uniform vec3  uLCol[ UG_L ]; // colour x power
  uniform vec2  uLCone[ UG_L ];// (cos outer, cos inner); x < -1.5 => point light
  uniform float uTime;
  uniform vec4  uDust;         // (base density, face boost, sigma, gain)
  uniform float uFaceZ;
  uniform float uHG;           // Henyey-Greenstein g
  uniform vec2  uSat;          // saturation constants: (beam k, haze k)

  varying vec3 vWP;

  vec3 toLocal( vec3 p ) {
    return vec3( p.x * uYaw.x - p.z * uYaw.y, p.y, p.x * uYaw.y + p.z * uYaw.x );
  }

  float h13( vec3 p ) {
    p = fract( p * 0.1031 );
    p += dot( p, p.zyx + 31.32 );
    return fract( ( p.x + p.y ) * p.z );
  }
  float n3( vec3 p ) {
    vec3 i = floor( p ), f = fract( p );
    f = f * f * ( 3.0 - 2.0 * f );
    return mix(
      mix( mix( h13( i ), h13( i + vec3( 1, 0, 0 ) ), f.x ),
           mix( h13( i + vec3( 0, 1, 0 ) ), h13( i + vec3( 1, 1, 0 ) ), f.x ), f.y ),
      mix( mix( h13( i + vec3( 0, 0, 1 ) ), h13( i + vec3( 1, 0, 1 ) ), f.x ),
           mix( h13( i + vec3( 0, 1, 1 ) ), h13( i + vec3( 1, 1, 1 ) ), f.x ), f.y ), f.z );
  }

  /* slab test; returns (tEnter, tExit), tExit < tEnter means "missed" */
  vec2 slab( vec3 ro, vec3 rd, vec3 bmin, vec3 bmax ) {
    // 1/rd with a floor on |rd| — sign() is 0 on an axis-parallel ray, so the
    // (1 - |sign|) term puts it back to +1 instead of collapsing inv to 0.
    vec3 sg = sign( rd ) + ( 1.0 - abs( sign( rd ) ) );
    vec3 inv = sg / max( abs( rd ), vec3( 1e-6 ) );
    vec3 a = ( bmin - ro ) * inv;
    vec3 b = ( bmax - ro ) * inv;
    vec3 lo = min( a, b ), hi = max( a, b );
    return vec2( max( max( lo.x, lo.y ), lo.z ), min( min( hi.x, hi.y ), hi.z ) );
  }

  void main() {

    vec3 ro = cameraPosition;
    vec3 rd = normalize( vWP - ro );

    vec3 lro = toLocal( ro );
    vec3 lrd = toLocal( rd );

    vec2 tb = slab( lro, lrd, uBoxMin, uBoxMax );
    float t0 = max( tb.x, 0.05 );
    float t1 = tb.y;
    if ( t1 <= t0 ) discard;

    /* THE MACHINE TRUNCATES THE INTEGRAL, rather than the depth buffer — but
       SOFTLY, and that is not a nicety.

       t1 = min(t1, to.x) is a hard clamp against an analytic brick, so every
       ray that grazes the box gets the full 40 m of tube and every ray that
       enters it gets 6 m. The step between them is the box's silhouette, drawn
       into the dust as a hard-edged rectangle: measured by toggling
       __qaMedia() row by row on the jumbo frame, the medium's contribution
       fell from +70 L to +44 L across ONE 8-px row at y = 180, which is exactly
       where the occluder's near-top edge projects. It read as a pane of glass
       across the frame.

       So the box now fades the contribution over ~2.4 m instead of cutting it.
       A dusty machine does not have a hard edge in the haze around it either. */
    vec2 to = slab( lro, lrd, uOccMin, uOccMax );
    float tOcc = ( to.y > to.x && to.x > 0.0 ) ? to.x : 1e9;

    /* ...and softly ACROSS the box as well as along the ray.

       Feathering only in t is not enough, because the camera looks straight
       down the drive and the occluder is axis-aligned in drive space: its
       silhouette projects as an almost perfect screen-space rectangle, and a
       2.4 m feather along a ray 12 m away is a couple of pixels wide. The
       result was a translucent grey rectangle with three hard edges sitting in
       the middle of the frame — visible in shots/qg-tunnel-jumbo-band.png, and
       the third time this shader has drawn one of its own bounding volumes into
       the picture.

       pen is how far INTO the box the ray passes, in normalised box space:
       1 through the middle of the machine, 0 clear of it, ramped across the
       outer quarter of the box. Rays that graze the machine are barely
       occluded, which is also the truth — a machine has a ragged edge and dust
       blows round it. */
    vec3 oCen = ( uOccMin + uOccMax ) * 0.5;
    vec3 oHalf = max( ( uOccMax - uOccMin ) * 0.5, vec3( 1e-3 ) );
    float tCen = max( dot( oCen - lro, lrd ), 0.0 );
    vec3 q = abs( ( lro + lrd * tCen ) - oCen ) / oHalf;
    float pen = 1.0 - smoothstep( 0.70, 1.30, max( max( q.x, q.y ), q.z ) );

    float span = t1 - t0;
    float dt = span / float( UG_STEPS );

    /* interleaved-gradient dither: the alternative is 7-20 visible shells */
    float jit = fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) )
                       + uTime * 0.37 );

    /* TWO ACCUMULATORS, AND THIS IS THE WHOLE FIX FOR "HAZE, NOT BEAMS".

       Round 3 left one open gap, in its own words: "the medium reads as haze
       with a bright core near the lamps, not as defined beams; the beam's edge
       still sits below the surround's contrast." Measured with .qa-beam.mjs,
       which shoots the band with __qaMedia(true) and (false) and analyses the
       DIFFERENCE — the medium's contribution, isolated exactly:

           method          contribution mean   p95/p50   coverage
           tunnel-jumbo          27.5 L          4.0       74.3 %
           longhole              15.2 L         13.9       50.6 %
           rockbolt               8.1 L         51.6       24.0 %

       74 % of the band lifted by more than 6 L, with a p95/p50 of 4, is not a
       beam. It is a uniform veil with some brighter parts, and no amount of
       tuning ONE accumulator could have separated the two, because a single
       saturation curve has to serve both: the constant that keeps the beam
       core off the ceiling is the same constant that lets the veil accumulate
       over 40 m of tube.

       So the integral is split by the ANGULAR STRUCTURE OF THE SOURCE, which
       is what actually decides whether light arrives as a shaft:

         accB   cone sources. A spot's in-scattering is shaped like its cone
                wherever the eye crosses it, so all of it — including the
                isotropic part of the phase function — is beam.
         accH   omnidirectional sources. A point light seeds the medium
                equally in every direction from every sample; it can never be
                a shaft, only a glow, and it is the honest home of the veil.

       Each gets its own saturation constant, and the physics supports the
       asymmetry: the diffuse component is already the result of many
       scattering events and saturates far sooner than a single-scattered beam
       core. uSat = (2.6, 12.0) gives ceilings of 0.385 and 0.083 — a beam may
       be 4.6x the brightest the veil is ever allowed to be. */
    vec3 accB = vec3( 0.0 );
    vec3 accH = vec3( 0.0 );
    float T = 1.0;

    for ( int i = 0; i < UG_STEPS; i ++ ) {

      float t = t0 + ( float( i ) + jit ) * dt;
      vec3 p = ro + rd * t;
      vec3 lp = toLocal( p );
      // 1 in front of the machine, 0 behind it, over a 2.4 m feather — and
      // only to the extent the ray actually goes through the machine at all
      float occ = mix( 1.0, smoothstep( tOcc + 1.2, tOcc - 1.2, t ), pen );
      if ( occ < 0.004 ) break;

      /* density: a floor of suspended rock dust, a plume of drill mist at the
         face, heavier air low down where it has settled, and a slow drift so
         nothing in the frame is ever static */
      float d = uDust.x;
      d *= 1.0 + uDust.y * exp( -abs( lp.z - uFaceZ ) * 0.16 );
      d *= mix( 1.55, 1.0, clamp( lp.y * 0.42, 0.0, 1.0 ) );
      d *= 0.42 + 1.05 * n3( lp * vec3( 0.32, 0.42, 0.24 )
                             + vec3( uTime * 0.06, uTime * 0.021, -uTime * 0.115 ) );

      for ( int k = 0; k < UG_L; k ++ ) {
        vec3 dv = uLPos[ k ] - p;
        float r2 = dot( dv, dv );
        vec3 l = dv * inversesqrt( r2 );
        /* The 1.2 is the source's own SIZE, not a fudge. A 300 mm luminaire
           cannot deliver 1/r^2 at r = 0.2 m — the inverse-square law is the
           far-field limit of a point, and inside about a diameter the
           irradiance flattens out. With 0.30 the attenuation peaked at 3.3 and
           any view ray that happened to graze a lamp got that times a phase
           function peaking at 6.9: measured on the jumbo frame, a blown white
           blob over roughly a sixth of the band, centred on nothing. 1.2 caps
           it at 0.83 and is within 1 % of the old value beyond 2 m, which is
           every part of the drive the player is actually looking at. */
        float att = 1.0 / ( r2 + 1.2 );

        float sp = 1.0;
        bool cone = uLCone[ k ].x > -1.5;
        if ( cone ) {
          float cd = dot( -l, uLDir[ k ] );
          sp = smoothstep( uLCone[ k ].x, uLCone[ k ].y, cd );
          sp *= sp;
        }
        if ( sp <= 0.0009 ) continue;

        /* gobo. A real beam is broken up by the boom, the hoses and the canopy
           in front of it; that streaking IS the god-ray read. Hashing the
           DIRECTION to the light gives streaks that radiate from the source and
           stay put in world space, for the price of one noise fetch.

           0.58+0.52 -> 0.42+0.76 at the same mean (0.84 -> 0.80). The old
           range put the darkest streak at 0.58 of the brightest, which at
           1-2 px of screen separation is below the noise floor of the dither;
           0.42 against 1.18 is 2.8:1 and survives it. Structure INSIDE the
           beam is half of what makes it read as a beam and not as a wedge. */
        sp *= 0.42 + 0.76 * n3( l * 9.0 + float( k ) * 17.0 );

        /* TWO-TERM Henyey-Greenstein: a forward lobe plus an isotropic floor.
           cos is +1 when the light shines INTO the camera, which is exactly
           when a shaft should flare, and single HG at g = 0.58 delivers that
           flare at 9.0 while giving BACK-scatter 0.168 — a 54:1 ratio.

           That ratio is why the characteristic image was missing. The camera
           stands 14-21 m behind the machine looking at the work, so every beam
           the machine throws runs AWAY from the lens and is seen almost purely
           in backscatter; at 1/54 of the forward value those beams were below
           the fog floor and no measured frame contained a visible shaft. Real
           rock dust is a broad size distribution — a strongly forward-scattering
           coarse fraction plus a near-isotropic fine one — and a single HG lobe
           cannot represent both. The isotropic term is that fine fraction. It
           costs one mix and it is what puts a beam on the screen when the light
           making it is pointed away from you. */
        float cs = dot( l, rd );
        float g2 = uHG * uHG;
        float hg = ( 1.0 - g2 ) / pow( 1.0 + g2 - 2.0 * uHG * cs, 1.5 );
        /* 0.45 was too much floor: measured by toggling the medium row by
           row, it laid a uniform +70 L over the WHOLE band — fog, not shafts.
           0.20 keeps side- and back-lit beams visible without turning every
           light into an omnidirectional glow. */
        float ph = 0.20 + 0.78 * hg;

        vec3 add = uLCol[ k ] * ( att * sp * ph * d * dt * T * occ );
        if ( cone ) accB += add; else accH += add;
      }

      T *= exp( -d * uDust.z * dt );
      if ( T < 0.02 ) break;
    }

    /* MULTIPLE-SCATTERING SATURATION, and the guard that makes this shader
       safe to author against.

       Single scattering has no upper bound: 1/(r^2 + 0.3) reaches 3.3 next to a
       lamp, the HG phase peaks at 9.0 straight down a beam, and the two
       multiply. Measured on the round-1 rockbolt frame — a 5.6 m drive lit by a
       key solved for a 12.6 m one — that product laid a flat white sheet over
       the machine and the band came back at mean L84 with the WORK invisible
       inside it. The physical answer is that a real dusty beam saturates: light
       scattered toward the eye is light removed from the beam, and a
       single-scatter integral cannot represent that, so it overestimates
       without limit exactly where it is brightest.

       acc/(1+k*acc) is the cheapest correct-shaped saturation: linear while
       acc is small, so nothing about the dim two thirds of the frame moves,
       rolling off through the beam core, and asymptotic at 1/k.

       1/k = 0.31, and that number is the design, not a safety margin. The
       medium is IN FRONT of the scene and additive, so its ceiling is added to
       whatever the geometry already put there; at 1/k = 1.05 a beam core
       landing on a lit machine summed past 1.5 linear, which after the 0.85
       exposure and ACES is sRGB 232 with the bloom threshold behind it — a
       white hole over a sixth of the band, visible in shots/qb-tunnel-jumbo.
       At 0.31 a beam core reaches sRGB ~135 on its own and still reads as a
       bright shaft, while the direct light on the work stays the brightest
       thing in the frame. The medium is a fraction of the picture, by
       construction and not by tuning.

       ROUND 4 splits it in two — see the accumulator note above. The BEAM
       ceiling goes 0.3125 -> 0.385, still well under the 1.05 that blew a
       white hole in shots/qb-tunnel-jumbo; the HAZE ceiling comes down to
       0.083, which is the number that stops 40 m of tube summing into a veil.
       They are added, not blended: a beam crossing a lit region is beam PLUS
       glow, which is what a real one is. */
    vec3 beam = accB / ( 1.0 + uSat.x * accB );
    vec3 haze = accH / ( 1.0 + uSat.y * accH );
    gl_FragColor = vec4( ( beam + haze ) * uDust.w, 1.0 );
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */
const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a === 0 ? 1e-6 : b - a));
  return t * t * (3 - 2 * t);
};

function rampColor(ramp, x, out) {
  if (x <= ramp[0][0]) return out.set(ramp[0][1]);
  const last = ramp[ramp.length - 1];
  if (x >= last[0]) return out.set(last[1]);
  for (let i = 1; i < ramp.length; i++) {
    if (x <= ramp[i][0]) {
      const [x0, c0] = ramp[i - 1];
      const [x1, c1] = ramp[i];
      const t = (x - x0) / (x1 - x0);
      return out.set(c0).lerp(_scratchColor.set(c1), t);
    }
  }
  return out.set(last[1]);
}
const _scratchColor = new THREE.Color();
const _amberCold = new THREE.Color(BRAND.amber);
const _amberHot = new THREE.Color(BRAND.amberHot);

/* ═══════════════════════════════════════════════════════════════════════════
   FACTORY
   ═══════════════════════════════════════════════════════════════════════════ */
export function createEnvironment(ctx) {

  const scene = ctx.scene || (ctx.scene = new THREE.Scene());
  const sectionScene = ctx.sectionScene || (ctx.sectionScene = new THREE.Scene());
  const gl = (ctx.renderer && ctx.renderer.gl) || ctx.gl || null;

  let warned = false;
  const warnOnce = (msg, e) => {
    if (warned) return;
    warned = true;
    console.warn('[env]', msg, e && e.message ? e.message : '');
  };

  /* ── look state ─────────────────────────────────────────────────────── */
  let regionId = DEFAULT_REGION;
  let recipe = REGIONS[DEFAULT_REGION];
  let weatherName = 'clear';
  let weather = WEATHER.clear;
  let tod = 0.34;                 // the signature morning
  let time = 0;

  let elevation = 0;
  let dayFactor = 1;
  const sunDir = new THREE.Vector3(0.4, 0.35, 0.85).normalize();

  const sunColor = new THREE.Color('#FFCB92');
  const fogColor = new THREE.Color(recipe.fog);
  const hemiSky = new THREE.Color(recipe.skyTint);
  const hemiGround = new THREE.Color(recipe.ground);
  const rimColor = new THREE.Color(recipe.rim);

  /* ── surface: sky + clouds ──────────────────────────────────────────── */
  const octaves = (ctx.quality && ctx.quality.id === 'low') ? 3
    : (ctx.quality && ctx.quality.id === 'high') ? 5 : 4;

  /* fbm() sums amplitudes 0.5, 0.25, 0.125 ... so its MEAN LEVEL depends on the
     octave count: 0.4375 at 3, 0.46875 at 4, 0.484375 at 5. uCoverage is a
     threshold against that sum, so a fixed threshold hands LOW systematically
     less cloud than HIGH — tolerable while the threshold sat at 0.575 (11.5 %
     of sky against 18 %), a cliff now that round 2 has moved it to 0.685
     (1.5 % against 3.1 %: LOW would render an empty sky). The bias re-levels
     every tier onto the 5-octave reference the shots are calibrated at, so
     HIGH is unchanged and the lower tiers lose detail rather than weather. */
  const FBM_BIAS = 0.5 * (1 - Math.pow(0.5, octaves)) - 0.484375;

  let sky = null;
  let skyIBL = null;
  let envScene = null;
  try {
    sky = new Sky();
    sky.scale.setScalar(2000);
    sky.renderOrder = -1000;
    sky.material.depthWrite = false;
    sky.frustumCulled = false;
    sky.userData.noAO = true;
    scene.add(sky);

    // a private twin used only for the PMREM bake, so the visible sky is
    // never yanked out of the scene mid-frame
    skyIBL = new Sky();
    skyIBL.scale.setScalar(100);
    envScene = new THREE.Scene();
    envScene.add(skyIBL);
  } catch (e) {
    warnOnce('Sky.js unavailable — falling back to a flat sky colour.', e);
    sky = null; skyIBL = null; envScene = null;
    scene.background = new THREE.Color(recipe.fog);
  }

  const cloudUniforms = {
    uDrift:      { value: new THREE.Vector2() },
    uScale:      { value: recipe.cloud.scale },
    uHeight:     { value: recipe.cloud.height },
    uCoverage:   { value: recipe.cloud.coverage },
    uOpacity:    { value: recipe.cloud.opacity },
    uSunDir:     { value: sunDir },
    uSunCol:     { value: new THREE.Color('#FFCB92') },
    uLitCol:     { value: new THREE.Color('#FFF2E2') },
    uShadowCol:  { value: new THREE.Color('#7E8CA0') },
    uHorizonCol: { value: fogColor },
    uDay:        { value: 1 },
  };

  const cloudMat = new THREE.ShaderMaterial({
    name: 'DrillityClouds',
    uniforms: cloudUniforms,
    vertexShader: CLOUD_VERT,
    fragmentShader: CLOUD_FRAG,
    defines: { FBM_OCTAVES: octaves },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    // depth-tested so terrain and the rig occlude the deck; the sky writes no
    // depth, so cloud fragments still survive over open sky
    depthTest: true,
    fog: false,
  });

  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 18), cloudMat);
  clouds.renderOrder = -900;
  clouds.frustumCulled = false;
  clouds.userData.noAO = true;
  clouds.name = 'cloudDeck';
  scene.add(clouds);

  /* ── surface: light rig ─────────────────────────────────────────────── */
  const sun = new THREE.DirectionalLight(sunColor.getHex(), recipe.sunIntensity);
  sun.name = 'keySun';
  sun.castShadow = true;
  const shadowFocus = new THREE.Vector3(0, 1.6, 0);
  {
    const q = ctx.quality || QUALITY.MEDIUM;
    const s = sun.shadow;
    s.mapSize.set(q.shadowMap, q.shadowMap);
    s.camera.left = -20; s.camera.right = 20;
    s.camera.top = 20; s.camera.bottom = -20;
    s.camera.near = 1; s.camera.far = 150;
    s.bias = -0.00042;
    // The key is now 1.8x stronger and finally casts, so acne that used to
    // hide inside the fill would be visible. A 1024 map over the 40 m ortho
    // box is a 39 mm texel: LOW needs a normalBias that clears it or the
    // shadowed side stipples. HIGH/MEDIUM (2048/4096) keep the tight value.
    s.normalBias = q.shadowMap >= 2048 ? 0.028 : 0.055;
    s.radius = 2.5;
    s.camera.updateProjectionMatrix();
  }
  sun.target.position.copy(shadowFocus);
  scene.add(sun);
  scene.add(sun.target);

  const hemi = new THREE.HemisphereLight(hemiSky.getHex(), hemiGround.getHex(), recipe.hemi);
  hemi.name = 'skyFill';
  scene.add(hemi);

  const rim = new THREE.DirectionalLight(rimColor.getHex(), recipe.rimIntensity);
  rim.name = 'coolRim';
  scene.add(rim);

  const bounce = new THREE.DirectionalLight(hemiGround.getHex(), recipe.bounce);
  bounce.name = 'groundBounce';
  scene.add(bounce);

  const ambient = new THREE.AmbientLight(new THREE.Color(BRAND.steel).getHex(), 0.02);
  ambient.name = 'floorAmbient';
  scene.add(ambient);

  scene.fog = new THREE.FogExp2(fogColor.getHex(), recipe.fogDensity);

  /* ── cross-section: technical diorama rig ───────────────────────────── */
  const secKey = new THREE.DirectionalLight(0xDDE7F0, 1.45 * SECTION_GAIN);
  secKey.name = 'sectionKey';
  secKey.position.set(0.42, 1.0, 0.75).normalize().multiplyScalar(40);
  sectionScene.add(secKey);
  sectionScene.add(secKey.target);

  const secFill = new THREE.DirectionalLight(0x7C98B6, 0.55 * SECTION_GAIN);
  secFill.name = 'sectionFill';
  secFill.position.set(-0.85, 0.15, 1.0).normalize().multiplyScalar(40);
  sectionScene.add(secFill);
  sectionScene.add(secFill.target);

  const secHemi = new THREE.HemisphereLight(0x8EA2B4, 0x2A241C, 0.60 * SECTION_GAIN);
  secHemi.name = 'sectionHemi';
  sectionScene.add(secHemi);

  const secAmbient = new THREE.AmbientLight(0x4A5460, 0.38 * SECTION_GAIN);
  secAmbient.name = 'sectionAmbient';
  sectionScene.add(secAmbient);

  const bitLight = new THREE.PointLight(new THREE.Color(BRAND.amber).getHex(), 2.4, 11, 2);
  bitLight.name = 'downholeGlow';
  bitLight.position.set(0, 0, 1.7);
  sectionScene.add(bitLight);

  const bitHot = new THREE.PointLight(new THREE.Color(BRAND.amberHot).getHex(), 1.1, 4.5, 2);
  bitHot.name = 'bitHot';
  bitHot.position.set(0, 0, 0.6);
  sectionScene.add(bitHot);

  const backdropMat = new THREE.ShaderMaterial({
    name: 'SectionBackdrop',
    uniforms: {
      uTop:        { value: new THREE.Color(BRAND.card) },
      uBottom:     { value: new THREE.Color(BRAND.bgDeep) },
      uGlow:       { value: new THREE.Color(BRAND.amber) },
      uGlowAmount: { value: 0.20 },
      uGlowY:      { value: 0.60 },
    },
    vertexShader: BACKDROP_VERT,
    fragmentShader: BACKDROP_FRAG,
    depthWrite: false,
    depthTest: false,
    fog: false,
  });
  // unit plane — rescaled every frame to exactly cover the ortho band, so the
  // gradient and the down-hole glow stay anchored to what the player sees
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), backdropMat);
  backdrop.name = 'sectionBackdrop';
  backdrop.position.set(0, 0, -60);
  backdrop.scale.set(40, 20, 1);
  backdrop.renderOrder = -1000;
  backdrop.frustumCulled = false;
  backdrop.userData.noAO = true;
  sectionScene.add(backdrop);

  /* ── precipitation ──────────────────────────────────────────────────── */
  const PRECIP_BOX = { r: 34, h: 44 };
  let precip = null;                // THREE.Points
  let precipKind = null;

  function disposePrecip() {
    if (!precip) return;
    scene.remove(precip);
    precip.geometry.dispose();
    precip.material.dispose();
    precip = null;
    precipKind = null;
  }

  function buildPrecip(kind) {
    disposePrecip();
    if (!kind) return;

    const particles = (ctx.quality && ctx.quality.particles) || 1;
    const count = Math.max(200, Math.floor((kind === 'rain' ? 3400 : 2400) * particles));
    const rnd = ctx.rand || { f: Math.random };

    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (rnd.f() * 2 - 1) * PRECIP_BOX.r;
      pos[i * 3 + 1] = rnd.f() * PRECIP_BOX.h;
      pos[i * 3 + 2] = (rnd.f() * 2 - 1) * PRECIP_BOX.r;
      rand[i] = rnd.f();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, PRECIP_BOX.h * 0.5, 0), PRECIP_BOX.r * 2);

    const isSnow = kind === 'snow';
    const mat = new THREE.ShaderMaterial({
      name: isSnow ? 'DrillitySnow' : 'DrillityRain',
      uniforms: {
        uTime:    { value: 0 },
        uBoxH:    { value: PRECIP_BOX.h },
        uBoxR:    { value: PRECIP_BOX.r },
        uFall:    { value: isSnow ? 2.6 : 26.0 },
        uSize:    { value: isSnow ? 0.50 : 0.90 },
        uWind:    { value: isSnow ? 1.1 : 3.0 },
        uWobble:  { value: isSnow ? 1.6 : 0.18 },
        uColor:   { value: new THREE.Color(isSnow ? '#F2F7FB' : '#9FBACD') },
        uTint:    { value: new THREE.Color(1, 1, 1) },
        uOpacity: { value: isSnow ? 0.85 : 0.44 },
        uSnow:    { value: isSnow ? 1 : 0 },
      },
      vertexShader: PRECIP_VERT,
      fragmentShader: PRECIP_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      fog: false,
    });

    precip = new THREE.Points(geo, mat);
    precip.name = isSnow ? 'snow' : 'rain';
    precip.frustumCulled = false;
    precip.userData.noAO = true;
    precip.renderOrder = 900;
    scene.add(precip);
    precipKind = kind;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     UNDERGROUND MODE — the light rig and the participating medium.
     ═══════════════════════════════════════════════════════════════════════ */
  let ugId = null;                  // null = surface. Never a REGIONS id.
  let ug = null;                    // the UNDERGROUND entry
  let ugGroup = null;
  let ugLights = [];                // [{ light, spec, target }]
  let ugAmbient = null, ugHemi = null;
  let media = null, mediaMat = null, mediaOn = true;
  let ugEnvRT = null;
  let capPhase = 0, flick = 0;
  let pendingMethod = null;
  let workLights = null;           // ctx.rig.getWorkLights(), re-read on demand
  let mediaIdx = [];               // ugLights indices the raymarch integrates

  const YC = Math.cos(DRIVE_YAW), YS = Math.sin(DRIVE_YAW);
  /** drive-local metres → world */
  const toWorld = (lx, ly, lz, out) =>
    (out || new THREE.Vector3()).set(lx * YC + lz * YS, ly, -lx * YS + lz * YC);

  const qid = (ctx.quality && ctx.quality.id) || 'medium';
  /* Steps and integrated lights are the whole cost of the medium. Measured
     shapes: HIGH 20x6 = 120 light evaluations per band pixel, MEDIUM 13x6 = 78,
     LOW 7x3 = 21 — and LOW also runs at dprCap 1.5 rather than 2.5, so it pays
     roughly a ninth of HIGH's pixel count on top of that. */
  /* 20 -> 13 at HIGH. The raymarch is the single most expensive thing this
     file does — UG_STEPS x UG_L light evaluations at EVERY pixel of the surface
     band, with no depth rejection because the quad is drawn depth-test-off over
     the whole viewport. Measured on an RTX 4070, headed, quality high: the
     three underground method shots ran at 21-24 fps against a 60 fps target on
     a MID PHONE, and the medium is the reason. 13 steps over a 40 m drive is
     2.9 m of spacing, which the interleaved-gradient dither already hides — the
     shells the step count could show up as were never the limit; the noise
     floor of the dither is. */
  const UG_STEPS = qid === 'high' ? 13 : qid === 'low' ? 6 : 10;

  const mediaUniforms = {
    uYaw:    { value: new THREE.Vector2(YC, YS) },
    uBoxMin: { value: new THREE.Vector3() },
    uBoxMax: { value: new THREE.Vector3() },
    uOccMin: { value: new THREE.Vector3() },
    uOccMax: { value: new THREE.Vector3() },
    uLPos:   { value: [] },
    uLDir:   { value: [] },
    uLCol:   { value: [] },
    uLCone:  { value: [] },
    uInvVP:  { value: new THREE.Matrix4() },
    uTime:   { value: 0 },
    uDust:   { value: new THREE.Vector4(0.05, 1.6, 0.05, 1.0) },
    uFaceZ:  { value: -7 },
    uHG:     { value: 0.58 },
    /* (beam k, haze k) — the two multiple-scattering saturation constants.
       Ceilings are 1/k: 0.385 for a beam core, 0.083 for the omnidirectional
       veil. See the accumulator note in MEDIA_FRAG for why they differ. */
    uSat:    { value: new THREE.Vector2(2.6, 12.0) },
  };

  const _lw = new THREE.Vector3();
  const _lt = new THREE.Vector3();
  const _fwd = new THREE.Vector3();      // camera forward, for axial de-weighting
  const _invVP = new THREE.Matrix4();

  /**
   * `ugBuiltFor` is the variant the CURRENT rig was built for, and it is the
   * difference between three drives and one drive wearing three names.
   *
   * `if (ugGroup) return` was silently correct only while every variant shared
   * one candela table: going tunnel-jumbo -> longhole -> rockbolt in a single
   * session kept the FIRST variant's lights, targets, cone angles, follow
   * bindings and media light count for all three, because solveUnderground()
   * re-runs but buildUnderground() bailed at the door. Measured after the
   * per-variant solve landed: the rockbolt drive reported ugFloodL at 235 cd,
   * which is cd(0.55, 4.2) — the longhole key, in a drive 0.7 m narrower and
   * lit for a working distance it does not have. The harness photographs the
   * three methods in one page load, so every underground frame this project has
   * ever reviewed after the first one was lit by the wrong rig.
   */
  let ugBuiltFor = null;

  function buildUnderground() {
    if (ugGroup && ugBuiltFor === ug.id) return;
    if (ugGroup) disposeUnderground();
    ugBuiltFor = ug.id;
    ugGroup = new THREE.Group();
    ugGroup.name = 'undergroundRig';
    scene.add(ugGroup);

    const specs = undergroundRig(ug, qid);
    const q = ctx.quality || QUALITY.MEDIUM;

    for (const s of specs) {
      let light;
      if (s.kind === 'spot') {
        light = new THREE.SpotLight(new THREE.Color(s.color).getHex(), s.power, s.dist, s.angle, s.penumbra, 2);
        const tgt = new THREE.Object3D();
        toWorld(s.target[0], s.target[1], s.target[2], tgt.position);
        ugGroup.add(tgt);
        light.target = tgt;
      } else {
        light = new THREE.PointLight(new THREE.Color(s.color).getHex(), s.power, s.dist, 2);
      }
      light.name = s.name;
      /* `inset` stands a point light off the wall its housing hangs on — see
         the festoon note in undergroundRig(). It moves the LIGHT toward the
         centreline only; terrain.js still hangs the housing on `pos`. */
      const px = s.inset ? s.pos[0] - Math.sign(s.pos[0] || 1) * s.inset : s.pos[0];
      toWorld(px, s.pos[1], s.pos[2], light.position);
      // ONE shadow caster. A spot shadow is a full extra scene pass; a second
      // one buys almost nothing in a tube where the key already rakes across
      // every surface the player can see.
      light.castShadow = !!s.shadow && q.shadowMap >= 2048;
      if (light.castShadow) {
        light.shadow.mapSize.set(Math.min(2048, q.shadowMap), Math.min(2048, q.shadowMap));
        light.shadow.camera.near = 0.6;
        light.shadow.camera.far = s.dist;
        light.shadow.bias = -0.0009;
        light.shadow.normalBias = 0.035;
        light.shadow.radius = 3;
      }
      ugGroup.add(light);
      ugLights.push({ light, spec: s, base: s.power });
    }

    /* THE IBL REPLACEMENT. There is no environment to bake, so the "sky" is the
       rock: an ambient term whose colour is the rock's own albedo and whose
       LEVEL is set by how much of the drive is shotcreted. Wet shotcrete is
       grey-white and bounces a lot; raw gneiss bounces almost nothing. The
       hemisphere on top of it is not a sky — it is the fact that in a tube the
       back and the upper walls are closer and brighter than the muck, which
       absorbs, so more indirect light arrives from above than from below. */
    ugAmbient = new THREE.AmbientLight(0xffffff, 0.0);
    ugAmbient.name = 'rockBounce';
    ugGroup.add(ugAmbient);
    ugHemi = new THREE.HemisphereLight(0xffffff, 0x0a0908, 0.0);
    ugHemi.name = 'tubeBounce';
    ugGroup.add(ugHemi);

    /* THE MEDIUM, and only the lights that are worth an inner-loop iteration.

       Every light in the rig used to go into the raymarch, which put 8 lights x
       20 steps = 160 evaluations on every pixel of the band. Three of those 8
       are festoon bulbs and one is the beacon: point sources with no cone, a
       media weight around 0.5, and a contribution that is a small local halo
       the emissive bulb geometry in terrain.js plus the bloom pass already
       draw. They cost 40 % of the shader and add almost nothing.

       So the medium carries the shaft-makers — the two machine floods, the
       canopy wash, the rear light and the cap lamp — plus the NEAREST festoon
       bulb, which is the only one close enough to have a visible halo of its
       own. 6 lights x 13 steps = 78, less than half the old cost. */
    mediaIdx = ugLights
      .map((e, i) => ((e.spec.inMedia === false) ? -1 : i))
      .filter((i) => i >= 0);
    const n = mediaIdx.length;
    mediaUniforms.uLPos.value = Array.from({ length: n }, () => new THREE.Vector3());
    mediaUniforms.uLDir.value = Array.from({ length: n }, () => new THREE.Vector3(0, 0, 1));
    mediaUniforms.uLCol.value = Array.from({ length: n }, () => new THREE.Vector3());
    mediaUniforms.uLCone.value = Array.from({ length: n }, () => new THREE.Vector2(-2, -2));

    mediaMat = new THREE.ShaderMaterial({
      name: 'DrillityDust',
      uniforms: mediaUniforms,
      vertexShader: MEDIA_VERT,
      fragmentShader: MEDIA_FRAG,
      defines: { UG_STEPS, UG_L: n },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,   // the grade pass tone-maps; the target is HalfFloat
    });
    media = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mediaMat);
    media.name = 'airborneDust';
    media.frustumCulled = false;
    media.renderOrder = 995;
    media.userData.noAO = true;      // never let it into the AO normal prepass
    media.matrixAutoUpdate = false;
    scene.add(media);
  }

  function disposeUnderground() {
    if (ugGroup) {
      scene.remove(ugGroup);
      for (const e of ugLights) {
        if (e.light.shadow && e.light.shadow.map) { e.light.shadow.map.dispose(); e.light.shadow.map = null; }
        e.light.dispose && e.light.dispose();
      }
      ugGroup = null;
    }
    ugLights = [];
    ugAmbient = ugHemi = null;
    ugBuiltFor = null;
    if (media) { scene.remove(media); media.geometry.dispose(); media = null; }
    if (mediaMat) { mediaMat.dispose(); mediaMat = null; }
    if (ugEnvRT) { ugEnvRT.dispose(); ugEnvRT = null; }
  }

  /** Everything the sky owns, off — or back on. */
  function setSurfaceVisible(on) {
    if (sky) sky.visible = on;
    clouds.visible = on;
    sun.visible = on;
    rim.visible = on;
    bounce.visible = on;
    hemi.visible = on;
    ambient.visible = on;
    if (precip) precip.visible = on;
    // NB: visibility only. three skips an invisible light entirely, so the
    // surface rig comes back exactly as solve() last left it — nothing here
    // may write to an intensity, a colour or castShadow, or the eight regions
    // would not survive a round trip through a tunnel contract.
  }

  /**
   * The underground look solver. Deliberately shares NOTHING with solve()'s sky
   * path — see the UNDERGROUND note at the top of the file.
   */
  function solveUnderground() {
    const rock = new THREE.Color(REGIONS[regionId] ? REGIONS[regionId].ground : '#6E6A64');
    // The rock the drive is cut in, not the region's topsoil: pull it toward a
    // neutral stone so a green forest floor cannot tint a gneiss wall.
    rock.lerp(_scratchColor.set('#6E6A64'), 0.55);

    /* fog: toward black, not toward a horizon. Underground the far end of a
       drive is genuinely black, so the extinction colour is the unlit air. */
    fogColor.copy(rock).multiplyScalar(0.055);
    if (scene.fog) { scene.fog.color.copy(fogColor); scene.fog.density = ug.fog; }
    else scene.fog = new THREE.FogExp2(fogColor.getHex(), ug.fog);

    /* the rock bounce. shotcreteFrom is metres of raw face-end rock before the
       lining starts, so the shorter it is the more of the drive is grey-white
       and the more indirect light there is. */
    const lined = clamp(1 - ug.shotcreteFrom / Math.max(6, ug.backZ - ug.faceZ) * 2.2, 0.15, 0.85);
    ugAmbient.color.copy(rock).lerp(_scratchColor.set('#C6C3BC'), lined);
    ugHemi.color.copy(rock).lerp(_scratchColor.set('#B9BCC2'), lined * 0.8);
    ugHemi.groundColor.set('#0B0A08');
    /* `ambient` and `hemi` are authored as the RADIANCE the bounce puts on
       rock, the same currency as every light in undergroundRig(), and converted
       here — three adds an ambient straight into the irradiance, and a diffuse
       surface returns albedo/pi of that.

       They were raw three intensities before, and they were doing nothing:
       0.050 x 0.685 = 0.034 irradiance is L = 0.0016 on gneiss, i.e. sRGB 4,
       three stops under the fog floor. What was actually lighting the drive was
       a festoon point light 0.2 m off the wall, which is why removing that
       hotspot took the longhole band from mean L148 to L17. A tube DOES bounce
       — the walls are close, they face each other, and near a work light the
       inter-reflection is a real and visible term — so it is now a real and
       visible term, and it is the ONLY thing lighting rock no lamp points at.

       The `lined` factor stays: it is the physical part. Wet shotcrete is
       grey-white and bounces; raw gneiss barely does. */
    const toIrr = Math.PI / ROCK_ALBEDO;
    ugAmbient.intensity = ug.ambient * toIrr * (0.55 + 0.9 * lined);
    ugHemi.intensity = ug.hemi * toIrr * (0.6 + 0.8 * lined);

    for (const e of ugLights) {
      e.light.intensity = e.base;
      e.light.color.set(e.spec.color);
    }

    const d = ug.dust;
    mediaUniforms.uDust.value.set(d.base, d.face, d.sigma, mediaOn ? 1 : 0);
    mediaUniforms.uFaceZ.value = ug.faceZ;
    /* THE ENVELOPE, and why it is padded so far past the rock.

       The medium is drawn depth-test-off, so it has no idea where the rock is;
       what bounds the integral is this box. A box that hugs the drive therefore
       draws its OWN silhouette into the dust — a ray toward the upper corner
       passes through solid rock (which the medium cannot see), reaches the box
       wall and stops, while its neighbour runs the full length of the tube. The
       step between them is a straight line in screen space, and at +1 m of
       slack that line landed inside the frame: an axis-aligned L-shaped edge
       across the upper left of shots/qf-tunnel-jumbo-band.png.

       Padding it to 8 m puts every edge of the box outside the frustum for
       anything nearer than the fog. The medium it adds is behind rock and
       therefore over rock, which is what aerial perspective in a dusty drive
       does anyway — uniform haze is the truth; an edge in the haze is a bug. */
    mediaUniforms.uBoxMin.value.set(-ug.width * 0.5 - 8, -3.0, ug.faceZ - 8);
    mediaUniforms.uBoxMax.value.set(ug.width * 0.5 + 8, ug.height + 8, ug.backZ + 4);
    // the machine. Sized off the drive rather than off rigFactory, which this
    // agent does not own: an underground rig is built to fill its drive.
    /* Only the machine's DENSE CORE — the carrier body and the boom stack, not
       its bounding box. An occluder larger than the thing it stands for hides
       dust that should be there, and every metre of it that misses the
       silhouette is a metre of visible edge in the haze. */
    const mw = Math.min(2.3, ug.width * 0.23), mh = Math.min(2.7, ug.height * 0.36);
    mediaUniforms.uOccMin.value.set(-mw, 0, ug.faceZ + 1.2);
    mediaUniforms.uOccMax.value.set(mw, mh, 6.2);

    /* no sky-derived PMREM. A dark, rock-coloured environment so that painted
       steel and chrome have SOMETHING to reflect — a clearcoat with no
       environment is matte enamel, which is the exact failure the round-2 note
       above records on the surface. */
    if (!ugEnvRT && gl) {
      try {
        if (!pmrem) pmrem = new THREE.PMREMGenerator(gl);
        const s = new THREE.Scene();
        const g = new THREE.SphereGeometry(10, 16, 10);
        const m = new THREE.ShaderMaterial({
          side: THREE.BackSide, depthWrite: false, fog: false,
          uniforms: { uRock: { value: rock.clone() } },
          vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
          fragmentShader: `varying vec3 vP; uniform vec3 uRock;
            void main(){
              float up = clamp( vP.y * 0.1 + 0.5, 0.0, 1.0 );
              vec3 c = uRock * mix( 0.05, 0.42, up );
              c += vec3( 0.9, 0.95, 1.0 ) * pow( clamp( -vP.z * 0.1, 0.0, 1.0 ), 6.0 ) * 0.5;
              gl_FragColor = vec4( c, 1.0 );
            }`,
        });
        const sph = new THREE.Mesh(g, m);
        s.add(sph);
        ugEnvRT = pmrem.fromScene(s, 0, 0.1, 40);
        g.dispose(); m.dispose();
      } catch (e) { warnOnce('underground PMREM unavailable.', e); }
    }
    scene.environment = ugEnvRT ? ugEnvRT.texture : null;
    scene.environmentIntensity = ug.env;

    /* the grade. Darker, higher-contrast, more vignette — "darkness closing in
       at the edges" is the composition the research brief asks for — and more
       bloom, because the lamps and the beams are the only bright things in the
       frame and they are supposed to bleed. */
    if (ctx.renderer && ctx.renderer.setGrade) {
      ctx.renderer.setGrade({
        /* 0.62 -> 0.85. The whole rig is now SOLVED against a value ladder
           (undergroundRig()), so the exposure has one job: land the top of that
           ladder where it was designed to land. The work is authored at linear
           0.55; 0.55 x 0.85 through ACES and the sRGB encode is 168, which is
           the "held sRGB 170-190" the key was solved for, and 0.62 put it at
           149. The mid walls follow to 84 and the far end to 19. */
        exposure: 0.85,
        saturation: 1.12,
        split: 0.34,
        /* 0.62 -> 0.46. "Darkness closing in at the edges" is the composition
           research/04 E3 asks for, but the measured jumbo frame had 52 % of the
           band below L16 and the vignette was compounding a value problem it
           did not cause. With the wash and the bounce carrying the near walls,
           the corners are dark because nothing lights them - which is the
           honest version of the same picture. */
        vignette: 0.46,
        grain: 0.052,
        seamStrength: 0.10,
        /* 0.46 -> 0.32. The lamps and the beams are the only bright things in
           the frame and they are supposed to bleed — but at 0.46 a work light
           seen through dust bloomed into a white field over a sixth of the
           band and took the machine with it. */
        bloom: 0.32,
        shadowTint: [0.88, 0.93, 1.06],
      });
    }
  }

  function updateUnderground(dt, state) {
    const cam = ctx.camera;
    mediaUniforms.uTime.value = time;
    mediaUniforms.uDust.value.w = mediaOn ? 1 : 0;

    /* The medium is one clip-space quad — see MEDIA_VERT. All it needs per
       frame is the inverse view-projection, so the shader can unproject each
       fragment back to a world ray. Nothing here depends on fov or aspect, and
       that is the entire point: the renderer changes both, after this runs. */
    if (media && cam) {
      cam.updateMatrixWorld();
      _invVP.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse).invert();
      mediaUniforms.uInvVP.value.copy(_invVP);
    }

    /* the drilling drives the rig: percussion makes the floods shake a little
       and the dust thicken, exactly as it does on the surface */
    const d = (state && state.drill) || {};
    const act = d.active ? 1 : 0;
    flick = damp(flick, act * (0.45 + 0.5 * clamp(d.rpm || 0)), 5, dt);
    const shake = 1 + Math.sin(time * 37.1) * 0.022 * flick + Math.sin(time * 13.3) * 0.014;
    mediaUniforms.uDust.value.x = ug.dust.base * (1 + 0.55 * flick);

    capPhase += dt * 0.55;

    /* THE MACHINE'S OWN LAMPS.
       rigFactory.js creates no THREE.Light at all — every photon in the drive
       is env.js's — but it does publish the lamp housings as live nodes, each
       with an `aim` empty one metre down its own +Z. Riding them is what makes
       the beam leave the housing instead of empty air, and because the nodes
       hang off a boom or a cradle the beam SWEEPS as the machine works: the
       jumbo's boom-1 lamp travels 0.70 m walking the pattern, the longhole
       cradle's 1.37 m round a ring. That motion is most of why underground
       footage looks the way it does, so it is read every frame rather than
       sampled once. */
    if (workLights === null && ctx.rig && typeof ctx.rig.getWorkLights === 'function') {
      try { workLights = ctx.rig.getWorkLights() || []; } catch (e) { workLights = []; }
    }
    const wl = workLights || [];

    const n = ugLights.length;
    for (let i = 0; i < n; i++) {
      const e = ugLights[i];
      const l = e.light;
      /* Bind by NAME, fall back to the ordinal. A jumbo publishes
         `boom-1-work-light` and `boom-2-work-light`; a longhole rig publishes
         one `cradle-work-light`; a bolter one `feed-work-light`. When the
         machine standing in the drive is a stand-in for another (data.js hands
         `rockbolt` a `tunnel-jumbo` today) the name misses and the ordinal
         still puts the beam on a real boom rather than in empty air. */
      let src = null;
      if (e.spec.follow) src = wl.find((k) => k && k.name === e.spec.follow) || null;
      if (!src && e.spec.followAt != null) src = wl[e.spec.followAt] || null;
      if (src && src.node && src.aim) {
        src.node.getWorldPosition(l.position);
        src.aim.getWorldPosition(l.target.position);
        l.target.updateMatrixWorld();
        // the machine's statement about its own lamp, taken as read
        if (src.coneDeg) l.angle = THREE.MathUtils.degToRad(src.coneDeg) * 0.5;
        if (src.rangeM) l.distance = src.rangeM * 1.8;
        /* colourHex and wattHint are the machine's statement too. A jumbo's
           boom lamps are 70 W warm white, a bolter's feed lamp 50 W — that is a
           real difference between the machines and it costs one multiply. The
           power stays SOLVED (see cd()); wattHint only trims between lamps that
           the same machine carries. */
        if (src.colourHex) l.color.setHex(src.colourHex);
        e.watt = src.wattHint ? clamp(src.wattHint / 70, 0.45, 1.6) : 1;
      } else {
        e.watt = 1;
      }
      if (e.spec.cap) {
        // a cap lamp on a crew member: a slow pan and a slow walk, so there is
        // always something moving in a frame that is otherwise machinery
        const s = Math.sin(capPhase), c2 = Math.cos(capPhase * 0.61);
        toWorld(e.spec.pos[0] + s * 0.9, e.spec.pos[1] + Math.sin(capPhase * 2.3) * 0.05,
          e.spec.pos[2] + c2 * 2.6, l.position);
        toWorld(e.spec.target[0] + s * 2.4, e.spec.target[1], e.spec.target[2] + c2 * 1.4, l.target.position);
        l.target.updateMatrixWorld();
      }
      // sodium festoon hum, a rotating beacon, and a machine flood that
      // trembles under percussion
      let f;
      if (e.spec.beacon) {
        // a rotator sweeps: two lobes per turn, ~1.4 Hz, never fully off
        const s = Math.sin(time * 8.8);
        f = 0.18 + 0.82 * Math.pow(Math.max(0, s), 3);
      } else if (e.spec.kind === 'point') {
        f = 1 + Math.sin(time * 9.7 + i * 2.1) * 0.035;
      } else {
        f = shake;
      }
      l.intensity = e.base * f * (e.watt || 1);

      const slot = mediaIdx.indexOf(i);
      if (slot < 0) continue;          // not integrated by the medium
      const P = mediaUniforms.uLPos.value[slot];
      const D = mediaUniforms.uLDir.value[slot];
      const C = mediaUniforms.uLCol.value[slot];
      const K = mediaUniforms.uLCone.value[slot];
      l.getWorldPosition(P);
      if (e.spec.kind === 'spot') {
        l.target.getWorldPosition(_lt);
        D.copy(_lt).sub(P).normalize();
        /* three's SpotLight falls off from `angle*(1-penumbra)` to `angle`,
           and the medium used to copy that with a 0.85 weight — so on the key
           (angle 0.47, penumbra 0.52) the transition ran from 0.26 to 0.47 rad
           and the "edge" of the beam was 12 degrees wide. A shaft is read as
           an edge: the line between lit air and unlit air. At 12 degrees there
           is no line, and that is a second, independent reason the round-3
           frames measured as haze.

           0.32 puts the transition at 0.39-0.47 rad — a 4.6-degree shoulder,
           which is about what a real luminaire's reflector cut-off gives. The
           LIGHT itself keeps three's own penumbra for the surfaces it lands
           on; only the medium's idea of the cone is sharpened, because a soft
           edge on rock is correct and a soft edge in air is not. */
        K.set(Math.cos(l.angle), Math.cos(l.angle * (1 - l.penumbra * 0.32)));
      } else {
        K.set(-2, -2);
      }
      /* Colour x power, scaled so the medium reads as a fraction of the direct
         light rather than competing with it. The constant is the scattering
         albedo of the dust folded together with the 1/4pi in the phase function
         normalisation; it is set by measurement, not derived.

         `media` is a WEIGHT now, not a flag. A real fixture is not a point: a
         300 mm reflector throwing a beam has a cross-section, and single
         scattering off an idealised point badly under-integrates the near
         field, which is exactly the stretch of beam the camera is looking
         along. So the lights whose JOB is to be a visible shaft carry more of
         the medium than the lights whose job is to put value on rock. The rear
         work light is 3.2 because it is the only beam pointed at the camera and
         the Henyey-Greenstein peak is aimed straight down the lens. */
      /* ── AXIAL DE-WEIGHTING, AND IT IS AN AUTHORING RULE, NOT PHYSICS ────
         (declared, per HANDOFF §9.3 — every visual exaggeration is named.)

         The round-4 split of the integral fixed longhole (coverage 50.6 % ->
         30.9 %, p95/p50 13.9 -> 90) and rockbolt (24.0 % -> 29.9 %, 51 ->
         151), and did almost nothing for the jumbo (74.3 % -> 68.5 %, 4.0 ->
         3.4). The reason is geometry, and the same geometry the round-3 note
         already worked out for `ugRear`: YOU CANNOT SEE A BEAM YOU ARE LOOKING
         ALONG. The jumbo's key and fill are aimed at the face, i.e. straight
         away down the drive, and the camera stands behind the machine looking
         the same way — so those two cones project as large discs filling the
         centre of the frame. Every sample inside them is lit, none of them
         has an edge in view, and the result is a veil by construction. In the
         5.0 m and 5.6 m drives the key is aimed at the ring or at the back,
         i.e. ACROSS the view, so the same lights make shafts there.

         So the medium's budget follows the geometry: `axial` is how nearly the
         beam runs down the lens axis, and a beam that does carries a third of
         its weight. It is not a physical term — the energy is real either way
         — but the `media` weight was never physical (its own note says it is
         "set by measurement, not derived"), and this makes it respond to the
         one variable that decides whether the energy can be SEEN as a shaft.
         It is computed per frame, so it stays correct as the boom sweeps and
         as the camera moves, and it needs no per-variant authoring. */
      let axialK = 1;
      if (e.spec.kind === 'spot' && cam) {
        cam.getWorldDirection(_fwd);
        const axial = Math.abs(D.dot(_fwd));
        axialK = 1 - 0.65 * sstep(0.72, 0.96, axial);
      }
      C.set(l.color.r, l.color.g, l.color.b)
        .multiplyScalar(l.intensity * 0.00085 * (e.spec.media || 1) * axialK);
    }
  }

  /* ── IBL ────────────────────────────────────────────────────────────── */
  let pmrem = null;
  let envRT = null;
  let iblDirty = true;
  let iblCooldown = 0;
  let iblElev = -999;

  function regenerateIBL() {
    if (ugId) return;                 // the rock is the environment underground
    if (!gl || !envScene || !skyIBL) return;
    try {
      if (!pmrem) pmrem = new THREE.PMREMGenerator(gl);
      const next = pmrem.fromScene(envScene, 0, 0.1, 1000);
      if (envRT) envRT.dispose();
      envRT = next;
      scene.environment = envRT.texture;
      scene.environmentIntensity = recipe.envIntensity * lerp(0.35, 1, dayFactor);
      sectionScene.environment = envRT.texture;
      sectionScene.environmentIntensity = 0.32 * SECTION_GAIN;
      iblElev = elevation;
    } catch (e) {
      warnOnce('PMREM environment map unavailable.', e);
      envScene = null;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     The look solver — one function, run whenever anything changes.
     ═══════════════════════════════════════════════════════════════════════ */
  function solve() {
    /* Underground bypasses the sky solver entirely — it does not dim it, does
       not reuse its recipe and does not write to any of its lights. */
    if (ugId) { solveUnderground(); return; }

    /* ── sun geometry ─────────────────────────────────────────────────── */
    const s = Math.sin(Math.PI * (tod - 0.25) / 0.5);
    const sign = s < 0 ? -1 : 1;
    elevation = Math.max(-16, recipe.sunPeak * sign * Math.pow(Math.abs(s), 1.8));
    const azimuth = recipe.azimuth + (tod - 0.34) * 165;

    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    sunDir.setFromSphericalCoords(1, phi, theta).normalize();

    dayFactor = sstep(-7, 9, elevation);
    const golden = 1 - sstep(3, 22, elevation);   // 1 = sun on the horizon

    rampColor(SUN_RAMP, elevation, sunColor);

    /* ── sky ──────────────────────────────────────────────────────────── */
    if (sky) {
      const u = sky.material.uniforms;
      u.turbidity.value = recipe.turbidity * weather.turbidity;
      u.rayleigh.value = recipe.rayleigh * lerp(0.55, 1, dayFactor);
      u.mieCoefficient.value = recipe.mie * weather.mie;
      u.mieDirectionalG.value = recipe.mieG;
      u.sunPosition.value.copy(sunDir);
      if (skyIBL) {
        const v = skyIBL.material.uniforms;
        v.turbidity.value = u.turbidity.value;
        v.rayleigh.value = u.rayleigh.value;
        v.mieCoefficient.value = u.mieCoefficient.value;
        v.mieDirectionalG.value = u.mieDirectionalG.value;
        v.sunPosition.value.copy(sunDir);
      }
    }

    /* ── fog: matched to the horizon so it dissolves correctly ────────── */
    fogColor.set(recipe.fog);
    fogColor.lerp(_scratchColor.copy(sunColor), golden * 0.42);
    fogColor.multiplyScalar(lerp(0.16, 1, dayFactor));
    const density = recipe.fogDensity * weather.fog * lerp(1.7, 1, dayFactor);
    if (scene.fog) {
      scene.fog.color.copy(fogColor);
      scene.fog.density = density;
    } else {
      scene.fog = new THREE.FogExp2(fogColor.getHex(), density);
    }
    if (!sky && scene.background && scene.background.isColor) {
      scene.background.copy(fogColor);
    }

    /* ── key sun ──────────────────────────────────────────────────────── */
    const sunPower = recipe.sunIntensity * weather.sun * dayFactor;
    sun.color.copy(sunColor);
    sun.intensity = sunPower;
    sun.castShadow = sunPower > 0.12;
    sun.position.copy(sunDir).multiplyScalar(60).add(shadowFocus);
    sun.target.position.copy(shadowFocus);
    sun.target.updateMatrixWorld();

    /* ── hemisphere fill ──────────────────────────────────────────────── */
    hemiSky.set(recipe.skyTint).lerp(_scratchColor.copy(sunColor), golden * 0.30);
    hemiGround.set(recipe.ground);
    hemi.color.copy(hemiSky);
    hemi.groundColor.copy(hemiGround);
    hemi.intensity = recipe.hemi * weather.hemi * lerp(0.20, 1, dayFactor);

    /* ── cool rim opposite the sun, so silhouettes cut off the sky ────── */
    rimColor.set(recipe.rim);
    rim.color.copy(rimColor);
    rim.intensity = recipe.rimIntensity * lerp(0.35, 1, dayFactor) * lerp(1, 0.55, golden);
    rim.position.set(-sunDir.x, 0.42, -sunDir.z).normalize().multiplyScalar(40);
    rim.target.position.set(0, 1.6, 0);
    rim.target.updateMatrixWorld();

    /* ── ground bounce ────────────────────────────────────────────────── */
    bounce.color.copy(hemiGround).lerp(_scratchColor.copy(sunColor), 0.35);
    bounce.intensity = recipe.bounce * weather.sun * dayFactor;
    // light coming back UP off the ground, tinted by whatever the ground is
    bounce.position.set(sunDir.x * 0.35, -1, sunDir.z * 0.35).normalize().multiplyScalar(26);
    bounce.target.position.set(0, 1.6, 0);
    bounce.target.updateMatrixWorld();

    // 0.14 -> 0.06 / 0.05 -> 0.015. A flat ambient term is the one light that
    // cannot be shadowed, so it sets the floor of the whole value range: at
    // 0.14 nothing in the frame could reach true black (measured: not one
    // pixel below L 16). It is now a whisper that keeps deep shadow from
    // reading as a hole, and the hemisphere does the honest sky fill.
    ambient.intensity = lerp(0.06, 0.015, dayFactor);

    /* ── clouds ───────────────────────────────────────────────────────── */
    const c = recipe.cloud;
    cloudUniforms.uScale.value = c.scale;
    cloudUniforms.uHeight.value = c.height;
    // uCoverage is the fbm THRESHOLD — higher threshold = less cloud
    cloudUniforms.uCoverage.value =
      clamp(0.85 - c.coverage * 0.55 * weather.cloud + FBM_BIAS, 0.28, 0.86);
    // The clear-sky opacities came down ~2x in round 2 to unmask the sky, and
    // opacity was the only cloud term weather never touched — so rain, which
    // used to hit the 0.28 threshold clamp and lay a solid lid, would have
    // been left with a 48 %-alpha veil and stopped reading as rain. weather
    // now drives density as well as extent, normalised so `clear` (cloud 1.00)
    // is exactly the authored value and only the sunless states thicken:
    // fog x1.18, overcast x1.38, snow x1.43, rain x1.54.
    cloudUniforms.uOpacity.value =
      clamp(c.opacity * (0.55 + 0.45 * weather.cloud) * lerp(0.55, 1, dayFactor), 0, 1);
    cloudUniforms.uSunCol.value.copy(sunColor);
    // 1.25 -> 1.90 at full day. The lit top of the deck is the brightest thing
    // in the frame that is not a specular, and it took the whole 1.08-stop cut
    // uncompensated: measured 110 at the top of the surface band. It is also
    // what has to punch through the halved opacity above - a 48 %-alpha cloud
    // over a blue sky only reads as cloud if its lit face is well clear of the
    // sky behind it. 1.90 x the 0.4836 working exposure is ~0.92 linear, which
    // ACES + the S-curve land at ~224 sRGB: a held highlight, not a clip
    // (measured 0.000 % above 250 must stay 0.000 %). The night end goes
    // 0.25 -> 0.30 only so the deck does not vanish before dayFactor does.
    cloudUniforms.uLitCol.value.copy(sunColor)
      .lerp(_scratchColor.set('#FFFFFF'), 0.35)
      .multiplyScalar(lerp(0.30, 1.90, dayFactor));
    // shadow base held at 0.62 while the lit face went up 52 %: that widens
    // the deck's own internal value range, which is what gives a cloud form.
    cloudUniforms.uShadowCol.value.copy(hemiSky)
      .lerp(_scratchColor.copy(sunColor), golden * 0.35)
      .multiplyScalar(lerp(0.12, 0.62, dayFactor));
    cloudUniforms.uHorizonCol.value.copy(fogColor);
    cloudUniforms.uDay.value = lerp(0.2, 1, dayFactor);

    /* ── precipitation ────────────────────────────────────────────────── */
    if (weather.precip !== precipKind) buildPrecip(weather.precip);
    if (precip) {
      precip.material.uniforms.uTint.value
        .copy(sunColor)
        .lerp(_scratchColor.copy(hemiSky), 0.45)
        .multiplyScalar(lerp(0.35, 1.15, dayFactor));
      precip.material.uniforms.uWind.value =
        (precipKind === 'snow' ? 1.1 : 3.0) * weather.wind;
    }

    /* ── section rig: match the surface warmth but stay readable ──────── */
    secKey.color.copy(_scratchColor.set('#DDE7F0')).lerp(sunColor, 0.25 + golden * 0.20);
    secKey.intensity = 1.45 * SECTION_GAIN;
    secFill.color.set('#7C98B6');
    secHemi.color.copy(hemiSky);
    secHemi.intensity = 0.60 * SECTION_GAIN;

    backdropMat.uniforms.uGlow.value.copy(_scratchColor.set(BRAND.amber));

    /* ── grade mood ───────────────────────────────────────────────────── */
    const g = recipe.grade;
    if (ctx.renderer && ctx.renderer.setGrade) {
      ctx.renderer.setGrade({
        // Base 1.05 -> 0.56. ACES was eating the palette on its shoulder: the
        // rig deck measured 228/217/185 sRGB (max 253) and BRAND.amber, which
        // is authored with an R-B of 141, rendered with an R-B of 43 - 70 % of
        // the chroma gone, and with it every bit of orange peel, chipped paint,
        // primer and rust assets.js puts on paintedSteel. 0.56 x the region's
        // own 0.82-0.96 is ~1.08 stops down, targeting the deck at 180-200
        // sRGB. The art director asked for ~1.2; the remaining ~0.15 arrives
        // from the fill cut above and the bloom-veil removal in renderer.js,
        // which together take roughly another 0.4 stop off a lit surface.
        //
        // ROUND 2 DELIBERATELY DID NOT TOUCH THIS NUMBER. The band came back
        // under-filled (p95 172-180, p99 189-191, then a 60-step dead gap to
        // max; lit deck 143 against a 180-200 target) and this is the one
        // knob that must not be used to fix it - it lifts the shadows with
        // the highlights and would undo the true blacks and the cast shadows
        // round 1 bought. The top end is recovered instead by things that
        // only brighten what is already lit: SUN_RAMP (+16 % on sunlit
        // surfaces), envIntensity 0.45 -> ~0.62, cloud uLitCol x 1.52, and
        // uHighTint's +9.3 % in renderer.js. If the re-shoot is STILL short,
        // the next lever is recipe.sunIntensity - raising the key increases
        // key dominance rather than undoing it - and this stays where it is.
        exposure: 0.56 * recipe.exposure * weather.exposure * lerp(1.28, 1, dayFactor),
        saturation: g.saturation * weather.sat,
        split: g.split,
        vignette: g.vignette + (weatherName === 'rain' || weatherName === 'fog' ? 0.08 : 0),
        grain: weatherName === 'rain' ? 0.042 : 0.030,
        // Seam: this used to evaluate to 0.50 at the shipped tod and, with the
        // old 24 px falloff, injected R-B +36.6 into the bottom ~120 px of the
        // surface band (the same ground higher up measures R-B -0.9) and
        // bathed 26 % of the SECTION band in amber, destroying the geology
        // read. It is a drawn ground line, not a light source.
        seamStrength: lerp(0.30, 0.22, dayFactor),
        // Bloom runs BEFORE the grade, i.e. on pre-tonemap linear where every
        // sunlit surface sits at 1.8-2.6, so the old 0.82 threshold bloomed
        // the whole lit frame. Threshold/radius live in renderer.js buildPost.
        bloom: weatherName === 'rain' || weatherName === 'overcast' ? 0.26 : 0.30,
        // Opened up with the grade's cool band in renderer.js. Measured: the
        // rig's lit face, shadow face, deck top and canopy leg all read the
        // same hue 30.9-31.4 deg - saturation fell 0.672 -> 0.548 into shadow
        // but the hue did not move, which is a NEUTRAL fill, not a cool one.
        // The re-centred ramp there now hands the shadow face 0.93 of shade
        // instead of 0.55; this widens what that 0.93 is multiplying, so the
        // shadow side finally separates from the sunlit side by hue and not
        // only by value. Deep darks are unaffected - a tint is a multiply, and
        // round 1's true blacks (min 0.0) stay at 0.0.
        shadowTint: weatherName === 'rain'
          ? [0.76, 0.88, 1.20]
          : [0.82, 0.93, 1.14],
      });
    }

    /* ── IBL ──────────────────────────────────────────────────────────── */
    if (Math.abs(elevation - iblElev) > 0.4) iblDirty = true;
    if (scene.environment) {
      scene.environmentIntensity = recipe.envIntensity * lerp(0.35, 1, dayFactor);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     Frame update
     ═══════════════════════════════════════════════════════════════════════ */
  const camPos = new THREE.Vector3();
  let bitPulse = 0;
  let smoothDepth = 0;

  /**
   * env mirrors state.world every frame, so an imperative setter has to write
   * its value back or the next update() would immediately revert it.
   */
  function writeBack(key, value) {
    const w = ctx.state && ctx.state.world;
    if (w) w[key] = value;
  }

  function updateSectionLights(dt, state) {
    const d = (state && state.drill) || {};
    const depth = d.depth || 0;

    /* Where the bit actually IS in section-world space.
       world/geology.js publishes ctx.sectionView and scrolls its own root
       group, so the bit sits at (root.y − depth); with no such owner the
       renderer scrolls the camera instead and the bit sits at −depth.
       Depth is damped with geology's own lambda so the glow never leads it. */
    const sv = ctx.sectionView;
    const rootY = (sv && sv.root && sv.root.position) ? sv.root.position.y : 0;
    const upm = (sv && sv.unitsPerMetre) || 1;
    const holeX = (sv && typeof sv.holeX === 'number') ? sv.holeX : 0;

    smoothDepth = damp(smoothDepth, depth, 9, dt);
    const y = rootY - smoothDepth * upm;

    bitLight.position.set(holeX, y + 0.15, 1.7);
    bitHot.position.set(holeX, y - 0.05, 0.6);

    const active = d.active ? 1 : 0;
    const heat = clamp(d.heat || 0);
    const rpm = clamp(d.rpm || 0);
    const groove = d.inGreenBand ? 1 : 0;

    bitPulse = damp(bitPulse, active * (0.45 + 0.35 * rpm + 0.30 * groove + 0.25 * heat), 6, dt);
    const flicker = 1 + Math.sin(time * 41.3) * 0.06 + Math.sin(time * 17.7) * 0.04;

    bitLight.intensity = (0.85 + 3.4 * bitPulse) * flicker;
    bitHot.intensity = (0.25 + 2.6 * bitPulse) * flicker;
    bitLight.color.copy(_amberCold).lerp(_amberHot, clamp(heat * 0.8 + groove * 0.3));

    backdropMat.uniforms.uGlowAmount.value = 0.14 + 0.30 * bitPulse;

    // the backdrop rides with the section camera and matches its frustum
    const cam = ctx.sectionCamera;
    if (cam) {
      const vw = Math.max(1e-3, cam.right - cam.left) * 1.15;
      const vh = Math.max(1e-3, cam.top - cam.bottom) * 1.15;
      backdrop.position.set(0, cam.position.y, -60);
      backdrop.scale.set(vw, vh, 1);
      backdropMat.uniforms.uGlowY.value = clamp(0.5 + (y - cam.position.y) / vh, -0.6, 1.6);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     Public API
     ═══════════════════════════════════════════════════════════════════════ */
  const api = {
    /* live handles the rest of the game may read (never mutate) */
    sun,
    hemi,
    rim,
    sky,
    clouds,
    sunDirection: sunDir,
    get envMap() { return envRT ? envRT.texture : null; },
    get regionId() { return regionId; },
    get weather() { return weatherName; },
    get timeOfDay() { return tod; },
    get sunElevation() { return elevation; },
    get sunColor() { return sunColor; },
    get fogColor() { return fogColor; },
    get dayFactor() { return dayFactor; },
    REGIONS,

    async init() {
      const w = (ctx.state && ctx.state.world) || {};
      // 0.34 is the game's signature morning; honour an explicit override.
      if (typeof w.timeOfDay === 'number' && Math.abs(w.timeOfDay - 0.35) < 1e-6) {
        w.timeOfDay = 0.34;
      }
      regionId = REGIONS[w.regionId] ? w.regionId : DEFAULT_REGION;
      recipe = REGIONS[regionId];
      weatherName = WEATHER[w.weather] ? w.weather : 'clear';
      weather = WEATHER[weatherName];
      tod = typeof w.timeOfDay === 'number' ? w.timeOfDay : 0.34;

      solve();
      regenerateIBL();
      iblDirty = false;

      ctx.bus.on(EVENTS.REGION_CHANGE, (p) => { if (p && p.regionId) api.setRegion(p.regionId); });
      ctx.bus.on(EVENTS.QUALITY_CHANGE, () => {
        const q = ctx.quality || QUALITY.MEDIUM;
        sun.shadow.mapSize.set(q.shadowMap, q.shadowMap);
        sun.shadow.normalBias = q.shadowMap >= 2048 ? 0.028 : 0.055;   // see above
        if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
        if (precipKind) buildPrecip(precipKind);
      });
      ctx.bus.on(EVENTS.BIT_IMPACT, (p) => {
        bitPulse = clamp(bitPulse + 0.22 * (p && p.intensity != null ? p.intensity : 0.5), 0, 1.6);
      });
      ctx.bus.on(EVENTS.WATER_STRIKE, () => { bitPulse = clamp(bitPulse + 0.3, 0, 1.6); });

      /* Underground follows the METHOD, and update() is the ONLY thing that
         acts on it. Events merely park a value here.

         That single-writer rule is not tidiness. EVENTS.RIG_CHANGE carries the
         GARAGE rig's first method (progression.js emits `methodId:
         getRig(state.garage.rigId).methods[0]`), which for a stock crawler is
         `top-hammer` — so a handler that switched on it would fight the
         contract's `tunnel-jumbo` frame by frame, and each round trip rebuilds
         a light rig, a PMREM and (in terrain.js) an entire site. Measured: that
         loop takes a headless tab down inside three seconds. */
      ctx.bus.on(EVENTS.DRILL_START, (p) => { if (p && p.methodId !== undefined) pendingMethod = p.methodId; });
      ctx.bus.on(EVENTS.CONTRACT_ACCEPT, (p) => {
        const m = p && p.contract && p.contract.methodId;
        if (m !== undefined) pendingMethod = m;
      });
      // the work-light array identity is per rig build, so drop the cache on a
      // rig change and re-read it lazily. This handler must NOT switch mode —
      // see the single-writer note above.
      ctx.bus.on(EVENTS.RIG_CHANGE, () => { workLights = null; });
      const s0 = ctx.state && ctx.state.world && ctx.state.world.site;
      const m0 = (ctx.state && ctx.state.contract && ctx.state.contract.methodId)
        || (s0 && s0.methodId) || null;
      if (UNDERGROUND[m0]) api.setUnderground(m0);
    },

    update(dt, state) {
      time += dt;

      /* The method decides whether there is a sky at all, and this poll is the
         ONLY writer of it (see init()).

         IT READS state.world.site, NOT state.contract. progression.js clears
         the contract at settlement from inside the HOLE_COMPLETE dispatch, so
         on the eight single-unit methods it is null for the whole results
         screen while the drive is still on screen behind it. Reading the
         contract put `mid = null` one frame after the last hole finished,
         which is setUnderground(null): the light rig, the ambient, the
         hemisphere and the participating medium are all disposed and THE SKY
         COMES BACK ON INSIDE THE ROCK. `state.world.site` carries the same
         methodId and is never cleared by settlement.

         With every source null, HOLD — `|| ugId` — because the site on screen
         has not changed just because nothing is describing it this frame.
         audio.js already does exactly this and is the only consumer that has
         ever survived a settlement intact. */
      const w0 = (state && state.world && state.world.site) || null;
      const mid = (state && state.contract && state.contract.methodId)
        || (w0 && w0.methodId) || pendingMethod || ugId;
      const wantUg = UNDERGROUND[mid] ? mid : null;
      if (wantUg !== ugId) api.setUnderground(wantUg);

      /* follow the game state without the game having to call us */
      const w = (state && state.world) || null;
      if (w) {
        if (w.regionId && w.regionId !== regionId && REGIONS[w.regionId]) api.setRegion(w.regionId);
        if (typeof w.timeOfDay === 'number' && Math.abs(w.timeOfDay - tod) > 1e-4) api.setTimeOfDay(w.timeOfDay);
        if (w.weather && w.weather !== weatherName && WEATHER[w.weather]) api.setWeather(w.weather);
      }

      if (ugId) {
        updateUnderground(dt, state);
        updateSectionLights(dt, state);
        return;
      }

      /* clouds drift and stay centred on the viewer */
      const cam = ctx.camera;
      if (cam) {
        camPos.setFromMatrixPosition(cam.matrixWorld);
        clouds.position.copy(camPos);
        if (sky) sky.position.set(camPos.x, 0, camPos.z);
        if (precip) precip.position.set(camPos.x, camPos.y - PRECIP_BOX.h * 0.5, camPos.z);
      }
      // c.speed is metres/second of real cloud motion; ×8 for game legibility
      const c = recipe.cloud;
      const windScale = c.speed * c.scale * (0.6 + weather.wind * 0.4);
      cloudUniforms.uDrift.value.x += dt * windScale * 8.0;
      cloudUniforms.uDrift.value.y += dt * windScale * 2.5;

      if (precip) precip.material.uniforms.uTime.value = time;

      updateSectionLights(dt, state);

      /* throttled IBL bake */
      iblCooldown -= dt;
      if (iblDirty && iblCooldown <= 0) {
        iblDirty = false;
        iblCooldown = 0.4;
        regenerateIBL();
      }
    },

    resize() { /* nothing resolution-dependent lives here */ },

    dispose() {
      disposePrecip();
      disposeUnderground();
      scene.remove(sun, sun.target, hemi, rim, bounce, ambient);
      if (sky) { scene.remove(sky); sky.material.dispose(); sky.geometry.dispose(); }
      if (skyIBL) { skyIBL.material.dispose(); skyIBL.geometry.dispose(); }
      scene.remove(clouds);
      clouds.geometry.dispose();
      cloudMat.dispose();
      sectionScene.remove(secKey, secKey.target, secFill, secFill.target, secHemi, secAmbient, bitLight, bitHot, backdrop);
      backdrop.geometry.dispose();
      backdropMat.dispose();
      if (envRT) { envRT.dispose(); envRT = null; }
      if (pmrem) { pmrem.dispose(); pmrem = null; }
      scene.environment = null;
      sectionScene.environment = null;
      scene.fog = null;
    },

    /* ── art direction ──────────────────────────────────────────────── */
    setRegion(id) {
      if (!REGIONS[id] || id === regionId) return;
      regionId = id;
      recipe = REGIONS[id];
      writeBack('regionId', id);
      iblDirty = true;
      iblElev = -999;
      // underground the region survives as one thing only: the rock's colour.
      // The bake keys on it, so it has to go.
      if (ugId && ugEnvRT) { ugEnvRT.dispose(); ugEnvRT = null; }
      solve();
    },

    /** t in 0..1 — 0 = midnight, 0.25 sunrise, 0.5 noon, 0.75 sunset. */
    setTimeOfDay(t01) {
      const t = ((t01 % 1) + 1) % 1;
      if (Math.abs(t - tod) < 1e-5) return;
      tod = t;
      writeBack('timeOfDay', t);
      solve();
    },

    setWeather(name) {
      if (!WEATHER[name] || name === weatherName) return;
      weatherName = name;
      weather = WEATHER[name];
      writeBack('weather', name);
      iblDirty = true;
      iblElev = -999;
      solve();
    },

    /* ── underground ────────────────────────────────────────────────── */
    /** `tunnel-jumbo` | `longhole` | `rockbolt`, or null for the surface. */
    setUnderground(methodId) {
      const next = UNDERGROUND[methodId] ? methodId : null;
      if (next === ugId) return;
      ugId = next;
      ug = next ? UNDERGROUND[next] : null;

      if (!ugId) {
        disposeUnderground();
        setSurfaceVisible(true);
        scene.environment = envRT ? envRT.texture : null;
        iblDirty = true;
        iblElev = -999;
        solve();                  // the eight recipes, untouched, resolved again
        regenerateIBL();
        return;
      }

      setSurfaceVisible(false);
      buildUnderground();
      solveUnderground();
    },
    get undergroundId() { return ugId; },
    get drive() { return ug; },
    get driveYaw() { return DRIVE_YAW; },
    UNDERGROUND,

    /** drive-local metres → world, for anything that has to land in the tube. */
    driveToWorld(lx, ly, lz, out) { return toWorld(lx, ly, lz, out); },

    /**
     * QA: world-space probe points down the drive, so a harness can project
     * them and measure the luminance falloff along the corridor rather than
     * guessing at screen rows. Metres are drive-local Z on the wall.
     */
    driveProbes() {
      if (!ug) return null;
      const o = {};
      /* The camera stands at drive-local (-1.15, 2.25, 13.75) looking at -Z, so
         the probes have to run AHEAD of it, down the drive, on the wall it can
         actually see. The first version sampled the LEFT wall from z = -6 to
         +46: nine of its eleven points were off-band or behind the camera, and
         `far` at backZ-6 was 42 m up the drive BEHIND the eye. Falloff measured
         on points the frame does not contain is not a measurement. */
      const wallX = ug.width * 0.5 - 0.15;
      const y = ug.wallH * 0.62;
      const zs = [8, 4, 0, -4, -8, -14, -22, -30];
      for (const z of zs) {
        if (z < ug.faceZ + 0.5) continue;          // past the face there is rock
        const r = toWorld(wallX, y, z);
        o[`wallR${z}`] = [r.x, r.y, r.z];
      }
      // the crown, which is what the top of the frame is made of
      for (const z of [4, -6, -16]) {
        if (z < ug.faceZ + 0.5) continue;
        const c = toWorld(-ug.width * 0.16, ug.height - 0.25, z);
        o[`crown${z}`] = [c.x, c.y, c.z];
      }
      const f = toWorld(0, ug.height * 0.42, ug.faceZ + 0.1);
      o.face = [f.x, f.y, f.z];
      /* the far end: the deepest point of the tube the camera is looking INTO.
         For a heading that is the face itself, so probe the invert just short
         of it, where no lamp is aimed; for a drive that runs on (`hasFace`
         false) it is the mouth of the darkness at faceZ. */
      const b = toWorld(-ug.width * 0.30, 0.15, ug.faceZ + 1.2);
      o.far = [b.x, b.y, b.z];
      return o;
    },

    /** QA: toggle the participating medium so its contribution is measurable. */
    __qaMedia(on) { mediaOn = on !== false; if (ug) mediaUniforms.uDust.value.w = mediaOn ? 1 : 0; },

    /** Force an immediate environment-map bake (e.g. after a big scene swap). */
    refreshIBL() { iblDirty = false; iblCooldown = 0.4; regenerateIBL(); },

    /** Nudge the shadow frustum to follow a moving rig if one ever moves. */
    setShadowFocus(x, y, z) {
      shadowFocus.set(x, y, z);
      sun.position.copy(sunDir).multiplyScalar(60).add(shadowFocus);
      sun.target.position.copy(shadowFocus);
      sun.target.updateMatrixWorld();
    },
  };

  ctx.env = api;
  return api;
}

export default createEnvironment;
