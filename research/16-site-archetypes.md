# 16 — Site archetypes: where each machine actually stands

**What this file is for.** The project owner's instruction was blunt and correct:

> *"You need to be super accurate regarding the different drilling rigs. And
> offshore rigs are as you understand on the sea. You need to be really really
> critical so we don't look foolish. […] Diamond core rig is one thing, a piling
> rig is something, anchor rig is something etc. We don't want 1 site with
> different machines — foundation maybe in a city, prospecting (maybe for gold)
> will be in a mine, oil at sea, piling etc."*

`research/01`–`15` answer *what the machine is* and *what the work is*. **No file
in the pack answers where the machine stands.** That is the gap this file fills,
and it is the gap that currently lets the game put a cable-tool spudder on a
North Sea platform.

---

## 0. How to read this file

**Fact vs inference is marked on every claim.** Three markers are used and they
are not decorative:

| marker | meaning |
|---|---|
| **[F]** | **Fact.** Traceable to a cited source. The source key is given inline. |
| **[I]** | **Inference.** My reasoning from cited facts. The facts are cited; the *conclusion* is mine and may be wrong. |
| **`NOT SOURCED`** | I could not back it. Do not implement it as a fact. `PLATFORM_TRUTH.md` Part C rule 6 applies: say less. |

**No brand claims.** Companies are named only as *who does this work*
(`PLATFORM_TRUTH.md` Part C rule 4). No real model designation is used as a
product name and no capability is attributed to a named manufacturer.

**Source keys** are listed in full in §G, matching the house format used by
`research/03` §I.

---

## 0.1 What `research/01`–`15` already cover — read these first

I read the pack before writing. It is strong, and this file must not repeat it.

| already covered, well | where | what it gives you |
|---|---|---|
| **The seven offshore/onshore rig types and how to tell them apart** | `01-oil-gas.md` §C.1, and especially **§C.1.8 "the modeller's cheat sheet"** | one-line silhouettes for jackup / semi / drillship / platform / tender / barge / land rig. **This is already right. The game does not use it.** |
| **Land-rig site requirements, with a real regulated area figure** | `01` §C.1.1 — *"minimum ~3 000 m², up to 10 000 m² (1 ha)"*, sealed surfaces, drill cellar, fencing, flare provision | the desert / onshore well-pad archetype is 80 % written already |
| **Underground machine proportions and why** | `03-mining.md` §C — *"Underground machines are low, wide and articulated because the tunnel is low, wide and has corners"*; a low-profile drive can be **2 m** | the single best paragraph in the pack for this subject |
| **Surface rock-drill silhouettes** | `03` §C.1.1–C.1.3 — crawler top hammer, DTH crawler, rotary blasthole | the quarry and pit-bench machines |
| **What an underground heading must show, object by object** | `04-tunnelling.md` **§E3** — nine numbered objects, plus the light rig | the template this file imitates. Already implemented in `core/env.js` `UNDERGROUND` |
| **The working platform as a designed element** | `05-foundation-piling.md` §A/§B2/§C — BR470, Working Platform Certificate, *"about one third of dangerous occurrences reported by FPS members involve working platforms"* | the single most important ground fact for every piling archetype |
| **Nine distinct foundation machine silhouettes** | `05` §C1–C9 | leader rig, vibro, Kelly rig, CFA, cutter, anchor rig … |
| **HDD site footprint in metres, and the entry/exit pit arrangement** | `07-hdd-trenchless.md` §D5 — 30 × 46 m entry plot for a 305 m crossing; 15 × 30 m exit; pipe corridor 11–15 m wide | the HDD archetype's dimensions are sourced already |
| **Exploration site kit, item by item, with sources** | `02-prospecting.md` §E6 — sump 4 000 L, core boxes 150 × 30 cm, chip trays, core photography station, core saw | the greenfield pad's *props* |
| **How to tell an RC rig from a core rig at 50 m** | `02` §E4 — *"The core rig site is wet; the RC site is dusty."* | the best single line in the pack for site art |

| **NOT covered anywhere in `01`–`15`** | consequence |
|---|---|
| The word **archetype** — no file classifies *settings* at all | the game classifies by region instead, which is a climate, not a site |
| **Urban site furniture**: hoarding, gate, wheel wash, welfare cabins, laydown, muck-away, concrete logistics | zero hits for `hoarding`, `piling mat`, `laydown`, `site compound`, `wheel wash` across the whole pack |
| **Which method is impossible where** | there is no exclusion list anywhere. Every constraint in the code is `validGround` + `applications`, and neither encodes a *setting* |
| **Drill-pad dimensions, sump sizing, rehabilitation** | `02` §E6 flags these itself as `UNVERIFIED` |
| **Offshore geotechnical spreads** (wind-farm site investigation) | `01` is a hydrocarbon file; the geotechnical offshore spread is a different machine on a different vessel and appears nowhere |
| **Tunnel portal as a surface site** | `04` covers the heading brilliantly and the portal apron not at all |

---

## 0.2 The measured damage — verified against the current tree, 2026-09-04

Everything in this section was read out of the code, not assumed.

### 0.2.1 The 3D site is selected by **region alone**

`src/world/terrain.js` holds one `REGIONS` recipe per region, each with a single
`kit` string. `buildKit()` branches on that string and nothing else:

| region | `kit` | everything the kit contains |
|---|---|---|
| `nordic` | *(none)* | **nothing** — trees and rocks only |
| `german-site` | `german` | one blue site container, a spoil cone cluster, three rebar cages |
| `iberian-quarry` | `quarry` | six pale rubble cones, one haul-road berm |
| `alpine` | `alpine` | insulated crew shelter + generator skid |
| `sahara` | `desert` | shade canopy over the rod rack, four jerrycans |
| `north-sea` | `offshore` | deck beams, handrails, **a moon-pool surround**, a life buoy |
| `andes` | `mine` | eight sample bags, a four-tray core-box rack |
| `arctic` | `arctic` | the same crew shelter as alpine, painted red |

The only method-dependent branch anywhere in the surface builder is
`UNDERGROUND[methodId]`, a binary surface/underground switch. **There is no
application input, no method input and no archetype concept.** One kit per
climate is the whole model.

### 0.2.2 The 89 pairings the contract generator can currently produce

Enumerated by running `methodsForRegion(region, 60)` for all eight regions.
Every pairing below is reachable, and the **leak channel** column names the
shared `applications` entry that lets it through.

| region | methods currently offered |
|---|---|
| `nordic` | auger · cable-tool · top-hammer · site-investigation · dth · overburden · core · **rotary-kelly** · **cfa** · **rockbolt** · anchor · **driven-pile** · **cased-cfa** · sonic · **jet-grouting** |
| `german-site` | auger · cable-tool · top-hammer · site-investigation · overburden · rotary-kelly · cfa · rockbolt · anchor · driven-pile · cased-cfa · **tunnel-jumbo** · hdd · sonic · jet-grouting · **raise-boring** |
| `iberian-quarry` | top-hammer · dth · overburden · core · rc · **rotary-kelly** · rockbolt · anchor · tunnel-jumbo · **hdd** · longhole · raise-boring |
| `alpine` | auger · top-hammer · overburden · core · rc · **rotary-kelly** · **cfa** · rockbolt · anchor · **driven-pile** · **cased-cfa** · tunnel-jumbo · **hdd** · sonic · jet-grouting · raise-boring |
| `sahara` | auger · cable-tool · site-investigation · overburden · oil-rotary · **cased-cfa** · **hdd** · sonic |
| `north-sea` | **auger** · **cable-tool** · site-investigation · oil-rotary · sonic |
| `andes` | top-hammer · dth · overburden · core · rc · rockbolt · anchor · tunnel-jumbo · longhole · sonic · **jet-grouting** · raise-boring |
| `arctic` | site-investigation · dth · overburden · core · rc · anchor · sonic |

**The four leak channels**, in order of damage:

1. **`civil-infrastructure`** — carried by nine methods and by four regions. It
   is what puts `rotary-kelly` and `hdd` on a quarry bench and `driven-pile` on
   an Alpine portal apron.
2. **`environmental`** — carried by seven methods (auger, cable-tool,
   site-investigation, overburden, cased-cfa, hdd, sonic). It is what puts
   **double-rotary cased CFA piling and HDD in a Saharan water field**.
3. **`site-investigation`** — carried by auger and cable-tool. It is what puts
   **a hollow-stem auger and a percussion spudder on a North Sea platform**.
4. **`foundation-piling`** and **`anchoring`** — what put Kelly rigs, CFA and an
   underground rock bolter in a Nordic forest.

The precedent for the fix is already in the file. `data.js` removed
`civil-infrastructure` from `north-sea` with the comment *"There is no highway on
a platform."* **That instinct is right and was applied once. It needs applying
everywhere, and at method granularity, not application granularity.**

### 0.2.3 Four defects found in code while auditing this

These are specific, reproducible and cheap to fix.

| # | defect | evidence |
|---|---|---|
| **D1** | **`raise-boring` renders on the SURFACE kit.** `data.js` `UNDERGROUND_METHODS` lists four methods (`rockbolt`, `longhole`, `tunnel-jumbo`, `raise-boring`); `core/env.js` `UNDERGROUND` defines only **three** — there is no `raise-boring` entry, and the string `raise-boring` does not appear in `env.js` at all. `terrain.js` does `ugSpec = UNDERGROUND[methodId] \|\| null`, so a raise-bore contract falls through to the region's surface kit. **A raise borer is currently drawn standing on a quarry bench in white dust and on a German urban plot.** | `src/core/env.js:295–335`; `src/game/data.js:4141`; `src/world/terrain.js:3426` |
| **D2** | **A Nordic ground-support job prints a surface site line.** `SITE_LINES` has no `under` key for `nordic`, and the selector is `(underground && siteLines.under) \|\| siteLines.surface`. `rockbolt` is reachable in `nordic` (via `anchoring`), so the card reads *"a forestry track an hour from the nearest town"* for a job the engine is simultaneously rendering underground. | `src/game/data.js:4210–4213`, `:5006–5007` |
| **D3** | **The offshore kit builds a moon-pool surround on a fixed platform.** The region's own `rigType` is `'Platform rig'`. A moonpool is a hull opening in a **vessel** — drillship, semi-submersible, monohull geotechnical unit. A fixed platform drills through **well slots / well bays in a conductor guide framework** `[US4561802]`, `[USPTO-5379844]`. The one piece of genuinely offshore-specific geometry in the game names the wrong feature. | `src/world/terrain.js:2171–2189` (`kit === 'offshore'`); `src/game/data.js:2949` |
| **D4** | **Two rigs carry a method their machine class cannot perform.** `bolter` (an underground rock bolter, described in its own copy with a mesh handler and a resin cartridge magazine) also runs `anchor` — a surface slope/retaining-wall method — so an underground bolter can be taken to a Nordic forest anchoring job. And `crawler-th`, described in its own copy as a *"surface top-hammer crawler"* with a screw compressor, also runs `jet-grouting`, which needs a high-pressure grout pump and a multi-tube monitor string, not an air compressor `[EN12716]`, `research/05` §A12. | `src/game/data.js` `RIGS` |
---

# A. THE SITE ARCHETYPES

## A.0 What an archetype is, and why the hypothesis in the brief needed changing

An **archetype** is *a physical setting with its own ground, its own plant, its
own access constraint and its own photograph*. It is **not** a climate, **not** a
country and **not** an industry. The game currently uses climate as a proxy for
all four, and that proxy is the root cause of every error in §E.

The brief's starting list was twelve. My verdict on it, item by item:

| brief's item | verdict |
|---|---|
| urban/city plot | **keep** → **A1** |
| infrastructure corridor (road, rail, bridge) | **keep, but split.** A linear corridor and a **cut slope / retaining wall** are different sites with different machines. Split → **A2** + **A3** |
| quarry bench | **keep, and note the sub-split** → **A4** (aggregate vs dimension stone are different photographs) |
| open-pit mine bench | **keep** → **A5**. `[I]` It is *not* the same as A4: scale, haul fleet, and the presence of grade-control drilling |
| underground drive/heading | **keep, but split.** A **production/development drive or heading** and a **diamond-drill cuddy** are different rooms doing different work. Split → **A6** + **A7** |
| greenfield exploration pad | **keep** → **A8** |
| tunnel portal | **keep** → **A9**. It earns its place because it is the **only archetype where an underground machine legitimately appears in daylight** |
| offshore platform deck | **keep** → **A10** |
| offshore vessel/jack-up | **keep, but split.** A **mobile drilling unit** (jackup/semi/drillship) and a **geotechnical spread** (vessel, liftboat, seabed frame) are different machines doing different work. Split → **A11** + **A12** |
| desert well pad | **keep, and generalise** → **A13 onshore well pad**. `[I]` The desert is dressing; the pad is the archetype, and `research/01` §C.1.1 already sources it |
| water-well smallholding | **keep** → **A14** |
| permafrost pad | **keep** → **A15** |
| — *missing* — | **add A16 brownfield / environmental plot.** Seven of the game's methods carry the `environmental` application and there is no setting for it. This omission is *why* `environmental` became a leak channel |
| — *missing* — | **add A17 HDD entry spread.** `[I]` It is technically a corridor site, but `research/07` §D5 already gives it its own sourced dimensions and its own unmistakable object (the strung product pipe), and it reads as nothing else |

**Seventeen.** `[I]` A first implementation pass does not need all seventeen —
eight would remove every error in §E. The full list is here so the eight are
chosen deliberately rather than by accident.

---

## A.1 Urban plot

**Ground and surroundings.** A bounded, usually rectangular plot inside a built
block. Existing buildings on two or three sides, often party walls. Made ground
and fill over the natural profile. A **basement excavation** may already be
open, retained by a secant, contiguous or diaphragm wall with capping beam and
props. Underground services cross the plot and are the reason for every scan and
trial hole.

### The working platform — the single most important object on the site

**`[F]` The ground the rig stands on is a certified engineered structure, not
"the site's soil".** The design reference is **BRE Report BR 470, *Working
Platforms for Tracked Plant*** `[BR470]`, and the **Working Platform
Certificate** must be **signed by the Principal Contractor before piling
commences**, confirming the platform was properly designed, built to that design,
and will be inspected and maintained. **Platform gradients should not exceed
1 in 10** `[FPS-WPG]`. The European equivalent is the EFFC/DFI guide `[EFFC-WP]`.

**`[F]` Why it matters, in one number:** *one third of all Dangerous Occurrences
reported by FPS members relate to working platforms*, and **a soft spot of only
1 m² can destabilise plant weighing up to 150 t** `[FPS-WPG]`, `[FPS-WPPOS]`.

**`[F]` Real design bearing pressures, published, two load cases each:**

| plant | design bearing pressure |
|---|---|
| Heavy hydraulic rig | **212 and 633 kN/m²** |
| Crane-mounted | 347 and 365 kN/m² |
| CFA | **103 and 206 kN/m²** |
| Mini-pile | 92 and 188 kN/m² |

`[FPS-WPG]`

**`[F]` And the fact that should shape the game's physics.** Track bearing
pressure is **not** weight ÷ track area — real track pressures *"are commonly
much higher than given by a simple calculation of the total rig weight divided by
the total track area"* `[FPS-TRACKTOOL]`. A fully worked example from the same
document: a rig of **377 kN** on **3.81 m × 0.70 m** track pads gives equivalent
design track pressures of **standing 104 kPa · travelling 104 · handling 115 ·
penetrating 84 · extraction 229 kPa**, against a naive weight-over-area figure of
about **71 kPa**.

> **`[I]` The worst platform loading is not drilling. It is *extraction* — 3.2×
> the naive figure. A game that models platform failure should trigger it when
> the player pulls the auger or the casing, not when they bore.**

**`[F]` What the platform is made of:** well-graded compactable material with
**fines not exceeding 15 %** so it drains, typically **6F1, 6F2 and 6S** highway
materials; crushed hard rock for high track loading, crushed demolition material
for lighter or shorter jobs with checks on protruding steel and crushing strength
`[FPS-GRAN]`. And the hazard nobody expects: **excavating through a platform**
(service diversions, obstruction removal, pile caps) compromises it *beyond* the
excavation, with required edge distances that *"may well exceed the 2 m
minimum"* `[FPS-EXCAV]`.

**`[F]` It is also the one thing a city will let you crush stone for.** A city
authority that will not generally sanction concrete crushers *"will allow the use
of city crushers to prepare material for piling mats and ramps, as this reduces
the number of vehicle movements associated with the site"* `[COL-COP]`.

### The boundary, the gate and the welfare

`[F]` **Hoarding is an acoustic element with a spec**: *"erecting impervious
hoardings, of at least **5 kg/m² surface density**, where possible higher than
the line of sight to neighbours"* `[COL-COP]`, and it should carry the
contractor's and site manager's contact details and the working hours
`[CIEH-LONDON]`. `[F]` **Wheel wash is mandatory, not optional**: *"Contractors
must not allow mud or other spoil from sites onto the highway… **Wheel washing
plant or other means of cleaning wheels must be used before vehicles leave
unpaved sites**"*, and where reasonably practicable a wheel washing system
**with a rumble grid** `[COL-COP]`. `[F]` Hoarding and scaffolding require a
**licence** from the highway authority, and **road closures must be arranged for
crane and heavy lifting deliveries** `[COL-COP]`.

`[F]` **Welfare cabins discharge a legal duty**: CDM 2015 Schedule 2 requires
sanitary conveniences, washing facilities with hot and cold water, wholesome
drinking water with signage, changing rooms with secure storage, and rest
facilities with back-supported seating, means of preparing meals and hot water
`[CDM-SCH2]`.

### The day is bounded by consent, not by daylight

`[F]` A real city's standard hours for noisy work: **08:00–18:00 Mon–Fri,
09:00–14:00 Saturday, no noisy working on Sundays or Bank Holidays** — plus
**"reduced impact hours" of 10:00–12:00 and 14:00–16:00 Mon–Fri**, giving
commercial neighbours four quiet hours in the working day. Anything outside that
needs an approved variation `[COL-COP]`.

`[F]` The legal machinery is real and specific. **Control of Pollution Act 1974
s.60** lets the authority specify *the plant or machinery which is or is not to
be used*, *the hours during which the works may be carried out*, and *the level
of noise which may be emitted* `[COPA-S60]`. **s.61** is the contractor's
application for **prior consent**, answered within **28 days**; compliance is a
defence against a s.60 notice, and knowingly contravening it is an offence
`[COPA-S61]`.

**`[I]` That is a better contract-constraint system than anything in the game:
the client does not merely pay you, the authority tells you which machine you may
use and for which hours.**

`[F]` **Vibration limits used in practice**, at the worst-affected floor:
**1 mm/s PPV for occupied residential and educational buildings; 3 mm/s for
occupied commercial premises; 5 mm/s for other unoccupied buildings** — with
exceedance triggering notification, method review, monitoring and pre/post
condition surveys `[CIEH-LONDON]`. Damage assessment references **BS 7385-2**
and **BS 5228-2** `[COL-COP]`.

`[F]` **And there is an official method hierarchy a city will push you down**, in
order of preference: **1. pressed-in (hydraulic jacking) · 2. auger / bored
piling · 3. diaphragm walling · 4. vibratory piling · 5. driven piling or dynamic
consolidation** `[CIEH-LONDON]`.

`[F]` Two mitigation clauses that are pure game mechanics: *"Careful operation of
the piling rig so there is no reversing of the Kelly/auger bars"* `[COL-COP]`,
and — instead of shaking spoil off by slamming into reverse — *"some piling rigs
are equipped with **metal brush** to remove spoil as the auger is taken out of
ground"*, with *"where obstructions are encountered **stop works and review
approach**"* `[CIEH-LONDON]`. **`[I]` A player who clears the auger by
reverse-slamming should get a noise complaint and a stopped site.**

### Before anything is drilled

`[F]` **HSG47** explicitly covers **drilling and piling**: plan the work; locate
and identify buried services; excavate safely. Plans from all asset owners are
necessary but **not sufficient** — cable locating equipment must be used, located
services marked, and hand digging used within defined proximity zones
`[HSG47]`. `[F]` Overhead matters too, and it directly constrains raising a mast:
manage risks within **10 m horizontally** of the nearest wire, with a ground-level
barrier zone **6 m** each side, and exclusion zones of **LV 1 m · 11 kV and 33 kV
3 m · 132 kV 6 m · 275 kV and 400 kV 7 m** `[GS6]`.

### The exclusion zone is a physical, visible object

`[F]` The industry's restricted-zone system is colour-coded: **Red Zone** —
authorised persons only, entered only from the Green Zone and only after a
"thumbs up" from the operator; **Green Zone** — the operator's sight line and the
attendant's position; **black-and-white hatched** — spoil and loading areas
outside the restricted zone that still carry serious injury risk. Published red
zone distances `[FPS-RZ]`:

| plant | red zone |
|---|---|
| **CFA / rigid inclusions** | **10 m** |
| Large-diameter auger (rotary bored) | **5 m** |
| **Driven piling rigs** | **10 m to the side, and *pile length + 2 m* in front** |
| Diaphragm wall | 10 m (+2 m) |
| Concrete pump | 2 m, barriered, from the outer edge |
| Mini rig | 2 m / 4 m |

**`[I]` "Pile length + 2 m in front of a driven rig" is a piece of site geometry
that is instantly recognisable to anyone who has worked on one, and it is free
to implement.**

### Support fluid, cages and concrete

`[F]` **Bentonite is run to acceptance values**, and the plant exists to hold
them `[FPS-BENT]`:

| property | fresh | ready for re-use | before concreting |
|---|---|---|---|
| Density (g/ml) | 1.10 | 1.25 | 1.15 |
| Marsh viscosity (s) | 32–50 | 32–60 | 32–50 |
| Fluid loss, 30 min (ml) | 30 | 50 | — |
| pH | 7–11 | 7–12 | — |
| **Sand content (%)** | — | — | **4** |

Above 4 % sand, slurry is drawn from the bottom of the excavation while clean
slurry is pumped in at the top, routed to a desander or a lagoon. Marsh viscosity
above **50 s** makes desanding difficult; slurry is normally **stored at least
12 hours after mixing to hydrate** `[FPS-BENT]`. The authoritative guide is the
EFFC/DFI support-fluids guide `[EFFC-SF]`. **⚠ One genuine source contradiction:
the piling federation's own guidance calls bentonite a *non-hazardous* waste
`[FPS-BENT]`, while a trade-press article calls it hazardous. `NOT SOURCED` which
is current — do not state either.**

`[F]` **Reinforcement cages**: steel arrives in **two-tonne bundles**; **cages
longer than 18 m require welded lap splices**; cages are lifted **from the
horizontal to the vertical** before installation on designed lifting points
`[FPS-REINF]`.

`[F]` **Tremie concrete**, and the detail most often got wrong: **tremie internal
diameter is a minimum of 150 mm or 6 × maximum aggregate size**, 250 mm commonly
used, and **the tremie stays embedded in the fresh concrete throughout the pour**
— EN 1536 / EN 1538 specify a minimum of **1.5–3 m**, with a recommended working
range of **3 m minimum to 8 m maximum** `[EFFC-TREMIE]`.

`[F]` **The concrete pump and its line are a permanent site feature**: pump
pressure **55–95 bar**; ground and rig lines are steel or **reinforced rubber
hose rated 80–120 bar, usually 100 mm or 125 mm**; on the rig, a line up the mast,
a **180° elbow**, a loop hose, and the **swan neck and concrete swivel** that let
the auger move while pumping. A **concrete agitator drum** keeps supply
continuous. **Hose crossing points must be clearly identifiable to site traffic**,
and clearing a blocked concrete hose *"is one of the most hazardous activities
undertaken on a piling site"*, controlled by an exclusion zone and robust hose
restraints `[FPS-PUMP]`.

`[F]` **Spoil.** In rotary bored work *"the rig is commonly slewed to the side of
the bore and the spoil is discharged"*; in CFA *"spoil emanates at the surface…
The spoil is removed from the proximity of the pile by some form of excavator"*;
displacement auger piling pushes spoil into the ground and largely eliminates it
`[FPS-PUWER3]`. A diaphragm-wall site carries a dedicated hatched **"grab spin
off / tipper loading area"** `[FPS-RZ]`.

### Secant, contiguous and diaphragm walls

`[F]` A **guide wall** — a reinforced concrete kerb built before the wall — gives
alignment and positional control `[BACSOL-DW]`, `[ALPHA-SECANT]`. **Secant
walls** alternate primary and secondary piles, in **hard/soft, hard/firm and
hard/hard** variants, at diameters **600–1 180 mm**, spacing **0.8–0.9 pile
diameters**, secondary depth to **60 m** `[BACSOL-SECANT]`, `[KELLER-SECANT]`.
**Diaphragm wall** panels are **2.8–7.0 m long**, **600–1 800 mm** wide, to
**50 m by grab** and **100 m by cutter**, verticality typically **1:200**; the
cutter's spoil is **pumped to a de-sanding unit**, and *"de-sanding plants must
be sized to match panel volume and production rate"*, with tanks or lagoons for
fresh and recycled fluid and usually a centrifuge for silty ground `[BACSOL-DW]`,
`[KELLER-DW]`. A real constrained city job: a **1 000 mm thick, 221 m long**
diaphragm wall beside a major shopping street, panels 2.8–4.4 m, depths **18 m and
41 m**, with **four to six sonic tubes per panel** on the cages for later
integrity testing `[BACSOL-TCR]`.

`[F]` And the urban constraint that decides the method: *"In urban areas, space
restrictions often do not permit the arrangement of bentonite slurry tanks and
pipes"* `[SPRINGER-BENT]`.

**The photograph.** `[I]` (1) **A clean-edged, uniformly graded stone platform
filling the whole plot, with the pile positions the only breaks in it**, and the
rig standing inside a barriered red zone — 10 m for CFA, 5 m for large-diameter
rotary. Not mud: a certified structure at no more than 1 in 10. (2) **Continuous
hoarding to the back of the pavement, one gated entrance with a wheel wash and
rumble grid, and a stack of welfare cabins.** (3) **The plant train, not the rig,
dominates the plot** — a concrete pump with rigid steel line running to the rig
and up the mast to the swan neck, marked hose crossings, an agitator drum,
reinforcement cages laid flat in bays waiting to be picked from horizontal to
vertical, and, if bentonite is used, mixing and storage tanks and a desanding
plant occupying a quarter of the site.

---

## A.2 Infrastructure corridor — road, rail, bridge

**Ground and surroundings.** **Linear.** The site is a strip and the work moves
along it. A live carriageway or a live railway alongside. Cuttings and
embankments. Bridge piers in or beside water. A compound somewhere along the
length rather than on the work.

**`[F]` The impacts are assessed receiver by receiver, not site-wide.** A real
corridor assessment tabulates predicted noise and vibration for about **150
individual addresses by station number and direction**, models the nearest pile
*and* the next pile 130 ft down the centreline, and notes that each column
position takes **four to five days**, so one receiver can suffer **twelve to
fifteen days** of exceedance as three positions pass `[VTA-NOISE]`.
**`[I]` The rig walks past people's houses. That is what makes a corridor
different from a plot.**

**`[F]` Logistics dominate, and the numbers are startling.** One rail-corridor
earthworks package used **190 grab wagons over 13 days, peaking at 22 grab
lorries per day, removing 3 000+ tonnes of spoil**, under temporary traffic
management, with an *"Any Line Open Co-Ordinator"* on the team `[VANELLE-BH]`.

**`[F]` Access windows dictate mobilisation, not the programme.** A contractor
holds a large stock of **unjointed precast piles up to 16 m long** specifically to
work *"within tight timescales and possession windows"* `[AARSLEFF-RAIL]`.

### Rail specifics

`[F]` Planned engineering work is scheduled **overnight, at weekends and during
bank holidays**, with *"periods such as Christmas, Easter and bank holidays…
often the most practical times to complete major upgrades that require railway
lines to be closed"*, planned **up to 12 months in advance** `[NR-PLANNED]`.

`[F]` A real rail piling job, end to end: **120 sheet piles of 3.5–5.5 m
installed in four shifts using three road-rail-vehicle-mounted piling
attachments**, plus **46 piles at 273 mm and 6 at 323 mm** driven with small drop
hammer rigs to fit constrained platform areas, all within *"limited weekend
possessions"*, with plant and materials moved by **RRVs across a temporary poly
bridge**, around known buried services and existing concrete obstructions
`[VANELLE-LUTON]`.

`[F]` **The machine is not a leader rig — it is a road-rail vehicle with an
attachment**, and the safety regime is its own: the *Code of Practice for Any
Line Open Working* (effective 1 September 2016) specifies when **Movement
Limiting Devices** must be fitted `[NR-ALO]`, and the on-track plant regime
covers the operations scheme, attachments, tandem lifting, duplex communications
and road-rail access points `[NR-OTP]`. `[I]` **Overhead line equipment caps
mast height absolutely**, and the generic power-line analogue is `[GS6]`;
**`NOT SOURCED`: the numeric rail OLE clearances**, which sit behind paywalled
standards. **Do not print a rail clearance figure.**

### Bridge piers in or near water

`[F]` **Cofferdam sequence**: pre-dredge, drive temporary support piles, install
bracing frames, deploy sheet piles, pump out, then add internal bracing
progressively as the dig deepens. **Single-walled** suits small enclosed areas in
roughly **4–6 m** of water; **double-walled** for larger areas in deeper water;
**cellular** — interconnected sheet-pile cells filled with clay, sand or gravel —
is most suitable for deep marine work `[DB-COFFERDAM]`.

`[F]` **And the machine changes.** Crane-suspended panel driving is the
over-water method, explicitly recommended for *"works over water or at river/dock
walls, bridge abutments and bearing piles… locations where tracked rigs cannot
operate safely"*, using piling gates, trestles and guide frames, with vibratory
penetration then a **crane-suspended hydraulic impact hammer** to final toe level
— and **not** appropriate where embankment slopes prevent tracked rig access
`[SPUK-CONV]`. **`[I]` This is the same lesson as offshore (§A.12b): once you are
over water, the leader disappears and the hammer hangs on a wire.**

`[F]` **Working over water carries its own kit**: barriers at open edges;
**throw lines 8–12 mm diameter, brightly coloured and buoyant**; a **grab line
tensioned downstream at 45°** in moving water; **rescue boats** purpose-designed
for casualty extraction and competently crewed; **auto-inflating lifejackets
always worn**, because they turn an unconscious person face-up and a buoyancy aid
may not `[HSE-DROWN]`.

`NOT SOURCED`: numeric traffic-management values (safety zone lengths, taper
rates, cone spacing) — the standard is `[TSM8]`, and I did not extract them.
`NOT SOURCED`: barge- or pontoon-mounted *piling* rigs and temporary causeways.
The crane-suspended route above **is** sourced and is the safer default to model.

**The photograph — road.** `[I]` (1) **A coned taper, lane closure and diversion
signage running past the works**, the operation in a long narrow corridor rather
than a compound. (2) **A linear granular platform following the alignment**, the
rig crabbing along it position to position, piles stacked longitudinally.
(3) **Grab lorries queued on a one-way haul route with a wheel wash and a road
sweeper** — corridor jobs are logistics-limited.

**The photograph — rail.** `[I]` (1) **A road-rail vehicle sitting on the rails
with a piling attachment on the boom** — not a tracked leader rig — and the
access point it entered by. (2) **Floodlights, night work, the line closed**, and
short unjointed piles staged trackside for one window. (3) **Red/white live-line
delineation, a hi-vis controller directing the machine, movement-limiting devices
on the slew, and OLE overhead.**

**The photograph — bridge.** `[I]` (1) **A sheet-piled cofferdam ring around the
pier position** with internal walings and struts and pumps discharging over the
wall. (2) **A crawler crane suspending a hammer over a piling gate or trestle
guide frame**, not a self-standing leader. (3) **A rescue boat on station
downstream, auto-inflating lifejackets, edge barriers, and a throw line with a
45° tensioned grab line across the flow.**

---

## A.3 Slope, cutting and retaining wall

**Ground and surroundings.** A **face**, not a plot: a rock cut beside a road or
railway, an unstable natural slope, an existing retaining structure being
strengthened. Loose blocks, seepage, sometimes netting already hung. The machine
works on a **bench cut into the slope**, on a platform, or is roped to the face.

**Plant and furniture.** `[F]` The machine classes actually used are *"track-
mounted drill rigs"*, *"rope-access drilling platforms"*, *"pneumatic percussion
drills"* and *"grout mixing and pumping systems"* `[ROCKSUP]`; contractors also
list *mini-rigs*, *excavator-mounted rotary and rotary-percussive units*, and
*soil-nailing feed beams for excavator attachment* `[FORKERS]`. In steep ground
the carrier itself changes: **walking or "spider" excavators** grip slopes that a
crawler cannot stand on `[GEOSTAB-NAIL]`.

### The geometry, sourced — this is what sets a slope site out

`[F]` From the highway administration's own ground-anchor guide `[FHWA-GEC4]`:
**design loads of 260–1 160 kN** are handled *"without unusually heavy
equipment"*; **drill hole diameter generally less than 150 mm**; **total anchor
length 9–18 m**; **minimum unbonded length 3 m for bar, 4.5 m for strand**;
inclination **10–45°, commonly 15 to 30 degrees below horizontal**, with grouting
below 10° uncommon without special techniques.

`[F]` **Four grout-body types, and they drive the plant**: **Type A** straight
shaft, gravity or tremie grouted; **Type B** straight shaft, pressure grouted at
**greater than 0.35 MPa** as the auger or casing withdraws; **Type C**
post-grouted through a sealed tube with check valves, injections **separated by
one or two days**, fracturing the initial grout to enlarge the body; **Type D**
underreamed `[FHWA-GEC4]`.

`[F]` **The testing is the deliverable**, and it needs its own kit: a hydraulic
jack and pump loading **all prestressing elements simultaneously**, **ram travel
at least 152 mm**, each increment applied within 60 seconds, test load within
**75 % of the jack and pump pressure rating**; load monitored by gauge, and
**for any test with an extended load-hold a load cell is required**, because a
gauge cannot track jack load loss or temperature effects. Three test types —
**performance, proof and extended creep** — with maximum test load normally
**1.33 × design load** and steel stress not exceeding **80 % of SMTS**
`[FHWA-GEC4]`; the test methods themselves are standardised `[ISO22477-5]`.

`[F]` **Flush and cuttings**: in unstable soil or rock the hole is cased and
**water or air flushes cuttings out of the cased hole**, and *excess air pressure
can remove groundwater and fines, leading to hole collapse or ground heave*
`[FHWA-GEC4]`. For self-drilling hollow bar the returning cement-suspension flush
is **checked by passing it through a sieve**, and flow out of the top of the hole
**must not be interrupted** `[ISCHEBECK]`.

### How the site differs from a piling site — the absences are diagnostic

`[I]`, with each element traceable to the sources above:

| a piling plot has | a slope/anchor site has instead |
|---|---|
| Ready-mix trucks and a concrete pump | **bagged cement or a small silo**, mixed on site; volumes in litres, not cubic metres |
| Reinforcement cages and a cage-lifting crane | **a bar, a strand bundle, or the drill rod itself** (self-drilling systems) |
| A tremie pipe and a concrete skip | **a grout pump** through the hollow bar, grout tube or casing |
| A level certified platform | **a bench cut into the slope, a scaffold, a crane basket — or a rope** |
| — | **a stressing jack, hydraulic power pack, calibrated gauge and load cells** |

`[F]` And where the machine goes indoors — basement propping and underpinning —
the class changes again: **low-headroom rigs working under a 2.0–2.2 m soffit**,
with **the diesel power pack left outside** and two hydraulic hoses run in through
a window or hatch, or an electric rig for exhaust reasons; drill rod in
**1–1.5 m sections** because nothing longer fits `[RIXGE]`, `[HARDMAN]`,
`[ISCHEBECK]`.

**The distinction the site encodes.** `[F]` *"A rock bolt is installed in
competent rock and develops bond to the rock mass through grout in the borehole
annulus or through a mechanical anchor at the toe, with bolt lengths typically
4 to 25 feet. A soil nail is installed in soil or weathered rock and is fully
grouted along its full length to engage the surrounding ground continuously,
with nail lengths typically 15 to 60 feet"* `[ROCKSUP]`.

**A real job, described.** `[F]` A slope above a major traffic artery: fractured
rock over the bottom two-thirds, overburden soil above; **60 rock anchors**,
**2 200 sq ft of high-strength galvanised mesh**, drainboards on the front face
channelling to **three collection points**, shotcrete facing over reinforcing
steel — installed with an **excavator-mounted drill from the roadway above** and
from the slope's bottom and top, with **no intermediate benches** cut
`[GEOSTAB-NAIL]`. And at the spectacular end: a dam spillway stabilised with
**48 production post-tensioned anchors**, tendons of **36 to 57 strands each**,
**203 844 linear feet of tensioned strand** delivering **81 430 800 lb of force**
`[BRAYMAN-KERR]`.

**The governing standards.** `[F]` **EN 1537** for grouted, stressed, tested
ground anchors — which explicitly **excludes** tension piles, screw anchors,
mechanical anchors and soil nails `[EN1537]`; **EN 14199** for micropiles, defined
as **shaft diameter less than 300 mm** `[EN14199]`; **BS 8081** for grouted
anchors `[BS8081]`; and the free full-text design guides `[FHWA-GEC4]`,
`[FHWA-MICRO]`.

**Access and room.** Almost none. The rig is winched, craned or walked onto a
narrow bench; sometimes a person on a rope is the only access.

