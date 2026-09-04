# Drillity domain brief — the source material for the game

Everything below is extracted from the real Drillity products. Use these exact
names, categories and vocabularies. Do **not** invent generic "mining game"
terminology when a real Drillity term exists.

Sources:
- `Drillity_Taxonomy_v5.3.pdf` — market.drillity.com B2B marketplace taxonomy
  (7 super-groups / 45 families / 285 subcategories, validated against 71
  drilling-industry suppliers: Bauer, Casagrande, Klemm, Liebherr, Sandvik,
  Boart Longyear, Herrenknecht …).
- `drillity-i-market` repo — the iMarket marketplace app (categories, listings).
- `drillity-mobile-magic` repo (Drillity Talent) — `src/lib/industries.ts`,
  `job_functions.ts`, `drilling.ts`, `jobTaxonomy.ts` — the career/roles side.

---

## 1. Drilling methods (iMarket "Drilling method" facet — multi-select)

This is the **marketplace facet**, not the game's method list. The two overlap
but are not the same set, and treating them as one is how the game ends up
advertising methods it does not have. The canonical *game* ids and their unlock
levels live in `src/game/data.js` `METHODS`; `METHOD_IDS.md` is the id contract
between agents. **Never coin a method id here — take it from `METHODS`.**

The **In game** column is the state of the tree on 2026-09-04.

| id | Name | In game | Notes |
|---|---|---|---|
| `auger` | Auger drilling | **yes** (L1) | Rotary / hollow-stem; soft ground only |
| `cable-tool` | Cable-tool / drop-hammer | **yes** (L3) | Old-school percussion, cheap, slow. **Stringless** — see §1a |
| `top-hammer` | Top hammer | **yes** (L6) | Surface rock drilling; R/T thread rods |
| `dth` | DTH (down-the-hole) | **yes** (L10) | Hammer at the bit; deep hard rock, needs air |
| `overburden` | Overburden / duplex (concentric & eccentric) | **yes** (L14) | Casing + drilling together; Odex/Symmetrix, ring-bit, wing-bit |
| `core` | Core / exploration (wireline) | **yes** (L18) | AQ/BQ/NQ/HQ/PQ; diamond bits, sample recovery |
| `rotary-kelly` | Rotary / Kelly | **yes** (L23) | Large-diameter bored piles; Kelly bar, buckets, augers |
| `cfa` | CFA | **yes** (L27) | Continuous flight auger piling |
| `anchor` | Anchor / micropile | **yes** (L31) | Self-drilling anchors (SDA), GEWI/threadbar |
| `cased-cfa` | Cased CFA (double-rotary) | **yes** (L34) | |
| `hdd` | HDD | **yes** (L38) | Horizontal directional drilling; pilot bore + backream |
| `sonic` | Sonic | **yes** (L42) | Resonant vibration; excellent sampling |
| `jet-grouting` | Jet grouting | **yes** (L47) | High pressure monitors & nozzles |
| `raise-boring` | Raise boring | **yes** (L52) | Pilot bit → reamer head, underground |
| `dw` | Diaphragm / slurry wall | no | Survives only as the **application** `diaphragm-wall`, served by `rotary-kelly`. No hydromill, no grab, no panel sequence |
| `displacement` | Displacement pile (FDP) | no | `CAT` has no FDP leaf either |
| `soil-mixing` | Soil mixing (CSM/DSM) | no | |
| `microtunnelling` | Microtunnelling / pipe-jacking | no | The `profile` section mode was built wide enough to carry it; nothing drives it |
| `pipe-bursting` | Pipe bursting | no | |
| `auger-boring` | Auger boring | no | As microtunnelling |
| `vibro` | Vibro-compaction / stone column | no | |
| `dynamic-compaction` | Dynamic / impact compaction | no | |

### 1a. Game methods this facet does not name

