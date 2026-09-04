/**
 * Shop / garage 3D item previews.
 *
 * The iMarket shop shows a real 3D render of every tool. Doing that with the
 * main renderer would fight the game for the frame budget, so this module owns
 * one small dedicated WebGLRenderer used in two modes:
 *
 *   • thumbnail  — render once into an ImageBitmap, cache it, and blit into any
 *                  number of card canvases. Cheap enough to fill a whole grid.
 *   • live       — one item at a time (the detail view) rendered on a turntable
 *                  at a capped frame rate.
 *
 * Studio lighting is deliberately different from the game world: a three-point
 * rig on a dark slate gradient so carbide and machined steel read crisply at
 * thumbnail size.
 */
import * as THREE from 'three';
import { BRAND, clamp, damp } from './contract.js';

const THUMB = 256;

/** Maps a data.js item to a tools.js builder id. */
const CATEGORY_MODEL_HINTS = [
  /* ═══════════════════════════════════════════════════════════════════════
     The underground / piling / site-investigation families sit FIRST, because
     almost every one of them collides with a generic pattern further down and
     would lose to it:

       "CPT Push Rod"                contains `rod`         → drill-rod
       "RC Dual-Wall Drill Pipe"     contains `drill pipe`  → drill-rod
       "RC Hammer",  leaf "DTH Hammers"                     → dth-hammer
       "RC Bit",     leaf "DTH Bits"                        → dth-bit
       "Pile Helmet", leaf "Helmets & Drive Caps"           → casing-shoe

     Inside the block the same rule applies again: the specific member of a
     family precedes the general one, and every pair that shares one taxonomy
     leaf is called out where it appears.
     ═══════════════════════════════════════════════════════════════════════ */

  /* ── Site investigation ────────────────────────────────────────────────
     An SPT split spoon is DRIVEN by a 63.5 kg hammer falling 760 mm; a CPT
     cone is PUSHED at 20 mm/s and never rotates. Different tools, which is
     why the game moved both out of the `bit` slot into `probe`. They must not
     collapse into each other, and neither may render as a drill rod. */
  // Before /rod/ — a push rod is not a drill rod and does not rotate.
  [/push rod|cpt rod/i, 'push-rod'],
  // A standpipe piezometer is an installed monitoring well, not a CPT probe.
  // It goes ahead of the cones so no `piezo` fragment can ever reach it.
  [/piezometer|standpipe/i, 'standpipe-piezometer'],
  // Before the friction cone: a piezocone is a cone WITH a pore-pressure filter.
  [/piezocone|cptu|cpt piezo|pore[- ]pressure cone/i, 'cpt-piezocone'],
  [/friction cone|cpt cone|cone penetration|electric cone/i, 'cpt-cone'],
  // "SPT Samplers & Hammers" is ONE leaf, so the hammer is claimed before the
  // sampler — otherwise every trip hammer renders as a split spoon.
  [/spt hammer|trip hammer|donut hammer|cathead/i, 'spt-hammer'],
  [/split[- ]spoon|spt sampler|standard penetration/i, 'spt-split-spoon'],
  [/window sampler/i, 'window-sampler'],
  [/u100|u 100|open[- ]drive tube/i, 'u100-tube'],
  [/shelby|thin[- ]wall tube/i, 'shelby-tube'],
  // Last in the sampler run, so the three named tubes above claim their own
  // listings first and only the generic "Drive & Liner Sampler Set" lands here.
  [/liner sampler|drive sampler/i, 'u100-tube'],
  // A monitoring well riser IS a slotted pipe — casing-pipe is honest here.
  [/monitoring well|well riser|well screen/i, 'casing-pipe'],

  /* ── Cable tool / cable percussion ────────────────────────────────────
     `chisel bit`, never bare `chisel`: "Flat / Chisel Picks" is a road-milling
     leaf and a milling pick is not a spudding chisel. */
  [/cable[- ]tool chisel|chisel bit|spudding bit/i, 'cable-tool-chisel'],
  [/drilling jars|\bjars\b/i, 'drilling-jars'],
  [/bailer/i, 'bailer'],

  /* ── Reverse circulation ──────────────────────────────────────────────
     RC tooling is filed under the DTH leaves, so every RC pattern has to beat
     its DTH equivalent. The sample train is half the machine on an RC hole. */
  [/dual[- ]wall|rc pipe|rc drill pipe/i, 'rc-dual-wall-pipe'],
  [/rc hammer/i, 'rc-hammer'],
  [/rc bit/i, 'rc-bit'],
  [/cyclone/i, 'rc-cyclone'],
  [/riffle|sample splitter|splitter/i, 'rc-splitter'],
  [/calico|sample bag/i, 'sample-bag'],

  /* ── Tunnelling: the face round ───────────────────────────────────────
     The reel and the charging hose share the "ANFO Loaders" leaf, so the reel
     — which carries no explosive at all — is claimed first. */
  [/detonator|shock[- ]tube|initiation reel/i, 'detonator-reel'],
  [/charging hose|anfo|emulsion hose/i, 'charging-hose'],
  // NOT bare /jumbo/: `tunnel-jumbo` is a RIG id and must reach the rig factory
  // even in the degraded case where rigFactory.js failed to load.
  [/jumbo feed|boom feed|feed beam/i, 'jumbo-feed'],

  /* ── Longhole production ──────────────────────────────────────────────
     ITH is a DTH hammer taken underground and tools.js aliases it onto the
     same builders. `\bith\b`, so "with hammer" cannot match. */
  [/\bith hammer\b|in[- ]the[- ]hole hammer/i, 'dth-hammer'],
  [/\bith bit\b/i, 'dth-bit'],
  [/guide tube/i, 'guide-tube'],

  /* ── Ground support ───────────────────────────────────────────────────
     A friction bolt is a SLOTTED TUBE hammered into an undersized hole; a
     rebar bolt is a THREADED BAR grouted with resin. Two different objects
     under one leaf ("Rock Bolts"), so the friction bolt is claimed on its own
     name first and the generic `rock bolt` falls through to the rebar bolt —
     which is what an unqualified "rock bolt" is in any catalogue. */
  [/friction bolt|split[- ]set|split[- ]tube bolt/i, 'friction-bolt'],
  [/cable bolt|bulbed strand/i, 'cable-bolt'],
  [/rebar bolt|resin[- ]grouted|resin[- ]anchored|rock bolt|soil nail/i, 'rebar-bolt'],
  // After the rebar bolt, because "Resin-Grouted Rebar Bolt" names the resin.
  [/resin cartridge|resin capsule/i, 'resin-cartridge'],
  [/weldmesh|\bmesh\b/i, 'mesh-sheet'],
  // "Bolt Plates & Nuts" is one leaf carrying BOTH words, so the nut — the
  // narrower object — goes first or every dome nut renders as a plate.
  [/bolt nut|dome nut|hemispherical nut|shear collar/i, 'bolt-nut'],
  [/bolt plate|dished plate|face plate/i, 'bolt-plate'],
  // An SDA bearing plate is not a rock-bolt plate, and this must precede the
  // /sda/ pattern below or "Bearing & Domed Plate Set" renders as an anchor BAR.
  [/bearing plate|domed plate/i, 'bearing-plate'],

  /* ── Driven piling ────────────────────────────────────────────────────
     Four different sections: a square precast concrete pile, a round steel
     tube, a rolled H and an interlocking Z sheet pair. None of them is a
     casing pipe and none of them is any of the others. */
  [/precast|concrete pile/i, 'precast-pile'],
  [/tube pile|pipe pile|tubular pile/i, 'tube-pile'],
  [/\bh[- ]pile|\bh[- ]bearing pile|h[- ]section/i, 'h-pile'],
  [/sheet pile/i, 'sheet-pile-pair'],
  [/impact hammer|drop hammer|diesel hammer|hydraulic hammer/i, 'impact-hammer'],
  [/vibratory hammer|vibro hammer|vibrolance/i, 'vibratory-hammer'],
  // ANCHORED — and this is the one place in the table where that is the point.
  // A pile helmet and a drive cap share the leaf "Helmets & Drive Caps", so
  // BOTH haystacks contain "helmet" AND "drive cap" and no unanchored pattern
  // can separate them; the slot (`dolly`) is shared too. What does separate
  // them is the item's own NAME, which the haystack puts first. Everything
  // else under that leaf — helmets, and the hardwood / plastic / composite
  // dollies that sit inside them — falls through to the helmet.
  [/^drive cap/i, 'drive-cap'],
  [/pile helmet|\bdolly\b|helmet/i, 'pile-helmet'],

  /* ── The original table, in its original order ────────────────────── */
  [/casing crown/i, 'casing-crown'],
  [/ring[- ]bit/i, 'ring-bit-system'],
  [/wing[- ]bit/i, 'wing-bit-system'],
  [/eccentric|odex/i, 'eccentric-system'],   // NOT symmetrix — that is concentric
  [/concentric|symmetrix|elemex/i, 'concentric-system'],
  // A casing rotator/oscillator is a DRIVE, not a casing — it must precede /casing/.
  [/rotary drive|kdk|rotary head|casing rotator|casing oscillator|casing driver/i, 'rotary-drive-head'],
  [/casing shoe|drive cap/i, 'casing-shoe'],
  [/casing pipe|casing/i, 'casing-pipe'],
  [/dth hammer/i, 'dth-hammer'],
  [/dth bit/i, 'dth-bit'],
  [/dth shank/i, 'dth-shank'],
  // A face bit, a longhole bit and a bolting bit are all top-hammer button
  // bits — small, R/T threaded, spherical or ballistic. The underground work
  // renamed them by where they are used, not by what they are.
  [/button bit|face bit|longhole bit|bolting bit/i, 'button-bit'],
  [/tricone/i, 'tricone-bit'],
  [/pdc/i, 'pdc-bit'],
  [/drag|wing bit/i, 'drag-bit'],
  [/core bit|impregnated/i, 'core-bit'],
  [/reaming shell/i, 'reaming-shell'],
  [/core barrel/i, 'core-barrel'],
  [/shank adapter/i, 'shank-adapter'],
  [/coupling sleeve/i, 'coupling-sleeve'],
  [/drill rod|drill pipe|rod/i, 'drill-rod'],
  [/kelly auger|auger flight|hollow[- ]stem|cfa/i, 'kelly-auger'],
  [/drilling bucket|clean[- ]?out bucket/i, 'drilling-bucket'],
  [/belling|under[- ]?reaming/i, 'belling-tool'],
  [/cross cutter|boulder/i, 'cross-cutter'],

  [/flushing swivel|swivel/i, 'flushing-swivel'],
  [/shock absorber/i, 'shock-absorber'],
  [/round[- ]shank|point[- ]attack|pick/i, 'round-shank-pick'],
  [/tool holder|pick box/i, 'tool-holder'],
  [/self[- ]drilling anchor|hollow anchor|sda|gewi|threadbar/i, 'sda-bar'],
  [/drill stem|raise bore stem/i, 'drill-stem'],
  [/backreamer|hole opener|reamer/i, 'backreamer'],
  [/pilot|steering head/i, 'hdd-pilot-head'],
  [/sonde/i, 'sonde-housing'],
  [/compressor/i, 'compressor-skid'],
  [/mud pump|grout pump|pump/i, 'pump-skid'],
  [/generator|engine/i, 'power-unit'],
];