**The photograph.** `[I]` (1) **A machine standing on legs, not tracks, at an
angle that looks impossible** — a walking excavator gripping a steep slope with a
drill mast on the boom, or a small rig visibly roped to the face. (2) **The face
is quilted, not clad** — a grid of galvanised mesh pinned by a regular pattern of
small steel plates and nuts, **grout stains bleeding downslope from each head**,
drainboard strips running to a few collection points. (3) **The plant is at the
top or the bottom, on the road, not on the slope** — grout skid, water bowser,
bundled hollow bars, boxes of sacrificial bits at road level, hoses running up
the face, and **often no access track cut at all and no bench**.

---

## A.4 Quarry bench (aggregate) — and the dimension-stone variant

**Ground and surroundings.** Engineered **benches and berms** cut in rock, a
**highwall**, a **haul road** spiralling down, a crusher and stockpiles at the
floor, water for dust suppression, and everywhere the colour of the rock as dust.
`[F]` Extraction is *"drilling inclined, vertical or horizontal blastholes in
single- or multiple-row patterns to depths ranging from a few meters to 30 m or
more, depending on the desired bench height"* `[BRITANNICA-Q]`.

**The dimension-stone variant is a different photograph.** `[F]` Iberia is the
case in point: Portugal *"produces more than a hundred varieties of ornamental
stones, distributed by the commercial granite, limestone, marble and slate
groups"*, granite in the north, limestone and marble in the centre, and at
**Valongo the slate extraction takes place underground** `[EUROLITHOS-PT]`.
`[I]` A dimension-stone quarry has **wire saws and chain cutters, squared blocks
stacked on the floor, and clean vertical cuts instead of blast-shattered rock**;
`[F]` block-cutting machinery for stone quarrying is a distinct product family
`[DINOSAW]`. Do not draw an ornamental-stone quarry as a blast quarry.

**The blast pattern is the site's geometry, and it is sourced.** `[F]` From the
US regulator's own blaster-training module `[OSMRE-BLAST]`:

| parameter | rule |
|---|---|
| **Burden** | ≈ **25 × charge diameter** for ANFO; **30–35 ×** for denser emulsion. Worked: 9-inch holes on a 50-ft bench → **19 ft**; 12¼-inch → **25 ft** |
| **Spacing** | **1.8–2.0 × burden** for a row fired simultaneously; **1.0–1.2 × burden** (near square) when firing sequentially |
| **Stemming** | **0.5–1.3 × burden**, good first approximation **0.7 × burden**; must be sized crushed stone or drill cuttings. Removing it can cut the maximum effective burden by **more than 30 %** |
| **Subdrilling** | drilled below floor level so the floor comes out to grade; backfilled with cuttings; **explosives must never be loaded into the subdrill**. *"More prevalent at quarry operations"* than at surface coal mines |
| **Timing** | rule of thumb **2 ms per foot of burden**; fragmentation **5–15 ms** after detonation; rock moves out at **50–100 ft/s** |
| **Patterns** | square, rectangular, staggered — staggered for row firing, square/rectangular for **V/chevron and echelon** rounds |
| **Protecting the highwall** | **presplitting, smooth blasting, line drilling, cushion blasting** |

`[I]` **For a game this is a ready-made scoring axis that is entirely real: burden
and spacing set fragmentation, stemming set flyrock and airblast, subdrill set
whether the floor comes out level.** None of it is currently modelled.

**Plant and furniture.** Surface crawler drills on the bench — `[F]` the
catalogue split is real: **top-hammer rigs on roughly 1–5.5 inch holes** for
construction and quarry work, **DTH rigs on 3.5–8 inch holes** *"for limestone
and aggregate quarries, surface mining and construction"* `[EPIROC-SURF]`,
`[EPIROC-D65]`, `[EPIROC-BLASTHOLE]`. `[I]` The practical read: a small or
medium aggregate quarry is top hammer on 3–4 inch holes; a big limestone or
hard-rock quarry moves to DTH on 4–8 inch holes. Around the rigs: a blast
pattern flagged out; stemming material; the shot-firer's exclusion zone; a
water truck; a face shovel and haul trucks; and **below, the plant** — `[F]`
*"drilling and blasting to crushing, screening, conveying, and stockpiling"*,
with **primary crushing stations, vibrating screens, transfer points, belt
conveyors with full-length skirting, haul roads with speed limits around
15 km/h, tarped or wind-fenced stockpiles, and water trucks with misting
cannons, atomised fog and surface sprays** at feed chutes, crusher inlets and
transfer points `[MINSYS-DUST]`.

**The regulatory frame that shapes the ground itself.** `[F]` Under the UK
Quarries Regulations 1999 and its Approved Code of Practice `[HSE-L118]`,
`[SI1999-2024]`: **Regulation 13** requires that *"benches and haul roads are
designed, constructed and maintained so as to allow vehicles and plant to be
used and moved upon them safely"*; **Regulation 12** requires inspection at
least once a shift where risk is high, with imminent-risk triggers including
**loose ground or rocks above a roadway or workplace** and **missing edge
protection on roads, benches, ramps and tipping points**; and the operator's
**excavations and tips rules** must state *"the maximum vertical face height
which may be created or left at the end of a working period"*, the **sequence in
which the site will be excavated**, and **maintenance arrangements for faces,
for example mechanical scaling**. Blasting (Part V) requires a determined
**danger zone**, evacuation and shelters, **flags or notices, audible withdraw
and all-clear signals, posted sentries, direct notification of local
residents**, and **post-blast inspection of the face for misfires**.

**`[F]` And the point that matters most for a game: there is no numeric face
height or berm width in the regulations.** The operator's own excavation rules
set the maximum face height `[HSE-L118]`. So the earlier `NOT SOURCED` on bench
width stands, and now it stands for a *reason*: **the figure does not exist as a
rule. Do not print one.**

**The dimension-stone variant is a different operation, not a variant.** `[F]`
From an edited technical treatment `[BRIT-QUARRY]`: benches correspond to the
**thickness of the desired blocks, typically 4.5–6 m (15–20 ft)**; primary
blocks may be **6 m high × 6 m deep × 12–18 m long, weighing 1 200–2 000 tonnes**,
later divided into **mill blocks of 15–70 tonnes**; removal was traditionally by
**fixed derricks**, so *"the plan area of a quarry was set partly by the reach of
the derrick boom"*, now being replaced by front-end loaders carrying 30-tonne
blocks; and — the number that dominates the site — **usable stone is only
15–20 % of that quarried in some quarries**, so the **waste or "grout" pile** is
a primary planning item. The cutting methods are all different from blasting:
**abrasive wire saw** (6 mm helicoidal wire, ~27 m of wire consumed per m² of
granite, a 6 × 9 m cut needing ~1 450 m of wire, a setup running 3–5 km);
**jet burners / channel burners**, a fuel-and-oxygen flame *"similar to a
miniature rocket engine"* cutting a channel **75–150 mm wide and up to 6 m
deep** in quartz-bearing hard rock; **line drilling**; **feathers and wedges** in
holes **125–250 mm apart**; **diamond wire saw**, needing **two intersecting
boreholes 40–90 mm diameter** — one vertical from the upper corner, one
horizontal along the bottom; and **chain/arm saws** for marble, limestone,
travertine, slate and some sandstone. Diamond wire now dominates, at linear wire
speeds of **24–30 m/s** `[RG-DIMSTONE]`.

**`[F]` Drilling absolutely does happen in a dimension-stone quarry** — the
manufacturers sell a dedicated dimension-stone drill line `[EPIROC-DIM]` — but
it is **line drilling, wire-saw entry holes and splitting holes**, not blastholes.

**What Iberia actually quarries — the region evidence.** `[F]`
- **Portuguese marble**: the Estremoz Anticline is **~42 km long, up to 8 km
  wide**, with marble concentrated in **27 km²**; aerial analysis identified
  **almost 500 quarrying and exploration sites**, with **187 quarries operating
  simultaneously in the late 1980s** and **90 % now in Vila Viçosa**; colours
  white, cream, pink and grey; worked **since 370 BC** `[IUGS-ESTREMOZ]`.
- **Portuguese ornamental limestone**: the Estremadura Limestone Massif runs
  NE–SW over **~900 km²**, about half inside a natural park `[WP-MCE]`,
  `[SOLANCIS]`.
- **Spanish slate**: **90 % of Europe's natural roofing slate comes from
  Spain**, principally Galicia; the Truchas Syncline hosts *"the biggest roofing
  slate outcrops of the world"*; in the 1960s Spain was up to **90 % of world
  production**, and in **2012 produced more than 580 000 t worth about
  $380 million** `[WP-SLATE-ES]`, `[SPR-SLATE]`. The process is: survey →
  sampling → **overburden removal** → **blocks sawn with diamond-beaded steel
  cables** → **sawing and splitting along natural cleavage planes by hand**
  `[WP-SLATE-ES]`.
- **Spanish granite**: O Porriño hosts **the world's biggest pink granite
  quarry, over 250 000 t of blocks per year**; Galicia is 2nd in Europe and 5th
  globally, with ~**5 000 direct and indirect workers** `[CLUSTER-PEDRA]`.
- **Spanish marble**: Macael, Almería — *"one of the most important extraction
  centers in Spain"*, ornamental use spanning **over 5 000 years**
  `[IUGS-MACAEL]`.

**`[I]` The game's `iberian-quarry` is therefore under-specified rather than
wrong.** Iberia is a *dimension-stone* region at least as much as an aggregate
one, and the two are different photographs. Its existing `under` line —
*"an adit driven off the quarry floor"* — is also independently supported, since
Portuguese slate at Valongo is extracted underground `[EUROLITHOS-PT]`.

**Access and room.** Good tracked access along the bench, with a highwall on one
side and a drop on the other. Machines tram along the bench; nothing crosses it.

**The photograph — aggregate.** `[I]` (1) **A grid of drilled holes marching
along the bench parallel to the crest**, each flagged, with a crawler drill over
one of them, **dust hood and collector at the collar**, and a white ring of drill
dust round each hole. (2) **A stepped grey highwall with a catch berm part-way
up and a muckpile at the toe**, an excavator working into it, dump trucks on a
graded ramp. (3) **The plant below** — primary crusher, trestle conveyors, and
**conical stockpiles graded by product size** with a misting cannon on a transfer
point.

**The photograph — dimension stone.** `[I]` (1) **Clean rectangular sawn steps**
with **parallel wire-saw striations** and **no muckpile anywhere** — the rock is
cut, not broken. (2) **Squared blocks standing on the floor in rows like
buildings**, paint-numbered, with a block-forked loader or a guyed derrick.
(3) **Wire-saw hardware in shot** — a drive flywheel on rails, wire vanishing
into two intersecting boreholes at a block corner, **water running white with
rock flour**, and a huge **waste "grout" tip** dominating one side of the pit.

---

## A.5 Open-pit mine bench

**Ground and surroundings.** `[F]` A **flat engineered floor inside a stepped
wall**. At a real gold operation, **mining benches vary from 5 m to 10 m and are
excavated in flitches of about 2.5–3 m**, with load-and-haul by **90–180 t dump
trucks and 150–350 t excavators**, ore mined selectively to cut-off and
segregated into grade ranges `[GF-STIVES]`. For a large pit the general figure is
**12–15 m benches, 20–40 m wide**, with the haul road *"situated at the side of
the pit, forming a ramp"*; the stepped wall of batter and berm exists *"to
prevent rock falls continuing down the entire face"* `[WP-OPENPIT]`.

**Two very different drill classes share the bench — and this is the split the
game does not make.** `[F]`

| class | holes | what it looks like |
|---|---|---|
| **Rotary blasthole** — the production machine | **152–406 mm (6–16 in)**, pulldown **60 000–125 000 lb** | a tower two to four times the machine's body length; one published class has a **53 ft tower** for *"15 m bench heights"*, another single-passes **18 m**, another reaches **59.4 m** multi-pass `[EPIROC-BH]` |
| **Tracked surface crawler** — top hammer and DTH | **27–229 mm** | the machine described in `research/03` §C.1.1–C.1.2 |
| **Grade-control RC** — sharing the bench with both | see §A.8 | *"supports fast sampling cycles and adapts well to confined in-pit environments"*, mattering *"where bench space is limited"* `[DMA-GC]`; at a real gold mine *"Grade control is generally expedited by **inclined RC drilling** on grids determined by the ore body characteristics"* `[GF-STIVES]` |

**`[I]` A 250 mm rotary rig on jacks with a 53 ft tower and a dust hood is a
different animal from a 100 mm tracked top-hammer crawler, and the game draws one
machine for both.**

**Blast pattern, sourced.** `[F]` A real open-pit study: hole depths
**3.5–10.5 m**, burden **3–3.5 m**, spacing **3.5–6 m**, stemming **1.5–4.0 m**
`[NAT-BLAST]`. Marking out has moved from burden poles to **contact-free 2D and
3D laser and photogrammetry face profiling**, giving a 360° minimum-burden view
per hole fed straight to drill navigation — and irregular blasthole locations
produce *"overshooting in some areas and hard toes in others"* `[PQ-L4]`.
Stemming is inert crushed stone preventing the *"rifle"* or *"gun-barrel"*
effect, with **larger-diameter holes needing larger crushed stone** and front-row
stemming increased where the face is less than 90° `[PQ-L4]`.

**Dust, and why the drill is wet.** `[F]` *"Water is injected into the air stream
to create a water-vapor mist that helps dampen fine dust generation as well as
assist in stabilizing the collar zone"* — and it cools the drill string
`[PQ-L4]`. `NOT SOURCED`: haul-road water carts as such; model them, do not cite
them.

**Automation is already normal here.** `[F]` Published control systems offer
auto-drill and auto-level, and a bench-remote mode where **one operator runs one
or several rigs from off the drill** `[EPIROC-BH]`. **`[I]` That is a plausible
late-game upgrade the game could offer, and it is real.**

**The photograph.** `[I]` (1) **A flat, dusty engineered floor with a stepped
wall behind it — batter, berm, batter, berm — and a haul ramp running up the pit
side.** The bench is a *level* surface in a *stepped* hole. (2) **A rotary rig
with a vertical tower two to four times its own body length, on jacks, with a
dust hood skirting the collar**, and behind it a grid of finished collars, each a
black circle with a cone of grey cuttings round it. (3) **The pattern marked out
ahead of the rig and the explosives truck behind it** — pegs and paint on the
bench, a bulk emulsion truck with a boom hose over a hole, stemming aggregate
stockpiled nearby.

---

## A.6 Underground drive and heading

**Already specified, and already built.** `research/04` **§E3** is a complete
nine-object brief for the heading, and `core/env.js` `UNDERGROUND` implements it
for `tunnel-jumbo`, `longhole` and `rockbolt` with per-method dimensions
(12.6 × 8.4 m heading vs 5.0 × 5.0 m production drive). **This archetype is the
best thing in the game and should be the model for the rest.**

The governing physical fact, from `research/03` §C: *"Underground machines are
low, wide and articulated because the tunnel is low, wide and has corners… A
development drive might be 4–5 m high and 4–5 m wide; a low-profile drive can be
**2 m**"* `[W-SANDVIK-DD211L]`.

**Two things this pass adds, both of which change what the drive should contain.**

**`[F]` (1) The services on the wall have names, and a real small gold mine lists
them:** **11 kV power cable, water line, air line**, plus primary ventilation
installed as its own work item `[VERTEX]`. `[F]` Auxiliary ventilation branches
off the main circuit using *"temporarily mounted ventilation fans, Venturi tubes
and **disposable fabric or steel ducting**"*, running either as a **forcing**
system pushing fresh air to the heading or an **exhausting** system drawing
contaminated air out `[WP-VENT]`, and exists specifically to serve *"dead-end
headings and active work areas the primary circuit doesn't reach"* `[MINETEK]`.
Hanging detail from a real study: duct run **along the vault centreline on
φ8 mm steel wire ropes**, hooks welded to **M12 expansion bolts at 5 m
intervals**, with **the fan about 10 m inside the entrance** `[PMC-DUCT]`.

**`[F]` (2) Mucking differs by industry, and this is a credibility trap.**
Norwegian *civil* tunnels muck with **large wheel loaders with side-tilting
buckets** (35–40 t loader ≈ 5–5.5 m³ bucket) loading **ordinary 6×4 and 8×4 road
tippers** `[NFF26]`; *mines* use **LHDs** — a published class carries **21 t at
8.0–11.2 m³** and is **12.6 × 3.2 × 2.9 m** `[SANDVIK-LHD]`. **`[I]` Drawing an
LHD in a European road tunnel, or a road tipper in a mine drive, is the kind of
mistake the owner is trying to avoid.**

**And the face itself, sourced far better than before.** `[F]` The **parallel
(burn) cut dominates**; reaming (uncharged) holes are **often 102 mm** with the
nearest charged holes 15–25 cm away; **blast-hole diameter 48 mm**; standard
drilling length **5.3 m**, with 6.2 m rods in larger road and rail tunnels; face
regions run **cut → stoping/easers → lifters → buffer row → contour** `[NFF26]`,
`[PSU-871]`. Contour practice: **spacing c/c 0.7 m**, contour charge reduced
**75 %**, inner contour **50 %**, cut and lifters charged 100 % `[NFF26]`. And the
reason the excavation is never a clean prism — **look-out**: on one real project
the theoretical blasting cross-section was **63.12 m²**, at collaring **68.43 m²**
and at hole bottoms **85.03 m²** `[NFF26]`.

`[F]` Charging in modern practice is **bulk site-sensitised emulsion**, not
cartridges or ANFO; a charging unit takes **electric and hydraulic power from the
drilling rig**; a **25 g booster primer** is pushed ahead of the emulsion and a
retractor withdraws the hose at a calibrated speed; detonators are **non-electric
long-period tubes gathered in bunches and ringed by a detonating cord taped into
a closed circle around the face**; the cut finishes in **600–800 ms** and
**lifters usually fire last to lift the muck pile** `[NFF26]`.

`[F]` Support quantities, from the same source: shotcrete **80 mm** in good
ground rising to **150 mm plus reinforced arches** in very poor; bolts at
**c/c 2.5 × 2.5 m** in good ground tightening to **1.3 × 1.3 m**; contractual
capacities of **manual scaling 1 h/h, bolts to 5 m at 12/hr, sprayed concrete
6 m³/hr**; and the blasted profile is **3D-scanned after scaling and before
shotcrete** — *"typical 5 minutes for a 6 metres round"* `[NFF26]`.

**Ground support hardware, with the fact that catches non-miners out.** `[F]`
`[HOEK-SUPPORT]`:

| element | yield | steel / tube Ø | hole Ø |
|---|---|---|---|
| Mechanically anchored tensioned bolt | 414 or 1034 MPa | 19–35 mm bar | 41–63 mm |
| Grouted dowel | 414 MPa | 19–25 mm bar | 35–38 mm |
| **Swellex** | **130 kN** | 26 mm tube | **33–39 mm — the bolt is SMALLER than the hole**, expanded at 20 MPa |
| **Split Set** | **90 kN** | 33/39/46 mm tube | **32/35/41 mm — the bolt is LARGER than the hole**, driven in |
| Grouted cable bolt | **500 kN** | 20 mm cable | 35 mm |

with rules of thumb: dowel length **½ to ⅓ of the span**, **spacing ≈ ½ the dowel
length**, and — a nice piece of hard-won practice — split sets are chosen in
rockburst ground *"because they will slip under shock loading but will retain
some load and keep mesh in place"*, while **shotcrete and mesh must not be used
in drawpoints** `[HOEK-SUPPORT]`.

**`[I]` The game's `rockbolt` copy already gets the hole-versus-bolt rule right
for friction bolts. `research/15` corrected a wrong `crookedPerDev` penalty on
exactly this point. Keep that; the table above is the wider context.**

**The photograph.** `research/04` §E3, condensed: (1) a **horseshoe/D profile,
not a circle**; (2) the **ventilation duct** slung along the crown — *"This
single object does more to say 'tunnel' than anything else in the frame"*;
(3) **bolt plates in a pattern** and the shotcrete boundary marking the player's
own progress.

---

## A.7 Underground exploration cuddy

**This archetype is now sourced with real dimensions from real gold mines, and it
is the one the owner asked about.**

**`[F]` The geometry.** At a small operating gold mine: *"A drill cuddy is being
developed… **The drill cuddy will be mined up to 6 m in height and 7 m depth** to
cater for the [underground core] rig. **The rig will drill circa 7 holes in this
location** designed by the geologists, targeting the stacked veins below and
above the adit"* `[VERTEX]`. At a larger one: underground exploration drilling
from a **5 m × 5 m drive**, with *"the first drill cuddy established at
approximately 59200 North"* and further cuddies planned **approximately every
100 metres** along the drive — drilling ground that *"has not been previously
tested due to topographical challenges associated with drilling from the
surface"* `[K92]`.

**`[I]` So the correct geometry is a short cut-out off the side of a ~5 × 5 m
drive, roughly 6 m high and 6–7 m deep, repeating every ~100 m. The drive is the
corridor; the cuddy is the alcove. A rig standing in the middle of a running
drive would be wrong — it would block the drive.**

**`[F]` The machine.** Underground core rigs are **modular into five units —
power pack, feed frame, rotation unit, foot clamp, controller** — and *"capable
of drilling holes in all angles from vertically up to vertically down"*, with
class depths of roughly **418 m, 887 m and 1 500 m** `[BLY-UG]`, `[BLY-LM75]`,
`[BLY-UGSVC]`. At the small end a published unit is *"ideal for core drilling in
narrow tunnels or in galleries"*, **220 m vertical down, 180 m vertical up**,
feed 20 kN, **power unit only 15 kW**, carrier **skid**, with a listed option of
a **"column"** `[EPIROC-DIAMEC232]`. `[I]` **That column, plus the "foot clamp"
module, is the anchoring hardware — the roof-to-floor prop the feed braces
against. The manufacturers do not spell the arrangement out in words, so the
standard picture of a feed jacked between floor and back is a reconstruction from
those named parts: `NOT SOURCED` as a written statement.**

`[F]` And the platform: unlike a surface rig whose mast sits *"12 ft (3.66 m) off
the ground because the mast is way up on a truck carrier"*, underground crews
**build a work platform or deck** to work in confined space — with real holes of
**792–823 m at −40° to −12°** from such setups `[CORING-UG]`. Angle capability is
the whole point: **360° drilling capability including steep up-holes**
`[AUD]`, `[GEODRILL-UG]`.

**The photograph.** `[I]` (1) **A low, modular, boxy rig on a built deck in a
short alcove off a drive, feed frame angled steeply up or down, a column bracing
it against the back** — no mast, no sky. (2) **Stacked core trays in the drive
beside the rig**, with a water hose and a trailing power cable running back along
the wall past an air line and a ventilation duct. (3) **The back and walls carry
mesh and a grid of bolt plates, or grey shotcrete, and the only light is machine
lights and cap lamps** — the rock is a metre from the driller's shoulder.

---

## A.8 Greenfield exploration pad

**Ground and surroundings.** A cleared pad in **bush, boreal forest, mountainside
or tundra**, reached by a cut line, a bulldozed track, or not at all — in which
case the rig is **modular and flown in**. Around the pad: undisturbed vegetation
right up to its edge. The pad is temporary and will be rehabilitated.

**`[F]` The pad has a size, and regulators publish it.** A **ground-supported
drill pad is typically 20–40 m in diameter**; a **helicopter-supported pad is
40–50 m** `[ONTARIO-BMP]`. Another jurisdiction caps pads at **900 m² (0.09 ha)**
with a **minimum 100 m buffer to any water body** `[MB-BMP11]`. A real Australian
project ran pads of about **100 m²** — *"a level base for the drill rig and rod
spool"* plus *"a sump for water"* `[AUSEARTHED]`. And the contractor's own rule:
boreholes need **at least three metres (10 ft) of clearance around the drilling
equipment**, with undersized pads *raising* cost because they force manual rod
handling `[BLY-PAD]`. **This closes the `UNVERIFIED` that `research/02` §E6 flags
on drill-pad dimensions.**

**`[F]` The sump, which no other archetype has.** It must be right-sized for
project duration, sited **near the rig, borehole and mud tank**, **ramped and
guarded**, with clearance between the splitter and the sump for the return hose,
and reachable by a vac truck if it needs emptying mid-hole `[BLY-PAD]`. On one
real job a liquid-waste contractor pumped the sumps out for offsite treatment
`[AUSEARTHED]`. `research/02` §E6 already gives the size: **4 000 L, emptied
roughly every 150 m** `[CORING-MAG]`.

**`[F]` Water is the constraint.** Diamond drilling *"needs a steady supply of
water"* `[GSI-DRILL]`; sources are surface water, groundwater, or trucked —
*"expensive and not sustainable for long-term projects"* `[PDD-WATER]`.
Withdrawals under **25 000 L/day** typically need no licence, and intake hoses
need screens `[MB-BMP11]`. One campaign found a **gravity-flow water source** and
thereby eliminated pumps and coil heaters entirely `[CORING-HELI]`.
`NOT SOURCED`: litres per minute by core size.

**`[F]` Core sizes, boxes and the rules for stacking them.** Wireline standards:
**BQ 36.5 mm core / 60 mm hole · NQ 47.6 / 75.7 · HQ 63.5 / 96 · PQ 85 /
122.6 mm**, with NQ and HQ the workhorses `[WP-EDD]`. Trays are **about 1 m
long** `[GSI-DRILL]` and hold roughly **BQ 6–7 m, NQ 5–6 m, HQ 4–5 m, PQ 3–4 m**
of core each `[PCT-SIZE]`. Boxes must be labelled with **aluminium tape showing
hole number and depth interval**, stored **≥100 m from water**, cross-stacked with
the bottom layer **15–45 cm off the ground** on solid footings and **≥1 inch
between boxes for ventilation**, under a ventilated cover `[MB-BMP13]`. Half the
split core is assayed, half archived `[WP-EDD]`.

**`[F]` The core shed is a separate place from the pad**, designed around
**wet/dry zone separation, roller racking, a core saw with dedicated power and
drainage, spray stations and workbenches** `[DISC-CORE]`, with logging tables
**74–94 cm high** under an **LED canopy for core photography** and galvanised
roller tracks with decelerating bearings so boxes slide instead of being lifted
`[CORING-PALSA]`. Contractors rent **insulated mobile core shacks** alongside line
cutting and camp construction `[EXPLOLOGIK]`.

**`[F]` The camp has rules too**: wastewater above **10 000 L/day** triggers a
licence; **greywater pits 30 m from water bodies; outhouses 30 m from surface
water and 15 m from wells; holding tanks 8 m from wells**; solid waste in covered,
weatherproof, animal-proof containers; all attractants secured against wildlife
`[MB-BMP14]`.

**`[F]` Access — and the cut line is narrower than people draw it.** The
regulatory line is width: **line cutting of 1.5 m or less requires only an
exploration plan; wider than 1.5 m requires a permit** `[ONTARIO-BMP]`,
`[ON-PLAN]`, `[ON-PERMIT]`. **`[I]` So the visual is a narrow, hand-cut, straight
slot through standing bush — roughly a metre wide, not a road.** In steep bush
the pads are **built, not bulldozed**: contractors describe *"construction of
timber frame pads to allow for safe helicopter access, and drill pads that are
built to endure the weight and torque of drilling equipment"* `[PNR]`. **`[I]` A
timber-cribbed platform on a slope is a strong and completely under-modelled
visual.**

**`[F]` Heli-portable rigs break into helicopter loads**: one published unit
*"breaks down into six modules all under 1600 lbs"* with certified lifting points
`[MULTIPOWER]`; another *"can be broken up into seven parts"* `[OREZONE]`. A real
greenfield campaign: **1 509 m in 14 holes in three weeks**, 125 km from the
nearest town, **crew of five**, *"difficult and rocky terrain called for
heliportable drill rig moves"*, one month of mobilisation and demobilisation
`[CORING-HELI]`. And a real greenfield **gold** campaign: **nine diamond rigs, HQ
and NQ, 40 000 m planned**, with **core boxes flown by helicopter from the drill
sites to a staging area, then trucked to the core shack**, across 1.2 km of
vertical relief `[GOLIATH]`.

**`[F]` Cold-weather variant — the drill shelter.** The rig works inside a shack
with **a large hole in the roof where the mast pokes through**; the floor has a
rod-pass opening the crews call the **"pneumonia hole"**; radiator fans are
redirected to blow hot air into the shack; a **mobile steel shack on skids sits
at the water source** holding the pump, engine, battery and coil heater; hot
exhaust water lines are taped to the suction line and both insulated together
`[CORING-COLD]`.

**`[F]` Rehabilitation is a modelled end-state, not an afterthought.**
Decommissioning **within 30 days** of completion, with notice **10 days** before
operations end; *"pulling slash or woody debris created back over the drill or
helicopter pad"*; stumps cut to ground level; **exposed casing cut to 15 cm or
less above ground**; overburden contoured to angle of repose; topsoil stockpiled
separately; reseeding with **native and locally appropriate species only**
`[MB-BMP16]`, `[MB-BMP11]`. Elsewhere: topsoil stripped first, pads reshaped,
**deep ripping to 50 cm**, topsoil replaced, seeded, then **monitoring photos at
completion, 3, 6 and 12 months** `[AUSEARTHED]`, with rehab reporting requiring
hectares disturbed, holes approved *and* completed, shapefiles and before/after
photographs including a landmark `[WA-REHAB]`.

**`[I]` That is a whole contract type the game does not have: you are paid to put
the site back, and photographed doing it.**

**The two sub-types, and the test that separates them.** `[F]` `research/02` §E4:
*"the RC rig has a **cyclone and a bag rack hanging off it**, a **fat hose looping
from the head down to the cyclone**, and a **compressor the size of a shipping
container** parked alongside. The core rig has a **thin wireline running over a
sheave at the mast crown**, a **water tank and sump**, and **core trays stacked on
trestles**. The core rig site is wet; the RC site is dusty."*

**And the RC spread in detail, now sourced.** `[F]` The rig runs a **2 m mast
dump-feed** with a **200 m capacity automated rod handler** and hands-free
breakout `[RCD-SETUP]`. **Air** is the defining logistics problem: an onboard
compressor of roughly **1 000 cfm at 500 psi**, with deeper holes needing a
**booster — 1 350 cfm/500 psi for 300–400 m, up to 2 700 cfm/1 000 psi combined**
`[RCD-SETUP]`, `[DRILLWEST]`. There is a **support truck** — from a 3-tonne 4WD
with 1 000 L fuel and 750 L water up to a full 8×8 with **6 000 L fuel, 2 500 L
water and 300 m of spare rods** — and a **separate auxiliary vehicle carrying the
booster compressor** `[RCD-SETUP]`. At the collar: the **cyclone, hydraulically
raised and rotatable**, fed by a sample hose off a deflector box, dropping into a
**dump box or splitter** at splits of **6.25–12.5 %** `[RCD-SETUP]`,
`[DRILLWEST]`; a real cone-splitter system is **alumina-ceramic-lined**, with a
**double drop box of 25 L each** and **bolt-in 4 %, 6 %, 8 % and 10 % blade
sets**, rated to **3 000 CFM / 750 PSI** `[DST-SPLITTER]`. Sample mass is
**2–3 kg per metre** `[ALOM]` into **drawstring calico bags** in standard sizes
from 200 × 300 to 600 × 900 mm, pre-numbered or barcoded `[DISC-CALICO]`.

**`[F]` The numbers that should set the game's economy:**

| | Diamond core | RC | RAB / aircore |
|---|---|---|---|
| Depth range | 50 – 3 000+ m | 50 – 500 m | 10 – 80 m |
| Cost per metre (USD) | 80 – 250 | 40 – 120 | 15 – 40 |
| Advance per shift | 15 – 40 m | 60 – 150 m | 100 – 300 m |
| Water | high | none–low | none |

`[ALOM]`, cross-checked by `[RCD-COMPARE]`: RC is *"25–40 % cheaper than diamond
drilling"* and *"collects up to 99 % of the sample"*; **a 250–300 m hole in one
12-hour shift** is achievable in good ground, making RC *"three times as
productive as core drilling"* `[RCD-PROG]`.

**`[F]` And a correction to a common assumption: greenfield first-pass is
normally *aircore*, not RC.** Aircore is for *"regional-scale, first-pass
exploration — testing broad areas quickly and affordably"*, 100–150 m, with
*"targeted RC drilling once specific targets have been narrowed down"*
`[BOSTECH]`. RC is *"typically used for more advanced-stage exploration, where a
target has already been identified"* `[BOSTECH]`, and can serve as a **precollar
to 500 m** before switching to diamond `[RCD-COMPARE]`. **`[I]` The game has no
aircore method and should not invent one — but it should stop treating RC as the
first-pass tool.**

**The photograph — core.** `[I]` (1) **A cleared rectangle in unbroken bush with
a small mast and a rod rack — and a wet, ramped, guarded pit a few metres off the
collar with a return hose running into it.** No other drilling scene has an open
water pit beside the rig. (2) **A growing wall of ~1 m core trays**,
aluminium-taped, cross-stacked off the ground on timber under a tarp. (3) **The
access is a hand-cut line barely a metre wide, or nothing at all** — a helipad and
a rig in six sub-1600 lb pieces.

**The photograph — RC.** `[I]` (1) **The cyclone-and-splitter assembly
cantilevered off the rig deck with a fat corrugated sample hose looping into it**,
in a cloud of dust. (2) **Rows of small numbered cloth bags laid out on the dirt**,
one or two per metre drilled. (3) **A second and often third truck on the pad** —
the support truck with fuel and water tanks and a crane, and the booster
compressor truck with air hoses to the rig. **A diamond pad does not have a
compressor truck.**

---

## A.9 Tunnel portal

**Ground and surroundings.** A cut face where the tunnel enters the hillside, the
**portal collar**, and an **apron** in front of it. The apron is a working
platform *and* a haulage yard, and it is where every service the tunnel needs is
generated.

**`[F]` The portal structure itself.** Civil portals are **massive reinforced
concrete or reinforced shotcrete with wing walls and movement joints**; the
slopes above are stabilised by **anchors, rock bolts, soil nails and shotcrete
with rockfall protection**; drainage runs through **channels, swales, collector
pipes and inspection shafts**; and optional works include **portal roofs,
galleries, rockfall nets and snow sheds** `[DARDA-PORTAL]`. A **mine** portal is
different again — *"either developed within an existing open pit or in a specially
developed **box cut**"* `[ACG-DUNN]`, and a real one ran to a **box cut 34.5 m
deep** with the water table at 6 m, horizontal drains and multi-strand anchors
within a shotcreted face, leading to a **decline 2 220 m long, 6 m high ×
5.5 m wide** supported with spiling bars, lattice girders in fibrecrete, pattern
bolting and 6 m cable bolts at truck bays and refuge chambers `[DP-RANGER]`.

**`[F]` The plant on the apron.** A relocatable **batching plant with aggregate
bins, a mixing unit, a batch room with admixture storage, a fibre dosing unit,
cement silos and winter aggregate and water heating** `[TECWILL]` — larger
projects *"will need their own batching plants on or near the surface working
site"*, mixing on site so shotcrete is *"ready for immediate application"*
`[SIMEM]`, `[TT-MIX]`. **Ventilation fans and the duct** entering the portal
`[ROCKZONE]`, with the fan sitting about **10 m inside the entrance** `[PMC-DUCT]`.
**Muck handling** — conveyor or rail haulage out to a stockpile `[ROCKZONE]`,
`[NIAGARA]`. And a piece of plant almost nobody draws: **portal water treatment**,
a compact coagulation and **lamella settlement** package claimed at *"up to 20
times the efficiency of conventional settlement tanks… without the need for power
or moving parts"* `[SILTBUSTER]`, handling the high-pH, high-solids water a drive
produces.

**`[F]` The archetype's unique property, restated with better sources.** **This
is the only surface site where an underground machine legitimately stands in
daylight.** Pipe-umbrella pre-support is installed at portals by *"a conventional
drill jumbo"*, and the systems serve *"tunnel drives, portals and re-excavation of
collapsed sections"* `[SANDVIK-AT]`, `[DSI-AT]`; portal ground — weak, low-cover,
settlement-sensitive — is exactly the case they exist for `[SINOROCK]`.

**The photograph.** `[I]` (1) **A dark arch in a rock face**, with a shotcreted or
concrete collar and wing walls around it, and netted, bolted slopes above.
(2) **A ventilation duct and a conveyor coming out of the arch**, the fan just
inside. (3) **A batching plant, a spoil heap and a settlement tank on the apron**
— plant that exists to feed a hole in the ground, not to build anything on the
surface.

---

## A.10 Fixed offshore production platform deck

**`research/01` §C.1.5 already describes this correctly and the game does not use
it.** `[F]` Platforms are *"piled into the sea bed, gravity set on the bottom or
tension-legged"*, carry *"permanently installed drilling equipment"* in **box
frames**, and are characterised by *"low daily costs"* and *"reduced weather
downtime"* `[DM-OFFS]` via `research/01`. *"The derrick is **small, enclosed and
boxed in**, because deck space and deck load are both scarce. Around it: flare
boom, cranes, lifeboats, helideck, and **production plant that has nothing to do
with drilling**. This is the only rig type where the drilling package is a
tenant."*

**The structure decides the drilling geometry.** `[F]` A steel jacket is *"a
tubular steel framework that serves as a pile template and extends from the sea
bed to a few feet above the water level"*; its foundation piles *"penetrate the
soil up to 90 to 180 m (300 to 600 feet)"*; and wells are drilled through
**conductors** of *"typically between about 510 and 760 mm (20 and 30 inches)"*
held by **conductor guides "framed at various elevations within the jacket and
decks"** at roughly *"12 to 18 m (40 to 60 foot)"* intervals `[EP0147144]`.
**That guide framework is the offshore equivalent of a land rig's cellar**, and
it is why a platform well starts inside a pre-built pipe rather than in open
ground.