Seven of the game's twenty-one methods are **not** rows in the table above,
because the facet exists to filter *equipment listings* and these are ways of
*working*. They are no less real. Their ids are fixed by `METHOD_IDS.md`:

| id | Name | Level | What it is |
|---|---|---|---|
| `site-investigation` | Site Investigation | 8 | Boreholes, **driven** SPT samplers and **pushed** CPT cones. Scored on sample quality and log fidelity |
| `rc` | Reverse Circulation | 21 | DTH hammer on dual-wall pipe; chips return up the inner tube to a cyclone. Scored on sample recovery and contamination |
| `rockbolt` | Ground Support | 29 | Drill, charge with resin, spin the bolt in, torque the plate. Scored on install quality — anchorage and torque test |
| `oil-rotary` | Rotary / Oil & Gas | 30 | Mud rotary on a derrick, with a mud column and a preventer |
| `driven-pile` | Driven Piling | 33 | A ram on a leader. **No rotation, no flush, no drill string.** Scored on set / blow count to bearing without damaging the pile |
| `tunnel-jumbo` | Drill & Blast (Face) | 36 | Two booms at a face; drill, charge, fire, ventilate, muck. Scored on pull per round and overbreak |
| `longhole` | Longhole Production | 39 | Rings and fans out of a drive. Scored on toe accuracy — deviation becomes dilution |

**Two methods have no drill string** (`hasDrillString: false` in `METHODS`):
`cable-tool` — a wire rope carrying a rope socket, jars, a drill stem and a
chisel, cleaned by **bailing** and not by circulating anything; and
`driven-pile` — a ram, a helmet and a pile. Neither has a rod to add.
`validateData()` refuses a `rod` bay or a drill-string item on either, and
`sim/drilling.js` emits `EVENTS.BAILER_RUN` (`drill:bailerrun`) where the
string methods emit `ROD_ADDED`. **Nothing user-visible may call a bailing run a
rod add.**

## 2. Applications / industries (Drillity Talent `industries.ts` + iMarket facet)

`Foundation / piling`, `Diaphragm / slurry wall`, `Water well`, `Geothermal`,
`Mining`, `Tunnelling`, `Quarry / construction`, `Road milling`,
`Soil stabilisation`, `Trenching`, `Site investigation`, `Oil & gas`,
`Utility / HDD`, `Anchoring / ground support`, `Environmental / remediation`,
`Mineral exploration / prospecting`, `Offshore / marine`,
`Blasting & demolition`, `Civil infrastructure`.

Talent industry icons/ids: `oil-gas`, `geotechnical`, `prospecting`,
`foundation`, `construction`, `mining`, `tunneling`, `hdd`.

**In the code:** `data.js` `APPLICATIONS` carries **18** of the 19 above, each
with a `talentIndustry` field binding it to one of those eight ids. The one
missing is **Road milling** — no application, no method, no rig. That is a
deliberate scope call rather than an oversight (road milling is a surface
machine, not a drilling method), but the list above should not be read as a
promise that all nineteen exist.

## 3. The equipment tree — 7 super-groups (use as the in-game iMarket shop)

**A. Machines & Rigs** — Drilling Rigs (Rotary, Top Hammer/Surface, DTH Surface,
Sonic, Core/Exploration, Geotechnical, Geothermal, Water Well, Foundation,
Mining, Oil & Gas, Anchor & Micropile, Multi-Purpose, Leader Masts) · Piling
Equipment (Piling Rigs, Press-In, Impact Hammers, Vibratory Hammers, Leads &
Masts, Helmets/Drive Caps, Sheet Piles, *Precast Concrete Piles*, *Bearing Piles
(H-Section)*) · HDD & Trenchless (HDD Rigs, HDD Drill
Pipe, Backreamers & Hole Openers, Pilot & Steering Heads, Pulling Heads/Eyes/
Swivels, Sonde & Bent Housings, Mud Motors, Microtunnelling & Pipe Jacking,
Auger Boring Tools, Pipe Bursting, Locating & Steering Systems) · Tunneling &
Underground (Jumbos, TBM Cutters, Roadheader Picks, Raise Bore Equipment/Reamer
Heads/Cutters/Drill Stems/Pilot Bits, Muck Handling, ANFO Loaders, Tunnel
Segments) · Diaphragm & Slurry-Wall (Hydromills/Trench Cutters, Grabs &
Clamshells, Stop-End Tooling, Desanding Plants, Cutter Wheels) · Casing &
Foundation Attachments (Casing Oscillators, Casing Rotators, Casing Drivers,
Rotary Drive Heads (KDK), Soil-Mixing Units, Vibroflots, Dynamic Compaction
Pounders, Vibratory Excavator Drives, Hydraulic Power Packs).

