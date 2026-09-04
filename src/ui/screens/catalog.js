/**
 * DRILLITY I THE GAME — UI catalogue.
 *
 * The UI's VIEW LAYER over game/data.js. It holds no content of its own.
 *
 * `game/data.js` is the single source of truth for every method, region,
 * certificate, role, skill, rig, slot, item and contract. `useGameData(g)`
 * installs it as `G`, and every accessor below normalises it onto the field
 * names the screens read.
 *
 * WITHOUT `G` THE ACCESSORS RETURN EMPTY — `[]` or `null` — AND EVERY SCREEN
 * SHOWS AN EXPLICIT "content unavailable" STATE.
 *
 * This file used to carry a parallel set of fallback tables so each screen
 * could render standalone. They drifted: different region ids (`german` vs
 * `german-site`), a `nvq-spa` certificate data.js does not have, two missing
 * rigs, two missing methods — and two claims that were factually WRONG, an
 * "EN 791 Rig Safety" personal certificate (EN 791 is withdrawn, superseded by
 * EN 16228, and is a machine conformity standard nobody holds) and HUET sold
 * as a separate gate beside a BOSIET row that says "incl. HUET". Presenting a
 * complete, differently-named world when the content module is missing is not
 * graceful degradation; it is a second game that quietly lies. So the tables
 * are gone rather than synced, because syncing only restarts the drift.
 *
 * What remains here is genuinely the UI's own and has no data.js counterpart:
 * the sourced boot FACTS, taxonomy presentation order, listing facets, the
 * leaf → 3D-builder table, and pure string helpers.
 *
 * Live data still arrives through the systems where they own it:
 *   contracts  ← ctx.game.makeContractBoard() / ctx.progression?.getContracts?.()
 *   shop       ← ctx.game.ITEMS / ctx.shop?.getCatalog?.()
 *   skills     ← ctx.progression?.getSkillTree?.()
 *   strata     ← ctx.geology?.getStrata?.() / ctx.state.world.strata
 */
import { GROUND } from '../../core/contract.js';

/* ── Boot facts ───────────────────────────────────────────────────────────
   EVERY line here is sourced. See FACTS_VERIFIED.md for the per-line source
   tags and for the two claims that were removed as factually wrong (ring-bit
   vs wing-bit recovery, and Odex/Symmetrix eccentric-vs-concentric).
   Do not add a line without adding it to FACTS_VERIFIED.md first.        */
export const FACTS = [
  // Method character
  'A DTH hammer puts the percussion at the bit, so blow energy does not fade down the string. That is why it overtakes top hammer as the hole gets deep.',
  'Top hammer sends the blow down the rods. Every coupling costs you energy, so the deeper you go the slower it drills.',
  'In DTH the air does the work: it drives the piston and lifts the cuttings. Feed only keeps the bit coupled — lean on it and the hammer stalls.',
  'Auger drilling is torque-limited, not thrust-limited. If the flight cannot lift the spoil, more push just packs the hole.',
  'CFA never lifts the auger until concrete is pumping. Pull dry and the bore collapses.',
  'Raise boring drills a pilot hole down, then pulls a reamer head back up. Gravity does the mucking.',
  'Sonic drilling resonates the string. Hit the frequency and it slices soils; miss it and you are just heating steel.',
  'Self-drilling anchors are drilled and grouted in one pass — the hollow bar is both the drill string and the reinforcement.',
  // Overburden systems, stated precisely
  'Eccentric overburden systems swing a reamer out to cut clearance for the casing, then retract it to come back up the hole.',
  'Concentric systems use a ring bit on the casing shoe. The ring bit stays in the ground with the casing; the pilot bit comes home.',
  'A wing bit is not a lost bit — the wings fold in so it can be pulled back up through the casing and used again.',
  // Threads and connections
  'Percussion threads run R25–R51, T38–T127 and H55–H114. Families do not mix, and on a big hammer the shank shaft diameter is what decides which H thread you are on.',
  'Wireline core sizes go AQ, BQ, NQ, HQ, PQ. The inner tube comes up the rods; the string stays in the hole.',
  'Casing threads are usually left hand, so advancing the casing cannot unscrew the joints.',
  'Kelly bars come as friction or interlocking. Only the interlocking type puts full crowd force on the tool at full extension — the friction type is limited by the grip between the tubes.',
  // Ground behaviour
  'Quartzite runs about 300 MPa and is the most abrasive ground in the game. It ends carbide faster than anything else you will meet.',
  'Glacial till hides boulders. The torque spike arrives before you hear anything — back the feed off and let the percussion work.',
  'A karst void means instant loss of return: the bit free-falls and the flush goes nowhere. Cut feed before the string drops.',
  'Below the water table the ground is wetter, weaker and quicker to erode. Sand over-gauges the hole; clay smears the wall.',
  'Flushing is not optional. Cuttings left in the annulus regrind, heat the bit and jam the string.',
  'Too much flush in loose ground is its own problem — you wash the wall out and lose the hole to over-gauge.',
  // Tools and wear
  'Ballistic buttons drill soft and medium rock fast. Spherical buttons survive hard, abrasive rock longer.',
  'A blunt bit does not fail gracefully. Past about seventy percent worn, penetration falls off a cliff — change it before it changes itself.',
  '42CrMo4V and 34CrNiMo6 are the workhorse drill-string steels. S355J2 is structure, not string.',
  'Heavy-duty is a real specification, not marketing. It buys you wall thickness and fatigue life, and it costs you money.',
  // Drillity iMarket
  'On Drillity iMarket a product lives in exactly one subcategory. Thread, size, material and duty are filters, not categories.',
  'Condition is a real spec: new, used, refurbished, or for parts. Used gear is the cheap road, and it carries real risk.',
  'Cannot find the part? Post an RFQ. Matching sellers get notified and come back with quotes.',
  'Drillity iMarket charges no commission on a deal. Sellers keep what they sell.',
  'One brand’s part number can surface a compatible alternative from another maker. That cross-reference is where the savings hide.',
  // Drillity Talent
  'In this industry an expired certificate is the same as no certificate. Let a medical lapse and you do not mobilise.',
  'Rotation is a real field, not a nicety: 14/14, 21/21, 28/28, 4/4 — availability decides who gets the call.',
  'Offshore work is paid as a day rate, not a salary. Rig type, rig class and water depth set the number.',
  'Rig class matters as much as rig type. High-spec, harsh-environment and HPHT work pays differently because it is different work.',
  'BOSIET, HUET, FOET and the offshore medical are what stand between you and a helicopter seat.',
  'Passport and visa readiness decides the shortlist before anyone reads your skills.',
];