**The feature the game gets wrong — there is no moonpool.** `[F]` A platform
drills through **well slots / well bays** set out by a **drilling template**:
*"A drilling template designates the quantity, placement, and spacing of each
well on the platform. At the surface, each well in the template will contain a
well bay or slot… The number of wells on a production platform is limited to the
total slots available"* `[USPTO-5379844]`. `[F]` The **well bay** is *"an area of
an oil platform where the Christmas trees and wellheads are located"*, normally
two levels — a lower one for the wellheads and an upper one for the trees — and
**on platforms with drilling apparatus it sits directly beneath the drilling
package** `[WP-WELLBAY]`.

**And the rig skids — it does not cantilever.** `[F]` This is the distinction
that separates a platform photograph from a jack-up photograph. Multi-well
platforms carry *"10 to more than 40"* wells with surface spacing *"as close as
1.8 to 3.0 metres between well centres"*, and the drill floor is *"skidded from
well to well"* in **two perpendicular directions** over skid beams
`[OGP-OFFS]`, `[DM-PLATFORM]`. **Cantilevering is what a jack-up does.**

**Three real arrangements, all of which are "a platform rig".** `[F]`

| arrangement | what is on the platform | what is not |
|---|---|---|
| **Self-contained, permanently installed** | everything. A modern North Sea field centre may be *"four platforms connected by bridges"* — quarters, process, drilling, riser — with a drilling platform carrying **48 well slots** *"prepared for simultaneous drilling, well intervention and production"* `[NORSKPET]`. Another carries **50 active well slots** as a production-drilling-and-quarters unit on a steel jacket `[OT-MARINER]` | — |
| **Tender-assisted** | *"the rig derrick set, including brake cooling, BOP accumulator, and drilling fluid treatment skid"* | **power generation, mud pumps and mud pits, accommodation, cranes and helideck all stay on the tender**, which berths **120–200 people** and works from **20 to 2 000 m** water depth `[DM-TAD]`, `[WP-TENDER]` |
| **Modular, lifted on piecemeal** | a rig assembled from modules with the platform's own crane. A published example: drill floor + active mud system in **14 × 12 m** at **~890 t**, mast 28 m with 19 m clear working height, crew of 17 — and, decisively, a **maximum module weight of 12 t** *"so it is easy to lift the equipment onto a platform even in bad weather"*, assembled in about three weeks with a **30-tonne platform crane** `[OM-MODULAR]` | anything that cannot be broken into 12-tonne pieces |

**The weight and space constraint — the number that settles every "could you put
X on a deck?" argument.** `[F]` Platform cranes for smaller modular rigs *"do not
require more than the typical **15–40 ton cranes**"*; larger modular rigs
*"require **50–100 ton capacity cranes**"*; anything bigger needs **crane
barges** for *"100–1 000 ton lifts"*. And the multiplier that governs the whole
design: *"for every pound of rig weight saved, there is a decrease of three to
five pounds in platform weight"* `[OM-WEIGHT]`.

**The hazardous-area constraint.** `[F]` The drill floor is a **Zone 1** area —
*"an area in which an explosive gas atmosphere is likely to occur in normal
operation"* `[HSE-ZONE]` — and equipment there must be certified to the
corresponding category under DSEAR/ATEX, with *"Zone 1 and Zone 2 specifications
driv[ing] enclosure type, cable glanding, and motor rating for **every
component** within the hazardous envelope"* `[HSEBLOG]`. **`[I]` No general
construction or water-well plant is built to that standard, and this alone
disqualifies most of what the game currently offers here.**

**The one hammer that genuinely is on a platform.** `[F]` Conductors are *"driven
into the soil at the sea bed through guides connected to a jacket and deck
structure"* `[EP0147144]`, using a marine hydraulic impact hammer — published
cases use units in the **150 kJ** class and larger `[STRESS-COND]`,
`[OM-CONDUCTOR]`. `[I]` **If the game wants a percussion moment offshore, this is
it: a free-hanging hydraulic hammer driving a conductor down through the guide
framework. It is not a piling rig and it has no leader.**

**Access and room.** By **helicopter** and by boat with a crane transfer.
Everything is lifted. Every task is on a **permit to work** — the game's own
`north-sea` site line already says so and it is the best line in `SITE_LINES`.

**The photograph.** `[I]` (1) **Structure that continues down into the water and
stays there** — a lattice jacket or fat concrete columns, a boat landing, a
barnacle line, and **no air gap under the deck**. (2) **A derrick standing
inboard over an enclosed well bay**, one item among separators, compressors, a
quarters block, a helideck and a flare boom on a long outrigger — the derrick is
not the reason the structure exists. (3) **Christmas trees on a tight grid**
(well centres 1.8–3.0 m) with conductors marching down through guide frames into
the water. **No riser, no moonpool, no anchor lines.**

---

## A.11 Mobile offshore drilling unit — jackup, semi-submersible, drillship

**`research/01` §C.1.8's cheat sheet is the whole answer and should be used
verbatim:**

| if you see… | it is a… |
|---|---|
| a hull standing in the air on three lattice legs | **jackup** |
| fat columns on submerged pontoons, sea visible *through* the structure | **semi-submersible** |
| a ship's hull with a derrick amidships | **drillship** |
| a small boxed derrick among production plant, no gangway to shore | **platform rig** |
| **two** floating objects with lines between them | **tender-assisted** |
| a flat rectangle with the derrick hanging off one end | **barge rig** |

**The structural fact that organises the whole class.** `[F]` **The offshore
world splits by where the pressure barrier sits.** Platforms and jack-ups have
the BOP **on the deck** (a surface stack, *"mounted below the rig deck"*); semis
and drillships have it **on the seabed** under a marine riser — subsea BOPs
*"are connected to the offshore rig above by a drilling riser"* `[WP-BOP]`.
`[I]` The moonpool, the riser joints with buoyancy modules racked on deck, and
the size of the deck crane all follow from that one difference. **It is the
cleanest rule the game could adopt for deciding what to draw.**

**Water depths, sourced.** `research/01` §C.1.0 already gives the bands; the
newer fleet material agrees and sharpens them:

| unit | depth |
|---|---|
| Jackup | `research/01`: **3–125 m**, largest to 550 ft. Also: standard *"generally less than 120 metres (390 ft)"*, premium/ultra-premium *"150 to 190 meters (490 to 620 ft)"* `[WP-JACKUP]`; commercial fleet classes span **225 ft to 350 ft+** with deployable leg lengths **284–555 ft** `[VALARIS-JU]`; the largest harsh-environment classes reach **150–175 m** on legs over **200 m** `[NOV-CJ70]`, `[SEMCO]`, `[OM-JACKUP]` |
| Semi-submersible | `research/01`: **60–1 300 m**. Also: capability moved from *"about 600 ft (200 m)"* in the early 1960s to *"about 10000 ft (3000 m)"* by 2005–2010 `[WP-SEMI]`; moored units **60–600 m** on 8/10/12-point mooring `[DM-OFFSHORE]` |
| Drillship | **350 ft (1961) → 7 000 ft (1975) → 10 000 ft (1999) → 12 000 ft (2009)**, record **3 107 m** `[WP-DRILLSHIP]`; current fleets rated **10 000–12 000 ft** `[VALARIS-DS]` |
| Platform | **<3 m to >1 500 m** — *"platform" names the foundation type, not a depth class* `research/01` §C.1.0 |

**The jack-up's own machinery, which nothing else has.** `[F]` Legs number
*"three, four, six and even eight"*, lattice or tubular; jacking is *"a **rack
and pinion** gear arrangement where the pinion gears are driven by hydraulic or
electric motors and the rack is affixed to the legs"*; **preloading** uses *"the
weight of the barge and additional ballast water… to drive the legs securely
into the sea bottom"*; and **spudcans** exist *"to prevent them from digging into
the seabed too deep"* `[WP-JACKUP]` — real spudcans reach **20 m diameter**
`[OM-JACKUP]`. `[F]` Preloading *"simulates the loads on the soil that might be
experienced in a 100-year weather event"*, and the two named failure modes are
**punch-through** `[DC-NCS]` and **spudcan footprint interaction**, where a rig's
spudcans *"move towards seabed depressions or footprints that prior rigs had
created"*, risking *"structural damage to the rig, the platform, and the existing
site infrastructure"* `[OGJ-SPUDCAN]`. **`[I]` That is a ready-made hazard the
game does not have, and it exists on no other archetype.**

**The cantilever.** `[F]` The derrick sits on an arm that *"extends outwardly
from the deck so that the derrick is positioned over the open water… allowing
drilling to be performed through existing platforms, as well as without them"*
`[US6171027]`. Published reach envelopes run from **40 ft skid-out** on older
units to **70–76 ft**, and the largest classes quote X–Y envelopes of about
**100 × 65 ft** and **100 × 80 ft** with hookloads of 1–2.5 million lb
`[OM-JACKUP]`, `[VALARIS-JU]`.

**The photograph.** `[I]`
- **Jack-up** — (1) legs standing **high above the hull** with jacking houses at
  their bases, and the hull out of the water on a visible **air gap**, legs wet
  below it; (2) the derrick **hanging off one end on a cantilever**, over open
  water or over somebody else's small platform; (3) a **rectangular barge hull**,
  blunt-ended, helideck cantilevered off a corner.
- **Semi-submersible** — (1) **daylight and water under the main deck**, between
  fat columns; the pontoons are invisible; (2) one or two tall derricks centred
  on a broad rectangular deck box; (3) **anchor chains over corner fairleads**,
  or thruster wash and no chains at all. No bow, no stern, no sheer line.
- **Drillship** — (1) a **ship** — bow, stern, sheer, bulbous bow — with a
  derrick planted **amidships** over a moonpool you cannot see; (2) **helideck on
  the bow**, forward of a tall accommodation block; (3) **riser joints with white
  buoyancy modules racked horizontally on deck.**

**`[I]` The thing the game must never do** is draw one of these and call it a
platform, or vice versa. `data.js` `buildJobPosting()` already sets
jackup/semi/tender honestly by water depth — and then renders **one** deck for
all of them.

---

## A.12 Offshore geotechnical spread

**This archetype is now sourced, and it is a completely different picture from
A10 and A11.** It is what the game should draw when `north-sea` offers
site-investigation work, instead of a production deck.

**Four distinct classes.** `[F]`

**(a) Purpose-built geotechnical drillship.** An 80–100 m DP2 hull with a
**drill tower over a centrally located moonpool**. One published unit is
*"83 metres by 20 metres"* with a *"twin tower drilling derrick over a centrally
located moon pool"*, gear *"rated for 3 000 meters water depth"*, 60 berths, and
*"a large soil laboratory… centrally located next to the drill floor"*, doing
*"seabed in situ testing, large diameter piston cores, drilled borings and
downhole in situ tests"* `[MTN-VOYAGER]`. Comparable units publish moonpools of
**4.0 × 4.2 m to 7.2 × 7.2 m**, **heave compensation of 4 m or 6 m**, combined
water-plus-borehole reach of **350 m, 600 m or 2 500 m**, a **5½" API drill
string**, an *"iron roughneck"* with mechanical pipe handling, and a seabed CPT
unit carried alongside `[GQM-POLARIS]`, `[GQM-SAENTIS]`, `[GQM-SEEHORN]`,
`[GQM-FLEET]`; the class claims *"proven performance from nearshore environments
to combined water and borehole depths of up to 3 500 metres"* `[GQM-SI]`.
**Conversion is common**: an 88 × 20 m platform supply vessel was converted by
*"installation of a moonpool"* plus a **40 m drilling rig** on a mezzanine deck
*"at a sufficient height above the moonpool to permit the lowering and
manoeuvring of pipes"*, with a laboratory, a geological sample store and a
refrigerated container `[BM-ZEPHYR]`.

**(b) DP survey vessel — over the side or through a small moonpool, no derrick.**
An 80 m DP2 hull with a *"Moonpool with deployable 100kN CPT system"* and *"Side
A-Frames for environmental sampling"*, running seismic, shallow geotechnical and
environmental work at once `[GARD-OR]`. Also a real sub-class: a **mobilisable,
heave-compensated drill rig** put onto *"vessels of opportunity"*, using
*"standard API steel drill pipe or Geobor"* with capability *"to drill to 500m"*
`[GARD-DRILL]`.

**(c) Jack-up or liftboat for shallow water.** The rationale is stated plainly:
*"JUBs are suited to coastal environments as the legs are fixed to seabed and
don't move with the waves"* `[FUGRO-AYM]`. Real campaign shapes: **53 boreholes
in 130 days** in water to **37 m**, with a *"bespoke 20″ conductor hostile
environment riser casing"* that *"allows the drill string to remain in place
through inclement weather events"*, plus wireline logging, wireline CPT and a
high-pressure dilatometer `[FUGRO-AYM]`; and **15 boreholes plus 15 seismic
CPTs** using a *"sliding drill deck"* so the rig reaches each location without
moving the barge, *"saving up to 12 hours of marine operations at each
location"* `[FUGRO-CODLING]`.

**(d) Seabed-deployed remote units.** `[F]` A **seabed CPT frame** is a steel
frame lowered on an umbilical whose **own submerged weight is the reaction**:
one published unit is **4 500 kg in air, 3 700 kg in seawater**, *"providing
ballast through its substantial submerged weight"*, A-frame deployed, footprint
**2.2 × 2.2 m**, penetration *"2cm/sec ±10%"* `[CMS-CPT]`, `[HELMS-NEP]`, with
**35 kN push**, *"Up to 20m Penetration from Coiled Rod"* and *"water depths of
up to 3000 meters"* `[DATEM]`. The heavy end runs **20-tonne frames at 200 kN**
`[FUGRO-REV]`, `[GQM-POLARIS]`, and the class spans *"lightweight 10-15kN units
for soft soils through to heavy duty 100-200kN units"* `[GARD-VC]`. `[I]` **The
20 t ↔ 200 kN pairing is not a coincidence — 20 t submerged is about 196 kN.
You cannot push harder than the frame weighs.** No source states this; it is the
design rule behind the whole class. `[F]` **Seabed drills** go further: *"a
self-contained seabed drilling system… deployed directly to the seafloor,
eliminating the need for a drillship"*, rated to **4 000 m** with *"penetration
up to 150 m below seabed"*, and *"powered and controlled by an umbilical cable
from a support vessel, so it is decoupled from metocean conditions"*
`[ACTEON-PROD]`, `[OE-SEABED]`.

**Why heave compensation is on every spec sheet.** `[F]` Published strokes are
**4 m** and **6 m** `[GQM-SAENTIS]`, `[GQM-SEEHORN]`, `[GQM-POLARIS]`,
`[GQM-FLEET]`. `[I]` The reason: the bit is rigidly coupled to a deck moving
several metres vertically, and uncompensated, every swell cycle drives the bit
into and out of the hole bottom and destroys exactly the undisturbed fabric the
campaign exists to measure. **`[I]` That is the best hazard mechanic available
for this archetype and it belongs to no other.**

**The depth targets, which set the whole job.** `[F]` *"Fixed offshore wind farms
require geotechnical data to depths of 50 to 70 m"*, while *"Cable routes are
typically investigated using vibro-cores and CPTs to a depth of 5 m"*
`[FLOATGUIDE]`; vibrocores give *"continuous cores up to 6m below the seabed"* in
water to **250 m** `[GARD-VC]`; and building a ground model *"requires up to 200
CPT's"* `[FUGRO-WIND]`.

**Who does this work.** Named as contractors, not as capability claims: **Fugro**
`[FUGRO-AYM]`, `[FUGRO-CODLING]`, `[FUGRO-REV]`; **Geoquip Marine**
`[GQM-FLEET]`, `[OWB-HORNSEA4]`; **Gardline** `[GARD-DRILL]`; **Acteon/Benthic**
for seabed drills `[ACTEON-PROD]`. **A correction worth carrying: Cathie is a
consultancy, not a vessel operator** — its work is *"geological, geospatial,
geophysical and geotechnical engineering solutions"* and campaign specification
`[CATHIE]`. **Do not put a consultancy's name on a drill vessel.** Boskalis,
Van Oord and Seaway7 as operators of geotechnical SI spreads: `NOT SOURCED`.

**The photograph.** `[I]` (1) **A modest 30–40 m drill tower amidships over a
moonpool** on an 80–100 m hull — half the height of an oilfield derrick,
sometimes twin. (2) **White ISO laboratory containers plumbed in immediately
beside the drill floor**, plus a reefer for samples — a chemistry lab on a
working deck. (3) **A big stern A-frame and a fat armoured umbilical on a
traction winch**, with an open steel frame the size of a van in a deck cradle.
**No riser, no BOP, no flare.** And for the seabed unit itself: an unmanned open
frame with **no controls on it**, **one fat umbilical entering the top at a bend
restrictor**, and **wide flat feet** — because its own weight is all the
reaction it has.

---

## A.12b Offshore foundation installation — and why it is NOT a piling rig

The game has a `driven-pile` method and an offshore region. Somebody will
eventually connect them, so this must be on the record.

`[F]` **Offshore piles are driven by a hydraulic hammer hung on a crane wire,
positioned by a gripper — there is no leader and no mast.** *"An onboard monopile
crane is used to lower the foundations into the sea, where they're driven into
the seabed using a hydraulic hammer"* `[ORSTED-INST]`; *"The monopile is driven
with the hydraulic hammer operated from the crane vessel"* `[SD-MONOPILE]`.
Verticality comes from the **gripper**, not a leader: *"sensors measure the
pile's inclination and hydraulic cylinders actively compensate the disturbing
vessel motions in heave, surge and sway"* `[WTI-GRIPPER]`, with gripper frames
reaching **20 × 10.5 × 21 m and 450 tonnes** — larger than a complete land piling
rig `[OE-GRIPPER]`. And the hammers routinely work **fully submerged**, to
**2 000 m** and beyond `[IQIP-HH]`, `[ACTEON-HAMMER]`, which a leader-guided
hammer physically cannot do.

`[F]` **Scale.** Monopiles run to **8.8 m diameter, 92 m long, 1 530 tonnes**
`[ML-SOFIA]`. Hammer energies run from a few hundred kJ up past **7 500 kJ**
`[IQIP-IQ]`, `[ACTEON-HAMMER]`. `[I]` **For comparison, CFA tops out at about
1 200 mm diameter and 50 m depth `[BAUER-METHODS]`.** A CFA rig is not
one-seventh of the machine needed; it makes an entirely different product — a
cast-in-place concrete pile, not a prefabricated steel tube that must serve as
the turbine's structural stub.

`[F]` **Noise mitigation is a legal design driver, not decoration.** German
regulation enforces, at **750 m from the pile**, an unweighted broadband
**SEL05 of 160 dB re 1 µPa²s** and a **peak of 190 dB re 1 µPa**, naming bubble
curtains, hydro-sound dampers and noise-mitigation screens as the qualifying
systems `[BSH-NOISE]`. The largest screens are **50 m high on a 45 m template
base and weigh about 2 500 tonnes** `[IQIP-NMS]`.

`[F]` **When driving refuses, you drill.** A published sequence is *"initial pile
driving, relief drilling, and final pile re-driving"* to *"reduce the risk of
refusal"*, avoiding *"the need for casings, grout or large hammers"*
`[ACTEON-3D]`, executed with a **pile-top reverse-circulation drill** — and note
that `research/05` §A13 already covers pile-top RCD as a bonus machine. Where
rock is too strong to drive at all, **drilled and grouted pin piles** are used:
one jacket campaign installed **190 pin piles** in rock over **180 MPa** in water
over **38 m** deep `[BAUER-STB]`. And a whole monopile can be drilled: published
offshore foundation drilling covers **3–12 m** diameter, *"operated from floating
or jack-up vessels"*, with cuttings removed by a seawater slurry circuit
`[HK-OFD]`, used in rock of **25–120 MPa** at drilling diameters of **7 700 mm**
to depths of **15–27 m** `[WTI-NOIRMOUTIER]`.

`[I]` **The game's lesson from all of this:** offshore foundation work is a
**vessel** archetype, not a piling-plot archetype, and its machine is a crane,
a hammer and a gripper. If it is ever added, it must not reuse the
`piling-leader` rig.

---

## A.13 Onshore well pad — the desert case

**Already sourced in the pack, and it is one of the best entries in it.** `[F]`
`research/01` §C.1.1, from `[WITTIG]` p.19: a real regulated site requirement of
**minimum ~3 000 m², up to 10 000 m² (1 ha)**, plus low-loader access, **sealed
surfaces for hazardous substances**, a **drill cellar** with rig foundations,
sewer connection or sewage pit, water supply, an **oil separator**, **fixed
fencing**, power, and provision for a **gas flare**.

`[F]` The arrangement, from `[WITTIG]` p.26 via `research/01`: mast over a
**substructure raised high enough to fit the BOP stack underneath**; **mud tanks
and pits** on one side; **shakers** on the mud-return side; **mud pumps** and
the **power plant** behind; the **standpipe** climbing a mast leg; **pipe racks**
on the ground. And the modelling instruction that follows: *"The rig is small;
the site is large. **Draw the site.**"*

**How the pad is actually made.** `[F]` Site preparation needs *"a nearly level
area of sufficient size on which to erect the drilling rig, excavate reserve
pits, and provide storage"*; the contractor clears and levels, constructs **a
large pit to contain water for drilling and to dispose of cuttings and waste**,
drills and cases a large-diameter **conductor hole**, and drills a **rat hole**
near the main bore for the kelly. Rig-up is: **substructure positioned and
levelled over the borehole, mast raised over the substructure**, engines, pumps,
rotating and hoisting gear connected, **drill pipe and collars laid on racks
convenient to the rig floor**, water and fuel tanks filled, mud additives stored
on location `[KGS-PRIMER]`.

**The desert-specific part — and it is the site's most distinctive object.**
`[F]` Desert operations centre on **lined evaporation pits**, exploiting the
climate to remove water; liner integrity, containment monitoring and a defined
closure plan are the regulatory crux, and unlined or poorly built pits are the
main risk. Water-based mud solids go to **landfarming / bioremediation**;
oil-based mud cuttings require **thermal desorption**; **cuttings re-injection**
is the cleanest onshore answer where geology allows; and **produced water is
usually the dominant waste stream by volume** — all framed explicitly for GCC
and MENA operations `[SCDT-DESERT]`. The **closed-loop / zero-discharge**
alternative replaces the earthen pit with a steel-tank spread: fine screens and
centrifuges, a **dewatering unit**, **augers moving cuttings from the shakers to
containment**, **steel tanks**, and **cuttings boxes for haul-off** — more
surface iron and labour, smaller location footprint `[SCDT-CLOSED]`.

**`[I]` That is a genuine, sourced binary the game could show: an earthen pit
site and a closed-loop site look different and tell you the regulatory regime at
a glance.**

**The camp is on the pad.** `[F]` Real desert rig inventories list accommodation
camps of **35 to 90 persons** on the same location, alongside rigs of
**1 200–2 000 HP** rated to **12 000–23 000 ft**, hook loads **440 000–1 600 000
lb** and BOPs **5 000–10 000 psi** `[FOX-DESERT]`.

**Access and room.** A single graded track, and everything trucked in. The
game's own `sahara` line — *"a wellsite trucked in complete, water included"* —
is exactly right.

**What visually distinguishes it from a North Sea platform.** `[I]` The desert
rig is a **spread laid out flat**: rig, mud tanks, shakers, pumps, pipe on the
ground, generators and camp all at ground level and all separable, on graded
sand with an access track running to the horizon. A platform is **vertically
stacked**, the same functions compressed into decks, with a helideck, cranes,
lifeboats and a flare boom cantilevered over water — no yard, no pipe on the
ground, no track. And the desert rig is **self-contained for people**; a
platform's accommodation is part of the structure.

**The photograph.** `[I]` (1) **A single graded track running dead straight to
the pad** across a featureless plain, with a **lined pit as a geometric bright
rectangle** beside it. (2) **The whole spread laid out horizontally** — mast over
substructure, shaker house and mud tanks in a row, pumps, pipe racked by the
V-door, and **a row of white accommodation cabins at the far end of the same
pad**. (3) **Cuttings skips and an auger from the shaker house** (closed loop)
*or* an earthen pit with a flare pit outboard of the mud tanks — **one or the
other, never both.**

---

## A.14 Water-well plot — village borehole and rural smallholding

**This archetype is now sourced in detail, and it is the least like any other
site in the game.** The professional framework is the Rural Water Supply
Network's *Code of Practice for Cost Effective Boreholes* and the associated UN
guidance `[RWSN-COP]`, `[E4C-UNICEF]`, whose recurring finding is that badly
sited, designed or constructed boreholes cannot be maintained and the investment
is wasted `[RWSN-BLOG]`.

**Before the rig arrives, there is a survey crew.** `[F]` In African
crystalline-basement terrain — most of the Sahel — siting is done by **electrical
resistivity (vertical electrical sounding plus horizontal profiling), followed by
electromagnetic traversing**, usually in combination `[CARRUTHERS]`, `[GSL-SP225]`.
It matters: **~40 % of boreholes sited by 1D methods in hard-rock aquifers in
Benin were unsuccessful**, and the paper argues for 2D resistivity tomography
`[ALLE]`. `[I]` **Visually: a day or two before drilling, electrodes on cable
reels stretched in a line across the bush, a metering box, and a stake driven at
the chosen point. That stake is the drill point** — and it is a lovely,
completely real thing for a game to show.

**The rig and the kit, from a real completion report.** `[F]` `[TGS-REPORT]`
gives the actual list for a village borehole: **air rotary, drag bits through the
overburden and transition zone, then a DTH hammer through hard rock**; a small
trailer/truck-portable unit with a **3 m mast**; a separate **compressor at
14 bar, as big as the rig itself**; 10″, 8″ and 6.5″ drag bits; 6⅞″, 5″ and 4″
DTH hammers; a 6″ button-bit reamer; **drill rods 2.5″ OD in 2 m lengths**.
Depth **58.85 m**, water strikes at **36 m and 42 m**, driller's yield
**1.5 m³/h**. Crew of four drillers plus support. **Mobilising 2 days, drilling
plus well design plus installation plus development 4 days, test pumping 1 day.**
Test pumping was a **3-hour constant-rate test at 0.90 m³/h**, static water level
4.75 m, drawdown 15.93 m, **90 % recovery in 40 minutes**. The acceptance
criterion for a handpump borehole is **sustainable yield ≥ 0.5 m³/h**. And then,
in the report's own words: *"the site was cleared."*

**The bill of quantities — the single best "what is on site" document found.**
`[F]` An NGO tender for three boreholes `[HELP-BOQ]` specifies:
mobilisation/demobilisation; **geophysics investigation**; a borehole completion
report; *"drilling by rotary (mud drilling) or DTH methods as instructed by the
supervisor"* — **the method is chosen on the day by the supervising
hydrogeologist**; a **12″ bit from 0–6 m through the overburden with temporary
casing later removed, then a minimum 8″ bit to 100 m**; **soil sampling and
storage of drill cuttings at 2 m intervals**; **uPVC 5″ screens in 3 m lengths,
18 m of screen and 62 m of plain casing**; **gravel pack of 35 × 50 kg bags of
2–6 mm gravel**; inert backfill, **1 m of cement grout** and a cast **sanitary
seal**; **development until the water clears — 3 hours**; test pumping **4 hours**
plus **2 hours of recovery monitoring**; a handpump with **20 × 3 m stainless
riser pipes and 20 connecting rods**; and headworks of **100 mm reinforced
concrete apron, minimum 1.85 m diameter, a 6 m drainage channel, a soakpit
1.5 m × 1.5 m filled with laterite stone and covered with polythene, and an
animal watering trough**.

**The mud pit.** `[F]` For mud rotary the operator either **digs the pit in the
ground or uses portable tanks**, and reaming *"creates a lot more cuttings than
the pilot hole and will require frequent clearing of mud pits"* `[LONESTAR]`.
Gravel pack should be **clean rounded gravel ~3–6 mm, placed to about 1 m above
the screen** (same source), which matches the tender's 2–6 mm spec.

**Manual versus mechanised, and cost — the axis a game can play with.** `[F]`
Manual drilling (hand auger, percussion, sludging, jetting) is feasible only in
shallow soft permeable ground, no deeper than about **25 m** `[BGS-MANUAL]`,
`[FUSSI]`. Practical limits: augering **15–25 m** above the water table;
percussion **~25 m**; sludging and jetting **~35 m**; mechanical rigs **exceed
200 m**. **Rural well diameters are typically ~50 mm; urban supplies up to
300 mm.** And the money: **hand-drilled wells US$20–3 000; conventional
machine-drilled wells in sub-Saharan Africa US$2 000–20 000** `[SSWM-WELLS]`.

**The handover, which is what the job is actually for.** `[F]` The **Afridev** is
a true village-level-operation-and-maintenance pump — one tool, locally
manufacturable parts, designed for communities of **up to 300 people**
`[RWSN-AFRIDEV]`, `[AFRIDEV-SPEC]`. The **India Mark II** lifts from **50–80 m**
and is the world's most widely used handpump, but is *not* VLOM — cylinder
repairs need special tools and strength `[WP-IMII]`. A **hardcore layer around
the concrete platform** stops spilled water making a swamp `[AFRIDEV-SPEC]`.
The modern Sahel alternative is **borehole + storage tank + solar panels +
distribution taps**, with taps at **health centres, schools, mosques and
designated animal-watering points** plus **designated laundry areas**, and a
**water management committee** formed and trained at each point `[IR-SAHEL]`,
`[WWA-SOLAR]`.

**Village borehole versus municipal or agricultural well field.** `[F]` Rural
wells ~50 mm against urban up to 300 mm; manual and small mechanised to ~100 m
against mechanised >200 m `[SSWM-WELLS]`; and the test regime differs — a village
borehole gets a **3–4 hour** test `[TGS-REPORT]`, `[HELP-BOQ]`, where commercial
production practice uses a **24-hour** test to set sustainable yield and pump
depth `[ROYALTECHNO]` *(contractor page, weak source)*. `[I]` A well field
therefore looks materially different: a proper truck-mounted rotary with a full
mast rather than a 3 m one, steel or large-diameter uPVC casing, a lined mud
system rather than a scraped pit, a submersible pump and genset rather than a
handpump, a headworks slab with a delivery main rather than a pedestal, and
multiple wells across a field with a collector pipeline. **Well spacing rules:
`NOT SOURCED`.**

**Access and room.** Unbounded. No hoarding, no cabins, often no fence.

**The photograph.** `[I]` (1) **Cuttings sample piles or bags laid out in a
numbered row on the ground beside the hole** — the 2 m-interval sampling
requirement made visible — next to a **mud pit scraped straight into the dirt**
with a spoil ridge. (2) **Casing and screen in 3 m sticks stacked flat on the
sand**, threaded, blue-white uPVC, with **50 kg gravel bags** beside them — a
bright man-made colour block on an otherwise dun site. (3) **A crowd.** The
borehole is a social object; children and women stand at the edge of the working
area, and the finished thing is a **round concrete apron with a drainage channel
running to a stone-filled soakpit and an animal trough**, with a handpump head
bolted to a pedestal in the middle. **`[I]` No other archetype in this file has
members of the public standing inside the frame, and that alone identifies it.**

---

## A.15 Permafrost / winter pad

**Now sourced, and the numbers are unusually good.**

**The problem in one line.** `[F]` The North Slope of Alaska is underlain by
permafrost extending from just below the surface to **as much as 2 000 feet**
deep. Because thawed permafrost has **no load-bearing capacity**, *"common North
Slope practice is to build up a thick gravel pad to insulate the permafrost"* —
**all roads and gravel pads are built about five feet thick**, roads and
airfields using **~5 ft of gravel plus insulation and geotextile fabric**. The
typical 5-ft pad *"is reasonably standard and is not likely to be much reduced"*
`[OTA-NORTHSLOPE]`.

**Three kinds of pad, and the choice is a real decision.** `[F]`
`[OTA-NORTHSLOPE]` lists them explicitly:

| pad | when |
|---|---|
| **Gravel, 5-ft lift, for thermal protection** | year-round work |
| **Ice pad** | single-season exploratory wells |
| **Foam and timber mats** | multi-season exploratory wells |
| **"Thin" pads**, other insulating materials, less gravel | where insulation substitutes for gravel |

and — a detail no other archetype has — **exploration and development reserve
pits are built below grade, using the permafrost itself for containment**.

**The season is a legal object, not a mood.** `[F]` Alaska DNR regulates all
off-road travel on state land on the North Slope; a land-use permit is required,
permits run a **maximum term of five years**, and there is **no off-road travel
at all from break-up until 15 July** because of super-saturated soils and
migratory bird nesting. Opening criteria `[AK-DNR-TUNDRA]`:

- **Coastal: soil temperature at 12 inches depth reaches 23 °F AND an average of
  6 inches of snow on the ground.**
- **Foothills: 23 °F at 12 inches AND an average of 9 inches of snow.**
- **Opening dates have ranged from as early as 2 November to as late as
  27 January**; in recent years the foothills have not consistently opened at all.
- Closure is by assessment of thawing and soft snow, and operators get
  **72 hours to move vehicles and equipment off the tundra**. Tundra damage must
  be reported within 72 hours.
- Summer travel is restricted to a **tested and approved vehicle list**, with
  payload limits from the certification test, and for direct-drive wheeled
  vehicles over 3 000 lb a **tyre pressure not exceeding 1.5 psi** (usually near
  1 psi) with tread no more than 1.5 inches high and rounded.

**`[I]` That is the single best contract-constraint mechanic in this entire
file.** An Arctic contract whose window may open on 2 November or on 27 January
or not at all, and which ends with 72 hours to get everything off the tundra, is
a game mechanic that is simply true.

**Ice roads.** `[F]` Each mile takes **approximately one million gallons of ice
and water**; ice is chipped from shallow lakes frozen to the bottom and water
drawn through holes drilled in thick-capped lakes; **water and ice chips are
spread in layers until the road is a minimum of six inches thick**, then a
**motor grader** flattens and textures it. Construction needs roughly **23 °F in
the top 12 inches of tundra**, with optimal ambient around **−20 °F**; roads open
from **late January through mid-February and melt by late April or early May — a
four-month window**. One operator built **161 acres of ice pads alongside 140
miles of ice roads** in a single season `[CP-ICEROADS]`.

**Winterised plant — what "the rig is a box" actually means.** `[F]` *"All
drilling rigs and production facilities where people work must be enclosed,
insulated, and heated. Exterior steel structures need to be built from a special
arctic-grade steel to prevent brittleness at very low temperatures."* The same
state-of-the-art list includes **arctic cement that sets before freezing and
insulates**, **thaw-bulb modelling and monitoring**, **refrigerated conductor
pipe systems**, **shock protection for casing**, **highly modularised land rigs
for fast moves**, **self-contained rig camps of up to 100+ people**,
**air-transportable rigs**, **low-ground-pressure roller vehicles**,
**hoverbarges**, and **ice airstrips for exploration**. Facilities are
prefabricated off-site in modules **from 500 to 5 000 tonnes** `[OTA-NORTHSLOPE]`.

**Thermosyphons.** `[F]` Passive two-phase heat pipes installed in the **vertical
support members** of the Trans-Alaska Pipeline where it is elevated in warm,
non-thaw-stable permafrost, with 40+ years of operating experience
`[ASCE-HEATPIPE]`. They need no power and maintain a frozen bulb around the pile.

**What actually gets drilled on permafrost — four distinct activities.**
1. **Oil and gas.** `[F]` North Slope fields `[OTA-NORTHSLOPE]`; and on the Yamal
   Peninsula **more than 4 000 boreholes** of geological and geocryological data
   were obtained 1977–1990 at two gas fields and along the pipelines
   `[NSIDC-GGD402]`.
2. **The permafrost drilling problem itself.** `[F]` Warm drilling mud in the
   wellbore thaws permafrost and causes **severe wellhead settling**, and gas
   inflows can come from **gas-hydrate dissociation** `[ATE-PERMAFROST]`,
   `[GEOEXPRO-YAMAL]`. **`[I]` That is a hazard the game does not have and
   should: your own circulating mud destroying the ground your rig stands on.**
3. **Geotechnical and permafrost-science boreholes.** `[F]` A survey drilled
   **38 boreholes across a range of terrain units on the Arctic Coastal Plain**
   using a **gas-powered hand auger**, recovering **51 mm and 76 mm cores**
   between October 2023 and September 2024; cores were described and photographed
   and then thawed to measure excess ice content `[USGS-PERMACORE]`. Commercial
   permafrost coring uses **rotary and custom rigs designed for cold, remote
   locations**, deployed with minimal footprint for sensor installation and
   long-term monitoring `[KOLIBRI]`, `[SONICEDGE]`.
4. **Ice coring** — a separate discipline on the ice sheets rather than on
   permafrost `[WP-NGRIP]`, `[WP-EGRIP]`. **Depths, drill types and camp detail:
   `NOT SOURCED`.**

**`NOT SOURCED`: mineral exploration drilling on permafrost specifically.** The
game's `arctic` region offers `core` and `rc` under `mineral-exploration`, and
that is plausible, but this pass did not find a primary description of it.

**The photograph.** `[I]` (1) **A raised gravel island with visibly battered side
slopes standing about 1.5 m proud of flat tundra**, roads and pad the same
height, everything sharply rectangular against organic tundra polygons — or, in
winter exploration, **a white ice pad with no edge at all except a change in
surface texture**. (2) **The rig is a box** — cladding wraps the mast and
substructure, you see almost no open steelwork, heated shacks and lagged pipe
runs dominate, and **exhaust plumes stand vertically in still, very cold air**.
(3) **Thermosyphon heads on vertical support members** — rows of pipes with
finned radiators on top — and **modular buildings on pilings with an air gap
under the floor.**