/**
 * Resolve an item to a tools.js builder id.
 *
 * The haystack is normalised so hyphenated slugs match the space-separated
 * hint patterns. Without this, ids like `auger-flight-std` and `dth-hammer-4`
 * fall straight through to the default and 26 of 38 shop cards render a button
 * bit regardless of what they are selling.
 */
/**
 * Hint patterns in AUTHORED order — most specific first.
 *
 * An earlier version sorted by `regex.source.length` and called that
 * specificity. It is not: `casing pipe|casing` is 18 characters and beat
 * `casing crown` (12), `ring[- ]bit` (11) and `concentric` (10), so casing
 * crowns, ring-bit systems, wing-bit systems and concentric systems ALL
 * resolved to a plain casing pipe. Specificity is a property of meaning, not of
 * string length, so it is expressed by position in the table and asserted here.
 */
const HINTS_BY_SPECIFICITY = CATEGORY_MODEL_HINTS;



/** No builder yet — resolve to null so the honest placeholder shows instead
 *  of a confidently wrong model. Delete an entry when its builder lands. */
const NO_BUILDER_YET = /kelly bar|kelly box|tremie|stop[- ]end|hydromill|trench cutter/i;

function modelIdFor(item) {
  // Nothing to go on. This used to answer `button-bit`, which is the same
  // confident guess the rest of this function exists to avoid — and it is the
  // answer a MISSING catalogue id would have got, since data.js is still
  // growing (`ith-hammer-3`, `ith-bit-216` and friends are aliases in tools.js
  // with no listing yet). An unknown thing gets the honest crate.
  if (!item) return null;
  // An explicit "no model" — drilling fluids, PPE, services, rentals. Callers
  // used to express this by passing an object scrubbed of anything matchable;
  // say it directly instead.
  if (item.supply === true || item.model === false) return null;
  if (typeof item === 'string') item = { id: item, name: item };
  if (item.model) return item.model;
  if (item.toolId) return item.toolId;
  // Match on the breadcrumb LEAF, never the whole path: a generic word anywhere
  // in "Drilling Tools → Casing & Overburden Tools → Rotary Drive Heads" made
  // /casing/ win over /rotary drive|kdk/, so KDK rotary heads rendered as casing
  // pipe and hollow anchor bars rendered as drill rod.
  const leaf = String(item.category || '').split(/[→>|]/).pop();
  const hay = [item.name, leaf, item.slot, item.sub, item.id]
    .filter(Boolean).join(' ')
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ');
  // FIRST MATCH WINS, in AUTHORED table order. The table is not sorted and must
  // never be: this comment used to read "longest pattern first … order in the
  // table is authoring convenience", which is the exact belief that produced the
  // `regex.source.length` sort and rendered every casing crown as a pipe. Order
  // IS the specificity, `HINT_EXPECTATIONS` below is what holds it, and a new
  // pattern goes above everything it could lose to — not at the end.
  if (NO_BUILDER_YET.test(hay)) return null;
  for (const [re, id] of HINTS_BY_SPECIFICITY) if (re.test(hay)) return id;
  // No match. Return null rather than guessing — a drilling fluid rendered as a
  // button bit is worse than an honest placeholder.
  return null;
}

