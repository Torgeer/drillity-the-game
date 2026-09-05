/**
 * DRILLITY I THE GAME — static content tables.
 *
 * Everything in this file traces back to the real Drillity taxonomy documented
 * in DOMAIN.md: the 7 iMarket super-groups, the drilling-method facet, the
 * scoped connection vocabularies (never mixed across segments), the material
 * grades, and the Drillity Talent career ladder / certification set.
 *
 * Rules obeyed here:
 *   - Every `category` string is `SuperGroup → Family → Subcategory` from the
 *     real taxonomy tree (DOMAIN.md §3).
 *   - Threads are segment-scoped (DOMAIN.md §4). A percussion rod never carries
 *     an API REG thread; a Kelly tool never carries a T45.
 *   - Rig names evoke the real brand landscape (DOMAIN.md §6) but copy no real
 *     model designation.
 *   - Prices are EUR and sit in the real order of magnitude. NO PRICE IN THIS
 *     FILE IS A CATALOGUE FIGURE: every western catalogue for this kit is
 *     login-gated or quote-only, so prices are game-balance judgement at the
 *     right order of magnitude and must never be presented as a quotation.
 *     Where even the order of magnitude is a guess the item carries
 *     `priceSourced: false` and a `needs` note, and no screen may print it as
 *     fact (PLATFORM_TRUTH.md Part C rule 7). Dimensions, energies, lengths,
 *     threads and blow counts are different: those trace to research/01-13 and
 *     are cited at the item.
 *
 * Pure data + pure query helpers. No imports from three.js, no side effects.
 */

import { GROUND, makeRandom, clamp } from '../core/contract.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Freeze helper — every exported table is deeply immutable.
   ═══════════════════════════════════════════════════════════════════════════ */
/** @template T @param {T} o @returns {Readonly<T>} */
function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const k of Object.keys(o)) deepFreeze(o[k]);
  }
  return o;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUPER-GROUPS — the 7 top-level iMarket groups (DOMAIN.md §3).
   ═══════════════════════════════════════════════════════════════════════════ */
export const SUPERGROUPS = deepFreeze({
  MACHINES:   'Machines & Rigs',
  TOOLS:      'Drilling Tools & Consumables',
  FLUIDS:     'Fluids, Air & Power',
  DOWNHOLE:   'Downhole & Well',
  GROUNDENG:  'Ground Engineering & Anchoring',
  COMPONENTS: 'Components, Parts & Hardware',
  SITE:       'Ground, Site & Services',
});

const M = SUPERGROUPS.MACHINES;
const T = SUPERGROUPS.TOOLS;
const F = SUPERGROUPS.FLUIDS;
const D = SUPERGROUPS.DOWNHOLE;
const G = SUPERGROUPS.GROUNDENG;
const C = SUPERGROUPS.COMPONENTS;
const S = SUPERGROUPS.SITE;

/** Canonical `SuperGroup → Family → Subcategory` paths used by ITEMS/RIGS. */
export const CAT = deepFreeze({
  // A. Machines & Rigs
  rigRotary:      `${M} → Drilling Rigs → Rotary Drilling Rigs`,
  rigTopHammer:   `${M} → Drilling Rigs → Top Hammer / Surface Drill Rigs`,
  rigDTH:         `${M} → Drilling Rigs → DTH Surface Rigs`,
  rigSonic:       `${M} → Drilling Rigs → Sonic Drill Rigs`,
  rigCore:        `${M} → Drilling Rigs → Core / Exploration Rigs`,
  rigGeotech:     `${M} → Drilling Rigs → Geotechnical Drill Rigs`,
  rigFoundation:  `${M} → Drilling Rigs → Foundation Drill Rigs`,
  rigAnchor:      `${M} → Drilling Rigs → Anchor & Micropile Rigs`,
  rigMulti:       `${M} → Drilling Rigs → Multi-Purpose Rigs`,
  rigOilGas:      `${M} → Drilling Rigs → Oil & Gas Drilling Rigs`,
  hddRigs:        `${M} → HDD & Trenchless → HDD Rigs`,
  hddPipe:        `${M} → HDD & Trenchless → HDD Drill Pipe`,
  hddReamers:     `${M} → HDD & Trenchless → Backreamers & Hole Openers`,
  hddHeads:       `${M} → HDD & Trenchless → Pilot & Steering Heads`,
  hddPulling:     `${M} → HDD & Trenchless → Pulling Heads, Eyes & Swivels`,
  hddSonde:       `${M} → HDD & Trenchless → Sonde & Bent Housings`,
  hddLocating:    `${M} → HDD & Trenchless → Locating & Steering Systems`,
  raiseBore:      `${M} → Tunneling & Underground → Raise Bore Equipment`,
  raiseReamer:    `${M} → Tunneling & Underground → Reamer Heads`,
  raiseCutters:   `${M} → Tunneling & Underground → Raise Bore Cutters`,
  raiseStems:     `${M} → Tunneling & Underground → Drill Stems`,
  raisePilot:     `${M} → Tunneling & Underground → Pilot Bits`,
  jumbos:         `${M} → Tunneling & Underground → Jumbos`,
  // DOMAIN.md §3 A names "ANFO Loaders" and no separate initiation node, so the
  // charging hose and the shock-tube reel share the charging family. The leaf is
  // the plain industry name for the kit, as with the BOP leaves below.
  anfoLoaders:    `${M} → Tunneling & Underground → ANFO Loaders`,
  impactHammers:  `${M} → Piling Equipment → Impact Hammers`,
  vibroHammers:   `${M} → Piling Equipment → Vibratory Hammers`,
  pileHelmets:    `${M} → Piling Equipment → Helmets & Drive Caps`,
  sheetPiles:     `${M} → Piling Equipment → Sheet Piles`,
  precastPiles:   `${M} → Piling Equipment → Precast Concrete Piles`,
  bearingPiles:   `${M} → Piling Equipment → Bearing Piles (H-Section)`,
  kdk:            `${M} → Casing & Foundation Attachments → Rotary Drive Heads (KDK)`,
  casingRotators: `${M} → Casing & Foundation Attachments → Casing Rotators`,

  // B. Drilling Tools & Consumables
  buttonBits:     `${T} → Drill Bits & Cutting Tools → Button Bits`,
  triconeBits:    `${T} → Drill Bits & Cutting Tools → Tricone Bits`,
  pdcBits:        `${T} → Drill Bits & Cutting Tools → PDC Bits`,
  dragWingBits:   `${T} → Drill Bits & Cutting Tools → Drag / Wing Bits`,
  coreBits:       `${T} → Drill Bits & Cutting Tools → Core Bits`,
  dthBits:        `${T} → Drill Bits & Cutting Tools → DTH Bits`,
  ringBits:       `${T} → Drill Bits & Cutting Tools → Ring Bits`,
  lostBits:       `${T} → Drill Bits & Cutting Tools → Sacrificial / Lost Bits`,
  reamersOpeners: `${T} → Drill Bits & Cutting Tools → Reamers & Hole Openers`,
  shankAdapters:  `${T} → Top Hammer Tools → Shank Adapters`,
  couplingSleeves:`${T} → Top Hammer Tools → Coupling Sleeves`,
  drifters:       `${T} → Top Hammer Tools → Hydraulic Drifters`,
  dthHammers:     `${T} → DTH Tools → DTH Hammers`,
  dthShanks:      `${T} → DTH Tools → DTH Shanks`,
  dthPipes:       `${T} → DTH Tools → DTH Drill Pipes`,
  drillRods:      `${T} → Drill String & Rods → Drill Rods (Threaded)`,
  drillPipes:     `${T} → Drill String & Rods → Drill Pipes`,
  coreRods:       `${T} → Drill String & Rods → Core Drill Rods`,
  dualWall:       `${T} → Drill String & Rods → RC / Dual-Wall`,
  // Sonic drill rod and multi-tube jet grouting rod are their own product
  // families in every OEM catalogue checked — a sonic rod is not a core rod and
  // a jet rod is emphatically not a jet MONITOR. (research/13 §4.2, §4.3.)
  sonicRods:      `${T} → Drill String & Rods → Sonic Drill Rods`,
  jetRods:        `${T} → Drill String & Rods → Jet Grouting Rods (Multi-Tube)`,
  drillCollars:   `${T} → Drill String & Rods → Drill Collars`,
  stringAccess:   `${T} → Drill String & Rods → Accessories`,
  casingCrowns:   `${T} → Casing & Overburden Tools → Casing Crowns`,
  casingPipes:    `${T} → Casing & Overburden Tools → Casing Pipes`,
  concentricSys:  `${T} → Casing & Overburden Tools → Concentric Systems`,
  eccentricSys:   `${T} → Casing & Overburden Tools → Eccentric Systems (Odex-type)`,
  ringBitSys:     `${T} → Casing & Overburden Tools → Ring-Bit Systems`,
  wingBitSys:     `${T} → Casing & Overburden Tools → Wing-Bit Systems`,
  casingShoes:    `${T} → Casing & Overburden Tools → Casing Shoes & Drive Caps`,
  kellyAugers:    `${T} → Rotary & Kelly Foundation Tools → Kelly Augers`,
  cfaAugers:      `${T} → Rotary & Kelly Foundation Tools → CFA & Hollow-Stem Augers`,
  augerFlights:   `${T} → Rotary & Kelly Foundation Tools → Auger Flights`,
  drillBuckets:   `${T} → Rotary & Kelly Foundation Tools → Drilling Buckets`,
  foundBarrels:   `${T} → Rotary & Kelly Foundation Tools → Foundation Core Barrels`,
  bellingTools:   `${T} → Rotary & Kelly Foundation Tools → Belling / Under-Reaming Tools`,
  kellyBars:      `${T} → Rotary & Kelly Foundation Tools → Kelly Bars & Extensions`,
  crossCutters:   `${T} → Rotary & Kelly Foundation Tools → Cross Cutters & Boulder Extractors`,
  picksRound:     `${T} → Ground-Engaging & Cutting Wear Tools → Round-Shank / Point-Attack Picks`,
  picksFlat:      `${T} → Ground-Engaging & Cutting Wear Tools → Flat / Chisel Picks`,
  pickHolders:    `${T} → Ground-Engaging & Cutting Wear Tools → Tool Holders & Pick Boxes`,
  shockAbsorbers: `${T} → Adapters, Couplings & Subs → Shock Absorbers`,
  driveAdapters:  `${T} → Adapters, Couplings & Subs → Drive Adapters`,
  flushSwivels:   `${T} → Flushing, Swivels & Water → Flushing Swivels`,
  hpSwivels:      `${T} → Flushing, Swivels & Water → High-Pressure Swivels`,
  groutSwivels:   `${T} → Flushing, Swivels & Water → Concrete & Grout Swivels`,

  // C. Fluids, Air & Power
  mudPumps:       `${F} → Mud & Fluid Systems → Mud Pumps`,
  mudRecycling:   `${F} → Mud & Fluid Systems → Mixing & Recycling`,
  shaleShakers:   `${F} → Mud & Fluid Systems → Shale Shakers`,
  mudTanks:       `${F} → Mud & Fluid Systems → Mud Tanks`,
  desanders:      `${F} → Mud & Fluid Systems → Desanders & Desilters`,
  fluidsAdditives:`${F} → Mud & Fluid Systems → Drilling Fluids & Additives`,
  compPortable:   `${F} → Pneumatics & Compressors → Portable Compressors`,
  compBooster:    `${F} → Pneumatics & Compressors → Booster Compressors`,
  generators:     `${F} → Power Units & Engines → Generators`,
  groutPumps:     `${F} → Grouting & Injection → Grout Pumps`,
  jetMonitors:    `${F} → Grouting & Injection → Jet Grouting Monitors & Nozzles`,

  // D. Downhole & Well
  mudMotors:      `${D} → Directional Drilling → Mud Motors`,
  surveyTools:    `${D} → Directional Drilling → Survey Tools`,
  mwdLwd:         `${D} → Directional Drilling → MWD/LWD`,
  steeringTools:  `${D} → Directional Drilling → Steering Tools`,
  // "BOP & Well Control" and "Wellhead & Completion" are families in the
  // taxonomy (DOMAIN.md §3, super-group D). The leaf below each is the plain
  // industry name for the kit, not a coined one.
  bopStacks:      `${D} → BOP & Well Control → Blowout Preventers`,
  bopControl:     `${D} → BOP & Well Control → BOP Control Units`,
  chokeManifold:  `${D} → BOP & Well Control → Choke & Kill Manifolds`,
  wellheads:      `${D} → Wellhead & Completion → Wellheads & Casing Heads`,
  coreBarrels:    `${D} → Exploration & Coring → Wireline Core Barrels (WL/Q-Series)`,
  reamingShells:  `${D} → Exploration & Coring → Reaming Shells`,
  coreLifters:    `${D} → Exploration & Coring → Core Lifters & Catchers`,
  // The RC sample train — cyclone, splitter, calico bags. DOMAIN.md §3 D files
  // sampling under Exploration & Coring, and on an RC rig it is half the machine.
  sampling:       `${D} → Exploration & Coring → Geophysical / Logging / Sampling`,
  sptSamplers:    `${D} → Site Investigation & Testing → SPT Samplers & Hammers`,
  cpt:            `${D} → Site Investigation & Testing → CPT`,
  linerSamplers:  `${D} → Site Investigation & Testing → Drive & Liner Samplers`,
  cableToolTools: `${D} → Site Investigation & Testing → Cable-Tool Tools`,
  wellScreens:    `${D} → Site Investigation & Testing → Monitoring Well Risers & Screens`,

  // E. Ground Engineering & Anchoring
  sdaBars:        `${G} → Self-Drilling Anchors (SDA) → Hollow Anchor Bars`,
  sdaCouplers:    `${G} → Self-Drilling Anchors (SDA) → Couplers`,
  sdaPlates:      `${G} → Self-Drilling Anchors (SDA) → Bearing & Domed Plates`,
  threadbar:      `${G} → Threadbar & GEWI Systems → GEWI Threadbar`,
  rockBolts:      `${G} → Rock Bolts, Soil Nails & Cable Bolts → Rock Bolts`,
  cableBolts:     `${G} → Rock Bolts, Soil Nails & Cable Bolts → Cable Bolts`,
  resinCartridge: `${G} → Rock Bolts, Soil Nails & Cable Bolts → Resin Cartridges`,
  boltPlates:     `${G} → Rock Bolts, Soil Nails & Cable Bolts → Bolt Plates & Nuts`,
  meshSupport:    `${G} → Mesh, Surface Support & Grout → Weldmesh & Surface Support`,
  drivenPipePiles:`${G} → Micropiles & Pile Systems → Driven Steel Pipe Piles (RR)`,

  // F. Components, Parts & Hardware
  breakout:       `${C} → Clamping & Breakout Tools → Breakout Wrenches`,
  clampJaws:      `${C} → Clamping & Breakout Tools → Clamping Jaws`,

  // G. Ground, Site & Services
  monitoring:     `${S} → Electrics, Control & Monitoring → Sensors & Transducers`,
  telemetry:      `${S} → Electrics, Control & Monitoring → Telemetry`,
  ppe:            `${S} → Safety & PPE → Personal Protective Equipment`,
  workshop:       `${S} → Workshop & Maintenance Tools → Workshop Equipment`,
  svcRental:      `${S} → Services & Rentals → Equipment Rental`,
  svcDrilling:    `${S} → Services & Rentals → Drilling Services`,
  svcMaintenance: `${S} → Services & Rentals → Maintenance & Repair`,
  svcOperator:    `${S} → Services & Rentals → Operator Services`,
});

/* ═══════════════════════════════════════════════════════════════════════════
   SLOTS — equipment bays on the rig.
   The first five ids match `state.garage.loadout` in core/contract.js exactly
   (`core: true`). The rest are additive: progression.equip() creates the key
   lazily, so the frozen state shape is never violated.
   ═══════════════════════════════════════════════════════════════════════════ */
export const SLOTS = deepFreeze([
  // NOT "Bit / Crown". The same bay holds an auger flight, a drilling bucket
  // and a casing crown, and calling all of those a crown puts a percussion word
  // on a rotary tool. A crown is a CASING crown or a CORE crown; a button bit, a
  // DTH bit, a tricone and a PDC are bits (DOMAIN.md §3 B).
  { id: 'bit',        name: 'Cutting tool',       core: true,  icon: '◍', desc: 'The cutting face. Everything else exists to feed it.' },
  { id: 'rod',        name: 'Drill String',       core: true,  icon: '▮', desc: 'Rods, pipes, Kelly bars — torque and feed to the bit.' },
  { id: 'hammer',     name: 'Hammer / Drifter',   core: true,  icon: '⚒', desc: 'Percussion source, top-of-hole or down-the-hole.' },
  { id: 'compressor', name: 'Compressor',         core: true,  icon: '≋', desc: 'Air for DTH and flushing. Volume before pressure.' },
  { id: 'pump',       name: 'Pump',               core: true,  icon: '⬤', desc: 'Water, mud or grout circulation.' },
  // NOT a cutting tool, and deliberately not the `bit` bay. An SPT split spoon
  // is a SAMPLER that is DRIVEN by a 63.5 kg hammer falling 760 mm; a CPT cone
  // is a SENSOR that is PUSHED at 20 mm/s. Neither rotates, neither cuts and
  // neither makes cuttings, so neither may ever be equipped as a cutting tool.
  // `sim/drilling.js` already resolves these from `loadout.probe`.
  // (research/06-geotech-water-geothermal.md §5 [D1586] / [D5778].)
  { id: 'probe',      name: 'Sampler / Probe',    core: false, icon: '⌇', desc: 'Driven samplers and pushed cones. A test, not a bit — nothing here cuts.' },
  // The RC sample train. On a reverse-circulation rig half the machine is this
  // bay — cyclone, splitter and bags — because the product of the hole is the
  // SAMPLE, and an RC job is scored on recovery and contamination, not metres.
  { id: 'sample',     name: 'Sample Train',       core: false, icon: '⌗', desc: 'Cyclone, splitter and bags. On an RC hole the sample is the product.' },
  // What you leave in the ground on purpose: piles, sheet piles and rock bolts.
  // These are not tools that come home — they are the works themselves.
  { id: 'install',    name: 'Installed Product',  core: false, icon: '⌷', desc: 'Piles, sheet piles and rock bolts — what stays in the ground when you leave.' },
  // Between a piling hammer and the pile head sits a helmet with a dolly and
  // packing in it, and the dolly's condition decides how much of the blow
  // actually reaches the toe. It is the piling equivalent of a bit, and it
  // wears like one. `sim/drilling.js` reads it from `loadout.dolly`.
  { id: 'dolly',      name: 'Helmet / Dolly',     core: false, icon: '⌸', desc: 'Helmet, dolly and packing. It decides how much of the blow reaches the pile toe.' },
  { id: 'shank',      name: 'Shank Adapter',      core: false, icon: '⊥', desc: 'The wear part between drifter and string.' },
  { id: 'coupling',   name: 'Coupling Sleeve',    core: false, icon: '⊟', desc: 'Rod-to-rod joint. Cheap, and the first thing to fail.' },
  { id: 'casing',     name: 'Overburden System',  core: false, icon: '◎', desc: 'Casing advanced with the bit through loose ground.' },
  { id: 'swivel',     name: 'Flushing / Swivel',  core: false, icon: '✳', desc: 'Gets flushing medium into a rotating string.' },
  { id: 'head',       name: 'Rotary Drive Head',  core: false, icon: '⊕', desc: 'Rotary drive / KDK for foundation and CFA work.' },
  { id: 'bha',        name: 'Bottom-Hole Assembly', core: false, icon: '▓', desc: 'Drill collars and stabilisers — the weight on the bit comes from here, not from the mast.' },
  { id: 'mudplant',   name: 'Mud Plant',          core: false, icon: '⧉', desc: 'Tanks, mixing, shakers and cyclones — everything between the pump and the hole.' },
  { id: 'mud',        name: 'Drilling Fluid',     core: false, icon: '≈', desc: 'The mud programme: it lifts cuttings, cools the bit and holds the hole open.' },
  { id: 'wellcontrol',name: 'Well Control',       core: false, icon: '⛔', desc: 'BOP stack, accumulator, choke manifold and wellhead. No well is drilled without it.' },
  { id: 'power',      name: 'Power Unit',         core: false, icon: '⚡', desc: 'Generators and auxiliary power on site.' },
  { id: 'ppe',        name: 'PPE',                core: false, icon: '⛑', desc: 'Safety kit. Gates the harsher regions.' },
  { id: 'workshop',   name: 'Workshop',           core: false, icon: '🛠', desc: 'Field regrind and maintenance capability.' },
  { id: 'service',    name: 'Service / Rental',   core: false, icon: '☰', desc: 'Bought per job, not owned.' },
]);

/** Slot ids that exist in the frozen `state.garage.loadout` shape. */
export const CORE_SLOTS = deepFreeze(SLOTS.filter((s) => s.core).map((s) => s.id));

/* ═══════════════════════════════════════════════════════════════════════════
   SITE ARCHETYPES — THE PHYSICAL SETTING A CONTRACT HAPPENS IN.

   *** This is the field `world/terrain.js` renders from. It is a contract with
   that module: an archetype id names a kind of PLACE, not a kind of work. ***

   WHY IT EXISTS. Until this layer landed, whether a job could happen in a place
   was decided by intersecting `METHODS[].applications` with
   `REGIONS[].applications` — a keyword match. `civil-infrastructure` and
   `foundation-piling` appear in almost every region, so any method claiming
   either landed everywhere, and the generator could and did produce:

     - a cable percussion spudder — a winch, a wire rope, a chisel and a bailer
       — on a North Sea production platform;
     - a 118-tonne Kelly rig on a forestry track;
     - a tunnel jumbo, which is an underground machine, on a surface
       construction site in the Ruhr;
     - a cased CFA pile and an HDD crossing in a Saharan water field.

   None of those are wrong because the *industry* is wrong. They are wrong
   because the **place** is wrong. So the place is now a first-class field, and
   a pairing is legal only when the method, the application AND the region all
   name the same setting:

       archetypesFor(methodId, regionId, applicationId)
         = method.archetypes ∩ region.archetypes ∩ application.archetypes

   An empty intersection means the job cannot happen there, and
   `methodsForRegion()` drops it. `makeContract()` resolves the intersection to
   one archetype and puts it on the contract as `contract.archetype`.

   WHAT AN ARCHETYPE IS NOT. It is not a biome. Sand, snow, forest and altitude
   belong to the REGION, and `terrain.js` already has per-region recipes for
   those. The candidate list this pass started from carried "desert well pad"
   and "permafrost pad" as separate archetypes; both are a `well-pad` in a
   different climate, and splitting them would have written the region's job
   into this table a second time. An archetype is the human and industrial
   configuration of the site — what the machine stands on, what is over its
   head, and how wide the world is around it.

   THE UNDERGROUND RULE, enforced by `validateData()`: `tunnel-jumbo`,
   `longhole`, `rockbolt` and `raise-boring` are machines that live at a level
   underground. They declare `underground-drive` and NOTHING ELSE, and no
   surface site may ever be generated for them.

   @typedef {Object} SiteArchetype
   @property {string} id
   @property {string} name              user-visible
   @property {'surface'|'underground'|'offshore'} plane
          Which world terrain.js builds. `surface` = ground and sky; `offshore`
          = a structure over water, with no ground under the machine at all;
          `underground` = rock on every side, including overhead.
   @property {'open-sky'|'rock-back'|'rock-roof'|'deck'} cover
          What is over and behind the machine.
   @property {string} standing          what the machine is actually set up on
   @property {'street'|'haul-road'|'site-track'|'decline'|'sea-air'} access
          How plant and crew reach it. Flavour and mobilisation, not cost.
   @property {1|2|3|4|5} openness       1 = hemmed in on every side, 5 = open ground
   @property {string} description       one sentence, safe to show
   @property {string} renders           a note TO terrain.js about what to build
   ═══════════════════════════════════════════════════════════════════════════ */
export const SITE_ARCHETYPES = deepFreeze([
  {
    id: 'urban-plot', name: 'Urban Plot', plane: 'surface', cover: 'open-sky',
    standing: 'made ground behind a hoarding', access: 'street', openness: 1,
    description: 'A hoarded plot in a town, hemmed in by buildings, buried services and the hours the neighbours will tolerate.',
    renders: 'Hoarding or fence on three sides, buildings beyond it, a gate onto a public road. Little room to slew and nowhere to stack rods.',
  },
  {
    id: 'infrastructure-corridor', name: 'Infrastructure Corridor', plane: 'surface', cover: 'open-sky',
    standing: 'a working strip along the alignment', access: 'haul-road', openness: 3,
    description: 'A linear alignment — road, rail, pipeline or utility easement — worked from a strip that moves along with the job.',
    renders: 'A long working strip with the alignment running through it: embankment or cutting on one side, open country or live traffic on the other. The rig moves along a line, not around a point.',
  },
  {
    id: 'quarry-bench', name: 'Quarry Bench', plane: 'surface', cover: 'open-sky',
    standing: 'a blasted bench of rock', access: 'haul-road', openness: 4,
    description: 'A worked bench in an aggregate or dimension-stone quarry, drilling a pattern back from the crest.',
    renders: 'A stepped rock face with a level bench in front of it, a crest edge with a stand-off, dust, and the crusher somewhere below.',
  },
  {
    id: 'open-pit-bench', name: 'Open-Pit Bench', plane: 'surface', cover: 'open-sky',
    standing: 'a mine bench drilled on a surveyed grid', access: 'haul-road', openness: 5,
    description: 'A production bench in a large open pit, on a pattern the mine laid out, beside a haul road that never stops.',
    renders: 'The quarry bench geometry an order of magnitude wider — benches receding to the far wall, haul trucks, a surveyed hole grid, and no edge of the property in sight.',
  },
  {
    id: 'tunnel-portal', name: 'Tunnel Portal', plane: 'surface', cover: 'rock-back',
    standing: 'the portal apron in front of the face', access: 'haul-road', openness: 2,
    description: 'The apron and cut at the mouth of a tunnel — still under the sky, but hard against the face that is about to be driven.',
    renders: 'A cut slope or rock face directly behind the machine with a canopy, nets or shotcrete on it; a flat apron in front; spoil and segment stacks to one side.',
  },
  {
    id: 'underground-drive', name: 'Underground Drive', plane: 'underground', cover: 'rock-roof',
    standing: 'the floor of a drive, sublevel or cavern', access: 'decline', openness: 1,
    description: 'A heading, ore drive, sublevel or cavern reached by a decline or an adit — rock on every side, including overhead.',
    renders: 'THE ONLY setting the underground methods ever resolve to. No sky: an arched or square profile with a back and two walls, machine lights and a ventilation bag, supported ground behind and raw rock at the face.',
  },
  {
    id: 'exploration-pad', name: 'Exploration Pad', plane: 'surface', cover: 'open-sky',
    standing: 'a cleared pad on a licence block', access: 'site-track', openness: 4,
    description: 'A pad cut or tracked in on a licence block with no services at all — everything on it was trucked, tracked or flown there, and the hole exists to produce a sample.',
    renders: 'A small clearing in whatever the region grows or freezes, a track leading away, a sump, and core boxes or a cyclone and sample bags. Nothing permanent.',
  },
  {
    id: 'well-pad', name: 'Well Pad', plane: 'surface', cover: 'open-sky',
    standing: 'a graded pad built for the well', access: 'site-track', openness: 4,
    description: 'A graded pad built for a well — water, geothermal or hydrocarbon — with a cellar, tanks and, if it is remote enough, a camp.',
    renders: 'A level graded rectangle with a cellar at its centre, water and mud tanks, pipe racks, and a camp, a farmyard or a residential street at its edge depending on the region.',
  },
  {
    id: 'platform-deck', name: 'Platform Deck', plane: 'offshore', cover: 'deck',
    standing: 'the drill floor of a fixed installation', access: 'sea-air', openness: 1,
    description: 'The drill floor of a fixed offshore installation: no ground under the machine at all, a permit for every task, and a helideck for the only way home.',
    renders: 'Steel everywhere — a drill floor inside a derrick, sea a long way straight down through the grating, cranes, flare and helideck. The ground column starts at the mudline, not under the machine.',
  },
  {
    id: 'marine-spread', name: 'Marine Spread', plane: 'offshore', cover: 'open-sky',
    standing: 'the working deck of a mobile marine unit', access: 'sea-air', openness: 3,
    description: 'A mobile marine unit — a jack-up, a drillship or a geotechnical vessel — working over the side or through a moonpool while it holds station.',
    renders: 'An open working deck with the sea horizon all round it: a moonpool or an over-the-side spread, a heave-compensated tower, and the seastate visible in the motion.',
  },
]);

/* ═══════════════════════════════════════════════════════════════════════════
   APPLICATIONS — the iMarket application facet (DOMAIN.md §2), cross-linked to
   the Drillity Talent industry ids used by drillity-mobile-magic.

   `archetypes` is THE SETTING THE WORK HAPPENS IN — the middle term of the
   three-way intersection described above. It is what stops a broad application
   from dragging a method into a place the work is never done: foundation piling
   is a plot or an alignment, never a bench and never a pad, so a piling rig can
   no longer be advertised on a forestry track merely because the region ticks
   the same industry box.
   ═══════════════════════════════════════════════════════════════════════════ */
export const APPLICATIONS = deepFreeze([
  { id: 'foundation-piling',   name: 'Foundation / Piling',        talentIndustry: 'foundation',    icon: 'Building2',
    // A foundation is under a structure, and a structure is on a plot or on an
    // alignment. Not on a bench, not on a pad, not underground.
    archetypes: ['urban-plot', 'infrastructure-corridor'] },
  { id: 'diaphragm-wall',      name: 'Diaphragm / Slurry Wall',    talentIndustry: 'foundation',    icon: 'Layers',
    archetypes: ['urban-plot', 'infrastructure-corridor'] },
  { id: 'water-well',          name: 'Water Well',                 talentIndustry: 'geotechnical',  icon: 'Droplets',
    // A supply borehole is drilled on a pad made for it, or in a yard behind a
    // building that needs the water.
    archetypes: ['well-pad', 'urban-plot'] },
  { id: 'geothermal',          name: 'Geothermal',                 talentIndustry: 'geotechnical',  icon: 'Flame',
    archetypes: ['well-pad', 'urban-plot'] },
  { id: 'mining',              name: 'Mining',                     talentIndustry: 'mining',        icon: 'Pickaxe',
    // Extraction, not the search for it: a pit bench or a level underground.
    // The greenfield hole belongs to `mineral-exploration`.
    archetypes: ['open-pit-bench', 'underground-drive'] },
  { id: 'tunnelling',          name: 'Tunnelling',                 talentIndustry: 'tunneling',     icon: 'Route',
    archetypes: ['tunnel-portal', 'underground-drive'] },
  { id: 'quarry-construction', name: 'Quarry / Construction',      talentIndustry: 'construction',  icon: 'HardHat',
    archetypes: ['quarry-bench'] },
  { id: 'soil-stabilisation',  name: 'Soil Stabilisation',         talentIndustry: 'geotechnical',  icon: 'Grid',
    archetypes: ['urban-plot', 'infrastructure-corridor'] },
  { id: 'trenching',           name: 'Trenching',                  talentIndustry: 'construction',  icon: 'Minus',
    archetypes: ['infrastructure-corridor', 'urban-plot'] },
  { id: 'site-investigation',  name: 'Site Investigation',         talentIndustry: 'geotechnical',  icon: 'Search',
    // The one application that genuinely goes everywhere — you investigate a
    // site before you build on it, wherever it is. It still cannot reach a
    // bench or a working drive: nobody investigates a hole somebody is already
    // mining.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'well-pad', 'exploration-pad', 'tunnel-portal', 'marine-spread'] },
  { id: 'oil-gas',             name: 'Oil & Gas',                  talentIndustry: 'oil-gas',       icon: 'Fuel',
    archetypes: ['well-pad', 'platform-deck', 'marine-spread'] },
  { id: 'utility-hdd',         name: 'Utility / HDD',              talentIndustry: 'hdd',           icon: 'Drill',
    archetypes: ['infrastructure-corridor', 'urban-plot'] },
  { id: 'anchoring',           name: 'Anchoring / Ground Support', talentIndustry: 'geotechnical',  icon: 'Anchor',
    // Holding ground up, wherever ground is being held up: a retained plot, a
    // cutting, a portal face, a quarry face, or the back of a drive.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'tunnel-portal', 'quarry-bench', 'open-pit-bench', 'underground-drive'] },
  { id: 'environmental',       name: 'Environmental / Remediation',talentIndustry: 'geotechnical',  icon: 'Leaf',
    archetypes: ['urban-plot', 'infrastructure-corridor', 'well-pad'] },
  { id: 'mineral-exploration', name: 'Mineral Exploration',        talentIndustry: 'prospecting',   icon: 'Gem',
    archetypes: ['exploration-pad', 'open-pit-bench', 'underground-drive'] },
  { id: 'offshore-marine',     name: 'Offshore / Marine',          talentIndustry: 'oil-gas',       icon: 'Ship',
    archetypes: ['platform-deck', 'marine-spread'] },
  { id: 'blasting-demolition', name: 'Blasting & Demolition',      talentIndustry: 'mining',        icon: 'Bomb',
    archetypes: ['quarry-bench', 'open-pit-bench', 'urban-plot', 'infrastructure-corridor', 'underground-drive'] },
  { id: 'civil-infrastructure',name: 'Civil Infrastructure',       talentIndustry: 'construction',  icon: 'Bridge',
    // The catch-all that caused the problem. It is still broad, because civils
    // genuinely is, but it is no longer unbounded: there is no civil
    // infrastructure on a quarry bench, on a pit bench, on an exploration pad
    // or offshore.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'tunnel-portal', 'underground-drive'] },
]);

/* ═══════════════════════════════════════════════════════════════════════════
   METHODS — the 14 playable drilling methods (DOMAIN.md §1).
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @typedef {Object} Method
 * @property {string} id
 * @property {string} name
 * @property {string} shortName
 * @property {number} unlockLevel
 * @property {string} description
 * @property {string} icon
 * @property {string[]} rigIds
 * @property {string[]} validGround        GROUND ids from core/contract.js
 * @property {string[]} toolSlots          SLOTS ids this method actually uses
 * @property {'air'|'water'|'mud'|'foam'|'none'} flushMedium
 * @property {[number,number]} depthRange  metres (bore length for HDD)
 * @property {[number,number]} holeDiaRange mm
 * @property {number} basePayPerMetre      EUR per metre, before ground/region
 * @property {number} payPerHole           EUR per hole/pile/anchor, before region — see THE PAY BASIS
 * @property {number} [pullbackPerMetre]   EUR per metre of bore, paid on the pullback (HDD only)
 * @property {number} [reamPasses]         reaming + swab passes over the pilot before pullback (HDD only)
 * @property {number} xpPerMetre
 * @property {number} difficulty           1..5
 * @property {number} crewSize             heads on site INCLUDING the player — see economy.crewCostFor
 * @property {number} plantMob             EUR to bring and rig the ancillary plant, per job
 * @property {number} setupPerHole         hours to move onto and set up over the next hole
 *
 *   `setupPerHole` used to be `0.4 + difficulty * 0.28` for every method, and
 *   that one line distorted the whole ladder. It charged **58 minutes to tram a
 *   crawler five metres to the next blasthole** in a forty-hole pattern, and
 *   1 h 14 to reposition for the next 6 m self-drilling anchor in a job of
 *   sixty of them — so the methods that work in patterns spent most of their
 *   contract hours "setting up", and their EUR/hour collapsed for a reason that
 *   had nothing to do with what they earn. It is a per-method number: a
 *   blasthole is two minutes of tramming, a new water well is most of a
 *   morning, and a raise borer has to be grouted down to the level floor and
 *   aligned before it turns a revolution.
 *
 * @property {string[]} applications       APPLICATIONS ids
 * @property {number} nominalRop           m/h at hardness 0.5, stock tooling
 * @property {number} nominalDia           mm — reference diameter for pricing
 * @property {number} rodLength            m per rod/stroke — drives rod-add cadence.
 *        On a method with `hasDrillString: false` there is no rod to add, and
 *        this is the cadence of whatever the method does instead — for
 *        cable-tool, the bailing run.
 * @property {string} threadFamily         scoped connection vocabulary (DOMAIN §4)
 * @property {'vertical'|'profile'|'raise'|'heading'|'pile'} sectionMode
 *        How the hole is drawn in section. Mirrors `MODE_BY_METHOD` in
 *        world/geology.js, which is the module that actually renders it; the two
 *        must agree, and validateData() checks the value is one of the five.
 * @property {string} primaryToolSlot      the bay that MUST have stock for the
 *        method to be playable. It is `bit` for every method that cuts, but a
 *        site investigation's primary tool is a sampler and a driven pile's is
 *        the pile, and calling either of those a bit is the error this field
 *        exists to stop.
 * @property {string} scoredOn             what the client is actually buying.
 *        Six of these methods are NOT paid by the metre (METHOD_IDS.md), and
 *        saying so in the data keeps a screen from advertising depth as the
 *        measure of a job that is measured on sample quality or on a set.
 * @property {boolean} [hasDrillString]    default true. False where the tools
 *        hang on a WIRE ROPE rather than on a threaded string: cable-tool runs
 *        a rope socket, jars, a drill stem and a chisel on a rope, so it has no
 *        `rod` bay, no rods to stab and no rod, coupling or shank to buy.
 */

/* ─── THE PAY BASIS ─────────────────────────────────────────────────────────
   Not every method is sold by the metre, and pricing them all that way is what
   made the slow, high-value methods look like losses. A real tender for this
   work is written with at least two items, and this table now carries both:

     basePayPerMetre   the running metre — the item every method has.
     payPerHole        the fixed item per hole, pile, anchor or collar: moving
                       and setting up over the next position, the casing in and
                       out, the cage, the core boxes, the log. It is why a job
                       of thirty 6 m anchors is not priced like one 180 m hole,
                       and it is where a slow method whose product is a THING
                       rather than a depth — core recovery, a pile, a grout
                       column — actually earns its money.
     pullbackPerMetre  HDD only. The bore is quoted per metre, but the pilot is
                       a fraction of the work: `research/07-hdd-trenchless.md`
                       §A4 records 0–3 reaming passes, "more may be required
                       for larger diameters", then the swab pass, then the
                       product pipe comes back through at 0.30–0.61 m/min §A5.
                       `reamPasses` charges that time in estimateHours(); this
                       is what pays for it.

   `oil-rotary`, `hdd` and `raise-boring` carry no per-hole item, because their
   contracts are one hole: the fixed cost of such a job is `plantMob` plus the
   region mobilisation already in makeContract().

   `crewSize` is the gang for ONE rig on ONE shift, the player included. All
   three sources say plainly that headcount is contractor- and country-specific,
   so these are design defaults, not facts to display:
     - `research/06-geotech-water-geothermal.md` §D.3 — cable percussion 2,
       rotary geotechnical 2 (3 with a dedicated logger), water well DTH 2–3.
     - `research/07-hdd-trenchless.md` §C2 — mini 3, midi 5, maxi 8, built from
       the six named competences the industry documents require on site.
     - `research/05-foundation-piling.md` §B1 — "operator + banksman + 1–2
       operatives + a shared foreman, engineer and fitter across 2–4 rigs",
       plus a concrete gang and a crane when the method needs them.
   ─────────────────────────────────────────────────────────────────────────── */

/** @type {readonly Method[]} */
export const METHODS = deepFreeze([
  {
    id: 'auger', name: 'Auger Drilling', shortName: 'Auger', unlockLevel: 1,
    description: 'Hollow-stem and continuous flight augering — the cheapest metre in the ground, and useless the moment you hit rock.',
    icon: '🌀', rigIds: ['crawler-lite', 'cfa-rig', 'sonic-truck', 'core-rig', 'si-rig'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'marl', 'chalk'],
    toolSlots: ['bit', 'rod', 'head'], flushMedium: 'none',
    depthRange: [3, 40], holeDiaRange: [80, 600],
    basePayPerMetre: 24, payPerHole: 30, xpPerMetre: 1.0, difficulty: 1, crewSize: 2, plantMob: 0, setupPerHole: 0.35,
    applications: ['site-investigation', 'environmental', 'soil-stabilisation', 'foundation-piling'],
    // Light and road-towed: a plot, a verge, a farm or geothermal pad, a
    // soil-sampling pad — anywhere a van can reach. It has no business on a
    // bench, on a deck or underground.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'well-pad', 'exploration-pad'],
    nominalRop: 18, nominalDia: 200, rodLength: 1.5, threadFamily: 'hex/quick-pin',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    id: 'cable-tool', name: 'Cable-Tool / Drop Hammer', shortName: 'Cable-Tool', unlockLevel: 3,
    description: 'A heavy chisel dropped on a rope and bailed out wet — slow, ancient, and still the honest way to make a shallow well through boulders.',
    // A cable percussion rig is its own machine class: a folding derrick, a
    // winch and a clutch. It is NOT a hydraulic tracked geotechnical drill, so
    // `crawler-lite` no longer claims it. research/06 §D.3 counts the cable
    // percussion crew separately from the rotary geotechnical one for the same
    // reason — it is a different machine and a different gang.
    icon: '⛓', rigIds: ['cable-percussion'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'boulder', 'marl', 'chalk', 'limestone', 'sandstone'],
    // No `rod` bay. The string is a WIRE ROPE carrying a rope socket, jars, a
    // drill stem and the chisel; there is nothing threaded to stab and nothing
    // to add every three metres. The bailer lives in the workshop bay.
    toolSlots: ['bit', 'workshop'], flushMedium: 'water',
    hasDrillString: false,
    depthRange: [10, 120], holeDiaRange: [150, 600],
    basePayPerMetre: 152, payPerHole: 420, xpPerMetre: 1.4, difficulty: 2, crewSize: 2, plantMob: 0, setupPerHole: 1.2,
    applications: ['water-well', 'site-investigation', 'environmental'],
    // A folding derrick, a winch and a clutch on a towed chassis, sat over one
    // hole for days: no rotation, no flush, no hydraulics at the hole. It is a
    // LAND machine for shallow wells and shell-and-auger boreholes. It cannot
    // be put on a platform deck — that pairing is the worst one this table was
    // written to kill.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'well-pad'],
    // `rodLength` on a method with no drill string is the CADENCE the time
    // model charges, not a rod: here it is the bailing run, because the hole is
    // cleaned by lowering a bailer and not by circulating anything.
    nominalRop: 1.6, nominalDia: 250, rodLength: 3.0, threadFamily: 'cable-tool joint',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    id: 'top-hammer', name: 'Top Hammer', shortName: 'Top Hammer', unlockLevel: 6,
    description: 'The drifter sits on the mast and sends the blow down a threaded string — fast, loud, and every joule you lose is a joint that heats up.',
    icon: '⚒', rigIds: ['crawler-th', 'crawler-lite'],
    validGround: ['boulder', 'marl', 'chalk', 'limestone', 'sandstone', 'shale', 'schist', 'gneiss', 'granite', 'basalt', 'quartzite', 'concrete'],
    toolSlots: ['bit', 'rod', 'shank', 'coupling', 'compressor'], flushMedium: 'air',
    depthRange: [3, 45], holeDiaRange: [38, 127],
    basePayPerMetre: 17, payPerHole: 45, xpPerMetre: 1.8, difficulty: 2, crewSize: 2, plantMob: 0, setupPerHole: 0.05,
    applications: ['quarry-construction', 'blasting-demolition', 'anchoring', 'mining', 'civil-infrastructure'],
    // Surface rock drilling. Benches and patterns are its home; it also
    // collars anchors along a cutting, scales and bolts a portal face and
    // breaks rock on a city plot. Underground top hammer is a jumbo or a
    // bolter, and those are their own methods here.
    archetypes: ['quarry-bench', 'open-pit-bench', 'infrastructure-corridor', 'tunnel-portal', 'urban-plot'],
    nominalRop: 22, nominalDia: 76, rodLength: 3.66, threadFamily: 'R/T percussion',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    /* METHOD_IDS.md. The one method here that is not trying to make a hole: the
       hole is only how you reach the ground you are being paid to describe. Two
       machines serve it — a small tracked rig that drills and samples, and a
       ballasted unit that pushes a cone at 20 mm/s and never rotates at all —
       and the job is scored on the log, not the depth.
       research/06-geotech-water-geothermal.md §5. */
    id: 'site-investigation', name: 'Site Investigation', shortName: 'Site Inv.', unlockLevel: 8,
    description: 'Boreholes, driven samplers and pushed cones. Nobody is paying you for the hole — they are paying for the log, and a disturbed sample is a wasted trip whatever the metre count says.',
    icon: '⌇', rigIds: ['si-rig', 'cpt-unit', 'crawler-lite'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'boulder', 'marl', 'chalk', 'limestone', 'sandstone', 'shale', 'fracture', 'permafrost'],
    toolSlots: ['bit', 'probe', 'rod', 'workshop'], flushMedium: 'water',
    // 30-40 m is the honest working depth of every SI/CPT configuration in
    // research/06 §D — the 20-22 t truck, the 20 t tracked unit and the 1.5 t
    // restricted-access machine all reach 30-40 m and no further.
    depthRange: [10, 35], holeDiaRange: [36, 200],
    basePayPerMetre: 96, payPerHole: 340, xpPerMetre: 1.6, difficulty: 2, crewSize: 2, plantMob: 0, setupPerHole: 0.8,
    applications: ['site-investigation', 'environmental', 'foundation-piling', 'geothermal'],
    // You investigate a site before you build on it, so this follows whatever
    // is going to be built — including offshore, where the seabed boreholes
    // for a foundation are drilled from a jack-up or a geotechnical vessel
    // long before there is a platform to stand on.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'well-pad', 'exploration-pad', 'tunnel-portal', 'marine-spread'],
    // 1 m, because a CPT push rod is 1,000 mm and the borehole is logged in the
    // same increments. The cone itself reads every 50 mm. research/06 §D.
    nominalRop: 6, nominalDia: 100, rodLength: 1.0, threadFamily: 'A-Rod / CPT push rod / hex',
    sectionMode: 'vertical', primaryToolSlot: 'probe', scoredOn: 'sample quality and log fidelity',
  },
  {
    id: 'dth', name: 'DTH (Down-the-Hole)', shortName: 'DTH', unlockLevel: 10,
    description: 'The hammer rides at the bit, so the blow does not decay with depth — the hard-rock workhorse, and it drinks air by the cubic metre.',
    // A top-hammer crawler carries a DRIFTER, not a rotary head, so it cannot
    // turn a DTH string any more than a DTH rig can strike a shank adapter —
    // the same argument that took top hammer off 'dth-crawler'. The RC rig is
    // a DTH machine with dual-wall pipe and runs conventional DTH happily.
    icon: '⬇', rigIds: ['dth-crawler', 'rc-rig', 'pd55'],
    validGround: ['boulder', 'limestone', 'sandstone', 'shale', 'schist', 'gneiss', 'granite', 'basalt', 'quartzite', 'permafrost', 'concrete'],
    toolSlots: ['bit', 'rod', 'hammer', 'compressor'], flushMedium: 'air',
    depthRange: [20, 300], holeDiaRange: [85, 254],
    basePayPerMetre: 62, payPerHole: 380, xpPerMetre: 2.4, difficulty: 3, crewSize: 3, plantMob: 0, setupPerHole: 1.4,
    applications: ['water-well', 'geothermal', 'quarry-construction', 'mining', 'blasting-demolition'],
    // Deep hard rock: water and geothermal wells on a pad or in a yard, and
    // the big-diameter holes a quarry and a pit blast. The same hammer taken
    // underground is run off a longhole rig, which is `longhole`, not this
    // method (DOMAIN.md §1).
    archetypes: ['well-pad', 'quarry-bench', 'open-pit-bench', 'infrastructure-corridor', 'urban-plot'],
    nominalRop: 16, nominalDia: 152, rodLength: 6.0, threadFamily: 'DHD/QL shank',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    id: 'overburden', name: 'Overburden / Duplex Drilling', shortName: 'Overburden', unlockLevel: 14,
    description: 'Casing and bit advance together — eccentric, concentric, ring-bit or wing-bit — because the ground behind you will not stand up on its own.',
    icon: '◎', rigIds: ['crawler-th', 'dth-crawler', 'crawler-lite'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'boulder', 'fracture', 'marl', 'permafrost', 'limestone', 'sandstone', 'gneiss', 'granite'],
    toolSlots: ['bit', 'rod', 'casing', 'hammer', 'compressor'], flushMedium: 'air',
    depthRange: [6, 80], holeDiaRange: [90, 600],
    basePayPerMetre: 155, payPerHole: 320, xpPerMetre: 3.4, difficulty: 4, crewSize: 3, plantMob: 0, setupPerHole: 0.9,
    applications: ['foundation-piling', 'water-well', 'anchoring', 'civil-infrastructure', 'environmental'],
    // Getting a casing through the drift IS the method, so it goes wherever
    // there is drift over something worth reaching: a plot, an alignment, a
    // well pad, a pipe umbrella or spiling at a portal, or a till-covered
    // licence block.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'well-pad', 'tunnel-portal', 'exploration-pad'],
    nominalRop: 6, nominalDia: 168, rodLength: 3.0, threadFamily: 'casing cone-ring LH / R-T percussion / DHD-QL shank',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    id: 'core', name: 'Core / Wireline Exploration', shortName: 'Core', unlockLevel: 18,
    description: 'AQ to PQ on the wireline — you are not paid for metres, you are paid for the core that comes up whole and in order.',
    icon: '⌀', rigIds: ['core-rig'],
    validGround: ['marl', 'chalk', 'limestone', 'sandstone', 'shale', 'schist', 'gneiss', 'granite', 'basalt', 'quartzite', 'fracture', 'permafrost'],
    toolSlots: ['bit', 'rod', 'pump', 'swivel'], flushMedium: 'water',
    depthRange: [30, 600], holeDiaRange: [48, 123],
    basePayPerMetre: 128, payPerHole: 1500, xpPerMetre: 3.0, difficulty: 3, crewSize: 3, plantMob: 0, setupPerHole: 2.2,
    applications: ['mineral-exploration', 'site-investigation', 'tunnelling', 'mining'],
    // The sample is the product, so it follows the sample: a greenfield pad, a
    // rig set up inside a drive to drill the ore body from within it, grade
    // control off a pit bench, probe drilling ahead of a portal, investigation
    // along an alignment, and seabed boreholes from a marine spread.
    archetypes: ['exploration-pad', 'underground-drive', 'open-pit-bench', 'tunnel-portal', 'infrastructure-corridor', 'marine-spread'],
    nominalRop: 5, nominalDia: 96, rodLength: 3.0, threadFamily: 'Wireline AQ–PQ',
    // Not metres. The method's own description above says so — "you are not
    // paid for metres, you are paid for the core that comes up whole and in
    // order" — and the row contradicted it. Core recovery is the score
    // (DESIGN_EXPANSION §2): too much feed, too little water or a dull bit and
    // the core grinds to rubble in the barrel, and a hole full of rubble is
    // worth nothing however fast it was drilled.
    sectionMode: 'vertical', primaryToolSlot: 'bit',
    scoredOn: 'core recovery — whole core, in order, logged',
  },
  {
    /* METHOD_IDS.md. A DTH hammer on dual-wall pipe: the chips return up the
       INSIDE of the string, so nothing that fell off the wall above the bit can
       reach the sample. That is the whole method, and it is why an RC hole is
       scored on recovery and contamination and not on metres.
       research/02-prospecting.md §RC. */
    id: 'rc', name: 'Reverse Circulation', shortName: 'RC', unlockLevel: 21,
    description: 'A hammer on dual-wall pipe, with the chips coming back up the inside of the string to a cyclone. Fast, dry and uncontaminated — you are drilling for the bag under the cyclone, not for the hole.',
    icon: '⇅', rigIds: ['rc-rig'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'boulder', 'marl', 'chalk', 'limestone', 'sandstone', 'shale', 'schist', 'gneiss', 'granite', 'basalt', 'quartzite', 'fracture', 'permafrost'],
    toolSlots: ['bit', 'rod', 'hammer', 'compressor', 'sample'], flushMedium: 'air',
    // Rig rating 300-400 m; the hammer range covers 86-146 mm bits, with 90 and
    // 124 mm the standard hole sizes. research/02 §RC (rig rating, bit tables).
    depthRange: [60, 400], holeDiaRange: [86, 146],
    /* A RATE FIX, NOT A COST FIX. At 88 EUR/m against a 20 m/h nominal ROP this
       method grossed about 1,760 EUR per drilling hour — joint-highest in the
       game outside the derrick — from level 21, and on the measured ladder it
       beat `oil-rotary` (L30) by 2.42x, `rotary-kelly` (L23) by 1.85x and
       `driven-pile` (L33, twelve levels later) by 1.71x. Six of the game's nine
       ladder inversions were this one number.

       It belongs here and not in economy.js. Closing it from the cost side
       would need roughly 51 EUR/m of materials on top of the 18 EUR/m that is
       actually defensible — i.e. asserting that consumables are 78 % of an RC
       tender, which is neither true nor sourceable. The one cost that could
       honestly close it is the ASSAY: a real RC programme splits a bag per
       metre to a laboratory and that bill is comparable to the drilling. But
       research/02-prospecting.md establishes the sampling cadence and prices
       nothing, so there is no number to charge — which leaves the rate. */
    basePayPerMetre: 50, payPerHole: 260, xpPerMetre: 2.6, difficulty: 3, crewSize: 4, plantMob: 900, setupPerHole: 0.9,
    applications: ['mineral-exploration', 'mining'],
    // A cyclone, a splitter and a sample train laid out around the rig. Two
    // settings and they look nothing alike: greenfield target testing on a
    // pad, and grade control on a confined active bench immediately ahead of a
    // blast. It is not a civil method.
    archetypes: ['exploration-pad', 'open-pit-bench'],
    // 200-300 m/day is the pack's production figure; over a twelve-hour tour
    // that is 17-25 m/h, so 20 at mid hardness is the middle of it.
    nominalRop: 20, nominalDia: 124, rodLength: 3.0, threadFamily: 'RC dual-wall box/pin',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'sample recovery and contamination',
  },
  {
    id: 'rotary-kelly', name: 'Rotary / Kelly Drilling', shortName: 'Kelly', unlockLevel: 23,
    description: 'Big diameter, few metres, serious money — the Kelly bar telescopes down, the bucket comes up full, and the crane driver earns his day.',
    icon: '⊕', rigIds: ['foundation-bg', 'cfa-rig'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'boulder', 'marl', 'chalk', 'limestone', 'sandstone', 'shale', 'concrete'],
    toolSlots: ['bit', 'rod', 'head', 'swivel'], flushMedium: 'mud',
    depthRange: [5, 90], holeDiaRange: [600, 3000],
    basePayPerMetre: 196, payPerHole: 620, xpPerMetre: 6.0, difficulty: 4, crewSize: 5, plantMob: 1800, setupPerHole: 0.45,
    applications: ['foundation-piling', 'civil-infrastructure', 'diaphragm-wall'],
    // A 118-tonne foundation rig with a telescopic Kelly, walked onto an
    // engineered piling mat with a crane for the cages and a concrete pump
    // beside it. It exists to put a large-diameter bored pile under a
    // structure, and there is no structure on a bench, on a pad or on a
    // forestry track.
    archetypes: ['urban-plot', 'infrastructure-corridor'],
    nominalRop: 9, nominalDia: 900, rodLength: 4.0, threadFamily: 'Kelly-box / U-Pin',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    id: 'cfa', name: 'CFA Piling', shortName: 'CFA', unlockLevel: 27,
    description: 'One continuous flight, one pass, concrete pumped through the stem on the way back up — never let the auger turn without advancing.',
    icon: '🌀', rigIds: ['cfa-rig', 'foundation-bg'],
    /* NO TILL, AND NO BOULDERS. This row used to carry `till` and it contradicted
       the research pack it was built from. research/05-foundation-piling.md §A6:
       "Standard CFA may fail to penetrate stiff clayey soils and glacial till,
       with refusal before design depth and problems of flighting, shaft waisting
       and discontinuities" `[TOM]` §2.4.2 — and the same section's envelope
       `[BAU-CFA]` is "cohesive, friable soils. No boulders." The game already
       says the same thing in its own voice (FACTS_VERIFIED.md: "Glacial till
       hides boulders. The torque spike arrives before you hear anything"), so an
       inner-city CFA pile advertised through till was the board contradicting
       the boot screen.
       Till is not lost to the game: §A7 says the double-rotary system "overcomes
       exactly the ground that defeats plain CFA — stiff clayey soils and glacial
       till", so it stays on `cased-cfa`, which is where the fee for it belongs. */
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'marl', 'chalk'],
    toolSlots: ['bit', 'head', 'pump'], flushMedium: 'none',
    depthRange: [5, 35], holeDiaRange: [300, 1200],
    basePayPerMetre: 97, payPerHole: 340, xpPerMetre: 4.2, difficulty: 3, crewSize: 5, plantMob: 1500, setupPerHole: 0.3,
    applications: ['foundation-piling', 'civil-infrastructure'],
    // Quick and quiet, and therefore the inner-city pile. Same site furniture
    // as the Kelly rig: a verified working platform, concrete pumps, a crane
    // for the cages, an auger cleaner. None of that is grass and spruce.
    archetypes: ['urban-plot', 'infrastructure-corridor'],
    nominalRop: 25, nominalDia: 600, rodLength: 35, threadFamily: 'Kelly-box / claw coupling',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    /* METHOD_IDS.md. Ground support is permanent, continuous and legally
       required, and it is the only drilling here where the hole is finished when
       something has been PUT IN it. research/03-mining.md §ground support;
       research/04-tunnelling.md.

       UNDERGROUND ONLY. You do not collar a bolt hole in till: the ground list
       is rock, the same list raise boring uses. */
    id: 'rockbolt', name: 'Ground Support', shortName: 'Bolting', unlockLevel: 29,
    description: 'Drill it, charge it with resin, spin the bolt in and torque the plate against the rock. Nobody counts your metres — they count whether the back stays up, and they pull-test a sample of your bolts to find out.',
    icon: '⊺', rigIds: ['bolter', 'longhole-rig', 'tunnel-jumbo'],
    validGround: ['limestone', 'sandstone', 'shale', 'schist', 'gneiss', 'granite', 'basalt', 'quartzite', 'fracture', 'concrete'],
    toolSlots: ['bit', 'rod', 'shank', 'hammer', 'install', 'pump', 'service'], flushMedium: 'water',
    // targetDepth is METRES OF DRIVE SUPPORTED, not hole depth: the product is
    // a length of heading that is safe to stand under. Bolts themselves are
    // 0.9-3.6 m (33 mm friction bolt 0.9-2.4 m, 46 mm 0.9-3.6 m) and cable bolts
    // run to 6 m; the hole is drilled SMALLER than a friction bolt and at least
    // 50 mm longer than it. research/03 §friction bolts.
    depthRange: [6, 40], holeDiaRange: [28, 64],
    // Priced per metre of supported drive with the bolts, plates and resin in
    // the rate at the design bolting density. A literal per-bolt item cannot be
    // expressed here: makeContract computes metres as targetDepth x holes, so a
    // bolt count would multiply the drive length by itself.
    basePayPerMetre: 96, payPerHole: 420, xpPerMetre: 1.4, difficulty: 3, crewSize: 3, plantMob: 400, setupPerHole: 0.6,
    applications: ['anchoring', 'tunnelling', 'mining', 'civil-infrastructure'],
    // UNDERGROUND ONLY, by the project instruction this layer was written to.
    // A bolter works off the floor of a drive against a back it can reach.
    // Surface rock support — a highwall, a cutting, a portal face — is
    // `anchor` or `top-hammer` in this game.
    archetypes: ['underground-drive'],
    // BASIS: this ROP is in HOLE metres per hour — how fast the drifter makes a
    // 2-3 m bolt hole — and it is NOT in metres of supported drive, which is
    // what `targetDepth` counts for this method. estimateHours() divides drive
    // metres by it, so taken literally it prices 52 bolts at 36 minutes;
    // economy.js corrects for that with an explicit basis factor. Say which
    // basis a number is in before re-deriving it.
    nominalRop: 26, nominalDia: 38, rodLength: 3.6, threadFamily: 'R32-R38 percussion',
    sectionMode: 'heading', primaryToolSlot: 'bit', scoredOn: 'install quality — anchorage and torque test',
  },
  {
    id: 'oil-rotary', name: 'Rotary / Oil & Gas', shortName: 'Oil Rotary', unlockLevel: 30,
    description: 'Mud rotary on a derrick. Weight comes from the collars, rotation from the top drive, and the mud does three jobs at once — it lifts the cuttings, it cools the bit and its hydrostatic column holds the hole open. Changing a bit at 1,800 m means pulling every stand of it back out.',
    icon: '⬢', rigIds: ['oil-derrick'],
    validGround: ['clay', 'silt', 'sand', 'gravel', 'till', 'marl', 'chalk', 'limestone', 'sandstone', 'shale', 'fracture'],
    toolSlots: ['bit', 'rod', 'bha', 'pump', 'mudplant', 'mud', 'wellcontrol'], flushMedium: 'mud',
    depthRange: [400, 2400], holeDiaRange: [152, 445],
    // Calibrated against a level-matched sweep of every method at grade A with
    // the best loadout money can buy. The rate now carries the casing, cement,
    // barite and cuttings disposal that `MATERIALS` in game/economy.js charges
    // at 190 EUR/m — that row exists, so the old "costed at zero" note beside
    // this number no longer described it and has been removed rather than left
    // to be read as current.
    basePayPerMetre: 420, payPerHole: 0, xpPerMetre: 5.0, difficulty: 5, crewSize: 8, plantMob: 9000, setupPerHole: 14,
    applications: ['oil-gas', 'offshore-marine'],
    // A derrick, a mud system and a preventer: on a graded land pad with a
    // cellar and a flare, on the drill floor of a fixed installation, or on a
    // mobile marine unit holding station.
    archetypes: ['well-pad', 'platform-deck', 'marine-spread'],
    // `rodLength` is a three-joint STAND, not a single joint: with a top drive
    // you drill down a stand and make one connection, so the stand is the real
    // cadence of the job. API Range 2 is 8.23–9.14 m per joint, so a triple
    // stand is about 27 m — never 28.5, which is longer than three joints can
    // physically be. (research/01-oil-gas.md: "Drill pipe Range 2 is
    // 8.23–9.14 m per joint … so a triple stand is ≈ 27 m".)
    nominalRop: 7, nominalDia: 311, rodLength: 27.0, threadFamily: 'API REG / IF / FH / NC',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    id: 'anchor', name: 'Anchor / Micropile', shortName: 'Anchor', unlockLevel: 31,
    description: 'Self-drilling hollow bar: the bit stays in the ground, the grout goes out through it, and the bar becomes the reinforcement.',
    icon: '⚓', rigIds: ['crawler-lite', 'crawler-th', 'core-rig', 'bolter', 'si-rig'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'boulder', 'fracture', 'marl', 'limestone', 'sandstone', 'schist', 'gneiss', 'granite', 'concrete'],
    toolSlots: ['bit', 'rod', 'hammer', 'pump'], flushMedium: 'water',
    depthRange: [3, 40], holeDiaRange: [51, 200],
    basePayPerMetre: 122, payPerHole: 400, xpPerMetre: 3.2, difficulty: 3, crewSize: 3, plantMob: 350, setupPerHole: 0.18,
    applications: ['anchoring', 'foundation-piling', 'tunnelling', 'civil-infrastructure'],
    // A different machine on a different site from a piling rig:
    // excavator-mounted and low-headroom drills putting tie-backs and soil
    // nails into retaining walls, cuttings, portal faces and quarry or pit
    // highwalls. The same wire underground is a rock bolt, and that is
    // `rockbolt`.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'tunnel-portal', 'quarry-bench', 'open-pit-bench'],
    nominalRop: 8, nominalDia: 90, rodLength: 3.0, threadFamily: 'SDA hollow bar R/T',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    /* METHOD_IDS.md. No rotation, no flush and no drill string at all: a ram
       falls on a helmet and the pile goes down. The instrument lies here harder
       than anywhere else in the game — a pile whose toe is brooming gives a
       BEAUTIFUL set while it destroys itself, and only the depth into the
       bearing stratum tells the truth. research/05-foundation-piling.md §1.4. */
    id: 'driven-pile', name: 'Driven Piling', shortName: 'Driven Pile', unlockLevel: 33,
    description: 'A nine-tonne ram on a telescopic leader, and a pile that is finished when it stops moving. Watch the set and distrust it: a toe that is crushing itself reads as perfect refusal right up until the pile is scrap.',
    icon: '⇊', rigIds: ['piling-leader', 'pd55'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'boulder', 'marl', 'chalk', 'sandstone', 'shale'],
    // Nothing turns and nothing circulates. ADVANCE is hammer energy, WORK is
    // blow rate, PROTECT is alignment and rake (GAMEDESIGN §7), and energy and
    // blow rate sit on ONE hydraulic curve: the medium class is a 9,000 kg ram
    // at 106 kNm over a 1,200 mm stroke, 40-100 blows/min, and the 16 t machine
    // gives 235 kNm at 30 blows/min or 12 kNm at 100. research/05 §hammers.
    toolSlots: ['dolly', 'install', 'hammer'], flushMedium: 'none',
    hasDrillString: false,
    // targetDepth is the DESIGN TOE LEVEL, and a contract is one pile: the
    // leader takes 25 m of pile and the score is the set at the bottom of it.
    depthRange: [8, 30], holeDiaRange: [200, 1000],
    // Piling is priced by the PILE, not by the metre — payPerHole carries it,
    // and the running metre is only the pile itself.
    basePayPerMetre: 88, payPerHole: 3200, xpPerMetre: 3.0, difficulty: 4, crewSize: 5, plantMob: 4200, setupPerHole: 1.4,
    applications: ['foundation-piling', 'civil-infrastructure'],
    // A ram on a leader driving a precast or steel pile under a structure or
    // an embankment. Driven piling over water is real and is deliberately out
    // of scope: this game models the leader rig, not an installation vessel.
    archetypes: ['urban-plot', 'infrastructure-corridor'],
    // No string, so this is the cadence of the work: one pile pitched into the
    // leader. A 350 mm precast pile comes in 14 m lengths.
    nominalRop: 12, nominalDia: 400, rodLength: 14.0, threadFamily: 'welded splice / sheet-pile interlock',
    sectionMode: 'pile', primaryToolSlot: 'install', scoredOn: 'set and blow count to bearing, without damaging the pile',
  },
  {
    id: 'cased-cfa', name: 'Cased CFA (Double Rotary)', shortName: 'Cased CFA', unlockLevel: 34,
    description: 'Two drives turning opposite ways — casing outside, auger inside — the answer when the CFA column keeps necking in soft silt.',
    icon: '⊛', rigIds: ['cfa-rig', 'foundation-bg'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'boulder', 'marl', 'chalk'],
    toolSlots: ['bit', 'head', 'casing', 'pump'], flushMedium: 'none',
    depthRange: [5, 30], holeDiaRange: [400, 1200],
    basePayPerMetre: 186, payPerHole: 520, xpPerMetre: 5.4, difficulty: 4, crewSize: 6, plantMob: 2100, setupPerHole: 0.4,
    applications: ['foundation-piling', 'civil-infrastructure', 'environmental'],
    // Double-rotary piling — plots and alignments, including the contaminated
    // ones where the casing is there to keep the hole out of the ground. Its
    // sourced ground cap is soft: it is not a quarry or a pit machine.
    archetypes: ['urban-plot', 'infrastructure-corridor'],
    nominalRop: 12, nominalDia: 750, rodLength: 30, threadFamily: 'Kelly-box / claw coupling',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    /* METHOD_IDS.md. The face advances horizontally, one blast round at a time,
       and the drilled depth and the PULLED depth are two different numbers. Pull
       is never 100 %: 82-91 % on Norwegian 5.49 m steels, about 90 % with good
       practice on 2-4 m rounds, 87-95 % measured in a small gassy gallery. The
       gap between the two is the score, and the look-out angle you drilled is
       the overbreak somebody else pays to concrete back.
       research/04-tunnelling.md §round length and pull, §look-out angle.

       UNDERGROUND ONLY — the ground list is rock. */
    id: 'tunnel-jumbo', name: 'Drill & Blast (Face)', shortName: 'Jumbo', unlockLevel: 36,
    description: 'Two booms on a low-profile carrier, about a hundred and forty holes in a face, then charge, fire, ventilate and muck. You are paid for the metres the round actually pulled, and it is never all of the ones you drilled.',
    icon: '⊓', rigIds: ['tunnel-jumbo'],
    validGround: ['limestone', 'sandstone', 'shale', 'schist', 'gneiss', 'granite', 'basalt', 'quartzite', 'fracture', 'concrete'],
    toolSlots: ['bit', 'rod', 'shank', 'coupling', 'head', 'service'], flushMedium: 'water',
    // targetDepth is CHAINAGE — metres of tunnel advanced — and a contract is
    // one heading. Blastholes are 38-51 mm on this machine, and small sections
    // in permitted-explosive ground go down to 32 mm.
    depthRange: [6, 24], holeDiaRange: [32, 64],
    /* BASIS: EUR per metre of ADVANCE at the reference face, flat. makeContract
       rolls `faceAreaM2` across 14-120 m² and this rate does not follow it, so
       a cross-passage and a motorway bore are advertised at the same rate per
       metre of tunnel. That is deliberate for now: economy.js pins its cost
       model to a 100 m² reference, and the measured spread of the whole
       14->120 swing is about EUR 5,300 on an EUR 54,000 net (7 %). Scaling pay
       with the face while cost stays pinned would put a 14 m² heading
       underwater — the same shape validateData() already refuses for diameter
       ("materials scale at D^x but pay scales at D^y"). Pricing the face is
       therefore a two-file change: cost has to track it first. */
    basePayPerMetre: 2400, payPerHole: 0, xpPerMetre: 14.0, difficulty: 5, crewSize: 8, plantMob: 6500, setupPerHole: 10,
    applications: ['tunnelling', 'civil-infrastructure', 'mining'],
    // UNDERGROUND ONLY. A two-boom jumbo drills a face, and the face is inside
    // the drive. The very first round of a new tunnel is collared at the
    // portal, but the machine and the whole cycle behind it — charge, fire,
    // ventilate, muck — belong to the drive, and a jumbo parked on a surface
    // construction site is the single most embarrassing thing this table
    // prevents.
    archetypes: ['underground-drive'],
    // 0.5 m/h is the FULL cycle and not the drilling: muck-out alone is about
    // four hours on a 100 m² face producing roughly 500 m³ of solid rock per
    // round. Face rods are 2,435 mm for a 2,132 mm hole.
    nominalRop: 0.5, nominalDia: 48, rodLength: 2.435, threadFamily: 'T38-T45 percussion',
    sectionMode: 'heading', primaryToolSlot: 'bit', scoredOn: 'pull per round and overbreak',
  },
  {
    id: 'hdd', name: 'Horizontal Directional Drilling', shortName: 'HDD', unlockLevel: 38,
    description: 'Measured in bore length, paid on pullback — a slant head steered by a sonde, then reamed up in passes until the product pipe follows.',
    icon: '↝', rigIds: ['hdd-rig'],
    validGround: ['clay', 'silt', 'sand', 'gravel', 'till', 'marl', 'chalk', 'limestone', 'sandstone', 'shale'],
    toolSlots: ['bit', 'rod', 'pump', 'swivel'], flushMedium: 'mud',
    depthRange: [50, 1200], holeDiaRange: [100, 1200],
    basePayPerMetre: 100, payPerHole: 0, pullbackPerMetre: 128, reamPasses: 2.4, xpPerMetre: 4.6, difficulty: 4, crewSize: 5, plantMob: 1900, setupPerHole: 6,
    applications: ['utility-hdd', 'trenching', 'civil-infrastructure', 'environmental'],
    // A crossing goes UNDER something — a road, a rail line, a river, a street
    // — so it is laid out along an alignment with an entry pit and an exit pit
    // inside a right-of-way. There is nothing to cross on a bench, on a well
    // pad or on a deck.
    archetypes: ['infrastructure-corridor', 'urban-plot'],
    nominalRop: 12, nominalDia: 300, rodLength: 4.6, threadFamily: 'HDD box/pin / API IF',
    sectionMode: 'profile', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    /* METHOD_IDS.md. Rings and fans of long holes drilled out from a drive, and
       the number that matters is where the TOE ended up. The blast design
       assumes every toe is where the pattern says it is; deviation moves it, the
       real burden at the bottom is not the designed burden, and the ore either
       does not break or breaks with waste in it. research/03-mining.md
       §longhole, §deviation and dilution.

       UNDERGROUND ONLY — the ground list is rock. */
    id: 'longhole', name: 'Longhole Production', shortName: 'Longhole', unlockLevel: 39,
    description: 'Fans of long holes swung around a slew ring from one set-up, charged and fired ring by ring. Nobody ever sees the bottom of the hole: drill it crooked and you find out as dilution in the mill, three weeks later.',
    icon: '⁙', rigIds: ['longhole-rig'],
    validGround: ['limestone', 'sandstone', 'shale', 'schist', 'gneiss', 'granite', 'basalt', 'quartzite', 'fracture', 'concrete'],
    toolSlots: ['bit', 'rod', 'shank', 'coupling', 'hammer', 'compressor'], flushMedium: 'air',
    // targetDepth is RING METRES — the sum of every hole in the fan, not the
    // depth of one of them — and a "hole" in this contract is a ring. Top hammer
    // takes 51-127 mm; an ITH production rig class is specified for 89-216 mm,
    // and an individual hole runs to about 30 m. research/03 §longhole tooling.
    depthRange: [120, 400], holeDiaRange: [51, 216],
    basePayPerMetre: 42, payPerHole: 260, xpPerMetre: 2.2, difficulty: 4, crewSize: 3, plantMob: 800, setupPerHole: 1.5,
    applications: ['mining', 'blasting-demolition'],
    // UNDERGROUND ONLY. Rings and fans are drilled from a drill drive along or
    // above the orebody, up into the stope. The driller never sees the rock
    // that is being blasted.
    archetypes: ['underground-drive'],
    // Longhole rods are SHORT — 915 / 1220 / 1525 / 1830 mm — because the machine
    // has to swing a feed inside a drive. 1,525 mm is the middle one.
    nominalRop: 20, nominalDia: 89, rodLength: 1.525, threadFamily: 'R32-T51 percussion / DHD-QL ITH shank',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'toe accuracy — deviation becomes dilution',
  },
  {
    id: 'sonic', name: 'Sonic Drilling', shortName: 'Sonic', unlockLevel: 42,
    description: 'Resonant vibration liquefies the ground at the shoe — near-perfect continuous sample, no flushing, and an oscillator head that costs a fortune to rebuild.',
    icon: '〰', rigIds: ['sonic-truck'],
    validGround: ['topsoil', 'clay', 'silt', 'sand', 'gravel', 'till', 'boulder', 'marl', 'chalk', 'permafrost', 'fracture'],
    toolSlots: ['bit', 'rod', 'casing', 'pump'], flushMedium: 'water',
    depthRange: [5, 120], holeDiaRange: [75, 300],
    basePayPerMetre: 132, payPerHole: 700, xpPerMetre: 4.0, difficulty: 3, crewSize: 3, plantMob: 0, setupPerHole: 0.7,
    applications: ['environmental', 'site-investigation', 'mineral-exploration', 'geothermal'],
    // Continuous undisturbed sampling in soft ground: brownfield plots,
    // alignments, water and geothermal pads, tailings and alluvium on a
    // licence block. Offshore geotechnical holes are drilled from a
    // heave-compensated marine spread, not with a resonant land head.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'well-pad', 'exploration-pad'],
    nominalRop: 12, nominalDia: 150, rodLength: 3.0, threadFamily: 'sonic box/pin RH / casing LH',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    id: 'jet-grouting', name: 'Jet Grouting', shortName: 'Jet Grout', unlockLevel: 47,
    description: 'Drill to depth, then cut the soil apart with grout at 400 bar and rebuild it as a column on the way out — one blocked nozzle ruins the whole panel.',
    // Jet grouting is done by a small-to-mid crawler that can stand in a
    // basement and thread a monitor down a 150 mm pre-drill, not by a 118 t
    // Kelly rig whose smallest tool is a 600 mm auger.
    icon: '✳', rigIds: ['crawler-th'],
    validGround: ['clay', 'silt', 'sand', 'gravel', 'till', 'marl'],
    toolSlots: ['bit', 'rod', 'pump', 'swivel'], flushMedium: 'mud',
    depthRange: [5, 60], holeDiaRange: [600, 4000],
    basePayPerMetre: 372, payPerHole: 900, xpPerMetre: 7.0, difficulty: 5, crewSize: 6, plantMob: 3600, setupPerHole: 0.35,
    applications: ['soil-stabilisation', 'foundation-piling', 'tunnelling', 'civil-infrastructure'],
    // Ground treatment where there is something to protect: underpinning on a
    // plot, sealing under an alignment, and a treated block ahead of a portal
    // before the first round is fired. It needs erodible SOIL, which a bench
    // does not have.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'tunnel-portal'],
    nominalRop: 4, nominalDia: 1200, rodLength: 3.0, threadFamily: 'HDI multi-tube box/pin / HP swivel',
    sectionMode: 'vertical', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
  {
    id: 'raise-boring', name: 'Raise Boring', shortName: 'Raise Bore', unlockLevel: 52,
    description: 'Two stages: a pilot hole down to the level below, then the reamer head is pulled back up through it — the most expensive metre in the game, and the least forgiving.',
    icon: '⇧', rigIds: ['raisebore'],
    validGround: ['limestone', 'sandstone', 'shale', 'schist', 'gneiss', 'granite', 'basalt', 'quartzite'],
    toolSlots: ['bit', 'rod', 'head'], flushMedium: 'water',
    depthRange: [30, 600], holeDiaRange: [600, 6000],
    basePayPerMetre: 1210, payPerHole: 0, xpPerMetre: 24.0, difficulty: 5, crewSize: 4, plantMob: 2400, setupPerHole: 8,
    applications: ['mining', 'tunnelling', 'civil-infrastructure'],
    // UNDERGROUND ONLY. The machine is grouted down to the floor of the upper
    // level and reams up from the level below it, and the muck is loaded by an
    // LHD. Both ends of the raise are underground.
    archetypes: ['underground-drive'],
    nominalRop: 1.2, nominalDia: 1800, rodLength: 1.5, threadFamily: 'raise-bore stem box/pin',
    sectionMode: 'raise', primaryToolSlot: 'bit', scoredOn: 'metres drilled',
  },
]);

/* ═══════════════════════════════════════════════════════════════════════════
   RIGS — the machines rig/rigFactory.js can build. Names are original; they
   evoke the Bauer / Klemm / Casagrande / Epiroc / Vermeer landscape of
   DOMAIN.md §6 without reusing any real model designation.

   stats units: power kW · torque kNm · feedForce kN · depthCapacity m ·
   rodHandling/mobility/comfort 0..1.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @typedef {Object} Rig
 * @property {string} id
 * @property {string} name
 * @property {string} maker           invented marque
 * @property {number} price           EUR
 * @property {number} unlockLevel
 * @property {string[]} methods
 * @property {{power:number,torque:number,feedForce:number,depthCapacity:number,rodHandling:number,mobility:number,comfort:number}} stats
 * @property {number} upkeepPerHour   EUR/h — service, wear parts, tyres/tracks
 * @property {number} fuelPerHour     EUR/h — diesel at load
 * @property {string} description
 * @property {string} family          real taxonomy path
 * @property {number} transportTons   affects travel cost
 */

/** @type {readonly Rig[]} */
export const RIGS = deepFreeze([
  {
    id: 'crawler-lite', name: 'Nordvik NV-90 Scout', maker: 'Nordvik',
    price: 95000, unlockLevel: 1,
    // With a drifter on the mast and a towed screw compressor this little
    // machine will drill rock — which is exactly how small contractors get
    // into top hammer without buying a surface crawler.
    //
    // It does NOT run cable-tool. Cable percussion is a folding derrick, a
    // winch, a clutch and a wire rope; a hydraulic tracked drill has no rope
    // drum and no walking beam. That machine is `cable-percussion`.
    methods: ['auger', 'top-hammer', 'overburden', 'anchor', 'site-investigation'],
    stats: { power: 55, torque: 4.2, feedForce: 26, depthCapacity: 45, rodHandling: 0.25, mobility: 0.9, comfort: 0.3 },
    upkeepPerHour: 11, fuelPerHour: 14, transportTons: 4.5,
    description: 'A 4.5-tonne tracked utility drill you can walk onto a garden plot. Hand-fed rods, an open canopy and a heater that works when it feels like it — but it pays for itself in a season.',
    family: CAT.rigGeotech,
  },
  {
    id: 'cable-percussion', name: 'Kilmar CP-24 Shellhand', maker: 'Kilmar',
    price: 68000, unlockLevel: 3,
    // The only machine in the fleet that runs cable-tool, because cable
    // percussion is its own machine class and not a mode of a hydraulic drill.
    // Nothing here rotates: torque and feed force are ZERO on purpose. The tool
    // falls under its own weight on a wire rope and the winch lifts it again,
    // which is why a 4.5 t tracked geotechnical drill cannot do this work no
    // matter what is bolted to its mast.
    methods: ['cable-tool'],
    stats: { power: 82, torque: 0, feedForce: 0, depthCapacity: 250, rodHandling: 0.15, mobility: 0.7, comfort: 0.15 },
    upkeepPerHour: 14, fuelPerHour: 11, transportTons: 9.4,
    description: 'A folding derrick over a walking beam, three lines off one winch — drilling line, sand line, casing line — and a spudding rate of forty to sixty strokes a minute. The string is a wire rope carrying a rope socket, jars, a drill stem and a chisel; the hole is cleaned by dropping a bailer down it, because there is nothing to circulate. It will make a straight 250 mm well through a boulder bed that stops a rotary rig dead.',
    family: CAT.rigGeotech,
  },
  {
    id: 'crawler-th', name: 'Steinbach TH-320 Ridgeline', maker: 'Steinbach',
    price: 165000, unlockLevel: 6,
    // No DTH. This machine's mast carries a hydraulic DRIFTER: it strikes the
    // shank adapter and turns the string only to index it. A down-the-hole
    // hammer needs a rotary head with real torque and the air to feed it.
    methods: ['top-hammer', 'overburden', 'anchor', 'jet-grouting'],
    stats: { power: 129, torque: 6.8, feedForce: 42, depthCapacity: 45, rodHandling: 0.62, mobility: 0.72, comfort: 0.6 },
    upkeepPerHour: 26, fuelPerHour: 31, transportTons: 12,
    description: 'Surface top-hammer crawler with a carousel rod handler and an on-board 8 m³/min screw. The mast folds over the tracks for transport, which is the only reason it fits on a standard low-loader.',
    family: CAT.rigTopHammer,
  },
  {
    id: 'dth-crawler', name: 'Brenner DH-750 Ironvein', maker: 'Brenner',
    price: 338000, unlockLevel: 10,
    // No top hammer. A DTH surface rig carries a ROTARY HEAD, not a hydraulic
    // drifter: it turns the string and feeds it, and the blow is made by the
    // hammer at the bottom of the hole. There is nothing on this mast that can
    // strike a shank adapter. (DOMAIN.md §3 A — Top Hammer / Surface and DTH
    // Surface are separate rig families.)
    methods: ['dth', 'overburden'],
    stats: { power: 224, torque: 11.5, feedForce: 68, depthCapacity: 300, rodHandling: 0.8, mobility: 0.6, comfort: 0.72 },
    upkeepPerHour: 44, fuelPerHour: 58, transportTons: 21,
    description: 'A proper DTH machine: high-pressure onboard compressor, 6 m rod magazine, dust collector that actually keeps the cab clean. Built for 150 mm water wells and 300 m of granite.',
    family: CAT.rigDTH,
  },
  {
    id: 'core-rig', name: 'Meridian CX-1200 Wireline', maker: 'Meridian',
    price: 285000, unlockLevel: 18,
    // Water flush, fine feed and a chuck: the same machine drills the
    // overburden pre-collar and a rock anchor when the core job is finished.
    methods: ['core', 'auger', 'anchor'],
    stats: { power: 97, torque: 5.4, feedForce: 34, depthCapacity: 1200, rodHandling: 0.55, mobility: 0.55, comfort: 0.5 },
    upkeepPerHour: 24, fuelPerHour: 21, transportTons: 9,
    description: 'Skid-and-track exploration rig with a wireline winch and a chuck that will hold NQ all day. Slow rotation, fine feed control — you are chasing recovery, not metres.',
    family: CAT.rigCore,
  },
  {
    id: 'foundation-bg', name: 'Torvald KR-46 Kellyline', maker: 'Torvald',
    price: 1050000, unlockLevel: 23,
    methods: ['rotary-kelly', 'cfa', 'cased-cfa'],
    stats: { power: 315, torque: 178, feedForce: 260, depthCapacity: 78, rodHandling: 0.85, mobility: 0.35, comfort: 0.9 },
    upkeepPerHour: 96, fuelPerHour: 84, transportTons: 118,
    description: 'A 118-tonne rotary foundation rig with a four-stage interlocking Kelly and 178 kNm at the drive head. It arrives on three trailers and a crane, and it turns a 1200 mm pile like the ground owes it money.',
    family: CAT.rigFoundation,
  },
  {
    id: 'cfa-rig', name: 'Lindhorst CF-28 Continuum', maker: 'Lindhorst',
    price: 720000, unlockLevel: 27,
    methods: ['cfa', 'cased-cfa', 'auger', 'rotary-kelly'],
    stats: { power: 261, torque: 132, feedForce: 190, depthCapacity: 32, rodHandling: 0.7, mobility: 0.4, comfort: 0.85 },
    upkeepPerHour: 74, fuelPerHour: 69, transportTons: 82,
    description: 'Fixed-mast CFA rig with concrete-pressure and auger-rotation logging on the cab screen. Add the counter-rotating casing drive and it becomes a double-rotary machine without leaving the yard.',
    family: CAT.rigFoundation,
  },
  {
    id: 'oil-derrick', name: 'Havstein DR-2400 Derrickline', maker: 'Havstein',
    price: 4850000, unlockLevel: 30,
    methods: ['oil-rotary'],
    stats: { power: 1490, torque: 44, feedForce: 450, depthCapacity: 2400, rodHandling: 0.94, mobility: 0.06, comfort: 0.88 },
    upkeepPerHour: 540, fuelPerHour: 620, transportTons: 940,
    description: 'A 2,400 m mast rig on a skidding substructure: 1,490 kW of drawworks, a 44 kNm top drive, 2,670 kN of hook load and a 1,180 kW triplex on the mud skid. It arrives in twenty-two loads and takes a week to rig up, and the weight on the bit still comes from the collars rather than from the mast.',
    family: CAT.rigOilGas,
    // This table and the derrick builder in rig/rigFactory.js were written in
    // parallel, so the entry carries its own degradation path: `model` is the
    // machine the factory is asked for, `renderRigId` is the buildable rig to
    // fall back to if that builder is absent, and rigRenderId() picks between
    // them from the factory's own RIG_IDS. The scene never renders empty and
    // nothing throws either way. (rigFactory.js does now build 'oil-derrick';
    // the fallback stays as the guard it was written to be.)
    model: 'derrick-mast-2400',
  },
  {
    id: 'hdd-rig', name: 'Halvard HD-330 Traverse', maker: 'Halvard',
    price: 585000, unlockLevel: 38,
    methods: ['hdd'],
    stats: { power: 186, torque: 21, feedForce: 330, depthCapacity: 1200, rodHandling: 0.9, mobility: 0.65, comfort: 0.78 },
    upkeepPerHour: 58, fuelPerHour: 47, transportTons: 27,
    description: '33-tonne thrust/pullback maxi-rig with a 220-rod carousel and its own mixing plant on the skid. Anchored down at the entry pit, it will put 900 m of gas main under a river.',
    family: CAT.hddRigs,
  },
  {
    id: 'sonic-truck', name: 'Corvara SN-6 Resonant', maker: 'Corvara',
    price: 465000, unlockLevel: 42,
    methods: ['sonic', 'auger'],
    stats: { power: 168, torque: 9.6, feedForce: 90, depthCapacity: 120, rodHandling: 0.75, mobility: 0.95, comfort: 0.8 },
    upkeepPerHour: 61, fuelPerHour: 39, transportTons: 18,
    description: 'Truck-mounted sonic head running 90–160 Hz against a hydraulic isolator. Drives its own casing, needs no flush, and hands the geologist a metre of undisturbed core in a plastic sleeve.',
    family: CAT.rigSonic,
  },
  {
    /* Half of this machine is the sample train. The hole is incidental; the
       product is a numbered calico bag every metre, and the cyclone and splitter
       that fill it are the reason the rig is the size it is. */
    id: 'rc-rig', name: 'Kjelvik RC-410 Chipline', maker: 'Kjelvik',
    price: 520000, unlockLevel: 21,
    methods: ['rc', 'dth'],
    stats: { power: 328, torque: 14.5, feedForce: 66, depthCapacity: 400, rodHandling: 0.82, mobility: 0.55, comfort: 0.74 },
    upkeepPerHour: 62, fuelPerHour: 74, transportTons: 24,
    description: 'Reverse-circulation exploration rig with a 25 m³/min compressor at 24 bar and a booster behind it. Dual swivel, deflector box, four-inch hose, cyclone and riffle splitter: two to three kilos of chips per metre, bagged and numbered at every metre mark, and a hole that goes to four hundred.',
    family: CAT.rigCore,
  },
  {
    /* Everything about the shape follows the drive it works in: 1,775 mm
       tramming height for a low-profile heading, centre articulation to turn a
       90-degree intersection, 300 mm of ground clearance because the floor is
       muck, and a cable reel because it TRAMS on diesel and DRILLS on mains. */
    id: 'tunnel-jumbo', name: 'Aurbach FJ-220 Faceline', maker: 'Aurbach',
    price: 495000, unlockLevel: 36,
    methods: ['tunnel-jumbo', 'rockbolt'],
    stats: { power: 74, torque: 0.34, feedForce: 31, depthCapacity: 24, rodHandling: 0.7, mobility: 0.62, comfort: 0.45 },
    upkeepPerHour: 88, fuelPerHour: 34, transportTons: 16.8,
    description: 'Twin-boom development jumbo with a third boom for the basket. Two 14 kW drifters at 110 Hz, 2,132 mm holes on 2,435 mm rods, water flush at 33 l/min. It trams on 74 kW of diesel and drills on 70 kW off the cable reel, because a heading has mains in it and no room for a radiator.',
    family: CAT.jumbos,
  },
  {
    /* A slew ring swinging a short feed through a full circle, so one set-up
       drills a whole ring. The rods are short for the same reason. */
    id: 'longhole-rig', name: 'Fennholm LH-60 Fanline', maker: 'Fennholm',
    price: 545000, unlockLevel: 39,
    methods: ['longhole', 'rockbolt'],
    stats: { power: 74, torque: 1.1, feedForce: 34, depthCapacity: 30, rodHandling: 0.76, mobility: 0.6, comfort: 0.45 },
    upkeepPerHour: 84, fuelPerHour: 31, transportTons: 15.2,
    description: 'Underground longhole production drill on 74 kW of diesel and 55 kW of mains. The feed swings through a full circle on the slew ring and drills the ring from one set-up, on 915 to 1,830 mm rods, top hammer to 127 mm or in-the-hole to 216 mm. Hold it under two percent deviation over twenty-five metres or the toe is somewhere the blast design did not put it.',
    family: CAT.rigMulti,
  },
  {
    /* The boom points UP. Ground support is permanent, continuous and legally
       required, and this is the machine that does it. */
    id: 'bolter', name: 'Skarnes GB-14 Boltline', maker: 'Skarnes',
    price: 460000, unlockLevel: 29,
    methods: ['rockbolt', 'anchor'],
    stats: { power: 74, torque: 0.9, feedForce: 28, depthCapacity: 6, rodHandling: 0.88, mobility: 0.6, comfort: 0.45 },
    upkeepPerHour: 76, fuelPerHour: 29, transportTons: 14.6,
    description: 'Rock bolter with an eight-bolt carousel, a resin cartridge magazine, a grout pump and a mesh handler on the deck. Bolts from 0.9 to 3.6 m, friction at 33, 39 and 46 mm or resin-grouted rebar, and the rule that decides whether any of it holds: the hole is smaller than the bolt and at least fifty millimetres longer.',
    family: CAT.rigMulti,
  },
  {
    /* No boom at all: a 21 m telescopic leader with a 9 t ram on it and a
       counterweight that slides back as the leader rakes. */
    id: 'piling-leader', name: 'Bergholt DP-78 Leaderline', maker: 'Bergholt',
    price: 980000, unlockLevel: 33,
    methods: ['driven-pile'],
    stats: { power: 280, torque: 0, feedForce: 0, depthCapacity: 25, rodHandling: 0.8, mobility: 0.28, comfort: 0.82 },
    upkeepPerHour: 122, fuelPerHour: 96, transportTons: 78,
    description: 'Leader-mounted impact piling rig: a 21 m telescopic leader, a 9,000 kg ram giving 106 kNm over a 1,200 mm stroke at forty to a hundred blows a minute, and a movable counterweight that slides back as the leader rakes. Nothing on this machine rotates and nothing circulates — it lifts a pile, sets it plumb and hits it.',
    family: CAT.rigFoundation,
  },
  {
    /* THE DUAL-CONFIGURATION LEADER — the machine that was modelled before it
       existed in the game.

       `blender/pd55.py` and `public/models/pd55.glb` (4.56 MB) were built from
       a manufacturer datasheet and then had nowhere to go: there was no RIGS
       row, so `checkmodels.mjs` had to carry it in a NOT_A_RIG list to stop
       itself failing. This row is that list entry's replacement.

       Every figure below marked [DS] comes from the datasheet transcribed in
       `research/rigs/rm20-leader.md`, which cites page numbers against
       `research/rigs/source/RTG_RM20_official_905_836_1_2.pdf`. The rig id
       stays `pd55` because the exported filename must equal the rig id
       verbatim (ASTRA.md §4) and the Blender module is another agent's file;
       renaming both together is a tidy-up for later, not a correctness fix.

       WHY IT EARNS A PLACE. It is the only machine in the fleet that is TWO
       configurations of one carrier: an impact hammer on the mast for driven
       piling, or a rotary head on a tiltable sledge for DTH. At 49.5 t it also
       fills a real gap — between the light crawlers and the 118 t foundation
       rig — and the game models its two jobs as two separate methods. */
    id: 'pd55', name: 'Ulvestad DL-50 Duoleader', maker: 'Ulvestad',
    // Balance, not datasheet: it does two jobs for less mass than the
    // single-purpose leader, so it costs more and unlocks later.
    price: 1050000, unlockLevel: 36,
    methods: ['driven-pile', 'dth'],
    // `rigFactory.js` has no builder for this machine — it is Blender-authored
    // only. The .glb is what actually draws; this names the stand-in for the
    // procedural path, and checkdata warns to delete the line the day a real
    // builder exists.
    renderRigId: 'piling-leader',
    stats: {
      power: 201,          // [DS p.9] Cummins QSB 6.7, 201 kW @ 2000 rpm
      torque: 150,         // [DS p.7] admissible torque, DTH configuration
      feedForce: 200,      // [DS p.7] sledge pretensioning, 200 kN push / pull
      depthCapacity: 20,   // [DS p.7] max casing length; 18.0 m max pile [p.4]
      rodHandling: 0.72, mobility: 0.38, comfort: 0.8,
    },
    // Balance figures, scaled from the 78 t leader by mass. NOT SOURCED.
    upkeepPerHour: 78, fuelPerHour: 61,
    transportTons: 49.5,   // [DS p.10] 49.5 t HDP / 51.5 t DTH, no counterweight
    description: 'One carrier, two machines. Hang the hydraulic hammer on the mast and it drives pile; swap in the rotary head on its tiltable sledge and it drills cased DTH holes at 150 kNm. The mast slides seven metres through its own guide for underfloor work, rakes 45° back, and the counterweight comes off in stacked discs so it can travel.',
    family: CAT.rigFoundation,
  },
  {
    /* The smallest machine in the fleet and the reason it exists: 790 mm wide,
       so it goes through a garden gate and down a basement ramp. */
    id: 'si-rig', name: 'Rynnval SI-30 Probeline', maker: 'Rynnval',
    price: 72000, unlockLevel: 8,
    methods: ['site-investigation', 'auger', 'anchor'],
    stats: { power: 18, torque: 2.2, feedForce: 12, depthCapacity: 40, rodHandling: 0.2, mobility: 0.92, comfort: 0.2 },
    upkeepPerHour: 7, fuelPerHour: 5, transportTons: 1.25,
    description: 'A 1.25-tonne tracked geotechnical rig, 790 mm across the tracks, with a folding mast and a detachable power pack on hoses. Rods are handed up by the second man because there is no carousel. It carries the automatic trip hammer — 63.5 kg falling 760 mm — and the split spoon, U100, Shelby and window samplers that go under it.',
    family: CAT.rigGeotech,
  },
  {
    /* Mostly reaction mass. A full-capacity sounding needs 100-200 kN of thrust
       and the machine has to not move while it delivers it. */
    id: 'cpt-unit', name: 'Rynnval CP-20 Ballastline', maker: 'Rynnval',
    price: 245000, unlockLevel: 20,
    methods: ['site-investigation'],
    stats: { power: 55, torque: 0, feedForce: 200, depthCapacity: 40, rodHandling: 0.55, mobility: 0.5, comfort: 0.7 },
    upkeepPerHour: 26, fuelPerHour: 18, transportTons: 20,
    description: 'Twenty tonnes of tracked ballast around a push frame, with levelling jacks that lift the unit off its own suspension so the dead weight is the reaction. No mast, no rotation, no flush and no sample: 44.5 mm rods pushed at twenty millimetres a second while cone resistance, sleeve friction and pore pressure are logged every fifty. Thirty to forty metres is the day.',
    family: CAT.rigGeotech,
  },
  {
    id: 'raisebore', name: 'Vantera RB-92 Shaftline', maker: 'Vantera',
    price: 1720000, unlockLevel: 52,
    methods: ['raise-boring'],
    stats: { power: 448, torque: 310, feedForce: 4200, depthCapacity: 600, rodHandling: 0.65, mobility: 0.12, comfort: 0.55 },
    upkeepPerHour: 178, fuelPerHour: 0,
    transportTons: 64,
    description: 'Electric underground raise borer: 310 kNm reaming torque and 4200 kN of pull. Grouted down to the level floor, it drills a 311 mm pilot and then walks a 1.8 m reamer head back up through it.',
    family: CAT.raiseBore,
  },
]);

/* ═══════════════════════════════════════════════════════════════════════════
   ITEMS — the iMarket shop stock.

   stats semantics (read by sim/drilling.js and game/economy.js):
     ropMult      multiplier on rate of penetration        (1.0 = neutral)
     wearRate     multiplier on wear accumulation          (lower is better)
     maxUCS       MPa the tool cuts happily; above it ROP falls away
     abrasionRes  0..1 resistance to abrasive ground
     flushRate    normalised flushing capacity contributed  (0 = n/a)
     torqueCap    kNm the component transmits              (0 = n/a)
     life         metres of hole before the item is consumed (0 = durable)

   Tiering rule: an `econ` variant costs ~30% of the `std` price, delivers ~80%
   of the ROP and ~40% of the life — so it is genuinely cheaper per metre, and
   you pay the difference in time: slower penetration and two and a half times
   as many trips out to change it. That is the purchasing decision.

   The one exception is the economy DTH hammer. A real DTH hammer does not
   exist below about EUR 1,200, so it cannot be priced at 30% of a EUR 1,980
   one; instead its life is cut to a quarter. It is what you run because you
   cannot yet afford the good one, not because it is good value.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} name
 * @property {string} category  real taxonomy path (CAT.*)
 * @property {string} slot      SLOTS id
 * @property {number} price     EUR
 * @property {number} unlockLevel
 * @property {string[]} methods METHODS ids this item is valid for
 * @property {string} thread    scoped connection (DOMAIN.md §4) or 'n/a'
 * @property {string} material  DOMAIN.md §5 grade
 * @property {'standard'|'HD'} duty
 * @property {{ropMult:number,wearRate:number,maxUCS:number,abrasionRes:number,flushRate:number,torqueCap:number,life:number}} stats
 * @property {boolean} consumable
 * @property {string} description
 * @property {'econ'|'std'|'prem'} tier
 * @property {string|false} [model]   a `rig/tools.js` builder id, so the shop
 *        preview resolves exactly instead of guessing from the item's name.
 *        `false` means there is deliberately no model — a fluid, a service, a
 *        rental, an instrument in a case.
 * @property {boolean} [priceSourced] default true. False where no published
 *        price exists at all and the figure is an estimate; `needs` must then
 *        say what is missing. PLATFORM_TRUTH.md Part C rule 7.
 * @property {string} [needs]         what would have to be found for the number
 *        above it to become a fact.
 */

const S0 = { ropMult: 1, wearRate: 1, maxUCS: 0, abrasionRes: 0.5, flushRate: 0, torqueCap: 0, life: 0 };

/** Item literal to fully-populated Item. */
const it = (o) => ({
  duty: 'standard', consumable: false, tier: 'std', unlockLevel: 1,
  thread: 'n/a', material: 'S355J2', methods: [],
  ...o,
  stats: { ...S0, ...(o.stats || {}) },
});

/* -- Drill Bits & Cutting Tools ----------------------------------------- */
const ITEMS_BITS = [
  // Button Bits (top hammer). R/T percussion threads only.
  it({ id: 'bit-th-r32-45-econ', name: 'R32 45 mm Button Bit, Economy', category: CAT.buttonBits, slot: 'bit',
    price: 128, unlockLevel: 6, methods: ['top-hammer', 'anchor'], thread: 'R32', material: 'carbide grade K10',
    tier: 'econ', consumable: true,
    stats: { ropMult: 0.80, wearRate: 1.75, maxUCS: 120, abrasionRes: 0.35, life: 130 },
    description: 'Spherical buttons in a soft matrix. It will make the hole once, and you will regrind it twice before it gives up.' }),
  it({ id: 'bit-th-r32-45-std', name: 'R32 45 mm Button Bit, Spherical', category: CAT.buttonBits, slot: 'bit',
    price: 420, unlockLevel: 6, methods: ['top-hammer', 'anchor'], thread: 'R32', material: 'carbide grade K15',
    consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 180, abrasionRes: 0.6, life: 330 },
    description: 'The default small-hole bit. Eight spherical buttons, four gauge, flat face, forgiving on feed and easy to grind straight.' }),
  it({ id: 'bit-th-t38-64-std', name: 'T38 64 mm Button Bit, Ballistic', category: CAT.buttonBits, slot: 'bit',
    price: 312, unlockLevel: 9, methods: ['top-hammer'], thread: 'T38', material: 'carbide grade K15',
    consumable: true,
    stats: { ropMult: 1.14, wearRate: 1.05, maxUCS: 200, abrasionRes: 0.6, life: 380 },
    description: 'Ballistic buttons bite harder in medium rock and clear cuttings better, at the price of chipping if you let the percussion run dry.' }),
  it({ id: 'bit-th-t45-76-std', name: 'T45 76 mm Button Bit, Retrac', category: CAT.buttonBits, slot: 'bit',
    price: 398, unlockLevel: 12, methods: ['top-hammer'], thread: 'T45', material: 'carbide grade K20',
    consumable: true,
    stats: { ropMult: 1.2, wearRate: 0.94, maxUCS: 230, abrasionRes: 0.68, life: 480 },
    description: 'Retrac skirt with reaming buttons, the one you reach for in fractured ground where a plain bit gets stuck on the way out.' }),
  it({ id: 'bit-th-t45-89-hd', name: 'T45 89 mm Button Bit, Heavy Duty', category: CAT.buttonBits, slot: 'bit',
    price: 624, unlockLevel: 16, methods: ['top-hammer'], thread: 'T45', material: 'carbide grade K25',
    duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.3, wearRate: 0.7, maxUCS: 280, abrasionRes: 0.85, life: 760 },
    description: 'Deep-face HD head with gauge protection and a heavier carbide grade. Twice the money, three times the life in quartzitic ground.' }),
  it({ id: 'bit-th-t51-102-hd', name: 'T51 102 mm Button Bit, Heavy Duty', category: CAT.buttonBits, slot: 'bit',
    price: 878, unlockLevel: 20, methods: ['top-hammer'], thread: 'T51', material: 'carbide grade K25',
    duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.36, wearRate: 0.66, maxUCS: 300, abrasionRes: 0.9, life: 900 },
    description: 'The biggest hole a top-hammer string should honestly be asked to make. Above this, the energy the string loses at every joint costs you more than a DTH hammer would.' }),

  // DTH Bits. DHD/QL shank vocabulary only.
  it({ id: 'bit-dth-3-econ', name: '3 in QL30 85 mm DTH Bit, Economy', category: CAT.dthBits, slot: 'bit',
    price: 158, unlockLevel: 10, methods: ['dth', 'overburden'], thread: 'QL30', material: 'carbide grade K10',
    tier: 'econ', consumable: true,
    stats: { ropMult: 0.8, wearRate: 1.7, maxUCS: 150, abrasionRes: 0.4, life: 220 },
    description: 'Import-grade 3-inch face. Fine in limestone, and a lesson in false economy in gneiss.' }),
  it({ id: 'bit-dth-3-std', name: '3 in QL30 90 mm DTH Bit, Convex', category: CAT.dthBits, slot: 'bit',
    price: 520, unlockLevel: 10, methods: ['dth', 'overburden'], thread: 'QL30', material: 'carbide grade K15',
    consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 220, abrasionRes: 0.62, life: 560 },
    description: 'Convex face, six gauge buttons, generous flushing grooves. The 3-inch bit that pays for itself on geothermal work.' }),
  it({ id: 'bit-dth-4-std', name: '4 in DHD340 115 mm DTH Bit, Flat Face', category: CAT.dthBits, slot: 'bit',
    price: 528, unlockLevel: 13, methods: ['dth', 'overburden'], thread: 'DHD340', material: 'carbide grade K15',
    consumable: true,
    stats: { ropMult: 1.1, wearRate: 0.96, maxUCS: 240, abrasionRes: 0.66, life: 700 },
    description: 'Flat face for straight holes. If the hole has to stay vertical over 120 m, this is the geometry that does it.' }),
  it({ id: 'bit-dth-4-hd', name: '4 in DHD340 115 mm DTH Bit, HD Ballistic', category: CAT.dthBits, slot: 'bit',
    price: 764, unlockLevel: 17, methods: ['dth', 'overburden'], thread: 'DHD340', material: 'carbide grade K25',
    duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.26, wearRate: 0.68, maxUCS: 300, abrasionRes: 0.88, life: 1150 },
    description: 'Ballistic-plus-gauge head in a heavy carbide grade with a hardfaced skirt. Built for abrasive granite where a standard bit rounds off in a shift.' }),
  it({ id: 'bit-dth-5-std', name: '5 in QL50 140 mm DTH Bit', category: CAT.dthBits, slot: 'bit',
    price: 892, unlockLevel: 21, methods: ['dth', 'overburden'], thread: 'QL50', material: 'carbide grade K20',
    consumable: true,
    stats: { ropMult: 1.18, wearRate: 0.9, maxUCS: 260, abrasionRes: 0.74, life: 980 },
    description: 'Water-well standard: 140 mm takes a 125 mm liner in rock, open-hole, without needing a booster. It leaves no room for a filter pack — that wants a far wider hole.' }),
  it({ id: 'bit-dth-6-hd', name: '6 in DHD360 165 mm DTH Bit, HD', category: CAT.dthBits, slot: 'bit',
    price: 1460, unlockLevel: 26, methods: ['dth', 'overburden'], thread: 'DHD360', material: 'carbide grade K25',
    duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.32, wearRate: 0.64, maxUCS: 310, abrasionRes: 0.92, life: 1380 },
    description: 'Big-hole HD bit for production and deep wells. Needs 21 m³/min at the face or it will simply grind the cuttings a second time.' }),
  it({ id: 'bit-dth-8-hd', name: '8 in QL80 203 mm DTH Bit, HD', category: CAT.dthBits, slot: 'bit',
    price: 1980, unlockLevel: 33, methods: ['dth'], thread: 'QL80', material: 'carbide grade K25',
    duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.38, wearRate: 0.62, maxUCS: 320, abrasionRes: 0.94, life: 1600 },
    description: 'Eight inches of face. Mine-production geometry: it will not turn without a booster behind it, and it does not care what the rock is.' }),

  // Tricone
  it({ id: 'bit-tri-6-mill', name: '6 in Tricone Bit, Milled Tooth (Soft)', category: CAT.triconeBits, slot: 'bit',
    price: 748, unlockLevel: 14, methods: ['rotary-kelly', 'hdd'], thread: 'API REG 3 1/2',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.15, wearRate: 1.3, maxUCS: 60, abrasionRes: 0.35, life: 420 },
    description: 'Long milled teeth for soft, sticky formations. It shovels clay and marl; it dies in anything crystalline.' }),
  it({ id: 'bit-tri-8-tci', name: '8 in Tricone Bit, TCI Medium', category: CAT.triconeBits, slot: 'bit',
    price: 1880, unlockLevel: 20, methods: ['rotary-kelly', 'hdd'], thread: 'API REG 4 1/2',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.08, wearRate: 0.92, maxUCS: 150, abrasionRes: 0.7, life: 760 },
    description: 'Tungsten-carbide insert cones with sealed journal bearings. The all-rounder for mixed sedimentary sequences.' }),
  it({ id: 'bit-tri-12-tci', name: '12 1/4 in Tricone Bit, TCI Hard', category: CAT.triconeBits, slot: 'bit',
    price: 3420, unlockLevel: 28, methods: ['rotary-kelly', 'hdd'], thread: 'API REG 6 5/8',
    material: '42CrMo4(V)', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.05, wearRate: 0.74, maxUCS: 220, abrasionRes: 0.85, life: 1100 },
    description: 'Short conical inserts, heavy bearings, large-diameter body. It advances slowly and never surprises you.' }),

  // PDC
  it({ id: 'bit-pdc-6', name: '6 in PDC Bit, 5-Blade', category: CAT.pdcBits, slot: 'bit',
    price: 2940, unlockLevel: 24, methods: ['rotary-kelly', 'hdd'], thread: 'API REG 3 1/2',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.55, wearRate: 1.1, maxUCS: 110, abrasionRes: 0.55, life: 900 },
    description: 'Polycrystalline diamond cutters shear rather than crush: enormously fast in shale, instantly destroyed by a boulder.' }),
  it({ id: 'bit-pdc-8-hd', name: '8 1/2 in PDC Bit, 6-Blade HD', category: CAT.pdcBits, slot: 'bit',
    price: 4680, unlockLevel: 32, methods: ['rotary-kelly', 'hdd'], thread: 'API REG 4 1/2',
    material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.72, wearRate: 0.82, maxUCS: 160, abrasionRes: 0.78, life: 1500 },
    description: 'Six blades, backup cutters and a depth-of-cut control ring. The fastest legal way through a long sandstone and shale interval.' }),

  // Core bits
  it({ id: 'bit-core-bq-surf', name: 'BQ Surface-Set Core Bit', category: CAT.coreBits, slot: 'bit',
    price: 186, unlockLevel: 18, methods: ['core'], thread: 'Wireline BQ (BWL)', material: 'carbide grade K10',
    consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.2, maxUCS: 120, abrasionRes: 0.5, life: 190 },
    description: 'Natural-diamond surface set. Cheap per bit, expensive per metre: use it to finish a hole, not to start one.' }),
  it({ id: 'bit-core-nq-imp', name: 'NQ Impregnated Core Bit, Series 7', category: CAT.coreBits, slot: 'bit',
    price: 486, unlockLevel: 18, methods: ['core'], thread: 'Wireline NQ (NWL)', material: 'carbide grade K20',
    consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 260, abrasionRes: 0.8, life: 320 },
    description: 'Medium-hard matrix, twelve waterways. The industry default: it holds gauge, keeps the core round, and tells you when it is polished.' }),
  it({ id: 'bit-core-hq-imp', name: 'HQ Impregnated Core Bit, Series 5', category: CAT.coreBits, slot: 'bit',
    price: 692, unlockLevel: 22, methods: ['core'], thread: 'Wireline HQ (HWL)', material: 'carbide grade K20',
    consumable: true,
    stats: { ropMult: 1.06, wearRate: 0.92, maxUCS: 300, abrasionRes: 0.86, life: 380 },
    description: 'Softer matrix for hard, unbroken rock: it wears back fast enough to keep exposing fresh diamond in granite.' }),
  it({ id: 'bit-core-pq-imp-hd', name: 'PQ Impregnated Core Bit, HD Matrix', category: CAT.coreBits, slot: 'bit',
    price: 1060, unlockLevel: 28, methods: ['core'], thread: 'Wireline PQ (PWL)', material: 'carbide grade K25',
    duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.1, wearRate: 0.76, maxUCS: 310, abrasionRes: 0.92, life: 520 },
    description: 'Large-diameter geotechnical coring bit. Slow, expensive, and the only thing that brings a fracture zone up in one piece.' }),

  // Sacrificial / lost bits for self-drilling anchors
  it({ id: 'lostbit-cross-51', name: 'R32 51 mm Cross Bit, Sacrificial', category: CAT.lostBits, slot: 'bit',
    price: 17, unlockLevel: 31, methods: ['anchor'], thread: 'R32 hollow bar', material: 'carbide grade K10',
    tier: 'econ', consumable: true,
    stats: { ropMult: 0.9, wearRate: 1.4, maxUCS: 140, abrasionRes: 0.4, life: 40 },
    description: 'A cross bit you never see again: it stays grouted in at the toe of the anchor. Priced accordingly.' }),
  it({ id: 'lostbit-clay-150', name: 'R38 150 mm Clay Bit, Sacrificial', category: CAT.lostBits, slot: 'bit',
    price: 56, unlockLevel: 31, methods: ['anchor'], thread: 'R38 hollow bar', material: 'S355J2',
    consumable: true,
    stats: { ropMult: 1.05, wearRate: 1.0, maxUCS: 20, abrasionRes: 0.3, life: 55 },
    description: 'Wide steel wings for cohesive soil: it displaces rather than cuts, and leaves a fat annulus for the grout.' }),
  it({ id: 'lostbit-carbide-90-hd', name: 'T76 90 mm Carbide Button Bit, Sacrificial HD', category: CAT.lostBits, slot: 'bit',
    price: 98, unlockLevel: 35, methods: ['anchor'], thread: 'T76 hollow bar', material: 'carbide grade K20',
    duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.15, wearRate: 0.72, maxUCS: 240, abrasionRes: 0.82, life: 90 },
    description: 'Buttoned sacrificial head for micropiles that have to reach a rock socket through a boulder bed.' }),

  // Reamers and hole openers
  it({ id: 'reamer-th-127', name: 'T51 127 mm Pilot Reamer', category: CAT.reamersOpeners, slot: 'bit',
    price: 690, unlockLevel: 20, methods: ['top-hammer', 'overburden'], thread: 'T51', material: '42CrMo4(V)',
    consumable: true,
    stats: { ropMult: 0.9, wearRate: 0.95, maxUCS: 240, abrasionRes: 0.75, life: 620 },
    description: 'Opens a pilot hole to full casing diameter behind the bit. Slow, but it is how you get 127 mm without a five-inch hammer.' }),

  // Drag / wing bits -- the pre-drill for jet grouting and soft rotary work
  it({ id: 'bit-drag-150', name: '150 mm Drag Bit, Three-Wing', category: CAT.dragWingBits, slot: 'bit',
    price: 486, unlockLevel: 14, methods: ['jet-grouting', 'auger', 'rotary-kelly'],
    thread: 'API REG 2 3/8', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.15, maxUCS: 15, abrasionRes: 0.35, flushRate: 0.9, life: 620 },
    description: 'Three brazed carbide wings on a plain body. It shears soft ground fast and is the standard pre-drill on a jet grout column.' }),
  it({ id: 'bit-drag-190-hd', name: '190 mm Drag Bit, Four-Wing HD', category: CAT.dragWingBits, slot: 'bit',
    price: 940, unlockLevel: 24, methods: ['jet-grouting', 'rotary-kelly', 'hdd'],
    thread: 'API REG 3 1/2', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.18, wearRate: 0.74, maxUCS: 35, abrasionRes: 0.7, flushRate: 1.15, life: 1500 },
    description: 'Hardfaced wings and replaceable nozzles. It survives the gravel band that strips a standard drag bit in a single column.' }),
];

/* -- Drill String, Top Hammer & DTH Tools -------------------------------- */
const ITEMS_STRING = [
  // Drill Rods (Threaded) -- R/T percussion vocabulary
  it({ id: 'rod-r32', name: 'R32 Drill Rod, 3.05 m', category: CAT.drillRods, slot: 'rod',
    price: 168, unlockLevel: 1, methods: ['top-hammer', 'anchor', 'overburden', 'rockbolt'],
    thread: 'R32', material: '42CrMo4(V)', consumable: true, model: 'drill-rod',
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 1.4, life: 1400 },
    description: 'The rod you start with. Straight, light enough to lift by hand, and it will take more abuse than the thread on the end of it.' }),
  it({ id: 'rod-r32-hd', name: 'R32 Drill Rod, 3.05 m HD', category: CAT.drillRods, slot: 'rod',
    price: 238, unlockLevel: 8, methods: ['top-hammer', 'anchor', 'overburden'],
    thread: 'R32', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.03, wearRate: 0.72, torqueCap: 1.9, life: 2400 },
    description: 'Same geometry, better steel and a rolled thread. It survives the shock loads that split a standard rod at the coupling.' }),
  it({ id: 'rod-t38', name: 'T38 Drill Rod, 3.66 m', category: CAT.drillRods, slot: 'rod',
    price: 248, unlockLevel: 9, methods: ['top-hammer', 'overburden'],
    thread: 'T38', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.05, wearRate: 0.95, torqueCap: 2.4, life: 1900 },
    description: 'Trapezoidal thread: more contact area, better energy transfer, and it uncouples without a fight at the end of a shift.' }),
  it({ id: 'rod-t45', name: 'T45 Drill Rod, 3.66 m', category: CAT.drillRods, slot: 'rod',
    price: 316, unlockLevel: 12, methods: ['top-hammer', 'overburden'],
    thread: 'T45', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.1, wearRate: 0.9, torqueCap: 3.6, life: 2200 },
    description: 'The workhorse of surface top hammer. If you only ever own one rod size, own this one.' }),
  it({ id: 'rod-t45-hd', name: 'T45 Drill Rod, 3.66 m HD', category: CAT.drillRods, slot: 'rod',
    price: 428, unlockLevel: 16, methods: ['top-hammer', 'overburden'],
    thread: 'T45', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.13, wearRate: 0.66, torqueCap: 4.4, life: 3600 },
    description: 'Case-hardened and shot-peened. In quartzite it is the difference between changing rods weekly and changing them quarterly.' }),
  it({ id: 'rod-t51', name: 'T51 Drill Rod, 4.30 m', category: CAT.drillRods, slot: 'rod',
    price: 486, unlockLevel: 20, methods: ['top-hammer', 'overburden'],
    thread: 'T51', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.16, wearRate: 0.86, torqueCap: 5.6, life: 2600 },
    description: 'Heavy percussion string for 102 mm holes and long anchor work. Two men or a rod handler, no middle ground.' }),
  it({ id: 'rod-t60-hd', name: 'T60 Drill Rod, 6.00 m HD', category: CAT.drillRods, slot: 'rod',
    price: 704, unlockLevel: 26, methods: ['top-hammer', 'overburden'],
    thread: 'T60', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.2, wearRate: 0.6, torqueCap: 7.8, life: 4200 },
    description: 'Six metres per rod means half the joints, and every joint you do not make is energy that reaches the bit.' }),

  // Coupling Sleeves
  it({ id: 'coup-r32', name: 'R32 Coupling Sleeve', category: CAT.couplingSleeves, slot: 'coupling',
    price: 48, unlockLevel: 6, methods: ['top-hammer', 'anchor', 'overburden', 'rockbolt'],
    thread: 'R32', material: '42CrMo4(V)', consumable: true,
    stats: { wearRate: 1.0, torqueCap: 1.4, life: 900 },
    description: 'The cheapest part of the string and the one that fails first. Buy them in tens.' }),
  it({ id: 'coup-t45', name: 'T45 Coupling Sleeve, Semi-Bridged', category: CAT.couplingSleeves, slot: 'coupling',
    price: 82, unlockLevel: 12, methods: ['top-hammer', 'overburden'],
    thread: 'T45', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.02, wearRate: 0.9, torqueCap: 3.6, life: 1200 },
    description: 'The internal bridge stops the rods bottoming and keeps the shoulders square. Worth the extra euros every time.' }),
  it({ id: 'coup-t51-hd', name: 'T51 Coupling Sleeve, HD', category: CAT.couplingSleeves, slot: 'coupling',
    price: 124, unlockLevel: 20, methods: ['top-hammer', 'overburden'],
    thread: 'T51', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.03, wearRate: 0.62, torqueCap: 5.8, life: 2200 },
    description: 'Heavy-wall sleeve for long strings. It runs cool, which is the only thing that keeps a T51 joint alive at depth.' }),

  // Shank Adapters
  it({ id: 'shank-r32-std', name: 'R32 Shank Adapter', category: CAT.shankAdapters, slot: 'shank',
    price: 286, unlockLevel: 6, methods: ['top-hammer', 'anchor', 'rockbolt'],
    thread: 'R32', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 1.5, life: 1600 },
    description: 'The part that takes every blow the drifter makes. Check the splines each morning or find them in the hole.' }),
  it({ id: 'shank-t45-hd', name: 'T45 Shank Adapter, HD', category: CAT.shankAdapters, slot: 'shank',
    price: 528, unlockLevel: 14, methods: ['top-hammer'],
    thread: 'T45', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.05, wearRate: 0.64, torqueCap: 4.0, life: 3200 },
    description: 'Induction-hardened splines and a nitrided striking face. It costs a day rate and lasts a season.' }),
  it({ id: 'shank-t51-hd', name: 'T51 Shank Adapter, HD', category: CAT.shankAdapters, slot: 'shank',
    price: 698, unlockLevel: 20, methods: ['top-hammer', 'longhole'],
    thread: 'T51', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.06, wearRate: 0.6, torqueCap: 6.0, life: 3600 },
    description: 'Matched to the big drifters. Get the flushing head seal right or you will drown the striking face in cuttings.' }),

  // Hydraulic Drifters
  it({ id: 'drifter-16kw', name: '16 kW Hydraulic Drifter', category: CAT.drifters, slot: 'hammer',
    price: 12800, unlockLevel: 6, methods: ['top-hammer', 'anchor', 'rockbolt'],
    thread: 'R32 / T38', material: '34CrNiMo6',
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 200, torqueCap: 2.0 },
    description: 'Sixteen kilowatts at 60 Hz. Enough for R32 and T38 work, and gentle enough that the rods survive a learner on the feed lever.' }),
  it({ id: 'drifter-22kw-hd', name: '22 kW Hydraulic Drifter, HD', category: CAT.drifters, slot: 'hammer',
    price: 19600, unlockLevel: 14, methods: ['top-hammer', 'anchor'],
    thread: 'T45 / T51', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.22, wearRate: 0.88, maxUCS: 280, torqueCap: 4.5 },
    description: 'Variable blow energy and adaptive anti-jamming. The rock decides the frequency; you just hold the feed steady.' }),
  it({ id: 'drifter-30kw-hd', name: '30 kW Hydraulic Drifter, HD', category: CAT.drifters, slot: 'hammer',
    price: 28400, unlockLevel: 22, methods: ['top-hammer'],
    thread: 'T51 / T60', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.36, wearRate: 0.82, maxUCS: 310, torqueCap: 7.0 },
    description: 'Thirty kilowatts of percussion. It will drill 102 mm through granite faster than your compressor can clear the hole.' }),

  // DTH Hammers
  it({ id: 'ham-dth-3-econ', name: '3 in DTH Hammer, Economy', category: CAT.dthHammers, slot: 'hammer',
    price: 1280, unlockLevel: 10, methods: ['dth', 'overburden'],
    thread: 'QL30 shank', material: '42CrMo4(V)', tier: 'econ',
    stats: { ropMult: 0.82, wearRate: 1.6, maxUCS: 180, abrasionRes: 0.4, flushRate: 0.7, life: 1600 },
    description: 'A serviceable 3-inch hammer with a plain-valve air distribution. Rebuild kits are cheap because it needs them often.' }),
  it({ id: 'ham-dth-3-std', name: '3 in DTH Hammer, Valveless', category: CAT.dthHammers, slot: 'hammer',
    price: 1980, unlockLevel: 10, methods: ['dth', 'overburden'],
    thread: 'QL30 shank', material: '42CrMo4(V)',
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 240, abrasionRes: 0.62, flushRate: 1.0, life: 6200 },
    description: 'Valveless design with a foot valve and a reverse-circulation-friendly exhaust. Fewer moving parts, longer intervals.' }),
  it({ id: 'ham-dth-4-std', name: '4 in DTH Hammer, Valveless', category: CAT.dthHammers, slot: 'hammer',
    price: 2620, unlockLevel: 13, methods: ['dth', 'overburden'],
    thread: 'DHD340 shank', material: '42CrMo4(V)',
    stats: { ropMult: 1.08, wearRate: 0.96, maxUCS: 250, abrasionRes: 0.66, flushRate: 1.15, life: 7000 },
    description: 'The most common hammer on any European water-well truck. Runs happily from 12 to 24 bar.' }),
  it({ id: 'ham-dth-4-hd', name: '4 in DTH Hammer, High Frequency HD', category: CAT.dthHammers, slot: 'hammer',
    price: 3480, unlockLevel: 17, methods: ['dth', 'overburden'],
    thread: 'DHD340 shank', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.3, wearRate: 0.7, maxUCS: 300, abrasionRes: 0.86, flushRate: 1.3, life: 11000 },
    description: 'Short stroke, high blow rate, hardened wear sleeve. On 24 bar it puts a third more metres in the log per shift.' }),
  it({ id: 'ham-dth-5-hd', name: '5 in DTH Hammer, HD', category: CAT.dthHammers, slot: 'hammer',
    price: 4360, unlockLevel: 21, methods: ['dth', 'overburden'],
    thread: 'QL50 shank', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.34, wearRate: 0.68, maxUCS: 305, abrasionRes: 0.88, flushRate: 1.5, life: 12000 },
    description: 'Five-inch class with a choke set for deep holes. Change the choke and it will run on a smaller compressor at half the speed.' }),
  it({ id: 'ham-dth-6-hd', name: '6 in DTH Hammer, HD', category: CAT.dthHammers, slot: 'hammer',
    price: 5680, unlockLevel: 26, methods: ['dth'],
    thread: 'DHD360 shank', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.4, wearRate: 0.66, maxUCS: 310, abrasionRes: 0.9, flushRate: 1.9, life: 13000 },
    description: 'The last hammer that fits on a crawler mast. Beyond this you are into mine-production kit and a booster you cannot tow.' }),

  // DTH pipes and shanks
  it({ id: 'dthpipe-89', name: '89 mm DTH Drill Pipe, 6 m', category: CAT.dthPipes, slot: 'rod',
    price: 438, unlockLevel: 10, methods: ['dth', 'overburden'],
    thread: 'API REG 2 3/8', material: 'N80', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 6.0, flushRate: 1.0, life: 3200 },
    description: 'Friction-welded tool joints on N80 tube. It carries air, not blows, so it lives far longer than a percussion rod.' }),
  it({ id: 'dthpipe-114-hd', name: '114 mm DTH Drill Pipe, 6 m HD', category: CAT.dthPipes, slot: 'rod',
    price: 652, unlockLevel: 21, methods: ['dth'],
    thread: 'API REG 3 1/2', material: 'N80', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.05, wearRate: 0.7, torqueCap: 9.5, flushRate: 1.4, life: 6000 },
    description: 'Large-bore pipe for 5 and 6 inch hammers: less pressure drop down the string means more energy at the piston.' }),
  it({ id: 'shank-dth-ql50', name: 'QL50 DTH Shank, Spare', category: CAT.dthShanks, slot: 'shank',
    price: 418, unlockLevel: 21, methods: ['dth', 'overburden'],
    thread: 'QL50', material: '34CrNiMo6', consumable: true,
    stats: { wearRate: 0.9, torqueCap: 5.0, life: 2800 },
    description: 'Splined shank that transmits rotation to the bit while the piston hits it. A spare in the truck is not optional.' }),

  // Shock absorber
  it({ id: 'shock-t45', name: 'T45 Shock Absorber Sub', category: CAT.shockAbsorbers, slot: 'coupling',
    price: 1020, unlockLevel: 16, methods: ['top-hammer', 'overburden'],
    thread: 'T45', material: '34CrNiMo6',
    stats: { ropMult: 1.02, wearRate: 0.78, torqueCap: 4.0, life: 5200 },
    description: 'Absorbs the reflected wave before it reaches the drifter. It pays for itself in rotation-unit rebuilds, not in metres.' }),

  // Drive adapter
  it({ id: 'adapter-r32-t45', name: 'Drive Adapter R32 to T45', category: CAT.driveAdapters, slot: 'coupling',
    price: 268, unlockLevel: 12, methods: ['top-hammer', 'anchor', 'overburden'],
    thread: 'R32 box / T45 pin', material: '42CrMo4(V)', consumable: true,
    stats: { wearRate: 1.05, torqueCap: 2.0, life: 1400 },
    description: 'The honest way to run the rods you already own on the drifter you just bought. Never mix segments without one.' }),
];

/* -- Casing & Overburden Tools ------------------------------------------- */
const ITEMS_CASING = [
  it({ id: 'crown-114-std', name: '114 mm Casing Crown, Conical', category: CAT.casingCrowns, slot: 'casing',
    price: 684, unlockLevel: 14, methods: ['overburden'],
    thread: 'casing conical cone-ring LH', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 60, abrasionRes: 0.6, life: 260 },
    description: 'Carbide-tipped ring welded to the leading casing joint. It grinds the annulus open so the casing follows the bit.' }),
  it({ id: 'crown-140-std', name: '140 mm Casing Crown, Cylindrical', category: CAT.casingCrowns, slot: 'casing',
    price: 962, unlockLevel: 16, methods: ['overburden'],
    thread: 'casing cylindrical welded-thread LH', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.04, wearRate: 0.96, maxUCS: 70, abrasionRes: 0.64, life: 300 },
    description: 'Cylindrical profile keeps the outside diameter constant, which matters when the casing has to be pulled back later.' }),
  it({ id: 'crown-168-hd', name: '168 mm Casing Crown, HD', category: CAT.casingCrowns, slot: 'casing',
    price: 1460, unlockLevel: 19, methods: ['overburden'],
    thread: 'casing conical cone-ring LH', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.12, wearRate: 0.7, maxUCS: 110, abrasionRes: 0.85, life: 520 },
    description: 'Heavy carbide set with hardfaced flushing slots. It will chew through a boulder bed that stops a standard crown dead.' }),
  it({ id: 'crown-323-hd', name: '323 mm Casing Crown, HD', category: CAT.casingCrowns, slot: 'casing',
    price: 3720, unlockLevel: 30, methods: ['overburden'],
    thread: 'casing trapezoidal joint LH', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.14, wearRate: 0.68, maxUCS: 120, abrasionRes: 0.88, life: 620 },
    description: 'Large-diameter crown for cased piles and shafts. Two men cannot lift it; that is what the rod handler is for.' }),

  it({ id: 'ecc-90', name: 'Eccentric Overburden System, 90 mm', category: CAT.eccentricSys, slot: 'casing',
    price: 1340, unlockLevel: 14, methods: ['overburden'],
    thread: 'R32 / casing conical LH', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.05, maxUCS: 90, abrasionRes: 0.6, flushRate: 0.9, life: 380 },
    description: 'The eccentric reamer swings out past the casing to cut the oversize, then retracts in line so the whole string comes back up through it. Simple and clever.' }),
  it({ id: 'ecc-140-hd', name: 'Eccentric Overburden System, 140 mm HD', category: CAT.eccentricSys, slot: 'casing',
    price: 2480, unlockLevel: 22, methods: ['overburden'],
    thread: 'T45 / casing conical LH', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.14, wearRate: 0.72, maxUCS: 140, abrasionRes: 0.86, flushRate: 1.1, life: 700 },
    description: 'HD eccentric on a hardened reamer pivot: the reamer swings off-centre to cut the casing its clearance, then back in line to come home. Let that pivot seize open and nothing comes back up through the casing.' }),
  it({ id: 'conc-114', name: 'Concentric Overburden System, 114 mm', category: CAT.concentricSys, slot: 'casing',
    price: 1560, unlockLevel: 16, methods: ['overburden'],
    thread: 'R38 / casing cone-ring LH', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.06, wearRate: 0.95, maxUCS: 110, abrasionRes: 0.68, flushRate: 1.0, life: 460 },
    description: 'Pilot bit and ring bit on the same centreline: a straighter hole than eccentric, and it never has to be rotated to retract.' }),
  it({ id: 'conc-168-hd', name: 'Concentric Overburden System, 168 mm HD', category: CAT.concentricSys, slot: 'casing',
    price: 2920, unlockLevel: 24, methods: ['overburden'],
    thread: 'T51 / casing cone-ring LH', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.18, wearRate: 0.68, maxUCS: 160, abrasionRes: 0.88, flushRate: 1.25, life: 820 },
    description: 'The one you take to a job where verticality is written into the specification.' }),
  it({ id: 'ringbit-114', name: 'Ring-Bit System, 114 mm', category: CAT.ringBitSys, slot: 'casing',
    price: 1180, unlockLevel: 15, methods: ['overburden'],
    thread: 'casing conical LH', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.02, wearRate: 1.0, maxUCS: 90, abrasionRes: 0.66, life: 340 },
    description: 'The ring stays on the casing shoe and is lost in the hole; the pilot comes back up. Cheap per metre if the casing stays down.' }),
  it({ id: 'ringbit-273-hd', name: 'Ring-Bit System, 273 mm HD', category: CAT.ringBitSys, slot: 'casing',
    price: 3260, unlockLevel: 28, methods: ['overburden'],
    thread: 'casing trapezoidal joint LH', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.1, wearRate: 0.72, maxUCS: 140, abrasionRes: 0.86, life: 640 },
    description: 'Large ring-bit for driven pile casings. Priced as a consumable because that is exactly what it is.' }),
  it({ id: 'wingbit-140', name: 'Wing-Bit System, 140 mm', category: CAT.wingBitSys, slot: 'casing',
    price: 894, unlockLevel: 15, methods: ['overburden'],
    thread: 'R38 / casing conical LH', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.05, wearRate: 1.1, maxUCS: 70, abrasionRes: 0.55, life: 280 },
    description: 'Folding wings open under rotation and close on reverse. Fastest system in soft overburden and the first to break in gravel.' }),
  it({ id: 'wingbit-193-hd', name: 'Wing-Bit System, 193 mm HD', category: CAT.wingBitSys, slot: 'casing',
    price: 1680, unlockLevel: 24, methods: ['overburden'],
    thread: 'T51 / casing conical LH', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.16, wearRate: 0.78, maxUCS: 100, abrasionRes: 0.8, life: 560 },
    description: 'Heavier wings, hardened hinge pins and replaceable carbide. Still the fastest way through 20 m of till.' }),
  it({ id: 'casing-pipe-168', name: '168 mm Casing Pipe, 3 m', category: CAT.casingPipes, slot: 'casing',
    price: 386, unlockLevel: 14, methods: ['overburden', 'cased-cfa'],
    thread: 'casing cone-ring LH', material: 'S355J2', consumable: true,
    stats: { wearRate: 0.9, torqueCap: 8.0, life: 1600 },
    description: 'Plain wall casing with a machined cone-ring joint. Buy it by the pallet; you will leave some of it in the ground.' }),
  it({ id: 'casing-shoe-168', name: '168 mm Casing Shoe & Drive Cap Set', category: CAT.casingShoes, slot: 'casing',
    price: 432, unlockLevel: 14, methods: ['overburden'],
    thread: 'casing cone-ring LH', material: 'Hardox', consumable: true,
    stats: { wearRate: 0.85, torqueCap: 8.0, life: 1100 },
    description: 'Hardox shoe to take the driving, and a cap so the hammer never touches the casing thread. Both are cheaper than a casing string.' }),
];

/* -- Rotary & Kelly Foundation Tools ------------------------------------- */
const ITEMS_FOUNDATION = [
  it({ id: 'auger-flight-std', name: 'Flight Auger Head, 305 mm', category: CAT.augerFlights, slot: 'bit',
    price: 780, unlockLevel: 1, methods: ['auger', 'cfa', 'site-investigation'],
    thread: '1 5/8 in hex pin/box', material: 'S355J2', model: 'cfa-flight', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 4, abrasionRes: 0.3, torqueCap: 6, life: 900 },
    description: 'The cutting head that goes on the bottom of the auger column: carbide teeth on a stub of flighting. It cuts a 305 mm hole on a 279 mm flight — the hole and the flight are never the same number.' }),
  it({ id: 'auger-flight-hd', name: 'Flight Auger Head, 400 mm HD', category: CAT.augerFlights, slot: 'bit',
    price: 1480, unlockLevel: 8, methods: ['auger', 'cfa'],
    // The bigger head is Kelly-driven, which is where SW hex genuinely belongs;
    // the 305 mm utility head above it is on a catalogued 1 5/8 in auger hex.
    thread: 'SW hex 80 mm', material: 'Hardox', duty: 'HD', tier: 'prem', model: 'cfa-flight', consumable: true,
    stats: { ropMult: 1.22, wearRate: 0.66, maxUCS: 12, abrasionRes: 0.7, torqueCap: 12, life: 2400 },
    description: 'Hardox flighting with plug-in teeth you can change on site. It stays sharp through gravel that rounds off a mild-steel flight in a morning.' }),
  it({ id: 'hsa-200', name: 'Hollow-Stem Auger, 200 mm ID', category: CAT.cfaAugers, slot: 'bit',
    price: 5420, unlockLevel: 8, methods: ['auger', 'sonic', 'site-investigation'],
    thread: 'SW hex 100 mm', material: 'S355J2', model: 'cfa-flight',
    stats: { ropMult: 1.0, wearRate: 0.9, maxUCS: 6, abrasionRes: 0.45, torqueCap: 18, life: 6000 },
    description: 'Sampling through the stem without pulling the string. The environmental driller\'s single most useful piece of steel.' }),
  it({ id: 'cfa-flight-600', name: 'CFA Auger String, 600 mm x 22 m', category: CAT.cfaAugers, slot: 'bit',
    price: 18600, unlockLevel: 27, methods: ['cfa', 'cased-cfa'],
    thread: 'Kelly-box 150 mm', material: '42CrMo4(V)',
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 12, abrasionRes: 0.55, torqueCap: 95, life: 12000 },
    description: 'One continuous flight, twenty-two metres long, with a concrete line down the centre. It arrives on its own trailer.' }),
  it({ id: 'cfa-flight-800-hd', name: 'CFA Auger String, 800 mm x 26 m HD', category: CAT.cfaAugers, slot: 'bit',
    price: 27400, unlockLevel: 33, methods: ['cfa', 'cased-cfa'],
    thread: 'Kelly-box 200 mm', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.2, wearRate: 0.7, maxUCS: 25, abrasionRes: 0.8, torqueCap: 140, life: 24000 },
    description: 'Heavier stem, hardfaced flighting and a valve that actually seals at 40 bar of concrete pressure.' }),
  it({ id: 'kaug-600-soil', name: 'Kelly Auger, 600 mm Soil', category: CAT.kellyAugers, slot: 'bit',
    price: 4860, unlockLevel: 23, methods: ['rotary-kelly'],
    thread: 'Kelly-box 130 mm', material: 'S355J2', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 5, abrasionRes: 0.35, torqueCap: 60, life: 2200 },
    description: 'Double-start soil auger with weld-on teeth. It fills in two turns and empties on the spin-off, if the clay lets it.' }),
  it({ id: 'kaug-880-rock-hd', name: 'Kelly Auger, 880 mm Rock HD', category: CAT.kellyAugers, slot: 'bit',
    price: 9640, unlockLevel: 26, methods: ['rotary-kelly'],
    thread: 'Kelly-box 150 mm', material: 'Hardox', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.15, wearRate: 0.68, maxUCS: 90, abrasionRes: 0.85, torqueCap: 110, life: 4800 },
    description: 'Round-shank picks in bolt-on holders, conical pilot, reinforced hub. It cuts weathered rock without a core barrel.' }),
  it({ id: 'kaug-1200-rock-hd', name: 'Kelly Auger, 1200 mm Rock HD', category: CAT.kellyAugers, slot: 'bit',
    price: 16400, unlockLevel: 30, methods: ['rotary-kelly'],
    thread: 'Kelly-box 200 mm', material: 'Hardox', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.2, wearRate: 0.64, maxUCS: 110, abrasionRes: 0.88, torqueCap: 170, life: 6000 },
    description: 'The large rock auger. Forty-eight picks, and you will replace a dozen of them every pile in sandstone.' }),
  it({ id: 'bucket-880', name: 'Drilling Bucket, 880 mm', category: CAT.drillBuckets, slot: 'bit',
    price: 6240, unlockLevel: 23, methods: ['rotary-kelly'],
    thread: 'Kelly-box 150 mm', material: 'S355J2', consumable: true,
    stats: { ropMult: 1.05, wearRate: 1.0, maxUCS: 8, abrasionRes: 0.4, torqueCap: 95, life: 3000 },
    description: 'Single-door bucket for wet, running sand under bentonite. Nothing else brings that ground up.' }),
  it({ id: 'bucket-1200-hd', name: 'Drilling Bucket, 1200 mm HD', category: CAT.drillBuckets, slot: 'bit',
    price: 11500, unlockLevel: 28, methods: ['rotary-kelly'],
    thread: 'Kelly-box 200 mm', material: 'Hardox', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.15, wearRate: 0.72, maxUCS: 20, abrasionRes: 0.7, torqueCap: 165, life: 6500 },
    description: 'Twin-door, Hardox-lined and heavy enough to sink itself. The hinges are the part that decides its life.' }),
  it({ id: 'fcb-1200-hd', name: 'Foundation Core Barrel, 1200 mm HD', category: CAT.foundBarrels, slot: 'bit',
    price: 22800, unlockLevel: 32, methods: ['rotary-kelly'],
    thread: 'Kelly-box 200 mm', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 0.85, wearRate: 0.6, maxUCS: 210, abrasionRes: 0.92, torqueCap: 178, life: 3600 },
    description: 'Roller-cutter core barrel for rock sockets. Slow by design: you are cutting an annulus and lifting the plug out whole.' }),
  it({ id: 'kelly-3x-friction', name: 'Kelly Bar, 3-Stage Friction', category: CAT.kellyBars, slot: 'rod',
    price: 38600, unlockLevel: 23, methods: ['rotary-kelly'],
    thread: 'Kelly-box 150 mm / U-Pin', material: '34CrNiMo6',
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 120, life: 26000 },
    description: 'Friction Kelly: cheap, simple, and it only transmits crowd force as far as the friction between the tubes allows.' }),
  it({ id: 'kelly-4x-interlock-hd', name: 'Kelly Bar, 4-Stage Interlocking HD', category: CAT.kellyBars, slot: 'rod',
    price: 62400, unlockLevel: 29, methods: ['rotary-kelly'],
    thread: 'Kelly-box 200 mm / U-Pin', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.25, wearRate: 0.68, torqueCap: 178, life: 52000 },
    description: 'Interlocking bar: full crowd force at any extension. It is what makes a 178 kNm drive head worth owning.' }),
  it({ id: 'bell-tool-1200', name: 'Under-Reaming Belling Tool, 1200 mm', category: CAT.bellingTools, slot: 'bit',
    price: 13200, unlockLevel: 34, methods: ['rotary-kelly'],
    thread: 'Kelly-box 200 mm', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 0.8, wearRate: 0.95, maxUCS: 40, abrasionRes: 0.6, torqueCap: 150, life: 2400 },
    description: 'Hydraulic arms open below the base of the shaft to cut a bell. Every centimetre of bell is bearing capacity you did not have to buy in depth.' }),
  it({ id: 'boulder-extractor-900', name: 'Cross Cutter & Boulder Extractor, 900 mm', category: CAT.crossCutters, slot: 'bit',
    price: 8940, unlockLevel: 30, methods: ['rotary-kelly', 'cased-cfa'],
    thread: 'Kelly-box 150 mm', material: 'Hardox', duty: 'HD', consumable: true,
    stats: { ropMult: 0.9, wearRate: 0.8, maxUCS: 160, abrasionRes: 0.85, torqueCap: 140, life: 1800 },
    description: 'For the boulder that stops the auger. It grips, it lifts, and if it does not, you are chiselling for the rest of the day.' }),
  it({ id: 'kdk-620', name: 'Rotary Drive Head KDK 620', category: CAT.kdk, slot: 'head',
    price: 54800, unlockLevel: 27, methods: ['cfa', 'cased-cfa', 'auger'],
    thread: 'Kelly-box 150 mm', material: '34CrNiMo6',
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 62, life: 0 },
    description: 'Sixty-two kilonewton-metres through a planetary reduction. It sets the pile diameter you can honestly quote.' }),
  it({ id: 'kdk-1200-hd', name: 'Rotary Drive Head KDK 1200 HD', category: CAT.kdk, slot: 'head',
    price: 96500, unlockLevel: 33, methods: ['cfa', 'cased-cfa', 'rotary-kelly'],
    thread: 'Kelly-box 200 mm', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.28, wearRate: 0.72, torqueCap: 120, life: 0 },
    description: 'Twice the torque and an oil cooler that lets you use it all day. The upgrade that unlocks 1000 mm CFA.' }),
  it({ id: 'casing-rotator-1500', name: 'Casing Rotator, 1500 mm', category: CAT.casingRotators, slot: 'head',
    price: 138000, unlockLevel: 35, methods: ['cased-cfa', 'rotary-kelly'],
    thread: 'casing clamp jaws 1500 mm', material: '34CrNiMo6', duty: 'HD',
    stats: { ropMult: 1.1, wearRate: 0.85, torqueCap: 900, life: 0 },
    description: 'Bolts to the base of the mast and turns the casing independently of the auger. This is what makes a hole in ground that will not stand.' }),
  it({ id: 'pick-rs-std', name: 'Round-Shank Picks, Box of 50', category: CAT.picksRound, slot: 'workshop',
    price: 690, unlockLevel: 23, methods: ['rotary-kelly', 'cfa', 'cased-cfa'],
    thread: '25 mm shank', material: 'carbide grade K15', consumable: true,
    stats: { wearRate: 1.0, abrasionRes: 0.6, life: 700 },
    description: 'Point-attack picks that rotate in their holders as they cut. When they stop rotating they wear flat in an hour.' }),
  it({ id: 'pick-rs-hd', name: 'Round-Shank Picks HD, Box of 50', category: CAT.picksRound, slot: 'workshop',
    price: 1240, unlockLevel: 28, methods: ['rotary-kelly', 'cfa', 'cased-cfa'],
    thread: '25 mm shank', material: 'carbide grade K25', duty: 'HD', tier: 'prem', consumable: true,
    stats: { wearRate: 0.62, abrasionRes: 0.88, life: 1800 },
    description: 'Heavier carbide tip and a hardfaced collar. In sandstone they last three times as long as the standard pick.' }),
  it({ id: 'pick-holder-set', name: 'Tool Holder & Pick Box Set', category: CAT.pickHolders, slot: 'workshop',
    price: 890, unlockLevel: 26, methods: ['rotary-kelly', 'cfa'],
    thread: '25 mm bore', material: 'Hardox', consumable: true,
    stats: { wearRate: 0.85, abrasionRes: 0.7, life: 3000 },
    description: 'Weld-on holders and a driving key. Replace the holder before it wallows out, or the next pick will not sit square.' }),
];

/* -- HDD, Raise Boring, Sonic & Coring ----------------------------------- */
const ITEMS_TRENCHLESS = [
  it({ id: 'hdd-pipe-2875', name: 'HDD Drill Pipe 2.875 in, 4.6 m', category: CAT.hddPipe, slot: 'rod',
    price: 348, unlockLevel: 38, methods: ['hdd'],
    thread: 'HDD box/pin 2.875 in', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 12, flushRate: 1.0, life: 9000 },
    description: 'Upset ends, hardbanded tool joints, made to bend to a 40 m radius and come back straight. Two hundred of them fill the carousel.' }),
  it({ id: 'hdd-pipe-hdx-hd', name: 'HDD Drill Pipe Forged HD, 4.6 m', category: CAT.hddPipe, slot: 'rod',
    price: 528, unlockLevel: 43, methods: ['hdd'],
    thread: 'API IF 3 1/2', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.12, wearRate: 0.66, torqueCap: 21, flushRate: 1.3, life: 20000 },
    description: 'One-piece forged pipe: no friction weld to fail on the pullback that matters. It is the reason the job finishes on Friday.' }),
  it({ id: 'hdd-head-slant', name: 'Slant-Face Pilot Head with Sonde Housing', category: CAT.hddHeads, slot: 'bit',
    price: 812, unlockLevel: 38, methods: ['hdd'],
    thread: 'HDD box/pin 2.875 in', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.05, maxUCS: 25, abrasionRes: 0.45, flushRate: 0.9, life: 1600 },
    description: 'The angled face is the whole steering system: push to turn, rotate to go straight. Everything else is the locator operator shouting.' }),
  it({ id: 'hdd-head-rock-hd', name: 'Rock Pilot Head, Tricone-Fitted HD', category: CAT.hddHeads, slot: 'bit',
    price: 2960, unlockLevel: 45, methods: ['hdd'],
    thread: 'API IF 3 1/2', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.18, wearRate: 0.74, maxUCS: 150, abrasionRes: 0.85, flushRate: 1.2, life: 2600 },
    description: 'Bent sub, mud motor mount and a tricone on the nose. It is how a bore crosses a sandstone ridge instead of going around it.' }),
  it({ id: 'reamer-fly-250', name: 'Fly-Cutter Backreamer, 250 mm', category: CAT.hddReamers, slot: 'bit',
    price: 2420, unlockLevel: 38, methods: ['hdd'],
    thread: 'API IF 2 3/8', material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 20, abrasionRes: 0.5, flushRate: 1.1, life: 3200 },
    description: 'Open cutter body with replaceable blades and jet nozzles. Best in clay, hopeless the moment there is gravel in the bore.' }),
  it({ id: 'reamer-rock-350-hd', name: 'Rock Backreamer, 350 mm HD', category: CAT.hddReamers, slot: 'bit',
    price: 6840, unlockLevel: 45, methods: ['hdd'],
    thread: 'API IF 3 1/2', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.1, wearRate: 0.7, maxUCS: 180, abrasionRes: 0.88, flushRate: 1.3, life: 5200 },
    description: 'Roller cones on a heavy body with a swivel sub. It opens rock at two metres an hour and does not care how long that takes.' }),
  it({ id: 'hdd-swivel-12t', name: 'Pulling Swivel & Head, 12 t', category: CAT.hddPulling, slot: 'swivel',
    price: 1180, unlockLevel: 38, methods: ['hdd'],
    thread: 'API IF 2 3/8 / clevis', material: '34CrNiMo6',
    stats: { wearRate: 0.8, torqueCap: 14, life: 0 },
    description: 'Isolates the product pipe from the rotation of the reamer. Skip it and you will pull a twisted gas main into the ground.' }),
  it({ id: 'hdd-locator-walkover', name: 'Walkover Locating & Steering System', category: CAT.hddLocating, slot: 'service',
    price: 14600, unlockLevel: 38, methods: ['hdd'],
    thread: 'n/a', material: 'FRP/composite',
    stats: { ropMult: 1.15, wearRate: 1.0, life: 0 },
    description: 'Receiver, remote display and a sonde that tells you pitch, roll, depth and temperature. Without it you are drilling blind under a road.' }),
  it({ id: 'motor-mud-3-5', name: 'Mud Motor, 3.5 in Bent Housing', category: CAT.mudMotors, slot: 'head',
    price: 24800, unlockLevel: 45, methods: ['hdd'],
    thread: 'API IF 3 1/2', material: '34CrNiMo6', duty: 'HD',
    stats: { ropMult: 1.45, wearRate: 0.9, maxUCS: 200, abrasionRes: 0.7, flushRate: 1.0, life: 14000 },
    description: 'Positive-displacement power section: the bit turns on mud flow alone, so the string can stay still and steer.' }),

  it({ id: 'rb-pilot-bit-311', name: 'Raise Bore Pilot Bit, 311 mm', category: CAT.raisePilot, slot: 'bit',
    price: 4280, unlockLevel: 52, methods: ['raise-boring'],
    thread: 'raise stem box/pin', material: '34CrNiMo6', duty: 'HD', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 260, abrasionRes: 0.85, flushRate: 1.0, life: 620 },
    description: 'Three roller cones on a stabilised body. The pilot has to break out inside a two-metre target three hundred metres below you.' }),
  it({ id: 'rb-stem-286', name: 'Raise Bore Drill Stem, 286 mm x 1.5 m', category: CAT.raiseStems, slot: 'rod',
    price: 5680, unlockLevel: 52, methods: ['raise-boring'],
    thread: 'raise stem box/pin', material: '34CrNiMo6', duty: 'HD', consumable: true,
    stats: { ropMult: 1.0, wearRate: 0.85, torqueCap: 310, life: 4200 },
    description: 'Thick-walled and hollow — the pilot pass flushes water down the middle of it. Rated for the full 4200 kN of pull the machine can put on it, and there are two hundred of them in a three-hundred-metre raise.' }),
  it({ id: 'rb-reamer-1200', name: 'Raise Bore Reamer Head, 1200 mm', category: CAT.raiseReamer, slot: 'head',
    price: 48600, unlockLevel: 52, methods: ['raise-boring'],
    thread: 'raise stem box/pin', material: '34CrNiMo6', duty: 'HD', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 280, abrasionRes: 0.86, torqueCap: 310, life: 900 },
    description: 'The head is pulled upward through the pilot hole, and the muck simply falls to the level below. Elegant, and utterly unforgiving of a wandering pilot.' }),
  it({ id: 'rb-reamer-1800-hd', name: 'Raise Bore Reamer Head, 1800 mm HD', category: CAT.raiseReamer, slot: 'head',
    price: 82400, unlockLevel: 56, methods: ['raise-boring'],
    thread: 'raise stem box/pin', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.18, wearRate: 0.7, maxUCS: 310, abrasionRes: 0.94, torqueCap: 310, life: 1600 },
    description: 'Ventilation-shaft sized. Ten cutters in bolted saddles, each one replaceable underground, each one a day rate on its own.' }),
  it({ id: 'rb-cutter-set-hd', name: 'Raise Bore Cutter Set, HD', category: CAT.raiseCutters, slot: 'workshop',
    price: 14800, unlockLevel: 52, methods: ['raise-boring'],
    thread: 'saddle mount', material: 'carbide grade K25', duty: 'HD', consumable: true,
    stats: { wearRate: 0.7, abrasionRes: 0.92, life: 700 },
    description: 'Disc cutters with hardened bearings. Changing them mid-raise means dropping the head back down the pilot, so you change them early.' }),

  // Sonic drill rod and core barrel are cut RIGHT hand; the override casing
  // outside them is cut LEFT hand. Stated independently by three sonic tooling
  // catalogues, none of which gives a reason — so the game states the fact and
  // stops there. (research/13 §4.2.)
  it({ id: 'sonic-core-barrel-100', name: 'Sonic Core Barrel, 100 mm x 3 m', category: CAT.coreRods, slot: 'bit',
    price: 3840, unlockLevel: 42, methods: ['sonic'],
    thread: 'sonic box/pin RH', material: '34CrNiMo6', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 30, abrasionRes: 0.6, life: 900 },
    description: 'Vibrated in, then extruded into a sleeve. Continuous, undisturbed and in order, which is exactly what the laboratory is paying for.' }),
  it({ id: 'sonic-casing-150', name: 'Sonic Override Casing, 150 mm x 3 m', category: CAT.casingPipes, slot: 'casing',
    price: 2640, unlockLevel: 42, methods: ['sonic'],
    thread: 'sonic casing box/pin LH', material: '34CrNiMo6', consumable: true,
    stats: { wearRate: 0.9, torqueCap: 16, life: 3200 },
    description: 'Follows the core barrel down and holds the hole open behind it. Resonance welds nothing, but it does fatigue steel: inspect the joints.' }),
  it({ id: 'sonic-shoe-carbide', name: 'Sonic Carbide Drive Shoe', category: CAT.casingShoes, slot: 'casing',
    price: 748, unlockLevel: 42, methods: ['sonic'],
    thread: 'sonic casing box/pin LH', material: 'carbide grade K20', consumable: true,
    stats: { ropMult: 1.08, wearRate: 0.9, maxUCS: 60, abrasionRes: 0.75, life: 900 },
    description: 'Brazed carbide on the leading edge lets the casing pass a cobble instead of stalling on it.' }),

  it({ id: 'barrel-nq-wl', name: 'NQ Wireline Core Barrel Assembly', category: CAT.coreBarrels, slot: 'rod',
    price: 2420, unlockLevel: 18, methods: ['core'],
    thread: 'Wireline NQ (NWL)', material: '42CrMo4(V)',
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 2.4, life: 9000 },
    description: 'Inner tube retrieved on the wireline without tripping the rods. The single invention that made deep exploration drilling affordable.' }),
  it({ id: 'barrel-hq-wl-hd', name: 'HQ3 Wireline Core Barrel Assembly, HD', category: CAT.coreBarrels, slot: 'rod',
    price: 3380, unlockLevel: 24, methods: ['core'],
    thread: 'Wireline HQ (HWL)', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.14, wearRate: 0.7, torqueCap: 3.6, life: 20000 },
    description: 'Triple-tube with a split inner: broken ground arrives at surface in the order it was in the ground.' }),
  it({ id: 'shell-nq', name: 'NQ Reaming Shell, Diamond Set', category: CAT.reamingShells, slot: 'coupling',
    price: 196, unlockLevel: 18, methods: ['core'],
    thread: 'Wireline NQ (NWL)', material: 'carbide grade K20', consumable: true,
    stats: { ropMult: 1.03, wearRate: 0.95, abrasionRes: 0.8, life: 640 },
    description: 'Sits behind the bit and holds the hole to gauge. When it wears, the next bit will not go down the hole you already drilled.' }),
  it({ id: 'core-lifter-set', name: 'Core Lifter & Catcher Set', category: CAT.coreLifters, slot: 'workshop',
    price: 98, unlockLevel: 18, methods: ['core'],
    thread: 'NQ / HQ', material: '42CrMo4(V)', consumable: true,
    stats: { wearRate: 1.0, life: 300 },
    description: 'A split ring that grips the core so it breaks off and comes up. Twenty of them live in the drillers box, and you still run out.' }),
];

/* -- Fluids, Air & Power ------------------------------------------------- */
const ITEMS_PLANT = [
  it({ id: 'comp-port-7', name: 'Portable Compressor, 7 m³/min at 7 bar', category: CAT.compPortable, slot: 'compressor',
    price: 18400, unlockLevel: 6, methods: ['top-hammer', 'overburden', 'anchor'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.0, wearRate: 1.0, flushRate: 0.7 },
    description: 'A towable screw compressor. Enough air for a small top-hammer string and a blow gun, and not one litre more.' }),
  it({ id: 'comp-port-12', name: 'Portable Compressor, 12 m³/min at 12 bar', category: CAT.compPortable, slot: 'compressor',
    price: 31200, unlockLevel: 10, methods: ['top-hammer', 'dth', 'overburden', 'anchor', 'rc', 'longhole'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.1, wearRate: 0.98, flushRate: 1.0 },
    description: 'Twelve cubic metres at twelve bar: the minimum honest DTH compressor for a 3-inch hammer to 80 m.' }),
  it({ id: 'comp-port-21-hd', name: 'Portable Compressor, 21 m³/min at 24 bar HD', category: CAT.compPortable, slot: 'compressor',
    price: 58400, unlockLevel: 17, methods: ['dth', 'overburden', 'rc', 'longhole'],
    thread: 'n/a', material: 'S355J2', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.32, wearRate: 0.9, flushRate: 1.6 },
    description: 'High-pressure screw with an aftercooler. This is the machine that turns a 4-inch hammer from adequate into fast.' }),
  it({ id: 'comp-port-35-hd', name: 'Portable Compressor, 35 m³/min at 25 bar HD', category: CAT.compPortable, slot: 'compressor',
    price: 94500, unlockLevel: 26, methods: ['dth', 'rc'],
    thread: 'n/a', material: 'S355J2', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.48, wearRate: 0.86, flushRate: 2.2 },
    description: 'Thirty-five cubic metres a minute. It needs its own trailer, its own fuel bowser and a very good reason.' }),
  it({ id: 'comp-boost-40-hd', name: 'Booster Compressor, 40 bar HD', category: CAT.compBooster, slot: 'compressor',
    price: 76200, unlockLevel: 30, methods: ['dth'],
    thread: 'n/a', material: 'S355J2', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.55, wearRate: 0.92, flushRate: 2.6 },
    description: 'Takes the screw compressor output and doubles the pressure. Below 200 m it is showing off; below 300 m it is the only option.' }),

  it({ id: 'pump-mud-350', name: 'Mud Pump, 350 l/min at 40 bar', category: CAT.mudPumps, slot: 'pump',
    price: 9420, unlockLevel: 18, methods: ['core', 'hdd', 'sonic', 'rotary-kelly'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.0, wearRate: 1.0, flushRate: 1.0 },
    description: 'Triplex piston pump on a skid. Enough for NQ coring and a short HDD pilot; it will not clean a 350 mm ream.' }),
  it({ id: 'pump-mud-1000-hd', name: 'Mud Pump, 1000 l/min at 70 bar HD', category: CAT.mudPumps, slot: 'pump',
    price: 34600, unlockLevel: 38, methods: ['hdd', 'rotary-kelly', 'jet-grouting'],
    thread: 'n/a', material: '42CrMo4(V)', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.35, wearRate: 0.82, flushRate: 2.1 },
    description: 'A thousand litres a minute of properly mixed bentonite. On a maxi-rig, hole cleaning is the whole job.' }),
  it({ id: 'mud-recycler-40', name: 'Mud Mixing & Recycling Unit, 40 m³/h', category: CAT.mudRecycling, slot: 'pump',
    price: 26400, unlockLevel: 40, methods: ['hdd', 'rotary-kelly'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.08, wearRate: 0.9, flushRate: 1.2 },
    description: 'Shaker deck, hydrocyclones and a mixing hopper. It turns spoil disposal from a cost centre back into drilling fluid.' }),
  it({ id: 'desander-60-hd', name: 'Desander & Desilter Skid, 60 m³/h HD', category: CAT.desanders, slot: 'pump',
    price: 38200, unlockLevel: 44, methods: ['hdd', 'rotary-kelly', 'jet-grouting'],
    thread: 'n/a', material: 'S355J2', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.12, wearRate: 0.85, flushRate: 1.35 },
    description: 'Drops the sand content below half a percent. Your pumps, your swivels and your bit all live twice as long.' }),
  it({ id: 'mud-bentonite-ton', name: 'Bentonite, 1 t Big Bag', category: CAT.fluidsAdditives, slot: 'service',
    price: 428, unlockLevel: 18, methods: ['core', 'hdd', 'rotary-kelly', 'jet-grouting'],
    thread: 'n/a', material: 'n/a', consumable: true,
    stats: { flushRate: 0.9, life: 600 },
    description: 'Sodium bentonite. Mixed right it supports the hole; mixed wrong it is expensive mud that does neither.' }),
  it({ id: 'mud-polymer-hd', name: 'Polymer Additive Pack HD', category: CAT.fluidsAdditives, slot: 'service',
    price: 786, unlockLevel: 24, methods: ['core', 'hdd', 'rotary-kelly'],
    thread: 'n/a', material: 'n/a', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.1, wearRate: 0.9, flushRate: 1.3, life: 900 },
    description: 'PHPA and a lubricant. It drops rotational torque, stabilises reactive clay and pays for itself in one stuck-string you did not have.' }),

  it({ id: 'pump-grout-30', name: 'Grout Pump, 30 l/min at 60 bar', category: CAT.groutPumps, slot: 'pump',
    price: 12800, unlockLevel: 29, methods: ['anchor', 'cfa', 'cased-cfa', 'rockbolt'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.0, wearRate: 1.0, flushRate: 0.9 },
    description: 'Progressive-cavity grout pump on a frame. Feeds a self-drilling anchor through the bar without stalling.' }),
  it({ id: 'pump-grout-jet-400-hd', name: 'Jet Grouting Pump, 400 bar HD', category: CAT.groutPumps, slot: 'pump',
    price: 68400, unlockLevel: 47, methods: ['jet-grouting'],
    thread: 'n/a', material: '42CrMo4(V)', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.4, wearRate: 0.88, flushRate: 2.4 },
    description: 'Four hundred bar of cement grout. The pressure is what cuts the soil; the withdrawal rate is what decides the column diameter.' }),
  // The monitor is the cutting tool in jet grouting: the jet leaving its nozzles
  // is what takes the soil apart. It belongs at the bottom of the string, above
  // the bit — NOT in the swivel bay with the flushing head at the top of it.
  it({ id: 'jet-monitor-single', name: 'Jet Grouting Monitor, Single Fluid', category: CAT.jetMonitors, slot: 'bit',
    price: 9280, unlockLevel: 47, methods: ['jet-grouting'],
    thread: 'HP swivel', material: '34CrNiMo6', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, flushRate: 1.0, life: 900 },
    description: 'Two opposed nozzles on a monitor body. Simple, reliable, and it gives you the smallest column of the three systems.' }),
  it({ id: 'jet-monitor-triple-hd', name: 'Jet Grouting Monitor, Triple Fluid HD', category: CAT.jetMonitors, slot: 'bit',
    price: 21600, unlockLevel: 51, methods: ['jet-grouting'],
    thread: 'HP swivel / triple-tube', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.35, wearRate: 0.76, flushRate: 1.8, life: 1800 },
    description: 'Air-shrouded water jet cuts, grout fills behind. Twice the column diameter, and three times as many ways to block a nozzle.' }),
  it({ id: 'swivel-flush-std', name: 'Flushing Swivel, Standard', category: CAT.flushSwivels, slot: 'swivel',
    price: 1680, unlockLevel: 12, methods: ['core', 'sonic', 'anchor', 'rotary-kelly', 'hdd'],
    thread: 'R32 / NQ / API REG 2 3/8', material: '42CrMo4(V)', consumable: true,
    stats: { wearRate: 1.0, flushRate: 1.0, life: 4200 },
    description: 'Gets water into a turning string without soaking the driller. The packing is a consumable; treat it as one.' }),
  it({ id: 'swivel-hp-hd', name: 'High-Pressure Swivel, 400 bar HD', category: CAT.hpSwivels, slot: 'swivel',
    price: 3420, unlockLevel: 47, methods: ['jet-grouting', 'hdd'],
    thread: 'HP swivel', material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { wearRate: 0.68, flushRate: 1.6, life: 9000 },
    description: 'Tungsten-faced mechanical seals rated for jet grouting pressure. It is the one part between you and a 400 bar leak.' }),
  it({ id: 'swivel-grout-hd', name: 'Concrete & Grout Swivel HD', category: CAT.groutSwivels, slot: 'swivel',
    price: 4260, unlockLevel: 27, methods: ['cfa', 'cased-cfa'],
    thread: 'claw coupling DN100', material: 'Hardox', duty: 'HD',
    stats: { wearRate: 0.75, flushRate: 1.4, life: 0 },
    description: 'Concrete at 40 bar into a rotating auger stem. Wear-lined, because concrete is abrasive in a way mud never is.' }),
  it({ id: 'gen-60kva-hd', name: 'Site Generator, 60 kVA HD', category: CAT.generators, slot: 'power',
    price: 17400, unlockLevel: 20, methods: [],
    thread: 'n/a', material: 'S355J2', duty: 'HD',
    stats: { ropMult: 1.04, wearRate: 0.95 },
    description: 'Runs the mud plant, the lights and the site cabin. On a raise bore job it runs the rig itself.' }),
];

/* -- Ground Engineering & Anchoring, Site Investigation ------------------ */
const ITEMS_GROUND = [
  it({ id: 'sda-r32-bar', name: 'R32/210 Hollow Anchor Bar, 3 m', category: CAT.sdaBars, slot: 'rod',
    price: 218, unlockLevel: 31, methods: ['anchor'],
    thread: 'R32 hollow bar', material: '25CrMo4V', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 1.4, life: 240 },
    description: 'The bar is the drill string, the grout tube and the reinforcement all at once. It stays in the ground; that is the point.' }),
  it({ id: 'sda-t76-bar-hd', name: 'T76/1900 Hollow Anchor Bar, 3 m HD', category: CAT.sdaBars, slot: 'rod',
    price: 782, unlockLevel: 37, methods: ['anchor'],
    thread: 'T76 hollow bar', material: '25CrMo4V', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.14, wearRate: 0.7, torqueCap: 6.5, life: 620 },
    description: '1900 kN ultimate load. A micropile in its own right, and heavy enough that the rod handler earns its keep.' }),
  it({ id: 'sda-coupler-r32', name: 'R32 Anchor Bar Coupler', category: CAT.sdaCouplers, slot: 'coupling',
    price: 29, unlockLevel: 31, methods: ['anchor'],
    thread: 'R32 hollow bar', material: '25CrMo4V', consumable: true,
    stats: { wearRate: 1.0, torqueCap: 1.4, life: 240 },
    description: 'Joins bar to bar downhole. It is buried with everything else, so it is priced like a nut and specified like a structural member.' }),
  it({ id: 'sda-plate-set', name: 'Bearing & Domed Plate Set with Nut', category: CAT.sdaPlates, slot: 'workshop',
    price: 48, unlockLevel: 31, methods: ['anchor'],
    thread: 'R32 / R38', material: 'S355J2', consumable: true,
    stats: { wearRate: 1.0, life: 120 },
    description: 'Domed plate and hemispherical nut let the anchor head sit square on a face that is not. Always order more than the drawing says.' }),
  it({ id: 'rockbolt-resin-box', name: 'Rock Bolt & Resin Cartridge Box', category: CAT.rockBolts, slot: 'service',
    price: 340, unlockLevel: 35, methods: ['anchor', 'top-hammer', 'rockbolt'],
    thread: 'GEWI threadbar 25 mm', material: 'S355J2', consumable: true,
    stats: { wearRate: 1.0, life: 200 },
    description: 'Twenty resin-anchored rebar bolts. Underground, this is what turns a freshly blasted face into a place people can stand.' }),
  it({ id: 'threadbar-gewi-32', name: 'GEWI Threadbar 32 mm, 6 m', category: CAT.threadbar, slot: 'rod',
    price: 186, unlockLevel: 35, methods: ['anchor'],
    thread: 'GEWI threadbar 32 mm', material: 'S355J2', consumable: true,
    stats: { wearRate: 0.9, torqueCap: 2.0, life: 400 },
    description: 'Continuously threaded bar you can cut and couple anywhere along its length. Not self-drilling: it goes into a hole you already made.' }),

  /* BUY THE WRONG ONE AND THE NUMBERS STILL WORK — that is the lesson. Both
     hammers drop 63.5 kg through 760 mm, but a rope-and-cathead donut delivers
     roughly half the energy of an automatic trip, so the RAW blow count doubles
     while the corrected N60 lands in the same place. An N-value without its
     energy ratio is not a measurement. (research/06 §5; ASTM D1586.) */
  it({ id: 'spt-hammer-auto', name: 'Automatic SPT Trip Hammer', category: CAT.sptSamplers, slot: 'workshop',
    price: 8460, unlockLevel: 8, methods: ['site-investigation', 'auger', 'sonic', 'cable-tool'],
    thread: 'A-Rod', material: '42CrMo4(V)', model: 'spt-hammer',
    stats: { ropMult: 1.0, wearRate: 0.9, life: 0 },
    description: '63.5 kg falling 760 mm, released automatically so the energy ratio is repeatable. That repeatability is the entire value of an N-value.' }),
  it({ id: 'spt-hammer-donut', name: 'Donut SPT Hammer, Rope and Cathead', category: CAT.sptSamplers, slot: 'workshop',
    price: 1180, unlockLevel: 8, methods: ['site-investigation', 'auger', 'sonic', 'cable-tool'],
    thread: 'A-Rod', material: '42CrMo4(V)', model: 'spt-hammer', tier: 'econ',
    stats: { ropMult: 1.0, wearRate: 1.15, life: 0 },
    description: 'The same weight and the same drop, thrown off a rope round a cathead. It puts far less of that energy into the rods, so your raw N comes back high and means nothing until it is corrected — cheap, legal, and a trap if you write the number down as it is.' }),
  /* Both of these live in the `probe` bay and NEVER in the cutting bay. An
     SPT is a TEST and a SAMPLER: a 63.5 kg hammer falls 760 mm, the blows are
     counted in 75 mm steps and N is the count for the last 300 mm — nothing
     rotates and nothing cuts. A CPT is not drilling at all: the cone is PUSHED
     at 20 mm/s and returns a continuous cone-resistance, sleeve-friction and
     pore-pressure trace, with no hole, no cuttings and no sample. Neither has
     a rock-strength rating to give, so `maxUCS` is 0 on both rather than a
     number that would read as "what it can cut".
     (research/06-geotech-water-geothermal.md §5, [D1586] and [D5778]. The same
     defect is named in that pack's opening paragraph and in DESIGN_EXPANSION
     §4/§5, and `validateData()` now refuses it outright.)

     `methods` here names the BOREHOLE the test is carried out in — an SPT is
     taken in a hollow-stem auger, sonic or cable-percussion hole, which is
     exactly how a ground investigation is run — not a claim that either tool
     drills. When the `site-investigation` method reserved in METHOD_IDS.md
     lands, both move onto it and this note goes with them. */
  it({ id: 'spt-split-spoon', name: 'SPT Split-Spoon Sampler, 51 mm', category: CAT.sptSamplers, slot: 'probe',
    price: 486, unlockLevel: 8, methods: ['site-investigation', 'auger', 'sonic', 'cable-tool'],
    thread: 'A-Rod', material: '42CrMo4(V)', model: 'spt-split-spoon', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.1, maxUCS: 0, life: 320 },
    description: 'A test, not a bit: a 63.5 kg hammer falls 760 mm and you count the blows for the last 300 mm. Driven, opened and photographed — the cheapest tool on the truck, and it decides what the foundation costs.' }),
  /* The two CPT cones are genuinely different instruments and the game carries
     both, because the piezocone adds the third trace. A friction cone measures
     tip resistance and sleeve friction; a PIEZOcone also measures pore pressure
     at the shoulder, and without that u2 channel the tip resistance cannot be
     corrected to qt at all. ASTM D5778 covers both, separately, and tools.js
     builds them as two objects. (research/06 §CPT.) */
  it({ id: 'cpt-cone-15', name: 'Friction Cone, CPT, 15 cm²', category: CAT.cpt, slot: 'probe',
    price: 6600, unlockLevel: 20, methods: ['site-investigation'],
    thread: 'CPT push rod 44.5 mm', material: '34CrNiMo6', model: 'cpt-cone',
    stats: { ropMult: 1.0, wearRate: 0.82, maxUCS: 0, life: 0 },
    description: 'Tip resistance and sleeve friction, pushed at a constant 20 mm/s. The larger face is more robust in gravelly ground and it reads the same profile — it simply cannot tell you what the water is doing.' }),
  it({ id: 'cpt-piezocone', name: 'Piezocone CPTu, 10 cm²', category: CAT.cpt, slot: 'probe',
    price: 9200, unlockLevel: 24, methods: ['site-investigation'],
    thread: 'CPT push rod 44.5 mm', material: '34CrNiMo6', model: 'cpt-piezocone',
    stats: { ropMult: 1.0, wearRate: 0.85, maxUCS: 0, life: 0 },
    description: 'The same push with a porous filter at the shoulder. Tip resistance, sleeve friction and pore pressure every 50 mm: no hole, no cuttings, no sample, and the only one of the two that lets you correct the tip reading for the water pressing on it.' }),
  it({ id: 'wellscreen-125', name: 'Monitoring Well Riser & Screen, 125 mm', category: CAT.wellScreens, slot: 'service',
    price: 268, unlockLevel: 10, methods: ['dth', 'auger', 'sonic', 'cable-tool', 'site-investigation'],
    thread: 'flush-joint PVC', material: 'FRP/composite', consumable: true,
    stats: { wearRate: 1.0, life: 60 },
    description: 'Slotted screen and plain riser. The hole is not finished until this is in it and the gravel pack is set.' }),
  it({ id: 'ct-chisel-bit', name: 'Cable-Tool Chisel Bit, 250 mm', category: CAT.cableToolTools, slot: 'bit',
    price: 1180, unlockLevel: 3, methods: ['cable-tool'],
    thread: 'cable-tool joint', material: '42CrMo4(V)', model: 'cable-tool-chisel', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 120, abrasionRes: 0.55, life: 260 },
    description: 'Two hundred kilos of forged steel dropped on a rope. It has been the same tool for a hundred and fifty years because it works.' }),
  it({ id: 'ct-bailer-200', name: 'Cable-Tool Sand Bailer, 200 mm', category: CAT.cableToolTools, slot: 'workshop',
    price: 648, unlockLevel: 3, methods: ['cable-tool'],
    thread: 'cable-tool joint', material: 'S355J2', model: 'bailer', consumable: true,
    stats: { wearRate: 0.9, flushRate: 0.8, life: 900 },
    description: 'A tube with a flap valve. Every few strokes it comes down, fills with slurry and takes the hole away with it.' }),
  it({ id: 'ct-jars-500', name: 'Drilling Jars, 500 mm Stroke', category: CAT.cableToolTools, slot: 'workshop',
    price: 2400, unlockLevel: 3, methods: ['cable-tool'],
    thread: 'cable-tool joint', material: '42CrMo4(V)', model: 'drilling-jars',
    stats: { wearRate: 0.85, life: 0 },
    description: 'Two sliding links between the rope socket and the stem. On the upstroke they snatch, and that jolt is what frees a chisel the hole has taken a grip on — the only thing on this machine that can.' }),
  it({ id: 'liner-sampler-set', name: 'Drive & Liner Sampler Set', category: CAT.linerSamplers, slot: 'workshop',
    price: 394, unlockLevel: 8, methods: ['site-investigation', 'auger', 'sonic', 'cable-tool'],
    thread: 'A-Rod', material: '42CrMo4(V)', consumable: true,
    stats: { wearRate: 1.0, life: 420 },
    description: 'Clear liners, catchers and end caps. Environmental work is won and lost on chain of custody, not on metres.' }),
];

/* -- Site services, PPE, workshop, monitoring ---------------------------- */
const ITEMS_SITE = [
  it({ id: 'ppe-basic', name: 'PPE Set, Site Standard', category: CAT.ppe, slot: 'ppe',
    price: 286, unlockLevel: 1, methods: [],
    thread: 'n/a', material: 'FRP/composite',
    stats: { wearRate: 0.98 },
    description: 'Helmet, ear defenders, impact gloves, steel toecaps and a high-vis that has never been washed. The minimum to be on a site at all.' }),
  it({ id: 'ppe-pro-hd', name: 'PPE Set, Professional HD', category: CAT.ppe, slot: 'ppe',
    price: 742, unlockLevel: 12, methods: [],
    thread: 'n/a', material: 'FRP/composite', duty: 'HD', tier: 'prem',
    stats: { wearRate: 0.94 },
    description: 'Active hearing protection, anti-vibration gloves, a harness rated for the mast and a respirator that fits silica work.' }),
  it({ id: 'ppe-arctic-hd', name: 'PPE Set, Arctic HD', category: CAT.ppe, slot: 'ppe',
    price: 1180, unlockLevel: 46, methods: [],
    thread: 'n/a', material: 'FRP/composite', duty: 'HD', tier: 'prem',
    stats: { wearRate: 0.9 },
    description: 'Insulated to minus forty with a heated visor. In the Arctic it is not comfort, it is the reason the shift can continue.' }),
  it({ id: 'ppe-offshore-hd', name: 'PPE Set, Offshore Survival HD', category: CAT.ppe, slot: 'ppe',
    price: 1640, unlockLevel: 30, methods: [],
    thread: 'n/a', material: 'FRP/composite', duty: 'HD', tier: 'prem',
    stats: { wearRate: 0.9 },
    description: 'Immersion suit, lifejacket and EBS. No platform gangway accepts you without it, and no certificate replaces it.' }),
  it({ id: 'ws-grinding-kit', name: 'Button Bit Grinding Kit', category: CAT.workshop, slot: 'workshop',
    price: 894, unlockLevel: 6, methods: ['top-hammer', 'dth'],
    thread: 'n/a', material: 'S355J2',
    stats: { wearRate: 0.9, life: 0 },
    description: 'A pneumatic grinder and a set of diamond cups. Grind at one third wear and a bit lasts twice as long; grind late and it never comes back.' }),
  it({ id: 'ws-bit-grinder-hd', name: 'Semi-Automatic Bit Grinder HD', category: CAT.workshop, slot: 'workshop',
    price: 4620, unlockLevel: 18, methods: ['top-hammer', 'dth'],
    thread: 'n/a', material: 'S355J2', duty: 'HD', tier: 'prem',
    stats: { wearRate: 0.78, life: 0 },
    description: 'Indexed button grinding with a depth stop. It makes field regrind repeatable, which is the difference between a habit and a policy.' }),
  it({ id: 'ws-torque-wrench-hd', name: 'Hydraulic Breakout Torque Wrench HD', category: CAT.breakout, slot: 'workshop',
    price: 2460, unlockLevel: 14, methods: ['top-hammer', 'dth', 'core', 'overburden'],
    thread: 'R32 to T60 jaws', material: '42CrMo4(V)', duty: 'HD',
    stats: { wearRate: 0.88, life: 0 },
    description: 'Breaks a seized joint without a sledgehammer and without bruising the thread. Your rods will outlive two rigs because of it.' }),
  it({ id: 'ws-clamp-jaws', name: 'Clamping Jaw Set, R32 to T60', category: CAT.clampJaws, slot: 'workshop',
    price: 686, unlockLevel: 14, methods: ['top-hammer', 'dth', 'overburden', 'core'],
    thread: 'R32 to T60', material: 'Hardox', consumable: true,
    stats: { wearRate: 1.0, life: 5200 },
    description: 'Hardened, serrated and consumable. When they stop gripping, the rod spins in the clamp and the thread is finished.' }),
  it({ id: 'sensor-depth-encoder', name: 'Depth & Feed Encoder Kit', category: CAT.monitoring, slot: 'service',
    price: 1940, unlockLevel: 16, methods: [],
    thread: 'n/a', material: 'FRP/composite',
    stats: { ropMult: 1.05, wearRate: 0.98 },
    description: 'Real depth, real feed rate, logged. You stop guessing where the stratum changed and start knowing.' }),
  it({ id: 'telemetry-unit', name: 'Rig Telemetry & Drill Log Unit', category: CAT.telemetry, slot: 'service',
    price: 3480, unlockLevel: 24, methods: [],
    thread: 'n/a', material: 'FRP/composite',
    stats: { ropMult: 1.08, wearRate: 0.96 },
    description: 'Streams the drill log off the rig to the office. The client sees the record before the crew has washed the mast.' }),
  it({ id: 'survey-gyro', name: 'Downhole Gyro Survey Tool', category: CAT.surveyTools, slot: 'service',
    price: 18600, unlockLevel: 40, methods: ['core', 'dth', 'raise-boring'],
    thread: 'NQ / N-Rod', material: '34CrNiMo6',
    stats: { ropMult: 1.06, wearRate: 0.95 },
    description: 'North-seeking gyro: it works inside steel casing and next to magnetite, which a magnetic tool never will.' }),

  it({ id: 'svc-regrind-batch', name: 'Bit Regrind Service, Batch of 10', category: CAT.svcMaintenance, slot: 'service',
    price: 248, unlockLevel: 6, methods: ['top-hammer', 'dth'],
    thread: 'n/a', material: 'n/a', consumable: true,
    stats: { wearRate: 1.0, life: 1 },
    description: 'Send ten dull bits away, get ten sharp ones back. Cheaper than new steel right up until the gauge is gone.' }),
  it({ id: 'svc-maintenance-major', name: 'Major Service & Overhaul', category: CAT.svcMaintenance, slot: 'service',
    price: 5840, unlockLevel: 10, methods: [],
    thread: 'n/a', material: 'n/a', consumable: true,
    stats: { wearRate: 1.0, life: 1 },
    description: 'Rotation unit, feed cylinders, hoses and filters. It costs a week of profit and buys a year of uptime.' }),
  it({ id: 'svc-rental-compressor-day', name: 'Compressor Rental, Per Day', category: CAT.svcRental, slot: 'service',
    price: 348, unlockLevel: 8, methods: ['dth', 'top-hammer', 'overburden'],
    thread: 'n/a', material: 'n/a', consumable: true,
    stats: { flushRate: 1.4, life: 1 },
    description: 'The 21 m³/min machine for the one week a year you need it. Rent the peak, own the average.' }),
  it({ id: 'svc-rental-crawler-week', name: 'Crawler Rig Rental, Per Week', category: CAT.svcRental, slot: 'service',
    price: 4280, unlockLevel: 14, methods: [],
    thread: 'n/a', material: 'n/a', consumable: true,
    stats: { life: 1 },
    description: 'A second rig for a fortnight, without a second rig on the balance sheet.' }),
  it({ id: 'svc-crew-shift', name: 'Drilling Crew, Per Shift', category: CAT.svcDrilling, slot: 'service',
    price: 2420, unlockLevel: 20, methods: [],
    thread: 'n/a', material: 'n/a', consumable: true,
    stats: { ropMult: 1.2, life: 1 },
    description: 'Two extra hands and a supervisor for twelve hours. It is how a two-week programme becomes a nine-day one.' }),
  it({ id: 'svc-operator-day', name: 'Contract Operator, Per Day', category: CAT.svcOperator, slot: 'service',
    price: 624, unlockLevel: 16, methods: [],
    thread: 'n/a', material: 'n/a', consumable: true,
    stats: { ropMult: 1.1, life: 1 },
    description: 'A qualified operator on a day rate. Useful when the certificate you need is one you have not sat yet.' }),
];

/* -- Oil & Gas: bits, string, BHA, mud plant, well control --------------- */
/*
   Everything in this block is `oil-rotary` kit, and three rules hold across it:

     - connections are the ROTARY vocabulary — API REG / IF / FH / NC — never
       the R/T percussion threads (DOMAIN.md §4);
     - bit `life` is metres of hole, so an 8 1/2 in TCI tricone good for 760 m
       against a 12 1/4 in PDC good for 2,300 m IS the trip decision;
     - pressures are bar. A 345 bar stack is what the industry calls 5,000 psi.
*/
const ITEMS_OILGAS = [
  /* -- Tricone bits: milled tooth for soft ground, TCI for hard --------- */
  it({ id: 'bit-oil-tri-6-mill', name: '6 in Tricone Bit, Milled Tooth', category: CAT.triconeBits, slot: 'bit',
    price: 3980, unlockLevel: 30, methods: ['oil-rotary'], thread: 'API REG 3 1/2',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.14, wearRate: 1.30, maxUCS: 60, abrasionRes: 0.36, life: 430 },
    description: 'Slim-hole milled tooth for a production string or a deepening below a liner. Long teeth, generous junk slots, and it shovels soft shale as fast as the pump can lift it.' }),
  it({ id: 'bit-oil-tri-8-econ', name: '8 1/2 in Tricone Bit, Milled Tooth Economy', category: CAT.triconeBits, slot: 'bit',
    price: 2890, unlockLevel: 30, methods: ['oil-rotary'], thread: 'API REG 4 1/2',
    material: '42CrMo4(V)', tier: 'econ', consumable: true,
    stats: { ropMult: 0.85, wearRate: 1.85, maxUCS: 70, abrasionRes: 0.33, life: 300 },
    description: 'Open roller bearings and a plain steel gauge. What you run while the good bit is still on order — and it is the bearings that end the run, not the teeth.' }),
  it({ id: 'bit-oil-tri-8-tci', name: '8 1/2 in Tricone Bit, TCI Sealed Journal', category: CAT.triconeBits, slot: 'bit',
    price: 9650, unlockLevel: 30, methods: ['oil-rotary'], thread: 'API REG 4 1/2',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.06, wearRate: 0.90, maxUCS: 170, abrasionRes: 0.72, life: 760 },
    description: 'Tungsten-carbide inserts on sealed journal bearings with a hardfaced gauge row. The all-rounder through a mixed sedimentary section, and the one you can leave on bottom without watching it.' }),
  it({ id: 'bit-oil-tri-17-mill', name: '17 1/2 in Tricone Bit, Milled Tooth', category: CAT.triconeBits, slot: 'bit',
    price: 14800, unlockLevel: 33, methods: ['oil-rotary'], thread: 'API REG 7 5/8',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.24, wearRate: 1.15, maxUCS: 45, abrasionRes: 0.34, life: 520 },
    description: 'Surface-hole geometry: enormous junk slots, big nozzles and teeth long enough to chew unconsolidated clay without balling up. It will not survive anything cemented.' }),
  it({ id: 'bit-oil-tri-12-tci-hd', name: '12 1/4 in Tricone Bit, TCI Hard HD', category: CAT.triconeBits, slot: 'bit',
    price: 22400, unlockLevel: 36, methods: ['oil-rotary'], thread: 'API REG 6 5/8',
    material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.02, wearRate: 0.72, maxUCS: 240, abrasionRes: 0.88, life: 1050 },
    description: 'Short conical inserts, heavy sealed bearings, full gauge protection. It advances slowly through hard sandstone and comes back up whole a thousand metres later.' }),

  /* -- PDC: shears the rock instead of crushing it. Fast, unforgiving. -- */
  it({ id: 'bit-oil-pdc-8', name: '8 1/2 in PDC Bit, 6-Blade 16 mm', category: CAT.pdcBits, slot: 'bit',
    price: 21600, unlockLevel: 38, methods: ['oil-rotary'], thread: 'API REG 4 1/2',
    material: '34CrNiMo6', consumable: true,
    stats: { ropMult: 1.62, wearRate: 1.00, maxUCS: 120, abrasionRes: 0.60, life: 1450 },
    description: 'Sixteen-millimetre cutters on six blades. Through a long shale it makes three times the hole a tricone does; lean on it in a cemented stringer and you trip for the pieces.' }),
  it({ id: 'bit-oil-pdc-12-hd', name: '12 1/4 in PDC Bit, 7-Blade 19 mm HD', category: CAT.pdcBits, slot: 'bit',
    price: 41500, unlockLevel: 44, methods: ['oil-rotary'], thread: 'API REG 6 5/8',
    material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.78, wearRate: 0.78, maxUCS: 170, abrasionRes: 0.80, life: 2300 },
    description: 'Seven blades, backup cutters and a depth-of-cut control ring that stops it foundering the instant you lean on it. The whole intermediate section on one bit, if the hydraulics keep up.' }),

  /* -- Drill pipe. Prices are per JOINT of API Range 2 — 8.23–9.14 m, per
        research/01-oil-gas.md ("Drill pipe Range 2 is 8.23–9.14 m per joint",
        against R1 5.49–6.71 m and R3 11.58–13.72 m). Three of them make the
        ≈27 m triple stand `oil-rotary.rodLength` carries. ------------------ */
  it({ id: 'dp-89-nc38', name: '3 1/2 in Drill Pipe, Range 2, NC38', category: CAT.drillPipes, slot: 'rod',
    price: 640, unlockLevel: 30, methods: ['oil-rotary'], thread: 'NC38 (3 1/2 IF)',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 0.94, wearRate: 1.10, torqueCap: 14, flushRate: 0.90, life: 4200 },
    description: 'Slim string for a small hole or a deepening. Grade E tube with hardbanded tool joints: light enough to run fast, and the first thing to buckle if you crowd it.' }),
  it({ id: 'dp-127-nc50', name: '5 in Drill Pipe, Range 2, NC50', category: CAT.drillPipes, slot: 'rod',
    price: 1180, unlockLevel: 30, methods: ['oil-rotary'], thread: 'NC50 (4 1/2 IF)',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.04, wearRate: 1.00, torqueCap: 38, flushRate: 1.15, life: 6500 },
    description: 'The standard land and platform string: Grade E tube on 42CrMo4-class tool joints, with a bore wide enough that pressure loss down the string is not what limits your flow rate.' }),
  it({ id: 'dp-127-nc50-hd', name: '5 in Drill Pipe, Range 2, NC50 HD', category: CAT.drillPipes, slot: 'rod',
    price: 1860, unlockLevel: 36, methods: ['oil-rotary'], thread: 'NC50 (4 1/2 IF)',
    material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.07, wearRate: 0.66, torqueCap: 52, flushRate: 1.20, life: 12000 },
    description: 'High-strength tube on double-shouldered joints. It takes the make-up torque a top drive can actually deliver, which is the difference between drilling ahead and twisting off.' }),
  it({ id: 'dp-140-fh-hd', name: '5 1/2 in Drill Pipe, Range 2, 5 1/2 FH HD', category: CAT.drillPipes, slot: 'rod',
    price: 2280, unlockLevel: 42, methods: ['oil-rotary'], thread: '5 1/2 FH',
    material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.10, wearRate: 0.62, torqueCap: 64, flushRate: 1.35, life: 14500 },
    description: 'Full-hole connection on a heavy wall: more torque, more flow area, a stiffer string. The deep-well answer, and it wants an annulus wide enough not to swab the hole on the way out.' }),

  /* -- Bottom-hole assembly. The weight on the bit comes from here. ----- */
  it({ id: 'bha-collar-121-econ', name: '4 3/4 in Drill Collar String, NC38', category: CAT.drillCollars, slot: 'bha',
    price: 8040, unlockLevel: 30, methods: ['oil-rotary'], thread: 'NC38',
    material: '42CrMo4(V)', tier: 'econ', consumable: true,
    stats: { ropMult: 0.80, wearRate: 1.60, torqueCap: 22, life: 5600 },
    description: 'Nine light slick collars, bought second-hand. Enough weight for a slim hole and never quite enough for a straight one — you will fight deviation the whole way down.' }),
  it({ id: 'bha-collar-159', name: '6 1/4 in Drill Collar String, NC46', category: CAT.drillCollars, slot: 'bha',
    price: 26800, unlockLevel: 30, methods: ['oil-rotary'], thread: 'NC46 (4 IF)',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.00, wearRate: 1.00, torqueCap: 44, life: 14000 },
    description: 'Twelve slick collars in the standard 8 1/2 in hole size. Weight on bit comes out of this string and nowhere else; the mast only holds the rest of it up.' }),
  it({ id: 'bha-collar-203-hd', name: '8 in Drill Collar String, Integral Blade Stabilisers HD', category: CAT.drillCollars, slot: 'bha',
    price: 48500, unlockLevel: 38, methods: ['oil-rotary'], thread: 'API REG 6 5/8',
    material: '34CrNiMo6', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.12, wearRate: 0.70, torqueCap: 72, life: 26000 },
    description: 'A packed assembly with near-bit and string stabilisers cut into the collars themselves. It drills a straight, full-gauge hole, and it is why the survey comes back inside tolerance.' }),
  it({ id: 'sub-saver-nc50', name: 'NC50 Saver Sub', category: CAT.stringAccess, slot: 'coupling',
    price: 1340, unlockLevel: 30, methods: ['oil-rotary'], thread: 'NC50 (4 1/2 IF)',
    material: '42CrMo4(V)', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 40, life: 6000 },
    description: 'The sacrificial thread between the top drive and the string. It costs a morning to change; the top-drive main shaft costs a month.' }),
  it({ id: 'sub-shock-oil-hd', name: '8 in Shock Sub, 6 5/8 REG HD', category: CAT.shockAbsorbers, slot: 'coupling',
    price: 9800, unlockLevel: 36, methods: ['oil-rotary'], thread: 'API REG 6 5/8',
    material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.04, wearRate: 0.80, torqueCap: 60, life: 18000 },
    description: 'Takes the axial chatter out of the string above the bit. It buys cutter life through an interbedded section and it keeps the weight indicator readable.' }),

  /* -- Mud plant. Circulation is not a detail here; it is the method. --- */
  it({ id: 'pump-mud-triplex-370', name: 'Triplex Mud Pump, 370 kW', category: CAT.mudPumps, slot: 'pump',
    price: 96000, unlockLevel: 30, methods: ['oil-rotary'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.0, wearRate: 1.0, flushRate: 1.6 },
    description: 'A single triplex on a skid. It will circulate an 8 1/2 in hole to a thousand metres, and it will not clean a 12 1/4 in hole at any depth worth drilling.' }),
  it({ id: 'pump-mud-triplex-1180-hd', name: 'Triplex Mud Pump, 1,180 kW HD', category: CAT.mudPumps, slot: 'pump',
    price: 385000, unlockLevel: 40, methods: ['oil-rotary'],
    thread: 'n/a', material: '42CrMo4(V)', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.30, wearRate: 0.85, flushRate: 2.9 },
    description: 'The main pump on a 2,600 m rig. Enough hydraulic power at the bit to clear cuttings as fast as a PDC makes them, which is the only reason a PDC is worth its price.' }),
  it({ id: 'shaker-linear-3', name: 'Linear Motion Shale Shaker, Three-Panel', category: CAT.shaleShakers, slot: 'mudplant',
    price: 42500, unlockLevel: 31, methods: ['oil-rotary'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.06, wearRate: 0.94, flushRate: 1.25 },
    description: 'First stage of solids control, and the one place on the rig where you read the formation with your own eyes. Fine screens or high throughput — you cannot have both.' }),
  it({ id: 'desilter-cone-stack-hd', name: 'Desander & Desilter Cone Stack HD', category: CAT.desanders, slot: 'mudplant',
    price: 56400, unlockLevel: 34, methods: ['oil-rotary'],
    thread: 'n/a', material: 'S355J2', duty: 'HD',
    stats: { ropMult: 1.10, wearRate: 0.86, flushRate: 1.45 },
    description: 'Hydrocyclones below the shaker: the desander takes the sand, the desilter takes what the sand left behind. Drop the solids and your liners, your bit and your swivel all live longer.' }),
  it({ id: 'mud-plant-120', name: 'Mud Mixing & Recycling Plant, 120 m³', category: CAT.mudRecycling, slot: 'mudplant',
    price: 118000, unlockLevel: 37, methods: ['oil-rotary'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.12, wearRate: 0.90, flushRate: 1.55 },
    description: 'Hoppers, mixing guns, a centrifuge and the tankage to hold a full circulation. With this plant you weight up between connections instead of between shifts.' }),
  it({ id: 'mud-tank-active-200', name: 'Active Mud Tank System, 200 m³', category: CAT.mudTanks, slot: 'mudplant',
    price: 96500, unlockLevel: 33, methods: ['oil-rotary'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.05, wearRate: 0.95, flushRate: 1.35 },
    description: 'Compartmented active and reserve tanks with a calibrated pit-volume totaliser. The totaliser is the point: a gain of half a cubic metre is how a kick announces itself.' }),

  /* -- The mud programme itself. ---------------------------------------- */
  it({ id: 'mud-spud-gel', name: 'Spud Mud, Bentonite Gel', category: CAT.fluidsAdditives, slot: 'mud',
    price: 1860, unlockLevel: 30, methods: ['oil-rotary'],
    thread: 'n/a', material: 'n/a', tier: 'econ', consumable: true,
    stats: { ropMult: 0.85, wearRate: 1.15, flushRate: 0.85, life: 640 },
    description: 'Bentonite and water mixed on the fly. It carries cuttings out of the surface hole and does nothing else: no inhibition, almost no weight, and no help at all with a reactive shale.' }),
  it({ id: 'mud-kcl-polymer', name: 'KCl / Polymer Water-Based Mud', category: CAT.fluidsAdditives, slot: 'mud',
    price: 6400, unlockLevel: 30, methods: ['oil-rotary'],
    thread: 'n/a', material: 'n/a', consumable: true,
    stats: { ropMult: 1.06, wearRate: 0.95, flushRate: 1.10, life: 1600 },
    description: 'Potassium chloride to stop the clays swelling, PHPA to encapsulate the cuttings so they reach the shaker whole. The default programme, and it reads honestly on the pit gauge.' }),
  it({ id: 'mud-barite-weighted-hd', name: 'Barite-Weighted Water-Based Mud HD', category: CAT.fluidsAdditives, slot: 'mud',
    price: 14200, unlockLevel: 33, methods: ['oil-rotary'],
    thread: 'n/a', material: 'n/a', duty: 'HD', consumable: true,
    stats: { ropMult: 0.97, wearRate: 0.90, flushRate: 1.15, life: 2000 },
    description: 'Weighted with barite to hold formation pressure back. Every extra point of mud weight buys kick margin, costs rate of penetration, and presses the string harder against the wall.' }),
  it({ id: 'mud-invert-emulsion-hd', name: 'Invert-Emulsion Oil-Based Mud HD', category: CAT.fluidsAdditives, slot: 'mud',
    price: 38600, unlockLevel: 40, methods: ['oil-rotary'],
    thread: 'n/a', material: 'n/a', duty: 'HD', tier: 'prem', consumable: true,
    stats: { ropMult: 1.14, wearRate: 0.74, flushRate: 1.30, life: 3200 },
    description: 'Water dispersed in base oil. Nothing lubricates a long string better and nothing holds a shale open better — and nothing is more expensive to lose into a thief zone or to dispose of afterwards.' }),

  /* -- Well control and the wellhead. Capital, not consumable. ---------- */
  it({ id: 'bop-annular-345', name: '13 5/8 in Annular Preventer, 345 bar', category: CAT.bopStacks, slot: 'wellcontrol',
    price: 168000, unlockLevel: 30, methods: ['oil-rotary'],
    thread: 'n/a', material: '34CrNiMo6',
    stats: { ropMult: 1.0, wearRate: 1.0 },
    description: 'One spherical element that will close on pipe, on a tool joint, or on open hole. The preventer you shut in with first, because it does not care what is in the way.' }),
  it({ id: 'bop-ram-double-345-hd', name: '13 5/8 in Double Ram BOP, 345 bar HD', category: CAT.bopStacks, slot: 'wellcontrol',
    price: 242000, unlockLevel: 34, methods: ['oil-rotary'],
    thread: 'n/a', material: '34CrNiMo6', duty: 'HD', tier: 'prem',
    stats: { ropMult: 1.0, wearRate: 0.88 },
    description: 'Pipe rams above, blind shear rams below, both on hydraulic close. Pressure-tested every fourteen days, and the test is the only reason the certificate means anything.' }),
  it({ id: 'bop-accumulator-6', name: 'BOP Control Unit, Six-Station Accumulator', category: CAT.bopControl, slot: 'wellcontrol',
    price: 78400, unlockLevel: 30, methods: ['oil-rotary'],
    thread: 'n/a', material: 'S355J2',
    stats: { ropMult: 1.0, wearRate: 1.0 },
    description: 'Nitrogen-charged bottles holding enough stored energy to close and open the whole stack with the engines dead. Precharge checked weekly, because the day you need it is not the day to find out.' }),
  it({ id: 'choke-manifold-345', name: 'Choke & Kill Manifold, 345 bar', category: CAT.chokeManifold, slot: 'wellcontrol',
    price: 62800, unlockLevel: 32, methods: ['oil-rotary'],
    thread: 'n/a', material: '34CrNiMo6',
    stats: { ropMult: 1.0, wearRate: 0.94 },
    description: 'Once the well is shut in, this is how the influx is circulated out and the kill weight circulated in, holding bottom-hole pressure steady on the drill-pipe gauge the whole way.' }),
  it({ id: 'wellhead-casing-head-345', name: 'Casing Head & Spool Set, 345 bar', category: CAT.wellheads, slot: 'wellcontrol',
    price: 34600, unlockLevel: 30, methods: ['oil-rotary'],
    thread: 'n/a', material: '42CrMo4(V)',
    stats: { ropMult: 1.0, wearRate: 1.0 },
    description: 'The head the surface casing lands in and everything above it bolts to. Set it out of plumb at spud and every string below it is out of plumb too.' }),

  /* -- Bought per well: services, and the pill you hope not to need. ---- */
  it({ id: 'svc-lcm-pallet', name: 'Lost-Circulation Material, Pallet', category: CAT.fluidsAdditives, slot: 'service',
    price: 1240, unlockLevel: 30, methods: ['oil-rotary'],
    thread: 'n/a', material: 'n/a', consumable: true,
    stats: { flushRate: 0.9, abrasionRes: 0.6, life: 1800 },
    description: 'Nut plug, mica and cellulose fibre in three grades. Mixed as a pill and spotted across a thief zone it bridges the loss; left in the store it does nothing at all.' }),
  it({ id: 'svc-mud-motor-well', name: 'Mud Motor & Directional Service, Per Well', category: CAT.mudMotors, slot: 'service',
    price: 34000, unlockLevel: 38, methods: ['oil-rotary'],
    thread: 'API REG 6 5/8', material: '34CrNiMo6', consumable: true,
    stats: { ropMult: 1.12, wearRate: 0.95, abrasionRes: 0.6, flushRate: 1.1, life: 2600 },
    description: 'A positive-displacement motor and the directional driller who runs it. The bit turns on the mud rather than on the string, so a correction can be slid without turning the whole hole.' }),
  it({ id: 'svc-mwd-lwd-well', name: 'MWD / LWD Logging Service, Per Well', category: CAT.mwdLwd, slot: 'service',
    price: 96000, unlockLevel: 35, methods: ['oil-rotary'],
    thread: 'n/a', material: '34CrNiMo6', consumable: true,
    stats: { ropMult: 1.05, wearRate: 0.96, abrasionRes: 0.6, life: 2600 },
    description: 'Mud-pulse telemetry sending inclination, azimuth and gamma up the string while the bit is still on bottom. It ends the argument about where the well actually is.' }),
  it({ id: 'survey-steering-tool', name: 'Electronic Steering Tool, Wireline', category: CAT.steeringTools, slot: 'service',
    price: 26400, unlockLevel: 42, methods: ['oil-rotary'],
    thread: 'n/a', material: '34CrNiMo6',
    stats: { ropMult: 1.04, wearRate: 0.98 },
    description: 'A wireline tool reading tool face continuously instead of once a stand. Slower to rig up than mud pulse, and far quicker to react when the well starts walking.' }),
];


/* -- The six methods of METHOD_IDS.md, plus the three string elements that
      research/13-string-elements.md found missing --------------------------

   A NOTE ON PRICE, under PLATFORM_TRUTH.md Part C rule 7. No price anywhere in
   this file is a catalogue figure: every western catalogue for this kit is
   login-gated or quote-only, and research/13 §5 records that explicitly for the
   auger section, the sonic rod and the jet rod. Prices here are game-balance
   judgement at the right order of magnitude. DIMENSIONS, energies, lengths,
   threads and blow counts are different — those trace to the research packs and
   are cited item by item. Where even the order of magnitude is a guess the item
   carries priceSourced:false and a needs note, and no screen may print it as a
   fact.                                                                      */
const ITEMS_NEWMETHODS = [
  /* ── Reverse circulation. The sample is the product. ─────────────────── */
  it({ id: 'rc-pipe-114', name: 'RC Dual-Wall Drill Pipe, 114 mm x 3 m', category: CAT.dualWall, slot: 'rod',
    price: 860, unlockLevel: 21, methods: ['rc'],
    thread: 'RC dual-wall box/pin', material: '42CrMo4(V)', model: 'rc-dual-wall-pipe', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 11, flushRate: 1.0, life: 9000 },
    description: 'A tube inside a tube. Air goes down the annulus to the hammer and the chips come back up the centre, so nothing that falls off the wall above the bit can ever reach your sample.' }),
  it({ id: 'rc-hammer-116', name: 'RC Hammer, 116 mm', category: CAT.dthHammers, slot: 'hammer',
    price: 7400, unlockLevel: 21, methods: ['rc'],
    thread: 'RC shank', material: '34CrNiMo6', duty: 'HD', model: 'rc-hammer',
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 300, abrasionRes: 0.85, flushRate: 1.4, life: 9000 },
    description: 'A down-the-hole hammer with the exhaust routed into the inner tube instead of into the annulus. Everything about it exists to keep the return uncontaminated.' }),
  it({ id: 'rc-bit-std', name: 'RC Bit, 124 mm, Flat Face', category: CAT.dthBits, slot: 'bit',
    price: 1290, unlockLevel: 21, methods: ['rc'],
    thread: 'RC shank', material: 'carbide grade K20', model: 'rc-bit', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 300, abrasionRes: 0.86, flushRate: 1.0, life: 1400 },
    description: 'The standard 124 mm face: drop-centre, hemispherical carbides, sample ports through the middle. It makes a fast, straight hole and an honest bag.' }),
  it({ id: 'rc-bit-venturi', name: 'RC Bit, 124 mm, Venturi Face', category: CAT.dthBits, slot: 'bit',
    price: 2180, unlockLevel: 24, methods: ['rc'],
    thread: 'RC shank', material: 'carbide grade K25', duty: 'HD', tier: 'prem', model: 'rc-bit', consumable: true,
    stats: { ropMult: 1.04, wearRate: 0.82, maxUCS: 310, abrasionRes: 0.9, flushRate: 1.35, life: 1900 },
    description: 'Shaped ports that pull the cuttings into the inner tube instead of letting them wander the face first. You pay for it once and you get it back in recovery on every metre of the hole.' }),
  it({ id: 'rc-cyclone-100', name: 'Sample Cyclone, 100 mm', category: CAT.sampling, slot: 'sample',
    price: 7200, unlockLevel: 21, methods: ['rc'],
    thread: 'n/a', material: 'S355J2', model: 'rc-cyclone',
    stats: { ropMult: 1.0, wearRate: 1.0, flushRate: 1.0, life: 0 },
    description: 'The chips come out of the hose at speed and have to stop somewhere. The cyclone drops them out of the air quietly enough that the sample is still a sample when it reaches the splitter.' }),
  it({ id: 'rc-splitter-2', name: 'Riffle Sample Splitter, Two-Way', category: CAT.sampling, slot: 'sample',
    price: 2800, unlockLevel: 21, methods: ['rc'],
    thread: 'n/a', material: 'S355J2', model: 'rc-splitter',
    stats: { ropMult: 1.0, wearRate: 1.0, life: 0 },
    description: 'Two to three kilos of chips come off every metre and the laboratory wants a fraction of it, chosen without a human deciding which fraction. A riffle splitter is how you take that decision away from yourself.' }),
  it({ id: 'sample-bag-calico', name: 'Calico Sample Bags, Box of 500', category: CAT.sampling, slot: 'sample',
    price: 240, unlockLevel: 21, methods: ['rc'],
    thread: 'n/a', material: 'n/a', model: 'sample-bag', consumable: true,
    stats: { life: 500 },
    description: 'Numbered, tied and laid out in order at the metre marks. The assay is only ever as good as the bag it came out of, and a bag in the wrong order is worse than no bag at all.' }),

  /* ── Tunnelling: drill and blast at the face. ──────────────────────────── */
  it({ id: 'jumbo-feed-3900', name: 'Boom Feed, 3.9 m', category: CAT.jumbos, slot: 'head',
    price: 38000, unlockLevel: 36, methods: ['tunnel-jumbo'],
    thread: 'T38 / T45', material: '34CrNiMo6', duty: 'HD',
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 0.34, life: 0 },
    description: 'The aluminium beam the drifter runs on, with the cradle, the chain and the rod support at the nose. Its length is your round length, and your round length is the whole economics of the drive.' }),
  it({ id: 'rod-t38-face-2435', name: 'T38 Face Extension Rod, 2.44 m', category: CAT.drillRods, slot: 'rod',
    price: 128, unlockLevel: 36, methods: ['tunnel-jumbo'],
    thread: 'T38', material: '42CrMo4(V)', model: 'drill-rod', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 2.4, life: 1600 },
    description: 'Short, because the feed has to fit between the face and the muck pile behind you. Two thousand four hundred and thirty-five millimetres of rod for a two-one-three-two hole.' }),
  it({ id: 'shank-t38-jumbo', name: 'T38 Shank Adapter, Jumbo Drifter', category: CAT.shankAdapters, slot: 'shank',
    price: 340, unlockLevel: 36, methods: ['tunnel-jumbo'],
    thread: 'T38', material: '34CrNiMo6', model: 'shank-adapter', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 2.4, life: 2200 },
    description: 'A hundred and ten blows a second through one splined joint, all shift, for years. Check it every round and change it before it checks itself.' }),
  it({ id: 'coup-t38', name: 'T38 Coupling Sleeve', category: CAT.couplingSleeves, slot: 'coupling',
    price: 96, unlockLevel: 36, methods: ['tunnel-jumbo', 'top-hammer'],
    thread: 'T38', material: '42CrMo4(V)', model: 'coupling-sleeve', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 2.4, life: 1100 },
    description: 'The joint between the shank and the rod on a face string. It is the cheapest thing on the boom and it is what decides whether the hole goes where the pattern says.' }),
  it({ id: 'bit-face-t38-48', name: 'T38 48 mm Face Bit', category: CAT.buttonBits, slot: 'bit',
    price: 286, unlockLevel: 36, methods: ['tunnel-jumbo'],
    thread: 'T38', material: 'carbide grade K20', model: 'button-bit', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 280, abrasionRes: 0.8, life: 520 },
    description: 'Forty-eight millimetres, about a hundred and forty times a face. Drill them parallel and the profile comes out where the drawing says; let them wander out and somebody pays to fill the overbreak with concrete.' }),
  it({ id: 'bit-face-t45-64-hd', name: 'T45 64 mm Face Bit, HD', category: CAT.buttonBits, slot: 'bit',
    price: 372, unlockLevel: 40, methods: ['tunnel-jumbo'],
    thread: 'T45', material: 'carbide grade K25', duty: 'HD', tier: 'prem', model: 'button-bit', consumable: true,
    stats: { ropMult: 1.12, wearRate: 0.72, maxUCS: 310, abrasionRes: 0.9, life: 900 },
    description: 'A bigger cut hole for a wedge cut in hard rock, in a heavier grade. It is the one that gets the round to pull when the granite will not let a parallel cut open.' }),
  it({ id: 'charging-hose-anfo', name: 'ANFO Charging Hose, 32 mm x 30 m', category: CAT.anfoLoaders, slot: 'service',
    price: 1180, unlockLevel: 36, methods: ['tunnel-jumbo'],
    thread: 'n/a', material: 'FRP/composite', model: 'charging-hose',
    stats: { life: 0 },
    description: 'Semi-conducting hose on a reel, because a static charge and a hole full of ammonium nitrate are a poor combination. It loads the round from the back of the basket.' }),
  it({ id: 'detonator-reel-500', name: 'Shock-Tube Initiation Reel, 500 m', category: CAT.anfoLoaders, slot: 'service',
    price: 450, unlockLevel: 36, methods: ['tunnel-jumbo'], consumable: true,
    thread: 'n/a', material: 'n/a', model: 'detonator-reel',
    stats: { life: 1 },
    description: 'Five hundred metres of tube and the delay series that fires the cut first and the contour last. The firing order is the difference between a clean profile and a week of shotcrete.' }),

  /* ── Longhole production: the toe is what you are paid for. ────────────── */
  it({ id: 'rod-t51-lh-1525', name: 'T51 Longhole Rod, 1.525 m', category: CAT.drillRods, slot: 'rod',
    price: 146, unlockLevel: 39, methods: ['longhole'],
    thread: 'T51', material: '42CrMo4(V)', model: 'drill-rod', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 5.6, life: 2000 },
    description: 'A metre and a half, because the feed has to swing a full circle inside a four-metre drive. Every joint you add is another place the string can wander.' }),
  it({ id: 'bit-lh-t51-89', name: 'T51 89 mm Longhole Bit', category: CAT.buttonBits, slot: 'bit',
    price: 430, unlockLevel: 39, methods: ['longhole'],
    thread: 'T51', material: 'carbide grade K25', model: 'button-bit', consumable: true,
    stats: { ropMult: 1.0, wearRate: 0.92, maxUCS: 300, abrasionRes: 0.88, life: 780 },
    description: 'Retrac gauge on a heavy head. Twenty-five metres out into the ore, and nobody will ever see where it ended up except as the grade that comes back from the mill.' }),
  it({ id: 'guide-tube-102', name: 'Longhole Guide Tube, 102 mm x 1 m', category: CAT.stringAccess, slot: 'coupling',
    price: 1580, unlockLevel: 39, methods: ['longhole'],
    thread: 'T51', material: '34CrNiMo6', duty: 'HD', model: 'guide-tube',
    stats: { ropMult: 0.96, wearRate: 0.8, torqueCap: 5.6, life: 6000 },
    description: 'A stiff sleeve behind the bit that stops the first two metres of hole from setting the direction of the last twenty. It costs you a little penetration and it buys the whole ring its accuracy.' }),
  it({ id: 'ith-hammer-5', name: '5 in ITH Hammer', category: CAT.dthHammers, slot: 'hammer',
    price: 5100, unlockLevel: 41, methods: ['longhole'],
    thread: 'QL50 shank', material: '34CrNiMo6', duty: 'HD',
    stats: { ropMult: 1.24, wearRate: 0.74, maxUCS: 310, abrasionRes: 0.88, flushRate: 1.5, life: 11000 },
    description: 'A down-the-hole hammer taken underground. The blow is made at the bit, so a thirty-metre hole is as straight at the bottom as it was at the collar — which is the only reason to carry the air for it.' }),
  it({ id: 'ith-bit-140', name: '5 in QL50 140 mm ITH Bit', category: CAT.dthBits, slot: 'bit',
    price: 960, unlockLevel: 41, methods: ['longhole'],
    thread: 'QL50', material: 'carbide grade K25', duty: 'HD', model: 'dth-bit', consumable: true,
    stats: { ropMult: 1.18, wearRate: 0.78, maxUCS: 310, abrasionRes: 0.9, life: 1300 },
    description: 'One hundred and forty millimetres of production hole. Bigger holes mean fewer of them, wider burdens and less drilling for the same tonne — until the deviation catches up with you.' }),

  /* The ITH ladder. A bigger hammer breaks a wider burden, so you drill fewer
     holes for the same tonne — and pay for it in air, which underground is a
     real constraint and not a line item. `flushRate` is that bill. */
  it({ id: 'ith-hammer-3', name: '3 in ITH Hammer', category: CAT.dthHammers, slot: 'hammer',
    price: 2600, unlockLevel: 36, methods: ['longhole'],
    thread: 'QL30 shank', material: '34CrNiMo6', duty: 'HD', model: 'ith-hammer-3',
    stats: { ropMult: 1.32, wearRate: 0.68, maxUCS: 310, abrasionRes: 0.88, flushRate: 1.0, life: 8000 },
    description: 'A three-inch hammer on a small ring. It will not break the ground a six will, but it fits a drive you can actually get a machine into.' }),
  it({ id: 'ith-hammer-4', name: '4 in ITH Hammer', category: CAT.dthHammers, slot: 'hammer',
    price: 3700, unlockLevel: 38, methods: ['longhole'],
    thread: 'QL40 shank', material: '34CrNiMo6', duty: 'HD', model: 'ith-hammer-4',
    stats: { ropMult: 1.28, wearRate: 0.71, maxUCS: 310, abrasionRes: 0.88, flushRate: 1.25, life: 9500 },
    description: 'The middle of the range, and the one most rings are drilled with. Enough energy for a twenty-metre uphole without an air package you cannot fit underground.' }),
  it({ id: 'ith-hammer-6', name: '6 in ITH Hammer', category: CAT.dthHammers, slot: 'hammer',
    price: 7200, unlockLevel: 44, methods: ['longhole'],
    thread: 'QL60 shank', material: '34CrNiMo6', duty: 'HD', model: 'ith-hammer-6',
    stats: { ropMult: 1.2, wearRate: 0.77, maxUCS: 310, abrasionRes: 0.88, flushRate: 1.85, life: 12500 },
    description: 'Six inches of hammer and the air bill to match. It pays when the burden it lets you pull is wide enough to drill fewer holes for the same tonne.' }),
  it({ id: 'ith-hammer-8', name: '8 in ITH Hammer', category: CAT.dthHammers, slot: 'hammer',
    price: 12800, unlockLevel: 48, methods: ['longhole'],
    thread: 'QL80 shank', material: '34CrNiMo6', duty: 'HD', model: 'ith-hammer-8',
    stats: { ropMult: 1.12, wearRate: 0.81, maxUCS: 310, abrasionRes: 0.88, flushRate: 2.6, life: 15000 },
    description: 'The biggest hammer that goes underground. Everything about it — the air, the rods, the handling — is a size up, and it only earns its keep on a big open stope.' }),
  it({ id: 'ith-bit-89', name: '3 in QL30 89 mm ITH Bit', category: CAT.dthBits, slot: 'bit',
    price: 520, unlockLevel: 36, methods: ['longhole'],
    thread: 'QL30', material: 'carbide grade K25', duty: 'HD', model: 'ith-bit-89', consumable: true,
    stats: { ropMult: 1.26, wearRate: 0.72, maxUCS: 310, abrasionRes: 0.9, life: 900 },
    description: 'Eighty-nine millimetres. A tight pattern, more holes, more collaring — and the least deviation of anything in the range, because a short hole in a small diameter simply has less room to wander.' }),
  it({ id: 'ith-bit-115', name: '4 in QL40 115 mm ITH Bit', category: CAT.dthBits, slot: 'bit',
    price: 700, unlockLevel: 38, methods: ['longhole'],
    thread: 'QL40', material: 'carbide grade K25', duty: 'HD', model: 'ith-bit-115', consumable: true,
    stats: { ropMult: 1.22, wearRate: 0.75, maxUCS: 310, abrasionRes: 0.9, life: 1100 },
    description: 'One hundred and fifteen. The size most production rings are drilled at, and the one the charging crew are set up for.' }),
  it({ id: 'ith-bit-165', name: '6 in QL60 165 mm ITH Bit', category: CAT.dthBits, slot: 'bit',
    price: 1280, unlockLevel: 44, methods: ['longhole'],
    thread: 'QL60', material: 'carbide grade K25', duty: 'HD', model: 'ith-bit-165', consumable: true,
    stats: { ropMult: 1.14, wearRate: 0.82, maxUCS: 310, abrasionRes: 0.9, life: 1550 },
    description: 'One hundred and sixty-five millimetres. Fewer holes on a wider burden, but every one you place badly costs more than it used to.' }),
  it({ id: 'ith-bit-216', name: '8 in QL80 216 mm ITH Bit', category: CAT.dthBits, slot: 'bit',
    price: 2050, unlockLevel: 48, methods: ['longhole'],
    thread: 'QL80', material: 'carbide grade K25', duty: 'HD', model: 'ith-bit-216', consumable: true,
    stats: { ropMult: 1.06, wearRate: 0.88, maxUCS: 310, abrasionRes: 0.9, life: 2000 },
    description: 'Two hundred and sixteen — a big hole for a big stope. At this diameter the deviation over twenty-five metres is what decides whether the ring breaks clean or leaves a brow.' }),

  /* ── Ground support. The hole is finished when something is IN it. ─────── */
  /* THE DIAMETER LADDER IS THE MECHANIC. A friction bolt has to be driven into
     a hole SLIGHTLY SMALLER than itself — a 33 mm bolt takes a 33.0 mm bit, a
     39 mm bolt a 38.1 mm bit — and a resin-grouted bolt needs a thin, even
     annulus for the resin to mix and grip in. Drill it oversize and the bolt
     goes in beautifully, torques up to nothing and pull-tests as a failure.
     (research/03-mining.md §friction bolts, §hole rule.) */
  it({ id: 'bolt-bit-33', name: 'R32 33 mm Bolting Bit', category: CAT.buttonBits, slot: 'bit',
    price: 214, unlockLevel: 29, methods: ['rockbolt'],
    thread: 'R32', material: 'carbide grade K25', model: 'button-bit', consumable: true,
    stats: { ropMult: 0.92, wearRate: 0.88, maxUCS: 300, abrasionRes: 0.86, life: 620 },
    description: 'The right bit. Thirty-three millimetres is a tight hole and it drills slower for it, and it is the reason the bolt you put in it holds what the drawing says it holds.' }),
  it({ id: 'bolt-bit-38', name: 'R32 38 mm Bolting Bit', category: CAT.buttonBits, slot: 'bit',
    price: 178, unlockLevel: 29, methods: ['rockbolt'],
    thread: 'R32', material: 'carbide grade K20', model: 'button-bit', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 280, abrasionRes: 0.8, life: 560 },
    description: 'The middle of the ladder: right for a 39 mm friction bolt, generous for resin. It is the bit most crews run, and it is the one that makes a bad habit look fine for a year.' }),
  it({ id: 'bolt-bit-39', name: 'R32 39 mm Bolting Bit', category: CAT.buttonBits, slot: 'bit',
    price: 142, unlockLevel: 29, methods: ['rockbolt'], tier: 'econ',
    thread: 'R32', material: 'carbide grade K15', model: 'button-bit', consumable: true,
    stats: { ropMult: 1.1, wearRate: 1.15, maxUCS: 240, abrasionRes: 0.66, life: 430 },
    description: 'Cheapest, fastest, and wrong. A 39 mm hole is bigger than the 39 mm friction bolt meant to grip it and far too wide for resin to mix in — the bolts go in like a dream and pull out at half their rated load.' }),
  it({ id: 'friction-bolt-39', name: 'Split-Tube Friction Bolt, 39 mm x 2.4 m', category: CAT.rockBolts, slot: 'install',
    price: 31, unlockLevel: 29, methods: ['rockbolt'],
    thread: 'n/a', material: 'S355J2', model: 'friction-bolt', consumable: true,
    stats: { life: 2.4 },
    description: 'A slotted tube driven into a hole narrower than itself; the steel springs against the rock down its whole length. No resin, no cure time, and it is holding the moment you let go of it.' }),
  it({ id: 'friction-bolt-46', name: 'Split-Tube Friction Bolt, 46 mm x 3.0 m', category: CAT.rockBolts, slot: 'install',
    price: 44, unlockLevel: 32, methods: ['rockbolt'], duty: 'HD',
    thread: 'n/a', material: 'S355J2', model: 'friction-bolt', consumable: true,
    stats: { life: 3.0 },
    description: 'The heavy split-tube: sixteen tonnes ultimate against the thirty-three millimetre bolt\'s eleven, and three metres of it. This is what goes into ground that has already told you once.' }),
  it({ id: 'rebar-bolt-20', name: 'Resin-Grouted Rebar Bolt, 20 mm x 2.4 m', category: CAT.rockBolts, slot: 'install',
    price: 30, unlockLevel: 29, methods: ['rockbolt', 'anchor'],
    thread: 'n/a', material: 'S355J2', model: 'rebar-bolt', consumable: true,
    stats: { life: 2.4 },
    description: 'Deformed bar spun into a hole full of resin cartridges. Stiffer than a friction bolt and stronger, and it is only as good as the mixing — which is only as good as the annulus you drilled for it.' }),
  it({ id: 'cable-bolt-6m', name: 'Bulbed Cable Bolt, 15.2 mm x 6.0 m', category: CAT.cableBolts, slot: 'install',
    price: 58, unlockLevel: 34, methods: ['rockbolt'], duty: 'HD', tier: 'prem',
    thread: 'n/a', material: '25CrMo4V', model: 'cable-bolt', consumable: true,
    stats: { life: 6.0 },
    description: 'Six metres of strand with bulbs swaged along it, pushed up a hole and grouted. It reaches past the loosened ground into rock that is still doing its job — which a 2.4 m bolt cannot.' }),
  it({ id: 'resin-fast', name: 'Resin Cartridges, 25 x 600 mm, Fast Set', category: CAT.resinCartridge, slot: 'service',
    price: 220, unlockLevel: 29, methods: ['rockbolt', 'anchor'],
    thread: 'n/a', material: 'n/a', model: 'resin-cartridge', consumable: true,
    stats: { life: 300 },
    description: 'A box of cartridges: fast at the toe to anchor it, slow behind to grout the length. Spin them long enough to mix and not one second longer, because a resin you keep stirring after it sets is a bolt with nothing round it.' }),
  it({ id: 'mesh-2400', name: 'Weldmesh Sheet, 2.4 x 1.2 m', category: CAT.meshSupport, slot: 'service',
    price: 34, unlockLevel: 29, methods: ['rockbolt'],
    thread: 'n/a', material: 'S355J2', model: 'mesh-sheet', consumable: true,
    stats: { life: 2.9 },
    description: 'Bolts hold the mass of rock; mesh holds the pieces between the bolts. The second job is the one that hits people, so the mesh goes up with the round, not after it.' }),
  it({ id: 'bolt-plate-150', name: 'Dished Bolt Plate, 150 mm', category: CAT.boltPlates, slot: 'service',
    price: 9, unlockLevel: 29, methods: ['rockbolt'],
    thread: 'n/a', material: 'S355J2', model: 'bolt-plate', consumable: true,
    stats: { life: 1 },
    description: 'The dish flattens as the plate takes load, so a driller walking past can see which bolts are working. That is a warning system made of pressed steel and it costs nine euros.' }),
  it({ id: 'bolt-nut-m24', name: 'Dome Nut M24 with Shear Collar', category: CAT.boltPlates, slot: 'service',
    price: 5, unlockLevel: 29, methods: ['rockbolt'],
    thread: 'GEWI threadbar 24 mm', material: 'S355J2', model: 'bolt-nut', consumable: true,
    stats: { life: 1 },
    description: 'The collar shears at the tension the design asked for, which means the bolt is torqued correctly by anybody, on any shift, without an argument about the torque wrench.' }),

  /* ── Driven piling. Nothing rotates and nothing circulates. ────────────── */
  /* The DOLLY is the consumable. It sits between the hammer and the pile head
     with packing under it, and its condition decides how much of each blow
     actually reaches the toe — so it wears, and it is changed, exactly like a
     bit. sim/drilling.js reads it from loadout.dolly and treats its life as bit
     life. research/05-foundation-piling.md §helmets and dollies. */
  it({ id: 'dolly-hardwood', name: 'Hardwood Dolly, End Grain', category: CAT.pileHelmets, slot: 'dolly',
    price: 220, unlockLevel: 33, methods: ['driven-pile'], tier: 'econ',
    thread: 'n/a', material: 'n/a', model: 'pile-helmet', consumable: true,
    stats: { ropMult: 0.92, wearRate: 1.4, life: 240 },
    description: 'A block of end-grain hardwood, set with the grain end-on so it crushes evenly instead of splitting. Cheap, kind to a concrete pile head, and finished after a few hundred blows.' }),
  it({ id: 'dolly-plastic', name: 'Plastic Dolly, Phenolic Laminate', category: CAT.pileHelmets, slot: 'dolly',
    price: 780, unlockLevel: 33, methods: ['driven-pile'],
    thread: 'n/a', material: 'FRP/composite', model: 'pile-helmet', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, life: 620 },
    description: 'Laminated phenolic: it passes more of the blow than timber does and it lasts three times as long. The default on any job long enough to care about changing dollies.' }),
  it({ id: 'dolly-composite', name: 'Composite Dolly, Steel-Faced', category: CAT.pileHelmets, slot: 'dolly',
    price: 1640, unlockLevel: 36, methods: ['driven-pile'], duty: 'HD', tier: 'prem',
    thread: 'n/a', material: '34CrNiMo6', model: 'pile-helmet', consumable: true,
    stats: { ropMult: 1.05, wearRate: 0.7, life: 1500 },
    description: 'A steel-faced laminate that transmits nearly all of the blow. It drives a steel pile hard and fast — and on a concrete pile it will happily transmit enough to crack the head, so read the stress gauge.' }),
  it({ id: 'pile-helmet-350', name: 'Pile Helmet, 350 mm Square', category: CAT.pileHelmets, slot: 'dolly',
    price: 5600, unlockLevel: 33, methods: ['driven-pile'],
    thread: 'n/a', material: '34CrNiMo6', model: 'pile-helmet', duty: 'HD',
    stats: { ropMult: 1.0, wearRate: 0.9, life: 0 },
    description: 'The cast cap that sits over a precast pile head with the dolly and the packing inside it. It is a loose fit on purpose: a helmet that grips the pile transmits bending into it, and bending is what snaps a concrete pile.' }),
  it({ id: 'drive-cap-tube-610', name: 'Drive Cap, 610 mm Tube', category: CAT.pileHelmets, slot: 'dolly',
    price: 6400, unlockLevel: 35, methods: ['driven-pile'],
    thread: 'n/a', material: '34CrNiMo6', model: 'drive-cap', duty: 'HD',
    stats: { ropMult: 1.02, wearRate: 0.88, life: 0 },
    description: 'A machined cap that locates on the wall of a tubular pile and spreads the blow around the full circumference. Get it off-centre and you drive the top of the pile out of round in ten blows.' }),
  it({ id: 'precast-pile-350', name: 'Precast Concrete Pile, 350 mm x 14 m', category: CAT.precastPiles, slot: 'install',
    price: 1720, unlockLevel: 33, methods: ['driven-pile'],
    thread: 'n/a', material: 'n/a', model: 'precast-pile', consumable: true,
    stats: { life: 14 },
    description: 'Prestressed concrete, cast weeks ago and cured. It takes compression all day and it will not forgive a tensile wave: drive it too hard into soft ground and it cracks in the middle where nobody can see it.' }),
  it({ id: 'steel-tube-pile-914', name: 'Steel Tube Pile, 914 x 12.5 mm', category: CAT.drivenPipePiles, slot: 'install',
    price: 11600, unlockLevel: 36, methods: ['driven-pile'], duty: 'HD',
    thread: 'welded splice', material: 'S355J2', model: 'tube-pile', consumable: true,
    stats: { life: 20 },
    description: 'Open-ended tube, spliced by welding as it goes down, and it will take a driving stress a concrete pile cannot survive. It is also the pile you can drive, measure and drive again.' }),
  it({ id: 'h-pile-305', name: 'Steel H-Bearing Pile, 310 x 305 mm', category: CAT.bearingPiles, slot: 'install',
    price: 1880, unlockLevel: 34, methods: ['driven-pile'],
    thread: 'welded splice', material: 'S355J2', model: 'h-pile', consumable: true,
    stats: { life: 18 },
    description: 'Rolled section that cuts its way through fill and gravel with very little displacement. It goes where a solid pile would not, and it takes hard driving onto rock without complaining.' }),
  it({ id: 'sheet-pile-z-630', name: 'Steel Z Sheet Pile Pair, 630 mm', category: CAT.sheetPiles, slot: 'install',
    price: 3900, unlockLevel: 37, methods: ['driven-pile'], duty: 'HD',
    thread: 'sheet-pile interlock', material: 'S355J2', model: 'sheet-pile-pair', consumable: true,
    stats: { life: 15 },
    description: 'Two Z sections threaded together at the interlock and driven as a pair. The wall is only as watertight as those interlocks, and an interlock that declutches underground announces itself as a hole in your cofferdam.' }),
  it({ id: 'impact-hammer-9t', name: 'Hydraulic Impact Hammer, 9 t Ram', category: CAT.impactHammers, slot: 'hammer',
    price: 198000, unlockLevel: 33, methods: ['driven-pile'],
    thread: 'n/a', material: '34CrNiMo6', duty: 'HD', model: 'impact-hammer',
    stats: { ropMult: 1.0, wearRate: 1.0, life: 0 },
    description: 'Nine tonnes of ram, 106 kilonewton-metres at a 1,200 mm stroke, forty to a hundred blows a minute. Energy and rate share one hydraulic circuit, so every blow you add is energy you took out of the others.' }),
  it({ id: 'vibro-hammer-1500', name: 'Vibratory Hammer, 1500 kN', category: CAT.vibroHammers, slot: 'hammer',
    price: 164000, unlockLevel: 37, methods: ['driven-pile'],
    thread: 'n/a', material: '34CrNiMo6', duty: 'HD', model: 'vibratory-hammer',
    stats: { ropMult: 1.35, wearRate: 0.9, life: 0 },
    description: 'Eccentric weights that shake the pile down instead of hitting it. Fast and quiet in sand, useless in stiff clay, and it gives you no set at all — which means no bearing capacity you can prove.' }),
  it({ id: 'pda-pile-driving-analyser', name: 'Pile Driving Analyser & Stress Monitor', category: CAT.monitoring, slot: 'service',
    price: 26400, unlockLevel: 33, methods: ['driven-pile'],
    thread: 'n/a', material: 'FRP/composite', model: false,
    stats: { ropMult: 1.0, wearRate: 0.95, life: 0 },
    description: 'Strain gauges and accelerometers bolted near the pile head, reading the stress wave on every blow. It is the only thing that tells you the difference between a pile that has found bearing and a pile that is quietly destroying its own toe — and with it on, the code lets you drive harder.' }),

  /* ── Site investigation: the rest of the sampling kit. ─────────────────── */
  it({ id: 'push-rod-1m', name: 'CPT Push Rod, 44.5 mm x 1 m', category: CAT.cpt, slot: 'rod',
    price: 190, unlockLevel: 20, methods: ['site-investigation'],
    thread: 'CPT push rod 44.5 mm', material: '34CrNiMo6', model: 'push-rod', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 0, life: 4000 },
    description: 'One metre at a time, added by hand while the push never stops for longer than it takes to make the joint. Straightness is everything: a bent rod string reads as a soil that is not there.' }),
  it({ id: 'window-sampler-60', name: 'Window Sampler, 60 mm x 1 m', category: CAT.linerSamplers, slot: 'probe',
    price: 480, unlockLevel: 10, methods: ['site-investigation'],
    thread: 'A-Rod', material: '42CrMo4(V)', model: 'window-sampler', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.05, maxUCS: 0, life: 380 },
    description: 'A driven tube with a slot down the side, so the whole metre can be logged and photographed without extruding it. Disturbed, quick and cheap: the right tool when you want a profile, not a strength.' }),
  it({ id: 'u100-tube', name: 'U100 Open-Drive Sample Tube, 100 mm', category: CAT.linerSamplers, slot: 'probe',
    price: 340, unlockLevel: 12, methods: ['site-investigation'],
    thread: 'A-Rod', material: '42CrMo4(V)', model: 'u100-tube', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 0, life: 420 },
    description: 'The thick-walled hundred-millimetre tube that British ground investigation was built on. It is a category B sampler and not an undisturbed one — the wall is too thick to pretend otherwise.' }),
  it({ id: 'shelby-76', name: 'Shelby Thin-Wall Tube, 76 mm', category: CAT.linerSamplers, slot: 'probe',
    price: 98, unlockLevel: 16, methods: ['site-investigation'],
    thread: 'A-Rod', material: 'S355J2', model: 'shelby-tube', consumable: true,
    stats: { ropMult: 1.0, wearRate: 1.2, maxUCS: 0, life: 200 },
    description: 'Thin wall, sharp cutting edge, pushed rather than driven. It is the only sampler on the truck that brings soft clay up in a state a triaxial test can honestly be run on, and it is bent by the first gravel it meets.' }),
  it({ id: 'piezometer-50', name: 'Standpipe Piezometer, 50 mm', category: CAT.wellScreens, slot: 'service',
    price: 185, unlockLevel: 10, methods: ['site-investigation'],
    thread: 'flush-joint PVC', material: 'FRP/composite', model: 'standpipe-piezometer', consumable: true,
    stats: { life: 40 },
    description: 'A slotted tip, a riser and a dip meter. It answers the one question the borehole log cannot: where the water actually stands, next week and next winter as well as today.' }),

  /* ── The three string elements research/13 found missing. ──────────────── */
  /* Sectional augering and CFA are two different machines under one word. On a
     true CFA the flight IS the string, which is why cfa and cased-cfa have no
     rod bay; sectional augering builds the column from five-foot SECTIONS with
     a separately catalogued head on the bottom. "Section" is the catalogue
     word — "extension" is the hand-auger term and appears in no machine
     catalogue checked. research/13 §1.1, §4.1. */
  it({ id: 'auger-flight-sec-280', name: 'Flight Auger Section, 279 mm x 1.5 m', category: CAT.augerFlights, slot: 'rod',
    price: 560, unlockLevel: 1, methods: ['auger', 'site-investigation'],
    thread: '1 5/8 in hex pin/box + drive pin', material: 'S355J2, hardsurfaced flighting',
    model: 'cfa-flight', consumable: true, priceSourced: false,
    needs: 'Dimensions, hex size, pitch and the drive-pin joint are sourced (research/13 §4.1); the PRICE is an estimate, because no western list price for an auger section could be obtained — every catalogue is login-gated or quote-only (§5).',
    stats: { ropMult: 1.0, wearRate: 1.0, maxUCS: 4, abrasionRes: 0.35, torqueCap: 6, life: 2600 },
    description: 'Five feet of hardsurfaced flight with a timed hex pin on top and a drive pin through the joint. It cannot unscrew when you back her out, which is the whole point of a pin instead of a thread.' }),
  it({ id: 'hsa-sec-159', name: 'Hollow-Stem Auger Section, 159 mm ID x 1.5 m', category: CAT.cfaAugers, slot: 'rod',
    price: 690, unlockLevel: 8, methods: ['auger', 'site-investigation'],
    thread: '1 5/8 in hex pin/box + drive pin', material: 'S355J2, hardsurfaced flighting',
    model: 'cfa-flight', consumable: true, priceSourced: false,
    needs: 'ID/OD, keyed coupling, connector bolt and the O-ring seal are sourced (research/13 §4.1); the price is an estimate — see §5.',
    stats: { ropMult: 0.96, wearRate: 0.9, maxUCS: 6, abrasionRes: 0.45, torqueCap: 14, life: 4200 },
    description: 'A hollow column you sample down the middle of, with an O-ring on the auger pin so the hole outside stays outside. On contaminated land that seal is the difference between a result and a cross-contaminated one.' }),
  it({ id: 'sonic-rod-89', name: 'Sonic Drill Rod, 88.9 mm x 3 m', category: CAT.sonicRods, slot: 'rod',
    price: 880, unlockLevel: 42, methods: ['sonic'],
    thread: 'sonic box/pin RH', material: '4140 QT, one-piece upset forged',
    model: 'drill-rod', consumable: true, priceSourced: false,
    needs: 'OD, ID, mass, forging method and the right-hand thread are sourced (research/13 §4.2); the price is an estimate — no western sonic rod list price is published (§5).',
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 8, flushRate: 1.0, life: 7000 },
    description: 'One piece of tube, forged thick at both ends so there is no weld in the middle for the resonance to find. The rod is right-hand; the override casing around it is left-hand.' }),
  it({ id: 'sonic-rod-108-hd', name: 'Sonic Drill Rod, 108 mm x 3 m HD', category: CAT.sonicRods, slot: 'rod',
    price: 1240, unlockLevel: 45, methods: ['sonic'], duty: 'HD', tier: 'prem',
    thread: 'sonic box/pin RH', material: '4140 QT, one-piece upset forged',
    model: 'drill-rod', consumable: true, priceSourced: false,
    needs: 'OD, ID, end wall and mass are sourced (research/13 §4.2); the price is an estimate — see §5.',
    stats: { ropMult: 1.08, wearRate: 0.72, torqueCap: 14, flushRate: 1.2, life: 15000 },
    description: 'Heavier wall, same forging, and it will carry the oscillator down to the full hundred and twenty metres without fatiguing at the box. Resonance finds every weakness in a string eventually; this one has fewer.' }),
  it({ id: 'jet-rod-double-89', name: 'Jet Grouting Rod, Double Tube, 88.9 mm x 3 m', category: CAT.jetRods, slot: 'rod',
    price: 1180, unlockLevel: 47, methods: ['jet-grouting'],
    thread: 'HDI multi-tube box/pin, RHT conical', material: '42CrMo4(V), U-seal per tube',
    model: 'drill-rod', consumable: true, priceSourced: false,
    needs: 'Diameters, usable lengths, thread form and the seal arrangement are sourced (research/13 §4.3); the price is an estimate — European jet rod is custom-made and project-priced (§5).',
    stats: { ropMult: 1.0, wearRate: 1.0, torqueCap: 9, flushRate: 1.0, life: 5200 },
    description: 'Two tubes inside one rod: grout down the middle, air around it. The air shroud is what holds the jet together long enough to cut a column worth the money.' }),
  it({ id: 'jet-rod-triple-114-hd', name: 'Jet Grouting Rod, Triple Tube, 114.3 mm x 3 m HD', category: CAT.jetRods, slot: 'rod',
    price: 2150, unlockLevel: 51, methods: ['jet-grouting'], duty: 'HD', tier: 'prem',
    thread: 'HDI multi-tube box/pin, RHT conical', material: '42CrMo4(V), two U-seals per tube',
    model: 'drill-rod', consumable: true, priceSourced: false,
    needs: 'Diameters, usable lengths, thread form and the two-U-seal-per-tube arrangement are sourced (research/13 §4.3); the price is an estimate — see §5.',
    stats: { ropMult: 1.16, wearRate: 0.78, torqueCap: 15, flushRate: 1.4, life: 9000 },
    description: 'Three concentric tubes and six U-seals: water to cut, air to shroud the water, grout to fill in behind it. Every seal is another way to lose the panel, and the triple system is still the only way to the big columns.' }),
];

/** @type {readonly Item[]} */
export const ITEMS = deepFreeze([
  ...ITEMS_BITS,
  ...ITEMS_STRING,
  ...ITEMS_CASING,
  ...ITEMS_FOUNDATION,
  ...ITEMS_TRENCHLESS,
  ...ITEMS_PLANT,
  ...ITEMS_OILGAS,
  ...ITEMS_GROUND,
  ...ITEMS_SITE,
  ...ITEMS_NEWMETHODS,
]);

/* ═══════════════════════════════════════════════════════════════════════════
   REGIONS — where the work is. `groundProfile` is an ordered list of GROUND
   ids with plausible thickness ranges in metres for that geology; geology.js
   consumes it top-down to build the strata column.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @typedef {Object} Region
 * @property {string} id
 * @property {string} name
 * @property {string} country
 * @property {string} flavour
 * @property {number} unlockLevel
 * @property {number} reputationReq
 * @property {{id:string,min:number,max:number}[]} groundProfile
 * @property {string[]} applications
 * @property {number} payMult
 * @property {number} costMult        what running a job HERE costs, against a
 *        Nordic euro. `payMult` alone was the whole reason the late game ran
 *        away: revenue was multiplied by up to 3.1x for working in the Arctic
 *        while concrete, casing, grout, diesel and service stayed at Swedish
 *        prices, so the margin climbed with every region unlock and never came
 *        back down. Everything on a remote site is freighted in — the Sahara
 *        brief says "everything is trucked in, including the water you drill
 *        with" — so the cost of the euro has to travel with the price of it.
 *        Applied by economy.js to materials, flushing, crew, site set-up,
 *        upkeep and fuel; NOT to depreciation or insurance, which are
 *        properties of the machine and not of where it is parked.
 * @property {number} travelCost      EUR to mobilise a mid-size rig here
 * @property {string[]} hazards
 * @property {{clear:number,overcast:number,rain:number,snow:number,fog:number}} weather
 * @property {string[]} requiredCerts
 * @property {string[]} clients
 * @property {string} description
 * @property {number} timeOfDayBias   0..1 seed for world.timeOfDay
 *
 * ── The Drillity Talent posting defaults (PLATFORM_TRUTH Part B) ───────────
 * Where the work is decides how the work is staffed, so these four properties
 * live on the region, beside the rest of region truth. An individual contract
 * may override any of them — `buildJobPosting()` picks the actual unit and the
 * actual hitch for an `oil-rotary` well — but with no contract in hand (the
 * career screen, the region picker, a travel confirmation) these are the
 * honest defaults, and nothing else in the codebase should carry a second copy
 * of them.
 * @property {string} rotation        a ROTATION_PATTERNS value
 * @property {string} rigType         a RIG_TYPES value
 * @property {string} rigClass        a RIG_CLASSES value
 * @property {number} waterDepth      metres of water; 0 means land work.
 *                                    Resolve the band with waterDepthBand().
 * @property {{surfaceTempC:number, geothermalGradientCPerKm:number,
 *             porePressureGradientBarPerM:number}} [subsurface]
 *        What the ground under this region is actually LIKE, in pressure and
 *        temperature. It is what decides whether a well here is HPHT — a class
 *        that is a pressure and temperature envelope and never a depth. Omit it
 *        and NORMAL_SUBSURFACE applies. See wellEnvelope().
 * @property {Object<string,number>} [applicationWeights]
 *        Optional relative weight per application id when the contract board
 *        is generated. Unlisted applications weigh 1. Without it the board is
 *        decided by how many methods happen to serve each application, which
 *        makes a region advertise the wrong trade — see makeContract().
 * @property {{name:string, kind:string}[]} clientRoster
 *        WHO IS BUYING THE HOLE, and what sort of organisation they are.
 *        `clients` is derived from this — see below — so there is exactly one
 *        list of names. The `kind` is what makes a board read like a place
 *        rather than a list: a farm buys a water well, a network operator buys
 *        a duct crossing, a mine buys grade control, and picking uniformly
 *        from one flat list per region put all three names on all three jobs.
 */

/**
 * THE CLIENT VOCABULARY. `kind` is chosen from this set and nothing else, so
 * APPLICATION_CLIENT_KINDS below can be checked against it.
 *
 * `noun` is how the brief refers to them in the second person of a tender —
 * "the estate", "the network operator" — and `siteWord` is what they call the
 * place the rig stands on. Both are deliberately generic: they must stay true
 * whichever name the roster picks.
 */
const CLIENT_KINDS = deepFreeze({
  municipal:  { noun: 'the authority',           siteWord: 'the works' },
  farm:       { noun: 'the estate',              siteWord: 'the holding' },
  industrial: { noun: 'the plant',               siteWord: 'the works' },
  developer:  { noun: 'the developer',           siteWord: 'the plot' },
  contractor: { noun: 'the main contractor',     siteWord: 'the site' },
  specialist: { noun: 'the specialist',          siteWord: 'the site' },
  consultant: { noun: 'the consultant',          siteWord: 'the survey area' },
  utility:    { noun: 'the network operator',    siteWord: 'the easement' },
  transport:  { noun: 'the concession',          siteWord: 'the alignment' },
  quarry:     { noun: 'the quarry',              siteWord: 'the bench' },
  mine:       { noun: 'the mine',                siteWord: 'the level' },
  explorer:   { noun: 'the exploration company', siteWord: 'the licence block' },
  energy:     { noun: 'the operator',            siteWord: 'the pad' },
});

/**
 * Which sorts of organisation buy which application. A water well is bought by
 * a council, a farm or a works; a stope ring is bought by a mine and by nobody
 * else. This is the table that stops the same three names appearing on every
 * card of a board.
 *
 * Order matters only as a fallback: the first kind the region can actually
 * field is used when none of the preferred ones is on its roster.
 */
const APPLICATION_CLIENT_KINDS = deepFreeze({
  'foundation-piling':   ['contractor', 'developer', 'specialist'],
  'diaphragm-wall':      ['contractor', 'developer'],
  'water-well':          ['municipal', 'farm', 'industrial'],
  geothermal:            ['developer', 'municipal', 'energy'],
  mining:                ['mine'],
  tunnelling:            ['contractor', 'transport', 'mine'],
  'quarry-construction': ['quarry', 'industrial'],
  'soil-stabilisation':  ['contractor', 'developer', 'transport'],
  trenching:             ['utility', 'contractor'],
  'site-investigation':  ['consultant', 'developer', 'transport', 'contractor'],
  'oil-gas':             ['energy'],
  'utility-hdd':         ['utility', 'contractor'],
  anchoring:             ['contractor', 'transport', 'mine'],
  environmental:         ['consultant', 'industrial', 'municipal'],
  'mineral-exploration': ['explorer', 'mine'],
  // A well is bought by an operator. A marine survey house buys a survey, not a
  // batch top-hole programme, and putting it on that title was a category error.
  'offshore-marine':     ['energy'],
  'blasting-demolition': ['quarry', 'contractor', 'mine'],
  'civil-infrastructure':['transport', 'contractor', 'developer'],
});

/** @type {Object[]} */
const REGION_DEFS = [
  {
    id: 'nordic', name: 'Nordic Forest', country: 'Sweden / Finland', flavour: 'Boreal',
    unlockLevel: 1, reputationReq: 0, payMult: 1.0, costMult: 1.0, travelCost: 0, timeOfDayBias: 0.32,
    // Home ground: you sleep in your own bed and drive out in the morning.
    rotation: '5/2 (onshore week)', rigType: 'Land rig', rigClass: 'Standard', waterDepth: 0,
    // Aligned to `world/geology.js`'s own nordic recipe, which is the module
    // that draws the section: an esker gravel lens and a second, boulder-rich
    // till below it, then the weathered top of rock. The old profile carried
    // 1.5-6 m of drift where the renderer builds 5-15 m, and the difference was
    // not cosmetic — it decided that a cable-tool well could never bottom
    // anywhere but in granite, which is not a hole this method makes.
    groundProfile: [
      { id: 'topsoil', min: 0.25, max: 0.7 },
      { id: 'till', min: 2.5, max: 7 },
      { id: 'gravel', min: 0.8, max: 2.8, p: 0.55 },  // esker lens
      { id: 'till', min: 1.5, max: 5 },
      { id: 'boulder', min: 0.6, max: 1.8, p: 0.45 },
      { id: 'fracture', min: 0.5, max: 2, p: 0.8 },   // weathered top of rock
      { id: 'gneiss', min: 12, max: 55 },
      { id: 'granite', min: 20, max: 140 },
    ],
    applications: ['water-well', 'geothermal', 'site-investigation', 'foundation-piling', 'quarry-construction', 'anchoring'],
    // Home ground is a REGION, not a single clearing. The forest is where you
    // live and where the water and geothermal bores are drilled; the piling
    // and the site investigation are on plots and alignments in the towns and
    // along the rail projects between them, and the rock work is in a
    // bergtakt. Piling used to be advertised on "a forestry track an hour from
    // the nearest town", which is where a 118-tonne Kelly rig has never once
    // been sent.
    archetypes: ['well-pad', 'urban-plot', 'infrastructure-corridor', 'quarry-bench'],
    hazards: ['boulder', 'shallow-rock', 'frost-heave'],
    weather: { clear: 0.35, overcast: 0.3, rain: 0.15, snow: 0.15, fog: 0.05 },
    requiredCerts: [],
    clientRoster: [
      { name: 'Nordvind Grundläggning AB',        kind: 'contractor' },
      { name: 'Kärnvatten Brunnsborrning AB',     kind: 'specialist' },
      // Was "Sveaskog Energi", which is a real Swedish company with a word
      // added. A client name is a name on the screen and must be invented.
      { name: 'Skogsvärme Energi AB',             kind: 'energy' },
      { name: 'Baltic Geo Survey OÜ',             kind: 'consultant' },
      { name: 'Lidnäs kommun, tekniska kontoret', kind: 'municipal' },
      { name: 'Hyttmon Lantbruk AB',              kind: 'farm' },
      { name: 'Storviks Bergtäkt AB',             kind: 'quarry' },
      { name: 'Bergslagens Banprojekt AB',        kind: 'transport' },
      { name: 'Furuhamn Fastighets AB',           kind: 'developer' },
      { name: 'Vattendrag Sågverk AB',            kind: 'industrial' },
    ],
    description: 'Half a metre of forest soil, a few metres of till and then Precambrian basement — the friendliest place in the world to learn, and the fastest to punish a soft bit.',
  },
  {
    id: 'german-site', name: 'German Construction Site', country: 'Germany (Rhein-Ruhr)', flavour: 'Urban',
    unlockLevel: 6, reputationReq: 120, payMult: 1.25, costMult: 1.18, travelCost: 1800, timeOfDayBias: 0.4,
    rotation: '5/2 (onshore week)', rigType: 'Land rig', rigClass: 'Standard', waterDepth: 0,
    groundProfile: [
      { id: 'concrete', min: 0.2, max: 1.2, p: 0.7 },  // old slab / haul road
      { id: 'sand', min: 2, max: 7 },
      { id: 'gravel', min: 2, max: 9 },
      { id: 'marl', min: 4, max: 18 },
      { id: 'limestone', min: 8, max: 40 },
    ],
    applications: ['foundation-piling', 'civil-infrastructure', 'utility-hdd', 'soil-stabilisation', 'anchoring', 'environmental'],
    // A Rhein-Ruhr construction region: hoarded plots between buildings, works
    // corridors under live carriageways, and the stormwater caverns and
    // cut-and-cover boxes beneath both. The underground archetype is why a
    // jumbo, a bolter and a raise borer can still be offered here — and it is
    // now the ONLY way they can be, so none of the three can appear on a
    // surface plot.
    archetypes: ['urban-plot', 'infrastructure-corridor', 'underground-drive'],
    hazards: ['services-strike', 'noise-window', 'settlement-monitoring', 'groundwater'],
    weather: { clear: 0.28, overcast: 0.38, rain: 0.24, snow: 0.04, fog: 0.06 },
    requiredCerts: ['rig-operator-licence'],
    clientRoster: [
      { name: 'Rheinwerk Spezialtiefbau GmbH',        kind: 'specialist' },
      { name: 'Hafenbau Tiefgründung GmbH',           kind: 'contractor' },
      { name: 'Steenbergen Funderingstechniek BV',    kind: 'specialist' },
      { name: 'Continental Utility Bore BV',          kind: 'utility' },
      { name: 'Bergkamp Netzbetrieb GmbH',            kind: 'utility' },
      { name: 'Ruhrtal Verkehrsbau GmbH',             kind: 'transport' },
      { name: 'Quartier Nordstadt Projektbau GmbH',   kind: 'developer' },
      { name: 'Emschertal Umweltlabor GmbH',          kind: 'consultant' },
      { name: 'Stadt Bergkamp, Tiefbauamt',           kind: 'municipal' },
      { name: 'Westfalen Walzwerk AG',                kind: 'industrial' },
    ],
    description: 'Working inside a hoarding with a tram line on one side and a listed façade on the other. Every metre is logged, every decibel is measured.',
  },
  {
    id: 'iberian-quarry', name: 'Iberian Quarry', country: 'Spain / Portugal', flavour: 'Arid limestone',
    unlockLevel: 12, reputationReq: 350, payMult: 1.35, costMult: 1.25, travelCost: 3100, timeOfDayBias: 0.28,
    // Far enough from home to live in a pension for the week and drive back Friday.
    rotation: '6/3', rigType: 'Land rig', rigClass: 'Standard', waterDepth: 0,
    groundProfile: [
      { id: 'topsoil', min: 0.1, max: 0.5 },
      { id: 'limestone', min: 6, max: 28 },
      { id: 'karst', min: 0, max: 2.5 },
      { id: 'sandstone', min: 5, max: 22 },
      { id: 'quartzite', min: 8, max: 45 },
    ],
    applications: ['quarry-construction', 'blasting-demolition', 'mining'],
    // A working quarry with a mine under it — the benches, and the adit and
    // decline driven off the quarry floor. `civil-infrastructure` was removed
    // from the applications above at the same time as this field was added: it
    // was the keyword that put the entire foundation set, plus HDD, plus a
    // tunnel jumbo and a raise borer, on a limestone bench. A quarry has no
    // buildings to found and nothing to bore a utility crossing under.
    archetypes: ['quarry-bench', 'underground-drive'],
    hazards: ['karst-void', 'dust', 'heat', 'blast-window'],
    weather: { clear: 0.62, overcast: 0.18, rain: 0.12, snow: 0.0, fog: 0.08 },
    requiredCerts: ['shot-firing'],
    clientRoster: [
      { name: 'Lusitânia Pedreiras SA',          kind: 'quarry' },
      { name: 'Cimavera Fundaciones S.L.',       kind: 'contractor' },
      // Was "Áridos del Tajo SA" — a plausible name for a real aggregates firm
      // on a real river. Moved off the river.
      { name: 'Áridos Valdesierra SA',           kind: 'quarry' },
      { name: 'Minas de Sierra Blanca SL',       kind: 'mine' },
      { name: 'Concesionaria Vía Sur SA',        kind: 'transport' },
      { name: 'Cimenteira do Alentejo SA',       kind: 'industrial' },
      { name: 'Demoliciones Ibéricas SL',        kind: 'contractor' },
      { name: 'Promotora Costa Verde SL',        kind: 'developer' },
    ],
    description: 'Bench drilling in white dust at forty degrees. Perfect ground for a top hammer, right up to the moment the bit drops into a cave.',
  },
  {
    id: 'alpine', name: 'Alpine Tunnel Portal', country: 'Austria / Switzerland', flavour: 'Mountain',
    unlockLevel: 18, reputationReq: 600, payMult: 1.6, costMult: 1.42, travelCost: 4200, timeOfDayBias: 0.45,
    rotation: '6/3', rigType: 'Land rig', rigClass: 'Standard', waterDepth: 0,
    // Aligned to `world/geology.js`'s alpine recipe: the scree apron and the
    // shale band above the schist were missing here, and without them the
    // portal had 2.5 m of drift and nothing else — so a CFA rig, a Kelly rig,
    // a piling leader, a sonic truck and a ground investigation were all
    // refused work at a tunnel portal that in the renderer has six metres of
    // scree and till in front of it.
    groundProfile: [
      { id: 'gravel', min: 1.5, max: 5 },
      { id: 'till', min: 1, max: 4, p: 0.7 },
      { id: 'shale', min: 2, max: 7, p: 0.7 },
      { id: 'schist', min: 8, max: 38 },
      { id: 'fracture', min: 1, max: 7, p: 0.9 },
      { id: 'gneiss', min: 15, max: 70 },
      { id: 'granite', min: 20, max: 90 },
    ],
    applications: ['tunnelling', 'anchoring', 'mineral-exploration', 'civil-infrastructure', 'site-investigation'],
    // The portal apron and the headings behind it, the valley alignment the
    // tunnel is part of, and the exploration pads on the slopes above. Four
    // settings, and the reason this region can honestly carry sixteen methods.
    archetypes: ['tunnel-portal', 'underground-drive', 'infrastructure-corridor', 'exploration-pad'],
    hazards: ['rockfall', 'high-water-inflow', 'squeezing-ground', 'confined-space', 'altitude'],
    weather: { clear: 0.32, overcast: 0.28, rain: 0.16, snow: 0.16, fog: 0.08 },
    requiredCerts: ['confined-space', 'working-height'],
    clientRoster: [
      { name: 'Alpin Tunnelbau AG',              kind: 'contractor' },
      { name: 'Gotthardfels Ingenieurbau AG',    kind: 'contractor' },
      { name: 'Terrafirma Piling Ltd',           kind: 'specialist' },
      { name: 'Talquerung Basistunnel AG',       kind: 'transport' },
      { name: 'Silberkar Exploration GmbH',      kind: 'explorer' },
      { name: 'Bergbau Hochtal AG',              kind: 'mine' },
      { name: 'Institut für Alpengeotechnik AG', kind: 'consultant' },
      { name: 'Seilbahn Hochfirn Projekt AG',    kind: 'developer' },
    ],
    description: 'Probe holes and rock anchors at the portal, with a fault zone somewhere ahead that nobody has found yet. Water arrives without warning and does not stop.',
  },
  {
    id: 'sahara', name: 'Saharan Water Field', country: 'Algeria / Libya', flavour: 'Desert',
    unlockLevel: 22, reputationReq: 900, payMult: 1.9, costMult: 1.67, travelCost: 9500, timeOfDayBias: 0.22,
    // A desert land rig is a fly-in camp job: you work the full hitch and then
    // you go home for the same length of time. High-spec is the environment,
    // not the well — heat, dust and the nearest workshop a day's drive away.
    rotation: '28/28', rigType: 'Land rig', rigClass: 'High-spec / harsh environment', waterDepth: 0,
    // A hot surface over a normally-pressured basin. Even at the bottom of
    // oil-rotary's depth range this is roughly 90 °C and 250 bar — a long way
    // under the HPHT envelope, which is what makes the class honest here.
    subsurface: { surfaceTempC: 30, geothermalGradientCPerKm: 25, porePressureGradientBarPerM: 0.105 },
    // Deep enough to carry a real well: the Continental Intercalaire sandstone
    // is the thick member, and the bottom bed is always extended to the target
    // depth by buildGroundSpec, so a 40 m water bore still reads sand-and-gravel.
    groundProfile: [
      { id: 'sand', min: 6, max: 40 },
      { id: 'gravel', min: 3, max: 14 },
      { id: 'sandstone', min: 80, max: 760 },
      { id: 'shale', min: 30, max: 280 },
      { id: 'limestone', min: 60, max: 560 },
    ],
    applications: ['water-well', 'oil-gas', 'site-investigation', 'environmental'],
    // ONE archetype, deliberately. A borefield with a hydrocarbon province
    // under it is a set of graded pads and a camp — that is the whole place.
    // The variety here is meant to come from the METHOD, not the scenery, and
    // the alternative was to keep pretending a double-rotary piling rig and an
    // HDD crossing belong in an erg. Whoever renders this should not read the
    // single entry as an oversight.
    archetypes: ['well-pad'],
    // A water field with a hydrocarbon province under it. Six methods serve
    // `environmental` and one serves `oil-gas`, so without weights the board
    // fills with monitoring wells and the region never advertises what brought
    // the rigs here.
    applicationWeights: { 'water-well': 3, 'oil-gas': 4, 'site-investigation': 1, environmental: 1 },
    hazards: ['collapsing-sand', 'extreme-heat', 'sandstorm', 'remote-logistics', 'lost-circulation'],
    weather: { clear: 0.78, overcast: 0.08, rain: 0.02, snow: 0.0, fog: 0.12 },
    requiredCerts: ['first-aid', 'iwcf-well-control'],
    clientRoster: [
      { name: 'Maghreb Hydro Forage SARL',          kind: 'specialist' },
      { name: 'Sahara Water Authority',             kind: 'municipal' },
      { name: 'Trans-Erg Energy SpA',               kind: 'energy' },
      { name: 'Oued Melah Coopérative Agricole',    kind: 'farm' },
      { name: 'Hassi Nord Géoservices SARL',        kind: 'consultant' },
      { name: 'Compagnie Minérale du Grand Erg SpA',kind: 'industrial' },
      { name: 'Ténéré Camp Logistique SARL',        kind: 'contractor' },
    ],
    description: 'Three hundred metres of Continental Intercalaire sandstone under thirty metres of running dune. Everything is trucked in, including the water you drill with.',
  },
  {
    id: 'north-sea', name: 'North Sea Platform', country: 'Norway / United Kingdom', flavour: 'Offshore',
    unlockLevel: 30, reputationReq: 1800, payMult: 2.6, costMult: 2.15, travelCost: 14000, timeOfDayBias: 0.5,
    // The default posting for the basin: a fixed platform in shallow water on a
    // two-week hitch. An individual well may be offered on a jackup, a tender
    // or a moored semi-submersible instead, and `buildJobPosting()` sets the
    // water depth that unit can honestly work — a jackup stands its legs on the
    // seabed and a semi does not, so they are not interchangeable.
    rotation: '14/14', rigType: 'Platform rig', rigClass: 'High-spec / harsh environment', waterDepth: 110,
    // Cold seabed, normal gradient, normal pore pressure. Harsh environment is
    // the WEATHER and the logistics, which is a different claim from HPHT: the
    // basin's HPHT fields sit far below anything this game drills.
    subsurface: { surfaceTempC: 6, geothermalGradientCPerKm: 25, porePressureGradientBarPerM: 0.105 },
    // Seabed sand over marine clay, then the Chalk Group, then the shale and
    // the reservoir sandstone beneath it — a column that survives being drilled
    // to 2,600 m without the bottom bed having to stand in for everything.
    groundProfile: [
      { id: 'sand', min: 5, max: 25 },
      { id: 'clay', min: 40, max: 180 },
      { id: 'chalk', min: 60, max: 280 },
      { id: 'shale', min: 150, max: 620 },
      { id: 'sandstone', min: 180, max: 900 },
      { id: 'limestone', min: 120, max: 700 },
    ],
    // `civil-infrastructure` used to be listed here, and it is the reason the
    // board offered bridge foundations and highway-widening piles on a
    // platform. There is no highway on a platform. What is left is the well,
    // the offshore campaign, and the seabed geotechnical work that precedes
    // both — weighted so the region advertises the trade it exists for.
    applications: ['oil-gas', 'offshore-marine', 'site-investigation'],
    // An oil rig drills; a platform produces. The two offshore archetypes are
    // the drill floor of the fixed installation and the mobile marine unit — a
    // jack-up, a drillship or a geotechnical vessel — that does the seabed
    // boreholes. There is no third one, and in particular there is no ground
    // under the machine here at all, which is what makes an auger and a cable
    // percussion spudder impossible rather than merely unlikely.
    archetypes: ['platform-deck', 'marine-spread'],
    applicationWeights: { 'oil-gas': 9, 'offshore-marine': 9, 'site-investigation': 1 },
    hazards: ['helicopter-transfer', 'shallow-gas', 'heave', 'permit-to-work', 'cold-water-immersion'],
    weather: { clear: 0.18, overcast: 0.34, rain: 0.28, snow: 0.06, fog: 0.14 },
    // BOSIET already CONTAINS the helicopter underwater escape trainer, so
    // demanding both it and a standalone HUET asks for the same competence
    // twice. The offshore gate is the survival course and the medical.
    requiredCerts: ['bosiet', 'oguk-medical'],
    clientRoster: [
      { name: 'Vestfjord Offshore ASA',         kind: 'energy' },
      { name: 'Highland Ground Engineering Ltd',kind: 'contractor' },
      { name: 'Dogger Marine Survey Ltd',       kind: 'consultant' },
      { name: 'Nordlys Petroleum AS',           kind: 'energy' },
      { name: 'Bramble Bank Energy Ltd',        kind: 'energy' },
      { name: 'Firth Subsea Services Ltd',      kind: 'contractor' },
    ],
    description: 'Fourteen-day rotation, twelve-hour tours and a permit for every task. The day rate is extraordinary and so is the paperwork.',
  },
  {
    id: 'andes', name: 'Andean Copper Mine', country: 'Chile', flavour: 'High altitude',
    unlockLevel: 36, reputationReq: 2600, payMult: 2.3, costMult: 1.99, travelCost: 16500, timeOfDayBias: 0.3,
    rotation: '14/14', rigType: 'Land rig', rigClass: 'High-spec / harsh environment', waterDepth: 0,
    groundProfile: [
      { id: 'gravel', min: 2, max: 9 },
      { id: 'till', min: 3, max: 12, p: 0.5 },
      { id: 'schist', min: 10, max: 42 },
      { id: 'granite', min: 30, max: 150 },
      { id: 'quartzite', min: 20, max: 95 },
    ],
    applications: ['mining', 'mineral-exploration', 'tunnelling', 'anchoring', 'blasting-demolition'],
    // The pit benches, the sublevels and ore drives below them, the greenfield
    // pads out on the licence blocks, and the portals of the water and access
    // tunnels the operation depends on. That last one is what keeps jet
    // grouting honest here — it is pre-support at a portal, not treatment of a
    // mine bench.
    archetypes: ['open-pit-bench', 'underground-drive', 'exploration-pad', 'tunnel-portal'],
    hazards: ['altitude-sickness', 'seismic', 'abrasive-ground', 'shift-change-convoy', 'dust'],
    weather: { clear: 0.55, overcast: 0.2, rain: 0.08, snow: 0.12, fog: 0.05 },
    // Mine-site gates, not oil & gas ones. Well control belongs to a well.
    // Shot firing arrives with the blasting application, via APPLICATION_CERTS.
    requiredCerts: ['first-aid', 'confined-space'],
    clientRoster: [
      { name: 'Andes Perforaciones Ltda',   kind: 'specialist' },
      { name: 'Cordillera Copper SpA',      kind: 'mine' },
      { name: 'Saphir Minerals PLC',        kind: 'explorer' },
      { name: 'Minera Alto Loa SpA',        kind: 'mine' },
      { name: 'Túneles del Maipo Ltda',     kind: 'contractor' },
      { name: 'Exploraciones Puna SA',      kind: 'explorer' },
      { name: 'Áridos Cordillera Ltda',     kind: 'quarry' },
      { name: 'Concesión Vial Andina SA',   kind: 'transport' },
    ],
    description: 'Four thousand metres above sea level, where diesel engines lose a fifth of their power and so does the crew. The rock is quartz-rich and eats carbide.',
  },
  {
    id: 'arctic', name: 'Arctic Permafrost', country: 'Greenland / Svalbard', flavour: 'Polar',
    unlockLevel: 46, reputationReq: 4200, payMult: 3.1, costMult: 2.55, travelCost: 22000, timeOfDayBias: 0.14,
    // Three weeks in and three weeks out, because the flight alone is two days
    // of it. Land work on the ice: the water depth is zero and the gate is a
    // REMOTE-work gate, not an offshore one.
    rotation: '21/21', rigType: 'Land rig', rigClass: 'High-spec / harsh environment', waterDepth: 0,
    // Aligned to `world/geology.js`'s arctic recipe. The permafrost was 6-45 m
    // here against 6-18 m in the renderer, and the active layer above it and
    // the gravel below it were both missing — 25 m of frozen ground at the top
    // of the column is a wall that stops every method that does not name
    // permafrost in its own `validGround`.
    groundProfile: [
      { id: 'topsoil', min: 0.15, max: 0.5 },
      { id: 'permafrost', min: 6, max: 18 },
      { id: 'till', min: 2, max: 7 },
      { id: 'gravel', min: 1, max: 3.5, p: 0.6 },
      { id: 'basalt', min: 8, max: 22 },
      { id: 'gneiss', min: 18, max: 75 },
    ],
    applications: ['mineral-exploration', 'environmental', 'site-investigation', 'foundation-piling', 'geothermal'],
    // Fly camps and drill pads on the licence blocks, geothermal and
    // monitoring pads, and the settlement plots where foundations are piled
    // into ground that must not be allowed to thaw. "Urban plot" reads oddly
    // at this latitude and is still the right archetype: a hoarded plot in a
    // settlement, with a building going on it.
    archetypes: ['exploration-pad', 'well-pad', 'urban-plot'],
    hazards: ['whiteout', 'extreme-cold', 'thaw-collapse', 'wildlife-watch', 'medevac-distance'],
    weather: { clear: 0.24, overcast: 0.3, rain: 0.04, snow: 0.34, fog: 0.08 },
    // The transit is by helicopter, so the helicopter escape ticket is real
    // here; BOSIET is a FIXED-INSTALLATION survival course and the Norwegian
    // Offshore Medical is the NCS offshore fitness standard, and neither is
    // the certificate for a land camp in Greenland. The rest of a real remote
    // Arctic gate — wildlife watch and a remote-medical standard — has no
    // certificate in CERTS, and inventing one would be worse than omitting it.
    requiredCerts: ['first-aid', 'huet'],
    clientRoster: [
      { name: 'Polaris Arctic Drilling Ltd',            kind: 'specialist' },
      { name: 'Ísafold Resources hf',                   kind: 'explorer' },
      { name: 'Nunatak Geoscience A/S',                 kind: 'consultant' },
      { name: 'Kangerluk Minerals A/S',                 kind: 'mine' },
      { name: 'Nordfjord Kommune, teknisk forvaltning', kind: 'municipal' },
      { name: 'Svalbard Feltlogistikk AS',              kind: 'contractor' },
      { name: 'Isbjørn Eiendom AS',                     kind: 'developer' },
      { name: 'Arktisk Varmeenergi AS',                 kind: 'energy' },
      { name: 'Nordmalm Anrikningsverk A/S',            kind: 'industrial' },
    ],
    description: 'Drilling frozen ground with chilled air so you do not thaw the core you came for. Everything takes three times as long and nothing may be left behind.',
  },
];

/**
 * `clients` is DERIVED from `clientRoster`, never authored beside it. It is
 * read as a plain list of names by economy.js, and two hand-maintained lists of
 * the same names is exactly the second copy that goes stale.
 *
 * @type {readonly Region[]}
 */
export const REGIONS = deepFreeze(REGION_DEFS.map((r) => ({
  ...r,
  clients: r.clientRoster.map((c) => c.name),
})));

/* ═══════════════════════════════════════════════════════════════════════════
   CERTS — Drillity Talent certification set (DOMAIN.md §7). Offshore
   certificates come from OFFSHORE_MEDICAL_TYPES; the ground-side ones are the
   industry standards the platform also tracks.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @typedef {Object} Cert
 * @property {string} id
 * @property {string} name
 * @property {string} issuer
 * @property {number} price            EUR course fee
 * @property {number} trainingHours    in-game hours consumed
 * @property {number} validityMonths   0 = never expires
 * @property {string[]} unlocksRegions
 * @property {string[]} unlocksApplications
 * @property {number} xpBonus          flat XP on award
 * @property {number} minLevel
 * @property {string[]} prereq
 * @property {string} description
 */

/** @type {readonly Cert[]} */
export const CERTS = deepFreeze([
  { id: 'first-aid', name: 'First Aid at Work', issuer: 'National training board', price: 320, trainingHours: 16, validityMonths: 36,
    unlocksRegions: [], unlocksApplications: [], xpBonus: 150, minLevel: 2, prereq: [],
    description: 'Three days and a resuscitation dummy. Every crew needs one holder on site, and on a remote job that holder is you.' },
  // NOT "EN 791". That is a machinery safety standard — a property of the RIG,
  // demonstrated by the manufacturer — and it was withdrawn and superseded by
  // EN 16228 (Drilling and foundation equipment — Safety) in 2014. A person
  // does not hold it, cannot be trained in it and cannot let it expire. What a
  // German site actually checks at the gate is the operator's own plant licence.
  { id: 'rig-operator-licence', name: 'Drill Rig Operator Licence', issuer: 'National training board', price: 640, trainingHours: 24, validityMonths: 36,
    unlocksRegions: ['german-site'], unlocksApplications: ['civil-infrastructure'], xpBonus: 300, minLevel: 5, prereq: [],
    description: 'The plant-operator ticket for drilling machinery — the Baumaschinenführerschein a German site asks to see: guarding, rod handling, emergency stops and the daily check. The machine has its own conformity, and that is EN 16228; it belongs to the rig, not to you.' },
  { id: 'working-height', name: 'Working at Height', issuer: 'IPAF / national scheme', price: 380, trainingHours: 16, validityMonths: 36,
    unlocksRegions: [], unlocksApplications: [], xpBonus: 180, minLevel: 8, prereq: [],
    description: 'Harness, lanyard, rescue plan. The mast is a fall hazard the moment you climb it to free a rod.' },
  { id: 'confined-space', name: 'Confined Space Entry', issuer: 'National training board', price: 720, trainingHours: 24, validityMonths: 36,
    unlocksRegions: ['alpine'], unlocksApplications: ['tunnelling'], xpBonus: 420, minLevel: 14, prereq: ['first-aid'],
    description: 'Gas testing, escape sets and a standby man on the line. Underground raise and tunnel work does not start without it.' },
  { id: 'shot-firing', name: 'Shot Firing / Blasting Licence', issuer: 'Competent authority', price: 1450, trainingHours: 60, validityMonths: 60,
    unlocksRegions: ['iberian-quarry'], unlocksApplications: ['blasting-demolition'], xpBonus: 700, minLevel: 12, prereq: ['first-aid'],
    description: 'Charging, tie-in and firing. The drill pattern you produce is the blast someone else has to live with.' },
  { id: 'iwcf-well-control', name: 'IWCF Well Control', issuer: 'IWCF', price: 2450, trainingHours: 40, validityMonths: 24,
    unlocksRegions: ['sahara'], unlocksApplications: ['oil-gas'], xpBonus: 900, minLevel: 20, prereq: ['first-aid'],
    description: 'Kick detection, shut-in procedure and kill sheets. Two years of validity, and the simulator does not care how tired you are.' },
  { id: 'iadc-wellsharp', name: 'IADC WellSharp', issuer: 'IADC', price: 2280, trainingHours: 40, validityMonths: 24,
    unlocksRegions: [], unlocksApplications: ['oil-gas'], xpBonus: 880, minLevel: 26, prereq: ['iwcf-well-control'],
    description: 'The other international well-control standard, accredited and delivered worldwide. Many operators name one scheme or the other in the contract, so a driller who holds both is never turned away at the gate.' },
  { id: 'oguk-medical', name: 'OGUK Medical', issuer: 'OGUK-registered examiner', price: 260, trainingHours: 4, validityMonths: 24,
    unlocksRegions: [], unlocksApplications: ['offshore-marine'], xpBonus: 120, minLevel: 24, prereq: [],
    description: 'Fitness-to-work examination for offshore duty. Two years, and the expiry date is checked at the heliport desk.' },
  { id: 'bosiet', name: 'BOSIET', issuer: 'OPITO-approved centre', price: 1180, trainingHours: 24, validityMonths: 48,
    unlocksRegions: ['north-sea'], unlocksApplications: ['offshore-marine'], xpBonus: 620, minLevel: 26, prereq: ['oguk-medical'],
    description: 'Basic Offshore Safety Induction and Emergency Training: firefighting, sea survival and the helicopter underwater escape trainer.' },
  { id: 'huet', name: 'HUET', issuer: 'OPITO-approved centre', price: 680, trainingHours: 8, validityMonths: 48,
    unlocksRegions: ['arctic'], unlocksApplications: [], xpBonus: 340, minLevel: 20, prereq: [],
    description: 'Helicopter Underwater Escape Training, taken in a pool in a cage that is rolled upside down. It is a module inside BOSIET, and it also stands alone for people who fly to work without needing the full installation survival course — which is the ticket a remote land camp asks for.' },
  { id: 'foet', name: 'FOET', issuer: 'OPITO-approved centre', price: 540, trainingHours: 8, validityMonths: 48,
    unlocksRegions: [], unlocksApplications: ['offshore-marine'], xpBonus: 260, minLevel: 30, prereq: ['bosiet'],
    description: 'Further Offshore Emergency Training — the four-yearly refresher that keeps BOSIET alive without repeating the whole course.' },
  { id: 'opito-competence', name: 'OPITO Competence Assessment', issuer: 'OPITO', price: 1960, trainingHours: 48, validityMonths: 60,
    unlocksRegions: [], unlocksApplications: ['oil-gas', 'offshore-marine'], xpBonus: 980, minLevel: 34, prereq: ['bosiet', 'iwcf-well-control'],
    description: 'Assessed against the international drilling competence standard. It is what moves you from Driller to Senior Driller on paper as well as in fact.' },
  { id: 'eng1', name: 'ENG1 Seafarer Medical', issuer: 'MCA-approved doctor', price: 210, trainingHours: 3, validityMonths: 24,
    unlocksRegions: [], unlocksApplications: ['offshore-marine'], xpBonus: 110, minLevel: 30, prereq: [],
    description: 'The seafarer medical for marine and vessel-based work. Cheap, quick, and the job stops on the day it lapses.' },
  { id: 'norwegian-offshore-medical', name: 'Norwegian Offshore Medical', issuer: 'Norwegian Directorate of Health', price: 340, trainingHours: 4, validityMonths: 24,
    unlocksRegions: [], unlocksApplications: ['offshore-marine'], xpBonus: 190, minLevel: 40, prereq: ['oguk-medical'],
    description: 'The Norwegian sector runs its own medical standard. If the job is on the NCS, the UK certificate is not enough.' },
]);

/* ═══════════════════════════════════════════════════════════════════════════
   ROLES — the Drillity Talent career ladder (DOMAIN.md §7). `talentFunction`
   is the `job_functions.ts` value; `talentSpecialisation` the `jobTaxonomy.ts`
   specialisation id where one exists.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @typedef {Object} Role
 * @property {string} id
 * @property {string} title
 * @property {number} level
 * @property {number} dayRate                EUR/day
 * @property {string} talentFunction
 * @property {string|null} talentSpecialisation
 * @property {string} group
 * @property {{payoutMult:number,upkeepDiscount:number,contractSlots:number,crew:number,repGain:number}} perks
 * @property {string} description
 */

/** @type {readonly Role[]} */
export const ROLES = deepFreeze([
  { id: 'helper', title: 'Helper', level: 1, dayRate: 145, talentFunction: 'Apprentice', talentSpecialisation: 'laborer', group: 'Field Operations',
    perks: { payoutMult: 1.00, upkeepDiscount: 0, contractSlots: 2, crew: 0, repGain: 1.0 },
    description: 'You fetch rods, you sweep cuttings, and you learn what the machine sounds like when it is happy.' },
  { id: 'floorhand', title: 'Floorhand / Roughneck', level: 4, dayRate: 190, talentFunction: 'Apprentice', talentSpecialisation: 'floorhand-roughneck', group: 'Field Operations',
    perks: { payoutMult: 1.02, upkeepDiscount: 0.02, contractSlots: 2, crew: 0, repGain: 1.05 },
    description: 'Tongs, slips and mud. The first rung where the crew stops telling you what to do next and expects you to know.' },
  { id: 'rigger', title: 'Rigger', level: 8, dayRate: 235, talentFunction: 'Rigger', talentSpecialisation: null, group: 'Field Operations',
    perks: { payoutMult: 1.04, upkeepDiscount: 0.04, contractSlots: 3, crew: 1, repGain: 1.1 },
    description: 'Slings, shackles and mast erection. Nothing heavy moves on site without your hand signal.' },
  { id: 'derrickman', title: 'Derrickman', level: 12, dayRate: 290, talentFunction: 'Drill Rig Operator', talentSpecialisation: 'derrickman', group: 'Field Operations',
    perks: { payoutMult: 1.06, upkeepDiscount: 0.05, contractSlots: 3, crew: 1, repGain: 1.15 },
    description: 'Up the mast racking pipe and down at the pits watching the mud. Two jobs, one title, no shortage of weather.' },
  { id: 'assistant-driller', title: 'Assistant Driller', level: 16, dayRate: 345, talentFunction: 'Drill Rig Operator', talentSpecialisation: 'driller', group: 'Field Operations',
    perks: { payoutMult: 1.08, upkeepDiscount: 0.06, contractSlots: 3, crew: 2, repGain: 1.2 },
    description: 'You run the brake while the driller runs the job, and you start to feel the stratum change through the feed lever.' },
  { id: 'rig-operator', title: 'Drill Rig Operator', level: 21, dayRate: 400, talentFunction: 'Drill Rig Operator', talentSpecialisation: 'heavy-machinery-operator', group: 'Field Operations',
    perks: { payoutMult: 1.11, upkeepDiscount: 0.08, contractSlots: 4, crew: 2, repGain: 1.25 },
    description: 'The machine is yours for the shift. Setup, verticality, rod handling and the drill log all carry your name.' },
  { id: 'driller', title: 'Driller', level: 26, dayRate: 480, talentFunction: 'Drill Rig Operator', talentSpecialisation: 'driller', group: 'Field Operations',
    perks: { payoutMult: 1.14, upkeepDiscount: 0.1, contractSlots: 4, crew: 3, repGain: 1.3 },
    description: 'You decide the parameters and you own the consequences. The crew watches your hands, not the gauges.' },
  { id: 'senior-driller', title: 'Senior Driller', level: 32, dayRate: 570, talentFunction: 'Drill Rig Operator', talentSpecialisation: 'driller', group: 'Field Operations',
    perks: { payoutMult: 1.17, upkeepDiscount: 0.12, contractSlots: 5, crew: 3, repGain: 1.4 },
    description: 'The one they send to the hole nobody else finished. You have seen this formation before, and you remember what it did.' },
  { id: 'directional-driller', title: 'Directional Driller', level: 38, dayRate: 710, talentFunction: 'Drill Rig Operator', talentSpecialisation: 'directional-driller', group: 'Field Operations',
    perks: { payoutMult: 1.21, upkeepDiscount: 0.13, contractSlots: 5, crew: 4, repGain: 1.5 },
    description: 'Bent subs, tool face and survey stations. You are paid for where the bit is, not how fast it got there.' },
  { id: 'toolpusher', title: 'Toolpusher', level: 40, dayRate: 748, talentFunction: 'Foreman', talentSpecialisation: 'toolpusher', group: 'Field Operations',
    perks: { payoutMult: 1.225, upkeepDiscount: 0.14, contractSlots: 5, crew: 4, repGain: 1.55 },
    description: 'The rig is yours across both tours. You do not touch the brake any more; you decide the programme the driller runs and you sign for what it costs.' },
  { id: 'foreman', title: 'Foreman / Site Supervisor', level: 43, dayRate: 780, talentFunction: 'Foreman', talentSpecialisation: 'hdd-foreman', group: 'Field Operations',
    perks: { payoutMult: 1.24, upkeepDiscount: 0.15, contractSlots: 6, crew: 5, repGain: 1.6 },
    description: 'Two rigs, a mud crew and a client who wants a programme by Thursday. You still walk the site every morning.' },
  { id: 'site-manager', title: 'Site Manager', level: 47, dayRate: 890, talentFunction: 'Site Manager', talentSpecialisation: null, group: 'Project & Site Management',
    perks: { payoutMult: 1.27, upkeepDiscount: 0.17, contractSlots: 6, crew: 7, repGain: 1.7 },
    description: 'Sequencing, subcontractors and the concrete delivery that has not arrived. The drilling is now the easy part.' },
  { id: 'drilling-supervisor', title: 'Drilling Supervisor', level: 49, dayRate: 965, talentFunction: 'Drilling Supervisor', talentSpecialisation: 'drilling-supervisor', group: 'Field Operations',
    perks: { payoutMult: 1.285, upkeepDiscount: 0.185, contractSlots: 6, crew: 8, repGain: 1.78 },
    description: 'The operator\'s man on the rig. You carry the well programme, you approve every deviation from it, and the shut-in decision is yours to make and yours to defend.' },
  { id: 'superintendent', title: 'Drilling Superintendent', level: 51, dayRate: 1060, talentFunction: 'Foreman', talentSpecialisation: 'drilling-foreman-supervisor', group: 'Project & Site Management',
    perks: { payoutMult: 1.30, upkeepDiscount: 0.2, contractSlots: 7, crew: 10, repGain: 1.85 },
    description: 'You own the drilling programme across every site in the region, and the tool budget that goes with it.' },
  { id: 'operations-manager', title: 'Operations Manager', level: 55, dayRate: 1260, talentFunction: 'Operations Manager', talentSpecialisation: 'operations-management', group: 'Operations & Logistics',
    perks: { payoutMult: 1.33, upkeepDiscount: 0.24, contractSlots: 8, crew: 14, repGain: 2.0 },
    description: 'Fleet utilisation, mobilisation windows and the call about whether the Arctic job is worth it. It usually is.' },
  { id: 'contractor', title: 'Contractor (Own Company)', level: 60, dayRate: 1500, talentFunction: 'Executive', talentSpecialisation: 'executive', group: 'Operations & Logistics',
    perks: { payoutMult: 1.35, upkeepDiscount: 0.3, contractSlots: 10, crew: 20, repGain: 2.25 },
    description: 'Your name is on the rig, the invoice and the insurance. Everything that goes wrong is now, finally, entirely yours.' },
]);

/** Rotation patterns from drillity-mobile-magic `drilling.ts`. */
export const ROTATION_PATTERNS = deepFreeze([
  '14/14', '21/21', '28/28', '4/4', '5/2 (onshore week)', '6/3', 'Ad hoc / call-out', 'Staff / residential',
]);

/* ═══════════════════════════════════════════════════════════════════════════
   THE TALENT-NATIVE JOB FIELDS (PLATFORM_TRUTH Part B).

   Drillity Talent models rig type, rig class, water depth and rotation as
   first-class matchable fields where a generic job board has free text or
   nothing at all. An `oil-rotary` contract therefore carries them, and
   `TALENT_CONTRACT_FIELDS` is the list a screen can iterate to surface them
   generically without knowing anything about oil and gas.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Rig type — `drilling.ts`. */
export const RIG_TYPES = deepFreeze([
  'Jackup', 'Semi-submersible', 'Drillship', 'Platform rig', 'Land rig',
  'Tender-assisted', 'Barge rig',
]);

/** Rig class — `drilling.ts`. */
export const RIG_CLASSES = deepFreeze([
  'Standard', 'High-spec / harsh environment', 'Ultra-deepwater', 'HPHT',
]);

/** Water-depth bands. Metres, and the band boundaries Talent actually uses. */
export const WATER_DEPTH_BANDS = deepFreeze([
  { id: 'shallow',          name: 'Shallow',          min: 0,    max: 150 },
  { id: 'midwater',         name: 'Midwater',         min: 150,  max: 1500 },
  { id: 'deepwater',        name: 'Deepwater',        min: 1500, max: 3000 },
  { id: 'ultra-deepwater',  name: 'Ultra-deepwater',  min: 3000, max: Infinity },
]);

/** The band a water depth in metres falls into. Returns null for land work. */
export function waterDepthBand(metres) {
  if (!(metres > 0)) return null;
  for (const b of WATER_DEPTH_BANDS) if (metres > b.min && metres <= b.max) return b;
  return WATER_DEPTH_BANDS[WATER_DEPTH_BANDS.length - 1];
}

/**
 * Contract keys that carry Talent-native data. A contract that has none of
 * them is ordinary ground work; a contract that has them is a rotation-based
 * energy job and should be presented as one.
 */
export const TALENT_CONTRACT_FIELDS = deepFreeze([
  'rigType', 'rigClass', 'waterDepth', 'rotation', 'dayRate', 'wellType',
  // The pressure/temperature envelope the rig class was derived from, so a
  // screen can show WHY a well is or is not HPHT instead of asserting it.
  'envelope',
]);

/** True when a contract carries the Talent job model. */
export const isRotationJob = (contract) => !!(contract && contract.rigType);

/**
 * The Talent posting for a job, resolved in the right order of authority:
 * the contract first (an `oil-rotary` well names its own unit, class, water
 * depth, hitch and day rate), then the region it is in, then a safe default.
 *
 * This is the function the career and contract screens should call. Nothing
 * outside this file should keep its own region → rotation/rigType/rigClass
 * table; that is what `REGIONS` is for.
 *
 * @param {Object|string|null} contractOrRegionId  a contract, a region id, or null
 * @param {string} [regionIdHint]                  region id when passing a contract
 * @returns {{rotation:string, rigType:string, rigClass:string,
 *            waterDepth:number, waterBand:Object|null, waterLabel:string,
 *            dayRate:Object|null, wellType:string|null, source:string}}
 */
export function postingFor(contractOrRegionId, regionIdHint = null) {
  const contract = (contractOrRegionId && typeof contractOrRegionId === 'object')
    ? contractOrRegionId : null;
  const regionId = contract
    ? (contract.regionId || regionIdHint)
    : (typeof contractOrRegionId === 'string' ? contractOrRegionId : regionIdHint);
  const region = getRegion(regionId);

  // A contract's own water depth is an object ({metres, band, bandName}); a
  // region's is a plain number of metres. Normalise both to metres.
  const contractWater = contract && contract.waterDepth;
  const metres = contractWater && typeof contractWater === 'object'
    ? (contractWater.metres || 0)
    : (typeof contractWater === 'number' ? contractWater : (region ? region.waterDepth || 0 : 0));
  const band = waterDepthBand(metres);

  return {
    rotation:  (contract && contract.rotation)  || (region && region.rotation)  || 'Ad hoc / call-out',
    rigType:   (contract && contract.rigType)   || (region && region.rigType)   || 'Land rig',
    rigClass:  (contract && contract.rigClass)  || (region && region.rigClass)  || 'Standard',
    waterDepth: metres,
    waterBand: band,
    waterLabel: band ? `${band.name} (${metres} m)` : 'Land',
    dayRate:  (contract && contract.dayRate)  || null,
    wellType: (contract && contract.wellType) || null,
    source: contract && contract.rigType ? 'contract' : (region ? 'region' : 'default'),
  };
}

/**
 * The machine the 3D layer should actually build for a rig id.
 *
 * A rig may declare `renderRigId`: the machine to fall back to when
 * `rig/rigFactory.js` has no builder for it. `oil-derrick` carries one because
 * this table and the derrick builder were written in parallel, and a rig with
 * no builder renders an empty scene rather than failing loudly.
 *
 * Pass the factory's own `RIG_IDS` as `buildable` and the answer is exact: the
 * real machine when it can be built, the fallback when it cannot. Called with
 * one argument it returns the real id, because the factory itself already
 * refuses an unknown id safely (`setRig()` warns and keeps the current rig).
 * data.js must not import rigFactory.js — that would pull three.js into the
 * data layer — so the caller supplies the list.
 *
 * @param {string} rigId
 * @param {string[]|Set<string>|((id:string)=>boolean)} [buildable]
 *        the ids rig/rigFactory.js can actually build (its `RIG_IDS`)
 * @returns {string} a rig id that is safe to hand to the factory
 */
export function rigRenderId(rigId, buildable = null) {
  const rig = getRig(rigId);
  if (!rig) return 'crawler-lite';
  if (!rig.renderRigId) return rig.id;
  if (buildable == null) return rig.id;
  const can = typeof buildable === 'function'
    ? buildable
    : (id) => (buildable instanceof Set ? buildable.has(id) : Array.prototype.includes.call(buildable, id));
  if (can(rig.id)) return rig.id;
  return can(rig.renderRigId) ? rig.renderRigId : 'crawler-lite';
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKILLS — three branches mirroring Drillity Talent (GAMEDESIGN §4).
   Every node states a CONCRETE numeric effect the sim and the economy read by
   key. `kind:'mult'` effects are applied as (1 + perRank*ranks); `kind:'add'`
   effects are summed. Nothing here is flavour-only.
   ═══════════════════════════════════════════════════════════════════════════ */
/**
 * @typedef {Object} SkillEffect
 * @property {string} key       dotted effect key, e.g. 'groove.width'
 * @property {number} perRank
 * @property {'mult'|'add'} kind
 *
 * @typedef {Object} Skill
 * @property {string} id
 * @property {'operator'|'toolsmith'|'site-lead'} branch
 * @property {string} name
 * @property {number} maxRank
 * @property {number[]} cost        skill points per rank (index 0 = first rank)
 * @property {string[]} prereq      skill ids that need at least one rank
 * @property {number} minLevel
 * @property {SkillEffect[]} effects
 * @property {string} description
 */

const sk = (branch, id, name, maxRank, costBase, minLevel, prereq, effects, description) => ({
  id, branch, name, maxRank, minLevel, prereq, effects, description,
  cost: Array.from({ length: maxRank }, (_, i) => costBase + i),
});

/** @type {readonly Skill[]} */
export const SKILLS = deepFreeze([
  /* ── Operator: feed, rotation, the groove, rod handling ──────────────── */
  sk('operator', 'op.steady-hand', 'Steady Hand', 4, 1, 1, [],
    [{ key: 'groove.width', perRank: 0.12, kind: 'mult' }],
    'The sweet spot on the torque gauge is wider for you than it is for anyone else on the crew.'),
  sk('operator', 'op.feed-finesse', 'Feed Finesse', 4, 1, 4, ['op.steady-hand'],
    [{ key: 'wob.tolerance', perRank: 0.1, kind: 'mult' }, { key: 'jam.risk', perRank: -0.06, kind: 'mult' }],
    'You feel the bit load through the lever and back off before the gauge tells you to.'),
  sk('operator', 'op.percussion-rhythm', 'Percussion Rhythm', 5, 1, 7, ['op.steady-hand'],
    [{ key: 'rop.mult', perRank: 0.04, kind: 'mult' }],
    'Blow rate matched to the rock instead of to the throttle. Four percent a rank, and it compounds all day.'),
  sk('operator', 'op.rod-handler', 'Rod Handler', 4, 1, 10, ['op.feed-finesse'],
    [{ key: 'rodAdd.time', perRank: -0.12, kind: 'mult' }],
    'Rod in, thread started, clamp released — without looking. Every joint you save is a metre you drill.'),
  sk('operator', 'op.jam-sense', 'Jam Sense', 3, 2, 14, ['op.feed-finesse'],
    [{ key: 'jam.risk', perRank: -0.15, kind: 'mult' }, { key: 'jam.clearSpeed', perRank: 0.18, kind: 'mult' }],
    'You hear a string starting to bind a full second before it does. That second is the whole skill.'),
  sk('operator', 'op.strata-reader', 'Strata Reader', 2, 3, 18, ['op.percussion-rhythm'],
    [{ key: 'stratum.preview', perRank: 1, kind: 'add' }],
    'The drill log stops being a record and becomes a forecast: you see the next layer coming before the bit does.'),
  sk('operator', 'op.combo-keeper', 'Combo Keeper', 4, 2, 24, ['op.strata-reader'],
    [{ key: 'combo.decay', perRank: -0.18, kind: 'mult' }],
    'The groove survives a stratum change. Most drillers lose the rhythm at the interface; you do not.'),
  sk('operator', 'op.deep-focus', 'Deep Focus', 3, 4, 32, ['op.combo-keeper', 'op.jam-sense'],
    [{ key: 'groove.maxMult', perRank: 0.15, kind: 'add' }],
    'At full lock the ROP multiplier climbs past where the manual says it should stop.'),

  /* ── Toolsmith: bit life, consumables, flushing, resale ──────────────── */
  sk('toolsmith', 'ts.carbide-care', 'Carbide Care', 5, 1, 2, [],
    [{ key: 'bit.life', perRank: 0.15, kind: 'mult' }],
    'Grind at a third worn, never at two thirds. Fifteen percent more life a rank, and it is all free money.'),
  sk('toolsmith', 'ts.thread-doctor', 'Thread Doctor', 4, 1, 6, ['ts.carbide-care'],
    [{ key: 'rod.life', perRank: 0.18, kind: 'mult' }, { key: 'coupling.life', perRank: 0.18, kind: 'mult' }],
    'Grease the shoulder, torque the joint, and never run a rod that has started to neck.'),
  sk('toolsmith', 'ts.bulk-buyer', 'Bulk Buyer', 5, 1, 9, [],
    [{ key: 'consumable.price', perRank: -0.08, kind: 'mult' }],
    'You buy bits by the pallet and crowns by the crate, and the supplier has stopped arguing about it.'),
  sk('toolsmith', 'ts.flush-tuning', 'Flush Tuning', 4, 2, 13, ['ts.carbide-care'],
    [{ key: 'flush.efficiency', perRank: 0.1, kind: 'mult' }, { key: 'heat.rate', perRank: -0.06, kind: 'mult' }],
    'Enough uphole velocity to lift the cuttings, not so much that you wash the hole out. The margin is narrow.'),
  sk('toolsmith', 'ts.field-regrind', 'Field Regrind', 3, 2, 17, ['ts.thread-doctor'],
    [{ key: 'regrind.recovery', perRank: 0.12, kind: 'add' }],
    'A grinder in the back of the pickup means a dull bit becomes a working bit in twenty minutes, on site.'),
  sk('toolsmith', 'ts.hammer-service', 'Hammer Service', 4, 2, 22, ['ts.flush-tuning'],
    [{ key: 'hammer.life', perRank: 0.15, kind: 'mult' }, { key: 'upkeep.cost', perRank: -0.04, kind: 'mult' }],
    'Strip it, measure the wear sleeve, replace the check valve. A hammer serviced on schedule never surprises you.'),
  sk('toolsmith', 'ts.heat-management', 'Heat Management', 3, 3, 28, ['ts.flush-tuning'],
    [{ key: 'heat.rate', perRank: -0.14, kind: 'mult' }, { key: 'bit.life', perRank: 0.05, kind: 'mult' }],
    'Heat is what kills carbide, not impact. Keep the face cool and the buttons stay in the bit.'),
  sk('toolsmith', 'ts.salvage', 'Salvage', 3, 3, 34, ['ts.bulk-buyer', 'ts.field-regrind'],
    [{ key: 'resale.value', perRank: 0.1, kind: 'mult' }],
    'Nothing leaves the yard as scrap while it still has a thread on it and someone who needs one.'),

  /* ── Site Lead: money, logistics, crew, reputation ───────────────────── */
  sk('site-lead', 'sl.negotiator', 'Negotiator', 5, 1, 5, [],
    [{ key: 'payout.mult', perRank: 0.05, kind: 'mult' }],
    'You price the risk into the tender instead of discovering it at 40 m. Five percent a rank on every contract.'),
  sk('site-lead', 'sl.logistics', 'Logistics', 4, 1, 11, ['sl.negotiator'],
    [{ key: 'travel.cost', perRank: -0.15, kind: 'mult' }],
    'Backload the low-loader, share the mobilisation, book the ferry early. Travel stops being a tax on ambition.'),
  sk('site-lead', 'sl.crew-boss', 'Crew Boss', 4, 2, 15, ['sl.negotiator'],
    [{ key: 'upkeep.cost', perRank: -0.1, kind: 'mult' }, { key: 'rop.mult', perRank: 0.02, kind: 'mult' }],
    'A crew that knows the plan works faster and breaks less. Both halves of that show up in the accounts.'),
  sk('site-lead', 'sl.safety-first', 'Safety First', 3, 2, 19, ['sl.crew-boss'],
    [{ key: 'hazard.penalty', perRank: -0.2, kind: 'mult' }, { key: 'reputation.gain', perRank: 0.05, kind: 'mult' }],
    'Toolbox talk every morning, permit for every task. Clients notice, and so does the grade at the end of the hole.'),
  sk('site-lead', 'sl.contract-book', 'Contract Book', 3, 3, 23, ['sl.logistics'],
    [{ key: 'contract.slots', perRank: 1, kind: 'add' }],
    'More jobs on the board than you can take is the only comfortable position in this industry.'),
  sk('site-lead', 'sl.training-budget', 'Training Budget', 3, 2, 29, ['sl.safety-first'],
    [{ key: 'cert.price', perRank: -0.15, kind: 'mult' }, { key: 'cert.trainingHours', perRank: -0.1, kind: 'mult' }],
    'Certificates booked in blocks, in the quiet season, at a rate the training provider actually wants.'),
  sk('site-lead', 'sl.reputation', 'Reputation', 4, 3, 35, ['sl.contract-book'],
    [{ key: 'reputation.gain', perRank: 0.12, kind: 'mult' }],
    'The call comes to you before the job goes to tender. That is worth more than any single contract.'),
  sk('site-lead', 'sl.fuel-account', 'Fuel Account', 3, 2, 40, ['sl.crew-boss'],
    [{ key: 'fuel.cost', perRank: -0.12, kind: 'mult' }],
    'Bulk diesel, a bunkered price and a bowser on site. Twelve percent a rank off the hours you are already burning.'),
]);

/** Branch metadata for the Career screen. */
export const SKILL_BRANCHES = deepFreeze([
  { id: 'operator',  name: 'Operator',  talentGroup: 'Field Operations',            description: 'Feed, rotation, the groove and rod handling — everything that happens with your hands on the levers.' },
  { id: 'toolsmith', name: 'Toolsmith', talentGroup: 'Maintenance & Service',       description: 'Bit life, thread care, flushing and the yard. The branch that quietly pays for the other two.' },
  { id: 'site-lead', name: 'Site Lead', talentGroup: 'Project & Site Management',   description: 'Payouts, logistics, crew and reputation — the business of drilling rather than the act of it.' },
]);

/* ═══════════════════════════════════════════════════════════════════════════
   LEVELS — XP curve to 60. Generous early (level 2 inside the first hole),
   long-tailed late (the last ten levels are roughly a third of the whole
   curve). Shape: xpToNext(n) = 40n + 30 * n^1.70.
   ═══════════════════════════════════════════════════════════════════════════ */
export const MAX_LEVEL = 60;

/** XP needed to advance FROM level n TO level n+1. */
export function xpToNext(n) {
  if (n >= MAX_LEVEL) return Infinity;
  return Math.round(40 * n + 30 * Math.pow(n, 1.70));
}

const _xpToNext = [];
const _cumulative = [0];
for (let n = 1; n < MAX_LEVEL; n++) {
  _xpToNext.push(xpToNext(n));
  _cumulative.push(_cumulative[n - 1] + _xpToNext[n - 1]);
}

/** Skill points granted on reaching level n (1 per level, 2 on every 5th). */
export function skillPointsForLevel(n) {
  if (n <= 1) return 0;
  return n % 5 === 0 ? 2 : 1;
}

/** Everything that becomes available at each level, derived from the tables. */
function buildUnlockTable() {
  const table = {};
  for (let n = 1; n <= MAX_LEVEL; n++) {
    table[n] = { methods: [], rigs: [], regions: [], items: [], certs: [], role: null, skillPoints: skillPointsForLevel(n) };
  }
  for (const m of METHODS) if (table[m.unlockLevel]) table[m.unlockLevel].methods.push(m.id);
  for (const r of RIGS) if (table[r.unlockLevel]) table[r.unlockLevel].rigs.push(r.id);
  for (const r of REGIONS) if (table[r.unlockLevel]) table[r.unlockLevel].regions.push(r.id);
  for (const i of ITEMS) if (table[i.unlockLevel]) table[i.unlockLevel].items.push(i.id);
  for (const c of CERTS) if (table[c.minLevel]) table[c.minLevel].certs.push(c.id);
  for (const r of ROLES) if (table[r.level]) table[r.level].role = r.id;
  return table;
}

export const LEVELS = deepFreeze({
  max: MAX_LEVEL,
  /** index n-1 = XP to go from level n to n+1 */
  xpToNext: _xpToNext,
  /** index n-1 = total XP at the start of level n */
  cumulative: _cumulative,
  totalToMax: _cumulative[MAX_LEVEL - 1],
  unlocks: buildUnlockTable(),
});

/** Level for a total XP value. */
export function levelForXP(xp) {
  let lvl = 1;
  while (lvl < MAX_LEVEL && xp >= LEVELS.cumulative[lvl]) lvl++;
  return lvl;
}

/** HUD-ready progress inside the current level. */
export function xpProgress(xp) {
  const level = levelForXP(xp);
  if (level >= MAX_LEVEL) return { level, into: 0, need: 0, frac: 1 };
  const base = LEVELS.cumulative[level - 1];
  const need = LEVELS.xpToNext[level - 1];
  const into = xp - base;
  return { level, into, need, frac: need > 0 ? into / need : 1 };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTRACTS
   Payout is derived from real economics — metres x method rate x ground
   hardness x diameter x region multiplier — never from a random number. The
   only randomness is in WHAT the job is, not in what it is worth.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Diameter exponent used when pricing a contract. Volume-product methods scale
 * close to the square of diameter; hole-product methods barely scale at all.
 *
 * ⚠ THIS TABLE IS HALF OF A PAIR. The other half is `MATERIALS` in
 * `game/economy.js`, which scales the concrete, the casing and the grout by
 * `diaExp`. If cost scales faster than pay, the method silently turns into a
 * loss at the top of its own diameter range and looks fine at the bottom — and
 * that is precisely what killed jet grouting (pay D^1.85 against materials
 * D^2.0 and a flushing line at D^1.8 on top of it). Keep every method's
 * materials exponent at or below its pay exponent here, and if you move one,
 * move the other.
 */
export const DIA_PAY_EXPONENT = Object.freeze({
  'rotary-kelly': 1.75, cfa: 1.75, 'cased-cfa': 1.75, 'jet-grouting': 1.85,
  'raise-boring': 1.55, overburden: 1.0, sonic: 0.95,
  'cable-tool': 0.9, anchor: 0.7, core: 0.6,
  // These two were charged for diameter faster than they were paid for it, and
  // `validateData()` now says so. A 600 mm auger hole lifts nine times the
  // spoil of a 200 mm one and a 254 mm water well takes several times the
  // casing and gravel of an 85 mm one — both of which are worth more per metre
  // than a flat 0.85 / 0.8 exponent was willing to pay for.
  auger: 1.35, dth: 1.3,
  // HDD is not sold by the hole, it is sold by the pipe you pull into it, and
  // a Ø1000 crossing is not 1.3x a Ø300 one — it is several reaming passes and
  // a different machine. `research/07-hdd-trenchless.md` §A4: "0–3 reaming
  // passes; more may be required for larger diameters". At 0.9 the game priced
  // the big crossing as though the reamer were free.
  hdd: 1.25,
  // A well is sold by depth and by days, not by the size of the hole — and its
  // final hole gets SMALLER the deeper it goes, so anything but a very shallow
  // exponent here would charge a deep well twice for being deep.
  'oil-rotary': 0.25,

  /* ── The six methods of METHOD_IDS.md ────────────────────────────────────
     Four of these are barely paid for diameter at all, because what the client
     is buying is not a hole:
       rc                 a bag of chips per metre. A 146 mm hole gives a bigger
                          sample than a 124 mm one, but the assay is the product.
       tunnel-jumbo       the product is the TUNNEL. Blasthole diameter changes
                          the pattern, not the price of the drive.
       longhole           a bigger hole means fewer of them for the same tonne,
                          so diameter is nearly self-cancelling.
       rockbolt           the product is a supported metre of drive. A wider
                          hole is a WORSE bolt, not a dearer one.
       driven-pile        a bigger pile carries more load and does cost more —
                          steel and concrete both scale with section.
       site-investigation the product is the log. */
  rc: 0.35,
  'tunnel-jumbo': 0.15,
  longhole: 0.4,
  rockbolt: 0.1,
  'driven-pile': 1.3,
  'site-investigation': 0.3,
});

/**
 * The COST half of the pair above: how the concrete, casing, grout and spoil in
 * `economy.MATERIALS` scale with hole diameter. It lives here, beside the pay
 * exponent, because the two are only meaningful together — `validateData()`
 * refuses any method whose materials scale faster than its pay, which is the
 * failure that turned jet grouting into a guaranteed loss at the top of its
 * own diameter range.
 *
 * The exponent follows what the material physically is:
 *   D^2.0  a volume — concrete in a pile, grout in a jet column, mud and spoil
 *   D^1.0  a tube — casing, liner, screen: mass per metre is pi x D x wall
 *   D^0    a fixed quantity — core boxes, stemming, a well's casing programme
 * Mixed products sit in between, weighted by whichever dominates.
 */
export const MATERIAL_DIA_EXPONENT = Object.freeze({
  'oil-rotary': 0,      // a deeper well finishes in a SMALLER hole, carrying more strings
  auger: 1.3,           // spoil is a volume, but haulage and the tip fee are partly fixed
  'cable-tool': 0.9,    // temporary casing — a tube
  'top-hammer': 0,      // stemming and hole cleaning, per metre regardless
  dth: 1.25,            // casing and screen are tubes; the gravel pack is an annulus
  overburden: 1.0,      // casing left in the ground — a tube, and the whole product
  core: 0.5,            // core boxes and mud; the barrel size barely moves
  'rotary-kelly': 1.72, // concrete D^2 with a cage nearer D^1
  cfa: 1.72,
  'cased-cfa': 1.7,     // concrete, plus a casing
  anchor: 0.65,         // the hollow bar is a fixed section; only the grout annulus follows
  hdd: 1.25,            // fluid and spoil are volumes, held to the pay exponent
  sonic: 0.95,          // casing, liners and sleeves are all tubes
  'jet-grouting': 1.8,  // cement grout — a genuine volume
  'raise-boring': 1.45, // power and muck follow the volume of rock; base grouting does not
  /* The six new methods. Each is at or below its pay exponent above, which is
     what validateData() enforces. INTEGRATOR NOTE: MATERIALS in
     game/economy.js has no row for any of these six yet, so their consumables
     are currently costed at zero — the same hole oil-rotary fell through.
     These exponents are the cost half of the pair and are ready for it. */
  rc: 0.35,             // bit, hammer wear and sample bags, all near-flat in diameter
  'tunnel-jumbo': 0.15, // explosive and steel per metre of DRIVE, not per blasthole
  longhole: 0.4,        // bits and explosive; a bigger hole needs fewer of them
  rockbolt: 0.1,        // bolts, plates and resin, priced per bolt regardless of bit size
  'driven-pile': 1.3,   // the pile itself — steel and concrete scale with section
  'site-investigation': 0.3, // liners, bags, core boxes and the piezometer
});

/**
 * Hole size for an oil well, by total depth.
 *
 * A well is drilled in telescoping sections — 17 1/2 in surface, 12 1/4 in
 * intermediate, 8 1/2 in production, 6 in below a liner — so the deeper the
 * well, the SMALLER the hole it finishes in. The default diameter rule in
 * makeContract() scales around the method's nominal diameter and would happily
 * offer a 400 mm hole at 2,400 m, which is the wrong way round. Sizes are the
 * standard API bit sizes in millimetres: 445 = 17 1/2 in, 311 = 12 1/4 in,
 * 216 = 8 1/2 in, 152 = 6 in.
 */
const OIL_HOLE_SIZES = Object.freeze([
  { maxDepth: 700, sizes: [445, 311, 311] },
  { maxDepth: 1300, sizes: [311, 311, 216] },
  { maxDepth: 2000, sizes: [311, 216, 216] },
  { maxDepth: Infinity, sizes: [216, 216, 152] },
]);

/** How many holes a job of each method typically contains. */
const HOLES_PER_JOB = Object.freeze({
  auger: [2, 8], 'cable-tool': [1, 2], 'top-hammer': [8, 40], dth: [1, 4],
  overburden: [2, 10], core: [1, 3], 'rotary-kelly': [6, 30], cfa: [10, 40],
  'cased-cfa': [8, 28], anchor: [12, 60], hdd: [1, 2], sonic: [3, 12],
  'jet-grouting': [8, 30], 'raise-boring': [1, 1],
  // One well per contract. It is not a pattern of holes; it is the well.
  'oil-rotary': [1, 1],
  /* The six new methods, and for four of them a "hole" is not a hole:
       rc                 several holes on a section line.
       tunnel-jumbo       ONE heading. targetDepth is chainage, so metres are
                          metres of tunnel and multiplying them would be wrong.
       longhole           a RING. targetDepth is the sum of the fan.
       rockbolt           a DRIVE. targetDepth is metres of drive supported.
       driven-pile        ONE pile, driven to a design toe level.
       site-investigation boreholes and soundings across a site. */
  rc: [2, 8],
  'tunnel-jumbo': [1, 1],
  longhole: [1, 3],
  rockbolt: [1, 4],
  'driven-pile': [1, 1],
  'site-investigation': [3, 14],
});

/**
 * Which applications are drilling FOR something rather than merely making a
 * hole. `world/geology.js` places an ore body only when the contract asks for
 * one, so this is the switch that turns the assay track on.
 *
 * The contract asks for 'auto' rather than naming a commodity: geology.js owns
 * REGION_COMMODITIES and picks one the region plausibly hosts, and duplicating
 * that table here is exactly the kind of second copy that goes stale.
 */
const ORE_APPLICATIONS = Object.freeze(['mineral-exploration', 'mining']);

/**
 * How well the ore body is known before the rig arrives, 0..1. It is not a
 * grade and it is never printed as one — geology.js widens the dashed band on
 * the section with it, so a first-pass exploration hole shows an honest guess
 * and a grade-control hole shows something close to a boundary.
 *
 * Exploration is the low end by definition; grade control is drilling inside an
 * orebody somebody has already paid to define.
 */
const ORE_CONFIDENCE = Object.freeze({
  'mineral-exploration': [0.25, 0.55],
  mining: [0.6, 0.9],
});

/** Extra certificates demanded by the application itself. */
const APPLICATION_CERTS = Object.freeze({
  'blasting-demolition': ['shot-firing'],
  'oil-gas': ['iwcf-well-control'],
  // BOSIET contains HUET; asking for both is asking for the same competence
  // twice. See the HUET entry in CERTS.
  'offshore-marine': ['bosiet', 'oguk-medical'],
  tunnelling: ['confined-space'],
  mining: ['first-aid'],
});

/**
 * CONTRACT TITLES — scoped to the METHOD first, then to the application.
 *
 * This table used to cover seven methods; for the other fourteen the title came
 * from a per-application pool, and a pool is shared by every method that serves
 * the application. That is how **an auger contract came to be titled "Cable
 * percussion boreholes"**: `site-investigation` is an application served by
 * auger, cable-tool, core, sonic, overburden and the site-investigation rig
 * alike, and the pool named one of them. Measured over 1,815 generated cards,
 * 16.8 % carried a title owned by a different method.
 *
 * So the table is now complete: every method names its own work, in its own
 * trade's words, for every application it serves. `validateData()` enforces two
 * things about it — that the cover is total, and that no pool borrows another
 * method's vocabulary — and the second rule is what stops the original bug
 * coming back by a different route.
 */
const CONTRACT_TITLES_BY_METHOD = Object.freeze({
  auger: {
    'site-investigation': ['Hollow-stem sampling holes', 'Shallow trial holes', 'Window sample traverse'],
    environmental: ['Monitoring well installation', 'Soil sampling grid', 'Landfill gas wells'],
    'soil-stabilisation': ['Soil-mixing column trial', 'Lime column treatment'],
    'foundation-piling': ['Pre-augered pile holes', 'Pile pilot holes'],
  },
  'cable-tool': {
    'water-well': ['Shell-and-auger water well', 'Village supply borehole', 'Percussion well through boulders'],
    'site-investigation': ['Cable percussion boreholes', 'Light percussion investigation', 'Shell-and-auger trial holes'],
    environmental: ['Percussion monitoring wells', 'Made-ground sampling holes'],
  },
  'top-hammer': {
    'quarry-construction': ['Bench blast pattern', 'Quarry face drilling', 'Pre-split line, bench'],
    'blasting-demolition': ['Controlled blast holes', 'Demolition drill pattern', 'Secondary breaking holes'],
    // Not "Soil nail wall": a soil nail is 6-15 m and this method's range runs
    // to 45 m, so a deep contract advertised as a nail wall claims a nail
    // length nothing supports. A dowel and a stabilisation hole claim nothing.
    anchoring: ['Rock dowel row', 'Slope stabilisation holes', 'Face dowelling'],
    mining: ['Bench production drilling', 'Open-pit blast pattern'],
    'civil-infrastructure': ['Cutting-face pre-split', 'Rock trap holes', 'Retaining wall dowels'],
  },
  'site-investigation': {
    'site-investigation': ['Ground investigation', 'SPT programme', 'CPT sounding array', 'Geotechnical logging campaign'],
    environmental: ['Contaminated land sampling', 'Monitoring well array', 'Made-ground delineation'],
    'foundation-piling': ['Pre-piling ground investigation', 'Pile design boreholes'],
    geothermal: ['Thermal response test boreholes', 'Ground-source feasibility holes'],
  },
  dth: {
    'water-well': ['Production water well', 'Deep supply borehole', 'Irrigation well, hard rock'],
    geothermal: ['Ground-source borehole array', 'Geothermal probe field', 'Closed-loop collector holes'],
    'quarry-construction': ['Quarry production holes', 'Large-diameter bench pattern'],
    mining: ['Production blasthole pattern', 'Pit bench drilling'],
    'blasting-demolition': ['Deep blast holes', 'Trench blasting pattern'],
  },
  overburden: {
    'foundation-piling': ['Cased micropile holes', 'Duplex-drilled pile casings', 'Foundation holes through fill'],
    'water-well': ['Cased well through drift', 'Duplex water well'],
    anchoring: ['Cased anchor holes', 'Ground anchor row, cased'],
    'civil-infrastructure': ['Abutment holes through fill', 'Cased holes, bridge works'],
    environmental: ['Cased monitoring wells', 'Sealed sampling holes through fill'],
  },
  core: {
    'mineral-exploration': ['Exploration core programme', 'Diamond drilling, step-out', 'Resource definition drilling'],
    'site-investigation': ['Rotary cored boreholes', 'Cored rock investigation', 'Rock quality survey'],
    tunnelling: ['Portal probe cores', 'Cored holes on the alignment', 'Fault-zone investigation cores'],
    mining: ['Underground diamond drilling', 'Resource infill cores', 'Cored grade control'],
  },
  rc: {
    'mineral-exploration': ['RC drill programme', 'First-pass RC traverse', 'Resource infill, RC'],
    mining: ['Grade-control drilling', 'Blasthole grade control', 'RC pattern, bench'],
  },
  'rotary-kelly': {
    'foundation-piling': ['Kelly-bored pile group', 'Large-diameter bored piles', 'Pile test programme'],
    'civil-infrastructure': ['Bridge foundation works', 'Highway widening piles', 'Viaduct pier piles'],
    'diaphragm-wall': ['Secant pile wall', 'Cut-off wall panels', 'Guide wall and primary piles'],
  },
  cfa: {
    'foundation-piling': ['CFA pile foundation', 'Continuous-flight pile group', 'Piling works, CFA'],
    'civil-infrastructure': ['CFA piles, retaining wall', 'Embankment support piles', 'Culvert foundation piles'],
  },
  /* Without these, a ground-support job on a bolter was advertised out of the
     'anchoring' list as a "Soil nail wall" and a production ring as a "Bench
     blast pattern" — the right industry and the wrong trade. */
  rockbolt: {
    anchoring: ['Ground support, drive', 'Rock bolting and mesh'],
    tunnelling: ['Primary support, heading', 'Cable bolting, intersection', 'Rock support behind the face'],
    mining: ['Ground support cycle', 'Rehabilitation bolting', 'Cable bolting, stope back'],
    'civil-infrastructure': ['Rock slope stabilisation', 'Portal face support'],
  },
  'oil-rotary': {
    'oil-gas': ['Development well', 'Exploration well', 'Appraisal well',
                'Deepening and sidetrack', 'Water injection well'],
    'offshore-marine': ['Platform development well', 'Platform infill well',
                        'Subsea tie-back well', 'Batch top-hole programme'],
  },
  anchor: {
    anchoring: ['Ground anchor row', 'Self-drilling anchor pattern', 'Tie-back anchor line'],
    'foundation-piling': ['Micropile underpinning', 'Micropile group, restricted access', 'Tension pile row'],
    tunnelling: ['Portal anchors', 'Forepoling spiles, heading'],
    'civil-infrastructure': ['Retaining wall anchors', 'Bridge underpinning micropiles', 'Anchored quay wall'],
  },
  'driven-pile': {
    'foundation-piling': ['Driven pile, test pile', 'Precast driven pile', 'Driven bearing pile'],
    'civil-infrastructure': ['Bridge abutment pile', 'Cofferdam corner pile', 'Driven pile, quay wall'],
  },
  'cased-cfa': {
    'foundation-piling': ['Cased CFA pile group', 'Double-rotary piles, soft ground', 'Cased piles on the boundary'],
    'civil-infrastructure': ['Cased piles, embankment', 'Double-rotary piles under the alignment'],
    environmental: ['Cased piles through contaminated fill', 'Sealed piles, brownfield plot'],
  },
  'tunnel-jumbo': {
    tunnelling: ['Tunnel drive, drill and blast', 'Access adit', 'Cross-passage excavation'],
    'civil-infrastructure': ['Cavern excavation', 'Portal drive'],
    mining: ['Development heading', 'Decline advance', 'Ore drive, face rounds'],
  },
  hdd: {
    'utility-hdd': ['River crossing bore', 'Fibre duct installation', 'Gas main crossing'],
    trenching: ['Service duct bore', 'Crossing under the road'],
    'civil-infrastructure': ['Bore under the alignment', 'Culvert crossing, trenchless'],
    environmental: ['Horizontal remediation well', 'Sparge line under the plume'],
  },
  longhole: {
    mining: ['Stope ring drilling', 'Longhole fan, sublevel', 'Slot raise and rings'],
    'blasting-demolition': ['Production ring pattern'],
  },
  sonic: {
    environmental: ['Continuous-core environmental holes', 'Plume delineation holes', 'Made-ground coring'],
    'site-investigation': ['Sonic cored investigation', 'Continuous-sample boreholes'],
    'mineral-exploration': ['Drift sampling programme', 'Till sampling traverse'],
    geothermal: ['Collector holes through drift', 'Ground-source array, cored'],
  },
  'jet-grouting': {
    'soil-stabilisation': ['Jet grout column field', 'Ground treatment block'],
    'foundation-piling': ['Jet grout underpinning', 'Grouted raft under the footing'],
    tunnelling: ['Jet grout canopy, portal', 'Ground treatment ahead of the face'],
    'civil-infrastructure': ['Jet grout cut-off, embankment', 'Grout block under the abutment'],
  },
  'raise-boring': {
    mining: ['Underground service raise', 'Ventilation raise', 'Ore pass raise'],
    tunnelling: ['Ventilation shaft, raise bored', 'Escape shaft raise'],
    'civil-infrastructure': ['Drop shaft, raise bored', 'Surge shaft raise'],
  },
});

/**
 * WHOSE WORD IS THIS? Phrases that name one method and no other.
 *
 * `validateData()` refuses a title that carries another method's vocabulary,
 * which is the rule the auger / "Cable percussion boreholes" bug needed. Each
 * pattern has to be a phrase a driller would only use for that one method — a
 * bare "cable" is a cable bolt as well as a cable percussion rig, so the
 * pattern is "cable percussion"; a bare "auger" is a CFA flight and a
 * shell-and-auger bailer as well, so the auger patterns are the ones that only
 * belong to a flight auger rig.
 */
const METHOD_VOCAB = deepFreeze({
  auger: /\bhollow-stem\b|\bpre-augered\b|\bwindow sampl/i,
  'cable-tool': /\bcable percussion\b|\bshell-and-auger\b|\blight percussion\b/i,
  'site-investigation': /\bSPT\b|\bCPT\b|\bsounding\b|\bgeotechnical logging\b/i,
  core: /\bcored?\b|\bdiamond drilling\b|\bcore programme\b/i,
  rc: /\bRC\b|\breverse circulation\b/i,
  'rotary-kelly': /\bkelly\b|\bsecant pile\b/i,
  cfa: /\bCFA\b|\bcontinuous-flight\b/i,
  'cased-cfa': /\bdouble-rotary\b/i,
  overburden: /\bduplex\b/i,
  sonic: /\bsonic\b/i,
  'jet-grouting': /\bjet grout/i,
  'raise-boring': /\braise bored\b|\braise\b/i,
  hdd: /\bHDD\b|\btrenchless\b/i,
  'driven-pile': /\bdriven pile\b|\bprecast driven\b|\bcofferdam\b/i,
  anchor: /\bmicropile\b|\bself-drilling anchor\b|\bforepoling\b/i,
  rockbolt: /\brock bolting\b|\bcable bolting\b|\bground support\b/i,
  'tunnel-jumbo': /\bdrill and blast\b|\bface rounds?\b|\bdecline advance\b|\badit\b/i,
  longhole: /\blonghole\b|\bstope ring\b|\bproduction ring\b|\bslot raise\b/i,
  'oil-rotary': /\bsidetrack\b|\btie-back well\b|\btop-hole\b/i,
  'top-hammer': /\bpre-split\b|\brock dowel\b/i,
  dth: /\bblasthole pattern\b/i,
});

/**
 * Which rig types can honestly work which water depths, ANYWHERE.
 *
 * A jackup stands its legs on the seabed, so it is a shallow-water machine and
 * nothing else; a semi-submersible is moored or dynamically positioned and
 * starts where the jackup stops. `waterM` is [min, max] in metres, and null
 * means the rig works on land. These pairings are the accuracy that a driller
 * reading the contract board will check first.
 *
 * This table is the CLASS OF MACHINE. It is not on its own enough, because a
 * machine's global envelope says nothing about the water in front of it — see
 * `REGION_WATER_M`, which is the basin.
 */
const RIG_TYPE_WATER = Object.freeze({
  'Jackup':            [25, 140],
  'Platform rig':      [30, 150],
  'Tender-assisted':   [30, 120],
  'Barge rig':         [3, 25],
  'Semi-submersible':  [120, 900],
  'Drillship':         [400, 2600],
  'Land rig':          null,
});

/**
 * HOW DEEP THE WATER ACTUALLY IS, PER BASIN. [min, max] metres.
 *
 * `RIG_TYPE_WATER` on its own advertised **North Sea semi-submersible postings
 * in up to 900 m of water**, because the semi's global envelope was rolled
 * without ever asking what was under it. The North Sea does not have 900 m
 * anywhere, and it has nothing like it where wells are drilled.
 *
 *   - **20 m** at the shallow end: the southern North Sea gas basin, "with
 *     water depths of around 15-30 metres", is jack-up country
 *     (BSH, the German federal maritime and hydrographic agency,
 *     https://www.bsh.de/EN/TOPICS/Monitoring_systems/State_of_the_North_Sea/state_of_the_north_sea_node.html).
 *   - **400 m** at the deep end. The Norwegian Offshore Directorate's own
 *     exploration-wellbore register (2,199 wellbores,
 *     https://factpages.sodir.no/en/wellbore/tableview/exploration/all) puts
 *     every North Sea wellbore between 48 m and 410 m, median 116 m, with 75 %
 *     under 200 m. The deepest is 410 m — well 34/3-1 S, semi-submersible,
 *     2008. The deepest permanently installed semi-submersible production
 *     facility in the basin is Gjoa at 360 m
 *     (https://www.norskpetroleum.no/en/facts/field/gjoa/).
 *
 * THE TRAP THIS AVOIDS, TWICE OVER. The sea's own maximum really is about
 * **700 m** (BSH; OSPAR Region II, "depths not exceeding 700 m"), but that is
 * the **Norwegian Trench**, a trough inshore of the shelf where nobody drills —
 * so 700 m is a fact about the sea and a lie about a drilling contract. And the
 * genuinely deep "North Sea" numbers in the trade press (1,100 m, 1,500 m) are
 * **West of Shetland and the Faroe-Shetland Channel** — the Atlantic Margin,
 * a different basin.
 *
 * The region's own `waterDepth` (110 m, the fixed-platform standing depth) sits
 * inside this window, and `validateData()` checks that it does.
 */
const REGION_WATER_M = Object.freeze({
  'north-sea': [20, 400],
});

/** Rig types a region can plausibly field, in the order they are offered. */
const REGION_RIG_TYPES = Object.freeze({
  'north-sea': ['Jackup', 'Platform rig', 'Semi-submersible', 'Tender-assisted'],
  sahara: ['Land rig'],
});

/**
 * The water a given unit can be posted into IN A GIVEN BASIN: what the class of
 * machine can work, intersected with what is actually out there.
 * @returns {[number, number]|null} null for a land machine.
 */
function waterWindow(rigType, regionId) {
  const band = RIG_TYPE_WATER[rigType];
  if (!band) return null;
  const basin = REGION_WATER_M[regionId];
  if (!basin) return band;
  return [Math.max(band[0], basin[0]), Math.min(band[1], basin[1])];
}

/**
 * …and which of those units the SITE actually is. The region says what sails in
 * the basin; the archetype says which one you are standing on, and the two were
 * rolled independently until the archetype layer landed — so the board offered
 * "a platform infill well on a platform rig" at a MARINE SPREAD and "a platform
 * development well on a semi-submersible" at the PLATFORM DECK, in the same
 * region, in the same board.
 *
 * A `platform-deck` is a FIXED INSTALLATION: it is bolted to the seabed at the
 * region's own water depth, so its depth is not rolled either — a fixed
 * platform standing in 800 m of water is not a thing.
 */
const ARCHETYPE_RIG_TYPES = Object.freeze({
  'platform-deck': ['Platform rig', 'Tender-assisted'],
  'marine-spread': ['Jackup', 'Semi-submersible', 'Drillship', 'Barge rig'],
  'well-pad': ['Land rig'],
});

/** Rotation patterns a region actually runs (values from ROTATION_PATTERNS). */
const REGION_ROTATIONS = Object.freeze({
  'north-sea': ['14/14', '21/21'],
  sahara: ['28/28', '4/4', '6/3'],
});

/** Day rate, EUR, for the position a well is advertised against. */
const OIL_DAY_RATE_BASE = Object.freeze({
  'Assistant Driller': 620, Driller: 720, Toolpusher: 1080,
});
const RIG_CLASS_RATE_MUL = Object.freeze({
  Standard: 1.0, 'High-spec / harsh environment': 1.18,
  'Ultra-deepwater': 1.32, HPHT: 1.28,
});

/** Vessel-based rigs are crewed under the marine medical, not just the OGUK one. */
const VESSEL_RIG_TYPES = Object.freeze(['Semi-submersible', 'Drillship', 'Barge rig']);

/**
 * HPHT IS NOT A DEPTH.
 *
 * It is a pressure and temperature classification, and the industry line is a
 * shut-in pressure above 10,000 psi (≈ 690 bar) OR a bottom-hole temperature
 * above 300 °F (≈ 150 °C) — either one on its own is enough. A shallow, hot
 * geothermal well can be HPHT; a deep, cold, normally-pressured well is not.
 *
 * The board used to set the class from `targetDepth >= 1900`, which advertised
 * every well below 1,900 m as HPHT, including North Sea wells where it also
 * overrode the correct harsh-environment class. `rigClass` is a first-class
 * Drillity Talent field (PLATFORM_TRUTH Part B), so getting it wrong is a claim
 * about a real data model in front of a driller who holds the well-control
 * ticket that goes with it.
 */
const HPHT_SHUT_IN_BAR = 690;     // 10,000 psi
const HPHT_BOTTOM_HOLE_C = 150;   // 300 °F

/**
 * The normal subsurface: a normal continental geothermal gradient and a normal
 * hydrostatic pore-pressure gradient (1.0 sg ≈ 0.105 bar/m). A region that
 * genuinely sits over an overpressured or a high-temperature play declares its
 * own `subsurface` and the envelope follows it.
 */
const NORMAL_SUBSURFACE = Object.freeze({
  surfaceTempC: 10,
  geothermalGradientCPerKm: 25,
  porePressureGradientBarPerM: 0.105,
});

/**
 * Bottom-hole temperature and shut-in pressure for a well of this depth in this
 * region, and whether that envelope is HPHT.
 *
 * With a normal gradient nothing inside `oil-rotary`'s 2,400 m range reaches
 * either threshold — roughly 66–90 °C and 250 bar at the bottom of it — which
 * is the correct answer, and exactly why the old depth rule was wrong: real
 * HPHT wells are far deeper than the game drills, or far hotter than normal
 * ground gets.
 *
 * @param {Region|null} region
 * @param {number} totalDepthM
 * @returns {{bottomHoleC:number, shutInBar:number, hpht:boolean}}
 */
export function wellEnvelope(region, totalDepthM) {
  const s = { ...NORMAL_SUBSURFACE, ...((region && region.subsurface) || {}) };
  const depth = Math.max(0, Number(totalDepthM) || 0);
  const bottomHoleC = s.surfaceTempC + s.geothermalGradientCPerKm * (depth / 1000);
  const shutInBar = s.porePressureGradientBarPerM * depth;
  return {
    bottomHoleC: +bottomHoleC.toFixed(1),
    shutInBar: Math.round(shutInBar),
    hpht: shutInBar >= HPHT_SHUT_IN_BAR || bottomHoleC >= HPHT_BOTTOM_HOLE_C,
  };
}

/**
 * The Drillity Talent half of an oil & gas contract: rig type, rig class,
 * water-depth band, rotation pattern and the advertised day rate.
 *
 * Returns an empty object for every method that is not `oil-rotary`, so an
 * ordinary ground contract is unchanged.
 *
 * @returns {{rigType?:string, rigClass?:string, waterDepth?:Object,
 *            rotation?:string, dayRate?:Object, wellType?:string}}
 */
function buildJobPosting(method, region, applicationId, targetDepth, rand, archetypeId = null) {
  if (method.id !== 'oil-rotary') return {};

  // The unit has to be the unit the SITE is. See ARCHETYPE_RIG_TYPES.
  const inRegion = REGION_RIG_TYPES[region.id] || ['Land rig'];
  const onSite = ARCHETYPE_RIG_TYPES[archetypeId];
  const types = onSite ? inRegion.filter((t) => onSite.includes(t)) : inRegion;
  const rigType = rand.pick(types.length ? types : inRegion);

  // What this class of unit can work, INTERSECTED WITH THE BASIN. Rolling the
  // class envelope alone is what posted a North Sea semi in 900 m of water.
  const waterRange = waterWindow(rigType, region.id);
  let waterDepth = null;
  if (waterRange) {
    // A fixed installation stands where it stands: the region's own depth, not
    // a roll. Everything else is mobile and brings its own.
    const metres = archetypeId === 'platform-deck' && region.waterDepth > 0
      ? Math.round(region.waterDepth)
      : Math.round(rand.range(waterRange[0], waterRange[1]) / 5) * 5;
    const band = waterDepthBand(metres);
    waterDepth = { metres, band: band ? band.id : 'shallow', bandName: band ? band.name : 'Shallow' };
  }

  // Class follows the WELL and the ENVIRONMENT, never the marketing and never
  // the depth. HPHT is the pressure/temperature envelope the ground actually
  // has (see wellEnvelope); ultra-deepwater is the water the unit is standing
  // in; otherwise the class is whatever the region itself is — the North Sea
  // is a harsh-environment basin and is not deep water, so an ultra-deepwater
  // unit is never offered there.
  const envelope = wellEnvelope(region, targetDepth);
  let rigClass;
  if (envelope.hpht) rigClass = 'HPHT';
  else if (waterDepth && waterDepth.band === 'ultra-deepwater') rigClass = 'Ultra-deepwater';
  else rigClass = region.rigClass || 'Standard';

  const rotation = rand.pick(REGION_ROTATIONS[region.id] || ['5/2 (onshore week)']);

  // The POSITION the well is advertised against, which does scale with the
  // size of the spread and therefore with depth. This is a staffing choice,
  // not a well classification — it says nothing about pressure or temperature.
  const role = targetDepth >= 1900 ? 'Toolpusher' : targetDepth >= 900 ? 'Driller' : 'Assistant Driller';
  const landMul = rigType === 'Land rig' ? 0.72 : 1;
  const amount = Math.round(
    OIL_DAY_RATE_BASE[role] * (RIG_CLASS_RATE_MUL[rigClass] || 1) * landMul / 5) * 5;

  const wellTitles = (CONTRACT_TITLES_BY_METHOD['oil-rotary'] || {})[applicationId];
  const wellType = wellTitles ? rand.pick(wellTitles) : 'Development well';

  return {
    rigType, rigClass, waterDepth, rotation, wellType, envelope,
    dayRate: { amount, currency: 'EUR', role },
  };
}

/**
 * Weighted 0..1 hardness index of a ground column. 0.6 UCS / 0.4 abrasivity,
 * thickness-weighted. Used for ROP estimation, payout and difficulty.
 * @param {{id:string,thickness:number}[]} groundSpec
 */
export function groundHardness(groundSpec) {
  let total = 0, acc = 0;
  for (const layer of groundSpec) {
    const g = GROUND[layer.id];
    if (!g) continue;
    const t = Math.max(0.01, layer.thickness);
    const normUcs = Math.min(g.ucs / 300, 1);
    acc += t * (0.6 * normUcs + 0.4 * g.abrasivity);
    total += t;
  }
  return total > 0 ? clamp(acc / total, 0, 1) : 0.4;
}

/** Mean abrasivity of a ground column — drives consumable burn rate. */
export function groundAbrasivity(groundSpec) {
  let total = 0, acc = 0;
  for (const layer of groundSpec) {
    const g = GROUND[layer.id];
    if (!g) continue;
    const t = Math.max(0.01, layer.thickness);
    acc += t * g.abrasivity; total += t;
  }
  return total > 0 ? clamp(acc / total, 0, 1) : 0.5;
}

/**
 * Realistic time estimate for a job: drilling + per-hole setup + tripping, and
 * for HDD the reaming and pullback passes that follow the pilot.
 * @returns {number} hours
 */
export function estimateHours(methodId, metres, hardness, holes = 1) {
  return estimateHoursBreakdown(methodId, metres, hardness, holes).total;
}

/**
 * The same estimate, split into the hours a sharper tool can shorten and the
 * hours it cannot.
 *
 * `settleRun` divides the job by the bit's `ropMult`, and it was dividing ALL
 * of it — so a premium crown made the rig track between blastholes faster,
 * made the mast go up faster, and made a casing string run faster. On a
 * lump-sum contract that is free money, compounding with every other endgame
 * multiplier: buy the best bit in the shop and the whole job shrinks by up to
 * 2.6x while the payout does not move. A bit speeds up cutting rock. That is
 * all it does.
 *
 * @returns {{drill:number, flat:number, total:number}} hours
 */
export function estimateHoursBreakdown(methodId, metres, hardness, holes = 1) {
  const m = getMethod(methodId);
  if (!m) return { drill: metres / 10, flat: 0, total: metres / 10 };
  const rop = Math.max(0.15, m.nominalRop * (1.35 - 0.7 * hardness));
  const drillHours = metres / rop;
  const setupPerHole = m.setupPerHole ?? (0.4 + m.difficulty * 0.28);
  const joints = metres / Math.max(1, m.rodLength);
  const tripHours = joints * 0.035;

  // The pilot bore is not the job. `research/07-hdd-trenchless.md` §A4 puts the
  // reaming at 0–3 passes plus a swab pass at the pull size, and §A5 puts the
  // pullback itself at 0.30–0.61 m/min — call it 27 m/h, slower than the pilot.
  // Charging only the pilot made HDD look like the fastest money in the game.
  // The reaming passes cut ground, so they scale with the tool; the pullback
  // is a winch pulling pipe and does not.
  const reamHours = m.reamPasses ? drillHours * m.reamPasses * 0.55 : 0;
  const pullbackHours = m.reamPasses ? metres / 27 : 0;

  const drill = drillHours + reamHours;
  const flat = holes * setupPerHole + tripHours + pullbackHours;
  return { drill, flat, total: drill + flat };
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE BOARD'S OWN VOCABULARY

   The contract board is the game's main menu. It is where the player spends
   most of their decision-making, and five cards that differ only in payout are
   not a choice — they are a list. Everything from here to makeContractBoard()
   exists to make five cards read as five different jobs, and every claim in
   them true for the method it belongs to.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * WHAT ONE OF THEM IS. `holes` counts these, and for eight methods a "hole" is
 * not a hole: a driven pile is a pile, a longhole contract is a ring, a bolting
 * contract is a length of drive and a jumbo contract is one heading.
 *
 * METHOD_IDS.md is explicit that the new methods carry their own units, and a
 * card that offers "40 m" means five different jobs across them. This table and
 * SCOPE_LINE below are what make the copy say which.
 */
const UNIT_NOUN = Object.freeze({
  auger: 'hole', 'cable-tool': 'hole', 'top-hammer': 'hole', dth: 'hole',
  overburden: 'hole', core: 'hole', rc: 'hole', sonic: 'hole',
  'site-investigation': 'position',
  'rotary-kelly': 'pile', cfa: 'pile', 'cased-cfa': 'pile', 'driven-pile': 'pile',
  anchor: 'anchor', 'jet-grouting': 'column', 'raise-boring': 'raise',
  rockbolt: 'drive', longhole: 'ring', 'tunnel-jumbo': 'heading',
  hdd: 'bore', 'oil-rotary': 'well',
});

/**
 * Methods whose hole starts at a level UNDERGROUND rather than at the surface.
 *
 * The column a contract carries is a surface column walked down from ground
 * level, and for these four it is not what the machine drills: a face round, a
 * production ring, a bolt pattern and a raise are all collared in rock at the
 * level. buildGroundColumn() therefore drops the drift for them, which is also
 * why "a tunnel drive through Glacial Till" no longer appears on the board.
 */
const UNDERGROUND_METHODS = deepFreeze(['rockbolt', 'longhole', 'tunnel-jumbo', 'raise-boring']);

/**
 * THE HOLE HAS TO BOTTOM IN GROUND THE METHOD CAN DRILL.
 *
 * Measured over 1,815 generated cards, **30.7 % of contracts ended in a bed
 * outside their own method's `validGround`** — auger holes bottoming in gneiss,
 * driven piles finishing in schist, cable-tool wells ending in granite. The
 * column is built from the region's profile and the bottom bed was simply
 * extended to the target depth, whatever it happened to be.
 *
 * This table is the other half of the fix: how much ground outside its own list
 * a method routinely gets through before it starts working. Above the
 * allowance, a bed it cannot drill stops the hole; below it, the bed is a slab
 * broken out or a drift cased off, and the hole carries on.
 *
 *   1.5 m   soil and pile methods — an old slab, a haul-road crust, a metre of
 *           made ground. Broken out or cored through before the rig sets up.
 *   15 m    surface rock methods that routinely pre-collar or case through the
 *           drift to reach the rock they came for.
 *   ∞       overburden drilling, where getting through the drift IS the method
 *           (the casing advances with the bit), and a well, which is drilled
 *           with a conductor and surface casing through everything above the
 *           section it is logging.
 *   0       the underground four, which never see the drift at all.
 */
const PRE_COLLAR_M = Object.freeze({
  auger: 1.5, 'cable-tool': 1.5, cfa: 1.5, 'cased-cfa': 1.5, 'rotary-kelly': 1.5,
  'driven-pile': 1.5, 'jet-grouting': 1.5, sonic: 1.5, 'site-investigation': 1.5,
  hdd: 1.5,
  'top-hammer': 15, dth: 15, core: 15, rc: 15, anchor: 15,
  overburden: Infinity, 'oil-rotary': Infinity,
  // The underground four never see the drift — buildGroundColumn() strips it —
  // so this is not a pre-collar for them. It is the weak or fractured band
  // INSIDE the rock mass that a heading, a ring or a raise goes through on a
  // bad day rather than stops at. Six metres of it is the most that is
  // credible; past that the ground really is the end of the drive.
  rockbolt: 6, longhole: 6, 'tunnel-jumbo': 6, 'raise-boring': 6,
});

/**
 * The same six metres, as a value rather than four copies of it, because it is
 * a property of being UNDERGROUND and not of being one of those four methods.
 * A core rig set up in a drive gets it too.
 */
const UNDERGROUND_WEAK_BAND_M = 6;

/**
 * OFFSHORE, THE SOFT SECTION IS CASED — SO THE PRE-COLLAR IS NOT A LIMIT.
 *
 * The allowance above is a property of the METHOD. This one is a property of
 * the PLACE, the same way `UNDERGROUND_WEAK_BAND_M` is: an offshore archetype
 * has no ground under the machine at all. The hole starts at the mudline and is
 * advanced inside a conductor or a drill casing run from the unit, so the soft
 * sediments above the target are supported rather than drilled open — which is
 * the same physical reason `overburden` and `oil-rotary` are already Infinity.
 *
 * WHAT THIS FIXED. The North Sea was down to two methods. `core` is
 * archetype-legal there — the region's `marine-spread` is the jack-up or the
 * geotechnical vessel, and the only application it shares with the basin is
 * `site-investigation` — but the basin's profile puts roughly 125 m of seabed
 * sand and marine clay above the first bed a core barrel can bottom in, against
 * a 15 m surface pre-collar. Offshore geotechnical boreholes are cased through
 * exactly that section, so it was the ALLOWANCE that was wrong, not the pairing.
 *
 * What comes back is deliberately narrow: seabed geotechnical coring from a
 * mobile marine unit. It is not a mineral-exploration diamond rig on a
 * production deck — `core` does not declare `platform-deck`, the North Sea does
 * not buy `mineral-exploration`, and `validateData()` now refuses any method on
 * a platform deck that is not there for the well. research/17 §2 draws that
 * distinction and marks the geotechnical vessel's own deck layout NOT SOURCED,
 * so nothing here describes one.
 */
const OFFSHORE_PRE_COLLAR_M = Infinity;

/**
 * The ground a method may pass through before it stops, AT THIS SITE.
 *
 * Three planes, three answers, and the plane decides — a core rig gets the
 * surface figure on an exploration pad, the weak-band figure in a drive and the
 * cased-through figure on a marine spread, without `core` having to know which.
 *
 * @param {Method} method
 * @param {string|null} archetypeId  a SITE_ARCHETYPES id, or null for "surface"
 */
export function preCollarFor(method, archetypeId) {
  const arch = archetypeId ? getArchetype(archetypeId) : null;
  if (arch && arch.plane === 'underground') return UNDERGROUND_WEAK_BAND_M;
  if (arch && arch.plane === 'offshore') return OFFSHORE_PRE_COLLAR_M;
  return PRE_COLLAR_M[method.id] ?? 1.5;
}

/**
 * Methods whose `targetDepth` is the VERTICAL DEPTH OF A HOLE, so the ground
 * column has to actually be that deep for the job to exist.
 *
 * For the other four it is a length measured along something else — an HDD bore
 * length, a jumbo's chainage, a bolting contract's metres of drive, a longhole
 * ring's total — and comparing any of those to a depth is a category error. A
 * 400 m HDD bore may never be more than six metres below the surface.
 */
export const DEPTH_IS_VERTICAL = deepFreeze([
  'auger', 'cable-tool', 'top-hammer', 'site-investigation', 'dth', 'overburden',
  'core', 'rc', 'rotary-kelly', 'cfa', 'oil-rotary', 'anchor', 'driven-pile',
  'cased-cfa', 'sonic', 'jet-grouting', 'raise-boring',
]);

/**
 * A BLAST HOLE IS AS DEEP AS THE BENCH, NOT AS DEEP AS THE RIG.
 *
 * `dth` is rated 20-300 m because it drills deep water and geothermal wells,
 * and it shared that one range with every application it serves — so the board
 * generated a **259 m "Deep blast holes"** contract on a quarry bench. Measured
 * over 32,000 cards, EVERY dth quarry, pit or demolition job came out between
 * 105 and 300 m. Nobody drills a 259 m blast hole.
 *
 * The depth of a production blast hole is set by the bench it is drilled from,
 * plus the sub-drill below grade, and neither has anything to do with what the
 * machine could reach:
 *
 *   - 8 m limestone-quarry bench, 110 mm holes: holes **3.5-10.5 m**
 *     (Sci. Rep. 2025, https://pmc.ncbi.nlm.nih.gov/articles/PMC11833129/)
 *   - Kevitsa open pit: "the height of the bench is **12 m**, and the common
 *     subdrilling length is **1.5 m**" → 13.5 m holes at 165/229 mm
 *     (Rock Mech. Rock Eng. 2025, https://doi.org/10.1007/s00603-025-04683-6)
 *   - Aitik open-pit copper: 15 m bench + 1.5 m sub-drill → ~16.5 m at 311 mm
 *     (https://www.diva-portal.org/smash/get/diva2:1003683/FULLTEXT01.pdf)
 *   - Kose et al. 2005, J. SAIMM 105(2): hole depth is a flat **1.10 x bench
 *     height** across 10-25 m benches, and "the most economical bench height
 *     has been found to be 15 m"
 *     (https://www.saimm.co.za/Journal/v105n02p127.pdf)
 *   - OSMRE Module 4 (US federal): rotary blasthole "optimal hole depths range
 *     from 15 to 150 feet (typical) and **average from 30 to 60 feet**" — i.e.
 *     9-18 m for the average hole
 *     (https://www.osmre.gov/sites/default/files/inline-files/Module4.pdf)
 *   - USBR Engineering Geology Field Manual Vol. 2 Ch. 19: for construction
 *     blasting "the normal drilling depth is **less than 40 feet (12 m)**", and
 *     "there is no real advantage to a high bench"
 *     (https://www.usbr.gov/tsc/techreferences/mands/geologyfieldmanual-vol2/Chapter19.pdf)
 *
 * 5-20 m spans all of that with nothing invented at either end. NOT SOURCED,
 * and therefore not encoded: a non-vendor maximum hole depth for surface DTH,
 * and any numeric regulatory bench-height cap — 30 CFR 56.3130 sets none, and
 * HSE L118 only makes a face over 15 m in competent rock trigger a geotechnical
 * assessment rather than forbidding it.
 *
 * Note the window's FLOOR is deliberately below `dth`'s own 20 m: a 4 m quarry
 * hole is the commonest blast hole there is, and the 20 m figure is the bottom
 * of the machine's WELL range. The ceiling is never allowed above the method's
 * own rating — see `depthWindow()`.
 *
 * "Deep blast holes" survives as a title on purpose. In blasting, a deep hole
 * is one drilled the full height of the face, top to bottom, as against shallow
 * pop-shooting; it does not mean a deeper hole than the bench.
 */
const BLAST_PATTERN_DEPTH_M = Object.freeze([5, 20]);

/**
 * The applications whose product is a blast pattern, and the two surface
 * percussion methods that drill one. `top-hammer` is here for the same reason
 * as `dth` — its 3-45 m rating is a rock-drilling range, and 45 m is well past
 * the 18-24 m that is the practical ceiling for a top-hammer string anyway.
 *
 * Keyed method-then-application, like `CONTRACT_TITLES_BY_METHOD`, because the
 * application alone is not enough: `mining` is also served by `core`, `rc`,
 * `longhole` and `raise-boring`, whose holes are nothing like a blast hole and
 * must not be capped at a bench height.
 */
const BLAST_PATTERN_APPLICATIONS = deepFreeze([
  'quarry-construction', 'mining', 'blasting-demolition',
]);

/**
 * …and the methods that actually drill one, at the surface. The application is
 * not enough on its own: `mining` is also served by `core`, `rc`, `longhole`
 * and `raise-boring`, and a resource infill core is not a blast hole. The two
 * underground blasting methods are not here either — a `tunnel-jumbo`'s number
 * is chainage and a `longhole` ring's is ring metres, neither of which is a
 * hole depth (see DEPTH_IS_VERTICAL).
 */
const BLAST_PATTERN_METHODS = deepFreeze(['top-hammer', 'dth']);

/**
 * A SEABED BOREHOLE IS DRILLED FOR A FOUNDATION, NOT FOR A RESOURCE.
 *
 * The archetype-aware pre-collar (see `OFFSHORE_PRE_COLLAR_M`) put offshore
 * geotechnical coring back on the board, and it arrived at **214-600 m below
 * the seabed** — because the North Sea profile carries roughly 125 m of sand
 * and marine clay above the Chalk Group, so the first bed a core barrel can
 * bottom in is already deep, and nothing then stopped the hole running on into
 * the section below it. A 550 m borehole off a jack-up is a well, not a site
 * investigation.
 *
 * What research/16 §A.12 sources for this spread:
 *   - *"Fixed offshore wind farms require geotechnical data to depths of 50 to
 *     70 m"*, while cable routes are investigated to 5 m `[FLOATGUIDE]`
 *   - seabed drills reach *"penetration up to 150 m below seabed"*
 *     `[ACTEON-PROD]`, `[OE-SEABED]`
 *   - a mobilisable heave-compensated rig on a vessel of opportunity is
 *     published as able *"to drill to 500m"* `[GARD-DRILL]`
 *
 * 50 m is `[FLOATGUIDE]`'s own floor. The 250 m ceiling is a bounded choice,
 * not a sourced figure, and it is written down as one: it is set so the hole
 * always reaches the shallowest rock this basin offers — the region's own
 * profile tops the Chalk out at 205 m — while staying at half of the 500 m a
 * geotechnical spread is published as reaching. It is deliberately deeper than
 * the 150 m seabed-drill figure because a seabed drill is a different machine
 * from the drilled borehole this method models.
 *
 * STILL WRONG, AND NOT FIXED HERE: most real offshore geotechnical boreholes
 * bottom IN the clay, sampled rather than cored, and `core.validGround` has no
 * clay — which is why the shallowest hole this can generate is still ~130 m.
 * Making that right is a change to what a core barrel is allowed to drill, not
 * a depth cap, and it is flagged rather than guessed at.
 */
const OFFSHORE_GEOTECH_CORE_M = Object.freeze([50, 250]);

/**
 * method → application → the depth window that job has.
 *
 * A value is EITHER a `[lo, hi]` pair that applies at every site the pairing can
 * reach, OR an object keyed by `SITE_ARCHETYPES` id, for a trade that is a
 * different job in a different place. A site the object does not name keeps the
 * method's own `depthRange`.
 *
 * Keyed method-then-application, like `CONTRACT_TITLES_BY_METHOD`, because the
 * application alone is not enough: `mining` is also served by `core`, `rc`,
 * `longhole` and `raise-boring`, whose holes are nothing like a blast hole and
 * must not be capped at a bench height.
 */
const DEPTH_BY_METHOD_APPLICATION = Object.freeze({
  'top-hammer': Object.freeze({
    'quarry-construction': BLAST_PATTERN_DEPTH_M,
    mining: BLAST_PATTERN_DEPTH_M,
    'blasting-demolition': BLAST_PATTERN_DEPTH_M,
  }),
  dth: Object.freeze({
    'quarry-construction': BLAST_PATTERN_DEPTH_M,
    mining: BLAST_PATTERN_DEPTH_M,
    'blasting-demolition': BLAST_PATTERN_DEPTH_M,
  }),
  // Only offshore. A cored rock investigation along a land alignment or ahead
  // of a portal is the method's own range and is not touched.
  core: Object.freeze({
    'site-investigation': Object.freeze({ 'marine-spread': OFFSHORE_GEOTECH_CORE_M }),
  }),
});

/**
 * The depth window a job of THIS KIND, AT THIS SITE, has — for a method that
 * serves several kinds. Defaults to the method's own `depthRange`.
 *
 * The ceiling is clamped to the method's rating: an application may narrow what
 * the machine does, never claim more of it than the machine has. The floor is
 * not clamped, and that is deliberate — the bench sets the hole, not the rig.
 *
 * @param {string|null} archetypeId  null asks the loose question, before the
 *        site is known; it then only answers for a window that applies
 *        everywhere.
 * @returns {[number, number]}
 */
/**
 * THE DEEPEST HOLE THE FLEET CAN MAKE with a given method, in metres, cached.
 *
 * A contract that asks for more depth than any rig in the game can reach is
 * the same defect as one that bottoms in undrillable ground — the player takes
 * the job, buys the only machine that runs the method, and it still cannot
 * finish. Measured over 24,000 cards, three methods were dealing them:
 *
 *   rotary-kelly   worst card 90 m   deepest rig  78 m   (Torvald KR-46)
 *   jet-grouting   worst card 46 m   deepest rig  45 m   (Steinbach TH-320)
 *   driven-pile    worst card 30 m   deepest rig  25 m   (Bergholt DP-78)
 *
 * The last one is the clearest: `research/rigs/piling-leader.md` sources the
 * 25 m pile off the manufacturer's own table ("max pile length 25 m with the
 * smallest recommended hammer"), so 25 is the true number and the method's 30 m
 * ceiling was the invention.
 *
 * DERIVED, NOT DECIDED. The cap is read off RIGS rather than written down a
 * second time, so it cannot drift: add a deeper machine and the work widens by
 * itself, retire one and it narrows. Writing "25" into DEPTH_BY_METHOD_APPLICATION
 * would be a third place for the same fact to be wrong in.
 *
 * Only for methods in DEPTH_IS_VERTICAL. For the other four, `targetDepth` is a
 * length along something else — an HDD bore, a jumbo's chainage, metres of
 * drive, a ring's total — and comparing any of those to a rig's depth rating is
 * the same category error the list exists to prevent. A 400 m HDD bore is
 * drilled by a rig rated for nothing like 400 m of hole.
 */
const _fleetDepth = new Map();
function fleetDepthFor(methodId) {
  if (_fleetDepth.has(methodId)) return _fleetDepth.get(methodId);
  let deepest = Infinity;
  if (DEPTH_IS_VERTICAL.includes(methodId)) {
    const able = RIGS.filter((r) => r.methods.includes(methodId));
    // No rig runs it at all is checkdata.mjs's problem, not this function's —
    // it must not silently narrow a window to nothing on the way past.
    deepest = able.length
      ? able.reduce((a, r) => Math.max(a, r.stats.depthCapacity || 0), 0)
      : Infinity;
  }
  _fleetDepth.set(methodId, deepest);
  return deepest;
}

export function depthWindow(method, applicationId, archetypeId = null) {
  const fleet = fleetDepthFor(method.id);
  const row = (DEPTH_BY_METHOD_APPLICATION[method.id] || {})[applicationId];
  const w = Array.isArray(row)
    ? row
    : (row && archetypeId ? row[archetypeId] : null);
  if (!w) return [Math.min(method.depthRange[0], Math.min(method.depthRange[1], fleet)),
                   Math.min(method.depthRange[1], fleet)];
  const hi = Math.min(w[1], method.depthRange[1], fleet);
  return [Math.min(w[0], hi), hi];
}

/**
 * A heading is driven in a MASS, not in a slab. Without this, the underground
 * column for a German construction site started at the 0.7 m of old concrete
 * at the top of the profile and a cavern was advertised "through Concrete".
 */
const MIN_MASS_THICKNESS_M = 2;

/**
 * Where the rig actually stands: REGION × SITE ARCHETYPE.
 *
 * This table used to be keyed on the region alone, with a `surface` list and an
 * `under` list, and it was the copy half of the problem the archetype layer
 * fixes. A Nordic contract said "a forestry track an hour from the nearest
 * town" whether it was a farm borehole or a 118-tonne bored-pile rig, because
 * the region was the only thing the sentence knew.
 *
 * It is now keyed by the archetype `makeContract()` resolved, so the sentence
 * and the setting cannot drift apart. `validateData()` requires a bucket for
 * every archetype every region declares, and refuses a bucket for one it does
 * not — a line here for a place the generator can never reach is a place
 * somebody will eventually put a machine.
 */
const SITE_LINES = deepFreeze({
  nordic: {
    'well-pad': ['a lakeside plot with the rock breaking surface',
                 'a farmyard hardstanding with the tank already set',
                 'a clear-fell block where the till runs thin'],
    'urban-plot': ['a hoarded plot two streets back from the water',
                   'a yard between a school and a substation',
                   'a small-town infill site with the crane booked for Thursday'],
    'infrastructure-corridor': ['a rail embankment with a possession on Sunday nights',
                                'a haul strip beside the new alignment',
                                'a bridge abutment cut into the valley side'],
    'quarry-bench': ['a bench in a bergtäkt with the crusher running below',
                     'a granite face drilled back from the crest',
                     'a working floor with the loader waiting on the shot'],
  },
  'german-site': {
    'urban-plot': ['a hoarded plot with a tram line down one side',
                   'a yard behind a listed façade',
                   'a plot with the piling mat certified and the pump on standby'],
    'infrastructure-corridor': ['a works corridor under a live carriageway',
                                'an easement between the canal and the sidings',
                                'a verge strip with the utilities marked in paint'],
    'underground-drive': ['a stormwater cavern under the district',
                          'a cut-and-cover box, roof already on',
                          'a drive off the shaft with the ventilation at your back'],
  },
  'iberian-quarry': {
    'quarry-bench': ['a working bench in white dust',
                     'a quarry floor at forty degrees',
                     'a haul road above the crusher'],
    'underground-drive': ['an adit driven off the quarry floor',
                          'a decline below the lowest bench',
                          'a level where the only daylight is behind you'],
  },
  alpine: {
    'tunnel-portal': ['the portal apron under a rock net',
                      'a box cut with the canopy tubes already set',
                      'an access platform above the river'],
    'underground-drive': ['a heading with the fault zone somewhere ahead',
                          'a cross-passage between the two bores',
                          'a cavern being taken to full profile'],
    'infrastructure-corridor': ['a bench cut into the valley side',
                                'a viaduct alignment with the pier positions pegged',
                                'a working strip between the river and the old road'],
    'exploration-pad': ['a pad tracked in above the treeline',
                        'a helipad-and-platform on a slope of scree',
                        'a licence block with the core boxes stacked under a tarp'],
  },
  sahara: {
    'well-pad': ['a graded pad in open dune',
                 'a camp two hundred kilometres from the road head',
                 'a wellsite trucked in complete, water included'],
  },
  'north-sea': {
    'platform-deck': ['a platform deck, every task on a permit',
                      'a cantilever out over the template',
                      'a drill floor with the sea four decks straight down'],
    'marine-spread': ['a jack-up stood off with its legs on the seabed',
                      'a survey spread holding station',
                      'a moonpool with the compensator taking the swell'],
  },
  andes: {
    'open-pit-bench': ['a bench four thousand metres up',
                       'a lease road above the pit',
                       'a pattern pegged out with the shovel two benches below'],
    'underground-drive': ['a sublevel off the decline',
                          'an ore drive with the ventilation at your back',
                          'a drill drive cut along the top of the orebody'],
    'exploration-pad': ['a pad cut where the engines lose a fifth of their power',
                        'a licence block reached by a convoy at shift change',
                        'a platform scraped out of the scree at altitude'],
    'tunnel-portal': ['a portal on the water tunnel, nets already up',
                      'a box cut on the access adit',
                      'a face at the mouth of the drive with the treated block ahead of it'],
  },
  arctic: {
    'exploration-pad': ['a fly camp with the medevac two days out',
                        'a pad on frozen ground where nothing may be left behind',
                        'a licence block with the core kept cold on purpose'],
    'well-pad': ['a gravel pad built up clear of the active layer',
                 'a wellsite where the mud is chilled so the ground stays frozen',
                 'a pad with the tanks lagged and the generator never stopped'],
    'urban-plot': ['a settlement plot with the building already framed out',
                   'a plot piled clear of the ground so the heat never reaches it',
                   'a site inside the town where the ground must not thaw'],
  },
});

/**
 * HOW WELL THE TARGET IS KNOWN, in words. `oreConfidence` already existed on
 * every commodity contract and reached the copy through nothing: a greenfield
 * step-out at 0.25 and an infill hole at 0.9 produced identical text.
 *
 * NO GRADE, EVER — not even for the four commodities whose grade bands ARE
 * sourced. A contract advertises a TARGET and the assay is what the programme
 * is being run to find out; printing a number here would be answering the
 * question the client is paying to have asked. That also means this copy is
 * immune to PLATFORM_TRUTH.md Part C rule 7 by construction rather than by a
 * gate it could forget to apply.
 *
 * The commodity itself is deliberately not named. world/geology.js owns
 * REGION_COMMODITIES and picks the body when the section is built; naming one
 * here would be the second copy that goes stale, and the STAGE of the programme
 * is the part that actually changes the proposition anyway.
 */
/**
 * The methods that drill FOR the assay — the ones whose product is a sample
 * somebody sends away. Everything else working under `mining` is making a hole.
 */
const ORE_SAMPLE_METHODS = deepFreeze(['rc', 'core', 'sonic']);

const ORE_STAGES = deepFreeze([
  { max: 0.40, id: 'greenfield', label: 'Greenfield step-out',
    line: 'The target is a projection off surface geochemistry and nothing has been drilled into it yet, so the band on the section is wide and may be wrong.' },
  { max: 0.60, id: 'extension', label: 'Extension drilling',
    line: 'Two holes have hit the zone and this one is chasing it along strike; the geometry between them is still a guess.' },
  { max: 0.78, id: 'definition', label: 'Resource definition',
    line: 'The body is defined and this programme is tightening the spacing inside it.' },
  { max: 1.01, id: 'grade-control', label: 'Grade control',
    line: 'Grade control inside a body somebody has already paid to model — the boundaries are close to known and the job is to stay inside them.' },
]);

/**
 * WHAT ACTUALLY MAKES THIS ONE HARD.
 *
 * Every contract used to be hard in the same way. `difficulty` was one scalar
 * rolled up out of ground, depth and region; the deadline was a deterministic
 * function of that same scalar (`1.95 - 0.13 × difficulty`, so a card's time
 * pressure carried no information the difficulty pips did not); and the payout
 * was a function of everything else. Nothing on the card said WHY this job was
 * the difficult one. Measured: one constraint across 1,815 cards, 61 % of them
 * at difficulty 3, and only 2.7 % ever flagged as time-tight.
 *
 * A constraint is chosen per contract from the ones that are TRUE for it, and
 * it is the axis the cards differ on. Its effects run through the model that
 * was already there rather than beside it:
 *
 *   deadlineMul      the hours the client allows. The one axis that costs the
 *                    player nothing in payout, so it is a clean decision.
 *   difficultyDelta  feeds `difficultyFactor` exactly as ground and depth do.
 *   depthBias        pushes the target up its own method's range.
 *   groundBias       rolls the strata toward the thick, hard end of the region.
 *   holesBias        more positions, or fewer and longer.
 *   certs            an extra gate, and only ever one the player can sit.
 *   timeBonusMul     the early-completion premium a real tight programme pays.
 *   qualityBonusMul  what a client buying quality pays for getting it.
 *
 * There is deliberately no independent pay multiplier. Everything above already
 * moves the payout through the tender model in economy.js, and a ninth knob on
 * top of it would be the one that silently re-opens a ladder inversion.
 *
 * `none` is a real option with real weight: a straightforward job is a
 * proposition too, and if every card shouted, none of them would.
 */
/** "a jumbo" but "an oil rotary" — the copy has to read like a sentence. */
const anArticle = (word) => `${/^[aeiou]/i.test(word) ? 'an' : 'a'} ${word}`;

const CONSTRAINTS = deepFreeze([
  {
    id: 'none', label: 'Straightforward', weight: 3.2,
    when: () => true,
    /* Names what the client is actually buying, which for two thirds of the
       methods is not metres. `scoredOn` is already on every method. */
    clause: (x) => `Nothing unusual about it: ${x.method.scoredOn} is what it is scored on, and the client wants it done cleanly.`,
  },
  {
    id: 'programme', label: 'Tight programme', weight: 2.4,
    when: () => true,
    deadlineMul: 0.60, difficultyDelta: 1, timeBonusMul: 2.2,
    clause: () => 'The window is fixed by a programme somebody else wrote and it is short — the follow-on trade is already booked.',
  },
  {
    id: 'ground', label: 'Bad ground', weight: 2.2,
    /* Only where the region genuinely has the awkward beds AND the method is
       rated to meet them. Boulders in a bed the method cannot drill are not a
       hazard, they are a wall, and the column stops above them anyway. */
    when: (x) => x.region.groundProfile.some((g) =>
      (g.id === 'boulder' || g.id === 'fracture' || g.id === 'karst' || g.id === 'permafrost')
      && x.method.validGround.includes(g.id)),
    groundBias: 1, difficultyDelta: 1, deadlineMul: 1.12,
    clause: (x) => `The ground is the problem: ${x.hazardWord} through the middle of the section, and the tool will know about it before you do.`,
  },
  {
    id: 'deep', label: 'At the limit', weight: 1.8,
    // Only where the method has room to be pushed: a 6-24 m heading has none.
    when: (x) => x.method.depthRange[1] >= x.method.depthRange[0] * 2.4,
    depthBias: 1, difficultyDelta: 1, deadlineMul: 1.05,
    clause: (x) => `It is at the deep end of what ${anArticle(x.method.shortName.toLowerCase())} spread is rated for, and everything takes longer down there.`,
  },
  {
    id: 'certified', label: 'Certification gate', weight: 1.6,
    when: (x) => !!x.extraCert,
    qualityBonusMul: 1.4,
    clause: (x) => `${x.extraCertName} on site, in date, before anyone mobilises — the client audits the tickets at the gate.`,
  },
  {
    id: 'mobilisation', label: 'Long mobilisation', weight: 1.5,
    when: (x) => x.region.travelCost >= 3000,
    deadlineMul: 1.30, holesBias: 0.7, timeBonusMul: 0.5,
    clause: (x) => `Half the programme is getting there: ${Math.round(x.region.travelCost / 1000)} thousand euros of transport before a single metre is drilled, and no second trip.`,
  },
  {
    id: 'hours', label: 'Restricted hours', weight: 1.8,
    when: (x) => x.region.hazards.some((h) =>
      h === 'noise-window' || h === 'permit-to-work' || h === 'blast-window' || h === 'shift-change-convoy'),
    deadlineMul: 0.70, timeBonusMul: 1.6,
    clause: (x) => `You do not get the whole day: ${x.hoursWord}, and the hours you are not working still count against the programme.`,
  },
  {
    id: 'water', label: 'Water', weight: 1.7,
    when: (x) => x.region.hazards.some((h) =>
      h === 'groundwater' || h === 'high-water-inflow' || h === 'lost-circulation' || h === 'thaw-collapse'),
    difficultyDelta: 1, qualityBonusMul: 1.3, deadlineMul: 1.05,
    clause: (x) => `Water is the risk here — ${x.waterWord} — and the flush is only ever half the answer.`,
  },
  {
    id: 'tolerance', label: 'Tight tolerance', weight: 2.0,
    // Only where the client is buying something other than depth. Ten of the
    // twenty-one methods say so themselves, in `scoredOn`.
    when: (x) => x.method.scoredOn !== 'metres drilled',
    qualityBonusMul: 2.0, difficultyDelta: 1, deadlineMul: 1.08,
    clause: (x) => `Nobody is counting your metres. You are paid on ${x.method.scoredOn}, and it is checked.`,
  },
  {
    id: 'access', label: 'Restricted access', weight: 1.6,
    when: (x) => x.underground || x.region.hazards.some((h) =>
      h === 'services-strike' || h === 'settlement-monitoring' || h === 'confined-space' || h === 'rockfall'),
    holesBias: 0.8, deadlineMul: 0.92, difficultyDelta: 1,
    clause: (x) => x.underground
      ? 'Everything goes in and out through the drive, and the machine only just fits.'
      : 'There is no room: the spread goes in through a gate the machine barely clears, and it is monitored the whole time.',
  },
  {
    id: 'environmental', label: 'Environmental restriction', weight: 1.5,
    when: (x) => x.applicationId === 'environmental' || x.applicationId === 'water-well'
      || x.region.hazards.includes('wildlife-watch'),
    deadlineMul: 0.86, qualityBonusMul: 1.5, difficultyDelta: 1,
    clause: (x) => x.region.hazards.includes('wildlife-watch')
      ? 'A wildlife watch can stop the job at any hour, and nothing whatever may be left in the ground.'
      : 'Everything that comes out of the hole is contained, logged and taken away; nothing is allowed to reach the water.',
  },
  {
    id: 'climate', label: 'Weather window', weight: 1.5,
    // There is no weather at a level three hundred metres down. This card was
    // telling an underground diamond driller that it was "forty degrees on the
    // bench by mid-morning" — the surface bench, which he cannot see.
    when: (x) => !x.underground && x.region.hazards.some((h) =>
      h === 'extreme-cold' || h === 'extreme-heat' || h === 'sandstorm' || h === 'whiteout'
      || h === 'frost-heave' || h === 'heat'),
    deadlineMul: 0.80, difficultyDelta: 1,
    clause: (x) => `The weather owns the programme — ${x.weatherWord} — and the window closes whether you are finished or not.`,
  },
  {
    id: 'sequence', label: 'Held by the trade in front', weight: 1.7,
    when: (x) => x.applicationId === 'foundation-piling' || x.applicationId === 'civil-infrastructure'
      || x.applicationId === 'tunnelling' || x.applicationId === 'diaphragm-wall',
    deadlineMul: 0.76, holesBias: 1.15, timeBonusMul: 1.8,
    clause: () => 'You are one trade in a sequence: the work in front is late, the crane is shared, and your window has not moved.',
  },
  {
    id: 'volume', label: 'Long campaign', weight: 1.6,
    when: (x) => (HOLES_PER_JOB[x.method.id] || [1, 1])[1] >= 8,
    holesBias: 1.7, deadlineMul: 1.15,
    clause: (x) => `It is a campaign rather than a job: the same ${UNIT_NOUN[x.method.id] || 'hole'} over and over until the pattern is finished, and consumables decide whether it pays.`,
  },
]);

/**
 * The extra certificate a `certified` contract may demand, and when it is true.
 * One is chosen at random from the ones that apply, never the first that
 * matches — a first-match list made every well in the North Sea ask for the
 * same ticket, which is both dull and the weakest of the ones available.
 */
const CONSTRAINT_CERTS = deepFreeze([
  // Underground, and the entries the mine or the tunnel actually audits.
  { id: 'confined-space', when: (x) => x.underground || x.applicationId === 'tunnelling' },
  // A mast, a leader, a portal face or a bench crest — work at height, really.
  { id: 'working-height', when: (x) => x.method.sectionMode === 'pile'
      || x.region.hazards.includes('rockfall') || x.applicationId === 'quarry-construction' },
  // A pattern that will be charged and fired.
  { id: 'shot-firing', when: (x) => x.applicationId === 'blasting-demolition'
      || x.applicationId === 'mining' || x.method.id === 'tunnel-jumbo' || x.method.id === 'longhole' },
  // A second well-control standard beside IWCF. Only on a well.
  { id: 'iadc-wellsharp', when: (x) => x.method.id === 'oil-rotary' },
  // The offshore refresher and the competence assessment: fixed-installation
  // tickets, so they belong to an offshore posting and nowhere else.
  { id: 'foet', when: (x) => x.region.waterDepth > 0 },
  { id: 'opito-competence', when: (x) => x.region.waterDepth > 0 },
  // The client's own gate on who may sit in the seat. Not on a derrick: an
  // offshore crew is gated on the survival and medical tickets, not on a
  // ground-rig operator licence.
  { id: 'rig-operator-licence', when: (x) => x.method.id !== 'oil-rotary' },
  // Remote work, where the nearest hospital is the problem.
  { id: 'first-aid', when: (x) => x.region.travelCost >= 9000 },
]);

/** Region-shaped nouns the constraint clauses drop into their sentences. */
const HAZARD_WORDS = Object.freeze({
  boulder: 'a boulder bed', fracture: 'a fractured zone', karst: 'karst voids',
  permafrost: 'frozen ground that will not stay frozen',
});
const WATER_WORDS = Object.freeze({
  groundwater: 'the water table sits in the working depth',
  'high-water-inflow': 'inflow arrives without warning and does not stop',
  'lost-circulation': 'the flush disappears into the formation',
  'thaw-collapse': 'thaw takes the wall of the hole with it',
});
/**
 * The second value is the UNDERGROUND form, where there is one. A bench is
 * cleared on the surface and a level is cleared below it, and telling a driller
 * on a sublevel that the bench has been cleared is a sentence he can see out of
 * the window is wrong — except that there is no window.
 */
const HOURS_WORDS = Object.freeze({
  'noise-window': ['the noise window is four hours wide'],
  'permit-to-work': ['every task waits on a permit'],
  'blast-window': ['the bench is cleared for the firing window',
                   'the level is cleared and re-entry waits on the ventilation'],
  'shift-change-convoy': ['the convoy takes the crew off the lease at shift change'],
});
const WEATHER_WORDS = Object.freeze({
  'extreme-cold': 'the cold decides what the steel will take',
  'extreme-heat': 'the heat decides how long anyone can stand on the deck',
  sandstorm: 'a sandstorm shuts the site with no notice',
  whiteout: 'a whiteout shuts the site with no notice',
  'frost-heave': 'the ground heaves and drops with the frost',
  heat: 'forty degrees on the bench by mid-morning',
});

/**
 * Build the strata column down to `maxDepth`, before a target depth is chosen.
 *
 * At an underground site the surface drift is dropped: the hole is collared in
 * rock at the level, and walking a heading down through topsoil and till is the
 * wrong picture and the wrong ground.
 *
 * `underground` used to be read off `UNDERGROUND_METHODS` alone, which was
 * right while only four machines ever went below and became wrong the moment
 * SITE ARCHETYPES let a **core rig be set up inside a drive** — a real and very
 * common thing (`research/02` §E3 gives the underground diamond drill its own
 * rig class). It defaults to the method's own list, and the caller overrides it
 * from `contract.archetype` when the site says otherwise.
 */
function buildGroundColumn(region, maxDepth, rand, method, undergroundSite = null) {
  const vg = new Set(method.validGround);
  const underground = undergroundSite ?? UNDERGROUND_METHODS.includes(method.id);
  const spec = [];
  let top = 0;
  let skipping = underground;
  for (const layer of region.groundProfile) {
    if (top >= maxDepth) break;
    // A LENS IS NOT ALWAYS THERE. `p` is the probability the bed appears at all
    // — an esker gravel, a shale band, an old slab — and it is the reason two
    // cards in one region can honestly show different ground. world/geology.js
    // has carried these probabilities all along; the contract board did not,
    // which is most of why every card in a region printed the same ground line.
    if (layer.p !== undefined && rand.f() >= layer.p) continue;
    let thickness = rand.range(layer.min, layer.max);
    if (thickness <= 0.05) continue;
    // The drive is in rock: skip the drift above the first MASS the method runs
    // in. A 0.7 m slab at the top of a city profile is not a heading.
    if (skipping) {
      if (!vg.has(layer.id) || thickness < MIN_MASS_THICKNESS_M) continue;
      skipping = false;
    }
    spec.push({
      id: layer.id, top: +top.toFixed(2),
      bottom: +(top + thickness).toFixed(2), thickness: +thickness.toFixed(2),
    });
    top += thickness;
  }
  if (!spec.length) {
    const first = region.groundProfile.find((g) => vg.has(g.id)) || region.groundProfile[0];
    spec.push({ id: first.id, top: 0, bottom: maxDepth, thickness: maxDepth });
  }
  return spec;
}

/**
 * The deepest bed in the column the method can actually bottom a hole in,
 * reachable through no more than the pre-collar allowance FOR THIS SITE — see
 * `preCollarFor()`, which is method-and-place, not method alone. Null when there
 * is none, which `methodsForRegion()` refuses to offer.
 *
 * @param {string|null} archetypeId  the site the hole is drilled from. It used
 *        to be a bare `undergroundSite` boolean, which could say "not
 *        underground" and nothing else — so a jack-up and a quarry bench were
 *        the same place as far as the allowance was concerned.
 */
function bottomableBed(column, method, maxDepth = Infinity, archetypeId = null) {
  const vg = new Set(method.validGround);
  const allowance = preCollarFor(method, archetypeId);
  let blocked = 0;
  let best = null;
  for (const layer of column) {
    // A bed that starts below the method's own range is not somewhere this
    // method can bottom a hole: picking it pushed the target past `depthRange`
    // to reach it, which put 4 % of the board outside its own method's limits.
    if (vg.has(layer.id) && blocked <= allowance && layer.top < maxDepth) best = layer;
    if (!vg.has(layer.id)) blocked += layer.thickness;
  }
  return best;
}

/**
 * How many times a column may be re-rolled before the generator gives up and
 * takes the mean one. Sixteen is far past the tail: the worst pairing in the
 * game (top-hammer in the Andes, where 9 m of gravel over 12 m of till can
 * exceed the method's own 15 m pre-collar) fails a single roll about one time
 * in twenty, so sixteen independent rolls miss about once in 10^21 cards.
 */
const MAX_COLUMN_ROLLS = 16;

/**
 * A rolled ground column the method can actually BOTTOM A HOLE IN, and the bed
 * it bottoms in.
 *
 * THE BUG THIS EXISTS TO KILL. `methodsForRegion()` and the `usableSites`
 * filter both decide whether a pairing is playable against `nominalColumn()` —
 * the MEAN column, where a lens that is only there half the time counts for
 * half of itself and every thickness is its own average. `makeContract()` then
 * drills the ROLLED column, where that lens is either wholly there or wholly
 * absent and each thickness is a fresh sample. The two disagree in the tail.
 *
 * When they did, `bottomableBed()` returned null and the caller fell back to
 * `column[0]` — the TOP bed, whether the method could drill it or not. So the
 * board advertised a hole that cannot be finished: the player accepts it,
 * drills, and stops in ground the rig was never able to take. Measured over
 * 6,400 cards it hit **43 in 800 Andean cards (5.4 %)**, and it reached Nordic
 * and German sites too. `tools/checkbeds.mjs` is the guard; it prints the
 * failing seeds so a fix is checked against the cards that failed.
 *
 * RE-ROLLING IS THE HONEST FIX, not a retry loop hiding a data problem. The
 * client hired a contractor for THIS method, so the site is one where the
 * method works — conditioning the geology on that is the same statement the
 * contract already makes. What is not honest is drawing a site the method
 * cannot drill and printing it on the card anyway.
 *
 * The fallback is the nominal column, which is the exact column
 * `methodsForRegion()` used to declare the pairing playable in the first place,
 * so it bottoms by construction. `checkdata.mjs` asserts that statically for
 * every offerable region x method x site, which is what keeps the last resort
 * below unreachable rather than merely unlikely.
 */
function rollDrillableColumn(region, method, underground, rand, maxDepth, dHi, archetypeId) {
  for (let i = 0; i < MAX_COLUMN_ROLLS; i++) {
    const column = buildGroundColumn(region, maxDepth, rand, method, underground);
    const bed = bottomableBed(column, method, dHi, archetypeId);
    if (bed) return { column, bed, rolls: i + 1 };
  }
  const column = nominalColumn(region, method, underground);
  const bed = bottomableBed(column, method, dHi, archetypeId);
  if (bed) return { column, bed, rolls: MAX_COLUMN_ROLLS, nominal: true };
  // Unreachable while checkdata.mjs passes. If it is ever reached, the pairing
  // was offered by one of the two escape hatches above (`siteOptions` falling
  // back to `allSites`, or `sharedApps` being empty) and there is no honest
  // column at all — so give the method the one bed in this region it can drill
  // rather than a bed it cannot. Same rule buildGroundColumn() already uses
  // when a profile rolls away to nothing.
  const vg = new Set(method.validGround);
  const first = region.groundProfile.find((g) => vg.has(g.id)) || region.groundProfile[0];
  const only = { id: first.id, top: 0, bottom: maxDepth, thickness: maxDepth };
  return { column: [only], bed: only, rolls: MAX_COLUMN_ROLLS, degenerate: true };
}

/**
 * Truncate the column at the bed the hole bottoms in and extend that bed to the
 * target depth — the same rule the file has always used for the last bed, moved
 * onto the last bed the METHOD CAN DRILL. Everything below it is ground this
 * hole never reaches and has no business on the card.
 */
function trimColumn(column, bed, targetDepth) {
  const out = [];
  for (const layer of column) {
    if (layer.top >= targetDepth) break;
    out.push({ ...layer });
    if (layer === bed) break;
  }
  if (!out.length) out.push({ ...column[0] });
  const last = out[out.length - 1];
  last.bottom = +targetDepth.toFixed(2);
  last.thickness = +Math.max(0.5, last.bottom - last.top).toFixed(2);
  return out;
}

/**
 * The nominal (mean-thickness) column for a region, used to decide whether a
 * method may be offered there at all without rolling any dice.
 */
function nominalColumn(region, method, undergroundSite = null) {
  const vg = new Set(method.validGround);
  const underground = undergroundSite ?? UNDERGROUND_METHODS.includes(method.id);
  const out = [];
  let top = 0;
  let skipping = underground;
  for (const layer of region.groundProfile) {
    // Expected thickness, so a lens that is only there half the time counts
    // for half of itself when deciding what a region can offer.
    const t = ((layer.min + layer.max) / 2) * (layer.p ?? 1);
    if (t <= 0.05) continue;
    if (skipping) { if (!vg.has(layer.id) || t < MIN_MASS_THICKNESS_M) continue; skipping = false; }
    out.push({ id: layer.id, top, bottom: top + t, thickness: t });
    top += t;
  }
  return out;
}

/**
 * THE PAIRING RULE — the site archetypes a given method, region and
 * application all agree on.
 *
 * See the SITE ARCHETYPES block at the top of this file for why this exists.
 * The short version: whether a job can happen in a place used to be a keyword
 * match on `applications`, which let a cable percussion spudder onto a North
 * Sea platform. It is now a three-way intersection over a physical setting, and
 * an empty result means the job cannot happen there at all.
 *
 * `applicationId` is optional: omit it to ask the looser question "could this
 * method work anywhere in this region", which is what `methodsForRegion()`
 * needs before it knows what the job is for.
 *
 * @returns {string[]} SITE_ARCHETYPES ids, in the method's own order of
 *          preference. Stable, so a caller may treat the first as the default.
 */
export function archetypesFor(methodId, regionId, applicationId = null) {
  const m = getMethod(methodId);
  const r = getRegion(regionId);
  if (!m || !r || !m.archetypes || !r.archetypes) return [];
  const apps = applicationId
    ? [applicationId]
    : m.applications.filter((a) => r.applications.includes(a));
  const allowed = new Set();
  for (const a of apps) {
    const app = getApplication(a);
    if (!app || !app.archetypes) continue;
    // The application must also be one the region actually buys, or the answer
    // describes a job nobody there is paying for.
    if (!r.applications.includes(a)) continue;
    for (const x of app.archetypes) allowed.add(x);
  }
  const regionSet = new Set(r.archetypes);
  return m.archetypes.filter((x) => regionSet.has(x) && allowed.has(x));
}

/**
 * True when the site this contract is at is BELOW GROUND, which decides whether
 * the ground column starts at the topsoil or at the level. It is a property of
 * the SITE, not of the method: a core rig gets a surface column on an
 * exploration pad and an underground one when it is set up in a drive.
 */
function isUndergroundSite(archetypeId) {
  const a = getArchetype(archetypeId);
  return !!a && a.plane === 'underground';
}

/** Methods a player of `level` can actually run in `region`. */
export function methodsForRegion(regionId, level = MAX_LEVEL) {
  const region = getRegion(regionId);
  if (!region) return [];
  const regionGround = new Set(region.groundProfile.map((g) => g.id));
  return METHODS.filter((m) => {
    if (m.unlockLevel > level) return false;
    if (!m.applications.some((a) => region.applications.includes(a))) return false;
    // …and there has to be somewhere in this region the work is physically
    // done. This is the check that ended the spudder on the platform, the
    // Kelly rig on the forestry track and the jumbo on the surface site.
    const sites = archetypesFor(m.id, region.id);
    if (!sites.length) return false;
    if (!m.validGround.some((g) => regionGround.has(g))) return false;
    // …and the hole has to be able to BOTTOM somewhere the method can drill,
    // deep enough to be the job the method exists for. Sharing one bed with the
    // region is not enough: an Alpine profile offers a cable-percussion rig
    // 2.5 m of till over schist, and a 10-120 m method cannot make a well out
    // of that. It used to be offered anyway, and the bottom bed was stretched
    // to 81 m of "glacial till" to cover for it.
    //
    // The column differs from site to site, so every site the pairing allows is
    // asked separately and the method is playable if ANY of them works. It used
    // to fold the sites down to their two planes first, which was fine while the
    // pre-collar was a property of the method — but the allowance is now a
    // property of the PLACE (see preCollarFor), and a marine spread and an
    // exploration pad are not the same question.
    return sites.some((site) => {
      const under = isUndergroundSite(site);
      const column = nominalColumn(region, m, under);
      const bed = bottomableBed(column, m, m.depthRange[1], site);
      if (!bed) return false;
      // When the bed the hole bottoms in is the LAST bed of the profile, the
      // window is unbounded — that bed is the one trimColumn() extends, which is
      // the rule this file has always used and the one the Sahara profile is
      // written against. Only a window CAPPED by ground the method cannot drill
      // has to be deep enough to be the job the method exists for.
      if (bed === column[column.length - 1]) return true;
      return !DEPTH_IS_VERTICAL.includes(m.id) || bed.bottom >= m.depthRange[0];
    });
  });
}

/** Pick one weighted entry from a list, using `rand`. */
function weightedPick(list, weightOf, rand) {
  let total = 0;
  const w = list.map((x) => { const v = Math.max(0.0001, weightOf(x)); total += v; return v; });
  let roll = rand.f() * total;
  for (let i = 0; i < list.length; i++) { roll -= w[i]; if (roll <= 0) return list[i]; }
  return list[list.length - 1];
}

/** One decimal below 100 m, none above — the board's own depth format. */
const dep = (m) => `${Number(m).toFixed(Math.abs(m) >= 100 ? 0 : 1)} m`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * THE SCOPE SENTENCE, in the method's own unit.
 *
 * "1 hole at 18 m" was printed for a tunnel heading, a longhole ring, a bolting
 * drive and a driven pile alike — four different jobs, one sentence, and the
 * unit wrong in all four. METHOD_IDS.md says what each of them is measured in;
 * this is where the board says it.
 */
const SCOPE_LINE = Object.freeze({
  'tunnel-jumbo': (x) =>
    `${dep(x.targetDepth)} of chainage on a ${x.faceAreaM2} m² face, ${x.holeDia} mm blastholes, advanced round by round`,
  longhole: (x) =>
    `${plural(x.holes, 'ring')} of about ${dep(x.targetDepth)} of ring metres each, ${x.holeDia} mm, in fans of roughly ${x.holeLengthM} m off the sublevel`,
  rockbolt: (x) =>
    `${plural(x.holes, 'drive')}, ${dep(x.targetDepth)} of heading to support each, ${x.holeDia} mm holes on the design pattern`,
  'driven-pile': (x) =>
    `one ${x.holeDia} mm pile driven to a design toe at ${dep(x.targetDepth)}`,
  'raise-boring': (x) =>
    `a ${x.holeDia} mm raise of ${dep(x.targetDepth)}, pilot down and reamer back up`,
  rc: (x) =>
    `${plural(x.holes, 'hole')} to ${dep(x.targetDepth)}, ${x.holeDia} mm, with a split sample bagged at every metre mark`,
  'site-investigation': (x) =>
    `${plural(x.holes, 'position')} to ${dep(x.targetDepth)}, ${x.holeDia} mm, sampled and logged the whole way`,
  core: (x) =>
    `${plural(x.holes, 'hole')} to ${dep(x.targetDepth)}, ${x.holeDia} mm, the core boxed and logged in order`,
  hdd: (x) =>
    `${plural(x.holes, 'bore')} of ${dep(x.targetDepth)}, pilot then reamed to ${x.holeDia} mm and the product pipe pulled back`,
  'oil-rotary': (x) =>
    `${dep(x.targetDepth)} total depth, ${x.holeDia} mm hole`,
  'jet-grouting': (x) =>
    `${plural(x.holes, 'column')} of ${dep(x.targetDepth)}, ${x.holeDia} mm finished diameter`,
  anchor: (x) =>
    `${plural(x.holes, 'anchor')} at ${dep(x.targetDepth)}, ${x.holeDia} mm drilled`,
  'driven-default': null,
});

/** Piles, and everything else that is simply a hole in the ground. */
function defaultScope(x) {
  const noun = UNIT_NOUN[x.method.id] || 'hole';
  return `${plural(x.holes, noun)} at ${dep(x.targetDepth)}, ${x.holeDia} mm`;
}

/**
 * ONE TRUE THING ABOUT THIS METHOD, and never about any other.
 *
 * The methods that are not paid by the metre are the ones whose card needs this
 * most: `scoredOn` says what the client is buying in four words, and this says
 * what that means for the person on the controls. Every line traces to
 * METHOD_IDS.md's scoring table or to the method's own entry above.
 */
const DETAIL_LINE = Object.freeze({
  'site-investigation': (x) => `The water table stands at ${x.waterTableM} m and the log has to say so.`,
  'tunnel-jumbo': () => 'You are paid on the metres the round pulled, not on the metres you drilled, and the look-out angle you chose is somebody else\'s overbreak to concrete back.',
  longhole: () => 'Deviation at the toe becomes dilution, and dilution is somebody\'s grade.',
  rockbolt: () => 'A sample of the bolts is pull-tested and torque-checked before the drive is signed off.',
  'driven-pile': () => 'The set is read off the last blows; drive it harder than that and you damage the pile you are being paid for.',
  rc: () => 'The chips are the product — a wet bag or a contaminated one is a hole to drill again.',
  core: () => 'Recovery is the score: whole core, in order, in the box.',
  hdd: () => 'The pullback is where the money is and where the product pipe gets damaged.',
  'raise-boring': () => 'The pilot has to break through on the level below inside tolerance, or the reamer has nowhere to go.',
  'cable-tool': () => 'Nothing about it is quick, and the boulder that stops a rotary bit is the one this method is here for.',
  'jet-grouting': () => 'The column is only as good as the spoil return; lose the return and you are guessing at the diameter.',
  cfa: () => 'The auger must never turn without advancing, and the concrete must never stop.',
  'cased-cfa': () => 'The casing turns against the auger, so nothing outside the pile comes with it.',
  'oil-rotary': (x) => `Bottom-hole temperature about ${Math.round(x.envelope ? x.envelope.bottomHoleC : 0)} °C and roughly ${x.envelope ? x.envelope.shutInBar : 0} bar shut-in on this envelope.`,
});

/**
 * The client brief: three sentences, and each of them carries something the
 * card does not already show.
 *
 *   1. THE SCOPE, in the method's own unit — see SCOPE_LINE.
 *   2. THE SETTING — who is buying and where the rig stands. The client kind
 *      and the region were both in the data and reached the copy through
 *      nothing at all.
 *   3. THE CONSTRAINT — what makes THIS one hard, or, for a plain job, what
 *      the client is actually buying.
 *
 * Everything it says has to be true for the method it belongs to. There is no
 * generic fallback sentence that could be wrong for twenty of the twenty-one.
 */
function describeContract(x) {
  const scopeFn = SCOPE_LINE[x.method.id];
  const scope = typeof scopeFn === 'function' ? scopeFn(x) : defaultScope(x);
  const column = x.groundSpec.map((g) => (GROUND[g.id] || {}).name || g.id).join(' / ');
  const kind = CLIENT_KINDS[x.clientKind] || CLIENT_KINDS.contractor;

  // A well is advertised as a well: the Talent posting IS the job description
  // for a rotation-based hire, and burying it under a hole count would lose the
  // one thing a driller reads first.
  const setting = x.posting && x.posting.rigType
    ? `For ${x.client} on ${x.posting.waterDepth
        ? `a ${x.posting.rigType.toLowerCase()} in ${x.posting.waterDepth.metres} m of water`
        : `a ${x.posting.rigType.toLowerCase()}`}, ${x.posting.rotation} rotation, `
      + `${x.posting.dayRate.role} at ${x.posting.dayRate.amount} ${x.posting.dayRate.currency} a day.`
    : `For ${x.client} — ${kind.noun} — on ${x.siteLine}.`;

  const sentences = [
    `${scope} — ${x.method.name.toLowerCase()} through ${column}.`,
    setting,
  ];
  // The ore programme takes the third slot when there is one: the stage of the
  // campaign IS what makes a commodity hole a different job, and it displaces
  // the generic method line rather than the constraint.
  if (x.oreStage) sentences.push(x.oreStage.line);
  else {
    const detail = DETAIL_LINE[x.method.id];
    if (detail) sentences.push(detail(x));
  }
  if (x.constraint && x.constraint.clause) sentences.push(x.constraint.clause(x));
  return sentences.join(' ');
}

/**
 * Generate one contract. Deterministic for a given `rand` stream.
 * @param {string} regionId
 * @param {number} level          player level
 * @param {{f:Function,range:Function,int:Function,pick:Function,bool:Function}} [rand]
 * @returns {Contract}
 */
export function makeContract(regionId, level = 1, rand = makeRandom(Date.now() & 0xffff)) {
  const region = getRegion(regionId) || REGIONS[0];
  const pool = methodsForRegion(region.id, level);
  const candidates = pool.length ? pool : [METHODS[0]];

  // Two biases decide which job the board shows.
  //
  // RECENCY — show off the method the player just earned, without ever showing
  // only that one.
  //
  // WHAT THE PLACE IS FOR — an application served by nine methods otherwise
  // out-votes one served by a single method, purely by arithmetic, and the
  // region ends up advertising the wrong trade. That is how "North Sea
  // Platform" came to offer highway-widening piles on 72 % of its board. A
  // region may therefore declare `applicationWeights`; a method's weight is
  // the largest weight among the applications it shares with the region, and
  // anything unlisted weighs 1, so a region that declares nothing is unchanged.
  const appW = region.applicationWeights || null;
  /* …and the same arithmetic runs the other way. `utility-hdd` is served in
     the German site by exactly one method and `civil-infrastructure` by eleven,
     so the trade the region is named for appeared on 0.2 % of all cards while
     the catch-all took 20 %. Dividing by the square root of the number of
     methods that serve an application evens the arithmetic out without
     flattening it, and leaves a declared `applicationWeights` meaning exactly
     what it says. */
  const serving = new Map();
  for (const m of candidates) {
    for (const a of m.applications) {
      if (region.applications.includes(a)) serving.set(a, (serving.get(a) || 0) + 1);
    }
  }
  const appBias = (a) => (appW ? Math.max(0.01, appW[a] ?? 1) : 1) / Math.sqrt(serving.get(a) || 1);

  const method = weightedPick(candidates, (m) => {
    const recency = 1 + Math.max(0, 6 - (level - m.unlockLevel) / 4);
    let bias = 0;
    for (const a of m.applications) {
      if (region.applications.includes(a)) bias = Math.max(bias, appBias(a));
    }
    return Math.max(0.01, recency * (bias || 1));
  }, rand);

  // The application is weighted the same way, so a method that serves both the
  // region's headline trade and a sideline is advertised as the headline.
  //
  // …and it must be an application with somewhere for this method to stand.
  // `methodsForRegion()` only asks whether SOME application works; picking one
  // that does not would resolve to no archetype at all, which is how a jumbo
  // ends up on a plot.
  const sharedApps = method.applications.filter(
    (a) => region.applications.includes(a) && archetypesFor(method.id, region.id, a).length);
  const applicationId = !sharedApps.length
    ? method.applications[0]
    : weightedPick(sharedApps, appBias, rand);

  /* ── The site ────────────────────────────────────────────────────────────
     The physical setting, derived from the method, the region and the
     application rather than from the region alone. `world/terrain.js` renders
     from this. See the SITE ARCHETYPES block at the top of this file.

     A site is only offered if the ground under it actually works — the column
     above ground and the column at a level are different columns, and a method
     that can be sent to both (a core rig) must not be handed one it cannot
     drill. */
  const allSites = archetypesFor(method.id, region.id, applicationId);
  const usableSites = allSites.filter((x) => {
    const under = isUndergroundSite(x);
    const col = nominalColumn(region, method, under);
    // Asked against the depth the work has AT THAT SITE, not the method's whole
    // rating — otherwise a site can pass this filter on a bed the job's own
    // depth window can never reach, and the contract falls back to a bed the
    // method cannot drill. See `depthWindow()`.
    return !!bottomableBed(col, method, depthWindow(method, applicationId, x)[1], x);
  });
  const siteOptions = usableSites.length ? usableSites : allSites;
  const archetypeId = siteOptions.length ? rand.pick(siteOptions) : method.archetypes[0];
  const archetype = getArchetype(archetypeId);

  /* THE SITE decides this, not the method. The four underground machines always
     resolve to `underground-drive` so they are unchanged; what is new is that a
     core rig set up in a drive now gets an underground column too, instead of
     being advertised as coring down through the topsoil of a quarry it is
     three hundred metres beneath. */
  const underground = isUndergroundSite(archetypeId);

  /* ── The constraint ──────────────────────────────────────────────────────
     Chosen before the numbers, because it is what shapes them. Only from the
     constraints that are TRUE for this method, this region and this
     application — a water constraint on a dry desert bench or a
     restricted-hours constraint where there is no window to restrict would be
     a sentence the card cannot support. */
  const certOptions = CONSTRAINT_CERTS.filter((c) => {
    const cert = getCert(c.id);
    // Never gate a contract on a ticket the player is not yet allowed to sit —
    // that is a card locked for ever rather than a card with a price on it.
    if (!cert || cert.minLevel > level) return false;
    if (region.requiredCerts.includes(c.id)) return false;   // already demanded
    if ((APPLICATION_CERTS[applicationId] || []).includes(c.id)) return false;
    return c.when({ method, region, applicationId, underground });
  });
  const extraCert = certOptions.length ? rand.pick(certOptions).id : null;
  const hazardKey = region.groundProfile.map((g) => g.id).find((g) => HAZARD_WORDS[g]);
  const ctx = {
    method, region, applicationId, underground, extraCert,
    extraCertName: extraCert ? (getCert(extraCert)?.name ?? extraCert) : '',
    hazardWord: HAZARD_WORDS[hazardKey] || 'awkward ground',
    waterWord: WATER_WORDS[region.hazards.find((h) => WATER_WORDS[h])] || 'the water table is in the way',
    hoursWord: (() => {
      const w = HOURS_WORDS[region.hazards.find((h) => HOURS_WORDS[h])];
      if (!w) return 'the site closes early';
      return (underground && w[1]) || w[0];
    })(),
    weatherWord: WEATHER_WORDS[region.hazards.find((h) => WEATHER_WORDS[h])] || 'the weather turns without notice',
  };
  const applicable = CONSTRAINTS.filter((c) => c.when(ctx));
  const constraint = weightedPick(applicable, (c) => c.weight, rand);

  /* ── Depth, holes, diameter ───────────────────────────────────────────────
     Not `method.depthRange`: the depth the WORK has, at THIS site, for THIS
     application. A blast pattern is as deep as the bench whatever the rig could
     reach, and a seabed geotechnical borehole is not a 600 m exploration hole.
     See `depthWindow()`. */
  const [dLo, dHi] = depthWindow(method, applicationId, archetypeId);
  const mastery = clamp((level - method.unlockLevel) / 24, 0, 1);
  let ceiling = dLo + (dHi - dLo) * (0.22 + 0.78 * mastery);
  // `deep` pushes the target up the method's own range rather than past it.
  if (constraint.depthBias) ceiling = dLo + (dHi - dLo) * (0.55 + 0.45 * mastery);
  const floor = dLo + (ceiling - dLo) * (constraint.depthBias ? 0.7 : 0.3);
  let targetDepth = +rand.range(floor, ceiling).toFixed(1);

  const [hLo, hHi] = HOLES_PER_JOB[method.id] || [1, 3];
  const scale = (0.45 + 0.55 * mastery) * (constraint.holesBias ?? 1);
  const holes = Math.max(1, Math.min(hHi, Math.round(rand.int(hLo, hHi) * scale)));

  const [diaLo, diaHi] = method.holeDiaRange;
  const nominal = method.nominalDia;
  let holeDia = Math.round(clamp(nominal * rand.range(0.7, 1.35), diaLo, diaHi));
  if (method.id === 'oil-rotary') {
    const row = OIL_HOLE_SIZES.find((r) => targetDepth <= r.maxDepth) || OIL_HOLE_SIZES[OIL_HOLE_SIZES.length - 1];
    holeDia = rand.pick(row.sizes);
  }

  /* ── The ground ─────────────────────────────────────────────────────────
     Built to the method's full range first, so the bed the hole bottoms in can
     be chosen before the depth is fixed rather than after it. `groundBias`
     rolls the thicknesses toward the hard, thick end of the region's profile —
     the one axis that made every card in a region print the same ground line. */
  const biased = constraint.groundBias
    ? { ...rand, range: (a, b) => a + (0.45 + 0.55 * rand.f()) * (b - a) }
    : rand;
  const rolled = rollDrillableColumn(
    region, method, underground, biased, Math.max(dHi, targetDepth) * 1.15, dHi, archetypeId);
  const column = rolled.column;
  const bed = rolled.bed;
  // The hole may not bottom ABOVE the bed it is meant to end in, and it may
  // never be pushed past the method's own rating to get there.
  targetDepth = clamp(
    Math.max(targetDepth, bed.top + Math.min(1.5, bed.thickness * 0.35)),
    Math.min(dLo, dHi), dHi);
  targetDepth = +targetDepth.toFixed(1);
  const groundSpec = trimColumn(column, bed, targetDepth);
  const hardness = groundHardness(groundSpec);
  const metres = +(targetDepth * holes).toFixed(1);

  /* ── Difficulty ─────────────────────────────────────────────────────────
     The old formula put 61 % of every card in the game at exactly 3 out of 5
     and never once produced a 1: at typical inputs it summed to 3.02 before
     rounding, and the widest term — hardness — barely moved inside a region
     because every card there was handed the same strata. With the ground now
     varying and a constraint on top, the coefficients are widened to match and
     the base is dropped so the bottom of the scale is reachable. */
  const depthRatio = clamp((targetDepth - dLo) / Math.max(1, dHi - dLo), 0, 1);
  const rawDiff = 0.15
    + hardness * 2.6
    + depthRatio * 1.4
    + clamp(region.unlockLevel / 60, 0, 1) * 1.2
    + (method.difficulty - 1) * 0.26
    + (constraint.difficultyDelta || 0) * 0.85;
  const difficulty = clamp(Math.round(rawDiff), 1, 5);

  // ── Payout, from the economics, not from a die roll ──────────────────────
  // Three items, the way the tender is actually written: the running metre,
  // the fixed item per hole/pile/anchor, and — for HDD alone — the pullback.
  // See THE PAY BASIS above METHODS for why the second and third exist.
  const groundFactor = 0.75 + 0.8 * hardness;
  // Methods whose product is a VOLUME (a pile, a grout column, a shaft) are
  // paid roughly by volume; methods whose product is a HOLE are paid closer to
  // by the metre. This single exponent is what keeps a 1200 mm pile from being
  // priced like a 600 mm one.
  const diaFactor = Math.pow(holeDia / nominal, DIA_PAY_EXPONENT[method.id] ?? 0.55);
  const difficultyFactor = 0.92 + 0.09 * difficulty;
  const drillValue = metres * method.basePayPerMetre * groundFactor * diaFactor
    * region.payMult * difficultyFactor;
  // The fixed item does not care how hard the ground is — moving the rig over
  // the next peg and setting up costs what it costs — but it does care where
  // you are and how awkward the method is to stand up.
  const holeValue = holes * (method.payPerHole || 0)
    * region.payMult * difficultyFactor * Math.pow(clamp(holeDia / nominal, 0.4, 3.2), 0.5);
  // Pullback: paid on the product pipe that goes in behind the reamer, so it
  // scales with the pipe and not with the pilot.
  const pullbackValue = method.pullbackPerMetre
    ? metres * method.pullbackPerMetre * region.payMult * difficultyFactor
      * Math.pow(clamp(holeDia / nominal, 0.4, 3.2), 1.35)
    : 0;
  // MOB / DEMOB. Every real tender for this work prices bringing the spread to
  // site and standing it up as its own lump-sum item, and the game was not
  // paying it at all — it only paid for the distance travelled. That is
  // survivable on a EUR 95,000 crawler and fatal on a EUR 4.85 M derrick that
  // "arrives in twenty-two loads and takes a week to rig up": economy.js was
  // charging about EUR 85,000 to rig that machine up and the client was paying
  // EUR 3,725 towards it, which is most of the reason a well ran at a loss.
  //
  // Priced against the CHEAPEST machine that can legally run the method, at 80 %
  // of what standing it up costs, so the client covers the reasonable spread and
  // the player carries the rest — bring a bigger rig than the job needs and the
  // difference comes out of your margin, which is the correct decision to put in
  // front of a contractor.
  const refRig = method.rigIds
    .map(getRig).filter(Boolean)
    .sort((a, b) => a.price - b.price)[0];
  const rigUp = refRig ? refRig.price * 0.0035 * method.difficulty : 0;
  // 75 %, and no flat allowance on top of it: the client pays most of standing
  // the spread up and the contractor carries the rest, which is what makes one
  // day's work on a big machine a bad job and a long run on it a good one.
  const mobilisation = (region.travelCost * 0.35
    + (rigUp + (method.plantMob || 0)) * 0.75) * region.payMult;
  const payout = Math.round((drillValue + holeValue + pullbackValue + mobilisation) / 50) * 50;

  const hours = estimateHours(method.id, metres, hardness, holes);
  // The deadline used to be `1.95 - 0.13 × difficulty` and nothing else, so a
  // card's clock was a restatement of its difficulty pips. The constraint is
  // what sets the programme now, and the difficulty term is kept small.
  // …and never below the estimate itself: a tight programme is a decision, an
  // impossible one is a broken card. The floor is what keeps `deadlineMul`
  // free to be aggressive.
  const deadlineHours = Math.max(6, Math.round(Math.max(
    hours * 1.08,
    hours * (1.72 - 0.07 * difficulty) * (constraint.deadlineMul ?? 1))));

  // The Talent-native half of the posting: rig type, class, water depth,
  // rotation and day rate. Empty for everything except `oil-rotary`.
  const posting = buildJobPosting(method, region, applicationId, targetDepth, rand, archetypeId);

  // What the hole is FOR, when it is for something. Passed straight through to
  // world/geology.js, which places the body and draws the assay track.
  const oreJob = ORE_APPLICATIONS.includes(applicationId);
  const confBand = ORE_CONFIDENCE[applicationId] || null;
  const oreConfidence = confBand ? +rand.range(confBand[0], confBand[1]).toFixed(2) : 0;
  // A stage only where the hole is drilled FOR the assay. A production ring, a
  // service raise and a bench pattern are all filed under `mining` and none of
  // them returns a sample, so none of them is an exploration programme — the
  // board advertised a service raise as "grade control inside a modelled body"
  // until this list existed.
  const oreStage = oreJob && ORE_SAMPLE_METHODS.includes(method.id)
    ? ORE_STAGES.find((s) => oreConfidence < s.max) || ORE_STAGES[ORE_STAGES.length - 1]
    : null;

  // Method-shaped extras the sim reads and defaults sensibly without.
  //   faceAreaM2  a heading's cross-section — about 1.4 blastholes per m2.
  //   holeLengthM one hole out of a longhole ring, as against the ring total.
  //   waterTableM where the water stands, which is what a CPT's u2 trace is
  //               measured against.
  const extras = {};
  if (method.id === 'tunnel-jumbo') extras.faceAreaM2 = Math.round(rand.range(14, 120));
  if (method.id === 'longhole') extras.holeLengthM = +rand.range(12, 30).toFixed(1);
  if (method.id === 'site-investigation') extras.waterTableM = +rand.range(0.8, 6.5).toFixed(1);

  const certSet = new Set([...region.requiredCerts, ...(APPLICATION_CERTS[applicationId] || [])]);
  // No well is drilled by anyone without a live well-control ticket, whether
  // the job is filed under oil & gas or under offshore / marine.
  if (method.id === 'oil-rotary') certSet.add('iwcf-well-control');
  // A vessel-based unit is crewed under the seafarer medical as well.
  if (posting.rigType && VESSEL_RIG_TYPES.includes(posting.rigType)) certSet.add('eng1');
  if (constraint.id === 'certified' && extraCert) certSet.add(extraCert);

  const titles = (CONTRACT_TITLES_BY_METHOD[method.id] || {})[applicationId];
  const title = posting.wellType || (titles ? rand.pick(titles) : `${method.name} works`);

  /* WHO IS BUYING. A flat per-region list picked uniformly put a farm, a
     network operator and a mine on the same three jobs; 30 % of card pairs on a
     board shared a client for no reason but arithmetic. The application decides
     the sort of organisation, and the region's roster supplies the name.

     The order inside APPLICATION_CLIENT_KINDS is a preference, not a set: a
     village supply borehole is usually bought by a council and occasionally by
     a sawmill, and picking uniformly across the three made it a sawmill a third
     of the time. */
  const wantKinds = APPLICATION_CLIENT_KINDS[applicationId] || [];
  let roster = region.clientRoster.filter((c) => wantKinds.includes(c.kind));
  if (!roster.length) roster = region.clientRoster;
  const clientEntry = weightedPick(roster, (c) => {
    const rank = wantKinds.indexOf(c.kind);
    return rank < 0 ? 1 : 1 / (1 + rank);
  }, rand);

  // The sentence comes from the archetype, not from the region, so the copy
  // and the place cannot drift apart. validateData() guarantees the bucket
  // exists for every archetype the region declares.
  const siteLines = (SITE_LINES[region.id] || {})[archetypeId];
  const siteLine = siteLines && siteLines.length
    ? rand.pick(siteLines)
    : (archetype ? archetype.description : 'site');

  const id = `ct-${region.id}-${method.id}-${Math.floor(rand.f() * 0xffffff).toString(36)}`;

  const contract = {
    id,
    title,
    client: clientEntry.name,
    /** Which sort of organisation is buying — CLIENT_KINDS. */
    clientKind: clientEntry.kind,
    regionId: region.id,
    applicationId,
    methodId: method.id,
    requiredMethod: method.id,
    /**
     * THE PHYSICAL SETTING — a SITE_ARCHETYPES id. **`world/terrain.js` builds
     * the scene from this**, not from `regionId`: the region supplies the
     * biome (forest, dune, snow, altitude), the archetype supplies the site.
     * Two contracts in the same region are now allowed to look completely
     * different, which is the whole point of the field.
     */
    archetype: archetypeId,
    /** 'surface' | 'underground' | 'offshore' — the shortcut terrain.js needs first. */
    sitePlane: archetype ? archetype.plane : 'surface',
    targetDepth,
    holeDia,
    holes,
    metres,
    /** What one of `holes` actually is. A pile, a ring, a drive, a heading. */
    unitNoun: UNIT_NOUN[method.id] || 'hole',
    /* WHAT COMES BACK UP THE HOLE — copied from the method row, because the
       contract is what the sim is handed.

       It was never copied, so `state.drill.flushMedium` published NULL for
       every method, always. `sim/drilling.js` warns once and names this fix;
       every consumer meanwhile fell back to its own per-method table, which is
       three tables describing one thing. Measured on a live DRILL_TICK across
       six methods before this line existed: null, six times out of six. */
    flushMedium: method.flushMedium || null,
    groundSpec,
    hardness: +hardness.toFixed(3),
    abrasivity: +groundAbrasivity(groundSpec).toFixed(3),
    payout,
    bonus: {
      time: Math.round(payout * 0.12 * (constraint.timeBonusMul ?? 1) / 10) * 10,
      quality: Math.round(payout * 0.15 * (constraint.qualityBonusMul ?? 1) / 10) * 10,
    },
    estimatedHours: +hours.toFixed(1),
    deadlineHours,
    difficulty,
    requiredCerts: [...certSet],
    /** WHAT MAKES THIS ONE HARD. `id` and `label` are safe to show as a pill. */
    constraint: { id: constraint.id, label: constraint.label },
    /** A geology.js commodity id, 'auto', or null when the hole is just a hole. */
    commodity: oreJob ? 'auto' : null,
    /** 0..1 — how well the body is known. Never a grade, and never printed as one. */
    oreConfidence,
    /** The stage of the campaign, in words. Null when the hole is just a hole. */
    oreStage: oreStage ? { id: oreStage.id, label: oreStage.label } : null,
    ...extras,
    ...posting,
    reputationReward: Math.round(12 + difficulty * 9 + region.unlockLevel * 0.8),
    seed: Math.floor(rand.f() * 0x7fffffff),
  };
  // `ctx` carries the region-shaped nouns the constraint clauses drop into
  // their sentences; without it they printed "undefined through the middle of
  // the section", which is exactly the class of bug this whole pass is about.
  contract.description = describeContract({
    ...ctx, ...contract, method, region, constraint, oreStage, siteLine,
    clientKind: clientEntry.kind, client: clientEntry.name, posting,
  });
  return contract;
}

/**
 * A board of contracts for a region.
 *
 * Variety is preferred but never at the cost of a short board: early on there
 * is only one method available, and the player should still see a full page of
 * jobs at different sites and depths.
 *
 * The old dedupe key was `method:application` and nothing else, so five cards
 * could and did share a client, a constraint and a shape while passing it. The
 * key is now everything the player reads off the front of a card, and the board
 * is filled in two passes: strict first, then relaxed, so a region with one
 * method still fills five rows.
 */
export function makeContractBoard(regionId, level, rand, count = 5) {
  const out = [];
  const strict = new Set();
  const loose = new Set();
  const spare = [];
  const keyOf = (c) => `${c.methodId}:${c.applicationId}:${c.constraint.id}:${c.client}`;
  const looseKey = (c) => `${c.methodId}:${c.applicationId}`;
  const countBy = (f, v) => out.reduce((n, o) => n + (f(o) === v ? 1 : 0), 0);

  for (let i = 0; i < count * 8 && out.length < count; i++) {
    const c = makeContract(regionId, level, rand);
    // A title repeated on one board is the thing the player notices first.
    if (out.some((o) => o.title === c.title) || strict.has(keyOf(c))) { spare.push(c); continue; }
    // A board is a market, not one client's shopping list, and it should not
    // be hard in the same way five times over.
    if (countBy((o) => o.client, c.client) >= 2) { spare.push(c); continue; }
    if (countBy((o) => o.constraint.id, c.constraint.id) >= 2) { spare.push(c); continue; }
    // …and two cards from the same trade need a different reason to exist.
    if (loose.has(looseKey(c)) && out.some((o) => o.constraint.id === c.constraint.id)) {
      spare.push(c); continue;
    }
    strict.add(keyOf(c));
    loose.add(looseKey(c));
    out.push(c);
  }
  // Relax, in the order that keeps the most information: prefer a spare whose
  // title is still new to the board, then anything at all.
  while (out.length < count && spare.length) {
    const i = spare.findIndex((c) => !out.some((o) => o.title === c.title));
    out.push(spare.splice(i >= 0 ? i : 0, 1)[0]);
  }
  while (out.length < count) out.push(makeContract(regionId, level, rand));
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUERY HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const byId = (arr) => { const m = new Map(); for (const x of arr) m.set(x.id, x); return m; };
const METHOD_MAP = byId(METHODS);
const RIG_MAP = byId(RIGS);
const ITEM_MAP = byId(ITEMS);
const REGION_MAP = byId(REGIONS);
const CERT_MAP = byId(CERTS);
const ROLE_MAP = byId(ROLES);
const SKILL_MAP = byId(SKILLS);
const APP_MAP = byId(APPLICATIONS);
const ARCHETYPE_MAP = byId(SITE_ARCHETYPES);
const SLOT_MAP = byId(SLOTS);

export const getMethod = (id) => METHOD_MAP.get(id) || null;
export const getRig = (id) => RIG_MAP.get(id) || null;
export const getItem = (id) => ITEM_MAP.get(id) || null;
export const getRegion = (id) => REGION_MAP.get(id) || null;
export const getCert = (id) => CERT_MAP.get(id) || null;
export const getRole = (id) => ROLE_MAP.get(id) || null;
export const getSkill = (id) => SKILL_MAP.get(id) || null;
export const getApplication = (id) => APP_MAP.get(id) || null;
export const getSlot = (id) => SLOT_MAP.get(id) || null;
/** A SITE_ARCHETYPES row — what `contract.archetype` points at. */
export const getArchetype = (id) => ARCHETYPE_MAP.get(id) || null;

/** Every item that fits a slot, newest-unlocking last. */
export function itemsForSlot(slot, { level = MAX_LEVEL, methodId = null } = {}) {
  return ITEMS.filter((i) =>
    i.slot === slot &&
    i.unlockLevel <= level &&
    (!methodId || i.methods.length === 0 || i.methods.includes(methodId)));
}

/** Every item usable by a method (an empty `methods` array means universal). */
export function itemsForMethod(methodId, { level = MAX_LEVEL, slot = null } = {}) {
  return ITEMS.filter((i) =>
    i.unlockLevel <= level &&
    (!slot || i.slot === slot) &&
    i.methods.includes(methodId));
}

/** Items in one taxonomy path (exact match) or super-group (prefix match). */
export function itemsInCategory(path) {
  return ITEMS.filter((i) => i.category === path || i.category.startsWith(`${path} `));
}

/** Everything unlocked exactly at `level`. */
export function unlockedAt(level) {
  return LEVELS.unlocks[level] || { methods: [], rigs: [], regions: [], items: [], certs: [], role: null, skillPoints: 0 };
}

/** Everything available at or below `level`. */
export function unlockedUpTo(level) {
  return {
    methods: METHODS.filter((m) => m.unlockLevel <= level).map((m) => m.id),
    rigs: RIGS.filter((r) => r.unlockLevel <= level).map((r) => r.id),
    regions: REGIONS.filter((r) => r.unlockLevel <= level).map((r) => r.id),
    items: ITEMS.filter((i) => i.unlockLevel <= level).map((i) => i.id),
    certs: CERTS.filter((c) => c.minLevel <= level).map((c) => c.id),
  };
}

/**
 * Shop stock the player can both see and pay for right now.
 * @param {import('../core/contract.js').GameState|Object} state
 */
export function affordable(state) {
  const money = state?.player?.money ?? 0;
  const level = state?.player?.level ?? 1;
  return ITEMS.filter((i) => i.unlockLevel <= level && i.price <= money);
}

/** Shop stock visible at the player's level (affordable or not). */
export function shopFor(state) {
  const level = state?.player?.level ?? 1;
  const owned = new Set(state?.garage?.owned ?? []);
  return ITEMS
    .filter((i) => i.unlockLevel <= level)
    .map((i) => ({
      item: i,
      owned: owned.has(i.id),
      affordable: (state?.player?.money ?? 0) >= i.price,
    }));
}

/** Rigs the player could buy at this level. */
export function rigsFor(state) {
  const level = state?.player?.level ?? 1;
  const owned = new Set(state?.unlocked?.rigs ?? []);
  return RIGS.filter((r) => r.unlockLevel <= level).map((r) => ({
    rig: r, owned: owned.has(r.id), affordable: (state?.player?.money ?? 0) >= r.price,
  }));
}

/** Can this item legally go in this slot for the currently-selected method? */
export function canEquip(state, slot, itemId) {
  const item = getItem(itemId);
  if (!item) return { ok: false, reason: 'No such item' };
  // Name the BAY, not the slot id: the cutting bay is "Cutting tool", and a
  // split spoon refused from it should say so in the words on the screen.
  if (item.slot !== slot) {
    const bay = getSlot(slot);
    const fits = getSlot(item.slot);
    return {
      ok: false,
      reason: `${item.name} does not go in the ${bay ? bay.name.toLowerCase() : slot} bay`
        + (fits ? ` — it is ${fits.name.toLowerCase()}` : ''),
    };
  }
  if ((state?.player?.level ?? 1) < item.unlockLevel) return { ok: false, reason: `Requires level ${item.unlockLevel}` };
  if (!(state?.garage?.owned ?? []).includes(itemId)) return { ok: false, reason: 'Not owned' };
  const rig = getRig(state?.garage?.rigId);
  const methodId = state?.contract?.methodId || (rig ? rig.methods[0] : null);
  if (methodId && item.methods.length && !item.methods.includes(methodId)) {
    return { ok: false, reason: `Not rated for ${getMethod(methodId)?.shortName ?? methodId}` };
  }
  return { ok: true, reason: '' };
}

/** The highest role the player has earned at `level`. */
export function roleForLevel(level) {
  let best = ROLES[0];
  for (const r of ROLES) if (r.level <= level) best = r;
  return best;
}

/** The next role above `level`, or null at the top of the ladder. */
export function nextRole(level) {
  return ROLES.find((r) => r.level > level) || null;
}

/** Certificates required to work a region, including its applications. */
export function certsForRegion(regionId) {
  const region = getRegion(regionId);
  if (!region) return [];
  const set = new Set(region.requiredCerts);
  for (const app of region.applications) for (const c of (APPLICATION_CERTS[app] || [])) set.add(c);
  return [...set].map(getCert).filter(Boolean);
}

/**
 * Rigs that can run a method, **in the method's own order of preference**.
 *
 * This used to be `RIGS.filter(...)`, which returns them in *rig declaration*
 * order and silently discarded the ordering the method already expresses in its
 * `rigIds`. The visible consequence: `rockbolt` lists
 * `['bolter', 'longhole-rig', 'tunnel-jumbo']` — the bolter first, because a
 * bolter is the machine that does the job — but `tunnel-jumbo` is declared
 * earlier in `RIGS`, so **every rockbolt scene rendered a tunnel jumbo**. That
 * fails `REVIEW_RUBRIC.md`'s `rockbolt` row on its own ("a boom pointing UP"),
 * and it also broke the lighting: the jumbo's boom lamps are solved for a face
 * 13 m away, while a bolter's feed lamp aims 3.5 m straight up at the back — so
 * the drive measured as the darkest of the three.
 *
 * `rigIds` is the authority for order. Anything able to run the method but not
 * named there follows, in declaration order, so nothing is lost.
 */
export function rigsForMethod(methodId) {
  const able = RIGS.filter((r) => r.methods.includes(methodId));
  const pref = getMethod(methodId)?.rigIds || [];
  if (!pref.length) return able;
  const rank = (r) => { const i = pref.indexOf(r.id); return i === -1 ? pref.length : i; };
  return able.slice().sort((a, b) => rank(a) - rank(b));
}

/** Methods a rig can run. */
export function methodsForRig(rigId) {
  const rig = getRig(rigId);
  return rig ? rig.methods.map(getMethod).filter(Boolean) : [];
}

/** Free-text search across the shop (name, category, thread, material). */
export function searchItems(query, { level = MAX_LEVEL } = {}) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  return ITEMS.filter((i) => i.unlockLevel <= level && (
    i.name.toLowerCase().includes(q) ||
    i.category.toLowerCase().includes(q) ||
    i.thread.toLowerCase().includes(q) ||
    i.material.toLowerCase().includes(q)));
}

/** Split a taxonomy path into its three parts for breadcrumb UI. */
export function splitCategory(path) {
  const parts = String(path).split(' → ');
  return { superGroup: parts[0] || '', family: parts[1] || '', subcategory: parts[2] || '' };
}

/** All distinct super-groups present in the shop, in canonical order. */
export function shopSuperGroups() {
  const order = Object.values(SUPERGROUPS);
  const present = new Set(ITEMS.map((i) => splitCategory(i.category).superGroup));
  return order.filter((g) => present.has(g));
}

/** Families inside a super-group that actually contain stock. */
export function familiesIn(superGroup) {
  const set = new Set();
  for (const i of ITEMS) {
    const p = splitCategory(i.category);
    if (p.superGroup === superGroup) set.add(p.family);
  }
  return [...set];
}

/** Default loadout for a method: the cheapest owned-or-startable valid item. */
export function defaultLoadoutFor(methodId, level = 1) {
  const method = getMethod(methodId);
  const out = {};
  if (!method) return out;
  for (const slot of method.toolSlots) {
    const options = itemsForMethod(methodId, { level, slot }).sort((a, b) => a.price - b.price);
    out[slot] = options.length ? options[0].id : null;
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PHYSICAL RULES — the mistakes that have already shipped, written as rules.

   Each constant below encodes an error this file has actually carried, at least
   one of which came back after being fixed. `validateData()` enforces them, so
   the next time somebody files a sampler as a bit or hangs a drill rod off a
   wire rope the data fails loudly instead of shipping a claim a driller can
   read off the screen.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Subcategories whose tools are DRIVEN, PUSHED or INSTALLED — never rotated or
 * struck to cut ground. Nothing in them may sit in the cutting bay, and nothing
 * outside them belongs in the probe bay.
 *
 * THE SPT/CPT LANDMINE. An SPT split spoon is a test and a sampler: a 63.5 kg
 * hammer falls 760 mm and N is the blow count for the last 300 mm. A CPT cone
 * is a sensor pushed at 20 mm/s that makes no hole, no cuttings and no sample.
 * Both were filed as bits, both were fixed, and both came back.
 * (research/06-geotech-water-geothermal.md §5, [D1586] / [D5778].)
 */
const BAY_CATEGORIES = deepFreeze({
  // Driven samplers and pushed cones.
  probe: [CAT.sptSamplers, CAT.cpt, CAT.linerSamplers, CAT.wellScreens],
  // The RC sample train.
  sample: [CAT.sampling],
  // What is left in the ground on purpose.
  install: [CAT.precastPiles, CAT.bearingPiles, CAT.sheetPiles, CAT.drivenPipePiles,
            CAT.rockBolts, CAT.cableBolts],
  // The wear part between a piling hammer and a pile head.
  dolly: [CAT.pileHelmets],
});

/**
 * Everything that is DRIVEN, PUSHED, PLACED or LEFT IN THE GROUND — and
 * therefore never a cutting tool, whatever bay it ends up in. A pile is not a
 * bit, a rock bolt is not a bit, and a split spoon is emphatically not a bit.
 */
const NON_CUTTING_CATEGORIES = deepFreeze(
  Object.values(BAY_CATEGORIES).flat().filter((c) => c !== CAT.pileHelmets));

/**
 * The five ways a hole is drawn in section, from GAMEDESIGN.md §7 and
 * METHOD_IDS.md. world/geology.js owns the renderer and its own method→mode
 * table; this list is what a method is allowed to ask for.
 */
const SECTION_MODES = deepFreeze(['vertical', 'profile', 'raise', 'heading', 'pile']);

/**
 * A PLATFORM DECK IS A PRODUCING INSTALLATION, AND THE ONLY DRILLING DONE THERE
 * IS THE WELL.
 *
 * research/17 §2: *"An oil rig drills; a platform produces"*, and *"offshore
 * geotechnical site investigation is real but is done from a jack-up or a
 * dedicated geotechnical vessel, not from a production deck."* The archetype
 * layer already separates `platform-deck` from `marine-spread`; this is the
 * rule that keeps them separate as the pairings loosen. It exists because the
 * offshore pre-collar (`OFFSHORE_PRE_COLLAR_M`) deliberately opens the whole
 * offshore plane up, and the next method to be given an offshore archetype must
 * not be able to land on the drill floor of a production platform by accident.
 */
const PRODUCTION_DECK_APPLICATIONS = deepFreeze(['oil-gas', 'offshore-marine']);

/**
 * THE THREE OVERBURDEN CASING FAMILIES ARE NOT EACH OTHER, AND THEIR COPY MAY
 * NOT BORROW EACH OTHER'S WORDS.
 *
 * `PLATFORM_TRUTH.md` Part C §2 forbids this conflation by name, and it shipped
 * anyway: `ecc-140-hd` read *"HD eccentric with a hardened **wing pivot**"*,
 * which is an eccentric system described with the wing-bit family's mechanism.
 * The geometry the three actually have is the whole distinction —
 *
 *   - **eccentric** (Odex type): a reamer swung OFF-CENTRE, retracted in line
 *     so the string comes back up through the casing.
 *   - **wing-bit**: FOLDING WINGS on HINGE pins, which retract so the bit is
 *     recovered and reused. A wing bit is not a lost bit.
 *   - **concentric** (Symmetrix type) and **ring-bit**: a pilot and a ring bit
 *     on ONE centreline with NO hinge and nothing swinging; the ring is left in
 *     the ground and the pilot comes home.
 *
 * `forbid` is the vocabulary that belongs to one of the OTHER families. A bare
 * comparison ("a straighter hole than eccentric") is not a claim about the item
 * and is deliberately not matched — only the mechanism words are.
 */
const OVERBURDEN_FAMILY_COPY = deepFreeze([
  { cat: CAT.eccentricSys, family: 'an eccentric system',
    forbid: /\bwing|\bfold(?:s|ed|ing)?\b|\bhinge/i,
    why: 'folding wings on a hinge are the WING-BIT family; an eccentric swings a reamer off-centre on its own pivot' },
  { cat: CAT.wingBitSys, family: 'a wing-bit system',
    forbid: /\boff-centre\b|\beccentric\b|\blost bit\b|\bsacrificial\b|\bleft in the (?:ground|hole)\b/i,
    why: 'a wing bit is retracted and REUSED — it is neither eccentric nor a lost bit (FACTS_VERIFIED.md)' },
  { cat: CAT.concentricSys, family: 'a concentric system',
    forbid: /\bwing|\bfold(?:s|ed|ing)?\b|\bhinge|\beccentric reamer\b|\bswings? (?:out|off-centre)\b/i,
    why: 'a concentric system is a pilot and a ring bit on one centreline, with no hinge and nothing that swings' },
  { cat: CAT.ringBitSys, family: 'a ring-bit system',
    forbid: /\bwing|\bfold(?:s|ed|ing)?\b|\bhinge|\beccentric\b|\bswings? (?:out|off-centre)\b/i,
    why: 'a ring bit is concentric and is left in the ground; the swinging and folding belong to the other two families' },
]);

/**
 * THE GROUND THAT DEFEATS PLAIN CFA IS THE REASON CASED CFA EXISTS.
 *
 * `cfa.validGround` carried `till`, against its own research pack.
 * research/05-foundation-piling.md §A6, `[TOM]` §2.4.2: *"Standard CFA may fail
 * to penetrate stiff clayey soils and glacial till, with refusal before design
 * depth"*; and `[BAU-CFA]`'s application envelope is *"cohesive, friable soils.
 * **No boulders.**"* The game says the same thing in its own voice —
 * FACTS_VERIFIED.md: *"Glacial till hides boulders. The torque spike arrives
 * before you hear anything."*
 *
 * §A7 is the other half: the double-rotary system *"overcomes exactly the
 * ground that defeats plain CFA — stiff clayey soils and glacial till."* So the
 * two rows must stay in that relationship — plain CFA drills a subset of what
 * the cased machine drills, and the difference is what the player is paying the
 * second rotary head for.
 */
const CFA_REFUSES = deepFreeze(['till', 'boulder']);

/**
 * METHODS THAT HONESTLY REACH ONE REGION, AND WHY.
 *
 * The reach rule below refuses a method that can be run in fewer than two
 * regions, because that is usually a pairing mistake. It is not always. This
 * table is the exception list, it is deliberately hard to add to — an entry has
 * to say what the WORLD is missing, not what the method wants — and it is
 * self-cleaning: a method listed here that reaches two regions fails validation
 * until the entry is deleted.
 */
const SOLE_REGION_METHODS = Object.freeze({
  cfa: 'Plain CFA is the inner-city pile (research/17 §4: "quick, quiet and '
    + 'cost-effective… ideal for inner-city and high-rise construction") and it '
    + 'needs cohesive, boulder-free soil at least a pile deep. Once `till` came '
    + 'off its ground list — see CFA_REFUSES — the only region left with such a '
    + 'bed AND a foundation trade to sell is `german-site`; nordic and alpine '
    + 'had only ever qualified through the till bed the research forbids, and '
    + 'both still buy the same work as `cased-cfa` and `driven-pile`, which is '
    + 'the correct answer for glacial ground. THE FIX IS A SECOND SOFT-GROUND '
    + 'URBAN REGION, not letting CFA back into till. That needs a ground recipe '
    + 'in world/geology.js and a biome in world/terrain.js as well as a row '
    + 'here, so it is recorded rather than done.',
});

/** Slots in the load path between the machine and the ground. */
const LOAD_PATH_SLOTS = deepFreeze(['bit', 'rod', 'coupling', 'shank', 'casing', 'hammer']);

/** Slots that only exist because there is a threaded string to build. */
const DRILL_STRING_SLOTS = deepFreeze(['rod', 'coupling', 'shank']);

/**
 * Connection vocabularies, scoped per segment (DOMAIN.md §4). A rod and a shank
 * from different families do not mate, and the data must not pretend otherwise:
 * an R32 percussion rod cannot be driven by an auger's hex, and a QL/DHD shank
 * only exists where there is a down-the-hole hammer to couple to.
 */
// An ITEM names a specific connection: R25–R51, T38–T127, H55–H114, or a
// down-the-hole shank.
const PERCUSSION_THREAD = /\b(?:R(?:25|28|32|38|44|51)|G?T(?:38|45|51|60|76|90|100|127)|H(?:55|64|66|90|92|112|114))\b/i;
const DTH_SHANK_THREAD = /\b(?:QL\d{2,3}|DHD\d{3})\b/i;
// A METHOD names the family it runs, in the shorthand a driller uses for it —
// "R/T percussion", "SDA hollow bar R/T", "DHD-QL shank".
const PERCUSSION_VOCAB = /\bpercussion\b|\bR\s*[/-]\s*T\b|\bhollow bar\b|\b(?:R(?:25|28|32|38|44|51)|G?T(?:38|45|51|60|76|90|100|127)|H(?:55|64|66|90|92|112|114))\b/i;
const DTH_SHANK_VOCAB = /\b(?:QL|DHD)\b/i;

/**
 * A screwed casing joint, and the hand it is cut.
 *
 * Casing is cut LEFT hand, because the drill string turns right hand inside it
 * and a right-hand joint would be backed off every metre of the hole — so the
 * hand is load-bearing information and may never be left out. Any casing
 * genuinely cut right hand must say RH and mean it.
 *
 * The profile word alone is not enough to identify a casing joint: a multi-tube
 * jet grouting rod is also cut on an "RHT conical" thread and is not casing at
 * all, so the rule asks for the profile AND the word casing, and it accepts the
 * RHT/LHT form the jet and duplex catalogues use.
 */
const CASING_JOINT_PROFILE = /\b(?:cone-ring|conical|cylindrical|welded-thread|trapezoidal)\b/i;
const CASING_JOINT_THREAD = /\bcasing\b/i;
const THREAD_HAND = /\b(?:LH|RH|LHT|RHT)\b/;

/** Integrity check — used by tests and the QA bridge. */
export function validateData() {
  const problems = [];
  const methodIds = new Set(METHODS.map((m) => m.id));
  const groundIds = new Set(Object.keys(GROUND));
  const slotIds = new Set(SLOTS.map((s) => s.id));
  const regionIds = new Set(REGIONS.map((r) => r.id));
  const appIds = new Set(APPLICATIONS.map((a) => a.id));
  const certIds = new Set(CERTS.map((c) => c.id));
  const archIds = new Set(SITE_ARCHETYPES.map((a) => a.id));

  /**
   * SITE ARCHETYPES — every row that takes part in the pairing rule declares a
   * physical setting, and declares one this file knows about. Without this the
   * whole layer is optional: a method with no `archetypes` would silently be
   * refused every region, and a typo would do the same thing without saying so.
   */
  const declaresArchetypes = (kind, row) => {
    if (!Array.isArray(row.archetypes) || !row.archetypes.length) {
      problems.push(`${kind} ${row.id}: declares no site archetype — it is the physical setting the work happens in, and world/terrain.js renders from it`);
      return;
    }
    for (const a of row.archetypes) {
      if (!archIds.has(a)) problems.push(`${kind} ${row.id}: unknown site archetype ${a}`);
    }
  };
  for (const a of SITE_ARCHETYPES) {
    if (!['surface', 'underground', 'offshore'].includes(a.plane)) {
      problems.push(`archetype ${a.id}: plane "${a.plane}" is not surface | underground | offshore`);
    }
  }

  for (const m of METHODS) {
    for (const g of m.validGround) if (!groundIds.has(g)) problems.push(`method ${m.id}: unknown ground ${g}`);
    for (const s of m.toolSlots) if (!slotIds.has(s)) problems.push(`method ${m.id}: unknown slot ${s}`);
    for (const a of m.applications) if (!appIds.has(a)) problems.push(`method ${m.id}: unknown application ${a}`);
    for (const r of m.rigIds) if (!RIG_MAP.has(r)) problems.push(`method ${m.id}: unknown rig ${r}`);
    declaresArchetypes('method', m);
    /**
     * THE UNDERGROUND RULE. A jumbo, a bolter, a longhole rig and a raise borer
     * are machines that live at a level underground, and the two lists that say
     * so — `UNDERGROUND_METHODS`, which strips the drift out of the ground
     * column, and `archetypes`, which decides the site — must never disagree.
     * If they do, either a surface site is generated for an underground machine
     * or an underground column is generated for a surface one, and both look
     * exactly as foolish as they sound.
     */
    const onlyUnder = Array.isArray(m.archetypes)
      && m.archetypes.length === 1 && m.archetypes[0] === 'underground-drive';
    if (UNDERGROUND_METHODS.includes(m.id) && !onlyUnder) {
      problems.push(`method ${m.id}: is an UNDERGROUND method and must declare exactly ['underground-drive'] — it declares [${(m.archetypes || []).join(', ')}], so the generator can put it on a surface site`);
    }
    if (onlyUnder && !UNDERGROUND_METHODS.includes(m.id)) {
      problems.push(`method ${m.id}: declares only 'underground-drive' but is not in UNDERGROUND_METHODS, so buildGroundColumn() will hand it a surface column starting at topsoil`);
    }
    /**
     * RULE — THE PLATFORM DECK IS FOR THE WELL AND NOTHING ELSE. See
     * PRODUCTION_DECK_APPLICATIONS. An oil rig drills; a platform produces, and
     * the seabed boreholes that precede both are drilled from a jack-up or a
     * geotechnical vessel — the `marine-spread` — not off a production deck.
     */
    if ((m.archetypes || []).includes('platform-deck')
        && !m.applications.some((a) => PRODUCTION_DECK_APPLICATIONS.includes(a))) {
      problems.push(`method ${m.id}: declares the 'platform-deck' site but serves none of ${PRODUCTION_DECK_APPLICATIONS.join(' / ')} — a production deck's drill floor is there for the well, and everything else offshore works off a 'marine-spread' (research/17 §2)`);
    }
    /**
     * RULE — A BLAST HOLE IS AS DEEP AS THE BENCH. A method that drills a blast
     * pattern must have a depth window for it, and one no deeper than a bench
     * plus its sub-drill. Without this, `dth`'s 20-300 m WELL rating was shared
     * with its quarry work and the board generated 259 m "Deep blast holes".
     * See BLAST_PATTERN_DEPTH_M for the sources.
     */
    if (BLAST_PATTERN_METHODS.includes(m.id)) {
      for (const a of BLAST_PATTERN_APPLICATIONS) {
        if (!m.applications.includes(a)) continue;
        const hi = depthWindow(m, a)[1];
        if (hi > BLAST_PATTERN_DEPTH_M[1]) {
          problems.push(`method ${m.id}: drills a blast pattern for ${a} to ${hi} m — a production blast hole is the bench plus its sub-drill, ${BLAST_PATTERN_DEPTH_M[0]}-${BLAST_PATTERN_DEPTH_M[1]} m, and nobody drills a ${Math.round(hi)} m blast hole`);
        }
      }
    }
    // …and a window that is declared must be a real window, on an application
    // the method actually serves.
    for (const [a, row] of Object.entries(DEPTH_BY_METHOD_APPLICATION[m.id] || {})) {
      if (!m.applications.includes(a)) {
        problems.push(`method ${m.id}: declares a depth window for ${a}, which it does not serve`);
        continue;
      }
      const windows = Array.isArray(row) ? [['every site', row]] : Object.entries(row);
      for (const [where, w] of windows) {
        if (where !== 'every site' && !archIds.has(where)) {
          problems.push(`method ${m.id}: depth window for ${a} names unknown site archetype ${where}`);
        }
        if (!(Array.isArray(w) && w.length === 2 && w[0] > 0 && w[1] > w[0])) {
          problems.push(`method ${m.id}: depth window for ${a} at ${where} is not a [min, max] in metres`);
        }
      }
    }
    // THE ECONOMIC FIELDS. Every one of these was a hole the balance fell
    // through once, so every one of them fails loudly now rather than quietly
    // costing a method its margin.
    if (!(m.basePayPerMetre > 0)) problems.push(`method ${m.id}: basePayPerMetre must be > 0`);
    if (!(m.payPerHole >= 0)) problems.push(`method ${m.id}: payPerHole must be a number >= 0 (0 is legal for a one-hole method)`);
    if (!(m.crewSize >= 1)) problems.push(`method ${m.id}: crewSize must be at least 1 — the player`);
    if (!(m.plantMob >= 0)) problems.push(`method ${m.id}: plantMob must be a number >= 0`);
    if (!(m.setupPerHole >= 0)) problems.push(`method ${m.id}: setupPerHole must be hours >= 0`);
    if (!(m.nominalRop > 0)) problems.push(`method ${m.id}: nominalRop must be > 0`);
    if (m.pullbackPerMetre !== undefined && !(m.reamPasses > 0)) {
      problems.push(`method ${m.id}: pullbackPerMetre without reamPasses — the pullback would be paid for and never take any time`);
    }
    // Cost must never scale with diameter faster than pay, or the method is a
    // guaranteed loss at the top of its own hole-diameter range.
    const payExp = DIA_PAY_EXPONENT[m.id] ?? 0.55;
    const costExp = MATERIAL_DIA_EXPONENT[m.id];
    if (costExp !== undefined && costExp > payExp + 1e-9) {
      problems.push(`method ${m.id}: materials scale at D^${costExp} but pay scales at D^${payExp} — a wide hole is an unavoidable loss`);
    }
    // The section mode has to be one world/geology.js can actually draw, and
    // the primary tool bay has to be a bay the method carries — otherwise the
    // shop advertises a method whose defining tool it does not stock.
    if (!SECTION_MODES.includes(m.sectionMode)) {
      problems.push(`method ${m.id}: sectionMode "${m.sectionMode}" is not one of ${SECTION_MODES.join(' | ')}`);
    }
    if (!m.toolSlots.includes(m.primaryToolSlot)) {
      problems.push(`method ${m.id}: primaryToolSlot "${m.primaryToolSlot}" is not one of its own toolSlots`);
    }
    if (!(typeof m.scoredOn === 'string' && m.scoredOn.trim())) {
      problems.push(`method ${m.id}: scoredOn must say what the client is buying`);
    }
    // Every bay the method declares must have something to put in it. An empty
    // bay is a blank row in the garage and a method the player cannot finish
    // kitting out — and with catalog.js reading only from this file, a bay with
    // no stock renders as nothing at all rather than as a sensible fallback.
    for (const s of m.toolSlots) {
      if (!itemsForMethod(m.id, { slot: s }).length) {
        problems.push(`method ${m.id}: declares a "${getSlot(s) ? getSlot(s).name : s}" bay and the shop has nothing for it`);
      }
    }
    // A method whose tools hang on a rope has no rod bay to fill.
    if (m.hasDrillString === false && m.toolSlots.includes('rod')) {
      problems.push(`method ${m.id}: declares no drill string, so it cannot carry a rod bay — its tools hang on a wire rope`);
    }
    // A method must name the rigs that name it. This is how "a DTH surface rig
    // runs top hammer" got into the fleet: the rig claimed the method and the
    // method never claimed the rig back, so nothing contradicted it.
    for (const rid of m.rigIds) {
      const rig = getRig(rid);
      if (rig && !rig.methods.includes(m.id)) {
        problems.push(`method ${m.id}: lists rig ${rid}, which does not list the method — one of the two is wrong`);
      }
    }
  }
  /**
   * RULE — PLAIN CFA REFUSES THE GROUND CASED CFA EXISTS FOR. See CFA_REFUSES.
   * Two halves, because the second is what makes the first mean something: the
   * ground comes off `cfa`, and it stays on `cased-cfa`, where the player is
   * paying for the second rotary head precisely to get through it.
   */
  {
    const cfa = getMethod('cfa');
    const cased = getMethod('cased-cfa');
    if (cfa && cased) {
      for (const g of CFA_REFUSES) {
        if (cfa.validGround.includes(g)) {
          problems.push(`method cfa: claims it can bottom a pile in ${g} — research/05 §A6 says standard CFA "may fail to penetrate stiff clayey soils and glacial till, with refusal before design depth", and its envelope is "cohesive, friable soils. No boulders."`);
        }
        if (!cased.validGround.includes(g)) {
          problems.push(`method cased-cfa: does not claim ${g}, and overcoming exactly that ground is why the double-rotary machine exists (research/05 §A7)`);
        }
      }
      for (const g of cfa.validGround) {
        if (!cased.validGround.includes(g)) {
          problems.push(`method cfa: drills ${g} and cased-cfa does not — the cased machine is the one that gets through more, never less (research/05 §A7)`);
        }
      }
    }
  }

  for (const r of RIGS) {
    for (const mm of r.methods) {
      if (!methodIds.has(mm)) { problems.push(`rig ${r.id}: unknown method ${mm}`); continue; }
      const m = getMethod(mm);
      if (!m.rigIds.includes(r.id)) {
        problems.push(`rig ${r.id}: claims method ${mm}, which does not list the rig — one of the two is wrong`);
      }
    }
  }
  const nonCutting = new Set(NON_CUTTING_CATEGORIES);
  const cuttingBay = getSlot('bit');
  for (const i of ITEMS) {
    if (!slotIds.has(i.slot)) problems.push(`item ${i.id}: unknown slot ${i.slot}`);
    for (const mm of i.methods) if (!methodIds.has(mm)) problems.push(`item ${i.id}: unknown method ${mm}`);
    if (!i.category.includes(' → ')) problems.push(`item ${i.id}: category is not a taxonomy path`);
    if (!(i.price > 0)) problems.push(`item ${i.id}: non-positive price`);

    // RULE — a driven sampler or a pushed cone is not a bit, in either
    // direction. This is the check the SPT/CPT regression needed.
    if (nonCutting.has(i.category) && i.slot === 'bit') {
      problems.push(`item ${i.id}: "${splitCategory(i.category).subcategory}" is driven, pushed or installed — it does not cut, so it cannot sit in the "${cuttingBay ? cuttingBay.name : 'bit'}" bay`);
    }
    const allowed = BAY_CATEGORIES[i.slot];
    if (allowed && !allowed.includes(i.category)) {
      problems.push(`item ${i.id}: the "${cuttingBay && i.slot === 'bit' ? cuttingBay.name : (getSlot(i.slot) ? getSlot(i.slot).name : i.slot)}" bay does not hold ${splitCategory(i.category).subcategory}`);
    }
    // An unsourced price may never be presented as a catalogue figure, so it
    // has to say what is missing. PLATFORM_TRUTH.md Part C rule 7.
    if (i.priceSourced === false && !(typeof i.needs === 'string' && i.needs.trim())) {
      problems.push(`item ${i.id}: priceSourced is false and there is no needs note saying why`);
    }

    // RULE — a casing joint states which hand it is cut.
    if (CASING_JOINT_PROFILE.test(i.thread) && CASING_JOINT_THREAD.test(i.thread)
        && !THREAD_HAND.test(i.thread)) {
      problems.push(`item ${i.id}: casing joint "${i.thread}" does not say whether it is cut LH or RH — casing is normally LH, and silence is not an answer`);
    }

    // RULE — the three overburden casing families keep their own vocabulary.
    // See OVERBURDEN_FAMILY_COPY. PLATFORM_TRUTH.md Part C §2 forbids this
    // conflation by name and it shipped anyway.
    for (const fam of OVERBURDEN_FAMILY_COPY) {
      if (i.category !== fam.cat) continue;
      const copy = `${i.name} ${i.description || ''}`;
      const hit = copy.match(fam.forbid);
      if (hit) {
        problems.push(`item ${i.id}: is ${fam.family} and its copy says "${hit[0]}" — ${fam.why} (PLATFORM_TRUTH.md Part C §2)`);
      }
    }

    // RULE — connections are segment-scoped, and a method with no drill string
    // has no string parts to sell.
    const isPercussion = LOAD_PATH_SLOTS.includes(i.slot) && PERCUSSION_THREAD.test(i.thread);
    const isDthShank = LOAD_PATH_SLOTS.includes(i.slot) && DTH_SHANK_THREAD.test(i.thread);
    for (const mm of i.methods) {
      const m = getMethod(mm);
      if (!m) continue;
      if (m.hasDrillString === false && DRILL_STRING_SLOTS.includes(i.slot)) {
        problems.push(`item ${i.id}: ${m.id} has no drill string — its tools hang on a wire rope, so it takes no ${i.slot}`);
      }
      // …and everything that DOES hang on that rope carries the method's own
      // joint. This is how a tricone with an API REG pin and a three-wing
      // rotary drag bit both ended up on a spudder: there is no rotation to
      // drive them and no threaded string to make them up to.
      if (m.hasDrillString === false && LOAD_PATH_SLOTS.includes(i.slot)
          && i.thread !== 'n/a'
          && !i.thread.toLowerCase().includes(m.threadFamily.toLowerCase())) {
        problems.push(`item ${i.id}: ${m.id} runs a "${m.threadFamily}" on a wire rope — "${i.thread}" has nothing to make up to and nothing to turn it`);
      }
      if (isPercussion && !PERCUSSION_VOCAB.test(m.threadFamily)) {
        problems.push(`item ${i.id}: "${i.thread}" is a percussion connection and ${m.id} runs "${m.threadFamily}" — the families do not mate`);
      }
      if (isDthShank && !DTH_SHANK_VOCAB.test(m.threadFamily)) {
        problems.push(`item ${i.id}: "${i.thread}" is a down-the-hole shank and ${m.id} runs "${m.threadFamily}" — there is no hammer at the bit to couple to`);
      }
    }
  }
  for (const r of REGIONS) {
    for (const g of r.groundProfile) if (!groundIds.has(g.id)) problems.push(`region ${r.id}: unknown ground ${g.id}`);
    for (const a of r.applications) if (!appIds.has(a)) problems.push(`region ${r.id}: unknown application ${a}`);
    declaresArchetypes('region', r);
    for (const c of r.requiredCerts) if (!certIds.has(c)) problems.push(`region ${r.id}: unknown cert ${c}`);
    // The Talent posting defaults must be values Drillity Talent actually
    // models, not free text — that is the whole point of the four fields.
    if (!ROTATION_PATTERNS.includes(r.rotation)) problems.push(`region ${r.id}: rotation "${r.rotation}" is not a ROTATION_PATTERNS value`);
    if (!RIG_TYPES.includes(r.rigType)) problems.push(`region ${r.id}: rigType "${r.rigType}" is not a RIG_TYPES value`);
    if (!RIG_CLASSES.includes(r.rigClass)) problems.push(`region ${r.id}: rigClass "${r.rigClass}" is not a RIG_CLASSES value`);
    if (!(typeof r.waterDepth === 'number' && r.waterDepth >= 0 && Number.isFinite(r.waterDepth))) {
      problems.push(`region ${r.id}: waterDepth must be metres (0 for land work)`);
    }
    if (r.waterDepth > 0 && RIG_TYPE_WATER[r.rigType] === null) {
      problems.push(`region ${r.id}: ${r.rigType} is a land machine but the region has ${r.waterDepth} m of water`);
    }
    if (r.waterDepth === 0 && RIG_TYPE_WATER[r.rigType]) {
      problems.push(`region ${r.id}: ${r.rigType} is a marine unit but the region has no water depth`);
    }
    /**
     * RULE — A UNIT HAS TO BE ABLE TO FLOAT WHERE IT IS POSTED. `RIG_TYPE_WATER`
     * is the class of machine; `REGION_WATER_M` is the basin. Rolling the first
     * without the second advertised **North Sea semi-submersible postings in up
     * to 900 m of water**, in a sea whose own maximum is about 700 m and whose
     * deepest wellbore on the Norwegian shelf is 410 m.
     */
    const basin = REGION_WATER_M[r.id];
    if (basin) {
      if (!(basin[0] > 0 && basin[1] > basin[0])) {
        problems.push(`region ${r.id}: REGION_WATER_M must be [min, max] metres with max above min`);
      }
      if (r.waterDepth > 0 && (r.waterDepth < basin[0] || r.waterDepth > basin[1])) {
        problems.push(`region ${r.id}: stands in ${r.waterDepth} m of water, which is outside its own basin range ${basin[0]}-${basin[1]} m`);
      }
      for (const t of (REGION_RIG_TYPES[r.id] || [])) {
        const w = waterWindow(t, r.id);
        if (w && w[1] < w[0]) {
          problems.push(`region ${r.id}: fields a ${t} (${RIG_TYPE_WATER[t][0]}-${RIG_TYPE_WATER[t][1]} m) in ${basin[0]}-${basin[1]} m of water — there is nowhere in this basin it can work`);
        }
      }
    }
    for (const t of (REGION_RIG_TYPES[r.id] || [])) {
      if (!RIG_TYPES.includes(t)) problems.push(`region ${r.id}: fields "${t}", which is not a RIG_TYPES value`);
      else if (r.waterDepth > 0 && !RIG_TYPE_WATER[t]) {
        problems.push(`region ${r.id}: fields the land machine "${t}" in ${r.waterDepth} m of water`);
      }
    }
    for (const a of Object.keys(r.applicationWeights || {})) {
      if (!appIds.has(a)) problems.push(`region ${r.id}: applicationWeights names unknown application ${a}`);
      else if (!r.applications.includes(a)) problems.push(`region ${r.id}: applicationWeights weights ${a}, which the region does not offer`);
      else if (!(r.applicationWeights[a] > 0)) problems.push(`region ${r.id}: applicationWeights[${a}] must be > 0`);
    }
  }
  for (const c of CERTS) {
    for (const rr of c.unlocksRegions) if (!regionIds.has(rr)) problems.push(`cert ${c.id}: unknown region ${rr}`);
    for (const p of c.prereq) if (!certIds.has(p)) problems.push(`cert ${c.id}: unknown prereq ${p}`);
  }
  for (const s of SKILLS) for (const p of s.prereq) if (!SKILL_MAP.has(p)) problems.push(`skill ${s.id}: unknown prereq ${p}`);
  // Every method must have a rig, and stock in the bay that defines it. That
  // bay is 'bit' for everything that cuts — but a site investigation's primary
  // tool is a sampler and a driven pile's is the pile, and demanding a bit of
  // either is the same category error as filing a split spoon as one.
  for (const m of METHODS) {
    if (!itemsForMethod(m.id, { slot: m.primaryToolSlot }).length) {
      problems.push(`method ${m.id}: nothing in the shop for its primary bay, ${m.primaryToolSlot}`);
    }
    if (!rigsForMethod(m.id).length) problems.push(`method ${m.id}: no rig can run it`);
  }

  // DEAD APPLICATIONS. `oil-gas` and `offshore-marine` were listed by two
  // regions and served by no method at all, so `makeContract` could never
  // produce one and the North Sea offered jet grouting on a platform. These
  // two checks make that class of bug fail loudly instead of silently.
  for (const a of APPLICATIONS) {
    declaresArchetypes('application', a);
    if (!METHODS.some((m) => m.applications.includes(a.id))) {
      problems.push(`application ${a.id}: no method serves it — no contract can ever be generated`);
    }
  }
  for (const r of REGIONS) {
    const runnable = methodsForRegion(r.id, MAX_LEVEL);
    for (const a of r.applications) {
      // Not just "a method that claims the industry" — a method with somewhere
      // in this region to physically stand and do it. The old form of this
      // check passed happily while the North Sea advertised bored piling,
      // because `civil-infrastructure` was a word both rows happened to carry.
      if (!runnable.some((m) => archetypesFor(m.id, r.id, a).length)) {
        problems.push(`region ${r.id}: lists application ${a} but no method can run it there — no method, application and region agree on a single site archetype`);
      }
    }

    /**
     * NO DEAD SITE. A region that declares an archetype nothing can reach is a
     * place `world/terrain.js` will be asked to build and the generator will
     * never send anybody to — and the next person to read the list will assume
     * it is supported and pair something to it.
     */
    for (const x of (r.archetypes || [])) {
      const reached = runnable.some((m) => r.applications.some(
        (a) => archetypesFor(m.id, r.id, a).includes(x)));
      if (!reached) {
        problems.push(`region ${r.id}: declares the site archetype "${x}" and no method can ever be sent there`);
      }
    }

    /**
     * THE COPY FOLLOWS THE SITE. `SITE_LINES` is keyed region × archetype, and
     * a missing bucket means a contract describes a place with the archetype's
     * generic one-liner instead of the region's own words. A bucket for an
     * archetype the region does NOT declare is worse: it is finished copy for a
     * site somebody is going to be tempted to make reachable.
     */
    const lines = SITE_LINES[r.id] || {};
    for (const x of (r.archetypes || [])) {
      if (!Array.isArray(lines[x]) || !lines[x].length) {
        problems.push(`region ${r.id}: no SITE_LINES copy for its "${x}" site — the card cannot say where the rig is standing`);
      }
    }
    for (const x of Object.keys(lines)) {
      if (!(r.archetypes || []).includes(x)) {
        problems.push(`region ${r.id}: SITE_LINES describes a "${x}" site the region does not offer`);
      }
    }

    /**
     * LAND AND SEA DO NOT MIX. A region with water under it can only offer
     * offshore sites, and a region with none can offer no offshore site at all.
     * This is the structural half of the fix for the cable percussion spudder
     * on the platform: even if every other list were wrong, there is no ground
     * under an offshore machine for a spudder to stand on.
     */
    for (const x of (r.archetypes || [])) {
      const arch = getArchetype(x);
      if (!arch) continue;
      if (r.waterDepth > 0 && arch.plane !== 'offshore') {
        problems.push(`region ${r.id}: has ${r.waterDepth} m of water but offers the ${arch.plane} site "${x}" — there is no ground there to stand a machine on`);
      }
      if (r.waterDepth === 0 && arch.plane === 'offshore') {
        problems.push(`region ${r.id}: is a land region and offers the offshore site "${x}"`);
      }
    }
  }

  /**
   * DO NOT SHRINK THE GAME TO WIN THE ARGUMENT. Tightening the pairings is only
   * correct while every method still has work. A method that can reach one
   * region or none is a method the player unlocks and then cannot use, and the
   * right answer when this fires is almost always that a REGION is missing an
   * archetype — not that the method should be let back into a place it does not
   * belong.
   */
  {
    const reach = new Map();
    for (const r of REGIONS) {
      for (const m of methodsForRegion(r.id, MAX_LEVEL)) {
        reach.set(m.id, (reach.get(m.id) || 0) + 1);
      }
    }
    for (const m of METHODS) {
      const n = reach.get(m.id) || 0;
      const excused = SOLE_REGION_METHODS[m.id];
      // Zero is never excusable. A method the player unlocks and can never run
      // is a broken method however good the reason sounds.
      if (n < 1) {
        problems.push(`method ${m.id}: reaches no region at all — the player unlocks it and can never run it`);
      } else if (n < 2 && !excused) {
        problems.push(`method ${m.id}: reaches ${n} region${n === 1 ? '' : 's'} — it needs at least two to be playable, and the fix is usually a region that is missing an archetype`);
      }
      // …and the exemption cleans itself up. The moment a second region can
      // honestly run the method, the note stops being true and has to go, or it
      // will still be excusing something years after it stopped applying.
      if (n >= 2 && excused) {
        problems.push(`method ${m.id}: is listed in SOLE_REGION_METHODS but now reaches ${n} regions — delete the entry, the world caught up`);
      }
    }
  }

  /* ── EVERY OFFERABLE JOB MUST HAVE SOMEWHERE ITS HOLE CAN BOTTOM ──────────
     `methodsForRegion()` asks whether SOME site in a region works for a method.
     `makeContract()` then picks an APPLICATION first and only afterwards a site
     from `archetypesFor(method, region, application)` — a narrower list. Both
     of its fallbacks are silent: an empty `sharedApps` takes
     `method.applications[0]` whether the region has that work or not, and an
     empty `usableSites` takes a site the ground under it does not support.

     Downstream of those two hatches, `rollDrillableColumn()` has a last resort
     that hands the method the one bed in the region it can drill. It is a
     truthful floor rather than a lie, but it is still a floor, and a floor that
     is reachable is a floor that will be stood on. This is the check that keeps
     it unreachable: for every pairing the board can actually deal, at least one
     application and at least one of its sites must bottom in the MEAN column.

     The rolled column is checked separately and at scale by
     `tools/checkbeds.mjs`, which found 49 undrillable cards in 6,400 before
     the re-roll existed. */
  for (const region of REGIONS) {
    for (const method of methodsForRegion(region.id, MAX_LEVEL)) {
      const sharedApps = method.applications.filter(
        (a) => region.applications.includes(a) && archetypesFor(method.id, region.id, a).length);
      if (!sharedApps.length) {
        problems.push(`method ${method.id} in ${region.id}: is offered there but shares no application with the region that has a site — makeContract falls back to ${method.applications[0]}, which the region may not do at all`);
        continue;
      }
      for (const app of sharedApps) {
        const sites = archetypesFor(method.id, region.id, app);
        const usable = sites.filter((site) => {
          const col = nominalColumn(region, method, isUndergroundSite(site));
          return !!bottomableBed(col, method, depthWindow(method, app, site)[1], site);
        });
        if (!usable.length) {
          problems.push(`method ${method.id} in ${region.id} for ${app}: none of its sites [${sites.join(', ')}] has ground the method can bottom a hole in within its own depth window — the contract falls back to a site it cannot drill`);
        }
      }
    }
  }

  // A rig the 3D factory cannot build must declare the machine to fall back to.
  for (const r of RIGS) {
    if (r.renderRigId && !RIG_MAP.has(r.renderRigId)) {
      problems.push(`rig ${r.id}: renderRigId ${r.renderRigId} is not a rig`);
    }
  }
  return problems;
}

/** Counts, for the report and the debug overlay. */
export const DATA_STATS = deepFreeze({
  methods: METHODS.length,
  rigs: RIGS.length,
  items: ITEMS.length,
  regions: REGIONS.length,
  certs: CERTS.length,
  roles: ROLES.length,
  skills: SKILLS.length,
  applications: APPLICATIONS.length,
  archetypes: SITE_ARCHETYPES.length,
  slots: SLOTS.length,
  maxLevel: MAX_LEVEL,
});