**B. Drilling Tools & Consumables** — Drill Bits & Cutting Tools (Button Bits,
Tricone Bits, PDC Bits, Drag/Wing Bits, Core Bits, DTH Bits, Ring Bits,
Sacrificial/Lost Bits, Reamers & Hole Openers, Adapters) · Top Hammer Tools
(Shank Adapters, Coupling Sleeves, Hydraulic Drifters, Pneumatic Rock Drills) ·
DTH Tools (DTH Hammers, DTH Shanks, DTH Drill Pipes, Accessories) · Drill String
& Rods (Drill Rods (Threaded), Drill Pipes, Core Drill Rods, RC/Dual-Wall,
*Sonic Drill Rods*, *Jet Grouting Rods (Multi-Tube)*, Drill Collars,
Accessories) · Casing & Overburden Tools (**Casing Crowns**,
Casing Pipes, Overburden Systems, Concentric Systems, Eccentric Systems
(Odex/Symmetrix), Ring-Bit Systems, Wing-Bit Systems, Retrievable Casing
Systems, Casing Shoes & Drive Caps, Joints & Connectors) · Rotary & Kelly
Foundation Tools (Kelly Augers, CFA & Hollow-Stem Augers, Auger Flights,
Drilling Buckets, Clean-Out Buckets, Foundation Core Barrels, Belling/Under-
Reaming Tools, Expansion Reamers, Drilling Heads & Crowns, Kelly Bars &
Extensions, FDP Tools, Tremie Pipes, Kelly-Box/U-Pin, Cross Cutters & Boulder
Extractors) · Ground-Engaging & Cutting Wear Tools (Round-Shank/Point-Attack
Picks, Flat/Chisel Picks, Weld-On Teeth, Plug-In Teeth, Tool Holders & Pick
Boxes, Pilot Bits & Centering Tips, Retention Rings) · Adapters, Couplings &
Subs (Drive Adapters, Balancing Rods, Coupling Accessories, Ejection Bells,
Shock Absorbers) · Flushing, Swivels & Water (Flushing Shafts, Flushing Rings,
Flushing Swivels, High-Pressure Swivels, Concrete & Grout Swivels).

**C. Fluids, Air & Power** — Mud & Fluid Systems (Mud Pumps, Centrifugal Pumps,
Mixing & Recycling, Mud Tanks, Shale Shakers, Desanders & Desilters, Drilling
Fluids & Additives) · Pneumatics & Compressors (Portable, Stationary, Booster
Compressors, Air Dryers & Aftercoolers) · Hydraulic Systems · Power Units &
Engines (Diesel Engines, Electric Motors, Generators, Battery Chargers) ·
Grouting & Injection (Grout Pumps, Mixers & Plants, Concrete Pumps, Injection
Packers, Shotcrete, Jet Grouting Monitors & Nozzles, TAM sleeve tubes).