/** Rotation patterns — drillity-mobile-magic `drilling.ts` (DOMAIN §7). */
export const ROTATION_PATTERNS = [
  '14/14', '21/21', '28/28', '4/4', '5/2 (onshore week)', '6/3', 'Ad hoc / call-out', 'Staff / residential',
];

/** Rig types and classes — PLATFORM_TRUTH Part B, verbatim enumerations. */
export const RIG_TYPES = ['Jackup', 'Semi-submersible', 'Drillship', 'Platform rig', 'Land rig', 'Tender-assisted', 'Barge rig'];
export const RIG_CLASSES = ['Standard', 'High-spec / harsh environment', 'Ultra-deepwater', 'HPHT'];
export const WATER_DEPTHS = ['Shallow (<150 m)', 'Midwater (150–1500 m)', 'Deepwater (1500–3000 m)', 'Ultra-deepwater (>3000 m)'];

/* ── Loadout slot presentation ────────────────────────────────────────────
   game/data.js owns the slot list itself (14 bays, five of them core); all
   that lives here is how the UI draws one. `bit` is deliberately NOT called
   "Bit / crown": the same bay holds an auger flight, a drilling bucket and a
   casing crown, and calling all of those a crown is a percussion term over a
   rotary tool. The garage shows the fitted item's own taxonomy leaf and falls
   back to this generic name.                                               */

/** Icon per slot id — covers the full game/data.js slot list, not just the core five. */
const SLOT_ICONS = {
  bit: 'bit', rod: 'rod', hammer: 'hammer', compressor: 'air', pump: 'drop',
  shank: 'bolt', coupling: 'layers', casing: 'depth', swivel: 'settings',
  head: 'wrench', power: 'flame', ppe: 'helmet', workshop: 'garage', service: 'cart',
};

/** Display name overrides for slots whose data.js name is method-specific. */
const SLOT_NAMES = { bit: 'Cutting tool' };

/* ── iMarket taxonomy — the 7 super-groups, in taxonomy order (DOMAIN §3) ──
   A product sits in exactly ONE subcategory; thread, size, material, duty and
   condition are FACETS, never categories (PLATFORM_TRUTH Part A). The shop
   tree is therefore derived from the item breadcrumbs, never hand-declared. */
export const SUPERGROUPS = [
  { code: 'A', name: 'Machines & Rigs' },
  { code: 'B', name: 'Drilling Tools & Consumables' },
  { code: 'C', name: 'Fluids, Air & Power' },
  { code: 'D', name: 'Downhole & Well' },
  { code: 'E', name: 'Ground Engineering & Anchoring' },
  { code: 'F', name: 'Components, Parts & Hardware' },
  { code: 'G', name: 'Ground, Site & Services' },
];

/**
 * Family order inside each super-group, as DOMAIN §3 lists them. Sorting the
 * browse tree by listing count alone would put HDD & Trenchless above Drilling
 * Rigs; the taxonomy has an order and the shop keeps it.
 */
export const FAMILY_ORDER = [
  // A. Machines & Rigs
  'Drilling Rigs', 'Piling Equipment', 'HDD & Trenchless', 'Tunneling & Underground',
  'Diaphragm & Slurry-Wall', 'Casing & Foundation Attachments',
  // B. Drilling Tools & Consumables
  'Drill Bits & Cutting Tools', 'Top Hammer Tools', 'DTH Tools', 'Drill String & Rods',
  'Casing & Overburden Tools', 'Rotary & Kelly Foundation Tools',
  'Ground-Engaging & Cutting Wear Tools', 'Adapters, Couplings & Subs', 'Flushing, Swivels & Water',
  // C. Fluids, Air & Power
  'Mud & Fluid Systems', 'Pneumatics & Compressors', 'Hydraulic Systems',
  'Power Units & Engines', 'Grouting & Injection',
  // D. Downhole & Well
  'Directional Drilling', 'BOP & Well Control', 'Wellhead & Completion',
  'Exploration & Coring', 'Site Investigation & Testing',
  // E. Ground Engineering & Anchoring
  'Self-Drilling Anchors (SDA)', 'Threadbar & GEWI Systems', 'Strand Ground Anchors',
  'Micropiles & Pile Systems', 'Rock Bolts, Soil Nails & Cable Bolts',
  'Mesh, Surface Support & Grout', 'Anchor Install & Stressing Equipment',
  // F. Components, Parts & Hardware
  'Rotary Drives & Gear', 'Bearings, Bushings & Wear', 'Hardware & Fasteners',
  'Housings, Covers & Structural', 'Clamping & Breakout Tools', 'General Spares & Consumables',
  // G. Ground, Site & Services
  'Water Supply, Dewatering & Pumps', 'Electrics, Control & Monitoring', 'Safety & PPE',
  'Transport, Handling & Lifting', 'Workshop & Maintenance Tools', 'Services & Rentals',
];

/** Listing condition — a real iMarket facet (PLATFORM_TRUTH Part A). */
export const CONDITIONS = [
  { id: 'new',    name: 'New',              factor: 1.00, start: 1.00, note: 'Unused, full warranty.' },
  { id: 'refurb', name: 'Refurbished',      factor: 0.72, start: 0.86, note: 'Stripped, measured and rebuilt. Some life already spent.' },
  { id: 'used',   name: 'Used',             factor: 0.48, start: 0.58, note: 'Working order, sold as seen. The budget road, with real risk.' },
  { id: 'parts',  name: 'For parts',        factor: 0.19, start: 0.16, note: 'Sold for parts or repair. Do not plan a hole around it.' },
];
export const conditionById = (id) => CONDITIONS.find((c) => c.id === id) || CONDITIONS[0];

/**
 * Fact guard on user-visible taxonomy labels (PLATFORM_TRUTH Part C rule 2).
 *
 * **Odex is eccentric; Symmetrix is concentric.** The taxonomy PDF files them
 * under one node for merchandising, and the game must not repeat that as an
 * engineering claim — so a merged label is relabelled here, and a
 * Symmetrix-type tool belongs under the concentric node. Applied once, at
 * ingestion, so the tree and the listings agree and browsing still matches.
 */