/**
 * Guard the ordering invariant with REAL resolutions, not fragment heuristics.
 *
 * Specificity is a property of meaning, not of string length. An earlier
 * version sorted this table by `regex.source.length`, which put
 * `casing pipe|casing` (18 chars) ahead of `casing crown` (12) and
 * `ring[- ]bit` (11) — so every crown, ring-bit, wing-bit and concentric
 * system rendered as a plain pipe. These assertions are the thing that would
 * have caught it.
 */
/* Breadcrumbs for the assertions below. Spelled out rather than imported from
   game/data.js: this module must not depend on the catalogue, and a literal is
   what proves the resolver copes with the REAL string — including the leaves
   that carry two product words at once ("Helmets & Drive Caps"). They are the
   `CAT` paths verbatim; if data.js renames a leaf, the assertion should fail. */
const SG_M = 'Machines & Rigs';
const SG_T = 'Drilling Tools & Consumables';
const SG_D = 'Downhole & Well';
const SG_G = 'Ground Engineering & Anchoring';
const SG_S = 'Ground, Site & Services';
const SAMPLING   = `${SG_D} → Exploration & Coring → Geophysical / Logging / Sampling`;
const SPT        = `${SG_D} → Site Investigation & Testing → SPT Samplers & Hammers`;
const CPT_       = `${SG_D} → Site Investigation & Testing → CPT`;
const ANFO       = `${SG_M} → Tunneling & Underground → ANFO Loaders`;
const HELMETS    = `${SG_M} → Piling Equipment → Helmets & Drive Caps`;
const ROCKBOLT   = `${SG_G} → Rock Bolts, Soil Nails & Cable Bolts → Rock Bolts`;
const BOLTPLATES = `${SG_G} → Rock Bolts, Soil Nails & Cable Bolts → Bolt Plates & Nuts`;