**D. Downhole & Well** — Directional Drilling (Mud Motors, MWD/LWD, Steering
Tools, Survey Tools, Directional Subs) · BOP & Well Control · Wellhead &
Completion · Exploration & Coring (Core Barrels, Wireline Systems, Wireline
Core Barrels (WL/Q-Series), Conventional Core Barrels, Reaming Shells, Core
Lifters & Catchers, Geophysical/Logging/Sampling) · Site Investigation &
Testing (SPT Samplers & Hammers, Dynamic Probing DPL/DPM/DPH/DPSH, CPT, Drive
& Liner Samplers, Cable-Tool Tools, Monitoring Well Risers & Screens).

**E. Ground Engineering & Anchoring** — Self-Drilling Anchors (SDA) (Hollow
Anchor Bars, Couplers, Nuts, Bearing & Domed Plates, Centralizers, Grout
Swivels, Corrosion Protection) · Threadbar & GEWI Systems · Strand Ground
Anchors · Micropiles & Pile Systems (Driven Steel Pipe Piles RR, Drilled Steel
Pipe Piles RD, Ductile Iron Piles, Splice Sleeves, Rock Shoes) · Rock Bolts,
Soil Nails & Cable Bolts (+ Resin Cartridges, *Bolt Plates & Nuts*) · Mesh,
Surface Support & Grout ·
Anchor Install & Stressing Equipment (Stressing Jacks, Strand Uncoilers, Load
Monitoring).

**F. Components, Parts & Hardware** — Rotary Drives & Gear · Bearings, Bushings
& Wear (Pressure Bushings, Drill Rings & Bearing Rings, Damping Washers) ·
Hardware & Fasteners · Housings, Covers & Structural · Clamping & Breakout
Tools (Clamping Jaws, Breakout Wrenches, Centralizers & Rod Holders) · General
Spares & Consumables.

**G. Ground, Site & Services** — Water Supply, Dewatering & Pumps · Electrics,
Control & Monitoring (PLC Controllers, Sensors & Transducers, Telemetry) ·
Safety & PPE · Transport, Handling & Lifting · Workshop & Maintenance Tools ·
Services & Rentals (Equipment Rental, Drilling Services, Maintenance & Repair,
Operator Services).

### 3a. The tooling families the six newest methods pull from

The six methods added since this brief was written brought whole families with
them. This is where they live, with the `CAT` key and the shop items that
populate each, so nobody has to go looking. Slot ids are `data.js` `SLOTS`.

**RC — dual-wall and the sample train.** The product of an RC hole is the *bag*,
so half the machine is downstream of the bit.
- `CAT.dualWall` → *Drill String & Rods → RC / Dual-Wall* — `rc-pipe-114`
  (114 mm × 3 m). Slot `rod`. Air goes down the annulus, chips come back up the
  sealed inner tube, and **nothing that spalled off the wall above the bit can
  reach the sample.** That is the whole method.
- `CAT.sampling` → *Exploration & Coring → Geophysical / Logging / Sampling* —
  `rc-cyclone-100`, `rc-splitter-2` (riffle splitter), `sample-bag-calico`.
  Slot **`sample`**, a bay that exists only because of this.

**ITH — in-the-hole production hammers.** `ith-hammer-5` sits in
`CAT.dthHammers` and `ith-bit-140` in `CAT.dthBits`, because an ITH hammer *is*
a DTH hammer — it is the same tool run underground off a longhole rig, on the
same DHD/QL shank family. It is not a separate taxonomy family and must not be
given one.

**Ground support.** The only drilling in the game where the hole is finished
when something has been **put in** it.
- `CAT.rockBolts` → friction bolts (`friction-bolt-39`, `friction-bolt-46` —
  split-tube), resin-grouted rebar (`rebar-bolt-20`).
- `CAT.cableBolts` → `cable-bolt-6m` (bulbed, 15.2 mm strand).
- `CAT.resinCartridge` → `resin-fast`. `CAT.boltPlates` → `bolt-plate-150`,
  `bolt-nut-m24`. `CAT.meshSupport` → `mesh-2400`.
- Bolts themselves are slot **`install`**; resin, plates, nuts and mesh are
  `service`. The hole is drilled *smaller* than a friction bolt — that
  interference is the anchorage.