const SUB_LABEL_FIXES = [
  [/^eccentric systems\b.*symmetrix/i, 'Eccentric Systems (Odex-type)'],
];
export function subLabel(name) {
  const s = String(name || '');
  for (const [re, fixed] of SUB_LABEL_FIXES) if (re.test(s)) return fixed;
  return s;
}

/** `SuperGroup → Family → Subcategory` split. Tolerates any of → > / as separator. */
export function catParts(path) {
  return String(path || '').split(/\s*(?:→|›|>)\s*/).map((s) => s.trim()).filter(Boolean);
}
export const catLeaf = (path) => catParts(path).pop() || '';
export const catGroup = (path) => catParts(path)[0] || '';
export const catFamily = (path) => catParts(path)[1] || '';

/* ═══════════════════════════════════════════════════════════════════════════
   LISTING TYPE — the second real iMarket facet (PLATFORM_TRUTH Part A)

   `Machine / Rig · Attachment Tool · Consumable · Spare Part · Service / Rental`
   is the platform's own enumeration, and iMarket splits its listing capacity
   into heavy equipment and parts/consumables. Nothing here is inferred from a
   product name: the type is decided by the bay the item occupies, its taxonomy
   family, and the `consumable` flag data.js already carries.
   ═══════════════════════════════════════════════════════════════════════════ */

export const LISTING_TYPES = [
  { id: 'machine',    name: 'Machine / Rig' },
  { id: 'attachment', name: 'Attachment Tool' },
  { id: 'consumable', name: 'Consumable' },
  { id: 'spare',      name: 'Spare Part' },
  { id: 'service',    name: 'Service / Rental' },
];
export const listingTypeName = (id) => (LISTING_TYPES.find((t) => t.id === id) || LISTING_TYPES[1]).name;

/** Duty — DOMAIN §5. Two values, and they are a real specification. */
export const DUTIES = [
  { id: 'standard', name: 'Standard' },
  { id: 'HD',       name: 'Heavy-duty (HD)' },
];
export const dutyId = (d) => (String(d).toUpperCase() === 'HD' || /heavy/i.test(String(d)) ? 'HD' : 'standard');
export const dutyName = (d) => (dutyId(d) === 'HD' ? 'Heavy-duty (HD)' : 'Standard');

/** Bays that hold a machine rather than a tool. */
const MACHINE_SLOTS = new Set(['rig', 'compressor', 'pump', 'power', 'mudplant', 'head', 'wellcontrol']);

/** @param {object} item a data.js item (or a listing carrying the same fields) */
export function listingTypeOf(item) {
  if (!item) return 'attachment';
  const family = catFamily(item.category);
  const group = catGroup(item.category);
  const leaf = catLeaf(item.category);
  if (item.slot === 'rig') return 'machine';
  if (family === 'Services & Rentals') return 'service';
  if (group === 'Components, Parts & Hardware') return 'spare';
  // PPE is issued kit that is bought and replaced, not a tool that fits a rig.
  if (family === 'Safety & PPE' || leaf === 'Personal Protective Equipment') return 'consumable';
  if (item.consumable) return 'consumable';
  if (MACHINE_SLOTS.has(item.slot)) return 'machine';
  if (family === 'Workshop & Maintenance Tools') return 'machine';
  return 'attachment';
}

/* ═══════════════════════════════════════════════════════════════════════════
   LEAF → 3D MODEL

   core/preview.js resolves an item to a rig/tools.js builder by matching
   regular expressions against the item's words. That is a guess, and it guesses
   wrong in both directions: `/casing pipe|casing/` is a longer pattern than
   `/casing crown/`, so every casing crown rendered as a plain pipe; nothing
   matches "Blowout Preventer", so a BOP stack — which HAS a builder — rendered
   as a drum of supplies.

   data.js `CAT` is a CLOSED set of taxonomy leaves, so the honest fix is a
   table. Three kinds of entry, and the difference matters:

     'builder-id'        → use it.
     ['a', 'b']          → the first id rig/tools.js actually has. Ids that do
                           not exist yet are forward declarations: the table is
                           written for the builders being added now (RC cyclone,
                           jumbo tooling, friction bolts, piles, hammers,
                           SPT/CPT samplers) and lights them up the moment they
                           land. If none exists, resolution DEFERS to preview.js
                           rather than asking for a builder that is not there —
                           an unknown id builds a bare billet, which is worse
                           than the current behaviour.
     null                → this stock has no mechanical form of its own
                           (fluids, PPE, rental, services). The supply crate is
                           the right answer and guessing is forbidden.

   Leaves that are absent are deliberately left to preview.js.
   ═══════════════════════════════════════════════════════════════════════════ */