const HINT_EXPECTATIONS = [
  /* ── the original guard ─────────────────────────────────────────────── */
  ['Casing Crown 168 mm, ballistic',        'casing-crown'],
  ['Ring-Bit System 140 mm',                'ring-bit-system'],
  ['Wing-Bit System 168 mm',                'wing-bit-system'],
  ['Concentric System, Symmetrix type',     'concentric-system'],
  ['Eccentric System, Odex type',           'eccentric-system'],
  ['Casing Pipe 168 mm',                    'casing-pipe'],
  ['Rotary Drive Head KDK 620',             'rotary-drive-head'],
  ['Hollow Anchor Bar R32/210',             'sda-bar'],
  ['GEWI Threadbar 32 mm',                  'sda-bar'],
  ['Drill Rod T45, 3 m',                    'drill-rod'],
  ['Raise Bore Drill Stem 254 mm',          'drill-stem'],
  ['Flushing Swivel, standard',             'flushing-swivel'],
  ['DTH Hammer 5 inch',                     'dth-hammer'],
  ['DTH Bit 152 mm',                        'dth-bit'],
  ['Button Bit T45, 76 mm',                 'button-bit'],

  /* ── reverse circulation ────────────────────────────────────────────── */
  // Filed under the DTH leaves, so each of these is a live ordering test.
  [{ name: 'RC Dual-Wall Drill Pipe, 114 mm x 3 m', category: `${SG_T} → Drill String & Rods → RC / Dual-Wall` }, 'rc-dual-wall-pipe'],
  [{ name: 'RC Hammer, 116 mm',                     category: `${SG_T} → DTH Tools → DTH Hammers` }, 'rc-hammer'],
  [{ name: 'RC Bit, 124 mm, Flat Face',             category: `${SG_T} → Drill Bits & Cutting Tools → DTH Bits` }, 'rc-bit'],
  [{ name: 'RC Bit, 124 mm, Venturi Face',          category: `${SG_T} → Drill Bits & Cutting Tools → DTH Bits` }, 'rc-bit'],
  [{ name: 'Sample Cyclone, 100 mm',            category: SAMPLING }, 'rc-cyclone'],
  [{ name: 'Riffle Sample Splitter, Two-Way',   category: SAMPLING }, 'rc-splitter'],
  [{ name: 'Calico Sample Bags, Box of 500',    category: SAMPLING }, 'sample-bag'],

  /* ── tunnelling ─────────────────────────────────────────────────────── */
  [{ name: 'Boom Feed, 3.9 m',                  category: `${SG_M} → Tunneling & Underground → Jumbos` }, 'jumbo-feed'],
  // Both live under "ANFO Loaders"; the reel carries no explosive.
  [{ name: 'ANFO Charging Hose, 32 mm x 30 m',  category: ANFO }, 'charging-hose'],
  [{ name: 'Shock-Tube Initiation Reel, 500 m', category: ANFO }, 'detonator-reel'],

  /* ── longhole production ────────────────────────────────────────────── */
  ['Longhole Guide Tube, 102 mm x 1 m',     'guide-tube'],
  ['3 in ITH Hammer',                       'dth-hammer'],
  ['5 in ITH Hammer',                       'dth-hammer'],
  ['8 in ITH Hammer',                       'dth-hammer'],
  ['5 in QL50 140 mm ITH Bit',              'dth-bit'],
  ['6 in QL60 216 mm ITH Bit',              'dth-bit'],
  ['T51 89 mm Longhole Bit',                'button-bit'],
  ['T51 Longhole Rod, 1.525 m',             'drill-rod'],

  /* ── ground support ─────────────────────────────────────────────────── */
  // A slotted tube and a threaded bar, sharing the leaf "Rock Bolts".
  [{ name: 'Split-Tube Friction Bolt, 39 mm x 2.4 m',  category: ROCKBOLT }, 'friction-bolt'],
  [{ name: 'Split-Tube Friction Bolt, 46 mm x 3.0 m',  category: ROCKBOLT }, 'friction-bolt'],
  [{ name: 'Resin-Grouted Rebar Bolt, 20 mm x 2.4 m',  category: ROCKBOLT }, 'rebar-bolt'],
  [{ name: 'Rock Bolt & Resin Cartridge Box',          category: ROCKBOLT }, 'rebar-bolt'],
  ['Bulbed Cable Bolt, 15.2 mm x 6.0 m',    'cable-bolt'],
  ['Resin Cartridges, 25 x 600 mm, Fast Set', 'resin-cartridge'],
  ['Weldmesh Sheet, 2.4 x 1.2 m',           'mesh-sheet'],
  // One leaf, both words in it — the nut must not become a plate.
  [{ name: 'Dished Bolt Plate, 150 mm',            category: BOLTPLATES }, 'bolt-plate'],
  [{ name: 'Dome Nut M24 with Shear Collar',       category: BOLTPLATES }, 'bolt-nut'],
  // Regression: /sda/ used to swallow this and render an anchor BAR.
  [{ name: 'Bearing & Domed Plate Set with Nut',
     category: `${SG_G} → Self-Drilling Anchors (SDA) → Bearing & Domed Plates` }, 'bearing-plate'],
  // Bolting BITS stay bits. `bolt` in a name is not a ground-support product.
  [{ name: 'R32 33 mm Bolting Bit', category: `${SG_T} → Drill Bits & Cutting Tools → Button Bits` }, 'button-bit'],

  /* ── driven piling — four different sections ────────────────────────── */
  ['Precast Concrete Pile, 350 mm x 14 m',  'precast-pile'],
  [{ name: 'Steel Tube Pile, 914 x 12.5 mm',
     category: `${SG_G} → Micropiles & Pile Systems → Driven Steel Pipe Piles (RR)` }, 'tube-pile'],
  [{ name: 'Steel H-Bearing Pile, 310 x 305 mm',
     category: `${SG_M} → Piling Equipment → Bearing Piles (H-Section)` }, 'h-pile'],
  ['Steel Z Sheet Pile Pair, 630 mm',       'sheet-pile-pair'],
  ['Hydraulic Impact Hammer, 9 t Ram',      'impact-hammer'],
  ['Vibratory Hammer, 1500 kN',             'vibratory-hammer'],
  // The helmet / drive-cap pair: one leaf, one slot, both words in both.
  [{ name: 'Pile Helmet, 350 mm Square', slot: 'dolly', category: HELMETS }, 'pile-helmet'],
  [{ name: 'Hardwood Dolly, End Grain',  slot: 'dolly', category: HELMETS }, 'pile-helmet'],
  [{ name: 'Composite Dolly, Steel-Faced', slot: 'dolly', category: HELMETS }, 'pile-helmet'],
  [{ name: 'Drive Cap, 610 mm Tube',     slot: 'dolly', category: HELMETS }, 'drive-cap'],
  // …and the casing shoe it must not have stolen.
  [{ name: '168 mm Casing Shoe & Drive Cap Set',
     category: `${SG_T} → Casing & Overburden Tools → Casing Shoes & Drive Caps` }, 'casing-shoe'],
  [{ name: 'Sonic Carbide Drive Shoe',
     category: `${SG_T} → Casing & Overburden Tools → Casing Shoes & Drive Caps` }, 'casing-shoe'],

  /* ── site investigation — driven vs pushed ──────────────────────────── */
  [{ name: 'SPT Split-Spoon Sampler, 51 mm', slot: 'probe', category: SPT }, 'spt-split-spoon'],
  [{ name: 'Automatic SPT Trip Hammer',                     category: SPT }, 'spt-hammer'],
  [{ name: 'Donut SPT Hammer, Rope and Cathead',            category: SPT }, 'spt-hammer'],
  [{ name: 'Friction Cone, CPT, 15 cm²', slot: 'probe', category: CPT_ }, 'cpt-cone'],
  [{ name: 'Piezocone CPTu, 10 cm²',     slot: 'probe', category: CPT_ }, 'cpt-piezocone'],
  // Shares the CPT leaf with the cones and ends in "rod" — two ways to lose.
  [{ name: 'CPT Push Rod, 44.5 mm x 1 m', slot: 'rod', category: CPT_ }, 'push-rod'],
  ['Window Sampler, 60 mm x 1 m',           'window-sampler'],
  ['U100 Open-Drive Sample Tube, 100 mm',   'u100-tube'],
  ['Shelby Thin-Wall Tube, 76 mm',          'shelby-tube'],
  ['Standpipe Piezometer, 50 mm',           'standpipe-piezometer'],
  ['Monitoring Well Riser & Screen, 125 mm', 'casing-pipe'],

  /* ── cable tool ─────────────────────────────────────────────────────── */
  ['Cable-Tool Chisel Bit, 250 mm',         'cable-tool-chisel'],
  ['Cable-Tool Sand Bailer, 200 mm',        'bailer'],
  ['Drilling Jars, 500 mm Stroke',          'drilling-jars'],

  /* ── raw ids, for the listings data.js has not grown yet ────────────── */
  // build() prefers an exact tools.js id, but modelIdFor is public and keys
  // the thumbnail cache, so the bare slug has to resolve too.
  [{ id: 'ith-hammer-3' },      'dth-hammer'],
  [{ id: 'ith-bit-216' },       'dth-bit'],
  [{ id: 'friction-bolt-33' },  'friction-bolt'],
  [{ id: 'sheet-pile-z-630' },  'sheet-pile-pair'],
  [{ id: 'h-pile-305' },        'h-pile'],
  [{ id: 'drive-cap-h-305' },   'drive-cap'],
  [{ id: 'pile-helmet-450' },   'pile-helmet'],
  [{ id: 'spt-sampler-51' },    'spt-split-spoon'],
  [{ id: 'cpt-piezo-15' },      'cpt-piezocone'],
  [{ id: 'push-rod-reducer' },  'push-rod'],
  [{ id: 'rc-cyclone-75' },     'rc-cyclone'],
  [{ id: 'bolt-nut-m24' },      'bolt-nut'],

  /* ── and the things that must stay modelless ────────────────────────── */
  // A wrong 3D model is worse than none: fluids, PPE, services and any listing
  // that says so outright get the supply crate, not the nearest-looking tool.
  [{ name: 'Bentonite, 1 t Big Bag', supply: true }, null],
  [{ name: 'Pile Driving Analyser & Stress Monitor', model: false }, null],
  [{ name: 'PPE Set, Arctic HD',
     category: `${SG_S} → Safety & PPE → Personal Protective Equipment` }, null],
  [{ name: 'Contract Operator, Per Day',
     category: `${SG_S} → Services & Rentals → Operator Services` }, null],
  ['Kelly Bar, 4-Stage Interlocking',       null],   // NO_BUILDER_YET
  [null,                                    null],   // nothing to go on
];