**Piling.** Nothing rotates and nothing circulates.
- Products, slot **`install`**: `CAT.precastPiles` (`precast-pile-350`),
  `CAT.drivenPipePiles` (`steel-tube-pile-914`), `CAT.bearingPiles`
  (`h-pile-305`), `CAT.sheetPiles` (`sheet-pile-z-630`, Z-pair).
- Drivers, slot `hammer`: `CAT.impactHammers` (`impact-hammer-9t`),
  `CAT.vibroHammers` (`vibro-hammer-1500`).
- `CAT.pileHelmets` → slot **`dolly`**: `pile-helmet-350`,
  `drive-cap-tube-610`, and the dolly itself (`dolly-hardwood` end-grain,
  `dolly-plastic` phenolic, `dolly-composite` steel-faced). **The dolly is the
  piling equivalent of a bit** — it is consumed, and its condition decides how
  much of the blow reaches the toe.

**Sampling and probing.** `CAT.sptSamplers`, `CAT.cpt`, `CAT.linerSamplers`,
all under *Site Investigation & Testing*.
- Slot **`probe`**: `spt-split-spoon` (51 mm), `cpt-cone-15` (15 cm² friction
  cone), `cpt-piezocone` (10 cm² CPTu), `window-sampler-60`, `u100-tube` (U100
  open-drive), `shelby-76` (thin-wall).
- Slot `workshop`: `spt-hammer-auto`, `spt-hammer-donut`, `liner-sampler-set`.
- Slot `rod`: `push-rod-1m` (CPT push rod, 44.5 mm × 1 m).
- **None of these is a bit and none may ever be equipped as one.** An SPT is
  *driven* by a 63.5 kg hammer falling 760 mm; a CPT cone is *pushed* at a
  constant rate. Neither rotates, neither cuts, neither makes cuttings.

> **Sourcing note.** Every leaf above is present in `data.js` `CAT`. Five of
> them — *Precast Concrete Piles*, *Bearing Piles (H-Section)*, *Bolt Plates &
> Nuts*, *Sonic Drill Rods* and *Jet Grouting Rods (Multi-Tube)*, italicised in
> §3 — do **not** appear in the taxonomy transcription this section was built
> from, and `Drillity_Taxonomy_v5.3.pdf` is not in this tree, so whether they
> are real taxonomy subcategories or reasonable coinages is **NOT SOURCED**.
> The code argues for the last two from `research/13` §4.2–4.3 (a sonic rod is
> not a core rod; a jet rod is not a jet monitor), which is a good argument but
> not the taxonomy. Anyone with the PDF should check these five and either
> confirm them here or fold them into an existing leaf.

## 4. Connections & threads (segment-scoped — never mix these)

- **Percussion (Top Hammer / DTH):** R25/R28/R32/R38/R44/R51 · T38/T45/T51/T60/
  GT60/T76–T127 · H55/H64/H66/H90/H92/H112/H114 · Shanks: DHD / COP / QL / SD /
  Mission / Numa · Button geometry: spherical / ballistic / gauge / face
- **Rotary / Kelly:** Kelly-box size mm (130/150/200) · SW hex/octagonal key
  width 29–320 mm · API REG 2⅜/3½ · U-Pin / quick-pin · tri-lock / bayonet ·
  claw coupling · Kelly type friction / interlocking / full-locking
- **Core / Exploration:** Wireline AQ/BQ/NQ/HQ/PQ (AWL–PWL) · A-Rod / N-Rod ·
  1¼" UNC / Z-thread · large-diameter wireline **hole** sizes 95 / 122 / 146 /
  176 mm (a 146 mm hole yields ~102 mm core).
  *Note: the taxonomy PDF labels these four "NSK". Research could not source
  that designation anywhere, though the four diameters are real. Treat them as
  hole diameters in game text until a first-party source turns up.*