---

## A.16 Brownfield / environmental plot

**Why it must exist.** Seven of the twenty-one methods carry the `environmental`
application and there is no setting for it, which is precisely why
`environmental` became the channel that put cased CFA piling in the Sahara.

**Ground and surroundings.** `[I]` A former industrial plot: hardstanding,
foundations of demolished buildings, made ground, sometimes a live operating
facility around the work. **Contamination is the reason the job exists**, and it
governs everything else on site.

**The governing standard, and what it says the method is for.** `[F]` **ASTM
D6914/D6914M**, *Standard Practice for Sonic Drilling for Site Characterization
and the Installation of Subsurface Monitoring Devices* `[ASTM-D6914]`: sonic is
used in geotechnical work partly **to avoid hydraulic fracturing**; it uses
**resonant-frequency vibration of the casing string**, with amplitude sized to
overcome formation elasticity; it recovers a **continuous core giving a
representative lithological column**; it gives **significantly reduced drill
cuttings** and **reduced drilling-fluid use**; and it produces **a clean cased
hole without drilling fluids**, which makes instrument installation and in-situ
testing more efficient. Method selection across the family is
**ASTM D6286/D6286M** `[ASTM-D6286]`.

`[F]` Machine detail: a sonic oscillator produces **vertical oscillations up to
150 Hz** and **oscillatory forces up to 50 000 lb**, with the resonant wave
travelling down the drill steel so the bit **displaces rather than pulverises**
material; claimed **core recovery 90–100 %** and **borehole deviation under 1°
from vertical**; it excels in *"soft, saturated, or mixed formations"*
`[TSI-SONIC]`. Compare `research/02` §E5, which already describes the head as a
*"large, heavy, drum-shaped oscillator"* with an air damper, and notes that a
sonic rig **always has two sizes of tube on the rack**.

**What is actually on the ground — the part that makes this archetype look like
nothing else.** `[F]` `[HARGTECH]`: recovered core goes *"in appropriate liners,
trays, bags, jars, or other containers specified by the sampling plan"*, with
**depth labelling, orientation, photo documentation, field descriptions,
headspace screening and chain-of-custody records** completed before samples leave
site. **Investigation-derived waste (IDW)** requires the plan to identify
**containment methods, staging areas, labelling practices, and who transports and
disposes** of contaminated soil, liners, decontamination water and PPE.
**Decontamination is matched to the analytes** — VOCs, metals, **PFAS**,
hydrocarbons or microbes each drive different procedures. **Cross-contamination
control** works by advancing casing to isolate upper zones as the hole deepens.
Monitoring wells installed through the casing require correct **screen placement,
filter pack, bentonite seal, protective casing and development**. And safety
means **defined exclusion zones around rotating tools** and inspected lifting
gear. Monitoring-well construction in the US is governed by the environmental
regulator's own design and installation guidance `[EPA-SESD]` — **numeric
construction details `NOT SOURCED`, the document was not readable in this pass.**

`research/06` §B is the source for the *work* — monitoring-well construction and
decommissioning, low-flow sampling, **PFAS-era protocols**, and
**cross-contamination control, the sequence** (§B.7) — and §B.8 already explains
why sonic dominates here.

**The photograph.** `[I]` (1) **A row of transparent core sleeves or lay-flat
bags lying on the ground in depth order**, sausage-like, each labelled —
**continuous core, not a spoil heap.** (2) **Drums and a decontamination
station** — labelled IDW drums in a line, a pressure washer, a bunded decon pad,
a taped exclusion zone. (3) **A compact tracked rig with a short heavy head
vibrating on the string**, and beside it a part-built monitoring well: screen,
bagged filter sand, bentonite pellets, and a **flush-mounted road box** or a
**stickup casing with yellow bollards** as the only thing left behind.

**The ground-investigation variant of the same plot.** `[F]` UK practice is still
dominated by **cable percussion**: *"a mobile tripod rig towed by a 4×4"* with a
**two-tonne winch driven by a diesel engine and a tripod derrick approximately
7 m in height**, folding for transport, needing **~6.7 m of working headroom**
`[GEOINV-CP]`, `[GW-CP]`, `[SUBSURF-CP]`. Tools are a **clay cutter in cohesive
soils, a shell or bailer in granular soils, and a chisel to fracture rock and
obstructions**, with steel casing driven down progressively; **casing is 150 mm
or 200 mm standard**; depth is **up to 50 m routinely** and 60 m or more in good
conditions; and the hole carries **SPT, U100 undisturbed samples, disturbed bulk
and jar samples**, water sampling at depth with the casing seal limiting
cross-contamination, and **gas wells and instruments**. It *"remains the most
widely used method of ground investigation in the UK"*, governed by **BS 5930**
and Eurocode 7 `[SUBSURF-CP]`, `[GEOINV-CP]`, `[JW-CP]`.

`[F]` The lighter end: a **tracked window sampler** with **10 m capability**,
**86–116 mm windowless barrels with plastic liners**, temporary casing, and
support for **50/63 mm monitoring wells or 19/25 mm piezometers**; an **ATV
variant at 170 g/cm² ground pressure**; and **handheld window sampling** to
**5–8 m** with a hydraulic breaker `[ADP-WINDOW]`. A window sampler *"can be
transported in a van operated by 1 person"* `[GEOINV-CP]`.

`[F]` **CPT** is governed by **BS EN ISO 22476-1**: a cone pushed on rods at a
constant rate, measuring **cone resistance and sleeve friction**, plus **pore
pressure** for CPTU; onshore and nearshore; used to evaluate stratification, soil
type, density, shear strength and deformation characteristics; the 2022 edition
adds **temperature-correction methods** `[ISO22476-1]`, `[ISO22476-1-2022]`,
`[CONETEC]`. A real UK fleet spans **track-trucks** (road-legal, tracks deployed
on site), **tracked crawlers** for soft ground, **mini crawlers at ~1.0–1.1 t
using ground anchors or kentledge for reaction**, **hand-portable basement rams
at 0.07–0.15 t with 10- or 18-tonne ram sets**, and **rail units** doing multiple
tests in a single possession `[LANKELMA]`. **`[I]` That last one is the point
`research/11` §B.5 already makes — reaction mass *is* the spec — and it is why
the game correctly has a separate `cpt-unit` rig.**

**And the thing that happens before any of it.** `[F]` **HSG47** sets out *"the
three basic elements of a safe system of work during excavation"*: **planning the
work; locating and identifying buried services; safe excavation** `[HSG47]`.
`[I]` In practice: utility plans, a **cable avoidance tool and signal
generator** walked over the plot, then hand-dug trial holes to prove services
before anything is drilled. **This is a real pre-drill step the game has no
representation of, and it is the reason there are spray-paint marks on the ground
in every urban site photograph.**

---

## A.17 HDD entry spread

**Ground and surroundings.** `[F]` A rectangular working plot at one end of a
crossing and a second, smaller one at the other, with a **pipe-stringing
corridor** running away from the exit. `research/07` §D5, from `[PPI12]`:

| item | dimensions |
|---|---|
| Maxi-HDD entry plot, 305 m crossing | **30 m × 46 m** |
| Maxi-HDD entry plot, 914 m+ crossing | **61 m × 91 m** |
| Exit location, most crossings | **15 m × 30 m** |
| Exit location, large diameter | **30 m × 46 m** |
| Pipe fusing/stringing corridor | starts ~**23 m** beyond the exit, **11–15 m** wide |

and `[APE]`: entry and exit pits *"are to be of sufficient size to contain the
expected return of drilling fluids and soil cuttings"*, each ringed by a
**305 mm** berm.

`[F]` **Entry and exit angles of 8–16° are common**, steeper angles reducing
footprint but raising breakout risk and stresses `[PROJINFRA]`; the design
reference gives *"entry angles… generally between 8° and 20°; however, drilling
rigs are typically manufactured to operate at 10° to 12°"* with a **shore-approach
exit angle of 3–6°** `[OSTI-HDD]`. Site space must be allocated for **pipe
stringing with ingress, egress and turnarounds, mud recycling, ancillary
equipment and laydown**, and *"the assembly area behind the exit location should
ideally fit the entire pipeline in a single string to avoid stoppages during
pullback"* `[ATS-HDD]`, `[TRENCHPEDIA]`.

**The mud plant is the second machine group, and it is not decoration.** `[F]`
The reclaimer **mixes water with fluid additives**, pumps to the drill via a
high-pressure mud pump, receives returns and cuttings at the **entry pit**, then
passes them through **shaker decks → desander cyclones → desilter hydrocyclones**
and returns cleaned fluid to a **clean tank**, reducing mud volume and spoil for
disposal `[VERMEER-RECLAIM]`, `[VERMEER-RANGE]`, `[SPECTRUM-MC]`.

**Steering.** `[F]` Walkover tracking uses a **transmitter (sonde) in the drill
head and a handheld receiver walked over the bore line**, giving **location,
heading, depth, pitch, roll and transmitter status in real time**
`[DIGITRAK-MAN]`, `[SLHDD]`. `[I]` Walkover only works where a person can
physically walk the line and where depth is within sonde range; under a wide
river, a motorway or at maxi depths you switch to wireline or gyro steering.
**The crossover depth: `NOT SOURCED`.**

**Pullback.** `[F]` The product pipe is attached to the **back-reamer through a
swivel**, and the **pulling load must not exceed the pipe's safe pull strength**;
polyethylene is preferred for *"flexibility, strength and fused joints as strong
as the parent pipe"*; mud **cools the cutter and transmitter electronics,
flushes cuttings and lubricates the borehole**; and the **minimum bending radius
for laying out and pulling HDPE is 60 × pipe OD** `[PPI-HDD]`. Pullback *"should
proceed without interruption to reduce the potential for settling of cuttings or
gelling of drilling fluid around the pipe"* `[TRENCHPEDIA]`.

**Size classes — a ready-made contract ladder.** `[F]` By bore length
`[TECHTOOL]`: **short < 1 000 ft · medium 1 000–3 000 ft · long 3 000–5 000 ft ·
extremely long > 5 000 ft**; and **HDDs over 6 000 ft are usually constructed
with the intersect method** — two pilot holes drilled toward each other, often
with **two rigs drilling simultaneously**. A real large crossing: **~3 407 ft of
42-inch steel** under a river by the **intersect method with custom maxi rigs on
both banks**, **three ream passes at 30, 42 and 54 inches**, **five pullback
sections** fabricated within a narrow right-of-way, pullback **24/7**, through
*"very hard and abrasive gneiss bedrock"*, mobilised March and completed 6 July
`[MICHELS-COOSA]`, `[TT-COOSA]`.

**Where HDD fails — the exclusion evidence §B.17 needs.** `[F]` `[TECHTOOL]`:
*"A high proportion of coarse-grained materials (e.g., gravel, cobbles and
boulders) as well as excessive bedrock strength and hardness are the main
subsurface characteristics that may impair the use of HDD."* Coarse-grained soils
**are not readily fluidised by drilling muds**; boulders and cobble clusters stay
in the path and obstruct the bit, reamer and pipe. And the warning that should be
in the game: *"An HDD may have the highest risk of failure of any activities on a
project."* Rules of thumb for minimum cover are **explicitly called outdated** —
cover must be set by calculating **maximum allowable borehole pressure against
expected drilling pressure**.

**`[F]` Frac-out — the archetype's signature hazard.** Drilling fluid escapes the
bore into the formation or to surface when pressure exceeds what the ground can
contain. Causes: **soft or fractured ground, poor pre-bore planning, elevated
borehole pressure without monitoring, loss of returns, insufficient geotechnical
investigation.** Detection: **loss of returns, a drop in mud pressure, bubbling
or seepage at the surface, unusual ground movement.** Response: **stop drilling,
isolate and contain with berms or silt socks, remove fluid, reassess the bore
path or reduce pressure** `[JBT-FRACOUT]`. Regulators require monitoring and
contingency plans for exactly this `[FERC-IR]`. **`[I]` This is a better hazard
than anything currently modelled for `hdd`: it is invisible at the rig and shows
up as a grey bloom in a field two hundred metres away.**

**The photograph.** `[I]` (1) **A machine pointing into the ground at a shallow
angle** — carriage raked down at roughly 8–16°, anchored and staked, with a
**bunded entry pit at its nose** and returns welling up. (2) **The mud plant as a
separate machine group** — tanks, a shaker deck with cyclone cones on top, hoses
to the rig, and a **mud-splattered working area**: HDD sites are unmistakably wet
and grey-brown even in dry weather. (3) **A single continuous string of pipe on
roller stands stretching hundreds of metres from the exit** — fused HDPE with a
bead at each joint, or welded steel with a sideboom — plus **a person walking a
line across open ground staring down at a handheld locator.**

---

## A.18 The archetype summary table

| id | archetype | one-line ground | the object that identifies it |
|---|---|---|---|
| A1 | Urban plot | designed **working platform** over made ground | reinforcement cages on the ground |
| A2 | Infrastructure corridor | linear strip beside a live route | live carriageway or railway past the rig |
| A3 | Slope / cutting / wall | a **face**, worked from a bench or a rope | mesh, netting and bearing plates on the slope |
| A4 | Quarry bench — **aggregate** | engineered benches in rock, one colour of dust | flagged holes along the bench crest; muckpile at the toe; crusher and graded stockpiles below |
| A4b | Quarry — **dimension stone** | *cut*, not broken: flat sawn walls | wire-saw striations, numbered squared blocks, and a huge waste "grout" tip (only 15–20 % is usable) |
| A5 | Open-pit bench | the same at mine scale | a 15 m-mast rotary rig on jacks; calico bags |
| A6 | Underground drive / heading | horseshoe profile, no sky | ventilation duct along the crown |
| A7 | Underground cuddy | a bay cut to stand a rig in | rig jacked to the back, mast at an impossible angle |
| A8 | Greenfield exploration pad | a cleared patch with vegetation at its edge | core boxes on trestles **or** calico bags — not both |
| A9 | Tunnel portal | a cut face with a dark arch in it | duct and conveyor coming out of the arch |
| A10 | Fixed platform deck | steel, over water, over **well slots on a 1.8–3.0 m grid** | a boxed derrick among unrelated process plant; structure continuing down into the water |
| A11 | Mobile offshore unit | legs, columns or a hull | `research/01` §C.1.8's cheat sheet; and the BOP is on the **seabed** for semis and drillships, on the **deck** for jackups |
| A12 | Offshore geotechnical spread | a vessel, liftboat or seabed frame over a seabed target | a 30–40 m tower over a moonpool, **lab containers beside the drill floor**, a stern A-frame and an umbilical |
| A12b | Offshore foundation installation | a jack-up or DP heavy-lift vessel | **a wire, not a mast** — a hammer on top of a bare steel tube, held vertical by a gripper |
| A13 | Onshore well pad | 3 000–10 000 m² of sealed, fenced ground | raised substructure with space for a BOP under it; **a lined pit *or* cuttings boxes, never both** |
| A14 | Water-well plot | unbounded ground, no fence | cuttings bagged in a numbered row; casing on bare earth; **members of the public inside the frame** |
| A15 | Permafrost pad | a **built** pad — 5 ft of gravel, or ice | everything clad and enclosed; thermosyphon heads; buildings on pilings with an air gap |
| A16 | Brownfield / GI plot | hardstanding over contamination | **labelled IDW drums and a decon station**; continuous core sleeves in depth order; a 7 m tripod on the GI variant |
| A17 | HDD entry spread | two plots and a forbidden thing between them | a rig raked at 8–16°; a cyclone-topped reclaimer; product pipe on rollers to the horizon |
---

# B. RIG CLASS → ARCHETYPE, and where each one NEVER goes

## B.0 The rule this section enforces

> **A drilling method is not portable between settings. The machine class, the
> logistics tail and the client are one package, and the setting is part of the
> package.**

The owner stated the principle exactly: *"a diamond core rig is one thing, a
piling rig is something, anchor rig is something."* Those are **three different
machine classes with three different site requirements**, and the game currently
treats them as three entries in the same list, filtered only by ground type.

Each method below gets: **the machine class in one line · occurs in · NEVER in,
and why**. The "never" column is the load-bearing one.

---

## B.1 `auger` — hollow-stem / flight auger

**Machine class.** A light tracked or trailer carrier, a short mast, a rotary
head, continuous flights or a hollow stem. 3–10 t class `research/11` §B.3;
the game's own `crawler-lite` is described as 4.5 t.

| occurs in | why |
|---|---|
| Brownfield / environmental plot (A16) | the standard soil-sampling and monitoring-well method in unconsolidated ground `research/06` §B |
| Urban plot (A1), for GI | small footprint |
| Greenfield / rural plot (A8, A14) | shallow soil boreholes |
| Infrastructure corridor (A2) | verge and embankment GI |