const LEAF_MODEL = {
  /* A. Machines & Rigs — the rig leaves are routed to the rig factory by id. */
  'HDD Drill Pipe': 'drill-pipe',
  'Backreamers & Hole Openers': 'backreamer',
  'Pilot & Steering Heads': 'hdd-pilot-head',
  'Pulling Heads, Eyes & Swivels': 'flushing-swivel',
  'Sonde & Bent Housings': 'sonde-housing',
  'Locating & Steering Systems': null,          // a walkover receiver in a case
  'Reamer Heads': 'raisebore-reamer',
  'Raise Bore Cutters': 'raisebore-reamer',     // the cutters are what dress the head
  'Drill Stems': 'drill-stem',
  'Pilot Bits': 'raisebore-pilot-bit',
  'Rotary Drive Heads (KDK)': 'rotary-drive-head',
  'Casing Rotators': ['casing-rotator', 'rotary-drive-head'],
  'Casing Oscillators': ['casing-oscillator', 'rotary-drive-head'],
  'Casing Drivers': ['casing-driver', 'rotary-drive-head'],

  /* B. Drilling Tools & Consumables */
  'Button Bits': 'button-bit',
  'Tricone Bits': 'tricone-bit',
  'PDC Bits': 'pdc-bit',
  'Drag / Wing Bits': 'drag-bit',
  'Core Bits': 'core-bit',
  'DTH Bits': 'dth-bit',
  'Ring Bits': 'ring-bit',
  // A headline subcategory (PLATFORM_TRUTH Part C): the sacrificial bit is
  // drilled in and left in the ground on the anchor bar. It is not a lost
  // ring bit and it is certainly not a pallet of supplies.
  'Sacrificial / Lost Bits': 'sda-bit',
  'Reamers & Hole Openers': ['pilot-reamer', 'backreamer'],
  'Shank Adapters': 'shank-adapter',
  'Coupling Sleeves': 'coupling-sleeve',
  // A drifter is the machine on the feed beam. It is NOT a DTH hammer — that
  // is the whole point of the distinction — so it waits for its own builder
  // instead of borrowing one from the other method.
  'Hydraulic Drifters': ['hydraulic-drifter', 'drifter', 'rock-drill'],
  'Pneumatic Rock Drills': ['pneumatic-rock-drill', 'rock-drill'],
  'DTH Hammers': 'dth-hammer',
  'DTH Shanks': 'dth-shank',
  'DTH Drill Pipes': 'drill-rod',
  'Drill Rods (Threaded)': 'drill-rod',
  'Drill Pipes': 'drill-pipe',
  'Core Drill Rods': 'drill-rod',
  'RC / Dual-Wall': ['rc-drill-rod', 'dual-wall-rod', 'drill-rod'],
  'Drill Collars': 'drill-collar',
  'Accessories': ['saver-sub', 'coupling-sleeve'],
  'Casing Crowns': 'casing-crown',
  'Casing Pipes': 'casing-pipe',
  'Concentric Systems': 'concentric-system',
  'Eccentric Systems (Odex-type)': 'eccentric-system',
  'Ring-Bit Systems': 'ring-bit',
  'Wing-Bit Systems': 'wing-bit-system',
  'Retrievable Casing Systems': 'wing-bit-system',
  'Casing Shoes & Drive Caps': 'casing-shoe',
  'Kelly Augers': 'kelly-auger',
  'CFA & Hollow-Stem Augers': 'cfa-flight',
  'Auger Flights': 'cfa-flight',
  'Drilling Buckets': 'drilling-bucket',
  'Clean-Out Buckets': 'cleaning-bucket',
  'Foundation Core Barrels': 'foundation-core-barrel',
  'Belling / Under-Reaming Tools': 'belling-tool',
  'Expansion Reamers': 'belling-tool',
  'Kelly Bars & Extensions': ['kelly-bar', 'drill-rod'],
  'Cross Cutters & Boulder Extractors': 'cross-cutter',
  'Round-Shank / Point-Attack Picks': 'round-shank-pick',
  'Flat / Chisel Picks': 'chisel-pick',
  'Tool Holders & Pick Boxes': 'tool-holder',
  'Shock Absorbers': 'shock-absorber',
  'Drive Adapters': ['drive-adapter', 'coupling-sleeve'],
  'Flushing Swivels': 'flushing-swivel',
  'High-Pressure Swivels': 'flushing-swivel',
  'Concrete & Grout Swivels': 'flushing-swivel',

  /* C. Fluids, Air & Power */
  'Mud Pumps': 'pump-skid',
  'Centrifugal Pumps': 'pump-skid',
  'Mixing & Recycling': ['mud-plant', 'pump-skid'],
  'Mud Tanks': ['mud-tank'],
  'Shale Shakers': 'shale-shaker',
  // A cone stack is not a shaker deck: no borrowing across solids-control kit.
  'Desanders & Desilters': ['desander-cone', 'mud-cleaner'],
  'Drilling Fluids & Additives': null,          // sacks, drums and big bags
  'Portable Compressors': 'compressor-skid',
  'Booster Compressors': 'compressor-skid',
  'Generators': 'power-unit',
  'Diesel Engines': 'power-unit',
  'Electric Motors': 'power-unit',
  'Grout Pumps': 'pump-skid',
  'Mixers & Plants': ['grout-plant', 'pump-skid'],
  'Jet Grouting Monitors & Nozzles': ['jet-monitor', 'flushing-swivel'],

  /* D. Downhole & Well */
  'Mud Motors': 'mud-motor',
  'MWD/LWD': 'mwd-collar',
  'Steering Tools': ['steering-tool', 'mwd-collar'],
  'Survey Tools': ['survey-tool', 'gyro-tool'],
  'Blowout Preventers': 'bop-stack',
  'BOP Control Units': ['bop-control-unit', 'accumulator-unit'],
  'Choke & Kill Manifolds': ['choke-manifold'],
  'Wellheads & Casing Heads': 'wellhead',
  'Wireline Core Barrels (WL/Q-Series)': 'core-barrel',
  'Conventional Core Barrels': 'core-barrel',
  'Reaming Shells': 'reaming-shell',
  'Core Lifters & Catchers': ['core-lifter'],
  'SPT Samplers & Hammers': ['spt-sampler', 'spt-hammer', 'split-spoon-sampler'],
  'CPT': ['cpt-cone', 'cpt-probe'],
  'Dynamic Probing DPL/DPM/DPH/DPSH': ['dp-probe', 'cpt-cone'],
  'Drive & Liner Samplers': ['liner-sampler', 'spt-sampler'],
  'Cable-Tool Tools': ['cable-tool-chisel', 'cable-tool-bit'],
  'Monitoring Well Risers & Screens': 'casing-pipe',

  /* E. Ground Engineering & Anchoring */
  'Hollow Anchor Bars': 'sda-bar',
  'Couplers': 'sda-coupler',
  'Bearing & Domed Plates': 'bearing-plate',
  'GEWI Threadbar': ['threadbar', 'sda-bar'],
  'Driven Steel Pipe Piles (RR)': ['pipe-pile', 'casing-pipe'],
  'Drilled Steel Pipe Piles (RD)': ['pipe-pile', 'casing-pipe'],
  /* 'Rock Bolts' IS DELIBERATELY ABSENT, and must stay absent.
     The leaf holds two DIFFERENT objects: a friction bolt is a slotted tube
     you drive, a rebar bolt is a threaded bar you grout into resin. There has
     never been a `rock-bolt` builder, so the old ['rock-bolt', 'friction-bolt']
     fell through to `friction-bolt` and drew every resin-anchored rebar
     listing as a split tube. A leaf entry is consulted BEFORE core/preview.js's
     matcher and therefore forces ONE shape on the whole leaf, so no single
     entry here can be right. preview.js separates them by name — friction
     bolt / split-set / split-tube against rebar bolt / resin-anchored — and
     that routing is verified against the real renderer. Defer to it. */
  'Resin Cartridges': 'resin-cartridge',
  /* 'Mesh, Surface Support & Grout' IS ALSO DELIBERATELY ABSENT, for the same
     reason: a weldmesh sheet has a mechanical form and a bag of grout does
     not. One leaf, two answers, so preview.js decides per listing. */
  'Anchor Install & Stressing Equipment': ['stressing-jack'],

  /* F. Components, Parts & Hardware */
  'Breakout Wrenches': ['breakout-wrench', 'power-tong'],
  'Clamping Jaws': ['clamping-jaws', 'rod-holder'],
  'Centralizers & Rod Holders': ['rod-holder'],
  'Hardware & Fasteners': null,
  'General Spares & Consumables': null,

  /* G. Ground, Site & Services — the crate is the honest answer here. */
  'Water Supply, Dewatering & Pumps': 'pump-skid',
  'Sensors & Transducers': null,
  'Telemetry': null,
  'PLC Controllers': null,
  'Personal Protective Equipment': null,
  'Workshop Equipment': null,
  'Transport, Handling & Lifting': null,
  'Equipment Rental': null,
  'Drilling Services': null,
  'Maintenance & Repair': null,
  'Operator Services': null,
};