- **RC (reverse circulation):** a FOURTH percussion shank family — Remet, Metzke,
  ARDX, MR. It does not interchange with DTH shanks. RC hammer backheads are
  **API REG**, i.e. the same connection family as an oil rig's top drive.
- **Percussion, also:** the **IB30 / IB40 / IB52** and **C64 / C90 / C112**
  families sit alongside R/T/H. (IB→R mapping is INFERRED from shared seal items
  in a supplier catalogue, not stated by the maker.)
- **Beware a name collision:** there is a second, unrelated "H thread" — US
  pneumatic sinker-drill steel. In-game copy must always say "H-series shank
  thread (H55–H114)", never bare "H".
- **HDD:** Vermeer Firestick 1.66"–2.875" · Ditch Witch Forged HDX · API REG /
  IF / FH / NC · Beadlock / BECO / Cubex
- **Anchoring:** GEWI / threadbar · hollow self-drilling bar R/T (R25–R51, T76+)
  · strand size
- **Casing:** conical / cylindrical profile · RH/LH · cone-ring / welded-thread
  / Leffer joint · trapezoidal / flat (DIN 4918) / round.
  *In game the casing items are all **LH***, and the reason is worth keeping:
  the drill string turns right-hand inside the casing, so a RH casing joint
  tends to back off. `Leffer` is a maker's joint name and has been taken out of
  the shipped `thread` strings — keep it here as vocabulary, not as content.
- **ITH (in-the-hole, `longhole`):** **not a new family.** An ITH hammer runs
  the same **DHD / QL** shanks as a surface DTH hammer; only the machine and the
  hole direction differ. `longhole` declares
  `R32-T51 percussion / DHD-QL ITH shank`, and the shop files ITH tools under
  the DTH leaves for exactly this reason.
- **Face drilling (`tunnel-jumbo`):** `T38-T45 percussion`. One-piece drill
  steel — there are no couplings in a face rod, which is why the round length
  *is* the steel length.
- **Ground support (`rockbolt`):** two interfaces that are not each other. The
  **drilling** side is `R32-R38 percussion`. The **installed** side is not a
  drill thread at all: a split-tube friction bolt has **no thread** (the hole is
  drilled smaller than the bolt and the interference *is* the anchorage), a
  resin-grouted rebar bolt takes a **dome nut, M24 with a shear collar**, and a
  cable bolt is **15.2 mm strand**. Never print a rod thread on a bolt.
- **Driven piling (`driven-pile`):** `welded splice / sheet-pile interlock`.
  **There is no threaded connection anywhere on this method** — piles are
  spliced by welding and sheet piles are threaded to each other by their
  interlocks, a word that means something completely different here.
- **Sampling / probing (`site-investigation`):** `A-Rod / CPT push rod / hex`.
  A CPT push rod is **44.5 mm × 1 m** and takes compression, not torque.

> **Known gap.** `DOMAIN.md` lists the **H-series (H55–H114)** and the game has
> no H-family item; `rig/tools.js` defines only `H90`, and there is no
> shank-shaft-Ø data (Ø56→H55, Ø65→H55/H64, Ø68→H64/H66, Ø95→H90/H92,
> Ø115→H112/H114). A large-diameter driller finds his whole thread family
> missing. Tracked as `AUDIT_ACCURACY.md` finding 42.

## 5. Materials & grades

S355J2 · 42CrMo4(V) · 34CrNiMo6 · 25CrMo4V · N80 · Hardox · FRP/composite ·
carbide grades. Duty: **Standard** or **Heavy-duty (HD)**.

## 6. Rig brands to reference (fits-rig facet)

Bauer (BG/KDK), Liebherr (LB), Soilmec (SR/SF), Casagrande, IMT, Mait, Sany,
XCMG, Zoomlion, CZM, Comacchio, Klemm, Eurodrill, Atlas Copco / Epiroc,
Sandvik, Furukawa, Vermeer, Ditch Witch, Numa, Mission, Betek, Kennametal.
*In-game rig names must be original — evoke these, never copy a real model
designation.*