| **NEVER in** | why |
|---|---|
| **Offshore platform deck (A10)** | **five reasons, and the first is sufficient.** (1) `[I]` **There is no soil at the machine.** A hollow-stem or flight auger conveys cuttings up its flights to a **dry ground surface** where they fall off; a platform deck sits tens of metres above the sea, over a jacket, over a conductor `[EP0147144]`. (2) `[F]` The method is *"a shallow drilling method with maximum depth of drilling of 200 to 300 ft (60 to 90 m)"* and *"cannot penetrate cobbles, boulders, and most rock formations"* `[FHWA-DRILL]` — platform wells are kilometres deep and fan out *"over 10 km"* horizontally `[WP-DIRECTIONAL]`. (3) `[I]` **An auger flight has no plain bore**, and every offshore borehole — hydrocarbon or geotechnical — is a conduit for wireline tools, logging and casing (offshore geotechnical strings are plain-bore 5½" API, Geobor or PQ3 `[GARD-DRILL]`). (4) `[I]` **No spoil route**: a deck has no spoil pile, no muck skip and no dumper. (5) `[F]` Zone 1 DSEAR/ATEX certification `[HSE-ZONE]`, `[HSEBLOG]`. **This pairing is reachable in the game today and is the second-worst error in it** |
| Offshore mobile unit (A11), geotechnical vessel (A12) | `[F]` the offshore replacement for the auger's *function* is the **seabed CPT frame** and the **vibrocorer** — a self-weighted frame pushing a cone `[CMS-CPT]`, `[DATEM]`, or a vibrating barrel taking *"continuous cores up to 6m below the seabed"* `[GARD-VC]`. For the top-hole of an actual well it is the **conductor**, driven or jetted `[EP0147144]` |
| Underground drive (A6) | no |
| Quarry bench (A4), open-pit bench (A5) | the ground is blasted rock; `auger`'s own `validGround` stops at `chalk` |
| Desert dune (A13/A14) | `[I]` marginal rather than never: running sand collapses onto the flight. Cased methods are the honest answer |

---

## B.2 `cable-tool` — percussion / spudder

**Machine class.** `DOMAIN.md` §1a: *stringless* — a wire rope, a rope socket,
jars, a drill stem and a chisel, cleaned by **bailing**. Two families that must
not be conflated: the American **water-well spudder** (a truck with a walking
beam and a bull wheel) and the British **shell-and-auger / cable-percussion
tripod** used for ground investigation `research/06`.

| occurs in | why |
|---|---|
| Rural / village water-well plot (A14) | the classic cheap water-well method; slow, simple, repairable |
| Brownfield / GI plot (A16), as the tripod variant | UK/European GI practice `research/06` |
| Nordic / smallholding plot | as A14 |

| **NEVER in** | why |
|---|---|
| **Offshore platform deck (A10)** — the headline error | **Never. Not once, not anywhere, not in any era of offshore drilling. Six independent reasons, any one of which is disqualifying.** (1) **No pressure control.** `[F]` A cable-tool hole is an open hole with a bailer in it, and the method *"does not use any circulation fluids"* `[FRTR]`. A platform's drilling package is built around a **surface BOP stack with ram and annular preventers, choke and kill lines** `[OGP-TECH]`. You cannot land a BOP on a slack cable. (2) **No circulation, therefore no mud, therefore nothing holding back reservoir pressure.** (3) **Depth.** `[F]` Practical cable-tool depth is *"approximately 100 feet or less"* `[WELLOWNER]`, against platform wells that fan out *"over 10 km"* horizontally at 1 600–2 600 m TVD `[WP-DIRECTIONAL]`. Off by orders of magnitude. (4) **It cannot deviate** — a free-falling bit on a cable drills straight down, and platform wells are the definition of directional drilling `[WP-DIRECTIONAL]`. (5) **Rate.** `[F]` *"1.5 to 2.5 feet per hour for bedrock and dense tills… 3.5 to 4.5 feet per hour for silts, clays, and sands"* `[FRTR]`; *"10-30 feet a day while rotary rigs do 200"* `[WELLOWNER]`. (6) **Zone 1.** `[F]` The drill floor is *"an area in which an explosive gas atmosphere is likely to occur in normal operation"* `[HSE-ZONE]`, where *"Zone 1 and Zone 2 specifications drive enclosure type, cable glanding, and motor rating for **every component** within the hazardous envelope"* `[HSEBLOG]`. **An open-deck diesel spudder with a friction clutch is not, and cannot be, certified for that.** Add to all six: the platform package is *permanently installed equipment in box frames* `research/01` §C.1.5, and the deck skids over fixed **well slots** `[OGP-OFFS]` — there is nothing to mobilise a spudder onto |
| Offshore, any unit | as above. **`[I]` What replaces its function offshore: nothing, because the function does not exist offshore.** If a percussion moment is wanted, the two honest offshore analogues are **conductor driving with a free-hanging hydraulic hammer** through the jacket guides `[EP0147144]`, `[STRESS-COND]`, and **downhole wireline percussion sampling** inside a geotechnical drill string `[GQM-SAENTIS]`. **The second is a sampler at the bottom of a hole, not a rig type — do not conflate them** |
| Underground (A6) | no |
| Quarry / pit bench (A4/A5) | wrong product, hopelessly slow in blasted rock |
| Urban plot (A1) as a *water-well spudder* | `[I]` the tripod GI variant belongs; the spudder does not. **The game's single `cable-tool` id conflates two machines that share a principle and share no site** |

---

## B.3 `top-hammer` — surface rock drilling

**Machine class.** `research/03` §C.1.1: tracked undercarriage, boom, **feed
beam** with the **hydraulic drifter sliding on top**, rod carousel, dust
collector hood and cyclone. *"the feed is the visual signature — a long straight
beam that tilts and slews independently of the tracks; the machine can drill
inclined holes and looks wrong if the feed only ever points straight down."*

| occurs in | why |
|---|---|
| Quarry bench (A4) | the archetypal surface production-drilling machine |
| Open-pit bench (A5), smaller benches and pre-split | |
| Infrastructure corridor (A2) | rock cutting, trenching in rock, pre-split for a road |
| Slope & cutting (A3) | dowel and drainage holes into a rock face |
| Tunnel portal (A9) | portal collar, rock net anchors, scaling |
| Urban plot (A1) | `[I]` demolition and rock excavation in a city — real but noisy and consent-limited |

| **NEVER in** | why |
|---|---|
| Offshore, any unit | `[I]` no rock to drill on a deck |
| Underground drive (A6) | a **surface** crawler is not an underground jumbo: `research/03` §C — underground machines are *low, wide, centre-articulated*, because a low-profile drive can be **2 m** high `[W-SANDVIK-DD211L]`. A surface crawler with a folding mast does not fit and cannot turn a 90° intersection |
| Desert dune, permafrost soil, urban soft ground | its `validGround` is rock and concrete, correctly |

---

## B.4 `dth` — down-the-hole hammer, surface

**Machine class.** `research/03` §C.1.2: the same crawler family as top hammer,
but *"the compressor is the dominant component — DTH runs on air, and the air
does the work… The hammer is down the hole and invisible."*

| occurs in | why |
|---|---|
| Quarry bench (A4), open-pit bench (A5) | deep production holes |
| Rural water-well plot (A14), Nordic and Arctic | the standard hard-rock water and geothermal method |
| Greenfield pad (A8) | as the air rig on a mineral prospect |
| Permafrost pad (A15) | |

| **NEVER in** | why |
|---|---|
| Offshore platform deck | as B.1/B.2 |
| Underground drive (A6) | the surface machine, no. *(An in-the-hole hammer on an underground longhole rig is a different machine — see B.18.)* |
| Urban plot (A1) at close quarters | `[I]` marginal, not never: air flush blows cuttings and dust, which is a real consent problem beside occupied buildings |

---

## B.5 `overburden` — casing-while-drilling (concentric & eccentric)

**Machine class.** Any crawler with a casing drive; the system is a **tooling
family**, not a rig family. `PLATFORM_TRUTH.md` Part C §2 governs the
terminology: ring bit stays on the shoe and is left in the ground; wing bits
retract and are reused; Odex is eccentric, Symmetrix concentric.

| occurs in | why |
|---|---|
| Nordic/glacial plots (A8, A14, A1) | boulders in till is *the* reason this family exists `[AXELSSON]` |
| Permafrost pad (A15) | frozen, thaw-unstable ground |
| Quarry bench (A4) | collaring through blast rubble |
| Urban plot (A1), infrastructure corridor (A2) | micropile and anchor casing through fill |
| Slope & cutting (A3) | anchor holes through colluvium into rock |

| **NEVER in** | why |
|---|---|
| Offshore, any unit | `[I]` the offshore analogue is conductor driving and jetting — a different operation with a different name |
| Underground drive (A6) | `[I]` not the machine |

---

## B.6 `core` — diamond core / wireline exploration

**This is one of the three the owner named. Get it exactly right.**

**Machine class.** `research/02` §E1–E2: a skid- or track-mounted crawler with a
**wireline winch and a sheave at the mast crown**, a fine-feed chuck, and — the
identifier — *"a water tank and sump, and core trays stacked on trestles. The
core rig site is wet."* Heli-portable and modular variants exist for ground with
no track access `research/02` §E2.

| occurs in | why |
|---|---|
| **Greenfield exploration pad (A8)** | the primary setting. Bush, forest, mountainside, tundra, ice |
| **Underground exploration cuddy (A7)** | a purpose-cut bay off a level, the rig jacked between floor and back. `research/02` §E3 already documents a *"positioner-and-turntable, set up in a cuddy"* |
| Open-pit / mine lease (A5) | resource-definition and geotechnical holes from benches and lease roads |
| Tunnel portal / alignment (A9, A2) | site investigation ahead of a tunnel — `core`'s applications correctly include `tunnelling` |
| Slope & cutting (A3) | rock-mass characterisation `[I]` |

| **NEVER in** | why |
|---|---|
| Offshore platform deck (A10) | `[I]` coring a reservoir from a platform is done with an oilfield core barrel on the drill string, not with a wireline exploration rig. **Two different machines, one word** |
| Urban plot (A1) as *exploration* | `[I]` a core rig on a city plot is doing **site investigation**, not prospecting. Same machine, different job, different client, different archetype |
| Desert dune field (A13) | `[I]` sand is not a core target |

---

## B.7 `rc` — reverse circulation

**Machine class.** `research/02` §E4 gives the definitive test: *"the RC rig has
a **cyclone and a bag rack hanging off it**, a **fat hose looping from the head
down to the cyclone**, and a **compressor the size of a shipping container**
parked alongside… The core rig site is wet; the RC site is dusty."*

| occurs in | why |
|---|---|
| **Open-pit mine bench (A5)** | `[F]` grade control and resource definition — the highest-volume RC setting. *"Grade control is generally expedited by **inclined RC drilling** on grids determined by the ore body characteristics"* `[GF-STIVES]`, and RC *"supports fast sampling cycles and adapts well to confined in-pit environments"* `[DMA-GC]` |
| **Greenfield exploration pad (A8)** — but **not as first pass** | `[F]` RC is *"typically used for more advanced-stage exploration, where a target has already been identified"*; **aircore** is the first-pass tool `[BOSTECH]`. RC also serves as a **precollar to 500 m** before switching to diamond `[RCD-COMPARE]` |
| Mine lease roads and pads | |
| Permafrost pad (A15) | `[I]` used, with the cold-weather caveats |

| **NEVER in** | why |
|---|---|
| Underground drive (A6) | `[I]` the sample train — cyclone, splitter, bag rows — plus a container-sized compressor does not fit in a 5 m drive, and the dust load is unmanageable in a ventilated heading. Underground exploration is **diamond core**, not RC. **This distinction matters for §C** |
| Offshore, any unit | no |
| Urban plot (A1) | `[I]` dust and noise; there is nothing to assay |
| Tunnel portal (A9) | no |

---

## B.8 `rotary-kelly` — large-diameter bored piling

**This is the second of the three the owner named. It is heavy urban and
infrastructure plant and nothing else.**

**Machine class.** `research/05` §C3, `research/10` §B.2: a tracked base machine
with a fixed or swinging leader, a telescopic **Kelly bar**, a rotary drive head
(KDK), interchangeable augers, buckets, core barrels and casing, often with a
casing oscillator or rotator alongside. Machine masses run into the **100 t+**
class `research/10` §B.2.

**The drilling cycle, in one sourced sentence — this is the game loop.** `[F]`
*"The excavation cycle consists of the tool being lowered into the pile bore,
rotated to load the tool and then withdrawn fully loaded. Once the tool is above
the ground the rig is commonly slewed to the side of the bore and the spoil is
discharged. **Each digging cycle typically advances the bore up to 500 mm**, thus
each pile consists of a number of repetitive cycles"* `[FPS-PUWER3]`.

**What the site must provide — all of these, or the job does not happen:**

| requirement | source |
|---|---|
| A **certified working platform**, to **BR470**, evidenced by a **Working Platform Certificate signed by the Principal Contractor before piling commences**, at a gradient **no steeper than 1 in 10** — with design bearing pressures for a heavy hydraulic rig of **212 and 633 kN/m²** across two load cases. *One third of all Dangerous Occurrences reported by FPS members relate to working platforms, and **a soft spot of only 1 m² can destabilise plant weighing up to 150 t*** | `[FPS-WPG]`, `[FPS-WPPOS]`, `[BR470]`, `[EFFC-WP]`, `research/05` §B2/§C |
| **And the load case that matters is extraction, not drilling.** Track pressure *"is commonly much higher than… total rig weight divided by the total track area"*; a worked 377 kN example gives **standing 104 kPa, drilling ("penetrating") 84 kPa — and extraction 229 kPa**, against a naive 71 kPa | `[FPS-TRACKTOOL]` |
| Low-loader access for **multiple loads**. `[F]` A small class arrives in one load at **2.5 × 3.3 × 15 m and 45 t** with a removable counterweight and a folding mast head; a mid-large class splits into **44.0 t base + 24.2 t leader + 10.2 t and 5.2 t counterweights + 6.7 t rotary + a 5.5–11.6 t kelly bar** — `[I]` **four or more low-loader movements before any tooling arrives**, and a crane-assisted rig-up | `research/05`, `research/10` |
| A **concrete supply chain** — truck mixers, an **agitator drum to keep supply continuous**, a pump at **55–95 bar** through **100/125 mm hose rated 80–120 bar**, and a tremie of **minimum 150 mm or 6 × max aggregate size** kept **embedded 3–8 m in the fresh concrete throughout the pour** | `[FPS-PUMP]`, `[EFFC-TREMIE]` |
| **Reinforcement cage** laydown and a service crane — steel arrives in **two-tonne bundles**, **cages over 18 m need welded lap splices**, and every cage is lifted **from horizontal to vertical** on designed points | `[FPS-REINF]` |
| **Spoil handling** — the rig **slews and spins off after every ~500 mm cycle**, so the heap is *beside* the bore, with skips, a muck-away route and a wheel wash | `[FPS-PUWER3]`, `[COL-COP]` |
| Bentonite or polymer plant where the bore is fluid-supported — mixing and storage tanks, a **desander**, usually a centrifuge, run to acceptance values with **sand content capped at 4 % before concreting** and slurry **hydrated at least 12 hours** after mixing. And the urban catch: *"In urban areas, space restrictions often do not permit the arrangement of bentonite slurry tanks and pipes"* | `[FPS-BENT]`, `[EFFC-SF]`, `[SPRINGER-BENT]` |
| A **barriered red zone of 5 m** for large-diameter auger work — and note that CFA needs **10 m** | `[FPS-RZ]` |

**`[I]` The regulatory class boundary is worth knowing because it is where the
game's own rig tiers should sit:** `[F]` machines with **rotary torque greater
than 35 kNm** are Foundation Equipment under BS EN 16228 Part 4; below that, or
with multi-directional drilling capability, they fall under Part 2 — and the
industry counts **300 mm diameter and less as mini-piling** `[FPS-PUWER3]`.

| occurs in | why |
|---|---|
| **Urban plot (A1)** | the primary setting. Deep basements, high-rise cores, secant walls |
| **Infrastructure corridor (A2)** | bridge and viaduct piers, retaining walls, rail structures |
| Port / marine-adjacent works `[I]` | |

| **NEVER in** | why |
|---|---|
| **Quarry bench (A4)** | there is nothing to found on a bench, and no concrete supply. **Currently reachable in the game** |
| **Open-pit bench (A5)** | as above |
| **Tunnel portal apron (A9)** | `[I]` the apron is a working and haulage area for the heading; a 100 t piling rig is not part of that spread. **Currently reachable via `alpine`** |
| **Greenfield forest pad / Nordic plot (A8)** | `[AXELSSON]`: >95 % of Swedish piles are driven or drilled end-bearing. **Currently reachable** |
| **Offshore platform deck (A10)** | **five reasons.** (1) `[F]` **There is no deck-level foundation work** — a platform's foundation is already there, steel piles driven *"90 to 180 m (300 to 600 feet)"* into the seabed from a jacket that *is* the pile template `[EP0147144]`. (2) **Weight against crane limit.** `[F]` Platform cranes are *"typically 15-40 ton"*, up to 50–100 t for the largest modular rig packages, and anything above that needs a **crane barge** `[OM-WEIGHT]` — against a mid-size rotary base machine in the **50-tonne-plus** class `[BAUER-METHODS]` `[I]`. And a tracked rig does not disassemble into the **12-tonne modules** a purpose-built modular platform rig is designed around `[OM-MODULAR]` `[I]`. (3) **Footprint.** `[F]` A whole modular platform rig plus its active mud system occupies **14 × 12 m** `[OM-MODULAR]`; a crawler with a 20 m mast needs tracking room, a concrete line and a spoil skip that do not exist. (4) `[I]` **The Kelly bar cannot pass a wireline or a BOP** — the platform's architecture is a pressure-containing string through a surface BOP under a derrick, not an open bored shaft. (5) `[F]` Zone 1 certification `[HSE-ZONE]`, `[HSEBLOG]`. **`[I]` The exception that is not an exception: a jack-up genuinely can be a piling platform — it has *"up to 500 tons safe lifting capacity"* and acts as a *"stable fixed platform from which piles can be driven"* `[OM-MINIMAL]` — but the pile is driven by a crane-hung hydraulic hammer, not by a leader rig. See §A.12b** |
| Desert pad (A13), permafrost pad (A15) | `[I]` no client, no concrete |
| Underground drive (A6) | no |

---

## B.9 `cfa` — continuous flight auger piling

**Machine class.** `research/05` §A6: a **tall fixed mast** carrying a
continuous auger the full pile length, with concrete pumped **through the hollow
stem** as the auger is withdrawn.

**`[F]` And the constraint that decides the whole site:** *"With this type of
pile **the auger or digging tool extends over the full depth of the pile bore**.
Generally, the auger is screwed into the ground **in one pass**"* `[FPS-PUWER3]`;
*"The mast height should exceed the pile length"* `[STRUCTVILLE-CFA]`; and
*"Sites with overhead obstructions need alternative methods **like sectional
flight auger piling**"* `[DAWSON-CFA]`. **`[I]` This is the cleanest hard
constraint in the whole domain: a 25 m CFA pile needs about 25 m of mast above
the platform. Overhead lines — with their own exclusion zones of 1 m to 7 m by
voltage `[GS6]` — bridges, live overhead line equipment and building soffits
therefore exclude CFA outright and push you to sectional flight auger, cased CFA,
or rotary bored. That is a real, free, non-obvious contract constraint.**

**`[F]` The over-flighting failure mode — and it is the best CFA mechanic
available.** As the auger bores, *"**rotation slightly greater than one rotation
per flight pitch** is required to loosen the soil and allow the tool to
penetrate"*. In stiffer soils more rotation is needed and **more soil is flighted
to the surface than the volume contained within the flights**. Over-rotate, and
the ground around the tool destabilises and settles — worse still if the concrete
placed is less than the soil removed. *"It is not uncommon for pile diameters of
**900 mm or greater**… therefore even limited amounts of over-flighting can
equate to significant volumes of ground loss"*, and — the part that closes the
loop — ***"Undetected voids or excessive settlement below a piling platform may
undermine the stability of the piling machine relying on its support"***
`[FPS-OVERFLIGHT]`. The named high-risk grounds are **soft soil over firm-to-hard
strata** (including claystones and old foundations), **soft clays, loose silts
and loose single-sized sands**, **a high water table**, and **close pile
spacing**. And there is a numeric trigger: excessive flighting *"may be defined
as rate of penetration of **less than 1 m per 10 auger revolutions**"* for
standard augers, *"and could be less than 1 m per 20"* for extra-heavy-duty ones
`[FPS-OVERFLIGHT]`.

**`[I]` That is a live gauge, a failure state and a reason the platform matters,
all from one sourced document — and the game has none of it.**

| occurs in | why |
|---|---|
| **Urban plot (A1)** | its home. Low vibration, no casing, fast cycle |
| **Infrastructure corridor (A2)** | |

| **NEVER in** | why |
|---|---|
| Ground with **boulders or shallow rock** | you cannot pull a continuous auger through a boulder. `cfa`'s own `validGround` correctly excludes `boulder` — and yet the game offers it in `nordic`, whose profile contains two till beds *with* a boulder bed and rockhead at 5–15 m `[AXELSSON]`: *"It is not uncommon to encounter larger boulders in moraine"* |
| **Quarry bench, pit bench, portal apron, desert pad, offshore, underground** | `[I]` all for the same reason as B.8, plus one more: CFA needs **continuous** concrete supply — `[F]` concrete is pumped maintaining *"a positive pressure head of at least 1 bar above hydrostatic"*, and spoil *"travels up the auger string and is deposited from the top of the casing into a series of telescopic tubes safely expelling it directly into a disposal vehicle, a skip or to a holding area"* `[WP-CFA]`, `[SB-CFA]` — and an interrupted pour is a defective pile |
| **Offshore, as a foundation method of any kind** | `[F]` the published envelope is **600–1 200 mm diameter, maximum depth 50 m** `[BAUER-METHODS]`, against offshore monopiles of **8.8 m diameter, 92 m long, 1 530 t** `[ML-SOFIA]`. `[I]` It is not undersized — it makes the wrong product entirely: a cast-in-place concrete pile, not a prefabricated steel tube that must serve as the turbine's structural stub. See §A.12b |
| Nordic forest (A8) | `[F]` `[AXELSSON]`: CFA appears only in *"other pile types occasionally used"*, below 4 % timber piles |

---

## B.10 `cased-cfa` — double-rotary / cased CFA

**Machine class.** `research/05` §A7: CFA with a **counter-rotating casing**
driven by a second drive head. The most restrictive of the piling family: the
tallest mast, the heaviest machine, the most demanding platform, and it exists
specifically for **contaminated or unstable urban ground where you must not lose
spoil to the surrounding soil.**

| occurs in | why |
|---|---|
| **Urban plot (A1)**, especially brownfield | its entire reason to exist |
| Infrastructure corridor (A2) | |

| **NEVER in** | why |
|---|---|
| **Saharan water field (A13)** | `[I]` **the current game's most gratuitous pairing.** A dune field 200 km from the road head, offering a machine whose defining feature is a second drive head for urban contaminated ground, with no concrete supply within a day's drive. It arrives purely through the `environmental` application string |
| Everything B.9 excludes | same reasoning, more so |

---

## B.11 `driven-pile` — impact driving on a leader

**Machine class.** `DOMAIN.md` §1a: *"A ram on a leader. **No rotation, no
flush, no drill string.**"* `research/05` §C1: a leader-mounted pile driver, or
a crane-suspended leader; the pile is precast concrete, steel tube or sheet pile.

| occurs in | why |
|---|---|
| **Infrastructure corridor (A2)** | bridges, embankments, ports, quays |
| **Urban plot (A1)** — *with a caveat* | `[I]` driven piling in dense urban areas is limited by **noise and vibration consent, not by ground**. `[F]` A real city's method hierarchy puts driven piling and dynamic consolidation **last of five**, behind pressed-in, auger/bored, diaphragm and vibratory `[CIEH-LONDON]`; guidance vibration limits at the worst-affected floor are **1 mm/s PPV for occupied residential and educational buildings, 3 mm/s for occupied commercial, 5 mm/s for other unoccupied buildings**, with exceedance triggering notification, method review, monitoring and condition surveys `[CIEH-LONDON]`. And the authority can specify **which plant may be used and for which hours**, under a consent answered within **28 days** `[COPA-S60]`, `[COPA-S61]`. **`NOT SOURCED`: DIN 4150-3 and BS 5228-2 limit values themselves — do not print those.** The red zone is also the largest on any piling site: **10 m to the side and *pile length + 2 m* in front** `[FPS-RZ]` |
| **Nordic plot (A8 / rural A1)** | `[F]` **the single most correct method-region pairing available to the game and it is currently drawn on bare forest floor**: 60 % of Swedish piles are driven pre-cast concrete, 23 % driven steel pipe `[AXELSSON]` |
| Offshore, as **vessel-based** monopile and pin-pile driving | **this is a different machine and it needs its own archetype (§A.12b).** `[F]` *"An onboard monopile crane is used to lower the foundations into the sea, where they're driven into the seabed using a hydraulic hammer"* `[ORSTED-INST]`; verticality comes from a **gripper** whose *"sensors measure the pile's inclination and hydraulic cylinders actively compensate the disturbing vessel motions in heave, surge and sway"* `[WTI-GRIPPER]`; and the hammers work **fully submerged**, to 2 000 m and beyond `[IQIP-HH]`, `[ACTEON-HAMMER]`, which a leader-guided hammer physically cannot do. **`[I]` There is a wire, not a mast. The game must not reach this through the `piling-leader` rig** |

| **NEVER in** | why |
|---|---|
| Quarry bench, open-pit bench (A4/A5) | nothing to found |
| Tunnel portal apron (A9) | `[I]` |
| Underground drive (A6) | no headroom for a leader |
| **Fixed platform deck (A10)** | `[I]` platform piles are driven when the **jacket is installed**, from a derrick barge, years before a drilling package exists |

---

## B.12 `anchor` — ground anchors, micropiles, soil nails

**The third of the three the owner named, and the one most often confused with
piling. It is a different machine on a different site.**

**Machine class.** `research/11` §A.1/§B.1: a **compact crawler** with a short
mast, often with a boom that lets the mast be positioned at any angle including
upwards and sideways; low-headroom variants for basements; excavator-mounted
rotary-percussive units and soil-nailing feed beams; and *"mini-rigs"* for
restricted access `[FORKERS]`. Contractors also list **rope-access drilling
platforms** and hand-held pneumatic drills for faces conventional plant cannot
reach `[ROCKSUP]`.

**How the site differs from a piling site** — this is the paragraph the game
needs. `[I]` No concrete trucks, no reinforcement cages, no tremie. Instead:
a **grout mixer and pump**, drill rod racks, anchor heads and bearing plates,
**tensioning jacks**, and very often a **bench cut into a slope**, a scaffold, or
a mast hung off a face. The rig is small enough to be craned or winched to where
it works.

| occurs in | why |
|---|---|
| **Slope, cutting and retaining wall (A3)** | the primary setting: highway and railway rock cuts, rockfall remediation in steep terrain `[ROCKSUP]` |
| **Tunnel portal (A9)** | portal face anchors, rock nets |
| **Urban plot (A1)** | temporary anchors to a secant/contiguous wall; **underpinning inside existing buildings with low-headroom rigs** |
| Quarry bench (A4) | highwall dowels and nets |
| Infrastructure corridor (A2) | soil-nailed cuttings and embankments |
| Dam and hydro remediation `[I]` | |

| **the distinction the game must encode** | `[F]` *"A rock bolt is installed in competent rock and develops bond to the rock mass through grout in the borehole annulus or through a mechanical anchor at the toe, with bolt lengths typically 4 to 25 feet. A soil nail is installed in soil or weathered rock and is fully grouted along its full length… with nail lengths typically 15 to 60 feet"* `[ROCKSUP]` |

| **NEVER in** | why |
|---|---|
| Offshore, any unit | `[I]` |
| Open-pit bench (A5) as the main work | `[I]` marginal; pit-wall support exists but is not the archetypal setting |
| **On an underground bolter** | see B.13 — the game's `bolter` rig currently offers `anchor`, which puts an articulated underground machine on a surface slope |

---

## B.13 `rockbolt` — ground support

**Machine class.** `research/03` §C: an **articulated underground bolter** — low,
wide, centre-articulated, oscillating axles, big low-pressure tyres, operator
beside the boom under a canopy — with a bolt carousel, resin magazine, grout
pump and mesh handler. It is in the game's `UNDERGROUND_METHODS`.

| occurs in | why |
|---|---|
| **Underground drive / heading (A6)** | the only setting for the machine |
| **Tunnel portal (A9)** — the machine *at* the portal, in daylight | `[F]` jumbos and bolters work at portals: pipe umbrella systems are used *"in tunnel drives, portals and re-excavation of collapsed sections"* `[DSI-AT]`, `[SANDVIK-AT]` |
| Underground exploration cuddy / mine level (A7) | |

| **NEVER in** | why |
|---|---|
| **Any surface site that is not a portal** | `[I]` the machine's proportions exist *because the tunnel is low, wide and has corners* `research/03` §C. Nothing about it makes sense in daylight on a forestry track. **Currently reachable in `nordic`, and with no `under` site line to describe it — defect D2** |
| Urban plot, quarry bench, pit bench, desert, offshore, permafrost | `[I]` |

**The nuance that must not be lost.** `[F]` **Rock bolting itself absolutely
happens on the surface** — *"Highway and railway rock cuts"* and *"Rockfall
remediation in steep terrain"* are listed alongside underground work
`[ROCKSUP]`, using *"track-mounted drill rigs"*, *"rope-access drilling
platforms"* and pneumatic hand-held drills. **`[I]` So the correct model is: the
surface work is the `anchor` method on a slope archetype; the `rockbolt` method
is the underground bolter.** Saying "rock bolts never appear on the surface"
would be wrong; saying "the underground bolter never appears on the surface" is
right.

---

## B.14 `tunnel-jumbo` — drill & blast at the face

**Machine class.** `research/03` §C and `research/04` §C: a two- or three-boom
articulated jumbo, low and wide for the same reasons as the bolter.

| occurs in | why |
|---|---|
| **Underground heading (A6)** | the setting |
| **Tunnel portal (A9)** | `[F]` the first rounds are collared at the portal in daylight, and *"A conventional drill jumbo"* installs the pipe-umbrella pre-support that portals need `[SANDVIK-AT]`, `[DSI-AT]` |
| Mine development drives (A6) | |

| **NEVER in** | why |
|---|---|
| Any other surface archetype | as B.13 |
| Offshore | no |

---

## B.15 `longhole` — production drilling underground

**Machine class.** The game's own copy is good: a full-circle slew ring, drilling
rings and fans from one set-up. `research/03` §A covers ring geometry.

| occurs in | why |
|---|---|
| **Underground production drive (A6)** | the only setting |

| **NEVER in** | why |
|---|---|
| **Every surface archetype without exception** | `[I]` a longhole rig drills *up* into a stope back and *down* into its floor from a drive. On the surface, that machine is a surface crawler and the method is called production blasthole drilling — a different rig class `research/03` §C.1.3 |
| Offshore | no |

---

## B.16 `raise-boring`

**Machine class.** `[F]` *"The raise borer is set up on the upper level of the
two levels to be connected, on an evenly laid platform (typically a concrete
pad)"*; a pilot hole of **230–445 mm** is drilled down to the lower level, the
bit removed, and *"a reamer head, of the required diameter of the excavation, is
attached to the drill string and raised back towards the machine"* `[WP-RAISE]`.
A **boxhole borer** is the inverse: *"set up on the lower level"* and driving the
reamer upward when upper-level space is insufficient `[WP-RAISE]`.

**⚠ I have to correct the brief here, and it matters.** The brief asked me to
*"confirm"* that underground machines never appear on the surface and to say
whether raise boring is ever surface-to-underground. **It is, routinely, and
three independent sources say so.** `[F]`

- *"a pilot hole is drilled into an existing mine or tunnel and the raise bore
  machine mechanically reams **from the lower level to either the surface or
  another underground level**"* `[FK-RAISE]`
- *"drilling a **pilot hole from the surface down to the target elevation**. A
  reaming head is then pulled upward"* — ideal for ventilation and secondary
  access shafts, and it *"requires the mine to be developed under the shaft
  location"* `[MILLER-RB]`
- *"It is most commonly utilized for the development of **shafts from the
  surface to underground**"* `[DEVICO-RB]`

**`[I]` So the correct statement is: a raise borer is an *upper-level* machine,
and the upper level may be the surface or an underground level. It is not
underground-only. What is invariant is that there must be an opening below it.**

| occurs in | why |
|---|---|
| **Underground, on the upper of two levels (A6/A7)** | `[F]` `[WP-RAISE]`, `[SANDVIK-RB]`, `[HK-RBR]` |
| **A surface shaft collar over an existing underground opening** | `[F]` the sources above. `[I]` The site is a **concrete pad with a base plate bolted down** — *"site preparation… involves creating a **flat concrete foundation** for the RBM. **The base plate of the RBM is secured with rock bolts**"* `[TUST-RB]` — a stack of fat 1.5 m rods, and two skid power packs. **Not a drill pad, not a piling plot.** Civil applications are real: metro, rail, flood-water and waste infrastructure, and hydroelectric `[MASTERDRILL]` |

| **NEVER in** | why |
|---|---|
| **A quarry bench, an urban piling plot, a portal apron — as the game currently draws it** | defect **D1**: `raise-boring` is in `UNDERGROUND_METHODS` but has **no entry in `core/env.js` `UNDERGROUND`**, so it renders on whatever surface kit the region has |
| **Anywhere with no opening underneath** | `[F]` the method connects **two** levels; *"the drill cuttings from the reamer head **fall to the floor of the lower level**"* and are *"mucked out using a LHD-type loader"* `[WP-RAISE]`, `[SANDVIK-RB]`. Without a lower opening there is nothing to hole into and nowhere for the muck to go |
| Offshore, desert, permafrost | `[I]` |

**The contrast machines, so the game does not conflate them.** `[F]`
**Boxhole boring** puts the machine on the **lower** level and pushes the reamer
**upward**, cuttings falling back into a muck chute `[EPIROC-RB]`, `[HK-BBM]`.
**Blind boring** drills pilot and reams simultaneously, pushed upward.
**Down-reaming** pushes the reamer downward with cuttings managed at the bottom,
and is *"less common"* `[SANDVIK-RB]`, `[EPIROC-RB]`. And one published machine
is a **rubber-tyred mobile raise borer needing no concrete pad at all**, with a
15-minute setup and integrated muck handling `[SANDVIK-RHINO]` — a genuine
exception to the pad rule, so do not write "always a concrete pad" as a fact.

**Scale, sourced.** `[F]` Diameters **0.5 m to over 6 m** commonly, with
published ranges to **8 m** and a record of **7.1 m**; depths to **1 000–1 500 m**,
longest recorded raise **1 260 m**; one hydro project bored 23 dropshafts of
32–172 m in 250 MPa granite at **0.6–0.8 m/h** `[EPIROC-RB]`, `[HK-RBR]`,
`[IWP-RAISE]`. Reamer heads run from about **1 060 mm with 4 cutters at 2 700 kg**
up to **5 876 mm with 32 cutters** `[SANDVIK-RB]`.

**`[I]` Terminology caution: "derrick" is not the industry word for this machine.
The manufacturers say extended height, hoist unit, pipe handler, wrench system,
drivehead. `NOT SOURCED` as a synonym — do not use it.**

---

## B.17 `hdd` — horizontal directional drilling

**Machine class.** `research/07` §D1: a rig on a **slant**, drill pipe in a
magazine, mud mixing and recycling alongside, a walkover locator operator out on
the line.

**Site footprint, sourced** `research/07` §D5: entry plot **30 × 46 m** for a
305 m crossing (up to **61 × 91 m** for 914 m+), exit **15 × 30 m**, and a pipe
fusing/stringing corridor **11–15 m wide** starting ~23 m beyond the exit.
Entry and exit pits are each ringed by a **305 mm berm**.

| occurs in | why |
|---|---|
| **HDD entry spread (A17)** and **infrastructure corridor (A2)** | road, rail, river and utility crossings |
| Urban plot edge / verge (A1) | `[I]` |

| **NEVER in** | why |
|---|---|
| **Quarry bench (A4)** | **two reasons.** (1) `[I]` **No corridor** — a bench is a terrace with a highwall on one side and a drop on the other; you cannot string 300 m of product pipe on it, and there is nothing to cross. (2) `[F]` **The ground is wrong**: *"A high proportion of coarse-grained materials (e.g., gravel, cobbles and boulders) as well as excessive bedrock strength and hardness are the main subsurface characteristics that may impair the use of HDD"* — coarse-grained soils *"are not readily fluidised by drilling muds"*, and boulders obstruct the bit, reamer and pipe `[TECHTOOL]`. A quarry bench is blasted rock and nothing else. **Currently reachable via `civil-infrastructure`** |
| **Alpine portal apron (A9)** | `[I]` same, plus the ground is rock — and `hdd`'s own `validGround` correctly tops out at `shale`, so the game is offering the method into ground it does not claim |
| **Offshore platform deck** | `[F]` HDD launches from **dry land at a shallow angle**: *"entry angles should generally be designed between 8° and 20°; however, drilling rigs are typically manufactured to operate at 10° to 12°"*, with *"a slant drill unit… set up on the land site"* `[OSTI-HDD]`. `[I]` A deck has no launch ramp, no entry pit, no exit point and no room to string a product pipe — and a platform's own long-reach requirement is already met by extended-reach rotary drilling, >10 km step-out `[WP-DIRECTIONAL]` |
| Underground drive | no |
| Open-pit bench | `[I]` |

**The offshore nuance that must not be lost.** `[F]` HDD **is** genuinely used in
offshore energy — for the **export-cable landfall**, launched from behind the
dunes and exiting on the seabed, a bore that can *"extend anywhere from half a
mile to a mile out at sea"* `[NORTHFALLS]`, `[DUDGEON]`. **`[I]` That spread
belongs on the beach. It never belongs on a deck.** If the game ever adds an
offshore-marine HDD contract, the archetype is a **shore landfall**, not A10.

---

## B.18 `sonic`

**Machine class.** `research/02` §E5: a **bolt-on head** on an ordinary tracked
geotechnical carrier — a *"large, heavy, drum-shaped oscillator"* above the
rotation unit with an air damper isolating the mast. The string is **double**:
an inner barrel and an override casing, so *"a sonic rig always has two sizes of
tube on the rack."*

| occurs in | why |
|---|---|
| **Brownfield / environmental plot (A16)** | `research/06` §B.8 — *why sonic dominates environmental work* |
| GI plot (A16/A1), infrastructure corridor (A2) | continuous undisturbed sampling |
| Greenfield pad (A8), in unconsolidated cover | `[I]` |
| Permafrost pad (A15) | `[I]` frozen unconsolidated ground |

| **NEVER in** | why |
|---|---|
| **Offshore platform deck (A10)** | `[I]` currently reachable. Offshore sonic exists on geotechnical vessels, not on production decks |
| Underground drive | `[I]` |
| Quarry / pit bench as production drilling | `[I]` wrong product |

---

## B.19 `jet-grouting`

**Machine class.** `research/05` §A12, `research/11`: a compact-to-mid mast rig
carrying a **multi-tube monitor rod string** (`research/13` §3 is explicit that
the rod and the monitor are two different items), fed by a **high-pressure pump
unit** and a **grout batching plant**, with **spoil return** that must be
collected and disposed of. Governed by **EN 12716** `[EN12716-2018]`.

**`[F]` The numbers, and they explain the whole site.** Soil around the drill
string is eroded by a high-energy fluid jet and mixed with a self-hardening cement
suspension; **borehole diameter about 15 cm**; jetting fluid pumped at
**400–600 bar**; **column diameter up to 5 m** `[JET-BAUER]`. The operating
envelope: pump **100–600 bar**, **1–2 nozzles of 2–7 mm**, rod extraction
**1–12 min/m**, air shrouding **4–12 bar**, rotation **2–15 rpm**, binder W/B
**0.5–1.5**, injection **100–400 l/min** at **3–10 bar** (same source).

**`[F]` The plant train dwarfs the hole — and that is the archetype's
signature.** A 15 cm borehole and a light rig, connected by armoured hoses to a
line of skids: a **high-pressure pump at up to 550 l/min, 600 kW and 14–15 t**;
a **colloidal mixing plant at 20/30/40 m³/h and 2.8–4.7 t**; a **backflow hose
pump at 30–50 m³/h**; a **desanding plant at 100 m³/h with a 0.06 mm cut point**;
and a **decanter at 90 m³/h and 12.5 t** `[JET-BAUER]`. Jet grouting rods are
**88.9 mm and 114.3 mm** (same source).

**`[F]` The return is a river, not a heap.** *"The excess water-soil-cement
mixture flows to the surface **through the annular space between the drill rods
and the borehole wall**"* `[IMPERIAL-JET]`, and the surplus is *"recovered on the
surface for disposal"* `[SB-JET]`.

**`[F]` And two facts that a real contractor will check for.**
1. **EN 12716:2018 defines the minimum pressure for jet grouting as 25 MPa =
   250 bar**, drawing a hard line against ordinary grouting; requires that
   *"recording of production parameters has to happen electronically and
   continuously in real time"*; requires **4 test samples per 500 m³ in
   non-cohesive soils and per 250 m³ in cohesive**; and requires verticality
   measurement on **1 in 10 boreholes deeper than 10 m and every borehole deeper
   than 30 m** `[ECSMGE-12716]`.
2. **The standard explicitly states that the high pressure *"is only used to
   generate the high velocity jet and **shall not be misinterpreted as a grouting
   pressure**"*** `[ECSMGE-12716]`. **`[I]` Any UI string that calls the 400 bar
   figure a "grouting pressure" is wrong, and a jet grouting contractor will spot
   it immediately.**

**`[I]` One more credibility trap worth recording:** do not present jet grouting
as the standard karst-void treatment. **Compaction grouting** is the technique
for filling voids; jet grouting's karst relevance is *deep treatment through*
voids `[TREVI-JET]`. **Defensible framing: jet grouting crosses voids and treats
specific horizons; compaction grouting fills them.**

| occurs in | why |
|---|---|
| **Urban plot (A1)** | underpinning, sealing, cut-off walls beside existing structures — the technique exists to treat ground you cannot excavate |
| **Tunnel portal and soft-ground tunnelling (A9/A6)** | pre-support and face treatment in **soil** |
| Infrastructure corridor (A2) | |

| **NEVER in** | why |
|---|---|
| **A hard-rock copper mine (`andes`)** | `[I]` currently reachable via `tunnelling`. Jet grouting cuts and mixes **soil** with a high-pressure fluid jet; its own `validGround` is `clay, silt, sand, gravel, till, marl`. There is no soil in an Andean porphyry drive |
| Nordic forest (A8) | `[I]` nothing to underpin |
| Quarry / pit bench, desert, offshore, permafrost | `[I]` |
| **On a surface top-hammer crawler** | defect **D4** — the game's `crawler-th` offers `jet-grouting`. A screw compressor is not a high-pressure grout pump |

---

## B.20 `site-investigation` — SPT, CPT, sampling

**Machine class.** Three distinct machines under one id, and `research/06`
already separates them: a small track-mounted rotary/window-sampling rig; a
**cable-percussion tripod**; and a **CPT unit** whose spec is its **reaction
mass** `research/11` §B.5 — the game correctly has a separate `cpt-unit` rig.

| occurs in | why |
|---|---|
| **Urban plot (A1)**, **brownfield plot (A16)**, **infrastructure corridor (A2)** | the primary settings: a small footprint, a van, cones, a few holes across a plot |
| Greenfield / rural plot (A8/A14) | |
| Permafrost pad (A15) | `[I]` |
| Tunnel alignment (A9) | |
| **Offshore geotechnical spread (A12)** — but as a *different machine* | `[I]` seabed frames, downhole CPT and heave-compensated drilling from a vessel or jack-up. Same discipline, different spread |

| **NEVER in** | why |
|---|---|
| **Fixed platform deck (A10)** | `[I]` the GI that precedes a platform happens **before the platform exists**, from a vessel or jack-up, over the seabed. Drawing it on a production deck is backwards in time as well as in space |
| Underground drive | `[I]` |

---

## B.21 `oil-rotary` — mud rotary on a derrick

**Machine class.** `research/01` §C.1–C.2: mast on a raised **substructure**
high enough to fit the **BOP stack** underneath, mud tanks and pits, shakers on
the mud-return side, mud pumps and power plant behind, standpipe up a mast leg,
pipe racks on the ground. *"The rig is small; the site is large. Draw the site."*

| occurs in | why |
|---|---|
| **Desert well pad (A13)** and any onshore pad | `[F]` `research/01` §C.1.1 gives a regulated site requirement of **~3 000 m² minimum, up to 10 000 m²**, with low-loader access, sealed surfaces, a drill cellar, fencing and flare provision |
| **Fixed platform deck (A10)** | `[F]` as a *platform rig*: *"a small, boxed-in derrick on a structure that is not a vessel"* with *"permanently installed drilling equipment"* in box frames `research/01` §C.1.5 |
| **Mobile offshore unit (A11)** | jackup / semi / drillship, per `research/01` §C.1.8 |
| Permafrost pad (A15) | `[I]` |

| **NEVER in** | why |
|---|---|
| Urban plot, quarry bench, greenfield exploration pad, underground | `[I]` |

---

## B.22 The exclusion matrix — the one table to implement

`✓` genuine · `~` possible but not the archetypal setting · `✗` **never**

| method | A1 urban | A2 corridor | A3 slope | A4 quarry | A5 pit | A6 u/g drive | A7 u/g cuddy | A8 greenfield | A9 portal | A10 platform | A11 mobile offshore | A12 offshore geo | A13 desert pad | A14 water plot | A15 permafrost | A16 brownfield | A17 HDD spread |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `auger` | ~ | ~ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ✗ | **✗** | ✗ | ✗ | ~ | ✓ | ~ | ✓ | ✗ |
| `cable-tool` | ~ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ✗ | **✗** | ✗ | ✗ | ✓ | ✓ | ✗ | ~ | ✗ |
| `top-hammer` | ~ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ~ | ✓ | ✗ | ✗ | ✗ | ✗ | ~ | ~ | ✗ | ✗ |
| `dth` | ~ | ✓ | ~ | ✓ | ✓ | ✗ | ✗ | ✓ | ~ | ✗ | ✗ | ✗ | ~ | ✓ | ✓ | ✗ | ✗ |
| `overburden` | ✓ | ✓ | ✓ | ✓ | ~ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ~ | ✓ | ✓ | ✓ | ✗ |
| `core` | ~ | ~ | ~ | ~ | ✓ | ✓ | **✓** | **✓** | ✓ | ✗ | ✗ | ~ | ✗ | ✗ | ✓ | ~ | ✗ |
| `rc` | ✗ | ✗ | ✗ | ~ | **✓** | **✗** | ✗ | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| `rotary-kelly` | **✓** | **✓** | ~ | **✗** | **✗** | ✗ | ✗ | **✗** | **✗** | **✗** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `cfa` | **✓** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | **✗** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `cased-cfa` | **✓** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✗** | ✗ | ✗ | ✓ | ✗ |
| `driven-pile` | ~ | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** | ✗ | ✗ | ~ | ✗ | ✗ | ✗ | ~ | ✓ | ✗ |
| `anchor` | ✓ | ✓ | **✓** | ✓ | ~ | ~ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ~ | ✗ |
| `rockbolt` | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** | ✓ | ✗ | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `tunnel-jumbo` | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** | ~ | ✗ | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `longhole` | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `raise-boring` | ~ (collar) | ~ (collar) | ✗ | ✗ | ✗ | **✓** | ✓ | ✗ | ~ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `hdd` | ~ | **✓** | ✗ | **✗** | ✗ | ✗ | ✗ | ✗ | **✗** | ✗ | ✗ | ✗ | ~ | ✗ | ✗ | ~ | **✓** |
| `sonic` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ~ | ✗ | **✗** | ✗ | ~ | ✗ | ~ | ✓ | **✓** | ✗ |
| `jet-grouting` | **✓** | ✓ | ~ | ✗ | ✗ | ~ (soft ground) | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `site-investigation` | **✓** | ✓ | ~ | ✗ | ~ | ✗ | ✗ | ✓ | ✓ | **✗** | ✗ | ✓ | ~ | ✓ | ✓ | **✓** | ✗ |
| `oil-rotary` | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** | **✓** | ✗ | **✓** | ✗ | ✓ | ✗ | ✗ |

**Bold cells are the ones the game currently gets wrong, in either direction.**
---

# C. PROSPECTING SPECIFICALLY — interrogating "gold will be in a mine"

The owner's instruction was: *"prospecting (maybe for gold) will be in a mine."*

**I set out to argue with that and the evidence changed my mind. The owner is
right, and the industry data says so quantitatively.**

## C.1 The evidence, and it is decisive

`[F]` **Where exploration money actually goes:**

| year | grassroots | late-stage | **minesite** |
|---|---|---|---|
| 2024 | **22 % ($2.79 bn)** — a record low at the time, down 8 % | 38 % ($4.71 bn) | the only stage that **grew**, *"with gold and copper being the primary drivers"* `[MINING-SP24]` |
| 2025 | **21 %** — a new record low | — | **45 % — a record high** `[MV-SP25]`, `[SP-WET26]` |

`[F]` And gold dominates the whole budget: 2025 global nonferrous exploration
budgets were **$12.40 bn**, of which **gold took 50 % ($6.2 bn), up 11 %**
`[MV-SP25]`. `[F]` For context on how far this has moved: grassroots was **near
half of all budgets in 1997–2004** `[MINING-SP24]`.

**`[I]` So: nearly half of all exploration spending in the world is drilling
inside an operating mine lease, gold is the largest single commodity driving it,
and greenfield is at an all-time low share. "Prospecting for gold, at a mine" is
the statistically normal case, not the exception. A driller reading the game will
recognise it immediately.**

`[F]` And it is normal business, not a corner case. A small operating gold mine
develops a cuddy *"for resource development as well as mine corridor
exploration"*, aiming *"to build gold inventory, convert inferred resource to
indicated and to help with stope design"* `[VERTEX]`. A larger one establishes
cuddies **every ~100 m** along a drive to test ground that *"has not been
previously tested due to topographical challenges associated with drilling from
the surface"* `[K92]`. A big operation runs both at once — open pits with
**inclined RC grade control** and underground stoping via declines `[GF-STIVES]`.

## C.2 The counter-case, stated fairly

`[F]` Greenfield gold drilling is real, active and photogenic at scale: one
campaign ran **nine core rigs for 40 000 m** on a mountainside with 1.2 km of
vertical relief, entirely helicopter-supported, with **core boxes flown from the
drill sites to a staging area and then trucked to the core shack** `[GOLIATH]`.
And **$2.6–2.8 bn a year still goes to grassroots** `[MINING-SP24]`. The entire
junior-explorer sector, and the word *prospecting* itself, live here.

`[I]` Greenfield also wins on **lay recognisability**: a player who has never
been on a mine reads "core rig in a forest clearing with core boxes" as
prospecting instantly, and may read an underground rig in a cuddy as *mining*
rather than *prospecting*, because there is no sky and nobody is walking around
with a hammer.

## C.3 The three settings, and how a photograph tells them apart

Exploration drilling happens in three distinct places, and the game currently
draws one kit for all of them.

| | **greenfield pad (A8)** | **mine surface / pit bench (A5)** | **underground cuddy (A7)** |
|---|---|---|---|
| **sky** | yes, vegetation to the pad edge | yes, a pit wall behind | **none** |
| **method** | core or RC | mostly **RC**, inclined, on a grid | **almost always core** |
| **wet or dusty** | *"The core rig site is wet; the RC site is dusty"* `research/02` §E4 | dusty | wet, and the water has nowhere to go |
| **the sample** | core boxes on trestles **or** calico bags | **calico bags in rows**, a splitter under a cyclone | **core trays carried out**, no bags |
| **the pit beside the rig** | **a sump** — ramped and guarded `[BLY-PAD]` | none | none; return goes to the drive's drainage |
| **power** | diesel on the rig | diesel | **trailing 11 kV mine cable** `[VERTEX]` |
| **the roof** | sky | sky | **mesh, bolt plates, shotcrete — and a vent duct** |
| **footprint** | a **20–50 m** clearing, cut lines, track, camp `[ONTARIO-BMP]` | a bench in a pit | a **6 m high × 7 m deep alcove** off a 5 × 5 m drive `[VERTEX]`, `[K92]` |
| **who else is there** | a camp, four or five people `[CORING-HELI]` | a mine: haul trucks, a shovel | a mine: an LHD passing the cuddy mouth |

**`[I]` The one-line test: if you can see a sump and a sky, it is greenfield. If
you can see a ventilation duct and bolt plates, it is underground. If you can see
both mesh and stacked core boxes, it is underground *exploration* rather than
production.**

## C.4 The recommendation

**Build the underground exploration cuddy (A7) as the gold archetype — and make
it unmistakably an *exploration* scene, not a production one.**

Reasons, in order:

1. **The evidence supports it.** 45 % of exploration spend is minesite, gold is
   the primary driver, and grassroots is at a record low share `[MV-SP25]`,
   `[MINING-SP24]`.
2. **It matches the owner's instruction**, so there is no rework.
3. **It is cheaper to build well.** One drive, one alcove, one rig and a service
   run gives a credible scene. A greenfield pad needs believable forest or
   tundra, cut lines, an access track, a camp, a core yard and rehabilitation
   states to avoid looking like a rig on a lawn.
4. **It reuses the game's best existing asset.** `core/env.js` `UNDERGROUND`
   already builds a horseshoe drive with services, a vent duct and bolt plates
   for three methods. A fourth entry — a **cuddy variant** — is the cheapest new
   archetype available to the project.
5. **It gives free adjacency** to longhole, bolting, jumbo development and the
   raise-bore breakthrough, all of which already exist in the game.

### C.4.1 The thing that must not go wrong

**An underground *exploration* drill must not look like an underground
*production* drill.** The tells, all sourced in §A:

| exploration (diamond core) | production (longhole) |
|---|---|
| **Modular boxes on a low deck** — power pack, feed frame, rotation unit, foot clamp `[BLY-UG]` | one articulated boom on a big diesel carrier, jacked on four stingers |
| **Core trays stacked in the drive** | **no core anywhere** |
| **15–75 kW** `[EPIROC-DIAMEC232]`, `[BLY-LM75]` | 90–120 kW on a 22–32 t machine |
| **A handful of long holes from one setup** — one real cuddy plans **~7 holes** `[VERTEX]` | a **fan of 8–15 holes per ring**, ring after ring |
| **Wireline winch and overshot** | a **29+1 or 35+1 rod carousel** on the feed |
| Sits in a **6 m × 7 m alcove** | sits **in** a 3.6–4.2 m drill drive |

### C.4.2 And keep the ladder — it is free variety

`data.js` already carries a four-stage confidence ladder and writes it well:

| stage | `oreConfidence` | the game's own line | **archetype it should draw** |
|---|---|---|---|
| **Greenfield step-out** | ≤ 0.40 | *"The target is a projection off surface geochemistry and nothing has been drilled into it yet"* | **A8** greenfield pad |
| **Extension drilling** | ≤ 0.60 | *"Two holes have hit the zone and this one is chasing it along strike"* | **A8** greenfield pad |
| **Resource definition** | ≤ 0.78 | *"The body is defined and this programme is tightening the spacing inside it"* | **A5** mine surface / lease |
| **Grade control** | ≤ 1.01 | *"inside a body somebody has already paid to model"* | **A5**, or **A7** where the region has underground |

`[I]` That mapping costs one lookup, uses a field the contract already carries,
and turns a four-line copy ladder that currently changes nothing visual into the
game's cheapest source of genuine site variety. **If only one archetype can be
built, build A7 and bind the whole ladder to it. If two can be built, add A8 and
split the ladder at 0.60.**

## C.5 Three things the game must stop doing regardless

1. **`[F]` An RC rig cannot be underground.** `research/02` §E4 — the cyclone,
   the splitter, the bag rows and a compressor *"the size of a shipping
   container"* do not fit a 5 m drive, and the dust load is incompatible with a
   ventilated heading. Underground exploration is **diamond core**.
2. **`[F]` RC is not the first-pass greenfield tool.** Aircore is: it is for
   *"regional-scale, first-pass exploration — testing broad areas quickly and
   affordably"*, with *"targeted RC drilling once specific targets have been
   narrowed down"* `[BOSTECH]`. RC is *"typically used for more advanced-stage
   exploration, where a target has already been identified"*. **`[I]` The game
   has no aircore method and should not invent one — but it should stop treating
   RC as reconnaissance, and `ORE_STAGES` is exactly where that is decided.**
3. **`[I]` Do not draw grade control as prospecting.** The game's own copy
   already says grade control happens *"inside a body somebody has already paid
   to model"*. That is not prospecting, and the site should not look like it.
---

# D. REGION PLAUSIBILITY — the eight regions, and the pairings that are absurd

This is the section the brief asked to be most useful. Each region gets: the
archetypes it should be able to draw, the methods that genuinely belong, and
**the named absurdities**, each with the leak channel and the fix.

A region is a **climate and a geology**. It is not a site. Several of the eight
regions currently try to be both, and that is the root cause of every pairing
below.

---

## D.1 Nordic Forest (Sweden / Finland) — `nordic`

**Archetypes it should be able to draw:** greenfield exploration pad (A8) ·
water-well smallholding (A14, the Nordic version: a farm yard, a house, a
drilled well to rock) · quarry bench (A4) · roadside slope & cutting (A3) ·
brownfield/plot investigation (A16) · **driven-pile plot** (a sub-case of A1/A2).

**What genuinely belongs.** `[F]` Swedish practice is *end-bearing on till or
crystalline rock*, and the Swedish Pile Commission's own 2014 statistics, quoted
in `[AXELSSON]`, give the market by pile type:

| rank | pile type | share |
|---|---|---|
| 1 | **Driven pre-cast concrete piles** | **60 %** |
| 2 | **Driven steel pipe piles** | **23 %** |
| 3 | **Drilled steel pipe piles** (rock socket) | **13 %** |
| 4 | Timber piles | 4 % |
| 5 | Steel core piles | < 1 % |
| 6 | *"Other pile types occasionally used"* — shaft-grouted drilled piles, cast-in-situ inside a driven casing, **CFA piles** | the residual |

and the abstract states outright: *"More than 95 % of the piles installed in
Sweden are made up of driven displacement piles or drilled end-bearing piles to
hard till or into hard crystalline rock."* `[AXELSSON]`

`[F]` The geology behind it: *"Approximately 75 % of the bedrock in Sweden is
covered with very dense moraine (till) and for 10 % of the area there is no soil
(or less than 0,5 m) overlaying the bedrock"*, with UCS *"in the region of
100–300 MPa"* and a rockhead that *"varies (undulates) significantly within short
distances"*, and *"It is not uncommon to encounter larger boulders in moraine."*
`[AXELSSON]`

**`[I]` The conclusion the game must draw from that: the Nordic region is a
driven-pile and drilled-pile region, not a bored-pile region.** Thin drift over
undulating hard rock with boulders is the exact ground in which a continuous
flight auger cannot work and a large rotary bored pile has nothing to bore.

### The absurd pairings in `nordic`

| # | pairing | leak channel | why it is wrong | fix |
|---|---|---|---|---|
| N1 | **`cfa` — continuous flight auger piling in a boreal forest** | `foundation-piling` | CFA is a soil pile. `[AXELSSON]`'s own list files CFA under *"other pile types occasionally used"*, below 4 % timber. The region's own `groundProfile` is `topsoil → till → esker gravel → till → boulder → weathered rock → gneiss → granite`; `cfa`'s `validGround` stops at `chalk` and includes **`boulder` nowhere**, so the method is being offered into ground it does not claim to work in | remove `cfa` and `cased-cfa` from `nordic`, or gate them out at the archetype level |
| N2 | **`rotary-kelly` — a 100 t-class bored piling rig on a forestry track** | `foundation-piling` | same evidence. Additionally a rig of that class needs a **certified working platform** `[FPS-WP]`, `[BR470]`, concrete truck access and a muck-away route — none of which a clear-fell block has | remove, or move it to `german-site` only |
| N3 | **`jet-grouting` in a Nordic forest** | `foundation-piling` | jet grouting is an **urban and tunnelling underpinning technique** — its purpose is to make ground where you cannot excavate `[EN12716]`, `research/05` §A12. There is nothing to underpin on a lakeside plot | remove |
| N4 | **`rockbolt` on a forestry track** | `anchoring` | `rockbolt` is one of the four `UNDERGROUND_METHODS`. It is a drive-and-face method run from an articulated underground bolter `[research/03 §C]`. **Nordic has no underground archetype and no `under` site line** (defect **D2**) | either remove `rockbolt` from `nordic`, or give `nordic` an underground archetype (a Swedish/Finnish hard-rock mine is entirely real) and an `under` site line |
| N5 | **`driven-pile` — offered, but drawn on a bare forest floor** | `foundation-piling` | the *method* is the most correct thing in the whole region (60 % of Swedish piles) — but the region has **no kit at all**, so it renders as trees and rocks | this is the one to **keep and dress**: a driven-pile plot is the Nordic archetype the game is missing |

**`[I]` Net:** Nordic is currently a piling region drawn as an empty forest, and
the piling it offers is the wrong piling. Invert it.

---

## D.2 German Construction Site (Rhein-Ruhr) — `german-site`

**Archetypes:** urban plot (A1) · infrastructure corridor (A2) · HDD entry
spread (A17) · brownfield/environmental plot (A16) · urban shaft collar (a
sub-case of A1) · underground box / cavern (A6 variant — the region already has
`under` lines for it).

**What genuinely belongs.** Almost everything the region offers. `rotary-kelly`,
`cfa`, `cased-cfa`, `driven-pile`, `anchor`, `jet-grouting`, `hdd`,
`site-investigation`, `sonic`, `overburden`, `auger` are all normal Rhein-Ruhr
work. **This is the one region whose method list is essentially right.**

### The pairings to interrogate in `german-site`

| # | pairing | verdict |
|---|---|---|
| G1 | **`tunnel-jumbo`** via `civil-infrastructure` | **defensible, and already handled.** `tunnel-jumbo` is in `UNDERGROUND_METHODS` *and* in `env.js` `UNDERGROUND`, so it renders in the drive, not on the plot. The region's own `under` lines (*"a stormwater cavern under the district"*, *"a cut-and-cover box, roof already on"*) support it. **Keep.** |
| G2 | **`raise-boring`** via `civil-infrastructure` | **the method is defensible; the rendering is not.** Raise boring is genuinely a civil technique — the contractors who own the largest fleets list *"Metro, rail, flood-water, and waste infrastructure"* alongside mining `[MASTERDRILL]`, and it is *"used to access ventilation shafts required in underground metro and rail systems"* and to *"collect waste or flood water from streets directing it to an underground tunnel"* `[MASTERDRILL]`. **But it is not in `env.js` `UNDERGROUND` (defect D1), so it draws on the German surface kit.** Fix D1 and this pairing becomes one of the better ones in the game |
| G3 | **`cable-tool`** via `environmental` | **`[I]` weak but not absurd.** A shell-and-auger / cable percussion tripod is genuinely used on European ground-investigation and environmental jobs `research/06`. The image of a cable-tool *water-well spudder* on a Rhein-Ruhr plot is wrong; the image of a small percussion tripod boring a monitoring well is right. **This is a naming problem, not a placement problem** |
| G4 | **`rockbolt`** via `anchoring`/`civil-infrastructure` | **defensible** — the cut-and-cover box and the cavern both need ground support, and the region has `under` lines. **Keep.** |
| G5 | **`top-hammer`** via `anchoring`/`civil-infrastructure` | `[I]` fine — surface top-hammer crawlers do rock dowelling and drilling for demolition and cutting works in cities |

**`[I]` Net:** `german-site` is the model. Its problem is not plausibility, it is
that its `kit` is one container, one spoil heap and three rebar cages, and a
real German urban plot has thirty distinguishing objects.

---

## D.3 Iberian Quarry (Spain / Portugal) — `iberian-quarry`

**Archetypes:** quarry bench (A4) · dimension-stone quarry (A4 variant — a
different site again) · underground stone quarry (A6 variant).

**`[F]` What Iberia actually quarries.** Portugal *"produces more than a hundred
varieties of ornamental stones, distributed by the commercial granite,
limestone, marble and slate groups"*, with granite in the north and limestone
and marble in the centre `[EUROLITHOS-PT]`. Notably, at **Valongo the slate
extraction takes place underground** `[EUROLITHOS-PT]` — so the region's existing
`under` line, *"an adit driven off the quarry floor"*, is **correct and
well-founded**, which is more than can be said for its surface pairings.

`[F]` Aggregate quarrying is *"drilling inclined, vertical or horizontal
blastholes in single- or multiple-row patterns to depths ranging from a few
meters to 30 m or more, depending on the desired bench height"* `[BRITANNICA-Q]`.

**And the region is under-specified rather than wrong.** `[F]` Iberia is a
**dimension-stone** province at least as much as an aggregate one: Portugal's
Estremoz Anticline had **187 marble quarries operating simultaneously in the late
1980s** across a 27 km² concentration `[IUGS-ESTREMOZ]`; **90 % of Europe's
natural roofing slate comes from Spain** `[SPR-SLATE]`, `[WP-SLATE-ES]`;
O Porriño hosts **the world's biggest pink granite quarry at over 250 000 t of
blocks a year** `[CLUSTER-PEDRA]`; and Macael is *"one of the most important
extraction centers in Spain"* `[IUGS-MACAEL]`. `[I]` **A dimension-stone quarry
is a different photograph and a different set of methods — wire saws, jet
burners, line drilling, feathers and wedges (§A.4) — and the only *drilling* in
it is line drilling, wire-saw entry holes and splitting holes.** The game draws
one blast quarry for the whole peninsula.

### The absurd pairings in `iberian-quarry`

| # | pairing | leak channel | why it is wrong | fix |
|---|---|---|---|---|
| Q1 | **`rotary-kelly` — a large bored piling rig on a quarry bench** | `civil-infrastructure` | a quarry is a **rock extraction site**. There is nothing to found. A Kelly rig bores in soil and soft rock and needs concrete supply, a reinforcement cage laydown and a certified platform `[FPS-WP]` — a blasted bench in white dust is none of those | remove `civil-infrastructure` from `iberian-quarry`, exactly as it was removed from `north-sea` |
| Q2 | **`hdd` — a directional bore off a quarry bench** | `civil-infrastructure` | HDD needs a **long linear corridor**, an entry plot of 30 × 46 m and an exit plot with an 11–15 m pipe-stringing corridor beyond it `[research/07 §D5]`. A bench is a terrace 15–30 m wide with a highwall on one side and a drop on the other | remove |
| Q3 | **`overburden` / `anchor`** via `civil-infrastructure` | `civil-infrastructure` | `[I]` **these two are defensible and should be kept** — rock anchors and dowels into a quarry highwall, and cased drilling through blast rubble, are real quarry work. But they should arrive via `quarry-construction`, not via a civil channel that also imports piling rigs | re-route, do not delete |
| Q4 | **`tunnel-jumbo` / `longhole` / `raise-boring`** | `mining` / `civil-infrastructure` | `[I]` **defensible on the evidence** — the Valongo underground slate workings `[EUROLITHOS-PT]` make an Iberian underground stone operation real. But `raise-boring` renders on the **surface bench** because of defect **D1** | fix D1; keep the pairings |

---

## D.4 Alpine Tunnel Portal — `alpine`

**Archetypes:** tunnel portal (A9) · underground heading (A6) · slope & cutting
(A3) · mountain greenfield exploration pad (A8) · bridge/viaduct pier (A2).

**This region's name is a site, not a climate — and that is the confusion.** An
"Alpine tunnel portal" is a single 200 m × 100 m apron. It cannot simultaneously
be a copper prospect, a viaduct pier and a rock cutting, yet the region offers
methods for all four and draws one apron.

### The pairings in `alpine`

| # | pairing | verdict |
|---|---|---|
| A1 | `tunnel-jumbo`, `rockbolt`, `anchor`, `top-hammer`, `jet-grouting` | **correct, and the reason the region exists.** `[F]` a drill jumbo genuinely works *in daylight at the portal*: pipe-umbrella pre-support is installed with *"a conventional drill jumbo"* and the systems are used *"in tunnel drives, portals and re-excavation of collapsed sections"* `[SANDVIK-AT]`, `[DSI-AT]`. The portal is **the one archetype where an underground machine is legitimately outdoors** |
| A2 | `core`, `rc` via `mineral-exploration` | `[I]` **plausible as geology, wrong as a site.** Alpine mineral exploration exists, but it does not happen on a portal apron — it happens on a mountainside pad (A8). This is an archetype failure, not a method failure |
| A3 | **`rotary-kelly`, `cfa`, `cased-cfa`, `driven-pile`** via `civil-infrastructure` | **`[I]` absurd as drawn.** Alpine viaduct piers are real civil work and driven or bored piles are real for them — but the game draws *"the portal apron under a rock net"*. **A 118 t Kelly rig has never stood on a tunnel portal apron doing foundation piling.** Either give `alpine` a bridge-pier archetype, or cut the four methods |
| A4 | **`hdd`** via `civil-infrastructure` | **absurd.** `[I]` HDD is a soft-ground trenchless method; `hdd`'s own `validGround` tops out at `shale`. An Alpine valley side is rock. And there is no corridor on a portal apron |
| A5 | `raise-boring` via `tunnelling` | **correct method** (hydropower and metro raises `[MASTERDRILL]`) **rendered on the surface** — defect D1 |
| A6 | `auger`, `sonic` via `site-investigation` | `[I]` fine — pre-construction GI in the valley floor |

---

## D.5 Saharan Water Field — `sahara`

**Archetypes:** desert well pad (A13) · village/agricultural borehole (A14) ·
desert camp (dressing, not an archetype).

**What belongs.** `oil-rotary` (weighted 4), `cable-tool`, `overburden`, `auger`,
`site-investigation`, `sonic` — the region's `applicationWeights` already push
the board toward water wells and oil, which is right.

### The absurd pairings in `sahara`

| # | pairing | leak channel | why it is wrong | fix |
|---|---|---|---|---|
| S1 | **`cased-cfa` — double-rotary cased continuous flight auger piling in a dune field** | `environmental` | cased CFA is a **dense-urban and contaminated-ground piling technique**: a counter-rotating casing over a CFA auger, needing continuous concrete supply from a truck or pump `research/05` §A7. The region's own description says *"Everything is trucked in, including the water you drill with"* — a site 200 km from the road head cannot run a concrete supply chain. There is also **nothing to found**: the region's applications are water, oil, GI and environmental | remove `environmental` from `sahara`, or remove `cased-cfa` from the environmental set |
| S2 | **`hdd`** | `environmental` | `[I]` HDD is genuinely an **obstacle-crossing** method — `[F]` *"a preferred crossing method… for the installation of oil and gas pipelines as well as other utilities under watercourses, roads, rail lines, steep slopes, and other obstacles"* `[TECHTOOL]` — so a desert pipeline crossing is real. But *for environmental remediation in a water field* it is not, and the game has no corridor to draw. **Weak; cut it unless a corridor archetype is added** | remove or re-route via a pipeline application |
| S3 | `auger` via `environmental` | `[I]` marginal — a hollow-stem auger in running dune sand is a hole that closes behind you. `overburden` (cased) is the honest method here | leave, low priority |
| S4 | **what the region is missing** | — | `[F]` the water-well half of `sahara` is now well sourced (§A.14) and is almost entirely absent from the game: **geophysical siting with a survey crew before the rig arrives** `[CARRUTHERS]`, `[ALLE]`; the **method chosen on the day by a supervising hydrogeologist** `[HELP-BOQ]`; the **0.5 m³/h handpump acceptance criterion** `[TGS-REPORT]`; and the fact that the deliverable is a **concrete apron, a drainage channel, a soakpit and an animal trough** with a village standing around it `[HELP-BOQ]`. **`[I]` Every one of those is a better contract-scoring axis than metres drilled** | add as content, not as a fix |

---

## D.6 North Sea Platform — `north-sea`

**Archetypes:** fixed platform deck (A10) · mobile offshore unit (A11) ·
offshore geotechnical spread (A12).

**This is the worst region in the game, and it is the one the owner named.**
The region's `rigType` is `'Platform rig'`; `research/01` §C.1.5 already
describes exactly what that is; and the region offers **`auger` and
`cable-tool`**.

### The absurd pairings in `north-sea`

| # | pairing | leak channel | why it is wrong | fix |
|---|---|---|---|---|
| **NS1** | **`cable-tool` — a percussion spudder on a production platform** | `site-investigation` | see §B.2 for the six-reason answer. In one line: **no pressure control on a deck whose whole drilling package is built around a surface BOP** `[OGP-TECH]`, a method that *"does not use any circulation fluids"* `[FRTR]`, a practical depth of *"approximately 100 feet or less"* `[WELLOWNER]` against wells that step out over 10 km `[WP-DIRECTIONAL]`, and **Zone 1 DSEAR/ATEX certification that no water-well spudder has or could have** `[HSE-ZONE]`, `[HSEBLOG]`. **This is the single most laughable thing the game can generate** | delete `site-investigation` from `north-sea`, or hard-exclude both methods |
| **NS2** | **`auger` — a hollow-stem soil auger on a production platform** | `site-investigation` | **there is no soil at the machine**, and that alone finishes it. `[F]` The method is capped at *"200 to 300 ft (60 to 90 m)"* and *"cannot penetrate cobbles, boulders, and most rock formations"* `[FHWA-DRILL]`. Offshore, its *function* is done by a **seabed CPT frame** or a **vibrocorer** `[CMS-CPT]`, `[DATEM]`, `[GARD-VC]`, and the top-hole of a real well is a **driven conductor** `[EP0147144]` | as above |
| NS3 | `sonic` via `site-investigation` | `[I]` **least wrong of the three but still wrong on a platform.** Offshore geotechnical work is a **vessel, liftboat or seabed spread** with heave compensation of 4–6 m `[GQM-FLEET]` — a real and now well-sourced archetype (§A.12), and not this one | move to the offshore-geotechnical archetype; do not leave it on the deck |
| NS4 | `site-investigation` (the method) on a platform | `[I]` the *application* is legitimate for the region — the seabed GI that precedes a platform is real. The problem is that the region draws **one** site, so the GI job is drawn on the production deck | this is exactly the archetype split A10 / A11 / A12 solves |

**`[I]` The region needs three sites, not one.** A production platform, a mobile
unit, and a geotechnical spread are three different photographs, and the game
currently has one, with a moonpool drawn on the platform (defect **D3**).

---

## D.7 Andean Copper Mine — `andes`

**Archetypes:** open-pit bench (A5) · underground drive (A6) · underground
exploration cuddy (A7) · greenfield mountain pad (A8) · mine lease road/portal.

**What belongs.** `top-hammer`, `dth`, `rc`, `core`, `rockbolt`, `longhole`,
`tunnel-jumbo`, `raise-boring`, `anchor` — this is a **strong** list. Andes is
the second-best region in the game after `german-site`.

### The pairings to interrogate in `andes`

| # | pairing | verdict |
|---|---|---|
| AN1 | **`jet-grouting`** via `tunnelling` | **`[I]` the weakest pairing here.** Jet grouting in tunnelling is a **soft-ground** pre-support technique — you jet-grout because you cannot stand the face up in soil. The Andes region's ground is a copper porphyry column. `jet-grouting`'s own `validGround` is `clay, silt, sand, gravel, till, marl` — none of which is a copper mine's rock mass. It is reachable only because the region carries `tunnelling` | remove |
| AN2 | `overburden` via `anchoring` | `[I]` fine — cased drilling through scree and blast rubble for anchors is normal |
| AN3 | `raise-boring` | **correct method** (the archetypal mine ventilation raise `[MASTERDRILL]`, `[WP-RAISE]`) **rendered on the surface bench** — defect D1. `[F]` the machine *"is set up on the upper level of the two levels to be connected, on an evenly laid platform (typically a concrete pad)"* `[WP-RAISE]`. It is an inter-level machine, and drawing it on a pit bench is a category error |
| AN4 | `sonic` via `mineral-exploration` | `[I]` marginal — sonic is used in exploration for unconsolidated cover and tailings, not for porphyry rock. Low priority |

---

## D.8 Arctic Permafrost — `arctic`

**Archetypes:** permafrost / winter pad (A15) · greenfield exploration pad in
snow (A8 variant) · ice road (dressing).

**What belongs.** `core`, `rc`, `sonic`, `site-investigation`, `overburden`,
`dth` — this is a **defensible** list. Arctic is the third-best region.

### The pairings to interrogate in `arctic`

| # | pairing | verdict |
|---|---|---|
| AR1 | `anchor` via `foundation-piling` | `[I]` **defensible.** Foundations in permafrost are a real and specialised discipline. But the game will draw a micropile rig where an Arctic pile crew belongs, and `NOT SOURCED` — I have no citation for permafrost pile practice; do not implement a specific technique. What **is** sourced is why it is hard: thawed permafrost has **no load-bearing capacity**, which is the whole reason pads are built 5 ft thick `[OTA-NORTHSLOPE]` |
| AR2 | `dth` via `geothermal` | `[I]` fine — the region's column has basalt and gneiss under the permafrost |
| AR3 | `overburden` via `environmental`/`foundation-piling` | `[I]` fine, and arguably the most correct method in the region: cased drilling is what gets you through frozen, thaw-unstable ground |
| AR4 | the **kit** | `arctic` and `alpine` share one kit builder and differ only by the shelter's paint colour. An Arctic pad and an Alpine portal apron are not the same photograph. `[F]` The Arctic pad is a **built object** — 5 ft of gravel, or an ice pad, or foam and timber mats — and *"all drilling rigs and production facilities where people work must be enclosed, insulated, and heated"* `[OTA-NORTHSLOPE]`. **The rig is a box.** |
| AR5 | **the missing mechanic** | `[F]` the region has no season gate, and the real one is superb: off-road travel opens only when **soil temperature at 12 inches reaches 23 °F with 6 inches of snow (coastal) or 9 inches (foothills)**, opening dates have ranged from **2 November to 27 January** and in recent years the foothills have not consistently opened at all, and at closure operators get **72 hours to move everything off the tundra** `[AK-DNR-TUNDRA]`. **`[I]` That is a deadline mechanic the game could implement literally.** |
| AR6 | **the missing hazard** | `[F]` warm drilling mud in the wellbore **thaws permafrost and causes severe wellhead settling** `[ATE-PERMAFROST]`. `[I]` Your own circulating fluid destroying the ground your rig stands on is a better Arctic hazard than any of the region's current five |

---

## D.9 The region↔archetype table, as it should be

| region | archetypes it should be able to draw | archetypes it must NEVER draw |
|---|---|---|
| `nordic` | greenfield pad · rural water-well plot · quarry bench · roadside cutting · driven-pile plot · GI plot | urban plot · offshore anything · desert pad · underground heading *(unless a Nordic mine is added)* |
| `german-site` | urban plot · infrastructure corridor · HDD spread · brownfield plot · shaft collar · cut-and-cover box / cavern | quarry bench · open-pit bench · greenfield pad · offshore · desert · permafrost |
| `iberian-quarry` | quarry bench · dimension-stone quarry · underground stone workings | urban plot · piling plot · HDD corridor · offshore |
| `alpine` | tunnel portal · underground heading · slope & cutting · mountain exploration pad · *(bridge pier, if added)* | urban plot · quarry bench · offshore · desert · **piling plot on the portal apron** |
| `sahara` | desert well pad · village borehole plot | urban plot · piling plot · quarry · underground · offshore |
| `north-sea` | fixed platform deck · mobile offshore unit · offshore geotechnical spread | **every land archetype without exception** |
| `andes` | open-pit bench · underground drive · underground exploration cuddy · mountain pad | urban plot · piling plot · offshore · **jet-grouting anywhere** |
| `arctic` | permafrost pad · snow-covered exploration pad | urban plot · quarry bench · offshore · underground *(no underground archetype exists here)* |
---

# E. THE TEN WORST REALISM ERRORS CURRENTLY POSSIBLE, RANKED

Ranked by *how quickly a real driller would laugh*, not by how hard they are to
fix. Each is verified against the tree on 2026-09-04. The correction is stated
in the form the code can take.

---

### 1. A cable-tool spudder and a hollow-stem auger on a North Sea production platform

**Reachable now.** `methodsForRegion('north-sea')` returns
`auger, cable-tool, site-investigation, oil-rotary, sonic`. Both land methods
arrive through the `site-investigation` application, which `north-sea` carries at
weight 1.

**Why it is the worst.** It is the one the owner named — *"offshore rigs are as
you understand on the sea"* — and it fails on six independent grounds at once
(§B.2). The two that need no drilling knowledge to see: `[F]` a cable-tool hole
*"does not use any circulation fluids"* `[FRTR]` and tops out at *"approximately
100 feet or less"* `[WELLOWNER]`, on a deck whose entire drilling package exists
to contain reservoir pressure through a **surface BOP stack** `[OGP-TECH]` and
whose wells step out *"over 10 km"* horizontally `[WP-DIRECTIONAL]`. And the one
that finishes the argument regardless of drilling: `[F]` the drill floor is a
**Zone 1** hazardous area where *"Zone 1 and Zone 2 specifications drive
enclosure type, cable glanding, and motor rating for **every component** within
the hazardous envelope"* `[HSE-ZONE]`, `[HSEBLOG]`. **An open-deck diesel
spudder cannot be certified for it.** The auger fails on a simpler point still:
there is no soil at the machine.

**Correction.** Remove `site-investigation` from `north-sea.applications`, or —
better, because the *application* is legitimate for the basin — add an explicit
per-region method blocklist and put `auger`, `cable-tool` and `sonic` in it.
Offshore geotechnical work then wants its own archetype (**A12**) rather than
the production deck. `data.js` has already done exactly this once, deleting
`civil-infrastructure` from `north-sea` with the note *"There is no highway on a
platform."* Finish the job.

---

### 2. A raise borer standing on a quarry bench, a portal apron, or a German urban plot

**Reachable now, and it is a two-file divergence, not a design choice.**
`data.js` `UNDERGROUND_METHODS` lists **four** methods; `core/env.js`
`UNDERGROUND` defines **three**. The string `raise-boring` does not appear in
`env.js`. `terrain.js` does `ugSpec = UNDERGROUND[methodId] || null` and falls
through to the surface kit.

**Why.** `[F]` The machine *"is set up on the upper level of the two levels to be
connected, on an evenly laid platform (typically a concrete pad)"* and reams a
head **up** to itself from the level below, the cuttings *"falling to the floor
of the lower level"* to be mucked out by a loader `[WP-RAISE]`, `[SANDVIK-RB]`.
**It is defined by having an opening underneath it.**

**And a correction to the brief, which makes the fix easier, not harder.** `[F]`
Raise boring genuinely *is* done **from the surface down to an underground
level** — *"from the lower level to either the surface or another underground
level"* `[FK-RAISE]`; *"drilling a pilot hole from the surface down to the target
elevation… requires the mine to be developed under the shaft location"*
`[MILLER-RB]`; *"most commonly utilized for the development of shafts from the
surface to underground"* `[DEVICO-RB]`. **The invariant is the opening below, not
the darkness above.**

**Correction.** Two acceptable fixes, and both are small:
- add a `raise-boring` entry to `env.js` `UNDERGROUND` — an upper-level chamber
  with a collar in the floor; **or**
- model the legitimate surface case honestly as a **shaft collar**: `[F]` a
  **flat concrete foundation with the machine's base plate secured by rock
  bolts** `[TUST-RB]`, a stack of fat 1.5 m rods, two skid power packs, and a
  fenced circular opening. Civil applications make this real — metro, rail,
  flood-water and hydro shafts `[MASTERDRILL]`, `[IWP-RAISE]`.

What must stop is the machine appearing on a bench in white dust with no opening
beneath it.

---

### 3. Double-rotary cased CFA piling and HDD in a Saharan water field

**Reachable now** via the `environmental` application, which seven methods carry
and which `sahara` also carries.

**Why.** Cased CFA exists for **dense urban and contaminated ground** and needs
a continuous concrete supply (§B.10). The region's own description says
*"Everything is trucked in, including the water you drill with."* There is
nothing to found in a water field. HDD needs a linear corridor and a 30 × 46 m
entry plot with a pipe-stringing corridor beyond the exit `research/07` §D5.

**Correction.** Remove `environmental` from `sahara.applications` — the region's
own `applicationWeights` already give it 1 against oil-gas 4 and water-well 3, so
it is contributing almost nothing but this error. Alternatively drop `cased-cfa`
and `hdd` from the `environmental` set.

---

### 4. A 100 t-class rotary Kelly piling rig and CFA in a Nordic forest

**Reachable now** via `foundation-piling`.

**Why.** `[F]` The Swedish Pile Commission's own statistics, in `[AXELSSON]`:
driven pre-cast concrete **60 %**, driven steel pipe **23 %**, drilled steel pipe
**13 %**, timber **4 %**, steel core **< 1 %** — and CFA appears only under
*"other pile types occasionally used."* The abstract: *"More than 95 % of the
piles installed in Sweden are made up of driven displacement piles or drilled
end-bearing piles to hard till or into hard crystalline rock."* The geology is
the reason: **75 %** of Swedish bedrock is under dense till, **10 %** has no soil
at all, and *"It is not uncommon to encounter larger boulders in moraine."*
A continuous flight auger cannot pass a boulder, and `cfa.validGround` correctly
does not list `boulder`.

**Correction.** Drop `rotary-kelly`, `cfa`, `cased-cfa` and `jet-grouting` from
`nordic`. **Keep `driven-pile` and dress it** — it is the single most correct
method-region pairing in the game and it currently renders on bare forest floor
because `nordic` has no `kit` at all.

---

### 5. An underground rock bolter on a forestry track — with a surface site line to match

**Reachable now** via `anchoring`, and it carries defect **D2**: `SITE_LINES`
has no `under` entry for `nordic`, and the selector falls back to
`siteLines.surface`, so the contract card says *"a forestry track an hour from
the nearest town"* while the engine renders a drive.

**Why.** `[F]` `research/03` §C: underground machines are *"low, wide and
articulated because the tunnel is low, wide and has corners"*; a low-profile
drive can be **2 m**. Nothing about that machine belongs in daylight.

**The nuance that must survive the fix.** `[F]` Rock bolting *itself* is
genuinely surface work too — *"Highway and railway rock cuts"*, *"Rockfall
remediation in steep terrain"*, done with *"track-mounted drill rigs"* and
*"rope-access drilling platforms"* `[ROCKSUP]`. **So do not write "rock bolts are
underground only." Write "the underground bolter is underground only," and let
the surface case be the `anchor` method on a slope archetype.**

**Correction.** Remove `rockbolt` from `nordic` (or give `nordic` a genuine
underground archetype — a Fennoscandian hard-rock mine is entirely real — plus
an `under` site line). Separately, remove `anchor` from the `bolter` rig's method
list (defect **D4**).

---

### 6. The offshore kit draws a moon-pool surround on a fixed platform

**Shipping now.** `terrain.js` `kit === 'offshore'` builds *"moon-pool
surround"* geometry, while `data.js` sets the region's `rigType` to
`'Platform rig'`.

**Why.** A moonpool is an opening through a **hull** — drillship,
semi-submersible, monohull geotechnical unit. A fixed platform drills through
**well slots / well bays** in a **conductor guide framework** carried on the
jacket `[US4561802]`, `[USPTO-5379844]`: *"At the surface, each well in the
template will contain a well bay or slot, and from there extending down
vertically aligned subsea guides will be placed at various depths."*

`[F]` And the second half of the same error: **a platform rig skids, it does not
cantilever.** Multi-well platforms carry *"10 to more than 40"* wells at spacing
*"as close as 1.8 to 3.0 metres between well centres"*, and the drill floor is
*"skidded from well to well"* in **two perpendicular directions** over skid beams
`[OGP-OFFS]`, `[DM-PLATFORM]`. The cantilever belongs to the jack-up
`[US6171027]`.

**Why it matters more than it looks.** This is the *only* piece of
offshore-specific geometry in the whole game, and it names the wrong feature.
`research/01` §C.1.8 already gives the correct cheat sheet and is not used.

**Correction.** Replace the moonpool ring with a **well-slot deck opening** and
a **row of slots on a 1.8–3.0 m grid**: a rectangular opening in the drill floor,
a conductor stub with a casing head, skid beams under the floor, and Christmas
trees on the wellhead deck below — because the defining fact about a platform is
that it drills **many wells from one point** `research/01` §C.1.5,
`[USPTO-5379844]`, `[WP-WELLBAY]`.

---

### 7. A large bored piling rig, HDD and driven piling on a quarry bench and a tunnel portal apron

**Reachable now** via `civil-infrastructure`, which nine methods carry and which
`iberian-quarry` and `alpine` both carry.

**Why.** A quarry bench is a rock-extraction terrace: nothing to found, no
concrete plant, no muck-away route, no certified working platform `[FPS-WP]`,
`[BR470]`, and no corridor for HDD. A tunnel portal apron is a working and
haulage area for the heading.

**Correction.** `civil-infrastructure` is the single most promiscuous
application in the game and should not be carried by a region that is a *site*.
Remove it from `iberian-quarry`. For `alpine`, either remove it or add a
**bridge/viaduct pier** archetype and let it draw that instead of the portal
apron — Alpine viaduct piling is entirely real; what is not real is doing it on
the portal apron.

---

### 8. Jet grouting inside an Andean copper mine

**Reachable now** via `tunnelling`.

**Why.** Jet grouting cuts and mixes **soil** with a high-pressure fluid jet;
it exists to create ground where you cannot excavate, and it is governed by
**EN 12716** `research/05` §A12. Its own `validGround` is
`clay, silt, sand, gravel, till, marl` — not one of which is a porphyry copper
rock mass. It also requires a batching plant and a slurry-return disposal route
that a production level does not have.

**Correction.** Remove `jet-grouting` from `andes`, or restrict the method to
`soil-stabilisation` + `foundation-piling` + soft-ground tunnelling only.

---

### 9. Eight regions, eight climates, one site each — no per-application variation at all

**Shipping now.** `terrain.js` selects the entire surface dressing from
`region.kit`. There is no application input and no method input beyond the binary
surface/underground switch. The consequence is structural rather than local: a
Kelly piling job, a water well and a geotechnical investigation in `nordic` are
**the same photograph**, and the photograph contains no kit at all.

**Why it matters.** This is the mechanism behind errors 1, 3, 4 and 7. Fixing
the application lists narrows *which* jobs appear; it does not make a piling job
look like a piling site.

**Correction.** Introduce an **archetype** as a first-class field, resolved from
`(method, application, region)` rather than from region alone, and hang the kit
off it. §A of this file defines seventeen; a first pass needs about eight:
urban plot · corridor · slope · quarry/pit bench · greenfield pad · portal ·
platform deck · desert pad. `research/04` §E3 already proves the format works —
it is exactly how the underground heading was specified and built.

---

### 10. Two rig classes offering a method their machine cannot perform

**Shipping now**, in `data.js` `RIGS`:

- **`bolter`** — an articulated underground rock bolter, described in its own
  copy with an eight-bolt carousel, a resin cartridge magazine and a **mesh
  handler** — also offers **`anchor`**, a surface slope and retaining-wall
  method. A player can take an underground bolter to a Nordic anchoring job.
- **`crawler-th`** — described in its own copy as a *"Surface top-hammer crawler
  with a carousel rod handler and an on-board 8 m³/min screw"* — also offers
  **`jet-grouting`**, which needs a high-pressure grout pump and a multi-tube
  monitor string, not a screw compressor `research/05` §A12, `research/13` §3.

**Why it matters.** The owner's instruction is about **machines**, and this is
the machine-level version of the same error: the archetype fix will not catch it,
because the rig list is a separate table.

**Correction.** Remove `anchor` from `bolter` and `jet-grouting` from
`crawler-th`. If the player needs an anchor machine, the game already has three
(`crawler-lite`, `crawler-th`, `si-rig`, `core-rig`); if it needs a jet-grouting
machine, that is a **missing rig**, and adding one is the honest answer.

---

## E.1 The order to act in

`[I]` My recommendation, weighing effort against how visible the error is:

| order | action | effort |
|---|---|---|
| 1 | **D1** — add `raise-boring` to `env.js` `UNDERGROUND`, or block it from surface kits | one table entry |
| 2 | **D2** — add an `under` line set for every region that can produce an underground method, or block those methods | one table entry |
| 3 | Strip the four leak channels: `site-investigation` from `north-sea`, `environmental` from `sahara`, `civil-infrastructure` from `iberian-quarry`, `foundation-piling`+`anchoring` overreach in `nordic` | data-only, one file |
| 4 | **D4** — two rows in `RIGS` | trivial |
| 5 | **D3** — well slots instead of a moonpool in the offshore kit | small geometry change |
| 6 | Add a per-region method blocklist, so the exclusion matrix in §B.22 is expressible directly rather than through application strings | small code change, large payoff |
| 7 | Introduce the archetype field and split the kits | the real work |
---

# F. `NOT SOURCED` — the honest list

`PLATFORM_TRUTH.md` Part C rule 6: *"If in doubt, delete it."* Rule 7: a number
must never outrun its source. The following are things this file deliberately
does **not** assert, listed so that nobody implements them from the surrounding
prose by accident.

| subject | status | what would close it |
|---|---|---|
| **Offshore geotechnical spreads (A12)** | **now sourced** — see §A.12. Four vessel/frame classes with real dimensions, heave-compensation strokes and named campaigns | — |
| **Pipe-deck / drill-pipe storage arrangements on a fixed platform** | `NOT SOURCED` — no direct citation obtained | a platform topsides layout drawing or operator technical page |
| **Location of well slots inside a concrete gravity-base structure's legs** | `NOT SOURCED` — the only source found was a blog, and the primary encyclopaedia entry does not confirm it | operator technical documentation |
| **ROV-deployed geotechnical CPT units as an established class** | `NOT SOURCED`. **Do not model a flying ROV pushing a cone** | — |
| **Boskalis, Van Oord, Seaway7 or Kongsberg as operators of geotechnical SI spreads** | `NOT SOURCED`. They appear as *installation* contractors, which is a different trade | — |
| **Active vs passive heave compensation on any named geotechnical rig** | `NOT SOURCED` — vendor pages give the **stroke**, not the type. Print the stroke, not the type |
| **DTH or cluster drills on offshore wind foundations** | `NOT SOURCED` | — |
| **Any explicit statement that "augers and spudders are never used offshore"** | `NOT SOURCED` **as a quotation** — and it never will be, because nobody writes down that a thing is not done. The conclusion in §B.1 and §B.2 is built from sourced physics (no soil, no circulation, depth caps, Zone 1 certification, crane limits) plus the total absence of these methods from every offshore contractor toolset read in this pass. **`[I]` Stated as inference, not as a quote** | — |
| **Drill-pad dimensions, sump siting and rehabilitation standards (A8)** | **now sourced — this closes `research/02` §E6's own `UNVERIFIED` flag.** Pads **20–40 m** ground-supported / **40–50 m** heli `[ONTARIO-BMP]`, capped at **900 m²** with a 100 m water buffer `[MB-BMP11]`; **≥3 m clearance around the equipment** `[BLY-PAD]`; sump ramped, guarded and reachable by a vac truck `[BLY-PAD]`; **30-day decommissioning, casing cut to ≤15 cm, native species only** `[MB-BMP16]` | — |
| **Underground cuddy dimensions (A7)** | **now sourced**: **up to 6 m high × 7 m deep, ~7 holes per cuddy, off a 5 × 5 m drive, every ~100 m** `[VERTEX]`, `[K92]` | — |
| **How the underground core rig is actually anchored** | `NOT SOURCED` **as a written statement.** The named parts are real — a **"foot clamp"** module `[BLY-UG]`, a **"column"** option `[EPIROC-DIAMEC232]`, and a **built work deck** `[CORING-UG]` — but no source spells out the arrangement in words. Draw it; do not assert it |
| **Litres per minute of drilling water by core size** | `NOT SOURCED` | a drilling contractor's fluid schedule |
| **A defensible charged-hole count for a mid-size tunnel round** | `NOT SOURCED`. Round length, hole and reamer diameters, contour spacing and charge reductions **are** sourced `[NFF26]` | a published blast design for a stated cross-section |
| **Traffic-management numeric values** (safety zone lengths, taper rates, cone spacing) | `NOT SOURCED` — the standard is `[TSM8]` and the figures were not extracted | the manual itself |
| **Numeric rail overhead-line clearances** | `NOT SOURCED` — the rail standards are paywalled. `[GS6]`'s power-line zones are a **generic analogue only and must not be printed as a rail figure** | the rail standards |
| **Spoil volume per bored pile, and bulking factors** | `NOT SOURCED` as an industry figure. It is straightforward arithmetic from a sourced diameter and depth, but **present it as arithmetic, not as a published number** | a contractor's waste estimate |
| **Whether bentonite is currently classified as hazardous waste** | **a genuine source contradiction**: the piling federation's guidance says non-hazardous `[FPS-BENT]`; trade press has said hazardous. `NOT SOURCED` which is current — **do not state either** | the current environmental regulator's classification |
| **Quarry bench width, and any numeric face-height or berm-width limit** | `NOT SOURCED` — **and now for a reason.** `[F]` The UK Quarries Regulations and ACOP contain **no numeric limit**: the operator's own excavations-and-tips rules must state *"the maximum vertical face height which may be created or left at the end of a working period"* `[HSE-L118]`. **The figure does not exist as a rule. Do not print one** — but a game could very reasonably let the *contract* state it, which is exactly how the real thing works |
| **Blasthole inclination (the 10–20° rule) and its justification** | `NOT SOURCED`. Burden, spacing, stemming, subdrill and timing **are** sourced `[OSMRE-BLAST]`; inclination is not | a blast-design text |
| **Sonic drilling depth limits and cost per metre; the heat/plastic-liner concern for volatiles** | `NOT SOURCED` | ASTM D6914 full text, or a contractor method statement |
| **Numeric monitoring-well construction details** (filter pack thickness above screen, seal thickness, slot sizes, stickup vs flush) | `NOT SOURCED` — the governing guidance `[EPA-SESD]` was not readable in this pass | the guidance document itself |
| **Ground-source borehole standards' numeric requirements** (grout conductivity, minimum spacing) and Swedish `Normbrunn-16` requirements | `NOT SOURCED` — both documents were unreadable in this pass. The **80–300 m depth band and 3–5 kW per 80–100 m borehole are** sourced `[KENSA]` | the standards themselves |
| **Microtunnelling, pipe jacking, auger boring and pipe ramming** at site level | `NOT SOURCED`. Note `DOMAIN.md` §1 already records that none of these exist as game methods | — |
| **The walkover-locator depth crossover** (where you must switch to wireline or gyro steering) | `NOT SOURCED` | an HDD steering manual |
| **Well spacing rules in an agricultural or municipal well field** | `NOT SOURCED` | a groundwater development guide |
| **Underground cuddy dimensions (A7)** | `NOT SOURCED` | an underground diamond drilling procedure or a mine standard drawing |
| **Vibration and noise limits for driven piling near buildings** | `NOT SOURCED`. DIN 4150-3 and BS 5228-2 are the right standards to name, but I did not read them and **no limit value may be printed** | the standards themselves |
| **Village / smallholding borehole practice (A14)** | **now sourced** — see §A.14. A real completion report and a real tender bill of quantities | — |
| **Permafrost pad construction, ice roads, seasonal windows, thermosyphons (A15)** | **now sourced** — see §A.15. Regulator, government-agency and operator sources, with numbers | — |
| **Mineral exploration drilling on permafrost specifically** | `NOT SOURCED`. The `arctic` region offers `core` and `rc` under `mineral-exploration` and that is plausible, but this pass found no primary description | Arctic exploration contractor or regulator material |
| **Ice-core drilling depths, drill types and camp detail** | `NOT SOURCED`. A separate discipline from permafrost drilling and not modelled by the game | ice-drilling programme documentation |
| **Permafrost pile and foundation practice** | `NOT SOURCED`. §D.8 AR1 says so explicitly | Arctic foundation engineering literature |
| **Urban site welfare and furniture detail (A1)** | partly `NOT SOURCED`. The **working platform** requirement is fully sourced `[FPS-WP]`, `[BR470]`; hoarding, wheel wash, cabin arrangement and muck-away logistics are ordinary-practice inference | contractor method statements or a site setup guide |
| **Infrastructure corridor furniture (A2)** | `NOT SOURCED` in detail | a highways or rail temporary-works guide |
| **Andean copper mine specifics** | `NOT SOURCED`. The `andes` analysis in §D.7 rests on method logic (`validGround`, machine class), not on regional evidence. **The pairing verdicts stand on the method reasoning; do not add regional colour without a source** | Chilean/Peruvian operator technical pages |
| **Tender-assisted 20–2 000 m depth band** | single-source, already flagged as such by `research/01` §C.1.6 and its own audit table |
| **Cerchar abrasivity, anywhere** | `PLATFORM_TRUTH.md` Part C rule 7 and `research/08` §4 — unsourced throughout, and must never surface as a CAI value. Repeated here because a quarry or bench archetype is exactly where somebody would be tempted |

## F.1 Where I disagreed with the brief, and why

Three places, stated openly so they can be overruled:

1. **"Underground machines never appear on the surface."** `[F]` **Not quite
   true, and the exception is important.** A drill jumbo works in daylight at a
   **tunnel portal** — pipe-umbrella pre-support is installed with *"a
   conventional drill jumbo"* and the systems serve *"tunnel drives, portals and
   re-excavation of collapsed sections"* `[SANDVIK-AT]`, `[DSI-AT]`. The correct
   rule is: **the underground machine appears on the surface only at a portal, and
   nowhere else.**

2. **"Rock bolting is underground."** `[F]` The *machine* is. The *technique* is
   not: *"Highway and railway rock cuts"* and *"Rockfall remediation in steep
   terrain"* are surface rock-bolting work, done with *"track-mounted drill
   rigs"*, *"rope-access drilling platforms"* and hand-held pneumatic drills
   `[ROCKSUP]`. The game already has the right id for it — `anchor` — and should
   use it, keeping `rockbolt` for the underground bolter.

3. **"Raise boring is an underground machine."** `[F]` **Not quite.** It is an
   *upper-level* machine, and the upper level is routinely **the surface**:
   *"from the lower level to either the surface or another underground level"*
   `[FK-RAISE]`; *"a pilot hole from the surface down to the target elevation"*
   `[MILLER-RB]`; *"most commonly utilized for the development of shafts from
   the surface to underground"* `[DEVICO-RB]`. The invariant is **an opening
   below it**, not darkness above it.

**And one place where I set out to disagree with the brief and the evidence
changed my mind.**

4. **"Prospecting for gold will be in a mine."** I expected to argue that
   greenfield is the truer picture of *prospecting*. **The data says the owner is
   right.** `[F]` Minesite exploration reached a **record-high 45 %** of all
   exploration budgets in 2025 while grassroots fell to a **record-low 21 %**,
   and gold took **50 % ($6.2 bn)** of a $12.40 bn global budget `[MV-SP25]`;
   in 2024, minesite was *"the only stage that saw growth… with gold and copper
   being the primary drivers"* `[MINING-SP24]`. See §C for the full argument and
   the recommendation.

---

# G. Sources

**New in this file**

| key | URL / reference |
|---|---|
| `[AXELSSON]` | Gary Axelsson, ELU Konsult, *Design of piles — Swedish practice*, ISSMGE ETC3 International Symposium on Design of Piles in Europe, Leuven, 28–29 April 2016 — https://www.palkommissionen.org/uploads/userfiles/files/SWE%20National%20Report-corrected%20eng_FINAL-rev20160601_3.pdf — abstract, §1.1, §1.2, §3.1 (Swedish Pile Commission statistics 2014) |
| `[FPS-WP]` | Federation of Piling Specialists, *Working Platforms* — https://www.fps.org.uk/health-and-safety/working-platforms/ |
| `[BR470]` | BRE **BR470**, *Working Platforms for Tracked Plant* — cited via `[FPS-WP]` and `research/05` §B2/§C. **Not read directly in this pass** |
| `[ROCKSUP]` | Rock Supremacy, *Rock Bolting — Slope & Tunnel Reinforcement* — https://rocksupremacy.com/techniques/rock-bolting (rock bolt vs soil nail; surface equipment classes; rope access) |
| `[FORKERS]` | Forkers, *Soil Nailing, Anchoring & Slope Stabilisation* — https://www.forkers.com/ground-engineering/soil-nailing-anchoring-slope-stabilisation/ (anchor/micropile machine classes actually deployed) |
| `[WP-RAISE]` | Wikipedia, *Raise borer* — https://en.wikipedia.org/wiki/Raise_borer (upper-level concrete pad setup; 230–445 mm pilot; boxhole borer inverse) |
| `[MASTERDRILL]` | Master Drilling Group, *Raise Boring* — https://masterdrilling.com/raise-boring/ (mining / civil / energy applications; metro, rail, flood-water; gravity cuttings removal) |
| `[SANDVIK-AT]` | Sandvik, *AT — Pipe Umbrella Kit* — https://www.rocktechnology.sandvik/en/products/equipment/underground-drill-rigs/at-pipe-umbrella-system/ (pipe umbrellas in tunnel drives **and portals**; installed with a conventional drill jumbo) |
| `[DSI-AT]` | DSI Underground, *AT Pipe Umbrella System* — https://www.dsiunderground.com.au/products/tunneling/pre-support/at-pipe-umbrella-system/at-pipe-umbrella-system |
| `[SINOROCK]` | *Tunnel Pre-Support Methods: Techniques, Applications, and Comparisons* — https://www.sinorockco.com/news/industry-news/tunnel-pre-support-methods-techniques-applications-and-comparisons.html (pipe roofing suitable for tunnel portals and shallow tunnels) |
| `[SIMEM]` | Simem Underground Solutions, *Shotcrete for Tunneling* / *Mixing & Batching Plants* — https://simemug.com/tunneling/shotcrete-for-tunneling · https://simemug.com/systems |
| `[TT-MIX]` | *Tunnels and Tunnelling*, *In the mix on site* — https://www.tunnelsandtunnelling.com/analysis/in-the-mix-on-site/ (on-site batching plants at the surface working site) |
| `[ROCKZONE]` | *Top Equipment Used in Tunnel Construction and How It Works* — https://rockzoneamericas.com/posts/top-equipment-used-in-tunnel-construction-and-how-it-works (ventilation, muck haulage) |
| `[NIAGARA]` | *Niagara Tunnel Project — Technical Facts* — http://www.niagarafrontier.com/tunneltechnical.html (continuous conveyor muck haulage) |
| `[BRITANNICA-Q]` | *Quarry — Rock Extraction, Blasting & Crushing*, Britannica — https://www.britannica.com/technology/quarry-mining (blasthole patterns; bench height "a few meters to 30 m or more") |
| `[EUROLITHOS-PT]` | EuroLithos Atlas, *Ornamental stone resources in Portugal* — https://repository.europe-geology.eu/egdidocs/eurolithos/eurolithos+atlas+portugal.pdf (granite/limestone/marble/slate distribution; **Valongo slate extracted underground**) |
| `[OSNET]` | *State-of-the-art: Ornamental Stone Quarrying in Europe* — https://static.ngu.no/filearchive/91/OSNET3.pdf |
| `[DINOSAW]` | *Stone Quarrying Machines: Wire Saws, Chainsaws & Block Cutters* — https://www.dinosawmachine.com/Products/mining-and-quarry-machine (dimension-stone machine family; cited for the existence of the family, not for any capability claim) |
| `[US4561802]` | US Patent 4,561,802, *Assembly of conductor guides for offshore drilling platform* — https://patents.google.com/patent/US4561802A/en (conductors driven through guides connected to the jacket and deck) |
| `[USPTO-5379844]` | US Patent 5,379,844, *Offshore platform well system* — https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5379844 (drilling template; **well bay or slot** at the surface; slot count limits the number of wells) |
| `[EN12716]` | EN 12716, *Execution of special geotechnical works — Jet grouting* — cited via `research/05` §A12. **Not read directly in this pass** |

**Offshore — platforms, mobile units and the impossibility arguments**

| key | URL |
|---|---|
| `[EP0147144]` | EP0147144A2, *Conductor guide arrangements for offshore well platforms* — https://patents.google.com/patent/EP0147144A2/en (jacket as pile template; foundation piles 90–180 m; conductors 510–760 mm; guides framed at 12–18 m intervals) |
| `[USPTO-5379844]` | US 5,379,844, *Offshore platform well system* — https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/5379844 |
| `[US4561802]` | US 4,561,802, *Assembly of conductor guides for offshore drilling platform* — https://patents.google.com/patent/US4561802A/en |
| `[US6171027]` | US 6,171,027, jack-up cantilever — https://patents.google.com/patent/US6171027B1/en |
| `[WP-WELLBAY]` | Wikipedia, *Well bay* — https://en.wikipedia.org/wiki/Well_bay |
| `[WP-BOP]` | Wikipedia, *Blowout preventer* — https://en.wikipedia.org/wiki/Blowout_preventer (surface vs subsea stack) |
| `[WP-JACKUP]` | Wikipedia, *Jackup rig* — https://en.wikipedia.org/wiki/Jackup_rig (legs, rack-and-pinion jacking, preload, spudcans, depth classes) |
| `[WP-SEMI]` | Wikipedia, *Semi-submersible platform* — https://en.wikipedia.org/wiki/Semi-submersible_platform |
| `[WP-DRILLSHIP]` | Wikipedia, *Drillship* — https://en.wikipedia.org/wiki/Drillship |
| `[WP-DIRECTIONAL]` | Wikipedia, *Directional drilling* — https://en.wikipedia.org/wiki/Directional_drilling (40+ wells fanning out; >10 km step-out) |
| `[OGP-OFFS]` | *Offshore drilling rigs*, oil-gasportal — https://www.oil-gasportal.com/drilling/offshore-drilling-rigs/ (topsides inventory; 10–40 wells; 1.8–3.0 m well centres; drill floor skidded) |
| `[OGP-TECH]` | *Drilling technologies*, oil-gasportal — https://www.oil-gasportal.com/drilling/technologies/ (the five rig systems, incl. the BOP stack) |
| `[DM-PLATFORM]` | Drilling Manual, *Platform rig* — https://www.drillingmanual.com/platform-rig-oil-gas/ |
| `[DM-TAD]` | Drilling Manual, *Tender assist drilling rig* — https://www.drillingmanual.com/tender-assist-drilling-rig-definition-and-benefits/ (what stays on the platform vs the tender) |
| `[DM-OFFSHORE]` | Drilling Manual, *Offshore drilling rig types* — https://www.drillingmanual.com/offshore-drilling-rigs-types-in-oil-gas/ |
| `[NORSKPET]` | Norwegian Petroleum Directorate field page — https://www.norskpetroleum.no/en/facts/field/johan-sverdrup/ (four bridge-linked platforms; 48 well slots; simultaneous drilling, intervention and production) |
| `[OT-MARINER]` | Offshore Technology, Mariner area development — https://www.offshore-technology.com/projects/mariner-area-development-north-sea-uk/ (PDQ platform, 50 active well slots) |
| `[OM-MODULAR]` | Offshore Magazine, first modular drilling rig designed for North Sea P&A — https://www.offshore-mag.com/home/article/16804693/first-modular-drilling-rig-designed-for-north-sea-pa-operations (14 × 12 m; ~890 t; **12 t maximum module weight**; 30 t platform crane) |
| `[OM-WEIGHT]` | Offshore Magazine, *Offshore platform rigs adapting to weight, space restrictions* — https://www.offshore-mag.com/drilling-completion/article/16763331/offshore-platform-rigs-adapting-to-weight-space-restrictions-for-floaters (**15–40 t typical platform crane**; 50–100 t for large modular rigs; crane barges for 100–1 000 t lifts; 3–5 lb of platform per lb of rig) |
| `[OM-JACKUP]` | Offshore Magazine, *New jackup rigs are more robust* — https://www.offshore-mag.com/drilling-completion/article/16755133/new-jackup-rigs-are-more-robust (spudcan 20 m; cantilever envelopes; depth classes) |
| `[OM-MINIMAL]` | Offshore Magazine, *Minimal platforms: using jackup, semisubmersible drilling units to install production structures* — https://www.offshore-mag.com/drilling-completion/article/16759124/minimal-platforms-using-jackup-semisubmersible-drilling-units-to-install-production-structures (jack-up as a pile-driving platform, up to 500 t safe lifting capacity) |
| `[OM-CONDUCTOR]` | Offshore Magazine, deepwater conductor driving — https://www.offshore-mag.com/deepwater/article/16760059/deepwater-conductor-driving-method-enhances-well-integrity |
| `[STRESS-COND]` | Stress Engineering, conductor casing pile-driving assessment — https://www.stress.com/conductor-casing-pile-driving-assessment/ (hydraulic impact hammer in the 150 kJ class) |
| `[VALARIS-JU]` | Valaris jackup fleet classes — https://www.valaris.com/our-fleet/jackups/default.aspx |
| `[VALARIS-DS]` | Valaris drillship fleet — https://www.valaris.com/our-fleet/drillships/default.aspx |
| `[NOV-CJ70]` | NOV jack-up design page — https://www.nov.com/products/cj70-jack-up (150 m water depth class; cantilever reach; deck dimensions) |
| `[SEMCO]` | Semco Maritime, harsh-environment jack-up dry docking — https://www.semcomaritime.com/dry-docking-cj70 (combined weight to 40 000 t; legs over 200 m) |
| `[DC-NCS]` | Drilling Contractor, *Semisubmersibles vs jackups on the Norwegian Continental Shelf* — https://drillingcontractor.org/semisubmersibles-vs-jackups-on-norwegian-continental-shelf-comparing-the-pros-and-cons-65238 (preload simulates a 100-year event; punch-through mitigation; NCS depth distribution) |
| `[OGJ-SPUDCAN]` | Oil & Gas Journal, spudcan footprint interaction — https://www.ogj.com/general-interest/companies/article/17233556/industry-funded-project-investigates-jack-up-rig-spudcan-footprint-interactions |
| `[HSE-ZONE]` | UK HSE COMAH technical measures, area classification — https://www.hse.gov.uk/comah/sragtech/techmeasareaclas.htm (Zone 1 definition) |
| `[HSEBLOG]` | *Drilling safety* — https://www.hseblog.com/drilling-safety/ (API RP 500 / IEC 60079; Zone 1–2 driving enclosure, glanding and motor rating for every component) |
| `[WELLOWNER]` | National Ground Water Association, *Cable tool drilling* — https://wellowner.org/resources/basics/drilling-methods/cable-tool/ (approximately 100 ft or less; 10–30 ft/day vs 200 for rotary) |
| `[FRTR]` | Federal Remediation Technologies Roundtable, cable-tool drilling — https://www.frtr.gov/site/3_2_2.html (no circulation fluids; 1.5–4.5 ft/h) |
| `[FHWA-DRILL]` | FHWA, *Drilling and Sampling of Soil and Rock* — https://pdhonline.com/courses/c250/FHWA_Drilling_Sampling_Soil___Rock___1.pdf (hollow-stem auger 200–300 ft max; cannot penetrate cobbles, boulders and most rock) |
| `[WP-CFA]` | Wikipedia, *Continuous flight augering* — https://en.wikipedia.org/wiki/Continuous_flight_augering |
| `[SB-CFA]` | Soletanche Bachy, CFA pile — https://www.soletanche-bachy.com/en/offer-portfolio/cfa-pile/ (≥1 bar above hydrostatic; spoil expelled via telescopic tubes to a disposal vehicle or skip) |
| `[BAUER-METHODS]` | BAUER drilling methods reference — https://equipment.bauer.de/en/drilling-methods-specialist-foundation-engineering (**cited for method envelopes only — CFA 600–1 200 mm / 50 m; Kelly 600–3 000 mm / 125 m — not as a capability claim about the company**) |
| `[OSTI-HDD]` | HDD design reference — https://www.osti.gov/etdeweb/servlets/purl/20987431 (entry angles 8–20°, rigs typically 10–12°; slant unit on the land site; shore-approach exit 3–6°) |
| `[NORTHFALLS]` | North Falls Offshore Wind, landfall proposals — https://consultation.northfallsoffshore.com/proposals/landfall/ (HDD landfall bore extending out to sea) |
| `[DUDGEON]` | Dudgeon Offshore Wind extension, *Cable Landfall Concept Study* — https://dudgeonoffshorewind.co.uk/extensionproject/docs/PEIR%20Volume%203/Appendix%204.2%20Cable%20Landfall%20Concept%20Study.pdf |

**Offshore geotechnical spreads and foundation installation**

| key | URL |
|---|---|
| `[MTN-VOYAGER]` | Marine Technology News, geotechnical drilling vessel — https://www.marinetechnologynews.com/news/fugro-geotechnical-drilling-vessel-484384 (83 × 20 m; twin-tower derrick over a central moonpool; 3 000 m rating; soil lab beside the drill floor) |
| `[GQM-POLARIS]`, `[GQM-SAENTIS]`, `[GQM-SEEHORN]`, `[GQM-FLEET]`, `[GQM-SI]` | Geoquip Marine fleet and service pages — https://www.geoquip-marine.com/fleet/dina-polaris-with-gmtr120/ · https://www.geoquip-marine.com/fleet/geoquip-saentis-with-gmr600/ · https://www.geoquip-marine.com/fleet/geoquip-seehorn-with-gmr602/ · https://www.geoquip-marine.com/assets/fleet/ · https://www.geoquip-marine.com/service/site-investigations/ (moonpool sizes, heave-compensation strokes, 5½" API string, seabed CPT units) |
| `[BM-ZEPHYR]` | Baird Maritime, PSV-to-geotechnical conversion — https://www.bairdmaritime.com/offshore/drilling-production/vessel-conversion-fugro-zephyr-platform-supplier-re-enters-service-as-geotechnical-drilling-ship (moonpool cut in; 40 m rig on a mezzanine deck; lab and sample store) |
| `[GARD-OR]`, `[GARD-DRILL]`, `[GARD-VC]` | Gardline — https://gardline.com/about-us/insights/ocean-resolution-start-of-line · https://gardline.com/explore-services/geotechnical-services/offshore-geotechnical-drilling · https://gardline.com/explore-services/geotechnical-services/vibrocoring-cpt (deployable 100 kN moonpool CPT; mobilisable heave-compensated rig to 500 m; 10–200 kN seabed CPT range; vibrocore 6 m in water to 250 m) |
| `[FUGRO-AYM]`, `[FUGRO-CODLING]`, `[FUGRO-REV]`, `[FUGRO-WIND]` | Fugro case studies — https://www.fugro.com/expertise/case-studies/working-through-winter-bespoke-testing-unlocks-early-insights-for-awel-y-mor · https://www.fugro.com/expertise/case-studies/excalibur-jack-up-innovations-improve-efficiency-safety-and-quality-of-codling-wind-park-site-investigation · https://www.fugro.com/expertise/case-studies/site-characterisation-revolution-wind-fugro · https://www.fugro.com/news/long-reads/2023/fast-accurate-geo-data-to-inform-offshore-wind-foundation-design |
| `[CMS-CPT]`, `[HELMS-NEP]`, `[DATEM]` | Seabed CPT frame specifications — https://www.cms-geoscience.co.uk/cpt · https://helmsgeomarine.com/services/neptune-5000-seabed-cpt/ · https://www.datem.co.uk/products/neptune-5000 (4 500 kg in air / 3 700 kg submerged; 2.2 × 2.2 m footprint; 35 kN push; 3 000 m) |
| `[ACTEON-PROD]`, `[OE-SEABED]` | Seabed drilling systems — https://acteon.com/solutions/project-lifecycle/site-investigation/geophysical-and-geotechnical-surveys/downhole-site-investigation-prod · https://www.oedigital.com/news/482874-seabed-drilling (4 000 m; 150 m penetration; umbilical-powered, decoupled from metocean conditions) |
| `[FLOATGUIDE]` | *Guide to Floating Offshore Wind*, geotechnical surveys — https://guidetofloatingoffshorewind.com/guide/p-development-and-project-management/p-4-geological-and-hydrographical-surveys/p-4-2-geotechnical-surveys/ (fixed wind 50–70 m; cable routes ~5 m) |
| `[OWB-HORNSEA4]` | offshoreWIND.biz, Hornsea Four geotechnical campaign — https://www.offshorewind.biz/2025/01/17/geotechnical-surveys-to-start-at-hornsea-four-site-in-february/ |
| `[CATHIE]` | Cathie Group, subsea cables sector page — https://cathiegroup.com/sectors/subsea-cables/ (**cited to establish that Cathie is a consultancy, not a vessel operator**) |
| `[ORSTED-INST]` | Ørsted, offshore wind turbine installation — https://us.orsted.com/renewable-energy-solutions/offshore-wind/offshore-wind-farm-construction/offshore-wind-turbine-installation (crane lowers the foundation; hydraulic hammer drives it) |
| `[SD-MONOPILE]` | ScienceDirect topic page, monopile foundation — https://www.sciencedirect.com/topics/engineering/monopile-foundation |
| `[WTI-GRIPPER]`, `[OE-GRIPPER]` | Motion-compensated pile gripper — https://www.windtech-international.com/product-news/twd-and-barge-master-introduce-a-motion-compensated-pile-gripper · https://www.offshore-energy.biz/twd-installs-monopile-gripper-frame-on-van-oords-aeolus/ (gripper frame 20 × 10.5 × 21 m, 450 t) |
| `[IQIP-HH]`, `[IQIP-IQ]`, `[IQIP-NMS]` | Offshore hydraulic hammer and noise-mitigation product families — https://iqip.com/products/pile-driving-equipment/hydrohammer/ · https://iqip.com/products/pile-driving-equipment/hydrohammer/iq-series/ · https://iqip.com/iqips-latest-and-largest-innovation-in-noise-mitigation-well-on-its-way/ (**cited for class energies, submersion depths and screen dimensions — not as capability claims about the company**) |
| `[ACTEON-HAMMER]`, `[ACTEON-3D]` | https://acteon.com/solutions/project-lifecycle/offshore-construction/integrated-marine-foundation-installation-services/hydraulic-hammers · https://acteon.com/solutions/project-lifecycle/offshore-construction/integrated-marine-foundation-installation-services/drive-drill-drive-3d (hammer energy classes; drive–drill–drive sequence) |
| `[ML-SOFIA]` | MarineLink, monopile installation — https://www.marinelink.com/news/van-oord-installs-first-monopile-513878 (monopiles to 8.8 m diameter, 92 m, 1 530 t) |
| `[BSH-NOISE]` | German BSH underwater sound requirements — https://www.bsh.de/EN/TOPICS/Offshore/Environmental_assessments/Underwater_sound/underwater_sound_node.html (SEL05 160 dB / peak 190 dB at 750 m) |
| `[BAUER-STB]` | Drilled and grouted pin piles for a jacket wind farm — https://www.bauer-offshore-technologies.com/en/st-brieuc-offshore-windfarm (190 pin piles; rock >180 MPa; water >38 m) |
| `[HK-OFD]`, `[WTI-NOIRMOUTIER]` | Offshore foundation drilling — https://www.herrenknecht.com/en/products/productdetail/ofd/ · https://www.windtech-international.com/product-news/herrenknechts-offshore-foundation-drilling-technology-used-to-install-noirmoutier-offshore-wind-farm (3–12 m drilling diameter; rock 25–120 MPa; 7 700 mm at 15–27 m) |

**Quarrying — blast design, regulation, dimension stone, Iberia**

| key | URL |
|---|---|
| `[OSMRE-BLAST]` | US OSMRE, *Surface Blast Design*, Module 3 — https://www.osmre.gov/sites/default/files/inline-files/Module3_0.pdf (burden ≈ 25 × charge diameter; spacing 1.8–2.0 × burden; stemming 0.7 × burden; subdrilling; timing; controlled blasting) |
| `[HSE-L118]` | UK HSE, *Health and safety at quarries* — Quarries Regulations 1999 ACOP L118 — https://hse.gov.uk/pubns/books/l118.htm · https://www.hse.gov.uk/PUBNS/priced/l118.pdf (Reg 12, Reg 13, excavations-and-tips rules, Part V blasting) |
| `[SI1999-2024]` | The Quarries Regulations 1999 — https://www.legislation.gov.uk/uksi/1999/2024/contents/made |
| `[EPIROC-SURF]`, `[EPIROC-D65]`, `[EPIROC-BLASTHOLE]`, `[EPIROC-DIM]` | Surface drill rig, DTH and dimension-stone catalogue pages — https://www.epiroc.com/en-us/products/drill-rigs/surface-drill-rigs · https://www.epiroc.com/en-us/products/drill-rigs/surface-blasthole-drill-rigs · https://www.epiroc.com/en-us/products/drill-rigs/dimension-stone-equipment/hydraulic-drill-rigs (**cited only for the hole-diameter bands each product family covers and the existence of a dimension-stone line — not as capability claims about the company**) |
| `[MINSYS-DUST]` | *Dust Control Measures in Quarry Aggregate Production* — https://www.mineralssystem.com/resources/blog/dust-control-measures-in-quarry-aggregate-production *(vendor blog, moderate quality)* |
| `[BRIT-QUARRY]` | Britannica, *Mining: Quarrying* — https://www.britannica.com/technology/mining/Quarrying (dimension-stone benches 4.5–6 m; block and mill-block masses; derrick reach setting plan area; 15–20 % yield; wire saw, jet burner, line drilling, feathers and wedges, diamond wire, chain saw) |
| `[RG-DIMSTONE]` | *A Review on Dimension Stone Extraction Methods* — https://www.researchgate.net/publication/372450128_A_Review_on_Dimension_Stone_Extraction_Methods (diamond wire dominance; 24–30 m/s linear wire speed) |
| `[IUGS-ESTREMOZ]` | IUGS Global Heritage Stone, Estremoz marbles — https://iugs-geoheritage.org/geoheritage_stones/estremoz-marbles/ |
| `[IUGS-MACAEL]` | IUGS Global Heritage Stone, Macael marble — https://iugs-geoheritage.org/geoheritage_stones/macael-marble/ |
| `[WP-MCE]`, `[SOLANCIS]` | https://en.wikipedia.org/wiki/Estremadura_Limestone_Massif · https://www.solancis.com/en/quarries/stone-origin |
| `[WP-SLATE-ES]`, `[SPR-SLATE]` | https://en.wikipedia.org/wiki/Slate_industry_in_Spain · *Roofing Slate Industry in Spain: History, Geology, and Geoheritage*, **Geoheritage** — https://link.springer.com/article/10.1007/s12371-017-0263-y |
| `[CLUSTER-PEDRA]` | Cluster da Pedra Natural de Galicia, basic figures — https://www.piedra.online/en/granite-cluster/basic-figures |

**Onshore well pads, water wells, permafrost**

| key | URL |
|---|---|
| `[KGS-PRIMER]` | Kansas Geological Survey, *Petroleum: a primer for Kansas — Drilling the well* — https://www.kgs.ku.edu/Publications/Oil/primer12.html (site preparation, conductor hole, rat hole, rig-up sequence, circulation) |
| `[SCDT-DESERT]`, `[SCDT-CLOSED]` | *Onshore desert drilling-waste operations* · *Closed-loop and zero-discharge* — https://scdrilltech.com/articles/onshore-desert-drilling-waste.html · https://scdrilltech.com/articles/closed-loop-and-zero-discharge.html *(contractor technical articles)* |
| `[FOX-DESERT]` | Desert rig inventory — http://www.foxoildrilling.com/desert-rigs.html (**cited for the class ranges — 1 200–2 000 HP, 35–90 person camps — not as a claim about any named rig**) |
| `[RWSN-COP]`, `[E4C-UNICEF]`, `[RWSN-BLOG]` | Rural Water Supply Network *Code of Practice for Cost Effective Boreholes* and UN guidance — https://www.rural-water-supply.net/en/resources/details/426 · https://www.engineeringforchange.org/news/unicef-publishes-a-guidance-note-on-professional-water-well-drilling/ · https://rwsn.blog/category/sustainable-groundwater-development/cost-effective-boreholes-sustainable-groundwater-development/ |
| `[CARRUTHERS]`, `[GSL-SP225]`, `[ALLE]` | Borehole siting geophysics in African crystalline basement — https://www.sciencedirect.com/science/article/abs/pii/089953629290097V · https://www.lyellcollection.org/doi/abs/10.1144/gsl.sp.2004.225.01.18 · https://www.sciencedirect.com/science/article/abs/pii/S1464343X17304806 (~40 % failure with 1D methods in Benin) |
| `[TGS-REPORT]` | Borehole completion report, village borehole — https://ugandanwaterproject.com/wp-content/uploads/2020/06/480-Misozi-NBH-Drilling-Report-PDF.pdf (rig class, bit and hammer sizes, 58.85 m, yields, 3-hour test, 0.5 m³/h acceptance, *"the site was cleared"*) |
| `[HELP-BOQ]` | NGO borehole tender bill of quantities, South Sudan — https://comms.southsudanngoforum.org/uploads/default/original/2X/4/40da0057db7bdad5d54fe25cfa5712c4d923d00f.pdf (**the single best "what is on site" document found**) |
| `[LONESTAR]` | *Step-by-Step Water Well Drilling Guide* — https://www.lonestardrills.com/drilling-water-wells/ *(small-rig manufacturer; operationally specific, trade quality)* |
| `[SSWM-WELLS]` | SSWM, *Drilled Wells* — https://sswm.info/sswm-solutions-bop-markets/affordable-wash-services-and-products/affordable-water-supply/drilled-wells (rural ~50 mm vs urban to 300 mm; US$20–3 000 vs US$2 000–20 000) |
| `[BGS-MANUAL]`, `[FUSSI]` | Manual drilling feasibility — https://earthwise.bgs.ac.uk/index.php/Manual_drilling · https://ui.adsabs.harvard.edu/abs/2013EGUGA..15.8937F/abstract |
| `[RWSN-AFRIDEV]`, `[AFRIDEV-SPEC]`, `[WP-IMII]` | Handpumps — https://www.rural-water-supply.net/en/implementation/public-domain-handpumps/afridev · https://www.ircwash.org/sites/default/files/232.2-94AF-7078.pdf · https://en.wikipedia.org/wiki/India_Mark_II |
| `[IR-SAHEL]`, `[WWA-SOLAR]` | Solar-pumped village water schemes in the Sahel — https://islamic-relief.org/news/sahel-communities-flourish-with-green-water-technology/ · https://waterforwestafrica.org/innovative-solutions-for-water-scarcity-using-renewable-solar-power/ |
| `[ROYALTECHNO]` | 24-hour commercial pump test practice — https://royaltechno.net/our-sevices/borehole-drilling/ *(contractor page, weak source — flagged as such where used)* |
| `[OTA-NORTHSLOPE]` | US Congress Office of Technology Assessment, *Technologies for Oil and Gas Development on the North Slope of Alaska*, ch. 2 — https://www.princeton.edu/~ota/disk1/1989/8922/892205.PDF (permafrost to 2 000 ft; 5-ft gravel pads; gravel/ice/timber pad types; reserve pits contained in permafrost; enclosed and heated rigs; arctic-grade steel; modules 500–5 000 t) |
| `[AK-DNR-TUNDRA]` | Alaska DNR, *Off-Road Travel on the North Slope on State Land*, Jan 2026 — https://dnr.alaska.gov/mlw/cdn/pdf/factsheets/off-road-travel-on-the-north-slope-on-state-land.pdf (23 °F at 12 in + 6/9 in snow; opening dates 2 Nov–27 Jan; 72-hour clear-off; approved vehicle list; ≤1.5 psi tyre pressure) · https://dnr.alaska.gov/mlw/tundra-travel/ |
| `[CP-ICEROADS]` | *Ice Roads: The North Slope's Frozen Foundation* — https://www.conocophillips.com/sustainability/sustainability-news/story/ice-roads-the-north-slopes-frozen-foundation/ (~1 million gallons per mile; 6-inch minimum; four-month window; 161 acres of ice pads with 140 miles of ice roads in one season) |
| `[ASCE-HEATPIPE]` | *Alyeska's 40-Plus Years of Experience with Heat Pipes on the Trans-Alaska Pipeline*, ASCE Permafrost 2021 — https://inl.elsevierpure.com/en/publications/ |
| `[NSIDC-GGD402]` | Yamal borehole dataset — https://nsidc.org/data/ggd402/versions/1 (>4 000 boreholes, 1977–1990) |
| `[ATE-PERMAFROST]`, `[GEOEXPRO-YAMAL]` | Wellbore/permafrost thermal interaction — https://www.sciencedirect.com/science/article/abs/pii/S1359431117320616 · https://geoexpro.com/gas-blowouts-on-the-yamal-and-gydan-peninsulas/ (mud-driven thaw and wellhead settling; hydrate dissociation) |
| `[USGS-PERMACORE]` | USGS permafrost core data release, doi:10.5066/P13AEEH7 — https://www.usgs.gov/data/measurements-and-photographs-permafrost-cores-drilled-arctic-coastal-plain-alaska (38 boreholes; hand auger; 51 mm and 76 mm cores) |
| `[KOLIBRI]`, `[SONICEDGE]` | Commercial permafrost coring and frozen-ground drilling — https://www.geokolibri.com/permafrost-drilling · https://sonic-edge.ca/specialized-drilling/frozen-ground-drilling-and-casing |
| `[WP-NGRIP]`, `[WP-EGRIP]` | https://en.wikipedia.org/wiki/North_Greenland_Ice_Core_Project · https://en.wikipedia.org/wiki/East_Greenland_Ice-Core_Project |

**Environmental, geotechnical investigation, geothermal and HDD**

| key | URL |
|---|---|
| `[ASTM-D6914]`, `[ASTM-D6286]` | ASTM D6914/D6914M *Sonic Drilling for Site Characterization…* · ASTM D6286/D6286M *Selection of Drilling and Direct Push Methods* — https://www.astm.org/Standards/D6914.htm · https://store.astm.org/d6286_d6286m-20.html |
| `[TSI-SONIC]` | Sonic oscillator technology description — https://www.terrasonicinternational.com/trusonic-drilling-technology/ (**cited for the physical principle and the class figures — up to 150 Hz, 50 000 lb oscillatory force, displacement not pulverisation — not as a capability claim**) |
| `[HARGTECH]` | *Sonic drilling rig environmental sampling* — https://harg-tech.com/sonic-drilling-rig-environmental-sampling/ *(vendor technical article; operationally detailed — IDW, decontamination, chain of custody, exclusion zones)* |
| `[EPA-SESD]` | US EPA SESD, *Design and Installation of Monitoring Wells* — https://www.epa.gov/quality/design-and-installation-monitoring-wells (**document not readable in this pass; numeric details `NOT SOURCED`**) |
| `[GEOINV-CP]`, `[GW-CP]`, `[SUBSURF-CP]`, `[JW-CP]` | Cable percussion / shell-and-auger practice — https://geoinvestigate.co.uk/2022/05/15/cable-percussive-drilling-or-shell-auger/ · https://www.groundandwater.co.uk/blogs/the-gw-guide-to-cable-percussion-drilling/ · https://www.subsurface.co.uk/services/site-investigation/cable-percussive-boreholes/ · https://www.jonesandwagener.co.uk/geotechnical-site-investigations-services/cable-percussion-drilling-shell-and-auger-drilling/ (7 m tripod; 2 t winch; 6.7 m headroom; 150/200 mm casing; to 50 m; clay cutter, shell, chisel; BS 5930) |
| `[ADP-WINDOW]` | Window and windowless sampling classes — https://adpgroupltd.com/drilling-services/window-sampling/ (10 m tracked; 86–116 mm barrels with liners; ATV at 170 g/cm²; handheld 5–8 m) |
| `[ISO22476-1]`, `[ISO22476-1-2022]`, `[CONETEC]` | BS EN ISO 22476-1 electrical cone and piezocone penetration test — https://www.iso.org/obp/ui/#!iso:std:57728 · https://www.iso.org/standard/75661.html · https://www.conetec.com/about/ISO-22476-1-2022 |
| `[LANKELMA]` | CPT unit classes actually fielded in the UK — https://www.lankelma.com/cpt-service/specialist-cpt-units/ (track-trucks; tracked crawlers; **mini crawlers at ~1.0–1.1 t using ground anchors or kentledge**; hand-portable basement rams at 0.07–0.15 t; rail units) |
| `[HSG47]` | UK HSE **HSG47**, *Avoiding danger from underground services* — https://www.hse.gov.uk/pubns/books/hsg47.htm (plan the work; locate and identify buried services; safe excavation) |
| `[KENSA]` | Ground-source heat pump borehole guidance — https://kensa.co.uk/ground-source-heat-pumps/boreholes (80–300 m; 3–5 kW per 80–100 m borehole; PE100 U-loop; thermal grout; rig footprint smaller than a parking space) |
| `[PROJINFRA]`, `[ATS-HDD]`, `[TRENCHPEDIA]` | HDD site setup — https://projectinfrastructure.com/horizontal-directional-drilling-hdd/ · https://www.operator-school.com/blog/directional-drilling-site-setup-key-considerations-for-a-successful-bore/ · https://trenchlesspedia.com/a-step-by-step-guide-to-hdd/2/3604 |
| `[VERMEER-RECLAIM]`, `[VERMEER-RANGE]`, `[SPECTRUM-MC]` | Mud reclaiming plant architecture — https://protips.vermeer.com/underground/vermeer-reclaimers-minimize-water-consumption-on-hdd-jobsites/ · https://www.vermeer.com/em/reclaimers · https://spectrumdrillingtools.com/products/mud-cleaner/ (**cited for the shaker → desander → desilter → clean-tank sequence, not as a capability claim**) |
| `[DIGITRAK-MAN]`, `[SLHDD]` | Walkover locating — sonde in the head, handheld receiver walked over the line, reporting location, heading, depth, pitch, roll and transmitter status — https://www.manualslib.com/ · https://straightlinehdd.com/product/ |
| `[PPI-HDD]` | Plastics Pipe Institute HDD advisory — https://conduitcalc.plasticpipe.org/municipal_pipe/advisory/hdd/ (back-reamer through a swivel; safe pull strength; **minimum bending radius 60 × pipe OD**) |
| `[TECHTOOL]` | *Understanding Limitations for HDD* — https://technicaltoolboxes.com/understanding-limitations-for-hdd/ (**the exclusion evidence**: coarse-grained material, cobbles, boulders, excessive rock strength; not readily fluidised; *"highest risk of failure of any activities on a project"*; cover rules of thumb outdated; size classes; intersect above 6 000 ft) |
| `[MICHELS-COOSA]`, `[TT-COOSA]` | A real maxi river crossing — https://www.michels.us/experience/projects/coosa-river-hdd-crossing/ · https://trenchlesstechnology.com/crossing-the-coosa-river-via-hdd/ (~3 407 ft of 42-inch steel; intersect method, rigs on both banks; 30/42/54-inch ream passes; five pullback sections; 24/7 pullback) |
| `[JBT-FRACOUT]`, `[FERC-IR]` | Frac-out / inadvertent return — https://www.jbtrenchless.com/portfolio/understanding-hdd-hydraulic-fracture-frac-out/ · https://www.ferc.gov/natural-gas/environmental-overview/guidance-horizontal-directional-drill-monitoring-inadvertent-return-and-contingency-plans (causes, detection signs, response, and the regulatory requirement for a contingency plan) |

**Piling, anchors and jet grouting — working platforms, consents, plant**

| key | URL |
|---|---|
| `[FPS-WPG]` | Federation of Piling Specialists, *Working Platform Guidance* — https://www.fps.org.uk/guidance/working-platform-guidance/ (certificate signed by the Principal Contractor before piling; **gradient ≤ 1 in 10**; published design bearing pressures 92–633 kN/m²) |
| `[FPS-WPPOS]` | FPS position paper, *Working Platforms* — https://www.fps.org.uk/position-papers/working-platforms/ (**one third of dangerous occurrences; a 1 m² soft spot can destabilise plant up to 150 t**) |
| `[FPS-TRACKTOOL]` | *Guidelines — FPS Rig Track Tool* — https://www.fps.org.uk/content/uploads/2024/06/Guidelines-FPS-Rig-Track-Tool.pdf (**track pressures are commonly much higher than weight ÷ area**; the worked 377 kN example; **extraction 229 kPa** is the worst case; BR 470 Case 1 / Case 2 definitions) |
| `[BR470]` | BRE **BR 470**, *Working Platforms for Tracked Plant* — https://bregroup.com/store/bookshop/working-platforms-for-tracked-plant-good-practice-guide-to-the-design-installation-maintenance-and-repair-of-ground-supported-working-platforms-br-470-download |
| `[EFFC-WP]` | EFFC/DFI *Guide to Working Platforms*, 2nd Edition (Nov 2025) — https://www.effc.org/content/uploads/2025/11/EFFC-DFI_Guide_For_Working_Platforms_Edition_2_FINAL_1125.pdf |
| `[FPS-GRAN]` | FPS, *Granular Materials for Working Platforms* (Feb 2026) — https://www.fps.org.uk/content/uploads/2026/05/FPS-Granular-Materials-for-Working-Platforms-Guidance-Feb-26.pdf (**fines ≤ 15 %**; 6F1/6F2/6S) |
| `[FPS-EXCAV]` | FPS, *Excavation and Reinstatement of Working Platforms* (Oct 2025) — https://www.fps.org.uk/content/uploads/2026/05/FPS-Excavation-and-Reinstatement-of-Working-Platforms-Guidance-Oct-25.pdf |
| `[FPS-RZ]` | FPS **Restricted Zone Handbook** (2021) — https://www.fps.org.uk/content/uploads/2021/02/FPS-RESTRICTED-ZONE-HANDBOOK_A6_14029.pdf (Red/Green/hatched zones; **CFA 10 m · LDA 5 m · driven piling 10 m side + pile length + 2 m front**; the D-wall grab spin-off area) |
| `[FPS-BENT]` | FPS bentonite guidance (Jan 2006) — https://www.fps.org.uk/content/uploads/2018/12/Bentonite-Jan-2006.pdf (the acceptance table; **sand content 4 %**; 12-hour hydration; the non-hazardous-waste claim that conflicts with trade press) |
| `[FPS-REINF]` | FPS *Reinforcement Handbook* (2026) — https://www.fps.org.uk/content/uploads/2026/07/Reinforcement-Handbook-2026.pdf (2 t bundles; **cages >18 m need welded lap splices**; horizontal-to-vertical lifting) |
| `[FPS-PUMP]` | FPS, *Guidance for Pumping Concrete to Form Piles* — https://www.fps.org.uk/content/uploads/2022/09/FPS-Guidance-for-Pumping-Concrete-to-Form-Piles-Revision-2021.pdf (**55–95 bar**; 100/125 mm hose at 80–120 bar; swan neck and concrete swivel; agitator drum; blocked-hose clearing as *"one of the most hazardous activities undertaken on a piling site"*) |
| `[FPS-PUWER3]` | FPS PUWER Guidance 3 — https://www.fps.org.uk/content/uploads/2025/01/PUWER-Guidance-3.pdf (**each digging cycle typically advances the bore up to 500 mm**; the CFA and rotary spoil descriptions; the **35 kNm** BS EN 16228 Part 4 / Part 2 boundary; mini-piling ≤ 300 mm) |
| `[FPS-OVERFLIGHT]` | FPS, *CFA Piling — Preventing ground/rig instability through over-flighting* — https://www.fps.org.uk/content/uploads/2018/12/CFA-Piling-Preventing-ground-rig-instability-through-over-flighting-FINAL.pdf (rotation slightly greater than one per flight pitch; the high-risk grounds; **undetected voids may undermine the machine's own support**) |
| `[EFFC-TREMIE]` | EFFC/DFI *Guide to Tremie Concrete for Deep Foundations* — https://www.effc.org/content/uploads/2018/08/EFFC_DFI_Tremie_Concrete_Guide_2nd-Edition_2018_Final_rev2_28-08-18.pdf (tremie ID **min 150 mm or 6 × max aggregate**; **embedment 1.5–3 m per EN 1536, working range 3–8 m**) |
| `[EFFC-SF]` | EFFC/DFI *Guide to Support Fluids for Deep Foundations*, 1st Ed. — https://www.effc.org/content/uploads/2019/04/EFFC_Support_Fluids_Guide_FINAL.pdf (**not extracted in this pass — 10 MB**) |
| `[COL-COP]` | City of London *Code of Practice for Deconstruction and Construction Sites*, 9th Ed. — https://www.cityoflondon.gov.uk/assets/Services-Environment/code-of-practice-for-deconstruction-and-construction-sites-9th-edition-pollution.pdf (**hoarding ≥5 kg/m²**; mandatory wheel wash with rumble grid; hours and reduced-impact hours; 65 dBA internal threshold; *"no reversing of the Kelly/auger bars"*; crushers permitted **specifically to make piling mats**) |
| `[CIEH-LONDON]` | *London Good Practice Guide: Noise and Vibration Control for Demolition and Construction* — https://www.cieh.org/media/1251/london-good-practice-guide-noise-vibration-control-for-demolition-and-construction.pdf (**1 / 3 / 5 mm/s PPV** limits; the five-step piling method hierarchy; the auger **metal brush**) |
| `[COPA-S60]`, `[COPA-S61]` | Control of Pollution Act 1974 — https://www.legislation.gov.uk/ukpga/1974/40/section/60 · https://www.legislation.gov.uk/ukpga/1974/40/section/61 (the authority may specify **which plant, which hours, what noise level**; s.61 prior consent answered within **28 days**) |
| `[CDM-SCH2]` | CDM 2015 Schedule 2 — https://www.legislation.gov.uk/uksi/2015/51/schedule/2/made (welfare requirements) |
| `[GS6]` | HSE **GS6**, *Avoiding danger from overhead power lines* — https://www.hse.gov.uk/pubns/gs6.pdf (10 m management zone; 6 m barrier zone; **LV 1 m · 11/33 kV 3 m · 132 kV 6 m · 275/400 kV 7 m**) |
| `[BACSOL-SECANT]`, `[KELLER-SECANT]`, `[ALPHA-SECANT]` | Secant walls — https://www.bacsol.co.uk/solution/secant-piled-wall/ · https://www.keller.com/expertise/techniques/secant-pile-walls · https://www.alphapiling.co.uk/secant-retaining-walls/ (hard/soft, hard/firm, hard/hard; 600–1 180 mm; spacing 0.8–0.9 D) |
| `[BACSOL-DW]`, `[KELLER-DW]`, `[BACSOL-TCR]` | Diaphragm walls — https://www.bacsol.co.uk/solution/diaphragm-walls/ · https://www.keller.com/expertise/techniques/diaphragm-walls-barrettes-grab · https://www.bacsol.co.uk/project/tcr-station-upgrade (panels 2.8–7.0 m; 600–1 800 mm; 50 m by grab / 100 m by cutter; de-sanding plant sizing; a real 1 000 mm × 221 m urban wall with 4–6 sonic tubes per panel) |
| `[SPRINGER-BENT]` | https://link.springer.com/article/10.1007/s40098-017-0277-z (*"In urban areas, space restrictions often do not permit the arrangement of bentonite slurry tanks and pipes"*) |
| `[FHWA-GEC4]` | FHWA GEC No. 4, *Ground Anchors and Anchored Systems* (FHWA-IF-99-015) — https://www.fhwa.dot.gov/engineering/geotech/pubs/if99015.pdf (**design load 260–1 160 kN; hole <150 mm; length 9–18 m; unbonded min 3 m bar / 4.5 m strand; inclination commonly 15–30°; Type A/B/C/D grout bodies; testing to 1.33 × DL; ram travel ≥152 mm; load cell required for extended holds**) |
| `[FHWA-MICRO]` | FHWA NHI-05-039, *Micropile Design and Construction* — https://rosap.ntl.bts.gov/view/dot/50231 |
| `[EN1537]`, `[EN14199]`, `[BS8081]`, `[ISO22477-5]` | https://www.en-standard.eu/bs-en-1537-2013-execution-of-special-geotechnical-works-ground-anchors/ · https://knowledge.bsigroup.com/products/execution-of-special-geotechnical-works-micropiles · https://www.thenbs.com/publicationindex/documents/details?Pub=BSI&DocId=324029 · https://www.iso.org/standard/66839.html (**EN 1537 excludes soil nails and tension piles; EN 14199 defines micropiles as shaft <300 mm**) |
| `[ISCHEBECK]` | Self-drilling hollow-bar micropile design and construction — https://www.solcon.fi/wp-content/uploads/2019/03/TITAN-Micropiles-Design-and-construction.pdf (**flush return sieved; flow must not be interrupted**; short bar sections for limited headroom; installation between machinery indoors) |
| `[GEOSTAB-NAIL]` | A real soil-nail and rock-anchor slope job — https://www.geostabilization.com/project-gallery/slope-repair-using-a-soil-nail-wall/ (**60 rock anchors, 2 200 sq ft of mesh, drainboards to three collection points, no intermediate benches**) |
| `[BRAYMAN-KERR]` | Dam spillway anchor project — https://www.brayman.com/projects/kerr-dam-spillway-stabilization (**48 production anchors, 36–57 strands each, 203 844 ft of strand, 81 430 800 lb**) |
| `[RIXGE]`, `[HARDMAN]` | Restricted-access micropiling and underpinning — https://www.rixge.com.au/services/restricted-access-piling-micropiles/ · https://www.hardmanconstruction.com/capabilities/micropiles/ |
| `[VTA-NOISE]` | A corridor noise and vibration assessment — https://www.vta.org/sites/default/files/documents/Att_E_Noise_and_Vibration_Report.pdf (**~150 receivers by station; 4–5 days per column position; 12–15 days of exceedance per receiver**) |
| `[VANELLE-BH]`, `[VANELLE-LUTON]` | Real corridor and rail piling jobs — https://www.van-elle.co.uk/case-studies/basford-hall-ftn-reb-compound-earthworks-crewe/ · https://www.van-elle.co.uk/case-studies/luton-station/ (**190 grab wagons in 13 days, 22/day peak**; **120 sheet piles in four shifts from three RRV-mounted attachments**, poly bridge) |
| `[AARSLEFF-RAIL]` | https://aarsleff.co.uk/market-sector/rail/ (unjointed precast piles **up to 16 m** held in stock for possession windows) |
| `[NR-PLANNED]`, `[NR-ALO]`, `[NR-OTP]` | https://www.networkrail.co.uk/our-work/looking-after-the-railway/planned-works/ · https://safety.networkrail.co.uk/safety/adjacent-line-open/ · https://safety.networkrail.co.uk/safety/on-track-plant-safety/ (possessions planned up to 12 months ahead; **COP0032 Any Line Open, effective 1 Sep 2016, Movement Limiting Devices**; on-track plant regime) |
| `[TSM8]` | Traffic Signs Manual Chapter 8 — https://www.gov.uk/government/publications/traffic-signs-manual (**numeric values not extracted — see §F**) |
| `[DB-COFFERDAM]`, `[SPUK-CONV]` | https://www.designingbuildings.co.uk/wiki/Cofferdam · https://www.sheetpilinguk.com/sheet-piling-methods/conventional-sheet-piling/ (cofferdam sequence and types; **crane-suspended hammer over water where tracked rigs cannot stand**) |
| `[HSE-DROWN]` | HSE, prevention of drowning in construction — https://www.hse.gov.uk/construction/safetytopics/prevention-of-drowning.htm (throw lines 8–12 mm; **45° tensioned grab line**; rescue boats; auto-inflating lifejackets) |

**Mining, exploration and tunnelling**

| key | URL |
|---|---|
| `[GF-STIVES]` | A real gold operation's mining description — https://www.goldfields.com/reports/annual_report_2016/minerals/reg-aus-ives-mining.php (**benches 5–10 m in 2.5–3 m flitches; 90–180 t trucks, 150–350 t excavators; inclined RC grade control**) |
| `[WP-OPENPIT]` | https://en.wikipedia.org/wiki/Open-pit_mining (12–15 m benches, 20–40 m wide; batter and berm) |
| `[EPIROC-BH]` | Surface blasthole rig range — https://www.epiroc.com/en-us/products/drill-rigs/surface-blasthole-drill-rigs (**152–406 mm holes; pulldown 60 000–125 000 lb**; single-pass 12–18 m; auto-drill, auto-level and bench-remote. **Cited for class capability bands only**) |
| `[NAT-BLAST]` | Open-pit blast design and bench geometry — https://www.nature.com/articles/s41598-025-90242-6 (hole depths 3.5–10.5 m; burden 3–3.5 m; spacing 3.5–6 m; stemming 1.5–4.0 m) |
| `[PQ-L4]` | *Pit & Quarry* University Lesson 4, drilling and blasting — https://www.pitandquarry.com/pq-university-lesson-4-drilling-and-blasting/ (laser and photogrammetry face profiling; stemming and the *"gun-barrel"* effect; **water injected into the air stream for dust and collar stability**) |
| `[DMA-GC]` | Grade-control drilling in open pits — https://drillmastersafrica.com/grade-control-drilling-open-pit-mining/ |
| `[VERTEX]` | A real small gold mine's drill-cuddy development — https://www.abnnewswire.net/press/en/132593/Vertex-Minerals-Limited-(ASX-VTX)-Reward-Gold-Mine-Project-Update.html (**cuddy up to 6 m high × 7 m deep, ~7 holes from it; 11 kV cable, water and air lines; exploration to build gold inventory and convert inferred to indicated**) |
| `[K92]` | Underground exploration from cuddies off a 5 × 5 m drive, **every ~100 m** — https://ca.marketscreener.com/quote/stock/K92-MINING-INC-34771393/news/K92-Mining-Commences-Underground-Exploration-Drilling-Targeting-Extensions-of-Kora-copper-gold-dep-24446608/ |
| `[BLY-UG]`, `[BLY-LM75]`, `[BLY-UGSVC]` | Underground core rig classes — https://www.boartlongyear.com/products/exploration/exploration-underground/ · https://www.boartlongyear.com/product/lm75/ · https://www.boartlongyear.com/drillingservice/underground-coring/ (**modular into power pack, feed frame, rotation unit, foot clamp, controller; all angles vertically up to vertically down**. Cited for class characteristics only) |
| `[EPIROC-DIAMEC232]` | A compact underground core rig class — https://www.epiroc.com/en-us/products/drill-rigs/exploration-drill-rigs/core-drilling-rigs/diamec-232 (*"ideal for core drilling in narrow tunnels or in galleries"*; 220 m down / 180 m up; **15 kW power unit; skid carrier; "column" option**) |
| `[CORING-UG]` | Underground coring crews and the built work deck — https://coringmagazine.com/article/exploring-possibilities-resourceful-underground-coring-crews-equipment/ |
| `[AUD]`, `[GEODRILL-UG]` | https://www.audrilling.com.au/ · https://www.geodrill.ltd/drilling-services/underground/ (360° drilling including steep up-holes) |
| `[ONTARIO-BMP]`, `[ON-PLAN]`, `[ON-PERMIT]` | Ontario exploration best practice and plan/permit activity lists — https://www.ontario.ca/page/best-management-practices-mineral-exploration-and-development-activities-and-woodland-caribou · https://www.geologyontario.mndm.gov.on.ca/mines/lands/mining-sequence/exploration_plan_activities_e.pdf · https://www.geologyontario.mndm.gov.on.ca/mines/lands/mining-sequence/exploration_permit_activities_e.pdf (**pads 20–40 m diameter ground-supported, 40–50 m heli; line cutting ≤1.5 m = plan, >1.5 m = permit**) |
| `[MB-BMP11]`, `[MB-BMP13]`, `[MB-BMP14]`, `[MB-BMP16]` | Manitoba exploration best-management practices — land-based drilling, core storage, temporary work camps, decommissioning — https://earlyexploration.miningmanitoba.org/best-management-practices-bmp/bmp-11-land-based-drilling/ · .../bmp-13-core-storage/ · .../bmp-14-temporary-work-camps/ · .../bmp-16-decommissioning/ (**900 m² pad cap, 100 m water buffer; core box labelling and stacking rules; camp setback distances; 30-day decommissioning; casing cut to ≤15 cm**) |
| `[BLY-PAD]` | *Five Tips for Drill Pad Planning* — https://www.boartlongyear.com/insite/five-tips-for-drill-pad-planning/ (**≥3 m clearance around the equipment**; sump siting, ramping and guarding) |
| `[AUSEARTHED]` | A real exploration campaign and its rehabilitation — https://ausearthed.blogspot.com/2021/07/exploration-drilling-and-rehabilitation.html (~100 m² pads; **deep ripping to 50 cm; monitoring photos at completion, 3, 6 and 12 months**) |
| `[WA-REHAB]` | Exploration and prospecting rehabilitation guidance — https://www.wa.gov.au/government/publications/exploration-and-prospecting-rehabilitation-guidance |
| `[GSI-DRILL]`, `[PDD-WATER]` | https://gsi.ie/programmes-projects/minerals/minerals-activities/mineral-exploration-how-its-done/drilling/ · https://www.platinumdiamonddrilling.ca/post/exploration-diamond-drilling-and-water-resource-management |
| `[WP-EDD]`, `[PCT-SIZE]` | https://en.wikipedia.org/wiki/Exploration_diamond_drilling · https://plasticcoretrays.com/core-box-core-tray-size-guide-hq-nq-pq-and-more/ (**BQ 36.5/60 · NQ 47.6/75.7 · HQ 63.5/96 · PQ 85/122.6 mm**; metres of core per ~1 m tray) |
| `[DISC-CORE]`, `[CORING-PALSA]`, `[EXPLOLOGIK]` | Core shed design — https://www.discovererglobal.com/learning_hub/designing-the-future-of-core-facilities · https://coringmagazine.com/article/palsatech-redefining-core-shack/ · https://explologik.com/en/our-services/ (wet/dry separation; **logging tables 74–94 cm with an LED photography canopy**; mobile core shacks) |
| `[PNR]` | Line cutting and built pads — https://www.pnrexploration.com/service (*"construction of timber frame pads"* for helicopter access and drill loads) |
| `[MULTIPOWER]`, `[OREZONE]` | Heli-portable rig modularity — https://multipowerproducts.com/english/about-us/latest-news/discovery-ii-helicopter-portable-diamond-drill/ · https://www.orezonedrilling.com/surface-division/heli-portable-diamond-rigs/ (**six modules under 1 600 lb**; *"can be broken up into seven parts"*) |
| `[CORING-HELI]`, `[CORING-COLD]` | A real heli-supported greenfield campaign, and cold-weather drill shelters — https://coringmagazine.com/article/taking-skies-unearth-anorthosite-heli-portable-diamond-core-drilling-cartwright-drilling-inc-greenland-anorthosite-mining-aps/ · https://coringmagazine.com/article/diamond-drilling-cold-weather/ (**1 509 m in 14 holes, crew of five**; the roof hole, the *"pneumonia hole"*, the shack on skids at the water source) |
| `[GOLIATH]` | A real greenfield **gold** campaign — https://www.thehedgelesshorseman.com/goliath-resources/goliath-mobilizes-for-its-largest-drill-program-of-40000-meters-with-9-rigs-on-the-extensive-surebet-high-grade-gold-discovery-that-remains-wide-open-golddigger-property-golden-triangle-b-c/ (**nine rigs, 40 000 m, core boxes flown out by helicopter**) |
| `[RCD-SETUP]`, `[RCD-COMPARE]`, `[RCD-PROG]` | RC rig setup, comparisons and programme planning — https://www.rcdrilling.com/rc-drilling-guide/getting-set-up-for-rc-drilling/ · https://www.rcdrilling.com/rc-drilling-guide/rc-drilling-comparisons/ · https://www.rcdrilling.com/rc-drilling-guide/whats-important-to-an-rc-drilling-program/ (**~1 000 cfm/500 psi onboard; boosters to 2 700 cfm/1 000 psi; support and auxiliary trucks; splits 6.25–12.5 %; 250–300 m in a 12-hour shift; 25–40 % cheaper than diamond**) |
| `[DRILLWEST]`, `[DST-SPLITTER]`, `[DISC-CALICO]` | https://www.drillwest.com.au/Reverse-Circulation-RC-Drilling.html · https://www.drillsampling.com.au/drill-sampling-equipment/cone-splitter-type-rc-sampling-system/ · https://www.discovererglobal.com/products/superior-drawstring-calico-bags (**alumina-ceramic-lined cyclone; double 25 L drop box; bolt-in 4/6/8/10 % blades; calico bag size range**) |
| `[ALOM]`, `[BOSTECH]` | Method comparison economics, and **aircore as the first-pass tool** — https://www.alomgeomine.com/blog/exploration-drilling-methods · https://www.bostech.com.au/aircore-drilling-vs-rc-drilling-western-australia/ |
| `[MV-SP25]`, `[MINING-SP24]`, `[SP-WET26]` | Global exploration budget splits — https://www.miningvisuals.com/post/2025-global-exploration-budget-by-commodity · https://www.mining.com/budget-allocated-to-grassroots-exploration-at-all-time-low-sp/ · https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/03/world-exploration-trends-2026-what-the-latest-data-says-about-budgets-risk-appetite-and-the-project-pipeline (**minesite 45 % record high, grassroots 21 % record low, gold 50 % of a $12.40 bn budget; 2024: minesite the only stage that grew, gold and copper the primary drivers**) |
| `[WP-VENT]`, `[MINETEK]`, `[PMC-DUCT]` | Mine and tunnel ventilation — https://en.wikipedia.org/wiki/Mine_ventilation · https://minetek.com/en-us/resource-hub/news/underground-mine-ventilation-performance-guide/ · https://pmc.ncbi.nlm.nih.gov/articles/PMC12504577/ (forcing vs exhausting; **duct on φ8 mm ropes from M12 anchors at 5 m centres; fan ~10 m inside the entrance**) |
| `[NFF26]` | Norwegian Tunnelling Society Publication 26 — https://tunnel.no/wp-content/uploads/sites/3/2020/04/Publication-26.pdf (**5.3 m standard round; 48 mm blastholes; 102 mm reamers; contour c/c 0.7 m and charge reductions; look-out 63.12 → 85.03 m²; bulk site-sensitised emulsion; 600–800 ms cut; wheel loaders and road tippers, not LHDs; support quantities and scan times**) |
| `[PSU-871]` | Face regions — cut, easers, lifters, buffer, contour — https://courses.ems.psu.edu/mng230/node/871 |
| `[SANDVIK-LHD]` | An underground loader class — https://www.mining.sandvik/en/products/equipment/loaders/lh621i-underground-lhd/ (**21 t payload, 8.0–11.2 m³, 12.6 × 3.2 × 2.9 m**. Cited for class dimensions only) |
| `[HOEK-SUPPORT]` | Hoek, *Support in Underground Hard Rock Mines* — https://www.rocscience.com/assets/resources/learning/hoek/1987-Support-in-Underground-Hard-Rock-Mines.pdf (**the bolt/hole table; Split Set larger than its hole, Swellex smaller; spacing ≈ ½ dowel length; split sets in rockburst ground; no shotcrete or mesh in drawpoints**) |
| `[DARDA-PORTAL]`, `[ACG-DUNN]`, `[DP-RANGER]` | Tunnel and mine portals — https://www.darda.de/en/knowledge/tunnel-portal · https://papers.acg.uwa.edu.au/p/2325_16_Dunn/ · https://www.douglaspartners.com.au/project/ranger-uranium-decline/ (civil portal structures; mine portals in a pit or a **box cut**; a real **34.5 m box cut** and a 2 220 m decline) |
| `[TECWILL]`, `[SILTBUSTER]` | Portal plant — https://www.tecwill.com/en/industries/shotcrete · https://www.workdry.com/siltbuster/our-products/lamella-settlement-tanks (relocatable batching plants with winter heating; **lamella settlement for portal water**) |
| `[WP-RAISE]`, `[SANDVIK-RB]`, `[HK-RBR]`, `[EPIROC-RB]`, `[IWP-RAISE]`, `[TUST-RB]` | Raise boring — https://en.wikipedia.org/wiki/Raise_borer · https://www.mining.sandvik/globalassets/products/rock-tools/pdf/raise-boring-tools-brochure.pdf · https://www.herrenknecht.com/en/products/productdetail/raise-boring-rig-rbr/ · https://www.epiroc.com/en-us/products/raiseboring · https://www.waterpowermagazine.com/analysis/advances-in-raise-boring/ · https://www.sciencedirect.com/science/article/abs/pii/S0886779824006643 (**upper-level concrete pad; 230–445 mm pilot; cuttings fall to the lower level and are mucked by an LHD; 0.5–8 m diameters, record 7.1 m; depths to 1 000–1 500 m; base plate secured with rock bolts**) |
| `[FK-RAISE]`, `[MILLER-RB]`, `[DEVICO-RB]` | **Surface-to-underground raise boring** — https://www.frontierkemper.com/services/raise-boring.html · https://millercontracting.us/services/mine-shafts/raisebore/ · https://www.devico.com/service/raise-bore-pilot-holes-for-civil-construction/ (*"to either the surface or another underground level"*; *"a pilot hole from the surface down to the target elevation… requires the mine to be developed under the shaft location"*; *"shafts from the surface to underground"*) |
| `[HK-BBM]`, `[SANDVIK-RHINO]` | Boxhole boring, and a **rubber-tyred mobile raise borer needing no concrete pad** — https://www.herrenknecht.com/en/products/productdetail/boxhole-boring-machine-bbm/ · https://www.mining.sandvik/en/news-and-media/news-archive/2020/03/raising-australia-and-trb-raise-borers-deliver-new-standard-in-raise-boring/ |
| `[JET-BAUER]` | Jet grouting (HDI) technical reference — https://www.ecanet.com/uploads/files/Resources/HDI_Bauer_Jet_Grouting_EN_905.760.2.pdf (**~15 cm borehole; 400–600 bar; columns to 5 m; the full operating envelope; the plant table — HP pump, colloidal mixer, backflow pump, desander, decanter; 88.9 and 114.3 mm rods; the single/double/triple systems; what the on-rig monitor logs**. Cited for method envelopes and plant classes, not as a capability claim) |
| `[ECSMGE-12716]` | Pandrea et al., on **EN 12716:2018** — https://www.ecsmge-2019.com/uploads/2/1/7/9/21790806/0368-ecsmge-2019_pandrea.pdf (**minimum 25 MPa defines jet grouting; mandatory continuous real-time electronic recording; sampling rates; verticality checks; and "the high pressure… shall not be misinterpreted as a grouting pressure"**) |
| `[EN12716-2018]` | EN 12716:2018, *Execution of special geotechnical works — Jet grouting* — https://www.en-standard.eu/bs-en-12716-2018-execution-of-special-geotechnical-work-jet-grouting/ |
| `[IMPERIAL-JET]`, `[SB-JET]`, `[TREVI-JET]`, `[KELLER-JET]` | Jet grouting mechanism, spoil and applications — https://spiral.imperial.ac.uk/server/api/core/bitstreams/7aa92338-e6cb-4eaa-8423-9fccb7ece493/content · https://www.soletanche-bachy.com/en/offer-portfolio/jet-grouting/ · https://www.trevispa.com/en/technologies/jet-grouting · https://www.keller-na.com/expertise/techniques/jet-grouting (**return flows up the annulus**; measured column diameters by soil type; *deep treatment through voids*) |
| `[STRUCTVILLE-CFA]`, `[DAWSON-CFA]`, `[BACSOL-CFA]`, `[KELLER-CFA]` | CFA method and its limits — https://structville.com/continuous-flight-auger-cfa-piles · https://dawsonfe.co.uk/advantages-disadvantages-of-cfa-piling-pros-and-limitations-explained/ · https://www.bacsol.co.uk/solution/continuous-flight-auger-piling/ · https://www.keller.com/expertise/techniques/cfa-piles-auger-cast (**mast must exceed pile length; overhead obstructions force sectional flight auger; 450–1 500 mm, max ~32 m; unsuitable below cu 15 kN/m² and in boulders; standard rig instrumentation logs depth, rotation, penetration rate, concrete pressure, extraction rate and over-break**) |
| `[LIEBHERR-KELLY]`, `[BAUER-KELLY]`, `[FHWA-CASING]`, `[IMECO-OSC]` | Kelly drilling method, class data and casing — https://www.liebherr.com/en-us/deep-foundation/methods/drilling/kelly-drilling-4424937 · https://equipment.bauer.de/en/drilling-methods-specialist-foundation-engineering · https://pilebuck.com/drilled-shafts-construction-procedures-fhwa/chapter-6-casings-liners/ · https://www.imeco.at/products/foundation/hydraulic-casing-oscillators-for-foundation-rigs/ (**Kelly 600–3 000 mm to 125 m; temporary/permanent/segmental casing; vibratory, oscillator/rotator and rig-driven installation; oscillators needed "if the torque of the rotary… is insufficient"**. Cited for method envelopes only) |

**Carried over from `research/01`–`15`** — cited by pack section rather than
re-fetched, because the pack already verified them:

| key | where it lives |
|---|---|
| `[DM-OFFS]`, `[ENV-RIG]`, `[WP-TENDER]`, `[WITTIG]` | `research/01-oil-gas.md` §C.1 and its source key — offshore rig types, water depths, land-rig site requirements |
| `[W-SANDVIK-DD211L]` | `research/03-mining.md` §I — low-profile drive height |
| `[NFF14]`, `[NFF19]`, `[BS6164]`, `[KARADON]` | `research/04-tunnelling.md` §E3 — the heading brief |
| `[PANDREA]`, `[FPS-WP]` (as used there) | `research/05-foundation-piling.md` |
| `[APE]`, `[PPI12]` | `research/07-hdd-trenchless.md` §D5 — HDD footprint and pit arrangement |
| `[CORING-MAG]`, `[GOLDADV]`, `[MAPLE-QAQC]`, `[MET]`, `[BL-RC]`, `[MIN-RC]`, `[DT-SONIC]` | `research/02-prospecting.md` §E4–E6 — exploration site kit |

---

# H. What this file changes, in one paragraph

The game currently answers *"where am I?"* with a climate. It should answer with
a **site**. Seventeen sites are defined in §A, twenty-one methods are placed and
excluded against them in §B, prospecting's two settings are separated in §C, the
eight regions are re-scoped in §D, and ten specific errors — four of them
outright code defects with file and line references — are ranked in §E. Nothing
here needs new art before it pays: **items 1 to 5 and 8 in §E are data edits,
and between them they remove every pairing a driller would laugh at.**