/** The handful of items whose leaf is right but whose object is not typical. */
const ITEM_MODEL = {
  'sonic-core-barrel-100': 'core-barrel',   // filed under Core Drill Rods, but it is a barrel
};

/** data.js prefixes every service listing `svc-`, wherever it is filed. */
const SERVICE_ID = /^svc-/;

/**
 * Every id rig/tools.js can build, or null until the module has been read.
 * Resolution never returns an id that is not in here, so a forward-declared
 * builder cannot produce a bare billet before it exists.
 */
let BUILDER_IDS = null;
let builderPromise = null;

/**
 * Read the builder registry once. Safe to call from anywhere, any number of
 * times; resolves `true` the first time it actually populates the set so a
 * screen can repaint the previews it drew before the answer arrived.
 * @returns {Promise<boolean>}
 */
export function primeBuilderIds() {
  if (BUILDER_IDS) return Promise.resolve(false);
  if (!builderPromise) {
    builderPromise = import('../../rig/tools.js')
      .then((m) => {
        const ids = typeof m.listTools === 'function'
          ? m.listTools()
          : Object.keys(m.TOOL_BUILDERS || {}).concat(Object.keys(m.TOOL_ALIASES || {}));
        BUILDER_IDS = new Set(ids);
        return true;
      })
      .catch(() => { BUILDER_IDS = new Set(); return false; });
  }
  return builderPromise;
}
primeBuilderIds();

function pickBuilder(entry) {
  if (entry === null) return null;
  const list = typeof entry === 'string' ? [entry] : entry;
  if (!Array.isArray(list)) return undefined;
  if (!BUILDER_IDS) return undefined;                  // not read yet — defer
  for (const id of list) if (BUILDER_IDS.has(id)) return id;
  return undefined;                                    // not built yet — defer
}

/**
 * Resolve one item to a tools.js builder id.
 * @returns {string|null|undefined}
 *   string    — build this.
 *   null      — no mechanical form; the supply crate is correct.
 *   undefined — no opinion; leave it to core/preview.js.
 */
export function resolveModelId(item) {
  if (!item) return undefined;
  if (item.model) return item.model;
  const id = String(item.id || '');
  if (SERVICE_ID.test(id)) return null;
  if (Object.prototype.hasOwnProperty.call(ITEM_MODEL, id)) return pickBuilder(ITEM_MODEL[id]);
  const raw = catLeaf(item.category);
  for (const leaf of [raw, subLabel(raw)]) {
    if (leaf && Object.prototype.hasOwnProperty.call(LEAF_MODEL, leaf)) return pickBuilder(LEAF_MODEL[leaf]);
  }
  return undefined;
}

/**
 * A ref to hand core/preview.js for one listing.
 *
 * `{ model }` is how a resolved builder is passed through — preview.modelIdFor
 * honours it before it starts pattern-matching. There is no equivalent way to
 * say "no model, use the crate", because a falsy `model` just falls through to
 * the matcher, so that case is expressed by handing over a ref with nothing in
 * it for the matcher to bite on. `label` is inert today and carried so a
 * future labelled crate has the name to put on the drum.
 */
export function previewRefFor(listing) {
  const item = (listing && listing.item) || listing;
  if (!item) return listing;
  const model = resolveModelId(item);
  if (model === undefined) return item;
  if (model === null) {
    return { id: '', name: '', category: '', slot: '', label: item.name || '', supply: true };
  }
  return { ...item, model };
}

/* ── Strata helper — build Stratum[] from a contract profile ────────────── */
export function strataFromProfile(profile, target = 0) {
  const out = [];
  let top = 0;
  for (const seg of profile || []) {
    const g = GROUND[seg.g] || GROUND.clay;
    out.push({
      id: seg.g, name: g.name, top, bottom: seg.to,
      ucs: g.ucs, abrasivity: g.abrasivity, stability: g.stability, water: g.water,
      colors: g.colors, pattern: g.pattern, grain: g.grain, bestMethods: [],
    });
    top = seg.to;
  }
  if (target && top < target) {
    const last = out[out.length - 1];
    if (last) last.bottom = target;
  }
  return out;
}

/** Grade thresholds used by RESULTS when no sim grade is supplied. */
export const GRADES = ['D', 'C', 'B', 'A', 'S'];

/**
 * Contextual site actions — the ONE primary button at the bottom right.
 *
 * `bail` is the stringless equivalent of `rod`: a spudder has no rod to add,
 * so its cadence is pulling the tool and running the bailer (EVENTS.BAILER_RUN
 * in core/contract.js). `beat` is the generic timing window every new method's
 * programme opens — pitching a pile into the leaders, indexing the cradle
 * round a fan, the boom setting up on the next hole group — and `release` is
 * the SPT free-fall rhythm, which is the operator's attention sampled rather
 * than one tap per blow.
 */