## 7. Career ladder (Drillity Talent — `job_functions.ts`, `industries.ts`)

**Field Operations:** Drill Rig Operator · Rigger · Crane Operator · Equipment
Technician · Foreman / Site Supervisor · Hydraulic Grab / Piling Operator ·
Blaster / Shot Firer.
**Oil & Gas ladder:** Floorhand / Roughneck → Derrickman → Driller →
Directional Driller / MWD-LWD → Drilling Foreman / Drilling Supervisor.
**Other specialisations:** Core Driller · Exploration Geologist · HDD Operator
· HDD Locator · HDD Foreman · Pile Driver · Foundation Engineer · Tunnel Boring
Operator · Geotechnical Engineer · Mud Engineer / Drilling Fluids · Well
Control · Site Manager · Project Manager · HSE Officer / HSE Manager.

**Rotation patterns** (`drilling.ts`): 14/14 · 21/21 · 28/28 · 4/4 ·
5/2 (onshore week) · 6/3 · Ad hoc / call-out · Staff / residential.

**Certifications with expiry** (`OFFSHORE_MEDICAL_TYPES`): OGUK Medical ·
BOSIET · FOET · HUET · OPITO · ENG1 (Seafarer) · Norwegian Offshore Medical.
Add ground-side ones the industry actually uses: IWCF/IADC Well Control,
NVQ/SPA, first aid, confined space, working at height, shot firing.

> **`EN 791` is not a certificate and has been removed from the game.** It was
> in this list, and `data.js` `CERTS` carried an `en791` row with a course fee,
> 24 training hours and a 60-month *personal* expiry. Two things wrong with
> that. **(a)** EN 791 is a **machinery safety standard for the equipment** — a
> rig conforms to it, a person does not hold it. **(b)** It was **withdrawn and
> superseded by EN 16228** (*Drilling and foundation equipment — Safety*) in
> 2014, so the game was gating players on a ticket that does not exist for a
> standard that is twelve years obsolete.
>
> `CERTS` now carries `rig-operator-licence` — *Drill Rig Operator Licence*,
> a national training board ticket — in its place, and says so in its own copy:
> the machine has its own conformity, and that is EN 16228; it belongs to the
> rig, not to you. If a machine-conformity gate is ever wanted, it is a property
> of the rig and it cites **EN 16228**.

The full live list is `data.js` `CERTS` (14 rows). Two that are easy to get
wrong: **BOSIET already contains HUET** — the standalone HUET is an
*alternative* path, not a sequel, and `huet.prereq` is correctly empty; and
**IWCF and IADC WellSharp are two separate international schemes** from two
separate bodies and must never be merged into one row.

**Rig types / classes** (`drilling.ts`): Jackup · Semi-submersible · Drillship ·
Platform rig · Land rig · Tender-assisted · Barge rig. Classes: Standard ·
High-spec / harsh environment · Ultra-deepwater · HPHT.

Currencies used by Drillity: EUR (primary in-game), USD, GBP, NOK, AUD.

## 8. Brand system — "Liquid Industrial"

Verbatim from `drillity-mobile-magic/src/index.css`. Encoded in
`src/core/contract.js` → `BRAND`. Deep-slate ground, **electric amber**
primary, steel-blue accent, emerald success. Type: **Inter** for UI, **Oswald**
for the logo/display. Radii are generous (0.875rem base, up to 2rem).

## 9. Tone

Drillity is a real B2B platform for a real, physical, heavy industry. The game
should feel *authentic and premium* — a driller looking at it should recognise
their world: correct rod handling, correct flushing, correct wear behaviour,
correct terminology. Never cartoonish, never "idle clicker" cheap. Think:
a beautifully lit piece of heavy machinery at golden hour.

---

## 10. Logo and factual accuracy — HARD RULES