/**
 * Guard the ordering invariant with REAL resolutions, not fragment heuristics.
 *
 * Specificity is a property of meaning, not of string length. An earlier
 * version sorted this table by `regex.source.length`, which put
 * `casing pipe|casing` (18 chars) ahead of `casing crown` (12) and
 * `ring[- ]bit` (11) — so every crown, ring-bit, wing-bit and concentric
 * system rendered as a plain pipe. These assertions are the thing that would
 * have caught it.
 *
 * A row is either a product NAME or a whole item. Use the item form wherever
 * the category is load-bearing — the helmet/drive-cap, plate/nut, hammer/
 * sampler and cone/rod pairs each share ONE taxonomy leaf, so asserting them
 * on the name alone would test nothing that can actually break.
 */
(function assertHintResolution() {
  const bad = [];
  for (const [ref, want] of HINT_EXPECTATIONS) {
    const item = (ref === null || typeof ref === 'object') ? ref : { name: ref };
    const got = modelIdFor(item);
    if (got !== want) {
      const label = (item && (item.name || item.id)) || String(ref);
      bad.push(`"${label}" -> ${got} (want ${want})`);
    }
  }
  if (bad.length) {
    console.warn(`[preview] CATEGORY_MODEL_HINTS mis-ordered (${bad.length}/${HINT_EXPECTATIONS.length}): `
      + bad.join(' | '));
  }
})();