export const SITE_ACTIONS = {
  idle:    { id: 'idle',    label: 'Hold',        sub: 'Steady on the groove',   kind: 'ghost' },
  rod:     { id: 'rod',     label: 'Stab Rod',    sub: 'Timing window open',     kind: 'amber' },
  bail:    { id: 'bail',    label: 'Run Bailer',  sub: 'Lift the cuttings out',  kind: 'amber' },
  beat:    { id: 'beat',    label: 'On The Beat', sub: 'Timing window open',     kind: 'amber' },
  release: { id: 'release', label: 'Release',     sub: 'Clean free fall',        kind: 'amber' },
  jam:     { id: 'jam',     label: 'Work Free',   sub: 'String is stuck',        kind: 'danger' },
  kick:    { id: 'kick',    label: 'Kill Feed',   sub: 'Lost return',            kind: 'danger' },
  casing:  { id: 'casing',  label: 'Set Casing',  sub: 'Hole is collapsing',     kind: 'steel' },
  trip:    { id: 'trip',    label: 'Trip Out',    sub: 'Crown is finished',      kind: 'warning' },
};


/* ═══════════════════════════════════════════════════════════════════════════
   LIVE DATA BRIDGE

   game/data.js is the ONLY content authority. When the integrator hands it to
   the UI (ctx.game), every lookup below reads it and normalises it onto the
   field names the screens read.

   WITHOUT IT THESE RETURN EMPTY, NOT SUBSTITUTES. A list accessor returns `[]`
   and a lookup returns `null`; screens render an explicit empty state. There
   is deliberately nothing to fall back ON — see the file header. An id that
   data.js does not know also returns `null`, so a stale save or a renamed id
   surfaces as a visible gap instead of silently resolving to the wrong row.
   ═══════════════════════════════════════════════════════════════════════════ */

let G = null;
const _norm = new Map();

/** @param {object|null} g  the game/data.js namespace, or null to detach. */
export function useGameData(g) {
  G = (g && (g.METHODS || g.ITEMS || g.CERTS || g.REGIONS)) ? g : null;
  _norm.clear();
  return !!G;
}
export const hasGameData = () => !!G;

const memo = (key, make) => {
  if (_norm.has(key)) return _norm.get(key);
  const v = make();
  _norm.set(key, v);
  return v;
};
const pick = (list, id) => (Array.isArray(list) ? list.find((x) => x && x.id === id) : null);

/* ── Methods ─────────────────────────────────────────────────────────────── */
/**
 * `scoredOn` is game/data.js's own one-line statement of what the method is
 * JUDGED on, and on six methods that is not metres — it is the bag, the round,
 * the ring's toes, the bolt's anchorage, the pile's set, the sounding's log.
 * RESULTS prints it verbatim instead of assuming depth. It is passed through
 * rather than restated here, because a second copy of it would drift.
 *
 * `sectionMode` and `hasDrillString` travel for the same reason: a method with
 * no drill string has no rod to add, and the HUD must not offer one.
 *
 * @returns {{id,name,short,level,note,scoredOn,sectionMode,hasDrillString}|null}
 */
export function methodInfo(id) {
  if (!G || !id) return null;
  return memo('m:' + id, () => {
    const m = (typeof G.getMethod === 'function' ? G.getMethod(id) : null) || pick(G.METHODS, id);
    if (!m) return null;
    return {
      id: m.id, name: m.name,
      short: m.short || m.abbr || String(m.name || '').slice(0, 4).toUpperCase(),
      level: m.level ?? m.unlockLevel ?? 1,
      note: m.note || m.description || '',
      scoredOn: m.scoredOn || '',
      sectionMode: m.sectionMode || 'vertical',
      hasDrillString: m.hasDrillString !== false,
    };
  });
}

/* ── Regions ─────────────────────────────────────────────────────────────── */
/**
 * `tint` keys a lighting/colour recipe, not a factual claim, so a region that
 * does not name one gets the neutral default rather than nothing.
 * @returns {{id,name,country,level,tint}|null}
 */
export function regionInfo(id) {
  if (!G || !id) return null;
  return memo('r:' + id, () => {
    const r = (typeof G.getRegion === 'function' ? G.getRegion(id) : null) || pick(G.REGIONS, id);
    if (!r) return null;
    return {
      id: r.id, name: r.name,
      country: r.country || r.flavour || '',
      level: r.level ?? r.unlockLevel ?? 1,
      tint: r.tint || 'forest',
    };
  });
}
export const allRegions = () => (G && G.REGIONS ? G.REGIONS.map((r) => regionInfo(r.id)).filter(Boolean) : []);
export const allMethods = () => (G && G.METHODS ? G.METHODS.map((m) => methodInfo(m.id)).filter(Boolean) : []);

/* ── Certifications ──────────────────────────────────────────────────────── */
/** @returns {{id,name,issuer,months,cost,note,minLevel,prereq,unlocksRegions,unlocksApplications}|null} */
export function certInfo(id) {
  if (!G || !id) return null;
  return memo('c:' + id, () => {
    const c = (typeof G.getCert === 'function' ? G.getCert(id) : null) || pick(G.CERTS, id);
    if (!c) return null;
    return {
      id: c.id, name: c.name,
      issuer: c.issuer || '',
      months: c.months ?? c.validityMonths ?? 24,
      cost: c.cost ?? c.price ?? 0,
      note: c.note || c.description || '',
      minLevel: c.minLevel ?? 1,
      prereq: c.prereq || [],
      unlocksRegions: c.unlocksRegions || [],
      unlocksApplications: c.unlocksApplications || [],
    };
  });
}
export const allCerts = () => (G && G.CERTS ? G.CERTS.map((c) => certInfo(c.id)).filter(Boolean) : []);

/* ── Roles ─────────────────────────────────────────────────────────────────
   Day rate is THE Drillity Talent compensation field (EUR/day, never a
   salary — PLATFORM_TRUTH Part B), so it is carried through, not discarded,
   along with the Talent job function and specialisation.                   */