**Logo.** The Drillity logo is a WORDMARK, not an icon. It is the word
`DRILLITY` in a heavy geometric sans, colour **#F59E0B**, with the tagline
`REPRESENTING PROFESSIONALS` beneath it (white on dark, black on light),
letter-spaced to the full width of the wordmark. The real artwork is bundled at
`src/ui/assets/logo-full.png` (1400×299, on-dark variant),
`src/ui/assets/logo-small.png` (700×150) and `src/ui/assets/logo-wordmark.png`
(900×127, wordmark only, for compact/HUD use). **Use these files.** Do not draw
a substitute mark, do not invent a drill-bit roundel, do not re-letter the
wordmark in a different typeface, and do not recolour it.

**This rule was broken, in four places, and here is what was found and what was
done about it.** Recorded because every one of these was written by someone who
had read this section and thought their case was the exception. It never is.

| Where | What it did | Now |
|---|---|---|
| `rig/tools.js` `brandTexture()` | Set `DRILLITY` in `bold 62px Oswald, Impact` over an **invented tagline** `GROUND ENGINEERING SYSTEMS`, in `#DFB552`. All fifteen callers took the default, so it was painted on every rig and fourteen tools — badging them as Drillity products, when **Drillity is the marketplace, not an OEM**. | **Fixed.** The plate is a field and a single amber rule line, `#F59E0B` exact. No lettering. |
| `core/assets.js` decal `'logo'` | Drew *"a drill crown seen head-on: hex body, six carbide buttons, amber ring"* — the invented roundel this section forbids **by name**. | **Fixed.** The case is deleted and replaced by a comment saying there is deliberately no `logo` decal, and pointing at `terrain.js` `texSign()` for how to composite the real artwork. |
| `core/assets.js` decal `'plate'` | Stamped `DRILLITY` on machine data plates as if it were the manufacturer. | **Fixed.** The plate now takes the rig's own invented marque (`params.maker` — Nordvik, Steinbach, Bergholt …), because a data plate names the manufacturer. |
| `world/terrain.js` site board | Fell back to setting `DRILLITY` in a system sans when the artwork failed to load, on the reasoning that plain text is not a forged wordmark. | **Fixed.** It now draws **nothing**. A blank sign is honest; a fabricated one is not. |

**Still open, and not to be taken as precedent:**

- **`ui/components.js` `BitMark()`** is *still* an exported six-button amber
  roundel, still commented "The Drillity bit mark — a DTH bit face seen
  head-on." Nothing in `src/` calls it, so it is latent rather than shipping —
  but it is a live export any screen could pick up, and it is precisely the
  invented drill-bit roundel this section names. **Delete it.**
- **`core/assets.js` `drawWordmark()`** still carries the procedural
  re-lettering machinery: Oswald, falling back to a hand-built geometric
  alphabet *for the letters of DRILLITY*, falling back again to a squeezed
  system sans. No caller passes `DRILLITY` any more — it now sets makers'
  marques, which is legitimate — but the glyph table exists only to forge this
  wordmark and should go with the last caller that wanted it.
- The `'plate'` decal still **defaults** to `MODEL 'DR-140 CRAWLER'` and
  `SERIAL 'DRL-0041-EU'` — a model designation that appears in no `RIGS` row.

Tracked as `AUDIT_ACCURACY.md` findings 6, 7 and 8.

**Facts.** See `PLATFORM_TRUTH.md` → Part C, "FACT-ACCURACY RULES". Every
user-visible factual claim must be traceable and precise. When unsure, cut it.

**Sources.** The game is grounded in the two Drillity platforms — **iMarket**
(the shop) and **Talent** (the career) — see `PLATFORM_TRUTH.md`. Do not use any
single supplier's internal parts catalogue, part numbers or drawing numbers, and
do not put Drillity's internal business metrics (listing counts, subscription
prices, partner names) anywhere in the game.