export function createPreview(ctx) {
  const THREE_ = ctx.THREE || THREE;
  let renderer = null;
  let scene = null;
  let camera = null;
  let pivot = null;
  let backdrop = null;   // studio gradient sphere — scaled to the shot in frame()
  let current = null;          // { itemId, group }
  const thumbCache = new Map(); // itemId -> ImageBitmap | HTMLCanvasElement
  const pending = new Map();
  const liveTargets = new Set(); // { canvas, itemId, ctx2d }
  let buildTool = null;
  let buildRigPreview = null;
  let rigIds = null;
  let toolIds = null;   // every id tools.js can actually build
  let ok = false;
  let liveAccum = 0;
  let spin = 0;
  let lastFrame = null;   // framing telemetry from the last frame() — see below


  const isRigId = (id) => !!id && Array.isArray(rigIds) && rigIds.includes(id);

  function makeStudio() {
    scene = new THREE_.Scene();

    // Gradient backdrop — a large sphere with a vertical ramp, unlit.
    const bg = new THREE_.Mesh(
      new THREE_.SphereGeometry(12, 24, 16),
      new THREE_.ShaderMaterial({
        side: THREE_.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE_.Color(BRAND.card) },
          bottom: { value: new THREE_.Color(BRAND.bgDeep) },
          glow: { value: new THREE_.Color(BRAND.steel) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vP;
          void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 top, bottom, glow;
          varying vec3 vP;
          void main(){
            float h = clamp(vP.y / 12.0 * 0.5 + 0.5, 0.0, 1.0);
            vec3 c = mix(bottom, top, smoothstep(0.15, 0.95, h));
            float r = 1.0 - clamp(length(vP.xy) / 12.0, 0.0, 1.0);
            c += glow * pow(r, 4.0) * 0.10;
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      })
    );
    backdrop = bg;
    scene.add(bg);

    // Three-point studio rig.
    const key = new THREE_.DirectionalLight(0xfff0d8, 3.1);
    key.position.set(3.2, 4.4, 3.0);
    const fill = new THREE_.DirectionalLight(0x9fc6d8, 0.85);
    fill.position.set(-3.6, 1.2, 2.2);
    const rim = new THREE_.DirectionalLight(new THREE_.Color(BRAND.amber).getHex(), 2.2);
    rim.position.set(-1.4, 2.0, -4.0);
    scene.add(key, fill, rim, new THREE_.AmbientLight(0x2a3340, 1.1));

    // A soft studio env so metals have something to reflect.
    const pmrem = new THREE_.PMREMGenerator(renderer);
    const envScene = new THREE_.Scene();
    const panel = (x, y, z, c, i) => {
      const m = new THREE_.Mesh(
        new THREE_.PlaneGeometry(6, 6),
        new THREE_.MeshBasicMaterial({ color: c, side: THREE_.DoubleSide })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      m.material.color.multiplyScalar(i);
      envScene.add(m);
    };
    panel(0, 6, 0, 0xbfd3e6, 1.0);
    panel(5, 1, 4, 0xfff2dd, 0.85);
    panel(-5, 1, 2, 0x7fa8c0, 0.5);
    panel(0, -4, 0, 0x2a3038, 0.4);
    const env = pmrem.fromScene(envScene, 0.04);
    scene.environment = env.texture;
    pmrem.dispose();
    envScene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });

    camera = new THREE_.PerspectiveCamera(30, 1, 0.05, 60);
    pivot = new THREE_.Group();
    scene.add(pivot);
  }

  /** Frame the built group so it fills the thumbnail consistently. */
  function frame(group) {
    // Measure from a known zero. `Box3.setFromObject` reports WORLD space, and
    // `pivot` is already rotated when frame() runs — yaw for a thumbnail, an
    // arbitrary turntable angle for a live card. Subtracting a world-space
    // centre from a LOCAL `position` therefore only cancels out when the yaw
    // happens to be zero; at any other angle the object is left off-centre by
    // (c - R·c), which is nothing on a symmetric bit and most of a card on a
    // 22 m tube pile. Zero the offset, measure, then convert back through the
    // parent so the number is in the space `position` is actually expressed in.
    group.position.set(0, 0, 0);
    group.updateWorldMatrix(true, true);
    const box = new THREE_.Box3().setFromObject(group);
    if (!isFinite(box.min.x)) return;
    const size = box.getSize(new THREE_.Vector3());
    const center = box.getCenter(new THREE_.Vector3());
    if (group.parent) group.parent.worldToLocal(center);
    group.position.copy(center).negate();
    // Frame on the bounding SPHERE, not the longest axis. max(x,y,z)*0.5 does
    // not enclose a tall thin object seen from an oblique angle, which cropped
    // the mast off the top and the track off the bottom of every rig card.
    const radius = size.length() * 0.5 || 1;
    const dist = radius / Math.tan((camera.fov * Math.PI) / 360) * 1.9;
    camera.position.set(dist * 0.42, dist * 0.34, dist * 0.86);
    camera.lookAt(0, 0, 0);
    camera.near = Math.max(0.01, dist * 0.05);
    camera.far = Math.max(dist * 6, 40);
    // Scale the backdrop to the shot. Authored at radius 12, it was always
    // BEHIND the camera for anything bigger than ~3.4 m across — measured
    // 22.6 units for the small crawler, 191 for the derrick — so every rig card
    // and a third of the tool cards cleared to opaque black.
    if (backdrop) backdrop.scale.setScalar(Math.max(1, dist / 6));
    camera.updateProjectionMatrix();

    // Framing telemetry. The two framing bugs this file has had were both
    // NUMBERS — a backdrop authored at radius 12 while the camera stood at 191,
    // and a bounding box that did not enclose a mast — and neither is visible
    // in a thumbnail until it is already wrong. The catalogue now spans an M24
    // dome nut to a 21 m piling leader, four orders of magnitude of `dist`, so
    // the invariants are recorded here and asserted by the QA harness:
    //   backdropRadius > dist   camera stays INSIDE the gradient sphere
    //   near < dist - radius    the near plane never clips into the subject
    //   far  > dist + radius    nor the far plane
    //   0 < coverage < 1        the bounding sphere fits the vertical frame
    const backdropRadius = backdrop ? 12 * backdrop.scale.x : Infinity;
    lastFrame = {
      radius, dist, near: camera.near, far: camera.far, backdropRadius,
      coverage: (2 * Math.asin(Math.min(1, radius / dist))) / (camera.fov * Math.PI / 180),
      size: { x: size.x, y: size.y, z: size.z },
      ok: backdropRadius > dist
        && camera.near < dist - radius
        && camera.far > dist + radius
        && radius < dist,
    };
  }

  function build(ref, wear = 0) {
    const itemId = typeof ref === 'string' ? ref : (ref?.id || '');
    // Callers may pass a full item object (the shop's own catalogue entries are
    // not all present in game/data.js). Prefer the object they gave us.
    const item = (typeof ref === 'object' && ref) || ctx.data?.getItem?.(itemId) || null;

    // Rigs are machines, not tools — route them to the rig factory.
    if (buildRigPreview && isRigId(itemId)) {
      try {
        const g = buildRigPreview(itemId);
        if (g) return g;
      } catch (e) { console.warn('[preview] rig build failed', itemId, e.message); }
    }

    // build() must always hand back an Object3D. It used to return null when
    // tools.js had failed to import, and every caller does `pivot.add(group)`
    // straight afterwards — which logs a console ERROR per card and leaves the
    // grid blank. The crate says "no model" without breaking the shot.
    if (!buildTool) return supplyCrate(item);
    // Many shop ids ARE builder ids (`casing-crown-168`, `rod-r32`,
    // `dth-hammer-4`, `ith-bit-216`, `sheet-pile-z-630`…). Exact match beats
    // pattern matching, and it is what carries the ids that data.js has not
    // grown a listing for yet — those arrive here with item === null.
    const modelId = (toolIds && toolIds.has(itemId))
      ? itemId
      : modelIdFor(item || { id: itemId, name: itemId });
    let group = null;
    if (!modelId) {
      // Worth knowing about, but not worth an error: an id with no listing, no
      // builder and no pattern is exactly the case the crate exists for.
      if (itemId && !item) console.info('[preview] no model for unknown id', itemId);
      return supplyCrate(item);
    }
    try {
      // Pass the listing's real attributes through — the builders honour thread
      // and diameter, so a T45 rod and an R32 rod actually look different.
      group = buildTool(THREE_, ctx, modelId, {
        wear,
        preview: true,
        thread: item?.thread,
        diameterMm: item?.diameterMm ?? item?.holeDia ?? item?.stats?.diameterMm,
        material: item?.material,
        duty: item?.duty,
      });
    } catch (e) {
      console.warn('[preview] build failed', modelId, e.message);
    }
    if (!group) {
      group = new THREE_.Group();
      const m = new THREE_.Mesh(
        new THREE_.CylinderGeometry(0.4, 0.5, 1.2, 24, 1),
        new THREE_.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.42, metalness: 0.9 })
      );
      group.add(m);
    }
    return group;
  }

  /**
   * Tools built by rig/tools.js share materials with the rig's own tool library.
   * Walking the group and disposing every material would therefore free
   * geometry and shaders still in use by the live scene, causing a visible
   * recompile hitch. The builders hand back their own scoped teardown — use it.
   */