export function allRoles() {
  if (!G || !G.ROLES) return [];
  return memo('roles', () => G.ROLES.map((r) => ({
    id: r.id, title: r.title || r.name, level: r.level ?? 1,
    dayRate: r.dayRate ?? r.rate ?? 0,
    talentFunction: r.talentFunction || '',
    talentSpecialisation: r.talentSpecialisation || null,
    branch: r.branch || r.group || r.talentFunction || '',
    description: r.description || '',
  })));
}
/**
 * The role held at a given level. Returns `null` with no ladder — callers show
 * a placeholder rather than inventing a job title for the player.
 * @returns {{id,title,level,dayRate,talentFunction,talentSpecialisation,branch,description}|null}
 */
export function roleAt(level) {
  const list = allRoles();
  if (!list.length) return null;
  let out = list[0];
  for (const r of list) if (level >= r.level) out = r;
  return out || null;
}

/* ── Rigs ────────────────────────────────────────────────────────────────── */
export function rigInfo(id) {
  if (!G || !id) return null;
  return memo('rig:' + id, () => {
    const r = (typeof G.getRig === 'function' ? G.getRig(id) : null) || pick(G.RIGS, id);
    if (!r) return null;
    const st = r.stats || {};
    // game/data.js families carry a full breadcrumb; a card wants the leaf.
    const famRaw = r.family && typeof r.family === 'object'
      ? (r.family.name || r.family.label || r.family.id)
      : r.family;
    const fam = famRaw ? String(famRaw).split(/\s*(?:→|>|\/)\s*/).pop() : null;
    return {
      id: r.id, name: r.name,
      klass: r.klass || r.class || fam || (r.maker ? `${r.maker} drilling rig` : 'Drilling rig'),
      level: r.level ?? r.unlockLevel ?? 1,
      price: r.price ?? 0,
      methods: r.methods || r.supportedMethods || [],
      power: Math.round(r.power ?? st.power ?? 0),
      torque: Math.round((r.torque ?? st.torque ?? 0) * 10) / 10,
      depth: Math.round(r.depth ?? st.depthCapacity ?? st.maxDepth ?? 0),
      mast: r.mast ?? st.mastHeight ?? 0,
      weight: r.weight ?? r.transportTons ?? st.weight ?? 0,
      note: r.note || r.description || '',
      // Full `SuperGroup → Family → Subcategory` breadcrumb — the shop tree
      // is built from these, so it must survive the mapping.
      family: famRaw ? String(famRaw) : '',
      maker: r.maker || '',
      feedForce: st.feedForce ?? 0,
      upkeepPerHour: r.upkeepPerHour ?? 0,
      fuelPerHour: r.fuelPerHour ?? 0,
    };
  });
}
export const allRigs = () => (G && G.RIGS ? G.RIGS.map((r) => rigInfo(r.id)).filter(Boolean) : []);

/* ── Skill tree ──────────────────────────────────────────────────────────── */
/**
 * game/data.js authors skills as a prerequisite graph with no coordinates.
 * The tree screen needs a grid, so rank each node by its dependency depth and
 * spread siblings across three columns.
 */
export function skillTree() {
  if (!G || !G.SKILLS) return { branches: [], skills: [] };
  return memo('tree', () => {
    const branches = (G.SKILL_BRANCHES || []).map((b) => ({
      id: b.id, name: b.name,
      blurb: b.blurb || b.description || '',
      description: b.description || b.blurb || '',
      accent: b.accent || 'amber',
    }));
    const byId = new Map(G.SKILLS.map((s) => [s.id, s]));

    const depthOf = (s, seen = new Set()) => {
      const pre = s.needs || s.prereq || [];
      if (!pre.length || seen.has(s.id)) return 0;
      seen.add(s.id);
      let d = 0;
      for (const pid of pre) {
        const p = byId.get(pid);
        if (p) d = Math.max(d, depthOf(p, seen) + 1);
      }
      return d;
    };

    const skills = [];
    for (const b of branches) {
      const mine = G.SKILLS.filter((s) => s.branch === b.id);
      const rows = new Map();
      for (const s of mine) {
        const d = depthOf(s);
        if (!rows.has(d)) rows.set(d, []);
        rows.get(d).push(s);
      }
      let row = 0;
      for (const d of [...rows.keys()].sort((a, x) => a - x)) {
        const group = rows.get(d);
        // Three to a row keeps the graph inside a portrait column.
        for (let i = 0; i < group.length; i += 3) {
          const slice = group.slice(i, i + 3);
          const cols = slice.length === 1 ? [1] : slice.length === 2 ? [0, 2] : [0, 1, 2];
          slice.forEach((s, k) => {
            const costs = Array.isArray(s.cost) ? s.cost : [s.cost || 1];
            const max = s.maxRank ?? s.max ?? 1;
            const needs = s.needs || s.prereq || [];
            const effect = s.effect || s.description || '';
            skills.push({
              id: s.id, branch: s.branch, row, col: cols[k],
              name: s.name,
              // Both spellings, so a consumer reading either shape is correct.
              max, maxRank: max,
              cost: costs[0] || 1, costs,
              effect, description: effect,
              needs, prereq: needs,
              minLevel: s.minLevel ?? 1,
            });
          });
          row++;
        }
      }
    }
    return { branches, skills };
  });
}

/* ── Loadout slots ─────────────────────────────────────────────────────────
   game/data.js owns the real slot list (14 bays, five of them core). The UI
   only needs id / name / icon / hint.                                       */
export function allSlots() {
  if (!G || !Array.isArray(G.SLOTS) || !G.SLOTS.length) return [];
  return memo('slots', () => G.SLOTS.map((s) => ({
    id: s.id,
    name: SLOT_NAMES[s.id] || s.name || s.id,
    icon: SLOT_ICONS[s.id] || 'cart',
    hint: s.desc || s.hint || '',
    core: s.core !== false,
  })));
}
/**
 * One bay. Falls back to a shim built from the id itself — that is a display
 * label, not a content claim, so it invents nothing; it only spares every call
 * site a null check for a bay data.js has not named.
 */
export const slotInfo = (id) => allSlots().find((s) => s.id === id)
  || { id, name: SLOT_NAMES[id] || id, icon: SLOT_ICONS[id] || 'cart', hint: '', core: false };