/**
   * Honest stand-in for stock with no mechanical form of its own — drilling
   * fluids, additives, PPE, consumables. A labelled drum on a pallet reads as
   * "supplies", which is true, instead of misrepresenting the listing.
   */
  function supplyCrate() {
    const g = new THREE_.Group();
    const steel = new THREE_.MeshStandardMaterial({ color: 0x2f3945, roughness: 0.55, metalness: 0.75 });
    const drumMat = new THREE_.MeshStandardMaterial({ color: 0xb4761a, roughness: 0.42, metalness: 0.35 });
    const drum = new THREE_.Mesh(new THREE_.CylinderGeometry(0.29, 0.29, 0.86, 28, 1), drumMat);
    drum.position.y = 0.55;
    g.add(drum);
    for (const y of [0.36, 0.55, 0.74]) {
      const rib = new THREE_.Mesh(new THREE_.TorusGeometry(0.295, 0.022, 8, 28), steel);
      rib.rotation.x = Math.PI / 2;
      rib.position.y = y;
      g.add(rib);
    }
    const lid = new THREE_.Mesh(new THREE_.CylinderGeometry(0.30, 0.30, 0.05, 28, 1), steel);
    lid.position.y = 1.0;
    g.add(lid);
    const pallet = new THREE_.Mesh(new THREE_.BoxGeometry(0.92, 0.11, 0.92),
      new THREE_.MeshStandardMaterial({ color: 0x6b5638, roughness: 0.95, metalness: 0 }));
    pallet.position.y = 0.055;
    g.add(pallet);
    g.userData.dispose = () => {
      g.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
    };
    return g;
  }

  function disposeGroup(g) {
    if (!g) return;
    if (typeof g.userData?.dispose === 'function') { g.userData.dispose(); return; }
    g.traverse((o) => {
      o.geometry?.dispose?.();
      const m = o.material;
      if (Array.isArray(m)) m.forEach((x) => x?.dispose?.());
      else m?.dispose?.();
    });
  }

  /** Render `itemId` once and return a bitmap suitable for drawImage. */
  async function thumbnail(ref, opts = {}) {
    if (!ok) return null;
    const itemId = typeof ref === 'string' ? ref : (ref?.id || '');
    const key = `${itemId}|${modelIdFor(ref)}|${opts.wear || 0}`;
    if (thumbCache.has(key)) return thumbCache.get(key);
    if (pending.has(key)) return pending.get(key);

    const p = (async () => {
      const group = build(ref, opts.wear || 0);
      pivot.clear();
      pivot.add(group);
      pivot.rotation.set(0, opts.yaw ?? -0.5, 0);
      frame(group);
      renderer.setSize(THUMB, THUMB, false);
      renderer.render(scene, camera);

      let bmp;
      const src = renderer.domElement;
      if (typeof createImageBitmap === 'function') {
        bmp = await createImageBitmap(src);
      } else {
        const c = document.createElement('canvas');
        c.width = c.height = THUMB;
        c.getContext('2d').drawImage(src, 0, 0);
        bmp = c;
      }
      pivot.clear();
      disposeGroup(group);
      thumbCache.set(key, bmp);
      pending.delete(key);
      return bmp;
    })();

    pending.set(key, p);
    return p;
  }

  /** Paint a cached (or freshly rendered) thumbnail into a card canvas. */
  async function render(ref, canvasEl, opts = {}) {
    if (!canvasEl) return false;
    const bmp = await thumbnail(ref, opts);
    if (!bmp) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvasEl.clientWidth || 120;
    const h = canvasEl.clientHeight || 120;
    canvasEl.width = Math.round(w * dpr);
    canvasEl.height = Math.round(h * dpr);
    const g = canvasEl.getContext('2d');
    g.clearRect(0, 0, canvasEl.width, canvasEl.height);
    // Cover-fit, preserving the square render.
    const s = Math.max(canvasEl.width / THUMB, canvasEl.height / THUMB);
    const dw = THUMB * s, dh = THUMB * s;
    g.drawImage(bmp, (canvasEl.width - dw) / 2, (canvasEl.height - dh) / 2, dw, dh);
    return true;
  }

  /** Attach a live turntable to one canvas (detail view). */
  function setLive(ref, canvasEl, opts = {}) {
    clearLive();
    if (!ok || !canvasEl) return;
    const itemId = typeof ref === 'string' ? ref : (ref?.id || '');
    const group = build(ref, opts.wear || 0);
    pivot.clear();
    pivot.add(group);
    frame(group);
    current = { itemId, group };
    liveTargets.add({ canvas: canvasEl, ctx2d: canvasEl.getContext('2d') });
  }

  function clearLive() {
    liveTargets.clear();
    if (current) { pivot.clear(); disposeGroup(current.group); current = null; }
  }

  const api = {
    async init() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = THUMB;
        renderer = new THREE_.WebGLRenderer({
          canvas, antialias: true, alpha: false,
          powerPreference: 'low-power', preserveDrawingBuffer: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE_.SRGBColorSpace;
        renderer.toneMapping = THREE_.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        makeStudio();
        try {
          const tools = await import('../rig/tools.js');
          buildTool = tools.buildTool || tools.default || null;
          const ids = typeof tools.listTools === 'function'
            ? tools.listTools()
            : Object.keys(tools.TOOL_BUILDERS || {}).concat(Object.keys(tools.TOOL_ALIASES || {}));
          toolIds = new Set(ids);
        } catch { buildTool = null; toolIds = null; }
        try {
          const rf = await import('../rig/rigFactory.js');
          rigIds = rf.RIG_IDS || null;
          // buildPreview is a factory-level helper; bind it if present.
          buildRigPreview = typeof ctx.rig?.buildPreview === 'function'
            ? (id) => ctx.rig.buildPreview(id)
            : (typeof rf.buildRigPreview === 'function' ? rf.buildRigPreview : null);
        } catch { rigIds = null; buildRigPreview = null; }
        ok = true;
        ctx.shopPreview = api;
      } catch (e) {
        console.warn('[preview] unavailable —', e.message);
        ok = false;
      }
    },

    update(dt) {
      if (!ok || !current || liveTargets.size === 0) return;
      liveAccum += dt;
      if (liveAccum < 1 / 30) return;          // cap the turntable at 30 fps
      liveAccum = 0;
      spin += dt * 0.55;
      pivot.rotation.y = spin;
      pivot.rotation.x = damp(pivot.rotation.x, Math.sin(spin * 0.4) * 0.12, 4, dt);
      const size = 512;
      renderer.setSize(size, size, false);
      renderer.render(scene, camera);
      for (const t of liveTargets) {
        const el = t.canvas;
        if (!el.isConnected) continue;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.round((el.clientWidth || 200) * dpr));
        const h = Math.max(1, Math.round((el.clientHeight || 200) * dpr));
        if (el.width !== w || el.height !== h) { el.width = w; el.height = h; }
        const s = Math.max(w / size, h / size);
        t.ctx2d.clearRect(0, 0, w, h);
        t.ctx2d.drawImage(renderer.domElement, (w - size * s) / 2, (h - size * s) / 2, size * s, size * s);
      }
    },

    resize() {},

    dispose() {
      clearLive();
      thumbCache.clear();
      pending.clear();
      scene?.traverse?.((o) => { o.geometry?.dispose?.(); const m = o.material; Array.isArray(m) ? m.forEach((x) => x?.dispose?.()) : m?.dispose?.(); });
      scene?.environment?.dispose?.();
      renderer?.dispose?.();
      renderer = null; ok = false;
    },

    // public
    render, thumbnail, setLive, clearLive,
    get ready() { return ok; },
    modelIdFor,
    /** Framing numbers from the most recent frame() — read by the QA harness. */
    get lastFrame() { return lastFrame; },
  };

  return api;
}

/**
 * The resolver, for tests and for callers that want the answer without a GL
 * context (`ui/screens/catalog.js` reasons about the same mapping).
 *
 * Declared HERE, past `export function createPreview`, on purpose:
 * `tools/hints.mjs` and `tools/t.mjs` run the table without three.js by
 * slicing the source between `const CATEGORY_MODEL_HINTS` and that line and
 * appending their own `export { modelIdFor }`. An `export` keyword on the
 * function itself would land inside that slice and collide with theirs.
 */
export { modelIdFor, CATEGORY_MODEL_HINTS, HINT_EXPECTATIONS };