/* ═══════════════════════════════════════════════════════════════════════════
   iMARKET — listings and the browse tree

   PLATFORM_TRUTH Part A: a listing is one piece of equipment, sitting in
   exactly ONE subcategory. Everything else — thread, material, size, duty,
   condition — is a filterable FACET. So:
     • the tree is DERIVED from the distinct `category` breadcrumbs, never
       hand-declared, which is why it is always the real taxonomy;
     • condition is a listing facet, so one product can appear as a new
       listing and as a used one at a different price and a different
       starting wear.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Everything sellable: tools and consumables plus the machines. */
export function allItems() {
  const items = (G && (G.ITEMS || G.items)) || null;
  if (!items || !items.length) return [];
  const rigs = (G && Array.isArray(G.RIGS) && G.RIGS.length) ? G.RIGS : [];
  return memo('allitems:' + items.length + ':' + rigs.length, () => {
    const out = items.slice();
    // Rigs are listings too — iMarket splits capacity into heavy equipment and
    // parts/consumables, and both live in the same taxonomy.
    for (const r of rigs) {
      if (!r || !r.family) continue;
      out.push({
        ...r,
        slot: 'rig', category: String(r.family), consumable: false,
        unlockLevel: r.unlockLevel ?? r.level ?? 1,
        description: r.description || r.note || '',
        thread: r.thread || 'n/a',
        material: r.material || 'S355J2',
        duty: r.duty || 'standard',
        tier: r.tier || 'std',
        stats: {
          ropMult: 1, wearRate: 1, maxUCS: 0, abrasionRes: 0.5, flushRate: 0,
          torqueCap: r.stats?.torque ?? r.torque ?? 0, life: 0,
        },
      });
    }
    return out;
  });
}

/** Stable 32-bit hash — listing variants must not reshuffle between renders. */
function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

/**
 * The condition facet for one product. Every product has a new listing; some
 * also have exactly one second-hand listing, chosen deterministically.
 * @returns {string[]} condition ids
 */
function conditionsFor(item) {
  const h = hash32(String(item.id));
  const out = ['new'];
  const wears = (item.stats?.life || 0) > 0 || item.slot === 'rig' || !item.consumable;
  if (!wears) return out;
  const r = h % 11;
  if (r === 0 || r === 1) out.push('used');
  else if (r === 2 || r === 3) out.push('refurb');
  else if (r === 4 && (item.stats?.life || 0) > 0) out.push('parts');
  return out;
}

/** A jittered but stable multiplier so used listings are not all identical. */
function jitter(seed, spread) {
  return 1 + ((hash32(seed) % 1000) / 1000 - 0.5) * spread;
}

/**
 * Every iMarket listing. A listing is `{ id, itemId, item, condition, price,
 * startCondition, path, group, family, sub, ... }`.
 */
export function shopListings() {
  const items = allItems();
  const key = 'listings:' + items.length;
  return memo(key, () => {
    const out = [];
    for (const item of items) {
      const path = String(item.category || '');
      const parts = catParts(path);
      if (parts.length < 3) continue;               // not a taxonomy leaf — skip
      const [group, family] = [parts[0], parts[1]];
      const sub = subLabel(parts[parts.length - 1]);
      for (const cid of conditionsFor(item)) {
        const cond = conditionById(cid);
        const isNew = cid === 'new';
        const f = isNew ? 1 : cond.factor * jitter(item.id + cid, 0.16);
        out.push({
          id: isNew ? item.id : `${item.id}~${cid}`,
          itemId: item.id,
          item,
          name: item.name || item.id,
          slot: item.slot || 'bit',
          condition: cid,
          conditionName: cond.name,
          conditionNote: cond.note,
          basePrice: item.price || 0,
          price: Math.max(1, Math.round((item.price || 0) * f)),
          startCondition: isNew ? 1 : Math.max(0.08, Math.min(1, cond.start * jitter(item.id + cid + 'w', 0.22))),
          path, group, family, sub,
          thread: item.thread && item.thread !== 'n/a' ? item.thread : '',
          material: item.material || '',
          duty: item.duty || 'standard',
          // The two remaining PLATFORM_TRUTH Part A listing facets, resolved
          // once at ingestion so the facet row can count them without
          // re-deriving anything per render.
          dutyId: dutyId(item.duty),
          listingType: listingTypeOf(item),
          tier: item.tier || 'std',
          unlockLevel: item.unlockLevel ?? 1,
          methods: item.methods || [],
          consumable: !!item.consumable,
          description: item.description || item.blurb || '',
          stats: item.stats || {},
        });
      }
    }
    return out;
  });
}

/**
 * Browse tree, derived from the listings' own breadcrumbs.
 * @returns {{code:string,name:string,families:{name:string,subs:{name:string,count:number}[],count:number}[],count:number}[]}
 */
export function shopTree() {
  const listings = shopListings();
  const key = 'tree:' + listings.length;
  return memo(key, () => {
    const groups = new Map();
    for (const l of listings) {
      let g = groups.get(l.group);
      if (!g) { g = { name: l.group, families: new Map(), count: 0 }; groups.set(l.group, g); }
      g.count++;
      let f = g.families.get(l.family);
      if (!f) { f = { name: l.family, subs: new Map(), count: 0 }; g.families.set(l.family, f); }
      f.count++;
      f.subs.set(l.sub, (f.subs.get(l.sub) || 0) + 1);
    }
    const order = new Map(SUPERGROUPS.map((s, i) => [s.name, i]));
    const famOrder = new Map(FAMILY_ORDER.map((n, i) => [n, i]));
    const famRank = (n) => (famOrder.has(n) ? famOrder.get(n) : 999);
    const codeOf = (name) => (SUPERGROUPS.find((s) => s.name === name) || {}).code || '·';
    return [...groups.values()]
      .sort((a, b) => (order.has(a.name) ? order.get(a.name) : 99) - (order.has(b.name) ? order.get(b.name) : 99))
      .map((g) => ({
        code: codeOf(g.name),
        name: g.name,
        count: g.count,
        families: [...g.families.values()]
          .sort((a, b) => famRank(a.name) - famRank(b.name) || b.count - a.count || a.name.localeCompare(b.name))
          .map((f) => ({
            name: f.name,
            count: f.count,
            subs: [...f.subs.entries()]
              .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
              .map(([name, count]) => ({ name, count })),
          })),
      }));
  });
}

/** Listings in one subcategory leaf, matched on the breadcrumb leaf itself. */
export const listingsInSub = (subName) => shopListings().filter((l) => l.sub === subName);
